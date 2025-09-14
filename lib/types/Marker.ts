export interface Marker {
    target: string;
    latLng: [number, number];
    geojson?: {
        area: [number, number][];
        hitbox: [number, number][];
    };
}

// Factory function to create a Marker with defaults
export function createMarker(
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