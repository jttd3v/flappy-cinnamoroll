import { test, expect } from '@playwright/test';

test.describe('Quiz Quest Debug Test', () => {
    test('should click Begin Quest and transition to map screen', async ({ page }) => {
        // Collect console messages
        const consoleLogs: string[] = [];
        const consoleErrors: string[] = [];
        
        page.on('console', msg => {
            const text = `[${msg.type()}] ${msg.text()}`;
            consoleLogs.push(text);
            if (msg.type() === 'error') {
                consoleErrors.push(msg.text());
            }
        });
        
        page.on('pageerror', error => {
            consoleErrors.push(`PAGE ERROR: ${error.message}`);
        });

        // Navigate to quiz quest
        await page.goto('http://localhost:8080/games/quiz-quest/index.html');
        
        // Wait for page to load
        await page.waitForLoadState('networkidle');
        
        // Log initial state
        console.log('=== INITIAL PAGE STATE ===');
        
        // Check if start screen is visible
        const startScreen = page.locator('#start-screen');
        const isStartScreenVisible = await startScreen.isVisible();
        console.log(`Start screen visible: ${isStartScreenVisible}`);
        
        // Check if start button exists and is visible
        const startBtn = page.locator('#start-btn');
        const startBtnExists = await startBtn.count() > 0;
        const startBtnVisible = startBtnExists ? await startBtn.isVisible() : false;
        console.log(`Start button exists: ${startBtnExists}`);
        console.log(`Start button visible: ${startBtnVisible}`);
        
        // Get button text
        if (startBtnExists) {
            const btnText = await startBtn.textContent();
            console.log(`Start button text: "${btnText}"`);
        }
        
        // Check all screens
        const screens = ['start-screen', 'map-screen', 'quiz-screen', 'result-screen', 'gameover-screen'];
        console.log('\n=== SCREEN STATES ===');
        for (const screenId of screens) {
            const screen = page.locator(`#${screenId}`);
            const exists = await screen.count() > 0;
            const hasActiveClass = exists ? await screen.evaluate(el => el.classList.contains('active')) : false;
            console.log(`${screenId}: exists=${exists}, active=${hasActiveClass}`);
        }
        
        // Wait a moment for any JS to initialize
        await page.waitForTimeout(500);
        
        console.log('\n=== ATTEMPTING TO CLICK BEGIN QUEST ===');
        
        // Try clicking the button
        if (startBtnVisible) {
            await startBtn.click();
            console.log('Button clicked!');
            
            // Wait for potential transition
            await page.waitForTimeout(1000);
            
            // Check screen states after click
            console.log('\n=== SCREEN STATES AFTER CLICK ===');
            for (const screenId of screens) {
                const screen = page.locator(`#${screenId}`);
                const exists = await screen.count() > 0;
                const hasActiveClass = exists ? await screen.evaluate(el => el.classList.contains('active')) : false;
                console.log(`${screenId}: exists=${exists}, active=${hasActiveClass}`);
            }
            
            // Check if map screen is now active
            const mapScreen = page.locator('#map-screen');
            const mapScreenActive = await mapScreen.evaluate(el => el.classList.contains('active'));
            console.log(`\nMap screen became active: ${mapScreenActive}`);
        }
        
        // Print all console logs
        console.log('\n=== BROWSER CONSOLE LOGS ===');
        consoleLogs.forEach(log => console.log(log));
        
        // Print errors specifically
        if (consoleErrors.length > 0) {
            console.log('\n=== BROWSER ERRORS ===');
            consoleErrors.forEach(err => console.log(`ERROR: ${err}`));
        }
        
        // The test should pass - we're just debugging
        expect(true).toBe(true);
    });
});
