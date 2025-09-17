import { v4 as uuidv4 } from "uuid";
import { Map } from "@/lib/types/Map";
import { MapType } from "@/lib/types/MapType";

export const createEmptyMapForm = (): Partial<Map> => ({
    id: uuidv4(),
    name: "",
    type: MapType.MAP,
    expansion: "",
    imagePath: "",
    markers: [],
    subAreas: [],
});