
/**
 * Detects if the current hostname is a private/local network.
 * Returns true if local, false if external/public.
 */
export const isPrivateNetwork = (hostname: string): boolean => {
  // 1. Localhost
  if (hostname === 'localhost') return true;

  // 2. Simple Hostname (e.g. "nas", "server") - usually local DNS
  if (!hostname.includes('.')) return true;

  // 3. mDNS (.local)
  if (hostname.endsWith('.local')) return true;

  // 4. IPv4 Private Ranges
  // 127.0.0.0 - 127.255.255.255
  if (/^127\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(hostname)) return true;
  // 10.0.0.0 - 10.255.255.255
  if (/^10\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(hostname)) return true;
  // 192.168.0.0 - 192.168.255.255
  if (/^192\.168\.\d{1,3}\.\d{1,3}$/.test(hostname)) return true;
  // 172.16.0.0 - 172.31.255.255
  if (/^172\.(1[6-9]|2\d|3[0-1])\.\d{1,3}\.\d{1,3}$/.test(hostname)) return true;

  // Assume anything else is external (e.g. public IP, .com, .net, etc.)
  return false;
};
