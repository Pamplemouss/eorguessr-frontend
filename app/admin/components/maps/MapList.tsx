import { useAdminMapConfig } from '@/app/providers/AdminMapConfigContextProvider';
import { useMap } from '@/app/providers/MapContextProvider';
import { createEmptyMap } from '@/lib/utils/createEmptyMap';
import useFilterMaps from '@/lib/utils/useFilterMaps';
import { MapType } from '@/lib/types/MapType';
import React, { useState } from 'react'
import { FaPlus, FaMap, FaExclamationTriangle } from 'react-icons/fa';

const MapList = () => {
    const { maps, currentMap, setCurrentMapById, setCurrentMap } = useMap();
    const { selectedExpansions, selectedMapTypes } = useAdminMapConfig();
    const [search, setSearch] = useState("");
    const filteredMaps = useFilterMaps(maps, selectedExpansions, selectedMapTypes)
        .filter((m) =>
            m.name?.en?.toLowerCase().includes(search.toLowerCase())
        );

    // Function to check if a map has invalid size (excluding world maps and regions)
    const hasInvalidSize = (map: any) => {
        // Skip validation for world maps and regions
        if (map.type === MapType.WORLD_MAP || map.type === MapType.REGION) {
            return false;
        }
        
        // Check if size is not set or if x or y equals 0
        return !map.size || map.size.x === 0 || map.size.y === 0;
    };

    // Function to check if a map has missing language names
    const hasMissingLanguageNames = (map: any) => {
        if (!map.name) return true;
        
        // Check if any required language is missing or empty
        const requiredLanguages = ['en', 'fr', 'de', 'ja'];
        return requiredLanguages.some(lang => !map.name[lang] || map.name[lang].trim() === '');
    };

    // Function to get missing languages for a map
    const getMissingLanguages = (map: any) => {
        if (!map.name) return ['en', 'fr', 'de', 'ja'];
        
        const requiredLanguages = ['en', 'fr', 'de', 'ja'];
        return requiredLanguages.filter(lang => !map.name[lang] || map.name[lang].trim() === '');
    };

    // Count maps with issues
    const invalidSizeMapsCount = filteredMaps.filter(hasInvalidSize).length;
    const missingLanguageNamesCount = filteredMaps.filter(hasMissingLanguageNames).length;
    const totalIssuesCount = filteredMaps.filter(m => hasInvalidSize(m) || hasMissingLanguageNames(m)).length;

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-purple-100 rounded-lg text-purple-600">
                    <FaMap />
                </div>
                <div className="flex-grow">
                    <h3 className="text-lg font-semibold text-gray-900">
                        Liste des Cartes
                    </h3>
                    {totalIssuesCount > 0 && (
                        <div className="text-sm mt-1 space-y-1">
                            {invalidSizeMapsCount > 0 && (
                                <div className="flex items-center gap-1 text-orange-600">
                                    <FaExclamationTriangle className="text-xs" />
                                    <span>{invalidSizeMapsCount} carte{invalidSizeMapsCount > 1 ? 's' : ''} avec une taille invalide</span>
                                </div>
                            )}
                            {missingLanguageNamesCount > 0 && (
                                <div className="flex items-center gap-1 text-red-600">
                                    <FaExclamationTriangle className="text-xs" />
                                    <span>{missingLanguageNamesCount} carte{missingLanguageNamesCount > 1 ? 's' : ''} avec des noms manquants</span>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
            
            <div className="flex items-center gap-2 mb-4">
                <input
                    placeholder="Rechercher une carte..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="border border-gray-300 p-2 rounded grow focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <button
                    className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded transition-colors"
                    onClick={() => setCurrentMap(createEmptyMap())}
                    title="Créer une nouvelle carte"
                >
                    <FaPlus />
                </button>
            </div>
            
            {filteredMaps.length === 0 ? (
                <p className="text-gray-500 text-center py-8">Aucune carte trouvée.</p>
            ) : (
                <div className="max-h-[700px] overflow-y-auto">
                    <div className="space-y-2">
                        {filteredMaps.map((m) => {
                            const hasSize = hasInvalidSize(m);
                            const hasLanguage = hasMissingLanguageNames(m);
                            const missingLangs = getMissingLanguages(m);
                            
                            return (
                                <div
                                    key={m.id}
                                    className={`p-3 rounded-lg cursor-pointer transition-colors border ${
                                        currentMap?.id === m.id 
                                            ? "bg-purple-50 border-purple-300" 
                                            : "border-gray-200 hover:bg-gray-50"
                                    } ${hasSize ? "border-l-4 border-l-orange-500" : ""} ${hasLanguage && !hasSize ? "border-l-4 border-l-red-500" : ""}`}
                                    onClick={() => setCurrentMapById(m.id)}
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="font-semibold text-gray-900">
                                            {m.name?.en || "Sans nom"} {m.subAreaCustomName?.en ? `(${m.subAreaCustomName.en})` : ""}
                                        </div>
                                        <div className="flex flex-col gap-1 items-end">
                                            {hasSize && (
                                                <div className="flex items-center gap-1 text-orange-600" title="Taille de carte non définie (x ou y = 0)">
                                                    <FaExclamationTriangle className="text-sm" />
                                                    <span className="text-xs font-medium">Taille invalide</span>
                                                </div>
                                            )}
                                            {hasLanguage && (
                                                <div className="flex items-center gap-1 text-red-600" title={`Langues manquantes: ${missingLangs.join(', ')}`}>
                                                    <FaExclamationTriangle className="text-sm" />
                                                    <span className="text-xs font-medium">Noms manquants</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    {m.expansion && (
                                        <div className="text-sm text-gray-500">
                                            Expansion: {m.expansion}
                                        </div>
                                    )}
                                    {m.type && (
                                        <div className="text-sm text-gray-500">
                                            Type: {m.type}
                                        </div>
                                    )}
                                    {hasSize && (
                                        <div className="text-xs text-orange-600 mt-1">
                                            Taille: {m.size?.x || 0} x {m.size?.y || 0}
                                        </div>
                                    )}
                                    {hasLanguage && (
                                        <div className="text-xs text-red-600 mt-1">
                                            Langues manquantes: {missingLangs.join(', ')}
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                </div>
            )}
        </div>
    )
}

export default MapList