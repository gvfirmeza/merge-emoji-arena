import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { GameState, Unit, Enemy } from '../types';
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
        const cost = getShopCost(shopLevel);
        const emptyIndex = board.findIndex(u => u === null);
        
        if (gold >= cost && emptyIndex !== -1) {
          const newBoard = [...board];
          newBoard[emptyIndex] = { id: crypto.randomUUID(), level: shopLevel };
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
        const { enemies, gold, stage, stats, shopLevel } = get();
        const enemy = enemies[laneIndex];
        if (enemy && enemy.hp > 0) {
          const newHp = Math.max(0, enemy.hp - damage);
          const newEnemies = [...enemies];
          
          if (newHp === 0) {
            newEnemies[laneIndex] = null;
            const newTotalDefeated = stats.totalEnemiesDefeated + 1;
            
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
                newBoard = newBoard.map(u => u && u.level < maxShopLevel ? { ...u, level: maxShopLevel } : u);
                newLanes = newLanes.map(u => u && u.level < maxShopLevel ? { ...u, level: maxShopLevel } : u);
                highestUnlocked = Math.max(highestUnlocked, maxShopLevel);
              }
              
              set({
                board: newBoard,
                lanes: newLanes,
                highestUnlockedLevel: highestUnlocked,
                enemies: createInitialEnemies(nextStage),
                gold: gold + enemy.reward,
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
                gold: gold + enemy.reward,
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
        const emptyIndex = board.findIndex(u => u === null);
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
          newBoard = newBoard.map(u => u && u.level < maxShopLevel ? { ...u, level: maxShopLevel } : u);
          newLanes = newLanes.map(u => u && u.level < maxShopLevel ? { ...u, level: maxShopLevel } : u);
          highestUnlocked = Math.max(highestUnlocked, maxShopLevel);
        }

        set({
          board: newBoard,
          lanes: newLanes,
          highestUnlockedLevel: highestUnlocked,
          stage: nextStage,
          enemies: createInitialEnemies(nextStage),
          shopLevel: maxShopLevel
        });
      },
      killAllEnemies: () => {
        const { enemies, gold, stage, stats, shopLevel } = get();
        let addedGold = 0;
        enemies.forEach(e => { if (e) addedGold += e.reward; });
        
        const nextStage = stage + 1;
        const autoShopLevel = getShopLevelForStage(nextStage);
        const maxShopLevel = Math.max(shopLevel, autoShopLevel);
        
        let newBoard = get().board;
        let newLanes = get().lanes;
        let highestUnlocked = get().highestUnlockedLevel;
        if (maxShopLevel > shopLevel) {
          newBoard = newBoard.map(u => u && u.level < maxShopLevel ? { ...u, level: maxShopLevel } : u);
          newLanes = newLanes.map(u => u && u.level < maxShopLevel ? { ...u, level: maxShopLevel } : u);
          highestUnlocked = Math.max(highestUnlocked, maxShopLevel);
        }
        
        set({
          board: newBoard,
          lanes: newLanes,
          highestUnlockedLevel: highestUnlocked,
          enemies: createInitialEnemies(nextStage),
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
      unlockAllLevels: () => set({ shopLevel: MAX_UNIT_LEVEL, highestUnlockedLevel: MAX_UNIT_LEVEL })
    }),
    {
      name: 'emoji-merge-dungeon-save',
      merge: (persistedState: any, currentState: any) => {
        // Ensure board size doesn't break if old save loaded
        if (persistedState && persistedState.board) {
          persistedState.board = persistedState.board.slice(0, BOARD_SIZE);
          while (persistedState.board.length < BOARD_SIZE) persistedState.board.push(null);
        }
        return { ...currentState, ...persistedState };
      }
    }
  )
);
