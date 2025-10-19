export interface Marker {
    target: string; // map ID
    latLng: [number, number];
    geojson?: {
        area: [number, number][][]; // Array of polygons, each polygon is an array of coordinate pairs
        hitbox: [number, number][][]; // Array of polygons, each polygon is an array of coordinate pairs
    };
}