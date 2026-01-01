/**
 * Data Migration Script
 * 
 * Migrates existing localStorage leaderboard data to SQLite database.
 * Run this once when upgrading from v1.x to v2.0.
 * 
 * @module migration
 * @version 2.0.0
 */

import { sqliteManager } from './core/storage/SQLiteManager';

interface LegacyLeaderboardEntry {
  name: string;
  score: number;
  bestScore?: number;
  previousScore?: number | null;
  lastUpdatedDatetime?: string;
  createdDatetime?: string;
  gamesPlayed?: number;
}

const LEGACY_STORAGE_KEY = 'flappyLeaderboard';

/**
 * Check if migration is needed
 */
export function needsMigration(): boolean {
  const legacyData = localStorage.getItem(LEGACY_STORAGE_KEY);
  const migrationComplete = localStorage.getItem('sqlite_migration_complete');
  
  return legacyData !== null && migrationComplete !== 'true';
}

/**
 * Get legacy leaderboard data from localStorage
 */
function getLegacyData(): LegacyLeaderboardEntry[] {
  try {
    const data = localStorage.getItem(LEGACY_STORAGE_KEY);
    if (!data) return [];
    
    const parsed = JSON.parse(data);
    if (!Array.isArray(parsed)) return [];
    
    return parsed;
  } catch (error) {
    console.error('❌ Failed to parse legacy leaderboard data:', error);
    return [];
  }
}

/**
 * Migrate localStorage data to SQLite
 */
export async function migrateToSQLite(): Promise<{
  success: boolean;
  migrated: number;
  errors: string[];
}> {
  const result = {
    success: false,
    migrated: 0,
    errors: [] as string[],
  };

  console.log('🔄 Starting data migration to SQLite...');

  try {
    // Initialize SQLite if not already done
    const initialized = await sqliteManager.init();
    if (!initialized) {
      result.errors.push('Failed to initialize SQLite database');
      return result;
    }

    // Get legacy data
    const legacyEntries = getLegacyData();
    console.log(`📊 Found ${legacyEntries.length} legacy entries to migrate`);

    if (legacyEntries.length === 0) {
      result.success = true;
      localStorage.setItem('sqlite_migration_complete', 'true');
      return result;
    }

    // Migrate each entry
    for (const entry of legacyEntries) {
      try {
        // Create or get player
        const player = sqliteManager.getOrCreatePlayer(entry.name);
        if (!player) {
          result.errors.push(`Failed to create player: ${entry.name}`);
          continue;
        }
        
        // Add score
        if (entry.score > 0) {
          sqliteManager.addScore(player.id, 'flappy-cinnamoroll', entry.score);
          result.migrated++;
        }

        console.log(`✅ Migrated: ${entry.name} (score: ${entry.score})`);
      } catch (err) {
        const errorMsg = `Failed to migrate ${entry.name}: ${err}`;
        result.errors.push(errorMsg);
        console.error(`❌ ${errorMsg}`);
      }
    }

    // Mark migration as complete
    localStorage.setItem('sqlite_migration_complete', 'true');
    localStorage.setItem('sqlite_migration_date', new Date().toISOString());
    localStorage.setItem('sqlite_migration_count', String(result.migrated));

    result.success = result.errors.length === 0;
    console.log(`✅ Migration complete! Migrated ${result.migrated} entries`);

  } catch (error) {
    result.errors.push(`Migration failed: ${error}`);
    console.error('❌ Migration failed:', error);
  }

  return result;
}

/**
 * Create backup of localStorage data before migration
 */
export function backupLegacyData(): string | null {
  try {
    const data = localStorage.getItem(LEGACY_STORAGE_KEY);
    if (data) {
      const backupKey = `${LEGACY_STORAGE_KEY}_backup_${Date.now()}`;
      localStorage.setItem(backupKey, data);
      console.log(`💾 Backup created: ${backupKey}`);
      return backupKey;
    }
    return null;
  } catch (error) {
    console.error('❌ Failed to create backup:', error);
    return null;
  }
}

/**
 * Restore from backup (in case migration fails)
 */
export function restoreFromBackup(backupKey: string): boolean {
  try {
    const data = localStorage.getItem(backupKey);
    if (data) {
      localStorage.setItem(LEGACY_STORAGE_KEY, data);
      console.log('✅ Data restored from backup');
      return true;
    }
    return false;
  } catch (error) {
    console.error('❌ Failed to restore from backup:', error);
    return false;
  }
}

/**
 * Run full migration with backup
 */
export async function runMigration(): Promise<boolean> {
  if (!needsMigration()) {
    console.log('ℹ️ Migration not needed or already complete');
    return true;
  }

  // Create backup first
  const backupKey = backupLegacyData();

  // Run migration
  const result = await migrateToSQLite();

  if (!result.success && backupKey) {
    console.log('⚠️ Migration had errors, backup preserved at:', backupKey);
  }

  return result.success;
}

// Auto-run migration when module loads (if in browser)
if (typeof window !== 'undefined') {
  // Wait for DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      runMigration().catch(console.error);
    });
  } else {
    runMigration().catch(console.error);
  }
}
