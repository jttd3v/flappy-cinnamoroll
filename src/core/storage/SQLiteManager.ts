/**
 * SQLiteManager - Browser SQLite with sql.js
 * 
 * Provides SQLite database in browser using WebAssembly.
 * Data is persisted to IndexedDB for durability.
 * 
 * @module core/storage/SQLiteManager
 * @version 2.0.0
 */

import initSqlJs, { Database, SqlJsStatic } from 'sql.js';

export interface PlayerRecord {
  id: number;
  name: string;
  created_at: string;
  last_played: string | null;
}

export interface ScoreRecord {
  id: number;
  player_id: number;
  game: string;
  score: number;
  level: number;
  played_at: string;
}

export interface AchievementRecord {
  id: number;
  player_id: number;
  achievement_key: string;
  unlocked_at: string;
}

const DB_NAME = 'CinnamorollGamesDB';
const DB_STORE = 'sqlite';
const DB_VERSION = 1;

/**
 * SQLite database manager using sql.js (WASM)
 */
export class SQLiteManager {
  private static instance: SQLiteManager | null = null;
  
  private SQL: SqlJsStatic | null = null;
  private db: Database | null = null;
  private initialized: boolean = false;

  private constructor() {
    // Private constructor for singleton
  }

  /**
   * Get singleton instance
   */
  static getInstance(): SQLiteManager {
    if (!SQLiteManager.instance) {
      SQLiteManager.instance = new SQLiteManager();
    }
    return SQLiteManager.instance;
  }

  /**
   * Initialize the database
   */
  async init(): Promise<boolean> {
    if (this.initialized) return true;

    try {
      // Initialize sql.js with WASM
      this.SQL = await initSqlJs({
        // Load WASM from CDN (can also be bundled locally)
        locateFile: (file: string) => `https://sql.js.org/dist/${file}`,
      });

      // Try to load existing database from IndexedDB
      const savedData = await this.loadFromIndexedDB();
      
      if (savedData) {
        this.db = new this.SQL.Database(savedData);
        console.log('💾 SQLite: Loaded existing database');
      } else {
        this.db = new this.SQL.Database();
        await this.runMigrations();
        console.log('💾 SQLite: Created new database');
      }

      this.initialized = true;
      console.log('💾 SQLiteManager initialized');
      
      return true;
    } catch (error) {
      console.error('💾 SQLiteManager: Failed to initialize', error);
      return false;
    }
  }

  /**
   * Run database schema migrations
   */
  private async runMigrations(): Promise<void> {
    if (!this.db) return;

    // Create tables
    this.db.run(`
      CREATE TABLE IF NOT EXISTS players (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE NOT NULL COLLATE NOCASE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        last_played DATETIME
      );
    `);

    this.db.run(`
      CREATE TABLE IF NOT EXISTS scores (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        player_id INTEGER NOT NULL,
        game TEXT NOT NULL,
        score INTEGER NOT NULL,
        level INTEGER DEFAULT 1,
        played_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (player_id) REFERENCES players(id)
      );
    `);

    this.db.run(`
      CREATE TABLE IF NOT EXISTS achievements (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        player_id INTEGER NOT NULL,
        achievement_key TEXT NOT NULL,
        unlocked_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (player_id) REFERENCES players(id),
        UNIQUE(player_id, achievement_key)
      );
    `);

    this.db.run(`
      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      );
    `);

    // Create indexes
    this.db.run(`CREATE INDEX IF NOT EXISTS idx_scores_player ON scores(player_id);`);
    this.db.run(`CREATE INDEX IF NOT EXISTS idx_scores_game ON scores(game);`);
    this.db.run(`CREATE INDEX IF NOT EXISTS idx_scores_score ON scores(score DESC);`);
    this.db.run(`CREATE INDEX IF NOT EXISTS idx_achievements_player ON achievements(player_id);`);

    // Save after migrations
    await this.persist();
  }

  // ==========================================
  // PLAYER OPERATIONS
  // ==========================================

