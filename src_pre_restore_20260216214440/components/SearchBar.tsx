

import React, { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown, Check, Music, Globe, Play, Loader2, CloudLightning } from 'lucide-react';
import { SearchEngine, MusicTrack, MusicSource } from '../types';
import { MUSIC_API_URL, MUSIC_SOURCES, TRANSLATIONS } from '../constants';

interface SearchBarProps {
  currentEngine: SearchEngine;
  engines: SearchEngine[];
  onEngineSelect: (id: string) => void;
  onPlayContext?: (tracks: MusicTrack[], startIndex: number) => void;
  appAreaOpacity: number;
  appAreaBlur: number;
  themeColor: string;
}

type SearchMode = 'web' | 'music';

const SearchBar: React.FC<SearchBarProps> = ({ currentEngine, engines, onEngineSelect, onPlayContext, appAreaOpacity, appAreaBlur, themeColor }) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<SearchMode>('web');
  const [searchSource, setSearchSource] = useState<MusicSource>('netease');
  const [musicResults, setMusicResults] = useState<MusicTrack[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  // Add state to track if a search was actually performed to prevent "No Data" flash on close
  const [hasSearched, setHasSearched] = useState(false);
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const searchTimeout = useRef<any>(null);

  // Close dropdown or results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Close dropdown if click is outside dropdown
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
      // Close results if click is outside results AND outside the input area
      if (resultsRef.current && !resultsRef.current.contains(event.target as Node) && 
          !(event.target as Element).closest('input')) {
        setMusicResults([]);
        setHasSearched(false); // Reset search state to hide "No Data" box
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = () => {
    if (!query.trim()) return;
    
    if (mode === 'web') {
      const searchUrl = currentEngine.url.replace('{q}', encodeURIComponent(query));
      window.open(searchUrl, '_blank');
      setQuery('');
    } else {
      performMusicSearch(query);
    }
  };

  // --- MUSIC API IMPLEMENTATION ---
  const performMusicSearch = async (searchTerm: string) => {
    setIsSearching(true);
    setHasSearched(false); // Reset before new search
    setMusicResults([]);

    try {
      const res = await fetch(`${MUSIC_API_URL}?types=search&count=20&source=${searchSource}&pages=1&name=${encodeURIComponent(searchTerm)}`);
      const data = await res.json();
      
      if (Array.isArray(data)) {
        const results: MusicTrack[] = data.map((item: any) => ({
          id: `${searchSource}-${item.id}`, // Prefix ID with source to allow MusicWidget to know where to fetch from
          name: item.name,
          artist: Array.isArray(item.artist) ? item.artist.join(' / ') : item.artist,
          album: item.album || '', 
          url: '', // Dynamic fetch in MusicWidget
          cover: null, // Dynamic fetch in MusicWidget
          duration: 0,
          source: searchSource,
          meta: { pic_id: item.pic_id, lyric_id: item.id }
        }));
        
        // Simple deduplication based on ID
        const uniqueResults = Array.from(new Map(results.map(item => [item.id, item])).values());
        setMusicResults(uniqueResults);
        setHasSearched(true); // Mark as searched
      }
    } catch (e) {
      console.warn('Music search failed', e);
      setHasSearched(true); // Even on error, we want to show feedback (or no data)
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch();
  };

  useEffect(() => {
    if (mode === 'music' && query.length > 1) {
      if (searchTimeout.current) clearTimeout(searchTimeout.current);
      searchTimeout.current = setTimeout(() => {
        performMusicSearch(query);
      }, 800);
    } else if (query.length === 0) {
      setMusicResults([]);
      setHasSearched(false);
    }
    return () => { if (searchTimeout.current) clearTimeout(searchTimeout.current); };
  }, [query, mode, searchSource]); // Trigger search when source changes too

  const handleTrackSelect = (index: number) => {
    if (onPlayContext) {
      // Pass the whole list as context so next/prev works
      onPlayContext(musicResults, index);
      setQuery('');
      setMusicResults([]);
      setHasSearched(false);
    }
  };

  // Dynamic Glass Style
  const glassStyle: React.CSSProperties = {
    backgroundColor: `rgba(var(--glass-base, 255, 255, 255), ${appAreaOpacity})`, 
    backdropFilter: `blur(${appAreaBlur}px)`,
    WebkitBackdropFilter: `blur(${appAreaBlur}px)`,
  };
  
  const currentSourceObj = MUSIC_SOURCES.find(s => s.id === searchSource) || MUSIC_SOURCES[0];
  const lang = 'zh'; // Default for now as context is limited
  const t = TRANSLATIONS[lang].common;

  return (
    <div className="relative w-full max-w-2xl mx-auto mb-8 md:mb-12 z-30 animate-fade-in flex flex-col items-center" style={{ animationDelay: '0.1s' }}>
      
      {/* Search Bar Container */}
      <div 
        className={`relative z-30 flex items-center w-[90%] md:w-full h-12 md:h-14 rounded-full glass-panel transition-all duration-300 focus-within:ring-2 shadow-lg hover:shadow-xl border border-white/10 ${mode === 'music' ? 'focus-within:ring-red-500/50' : `focus-within:ring-${themeColor}-500/50`}`}
        style={glassStyle}
      >
        
        {/* Mode Toggle / Engine Selector */}
        <div className="relative flex items-center shrink-0" ref={dropdownRef}>
          {mode === 'web' ? (
             <button
              onClick={() => setIsOpen(!isOpen)}
              className="flex items-center gap-2 h-12 md:h-14 pl-4 md:pl-5 pr-2 md:pr-3 rounded-l-full border-r border-white/10 hover:bg-white/10 transition-colors"
            >
              <div className="w-5 h-5 md:w-6 md:h-6 flex items-center justify-center overflow-hidden rounded-md">
                <img 
                  src={currentEngine?.icon || 'https://api.iconify.design/ph:globe.svg'} 
                  alt={currentEngine?.name} 
                  className="w-full h-full object-contain" 
                  onError={(e) => e.currentTarget.src = 'https://api.iconify.design/ph:globe.svg'} 
                />
              </div>
              <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>
          ) : (
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="flex items-center gap-2 h-12 md:h-14 pl-4 md:pl-5 pr-2 md:pr-3 rounded-l-full border-r border-red-500/30 bg-red-500/10 hover:bg-red-500/20 transition-colors group"
            >
               <div className="w-5 h-5 md:w-6 md:h-6 flex items-center justify-center">
                 <img src={currentSourceObj.icon} alt={currentSourceObj.name} className="w-full h-full object-contain" />
               </div>
               <ChevronDown className={`w-3 h-3 text-red-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>
          )}

          {/* Dropdown (Shared for both Web Engines and Music Sources) */}
          {isOpen && (
            <div className="absolute top-full left-0 mt-2 w-48 py-2 rounded-xl glass-panel bg-white/80 dark:bg-slate-800/90 shadow-2xl backdrop-blur-xl border border-white/10 overflow-hidden animate-fade-in origin-top-left z-[60] max-h-80 overflow-y-auto scrollbar-none">
              {mode === 'web' ? (
                engines.map((engine) => (
                  <button
                    key={engine.id}
                    onClick={() => {
                      onEngineSelect(engine.id);
                      setIsOpen(false);
                    }}
                    className={`w-full px-4 py-2.5 flex items-center gap-3 hover:bg-${themeColor}-500/10 dark:hover:bg-white/10 transition-colors text-left group`}
                  >
                    <img src={engine.icon} alt={engine.name} className="w-5 h-5 object-contain" />
                    <span className="flex-1 text-sm font-medium text-slate-700 dark:text-slate-200">{engine.name}</span>
                    {currentEngine?.id === engine.id && <Check className={`w-4 h-4 text-${themeColor}-500`} />}
                  </button>
                ))
              ) : (
                MUSIC_SOURCES.map((source) => (
                   <button
                    key={source.id}
                    onClick={() => {
                      setSearchSource(source.id as MusicSource);
                      setIsOpen(false);
                    }}
                    className={`w-full px-4 py-2.5 flex items-center gap-3 hover:bg-red-500/10 dark:hover:bg-white/10 transition-colors text-left group`}
                  >
                    <img src={source.icon} alt={source.name} className="w-5 h-5 object-contain" />
                    <span className="flex-1 text-sm font-medium text-slate-700 dark:text-slate-200">{source.name}</span>
                    {searchSource === source.id && <Check className="w-4 h-4 text-red-500" />}
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        {/* Input - Added cursor-text and select-text */}
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={mode === 'web' ? t.webSearch.replace('{engine}', currentEngine?.name || 'Web') : t.musicSearch.replace('{source}', currentSourceObj.name)}
          className="flex-1 min-w-0 bg-transparent border-none outline-none px-3 md:px-4 text-base md:text-lg text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 h-full cursor-text select-text z-20"
        />

        {/* Mode Switcher Buttons */}
        <div className="flex items-center gap-1 pr-1.5 md:pr-2 shrink-0 z-20">
           <button
             onClick={() => setMode(mode === 'web' ? 'music' : 'web')}
             className={`p-1.5 md:p-2 rounded-full transition-all duration-300 ${mode === 'music' ? 'bg-red-500 text-white' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'}`}
             title={mode === 'web' ? "切换到音乐搜索" : "切换到网页搜索"}
           >
              {mode === 'web' ? <Music className="w-4 h-4 md:w-5 md:h-5" /> : <Globe className="w-4 h-4 md:w-5 md:h-5" />}
           </button>

           <button
             onClick={handleSearch}
             className="p-2 md:p-2.5 rounded-full text-slate-500 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10 transition-all duration-300"
           >
             {isSearching ? <Loader2 className="w-5 h-5 md:w-6 md:h-6 animate-spin text-red-500"/> : <Search className="w-5 h-5 md:w-6 md:h-6" />}
           </button>
        </div>
      </div>

      {/* Music Search Results Cards - Z-index ensures it's below dropdown but above other content */}
      {mode === 'music' && musicResults.length > 0 && (
         <div 
             ref={resultsRef}
             className="absolute top-14 md:top-16 w-[90%] md:w-full grid grid-cols-1 sm:grid-cols-2 gap-2 bg-white/80 dark:bg-slate-900/90 backdrop-blur-xl border border-white/20 dark:border-slate-700 rounded-2xl p-2 shadow-2xl z-40 max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-red-500/50"
         >
            {musicResults.map((track, idx) => (
               <div 
                 key={track.id} 
                 onClick={() => handleTrackSelect(idx)}
                 className="flex items-center gap-3 p-2 rounded-xl hover:bg-red-500/10 dark:hover:bg-white/10 cursor-pointer transition-colors group border border-transparent hover:border-red-500/30"
               >
                  <img src={track.cover || 'https://api.iconify.design/ph:music-note-simple-fill.svg'} alt={track.name} className="w-10 h-10 md:w-12 md:h-12 rounded-lg object-cover shadow-sm group-hover:scale-105 transition-transform bg-slate-800" />
                  <div className="flex-1 min-w-0">
                     <div className="font-bold text-sm text-slate-800 dark:text-white truncate">{track.name}</div>
                     <div className="text-xs text-slate-500 dark:text-slate-400 truncate flex items-center gap-2">
                        <span className="truncate max-w-[120px]">{track.artist}</span>
                        {track.album && <span className="truncate opacity-60 max-w-[80px] hidden sm:inline">• {track.album}</span>}
                        <span className="px-1.5 py-0.5 rounded bg-red-600/20 text-red-600 dark:text-red-400 text-[10px] font-bold flex items-center gap-1 shrink-0 capitalize">
                            <CloudLightning className="w-3 h-3"/> {track.source}
                        </span>
                     </div>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg scale-90 group-hover:scale-100 shrink-0">
                     <Play className="w-3 h-3 fill-current ml-0.5" />
                  </div>
               </div>
            ))}
         </div>
      )}
      
      {/* Search Hint - Only show if we actually searched (hasSearched is true), not just when clicking outside */}
      {mode === 'music' && !isSearching && hasSearched && musicResults.length === 0 && query.length > 0 && (
         <div className="absolute top-14 md:top-16 w-[90%] md:w-full p-4 bg-white/80 dark:bg-slate-900/90 backdrop-blur-xl border border-white/20 rounded-2xl shadow-xl z-40 text-center text-sm text-slate-500 pointer-events-none">
            {t.noData}
         </div>
      )}
    </div>
  );
};

export default SearchBar;
