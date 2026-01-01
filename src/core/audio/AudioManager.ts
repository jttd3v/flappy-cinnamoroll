/**
 * AudioManager - Cross-browser Audio System
 * 
 * Provides reliable audio playback using Howler.js with:
 * - Automatic context resumption
 * - Procedural sound generation for dynamic effects
 * - Volume control and muting
 * - Sound pooling for performance
 * 
 * @module core/audio/AudioManager
 * @version 2.0.0
 */

import { Howl, Howler } from 'howler';
import { EventSystem, GameEvents } from '../engine/EventSystem';

export interface SoundDefinition {
  src?: string | string[];
  volume?: number;
  loop?: boolean;
  sprite?: { [key: string]: [number, number] };
  procedural?: boolean;
  generator?: () => void;
}

export interface AudioConfig {
  masterVolume?: number;
  sfxVolume?: number;
  musicVolume?: number;
  muted?: boolean;
}

/**
 * Sound types for procedural generation
 */
export const SoundType = {
  FLAP: 'flap',
  JUMP: 'jump',
  SCORE: 'score',
  COLLISION: 'collision',
  GAME_OVER: 'gameOver',
  POWER_UP: 'powerUp',
  SPEED_UP: 'speedUp',
  GHOST_APPEAR: 'ghostAppear',
  BUTTON_CLICK: 'buttonClick',
  MILESTONE: 'milestone',
  CELEBRATION: 'celebration',
} as const;

export type SoundTypeKey = typeof SoundType[keyof typeof SoundType];

/**
 * Audio Manager with Howler.js and Web Audio API
 */
export class AudioManager {
  private static instance: AudioManager | null = null;
  
  private sounds: Map<string, Howl> = new Map();
  private audioContext: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  
  private config: Required<AudioConfig> = {
    masterVolume: 1.0,
    sfxVolume: 1.0,
    musicVolume: 0.5,
    muted: false,
  };
  
  private initialized: boolean = false;
  private contextResumed: boolean = false;
  private resumeListenerAdded: boolean = false;

  private constructor() {
    // Private constructor for singleton
  }

  /**
   * Get singleton instance
   */
  static getInstance(): AudioManager {
    if (!AudioManager.instance) {
      AudioManager.instance = new AudioManager();
    }
    return AudioManager.instance;
  }

  /**
   * Initialize the audio system
   */
  async init(config?: AudioConfig): Promise<boolean> {
    if (this.initialized) return true;

    // Merge config
    if (config) {
      this.config = { ...this.config, ...config };
    }

    try {
      // Initialize Howler global settings
      Howler.volume(this.config.masterVolume);
      Howler.mute(this.config.muted);

      // Create Web Audio context for procedural sounds
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Create master gain
      this.masterGain = this.audioContext.createGain();
      this.masterGain.connect(this.audioContext.destination);
      this.masterGain.gain.value = this.config.masterVolume;

      // Setup context resume handler
      this.setupContextResumeHandler();

      this.initialized = true;
      console.log('🔊 AudioManager initialized');
      
      return true;
    } catch (error) {
      console.warn('🔇 AudioManager: Web Audio API not supported', error);
      return false;
    }
  }

  /**
   * Setup handler to resume audio context on user interaction
   * Required by browser autoplay policies
   */
  private setupContextResumeHandler(): void {
    if (this.resumeListenerAdded) return;

    const resumeContext = async () => {
      if (this.contextResumed) return;

      // Resume Web Audio Context
      if (this.audioContext && this.audioContext.state === 'suspended') {
        try {
          await this.audioContext.resume();
          console.log('🔊 AudioContext resumed');
        } catch (e) {
          console.warn('🔇 Failed to resume AudioContext', e);
        }
      }

      // Resume Howler
      if (Howler.ctx && Howler.ctx.state === 'suspended') {
        Howler.ctx.resume();
      }

      this.contextResumed = true;
      EventSystem.emit(GameEvents.AUDIO_READY, { timestamp: performance.now() });

      // Remove listeners after successful resume
      document.removeEventListener('click', resumeContext);
      document.removeEventListener('touchstart', resumeContext);
      document.removeEventListener('keydown', resumeContext);
    };

    // Add listeners for common user interactions
    document.addEventListener('click', resumeContext, { once: false });
    document.addEventListener('touchstart', resumeContext, { once: false });
    document.addEventListener('keydown', resumeContext, { once: false });

    this.resumeListenerAdded = true;
  }

