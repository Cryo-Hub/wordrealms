import { BATTLE_PASS_REWARDS } from './battlePassData';
import { BUILDINGS, SKIN_KEY_TO_BUILDING, type BuildingType } from '../world/buildingConfig';

export function getBuildingDisplayEmoji(type: BuildingType, claimedRewardIds: string[]): string {
  for (const id of claimedRewardIds) {
    const r = BATTLE_PASS_REWARDS.find((x) => x.id === id && x.skinKey);
    if (!r?.skinKey) continue;
    const bt = SKIN_KEY_TO_BUILDING[r.skinKey];
    if (bt === type) return r.icon;
  }
  return BUILDINGS[type].emoji;
}
