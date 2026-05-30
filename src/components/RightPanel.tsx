import React, { useEffect, useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { UNIT_DATA, formatNumber } from '../utils/constants';
import { AudioSystem } from '../utils/audio';
import { motion } from 'framer-motion';
import type { PanInfo } from 'framer-motion';
import UnitBadge from './UnitBadge';

export default function RightPanel() {
  const store = useGameStore();
  const [activeDragIndex, setActiveDragIndex] = useState<number | null>(null);

  useEffect(() => {
    const attackInterval = setInterval(() => {
      let playedHitSound = false;

      store.lanes.forEach((unit, index) => {
        const enemy = store.enemies[index];
        if (unit && enemy && enemy.hp > 0) {
          const unitEl = document.getElementById(`lane-unit-${index}`);
          if (unitEl) {
            unitEl.style.animation = 'none';
            void unitEl.offsetHeight;
            unitEl.style.animation = 'lunge 0.3s ease-in-out';
          }
          
          setTimeout(() => {
            store.dealDamageToEnemy(index, UNIT_DATA[unit.level]?.dps || 0);
            
            if (!playedHitSound) {
              AudioSystem.playSound('hit', store.settings.sfxVolume * 0.3);
              playedHitSound = true; 
            }
            
            const enemyEl = document.getElementById(`enemy-${index}`);
            if (enemyEl) {
              enemyEl.style.animation = 'none';
              void enemyEl.offsetHeight;
              enemyEl.style.animation = 'enemy-hit 0.3s ease';
            }
          }, 150);
        }
      });
    }, 1000);

    return () => clearInterval(attackInterval);
  }, [store.lanes, store.enemies, store.dealDamageToEnemy, store.settings.sfxVolume]);

  const handleDragEnd = (e: MouseEvent | TouchEvent | PointerEvent, info: PanInfo, sourceIndex: number) => {
    setActiveDragIndex(null);
    const elements = document.elementsFromPoint(info.point.x, info.point.y);
    
    const targetLaneEl = elements.find(el => el.hasAttribute('data-lane-index'));
    if (targetLaneEl) {
      const targetIndex = parseInt(targetLaneEl.getAttribute('data-lane-index') || '-1');
      if (targetIndex !== -1 && targetIndex !== sourceIndex) {
        const sourceUnit = store.lanes[sourceIndex];
        const targetUnit = store.lanes[targetIndex];
        


        if (sourceUnit && targetUnit && sourceUnit.level === targetUnit.level && sourceUnit.level < 12) {
          AudioSystem.playSound('merge', store.settings.sfxVolume);
          store.swapLanes(sourceIndex, targetIndex);
          setTimeout(() => {
            const laneUnitEl = document.getElementById(`lane-unit-${targetIndex}`);
            if (laneUnitEl) {
              laneUnitEl.style.animation = 'none';
              void laneUnitEl.offsetHeight;
              laneUnitEl.style.animation = 'merge-wobble 0.5s ease-out';
            }
          }, 50);
        } else {
          AudioSystem.playSound('pop', store.settings.sfxVolume);
          store.swapLanes(sourceIndex, targetIndex);
        }
      }
      return;
    }

    const targetBoardEl = elements.find(el => el.hasAttribute('data-board-index'));
    if (targetBoardEl) {
      const targetBoardIndex = parseInt(targetBoardEl.getAttribute('data-board-index') || '-1');
      if (targetBoardIndex !== -1) {
        const sourceUnit = store.lanes[sourceIndex];
        const targetUnit = store.board[targetBoardIndex];
        
        if (sourceUnit && targetUnit && sourceUnit.level === targetUnit.level && sourceUnit.level < 12) {
          AudioSystem.playSound('merge', store.settings.sfxVolume);
          store.unassignFromLane(sourceIndex, targetBoardIndex);
          setTimeout(() => {
            const el = document.querySelector(`[data-board-index="${targetBoardIndex}"] > div`);
            if (el) {
              (el as HTMLElement).style.animation = 'none';
              void (el as HTMLElement).offsetHeight;
              (el as HTMLElement).style.animation = 'merge-wobble 0.5s ease-out';
            }
          }, 50);
        } else {
          AudioSystem.playSound('pop', store.settings.sfxVolume * 0.5);
          store.unassignFromLane(sourceIndex, targetBoardIndex);
        }
      }
    }
  };

  return (
    <div className="panel" style={{ gridArea: 'right', display: 'flex', flexDirection: 'column', zIndex: activeDragIndex !== null ? 100 : 1 }}>
      <div className="panel-header" style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span>Battle Area</span>
      </div>
      
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 16, padding: '16px 20px', justifyContent: 'center' }}>
        {store.lanes.map((unit, index) => {
          const enemy = store.enemies[index];
          const isDead = !enemy;
          
          return (
            <div key={index} style={{
              flex: 1,
              maxHeight: 160,
              background: 'var(--bg-panel-light)',
              borderRadius: 32,
              border: 'var(--border-width) solid var(--border-dark)',
              display: 'flex',
              alignItems: 'center',
              padding: '12px 16px',
              boxShadow: '0 6px 0 var(--border-dark)',
              position: 'relative',
              overflow: 'visible'
            }}>
              {/* Lane Slot */}
              <div
                data-lane-index={index}
                style={{
                  width: 90,
                  height: 90,
                  minWidth: 90,
                  flexShrink: 0,
                  borderRadius: 24,
                  background: isDead ? 'rgba(0,0,0,0.1)' : 'rgba(0,0,0,0.2)',
                  border: 'var(--border-width) solid var(--border-dark)',
                  opacity: isDead && !unit ? 0.5 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: 'inset 0 4px 0 rgba(0,0,0,0.4)',
                  position: 'relative'
                }}
              >
                {unit ? (
                  <motion.div
                    key={unit.id}
                    drag
                    dragSnapToOrigin
                    onDragStart={() => setActiveDragIndex(index)}
                    onDragEnd={(e, info) => handleDragEnd(e, info, index)}
                    whileDrag={{ scale: 1.25, zIndex: 100, filter: 'drop-shadow(0 15px 15px rgba(0,0,0,0.6))' }}
                    layoutId={unit.id}
                    style={{
                      width: '100%',
                      height: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'grab',
                      position: 'relative',
                      zIndex: activeDragIndex === index ? 100 : 10,
                      touchAction: 'none'
                    }}
                  >
                    <div id={`lane-unit-${index}`} style={{ position: 'relative' }}>
                      <div style={{
                        position: 'absolute', top: -35, left: '50%', transform: 'translateX(-50%)',
                        color: 'white', fontWeight: 'bold', fontSize: '1.2rem',
                        textShadow: '2px 2px 0 var(--border-dark), -2px -2px 0 var(--border-dark), 2px -2px 0 var(--border-dark), -2px 2px 0 var(--border-dark), 0 4px 0 var(--border-dark)',
                        display: 'flex', alignItems: 'center', gap: 4,
                        whiteSpace: 'nowrap', zIndex: 10
                      }}>
                        {formatNumber(UNIT_DATA[unit.level]?.dps || 0)} <span style={{fontSize: '0.9rem'}}>⚔️</span>
                      </div>
                      <UnitBadge level={unit.level} />
                      <span className="emoji-lg" style={{ fontSize: '3.5rem' }}>
                        {UNIT_DATA[unit.level]?.emoji}
                      </span>
                    </div>
                  </motion.div>
                ) : (
                  <span style={{ color: 'var(--border-dark)', fontSize: '1rem', textTransform: 'uppercase', fontWeight: 'bold', opacity: 0.5 }}>
                    {isDead ? "" : "Slot"}
                  </span>
                )}
              </div>

              {/* Space / Projectiles Area */}
              <div style={{ flex: 1, minWidth: 10 }} />

              {/* Enemy Side */}
              <div style={{
                width: 110,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                height: '100%',
                flexShrink: 0
              }}>
                {enemy ? (
                  <div style={{ zIndex: 15, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                    <div id={`enemy-${index}`} style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: enemy.isBoss ? '5rem' : '4rem',
                      filter: 'drop-shadow(0 6px 0 rgba(0,0,0,0.2))',
                      transformOrigin: 'bottom center'
                    }}>
                      {enemy.emoji}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                      <div style={{
                        color: 'white', fontWeight: 'bold', fontSize: '1rem',
                        textShadow: '2px 2px 0 var(--border-dark), -2px -2px 0 var(--border-dark), 2px -2px 0 var(--border-dark), -2px 2px 0 var(--border-dark), 0 3px 0 var(--border-dark)',
                        display: 'flex', alignItems: 'center', gap: 4
                      }}>
                        {formatNumber(Math.ceil(enemy.hp))} <span style={{fontSize: '0.8rem'}}>❤️</span>
                      </div>
                      <div style={{ width: 80, position: 'relative', height: 16, background: 'var(--bg-dark)', borderRadius: 10, overflow: 'hidden', border: '3px solid var(--border-dark)', boxShadow: '0 2px 0 var(--border-dark)' }}>
                        <div style={{
                          position: 'absolute', top: 0, left: 0, bottom: 0,
                          width: `${Math.max(0, (enemy.hp / enemy.maxHp) * 100)}%`,
                          background: enemy.isBoss ? 'var(--accent)' : 'var(--green)',
                          borderRight: '3px solid var(--border-dark)',
                          transition: 'width 0.2s ease-out'
                        }} />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center', width: 80, height: 80 }}>
                    <div style={{ fontSize: '4.5rem', filter: 'grayscale(50%) opacity(0.8)' }}>
                      🪦
                    </div>
                    <div style={{ position: 'absolute', top: -30, left: '50%', transform: 'translateX(-50%)', fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--gold)', animation: 'emit-coins 1s forwards' }}>
                      +🪙
                    </div>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  );
}
