/**
 * GameAudioManager.js - Unified Audio System for Cinnamoroll Games
 * 
 * Provides background music, sound effects, and audio management
 * with a cute Cinnamoroll theme. Uses Web Audio API for procedural
 * sound generation (no external audio files needed).
 * 
 * @version 1.0.0
 */

// ==================== Audio Configuration ====================
const AUDIO_CONFIG = Object.freeze({
    MASTER_VOLUME: 0.7,
    MUSIC_VOLUME: 0.3,
    SFX_VOLUME: 0.5,
    FADE_DURATION: 1.0,
    STORAGE_KEY: 'cinnamorollAudioSettings'
});

// Musical notes frequencies (Hz) for cute melodies
const NOTES = Object.freeze({
    C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392.00, A4: 440.00, B4: 493.88,
    C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46, G5: 783.99, A5: 880.00, B5: 987.77,
    C6: 1046.50
});

// ==================== Game Audio Manager ====================
class GameAudioManager {
    constructor() {
        /** @type {AudioContext|null} */
        this.audioContext = null;
        
        /** @type {GainNode|null} Master gain */
        this.masterGain = null;
        
        /** @type {GainNode|null} Music gain */
        this.musicGain = null;
        
        /** @type {GainNode|null} SFX gain */
        this.sfxGain = null;
        
        /** @type {boolean} */
        this.initialized = false;
        
        /** @type {boolean} */
        this.musicEnabled = true;
        
        /** @type {boolean} */
        this.sfxEnabled = true;
        
        /** @type {Object|null} Current music loop */
        this.currentMusic = null;
        
        /** @type {number} Music interval ID */
        this.musicIntervalId = null;
        
        /** @type {string} Current music theme */
        this.currentTheme = null;
        
        // Load saved settings
        this._loadSettings();
    }
    
    // ==========================================
    // INITIALIZATION
    // ==========================================
    
