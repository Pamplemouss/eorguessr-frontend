import { BoundsPresetValues } from "../types/BoundsPreset";
import { Map } from "../types/Map";

export default function getBoundsFromMap(map: Map | null): L.LatLngBoundsExpression {
    if (!map) return [[0, 0], [0, 0]];

    if (map.name.en === "The Source" || map.name.en === "The First") {
        return BoundsPresetValues[map.name.en];
    } else {
        return BoundsPresetValues["Default"];
    }
}