/**
 * GameEngine.js - Base Game Engine Class
 * 
 * Core game loop and state management that all game cards inherit from.
 * Provides lifecycle hooks, state machine, and entity management.
 * 
 * @module core/engine/GameEngine
 * @version 1.0.0
 */

import { EventSystem, GameEvents } from './EventSystem.js';

/**
 * Game state constants
 * @readonly
 * @enum {number}
 */
export const GameState = Object.freeze({
  LOADING: -2,
  NAME_ENTRY: -1,
  IDLE: 0,
  PLAYING: 1,
  PAUSED: 2,
  GAME_OVER: 3
});

/**
 * Base game engine class
 * Extend this class to create new game cards
 */
export class GameEngine {
  /**
   * Create a new game engine instance
   * @param {Object} config - Game configuration object
   * @param {string} canvasId - Canvas element ID
   */
  constructor(config, canvasId = 'gameCanvas') {
    // Configuration
    this.config = config;
    
    // Canvas setup
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas?.getContext('2d');
    
    if (!this.ctx) {
      throw new Error(`Canvas context not available for: ${canvasId}`);
    }
    
    // Set canvas dimensions from config
    this.canvas.width = config.CANVAS_WIDTH || 400;
    this.canvas.height = config.CANVAS_HEIGHT || 600;
    
    // Game state
    this._state = GameState.IDLE;
    this._previousState = null;
    
    // Timing
    this._lastTimestamp = 0;
    this._deltaTime = 0;
    this._frameCount = 0;
    this._rafId = null;
    this._isPaused = false;
    
    // Entities and systems
    this.entities = [];
    this.systems = [];
    
    // Score
    this.score = 0;
    this.highScore = 0;
    
    // Bind methods
    this._gameLoop = this._gameLoop.bind(this);
  }
  
  // ==========================================
  // STATE MANAGEMENT
  // ==========================================
  
  /**
   * Get current game state
   * @returns {number} Current state
   */
  get state() {
    return this._state;
  }
  
  /**
   * Set game state with event emission
   * @param {number} newState - New game state
   */
  set state(newState) {
    if (this._state === newState) return;
    
    this._previousState = this._state;
    this._state = newState;
    
    EventSystem.emit(GameEvents.STATE_CHANGE, {
      from: this._previousState,
      to: this._state
    });
    
    // Call appropriate lifecycle hook
    switch (newState) {
      case GameState.PLAYING:
        this.onStart();
        break;
      case GameState.PAUSED:
        this.onPause();
        break;
      case GameState.GAME_OVER:
        this.onGameOver();
        break;
      case GameState.IDLE:
        if (this._previousState === GameState.PAUSED) {
          this.onResume();
        }
        break;
    }
  }
  
  /**
   * Check if game is currently playing
   * @returns {boolean}
   */
  get isPlaying() {
    return this._state === GameState.PLAYING;
  }
  
  /**
   * Check if game is paused
   * @returns {boolean}
   */
  get isPaused() {
    return this._state === GameState.PAUSED;
  }
  
  // ==========================================
  // LIFECYCLE HOOKS (Override in subclasses)
  // ==========================================
  
  /**
   * Called once when game initializes
   * Override to set up initial game objects
   */
  onInit() {
    // Override in subclass
  }
  
  /**
   * Called when game starts (IDLE -> PLAYING)
   */
  onStart() {
    EventSystem.emit(GameEvents.GAME_START, { score: this.score });
  }
  
  /**
   * Called every frame during PLAYING state
   * @param {number} deltaTime - Time since last frame in ms
   */
  onUpdate(deltaTime) {
    // Override in subclass
  }
  
  /**
   * Called every frame to render
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   */
  onRender(ctx) {
    // Override in subclass
  }
  
  /**
   * Called when game is paused
   */
  onPause() {
    EventSystem.emit(GameEvents.GAME_PAUSE);
  }
  
