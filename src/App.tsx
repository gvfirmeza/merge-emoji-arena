import { useState, useEffect } from 'react';
import { useGameStore } from './store/gameStore';
import TopBar from './components/TopBar';
import LeftPanel from './components/LeftPanel';
import MergeBoard from './components/MergeBoard';
import RightPanel from './components/RightPanel';
import RewardOfferPopup, { type RewardType } from './components/RewardOfferPopup';
import { AudioSystem } from './utils/audio';

function App() {
  const incrementTimePlayed = useGameStore(state => state.incrementTimePlayed);
  const [offer, setOffer] = useState<RewardType | null>(null);

  useEffect(() => {
    const initAudio = () => { 
      AudioSystem.init(); 
      window.removeEventListener('click', initAudio); 
    };
    window.addEventListener('click', initAudio);

    const timer = setInterval(() => {
      incrementTimePlayed();
    }, 1000);

    // Reward Offer Interval
    const rewardTimer = setInterval(() => {
      setOffer(prev => {
        if (prev) return prev; // Don't override if one is already showing
        const rewards: RewardType[] = ['2x_gold', 'instant_gold', 'shop_boost'];
        return rewards[Math.floor(Math.random() * rewards.length)];
      });
    }, 30000);

    return () => {
      clearInterval(timer);
      clearInterval(rewardTimer);
    };
  }, [incrementTimePlayed]);

  return (
    <div className="layout-container">
      <TopBar />
      <LeftPanel />
      <MergeBoard />
      <RightPanel />
      {offer && <RewardOfferPopup offer={offer} onClose={() => setOffer(null)} />}
    </div>
  );
}

export default App;
