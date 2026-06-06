import { useState, useEffect, useLayoutEffect } from 'react';
import { useGameStore } from './store/gameStore';
import TopBar from './components/TopBar';
import LeftPanel from './components/LeftPanel';
import MergeBoard from './components/MergeBoard';
import RightPanel from './components/RightPanel';
import RewardOfferPopup, { type RewardType } from './components/RewardOfferPopup';
import PortraitOverlay from './components/PortraitOverlay';
import { AudioSystem } from './utils/audio';

function App() {
  const incrementTimePlayed = useGameStore(state => state.incrementTimePlayed);
  const [offer, setOffer] = useState<RewardType | null>(null);

  const [scale, setScale] = useState(1);
  const [isPortrait, setIsPortrait] = useState(false);
  const [debugDimensions, setDebugDimensions] = useState({ w: 0, h: 0 });

  useLayoutEffect(() => {
    const handleResize = () => {
      const GAME_WIDTH = 1280;
      const GAME_HEIGHT = 720;
      
      const ww = window.innerWidth;
      const wh = window.innerHeight;
      
      setIsPortrait(wh > ww);
      setDebugDimensions({ w: ww, h: wh });
      
      const SAFE_PADDING_W = 64;
      const SAFE_PADDING_H = 64; // Moderate margin on top/bottom (32px each)
      const scaleFactor = Math.min((ww - SAFE_PADDING_W) / GAME_WIDTH, (wh - SAFE_PADDING_H) / GAME_HEIGHT);
      setScale(scaleFactor);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
    }, 3000000); // change here to the rewards appear again

    return () => {
      clearInterval(timer);
      clearInterval(rewardTimer);
    };
  }, [incrementTimePlayed]);

  if (isPortrait) {
    return <PortraitOverlay />;
  }

  const GAME_WIDTH = 1280;
  const GAME_HEIGHT = 720;
  const scaledWidth = GAME_WIDTH * scale;
  const scaledHeight = GAME_HEIGHT * scale;
  const marginH = (debugDimensions.w - scaledWidth) / 2;
  const marginV = (debugDimensions.h - scaledHeight) / 2;

  return (
    <>
      <div style={{ position: 'fixed', top: 10, left: 10, zIndex: 999999, background: 'rgba(0,0,0,0.8)', padding: '10px', borderRadius: '8px', color: '#0f0', fontFamily: 'monospace', fontSize: '12px', pointerEvents: 'none', border: '1px solid #0f0' }}>
        Viewport: {debugDimensions.w}x{debugDimensions.h}<br/>
        Virtual: {GAME_WIDTH}x{GAME_HEIGHT}<br/>
        Scale: {scale.toFixed(4)}<br/>
        Scaled Size: {Math.round(scaledWidth)}x{Math.round(scaledHeight)}<br/>
        Margins: H:{Math.max(0, Math.round(marginH))}px V:{Math.max(0, Math.round(marginV))}px
      </div>
      
      <div style={{ 
        position: 'fixed',
        top: Math.max(0, marginV),
        left: Math.max(0, marginH),
        width: GAME_WIDTH, 
        height: GAME_HEIGHT,
        transform: `scale(${scale})`, 
        transformOrigin: 'top left'
      }}>
        <div className="layout-container">
          <TopBar />
          <LeftPanel />
          <MergeBoard />
          <RightPanel />
          {offer && <RewardOfferPopup offer={offer} onClose={() => setOffer(null)} />}
        </div>
      </div>
    </>
  );
}

export default App;
