import { useEffect, useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { X, Coins, Zap, ArrowUpCircle } from 'lucide-react';
import { getShopCost, MAX_UNIT_LEVEL, formatNumber } from '../utils/constants';

export default function RewardsModal({ onClose }: { onClose: () => void }) {
  const { boosts, shopLevel, activateDoubleGold, activateShopBoost, claimInstantGold } = useGameStore();
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const isDoubleGoldActive = boosts.doubleGoldUntil ? now < boosts.doubleGoldUntil : false;
  const doubleGoldRemaining = isDoubleGoldActive ? Math.ceil((boosts.doubleGoldUntil! - now) / 1000) : 0;

  const isShopBoostActive = boosts.shopBoostUntil ? now < boosts.shopBoostUntil : false;
  const shopBoostRemaining = isShopBoostActive ? Math.ceil((boosts.shopBoostUntil! - now) / 1000) : 0;

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const effectiveShopLevel = isShopBoostActive ? Math.min(MAX_UNIT_LEVEL, shopLevel + 1) : shopLevel;
  const instantGoldAmount = getShopCost(effectiveShopLevel) * 20;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.8)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, backdropFilter: 'blur(5px)'
    }}>
      <div className="panel animate-pop" style={{ width: 450, padding: 24, gap: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Zap color="var(--gold)" size={28} />
            <h2 style={{ margin: 0, color: 'var(--text)', fontSize: '1.5rem' }}>Bonus Rewards</h2>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', color: 'var(--text-dim)', padding: 8 }}>
            <X size={28} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* 2x Gold Card */}
          <div style={{
            background: isDoubleGoldActive ? 'var(--gold)' : 'var(--bg-panel-light)',
            padding: 16, borderRadius: 16, border: '2px solid var(--border-dark)',
            display: 'flex', alignItems: 'center', gap: 16,
            boxShadow: '0 4px 0 var(--border-dark)'
          }}>
            <div style={{ width: 50, height: 50, background: 'rgba(0,0,0,0.2)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Coins size={32} color={isDoubleGoldActive ? 'white' : 'var(--gold)'} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 'bold', fontSize: '1.1rem', color: isDoubleGoldActive ? '#8a6200' : 'var(--text)' }}>2x Gold Output</div>
              <div style={{ fontSize: '0.9rem', color: isDoubleGoldActive ? 'rgba(0,0,0,0.6)' : 'var(--text-dim)' }}>
                {isDoubleGoldActive ? `${formatTime(doubleGoldRemaining)} remaining` : 'Double gold from enemies for 5 minutes.'}
              </div>
            </div>
            <button 
              disabled={isDoubleGoldActive}
              onClick={() => activateDoubleGold()}
              style={{
                background: isDoubleGoldActive ? 'rgba(0,0,0,0.2)' : 'var(--accent)',
                color: 'white', border: 'none', padding: '8px 16px', borderRadius: 8,
                fontWeight: 'bold', cursor: isDoubleGoldActive ? 'not-allowed' : 'pointer',
                boxShadow: isDoubleGoldActive ? 'none' : '0 4px 0 rgba(0,0,0,0.2)'
              }}
            >
              {isDoubleGoldActive ? 'Active' : 'Activate'}
            </button>
          </div>

          {/* Instant Gold Card */}
          <div style={{
            background: 'var(--bg-panel-light)',
            padding: 16, borderRadius: 16, border: '2px solid var(--border-dark)',
            display: 'flex', alignItems: 'center', gap: 16,
            boxShadow: '0 4px 0 var(--border-dark)'
          }}>
            <div style={{ width: 50, height: 50, background: 'rgba(0,0,0,0.2)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Coins size={32} color="var(--blue)" />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 'bold', fontSize: '1.1rem', color: 'var(--text)' }}>Instant Wealth</div>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-dim)' }}>
                Instantly gain +{formatNumber(instantGoldAmount)} Gold.
              </div>
            </div>
            <button 
              onClick={() => claimInstantGold()}
              style={{
                background: 'var(--blue)',
                color: 'white', border: 'none', padding: '8px 16px', borderRadius: 8,
                fontWeight: 'bold', cursor: 'pointer',
                boxShadow: '0 4px 0 rgba(0,0,0,0.2)'
              }}
            >
              Claim
            </button>
          </div>

          {/* Shop Boost Card */}
          <div style={{
            background: isShopBoostActive ? '#a855f7' : 'var(--bg-panel-light)',
            padding: 16, borderRadius: 16, border: '2px solid var(--border-dark)',
            display: 'flex', alignItems: 'center', gap: 16,
            boxShadow: '0 4px 0 var(--border-dark)'
          }}>
            <div style={{ width: 50, height: 50, background: 'rgba(0,0,0,0.2)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ArrowUpCircle size={32} color={isShopBoostActive ? 'white' : '#a855f7'} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 'bold', fontSize: '1.1rem', color: isShopBoostActive ? 'white' : 'var(--text)' }}>Shop Boost</div>
              <div style={{ fontSize: '0.9rem', color: isShopBoostActive ? 'rgba(255,255,255,0.7)' : 'var(--text-dim)' }}>
                {isShopBoostActive ? `${formatTime(shopBoostRemaining)} remaining` : '+1 Shop Level for 5 minutes.'}
              </div>
            </div>
            <button 
              disabled={isShopBoostActive}
              onClick={() => activateShopBoost()}
              style={{
                background: isShopBoostActive ? 'rgba(0,0,0,0.2)' : '#a855f7',
                color: 'white', border: 'none', padding: '8px 16px', borderRadius: 8,
                fontWeight: 'bold', cursor: isShopBoostActive ? 'not-allowed' : 'pointer',
                boxShadow: isShopBoostActive ? 'none' : '0 4px 0 rgba(0,0,0,0.2)'
              }}
            >
              {isShopBoostActive ? 'Active' : 'Activate'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
