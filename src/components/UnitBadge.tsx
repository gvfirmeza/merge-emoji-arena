import { useEffect, useState } from 'react';

interface UnitBadgeProps {
  level: number;
}

export default function UnitBadge({ level }: UnitBadgeProps) {
  const [justLeveled, setJustLeveled] = useState(false);
  
  useEffect(() => {
    setJustLeveled(true);
    const t = setTimeout(() => setJustLeveled(false), 300);
    return () => clearTimeout(t);
  }, [level]);

  let bgColor = 'var(--text-dim, #94a3b8)'; // Gray 1-10
  if (level > 10) bgColor = 'var(--green, #22c55e)'; // 11-20
  if (level > 20) bgColor = 'var(--blue, #3b82f6)'; // 21-30
  if (level > 30) bgColor = '#a855f7'; // 31-40 Purple
  if (level > 40) bgColor = 'var(--gold, #eab308)'; // 41-50 Gold

  return (
    <div style={{
      position: 'absolute',
      top: -4,
      left: -4,
      background: bgColor,
      color: 'white',
      padding: '2px 6px',
      borderRadius: '8px',
      fontSize: '0.7rem',
      fontWeight: '900',
      boxShadow: '0 2px 0 rgba(0,0,0,0.5)',
      border: '2px solid rgba(0,0,0,0.2)',
      zIndex: 20,
      transform: justLeveled ? 'scale(1.3)' : 'scale(1)',
      transition: 'transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
      userSelect: 'none',
      pointerEvents: 'none'
    }}>
      LV.{level}
    </div>
  );
}
