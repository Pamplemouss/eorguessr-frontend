import { v4 as uuidv4 } from "uuid";
import { Map } from "@/lib/types/Map";
import { MapType } from "@/lib/types/MapType";
import { Expansion } from "../types/Expansion";

export const createEmptyMap = (): Map => ({
    id: uuidv4(),
    name: { en: "", fr: "", de: "", ja: "" },
    type: MapType.MAP,
    expansion: Expansion.ARR,
    imagePath: "",
    markers: [],
    subAreas: [],
    parentMap: null,
    size: {
        x: 0,
        y: 0,
    }
});