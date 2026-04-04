export type RewardType =
  | 'gold'
  | 'wood'
  | 'stone'
  | 'hint'
  | 'skin'
  | 'avatar'
  | 'border'
  | 'badge';

export type BattlePassReward = {
  id: string;
  level: number;
  track: 'free' | 'premium';
  type: RewardType;
  label: string;
  icon: string;
  amount?: number;
  /** Skin key für Gebäude-Kosmetik */
  skinKey?: string;
};

const freeRow = (
  level: number,
  type: RewardType,
  label: string,
  icon: string,
  amount?: number,
  skinKey?: string,
): BattlePassReward => ({
  id: `bp-s1-l${level}-free`,
  level,
  track: 'free',
  type,
  label,
  icon,
  amount,
  skinKey,
});

const premRow = (
  level: number,
  type: RewardType,
  label: string,
  icon: string,
  amount?: number,
  skinKey?: string,
): BattlePassReward => ({
  id: `bp-s1-l${level}-prem`,
  level,
  track: 'premium',
  type,
  label,
  icon,
  amount,
  skinKey,
});

/** Season 1 — 30 Levels, je Free + Premium */
export const BATTLE_PASS_REWARDS: BattlePassReward[] = [
  freeRow(1, 'gold', '50 Gold', '🪙', 50),
  premRow(1, 'gold', '100 Gold', '🪙', 100),
  freeRow(2, 'wood', '30 Wood', '🪵', 30),
  premRow(2, 'hint', '2 Hints', '💡', 2),
  freeRow(3, 'stone', '30 Stone', '🪨', 30),
  premRow(3, 'skin', 'Forest Hut Skin', '🌲', undefined, 'skin-hut-forest'),
  freeRow(4, 'hint', '1 Hint', '💡', 1),
  premRow(4, 'gold', '150 Gold', '🪙', 150),
  freeRow(5, 'gold', '80 Gold', '🪙', 80),
  premRow(5, 'skin', 'Stone Well Skin', '🪨', undefined, 'skin-well-stone'),
  freeRow(6, 'wood', '40 Wood', '🪵', 40),
  premRow(6, 'gold', '200 Gold', '🪙', 200),
  freeRow(7, 'stone', '40 Stone', '🪨', 40),
  premRow(7, 'hint', '3 Hints', '💡', 3),
  freeRow(8, 'hint', '1 Hint', '💡', 1),
  premRow(8, 'skin', 'Shadow Tower Skin', '🗼', undefined, 'skin-tower-shadow'),
  freeRow(9, 'gold', '100 Gold', '🪙', 100),
  premRow(9, 'gold', '250 Gold', '🪙', 250),
  freeRow(10, 'wood', '50 Wood', '🪵', 50),
  premRow(10, 'avatar', 'Dragon Avatar Frame', '🐉', undefined, 'avatar-dragon'),
  freeRow(11, 'stone', '50 Stone', '🪨', 50),
  premRow(11, 'gold', '300 Gold', '🪙', 300),
  freeRow(12, 'hint', '2 Hints', '💡', 2),
  premRow(12, 'skin', 'Crystal Market Skin', '💎', undefined, 'skin-market-crystal'),
  freeRow(13, 'gold', '120 Gold', '🪙', 120),
  premRow(13, 'gold', '350 Gold', '🪙', 350),
  freeRow(14, 'wood', '60 Wood', '🪵', 60),
  premRow(14, 'hint', '5 Hints', '💡', 5),
  freeRow(15, 'stone', '60 Stone', '🪨', 60),
  premRow(15, 'border', 'Enchanted Border', '🌟', undefined, 'border-enchanted'),
  freeRow(16, 'gold', '150 Gold', '🪙', 150),
  premRow(16, 'gold', '400 Gold', '🪙', 400),
  freeRow(17, 'hint', '2 Hints', '💡', 2),
  premRow(17, 'skin', 'Fire Tower Skin', '🔥', undefined, 'skin-tower-fire'),
  freeRow(18, 'wood', '70 Wood', '🪵', 70),
  premRow(18, 'gold', '450 Gold', '🪙', 450),
  freeRow(19, 'stone', '70 Stone', '🪨', 70),
  premRow(19, 'hint', '7 Hints', '💡', 7),
  freeRow(20, 'gold', '180 Gold', '🪙', 180),
  premRow(20, 'avatar', 'Royal Avatar Frame', '👑', undefined, 'avatar-royal'),
  freeRow(21, 'hint', '3 Hints', '💡', 3),
  premRow(21, 'gold', '500 Gold', '🪙', 500),
  freeRow(22, 'wood', '80 Wood', '🪵', 80),
  premRow(22, 'skin', 'Void Market Skin', '⚫', undefined, 'skin-market-void'),
  freeRow(23, 'stone', '80 Stone', '🪨', 80),
  premRow(23, 'gold', '550 Gold', '🪙', 550),
  freeRow(24, 'gold', '200 Gold', '🪙', 200),
  premRow(24, 'hint', '10 Hints', '💡', 10),
  freeRow(25, 'wood', '90 Wood', '🪵', 90),
  premRow(25, 'border', 'Golden Border', '✨', undefined, 'border-golden'),
  freeRow(26, 'stone', '90 Stone', '🪨', 90),
  premRow(26, 'gold', '600 Gold', '🪙', 600),
  freeRow(27, 'hint', '3 Hints', '💡', 3),
  premRow(27, 'skin', 'Storm Tower Skin', '⚡', undefined, 'skin-tower-storm'),
  freeRow(28, 'gold', '220 Gold', '🪙', 220),
  premRow(28, 'gold', '700 Gold', '🪙', 700),
  freeRow(29, 'wood', '100 Wood', '🪵', 100),
  premRow(29, 'hint', '15 Hints', '💡', 15),
  freeRow(30, 'badge', 'Season Badge', '🏆', undefined, 'badge-season-1'),
  premRow(30, 'skin', 'LEGENDARY CASTLE SKIN', '🏰', undefined, 'skin-castle-legendary'),
];

export function rewardsForLevel(level: number): { free: BattlePassReward; premium: BattlePassReward } {
  const f = BATTLE_PASS_REWARDS.find((r) => r.level === level && r.track === 'free');
  const p = BATTLE_PASS_REWARDS.find((r) => r.level === level && r.track === 'premium');
  if (!f || !p) throw new Error(`Missing BP level ${level}`);
  return { free: f, premium: p };
}
