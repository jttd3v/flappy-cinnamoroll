/**
 * Flappy Cinnamoroll - Game Integration Module
 * 
 * This module provides the integration layer between the new TypeScript
 * infrastructure and the legacy vanilla JavaScript game in index.html.
 * 
 * Usage in index.html:
 *   <script type="module" src="/src/flappy-integration.ts"></script>
 * 
 * @module flappy-integration
 * @version 2.0.0
 */

import { gameBridge } from './GameBridge';
import { EventSystem, GameEvents } from './core/engine/EventSystem';
import { effectsManager } from './core/ui/EffectsManager';
import { animationManager } from './core/ui/AnimationManager';

// Export for global access
export { gameBridge, EventSystem, GameEvents, effectsManager, animationManager };

/**
 * Initialize game systems when DOM is ready
 */
async function initializeFlappyGame(): Promise<void> {
  console.log('🎮 Initializing Flappy Cinnamoroll v2.0...');

  try {
    // Initialize the game bridge (audio, visibility, etc.)
    await gameBridge.initialize();

    // Make the bridge available globally for legacy code
    (window as any).FlappyBridge = {
      // Celebrate score milestones
      celebrateScore: (score: number) => {
        gameBridge.celebrateScore(score);
      },

      // Play high score celebration
      celebrateHighScore: () => {
        gameBridge.celebrateHighScore();
      },

      // Pause game
      pause: () => {
        gameBridge.pauseGame();
      },

      // Resume game
      resume: () => {
        gameBridge.resumeGame();
      },

      // Toggle pause
      togglePause: () => {
        return gameBridge.togglePause();
      },

      // Play sound effect
      playSound: (type: string) => {
        gameBridge.playSound(type as any);
      },

      // Emit game events
      emitGameStart: () => gameBridge.emitGameStart(),
      emitGameOver: (score: number) => gameBridge.emitGameOver(score),
      emitScoreChange: (score: number, highScore: number) => 
        gameBridge.emitScoreChange(score, highScore),

      // Subscribe to events
      on: (event: string, callback: (data?: any) => void) => {
        return gameBridge.on(event, callback);
      },

      // Event constants
      Events: GameEvents,
    };

    console.log('✅ FlappyBridge ready - access via window.FlappyBridge');

  } catch (error) {
    console.error('❌ Failed to initialize Flappy game systems:', error);
  }
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeFlappyGame);
} else {
  initializeFlappyGame();
}
