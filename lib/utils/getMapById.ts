import { Map } from '../types/Map';

export function getMapById(maps: Map[], id: string): Map | undefined {
    return maps.find((map) => map.id === id);
}