import { v4 as uuidv4 } from "uuid";
import { IMap } from "@/lib/models/MapModel";
import { MapType } from "@/lib/types/MapType";

export const createEmptyMapForm = (): Partial<IMap> => ({
    id: uuidv4(),
    name: "",
    type: MapType.MAP,
    expansion: "",
    imagePath: "",
    markers: [],
    subAreas: [],
});