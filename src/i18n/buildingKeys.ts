import type { BuildingType } from '../core/world/buildingConfig';

export function buildingNameKey(type: BuildingType): string {
  return `building.${type.toLowerCase()}.name`;
}

export function buildingDescKey(type: BuildingType): string {
  return `building.${type.toLowerCase()}.desc`;
}
