export type WordReward = {
  gold: number;
  wood: number;
  stone: number;
};

export function calculateWordReward(wordLength: number): WordReward {
  switch (wordLength) {
    case 3:
      return { gold: 10, wood: 0, stone: 0 };
    case 4:
      return { gold: 20, wood: 5, stone: 0 };
    case 5:
      return { gold: 30, wood: 15, stone: 5 };
    case 6:
      return { gold: 40, wood: 25, stone: 15 };
    case 7:
      return { gold: 50, wood: 35, stone: 25 };
    default:
      if (wordLength < 3) return { gold: 0, wood: 0, stone: 0 };
      return { gold: 50, wood: 35, stone: 25 };
  }
}

export function rewardPointsTotal(reward: WordReward): number {
  return reward.gold + reward.wood + reward.stone;
}
