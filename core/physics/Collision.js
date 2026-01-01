/**
 * Collision.js - Collision Detection System
 * 
 * Provides various collision detection methods:
 * - AABB (Axis-Aligned Bounding Box)
 * - Circle collision
 * - Point-in-rect
 * - Bounds checking
 * 
 * @module core/physics/Collision
 * @version 1.0.0
 */

/**
 * Rectangle bounds
 * @typedef {Object} Rect
 * @property {number} x - X position
 * @property {number} y - Y position  
 * @property {number} width - Width
 * @property {number} height - Height
 */

/**
 * Circle bounds
 * @typedef {Object} Circle
 * @property {number} x - Center X
 * @property {number} y - Center Y
 * @property {number} radius - Radius
 */

/**
 * Point
 * @typedef {Object} Point
 * @property {number} x - X coordinate
 * @property {number} y - Y coordinate
 */

/**
 * Collision detection system
 */
export class Collision {
  
  // ==========================================
  // AABB (Rectangle) Collision
  // ==========================================
  
  /**
   * Check AABB collision between two rectangles
   * @param {Rect} a - First rectangle
   * @param {Rect} b - Second rectangle
   * @returns {boolean} True if colliding
   */
  static checkAABB(a, b) {
    // Guard clause for null/undefined
    if (!a || !b) return false;
    
    return (
      a.x < b.x + b.width &&
      a.x + a.width > b.x &&
      a.y < b.y + b.height &&
      a.y + a.height > b.y
    );
  }
  
  /**
   * Check AABB collision with custom hitbox sizes
   * @param {Rect} a - First entity
   * @param {Rect} b - Second entity
   * @param {number} [shrinkA=0] - Pixels to shrink A's hitbox
   * @param {number} [shrinkB=0] - Pixels to shrink B's hitbox
   * @returns {boolean}
   */
  static checkAABBWithMargin(a, b, shrinkA = 0, shrinkB = 0) {
    if (!a || !b) return false;
    
    const rectA = {
      x: a.x + shrinkA,
      y: a.y + shrinkA,
      width: a.width - shrinkA * 2,
      height: a.height - shrinkA * 2
    };
    
    const rectB = {
      x: b.x + shrinkB,
      y: b.y + shrinkB,
      width: b.width - shrinkB * 2,
      height: b.height - shrinkB * 2
    };
    
    return this.checkAABB(rectA, rectB);
  }
  
  // ==========================================
  // CIRCLE Collision
  // ==========================================
  
  /**
   * Check collision between two circles
   * @param {Circle} a - First circle
   * @param {Circle} b - Second circle
   * @returns {boolean}
   */
  static checkCircle(a, b) {
    if (!a || !b) return false;
    
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    return distance < a.radius + b.radius;
  }
  
  /**
   * Check collision between circle and rectangle
   * @param {Circle} circle - Circle
   * @param {Rect} rect - Rectangle
   * @returns {boolean}
   */
  static checkCircleRect(circle, rect) {
    if (!circle || !rect) return false;
    
    // Find closest point on rectangle to circle center
    const closestX = Math.max(rect.x, Math.min(circle.x, rect.x + rect.width));
    const closestY = Math.max(rect.y, Math.min(circle.y, rect.y + rect.height));
    
    // Calculate distance from closest point to circle center
    const dx = circle.x - closestX;
    const dy = circle.y - closestY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    return distance < circle.radius;
  }
  
  // ==========================================
  // POINT Collision
  // ==========================================
  
  /**
   * Check if point is inside rectangle
   * @param {Point} point - Point to check
   * @param {Rect} rect - Rectangle bounds
   * @returns {boolean}
   */
  static checkPointInRect(point, rect) {
    if (!point || !rect) return false;
    
    return (
      point.x >= rect.x &&
      point.x <= rect.x + rect.width &&
      point.y >= rect.y &&
      point.y <= rect.y + rect.height
    );
  }
  
  /**
   * Check if point is inside circle
   * @param {Point} point - Point to check
   * @param {Circle} circle - Circle bounds
   * @returns {boolean}
   */
  static checkPointInCircle(point, circle) {
    if (!point || !circle) return false;
    
    const dx = point.x - circle.x;
    const dy = point.y - circle.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    return distance <= circle.radius;
  }
  
  // ==========================================
  // BOUNDS Checking
  // ==========================================
  
  /**
   * Check if entity is within bounds
   * @param {Rect} entity - Entity with position and size
   * @param {Rect} bounds - Boundary rectangle
   * @returns {{top: boolean, bottom: boolean, left: boolean, right: boolean, inside: boolean}}
   */
  static checkBounds(entity, bounds) {
    if (!entity || !bounds) {
      return { top: false, bottom: false, left: false, right: false, inside: false };
    }
    
    const result = {
      top: entity.y < bounds.y,
      bottom: entity.y + entity.height > bounds.y + bounds.height,
      left: entity.x < bounds.x,
      right: entity.x + entity.width > bounds.x + bounds.width,
      inside: false
    };
    
    result.inside = !result.top && !result.bottom && !result.left && !result.right;
    
    return result;
  }
  
