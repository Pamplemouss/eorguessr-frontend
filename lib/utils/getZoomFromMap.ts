import { Map } from "../types/Map";

export default function getZoomFromMap(map: Map | null): number {
    if (!map) return 1;

    if (map.specialZoom) {
        return map.specialZoom;
    } else {
        return 1;
    }
}