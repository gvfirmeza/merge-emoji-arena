import { useGameStore } from '../store/gameStore';
import { X } from 'lucide-react';
import { MAX_UNIT_LEVEL } from '../utils/constants';
import { motion } from 'framer-motion';

export default function DebugMenu({ onClose }: { onClose: () => void }) {
  const store = useGameStore();

  return (
    <motion.div drag style={{
      position: 'fixed', top: 80, right: 340, width: 280,
      background: 'var(--bg-panel-light)',
      borderRadius: 'var(--radius-lg)',
      padding: 20, zIndex: 1000,
      border: '1px solid var(--accent)',
      boxShadow: '0 10px 40px rgba(0,0,0,0.5), 0 0 15px var(--accent-glow)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h3 style={{ margin: 0, color: 'var(--accent)', fontFamily: 'monospace' }}>🔧 DEBUG MENU</h3>
        <button onClick={onClose} style={{ background: 'transparent', color: 'var(--text-dim)', padding: 4 }}>
          <X size={20} />
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn-primary" style={{ flex: 1, padding: 8, fontSize: '0.8rem' }} onClick={() => store.addGold(100)}>+100 🟡</button>
          <button className="btn-primary" style={{ flex: 1, padding: 8, fontSize: '0.8rem' }} onClick={() => store.addGold(1000)}>+1k 🟡</button>
          <button className="btn-primary" style={{ flex: 1, padding: 8, fontSize: '0.8rem' }} onClick={() => store.addGold(999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999)}>+999... 🟡</button>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn-primary" style={{ flex: 1, padding: 8, fontSize: '0.8rem', background: '#3b82f6' }} onClick={() => store.spawnUnit(1)}>Spawn Lv1</button>
          <button className="btn-primary" style={{ flex: 1, padding: 8, fontSize: '0.8rem', background: '#3b82f6' }} onClick={() => store.spawnUnit(store.highestUnlockedLevel)}>Spawn Max</button>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn-primary" style={{ flex: 1, padding: 8, fontSize: '0.8rem', background: '#8b5cf6' }} onClick={() => store.advanceStage(1)}>+1 Stage</button>
          <button className="btn-primary" style={{ flex: 1, padding: 8, fontSize: '0.8rem', background: '#8b5cf6' }} onClick={() => store.advanceStage(10)}>+10 Stages</button>
        </div>

        <button className="btn-primary" style={{ padding: 8, fontSize: '0.8rem', background: '#eab308' }} onClick={() => store.unlockAllLevels()}>Unlock All Levels</button>

        <button className="btn-primary" style={{ padding: 8, fontSize: '0.8rem', background: '#ef4444' }} onClick={() => store.killAllEnemies()}>Kill All Enemies</button>
        <button className="btn-primary" style={{ padding: 8, fontSize: '0.8rem', background: '#64748b' }} onClick={() => store.clearBoard()}>Clear Board</button>
        <button className="btn-primary" style={{ padding: 8, fontSize: '0.8rem', background: '#1e293b' }} onClick={() => { store.resetSave(); window.location.reload(); }}>Hard Reset</button>
      </div>
    </motion.div>
  );
}
