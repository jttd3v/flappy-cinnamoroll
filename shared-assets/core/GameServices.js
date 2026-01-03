/**
 * GameServices.js - Centralized Game Services
 * 
 * Provides unified access to shared services across all games.
 * Singleton pattern ensures only one instance of each service.
 * 
 * @version 1.0.0
 */

const GameServices = (function() {
    'use strict';
    
    // ==========================================
    // PRIVATE STATE
    // ==========================================
    
    let _initialized = false;
    
    // ==========================================
    // NAVIGATION
    // ==========================================
    
    const Navigation = {
        /**
         * Navigate to the game launcher
         */
        goToLauncher: function() {
            // Determine the relative path based on current location
            const path = window.location.pathname;
            
            if (path.includes('/games/')) {
                // We're in a game folder - go up two levels
                window.location.href = '../../launcher.html';
            } else {
                // We're at root level
                window.location.href = './launcher.html';
            }
        },
        
        /**
         * Navigate to a specific game
         * @param {string} gameId - Game identifier
         */
        goToGame: function(gameId) {
            const gamePaths = {
                'flappy-cinnamoroll': './flappy.html',
                'treasure-chest-memory': './games/treasure-chest-memory/index.html',
                'star-counter': './games/star-counter/index.html',
                'pattern-rainbow': './games/pattern-rainbow/index.html',
                'quiz-quest': './games/quiz-quest/index.html',
                'candy-shop': './games/candy-shop/index.html',
                'story-cloud': './games/story-cloud/index.html',
                'dream-journal': './games/dream-journal/index.html',
                'cloud-kingdom': './games/cloud-kingdom/index.html',
                'puzzle-path': './games/puzzle-path/index.html',
                'career-clouds': './games/career-clouds/index.html'
            };
            
            const gamePath = gamePaths[gameId];
            if (gamePath) {
                window.location.href = gamePath;
            } else {
                console.error('GameServices: Unknown game:', gameId);
            }
        },
        
        /**
         * Get current game ID from URL
         * @returns {string|null}
         */
        getCurrentGameId: function() {
            const path = window.location.pathname;
            const match = path.match(/\/games\/([^\/]+)\//);
            return match ? match[1] : (path.includes('index.html') && !path.includes('/games/') ? 'flappy-cinnamoroll' : null);
        }
    };
    
    // ==========================================
    // DIFFICULTY HELPER
    // ==========================================
    
    const Difficulty = {
        /**
         * Get difficulty level from age
         * @param {number} age - Player age
         * @returns {number} Difficulty level 1-7
         */
        fromAge: function(age) {
            const numAge = parseInt(age, 10) || 16;
            
            if (numAge <= 8) return 1;
            if (numAge <= 10) return 2;
            if (numAge <= 12) return 3;
            if (numAge <= 15) return 4;
            if (numAge <= 18) return 5;
            if (numAge <= 25) return 6;
            return 7;
        },
        
        /**
         * Get difficulty name
         * @param {number} level - Difficulty level
         * @returns {string}
         */
        getName: function(level) {
            const names = {
                1: 'Beginner',
                2: 'Easy',
                3: 'Normal',
                4: 'Intermediate',
                5: 'Challenging',
                6: 'Hard',
                7: 'Expert'
            };
            return names[level] || 'Normal';
        },
        
        /**
         * Get age group name
         * @param {number} age - Player age
         * @returns {string}
         */
        getAgeGroup: function(age) {
            const numAge = parseInt(age, 10) || 16;
            
            if (numAge <= 8) return 'child';
            if (numAge <= 12) return 'tween';
            if (numAge <= 18) return 'teen';
            if (numAge <= 25) return 'young-adult';
            return 'adult';
        }
    };
    
    // ==========================================
    // STORAGE UTILITIES
    // ==========================================
    
    const Storage = {
        /**
         * Save data with error handling
         * @param {string} key - Storage key
         * @param {*} data - Data to save
         * @returns {boolean} Success status
         */
        save: function(key, data) {
            try {
                localStorage.setItem(key, JSON.stringify(data));
                return true;
            } catch (e) {
                console.error('GameServices.Storage: Save failed:', e);
                return false;
            }
        },
        
        /**
         * Load data with error handling
         * @param {string} key - Storage key
         * @param {*} defaultValue - Default if not found
         * @returns {*} Loaded data or default
         */
        load: function(key, defaultValue = null) {
            try {
                const data = localStorage.getItem(key);
                return data ? JSON.parse(data) : defaultValue;
            } catch (e) {
                console.error('GameServices.Storage: Load failed:', e);
                return defaultValue;
            }
        },
        
        /**
         * Remove data
         * @param {string} key - Storage key
         */
        remove: function(key) {
            try {
                localStorage.removeItem(key);
            } catch (e) {
                console.error('GameServices.Storage: Remove failed:', e);
            }
        },
        
        /**
         * Check if key exists
         * @param {string} key - Storage key
         * @returns {boolean}
         */
        exists: function(key) {
            return localStorage.getItem(key) !== null;
        }
    };
    
    // ==========================================
    // UI UTILITIES
    // ==========================================
    
    const UI = {
        /**
         * Show a screen and hide others
         * @param {Object} screens - Map of screen name to element
         * @param {string} screenName - Screen to show
         */
        showScreen: function(screens, screenName) {
            Object.entries(screens).forEach(([name, element]) => {
                if (element) {
                    element.classList.toggle('active', name === screenName);
                    element.classList.toggle('hidden', name !== screenName);
                }
            });
        },
        
        /**
         * Show toast notification
         * @param {string} message - Message to show
         * @param {number} duration - Duration in ms
         */
        showToast: function(message, duration = 2000) {
            // Remove existing toast
            const existing = document.querySelector('.game-toast');
            if (existing) existing.remove();
            
            // Create toast
            const toast = document.createElement('div');
            toast.className = 'game-toast';
            toast.textContent = message;
            toast.style.cssText = `
                position: fixed;
                bottom: 20px;
                left: 50%;
                transform: translateX(-50%);
                background: rgba(0, 0, 0, 0.8);
                color: white;
                padding: 12px 24px;
                border-radius: 8px;
                z-index: 10000;
                animation: fadeInUp 0.3s ease;
            `;
            
            document.body.appendChild(toast);
            
            setTimeout(() => {
                toast.style.animation = 'fadeOutDown 0.3s ease';
                setTimeout(() => toast.remove(), 300);
            }, duration);
        },
        
        /**
         * Format number with commas
         * @param {number} num - Number to format
         * @returns {string}
         */
        formatNumber: function(num) {
            return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        },
        
        /**
         * Format time in MM:SS
         * @param {number} seconds - Seconds to format
         * @returns {string}
         */
        formatTime: function(seconds) {
            const mins = Math.floor(seconds / 60);
            const secs = Math.floor(seconds % 60);
            return `${mins}:${secs.toString().padStart(2, '0')}`;
        }
    };
    
    // ==========================================
    // MATH UTILITIES
    // ==========================================
    
    const MathUtils = {
        /**
         * Clamp value between min and max
         */
        clamp: function(value, min, max) {
            return Math.min(Math.max(value, min), max);
        },
        
        /**
         * Random integer between min and max (inclusive)
         */
        randomInt: function(min, max) {
            return Math.floor(Math.random() * (max - min + 1)) + min;
        },
        
        /**
         * Shuffle array (Fisher-Yates)
         */
        shuffle: function(array) {
            const arr = [...array];
            for (let i = arr.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [arr[i], arr[j]] = [arr[j], arr[i]];
            }
            return arr;
        },
        
        /**
         * Linear interpolation
         */
        lerp: function(start, end, t) {
            return start + (end - start) * t;
        }
    };
    
    // ==========================================
    // PUBLIC API
    // ==========================================
    
    return {
        Navigation: Navigation,
        Difficulty: Difficulty,
        Storage: Storage,
        UI: UI,
        MathUtils: MathUtils,
        
        /**
         * Initialize all services
         */
        init: function() {
            if (_initialized) return;
            
            // Add global CSS for toast animations
            if (!document.getElementById('game-services-styles')) {
                const style = document.createElement('style');
                style.id = 'game-services-styles';
                style.textContent = `
                    @keyframes fadeInUp {
                        from { opacity: 0; transform: translateX(-50%) translateY(20px); }
                        to { opacity: 1; transform: translateX(-50%) translateY(0); }
                    }
                    @keyframes fadeOutDown {
                        from { opacity: 1; transform: translateX(-50%) translateY(0); }
                        to { opacity: 0; transform: translateX(-50%) translateY(20px); }
                    }
                `;
                document.head.appendChild(style);
            }
            
            _initialized = true;
            console.log('GameServices: Initialized');
        },
        
        /**
         * Get player manager (convenience accessor)
         */
        getPlayerManager: function() {
            return typeof PlayerManager !== 'undefined' ? PlayerManager : null;
        },
        
        /**
         * Get audio manager (convenience accessor)
         */
        getAudioManager: function() {
            return typeof gameAudio !== 'undefined' ? gameAudio : null;
        }
    };
})();

// Auto-initialize
if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => GameServices.init());
    } else {
        GameServices.init();
    }
}
