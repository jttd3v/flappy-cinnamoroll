/**
 * Leaderboard.js - Score Management System
 * 
 * Manages player scores, rankings, and leaderboard storage.
 * Supports player profiles and score history.
 * 
 * @module core/storage/Leaderboard
 * @version 1.0.0
 */

/**
 * Score entry
 * @typedef {Object} ScoreEntry
 * @property {string} name - Player name
 * @property {number} score - Best score
 * @property {number} [previousScore] - Previous best
 * @property {string} createdDatetime - First play datetime
 * @property {string} lastUpdatedDatetime - Last update datetime
 * @property {number} gamesPlayed - Total games played
 */

/**
 * Leaderboard management system
 */
export class Leaderboard {
  /**
   * Create a leaderboard instance
   * @param {string} storageKey - LocalStorage key
   * @param {number} [maxEntries=10] - Maximum leaderboard entries
   */
  constructor(storageKey, maxEntries = 10) {
    /** @type {string} */
    this.storageKey = storageKey;
    
    /** @type {number} */
    this.maxEntries = maxEntries;
  }
  
  // ==========================================
  // SCORE RETRIEVAL
  // ==========================================
  
  /**
   * Get all leaderboard scores
   * @returns {ScoreEntry[]}
   */
  getScores() {
    try {
      const data = localStorage.getItem(this.storageKey);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Leaderboard: Failed to read scores:', e);
      return [];
    }
  }
  
  /**
   * Get top N scores
   * @param {number} [n=5] - Number of scores to return
   * @returns {ScoreEntry[]}
   */
  getTopScores(n = 5) {
    return this.getScores().slice(0, n);
  }
  
  /**
   * Get highest score
   * @returns {number}
   */
  getHighScore() {
    const scores = this.getScores();
    return scores.length > 0 ? scores[0].score : 0;
  }
  
  // ==========================================
  // PLAYER MANAGEMENT
  // ==========================================
  
  /**
   * Validate player name
   * @param {string} name - Name to validate
   * @returns {{valid: boolean, sanitized: string, error: string|null}}
   */
  validateName(name) {
    if (name === null || name === undefined) {
      return { valid: false, sanitized: '', error: 'Name is required' };
    }
    
    const sanitized = String(name).trim();
    
    if (sanitized.length === 0) {
      return { valid: false, sanitized: '', error: 'Name cannot be empty' };
    }
    
    if (sanitized.length < 1) {
      return { valid: false, sanitized: '', error: 'Name too short' };
    }
    
    if (sanitized.length > 12) {
      return { 
        valid: false, 
        sanitized: sanitized.substring(0, 12), 
        error: 'Name truncated to 12 characters' 
      };
    }
    
    return { valid: true, sanitized: sanitized, error: null };
  }
  
  /**
   * Find player by name (case-insensitive)
   * @param {string} name - Player name
   * @returns {ScoreEntry|null}
   */
  findPlayer(name) {
    if (!name) return null;
    
    const scores = this.getScores();
    const normalizedName = name.toLowerCase().trim();
    return scores.find(entry => entry.name.toLowerCase() === normalizedName) || null;
  }
  
  /**
   * Check if player exists
   * @param {string} name - Player name
   * @returns {boolean}
   */
  playerExists(name) {
    return this.findPlayer(name) !== null;
  }
  
  /**
   * Get player's best score
   * @param {string} name - Player name
   * @returns {number}
   */
  getPlayerBestScore(name) {
    const player = this.findPlayer(name);
    return player ? player.score : 0;
  }
  
  /**
   * Get all unique player names
   * @returns {string[]}
   */
  getAllPlayers() {
    return this.getScores().map(entry => entry.name);
  }
  
  // ==========================================
  // SCORE MANAGEMENT
  // ==========================================
  