  /**
   * Get or create a player by name
   */
  getOrCreatePlayer(name: string): PlayerRecord | null {
    if (!this.db) return null;

    const trimmedName = name.trim();
    if (!trimmedName) return null;

    // Try to find existing player (case-insensitive)
    const existing = this.db.exec(
      `SELECT id, name, created_at, last_played FROM players WHERE name = ? COLLATE NOCASE`,
      [trimmedName]
    );

    if (existing.length > 0 && existing[0].values.length > 0) {
      const row = existing[0].values[0];
      return {
        id: row[0] as number,
        name: row[1] as string,
        created_at: row[2] as string,
        last_played: row[3] as string | null,
      };
    }

    // Create new player
    this.db.run(`INSERT INTO players (name) VALUES (?)`, [trimmedName]);
    
    // Get the created player
    const created = this.db.exec(
      `SELECT id, name, created_at, last_played FROM players WHERE name = ? COLLATE NOCASE`,
      [trimmedName]
    );

    if (created.length > 0 && created[0].values.length > 0) {
      const row = created[0].values[0];
      this.persist(); // Save to IndexedDB
      return {
        id: row[0] as number,
        name: row[1] as string,
        created_at: row[2] as string,
        last_played: row[3] as string | null,
      };
    }

    return null;
  }

  /**
   * Update player's last played timestamp
   */
  updateLastPlayed(playerId: number): void {
    if (!this.db) return;
    this.db.run(
      `UPDATE players SET last_played = CURRENT_TIMESTAMP WHERE id = ?`,
      [playerId]
    );
    this.persist();
  }

  /**
   * Get all players
   */
  getAllPlayers(): PlayerRecord[] {
    if (!this.db) return [];

    const result = this.db.exec(
      `SELECT id, name, created_at, last_played FROM players ORDER BY last_played DESC`
    );

    if (result.length === 0) return [];

    return result[0].values.map(row => ({
      id: row[0] as number,
      name: row[1] as string,
      created_at: row[2] as string,
      last_played: row[3] as string | null,
    }));
  }

  // ==========================================
  // SCORE OPERATIONS
  // ==========================================

  /**
   * Add a new score
   */
  addScore(playerId: number, game: string, score: number, level: number = 1): number {
    if (!this.db) return -1;

    this.db.run(
      `INSERT INTO scores (player_id, game, score, level) VALUES (?, ?, ?, ?)`,
      [playerId, game, score, level]
    );

    // Get the ID of the inserted row
    const result = this.db.exec(`SELECT last_insert_rowid()`);
    const newId = result[0]?.values[0]?.[0] as number ?? -1;

    // Update last played
    this.updateLastPlayed(playerId);

    return newId;
  }

  /**
   * Get high scores for a game
   */
  getHighScores(game: string, limit: number = 10): Array<ScoreRecord & { player_name: string }> {
    if (!this.db) return [];

    const result = this.db.exec(`
      SELECT s.id, s.player_id, s.game, s.score, s.level, s.played_at, p.name as player_name
      FROM scores s
      JOIN players p ON s.player_id = p.id
      WHERE s.game = ?
      ORDER BY s.score DESC
      LIMIT ?
    `, [game, limit]);

    if (result.length === 0) return [];

    return result[0].values.map(row => ({
      id: row[0] as number,
      player_id: row[1] as number,
      game: row[2] as string,
      score: row[3] as number,
      level: row[4] as number,
      played_at: row[5] as string,
      player_name: row[6] as string,
    }));
  }

  /**
   * Get player's best score for a game
   */
  getPlayerBestScore(playerId: number, game: string): number {
    if (!this.db) return 0;

    const result = this.db.exec(
      `SELECT MAX(score) FROM scores WHERE player_id = ? AND game = ?`,
      [playerId, game]
    );

    return result[0]?.values[0]?.[0] as number ?? 0;
  }

  /**
   * Get player's score history for a game
   */
  getPlayerScoreHistory(playerId: number, game: string, limit: number = 20): ScoreRecord[] {
    if (!this.db) return [];

    const result = this.db.exec(`
      SELECT id, player_id, game, score, level, played_at
      FROM scores
      WHERE player_id = ? AND game = ?
      ORDER BY played_at DESC
      LIMIT ?
    `, [playerId, game, limit]);

    if (result.length === 0) return [];

    return result[0].values.map(row => ({
      id: row[0] as number,
      player_id: row[1] as number,
      game: row[2] as string,
      score: row[3] as number,
      level: row[4] as number,
      played_at: row[5] as string,
    }));
  }

  // ==========================================
  // ACHIEVEMENT OPERATIONS
  // ==========================================

