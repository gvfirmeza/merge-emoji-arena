// No unused imports
import { useGameStore } from '../store/gameStore';
import { getShopCost, MAX_UNIT_LEVEL, formatNumber } from '../utils/constants';
import { X, Coins, ArrowUpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export type RewardType = '2x_gold' | 'instant_gold' | 'shop_boost';

interface RewardOfferPopupProps {
  offer: RewardType;
  onClose: () => void;
}

export default function RewardOfferPopup({ offer, onClose }: RewardOfferPopupProps) {
  const store = useGameStore();

  const handleClaim = () => {
    // PLAYGAMA INTEGRATION PLACEHOLDER
    // Call Playgama SDK here. On success callback, run the following:
    
    if (offer === '2x_gold') store.activateDoubleGold();
    else if (offer === 'instant_gold') store.claimInstantGold();
    else if (offer === 'shop_boost') store.activateShopBoost();

    onClose();
  };

  const effectiveShopLevel = store.boosts.shopBoostUntil && Date.now() < store.boosts.shopBoostUntil 
    ? Math.min(MAX_UNIT_LEVEL, store.shopLevel + 1) 
    : store.shopLevel;

  const instantGoldAmount = getShopCost(effectiveShopLevel) * 20;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 9999, pointerEvents: 'none' // wrapper doesn't block clicks
    }}>
      <AnimatePresence>
        <motion.div
          initial={{ scale: 0.8, opacity: 0, y: 50 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0, y: 50 }}
          style={{
            pointerEvents: 'auto',
            background: 'var(--bg-panel)',
            border: '3px solid var(--gold)',
            borderRadius: 24,
            padding: 24,
            width: '90%',
            maxWidth: 340,
            boxShadow: '0 10px 25px rgba(0,0,0,0.8), 0 0 0 100vw rgba(0,0,0,0.4)', // Faux backdrop
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16
          }}
        >
          <button 
            onClick={onClose}
            style={{ position: 'absolute', top: 12, right: 12, background: 'transparent', border: 'none', color: 'var(--text-dim)' }}
          >
            <X size={24} />
          </button>

          <div style={{ fontSize: '2.5rem', filter: 'drop-shadow(0 4px 0 rgba(0,0,0,0.3))' }}>🎁</div>
          
          <div style={{ textAlign: 'center' }}>
            <h3 style={{ margin: 0, color: 'var(--gold)', fontSize: '1.2rem', textTransform: 'uppercase', letterSpacing: 1 }}>Bonus Reward</h3>
            <p style={{ margin: '8px 0 0', color: 'var(--text)', fontSize: '1.1rem', fontWeight: 'bold' }}>
              {offer === '2x_gold' && '2x Gold for 5 Minutes'}
              {offer === 'instant_gold' && `+${formatNumber(instantGoldAmount)} Instant Gold`}
              {offer === 'shop_boost' && '+1 Shop Level for 5 Minutes'}
            </p>
          </div>

          <div style={{
            background: 'rgba(0,0,0,0.2)', padding: 16, borderRadius: 16, width: '100%',
            display: 'flex', justifyContent: 'center'
          }}>
            {offer === '2x_gold' && <Coins size={48} color="var(--gold)" />}
            {offer === 'instant_gold' && <Coins size={48} color="var(--blue)" />}
            {offer === 'shop_boost' && <ArrowUpCircle size={48} color="#a855f7" />}
          </div>

          <button
            onClick={handleClaim}
            style={{
              width: '100%',
              padding: '16px',
              background: 'var(--green)',
              color: 'var(--bg-dark)',
              border: 'none',
              borderRadius: 12,
              fontSize: '1.2rem',
              fontWeight: 'bold',
              textTransform: 'uppercase',
              letterSpacing: 2,
              boxShadow: '0 6px 0 #04a179',
              cursor: 'pointer'
            }}
          >
            Claim
          </button>

        </motion.div>
      </AnimatePresence>
    </div>
  );
}
