export interface Marker {
    target: string; // map ID
    useSubAreaCustomName?: boolean; // whether to use subAreaCustomName for display
    latLng: [number, number];
    geojson?: {
        area: [number, number][][]; // Array of polygons, each polygon is an array of coordinate pairs
        hitbox: [number, number][][]; // Array of polygons, each polygon is an array of coordinate pairs
    };
}