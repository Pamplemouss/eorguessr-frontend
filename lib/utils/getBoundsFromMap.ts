import { Map } from "../types/Map";

export default function getBoundsFromMap(map: Map | null): L.LatLngBoundsExpression {
    if (!map) return [[0, 0], [0, 0]];

    if (map.specialBounds) {
        return map.specialBounds;
    } else {
        return [[-119.5, -119.5], [119.5, 119.5]];
    }
}