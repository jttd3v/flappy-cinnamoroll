/**
 * SQLiteManager Unit Tests
 * 
 * Tests for SQLite database operations.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// We'll mock sql.js since it requires WASM
vi.mock('sql.js', () => ({
  default: async () => ({
    Database: class MockDatabase {
      private data: Map<string, any[]> = new Map();
      
      constructor() {
        // Initialize tables
        this.data.set('players', []);
        this.data.set('scores', []);
        this.data.set('achievements', []);
        this.data.set('settings', []);
      }
      
      run(sql: string, params?: any[]): void {
        // Simple mock that stores data
        if (sql.includes('INSERT INTO players')) {
          this.data.get('players')?.push({ id: params![0], name: params![1] });
        }
      }
      
      exec(sql: string): any[] {
        if (sql.includes('SELECT * FROM players')) {
          return [{
            columns: ['id', 'name', 'created_at', 'last_active'],
            values: this.data.get('players')?.map(p => [p.id, p.name, Date.now(), Date.now()]) || [],
          }];
        }
        return [];
      }
      
      export(): Uint8Array {
        return new Uint8Array([1, 2, 3]);
      }
      
      close(): void {}
    },
  }),
}));

// Import after mocks are set up
import { SQLiteManager, type PlayerRecord } from '../../src/core/storage/SQLiteManager';

describe('SQLiteManager', () => {
  let db: SQLiteManager;

  beforeEach(async () => {
    db = new SQLiteManager();
    await db.initialize();
  });

  afterEach(() => {
    // Clean up
  });

  describe('initialization', () => {
    it('should initialize the database', async () => {
      const newDb = new SQLiteManager();
      await expect(newDb.initialize()).resolves.not.toThrow();
    });
  });

  describe('player operations', () => {
    it('should create a player', async () => {
      const player = await db.createPlayer('TestPlayer');
      
      expect(player).toBeDefined();
      expect(player.name).toBe('TestPlayer');
      expect(player.id).toBeDefined();
    });

    it('should get all players', async () => {
      await db.createPlayer('Player1');
      await db.createPlayer('Player2');
      
      const players = db.getPlayers();
      
      expect(players).toBeDefined();
    });
  });

  describe('export/import', () => {
    it('should export database to binary', () => {
      const data = db.exportDatabase();
      
      expect(data).toBeInstanceOf(Uint8Array);
    });
  });
});
