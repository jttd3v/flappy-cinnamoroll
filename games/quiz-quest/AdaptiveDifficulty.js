/**
 * AdaptiveDifficulty.js - Performance-Based Difficulty System
 * 
 * Replaces age-based difficulty with real-time performance tracking.
 * Uses a rolling window of recent answers to adjust question tiers.
 * 
 * @version 1.0.0
 * @module games/quiz-quest/AdaptiveDifficulty
 */

// ==================== Configuration ====================

const ADAPTIVE_CONFIG = Object.freeze({
    WINDOW_SIZE: 5,           // Rolling window of answers to consider
    MIN_TIER: 1,              // Floor (Explorer)
    MAX_TIER: 5,              // Ceiling (Legend tier questions)
    DEFAULT_TIER: 3,          // Start at Champion
    
    // Thresholds for tier adjustment
    PROMOTE_THRESHOLD: 0.75,  // >75% performance → tier up
    DEMOTE_THRESHOLD: 0.40,   // <40% performance → tier down
    
    // Weighting for combined score
    ACCURACY_WEIGHT: 0.7,     // 70% weight on correctness
    SPEED_WEIGHT: 0.3,        // 30% weight on response time
    
    // Storage key for persistence
    STORAGE_KEY: 'quizQuestAdaptive'
});

// ==================== AdaptiveDifficulty Class ====================

class AdaptiveDifficulty {
    /**
     * Create an AdaptiveDifficulty instance
     * @param {Object} options - Configuration options
     * @param {boolean} options.enabled - Whether system is active (default: false)
     * @param {boolean} options.shadowMode - If true, only logs suggestions (default: true)
     * @param {number} options.initialTier - Starting tier (default: 3)
     */
    constructor(options = {}) {
        // Feature flags - OFF by default for safety
        this.enabled = options.enabled ?? false;
        this.shadowMode = options.shadowMode ?? true;
        
        // Current state
        this.currentTier = options.initialTier ?? ADAPTIVE_CONFIG.DEFAULT_TIER;
        this.answerWindow = [];
        
        // Statistics tracking
        this.stats = {
            totalAnswers: 0,
            correctAnswers: 0,
            tierChanges: [],
            sessionStart: Date.now()
        };
        
        // Try to load persisted data
        this._loadFromStorage();
        
        console.log(`[AdaptiveDifficulty] Initialized - enabled: ${this.enabled}, shadowMode: ${this.shadowMode}, tier: ${this.currentTier}`);
    }
    
    // ==================== Public API ====================
    
    /**
     * Record an answer and potentially adjust difficulty
     * @param {boolean} isCorrect - Whether answer was correct
     * @param {number} responseTimeMs - Time taken to answer in milliseconds
     * @param {number} maxTimeMs - Maximum allowed time (for speed calculation)
     * @returns {number|null} Suggested tier (null if shadowMode or disabled)
     */
    recordAnswer(isCorrect, responseTimeMs, maxTimeMs) {
        // Early exit if disabled
        if (!this.enabled) {
            return null;
        }
        
        // Calculate speed score (0-1, faster = higher)
        const speedScore = this._calculateSpeedScore(responseTimeMs, maxTimeMs);
        
        // Add to rolling window
        this.answerWindow.push({
            correct: isCorrect,
            speed: speedScore,
            timestamp: Date.now()
        });
        
        // Trim to window size
        if (this.answerWindow.length > ADAPTIVE_CONFIG.WINDOW_SIZE) {
            this.answerWindow.shift();
        }
        
        // Update stats
        this.stats.totalAnswers++;
        if (isCorrect) {
            this.stats.correctAnswers++;
        }
        
        // Calculate and possibly adjust tier
        const suggestedTier = this._calculateTierAdjustment();
        
        // Shadow mode: log but don't return
        if (this.shadowMode) {
            console.log(`[AdaptiveDifficulty:SHADOW] Would suggest tier ${suggestedTier} (current: ${this.currentTier})`);
            return null;
        }
        
        return suggestedTier;
    }
    
    /**
     * Get current difficulty tier
     * @returns {number} Current tier (1-5)
     */
    getTier() {
        if (!this.enabled) {
            return null;
        }
        return this.currentTier;
    }
    
    /**
     * Get performance statistics
     * @returns {Object} Stats object
     */
    getStats() {
        const accuracy = this.stats.totalAnswers > 0 
            ? (this.stats.correctAnswers / this.stats.totalAnswers * 100).toFixed(1)
            : 0;
            
        return {
            ...this.stats,
            accuracy: `${accuracy}%`,
            currentTier: this.currentTier,
            windowSize: this.answerWindow.length
        };
    }
    
    /**
     * Reset to initial state (for new game)
     */
    reset() {
        this.currentTier = ADAPTIVE_CONFIG.DEFAULT_TIER;
        this.answerWindow = [];
        this.stats = {
            totalAnswers: 0,
            correctAnswers: 0,
            tierChanges: [],
            sessionStart: Date.now()
        };
        
        console.log('[AdaptiveDifficulty] Reset to initial state');
    }
    
