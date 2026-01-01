/**
 * VisibilityManager - Handles document visibility state
 * 
 * Detects when browser tab becomes hidden/visible and emits events.
 * Critical for pausing game when user switches tabs.
 * 
 * @module core/engine/VisibilityManager
 * @version 2.0.0
 */

import { EventSystem, GameEvents } from './EventSystem';

export interface VisibilityState {
  isVisible: boolean;
  lastVisibleTime: number;
  lastHiddenTime: number;
  totalHiddenTime: number;
}

/**
 * Manages document visibility state and automatic pause/resume
 */
export class VisibilityManager {
  private static instance: VisibilityManager | null = null;
  
  private _isVisible: boolean = true;
  private _lastVisibleTime: number = 0;
  private _lastHiddenTime: number = 0;
  private _totalHiddenTime: number = 0;
  private _autoPauseEnabled: boolean = true;
  private _initialized: boolean = false;

  private constructor() {
    // Private constructor for singleton
  }

  /**
   * Get singleton instance
   */
  static getInstance(): VisibilityManager {
    if (!VisibilityManager.instance) {
      VisibilityManager.instance = new VisibilityManager();
    }
    return VisibilityManager.instance;
  }

  /**
   * Initialize visibility tracking
   */
  init(): void {
    if (this._initialized) return;

    // Set initial state
    this._isVisible = !document.hidden;
    this._lastVisibleTime = performance.now();

    // Listen for visibility changes
    document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this));

    // Also listen for page hide/show (for Safari/iOS)
    window.addEventListener('pagehide', () => this.handleVisibilityChange());
    window.addEventListener('pageshow', () => this.handleVisibilityChange());

    // Handle window blur/focus as fallback
    window.addEventListener('blur', () => {
      if (this._autoPauseEnabled && this._isVisible) {
        // Only trigger if we haven't already detected hidden state
        // This handles cases where visibilitychange doesn't fire
      }
    });

    window.addEventListener('focus', () => {
      if (this._autoPauseEnabled && !this._isVisible) {
        // Re-check visibility on focus
        this.handleVisibilityChange();
      }
    });

    this._initialized = true;
    console.log('👁️ VisibilityManager initialized');
  }

  /**
   * Handle visibility state change
   */
  private handleVisibilityChange(): void {
    const wasVisible = this._isVisible;
    this._isVisible = !document.hidden;
    const now = performance.now();

    if (wasVisible && !this._isVisible) {
      // Tab became hidden
      this._lastHiddenTime = now;
      
      console.log('👁️ Tab hidden');
      
      if (this._autoPauseEnabled) {
        EventSystem.emit(GameEvents.VISIBILITY_HIDDEN, {
          timestamp: now,
          wasPlaying: true, // Game should check its own state
        });
        
        // Also emit pause event for games to handle
        EventSystem.emit(GameEvents.GAME_PAUSE, {
          reason: 'visibility',
          timestamp: now,
        });
      }
    } else if (!wasVisible && this._isVisible) {
      // Tab became visible
      const hiddenDuration = now - this._lastHiddenTime;
      this._totalHiddenTime += hiddenDuration;
      this._lastVisibleTime = now;
      
      console.log(`👁️ Tab visible (was hidden for ${Math.round(hiddenDuration)}ms)`);
      
      if (this._autoPauseEnabled) {
        EventSystem.emit(GameEvents.VISIBILITY_VISIBLE, {
          timestamp: now,
          hiddenDuration,
        });
        
        // Emit resume event - games can decide whether to auto-resume
        EventSystem.emit(GameEvents.GAME_RESUME, {
          reason: 'visibility',
          timestamp: now,
          hiddenDuration,
        });
      }
    }
  }

  /**
   * Check if document is currently visible
   */
  get isVisible(): boolean {
    return this._isVisible;
  }

  /**
   * Get current visibility state
   */
  getState(): VisibilityState {
    return {
      isVisible: this._isVisible,
      lastVisibleTime: this._lastVisibleTime,
      lastHiddenTime: this._lastHiddenTime,
      totalHiddenTime: this._totalHiddenTime,
    };
  }

  /**
   * Enable/disable automatic pause on tab switch
   */
  setAutoPause(enabled: boolean): void {
    this._autoPauseEnabled = enabled;
    console.log(`👁️ Auto-pause ${enabled ? 'enabled' : 'disabled'}`);
  }

  /**
   * Check if auto-pause is enabled
   */
  get autoPauseEnabled(): boolean {
    return this._autoPauseEnabled;
  }

  /**
   * Clean up event listeners
   */
  destroy(): void {
    document.removeEventListener('visibilitychange', this.handleVisibilityChange);
    this._initialized = false;
    VisibilityManager.instance = null;
  }
}

// Export singleton instance
export const visibilityManager = VisibilityManager.getInstance();
