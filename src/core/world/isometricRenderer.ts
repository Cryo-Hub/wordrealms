export const TILE_WIDTH = 80;
export const TILE_HEIGHT = 40;

export type ScreenPos = { screenX: number; screenY: number };

export function cartesianToIsometric(x: number, y: number): ScreenPos {
  return {
    screenX: ((x - y) * TILE_WIDTH) / 2,
    screenY: ((x + y) * TILE_HEIGHT) / 2,
  };
}

export type WorldSlot = {
  id: number;
  gridX: number;
  gridY: number;
  screen: ScreenPos;
};

/** 15 Slots in einem 5×3-Raster (isometrisch angeordnet). */
export function getWorldSlots(): WorldSlot[] {
  const coords: { gridX: number; gridY: number }[] = [
    { gridX: 0, gridY: 0 },
    { gridX: 1, gridY: 0 },
    { gridX: 2, gridY: 0 },
    { gridX: 3, gridY: 0 },
    { gridX: 4, gridY: 0 },
    { gridX: 0, gridY: 1 },
    { gridX: 1, gridY: 1 },
    { gridX: 2, gridY: 1 },
    { gridX: 3, gridY: 1 },
    { gridX: 4, gridY: 1 },
    { gridX: 0, gridY: 2 },
    { gridX: 1, gridY: 2 },
    { gridX: 2, gridY: 2 },
    { gridX: 3, gridY: 2 },
    { gridX: 4, gridY: 2 },
  ];
  return coords.map((c, i) => ({
    id: i,
    gridX: c.gridX,
    gridY: c.gridY,
    screen: cartesianToIsometric(c.gridX, c.gridY),
  }));
}
