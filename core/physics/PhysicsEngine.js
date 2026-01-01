/**
 * PhysicsEngine.js - Core Physics System
 * 
 * Configurable physics engine for gravity, velocity, and movement.
 * Used by all games that need physics-based gameplay.
 * 
 * @module core/physics/PhysicsEngine
 * @version 1.0.0
 */

/**
 * Physics configuration
 * @typedef {Object} PhysicsConfig
 * @property {number} [gravity=0.4] - Gravity force (positive = down)
 * @property {number} [friction=1] - Friction multiplier (1 = no friction)
 * @property {Object} [maxVelocity] - Maximum velocity limits
 * @property {number} [maxVelocity.x=10] - Max horizontal velocity
 * @property {number} [maxVelocity.y=10] - Max vertical velocity
 * @property {boolean} [enableGravity=true] - Whether gravity is active
 */

/**
 * Entity with physics properties
 * @typedef {Object} PhysicsEntity
 * @property {number} x - X position
 * @property {number} y - Y position
 * @property {number} [velocityX=0] - Horizontal velocity
 * @property {number} [velocityY=0] - Vertical velocity (or 'velocity' for legacy)
 * @property {number} [accelerationX=0] - Horizontal acceleration
 * @property {number} [accelerationY=0] - Vertical acceleration
 * @property {number} [mass=1] - Entity mass
 * @property {boolean} [isStatic=false] - If true, not affected by physics
 */

/**
 * Core physics engine
 */
export class PhysicsEngine {
  /**
   * Create a physics engine instance
   * @param {PhysicsConfig} [config={}]
   */
  constructor(config = {}) {
    /** @type {number} Gravity force */
    this.gravity = config.gravity ?? 0.4;
    
    /** @type {number} Friction multiplier */
    this.friction = config.friction ?? 1;
    
    /** @type {{x: number, y: number}} Maximum velocity */
    this.maxVelocity = {
      x: config.maxVelocity?.x ?? 10,
      y: config.maxVelocity?.y ?? 10
    };
    
    /** @type {boolean} Is gravity enabled */
    this.enableGravity = config.enableGravity ?? true;
    
    /** @type {number} Time scale for physics (1 = normal) */
    this.timeScale = 1;
  }
  
  // ==========================================
  // GRAVITY
  // ==========================================
  
  /**
   * Apply gravity to an entity
   * @param {PhysicsEntity} entity - Entity to apply gravity to
   * @param {number} [deltaTime=1] - Time factor (for frame-independent physics)
   */
  applyGravity(entity, deltaTime = 1) {
    if (!this.enableGravity || entity.isStatic) return;
    
    const timeFactor = (deltaTime / 16.67) * this.timeScale; // Normalize to 60fps
    
    // Support both velocityY and velocity (legacy)
    if (typeof entity.velocityY === 'number') {
      entity.velocityY += this.gravity * timeFactor;
    } else if (typeof entity.velocity === 'number') {
      entity.velocity += this.gravity * timeFactor;
    }
  }
  
  /**
   * Set gravity strength
   * @param {number} value - New gravity value
   */
  setGravity(value) {
    this.gravity = value;
  }
  
  // ==========================================
  // VELOCITY
  // ==========================================
  
  /**
   * Apply velocity to update entity position
   * @param {PhysicsEntity} entity - Entity to move
   * @param {number} [deltaTime=1] - Time factor
   */
  applyVelocity(entity, deltaTime = 1) {
    if (entity.isStatic) return;
    
    const timeFactor = (deltaTime / 16.67) * this.timeScale;
    
    // Horizontal velocity
    if (typeof entity.velocityX === 'number') {
      entity.x += entity.velocityX * timeFactor;
    }
    
    // Vertical velocity (support both naming conventions)
    if (typeof entity.velocityY === 'number') {
      entity.y += entity.velocityY * timeFactor;
    } else if (typeof entity.velocity === 'number') {
      entity.y += entity.velocity * timeFactor;
    }
  }
  
  /**
   * Apply an impulse (instant velocity change)
   * @param {PhysicsEntity} entity - Target entity
   * @param {number} forceX - Horizontal force
   * @param {number} forceY - Vertical force
   */
  applyImpulse(entity, forceX, forceY) {
    if (entity.isStatic) return;
    
    if (forceX !== 0) {
      entity.velocityX = (entity.velocityX || 0) + forceX;
    }
    
    if (forceY !== 0) {
      if (typeof entity.velocityY === 'number') {
        entity.velocityY += forceY;
      } else {
        entity.velocity = (entity.velocity || 0) + forceY;
      }
    }
  }
  
  /**
   * Set entity velocity directly
   * @param {PhysicsEntity} entity - Target entity
   * @param {number} [vx] - New X velocity
   * @param {number} [vy] - New Y velocity
   */
  setVelocity(entity, vx, vy) {
    if (typeof vx === 'number') {
      entity.velocityX = vx;
    }
    if (typeof vy === 'number') {
      if (typeof entity.velocityY === 'number') {
        entity.velocityY = vy;
      } else {
        entity.velocity = vy;
      }
    }
  }
  
