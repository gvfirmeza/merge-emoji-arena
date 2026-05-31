import { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { X, Book, Target } from 'lucide-react';
import { EARLY_ENEMIES, MID_ENEMIES, LATE_ENEMIES, BOSS_EMOJIS, ENEMY_NAMES, formatNumber } from '../utils/constants';

export default function BestiaryModal({ onClose }: { onClose: () => void }) {
  const { bestiary } = useGameStore();
  const [tab, setTab] = useState<'enemies' | 'bosses'>('enemies');

  // Deduplicate and gather emojis
  const allEnemies = Array.from(new Set([...EARLY_ENEMIES, ...MID_ENEMIES, ...LATE_ENEMIES]));
  const allBosses = Array.from(new Set(BOSS_EMOJIS));

  const items = tab === 'enemies' ? allEnemies : allBosses;
  
  const totalUnlocked = items.filter(e => bestiary[e]).length;
  const total = items.length;
  const progress = Math.round((totalUnlocked / total) * 100);

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.8)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, backdropFilter: 'blur(5px)'
    }}>
      <div className="panel animate-pop" style={{ width: 600, height: '80vh', display: 'flex', flexDirection: 'column', padding: 24, gap: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Book color="var(--accent)" size={28} />
            <h2 style={{ margin: 0, color: 'var(--text)', fontSize: '1.5rem' }}>Bestiary</h2>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', color: 'var(--text-dim)', padding: 8 }}>
            <X size={28} />
          </button>
        </div>

        <div style={{ display: 'flex', gap: 12, background: 'rgba(0,0,0,0.2)', padding: 6, borderRadius: 12 }}>
          <button 
            onClick={() => setTab('enemies')}
            style={{ 
              flex: 1, padding: 12, borderRadius: 8, 
              background: tab === 'enemies' ? 'var(--accent)' : 'transparent',
              color: tab === 'enemies' ? 'white' : 'var(--text-dim)',
              fontWeight: 'bold', border: 'none', cursor: 'pointer'
            }}
          >
            Enemies
          </button>
          <button 
            onClick={() => setTab('bosses')}
            style={{ 
              flex: 1, padding: 12, borderRadius: 8, 
              background: tab === 'bosses' ? 'var(--accent)' : 'transparent',
              color: tab === 'bosses' ? 'white' : 'var(--text-dim)',
              fontWeight: 'bold', border: 'none', cursor: 'pointer'
            }}
          >
            Bosses
          </button>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 8px' }}>
          <span style={{ color: 'var(--text-dim)', fontWeight: 'bold' }}>Completion: {totalUnlocked} / {total}</span>
          <div style={{ width: 120, height: 8, background: 'rgba(0,0,0,0.3)', borderRadius: 4, overflow: 'hidden' }}>
            <div style={{ width: `${progress}%`, height: '100%', background: 'var(--green)', transition: 'width 0.3s' }} />
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12, paddingRight: 8 }}>
          {items.map(emoji => {
            const entry = bestiary[emoji];
            const isUnlocked = !!entry;

            return (
              <div key={emoji} style={{
                display: 'flex', alignItems: 'center', gap: 16,
                background: 'var(--bg-panel-light)',
                padding: '12px 16px',
                borderRadius: 16,
                border: '2px solid var(--border-dark)',
                opacity: isUnlocked ? 1 : 0.6,
                filter: isUnlocked ? 'none' : 'grayscale(100%) brightness(0.5)'
              }}>
                <div style={{
                  width: 60, height: 60, background: 'rgba(0,0,0,0.2)',
                  borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '2.5rem'
                }}>
                  {isUnlocked ? emoji : '❓'}
                </div>
                
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: isUnlocked ? 'var(--text)' : 'var(--text-dim)' }}>
                    {isUnlocked ? ENEMY_NAMES[emoji] || 'Unknown' : 'Unknown Entity'}
                  </span>
                  
                  {isUnlocked ? (
                    <div style={{ display: 'flex', gap: 16, fontSize: '0.9rem', color: 'var(--text-dim)', flexWrap: 'wrap' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        First Seen: Stage {entry.firstSeenStage}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        Highest HP: {formatNumber(entry.highestHp)}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Target size={14} /> {formatNumber(entry.defeatedCount)} Defeated
                      </span>
                    </div>
                  ) : (
                    <span style={{ fontSize: '0.9rem', color: 'var(--text-dim)' }}>Encounter to reveal data.</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
