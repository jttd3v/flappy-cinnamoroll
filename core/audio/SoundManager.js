/**
 * SoundManager.js - Web Audio API Sound System
 * 
 * Centralized audio management with procedural sound generation.
 * Provides both pre-loaded sounds and on-the-fly synthesized effects.
 * 
 * @module core/audio/SoundManager
 * @version 1.0.0
 */

/**
 * Sound configuration
 * @typedef {Object} SoundConfig
 * @property {number} [volume=1] - Master volume (0-1)
 * @property {boolean} [muted=false] - Global mute state
 */

/**
 * Procedural sound types
 * @readonly
 * @enum {string}
 */
export const SoundType = Object.freeze({
  JUMP: 'jump',
  FLAP: 'flap',
  SCORE: 'score',
  COLLISION: 'collision',
  GAME_OVER: 'gameOver',
  POWER_UP: 'powerUp',
  SPEED_UP: 'speedUp',
  GHOST_APPEAR: 'ghostAppear',
  BUTTON_CLICK: 'buttonClick',
  MILESTONE: 'milestone'
});

/**
 * Sound manager for game audio
 */
export class SoundManager {
  /** @type {SoundManager|null} Singleton instance */
  static _instance = null;
  
  /**
   * Get singleton instance
   * @returns {SoundManager}
   */
  static getInstance() {
    if (!SoundManager._instance) {
      SoundManager._instance = new SoundManager();
    }
    return SoundManager._instance;
  }
  
  constructor() {
    /** @type {AudioContext|null} */
    this.audioContext = null;
    
    /** @type {Map<string, AudioBuffer>} Pre-loaded sounds */
    this.sounds = new Map();
    
    /** @type {number} Master volume (0-1) */
    this.volume = 1;
    
    /** @type {boolean} Global mute */
    this.muted = false;
    
    /** @type {boolean} Is initialized */
    this.initialized = false;
    
    /** @type {GainNode|null} Master gain node */
    this.masterGain = null;
  }
  
  // ==========================================
  // INITIALIZATION
  // ==========================================
  
