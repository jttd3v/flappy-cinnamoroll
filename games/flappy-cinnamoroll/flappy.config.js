/**
 * Flappy Cinnamoroll - Game Configuration
 * 
 * All game-specific constants and settings.
 * Extend BASE_CONFIG for shared defaults.
 * 
 * @module games/flappy-cinnamoroll/flappy.config
 * @version 1.0.0
 */

/**
 * Base configuration (shared across all games)
 */
export const BASE_CONFIG = {
  // Canvas
  CANVAS_WIDTH: 400,
  CANVAS_HEIGHT: 600,
  
  // Physics defaults
  GRAVITY: 0.4,
  MAX_FALL_SPEED: 10,
  
  // Debug
  DEBUG_MODE: false,
  SHOW_HITBOXES: false,
  SHOW_FPS: false
};

/**
 * Flappy Cinnamoroll specific configuration
 */
export const FLAPPY_CONFIG = {
  // Inherit base config
  ...BASE_CONFIG,
  
  // ==========================================
  // PHYSICS
  // ==========================================
  GRAVITY: 0.4,
  FLAP_FORCE: -8,
  MAX_FALL_SPEED: 10,
  
  // ==========================================
  // PLAYER
  // ==========================================
  PLAYER_SIZE: 40,
  PLAYER_X_PERCENT: 0.15,      // 15% from left edge
  
  // ==========================================
  // OBSTACLES (CLOUDS)
  // ==========================================
  BASE_CLOUD_SPEED: 3,
  CLOUD_GAP: 150,              // Gap between top and bottom cloud
  CLOUD_WIDTH: 60,
  SPAWN_INTERVAL: 100,         // Frames between spawns
  
  // Safety bounds for gap position
  MIN_GAP_Y: 80,               // Minimum distance from top
  MAX_GAP_Y_OFFSET: 180,       // Maximum variation
  
  // ==========================================
  // DIFFICULTY SCALING
  // ==========================================
  SPEED_INCREMENT: 0.5,        // Speed increase per milestone
  SPEED_INCREASE_INTERVAL: 5,  // Score interval for speed increase
  MAX_SPEED: 8,                // Maximum cloud speed
  
  // ==========================================
  // GHOST ENEMY
  // ==========================================
  GHOST_SPAWN_SCORE: 5,        // Score when ghost appears
  GHOST_BASE_SPEED: 1.5,
  GHOST_SIZE: 50,
  
  // ==========================================
  // SCORING
  // ==========================================
  POINTS_PER_CLOUD: 1,
  MILESTONE_INTERVAL: 10,      // Play milestone sound every N points
  
  // ==========================================
  // STORAGE
  // ==========================================
  LEADERBOARD_KEY: 'cinnamorollLeaderboard',
  LEADERBOARD_MAX_ENTRIES: 5,
  
  // ==========================================
  // VISUAL
  // ==========================================
  SKY_COLOR_TOP: '#87CEEB',
  SKY_COLOR_BOTTOM: '#E0F6FF',
  CLOUD_COLOR: '#FFFFFF',
  
  // Background clouds
  BG_CLOUDS: [
    { x: 50, y: 100, size: 60, speed: 0.3 },
    { x: 280, y: 180, size: 45, speed: 0.5 },
    { x: 150, y: 400, size: 55, speed: 0.4 },
    { x: 320, y: 500, size: 40, speed: 0.6 },
    { x: 400, y: 300, size: 50, speed: 0.35 }
  ]
};

/**
 * Game state constants
 */
export const GAME_STATE = Object.freeze({
  NAME_ENTRY: -1,
  IDLE: 0,
  PLAYING: 1,
  PAUSED: 2,
  GAME_OVER: 3
});

export default FLAPPY_CONFIG;
