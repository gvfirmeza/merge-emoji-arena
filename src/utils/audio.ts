export class AudioSystem {
  private static ctx: AudioContext | null = null;
  public static muted = false;

  static setMuted(muted: boolean) {
    this.muted = muted;
    if (this.ctx) {
      if (muted && this.ctx.state === 'running') {
        this.ctx.suspend();
      } else if (!muted && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
    }
  }

  static init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }

  static getContext() {
    this.init();
    return this.ctx!;
  }

  static playSound(type: 'pop' | 'merge' | 'hit' | 'coin' | 'error', volumeScale = 1) {
    if (this.muted) return;
    try {
      const ctx = this.getContext();
      if (ctx.state === 'suspended') ctx.resume();

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      const now = ctx.currentTime;

      switch (type) {
        case 'pop':
          osc.type = 'sine';
          osc.frequency.setValueAtTime(400, now);
          osc.frequency.exponentialRampToValueAtTime(600, now + 0.1);
          gain.gain.setValueAtTime(0.5 * volumeScale, now);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
          osc.start(now);
          osc.stop(now + 0.1);
          break;

        case 'merge':
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(300, now);
          osc.frequency.exponentialRampToValueAtTime(800, now + 0.2);
          osc.frequency.exponentialRampToValueAtTime(1200, now + 0.3);
          gain.gain.setValueAtTime(0.6 * volumeScale, now);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
          osc.start(now);
          osc.stop(now + 0.3);
          break;

        case 'hit':
          osc.type = 'square';
          osc.frequency.setValueAtTime(150, now);
          osc.frequency.exponentialRampToValueAtTime(50, now + 0.1);
          gain.gain.setValueAtTime(0.3 * volumeScale, now);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
          osc.start(now);
          osc.stop(now + 0.1);
          break;

        case 'coin':
          osc.type = 'sine';
          osc.frequency.setValueAtTime(1200, now);
          osc.frequency.setValueAtTime(1600, now + 0.05);
          gain.gain.setValueAtTime(0.4 * volumeScale, now);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
          osc.start(now);
          osc.stop(now + 0.2);
          break;

        case 'error':
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(200, now);
          osc.frequency.linearRampToValueAtTime(100, now + 0.2);
          gain.gain.setValueAtTime(0.4 * volumeScale, now);
          gain.gain.linearRampToValueAtTime(0.01, now + 0.2);
          osc.start(now);
          osc.stop(now + 0.2);
          break;
      }
    } catch (e) {
      console.warn("Audio play failed", e);
    }
  }
}
