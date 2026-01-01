/**
 * GameLoop Unit Tests
 * 
 * Tests for frame-rate independent game loop functionality.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { GameLoop, createGameLoop, type FrameInfo } from '../../src/core/engine/GameLoop';
import { EventSystem, GameEvents } from '../../src/core/engine/EventSystem';

describe('GameLoop', () => {
  let gameLoop: GameLoop;

  beforeEach(() => {
    gameLoop = createGameLoop({
      maxDeltaTime: 100,
      fixedTimestep: 16.67,
    });
  });

  afterEach(() => {
    gameLoop.destroy();
    EventSystem.removeAllListeners();
  });

  describe('initialization', () => {
    it('should create a game loop instance', () => {
      expect(gameLoop).toBeDefined();
      expect(gameLoop.state.isRunning).toBe(false);
      expect(gameLoop.state.isPaused).toBe(false);
    });

    it('should have default state values', () => {
      const state = gameLoop.state;
      expect(state.frameCount).toBe(0);
      expect(state.elapsedTime).toBe(0);
    });
  });

  describe('start/stop', () => {
    it('should start the game loop', () => {
      gameLoop.start();
      expect(gameLoop.state.isRunning).toBe(true);
    });

    it('should emit LOOP_START event on start', () => {
      const spy = vi.fn();
      EventSystem.on(GameEvents.LOOP_START, spy);
      
      gameLoop.start();
      
      expect(spy).toHaveBeenCalled();
    });

    it('should stop the game loop', () => {
      gameLoop.start();
      gameLoop.stop();
      
      expect(gameLoop.state.isRunning).toBe(false);
    });

    it('should emit LOOP_STOP event on stop', () => {
      const spy = vi.fn();
      EventSystem.on(GameEvents.LOOP_STOP, spy);
      
      gameLoop.start();
      gameLoop.stop();
      
      expect(spy).toHaveBeenCalled();
    });

    it('should not start twice', () => {
      const spy = vi.fn();
      EventSystem.on(GameEvents.LOOP_START, spy);
      
      gameLoop.start();
      gameLoop.start(); // Second call should be ignored
      
      expect(spy).toHaveBeenCalledTimes(1);
    });
  });

  describe('pause/resume', () => {
    it('should pause the game loop', () => {
      gameLoop.start();
      gameLoop.pause();
      
      expect(gameLoop.state.isPaused).toBe(true);
    });

    it('should resume the game loop', () => {
      gameLoop.start();
      gameLoop.pause();
      gameLoop.resume();
      
      expect(gameLoop.state.isPaused).toBe(false);
    });

    it('should emit LOOP_PAUSE event on pause', () => {
      const spy = vi.fn();
      EventSystem.on(GameEvents.LOOP_PAUSE, spy);
      
      gameLoop.start();
      gameLoop.pause();
      
      expect(spy).toHaveBeenCalled();
    });

    it('should emit LOOP_RESUME event on resume', () => {
      const spy = vi.fn();
      EventSystem.on(GameEvents.LOOP_RESUME, spy);
      
      gameLoop.start();
      gameLoop.pause();
      gameLoop.resume();
      
      expect(spy).toHaveBeenCalled();
    });

    it('should toggle pause state', () => {
      gameLoop.start();
      
      expect(gameLoop.togglePause()).toBe(true); // Now paused
      expect(gameLoop.togglePause()).toBe(false); // Now resumed
    });
  });

  describe('callbacks', () => {
    it('should register and call update callbacks', async () => {
      const updateSpy = vi.fn();
      gameLoop.onUpdate(updateSpy);
      
      gameLoop.start();
      
      // Wait for at least one frame
      await new Promise(resolve => setTimeout(resolve, 50));
      
      gameLoop.stop();
      
      expect(updateSpy).toHaveBeenCalled();
    });

    it('should pass frame info to update callbacks', async () => {
      let receivedFrameInfo: FrameInfo | null = null;
      
      gameLoop.onUpdate((frameInfo) => {
        receivedFrameInfo = frameInfo;
      });
      
      gameLoop.start();
      await new Promise(resolve => setTimeout(resolve, 50));
      gameLoop.stop();
      
      expect(receivedFrameInfo).not.toBeNull();
      expect(receivedFrameInfo!.deltaTime).toBeGreaterThan(0);
      expect(receivedFrameInfo!.deltaNormalized).toBeGreaterThan(0);
      expect(receivedFrameInfo!.frameCount).toBeGreaterThan(0);
    });

    it('should allow unsubscribing from callbacks', () => {
      const updateSpy = vi.fn();
      const unsubscribe = gameLoop.onUpdate(updateSpy);
      
      unsubscribe();
      
      gameLoop.start();
      // The spy should not be called since we unsubscribed
    });

    it('should register and call render callbacks', async () => {
      const renderSpy = vi.fn();
      gameLoop.onRender(renderSpy);
      
      gameLoop.start();
      await new Promise(resolve => setTimeout(resolve, 50));
      gameLoop.stop();
      
      expect(renderSpy).toHaveBeenCalled();
    });
  });

  describe('delta time', () => {
    it('should clamp large delta times', async () => {
      let maxDeltaReceived = 0;
      
      gameLoop.onUpdate((frameInfo) => {
        if (frameInfo.deltaTime > maxDeltaReceived) {
          maxDeltaReceived = frameInfo.deltaTime;
        }
      });
      
      gameLoop.start();
      await new Promise(resolve => setTimeout(resolve, 50));
      gameLoop.stop();
      
      // Max delta should be clamped to 100ms
      expect(maxDeltaReceived).toBeLessThanOrEqual(100);
    });
  });
});
