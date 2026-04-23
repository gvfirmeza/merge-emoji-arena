export interface Unit {
  id: string; // unique uuid
  level: number;
}

export interface Enemy {
  id: string;
  emoji: string;
  hp: number;
  maxHp: number;
  isBoss: boolean;
  reward: number;
}

export interface GameState {
  stage: number;
  gold: number;
  highestUnlockedLevel: number;
  shopLevel: number;
  board: (Unit | null)[]; // 16 slots (4x4)
  lanes: (Unit | null)[];  // 3 slots
  enemies: (Enemy | null)[]; // 3 slots
  settings: {
    sfxVolume: number;
    musicVolume: number;
    performanceMode: boolean;
  };
  stats: {
    totalEnemiesDefeated: number;
    highestStageReached: number;
    timePlayed: number; // in seconds
  };
  
  // Actions
  buyUnit: () => void;
  moveBoardUnit: (fromIndex: number, toIndex: number) => void;
  mergeBoardUnits: (fromIndex: number, toIndex: number) => void;
  assignToLane: (boardIndex: number, laneIndex: number) => void;
  unassignFromLane: (laneIndex: number, boardIndex: number) => void;
  swapLanes: (fromLane: number, toLane: number) => void;
  dealDamageToEnemy: (laneIndex: number, damage: number) => void;
  updateSettings: (settings: Partial<GameState['settings']>) => void;
  resetSave: () => void;
  incrementTimePlayed: () => void;
}