  /**
   * Ensure audio context is ready (call before playing sounds)
   */
  async ensureReady(): Promise<boolean> {
    if (this.contextResumed) return true;

    if (this.audioContext && this.audioContext.state === 'suspended') {
      try {
        await this.audioContext.resume();
        this.contextResumed = true;
        return true;
      } catch {
        return false;
      }
    }

    return true;
  }

  /**
   * Load a sound from URL
   */
  loadSound(id: string, definition: SoundDefinition): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!definition.src) {
        reject(new Error(`No source provided for sound: ${id}`));
        return;
      }

      const sound = new Howl({
        src: Array.isArray(definition.src) ? definition.src : [definition.src],
        volume: definition.volume ?? this.config.sfxVolume,
        loop: definition.loop ?? false,
        sprite: definition.sprite,
        onload: () => {
          this.sounds.set(id, sound);
          console.log(`🔊 Loaded sound: ${id}`);
          resolve();
        },
        onloaderror: (_soundId: number, error: unknown) => {
          console.error(`🔇 Failed to load sound: ${id}`, error);
          reject(error);
        },
      });
    });
  }

  /**
   * Play a loaded sound
   */
  play(id: string, sprite?: string): number | undefined {
    const sound = this.sounds.get(id);
    if (!sound) {
      // Try procedural sound
      this.playProcedural(id as SoundTypeKey);
      return undefined;
    }

    return sound.play(sprite);
  }

  /**
   * Stop a sound
   */
  stop(id: string): void {
    const sound = this.sounds.get(id);
    sound?.stop();
  }

  /**
   * Play a procedural sound effect
   */
  playProcedural(type: SoundTypeKey): void {
    if (!this.audioContext || !this.masterGain) return;
    if (this.config.muted) return;

    const ctx = this.audioContext;
    const now = ctx.currentTime;

    switch (type) {
      case SoundType.FLAP:
        this.playFlapSound(ctx, now);
        break;
      case SoundType.SCORE:
        this.playScoreSound(ctx, now);
        break;
      case SoundType.COLLISION:
        this.playCollisionSound(ctx, now);
        break;
      case SoundType.GHOST_APPEAR:
        this.playGhostSound(ctx, now);
        break;
      case SoundType.SPEED_UP:
        this.playSpeedUpSound(ctx, now);
        break;
      case SoundType.BUTTON_CLICK:
        this.playClickSound(ctx, now);
        break;
      case SoundType.MILESTONE:
        this.playMilestoneSound(ctx, now);
        break;
      case SoundType.CELEBRATION:
        this.playCelebrationSound(ctx, now);
        break;
      default:
        console.warn(`Unknown procedural sound type: ${type}`);
    }
  }

  // ==========================================
  // PROCEDURAL SOUND GENERATORS
  // ==========================================

  private playFlapSound(ctx: AudioContext, now: number): void {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(this.masterGain!);

    osc.type = 'sine';
    osc.frequency.setValueAtTime(400, now);
    osc.frequency.exponentialRampToValueAtTime(600, now + 0.05);

    gain.gain.setValueAtTime(0.15 * this.config.sfxVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);

    osc.start(now);
    osc.stop(now + 0.05);
  }

  private playScoreSound(ctx: AudioContext, now: number): void {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(this.masterGain!);

    osc.type = 'sine';
    osc.frequency.setValueAtTime(523, now); // C5
    osc.frequency.setValueAtTime(659, now + 0.1); // E5

    gain.gain.setValueAtTime(0.3 * this.config.sfxVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);

    osc.start(now);
    osc.stop(now + 0.2);
  }

  private playCollisionSound(ctx: AudioContext, now: number): void {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(this.masterGain!);

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(200, now);
    osc.frequency.exponentialRampToValueAtTime(50, now + 0.3);

    gain.gain.setValueAtTime(0.5 * this.config.sfxVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

    osc.start(now);
    osc.stop(now + 0.3);
  }

  private playGhostSound(ctx: AudioContext, now: number): void {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(this.masterGain!);

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(150, now);
    osc.frequency.exponentialRampToValueAtTime(80, now + 0.5);

    gain.gain.setValueAtTime(0.4 * this.config.sfxVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);

    osc.start(now);
    osc.stop(now + 0.5);
  }

  private playSpeedUpSound(ctx: AudioContext, now: number): void {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(this.masterGain!);

    osc.type = 'square';
    osc.frequency.setValueAtTime(300, now);
    osc.frequency.exponentialRampToValueAtTime(900, now + 0.15);

    gain.gain.setValueAtTime(0.2 * this.config.sfxVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

    osc.start(now);
    osc.stop(now + 0.15);
  }

  private playClickSound(ctx: AudioContext, now: number): void {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(this.masterGain!);

    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, now);

    gain.gain.setValueAtTime(0.1 * this.config.sfxVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);

    osc.start(now);
    osc.stop(now + 0.05);
  }

  private playMilestoneSound(ctx: AudioContext, now: number): void {
    // Arpeggio sound for milestones
    const notes = [523, 659, 784, 1047]; // C5, E5, G5, C6
    
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(this.masterGain!);

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + i * 0.1);

      gain.gain.setValueAtTime(0.25 * this.config.sfxVolume, now + i * 0.1);
      gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.1 + 0.2);

      osc.start(now + i * 0.1);
      osc.stop(now + i * 0.1 + 0.2);
    });
  }

  private playCelebrationSound(ctx: AudioContext, now: number): void {
    // Victory fanfare
    const notes = [523, 659, 784, 659, 784, 1047];
    const durations = [0.15, 0.15, 0.15, 0.15, 0.15, 0.4];
    
    let time = 0;
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(this.masterGain!);

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + time);

      gain.gain.setValueAtTime(0.3 * this.config.sfxVolume, now + time);
      gain.gain.exponentialRampToValueAtTime(0.01, now + time + durations[i]);

      osc.start(now + time);
      osc.stop(now + time + durations[i]);
      
      time += durations[i];
    });
  }

  // ==========================================
  // VOLUME & MUTE CONTROLS
  // ==========================================

  /**
   * Set master volume
   */
  setMasterVolume(volume: number): void {
    this.config.masterVolume = Math.max(0, Math.min(1, volume));
    Howler.volume(this.config.masterVolume);
    
    if (this.masterGain) {
      this.masterGain.gain.value = this.config.masterVolume;
    }
  }

  /**
   * Set SFX volume
   */
  setSfxVolume(volume: number): void {
    this.config.sfxVolume = Math.max(0, Math.min(1, volume));
  }

  /**
   * Set music volume
   */
  setMusicVolume(volume: number): void {
    this.config.musicVolume = Math.max(0, Math.min(1, volume));
  }

  /**
   * Mute all audio
   */
  mute(): void {
    this.config.muted = true;
    Howler.mute(true);
    EventSystem.emit(GameEvents.AUDIO_MUTE);
  }

  /**
   * Unmute audio
   */
  unmute(): void {
    this.config.muted = false;
    Howler.mute(false);
    EventSystem.emit(GameEvents.AUDIO_UNMUTE);
  }

  /**
   * Toggle mute state
   */
  toggleMute(): boolean {
    if (this.config.muted) {
      this.unmute();
    } else {
      this.mute();
    }
    return this.config.muted;
  }

  /**
   * Check if muted
   */
  get isMuted(): boolean {
    return this.config.muted;
  }

  /**
   * Get current config
   */
  getConfig(): AudioConfig {
    return { ...this.config };
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    // Stop all sounds
    this.sounds.forEach(sound => sound.unload());
    this.sounds.clear();

    // Close audio context
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }

    this.initialized = false;
    AudioManager.instance = null;
  }
}

// Export singleton instance
export const audioManager = AudioManager.getInstance();
