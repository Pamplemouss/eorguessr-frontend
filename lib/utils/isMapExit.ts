import { Map } from '../types/Map';

export function isMapExit(currentMap: Partial<Map>, targetMap?: Map): boolean {
    if (!targetMap) return false;
    
    const sameRegion = currentMap.region && targetMap.region && currentMap.region === targetMap.region;
    return !sameRegion;
}
