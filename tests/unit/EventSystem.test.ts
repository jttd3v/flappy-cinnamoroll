/**
 * EventSystem Unit Tests
 * 
 * Tests for the pub/sub event system.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { EventSystem, GameEvents } from '../../src/core/engine/EventSystem';

describe('EventSystem', () => {
  beforeEach(() => {
    EventSystem.removeAllListeners();
  });

  afterEach(() => {
    EventSystem.removeAllListeners();
  });

  describe('on/emit', () => {
    it('should subscribe and receive events', () => {
      const callback = vi.fn();
      
      EventSystem.on(GameEvents.GAME_START, callback);
      EventSystem.emit(GameEvents.GAME_START);
      
      expect(callback).toHaveBeenCalledTimes(1);
    });

    it('should pass data to callback', () => {
      const callback = vi.fn();
      
      EventSystem.on(GameEvents.SCORE_CHANGE, callback);
      EventSystem.emit(GameEvents.SCORE_CHANGE, { score: 10, highScore: 100 });
      
      expect(callback).toHaveBeenCalledWith({ score: 10, highScore: 100 });
    });

    it('should handle multiple subscribers', () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();
      
      EventSystem.on(GameEvents.GAME_START, callback1);
      EventSystem.on(GameEvents.GAME_START, callback2);
      EventSystem.emit(GameEvents.GAME_START);
      
      expect(callback1).toHaveBeenCalled();
      expect(callback2).toHaveBeenCalled();
    });

    it('should handle different events independently', () => {
      const startCallback = vi.fn();
      const endCallback = vi.fn();
      
      EventSystem.on(GameEvents.GAME_START, startCallback);
      EventSystem.on(GameEvents.GAME_OVER, endCallback);
      
      EventSystem.emit(GameEvents.GAME_START);
      
      expect(startCallback).toHaveBeenCalled();
      expect(endCallback).not.toHaveBeenCalled();
    });
  });

  describe('once', () => {
    it('should only trigger once', () => {
      const callback = vi.fn();
      
      EventSystem.once(GameEvents.GAME_START, callback);
      
      EventSystem.emit(GameEvents.GAME_START);
      EventSystem.emit(GameEvents.GAME_START);
      EventSystem.emit(GameEvents.GAME_START);
      
      expect(callback).toHaveBeenCalledTimes(1);
    });
  });

  describe('off', () => {
    it('should unsubscribe from events', () => {
      const callback = vi.fn();
      
      EventSystem.on(GameEvents.GAME_START, callback);
      EventSystem.off(GameEvents.GAME_START, callback);
      EventSystem.emit(GameEvents.GAME_START);
      
      expect(callback).not.toHaveBeenCalled();
    });

    it('should return unsubscribe function from on()', () => {
      const callback = vi.fn();
      
      const unsubscribe = EventSystem.on(GameEvents.GAME_START, callback);
      unsubscribe();
      EventSystem.emit(GameEvents.GAME_START);
      
      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe('createScopedEmitter', () => {
    it('should track subscriptions in scope', () => {
      const scoped = EventSystem.createScopedEmitter('test-game');
      const callback = vi.fn();
      
      scoped.on(GameEvents.GAME_START, callback);
      EventSystem.emit(GameEvents.GAME_START);
      
      expect(callback).toHaveBeenCalled();
    });

    it('should clean up all subscriptions on dispose', () => {
      const scoped = EventSystem.createScopedEmitter('test-game');
      const callback1 = vi.fn();
      const callback2 = vi.fn();
      
      scoped.on(GameEvents.GAME_START, callback1);
      scoped.on(GameEvents.GAME_OVER, callback2);
      scoped.dispose();
      
      EventSystem.emit(GameEvents.GAME_START);
      EventSystem.emit(GameEvents.GAME_OVER);
      
      expect(callback1).not.toHaveBeenCalled();
      expect(callback2).not.toHaveBeenCalled();
    });
  });

  describe('history', () => {
    it('should track event history when enabled', () => {
      EventSystem.enableHistory(true);
      
      EventSystem.emit(GameEvents.GAME_START);
      EventSystem.emit(GameEvents.SCORE_CHANGE, { score: 10 });
      
      const history = EventSystem.getHistory();
      
      expect(history).toHaveLength(2);
      expect(history[0].event).toBe(GameEvents.GAME_START);
      expect(history[1].event).toBe(GameEvents.SCORE_CHANGE);
      
      EventSystem.enableHistory(false);
    });

    it('should clear history', () => {
      EventSystem.enableHistory(true);
      
      EventSystem.emit(GameEvents.GAME_START);
      EventSystem.clearHistory();
      
      expect(EventSystem.getHistory()).toHaveLength(0);
      
      EventSystem.enableHistory(false);
    });
  });

  describe('GameEvents', () => {
    it('should have all required events defined', () => {
      expect(GameEvents.GAME_START).toBe('game:start');
      expect(GameEvents.GAME_OVER).toBe('game:over');
      expect(GameEvents.GAME_PAUSE).toBe('game:pause');
      expect(GameEvents.GAME_RESUME).toBe('game:resume');
      expect(GameEvents.SCORE_CHANGE).toBe('score:change');
      expect(GameEvents.PLAYER_FLAP).toBe('player:flap');
      expect(GameEvents.COLLISION).toBe('collision:detected');
      expect(GameEvents.VISIBILITY_HIDDEN).toBe('visibility:hidden');
      expect(GameEvents.VISIBILITY_VISIBLE).toBe('visibility:visible');
    });
  });
});
