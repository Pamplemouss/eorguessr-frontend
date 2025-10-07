import { v4 as uuidv4 } from "uuid";
import { Map } from "@/lib/types/Map";
import { MapType } from "@/lib/types/MapTypeEnum";
import { Expansion } from "../types/ExpansionEnum";

export const createEmptyMapForm = (): Map => ({
    id: uuidv4(),
    name: { en: "", fr: "", de: "", ja: "" },
    type: MapType.MAP,
    expansion: Expansion.ARR,
    imagePath: "",
    markers: [],
    subAreas: [],
    parentMap: null,
});