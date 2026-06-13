import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { GameState, Enemy } from '../types';
import {
  BOARD_SIZE, LANES_COUNT, getEnemyMaxHp, getEnemyReward, getShopCost, getShopLevelForStage, getEnemyEmoji, MAX_UNIT_LEVEL
} from '../utils/constants';

const createEnemy = (stage: number, isBoss: boolean, laneIndex: number): Enemy => {
  const emoji = getEnemyEmoji(stage, isBoss);

  const laneMultiplier = 1 + (laneIndex * 0.2); // Each lane is 20% stronger than the previous
  const maxHp = Math.floor(getEnemyMaxHp(stage, isBoss) * laneMultiplier);
  
  return {
    id: crypto.randomUUID(),
    emoji,
    hp: maxHp,
    maxHp,
    isBoss,
    reward: getEnemyReward(stage, isBoss)
  };
};

const createInitialEnemies = (stage: number) => {
  const isBoss = stage % 10 === 0;
  return Array(LANES_COUNT).fill(null).map((_, i) => createEnemy(stage, isBoss, i));
};

const updateBestiary = (bestiary: Record<string, import('../types').BestiaryEntry>, enemies: (Enemy | null)[], stage: number) => {
  const newBestiary = { ...bestiary };
  enemies.forEach(e => {
    if (e) {
      if (!newBestiary[e.emoji]) {
        newBestiary[e.emoji] = {
          emoji: e.emoji,
          isBoss: e.isBoss,
          firstSeenStage: stage,
          highestHp: e.maxHp,
          defeatedCount: 0
        };
      } else if (e.maxHp > newBestiary[e.emoji].highestHp) {
        newBestiary[e.emoji] = { ...newBestiary[e.emoji], highestHp: e.maxHp };
      }
    }
  });
  return newBestiary;
};

export interface GameStateActions {
  buyUnit: () => void;
  moveBoardUnit: (fromIndex: number, toIndex: number) => void;
  mergeBoardUnits: (fromIndex: number, toIndex: number) => void;
  assignToLane: (boardIndex: number, laneIndex: number) => void;
  unassignFromLane: (laneIndex: number, boardIndex: number) => void;
  swapLanes: (fromLane: number, toLane: number) => void;
  dealDamageToEnemy: (laneIndex: number, damage: number) => void;
  updateSettings: (settings: Partial<any>) => void;
  resetSave: () => void;
  incrementTimePlayed: () => void;
  
  // Debug Actions
  addGold: (amount: number) => void;
  spawnUnit: (level: number) => void;
  advanceStage: (stages: number) => void;
  killAllEnemies: () => void;
  clearBoard: () => void;
  unlockAllLevels: () => void;
  
  activateDoubleGold: () => void;
  upgradeAllUnits: () => void;
  claimInstantGold: () => void;
}

