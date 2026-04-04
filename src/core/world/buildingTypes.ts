export const BUILDING_TYPES = ['HUT', 'WELL', 'TOWER', 'MARKET', 'CASTLE'] as const;

export type BuildingType = (typeof BUILDING_TYPES)[number];

/** Alte Save-Dateien: Typ-Mapping */
export const LEGACY_BUILDING_MAP: Record<string, BuildingType> = {
  HOUSE: 'HUT',
  SAWMILL: 'WELL',
  MINE: 'TOWER',
  MARKET: 'MARKET',
  TOWER: 'CASTLE',
};