  /**
   * Add or update a score
   * @param {string} name - Player name
   * @param {number} score - Score to record
   * @returns {{success: boolean, action: string, reason?: string, scores: ScoreEntry[]}}
   */
  addScore(name, score) {
    // Validate name
    const validation = this.validateName(name);
    if (!validation.valid && !validation.sanitized) {
      return { 
        success: false, 
        action: 'rejected', 
        reason: validation.error, 
        scores: this.getScores() 
      };
    }
    
    const sanitizedName = validation.sanitized;
    
    // Validate score
    if (typeof score !== 'number' || isNaN(score) || score < 0) {
      return { 
        success: false, 
        action: 'rejected', 
        reason: 'Invalid score', 
        scores: this.getScores() 
      };
    }
    
    // Skip zero scores
    if (score === 0) {
      return { 
        success: false, 
        action: 'skipped', 
        reason: 'Zero score not recorded', 
        scores: this.getScores() 
      };
    }
    
    const scores = this.getScores();
    const normalizedName = sanitizedName.toLowerCase();
    const existingIndex = scores.findIndex(
      entry => entry.name.toLowerCase() === normalizedName
    );
    const timestamp = new Date().toISOString();
    
    let action = '';
    
    if (existingIndex !== -1) {
      // Existing player
      const existingEntry = scores[existingIndex];
      
      if (score > existingEntry.score) {
        // New high score
        scores[existingIndex] = {
          name: sanitizedName,
          score: score,
          bestScore: score,
          previousScore: existingEntry.score,
          lastUpdatedDatetime: timestamp,
          createdDatetime: existingEntry.createdDatetime || timestamp,
          gamesPlayed: (existingEntry.gamesPlayed || 1) + 1
        };
        action = 'updated';
      } else {
        // Score not higher - just update play count
        scores[existingIndex] = {
          ...existingEntry,
          lastUpdatedDatetime: timestamp,
          gamesPlayed: (existingEntry.gamesPlayed || 1) + 1
        };
        action = 'unchanged';
      }
    } else {
      // New player
      scores.push({
        name: sanitizedName,
        score: score,
        bestScore: score,
        previousScore: null,
        lastUpdatedDatetime: timestamp,
        createdDatetime: timestamp,
        gamesPlayed: 1
      });
      action = 'created';
    }
    
    // Sort by score descending
    scores.sort((a, b) => b.score - a.score);
    
    // Keep only top entries
    const topScores = scores.slice(0, this.maxEntries);
    
    // Save
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(topScores));
    } catch (e) {
      console.error('Leaderboard: Failed to save:', e);
      return { 
        success: false, 
        action: 'error', 
        reason: 'Storage failed', 
        scores: this.getScores() 
      };
    }
    
    return { success: true, action: action, scores: topScores };
  }
  
  /**
   * Check if score qualifies for leaderboard
   * @param {number} score - Score to check
   * @returns {boolean}
   */
  isHighScore(score) {
    const scores = this.getScores();
    if (scores.length < this.maxEntries) return score > 0;
    return score > scores[scores.length - 1].score;
  }
  
  /**
   * Get rank for a score
   * @param {number} score - Score to rank
   * @returns {number} Rank (1-based), or 0 if not ranked
   */
  getRank(score) {
    const scores = this.getScores();
    
    for (let i = 0; i < scores.length; i++) {
      if (score >= scores[i].score) {
        return i + 1;
      }
    }
    
    if (scores.length < this.maxEntries) {
      return scores.length + 1;
    }
    
    return 0;
  }
  
  // ==========================================
  // UTILITY
  // ==========================================
  
  /**
   * Format datetime for display
   * @param {string} isoString - ISO datetime string
   * @returns {string}
   */
  formatDatetime(isoString) {
    if (!isoString) return 'N/A';
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString() + ' ' + 
             date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return 'N/A';
    }
  }
  
  /**
   * Clear all leaderboard data
   */
  clear() {
    localStorage.removeItem(this.storageKey);
  }
  
  /**
   * Export leaderboard as JSON
   * @returns {string}
   */
  export() {
    return JSON.stringify(this.getScores(), null, 2);
  }
  
  /**
   * Import leaderboard from JSON
   * @param {string} json - JSON string
   * @returns {boolean} Success
   */
  import(json) {
    try {
      const data = JSON.parse(json);
      if (!Array.isArray(data)) return false;
      
      localStorage.setItem(this.storageKey, JSON.stringify(data));
      return true;
    } catch (e) {
      console.error('Leaderboard: Import failed:', e);
      return false;
    }
  }
}

export default Leaderboard;