    /**
     * Initialize audio context (must be called after user interaction)
     * @returns {boolean} Success status
     */
    init() {
        if (this.initialized) return true;
        
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            // Create gain nodes chain: source -> specific gain -> master gain -> destination
            this.masterGain = this.audioContext.createGain();
            this.musicGain = this.audioContext.createGain();
            this.sfxGain = this.audioContext.createGain();
            
            this.musicGain.connect(this.masterGain);
            this.sfxGain.connect(this.masterGain);
            this.masterGain.connect(this.audioContext.destination);
            
            // Set initial volumes
            this.masterGain.gain.value = AUDIO_CONFIG.MASTER_VOLUME;
            this.musicGain.gain.value = this.musicEnabled ? AUDIO_CONFIG.MUSIC_VOLUME : 0;
            this.sfxGain.gain.value = this.sfxEnabled ? AUDIO_CONFIG.SFX_VOLUME : 0;
            
            this.initialized = true;
            console.log('🎵 GameAudioManager initialized');
            return true;
        } catch (e) {
            console.warn('🔇 Audio initialization failed:', e.message);
            return false;
        }
    }
    
    /**
     * Resume audio context if suspended
     */
    async resume() {
        if (this.audioContext && this.audioContext.state === 'suspended') {
            try {
                await this.audioContext.resume();
            } catch (e) {
                console.warn('Could not resume audio context:', e);
            }
        }
    }
    
    /**
     * Ensure audio is ready (call on user interaction)
     */
    ensureReady() {
        if (!this.initialized) {
            this.init();
        }
        this.resume();
    }
    
    // ==========================================
    // SETTINGS MANAGEMENT
    // ==========================================
    
    _loadSettings() {
        try {
            const saved = localStorage.getItem(AUDIO_CONFIG.STORAGE_KEY);
            if (saved) {
                const settings = JSON.parse(saved);
                this.musicEnabled = settings.musicEnabled !== false;
                this.sfxEnabled = settings.sfxEnabled !== false;
            }
        } catch (e) {
            // Use defaults
        }
    }
    
    _saveSettings() {
        try {
            localStorage.setItem(AUDIO_CONFIG.STORAGE_KEY, JSON.stringify({
                musicEnabled: this.musicEnabled,
                sfxEnabled: this.sfxEnabled
            }));
        } catch (e) {
            // Ignore storage errors
        }
    }
    
    // ==========================================
    // VOLUME CONTROLS
    // ==========================================
    
    /**
     * Toggle music on/off
     * @returns {boolean} New state
     */
    toggleMusic() {
        this.musicEnabled = !this.musicEnabled;
        if (this.musicGain) {
            this.musicGain.gain.value = this.musicEnabled ? AUDIO_CONFIG.MUSIC_VOLUME : 0;
        }
        if (!this.musicEnabled && this.currentMusic) {
            this.stopMusic();
        }
        this._saveSettings();
        return this.musicEnabled;
    }
    
    /**
     * Toggle sound effects on/off
     * @returns {boolean} New state
     */
    toggleSFX() {
        this.sfxEnabled = !this.sfxEnabled;
        if (this.sfxGain) {
            this.sfxGain.gain.value = this.sfxEnabled ? AUDIO_CONFIG.SFX_VOLUME : 0;
        }
        this._saveSettings();
        return this.sfxEnabled;
    }
    
    /**
     * Set music volume
     * @param {number} vol - Volume (0-1)
     */
    setMusicVolume(vol) {
        if (this.musicGain) {
            this.musicGain.gain.value = Math.max(0, Math.min(1, vol)) * (this.musicEnabled ? 1 : 0);
        }
    }
    
    /**
     * Set SFX volume  
     * @param {number} vol - Volume (0-1)
     */
    setSFXVolume(vol) {
        if (this.sfxGain) {
            this.sfxGain.gain.value = Math.max(0, Math.min(1, vol)) * (this.sfxEnabled ? 1 : 0);
        }
    }
    
    // ==========================================
    // BACKGROUND MUSIC - Cute Cinnamoroll Themes
    // ==========================================
    
    /**
     * Start background music for a specific game theme
     * @param {string} theme - Game theme name
     */
    playMusic(theme = 'default') {
        if (!this.initialized || !this.musicEnabled) return;
        
        // Stop current music if playing different theme
        if (this.currentTheme !== theme) {
            this.stopMusic();
        }
        
        this.currentTheme = theme;
        
        // Get melody for theme
        const melody = this._getMelodyForTheme(theme);
        
        // Start music loop
        this._startMusicLoop(melody);
    }
    
    /**
     * Stop background music
     */
    stopMusic() {
        if (this.musicIntervalId) {
            clearInterval(this.musicIntervalId);
            this.musicIntervalId = null;
        }
        this.currentTheme = null;
    }
    
    /**
     * Get melody pattern for a theme
     * @private
     */
    _getMelodyForTheme(theme) {
        const melodies = {
            // Default cute Cinnamoroll melody
            default: [
                { note: 'E5', duration: 0.3 }, { note: 'G5', duration: 0.3 },
                { note: 'A5', duration: 0.4 }, { note: 'G5', duration: 0.2 },
                { note: 'E5', duration: 0.3 }, { note: 'D5', duration: 0.3 },
                { note: 'C5', duration: 0.6 }, { rest: 0.4 },
                { note: 'D5', duration: 0.3 }, { note: 'E5', duration: 0.3 },
                { note: 'G5', duration: 0.4 }, { note: 'E5', duration: 0.4 },
                { note: 'D5', duration: 0.3 }, { note: 'C5', duration: 0.5 }
            ],
            
            // Memory game - gentle, thoughtful
            memory: [
                { note: 'C5', duration: 0.4 }, { note: 'E5', duration: 0.4 },
                { note: 'G5', duration: 0.5 }, { rest: 0.3 },
                { note: 'G5', duration: 0.3 }, { note: 'E5', duration: 0.3 },
                { note: 'C5', duration: 0.5 }, { rest: 0.3 },
                { note: 'D5', duration: 0.4 }, { note: 'F5', duration: 0.4 },
                { note: 'A5', duration: 0.5 }, { note: 'G5', duration: 0.5 }
            ],
            
            // Pattern game - playful, bouncy
            pattern: [
                { note: 'G4', duration: 0.2 }, { note: 'A4', duration: 0.2 },
                { note: 'B4', duration: 0.2 }, { note: 'C5', duration: 0.3 },
                { note: 'D5', duration: 0.2 }, { note: 'E5', duration: 0.4 },
                { rest: 0.2 },
                { note: 'E5', duration: 0.2 }, { note: 'D5', duration: 0.2 },
                { note: 'C5', duration: 0.2 }, { note: 'B4', duration: 0.3 },
                { note: 'A4', duration: 0.2 }, { note: 'G4', duration: 0.4 }
            ],
            
            // Math/counting - upbeat, encouraging
            math: [
                { note: 'C5', duration: 0.25 }, { note: 'E5', duration: 0.25 },
                { note: 'G5', duration: 0.25 }, { note: 'C6', duration: 0.4 },
                { rest: 0.2 },
                { note: 'B5', duration: 0.25 }, { note: 'G5', duration: 0.25 },
                { note: 'E5', duration: 0.25 }, { note: 'C5', duration: 0.4 },
                { rest: 0.2 },
                { note: 'D5', duration: 0.3 }, { note: 'G5', duration: 0.3 },
                { note: 'B5', duration: 0.4 }
            ],
            
            // Quiz - curious, wondering
            quiz: [
                { note: 'E5', duration: 0.3 }, { note: 'F5', duration: 0.2 },
                { note: 'G5', duration: 0.4 }, { rest: 0.2 },
                { note: 'G5', duration: 0.2 }, { note: 'A5', duration: 0.3 },
                { note: 'G5', duration: 0.3 }, { note: 'F5', duration: 0.2 },
                { note: 'E5', duration: 0.5 }, { rest: 0.3 },
                { note: 'C5', duration: 0.3 }, { note: 'D5', duration: 0.3 },
                { note: 'E5', duration: 0.5 }
            ],
            
            // Story/reading - dreamy, magical
            story: [
                { note: 'G4', duration: 0.5 }, { note: 'B4', duration: 0.4 },
                { note: 'D5', duration: 0.5 }, { note: 'G5', duration: 0.6 },
                { rest: 0.3 },
                { note: 'F5', duration: 0.4 }, { note: 'E5', duration: 0.4 },
                { note: 'D5', duration: 0.5 }, { rest: 0.2 },
                { note: 'C5', duration: 0.4 }, { note: 'B4', duration: 0.4 },
                { note: 'G4', duration: 0.6 }
            ],
            
            // Adventure/exploration - exciting
            adventure: [
                { note: 'G4', duration: 0.2 }, { note: 'C5', duration: 0.3 },
                { note: 'E5', duration: 0.2 }, { note: 'G5', duration: 0.4 },
                { note: 'E5', duration: 0.2 }, { note: 'C5', duration: 0.2 },
                { rest: 0.2 },
                { note: 'A4', duration: 0.2 }, { note: 'D5', duration: 0.3 },
                { note: 'F5', duration: 0.2 }, { note: 'A5', duration: 0.4 },
                { note: 'G5', duration: 0.3 }, { note: 'E5', duration: 0.3 }
            ],
            
            // Puzzle - focused, contemplative
            puzzle: [
                { note: 'E4', duration: 0.4 }, { note: 'G4', duration: 0.3 },
                { note: 'A4', duration: 0.4 }, { note: 'C5', duration: 0.5 },
                { rest: 0.3 },
                { note: 'B4', duration: 0.3 }, { note: 'A4', duration: 0.3 },
                { note: 'G4', duration: 0.4 }, { rest: 0.2 },
                { note: 'F4', duration: 0.3 }, { note: 'G4', duration: 0.3 },
                { note: 'E4', duration: 0.5 }
            ],
            
            // Candy shop - sweet, cheerful
            shop: [
                { note: 'C5', duration: 0.2 }, { note: 'D5', duration: 0.2 },
                { note: 'E5', duration: 0.2 }, { note: 'G5', duration: 0.3 },
                { note: 'E5', duration: 0.2 }, { note: 'C5', duration: 0.3 },
                { rest: 0.2 },
                { note: 'G5', duration: 0.2 }, { note: 'A5', duration: 0.3 },
                { note: 'G5', duration: 0.2 }, { note: 'E5', duration: 0.3 },
                { note: 'D5', duration: 0.2 }, { note: 'C5', duration: 0.4 }
            ],
            
            // Journal/writing - calm, inspiring
            journal: [
                { note: 'G4', duration: 0.5 }, { note: 'A4', duration: 0.4 },
                { note: 'B4', duration: 0.5 }, { note: 'D5', duration: 0.6 },
                { rest: 0.4 },
                { note: 'C5', duration: 0.4 }, { note: 'B4', duration: 0.3 },
                { note: 'A4', duration: 0.4 }, { note: 'G4', duration: 0.5 },
                { rest: 0.3 },
                { note: 'E4', duration: 0.4 }, { note: 'G4', duration: 0.6 }
            ],
            
            // Career clouds - inspirational
            career: [
                { note: 'C5', duration: 0.4 }, { note: 'E5', duration: 0.3 },
                { note: 'G5', duration: 0.4 }, { note: 'B5', duration: 0.5 },
                { note: 'C6', duration: 0.6 }, { rest: 0.3 },
                { note: 'G5', duration: 0.3 }, { note: 'E5', duration: 0.3 },
                { note: 'C5', duration: 0.4 }, { rest: 0.2 },
                { note: 'D5', duration: 0.3 }, { note: 'E5', duration: 0.3 },
                { note: 'C5', duration: 0.5 }
            ]
        };
        
        return melodies[theme] || melodies.default;
    }
    
    /**
     * Start the music loop
     * @private
     */
    _startMusicLoop(melody) {
        if (!this.audioContext || !this.musicEnabled) return;
        
        let noteIndex = 0;
        const totalDuration = melody.reduce((sum, n) => sum + (n.duration || n.rest || 0), 0);
        
        const playNextNote = () => {
            if (!this.musicEnabled || !this.currentTheme) return;
            
            const item = melody[noteIndex];
            
            if (item.note && NOTES[item.note]) {
                this._playMusicNote(NOTES[item.note], item.duration);
            }
            
            noteIndex = (noteIndex + 1) % melody.length;
        };
        
        // Play first note immediately
        playNextNote();
        
        // Calculate average note duration for interval
        const avgDuration = (totalDuration / melody.length) * 1000;
        
        // Start loop
        this.musicIntervalId = setInterval(playNextNote, avgDuration);
    }
    
    /**
     * Play a single music note
     * @private
     */
    _playMusicNote(frequency, duration) {
        if (!this.audioContext || !this.musicGain) return;
        
        try {
            const ctx = this.audioContext;
            const now = ctx.currentTime;
            
            const oscillator = ctx.createOscillator();
            const noteGain = ctx.createGain();
            
            oscillator.connect(noteGain);
            noteGain.connect(this.musicGain);
            
            // Soft, music-box-like tone
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(frequency, now);
            
            // Gentle envelope for musical sound
            noteGain.gain.setValueAtTime(0, now);
            noteGain.gain.linearRampToValueAtTime(0.3, now + 0.05);
            noteGain.gain.exponentialRampToValueAtTime(0.01, now + duration);
            
            oscillator.start(now);
            oscillator.stop(now + duration + 0.1);
        } catch (e) {
            // Silently ignore audio errors
        }
    }
    
    // ==========================================
    // SOUND EFFECTS
    // ==========================================
    
    /**
     * Play a sound effect
     * @param {string} type - Sound effect type
     */
    playSFX(type) {
        if (!this.initialized || !this.sfxEnabled) return;
        
        try {
            switch (type) {
                case 'correct':
                case 'success':
                case 'match':
                    this._playCorrectSound();
                    break;
                case 'wrong':
                case 'error':
                case 'incorrect':
                    this._playWrongSound();
                    break;
                case 'click':
                case 'tap':
                case 'select':
                    this._playClickSound();
                    break;
                case 'start':
                case 'begin':
                    this._playStartSound();
                    break;
                case 'complete':
                case 'win':
                case 'victory':
                    this._playVictorySound();
                    break;
                case 'lose':
                case 'fail':
                case 'gameover':
                    this._playGameOverSound();
                    break;
                case 'levelup':
                case 'upgrade':
                    this._playLevelUpSound();
                    break;
                case 'powerup':
                case 'bonus':
                case 'reward':
                    this._playPowerUpSound();
                    break;
                case 'flip':
                case 'card':
                    this._playFlipSound();
                    break;
                case 'pop':
                case 'bubble':
                    this._playPopSound();
                    break;
                case 'coin':
                case 'money':
                case 'purchase':
                    this._playCoinSound();
                    break;
                case 'hint':
                case 'help':
                    this._playHintSound();
                    break;
                case 'tick':
                case 'timer':
                    this._playTickSound();
                    break;
                case 'countdown':
                case 'warning':
                    this._playWarningSound();
                    break;
                case 'streak':
                case 'combo':
                    this._playStreakSound();
                    break;
                case 'star':
                case 'rating':
                    this._playStarSound();
                    break;
                case 'whoosh':
                case 'swipe':
                    this._playWhooshSound();
                    break;
                case 'type':
                case 'keystroke':
                    this._playTypeSound();
                    break;
                default:
                    this._playClickSound();
            }
        } catch (e) {
            // Silently ignore audio errors
        }
    }
    
    // --- Individual Sound Effects ---
    
    _playCorrectSound() {
        const ctx = this.audioContext;
        const now = ctx.currentTime;
        
        // Happy rising two-tone chime
        [523.25, 659.25].forEach((freq, i) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(this.sfxGain);
            
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, now + i * 0.1);
            gain.gain.setValueAtTime(0.4, now + i * 0.1);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3 + i * 0.1);
            
            osc.start(now + i * 0.1);
            osc.stop(now + 0.4 + i * 0.1);
        });
    }
    
    _playWrongSound() {
        const ctx = this.audioContext;
        const now = ctx.currentTime;
        
        // Descending "oops" sound
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(this.sfxGain);
        
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(330, now);
        osc.frequency.exponentialRampToValueAtTime(180, now + 0.25);
        
        gain.gain.setValueAtTime(0.4, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
        
        osc.start(now);
        osc.stop(now + 0.3);
    }
    
    _playClickSound() {
        const ctx = this.audioContext;
        const now = ctx.currentTime;
        
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(this.sfxGain);
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, now);
        
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
        
        osc.start(now);
        osc.stop(now + 0.05);
    }
    
    _playStartSound() {
        const ctx = this.audioContext;
        const now = ctx.currentTime;
        
        // Ascending "let's go!" arpeggio
        const notes = [392, 523.25, 659.25, 783.99]; // G4, C5, E5, G5
        
        notes.forEach((freq, i) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(this.sfxGain);
            
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, now + i * 0.08);
            
            gain.gain.setValueAtTime(0.3, now + i * 0.08);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
            
            osc.start(now + i * 0.08);
            osc.stop(now + 0.5);
        });
    }
    
    _playVictorySound() {
        const ctx = this.audioContext;
        const now = ctx.currentTime;
        
        // Triumphant fanfare
        const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
        
        notes.forEach((freq, i) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(this.sfxGain);
            
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, now + i * 0.12);
            
            gain.gain.setValueAtTime(0.35, now + i * 0.12);
            gain.gain.setValueAtTime(0.35, now + 0.5 + i * 0.12);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.8);
            
            osc.start(now + i * 0.12);
            osc.stop(now + 1.0);
        });
    }
    
    _playGameOverSound() {
        const ctx = this.audioContext;
        const now = ctx.currentTime;
        
        // Sad descending notes
        const notes = [392, 349.23, 293.66, 261.63]; // G4, F4, D4, C4
        
        notes.forEach((freq, i) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(this.sfxGain);
            
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, now + i * 0.2);
            
            gain.gain.setValueAtTime(0.3, now + i * 0.2);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4 + i * 0.2);
            
            osc.start(now + i * 0.2);
            osc.stop(now + 1.0);
        });
    }
    
    _playLevelUpSound() {
        const ctx = this.audioContext;
        const now = ctx.currentTime;
        
        // Exciting ascending scale
        const notes = [392, 440, 493.88, 523.25, 587.33, 659.25, 783.99];
        
        notes.forEach((freq, i) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(this.sfxGain);
            
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, now + i * 0.06);
            
            gain.gain.setValueAtTime(0.25, now + i * 0.06);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
            
            osc.start(now + i * 0.06);
            osc.stop(now + 0.6);
        });
    }
    
    _playPowerUpSound() {
        const ctx = this.audioContext;
        const now = ctx.currentTime;
        
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(this.sfxGain);
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(400, now);
        osc.frequency.exponentialRampToValueAtTime(1200, now + 0.3);
        
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
        
        osc.start(now);
        osc.stop(now + 0.4);
    }
    
    _playFlipSound() {
        const ctx = this.audioContext;
        const now = ctx.currentTime;
        
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(this.sfxGain);
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(500, now);
        osc.frequency.setValueAtTime(700, now + 0.05);
        
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        
        osc.start(now);
        osc.stop(now + 0.1);
    }
    
    _playPopSound() {
        const ctx = this.audioContext;
        const now = ctx.currentTime;
        
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(this.sfxGain);
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.exponentialRampToValueAtTime(200, now + 0.08);
        
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        
        osc.start(now);
        osc.stop(now + 0.1);
    }
    
    _playCoinSound() {
        const ctx = this.audioContext;
        const now = ctx.currentTime;
        
        // Classic "cha-ching" sound
        [1046.50, 1318.51].forEach((freq, i) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(this.sfxGain);
            
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, now + i * 0.08);
            
            gain.gain.setValueAtTime(0.25, now + i * 0.08);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2 + i * 0.08);
            
            osc.start(now + i * 0.08);
            osc.stop(now + 0.3);
        });
    }
    
    _playHintSound() {
        const ctx = this.audioContext;
        const now = ctx.currentTime;
        
        // Gentle "ding" for hint
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(this.sfxGain);
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, now);
        
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
        
        osc.start(now);
        osc.stop(now + 0.35);
    }
    
    _playTickSound() {
        const ctx = this.audioContext;
        const now = ctx.currentTime;
        
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(this.sfxGain);
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1000, now);
        
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.03);
        
        osc.start(now);
        osc.stop(now + 0.03);
    }
    
    _playWarningSound() {
        const ctx = this.audioContext;
        const now = ctx.currentTime;
        
        // Urgent beeping
        for (let i = 0; i < 3; i++) {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(this.sfxGain);
            
            osc.type = 'square';
            osc.frequency.setValueAtTime(880, now + i * 0.15);
            
            gain.gain.setValueAtTime(0.15, now + i * 0.15);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1 + i * 0.15);
            
            osc.start(now + i * 0.15);
            osc.stop(now + 0.12 + i * 0.15);
        }
    }
    
    _playStreakSound() {
        const ctx = this.audioContext;
        const now = ctx.currentTime;
        
        // Quick ascending sparkle
        const notes = [523.25, 659.25, 783.99, 1046.50];
        
        notes.forEach((freq, i) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(this.sfxGain);
            
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, now + i * 0.05);
            
            gain.gain.setValueAtTime(0.2, now + i * 0.05);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2 + i * 0.05);
            
            osc.start(now + i * 0.05);
            osc.stop(now + 0.3);
        });
    }
    
    _playStarSound() {
        const ctx = this.audioContext;
        const now = ctx.currentTime;
        
        // Magical sparkle
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(this.sfxGain);
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1200, now);
        osc.frequency.setValueAtTime(1500, now + 0.05);
        osc.frequency.setValueAtTime(1800, now + 0.1);
        
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
        
        osc.start(now);
        osc.stop(now + 0.3);
    }
    
    _playWhooshSound() {
        const ctx = this.audioContext;
        const now = ctx.currentTime;
        
        // White noise burst for whoosh
        const bufferSize = ctx.sampleRate * 0.1;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        
        const noise = ctx.createBufferSource();
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();
        
        noise.buffer = buffer;
        filter.type = 'highpass';
        filter.frequency.setValueAtTime(2000, now);
        filter.frequency.exponentialRampToValueAtTime(500, now + 0.1);
        
        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.sfxGain);
        
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        
        noise.start(now);
        noise.stop(now + 0.1);
    }
    
    _playTypeSound() {
        const ctx = this.audioContext;
        const now = ctx.currentTime;
        
        // Soft typewriter click
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(this.sfxGain);
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(400 + Math.random() * 100, now);
        
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.02);
        
        osc.start(now);
        osc.stop(now + 0.03);
    }
    
    // ==========================================
    // CLEANUP
    // ==========================================
    
    /**
     * Cleanup and release resources
     */
    destroy() {
        this.stopMusic();
        if (this.audioContext) {
            try {
                this.audioContext.close();
            } catch (e) {
                // Ignore
            }
            this.audioContext = null;
        }
        this.initialized = false;
    }
}

// ==================== Singleton Instance ====================
const gameAudio = new GameAudioManager();

// Make available globally for easy access from games
if (typeof window !== 'undefined') {
    window.GameAudioManager = GameAudioManager;
    window.gameAudio = gameAudio;
}
