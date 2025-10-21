import React, { useState } from 'react';
import { FFXIVMapTranslations } from '@/lib/services/ffxivAPI';
import { FaSearch, FaSpinner, FaTimes, FaGamepad } from 'react-icons/fa';

interface FFXIVMapSearchProps {
  onMapSelect: (mapData: FFXIVMapTranslations) => void;
  onClose: () => void;
}

interface SearchResponse {
  success: boolean;
  maps: FFXIVMapTranslations[];
  total: number;
  error?: string;
  details?: string;
}

const FFXIVMapSearch: React.FC<FFXIVMapSearchProps> = ({ onMapSelect, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchLanguage, setSearchLanguage] = useState('en');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<FFXIVMapTranslations[]>([]);
  const [error, setError] = useState<string | null>(null);

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'fr', name: 'Français' },
    { code: 'ja', name: '日本語' },
    { code: 'de', name: 'Deutsch' }
  ];

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;

    setIsSearching(true);
    setError(null);
    setSearchResults([]);

    try {
      const response = await fetch(
        `/api/ffxiv/maps/search?name=${encodeURIComponent(searchTerm)}&language=${searchLanguage}`
      );

      const data: SearchResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      if (data.success) {
        setSearchResults(data.maps);
        if (data.maps.length === 0) {
          setError('No maps found with that name. Try a different search term or check the spelling.');
        }
      } else {
        setError(data.error || 'Search failed');
      }
    } catch (err) {
      console.error('Search error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Search failed';
      
      // Provide more helpful error messages
      if (errorMessage.includes('fetch')) {
        setError('Network error: Unable to connect to the FFXIV API. Please check your internet connection.');
      } else if (errorMessage.includes('404')) {
        setError('API endpoint not found. Please contact the administrator.');
      } else if (errorMessage.includes('500')) {
        setError('Server error occurred. Please try again later.');
      } else {
        setError(errorMessage);
      }
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const getDisplayName = (map: FFXIVMapTranslations): string => {
    return map.mapName[searchLanguage] || map.mapName.en || 'Unknown Map';
  };

  const getDisplaySubName = (map: FFXIVMapTranslations): string => {
    return map.placeNameSub[searchLanguage] || map.placeNameSub.en || '';
  };

  const getDisplayRegion = (map: FFXIVMapTranslations): string => {
    return map.placeNameRegion[searchLanguage] || map.placeNameRegion.en || '';
  };

  const getDisplayExpansion = (map: FFXIVMapTranslations): string => {
    return map.expansion[searchLanguage] || map.expansion.en || '';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4" style={{ zIndex: 9999 }}>
      <div className="bg-white rounded-lg shadow-xl max-w-7xl w-full max-h-[95vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
              <FaGamepad />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">FFXIV Map Search</h2>
              <p className="text-sm text-gray-500">Search and import maps from FFXIV database</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <FaTimes />
          </button>
        </div>

        {/* Search Form */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Map Name
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Enter map name (e.g., Ul'dah, Gridania, Limsa Lominsa)"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
            <div className="w-32">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Language
              </label>
              <select
                value={searchLanguage}
                onChange={(e) => setSearchLanguage(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              >
                {languages.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={handleSearch}
                disabled={isSearching || !searchTerm.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
              >
                {isSearching ? <FaSpinner className="animate-spin" /> : <FaSearch />}
                {isSearching ? 'Searching...' : 'Search'}
              </button>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="flex-1 overflow-auto p-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          {searchResults.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">
                Found {searchResults.length} map{searchResults.length !== 1 ? 's' : ''}
              </h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {searchResults.map((map) => (
                  <div
                    key={map.id}
                    className="border border-gray-200 rounded-lg p-6 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer"
                    onClick={() => onMapSelect(map)}
                  >
                    <div className="flex flex-col gap-4">
                      {/* Map Image - Square */}
                      <div className="w-full aspect-square bg-gray-100 rounded-lg overflow-hidden">
                        {map.mapImageId ? (
                          <div className="w-full h-full flex items-center justify-center">
                            <img
                              src={`https://v2.xivapi.com/api/asset/map/${map.mapImageId}`}
                              alt={getDisplayName(map)}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                target.parentElement!.innerHTML = `<div class="w-full h-full flex items-center justify-center text-gray-400"><svg class="w-8 h-8" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2L3 7v11a2 2 0 002 2h10a2 2 0 002-2V7l-7-5z"/></svg></div>`;
                              }}
                            />
                          </div>
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <FaGamepad size={32} />
                          </div>
                        )}
                      </div>

                      {/* Map Info */}
                      <div className="space-y-3">
                        <h4 className="font-semibold text-lg text-gray-900">
                          {getDisplayName(map)}
                        </h4>
                        
                        {/* Additional Info */}
                        <div className="space-y-2">
                          {getDisplaySubName(map) && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <span>📍</span>
                              <span>{getDisplaySubName(map)}</span>
                            </div>
                          )}

                          {getDisplayRegion(map) && (
                            <div className="flex items-center gap-2 text-sm text-blue-600">
                              <span>🗺️</span>
                              <span>{getDisplayRegion(map)}</span>
                            </div>
                          )}

                          {getDisplayExpansion(map) && (
                            <div className="flex items-center gap-2 text-sm text-purple-600">
                              <span>🎮</span>
                              <span>{getDisplayExpansion(map)}</span>
                            </div>
                          )}
                        </div>

                        {/* Size Factor Warning */}
                        {(map.sizeFactor !== 100 && map.sizeFactor !== 200) && (
                          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-2">
                            <div className="flex items-center gap-2 text-yellow-800 text-sm">
                              <span>⚠️</span>
                              <span>Unknown size factor: {map.sizeFactor}. Default size (41.9) will be used. Please verify manually.</span>
                            </div>
                          </div>
                        )}

                        {/* All Language Names */}
                        <div className="bg-gray-50 rounded-md p-3">
                          <h5 className="font-medium text-sm text-gray-700 mb-2">All Languages:</h5>
                          <div className="grid grid-cols-2 gap-2">
                            {['en', 'fr', 'de', 'ja'].map((lang) => (
                              <div key={lang} className="flex items-center gap-2 text-sm">
                                <span className="px-2 py-1 bg-white text-gray-600 rounded text-xs font-mono uppercase min-w-[32px] text-center">
                                  {lang}
                                </span>
                                <span className="text-gray-800 truncate">
                                  {map.mapName[lang] || '-'}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Technical Info */}
                        <div className="text-xs text-gray-500 bg-gray-50 rounded-md p-2">
                          <div>Map ID: {map.id} • Image ID: {map.mapImageId}</div>
                          <div>Size Factor: {map.sizeFactor}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!isSearching && !error && searchResults.length === 0 && searchTerm && (
            <div className="text-center py-12 text-gray-500">
              <FaSearch size={48} className="mx-auto mb-4 opacity-50" />
              <p>No results found. Try a different search term.</p>
            </div>
          )}

          {!searchTerm && !isSearching && (
            <div className="text-center py-12 text-gray-500">
              <FaGamepad size={48} className="mx-auto mb-4 opacity-50" />
              <p className="text-lg mb-2">Enter a map name to search the FFXIV database</p>
              <div className="text-sm space-y-1">
                <p className="font-medium">Popular examples:</p>
                <div className="flex flex-wrap justify-center gap-2 mt-2">
                  {['Ul\'dah', 'Gridania', 'Limsa Lominsa', 'The Black Shroud', 'Coerthas', 'Mor Dhona', 'Ishgard'].map((example) => (
                    <button
                      key={example}
                      onClick={() => setSearchTerm(example)}
                      className="px-2 py-1 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors text-xs"
                    >
                      {example}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FFXIVMapSearch;