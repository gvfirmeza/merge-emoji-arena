import { useState, useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import { formatNumber } from '../utils/constants';
import { Settings, Coins, Book } from 'lucide-react';
import SettingsModal from './SettingsModal';
import BestiaryModal from './BestiaryModal';
import { motion } from 'framer-motion';

export default function TopBar() {
  const { stage, gold, boosts } = useGameStore();
  const [showSettings, setShowSettings] = useState(false);
  const [showBestiary, setShowBestiary] = useState(false);
  const [now, setNow] = useState(Date.now());

  const [punchGold, setPunchGold] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    setPunchGold(true);
    const t = setTimeout(() => setPunchGold(false), 200);
    return () => clearTimeout(t);
  }, [gold]);

  const isDoubleGoldActive = boosts.doubleGoldUntil ? now < boosts.doubleGoldUntil : false;

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const showNodes = () => {
    const nodes = [];
    const base = Math.floor((stage - 1) / 10) * 10;
    for (let i = 1; i <= 10; i++) {
      const nodeStage = base + i;
      const isBoss = nodeStage % 10 === 0;
      const isCurrent = nodeStage === stage;
      const isPast = nodeStage < stage;

      let icon = isBoss ? '👹' : '⚔️';
      if (isPast) icon = '✓';
      if (isCurrent && !isBoss) icon = '⚔️';

      nodes.push(
        <div key={nodeStage} style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          opacity: isCurrent ? 1 : isPast ? 0.8 : 0.4,
          transform: isCurrent ? 'scale(1.2)' : 'scale(1)',
          transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
          minWidth: 40,
          position: 'relative',
          zIndex: isCurrent ? 10 : 1
        }}>
          <div style={{ 
            width: isBoss ? 44 : 36,
            height: isBoss ? 44 : 36,
            borderRadius: '50%',
            background: isBoss 
              ? (isPast ? 'var(--blue)' : isCurrent ? 'var(--accent)' : 'var(--bg-dark)')
              : (isPast ? 'var(--green)' : isCurrent ? 'var(--gold)' : 'var(--bg-dark)'),
            border: `3px solid ${isCurrent || isPast ? 'var(--text)' : 'var(--border-dark)'}`,
            boxShadow: `0 4px 0 ${isCurrent ? 'rgba(0,0,0,0.4)' : 'var(--border-dark)'}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: isBoss ? '1.5rem' : '1.2rem',
            color: isPast ? 'white' : 'var(--border-dark)',
            fontWeight: 'bold',
            marginTop: isCurrent ? -8 : 0
          }}>
            {icon === '●' ? '' : icon}
          </div>
          {isCurrent && (
            <div style={{ 
              position: 'absolute', bottom: -20,
              background: 'var(--border-dark)',
              color: 'var(--gold)',
              padding: '2px 8px',
              borderRadius: 12,
              fontSize: '0.7rem', 
              fontWeight: 'bold',
              whiteSpace: 'nowrap',
              boxShadow: '0 2px 0 rgba(0,0,0,0.5)'
            }}>Stage {stage}</div>
          )}
        </div>
      );
      
      if (i < 10) {
        nodes.push(
          <div key={`line-${i}`} style={{
            height: 6, width: 24, 
            backgroundColor: isPast ? 'var(--green)' : 'var(--border-dark)',
            margin: '0 4px', alignSelf: 'center',
            borderRadius: 4,
            boxShadow: 'inset 0 2px 2px rgba(0,0,0,0.3)'
          }} />
        );
      }
    }
    return nodes;
  };

  return (
    <>
      <div className="panel top-bar-panel" style={{ gridArea: 'top' }}>
        
        <div 
          style={{ display: 'flex', flexDirection: 'column', gap: 8, userSelect: 'none' }}
        >
          <div style={{
            background: 'var(--bg-dark)',
            border: '3px solid var(--border-dark)',
            borderRadius: '24px',
            padding: '6px 20px 6px 12px',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            boxShadow: 'inset 0 4px 10px rgba(0,0,0,0.5), 0 4px 0 var(--border-dark)'
          }}>
            <Coins color="var(--gold)" fill="var(--gold)" size={32} style={{ filter: 'drop-shadow(0 2px 0 rgba(0,0,0,0.5))' }} />
            <motion.span 
              animate={punchGold ? { scale: [1, 1.3, 1], color: ['#fff', 'var(--gold)', '#fff'] } : {}}
              transition={{ duration: 0.2 }}
              style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'white', textShadow: '0 2px 0 var(--border-dark)' }}
            >
              {formatNumber(gold)}
            </motion.span>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {isDoubleGoldActive && (
              <div style={{ background: 'var(--gold)', color: 'white', padding: '2px 8px', borderRadius: 8, fontSize: '0.8rem', fontWeight: 'bold' }}>
                2x Gold: {formatTime(Math.ceil((boosts.doubleGoldUntil! - now) / 1000))}
              </div>
            )}
          </div>
        </div>

        <div className="top-bar-nodes" style={{ display: 'flex', alignItems: 'center', height: '100%', overflowX: 'auto', padding: '0 16px', maxWidth: '100%' }}>
          {showNodes()}
        </div>

        <div style={{ display: 'flex', gap: 16 }}>
          <button 
            style={{ 
              background: 'var(--bg-panel-light)', 
              color: 'var(--text)',
              padding: 12,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '3px solid var(--border-dark)',
              boxShadow: '0 4px 0 var(--border-dark)',
              cursor: 'pointer'
            }}
            onClick={() => setShowBestiary(true)}
          >
            <Book size={28} />
          </button>
          
          <button 
            style={{ 
              background: 'var(--bg-panel-light)', 
              color: 'var(--text)',
              padding: 12,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '3px solid var(--border-dark)',
              boxShadow: '0 4px 0 var(--border-dark)',
              cursor: 'pointer'
            }}
            onClick={() => setShowSettings(true)}
          >
            <Settings size={28} />
          </button>
        </div>
      </div>
      
      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
      {showBestiary && <BestiaryModal onClose={() => setShowBestiary(false)} />}
    </>
  );
}
