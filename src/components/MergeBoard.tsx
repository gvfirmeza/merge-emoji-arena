import { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { getShopCost, UNIT_DATA, BOARD_SIZE, formatNumber } from '../utils/constants';
import { AudioSystem } from '../utils/audio';
import { motion } from 'framer-motion';
import type { PanInfo } from 'framer-motion';
import UnitBadge from './UnitBadge';

export default function MergeBoard() {
  const store = useGameStore();
  const cost = getShopCost(store.shopLevel);
  const canBuy = store.gold >= cost && store.board.some(u => u === null);
  const [activeDragIndex, setActiveDragIndex] = useState<number | null>(null);

  const handleBuy = () => {
    if (canBuy) {
      AudioSystem.playSound('pop', store.settings.sfxVolume);
      store.buyUnit();
    } else {
      AudioSystem.playSound('error', store.settings.sfxVolume);
    }
  };

  const handleDragEnd = (_e: MouseEvent | TouchEvent | PointerEvent, info: PanInfo, sourceIndex: number) => {
    setActiveDragIndex(null);
    const elements = document.elementsFromPoint(info.point.x, info.point.y);
    
    // check if over board
    const targetBoardEl = elements.find(el => el.hasAttribute('data-board-index'));
    if (targetBoardEl) {
      const targetIndex = parseInt(targetBoardEl.getAttribute('data-board-index') || '-1');
      if (targetIndex !== -1 && targetIndex !== sourceIndex) {
        const sourceUnit = store.board[sourceIndex];
        const targetUnit = store.board[targetIndex];
        
        if (sourceUnit && targetUnit && sourceUnit.level === targetUnit.level) {
          AudioSystem.playSound('merge', store.settings.sfxVolume);
          store.mergeBoardUnits(sourceIndex, targetIndex);
        } else {
          AudioSystem.playSound('pop', store.settings.sfxVolume * 0.5);
          store.moveBoardUnit(sourceIndex, targetIndex);
        }
      }
      return;
    }
    
    // check if over lane
    const targetLaneEl = elements.find(el => el.hasAttribute('data-lane-index'));
    if (targetLaneEl) {
      const targetLaneIndex = parseInt(targetLaneEl.getAttribute('data-lane-index') || '-1');
      // Block adding unit to dead enemy's lane
      if (targetLaneIndex !== -1) {
        const sourceUnit = store.board[sourceIndex];
        const targetUnit = store.lanes[targetLaneIndex];
        
        if (sourceUnit && targetUnit && sourceUnit.level === targetUnit.level && sourceUnit.level < 12) {
          AudioSystem.playSound('merge', store.settings.sfxVolume);
          store.assignToLane(sourceIndex, targetLaneIndex);
          setTimeout(() => {
            const laneUnitEl = document.getElementById(`lane-unit-${targetLaneIndex}`);
            if (laneUnitEl) {
              laneUnitEl.style.animation = 'none';
              void laneUnitEl.offsetHeight;
              laneUnitEl.style.animation = 'merge-wobble 0.5s ease-out';
            }
          }, 50);
        } else {
          AudioSystem.playSound('pop', store.settings.sfxVolume);
          store.assignToLane(sourceIndex, targetLaneIndex);
        }
      }
    }
  };

  return (
    <div className="panel" style={{ gridArea: 'center', position: 'relative', zIndex: activeDragIndex !== null ? 100 : 1 }}>
      <div className="panel-header" style={{ textAlign: 'center' }}>Merge Board</div>
      
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gridTemplateRows: 'repeat(3, 1fr)',
          gap: 16,
          width: '100%',
          maxWidth: 450,
          aspectRatio: '1/1',
          background: 'rgba(0,0,0,0.2)',
          padding: 20,
          borderRadius: 36,
          border: 'var(--border-width) solid var(--border-dark)',
          boxShadow: 'inset 0 8px 0 rgba(0,0,0,0.4), 0 4px 0 rgba(255,255,255,0.05)'
        }}>
          {store.board.slice(0, BOARD_SIZE).map((unit, index) => {
            return (
              <div 
                key={index}
                data-board-index={index}
                style={{
                  background: 'var(--bg-panel-light)',
                  borderRadius: 24,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: 'var(--border-width) solid var(--border-dark)',
                  boxShadow: 'inset 0 4px 0 rgba(255,255,255,0.1), 0 4px 0 rgba(0,0,0,0.4)',
                  position: 'relative'
                }}
              >
                {unit && (
                  <motion.div
                    key={unit.id}
                    drag
                    dragSnapToOrigin
                    dragElastic={0.2}
                    onDragStart={() => setActiveDragIndex(index)}
                    onDragEnd={(e, info) => handleDragEnd(e, info, index)}
                    whileDrag={{ scale: 1.25, zIndex: 100, filter: 'drop-shadow(0 15px 15px rgba(0,0,0,0.6))' }}
                    layoutId={unit.id}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.5, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    style={{
                      width: '100%',
                      height: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'grab',
                      position: 'relative',
                      zIndex: activeDragIndex === index ? 100 : 10,
                      userSelect: 'none',
                      touchAction: 'none'
                    }}
                  >
                    <UnitBadge level={unit.level} />
                    <span className="emoji-lg">{UNIT_DATA[unit.level]?.emoji}</span>
                  </motion.div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Shop Area */}
      <div style={{ 
        padding: '24px', 
        background: 'rgba(0,0,0,0.15)',
        borderTop: 'var(--border-width) solid var(--border-dark)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 16,
        borderRadius: '0 0 calc(var(--radius-lg) - 4px) calc(var(--radius-lg) - 4px)'
      }}>
        <button 
          className="btn-primary" 
          disabled={!canBuy}
          onClick={handleBuy}
          style={{
            width: '100%',
            maxWidth: 400,
            height: 80,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 24px',
            borderRadius: 40
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '0.9rem', opacity: 0.8 }}>Buy Lv {store.shopLevel} Unit</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '1.5rem', marginTop: 4 }}>
              <span className="emoji-md" style={{ fontSize: '1.2rem'}}>{UNIT_DATA[store.shopLevel]?.emoji}</span>
              - {formatNumber(cost)} Gold
            </span>
          </div>
          
          <div style={{ 
            background: 'rgba(255,255,255,0.2)', 
            width: 50, height: 50, 
            borderRadius: '50%', 
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.5rem',
            boxShadow: 'inset 0 2px 0 rgba(0,0,0,0.2)'
          }}>
            +
          </div>
        </button>
      </div>
    </div>
  );
}
