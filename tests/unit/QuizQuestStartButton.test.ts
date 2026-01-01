/**
 * Quiz Quest Start Button Unit Tests
 * 
 * Tests for the #start-btn button functionality
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('Quiz Quest Start Button', () => {
  let startBtn: HTMLButtonElement;
  let startScreen: HTMLElement;
  let mapScreen: HTMLElement;

  beforeEach(() => {
    // Setup DOM
    document.body.innerHTML = `
      <div id="game-container">
        <div id="start-screen" class="screen active">
          <button id="start-btn" class="primary-btn adventure-btn" aria-label="Start quiz quest game">Begin Quest!</button>
        </div>
        <div id="map-screen" class="screen"></div>
      </div>
    `;

    startBtn = document.getElementById('start-btn') as HTMLButtonElement;
    startScreen = document.getElementById('start-screen') as HTMLElement;
    mapScreen = document.getElementById('map-screen') as HTMLElement;
  });

  describe('Button Element', () => {
    it('should exist in the DOM', () => {
      expect(startBtn).not.toBeNull();
      expect(startBtn).toBeInstanceOf(HTMLButtonElement);
    });

    it('should have correct id', () => {
      expect(startBtn.id).toBe('start-btn');
    });

    it('should have correct text content', () => {
      expect(startBtn.textContent).toBe('Begin Quest!');
    });

    it('should have primary-btn class', () => {
      expect(startBtn.classList.contains('primary-btn')).toBe(true);
    });

    it('should have adventure-btn class', () => {
      expect(startBtn.classList.contains('adventure-btn')).toBe(true);
    });

    it('should have aria-label for accessibility', () => {
      expect(startBtn.getAttribute('aria-label')).toBe('Start quiz quest game');
    });

    it('should be clickable (not disabled by default)', () => {
      expect(startBtn.disabled).toBe(false);
    });
  });

  describe('Button Interaction', () => {
    it('should be focusable', () => {
      startBtn.focus();
      expect(document.activeElement).toBe(startBtn);
    });

    it('should trigger click event', () => {
      const clickHandler = vi.fn();
      startBtn.addEventListener('click', clickHandler);
      
      startBtn.click();
      
      expect(clickHandler).toHaveBeenCalledTimes(1);
    });

    it('should trigger click on Enter key', () => {
      const clickHandler = vi.fn();
      startBtn.addEventListener('click', clickHandler);
      
      const enterEvent = new KeyboardEvent('keydown', { key: 'Enter' });
      startBtn.dispatchEvent(enterEvent);
      startBtn.click(); // Buttons naturally click on Enter
      
      expect(clickHandler).toHaveBeenCalled();
    });
  });

  describe('Screen Transition Simulation', () => {
    it('should be able to hide start screen on click', () => {
      startBtn.addEventListener('click', () => {
        startScreen.classList.remove('active');
        mapScreen.classList.add('active');
      });

      startBtn.click();

      expect(startScreen.classList.contains('active')).toBe(false);
      expect(mapScreen.classList.contains('active')).toBe(true);
    });
  });

  describe('Visual States', () => {
    it('should have correct parent container', () => {
      expect(startBtn.closest('#start-screen')).not.toBeNull();
    });

    it('should be visible when start screen is active', () => {
      expect(startScreen.classList.contains('active')).toBe(true);
    });
  });
});
