/**
 * Bounds.js - Screen and Entity Bounds Management
 * 
 * Manages screen boundaries, entity clamping, and wrap-around behavior.
 * Essential for keeping game entities within playable area.
 * 
 * @module core/physics/Bounds
 * @version 1.0.0
 */

/**
 * Bounds configuration
 * @typedef {Object} BoundsConfig
 * @property {number} x - Left boundary
 * @property {number} y - Top boundary
 * @property {number} width - Bounds width
 * @property {number} height - Bounds height
 * @property {number} [padding=0] - Internal padding
 */

/**
 * Bounds management system
 */
export class Bounds {
  /**
   * Create bounds instance
   * @param {BoundsConfig} config
   */
  constructor(config) {
    this.x = config.x ?? 0;
    this.y = config.y ?? 0;
    this.width = config.width ?? 400;
    this.height = config.height ?? 600;
    this.padding = config.padding ?? 0;
  }
  
  // ==========================================
  // GETTERS
  // ==========================================
  
  /** @returns {number} Right boundary */
  get right() {
    return this.x + this.width;
  }
  
  /** @returns {number} Bottom boundary */
  get bottom() {
    return this.y + this.height;
  }
  
  /** @returns {number} Center X */
  get centerX() {
    return this.x + this.width / 2;
  }
  
  /** @returns {number} Center Y */
  get centerY() {
    return this.y + this.height / 2;
  }
  
  /** @returns {number} Playable left (with padding) */
  get innerLeft() {
    return this.x + this.padding;
  }
  
  /** @returns {number} Playable right (with padding) */
  get innerRight() {
    return this.right - this.padding;
  }
  
  /** @returns {number} Playable top (with padding) */
  get innerTop() {
    return this.y + this.padding;
  }
  
  /** @returns {number} Playable bottom (with padding) */
  get innerBottom() {
    return this.bottom - this.padding;
  }
  
  // ==========================================
  // CONTAINMENT CHECKS
  // ==========================================
  
  /**
   * Check if entity is within bounds
   * @param {Object} entity - Entity with x, y, width, height
   * @returns {boolean}
   */
  contains(entity) {
    return (
      entity.x >= this.x &&
      entity.y >= this.y &&
      entity.x + entity.width <= this.right &&
      entity.y + entity.height <= this.bottom
    );
  }
  
  /**
   * Check if entity is partially within bounds
   * @param {Object} entity - Entity with x, y, width, height
   * @returns {boolean}
   */
  intersects(entity) {
    return !(
      entity.x + entity.width < this.x ||
      entity.x > this.right ||
      entity.y + entity.height < this.y ||
      entity.y > this.bottom
    );
  }
  
  /**
   * Check if entity is completely outside bounds
   * @param {Object} entity - Entity with x, y, width, height
   * @returns {boolean}
   */
  isOutside(entity) {
    return !this.intersects(entity);
  }
  
  /**
   * Get which edges entity is touching/crossing
   * @param {Object} entity - Entity with x, y, width, height
   * @returns {{top: boolean, bottom: boolean, left: boolean, right: boolean}}
   */
  getEdgeCollisions(entity) {
    return {
      top: entity.y <= this.y,
      bottom: entity.y + entity.height >= this.bottom,
      left: entity.x <= this.x,
      right: entity.x + entity.width >= this.right
    };
  }
  
  // ==========================================
  // CLAMPING
  // ==========================================
  
  /**
   * Clamp entity position to stay within bounds
   * @param {Object} entity - Entity to clamp (modified in place)
   * @param {Object} [options] - Clamping options
   * @param {boolean} [options.stopVelocity=true] - Zero velocity on collision
   * @param {boolean} [options.usePadding=false] - Use inner bounds
   * @returns {{hit: boolean, edges: string[]}} Collision info
   */
  clamp(entity, options = {}) {
    const stopVelocity = options.stopVelocity ?? true;
    const usePadding = options.usePadding ?? false;
    
    const left = usePadding ? this.innerLeft : this.x;
    const right = usePadding ? this.innerRight : this.right;
    const top = usePadding ? this.innerTop : this.y;
    const bottom = usePadding ? this.innerBottom : this.bottom;
    
    const edges = [];
    let hit = false;
    
    // Clamp left
    if (entity.x < left) {
      entity.x = left;
      if (stopVelocity && entity.velocityX !== undefined) {
        entity.velocityX = 0;
      }
      edges.push('left');
      hit = true;
    }
    
    // Clamp right
    if (entity.x + entity.width > right) {
      entity.x = right - entity.width;
      if (stopVelocity && entity.velocityX !== undefined) {
        entity.velocityX = 0;
      }
      edges.push('right');
      hit = true;
    }
    
    // Clamp top
    if (entity.y < top) {
      entity.y = top;
      if (stopVelocity) {
        if (entity.velocityY !== undefined) entity.velocityY = 0;
        if (entity.velocity !== undefined) entity.velocity = 0;
      }
      edges.push('top');
      hit = true;
    }
    
    // Clamp bottom
    if (entity.y + entity.height > bottom) {
      entity.y = bottom - entity.height;
      if (stopVelocity) {
        if (entity.velocityY !== undefined) entity.velocityY = 0;
        if (entity.velocity !== undefined) entity.velocity = 0;
      }
      edges.push('bottom');
      hit = true;
    }
    
    return { hit, edges };
  }
  
