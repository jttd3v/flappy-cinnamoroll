/**
 * EventSystem.js - Pub/Sub Event System
 * 
 * Decoupled event-driven communication between game systems.
 * Allows components to communicate without direct references.
 * 
 * @module core/engine/EventSystem
 * @version 1.0.0
 */

/**
 * Predefined game events
 * @readonly
 * @enum {string}
 */
export const GameEvents = Object.freeze({
  // Lifecycle events
  GAME_INIT: 'game:init',
  GAME_START: 'game:start',
  GAME_PAUSE: 'game:pause',
  GAME_RESUME: 'game:resume',
  GAME_OVER: 'game:over',
  GAME_RESET: 'game:reset',
  STATE_CHANGE: 'game:stateChange',
  
  // Player events
  PLAYER_JUMP: 'player:jump',
  PLAYER_MOVE: 'player:move',
  PLAYER_HIT: 'player:hit',
  PLAYER_DEATH: 'player:death',
  PLAYER_SPAWN: 'player:spawn',
  
  // Score events
  SCORE_UPDATE: 'score:update',
  HIGH_SCORE: 'score:highScore',
  MILESTONE: 'score:milestone',
  
  // Level events
  LEVEL_UP: 'level:up',
  LEVEL_START: 'level:start',
  LEVEL_COMPLETE: 'level:complete',
  SPEED_UP: 'level:speedUp',
  
  // Entity events
  ENTITY_SPAWN: 'entity:spawn',
  ENTITY_DESTROY: 'entity:destroy',
  COLLISION: 'entity:collision',
  
  // Enemy events
  ENEMY_SPAWN: 'enemy:spawn',
  ENEMY_DEATH: 'enemy:death',
  GHOST_SPAWN: 'enemy:ghostSpawn',
  
  // UI events
  UI_CLICK: 'ui:click',
  MODAL_OPEN: 'ui:modalOpen',
  MODAL_CLOSE: 'ui:modalClose',
  BUTTON_PRESS: 'ui:buttonPress',
  
  // Audio events
  SOUND_PLAY: 'audio:play',
  SOUND_STOP: 'audio:stop',
  MUSIC_START: 'audio:musicStart',
  MUSIC_STOP: 'audio:musicStop',
  
  // Input events
  INPUT_ACTION: 'input:action',
  TOUCH_START: 'input:touchStart',
  TOUCH_END: 'input:touchEnd',
  KEY_DOWN: 'input:keyDown',
  KEY_UP: 'input:keyUp'
});

/**
 * Event listener entry
 * @typedef {Object} ListenerEntry
 * @property {Function} callback - Event handler function
 * @property {Object} [context] - Optional 'this' context
 * @property {boolean} [once] - If true, remove after first call
 */

/**
 * Static event system for game-wide communication
 */
export class EventSystem {
  /** @type {Map<string, ListenerEntry[]>} */
  static _listeners = new Map();
  
  /** @type {boolean} Enable debug logging */
  static debug = false;
  
  /**
   * Subscribe to an event
   * @param {string} event - Event name
   * @param {Function} callback - Handler function
   * @param {Object} [context] - Optional 'this' context for callback
   * @returns {Function} Unsubscribe function
   */
  static on(event, callback, context = null) {
    if (typeof callback !== 'function') {
      console.warn(`EventSystem: callback for "${event}" is not a function`);
      return () => {};
    }
    
    if (!this._listeners.has(event)) {
      this._listeners.set(event, []);
    }
    
    const entry = { callback, context, once: false };
    this._listeners.get(event).push(entry);
    
    if (this.debug) {
      console.log(`📡 EventSystem: Subscribed to "${event}"`);
    }
    
    // Return unsubscribe function
    return () => this.off(event, callback);
  }
  
  /**
   * Subscribe to an event (fires once then auto-unsubscribes)
   * @param {string} event - Event name
   * @param {Function} callback - Handler function
   * @param {Object} [context] - Optional 'this' context
   * @returns {Function} Unsubscribe function
   */
  static once(event, callback, context = null) {
    if (typeof callback !== 'function') {
      console.warn(`EventSystem: callback for "${event}" is not a function`);
      return () => {};
    }
    
    if (!this._listeners.has(event)) {
      this._listeners.set(event, []);
    }
    
    const entry = { callback, context, once: true };
    this._listeners.get(event).push(entry);
    
    return () => this.off(event, callback);
  }
  
  /**
   * Unsubscribe from an event
   * @param {string} event - Event name
   * @param {Function} callback - Handler to remove
   */
  static off(event, callback) {
    if (!this._listeners.has(event)) return;
    
    const listeners = this._listeners.get(event);
    const index = listeners.findIndex(entry => entry.callback === callback);
    
    if (index > -1) {
      listeners.splice(index, 1);
      
      if (this.debug) {
        console.log(`📡 EventSystem: Unsubscribed from "${event}"`);
      }
    }
    
    // Cleanup empty arrays
    if (listeners.length === 0) {
      this._listeners.delete(event);
    }
  }
  
  /**
   * Emit an event to all subscribers
   * @param {string} event - Event name
   * @param {*} [data] - Data to pass to handlers
   */
  static emit(event, data = null) {
    if (!this._listeners.has(event)) {
      if (this.debug) {
        console.log(`📡 EventSystem: No listeners for "${event}"`);
      }
      return;
    }
    
    if (this.debug) {
      console.log(`📡 EventSystem: Emitting "${event}"`, data);
    }
    
    const listeners = this._listeners.get(event);
    const toRemove = [];
    
    // Call all listeners
    listeners.forEach((entry, index) => {
      try {
        if (entry.context) {
          entry.callback.call(entry.context, data);
        } else {
          entry.callback(data);
        }
        
        // Mark one-time listeners for removal
        if (entry.once) {
          toRemove.push(index);
        }
      } catch (error) {
        console.error(`EventSystem: Error in handler for "${event}"`, error);
      }
    });
    
    // Remove one-time listeners (reverse order to preserve indices)
    for (let i = toRemove.length - 1; i >= 0; i--) {
      listeners.splice(toRemove[i], 1);
    }
    
    // Cleanup empty arrays
    if (listeners.length === 0) {
      this._listeners.delete(event);
    }
  }
  
  /**
   * Remove all listeners for an event
   * @param {string} [event] - Event name (if omitted, clears ALL events)
   */
  static clear(event = null) {
    if (event) {
      this._listeners.delete(event);
      if (this.debug) {
        console.log(`📡 EventSystem: Cleared all listeners for "${event}"`);
      }
    } else {
      this._listeners.clear();
      if (this.debug) {
        console.log('📡 EventSystem: Cleared ALL listeners');
      }
    }
  }
  
  /**
   * Check if an event has any listeners
   * @param {string} event - Event name
   * @returns {boolean}
   */
  static hasListeners(event) {
    return this._listeners.has(event) && this._listeners.get(event).length > 0;
  }
  
  /**
   * Get number of listeners for an event
   * @param {string} event - Event name
   * @returns {number}
   */
  static listenerCount(event) {
    if (!this._listeners.has(event)) return 0;
    return this._listeners.get(event).length;
  }
  
  /**
   * Get list of all registered events
   * @returns {string[]}
   */
  static getEvents() {
    return Array.from(this._listeners.keys());
  }
  
  /**
   * Enable/disable debug mode
   * @param {boolean} enabled
   */
  static setDebug(enabled) {
    this.debug = enabled;
  }
}

export default EventSystem;
