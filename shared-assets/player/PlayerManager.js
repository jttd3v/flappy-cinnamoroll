/**
 * PlayerManager.js - Centralized Player Session Management
 * 
 * Handles player registration, session management, and profile storage.
 * Designed for use across all Cinnamoroll games.
 * 
 * @version 1.0.0
 */

const PlayerManager = (function() {
    'use strict';
    
    // ==========================================
    // CONSTANTS
    // ==========================================
    
    const STORAGE_KEY = 'cinnamorollPlayerData';
    const MAX_PLAYERS = 20;
    const NAME_MAX_LENGTH = 12;
    const NAME_MIN_LENGTH = 1;
    
    // ==========================================
    // PRIVATE STATE
    // ==========================================
    
    let _currentPlayer = null;
    let _initialized = false;
    
    // ==========================================
    // STORAGE HELPERS
    // ==========================================
    
    /**
     * Load all player data from localStorage
     * @returns {Object} Player data object
     */
    function loadData() {
        try {
            const data = localStorage.getItem(STORAGE_KEY);
            if (!data) {
                return { currentPlayer: null, players: {} };
            }
            return JSON.parse(data);
        } catch (e) {
            console.error('PlayerManager: Failed to load data:', e);
            return { currentPlayer: null, players: {} };
        }
    }
    
    /**
     * Save all player data to localStorage
     * @param {Object} data - Data to save
     * @returns {boolean} Success status
     */
    function saveData(data) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
            return true;
        } catch (e) {
            console.error('PlayerManager: Failed to save data:', e);
            return false;
        }
    }
    
    // ==========================================
    // VALIDATION
    // ==========================================
    
    /**
     * Validate player name
     * @param {string} name - Name to validate
     * @returns {Object} { valid: boolean, sanitized: string, error: string|null }
     */
    function validateName(name) {
        // Guard: null or undefined
        if (name === null || name === undefined) {
            return { valid: false, sanitized: '', error: 'Name is required' };
        }
        
        // Sanitize: trim and convert to string
        const sanitized = String(name).trim();
        
        // Guard: empty
        if (sanitized.length === 0) {
            return { valid: false, sanitized: '', error: 'Name cannot be empty' };
        }
        
        // Guard: too short
        if (sanitized.length < NAME_MIN_LENGTH) {
            return { valid: false, sanitized: '', error: 'Name is too short' };
        }
        
        // Guard: too long - truncate
        if (sanitized.length > NAME_MAX_LENGTH) {
            return { 
                valid: true, 
                sanitized: sanitized.substring(0, NAME_MAX_LENGTH), 
                error: null,
                warning: 'Name was truncated to 12 characters'
            };
        }
        
        return { valid: true, sanitized: sanitized, error: null };
    }
    
    /**
     * Validate age
     * @param {number|string} age - Age to validate
     * @returns {Object} { valid: boolean, value: number, error: string|null }
     */
    function validateAge(age) {
        const numAge = parseInt(age, 10);
        
        if (isNaN(numAge)) {
            return { valid: false, value: 16, error: 'Invalid age' };
        }
        
        if (numAge < 3 || numAge > 100) {
            return { valid: false, value: 16, error: 'Age must be between 3 and 100' };
        }
        
        return { valid: true, value: numAge, error: null };
    }
    
    // ==========================================
    // PUBLIC API
    // ==========================================
    
    return {
        /**
         * Initialize the player manager
         * Loads saved session if available
         */
        init: function() {
            if (_initialized) return;
            
            const data = loadData();
            if (data.currentPlayer && data.players[data.currentPlayer]) {
                _currentPlayer = data.players[data.currentPlayer];
            }
            _initialized = true;
            
            console.log('PlayerManager: Initialized', _currentPlayer ? `(Player: ${_currentPlayer.name})` : '(No active player)');
        },
        
        /**
         * Check if a player is currently logged in
         * @returns {boolean}
         */
        hasActivePlayer: function() {
            return _currentPlayer !== null;
        },
        
        /**
         * Get current player profile
         * @returns {Object|null} Player profile or null
         */
        getCurrentPlayer: function() {
            return _currentPlayer ? { ..._currentPlayer } : null;
        },
        
        /**
         * Get current player's name
         * @returns {string|null}
         */
        getPlayerName: function() {
            return _currentPlayer ? _currentPlayer.name : null;
        },
        
        /**
         * Get current player's age
         * @returns {number|null}
         */
        getPlayerAge: function() {
            return _currentPlayer ? _currentPlayer.age : null;
        },
        
        /**
         * Register a new player or login existing
         * @param {string} name - Player name
         * @param {number} age - Player age
         * @returns {Object} { success: boolean, player: Object|null, error: string|null, isNew: boolean }
         */
        registerPlayer: function(name, age) {
            // Validate inputs
            const nameResult = validateName(name);
            if (!nameResult.valid) {
                return { success: false, player: null, error: nameResult.error, isNew: false };
            }
            
            const ageResult = validateAge(age);
            if (!ageResult.valid) {
                return { success: false, player: null, error: ageResult.error, isNew: false };
            }
            
            const data = loadData();
            const playerKey = nameResult.sanitized.toLowerCase();
            const now = new Date().toISOString();
            
            let isNew = false;
            let player;
            
            if (data.players[playerKey]) {
                // Existing player - update last played and age if different
                player = data.players[playerKey];
                player.lastPlayed = now;
                if (player.age !== ageResult.value) {
                    player.age = ageResult.value;
                }
            } else {
                // New player - check limit
                const playerCount = Object.keys(data.players).length;
                if (playerCount >= MAX_PLAYERS) {
                    return { 
                        success: false, 
                        player: null, 
                        error: 'Maximum players reached. Please remove a player first.', 
                        isNew: false 
                    };
                }
                
                // Create new player
                player = {
                    name: nameResult.sanitized,
                    age: ageResult.value,
                    createdAt: now,
                    lastPlayed: now,
                    gameProgress: {},
                    totalGamesPlayed: 0
                };
                isNew = true;
            }
            
            // Save player
            data.players[playerKey] = player;
            data.currentPlayer = playerKey;
            
            if (!saveData(data)) {
                return { success: false, player: null, error: 'Failed to save player data', isNew: false };
            }
            
            _currentPlayer = player;
            
            return { success: true, player: { ...player }, error: null, isNew: isNew };
        },
        
        /**
         * Switch to an existing player
         * @param {string} name - Player name
         * @returns {Object} { success: boolean, player: Object|null, error: string|null }
         */
        switchPlayer: function(name) {
            const nameResult = validateName(name);
            if (!nameResult.valid) {
                return { success: false, player: null, error: nameResult.error };
            }
            
            const data = loadData();
            const playerKey = nameResult.sanitized.toLowerCase();
            
            if (!data.players[playerKey]) {
                return { success: false, player: null, error: 'Player not found' };
            }
            
            // Update last played
            data.players[playerKey].lastPlayed = new Date().toISOString();
            data.currentPlayer = playerKey;
            
            if (!saveData(data)) {
                return { success: false, player: null, error: 'Failed to save data' };
            }
            
            _currentPlayer = data.players[playerKey];
            
            return { success: true, player: { ..._currentPlayer }, error: null };
        },
        
        /**
         * Get all registered players
         * @returns {Array} Array of player objects
         */
        getAllPlayers: function() {
            const data = loadData();
            return Object.values(data.players).map(p => ({ ...p }));
        },
        
        /**
         * Remove a player
         * @param {string} name - Player name to remove
         * @returns {boolean} Success status
         */
        removePlayer: function(name) {
            const nameResult = validateName(name);
            if (!nameResult.valid) return false;
            
            const data = loadData();
            const playerKey = nameResult.sanitized.toLowerCase();
            
            if (!data.players[playerKey]) return false;
            
            delete data.players[playerKey];
            
            // If removing current player, clear session
            if (data.currentPlayer === playerKey) {
                data.currentPlayer = null;
                _currentPlayer = null;
            }
            
            return saveData(data);
        },
        
        /**
         * Logout current player (but keep in system)
         */
        logout: function() {
            const data = loadData();
            data.currentPlayer = null;
            saveData(data);
            _currentPlayer = null;
        },
        
        /**
         * Save game progress for current player
         * @param {string} gameId - Game identifier
         * @param {Object} progress - Progress data to save
         * @returns {boolean} Success status
         */
        saveGameProgress: function(gameId, progress) {
            if (!_currentPlayer) {
                console.warn('PlayerManager: No active player to save progress for');
                return false;
            }
            
            const data = loadData();
            const playerKey = _currentPlayer.name.toLowerCase();
            
            if (!data.players[playerKey]) return false;
            
            // Initialize game progress if needed
            if (!data.players[playerKey].gameProgress) {
                data.players[playerKey].gameProgress = {};
            }
            
            // Merge with existing progress
            const existing = data.players[playerKey].gameProgress[gameId] || {};
            data.players[playerKey].gameProgress[gameId] = {
                ...existing,
                ...progress,
                lastUpdated: new Date().toISOString()
            };
            
            // Update games played count
            data.players[playerKey].totalGamesPlayed = (data.players[playerKey].totalGamesPlayed || 0) + 1;
            
            if (!saveData(data)) return false;
            
            _currentPlayer = data.players[playerKey];
            return true;
        },
        
        /**
         * Get game progress for current player
         * @param {string} gameId - Game identifier
         * @returns {Object|null} Progress data or null
         */
        getGameProgress: function(gameId) {
            if (!_currentPlayer) return null;
            
            const data = loadData();
            const playerKey = _currentPlayer.name.toLowerCase();
            
            if (!data.players[playerKey]?.gameProgress) return null;
            
            return data.players[playerKey].gameProgress[gameId] || null;
        },
        
        /**
         * Get all game progress for current player
         * @returns {Object} All game progress
         */
        getAllGameProgress: function() {
            if (!_currentPlayer) return {};
            
            const data = loadData();
            const playerKey = _currentPlayer.name.toLowerCase();
            
            return data.players[playerKey]?.gameProgress || {};
        },
        
        /**
         * Update player's best score for a game
         * @param {string} gameId - Game identifier
         * @param {number} score - New score
         * @returns {Object} { updated: boolean, isNewBest: boolean, bestScore: number }
         */
        updateGameScore: function(gameId, score) {
            if (!_currentPlayer) {
                return { updated: false, isNewBest: false, bestScore: 0 };
            }
            
            const progress = this.getGameProgress(gameId) || {};
            const currentBest = progress.bestScore || 0;
            const isNewBest = score > currentBest;
            
            const result = this.saveGameProgress(gameId, {
                bestScore: isNewBest ? score : currentBest,
                lastScore: score,
                gamesPlayed: (progress.gamesPlayed || 0) + 1
            });
            
            return {
                updated: result,
                isNewBest: isNewBest,
                bestScore: isNewBest ? score : currentBest
            };
        }
    };
})();

// Auto-initialize when script loads
if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => PlayerManager.init());
    } else {
        PlayerManager.init();
    }
}
