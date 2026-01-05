

// A simple synthesizer using Web Audio API to avoid external asset dependencies
class SoundEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private initialized = false;
  private volume: number = 0.3;
  private enabled: boolean = true;

  init() {
    if (this.initialized) return;
    try {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = this.volume;
      this.masterGain.connect(this.ctx.destination);
      this.initialized = true;
    } catch (e) {
      console.error("Web Audio API not supported", e);
    }
  }

  setVolume(val: number) {
    this.volume = val;
    if (this.masterGain) {
      this.masterGain.gain.value = this.enabled ? val : 0;
    }
  }

  setEnabled(enabled: boolean) {
    this.enabled = enabled;
    if (this.masterGain) {
      this.masterGain.gain.value = enabled ? this.volume : 0;
    }
  }

  // Helper to play a tone
  private playTone(freq: number, type: OscillatorType, duration: number, startTime: number = 0) {
    if (!this.ctx || !this.masterGain) this.init();
    if (!this.ctx || !this.masterGain) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime + startTime);
    
    // Smooth envelope
    gain.gain.setValueAtTime(0, this.ctx.currentTime + startTime);
    gain.gain.linearRampToValueAtTime(0.5, this.ctx.currentTime + startTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + startTime + duration);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(this.ctx.currentTime + startTime);
    osc.stop(this.ctx.currentTime + startTime + duration);
  }

  playClick() {
    this.playTone(800, 'sine', 0.05);
  }

  playRollTick() {
    this.playTone(200, 'triangle', 0.03);
  }

  playSold() {
    this.playTone(1200, 'sine', 0.1, 0);
    this.playTone(1600, 'sine', 0.2, 0.05);
  }

  playCoin() {
    this.playTone(1500, 'sine', 0.05, 0);
    this.playTone(2000, 'sine', 0.1, 0.05);
  }

  playQuestComplete() {
    const now = 0;
    this.playTone(600, 'sine', 0.1, now);
    this.playTone(800, 'sine', 0.1, now + 0.1);
    this.playTone(1000, 'sine', 0.2, now + 0.2);
  }

  playFuse() {
    this.playTone(100, 'sawtooth', 0.2, 0);
    this.playTone(200, 'square', 0.2, 0.1);
    this.playTone(400, 'sine', 0.4, 0.2);
    this.playTone(800, 'sine', 0.1, 0.4);
  }

  playCommon() {
    this.playTone(300, 'sine', 0.1);
  }

  playRare() {
    this.playTone(440, 'sine', 0.3, 0); 
    this.playTone(554, 'sine', 0.3, 0.1); 
    this.playTone(659, 'sine', 0.6, 0.2); 
  }

  playLegendary() {
    const now = 0;
    this.playTone(523.25, 'square', 0.1, now); 
    this.playTone(523.25, 'square', 0.1, now + 0.1); 
    this.playTone(523.25, 'square', 0.1, now + 0.2); 
    this.playTone(659.25, 'square', 0.4, now + 0.3); 
    this.playTone(783.99, 'square', 0.4, now + 0.5); 
    this.playTone(1046.50, 'square', 0.8, now + 0.7); 
  }

  playAchievement() {
    // A nice ascending sparkle sound
    const now = 0;
    for(let i=0; i<5; i++) {
        this.playTone(800 + (i*200), 'sine', 0.2, now + (i*0.05));
    }
  }

  playRebirth() {
    const now = 0;
    // Low rumble ascending to high pitch
    this.playTone(100, 'sawtooth', 2.0, now);
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(200, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(2000, this.ctx.currentTime + 2);

    gain.gain.setValueAtTime(0, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.5, this.ctx.currentTime + 0.5);
    gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 2);

    osc.connect(gain);
    if (this.masterGain) gain.connect(this.masterGain);
    osc.start();
    osc.stop(this.ctx.currentTime + 2);
  }

  // New sound effects
  playError() {
    this.playTone(200, 'square', 0.1, 0);
    this.playTone(150, 'square', 0.15, 0.05);
  }

  playWarning() {
    this.playTone(300, 'sawtooth', 0.3, 0);
    this.playTone(200, 'sawtooth', 0.3, 0.2);
  }

  playSuccess() {
    this.playTone(800, 'sine', 0.1, 0);
    this.playTone(1000, 'sine', 0.15, 0.05);
    this.playTone(1200, 'sine', 0.2, 0.15);
  }

  playNotification() {
    this.playTone(600, 'sine', 0.1, 0);
  }

  playMenuSelect() {
    this.playTone(700, 'sine', 0.05, 0);
  }

  playWin() {
    const now = 0;
    this.playTone(523.25, 'sine', 0.1, now);      // C
    this.playTone(659.25, 'sine', 0.1, now + 0.1); // E
    this.playTone(783.99, 'sine', 0.1, now + 0.2); // G
    this.playTone(1046.50, 'sine', 0.3, now + 0.3); // C (octave)
  }

  playLose() {
    const now = 0;
    this.playTone(440, 'sine', 0.1, now);       // A
    this.playTone(392, 'sine', 0.1, now + 0.1); // G
    this.playTone(349, 'sine', 0.3, now + 0.2); // F
  }

  playAmbient() {
    // A short ambient pad sound
    const now = 0;
    this.playTone(150, 'triangle', 0.5, now);
    this.playTone(200, 'triangle', 0.5, now + 0.1);
  }

  playPowerUp() {
    const now = 0;
    this.playTone(400, 'sine', 0.05, now);
    this.playTone(500, 'sine', 0.05, now + 0.05);
    this.playTone(600, 'sine', 0.05, now + 0.1);
    this.playTone(700, 'sine', 0.05, now + 0.15);
    this.playTone(800, 'sine', 0.1, now + 0.2);
  }

  playPowerDown() {
    const now = 0;
    this.playTone(800, 'sine', 0.05, now);
    this.playTone(700, 'sine', 0.05, now + 0.05);
    this.playTone(600, 'sine', 0.05, now + 0.1);
    this.playTone(500, 'sine', 0.05, now + 0.15);
    this.playTone(400, 'sine', 0.1, now + 0.2);
  }

  playTrollEffect() {
    // A mischievous sound for troll users
    const now = 0;
    this.playTone(300, 'square', 0.05, now);
    this.playTone(250, 'square', 0.05, now + 0.05);
    this.playTone(350, 'square', 0.05, now + 0.1);
    this.playTone(200, 'square', 0.1, now + 0.15);
  }
}

export const soundEngine = new SoundEngine();