export const BUILDING_TYPES = [
  'HOUSE',
  'SAWMILL',
  'MINE',
  'MARKET',
  'TOWER',
] as const;

export type BuildingType = (typeof BUILDING_TYPES)[number];

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
};

export const BUILDINGS: Record<BuildingType, BuildingDefinition> = {
  HOUSE: {
    type: 'HOUSE',
    name: 'House',
    emoji: '🏠',
    cost: { gold: 50, wood: 20, stone: 0 },
    description: '+5 daily gold bonus',
  },
  SAWMILL: {
    type: 'SAWMILL',
    name: 'Sawmill',
    emoji: '🪚',
    cost: { gold: 30, wood: 0, stone: 10 },
    description: 'Double wood rewards',
  },
  MINE: {
    type: 'MINE',
    name: 'Mine',
    emoji: '⛏️',
    cost: { gold: 40, wood: 10, stone: 0 },
    description: 'Unlock stone rewards',
  },
  MARKET: {
    type: 'MARKET',
    name: 'Market',
    emoji: '🏪',
    cost: { gold: 80, wood: 30, stone: 20 },
    description: '+20% all rewards',
  },
  TOWER: {
    type: 'TOWER',
    name: 'Tower',
    emoji: '🗼',
    cost: { gold: 100, wood: 50, stone: 50 },
    description: 'Unlock premium puzzles',
  },
};
