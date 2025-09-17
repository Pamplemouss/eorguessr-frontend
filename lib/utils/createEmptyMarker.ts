import { Marker } from "../types/Marker";

export function createEmptyMarker(
    target: string = '',
    latLng: [number, number] = [0, 0],
    geojson?: {
        area: [number, number][];
        hitbox: [number, number][];
    }
): Marker {
    return {
        target,
        latLng,
        geojson,
    };
}