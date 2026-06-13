import { useState, useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import { motion, AnimatePresence } from 'framer-motion';

export default function TutorialOverlay() {
  const store = useGameStore();
  
  const [step, setStep] = useState<'init' | 'buy1' | 'buy2' | 'merge' | 'deploy' | 'finished' | 'completed'>('init');
  const [targetRects, setTargetRects] = useState<{x: number, y: number, w: number, h: number}[]>([]);

  useEffect(() => {
    // If completed or returning player, skip
    if (store.stats.totalEnemiesDefeated > 0 && !store.tutorialCompleted) {
      useGameStore.setState({ tutorialCompleted: true });
    }
    if (store.tutorialCompleted) {
      setStep('completed');
      return;
    } else if (step === 'completed' || step === 'init') {
      setStep('buy1');
    }
  }, [store.stats.totalEnemiesDefeated, store.tutorialCompleted, step]);

  useEffect(() => {
    if (step === 'completed') return;

    // State machine logic based on store
    const numUnitsBoard = store.board.filter(u => u !== null).length;
    const numUnitsLanes = store.lanes.filter(u => u !== null).length;
    const hasLevel2 = store.board.some(u => u && u.level >= 2) || store.highestUnlockedLevel >= 2;

    if (step === 'buy1' && numUnitsBoard >= 1) setStep('buy2');
    if (step === 'buy2' && numUnitsBoard >= 2) setStep('merge');
    if (step === 'merge' && hasLevel2) setStep('deploy');
    if (step === 'deploy' && numUnitsLanes >= 1) setStep('finished');

  }, [store.board, store.lanes, store.highestUnlockedLevel, step]);

  useEffect(() => {
    if (step === 'completed' || step === 'init' || step === 'finished') return;

    // Re-measure rects
    const measure = () => {
      const container = document.querySelector('.layout-container') as HTMLElement;
      if (!container) return;
      const cRect = container.getBoundingClientRect();
      const scale = cRect.width / container.offsetWidth;

      const getRect = (el: Element) => {
        const r = el.getBoundingClientRect();
        return {
          x: (r.left - cRect.left) / scale,
          y: (r.top - cRect.top) / scale,
          w: r.width / scale,
          h: r.height / scale
        };
      };

      let targets: Element[] = [];
      if (step === 'buy1' || step === 'buy2') {
        const btn = document.querySelector('.buy-unit-btn');
        if (btn) targets = [btn];
      } else if (step === 'merge') {
        targets = Array.from(document.querySelectorAll('.board-slot-filled')).slice(0, 2);
      } else if (step === 'deploy') {
        const boardUnit = document.querySelector('.board-slot-filled');
        const laneSlot = document.querySelector('.lane-slot-empty');
        if (boardUnit) targets.push(boardUnit);
        if (laneSlot) targets.push(laneSlot);
      }
      
      setTargetRects(targets.map(getRect));
    };

    measure();
    const interval = setInterval(measure, 100); // Continuous measurement for animations
    return () => clearInterval(interval);
  }, [step, store.board, store.lanes]);

  // Click interceptor
  useEffect(() => {
    if (step === 'completed' || step === 'init' || step === 'finished') return;

    const handler = (e: MouseEvent | TouchEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('.tutorial-skip')) return;

      let allowed = false;
      if (step === 'buy1' || step === 'buy2') {
        allowed = !!target.closest('.buy-unit-btn');
      } else if (step === 'merge') {
        allowed = !!target.closest('.board-slot-filled');
      } else if (step === 'deploy') {
        allowed = !!target.closest('.board-slot-filled') || !!target.closest('.lane-slot-empty');
      }

      if (!allowed) {
        e.stopPropagation();
        e.preventDefault();
      }
    };

    document.addEventListener('click', handler, true);
    document.addEventListener('touchstart', handler, { capture: true, passive: false });
    document.addEventListener('mousedown', handler, { capture: true, passive: false });
    return () => {
      document.removeEventListener('click', handler, true);
      document.removeEventListener('touchstart', handler, { capture: true });
      document.removeEventListener('mousedown', handler, { capture: true });
    };
  }, [step]);

  if (step === 'completed' || step === 'init') return null;

  const handleSkip = () => {
    useGameStore.setState({ tutorialCompleted: true });
  };

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 10000, pointerEvents: 'none' }}>
      
      {/* Skip Button */}
      <button 
        className="tutorial-skip"
        onClick={handleSkip}
        style={{
          position: 'absolute', top: 16, right: 16, zIndex: 10001, pointerEvents: 'auto',
          background: 'rgba(0,0,0,0.5)', color: 'white', border: '2px solid rgba(255,255,255,0.2)',
          padding: '8px 16px', borderRadius: 20, cursor: 'pointer', fontWeight: 'bold'
        }}
      >
        Skip Tutorial
      </button>

      {/* SVG Mask */}
      {step !== 'finished' && (
        <svg width="100%" height="100%" style={{ position: 'absolute', top: 0, left: 0 }}>
          <defs>
            <mask id="tutorial-hole">
              <rect width="100%" height="100%" fill="white" />
              {targetRects.map((r, i) => (
                <rect key={i} x={r.x - 8} y={r.y - 8} width={r.w + 16} height={r.h + 16} rx={16} fill="black" />
              ))}
            </mask>
          </defs>
          <rect width="100%" height="100%" fill="rgba(0,0,0,0.6)" mask="url(#tutorial-hole)" />
        </svg>
      )}

      {/* Tooltips */}
      <AnimatePresence mode="wait">
        {step === 'buy1' && targetRects[0] && (
          <motion.div key="buy1" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            style={{ position: 'absolute', top: targetRects[0].y - 50, left: targetRects[0].x + targetRects[0].w / 2, transform: 'translateX(-50%)', background: 'white', color: 'black', padding: '8px 16px', borderRadius: 12, fontWeight: 'bold', whiteSpace: 'nowrap' }}>
            👆 Buy your first unit
          </motion.div>
        )}
        {step === 'buy2' && targetRects[0] && (
          <motion.div key="buy2" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            style={{ position: 'absolute', top: targetRects[0].y - 50, left: targetRects[0].x + targetRects[0].w / 2, transform: 'translateX(-50%)', background: 'white', color: 'black', padding: '8px 16px', borderRadius: 12, fontWeight: 'bold', whiteSpace: 'nowrap' }}>
            👆 Buy another unit
          </motion.div>
        )}
        {step === 'merge' && targetRects.length === 2 && (
          <motion.div key="merge" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            style={{ position: 'absolute', top: Math.min(targetRects[0].y, targetRects[1].y) - 50, left: (targetRects[0].x + targetRects[1].x) / 2, transform: 'translateX(-50%)', background: 'white', color: 'black', padding: '8px 16px', borderRadius: 12, fontWeight: 'bold', whiteSpace: 'nowrap' }}>
            ✨ Drag one unit onto the other to merge
          </motion.div>
        )}
        {step === 'deploy' && targetRects.length === 2 && (
          <motion.div key="deploy" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            style={{ position: 'absolute', top: Math.min(targetRects[0].y, targetRects[1].y) - 50, left: (targetRects[0].x + targetRects[1].x) / 2, transform: 'translateX(-50%)', background: 'white', color: 'black', padding: '8px 16px', borderRadius: 12, fontWeight: 'bold', whiteSpace: 'nowrap' }}>
            ⚔️ Drag your unit into battle
          </motion.div>
        )}
      </AnimatePresence>

      {/* Finished Modal */}
      {step === 'finished' && (
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'auto' }}>
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            style={{ background: 'var(--bg-panel)', padding: 32, borderRadius: 24, textAlign: 'center', border: '4px solid var(--gold)', maxWidth: 400 }}>
            <h2 style={{ margin: '0 0 16px 0', fontSize: '2rem' }}>🎉 You're ready!</h2>
            <p style={{ margin: '0 0 24px 0', fontSize: '1.1rem', color: 'var(--text-dim)' }}>
              Merge stronger units and defeat enemies to earn more gold.
            </p>
            <button onClick={handleSkip}
              style={{ background: 'var(--green)', color: 'var(--bg-dark)', border: 'none', padding: '12px 32px', borderRadius: 12, fontSize: '1.2rem', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 0 #04a179' }}>
              Let's Go
            </button>
          </motion.div>
        </div>
      )}

      {/* Pulse effect for targets */}
      {step !== 'finished' && targetRects.map((r, i) => (
        <motion.div key={i}
          animate={{ boxShadow: ['0 0 0 0px rgba(255,255,255,0.8)', '0 0 0 20px rgba(255,255,255,0)'] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          style={{ position: 'absolute', left: r.x - 8, top: r.y - 8, width: r.w + 16, height: r.h + 16, borderRadius: 16 }}
        />
      ))}

      {/* Arrow for merge and deploy */}
      {step === 'merge' && targetRects.length === 2 && (
        <svg width="100%" height="100%" style={{ position: 'absolute', top: 0, left: 0 }}>
          <motion.path 
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 1, repeat: Infinity }}
            d={`M ${targetRects[0].x + targetRects[0].w/2} ${targetRects[0].y + targetRects[0].h/2} L ${targetRects[1].x + targetRects[1].w/2} ${targetRects[1].y + targetRects[1].h/2}`}
            stroke="white" strokeWidth="4" strokeDasharray="8 8" fill="none"
          />
        </svg>
      )}
      {step === 'deploy' && targetRects.length === 2 && (
        <svg width="100%" height="100%" style={{ position: 'absolute', top: 0, left: 0 }}>
          <motion.path 
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 1, repeat: Infinity }}
            d={`M ${targetRects[0].x + targetRects[0].w/2} ${targetRects[0].y + targetRects[0].h/2} L ${targetRects[1].x + targetRects[1].w/2} ${targetRects[1].y + targetRects[1].h/2}`}
            stroke="white" strokeWidth="4" strokeDasharray="8 8" fill="none"
          />
        </svg>
      )}
    </div>
  );
}
