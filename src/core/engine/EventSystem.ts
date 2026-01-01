/**
 * EventSystem - Pub/Sub Event System
 * 
 * Centralized event system for game-wide communication.
 * Supports typed events and automatic cleanup.
 * 
 * @module core/engine/EventSystem
 * @version 2.0.0
 */

/**
 * Game event types
 */
export const GameEvents = {
  // Game lifecycle
  GAME_INIT: 'game:init',
  GAME_START: 'game:start',
  GAME_PAUSE: 'game:pause',
  GAME_RESUME: 'game:resume',
  GAME_OVER: 'game:over',
  GAME_RESTART: 'game:restart',
  
  // State changes
  STATE_CHANGE: 'state:change',
  
  // Loop events
  LOOP_START: 'loop:start',
  LOOP_STOP: 'loop:stop',
  LOOP_PAUSE: 'loop:pause',
  LOOP_RESUME: 'loop:resume',
  
  // Visibility
  VISIBILITY_HIDDEN: 'visibility:hidden',
  VISIBILITY_VISIBLE: 'visibility:visible',
  
  // Player events
  PLAYER_JUMP: 'player:jump',
  PLAYER_FLAP: 'player:flap',
  PLAYER_DEATH: 'player:death',
  
  // Scoring
  SCORE_UPDATE: 'score:update',
  SCORE_MILESTONE: 'score:milestone',
  HIGH_SCORE: 'score:high',
  
  // Collision
  COLLISION: 'collision',
  
  // Audio
  AUDIO_READY: 'audio:ready',
  AUDIO_MUTE: 'audio:mute',
  AUDIO_UNMUTE: 'audio:unmute',
  
  // Enemies
  GHOST_SPAWN: 'ghost:spawn',
  GHOST_DESPAWN: 'ghost:despawn',
  
  // Speed
  SPEED_UP: 'speed:up',
  
  // UI
  UI_BUTTON_CLICK: 'ui:button:click',
  MODAL_OPEN: 'ui:modal:open',
  MODAL_CLOSE: 'ui:modal:close',
} as const;

export type GameEventType = typeof GameEvents[keyof typeof GameEvents];

type EventCallback<T = unknown> = (data: T) => void;

interface EventEntry {
  callback: EventCallback;
  once: boolean;
}

/**
 * Centralized event system
 */
class EventSystemClass {
  private listeners: Map<string, EventEntry[]> = new Map();
  private eventHistory: Array<{ event: string; data: unknown; timestamp: number }> = [];
  private maxHistorySize: number = 100;
  private debugMode: boolean = false;

  /**
   * Subscribe to an event
   */
  on<T = unknown>(event: string, callback: EventCallback<T>): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }

    const entry: EventEntry = { callback: callback as EventCallback, once: false };
    this.listeners.get(event)!.push(entry);

    if (this.debugMode) {
      console.log(`📡 EventSystem: Subscribed to "${event}"`);
    }

    // Return unsubscribe function
    return () => this.off(event, callback as EventCallback);
  }

  /**
   * Subscribe to an event (fires only once)
   */
  once<T = unknown>(event: string, callback: EventCallback<T>): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }

    const entry: EventEntry = { callback: callback as EventCallback, once: true };
    this.listeners.get(event)!.push(entry);

    return () => this.off(event, callback as EventCallback);
  }

  /**
   * Unsubscribe from an event
   */
  off(event: string, callback: EventCallback): void {
    const entries = this.listeners.get(event);
    if (!entries) return;

    const index = entries.findIndex(e => e.callback === callback);
    if (index > -1) {
      entries.splice(index, 1);
      
      if (this.debugMode) {
        console.log(`📡 EventSystem: Unsubscribed from "${event}"`);
      }
    }
  }

  /**
   * Emit an event
   */
  emit<T = unknown>(event: string, data?: T): void {
    // Record in history
    this.eventHistory.push({
      event,
      data,
      timestamp: performance.now(),
    });

    // Trim history if needed
    if (this.eventHistory.length > this.maxHistorySize) {
      this.eventHistory.shift();
    }

    if (this.debugMode) {
      console.log(`📡 EventSystem: Emit "${event}"`, data);
    }

    const entries = this.listeners.get(event);
    if (!entries || entries.length === 0) return;

    // Create a copy to avoid issues if callbacks modify listeners
    const entriesCopy = [...entries];

    for (const entry of entriesCopy) {
      try {
        entry.callback(data);
      } catch (error) {
        console.error(`EventSystem: Error in "${event}" handler:`, error);
      }

      // Remove one-time listeners
      if (entry.once) {
        this.off(event, entry.callback);
      }
    }
  }

  /**
   * Remove all listeners for an event
   */
  removeAllListeners(event?: string): void {
    if (event) {
      this.listeners.delete(event);
    } else {
      this.listeners.clear();
    }
  }

  /**
   * Get number of listeners for an event
   */
  listenerCount(event: string): number {
    return this.listeners.get(event)?.length ?? 0;
  }

  /**
   * Get all registered events
   */
  getRegisteredEvents(): string[] {
    return Array.from(this.listeners.keys());
  }

  /**
   * Get event history
   */
  getHistory(): ReadonlyArray<{ event: string; data: unknown; timestamp: number }> {
    return this.eventHistory;
  }

  /**
   * Clear event history
   */
  clearHistory(): void {
    this.eventHistory = [];
  }

  /**
   * Enable/disable debug mode
   */
  setDebugMode(enabled: boolean): void {
    this.debugMode = enabled;
    console.log(`📡 EventSystem: Debug mode ${enabled ? 'enabled' : 'disabled'}`);
  }

  /**
   * Create a scoped event emitter (auto-cleanup)
   */
  createScope(): ScopedEventEmitter {
    return new ScopedEventEmitter(this);
  }
}

/**
 * Scoped event emitter - automatically cleans up subscriptions
 */
class ScopedEventEmitter {
  private unsubscribers: Array<() => void> = [];
  private parent: EventSystemClass;

  constructor(parent: EventSystemClass) {
    this.parent = parent;
  }

  on<T = unknown>(event: string, callback: EventCallback<T>): void {
    const unsub = this.parent.on(event, callback);
    this.unsubscribers.push(unsub);
  }

  once<T = unknown>(event: string, callback: EventCallback<T>): void {
    const unsub = this.parent.once(event, callback);
    this.unsubscribers.push(unsub);
  }

  emit<T = unknown>(event: string, data?: T): void {
    this.parent.emit(event, data);
  }

  /**
   * Clean up all subscriptions from this scope
   */
  destroy(): void {
    for (const unsub of this.unsubscribers) {
      unsub();
    }
    this.unsubscribers = [];
  }
}

// Export singleton instance
export const EventSystem = new EventSystemClass();

// Export types
export type { EventCallback, ScopedEventEmitter };