  /**
   * Check if entity is completely outside bounds
   * @param {Rect} entity - Entity
   * @param {Rect} bounds - Bounds
   * @returns {boolean}
   */
  static isOutsideBounds(entity, bounds) {
    if (!entity || !bounds) return true;
    
    return (
      entity.x + entity.width < bounds.x ||
      entity.x > bounds.x + bounds.width ||
      entity.y + entity.height < bounds.y ||
      entity.y > bounds.y + bounds.height
    );
  }
  
  /**
   * Clamp entity to stay within bounds
   * @param {Rect} entity - Entity to clamp
   * @param {Rect} bounds - Bounds to stay within
   * @returns {{clamped: boolean, hitEdge: string|null}}
   */
  static clampToBounds(entity, bounds) {
    if (!entity || !bounds) return { clamped: false, hitEdge: null };
    
    let clamped = false;
    let hitEdge = null;
    
    // Clamp left
    if (entity.x < bounds.x) {
      entity.x = bounds.x;
      clamped = true;
      hitEdge = 'left';
    }
    
    // Clamp right
    if (entity.x + entity.width > bounds.x + bounds.width) {
      entity.x = bounds.x + bounds.width - entity.width;
      clamped = true;
      hitEdge = 'right';
    }
    
    // Clamp top
    if (entity.y < bounds.y) {
      entity.y = bounds.y;
      clamped = true;
      hitEdge = 'top';
    }
    
    // Clamp bottom
    if (entity.y + entity.height > bounds.y + bounds.height) {
      entity.y = bounds.y + bounds.height - entity.height;
      clamped = true;
      hitEdge = 'bottom';
    }
    
    return { clamped, hitEdge };
  }
  
  // ==========================================
  // SPECIALIZED COLLISIONS
  // ==========================================
  
  /**
   * Check collision with gap obstacles (like Flappy Bird pipes)
   * @param {Rect} entity - Player entity
   * @param {Object} obstacle - Obstacle with gapY and gapHeight
   * @param {number} obstacle.x - Obstacle X position
   * @param {number} obstacle.width - Obstacle width
   * @param {number} obstacle.gapY - Gap start Y position
   * @param {number} obstacle.gapHeight - Height of the gap
   * @param {number} screenHeight - Total screen height
   * @returns {boolean}
   */
  static checkGapObstacle(entity, obstacle, screenHeight) {
    if (!entity || !obstacle) return false;
    
    const entityRight = entity.x + entity.width;
    const entityBottom = entity.y + entity.height;
    const obstacleRight = obstacle.x + obstacle.width;
    
    // Check if horizontally aligned with obstacle
    if (entityRight > obstacle.x && entity.x < obstacleRight) {
      // Check if hitting top section (above gap)
      if (entity.y < obstacle.gapY) {
        return true;
      }
      // Check if hitting bottom section (below gap)
      if (entityBottom > obstacle.gapY + obstacle.gapHeight) {
        return true;
      }
    }
    
    return false;
  }
  
  /**
   * Get collision overlap amount
   * @param {Rect} a - First rectangle
   * @param {Rect} b - Second rectangle
   * @returns {{x: number, y: number}} Overlap in each axis
   */
  static getOverlap(a, b) {
    if (!this.checkAABB(a, b)) {
      return { x: 0, y: 0 };
    }
    
    const overlapX = Math.min(a.x + a.width, b.x + b.width) - Math.max(a.x, b.x);
    const overlapY = Math.min(a.y + a.height, b.y + b.height) - Math.max(a.y, b.y);
    
    return { x: overlapX, y: overlapY };
  }
  
  /**
   * Get collision response (push direction)
   * @param {Rect} moving - Moving entity
   * @param {Rect} static_ - Static entity
   * @returns {{x: number, y: number}} Push vector
   */
  static getCollisionResponse(moving, static_) {
    const overlap = this.getOverlap(moving, static_);
    
    if (overlap.x === 0 && overlap.y === 0) {
      return { x: 0, y: 0 };
    }
    
    // Push along axis with smallest overlap
    if (overlap.x < overlap.y) {
      // Push horizontally
      const pushX = (moving.x < static_.x) ? -overlap.x : overlap.x;
      return { x: pushX, y: 0 };
    } else {
      // Push vertically
      const pushY = (moving.y < static_.y) ? -overlap.y : overlap.y;
      return { x: 0, y: pushY };
    }
  }
}

export default Collision;