  /**
   * Unlock an achievement
   */
  unlockAchievement(playerId: number, achievementKey: string): boolean {
    if (!this.db) return false;

    try {
      this.db.run(
        `INSERT OR IGNORE INTO achievements (player_id, achievement_key) VALUES (?, ?)`,
        [playerId, achievementKey]
      );
      this.persist();
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Check if player has achievement
   */
  hasAchievement(playerId: number, achievementKey: string): boolean {
    if (!this.db) return false;

    const result = this.db.exec(
      `SELECT 1 FROM achievements WHERE player_id = ? AND achievement_key = ?`,
      [playerId, achievementKey]
    );

    return result.length > 0 && result[0].values.length > 0;
  }

  /**
   * Get player's achievements
   */
  getPlayerAchievements(playerId: number): AchievementRecord[] {
    if (!this.db) return [];

    const result = this.db.exec(`
      SELECT id, player_id, achievement_key, unlocked_at
      FROM achievements
      WHERE player_id = ?
      ORDER BY unlocked_at DESC
    `, [playerId]);

    if (result.length === 0) return [];

    return result[0].values.map(row => ({
      id: row[0] as number,
      player_id: row[1] as number,
      achievement_key: row[2] as string,
      unlocked_at: row[3] as string,
    }));
  }

  // ==========================================
  // SETTINGS OPERATIONS
  // ==========================================

  /**
   * Get a setting value
   */
  getSetting(key: string): string | null {
    if (!this.db) return null;

    const result = this.db.exec(
      `SELECT value FROM settings WHERE key = ?`,
      [key]
    );

    return result[0]?.values[0]?.[0] as string ?? null;
  }

  /**
   * Set a setting value
   */
  setSetting(key: string, value: string): void {
    if (!this.db) return;

    this.db.run(
      `INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)`,
      [key, value]
    );
    this.persist();
  }

  // ==========================================
  // PERSISTENCE TO INDEXEDDB
  // ==========================================

  /**
   * Open IndexedDB connection
   */
  private openIndexedDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(DB_STORE)) {
          db.createObjectStore(DB_STORE);
        }
      };
    });
  }

  /**
   * Load database from IndexedDB
   */
  private async loadFromIndexedDB(): Promise<Uint8Array | null> {
    try {
      const db = await this.openIndexedDB();
      
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(DB_STORE, 'readonly');
        const store = transaction.objectStore(DB_STORE);
        const request = store.get('database');

        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
          resolve(request.result ?? null);
        };
      });
    } catch (error) {
      console.warn('💾 Failed to load from IndexedDB', error);
      return null;
    }
  }

  /**
   * Persist database to IndexedDB
   */
  async persist(): Promise<void> {
    if (!this.db) return;

    try {
      const data = this.db.export();
      const db = await this.openIndexedDB();

      return new Promise((resolve, reject) => {
        const transaction = db.transaction(DB_STORE, 'readwrite');
        const store = transaction.objectStore(DB_STORE);
        const request = store.put(data, 'database');

        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve();
      });
    } catch (error) {
      console.error('💾 Failed to persist to IndexedDB', error);
    }
  }

  /**
   * Export database to downloadable file
   */
  exportToFile(): void {
    if (!this.db) return;

    const data = this.db.export();
    const blob = new Blob([data.buffer as ArrayBuffer], { type: 'application/x-sqlite3' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `cinnamoroll-games-backup-${new Date().toISOString().split('T')[0]}.sqlite`;
    a.click();

    URL.revokeObjectURL(url);
  }

  /**
   * Import database from file
   */
  async importFromFile(file: File): Promise<boolean> {
    if (!this.SQL) return false;

    try {
      const arrayBuffer = await file.arrayBuffer();
      const data = new Uint8Array(arrayBuffer);

      // Close existing database
      if (this.db) {
        this.db.close();
      }

      // Create new database from file
      this.db = new this.SQL.Database(data);
      
      // Persist to IndexedDB
      await this.persist();

      console.log('💾 Database imported successfully');
      return true;
    } catch (error) {
      console.error('💾 Failed to import database', error);
      return false;
    }
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
    this.initialized = false;
    SQLiteManager.instance = null;
  }
}

// Export singleton instance
export const sqliteManager = SQLiteManager.getInstance();
