import React, { useState } from 'react';
import { Search, X, Loader2, MapPin, ExternalLink } from 'lucide-react';
import { searchLocalAttractions } from '../services/gemini';
import { SearchResult } from '../types';

interface SearchModalProps {
  onClose: () => void;
}

const SearchModal: React.FC<SearchModalProps> = ({ onClose }) => {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<{text: string; sources: SearchResult[]} | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    
    // Log search analytics for operational admin panel
    try {
      const logs = localStorage.getItem('ai_concierge_logs');
      const currLogs = logs ? JSON.parse(logs) : [];
      if (!currLogs.includes(query.trim())) {
        currLogs.unshift(query.trim());
        localStorage.setItem('ai_concierge_logs', JSON.stringify(currLogs.slice(0, 30))); // Cap at 30
      }
    } catch (err) {
      console.error("Failed logs capture", err);
    }

    try {
      const data = await searchLocalAttractions(query);
      setResult({
        text: data.text || "No details found.",
        sources: data.sources || []
      });
    } catch (err) {
      console.error(err);
      setResult({ text: "Sorry, I couldn't connect to the travel guide right now.", sources: [] });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-stone-900 border border-rustic-earth rounded-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[80vh]">
        <div className="p-4 bg-stone-800 border-b border-stone-700 flex justify-between items-center">
          <h2 className="text-xl font-serif text-rustic-clay flex items-center gap-2">
            <Search size={20} /> Plan Your Trip
          </h2>
          <button onClick={onClose} className="text-stone-400 hover:text-white"><X size={24} /></button>
        </div>

        <div className="p-6 overflow-y-auto">
          <form onSubmit={handleSearch} className="flex gap-2 mb-6">
            <input 
              type="text" 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="What do you want to do? (e.g. 'Best sunset points nearby')"
              className="flex-1 bg-stone-950 border border-stone-700 rounded p-3 text-white focus:border-rustic-clay focus:outline-none"
            />
            <button 
              type="submit"
              disabled={loading}
              className="bg-rustic-clay text-stone-900 font-bold px-6 rounded hover:bg-orange-500 disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin" /> : 'Ask'}
            </button>
          </form>

          {result && (
            <div className="space-y-4 animate-in slide-in-from-bottom-2">
              <div className="prose prose-invert prose-p:text-stone-300 max-w-none">
                <p className="whitespace-pre-line">{result.text}</p>
              </div>

              {result.sources.length > 0 && (
                <div className="mt-4 pt-4 border-t border-stone-800">
                  <h4 className="text-sm font-bold text-rustic-clay mb-2 flex items-center gap-1">
                    <MapPin size={14} /> Sources & Places
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {result.sources.map((source, idx) => (
                      <a 
                        key={idx} 
                        href={source.uri} 
                        target="_blank" 
                        rel="noreferrer"
                        className="flex items-center gap-2 text-xs text-stone-400 bg-stone-950 p-2 rounded hover:bg-stone-800 hover:text-white transition-colors"
                      >
                         <ExternalLink size={12} />
                         <span className="truncate">{source.title}</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchModal;