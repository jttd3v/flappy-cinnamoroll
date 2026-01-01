/**
 * InputManager.js - Unified Input Handling System
 * 
 * Handles keyboard, mouse, and touch input in a unified way.
 * Supports action mapping for game-agnostic input handling.
 * 
 * @module core/input/InputManager
 * @version 1.0.0
 */

import { EventSystem, GameEvents } from '../engine/EventSystem.js';

/**
 * Input action mapping
 * @typedef {Object} ActionBinding
 * @property {string[]} keys - Keyboard keys (e.g., ['Space', 'ArrowUp'])
 * @property {boolean} mouse - Mouse click triggers this action
 * @property {boolean} touch - Touch triggers this action
 */

/**
 * Default input actions for games
 * @readonly
 * @enum {string}
 */
export const InputActions = Object.freeze({
  JUMP: 'jump',
  FLAP: 'flap',
  MOVE_LEFT: 'moveLeft',
  MOVE_RIGHT: 'moveRight',
  MOVE_UP: 'moveUp',
  MOVE_DOWN: 'moveDown',
  PAUSE: 'pause',
  CONFIRM: 'confirm',
  CANCEL: 'cancel',
  RESTART: 'restart',
  PRIMARY_ACTION: 'primaryAction'
});

/**
 * Unified input manager
 */
export class InputManager {
  /**
   * Create input manager
   * @param {HTMLElement} target - Target element for input events
   */
  constructor(target) {
    /** @type {HTMLElement} */
    this.target = target;
    
    /** @type {Set<string>} Currently pressed keys */
    this.keysDown = new Set();
    
    /** @type {boolean} Is mouse/touch currently pressed */
    this.pointerDown = false;
    
    /** @type {{x: number, y: number}} Current pointer position */
    this.pointerPosition = { x: 0, y: 0 };
    
    /** @type {Map<string, ActionBinding>} Action to input mapping */
    this.actionMap = new Map();
    
    /** @type {Map<string, Function[]>} Action callbacks */
    this.actionCallbacks = new Map();
    
    /** @type {boolean} Is input manager active */
    this.enabled = true;
    
    /** @type {boolean} Prevent default behavior */
    this.preventDefault = true;
    
    // Bind event handlers
    this._onKeyDown = this._onKeyDown.bind(this);
    this._onKeyUp = this._onKeyUp.bind(this);
    this._onMouseDown = this._onMouseDown.bind(this);
    this._onMouseUp = this._onMouseUp.bind(this);
    this._onMouseMove = this._onMouseMove.bind(this);
    this._onTouchStart = this._onTouchStart.bind(this);
    this._onTouchEnd = this._onTouchEnd.bind(this);
    this._onTouchMove = this._onTouchMove.bind(this);
    
    // Setup default action mappings
    this._setupDefaultMappings();
  }
  
  // ==========================================
  // INITIALIZATION
  // ==========================================
  
  /**
   * Initialize and attach event listeners
   */
  init() {
    // Keyboard events (document-level)
    document.addEventListener('keydown', this._onKeyDown);
    document.addEventListener('keyup', this._onKeyUp);
    
    // Mouse events
    this.target.addEventListener('mousedown', this._onMouseDown);
    this.target.addEventListener('mouseup', this._onMouseUp);
    this.target.addEventListener('mousemove', this._onMouseMove);
    
    // Touch events
    this.target.addEventListener('touchstart', this._onTouchStart, { passive: false });
    this.target.addEventListener('touchend', this._onTouchEnd);
    this.target.addEventListener('touchmove', this._onTouchMove, { passive: false });
    
    console.log('🎮 InputManager initialized');
  }
  
  /**
   * Remove all event listeners
   */
  destroy() {
    document.removeEventListener('keydown', this._onKeyDown);
    document.removeEventListener('keyup', this._onKeyUp);
    
    this.target.removeEventListener('mousedown', this._onMouseDown);
    this.target.removeEventListener('mouseup', this._onMouseUp);
    this.target.removeEventListener('mousemove', this._onMouseMove);
    
    this.target.removeEventListener('touchstart', this._onTouchStart);
    this.target.removeEventListener('touchend', this._onTouchEnd);
    this.target.removeEventListener('touchmove', this._onTouchMove);
    
    this.keysDown.clear();
    this.actionCallbacks.clear();
    
    console.log('🎮 InputManager destroyed');
  }
  
  /**
   * Setup default action mappings
   * @private
   */
  _setupDefaultMappings() {
    // Jump/Flap action
    this.mapAction(InputActions.JUMP, {
      keys: ['Space', 'ArrowUp', 'KeyW'],
      mouse: true,
      touch: true
    });
    
    this.mapAction(InputActions.FLAP, {
      keys: ['Space', 'ArrowUp', 'KeyW'],
      mouse: true,
      touch: true
    });
    
    // Movement
    this.mapAction(InputActions.MOVE_LEFT, {
      keys: ['ArrowLeft', 'KeyA'],
      mouse: false,
      touch: false
    });
    
    this.mapAction(InputActions.MOVE_RIGHT, {
      keys: ['ArrowRight', 'KeyD'],
      mouse: false,
      touch: false
    });
    
    this.mapAction(InputActions.MOVE_UP, {
      keys: ['ArrowUp', 'KeyW'],
      mouse: false,
      touch: false
    });
    
    this.mapAction(InputActions.MOVE_DOWN, {
      keys: ['ArrowDown', 'KeyS'],
      mouse: false,
      touch: false
    });
    
    // UI actions
    this.mapAction(InputActions.PAUSE, {
      keys: ['Escape', 'KeyP'],
      mouse: false,
      touch: false
    });
    
    this.mapAction(InputActions.CONFIRM, {
      keys: ['Enter', 'Space'],
      mouse: true,
      touch: true
    });
    
    this.mapAction(InputActions.CANCEL, {
      keys: ['Escape', 'Backspace'],
      mouse: false,
      touch: false
    });
    
    this.mapAction(InputActions.PRIMARY_ACTION, {
      keys: ['Space'],
      mouse: true,
      touch: true
    });
  }
  
  // ==========================================
  // ACTION MAPPING
  // ==========================================
  
  /**
   * Map an action to input types
   * @param {string} action - Action name
   * @param {ActionBinding} binding - Input binding
   */
  mapAction(action, binding) {
    this.actionMap.set(action, binding);
  }
  
  /**
   * Register callback for action
   * @param {string} action - Action name
   * @param {Function} callback - Callback function
   * @returns {Function} Unsubscribe function
   */
  onAction(action, callback) {
    if (!this.actionCallbacks.has(action)) {
      this.actionCallbacks.set(action, []);
    }
    
    this.actionCallbacks.get(action).push(callback);
    
    // Return unsubscribe function
    return () => {
      const callbacks = this.actionCallbacks.get(action);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    };
  }
  
  /**
   * Trigger action callbacks
   * @private
   */
  _triggerAction(action, data = {}) {
    if (!this.enabled) return;
    
    const callbacks = this.actionCallbacks.get(action);
    if (callbacks) {
      callbacks.forEach(cb => cb(data));
    }
    
    // Also emit via EventSystem
    EventSystem.emit(GameEvents.INPUT_ACTION, { action, ...data });
  }
  
  // ==========================================
  // EVENT HANDLERS
  // ==========================================
  
  /**
   * Handle key down
   * @private
   */
  _onKeyDown(e) {
    if (!this.enabled) return;
    
    const key = e.code;
    
    // Avoid repeated key events
    if (this.keysDown.has(key)) return;
    
    this.keysDown.add(key);
    
    // Check which actions this key triggers
    this.actionMap.forEach((binding, action) => {
      if (binding.keys && binding.keys.includes(key)) {
        if (this.preventDefault && ['Space', 'ArrowUp', 'ArrowDown'].includes(key)) {
          e.preventDefault();
        }
        this._triggerAction(action, { type: 'keyboard', key });
      }
    });
    
    EventSystem.emit(GameEvents.KEY_DOWN, { key });
  }
  
  /**
   * Handle key up
   * @private
   */
  _onKeyUp(e) {
    this.keysDown.delete(e.code);
    EventSystem.emit(GameEvents.KEY_UP, { key: e.code });
  }
  
  /**
   * Handle mouse down
   * @private
   */
  _onMouseDown(e) {
    if (!this.enabled) return;
    
    this.pointerDown = true;
    this._updatePointerPosition(e);
    
    // Check which actions mouse triggers
    this.actionMap.forEach((binding, action) => {
      if (binding.mouse) {
        this._triggerAction(action, { 
          type: 'mouse',
          x: this.pointerPosition.x,
          y: this.pointerPosition.y
        });
      }
    });
    
    EventSystem.emit(GameEvents.TOUCH_START, this.pointerPosition);
  }
  
  /**
   * Handle mouse up
   * @private
   */
  _onMouseUp(e) {
    this.pointerDown = false;
    EventSystem.emit(GameEvents.TOUCH_END, this.pointerPosition);
  }
  
  /**
   * Handle mouse move
   * @private
   */
  _onMouseMove(e) {
    this._updatePointerPosition(e);
  }
  
  /**
   * Handle touch start
   * @private
   */
  _onTouchStart(e) {
    if (!this.enabled) return;
    
    if (this.preventDefault) {
      e.preventDefault();
    }
    
    this.pointerDown = true;
    
    if (e.touches.length > 0) {
      this._updatePointerPositionFromTouch(e.touches[0]);
    }
    
    // Check which actions touch triggers
    this.actionMap.forEach((binding, action) => {
      if (binding.touch) {
        this._triggerAction(action, { 
          type: 'touch',
          x: this.pointerPosition.x,
          y: this.pointerPosition.y
        });
      }
    });
    
    EventSystem.emit(GameEvents.TOUCH_START, this.pointerPosition);
  }
  
  /**
   * Handle touch end
   * @private
   */
  _onTouchEnd(e) {
    this.pointerDown = false;
    EventSystem.emit(GameEvents.TOUCH_END, this.pointerPosition);
  }
  
  /**
   * Handle touch move
   * @private
   */
  _onTouchMove(e) {
    if (this.preventDefault) {
      e.preventDefault();
    }
    
    if (e.touches.length > 0) {
      this._updatePointerPositionFromTouch(e.touches[0]);
    }
  }
  
  /**
   * Update pointer position from mouse event
   * @private
   */
  _updatePointerPosition(e) {
    const rect = this.target.getBoundingClientRect();
    this.pointerPosition.x = e.clientX - rect.left;
    this.pointerPosition.y = e.clientY - rect.top;
  }
  
  /**
   * Update pointer position from touch
   * @private
   */
  _updatePointerPositionFromTouch(touch) {
    const rect = this.target.getBoundingClientRect();
    this.pointerPosition.x = touch.clientX - rect.left;
    this.pointerPosition.y = touch.clientY - rect.top;
  }
  
  // ==========================================
  // STATE QUERIES
  // ==========================================
  
  /**
   * Check if a key is currently pressed
   * @param {string} key - Key code (e.g., 'Space', 'ArrowUp')
   * @returns {boolean}
   */
  isKeyDown(key) {
    return this.keysDown.has(key);
  }
  
  /**
   * Check if any of the specified keys are pressed
   * @param {string[]} keys - Array of key codes
   * @returns {boolean}
   */
  isAnyKeyDown(keys) {
    return keys.some(key => this.keysDown.has(key));
  }
  
  /**
   * Check if an action is currently active (held down)
   * @param {string} action - Action name
   * @returns {boolean}
   */
  isActionActive(action) {
    const binding = this.actionMap.get(action);
    if (!binding) return false;
    
    // Check keys
    if (binding.keys && binding.keys.some(k => this.keysDown.has(k))) {
      return true;
    }
    
    // Check pointer (mouse/touch)
    if ((binding.mouse || binding.touch) && this.pointerDown) {
      return true;
    }
    
    return false;
  }
  
  /**
   * Get current pointer position
   * @returns {{x: number, y: number}}
   */
  getPointerPosition() {
    return { ...this.pointerPosition };
  }
  
  /**
   * Check if pointer is down
   * @returns {boolean}
   */
  isPointerDown() {
    return this.pointerDown;
  }
  
  // ==========================================
  // CONTROL
  // ==========================================
  
  /**
   * Enable input handling
   */
  enable() {
    this.enabled = true;
  }
  
  /**
   * Disable input handling
   */
  disable() {
    this.enabled = false;
    this.keysDown.clear();
    this.pointerDown = false;
  }
  
  /**
   * Clear all current input state
   */
  clearState() {
    this.keysDown.clear();
    this.pointerDown = false;
  }
}

export default InputManager;
