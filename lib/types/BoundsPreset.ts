export enum BoundsPreset {
    DEFAULT = "Default",
    THE_SOURCE = "The Source",
    THE_FIRST = "The First",
}

export const BoundsPresetValues: Record<BoundsPreset, L.LatLngBoundsExpression> = {
    [BoundsPreset.DEFAULT]: [[-119.5, -119.5], [119.5, 119.5]],
    [BoundsPreset.THE_SOURCE]: [[-110, -258], [110, 258]],
    [BoundsPreset.THE_FIRST]: [[-110, -196], [110, 196]],
};