export const useGameStore = create<GameState & GameStateActions>()(
  persist(
    (set, get) => ({
      stage: 1,
      gold: 50,
      highestUnlockedLevel: 1,
      shopLevel: 1,
      board: Array(BOARD_SIZE).fill(null),
      lanes: Array(LANES_COUNT).fill(null),
      enemies: createInitialEnemies(1),
      bestiary: updateBestiary({}, createInitialEnemies(1), 1),
      boosts: { doubleGoldUntil: null, shopBoostUntil: null },
      settings: {
        sfxVolume: 1,
        musicVolume: 0.5,
        performanceMode: false
      },
      stats: {
        totalEnemiesDefeated: 0,
        highestStageReached: 1,
        timePlayed: 0
      },

      buyUnit: () => {
        const { gold, shopLevel, board } = get();
        const effectiveShopLevel = shopLevel;
        const cost = getShopCost(effectiveShopLevel);
        const emptyIndex = board.findIndex((u: any) => u === null);
        
        if (gold >= cost && emptyIndex !== -1) {
          const newBoard = [...board];
          newBoard[emptyIndex] = { id: crypto.randomUUID(), level: effectiveShopLevel };
          set({ gold: gold - cost, board: newBoard });
        }
      },

      moveBoardUnit: (fromIndex, toIndex) => {
        const board = [...get().board];
        const temp = board[toIndex];
        board[toIndex] = board[fromIndex];
        board[fromIndex] = temp;
        set({ board });
      },

      mergeBoardUnits: (fromIndex, toIndex) => {
        const { board, highestUnlockedLevel } = get();
        const fromUnit = board[fromIndex];
        const toUnit = board[toIndex];
        
        if (fromUnit && toUnit && fromUnit.level === toUnit.level && fromUnit.level < MAX_UNIT_LEVEL) {
          const newBoard = [...board];
          const nextLevel = fromUnit.level + 1;
          newBoard[toIndex] = { id: toUnit.id, level: nextLevel };
          newBoard[fromIndex] = null;
          
          set({ 
            board: newBoard,
            highestUnlockedLevel: Math.max(highestUnlockedLevel, nextLevel)
          });
        }
      },

      assignToLane: (boardIndex, laneIndex) => {
        const { board, lanes, highestUnlockedLevel } = get();
        const unit = board[boardIndex];
        if (unit) {
          const newBoard = [...board];
          const newLanes = [...lanes];
          const existingUnit = newLanes[laneIndex];
          
          if (existingUnit && existingUnit.level === unit.level && unit.level < MAX_UNIT_LEVEL) {
             const nextLevel = unit.level + 1;
             newLanes[laneIndex] = { id: existingUnit.id, level: nextLevel };
             newBoard[boardIndex] = null;
             set({ lanes: newLanes, board: newBoard, highestUnlockedLevel: Math.max(highestUnlockedLevel, nextLevel) });
             return;
          }
          
          newLanes[laneIndex] = unit;
          newBoard[boardIndex] = existingUnit;
          
          set({ board: newBoard, lanes: newLanes });
        }
      },

      unassignFromLane: (laneIndex, boardIndex) => {
        const { board, lanes, highestUnlockedLevel } = get();
        const unit = lanes[laneIndex];
        
        const newBoard = [...board];
        const newLanes = [...lanes];
        const boardUnit = newBoard[boardIndex];

        if (unit && boardUnit && unit.level === boardUnit.level && unit.level < MAX_UNIT_LEVEL) {
           const nextLevel = unit.level + 1;
           newBoard[boardIndex] = { id: boardUnit.id, level: nextLevel };
           newLanes[laneIndex] = null;
           set({ lanes: newLanes, board: newBoard, highestUnlockedLevel: Math.max(highestUnlockedLevel, nextLevel) });
           return;
        }
        
        newBoard[boardIndex] = unit;
        newLanes[laneIndex] = boardUnit;
        
        set({ board: newBoard, lanes: newLanes });
      },

      swapLanes: (fromLane, toLane) => {
        const { lanes, highestUnlockedLevel } = get();
        const newLanes = [...lanes];
        const fromUnit = newLanes[fromLane];
        const toUnit = newLanes[toLane];
        
        if (fromUnit && toUnit && fromUnit.level === toUnit.level && fromUnit.level < MAX_UNIT_LEVEL) {
          const nextLevel = fromUnit.level + 1;
          newLanes[toLane] = { id: toUnit.id, level: nextLevel };
          newLanes[fromLane] = null;
          set({ lanes: newLanes, highestUnlockedLevel: Math.max(highestUnlockedLevel, nextLevel) });
          return;
        }

        const temp = newLanes[toLane];
        newLanes[toLane] = newLanes[fromLane];
        newLanes[fromLane] = temp;
        set({ lanes: newLanes });
      },

      dealDamageToEnemy: (laneIndex, damage) => {
        const { enemies, gold, stage, stats, shopLevel, boosts, bestiary } = get();
        const enemy = enemies[laneIndex];
        if (enemy && enemy.hp > 0) {
          const newHp = Math.max(0, enemy.hp - damage);
          const newEnemies = [...enemies];
          
          if (newHp === 0) {
            newEnemies[laneIndex] = null;
            const newTotalDefeated = stats.totalEnemiesDefeated + 1;
            
            const isDoubleGold = boosts.doubleGoldUntil && Date.now() < boosts.doubleGoldUntil;
            const reward = isDoubleGold ? enemy.reward * 2 : enemy.reward;

            const newBestiary = { ...bestiary };
            if (newBestiary[enemy.emoji]) {
              newBestiary[enemy.emoji] = { ...newBestiary[enemy.emoji], defeatedCount: newBestiary[enemy.emoji].defeatedCount + 1 };
            }
            
            // Check if all enemies in stage are dead
            const allDead = newEnemies.every(e => e === null);
            
            if (allDead) {
              const nextStage = stage + 1;
              const autoShopLevel = getShopLevelForStage(nextStage);
              const maxShopLevel = Math.max(shopLevel, autoShopLevel);
              
              let newBoard = get().board;
              let newLanes = get().lanes;
              let highestUnlocked = get().highestUnlockedLevel;
              if (maxShopLevel > shopLevel) {
                newBoard = newBoard.map((u: any) => u && u.level < maxShopLevel ? { ...u, level: maxShopLevel } : u);
                newLanes = newLanes.map((u: any) => u && u.level < maxShopLevel ? { ...u, level: maxShopLevel } : u);
                highestUnlocked = Math.max(highestUnlocked, maxShopLevel);
              }
              
              const freshEnemies = createInitialEnemies(nextStage);
              set({
                board: newBoard,
                lanes: newLanes,
                highestUnlockedLevel: highestUnlocked,
                enemies: freshEnemies,
                bestiary: updateBestiary(newBestiary, freshEnemies, nextStage),
                gold: gold + reward,
                stage: nextStage,
                shopLevel: maxShopLevel,
                stats: {
                  ...stats,
                  totalEnemiesDefeated: newTotalDefeated,
                  highestStageReached: Math.max(stats.highestStageReached, nextStage)
                }
              });
            } else {
              set({
                enemies: newEnemies,
                bestiary: newBestiary,
                gold: gold + reward,
                stats: { ...stats, totalEnemiesDefeated: newTotalDefeated }
              });
            }
          } else {
            newEnemies[laneIndex] = { ...enemy, hp: newHp };
            set({ enemies: newEnemies });
          }
        }
      },

      updateSettings: (newSettings) => {
        set({ settings: { ...get().settings, ...newSettings } });
      },

      resetSave: () => {
        set({
          stage: 1,
          gold: 50,
          highestUnlockedLevel: 1,
          shopLevel: 1,
          board: Array(BOARD_SIZE).fill(null),
          lanes: Array(LANES_COUNT).fill(null),
          enemies: createInitialEnemies(1),
          bestiary: updateBestiary({}, createInitialEnemies(1), 1),
          boosts: { doubleGoldUntil: null, shopBoostUntil: null },
          stats: { totalEnemiesDefeated: 0, highestStageReached: 1, timePlayed: 0 }
        });
      },

      incrementTimePlayed: () => {
        const { stats } = get();
        set({ stats: { ...stats, timePlayed: stats.timePlayed + 1 } });
      },

      // Debug Actions
      addGold: (amount) => set({ gold: get().gold + amount }),
      spawnUnit: (level) => {
        const { board } = get();
        const emptyIndex = board.findIndex((u: any) => u === null);
        if (emptyIndex !== -1) {
          const newBoard = [...board];
          newBoard[emptyIndex] = { id: crypto.randomUUID(), level };
          set({ board: newBoard, highestUnlockedLevel: Math.max(get().highestUnlockedLevel, level) });
        }
      },
      advanceStage: (stages) => {
        const nextStage = get().stage + stages;
        const autoShopLevel = getShopLevelForStage(nextStage);
        const maxShopLevel = Math.max(get().shopLevel, autoShopLevel);
        
        let newBoard = get().board;
        let newLanes = get().lanes;
        let highestUnlocked = get().highestUnlockedLevel;
        if (maxShopLevel > get().shopLevel) {
          newBoard = newBoard.map((u: any) => u && u.level < maxShopLevel ? { ...u, level: maxShopLevel } : u);
          newLanes = newLanes.map((u: any) => u && u.level < maxShopLevel ? { ...u, level: maxShopLevel } : u);
          highestUnlocked = Math.max(highestUnlocked, maxShopLevel);
        }

        const freshEnemies = createInitialEnemies(nextStage);
        set({
          board: newBoard,
          lanes: newLanes,
          highestUnlockedLevel: highestUnlocked,
          stage: nextStage,
          enemies: freshEnemies,
          bestiary: updateBestiary(get().bestiary, freshEnemies, nextStage),
          shopLevel: maxShopLevel
        });
      },
      killAllEnemies: () => {
        const { enemies, gold, stage, stats, shopLevel } = get();
        let addedGold = 0;
        enemies.forEach((e: any) => { if (e) addedGold += e.reward; });
        
        const nextStage = stage + 1;
        const autoShopLevel = getShopLevelForStage(nextStage);
        const maxShopLevel = Math.max(shopLevel, autoShopLevel);
        
        let newBoard = get().board;
        let newLanes = get().lanes;
        let highestUnlocked = get().highestUnlockedLevel;
        if (maxShopLevel > shopLevel) {
          newBoard = newBoard.map((u: any) => u && u.level < maxShopLevel ? { ...u, level: maxShopLevel } : u);
          newLanes = newLanes.map((u: any) => u && u.level < maxShopLevel ? { ...u, level: maxShopLevel } : u);
          highestUnlocked = Math.max(highestUnlocked, maxShopLevel);
        }
        
        const freshEnemies = createInitialEnemies(nextStage);
        set({
          board: newBoard,
          lanes: newLanes,
          highestUnlockedLevel: highestUnlocked,
          enemies: freshEnemies,
          bestiary: updateBestiary(get().bestiary, freshEnemies, nextStage),
          gold: gold + addedGold,
          stage: nextStage,
          shopLevel: maxShopLevel,
          stats: {
            ...stats,
            totalEnemiesDefeated: stats.totalEnemiesDefeated + enemies.filter(Boolean).length,
            highestStageReached: Math.max(stats.highestStageReached, nextStage)
          }
        });
      },
      clearBoard: () => set({ board: Array(BOARD_SIZE).fill(null) }),
      unlockAllLevels: () => set({ shopLevel: MAX_UNIT_LEVEL, highestUnlockedLevel: MAX_UNIT_LEVEL }),

      activateDoubleGold: () => {
        const { boosts } = get();
        set({ boosts: { ...boosts, doubleGoldUntil: Date.now() + 5 * 60 * 1000 } });
      },
      upgradeAllUnits: () => {
        const { board, lanes, highestUnlockedLevel } = get();
        let maxNewLevel = highestUnlockedLevel;
        
        const newBoard = board.map((u: any) => {
            if (u && u.level < MAX_UNIT_LEVEL) {
                maxNewLevel = Math.max(maxNewLevel, u.level + 1);
                return { ...u, level: u.level + 1 };
            }
            return u;
        });

        const newLanes = lanes.map((u: any) => {
            if (u && u.level < MAX_UNIT_LEVEL) {
                maxNewLevel = Math.max(maxNewLevel, u.level + 1);
                return { ...u, level: u.level + 1 };
            }
            return u;
        });
        
        set({ board: newBoard, lanes: newLanes, highestUnlockedLevel: maxNewLevel });
      },
      claimInstantGold: () => {
        const { shopLevel, gold } = get();
        const currentCost = getShopCost(shopLevel);
        set({ gold: gold + (currentCost * 20) });
      }
    }),
    {
      name: 'emoji-merge-dungeon-save',
      merge: (persistedState: any, currentState: any) => {
        // Ensure board size doesn't break if old save loaded
        if (persistedState && persistedState.board) {
          persistedState.board = persistedState.board.slice(0, BOARD_SIZE);
          while (persistedState.board.length < BOARD_SIZE) persistedState.board.push(null);
        }
        if (persistedState && !persistedState.bestiary) persistedState.bestiary = {};
        if (persistedState && !persistedState.boosts) persistedState.boosts = { doubleGoldUntil: null, shopBoostUntil: null };
        return { ...currentState, ...persistedState };
      }
    }
  )
);
