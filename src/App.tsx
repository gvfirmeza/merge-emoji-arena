import { useState, useEffect } from 'react';
import { useGameStore } from './store/gameStore';
import TopBar from './components/TopBar';
import LeftPanel from './components/LeftPanel';
import MergeBoard from './components/MergeBoard';
import RightPanel from './components/RightPanel';
import RewardOfferPopup, { type RewardType } from './components/RewardOfferPopup';
import PortraitOverlay from './components/PortraitOverlay';
import { AudioSystem } from './utils/audio';

function useGameScale() {
  const [scale, setScale] = useState(1);
  const [isPortrait, setIsPortrait] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      setIsPortrait(h > w);
      
      // Calculate scale to ensure BOTH 1200px width and 850px height fit perfectly
      const scaleX = w < 1200 ? w / 1200 : 1;
      const scaleY = h < 850 ? h / 850 : 1;
      
      setScale(Math.min(scaleX, scaleY));
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return { scale, isPortrait };
}

function App() {
  const incrementTimePlayed = useGameStore(state => state.incrementTimePlayed);
  const [offer, setOffer] = useState<RewardType | null>(null);
  const { scale, isPortrait } = useGameScale();

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

  if (isPortrait) {
    return <PortraitOverlay />;
  }

  return (
    <div style={{
      width: '100vw', height: '100vh',
      overflow: 'hidden', background: 'var(--bg-dark)'
    }}>
      <div 
        className="layout-container"
        style={{
          width: `${100 / scale}%`,
          height: `${100 / scale}%`,
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
          maxWidth: 'none', // Remove the CSS max-width constraint while scaling
          padding: 16
        }}
      >
        <TopBar />
        <LeftPanel />
        <MergeBoard />
        <RightPanel />
        {offer && <RewardOfferPopup offer={offer} onClose={() => setOffer(null)} />}
      </div>
    </div>
  );
}

export default App;
