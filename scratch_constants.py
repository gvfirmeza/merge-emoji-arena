import math

emojis = ['😭', '😢', '🙁', '😐', '🙂', '😊', '😀', '😁', '😆', '😂',
          '😎', '🤠', '🥸', '🤓', '🧐', '🕵️', '💂', '🥷', '🦸', '🧙',
          '🧝', '🧚', '🧜', '🧞', '🧟', '🧛', '👼', '👽', '👾', '🤖',
          '👻', '💀', '🤡', '👹', '👺', '😈', '👿', '🐵', '🦍', '🐺',
          '🦁', '🐅', '🐆', '🦖', '🐉', '🦄', '👑', '💎', '🔮', '🌌']

unit_data = []
dps = 5
for i in range(1, 51):
    if i == 1:
        dps = 5
    elif i <= 10:
        dps = int(dps * 1.50)
    elif i <= 20:
        dps = int(dps * 1.40)
    elif i <= 30:
        dps = int(dps * 1.35)
    elif i <= 40:
        dps = int(dps * 1.30)
    else:
        dps = int(dps * 1.28)
    unit_data.append(f"  {i}: {{ level: {i}, emoji: '{emojis[i-1]}', dps: {dps} }},")

constants_content = f"""export const UNIT_DATA: Record<number, {{ level: number; emoji: string; dps: number }}> = {{
{chr(10).join(unit_data)}
}};

export const MAX_UNIT_LEVEL = 50;

export const EARLY_ENEMIES = ['🐌', '🐛', '🐜', '🐞', '🪲', '🦗', '🪳'];
export const MID_ENEMIES = ['🐍', '🦎', '🐢', '🐸', '🦦', '🦔', '🦅', '🦝', '🦨'];
export const LATE_ENEMIES = ['🦀', '🦑', '🐙', '🦂', '🐗', '🐻', '🦬', '🐘', '🦣', '🦒', '🦘', '🦥', '🐉'];
export const BOSS_EMOJIS = ['🐉', '🦖', '👹', '👺', '👾', '🤖', '💀', '☠️', '👻', '😈', '👿', '🔥', '🌋', '⚡', '🌪️', '☄️', '🌑', '🛸'];

export const BOARD_SIZE = 9;
export const LANES_COUNT = 3;

export const getShopCost = (shopLevel: number) => Math.floor(10 * Math.pow(1.38, shopLevel - 1));
export const getEnemyMaxHp = (stage: number, isBoss: boolean) => {{ const base = 30 * Math.pow(1.20, stage - 1); return Math.max(10, Math.floor(isBoss ? base * 5 : base)); }};
export const getEnemyReward = (stage: number, isBoss: boolean) => {{ const base = 4 * Math.pow(1.10, stage - 1); return Math.max(2, Math.floor(isBoss ? base * 4 : base)); }};
export const getShopLevelForStage = (stage: number) => Math.min(50, 1 + Math.floor((stage - 1) / 10));

export const getEnemyEmoji = (stage: number, isBoss: boolean) => {{
  if (isBoss) {{
    return BOSS_EMOJIS[Math.floor((stage - 1) / 5) % BOSS_EMOJIS.length];
  }}
  const stageIndex = stage - 1;
  if (stage < 15) return EARLY_ENEMIES[stageIndex % EARLY_ENEMIES.length];
  if (stage < 30) return MID_ENEMIES[stageIndex % MID_ENEMIES.length];
  return LATE_ENEMIES[stageIndex % LATE_ENEMIES.length];
}};

const SUFFIXES = [
  '', 'K', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx', 'Sp', 'Oc', 'No', 'Dc', 
  'Ud', 'Dd', 'Td', 'Qad', 'Qid', 'Sxd', 'Spd', 'Ocd', 'Nod', 'Vg'
];

export const formatNumber = (num: number): string => {{
  if (num < 1000) return Math.floor(num).toString();
  const exponent = Math.floor(Math.log10(num));
  const suffixIndex = Math.floor(exponent / 3);
  if (suffixIndex >= SUFFIXES.length) {{
    return num.toExponential(2);
  }}
  const shortValue = num / Math.pow(10, suffixIndex * 3);
  return shortValue.toFixed(1).replace(/\.0$/, '') + SUFFIXES[suffixIndex];
}};
"""

with open('src/utils/constants.ts', 'w', encoding='utf-8') as f:
    f.write(constants_content)
