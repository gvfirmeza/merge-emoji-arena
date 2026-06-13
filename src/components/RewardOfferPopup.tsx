// No unused imports
import { useGameStore } from '../store/gameStore';
import { getShopCost, formatNumber } from '../utils/constants';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export type RewardType = '2x_gold' | 'instant_gold' | 'upgrade_all';

interface RewardOfferPopupProps {
  offer: RewardType;
  onClose: () => void;
}

export default function RewardOfferPopup({ offer, onClose }: RewardOfferPopupProps) {
  const store = useGameStore();

  const handleClaim = () => {
    const bridge = (window as any).bridge;
    let rewarded = false;

    const grantReward = () => {
      if (offer === '2x_gold') store.activateDoubleGold();
      else if (offer === 'instant_gold') store.claimInstantGold();
      else if (offer === 'upgrade_all') store.upgradeAllUnits();
    };

    if (bridge && bridge.advertisement && bridge.advertisement.isRewardedSupported) {
      bridge.advertisement.showRewarded({
        onRewarded: () => {
          rewarded = true;
          grantReward();
        },
        onClose: () => {
          onClose();
        },
        onError: () => {
          if (!rewarded) grantReward();
          onClose();
        }
      });
    } else {
      grantReward();
      onClose();
    }
  };

  const instantGoldAmount = getShopCost(store.shopLevel) * 20;

  return (
    <div style={{
      position: 'absolute', top: 36, left: 230,
      zIndex: 9999, pointerEvents: 'none'
    }}>
      <AnimatePresence>
        <motion.div
          initial={{ scale: 0.8, opacity: 0, x: -50 }}
          animate={{ scale: 1, opacity: 1, x: 0 }}
          exit={{ scale: 0.8, opacity: 0, x: -50 }}
          style={{
            pointerEvents: 'auto',
            background: 'var(--bg-panel)',
            border: '3px solid var(--gold)',
            borderRadius: 24,
            height: 50,
            boxSizing: 'border-box',
            padding: '0 16px',
            boxShadow: '0 4px 15px rgba(0,0,0,0.5)',
            display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 12
          }}
        >
          <div style={{ fontSize: '1.5rem', filter: 'drop-shadow(0 2px 0 rgba(0,0,0,0.3))' }}>🎁</div>
          
          <div style={{ textAlign: 'left', minWidth: 120 }}>
            <p style={{ margin: 0, color: 'var(--text)', fontSize: '0.9rem', fontWeight: 'bold' }}>
              {offer === '2x_gold' && '2x Gold (5m)'}
              {offer === 'instant_gold' && `+${formatNumber(instantGoldAmount)} Gold`}
              {offer === 'upgrade_all' && '+1 Lvl to All Units'}
            </p>
          </div>

          <button
            onClick={handleClaim}
            style={{
              padding: '6px 12px',
              background: 'var(--green)',
              color: 'var(--bg-dark)',
              border: 'none',
              borderRadius: 8,
              fontSize: '0.9rem',
              fontWeight: 'bold',
              textTransform: 'uppercase',
              boxShadow: '0 3px 0 #04a179',
              cursor: 'pointer'
            }}
          >
            Ad
          </button>
          
          <button 
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-dim)', padding: 4, display: 'flex', cursor: 'pointer' }}
          >
            <X size={16} />
          </button>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
