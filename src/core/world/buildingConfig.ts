import { BUILDING_TYPES, type BuildingType } from './buildingTypes';

export { BUILDING_TYPES, type BuildingType };

export type BuildingCost = {
  gold: number;
  wood: number;
  stone: number;
};

export type BuildingDefinition = {
  type: BuildingType;
  name: string;
  emoji: string;
  cost: BuildingCost;
  description: string;
  /** Battle-Pass XP bei Platzierung */
  buildXp: number;
};

export const BUILDINGS: Record<BuildingType, BuildingDefinition> = {
  HUT: {
    type: 'HUT',
    name: 'Hut',
    emoji: '🏠',
    cost: { gold: 0, wood: 3, stone: 0 },
    description: 'Humble dwelling',
    buildXp: 5,
  },
  WELL: {
    type: 'WELL',
    name: 'Well',
    emoji: '🪣',
    cost: { gold: 0, wood: 0, stone: 2 },
    description: 'Fresh water',
    buildXp: 5,
  },
  TOWER: {
    type: 'TOWER',
    name: 'Tower',
    emoji: '🗼',
    cost: { gold: 1, wood: 0, stone: 3 },
    description: 'Watch the realm',
    buildXp: 10,
  },
  MARKET: {
    type: 'MARKET',
    name: 'Market',
    emoji: '🏪',
    cost: { gold: 2, wood: 0, stone: 0 },
    description: 'Trade hub',
    buildXp: 10,
  },
  CASTLE: {
    type: 'CASTLE',
    name: 'Castle',
    emoji: '⛩️',
    cost: { gold: 3, wood: 5, stone: 5 },
    description: 'Seat of power',
    buildXp: 25,
  },
};

/** Welches Gebäude profitiert von welchem skinKey (Premium-Belohnungen) */
export const SKIN_KEY_TO_BUILDING: Record<string, BuildingType> = {
  'skin-hut-forest': 'HUT',
  'skin-well-stone': 'WELL',
  'skin-tower-shadow': 'TOWER',
  'skin-tower-fire': 'TOWER',
  'skin-tower-storm': 'TOWER',
  'skin-market-crystal': 'MARKET',
  'skin-market-void': 'MARKET',
  'skin-castle-legendary': 'CASTLE',
};
