export interface Marker {
    target: string; // map ID
    latLng: [number, number];
    geojson?: {
        area: [number, number][];
        hitbox: [number, number][];
    };
}