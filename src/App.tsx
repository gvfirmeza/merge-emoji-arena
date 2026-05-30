import { useEffect } from 'react';
import { useGameStore } from './store/gameStore';
import TopBar from './components/TopBar';
import LeftPanel from './components/LeftPanel';
import MergeBoard from './components/MergeBoard';
import RightPanel from './components/RightPanel';
import { AudioSystem } from './utils/audio';

function App() {
  const incrementTimePlayed = useGameStore(state => state.incrementTimePlayed);

  useEffect(() => {
    const initAudio = () => { 
      AudioSystem.init(); 
      window.removeEventListener('click', initAudio); 
    };
    window.addEventListener('click', initAudio);

    const timer = setInterval(() => {
      incrementTimePlayed();
    }, 1000);

    return () => clearInterval(timer);
  }, [incrementTimePlayed]);

  return (
    <div className="layout-container">
      <TopBar />
      <LeftPanel />
      <MergeBoard />
      <RightPanel />
    </div>
  );
}

export default App;