  // ==========================================
  // FRICTION & DAMPENING
  // ==========================================
  
  /**
   * Apply friction to slow down entity
   * @param {PhysicsEntity} entity - Entity to apply friction to
   * @param {number} [customFriction] - Override default friction
   */
  applyFriction(entity, customFriction) {
    if (entity.isStatic) return;
    
    const f = customFriction ?? this.friction;
    
    if (typeof entity.velocityX === 'number') {
      entity.velocityX *= f;
      
      // Stop micro-movements
      if (Math.abs(entity.velocityX) < 0.01) {
        entity.velocityX = 0;
      }
    }
  }
  
  /**
   * Apply air resistance (vertical dampening)
   * @param {PhysicsEntity} entity - Entity
   * @param {number} [resistance=0.99] - Resistance factor
   */
  applyAirResistance(entity, resistance = 0.99) {
    if (entity.isStatic) return;
    
    if (typeof entity.velocityY === 'number') {
      entity.velocityY *= resistance;
    } else if (typeof entity.velocity === 'number') {
      entity.velocity *= resistance;
    }
  }
  
  // ==========================================
  // CLAMPING & BOUNDS
  // ==========================================
  
  /**
   * Clamp entity velocity to max limits
   * @param {PhysicsEntity} entity - Entity to clamp
   */
  clampVelocity(entity) {
    // Clamp horizontal
    if (typeof entity.velocityX === 'number') {
      entity.velocityX = Math.max(-this.maxVelocity.x, 
                          Math.min(this.maxVelocity.x, entity.velocityX));
    }
    
    // Clamp vertical
    if (typeof entity.velocityY === 'number') {
      entity.velocityY = Math.max(-this.maxVelocity.y, 
                          Math.min(this.maxVelocity.y, entity.velocityY));
    } else if (typeof entity.velocity === 'number') {
      entity.velocity = Math.max(-this.maxVelocity.y, 
                         Math.min(this.maxVelocity.y, entity.velocity));
    }
  }
  
  /**
   * Set maximum velocity
   * @param {number} maxX - Max horizontal speed
   * @param {number} maxY - Max vertical speed
   */
  setMaxVelocity(maxX, maxY) {
    this.maxVelocity.x = maxX;
    this.maxVelocity.y = maxY;
  }
  
  // ==========================================
  // FULL UPDATE
  // ==========================================
  
  /**
   * Run full physics update on entity
   * Applies gravity, velocity, friction, and clamping
   * @param {PhysicsEntity} entity - Entity to update
   * @param {number} [deltaTime=1] - Time factor
   */
  update(entity, deltaTime = 1) {
    if (entity.isStatic) return;
    
    // Apply forces
    this.applyGravity(entity, deltaTime);
    
    // Clamp velocity
    this.clampVelocity(entity);
    
    // Update position
    this.applyVelocity(entity, deltaTime);
    
    // Apply friction (horizontal only)
    this.applyFriction(entity);
  }
  
  /**
   * Update multiple entities
   * @param {PhysicsEntity[]} entities - Array of entities
   * @param {number} [deltaTime=1] - Time factor
   */
  updateAll(entities, deltaTime = 1) {
    entities.forEach(entity => this.update(entity, deltaTime));
  }
  
  // ==========================================
  // UTILITY
  // ==========================================
  
  /**
   * Calculate distance between two entities
   * @param {PhysicsEntity} a - First entity
   * @param {PhysicsEntity} b - Second entity
   * @returns {number} Distance
   */
  static distance(a, b) {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    return Math.sqrt(dx * dx + dy * dy);
  }
  
  /**
   * Calculate angle between two entities
   * @param {PhysicsEntity} from - Source entity
   * @param {PhysicsEntity} to - Target entity
   * @returns {number} Angle in radians
   */
  static angleBetween(from, to) {
    return Math.atan2(to.y - from.y, to.x - from.x);
  }
  
  /**
   * Move entity towards target
   * @param {PhysicsEntity} entity - Entity to move
   * @param {number} targetX - Target X
   * @param {number} targetY - Target Y
   * @param {number} speed - Movement speed
   */
  static moveTowards(entity, targetX, targetY, speed) {
    const dx = targetX - entity.x;
    const dy = targetY - entity.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    
    if (dist > 0) {
      entity.x += (dx / dist) * speed;
      entity.y += (dy / dist) * speed;
    }
  }
  
  /**
   * Check if entity is moving
   * @param {PhysicsEntity} entity - Entity to check
   * @param {number} [threshold=0.1] - Velocity threshold
   * @returns {boolean}
   */
  static isMoving(entity, threshold = 0.1) {
    const vx = entity.velocityX || 0;
    const vy = entity.velocityY ?? entity.velocity ?? 0;
    return Math.abs(vx) > threshold || Math.abs(vy) > threshold;
  }
}

export default PhysicsEngine;
