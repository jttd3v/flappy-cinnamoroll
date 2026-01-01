/**
 * Core Module Index
 * 
 * Barrel export for all core modules.
 * Import from here for convenience.
 * 
 * @module core
 * @version 1.0.0
 * 
 * @example
 * import { GameEngine, PhysicsEngine, SoundManager } from './core';
 */

// Engine
export { GameEngine, GameState } from './engine/GameEngine.js';
export { EventSystem, GameEvents } from './engine/EventSystem.js';

// Physics
export { PhysicsEngine } from './physics/PhysicsEngine.js';
export { Collision } from './physics/Collision.js';
export { Bounds } from './physics/Bounds.js';

// Audio
export { SoundManager, SoundType, soundManager } from './audio/SoundManager.js';

// Input
export { InputManager, InputActions } from './input/InputManager.js';

// Storage
export { Leaderboard } from './storage/Leaderboard.js';

// Rendering
export { CanvasRenderer } from './rendering/CanvasRenderer.js';

// Utils
export { MathUtils } from './utils/MathUtils.js';

// Version info
export const VERSION = '1.0.0';
export const CORE_NAME = 'Cinnamoroll Game Engine';