  /**
   * Clamp only vertical position (for games like Flappy Bird)
   * @param {Object} entity - Entity to clamp
   * @returns {{hitTop: boolean, hitBottom: boolean}}
   */
  clampVertical(entity) {
    let hitTop = false;
    let hitBottom = false;
    
    if (entity.y < this.y) {
      entity.y = this.y;
      if (entity.velocityY !== undefined) entity.velocityY = 0;
      if (entity.velocity !== undefined) entity.velocity = 0;
      hitTop = true;
    }
    
    if (entity.y + entity.height > this.bottom) {
      entity.y = this.bottom - entity.height;
      hitBottom = true;
    }
    
    return { hitTop, hitBottom };
  }
  
  /**
   * Clamp only horizontal position
   * @param {Object} entity - Entity to clamp
   * @returns {{hitLeft: boolean, hitRight: boolean}}
   */
  clampHorizontal(entity) {
    let hitLeft = false;
    let hitRight = false;
    
    if (entity.x < this.x) {
      entity.x = this.x;
      if (entity.velocityX !== undefined) entity.velocityX = 0;
      hitLeft = true;
    }
    
    if (entity.x + entity.width > this.right) {
      entity.x = this.right - entity.width;
      if (entity.velocityX !== undefined) entity.velocityX = 0;
      hitRight = true;
    }
    
    return { hitLeft, hitRight };
  }
  
  // ==========================================
  // WRAPPING
  // ==========================================
  
  /**
   * Wrap entity position (teleport to opposite side)
   * @param {Object} entity - Entity to wrap
   * @param {Object} [options] - Wrapping options
   * @param {boolean} [options.horizontal=true] - Wrap horizontally
   * @param {boolean} [options.vertical=false] - Wrap vertically
   */
  wrap(entity, options = {}) {
    const horizontal = options.horizontal ?? true;
    const vertical = options.vertical ?? false;
    
    if (horizontal) {
      if (entity.x + entity.width < this.x) {
        entity.x = this.right;
      } else if (entity.x > this.right) {
        entity.x = this.x - entity.width;
      }
    }
    
    if (vertical) {
      if (entity.y + entity.height < this.y) {
        entity.y = this.bottom;
      } else if (entity.y > this.bottom) {
        entity.y = this.y - entity.height;
      }
    }
  }
  
  // ==========================================
  // SPAWNING
  // ==========================================
  
  /**
   * Get random position within bounds
   * @param {number} [entityWidth=0] - Entity width to account for
   * @param {number} [entityHeight=0] - Entity height to account for
   * @returns {{x: number, y: number}}
   */
  getRandomPosition(entityWidth = 0, entityHeight = 0) {
    const maxX = this.width - entityWidth;
    const maxY = this.height - entityHeight;
    
    return {
      x: this.x + Math.random() * maxX,
      y: this.y + Math.random() * maxY
    };
  }
  
  /**
   * Get spawn position at edge
   * @param {'left'|'right'|'top'|'bottom'} edge - Which edge to spawn at
   * @param {number} [entityWidth=0] - Entity width
   * @param {number} [entityHeight=0] - Entity height
   * @returns {{x: number, y: number}}
   */
  getEdgeSpawnPosition(edge, entityWidth = 0, entityHeight = 0) {
    switch (edge) {
      case 'left':
        return {
          x: this.x - entityWidth,
          y: this.y + Math.random() * (this.height - entityHeight)
        };
      case 'right':
        return {
          x: this.right,
          y: this.y + Math.random() * (this.height - entityHeight)
        };
      case 'top':
        return {
          x: this.x + Math.random() * (this.width - entityWidth),
          y: this.y - entityHeight
        };
      case 'bottom':
        return {
          x: this.x + Math.random() * (this.width - entityWidth),
          y: this.bottom
        };
      default:
        return { x: this.centerX, y: this.centerY };
    }
  }
  
  // ==========================================
  // FACTORY
  // ==========================================
  
  /**
   * Create bounds from canvas element
   * @param {HTMLCanvasElement} canvas - Canvas element
   * @param {number} [padding=0] - Optional padding
   * @returns {Bounds}
   */
  static fromCanvas(canvas, padding = 0) {
    return new Bounds({
      x: 0,
      y: 0,
      width: canvas.width,
      height: canvas.height,
      padding
    });
  }
  
  /**
   * Create bounds from config object
   * @param {Object} config - Config with CANVAS_WIDTH and CANVAS_HEIGHT
   * @returns {Bounds}
   */
  static fromConfig(config) {
    return new Bounds({
      x: 0,
      y: 0,
      width: config.CANVAS_WIDTH || 400,
      height: config.CANVAS_HEIGHT || 600
    });
  }
}

export default Bounds;
