/**
 * Characters Module - Barrel Export
 * 
 * Re-exports all character-related modules for easy importing.
 * 
 * @module characters
 * @version 1.0.0
 * 
 * @example
 * import { CinnamorollSprite, Ghost, CharacterFactory } from './characters/index.js';
 */

// Base
export { CharacterBase } from './shared/CharacterBase.js';

// Characters
export { CinnamorollSprite } from './cinnamoroll/CinnamorollSprite.js';

// Enemies
export { Ghost } from './enemies/Ghost.js';

// Factory
export { CharacterFactory, CharacterType } from './CharacterFactory.js';
