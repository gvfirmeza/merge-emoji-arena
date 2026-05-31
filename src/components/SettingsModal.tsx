import { useGameStore } from '../store/gameStore';
import { formatNumber } from '../utils/constants';
import { X, Trophy, Clock, Skull } from 'lucide-react';

export default function SettingsModal({ onClose }: { onClose: () => void }) {
  const { settings, stats, updateSettings, resetSave } = useGameStore();

  const handleReset = () => {
    if (confirm("Are you sure you want to reset all progress?")) {
      resetSave();
      onClose();
    }
  };

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h}h ${m}m ${s}s`;
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.8)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 100, backdropFilter: 'blur(5px)'
    }}>
      <div className="panel animate-pop" style={{ width: 400, padding: 32, gap: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0, color: 'var(--text)', fontSize: '1.5rem' }}>Settings & Stats</h2>
          <button onClick={onClose} style={{ background: 'transparent', color: 'var(--text-dim)', padding: 8 }}>
            <X size={28} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-panel-light)', padding: '16px 20px', borderRadius: 12 }}>
            <span style={{ fontWeight: 'bold' }}>SFX Volume</span>
            <input 
              type="range" 
              min="0" max="1" step="0.1" 
              value={settings.sfxVolume} 
              onChange={(e) => updateSettings({ sfxVolume: parseFloat(e.target.value) })}
              style={{ width: 120, accentColor: 'var(--accent)' }}
            />
          </div>

          <div style={{ background: 'var(--bg-panel-light)', padding: '20px', borderRadius: 12 }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '0.9rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: 1 }}>Statistics</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontWeight: 'bold' }}>
                <Trophy size={20} color="var(--gold)" />
                <span>Highest Stage: {formatNumber(stats.highestStageReached)}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontWeight: 'bold' }}>
                <Skull size={20} color="var(--accent)" />
                <span>Enemies Defeated: {formatNumber(stats.totalEnemiesDefeated)}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontWeight: 'bold' }}>
                <Clock size={20} color="var(--blue)" />
                <span>Time Played: {formatTime(stats.timePlayed)}</span>
              </div>
            </div>
          </div>

          <button 
            style={{ 
              background: 'transparent', 
              color: 'var(--accent)', 
              border: '2px solid var(--accent)', 
              boxShadow: 'none',
              padding: '16px',
              borderRadius: '12px',
              fontWeight: 'bold',
              textTransform: 'uppercase',
              letterSpacing: 1,
              marginTop: 16
            }} 
            onClick={handleReset}
          >
            Reset Progress
          </button>
        </div>
      </div>
    </div>
  );
}
