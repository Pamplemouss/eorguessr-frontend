import { v4 as uuidv4 } from "uuid";
import { Map } from "@/lib/types/Map";
import { MapType } from "@/lib/types/MapTypeEnum";
import { Expansion } from "../types/ExpansionEnum";

export const createEmptyMapForm = (): Partial<Map> => ({
    id: uuidv4(),
    name: "",
    type: MapType.MAP,
    expansion: Expansion.ARR,
    imagePath: "",
    markers: [],
    subAreas: [],
});