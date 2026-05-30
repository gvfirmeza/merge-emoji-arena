export const UNIT_DATA: Record<number, { level: number; emoji: string; dps: number }> = {
  1: { level: 1, emoji: '😭', dps: 5 },
  2: { level: 2, emoji: '😢', dps: 7 },
  3: { level: 3, emoji: '☹️', dps: 10 },
  4: { level: 4, emoji: '😐', dps: 15 },
  5: { level: 5, emoji: '🙂', dps: 22 },
  6: { level: 6, emoji: '😊', dps: 33 },
  7: { level: 7, emoji: '😀', dps: 49 },
  8: { level: 8, emoji: '😆', dps: 73 },
  9: { level: 9, emoji: '🤣', dps: 109 },
  10: { level: 10, emoji: '🤩', dps: 163 },

  11: { level: 11, emoji: '😎', dps: 228 },
  12: { level: 12, emoji: '🤓', dps: 319 },
  13: { level: 13, emoji: '🧐', dps: 446 },
  14: { level: 14, emoji: '🥸', dps: 624 },
  15: { level: 15, emoji: '🕵️', dps: 873 },

  16: { level: 16, emoji: '👨‍🎓', dps: 1222 },
  17: { level: 17, emoji: '👨‍🏫', dps: 1710 },
  18: { level: 18, emoji: '👨‍⚕️', dps: 2394 },
  19: { level: 19, emoji: '👨‍🚒', dps: 3351 },
  20: { level: 20, emoji: '👮', dps: 4691 },

  21: { level: 21, emoji: '💂', dps: 6332 },
  22: { level: 22, emoji: '🥷', dps: 8548 },
  23: { level: 23, emoji: '🤺', dps: 11539 },
  24: { level: 24, emoji: '🏹', dps: 15577 },
  25: { level: 25, emoji: '⚔️', dps: 21028 },

  26: { level: 26, emoji: '🛡️', dps: 28387 },
  27: { level: 27, emoji: '🦸', dps: 38322 },
  28: { level: 28, emoji: '🦹', dps: 51734 },
  29: { level: 29, emoji: '🧙', dps: 69840 },
  30: { level: 30, emoji: '🧝', dps: 94284 },

  31: { level: 31, emoji: '🧚', dps: 122569 },
  32: { level: 32, emoji: '🧜', dps: 159339 },
  33: { level: 33, emoji: '🧞', dps: 207140 },
  34: { level: 34, emoji: '🧛', dps: 269282 },
  35: { level: 35, emoji: '🧟', dps: 350066 },

  36: { level: 36, emoji: '👼', dps: 455085 },
  37: { level: 37, emoji: '😇', dps: 591610 },
  38: { level: 38, emoji: '✨', dps: 769093 },
  39: { level: 39, emoji: '🌟', dps: 999820 },
  40: { level: 40, emoji: '💫', dps: 1299766 },

  41: { level: 41, emoji: '⚡', dps: 1663700 },
  42: { level: 42, emoji: '🔥', dps: 2129536 },
  43: { level: 43, emoji: '🌈', dps: 2725806 },
  44: { level: 44, emoji: '☄️', dps: 3489031 },
  45: { level: 45, emoji: '🌙', dps: 4465959 },

  46: { level: 46, emoji: '🪐', dps: 5716427 },
  47: { level: 47, emoji: '🌍', dps: 7317026 },
  48: { level: 48, emoji: '🌞', dps: 9365793 },
  49: { level: 49, emoji: '🌌', dps: 11988215 },
  50: { level: 50, emoji: '🌀', dps: 15344915 },
};

export const MAX_UNIT_LEVEL = 50;

export const EARLY_ENEMIES = [
  '🐌','🐛','🐜','🐞','🪲',
  '🦗','🪳','🐝','🦟','🪰'
];

export const MID_ENEMIES = [
  '🐍','🦎','🐢','🐸','🦀',
  '🦑','🐙','🦂','🦅','🦝'
];

export const LATE_ENEMIES = [
  '🦨','🐗','🐻','🦬','🐘',
  '🦣','🦒','🦘','🦥','🦏',
  '🦖','🐉'
];

export const BOSS_EMOJIS = [
  '👹',
  '👺',
  '😈',
  '👿',
  '👻',
  '💀',
  '☠️',
  '🤡',
  '👾',
  '🤖',
  '🌪️',
  '🌋',
  '☄️',
  '🦖'
];

export const BOARD_SIZE = 9;
export const LANES_COUNT = 3;

export const getShopCost = (shopLevel: number) => Math.floor(10 * Math.pow(1.38, shopLevel - 1));
export const getEnemyMaxHp = (stage: number, isBoss: boolean) => { const base = 30 * Math.pow(1.14, stage - 1); return Math.max(10, Math.floor(isBoss ? base * 5 : base)); };
export const getEnemyReward = (stage: number, isBoss: boolean) => { const base = 16 * Math.pow(1.07, stage - 1); return Math.max(8, Math.floor(isBoss ? base * 4 : base)); };
export const getShopLevelForStage = (stage: number) => Math.min(50, 1 + Math.floor((stage - 1) / 10));

export const getEnemyEmoji = (stage: number, isBoss: boolean) => {
  if (isBoss) {
    return BOSS_EMOJIS[Math.floor((stage - 1) / 5) % BOSS_EMOJIS.length];
  }
  const stageIndex = stage - 1;
  if (stage < 15) return EARLY_ENEMIES[stageIndex % EARLY_ENEMIES.length];
  if (stage < 30) return MID_ENEMIES[stageIndex % MID_ENEMIES.length];
  return LATE_ENEMIES[stageIndex % LATE_ENEMIES.length];
};

const SUFFIXES = [
  '', 'K', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx', 'Sp', 'Oc', 'No', 'Dc', 
  'Ud', 'Dd', 'Td', 'Qad', 'Qid', 'Sxd', 'Spd', 'Ocd', 'Nod', 'Vg'
];

export const formatNumber = (num: number): string => {
  if (num < 1000) return Math.floor(num).toString();
  const exponent = Math.floor(Math.log10(num));
  const suffixIndex = Math.floor(exponent / 3);
  if (suffixIndex >= SUFFIXES.length) {
    return num.toExponential(2);
  }
  const shortValue = num / Math.pow(10, suffixIndex * 3);
  return shortValue.toFixed(1).replace(/\.0$/, '') + SUFFIXES[suffixIndex];
};
