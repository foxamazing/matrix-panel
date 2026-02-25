import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Search, ChevronDown, Check, Music, Globe, Play, Loader2, CloudLightning } from 'lucide-react';

// Hooks & Providers
import { useConfig } from '../providers/ConfigProvider';
import { useTheme } from '../providers/ThemeProvider';
import { MusicTrack, MusicSource } from '../types';
import { MUSIC_API_URL, MUSIC_SOURCES, TRANSLATIONS, DEFAULT_ENGINES } from '../constants';

interface SearchBarProps {
  onPlayContext?: (tracks: MusicTrack[], startIndex: number) => void;
}

type SearchMode = 'web' | 'music';

const SearchBar: React.FC<SearchBarProps> = ({ onPlayContext }) => {
  const { config, updateConfig } = useConfig();
  const { themeColor } = useTheme();

  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<SearchMode>('web');
  const [searchSource, setSearchSource] = useState<MusicSource>('netease');
  const [musicResults, setMusicResults] = useState<MusicTrack[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const searchTimeout = useRef<any>(null);

  // Compute engines internally to decouple from App.tsx
  const engines = useMemo(() => [...DEFAULT_ENGINES, ...config.customEngines], [config.customEngines]);
  const currentEngine = useMemo(() => engines.find(e => e.id === config.searchEngineId) || engines[0], [engines, config.searchEngineId]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) setIsOpen(false);
      if (resultsRef.current && !resultsRef.current.contains(event.target as Node) && !(event.target as Element).closest('input')) {
        setMusicResults([]);
        setHasSearched(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const performMusicSearch = async (searchTerm: string) => {
    setIsSearching(true);
    setHasSearched(false);
    try {
      const res = await fetch(`${MUSIC_API_URL}?types=search&count=20&source=${searchSource}&pages=1&name=${encodeURIComponent(searchTerm)}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        const results: MusicTrack[] = data.map((item: any) => ({
          id: `${searchSource}-${item.id}`,
          name: item.name,
          artist: Array.isArray(item.artist) ? item.artist.join(' / ') : item.artist,
          album: item.album || '',
          url: '',
          cover: null,
          source: searchSource,
          meta: { pic_id: item.pic_id, lyric_id: item.id }
        }));
        setMusicResults(results);
        setHasSearched(true);
      }
    } catch (e) {
      setHasSearched(true);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearch = () => {
    if (!query.trim()) return;
    if (mode === 'web') {
      window.open(currentEngine.url.replace('{q}', encodeURIComponent(query)), '_blank');
      setQuery('');
    } else {
      performMusicSearch(query);
    }
  };

  useEffect(() => {
    if (mode === 'music' && query.length > 1) {
      if (searchTimeout.current) clearTimeout(searchTimeout.current);
      searchTimeout.current = setTimeout(() => performMusicSearch(query), 800);
    } else if (query.length === 0) {
      setMusicResults([]);
      setHasSearched(false);
    }
    return () => { if (searchTimeout.current) clearTimeout(searchTimeout.current); };
  }, [query, mode, searchSource]);

  const lang = config.language || 'zh';
  const t = TRANSLATIONS[lang].common;
  const currentSourceObj = MUSIC_SOURCES.find(s => s.id === searchSource) || MUSIC_SOURCES[0];

  return (
    <div className="relative w-full max-w-2xl mx-auto mb-10 z-30 animate-fade-in flex flex-col items-center">
      <div className={`relative z-30 flex items-center w-full h-14 rounded-full glass-panel transition-all duration-500 focus-within:ring-2 focus-within:ring-theme/30 focus-within:border-theme/40`}>
        <div className="relative flex items-center shrink-0" ref={dropdownRef}>
          <button onClick={() => setIsOpen(!isOpen)} className="flex items-center gap-2 h-14 pl-5 pr-3 rounded-l-full border-r border-[var(--glass-border)] hover:bg-[var(--glass-bg-hover)] transition-colors">
            <img src={mode === 'web' ? currentEngine?.icon : currentSourceObj.icon} alt="logo" className="w-6 h-6 object-contain" onError={e => e.currentTarget.src = 'https://api.iconify.design/ph:globe.svg'} />
            <ChevronDown className={`w-3 h-3 text-[var(--text-secondary)] transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </button>

          {isOpen && (
            <div className="absolute top-full left-0 mt-3 w-52 py-2 rounded-2xl glass-panel shadow-2xl animate-slide-up origin-top-left z-[60] max-h-80 overflow-y-auto scrollbar-none">
              {(mode === 'web' ? engines : MUSIC_SOURCES).map((item: any) => (
                <button
                  key={item.id}
                  onClick={() => {
                    if (mode === 'web') updateConfig(p => ({ ...p, searchEngineId: item.id }));
                    else setSearchSource(item.id as MusicSource);
                    setIsOpen(false);
                  }}
                  className="w-full px-4 py-3 flex items-center gap-3 hover:bg-[var(--glass-bg-hover)] transition-colors text-left"
                >
                  <img src={item.icon} alt={item.name} className="w-5 h-5 object-contain" />
                  <span className="flex-1 text-sm font-medium text-[var(--text-primary)]">{item.name}</span>
                  {(mode === 'web' ? config.searchEngineId === item.id : searchSource === item.id) && <Check className="w-4 h-4 text-theme" />}
                </button>
              ))}
            </div>
          )}
        </div>

        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSearch()}
          placeholder={mode === 'web' ? t.webSearch.replace('{engine}', currentEngine?.name || 'Web') : t.musicSearch.replace('{source}', currentSourceObj.name)}
          className="flex-1 bg-transparent border-none outline-none px-5 text-lg text-[var(--text-primary)] placeholder-theme/40 h-full font-medium"
        />

        <div className="flex items-center gap-2 pr-2 shrink-0">
          <button onClick={() => setMode(mode === 'web' ? 'music' : 'web')} className={`p-2 rounded-full transition-all ${mode === 'music' ? 'bg-theme text-white shadow-lg' : 'text-[var(--text-muted)] hover:text-theme'}`}>
            {mode === 'web' ? <Music className="w-5 h-5" /> : <Globe className="w-5 h-5" />}
          </button>
          <button onClick={handleSearch} className="p-2.5 rounded-full text-[var(--text-secondary)] hover:bg-[var(--glass-bg-hover)] hover:text-theme transition-all">
            {isSearching ? <Loader2 className="w-6 h-6 animate-spin text-theme" /> : <Search className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {mode === 'music' && musicResults.length > 0 && (
        <div ref={resultsRef} className="absolute top-16 w-full grid grid-cols-1 sm:grid-cols-2 gap-2 glass-panel rounded-2xl p-2 shadow-2xl z-40 max-h-[400px] overflow-y-auto scrollbar-none">
          {musicResults.map((track, idx) => (
            <div key={track.id} onClick={() => { onPlayContext?.(musicResults, idx); setQuery(''); setMusicResults([]); }} className="flex items-center gap-3 p-2 rounded-xl hover:bg-[var(--glass-bg-hover)] cursor-pointer transition-colors group">
              <img src={track.cover || 'https://api.iconify.design/ph:music-note-simple-fill.svg'} alt="cover" className="w-12 h-12 rounded-lg object-cover bg-[var(--glass-bg-hover)]" />
              <div className="flex-1 min-w-0">
                <div className="font-bold text-sm text-[var(--text-primary)] truncate">{track.name}</div>
                <div className="text-xs text-[var(--text-secondary)] truncate flex items-center gap-2 mt-0.5">
                  <span className="truncate">{track.artist}</span>
                  <span className="px-1.5 py-0.5 rounded bg-red-600/10 text-red-500 text-[9px] font-bold uppercase">{track.source}</span>
                </div>
              </div>
              <div className="w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><Play className="w-3 h-3 fill-current ml-0.5" /></div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