  /**
   * Called when game resumes from pause
   */
  onResume() {
    EventSystem.emit(GameEvents.GAME_RESUME);
  }
  
  /**
   * Called when game ends
   */
  onGameOver() {
    EventSystem.emit(GameEvents.GAME_OVER, { 
      score: this.score,
      highScore: this.highScore
    });
  }
  
  /**
   * Called when game resets
   */
  onReset() {
    // Override in subclass
  }
  
  // ==========================================
  // GAME LOOP
  // ==========================================
  
  /**
   * Internal game loop
   * @private
   */
  _gameLoop(timestamp) {
    // Calculate delta time
    this._deltaTime = timestamp - this._lastTimestamp;
    this._lastTimestamp = timestamp;
    this._frameCount++;
    
    // Update (only when playing)
    if (this._state === GameState.PLAYING) {
      this.onUpdate(this._deltaTime);
    }
    
    // Always render
    this.onRender(this.ctx);
    
    // Continue loop
    this._rafId = requestAnimationFrame(this._gameLoop);
  }
  
  /**
   * Start the game loop
   */
  start() {
    if (this._rafId) return; // Already running
    
    this.onInit();
    this._lastTimestamp = performance.now();
    this._rafId = requestAnimationFrame(this._gameLoop);
    
    console.log('🎮 Game engine started');
  }
  
  /**
   * Stop the game loop
   */
  stop() {
    if (this._rafId) {
      cancelAnimationFrame(this._rafId);
      this._rafId = null;
    }
    console.log('🎮 Game engine stopped');
  }
  
  /**
   * Pause the game
   */
  pause() {
    if (this._state === GameState.PLAYING) {
      this.state = GameState.PAUSED;
    }
  }
  
  /**
   * Resume the game
   */
  resume() {
    if (this._state === GameState.PAUSED) {
      this.state = GameState.PLAYING;
    }
  }
  
  /**
   * Reset game to initial state
   */
  reset() {
    this.score = 0;
    this._frameCount = 0;
    this.entities = [];
    this.state = GameState.IDLE;
    this.onReset();
  }
  
  // ==========================================
  // ENTITY MANAGEMENT
  // ==========================================
  
  /**
   * Add an entity to the game
   * @param {Object} entity - Entity to add
   */
  addEntity(entity) {
    this.entities.push(entity);
    return entity;
  }
  
  /**
   * Remove an entity from the game
   * @param {Object} entity - Entity to remove
   */
  removeEntity(entity) {
    const index = this.entities.indexOf(entity);
    if (index > -1) {
      this.entities.splice(index, 1);
    }
  }
  
  /**
   * Get entities by type
   * @param {string} type - Entity type to filter
   * @returns {Array} Matching entities
   */
  getEntitiesByType(type) {
    return this.entities.filter(e => e.type === type);
  }
  
  /**
   * Clear all entities
   */
  clearEntities() {
    this.entities.length = 0;
  }
  
  // ==========================================
  // UTILITY METHODS
  // ==========================================
  
  /**
   * Get current frame count
   * @returns {number}
   */
  get frameCount() {
    return this._frameCount;
  }
  
  /**
   * Get time since last frame
   * @returns {number} Delta time in ms
   */
  get deltaTime() {
    return this._deltaTime;
  }
  
  /**
   * Clear the canvas
   * @param {string} [color] - Optional fill color
   */
  clearCanvas(color) {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    if (color) {
      this.ctx.fillStyle = color;
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
  }
  
  /**
   * Update high score if current score is higher
   */
  updateHighScore() {
    if (this.score > this.highScore) {
      this.highScore = this.score;
      EventSystem.emit(GameEvents.HIGH_SCORE, { highScore: this.highScore });
    }
  }
  
  /**
   * Increment score
   * @param {number} [amount=1] - Amount to add
   */
  addScore(amount = 1) {
    this.score += amount;
    EventSystem.emit(GameEvents.SCORE_UPDATE, { score: this.score });
  }
}

export default GameEngine;