    /**
     * Enable the system (can be called after construction)
     * @param {boolean} shadowMode - Whether to run in shadow mode
     */
    enable(shadowMode = false) {
        this.enabled = true;
        this.shadowMode = shadowMode;
        console.log(`[AdaptiveDifficulty] Enabled - shadowMode: ${shadowMode}`);
    }
    
    /**
     * Disable the system
     */
    disable() {
        this.enabled = false;
        console.log('[AdaptiveDifficulty] Disabled');
    }
    
    // ==================== Private Methods ====================
    
    /**
     * Calculate speed score from response time
     * @private
     */
    _calculateSpeedScore(responseTimeMs, maxTimeMs) {
        if (!maxTimeMs || maxTimeMs <= 0) {
            return 0.5; // Default for untimed questions
        }
        
        // Faster = higher score (clamped 0-1)
        const score = Math.max(0, 1 - (responseTimeMs / maxTimeMs));
        return Math.min(1, score);
    }
    
    /**
     * Calculate tier adjustment based on rolling window
     * @private
     */
    _calculateTierAdjustment() {
        // Need full window to make decisions
        if (this.answerWindow.length < ADAPTIVE_CONFIG.WINDOW_SIZE) {
            return this.currentTier;
        }
        
        // Calculate accuracy (0-1)
        const correctCount = this.answerWindow.filter(a => a.correct).length;
        const accuracy = correctCount / ADAPTIVE_CONFIG.WINDOW_SIZE;
        
        // Calculate average speed (0-1)
        const avgSpeed = this.answerWindow.reduce((sum, a) => sum + a.speed, 0) / ADAPTIVE_CONFIG.WINDOW_SIZE;
        
        // Combined performance score
        const performance = (accuracy * ADAPTIVE_CONFIG.ACCURACY_WEIGHT) + 
                           (avgSpeed * ADAPTIVE_CONFIG.SPEED_WEIGHT);
        
        const previousTier = this.currentTier;
        
        // Adjust tier based on performance
        if (performance > ADAPTIVE_CONFIG.PROMOTE_THRESHOLD && this.currentTier < ADAPTIVE_CONFIG.MAX_TIER) {
            this.currentTier++;
            this._recordTierChange(previousTier, this.currentTier, 'promote', performance);
        } else if (performance < ADAPTIVE_CONFIG.DEMOTE_THRESHOLD && this.currentTier > ADAPTIVE_CONFIG.MIN_TIER) {
            this.currentTier--;
            this._recordTierChange(previousTier, this.currentTier, 'demote', performance);
        }
        
        // Persist state
        this._saveToStorage();
        
        return this.currentTier;
    }
    
    /**
     * Record a tier change for analytics
     * @private
     */
    _recordTierChange(from, to, reason, performance) {
        const change = {
            from,
            to,
            reason,
            performance: performance.toFixed(3),
            timestamp: Date.now()
        };
        
        this.stats.tierChanges.push(change);
        
        console.log(`[AdaptiveDifficulty] Tier ${reason}: ${from} → ${to} (performance: ${change.performance})`);
    }
    
    /**
     * Save state to localStorage
     * @private
     */
    _saveToStorage() {
        try {
            const data = {
                currentTier: this.currentTier,
                stats: this.stats,
                savedAt: Date.now()
            };
            localStorage.setItem(ADAPTIVE_CONFIG.STORAGE_KEY, JSON.stringify(data));
        } catch (err) {
            console.warn('[AdaptiveDifficulty] Failed to save to storage:', err);
        }
    }
    
    /**
     * Load state from localStorage
     * @private
     */
    _loadFromStorage() {
        try {
            const raw = localStorage.getItem(ADAPTIVE_CONFIG.STORAGE_KEY);
            if (!raw) return;
            
            const data = JSON.parse(raw);
            
            // Only restore if saved recently (within 24 hours)
            const age = Date.now() - (data.savedAt || 0);
            if (age > 24 * 60 * 60 * 1000) {
                console.log('[AdaptiveDifficulty] Stored data expired, using defaults');
                return;
            }
            
            this.currentTier = data.currentTier ?? ADAPTIVE_CONFIG.DEFAULT_TIER;
            console.log(`[AdaptiveDifficulty] Restored tier ${this.currentTier} from storage`);
        } catch (err) {
            console.warn('[AdaptiveDifficulty] Failed to load from storage:', err);
        }
    }
}

// ==================== Export ====================

// Attach to window for script tag loading (primary method)
if (typeof window !== 'undefined') {
    window.AdaptiveDifficulty = AdaptiveDifficulty;
    window.ADAPTIVE_CONFIG = ADAPTIVE_CONFIG;
}

// Also export for ES6 modules if supported
// This allows future migration to module imports
try {
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = { AdaptiveDifficulty, ADAPTIVE_CONFIG };
    }
} catch (e) {
    // Ignore - not in CommonJS environment
}
