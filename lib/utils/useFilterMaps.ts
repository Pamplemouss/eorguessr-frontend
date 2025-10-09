import { useMemo } from "react";
import { Expansion } from "../types/Expansion";
import { Map } from "../types/Map";
import { MapType } from "../types/MapType";

export default function useFilterMaps(maps: Map[], expansions: Expansion[], mapTypes: MapType[]) {
    return useMemo(() => {
        let filteredMaps = maps;

        // Apply expansion filtering with special logic for world maps
        if (expansions.length > 0) {
            filteredMaps = maps.filter((m) => {
                if (!m.expansion) return false;
                
                // Special logic for world maps
                if (m.type === MapType.WORLD_MAP) {
                    const hasExpansion = (exp: Expansion) => expansions.includes(exp);
                    if (hasExpansion(Expansion.DT)) {
                        // DT: Include Hydaelyn (DT) and The First (DT)
                        return (m.name?.en === 'Hydaelyn' && m.expansion === Expansion.DT) ||
                               (m.name?.en === 'The First' && m.expansion === Expansion.DT);
                    } else if (hasExpansion(Expansion.EW)) {
                        // EW: Include The Source (EW) and The First (EW)
                        return (m.name?.en === 'The Source' && m.expansion === Expansion.EW) ||
                               (m.name?.en === 'The First' && m.expansion === Expansion.EW);
                    } else if (hasExpansion(Expansion.ShB)) {
                        // ShB: Include The Source (ShB) and The First (ShB)
                        return (m.name?.en === 'The Source' && m.expansion === Expansion.ShB) ||
                               (m.name?.en === 'The First' && m.expansion === Expansion.ShB);
                    } else if (hasExpansion(Expansion.SB)) {
                        // SB: Include only Eorzea (SB)
                        return m.name?.en === 'Eorzea' && m.expansion === Expansion.SB;
                    } else if (hasExpansion(Expansion.HW) || hasExpansion(Expansion.ARR)) {
                        // HW or ARR: Include only Eorzea (ARR)
                        return m.name?.en === 'Eorzea' && m.expansion === Expansion.ARR;
                    }
                    return false;
                } else {
                    // For non-world maps, use standard expansion filtering
                    return expansions.includes(m.expansion);
                }
            });
        }

        // Apply map type filtering
        if (mapTypes.length > 0) {
            filteredMaps = filteredMaps.filter((m) =>
                m.type && mapTypes.includes(m.type)
            );
        }

        // Sort by map type priority
        return filteredMaps.sort((a, b) => {
            const typeOrder = [MapType.WORLD_MAP, MapType.REGION, MapType.MAP, MapType.DUNGEON];
            const aTypeIndex = a.type ? typeOrder.indexOf(a.type) : typeOrder.length;
            const bTypeIndex = b.type ? typeOrder.indexOf(b.type) : typeOrder.length;
            return aTypeIndex - bTypeIndex;
        });
    }, [maps, expansions, mapTypes]);
}