  /**
   * Initialize the audio context
   * Must be called after user interaction (browser requirement)
   * @returns {boolean} Success
   */
  init() {
    if (this.initialized) return true;
    
    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      
      // Create master gain node
      this.masterGain = this.audioContext.createGain();
      this.masterGain.connect(this.audioContext.destination);
      this.masterGain.gain.value = this.volume;
      
      this.initialized = true;
      console.log('🔊 SoundManager initialized');
      return true;
    } catch (e) {
      console.warn('🔇 Web Audio API not supported:', e.message);
      return false;
    }
  }
  
  /**
   * Resume audio context (needed after browser suspension)
   */
  async resume() {
    if (this.audioContext && this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }
  }
  
  // ==========================================
  // VOLUME CONTROL
  // ==========================================
  
  /**
   * Set master volume
   * @param {number} vol - Volume level (0-1)
   */
  setVolume(vol) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.masterGain) {
      this.masterGain.gain.value = this.muted ? 0 : this.volume;
    }
  }
  
  /**
   * Mute all audio
   */
  mute() {
    this.muted = true;
    if (this.masterGain) {
      this.masterGain.gain.value = 0;
    }
  }
  
  /**
   * Unmute audio
   */
  unmute() {
    this.muted = false;
    if (this.masterGain) {
      this.masterGain.gain.value = this.volume;
    }
  }
  
  /**
   * Toggle mute state
   * @returns {boolean} New mute state
   */
  toggleMute() {
    if (this.muted) {
      this.unmute();
    } else {
      this.mute();
    }
    return this.muted;
  }
  
  // ==========================================
  // PROCEDURAL SOUND GENERATION
  // ==========================================
  
  /**
   * Play a procedural sound effect
   * @param {string} type - Sound type from SoundType enum
   * @param {Object} [options] - Sound options
   * @param {number} [options.volume=1] - Sound volume
   */
  play(type, options = {}) {
    if (!this.audioContext || this.muted) return;
    
    const vol = (options.volume ?? 1) * this.volume;
    
    switch (type) {
      case SoundType.FLAP:
      case SoundType.JUMP:
        this._playFlap(vol);
        break;
      case SoundType.SCORE:
        this._playScore(vol);
        break;
      case SoundType.COLLISION:
      case SoundType.GAME_OVER:
        this._playCollision(vol);
        break;
      case SoundType.POWER_UP:
        this._playPowerUp(vol);
        break;
      case SoundType.SPEED_UP:
        this._playSpeedUp(vol);
        break;
      case SoundType.GHOST_APPEAR:
        this._playGhostAppear(vol);
        break;
      case SoundType.BUTTON_CLICK:
        this._playButtonClick(vol);
        break;
      case SoundType.MILESTONE:
        this._playMilestone(vol);
        break;
      default:
        console.warn(`Unknown sound type: ${type}`);
    }
  }
  
  /**
   * Play flap/jump sound
   * @private
   */
  _playFlap(volume) {
    const ctx = this.audioContext;
    const now = ctx.currentTime;
    
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(this.masterGain);
    
    oscillator.frequency.setValueAtTime(400, now);
    oscillator.frequency.exponentialRampToValueAtTime(600, now + 0.05);
    
    gainNode.gain.setValueAtTime(0.15 * volume, now);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
    
    oscillator.type = 'sine';
    oscillator.start(now);
    oscillator.stop(now + 0.05);
  }
  
  /**
   * Play score sound
   * @private
   */
  _playScore(volume) {
    const ctx = this.audioContext;
    const now = ctx.currentTime;
    
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(this.masterGain);
    
    // Two-tone rising sound
    oscillator.frequency.setValueAtTime(523, now);
    oscillator.frequency.setValueAtTime(659, now + 0.1);
    
    gainNode.gain.setValueAtTime(0.3 * volume, now);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
    
    oscillator.type = 'sine';
    oscillator.start(now);
    oscillator.stop(now + 0.2);
  }
  
  /**
   * Play collision/game over sound
   * @private
   */
  _playCollision(volume) {
    const ctx = this.audioContext;
    const now = ctx.currentTime;
    
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(this.masterGain);
    
    // Descending harsh sound
    oscillator.frequency.setValueAtTime(200, now);
    oscillator.frequency.exponentialRampToValueAtTime(50, now + 0.3);
    
    gainNode.gain.setValueAtTime(0.5 * volume, now);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
    
    oscillator.type = 'sawtooth';
    oscillator.start(now);
    oscillator.stop(now + 0.3);
  }
  
  /**
   * Play power-up sound
   * @private
   */
  _playPowerUp(volume) {
    const ctx = this.audioContext;
    const now = ctx.currentTime;
    
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(this.masterGain);
    
    // Ascending arpeggio
    oscillator.frequency.setValueAtTime(392, now);        // G4
    oscillator.frequency.setValueAtTime(523, now + 0.1);  // C5
    oscillator.frequency.setValueAtTime(659, now + 0.2);  // E5
    oscillator.frequency.setValueAtTime(784, now + 0.3);  // G5
    
    gainNode.gain.setValueAtTime(0.3 * volume, now);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
    
    oscillator.type = 'sine';
    oscillator.start(now);
    oscillator.stop(now + 0.4);
  }
  
  /**
   * Play speed up sound
   * @private
   */
  _playSpeedUp(volume) {
    const ctx = this.audioContext;
    const now = ctx.currentTime;
    
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(this.masterGain);
    
    oscillator.frequency.setValueAtTime(300, now);
    oscillator.frequency.exponentialRampToValueAtTime(900, now + 0.15);
    
    gainNode.gain.setValueAtTime(0.2 * volume, now);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
    
    oscillator.type = 'square';
    oscillator.start(now);
    oscillator.stop(now + 0.15);
  }
  
  /**
   * Play ghost appear sound
   * @private
   */
  _playGhostAppear(volume) {
    const ctx = this.audioContext;
    const now = ctx.currentTime;
    
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(this.masterGain);
    
    // Eerie descending tone
    oscillator.frequency.setValueAtTime(150, now);
    oscillator.frequency.exponentialRampToValueAtTime(80, now + 0.5);
    
    gainNode.gain.setValueAtTime(0.4 * volume, now);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
    
    oscillator.type = 'sawtooth';
    oscillator.start(now);
    oscillator.stop(now + 0.5);
  }
  
  /**
   * Play button click sound
   * @private
   */
  _playButtonClick(volume) {
    const ctx = this.audioContext;
    const now = ctx.currentTime;
    
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(this.masterGain);
    
    oscillator.frequency.setValueAtTime(800, now);
    
    gainNode.gain.setValueAtTime(0.1 * volume, now);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.03);
    
    oscillator.type = 'sine';
    oscillator.start(now);
    oscillator.stop(now + 0.03);
  }
  
  /**
   * Play milestone sound (every N points)
   * @private
   */
  _playMilestone(volume) {
    const ctx = this.audioContext;
    const now = ctx.currentTime;
    
    // Play a chord
    const notes = [523, 659, 784]; // C5, E5, G5
    
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.connect(gain);
      gain.connect(this.masterGain);
      
      osc.frequency.setValueAtTime(freq, now + i * 0.05);
      
      gain.gain.setValueAtTime(0.2 * volume, now + i * 0.05);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
      
      osc.type = 'sine';
      osc.start(now + i * 0.05);
      osc.stop(now + 0.4);
    });
  }
  
  // ==========================================
  // CUSTOM SOUND CREATION
  // ==========================================
  
  /**
   * Play a custom tone
   * @param {Object} options - Tone options
   * @param {number} options.frequency - Frequency in Hz
   * @param {number} [options.duration=0.1] - Duration in seconds
   * @param {string} [options.type='sine'] - Oscillator type
   * @param {number} [options.volume=0.3] - Volume
   */
  playTone(options) {
    if (!this.audioContext || this.muted) return;
    
    const ctx = this.audioContext;
    const now = ctx.currentTime;
    
    const freq = options.frequency;
    const duration = options.duration ?? 0.1;
    const type = options.type ?? 'sine';
    const vol = (options.volume ?? 0.3) * this.volume;
    
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(this.masterGain);
    
    oscillator.frequency.setValueAtTime(freq, now);
    oscillator.type = type;
    
    gainNode.gain.setValueAtTime(vol, now);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + duration);
    
    oscillator.start(now);
    oscillator.stop(now + duration);
  }
  
  /**
   * Play a sequence of tones
   * @param {Array<{frequency: number, duration: number}>} notes - Notes to play
   * @param {number} [gap=0.05] - Gap between notes in seconds
   */
  playSequence(notes, gap = 0.05) {
    if (!this.audioContext || this.muted) return;
    
    let time = 0;
    
    notes.forEach(note => {
      setTimeout(() => {
        this.playTone(note);
      }, time * 1000);
      
      time += note.duration + gap;
    });
  }
  
  // ==========================================
  // UTILITY
  // ==========================================
  
  /**
   * Check if audio is available
   * @returns {boolean}
   */
  isAvailable() {
    return this.initialized && this.audioContext !== null;
  }
  
  /**
   * Cleanup and release resources
   */
  destroy() {
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
    this.sounds.clear();
    this.initialized = false;
  }
}

// Export singleton instance
export const soundManager = SoundManager.getInstance();

export default SoundManager;
