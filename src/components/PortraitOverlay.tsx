import { Smartphone } from 'lucide-react';
import { motion } from 'framer-motion';

export default function PortraitOverlay() {
  return (
    <div className="portrait-overlay" style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      background: 'var(--bg-dark)',
      zIndex: 99999,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'var(--text)',
      textAlign: 'center',
      padding: 32,
      gap: 24
    }}>
      <motion.div
        animate={{ rotate: 90 }}
        transition={{ repeat: Infinity, duration: 2, ease: "easeInOut", repeatDelay: 1 }}
        style={{ originX: 0.5, originY: 0.5 }}
      >
        <Smartphone size={100} color="var(--accent)" strokeWidth={1.5} />
      </motion.div>
      <div>
        <h2 style={{ fontSize: '2rem', margin: '0 0 16px', color: 'var(--text)' }}>Please Rotate Your Device</h2>
        <p style={{ fontSize: '1.2rem', color: 'var(--text-dim)', margin: 0 }}>
          Merge Emoji Arena is designed for landscape mode.
        </p>
      </div>
    </div>
  );
}
