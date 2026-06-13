import { useState, useEffect } from 'react';
import { useGameStore } from './store/gameStore';
import TopBar from './components/TopBar';
import LeftPanel from './components/LeftPanel';
import MergeBoard from './components/MergeBoard';
import RightPanel from './components/RightPanel';
import RewardOfferPopup, { type RewardType } from './components/RewardOfferPopup';
import PortraitOverlay from './components/PortraitOverlay';
import TutorialOverlay from './components/TutorialOverlay';
import { AudioSystem } from './utils/audio';
import { MotionConfig } from 'framer-motion';

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
  const stage = useGameStore(state => state.stage);
  const [offer, setOffer] = useState<RewardType | null>(null);
  const { scale, isPortrait } = useGameScale();

  useEffect(() => {
    if (stage > 1 && stage % 5 === 0) {
      const bridge = (window as any).bridge;
      if (bridge && bridge.advertisement && bridge.advertisement.isInterstitialSupported) {
         bridge.advertisement.showInterstitial();
      }
    }
  }, [stage]);

  useEffect(() => {
    const bridge = (window as any).bridge;
    if (bridge) {
      bridge.initialize()
        .then(() => {
          console.log("Playgama Bridge initialized");
          bridge.platform.sendMessage("game_ready");
          
          bridge.platform.on('audio_state_changed', (isEnabled: boolean) => {
            AudioSystem.setMuted(!isEnabled);
          });
          
          // Global pause handler (Required by Playgama QA for overlays and ads)
          bridge.platform.on('pause_state_changed', (state: any) => {
             const isPaused = state === true || state === 'paused';
             useGameStore.getState().setPaused(isPaused);
          });

          // Load Playgama storage
          bridge.storage.get('game_save')
            .then((data: any) => {
              if (data && typeof data === 'string') {
                try {
                  const parsed = JSON.parse(data);
                  useGameStore.setState(parsed);
                } catch(e) {
                  console.warn("Failed to parse Playgama save", e);
                }
              }
            })
            .catch((e: any) => console.warn("Playgama load error", e));
        })
        .catch((e: any) => console.error("Bridge init error", e));
    }

    const initAudio = () => { 
      AudioSystem.init(); 
      window.removeEventListener('click', initAudio); 
    };
    window.addEventListener('click', initAudio);

    const timer = setInterval(() => {
      if (!useGameStore.getState().isPaused) {
        incrementTimePlayed();
      }
    }, 1000);

    // Reward Offer Interval
    const rewardTimer = setInterval(() => {
      setOffer(prev => {
        if (prev) return prev; // Don't override if one is already showing
        const rewards: RewardType[] = ['2x_gold', 'instant_gold', 'upgrade_all'];
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
    <MotionConfig transformPagePoint={(p) => ({ x: p.x / scale, y: p.y / scale })}>
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
            maxWidth: 'none', 
            padding: 16
          }}
        >
          <TopBar />
          <LeftPanel />
          <MergeBoard />
          <RightPanel />
          {offer && <RewardOfferPopup offer={offer} onClose={() => setOffer(null)} />}
          <TutorialOverlay />
        </div>
      </div>
    </MotionConfig>
  );
}

export default App;
