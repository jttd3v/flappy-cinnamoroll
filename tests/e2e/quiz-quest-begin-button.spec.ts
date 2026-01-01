import { test, expect } from '@playwright/test';

test.describe('Quiz Quest - Begin Quest Button', () => {
  
  test.beforeEach(async ({ page }) => {
    // Navigate to Quiz Quest game
    await page.goto('/games/quiz-quest/index.html');
    // Wait for page to fully load
    await page.waitForLoadState('domcontentloaded');
    // Wait a bit for any JS initialization
    await page.waitForTimeout(500);
  });

  test.describe('Button Visibility & Presence', () => {
    
    test('should display Begin Quest button on start screen', async ({ page }) => {
      const startBtn = page.locator('#start-btn');
      await expect(startBtn).toBeVisible();
    });

    test('should have correct button text "Begin Quest!"', async ({ page }) => {
      const startBtn = page.locator('#start-btn');
      await expect(startBtn).toHaveText('Begin Quest!');
    });

    test('should have proper CSS classes', async ({ page }) => {
      const startBtn = page.locator('#start-btn');
      await expect(startBtn).toHaveClass(/primary-btn/);
      await expect(startBtn).toHaveClass(/adventure-btn/);
    });

    test('should have accessible aria-label', async ({ page }) => {
      const startBtn = page.locator('#start-btn');
      await expect(startBtn).toHaveAttribute('aria-label', 'Start quiz quest game');
    });

    test('should not be disabled initially', async ({ page }) => {
      const startBtn = page.locator('#start-btn');
      await expect(startBtn).not.toBeDisabled();
    });
  });

  test.describe('Button Styling', () => {
    
    test('should have clickable cursor style', async ({ page }) => {
      const startBtn = page.locator('#start-btn');
      await expect(startBtn).toBeVisible();
      const cursor = await startBtn.evaluate(el => 
        window.getComputedStyle(el).cursor
      );
      expect(cursor).toBe('pointer');
    });

    test('should be properly sized for touch targets', async ({ page }) => {
      const startBtn = page.locator('#start-btn');
      await expect(startBtn).toBeVisible();
      const box = await startBtn.boundingBox();
      
      // Minimum touch target size should be at least 44x44 pixels (WCAG)
      expect(box?.width).toBeGreaterThanOrEqual(44);
      expect(box?.height).toBeGreaterThanOrEqual(44);
    });

    test('should be visible within viewport', async ({ page }) => {
      const startBtn = page.locator('#start-btn');
      await expect(startBtn).toBeInViewport();
    });
  });

  test.describe('Button Click Interaction', () => {
    
    test('should be clickable', async ({ page }) => {
      const startBtn = page.locator('#start-btn');
      await expect(startBtn).toBeEnabled();
      
      // Button should be clickable without throwing errors
      await startBtn.click();
    });

    test('should transition to map screen when clicked', async ({ page }) => {
      const startBtn = page.locator('#start-btn');
      const startScreen = page.locator('#start-screen');
      const mapScreen = page.locator('#map-screen');
      
      // Verify start screen is initially active
      await expect(startScreen).toHaveClass(/active/);
      
      // Click the Begin Quest button
      await startBtn.click();
      
      // Wait for transition - map screen should become active
      await expect(mapScreen).toHaveClass(/active/, { timeout: 5000 });
      
      // Start screen should no longer be active
      await expect(startScreen).not.toHaveClass(/active/);
    });

    test('should hide start screen after click', async ({ page }) => {
      const startBtn = page.locator('#start-btn');
      const startScreen = page.locator('#start-screen');
      
      await startBtn.click();
      
      // After clicking, start screen should not be visible or active
      await expect(startScreen).not.toHaveClass(/active/, { timeout: 5000 });
    });

    test('should show map canvas after navigation', async ({ page }) => {
      const startBtn = page.locator('#start-btn');
      const mapCanvas = page.locator('#map-canvas');
      
      await startBtn.click();
      
      // Map canvas should be visible after transition
      await expect(mapCanvas).toBeVisible({ timeout: 5000 });
    });
  });

  test.describe('Keyboard Accessibility', () => {
    
    test('should be focusable with Tab key', async ({ page }) => {
      const startBtn = page.locator('#start-btn');
      
      // Check if button can receive focus
      await startBtn.focus();
      await expect(startBtn).toBeFocused();
    });

    test('should activate with Enter key when focused', async ({ page }) => {
      const startBtn = page.locator('#start-btn');
      const mapScreen = page.locator('#map-screen');
      
      // Focus the button and press Enter
      await startBtn.focus();
      await page.keyboard.press('Enter');
      
      // Should transition to map screen
      await expect(mapScreen).toHaveClass(/active/, { timeout: 5000 });
    });

    test('should activate with Space key when focused', async ({ page }) => {
      const startBtn = page.locator('#start-btn');
      const mapScreen = page.locator('#map-screen');
      
      // Focus the button and press Space
      await startBtn.focus();
      await page.keyboard.press('Space');
      
      // Should transition to map screen
      await expect(mapScreen).toHaveClass(/active/, { timeout: 5000 });
    });
  });

  test.describe('Screen Context', () => {
    
    test('should be within start-screen container', async ({ page }) => {
      const startBtn = page.locator('#start-screen #start-btn');
      await expect(startBtn).toBeVisible();
    });

    test('should appear with game title visible', async ({ page }) => {
      const gameTitle = page.locator('.game-title');
      const startBtn = page.locator('#start-btn');
      
      await expect(gameTitle).toBeVisible();
      await expect(gameTitle).toContainText('Quiz Quest');
      await expect(startBtn).toBeVisible();
    });

    test('should appear with high score display', async ({ page }) => {
      const highScore = page.locator('.high-score-display');
      const startBtn = page.locator('#start-btn');
      
      await expect(highScore).toBeVisible();
      await expect(startBtn).toBeVisible();
    });
  });

  test.describe('Game State After Button Click', () => {
    
    test('should initialize game stats in header after starting', async ({ page }) => {
      const startBtn = page.locator('#start-btn');
      
      await startBtn.click();
      
      // Wait for map screen
      await expect(page.locator('#map-screen')).toHaveClass(/active/, { timeout: 5000 });
      
      // Check that game stats are displayed
      const starsDisplay = page.locator('#total-stars');
      const livesDisplay = page.locator('#lives-display');
      const scoreDisplay = page.locator('#map-score');
      
      await expect(starsDisplay).toBeVisible();
      await expect(livesDisplay).toBeVisible();
      await expect(scoreDisplay).toBeVisible();
    });

    test('should show map header with lives after starting', async ({ page }) => {
      const startBtn = page.locator('#start-btn');
      
      await startBtn.click();
      
      const livesDisplay = page.locator('#lives-display');
      await expect(livesDisplay).toBeVisible({ timeout: 5000 });
      
      // Initial lives should be 3
      await expect(livesDisplay).toHaveText('3');
    });

    test('should render map canvas after starting', async ({ page }) => {
      const startBtn = page.locator('#start-btn');
      
      await startBtn.click();
      
      const mapCanvas = page.locator('#map-canvas');
      await expect(mapCanvas).toBeVisible({ timeout: 5000 });
      
      // Verify canvas has proper dimensions
      const width = await mapCanvas.getAttribute('width');
      const height = await mapCanvas.getAttribute('height');
      
      expect(parseInt(width || '0')).toBeGreaterThan(0);
      expect(parseInt(height || '0')).toBeGreaterThan(0);
    });

    test('should show Enter button when location is selected', async ({ page }) => {
      const startBtn = page.locator('#start-btn');
      
      await startBtn.click();
      
      // Wait for map to render
      await page.waitForTimeout(500);
      
      // Click on the map canvas to select a location (Math Mountain area)
      const mapCanvas = page.locator('#map-canvas');
      await mapCanvas.click({ position: { x: 190, y: 200 } });
      
      // The location info panel should appear
      const locationInfo = page.locator('#location-info');
      await expect(locationInfo).toBeVisible({ timeout: 3000 });
      
      // The Enter button should be visible and in viewport
      const enterBtn = page.locator('#enter-location-btn');
      await expect(enterBtn).toBeVisible();
      await expect(enterBtn).toBeInViewport();
    });
  });

  test.describe('Mobile/Touch Interaction', () => {
    
    test('should respond to click on mobile viewport', async ({ page }) => {
      const startBtn = page.locator('#start-btn');
      const mapScreen = page.locator('#map-screen');
      
      // Click works on all devices including touch
      await startBtn.click();
      
      // Should navigate to map screen
      await expect(mapScreen).toHaveClass(/active/, { timeout: 5000 });
    });
  });

  test.describe('Error Handling', () => {
    
    test('should not throw critical console errors on click', async ({ page }) => {
      const errors: string[] = [];
      
      page.on('console', msg => {
        if (msg.type() === 'error') {
          errors.push(msg.text());
        }
      });
      
      const startBtn = page.locator('#start-btn');
      await startBtn.click();
      
      // Wait for any async operations
      await page.waitForTimeout(1000);
      
      // Filter out known non-critical errors (like missing images/resources)
      const criticalErrors = errors.filter(e => 
        !e.includes('Failed to load resource') &&
        !e.includes('404') &&
        !e.includes('net::ERR')
      );
      
      expect(criticalErrors).toHaveLength(0);
    });
  });
});
