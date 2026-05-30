import React from 'react';
import { useGameStore } from '../store/gameStore';
import { UNIT_DATA, MAX_UNIT_LEVEL, formatNumber } from '../utils/constants';

export default function LeftPanel() {
  const { highestUnlockedLevel, shopLevel } = useGameStore();

  const levels = Array.from({ length: MAX_UNIT_LEVEL }, (_, i) => i + 1);

  return (
    <div className="panel" style={{ gridArea: 'left', overflow: 'hidden' }}>
      <div className="panel-header">Evolution Tree</div>
      <div style={{
        flex: 1, 
        overflowY: 'auto',
        padding: '24px 20px',
        display: 'flex',
        flexDirection: 'column',
        gap: 16
      }}>
        {levels.map((level) => {
          const unit = UNIT_DATA[level];
          const isUnlocked = level <= highestUnlockedLevel;
          const isCurrentShop = level === shopLevel;
          
          return (
            <div key={level} style={{
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              background: isCurrentShop ? 'var(--gold)' : isUnlocked ? 'var(--bg-panel-light)' : 'rgba(0,0,0,0.1)',
              border: 'var(--border-width) solid var(--border-dark)',
              borderRadius: 'var(--radius-md)',
              padding: '10px 14px',
              opacity: isUnlocked ? 1 : 0.6,
              filter: isUnlocked ? 'none' : 'grayscale(80%) opacity(0.8)',
              boxShadow: '0 4px 0 var(--border-dark)',
              transform: isCurrentShop ? 'scale(1.02)' : 'none',
              position: 'relative'
            }}>
              <div style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 56,
                height: 56,
                borderRadius: 'var(--radius-sm)',
                background: 'rgba(0,0,0,0.15)',
                border: '3px solid rgba(0,0,0,0.1)'
              }}>
                <span className="emoji-sm" style={{ fontSize: '1.8rem' }}>{isUnlocked ? unit?.emoji : '❓'}</span>
              </div>
              
              <div style={{ flex: 1 }}>
                <div style={{ 
                  fontWeight: 'bold', 
                  fontSize: '1.2rem', 
                  color: isCurrentShop ? 'var(--border-dark)' : 'var(--text)',
                  lineHeight: '1.2'
                }}>
                  Level {level}
                </div>
                <div style={{ 
                  color: isCurrentShop ? '#a04000' : 'var(--accent-hover)', 
                  fontSize: '1rem', 
                  fontWeight: '800' 
                }}>
                  {isUnlocked ? `${formatNumber(unit?.dps || 0)} DPS` : '??? DPS'}
                </div>
              </div>

              {isCurrentShop && (
                <div style={{
                  position: 'absolute',
                  top: -12, right: -10,
                  background: 'var(--accent)',
                  color: 'white',
                  fontSize: '0.8rem',
                  fontWeight: 'bold',
                  padding: '4px 10px',
                  borderRadius: '12px',
                  border: '3px solid var(--border-dark)',
                  boxShadow: '0 2px 0 var(--border-dark)',
                  textTransform: 'uppercase',
                  transform: 'rotate(10deg)'
                }}>Shop</div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  );
}
