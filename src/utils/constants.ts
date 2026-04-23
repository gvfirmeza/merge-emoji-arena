export const UNIT_DATA: Record<number, { level: number; emoji: string; dps: number }> = {
  1: { level: 1, emoji: '🙂', dps: 5 },
  2: { level: 2, emoji: '😎', dps: 12 },
  3: { level: 3, emoji: '🤠', dps: 28 },
  4: { level: 4, emoji: '🕵️', dps: 60 },
  5: { level: 5, emoji: '🥷', dps: 130 },
  6: { level: 6, emoji: '🧛', dps: 280 },
  7: { level: 7, emoji: '🧟', dps: 580 },
  8: { level: 8, emoji: '🧝', dps: 1200 },
  9: { level: 9, emoji: '🧚', dps: 2500 },
  10: { level: 10, emoji: '🧜', dps: 5500 },
  11: { level: 11, emoji: '🧞', dps: 12000 },
  12: { level: 12, emoji: '🦸', dps: 26000 },
};

export const MAX_UNIT_LEVEL = 12;

export const ENEMY_EMOJIS = ['🐌', '🐛', '🐜', '🕷️', '🦂', '🦇', '🦉', '🐊', '🦈', '🐅', '🦍', '🦏'];
export const BOSS_EMOJIS = ['👺', '👾', '👹', '🧌', '🐲', '🌋'];

export const BOARD_SIZE = 9; // Changed to 3x3
export const LANES_COUNT = 3;

// Formulas
export const getShopCost = (shopLevel: number) => {
  return Math.floor(10 * Math.pow(1.5, shopLevel - 1));
};

export const getEnemyMaxHp = (stage: number, isBoss: boolean) => {
  const base = 25 * Math.pow(1.25, stage - 1);
  return Math.max(10, Math.floor(isBoss ? base * 5 : base));
};

export const getEnemyReward = (stage: number, isBoss: boolean) => {
  const base = 5 * Math.pow(1.15, stage - 1);
  return Math.max(2, Math.floor(isBoss ? base * 4 : base));
};

export const getShopLevelForStage = (stage: number) => {
  // Every 5 stages shop level increases, max level is 8 maybe?
  return Math.min(8, 1 + Math.floor((stage - 1) / 5));
};

export const formatNumber = (num: number): string => {
  if (num >= 1000000) return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
  return num.toString();
};
