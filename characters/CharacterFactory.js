/**
 * Character Factory
 * 
 * Factory for creating character instances with preset configurations.
 * Centralizes character creation for consistency across games.
 * 
 * @module characters/CharacterFactory
 * @version 1.0.0
 */

import { CinnamorollSprite } from './cinnamoroll/CinnamorollSprite.js';
import { Ghost } from './enemies/Ghost.js';

/**
 * Character type constants
 */
export const CharacterType = Object.freeze({
  CINNAMOROLL: 'cinnamoroll',
  GHOST: 'ghost',
  // Future characters
  MOCHA: 'mocha',
  CHIFFON: 'chiffon',
  CAPPUCCINO: 'cappuccino',
  MILK: 'milk',
  ESPRESSO: 'espresso'
});

/**
 * Preset character configurations
 */
const CHARACTER_PRESETS = {
  [CharacterType.CINNAMOROLL]: {
    class: CinnamorollSprite,
    defaults: {
      width: 40,
      height: 40,
      bodyColor: '#FFFFFF',
      cheekColor: '#FFB6C1',
      earColor: '#87CEEB'
    }
  },
  [CharacterType.GHOST]: {
    class: Ghost,
    defaults: {
      width: 50,
      height: 50,
      baseSpeed: 1.5,
      color: 'rgba(100, 100, 150, 0.7)'
    }
  }
};

/**
 * Factory for creating game characters
 */
export class CharacterFactory {
  /**
   * Create a character by type
   * @param {string} type - Character type from CharacterType enum
   * @param {Object} options - Override options
   * @returns {CharacterBase} Character instance
   */
  static create(type, options = {}) {
    const preset = CHARACTER_PRESETS[type];
    
    if (!preset) {
      console.warn(`Unknown character type: ${type}`);
      return null;
    }
    
    const mergedOptions = {
      ...preset.defaults,
      ...options
    };
    
    return new preset.class(mergedOptions);
  }
  
  /**
   * Create Cinnamoroll player character
   * @param {Object} config - Game config with PLAYER_SIZE, PLAYER_X_PERCENT
   * @param {number} canvasWidth - Canvas width
   * @param {number} canvasHeight - Canvas height
   * @returns {CinnamorollSprite}
   */
  static createPlayer(config, canvasWidth, canvasHeight) {
    const size = config.PLAYER_SIZE || 40;
    const xPercent = config.PLAYER_X_PERCENT || 0.15;
    
    return CharacterFactory.create(CharacterType.CINNAMOROLL, {
      x: canvasWidth * xPercent,
      y: canvasHeight / 2,
      width: size,
      height: size
    });
  }
  
  /**
   * Create Ghost enemy character
   * @param {Object} config - Game config with GHOST_SIZE, GHOST_BASE_SPEED
   * @returns {Ghost}
   */
  static createGhost(config) {
    return CharacterFactory.create(CharacterType.GHOST, {
      width: config.GHOST_SIZE || 50,
      height: config.GHOST_SIZE || 50,
      baseSpeed: config.GHOST_BASE_SPEED || 1.5
    });
  }
  
  /**
   * Get available character types
   * @returns {string[]} Array of character type names
   */
  static getAvailableTypes() {
    return Object.keys(CHARACTER_PRESETS);
  }
  
  /**
   * Check if character type is available
   * @param {string} type - Character type
   * @returns {boolean}
   */
  static isAvailable(type) {
    return type in CHARACTER_PRESETS;
  }
  
  /**
   * Register a custom character type
   * @param {string} type - Character type identifier
   * @param {Function} characterClass - Character class constructor
   * @param {Object} defaults - Default options
   */
  static register(type, characterClass, defaults = {}) {
    CHARACTER_PRESETS[type] = {
      class: characterClass,
      defaults
    };
  }
}

export default CharacterFactory;
