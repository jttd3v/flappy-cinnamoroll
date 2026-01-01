/**
 * CharacterBase.js - Base Character Class
 * 
 * Abstract base class for all game characters.
 * Provides common properties and methods.
 * 
 * @module characters/shared/CharacterBase
 * @version 1.0.0
 */

/**
 * Base character class
 * Extend this for all playable and NPC characters
 */
export class CharacterBase {
  /**
   * Create a character
   * @param {Object} config - Character configuration
   */
  constructor(config = {}) {
    // Position
    this.x = config.x ?? 0;
    this.y = config.y ?? 0;
    
    // Size
    this.width = config.width ?? 40;
    this.height = config.height ?? 40;
    
    // Physics
    this.velocity = 0;           // Legacy (vertical only)
    this.velocityX = 0;
    this.velocityY = 0;
    
    // State
    this.isAlive = true;
    this.isActive = true;
    
    // Animation
    this.rotation = 0;
    this.scale = 1;
    this.animationFrame = 0;
    
    // Identification
    this.type = config.type ?? 'character';
    this.name = config.name ?? 'Character';
  }
  
  // ==========================================
  // GETTERS
  // ==========================================
  
  /** @returns {number} Center X position */
  get centerX() {
    return this.x + this.width / 2;
  }
  
  /** @returns {number} Center Y position */
  get centerY() {
    return this.y + this.height / 2;
  }
  
  /** @returns {number} Right edge */
  get right() {
    return this.x + this.width;
  }
  
  /** @returns {number} Bottom edge */
  get bottom() {
    return this.y + this.height;
  }
  
  /** @returns {{x: number, y: number, width: number, height: number}} Bounding box */
  get bounds() {
    return {
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height
    };
  }
  
  // ==========================================
  // LIFECYCLE (Override in subclasses)
  // ==========================================
  
  /**
   * Initialize character
   */
  init() {
    // Override in subclass
  }
  
  /**
   * Update character state
   * @param {number} deltaTime - Time since last frame
   */
  update(deltaTime) {
    // Override in subclass
  }
  
  /**
   * Render character
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   */
  render(ctx) {
    // Override in subclass
  }
  
  /**
   * Reset character to initial state
   */
  reset() {
    this.isAlive = true;
    this.isActive = true;
    this.velocity = 0;
    this.velocityX = 0;
    this.velocityY = 0;
    this.rotation = 0;
  }
  
  /**
   * Called when character dies/is destroyed
   */
  onDeath() {
    this.isAlive = false;
  }
  
  /**
   * Called when character takes damage
   * @param {number} amount - Damage amount
   */
  onHit(amount = 1) {
    // Override in subclass
  }
  
  // ==========================================
  // MOVEMENT
  // ==========================================
  
  /**
   * Set position
   * @param {number} x - X position
   * @param {number} y - Y position
   */
  setPosition(x, y) {
    this.x = x;
    this.y = y;
  }
  
  /**
   * Move by offset
   * @param {number} dx - X offset
   * @param {number} dy - Y offset
   */
  move(dx, dy) {
    this.x += dx;
    this.y += dy;
  }
  
  /**
   * Set velocity
   * @param {number} vx - X velocity
   * @param {number} vy - Y velocity
   */
  setVelocity(vx, vy) {
    this.velocityX = vx;
    this.velocityY = vy;
    this.velocity = vy; // Legacy support
  }
  
  // ==========================================
  // COLLISION
  // ==========================================
  
  /**
   * Get hitbox (can be smaller than visual bounds)
   * @param {number} [shrink=0] - Pixels to shrink hitbox
   * @returns {{x: number, y: number, width: number, height: number}}
   */
  getHitbox(shrink = 0) {
    return {
      x: this.x + shrink,
      y: this.y + shrink,
      width: this.width - shrink * 2,
      height: this.height - shrink * 2
    };
  }
  
  /**
   * Check if collides with another entity
   * @param {Object} other - Other entity with bounds
   * @returns {boolean}
   */
  collidesWith(other) {
    if (!other) return false;
    
    return (
      this.x < other.x + other.width &&
      this.x + this.width > other.x &&
      this.y < other.y + other.height &&
      this.y + this.height > other.y
    );
  }
  
  // ==========================================
  // ANIMATION
  // ==========================================
  
  /**
   * Calculate rotation based on velocity (for flying characters)
   * @param {number} [maxRotation=45] - Maximum rotation in degrees
   * @returns {number} Rotation in radians
   */
  calculateVelocityRotation(maxRotation = 45) {
    const velocity = this.velocityY || this.velocity;
    const degrees = Math.min(Math.max(velocity * 3, -30), maxRotation);
    return degrees * Math.PI / 180;
  }
}

export default CharacterBase;
