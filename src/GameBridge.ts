/**
 * Game Integration Bridge
 * 
 * This module bridges the new TypeScript infrastructure with the existing
 * vanilla JavaScript game code. It provides a simple API that the existing
 * index.html can use without major refactoring.
 * 
 * @module GameBridge
 * @version 2.0.0
 */

import { EventSystem, GameEvents } from './core/engine/EventSystem';
import { GameLoop, createGameLoop, type FrameInfo } from './core/engine/GameLoop';
import { visibilityManager } from './core/engine/VisibilityManager';
import { PhysicsSystem, createPhysicsSystem, type PhysicsBody } from './core/physics/PhysicsSystem';
import { audioManager, SoundType } from './core/audio/AudioManager';
import { sqliteManager } from './core/storage/SQLiteManager';
import { animationManager } from './core/ui/AnimationManager';
import { effectsManager } from './core/ui/EffectsManager';
import { PauseOverlay, createPauseOverlay } from './core/ui/PauseOverlay';

/**
 * Legacy-compatible game bridge
 * Exposes new functionality through a simple global API
 */
export class GameBridge {
  private gameLoop: GameLoop | null = null;
  private physics: PhysicsSystem | null = null;
  private pauseOverlay: PauseOverlay | null = null;
  private isInitialized = false;

  /**
   * Initialize all game systems
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    console.log('[GameBridge] Initializing game systems...');

    // Initialize SQLite database
    try {
      await sqliteManager.init();
      console.log('[GameBridge] SQLite initialized');
    } catch (error) {
      console.warn('[GameBridge] SQLite initialization failed, using fallback:', error);
    }

    // Initialize audio manager
    await audioManager.init();
    console.log('[GameBridge] Audio manager initialized');

    // Create game loop with proper delta time handling
    this.gameLoop = createGameLoop({
      maxDeltaTime: 100,
      fixedTimestep: 16.67, // 60fps target
    });

    // Create physics system
    this.physics = createPhysicsSystem({
      gravity: 0.5,
      maxVelocityY: 12,
    });

    // Initialize visibility manager (auto-pause on tab switch)
    visibilityManager.init();

    this.isInitialized = true;
    console.log('[GameBridge] All systems initialized');
  }

  /**
   * Create pause overlay for a game
   */
  createPauseMenu(container: HTMLElement, callbacks: {
    onResume?: () => void;
    onRestart?: () => void;
    onQuit?: () => void;
  }): PauseOverlay {
    this.pauseOverlay = createPauseOverlay({
      container,
      onResume: callbacks.onResume,
      onRestart: callbacks.onRestart,
      onQuit: callbacks.onQuit,
    });
    return this.pauseOverlay;
  }

  /**
   * Start the game loop with legacy update/render functions
   */
  startGameLoop(
    updateFn: (deltaTime: number, frameInfo: FrameInfo) => void,
    renderFn: (deltaTime: number, frameInfo: FrameInfo) => void
  ): void {
    if (!this.gameLoop) {
      console.error('[GameBridge] Game loop not initialized');
      return;
    }

    this.gameLoop.onUpdate((frameInfo) => {
      updateFn(frameInfo.deltaTime, frameInfo);
    });

    this.gameLoop.onRender((frameInfo) => {
      renderFn(frameInfo.deltaTime, frameInfo);
    });

    this.gameLoop.start();
  }

  /**
   * Stop the game loop
   */
  stopGameLoop(): void {
    this.gameLoop?.stop();
  }

  /**
   * Pause/resume game
   */
  pauseGame(): void {
    this.gameLoop?.pause();
    this.pauseOverlay?.show();
  }

  resumeGame(): void {
    this.pauseOverlay?.hide();
    this.gameLoop?.resume();
  }

  togglePause(): boolean {
    const isPaused = this.gameLoop?.togglePause() ?? false;
    if (isPaused) {
      this.pauseOverlay?.show();
    } else {
      this.pauseOverlay?.hide();
    }
    return isPaused;
  }

  /**
   * Physics helpers - use these instead of raw calculations
   */
  applyGravity(body: PhysicsBody, deltaTime: number): void {
    this.physics?.applyGravity(body, deltaTime);
  }

  applyVelocity(body: PhysicsBody, deltaTime: number): void {
    this.physics?.applyVelocity(body, deltaTime);
  }

  applyImpulse(body: PhysicsBody, impulseX: number, impulseY: number): void {
    this.physics?.applyImpulse(body, impulseX, impulseY);
  }

  checkCloudCollision(
    player: PhysicsBody,
    cloudX: number,
    cloudWidth: number,
    gapY: number,
    gapHeight: number,
    canvasHeight: number
  ): boolean {
    return PhysicsSystem.checkCloudGapCollision(
      player,
      cloudX,
      cloudWidth,
      gapY,
      gapHeight,
      canvasHeight,
      0.7 // 70% forgiveness factor
    );
  }

  /**
   * Audio helpers
   */
  playSound(type: keyof typeof SoundType): void {
    audioManager.play(type);
  }

  setMasterVolume(volume: number): void {
    audioManager.setMasterVolume(volume);
  }

  /**
   * Visual effects
   */
  scorePopup(element: HTMLElement, x: number, y: number): void {
    animationManager.scorePopup(element, x, y);
  }

  celebrateScore(milestone: number): void {
    if (milestone >= 100) {
      effectsManager.fireworks();
    } else if (milestone >= 50) {
      effectsManager.victory();
    } else if (milestone >= 10) {
      effectsManager.scoreMilestone(milestone);
    }
  }

  celebrateHighScore(): void {
    effectsManager.highScore();
  }

  celebrateAchievement(): void {
    effectsManager.achievement();
  }

  /**
   * Database operations
   */
  async saveScore(playerId: number, gameId: string, score: number): Promise<void> {
    sqliteManager.addScore(playerId, gameId, score);
  }

  async getHighScores(gameId: string, limit = 10): Promise<any[]> {
    return sqliteManager.getHighScores(gameId, limit);
  }

  async getPlayerBestScore(playerId: number, gameId: string): Promise<number> {
    return sqliteManager.getPlayerBestScore(playerId, gameId);
  }

  /**
   * Event system - for custom game events
   */
  on(event: string, callback: (data?: any) => void): () => void {
    return EventSystem.on(event, callback);
  }

  emit(event: string, data?: any): void {
    EventSystem.emit(event, data);
  }

  /**
   * Pre-defined game events
   */
  emitGameStart(): void {
    EventSystem.emit(GameEvents.GAME_START);
  }

  emitGameOver(score: number): void {
    EventSystem.emit(GameEvents.GAME_OVER, { score });
  }

  emitScoreChange(score: number, highScore: number): void {
    EventSystem.emit(GameEvents.SCORE_UPDATE, { score, highScore });
  }

  /**
   * Cleanup
   */
  destroy(): void {
    this.gameLoop?.destroy();
    this.pauseOverlay?.destroy();
    EventSystem.removeAllListeners();
    this.isInitialized = false;
  }
}

// Create singleton instance
export const gameBridge = new GameBridge();

// Expose to window for legacy scripts
declare global {
  interface Window {
    GameBridge: typeof gameBridge;
  }
}

if (typeof window !== 'undefined') {
  window.GameBridge = gameBridge;
}
