/**
 * Core Module Exports
 * 
 * Central export file for all core modules.
 * Import from '@core' or './src/core' to access all functionality.
 * 
 * @module core
 * @version 2.0.0
 */

// Engine
export { EventSystem, GameEvents, type EventCallback, type ScopedEventEmitter } from './engine/EventSystem';
export { GameLoop, createGameLoop, type GameLoopConfig, type FrameInfo, type UpdateCallback, type RenderCallback } from './engine/GameLoop';
export { VisibilityManager, visibilityManager, type VisibilityState } from './engine/VisibilityManager';

// Physics
export { 
  PhysicsSystem, 
  createPhysicsSystem, 
  DEFAULT_PHYSICS_CONFIG,
  type PhysicsBody, 
  type PhysicsConfig,
  type Vector2,
  type Rectangle,
  type Circle,
} from './physics/PhysicsSystem';

// Audio
export { 
  AudioManager, 
  audioManager,
  SoundType,
  type SoundDefinition,
  type AudioConfig,
  type SoundTypeKey,
} from './audio/AudioManager';

// Storage
export { 
  SQLiteManager, 
  sqliteManager,
  type PlayerRecord,
  type ScoreRecord,
  type AchievementRecord,
} from './storage/SQLiteManager';

// UI
export { AnimationManager, animationManager, AnimationPresets, type AnimationOptions } from './ui/AnimationManager';
export { EffectsManager, effectsManager, ColorPalettes, type ConfettiOptions } from './ui/EffectsManager';
export { PauseOverlay, createPauseOverlay, type PauseOverlayOptions } from './ui/PauseOverlay';
