import { Map } from "../types/Map";

export default function getCenterFromMap(map: Map | null): L.LatLngExpression {
    if (!map) return [0, 0];

    if (map.specialCenter) {
        return map.specialCenter;
    } else {
        return [0, 0];
    }
}