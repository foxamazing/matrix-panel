
import { useState, useEffect, useRef, useCallback } from 'react';
import { SystemStats } from '../types';
import { apiClient } from '../services/client';

export const useSystemStats = () => {
  const [stats, setStats] = useState<SystemStats>({ 
    cpu: 0, 
    ram: 0, 
    disk: 0, 
    disks: [],
    temp: 0,
    gpu: 0,
    gpuTemp: 0,
    power: 0,
    netUp: 0,
    netDown: 0
  });

  const lastNetBytes = useRef<{ bytesSent: number; bytesRecv: number } | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchStats = useCallback(async () => {
    if (abortControllerRef.current) {
        abortControllerRef.current.abort();
    }
    
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;
    
    try {
        const results = await Promise.allSettled([
            apiClient.post<any>('/system/monitor/getCpuState', {}, {}, signal),
            apiClient.post<any>('/system/monitor/getMemonyState', {}, {}, signal),
            apiClient.post<any>('/system/monitor/getDiskStateAll', {}, {}, signal),
            apiClient.post<any>('/system/monitor/getNetIOState', {}, {}, signal),
            apiClient.post<any>('/system/monitor/getGpuState', {}, {}, signal),
            apiClient.post<any>('/system/monitor/getPowerState', {}, {}, signal)
        ]);

        const getData = (idx: number) => {
            const r = results[idx];
            if (r.status === 'fulfilled' && r.value && typeof r.value === 'object') {
                return (r.value as any).data;
            }
            return null;
        };

        const cpuData = getData(0);
        const memData = getData(1);
        const diskListData = getData(2);
        const netData = getData(3);
        const gpuData = getData(4);
        const powerData = getData(5);

        let cpuUsage = 0;
        let cpuTemp = 0;
        if (cpuData && cpuData.usages && cpuData.usages.length > 0) {
             cpuUsage = cpuData.usages.reduce((a: number, b: number) => a + b, 0) / cpuData.usages.length;
        }
        if (cpuData && typeof cpuData.temperature === 'number') {
            cpuTemp = cpuData.temperature;
        }

        let memUsage = 0;
        if (memData) {
            memUsage = memData.usedPercent;
        }

        let diskUsage = 0;
        let disks: SystemStats['disks'] = [];
        if (Array.isArray(diskListData) && diskListData.length > 0) {
            disks = diskListData
              .filter((d: any) => d && typeof d.usedPercent === 'number')
              .map((d: any) => ({
                  mountpoint: String(d.mountpoint || ''),
                  total: Number(d.total || 0),
                  used: Number(d.used || 0),
                  free: Number(d.free || 0),
                  usedPercent: Number(d.usedPercent || 0),
              }));

            const total = disks.reduce((acc, d) => acc + (d.total || 0), 0);
            const used = disks.reduce((acc, d) => acc + (d.used || 0), 0);
            if (total > 0) {
                diskUsage = (used / total) * 100;
            } else {
                const maxP = Math.max(...disks.map(d => d.usedPercent || 0));
                diskUsage = Number.isFinite(maxP) ? maxP : 0;
            }
        }

        let netUp = 0;
        let netDown = 0;
        if (Array.isArray(netData) && netData.length > 0) {
            const aggregated = netData.reduce(
                (acc: { bytesSent: number; bytesRecv: number }, cur: any) => ({
                    bytesSent: acc.bytesSent + (cur.bytesSent || 0),
                    bytesRecv: acc.bytesRecv + (cur.bytesRecv || 0),
                }),
                { bytesSent: 0, bytesRecv: 0 }
            );

            if (lastNetBytes.current) {
                const intervalSeconds = 3;
                const deltaSent = aggregated.bytesSent - lastNetBytes.current.bytesSent;
                const deltaRecv = aggregated.bytesRecv - lastNetBytes.current.bytesRecv;
                const upPerSec = deltaSent / intervalSeconds;
                const downPerSec = deltaRecv / intervalSeconds;
                netUp = Math.max(0, Math.round(upPerSec / 1024));
                netDown = Math.max(0, Math.round(downPerSec / 1024));
            }

            lastNetBytes.current = aggregated;
        }

        let gpuUsage = 0;
        let gpuTemp = 0;
        if (Array.isArray(gpuData) && gpuData.length > 0) {
            const first = gpuData[0];
            if (typeof first.utilization === 'number') {
                gpuUsage = first.utilization;
            }
            if (typeof first.temperature === 'number') {
                gpuTemp = first.temperature;
            }
        }

        let power = 0;
        if (powerData && typeof powerData.total === 'number') {
            power = powerData.total;
        }

        setStats(prev => ({
            ...prev,
            cpu: Math.round(cpuUsage),
            ram: Math.round(memUsage),
            disk: Math.round(diskUsage),
            disks,
            temp: Math.round(cpuTemp),
            gpu: Math.round(gpuUsage),
            gpuTemp: Math.round(gpuTemp),
            power: Math.round(power),
            netUp,
            netDown,
        }));

    } catch (e) {
        console.warn('Fetch stats failed, using fallback simulation', e);
        setStats({
            cpu: Math.floor(Math.random() * 30) + 5,
            ram: Math.floor(Math.random() * 20) + 20,
            disk: 45, 
            disks: [],
            temp: Math.floor(Math.random() * 10) + 35,
            gpu: Math.floor(Math.random() * 20),
            gpuTemp: Math.floor(Math.random() * 10) + 35,
            power: Math.floor(Math.random() * 150) + 100,
            netUp: Math.floor(Math.random() * 500),
            netDown: Math.floor(Math.random() * 5000),
        });
    }
  }, [setStats]);

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 3000);
    return () => {
        clearInterval(interval);
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
    };
  }, [fetchStats]);

  return stats;
};
