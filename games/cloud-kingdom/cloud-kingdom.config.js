/**
 * Cloud Kingdom Explorer - Configuration
 */

export const KINGDOM_CONFIG = Object.freeze({
  TILE_SIZE: 48,
  VIEWPORT_TILES_X: 10,
  VIEWPORT_TILES_Y: 8,
  PLAYER_MOVE_SPEED: 150, // ms per tile
  
  DIFFICULTY_SETTINGS: {
    1: { mapSize: 8, puzzles: false, enemies: false, timeLimit: null },
    2: { mapSize: 12, puzzles: 'simple', enemies: false, timeLimit: null },
    3: { mapSize: 16, puzzles: 'moderate', enemies: false, timeLimit: null },
    4: { mapSize: 20, puzzles: 'complex', enemies: false, timeLimit: null },
    5: { mapSize: 24, puzzles: 'complex', enemies: 'passive', timeLimit: null },
    6: { mapSize: 32, puzzles: 'advanced', enemies: 'passive', timeLimit: 600 },
    7: { mapSize: 40, puzzles: 'advanced', enemies: 'active', timeLimit: 300 }
  },
  
  ITEMS: {
    golden_key: { name: 'Golden Key', icon: '🗝️', stackable: true },
    flower: { name: 'Cloud Flower', icon: '🌸', stackable: true },
    gem: { name: 'Star Gem', icon: '💎', stackable: true },
    candy: { name: 'Cloud Candy', icon: '🍬', stackable: true },
    map_scroll: { name: 'Map Fragment', icon: '📜', stackable: false }
  },
  
  LEADERBOARD_KEY: 'cloudKingdomLeaderboard'
});

export const TILE_TYPES = {
  void: { walkable: false, sprite: '░', color: '#000' },
  cloud: { walkable: true, sprite: '☁️', color: '#fff' },
  tree: { walkable: false, sprite: '🌲', color: '#228b22' },
  flower: { walkable: true, sprite: '🌸', color: '#ffb7c5' },
  water: { walkable: false, sprite: '🌊', color: '#4169e1' },
  door: { walkable: false, sprite: '🚪', interactive: true },
  chest: { walkable: false, sprite: '📦', interactive: true }
};

export function getDifficultyFromAge(age) {
  if (age <= 8) return 1;
  if (age <= 10) return 2;
  if (age <= 12) return 3;
  if (age <= 15) return 4;
  if (age <= 20) return 5;
  if (age <= 25) return 6;
  return 7;
}

export default KINGDOM_CONFIG;
