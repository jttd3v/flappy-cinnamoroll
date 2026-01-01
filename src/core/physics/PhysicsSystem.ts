/**
 * PhysicsSystem - Frame-rate Independent Physics
 * 
 * Provides physics calculations with proper delta time support:
 * - Gravity and velocity
 * - Collision detection (AABB, Circle, Circle-Rect)
 * - Bounds clamping
 * 
 * @module core/physics/PhysicsSystem
 * @version 2.0.0
 */

export interface Vector2 {
  x: number;
  y: number;
}

export interface Rectangle {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Circle {
  x: number;
  y: number;
  radius: number;
}

export interface PhysicsBody {
  x: number;
  y: number;
  width: number;
  height: number;
  velocityX: number;
  velocityY: number;
  accelerationX?: number;
  accelerationY?: number;
  isStatic?: boolean;
  collisionRadius?: number; // For circular collision
}

export interface PhysicsConfig {
  gravity: number;
  maxVelocityY: number;
  maxVelocityX?: number;
  friction?: number;
  airResistance?: number;
}

/**
 * Default physics configuration
 */
export const DEFAULT_PHYSICS_CONFIG: PhysicsConfig = {
  gravity: 0.4,
  maxVelocityY: 10,
  maxVelocityX: 10,
  friction: 0.98,
  airResistance: 0.99,
};

/**
 * Base time step for physics (60 FPS)
 */
const BASE_TIMESTEP = 16.67;

/**
 * Physics System with delta time support
 */
export class PhysicsSystem {
  private config: Required<PhysicsConfig>;

  constructor(config: Partial<PhysicsConfig> = {}) {
    this.config = {
      gravity: config.gravity ?? DEFAULT_PHYSICS_CONFIG.gravity,
      maxVelocityY: config.maxVelocityY ?? DEFAULT_PHYSICS_CONFIG.maxVelocityY,
      maxVelocityX: config.maxVelocityX ?? DEFAULT_PHYSICS_CONFIG.maxVelocityX!,
      friction: config.friction ?? DEFAULT_PHYSICS_CONFIG.friction!,
      airResistance: config.airResistance ?? DEFAULT_PHYSICS_CONFIG.airResistance!,
    };
  }

  // ==========================================
  // GRAVITY & VELOCITY
  // ==========================================

  /**
   * Apply gravity to a physics body (frame-rate independent)
   */
  applyGravity(body: PhysicsBody, deltaTime: number): void {
    if (body.isStatic) return;

    const timeFactor = deltaTime / BASE_TIMESTEP;
    body.velocityY += this.config.gravity * timeFactor;
  }

  /**
   * Apply velocity to update position (frame-rate independent)
   */
  applyVelocity(body: PhysicsBody, deltaTime: number): void {
    if (body.isStatic) return;

    const timeFactor = deltaTime / BASE_TIMESTEP;

    body.x += body.velocityX * timeFactor;
    body.y += body.velocityY * timeFactor;
  }

  /**
   * Clamp velocity to maximum values
   */
  clampVelocity(body: PhysicsBody): void {
    body.velocityY = Math.max(
      -this.config.maxVelocityY,
      Math.min(this.config.maxVelocityY, body.velocityY)
    );

    body.velocityX = Math.max(
      -this.config.maxVelocityX,
      Math.min(this.config.maxVelocityX, body.velocityX)
    );
  }

  /**
   * Apply an impulse (instant velocity change)
   */
  applyImpulse(body: PhysicsBody, impulseX: number, impulseY: number): void {
    if (body.isStatic) return;

    body.velocityX += impulseX;
    body.velocityY += impulseY;

    this.clampVelocity(body);
  }

  /**
   * Set velocity directly
   */
  setVelocity(body: PhysicsBody, velocityX?: number, velocityY?: number): void {
    if (velocityX !== undefined) body.velocityX = velocityX;
    if (velocityY !== undefined) body.velocityY = velocityY;

    this.clampVelocity(body);
  }

  /**
   * Update physics for a body (gravity + velocity + clamp)
   */
  update(body: PhysicsBody, deltaTime: number): void {
    this.applyGravity(body, deltaTime);
    this.clampVelocity(body);
    this.applyVelocity(body, deltaTime);
  }

  // ==========================================
  // COLLISION DETECTION
  // ==========================================

  /**
   * AABB collision detection (Axis-Aligned Bounding Box)
   */
  static checkAABB(a: Rectangle, b: Rectangle): boolean {
    return (
      a.x < b.x + b.width &&
      a.x + a.width > b.x &&
      a.y < b.y + b.height &&
      a.y + a.height > b.y
    );
  }

  /**
   * Circle-to-circle collision detection
   */
  static checkCircleCollision(a: Circle, b: Circle): boolean {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < a.radius + b.radius;
  }

  /**
   * Circle-to-rectangle collision detection
   * Better for rounded characters vs rectangular obstacles
   */
  static checkCircleRectCollision(circle: Circle, rect: Rectangle): boolean {
    // Find the closest point on the rectangle to the circle center
    const closestX = Math.max(rect.x, Math.min(circle.x, rect.x + rect.width));
    const closestY = Math.max(rect.y, Math.min(circle.y, rect.y + rect.height));

    // Calculate the distance between the circle center and closest point
    const distanceX = circle.x - closestX;
    const distanceY = circle.y - closestY;
    const distanceSquared = distanceX * distanceX + distanceY * distanceY;

    return distanceSquared < circle.radius * circle.radius;
  }

  /**
   * Get circle bounds from physics body
   */
  static getCircleBounds(body: PhysicsBody): Circle {
    const radius = body.collisionRadius ?? Math.min(body.width, body.height) / 2;
    return {
      x: body.x + body.width / 2,
      y: body.y + body.height / 2,
      radius,
    };
  }

  /**
   * Get rectangle bounds from physics body
   */
  static getRectBounds(body: PhysicsBody): Rectangle {
    return {
      x: body.x,
      y: body.y,
      width: body.width,
      height: body.height,
    };
  }

  /**
   * Check collision between player (circle) and obstacle (rectangle)
   * More forgiving collision for rounded characters
   */
  static checkPlayerObstacleCollision(
    player: PhysicsBody,
    obstacle: Rectangle,
    forgivenessPercent: number = 0.7
  ): boolean {
    // Use a smaller hitbox for more forgiving gameplay
    const circle = this.getCircleBounds(player);
    circle.radius *= forgivenessPercent;

    return this.checkCircleRectCollision(circle, obstacle);
  }

  /**
   * Check collision with cloud gap obstacles (top and bottom)
   */
  static checkCloudGapCollision(
    player: PhysicsBody,
    cloudX: number,
    cloudWidth: number,
    gapY: number,
    gapHeight: number,
    canvasHeight: number,
    forgivenessPercent: number = 0.7
  ): boolean {
    const playerCircle = this.getCircleBounds(player);
    playerCircle.radius *= forgivenessPercent;

    // Top cloud rectangle
    const topCloud: Rectangle = {
      x: cloudX,
      y: 0,
      width: cloudWidth,
      height: gapY,
    };

    // Bottom cloud rectangle
    const bottomCloud: Rectangle = {
      x: cloudX,
      y: gapY + gapHeight,
      width: cloudWidth,
      height: canvasHeight - (gapY + gapHeight),
    };

    return (
      this.checkCircleRectCollision(playerCircle, topCloud) ||
      this.checkCircleRectCollision(playerCircle, bottomCloud)
    );
  }

  // ==========================================
  // BOUNDS CHECKING
  // ==========================================

  /**
   * Check if body is out of bounds
   */
  static isOutOfBounds(
    body: PhysicsBody,
    bounds: { minX?: number; maxX?: number; minY?: number; maxY?: number }
  ): { top: boolean; bottom: boolean; left: boolean; right: boolean } {
    return {
      top: bounds.minY !== undefined && body.y < bounds.minY,
      bottom: bounds.maxY !== undefined && body.y + body.height > bounds.maxY,
      left: bounds.minX !== undefined && body.x < bounds.minX,
      right: bounds.maxX !== undefined && body.x + body.width > bounds.maxX,
    };
  }

  /**
   * Clamp body position within bounds
   */
  static clampToBounds(
    body: PhysicsBody,
    bounds: { minX?: number; maxX?: number; minY?: number; maxY?: number }
  ): { hitTop: boolean; hitBottom: boolean; hitLeft: boolean; hitRight: boolean } {
    const result = { hitTop: false, hitBottom: false, hitLeft: false, hitRight: false };

    if (bounds.minY !== undefined && body.y < bounds.minY) {
      body.y = bounds.minY;
      body.velocityY = 0;
      result.hitTop = true;
    }

    if (bounds.maxY !== undefined && body.y + body.height > bounds.maxY) {
      body.y = bounds.maxY - body.height;
      body.velocityY = 0;
      result.hitBottom = true;
    }

    if (bounds.minX !== undefined && body.x < bounds.minX) {
      body.x = bounds.minX;
      body.velocityX = 0;
      result.hitLeft = true;
    }

    if (bounds.maxX !== undefined && body.x + body.width > bounds.maxX) {
      body.x = bounds.maxX - body.width;
      body.velocityX = 0;
      result.hitRight = true;
    }

    return result;
  }

  // ==========================================
  // UTILITY METHODS
  // ==========================================

  /**
   * Calculate distance between two points
   */
  static distance(a: Vector2, b: Vector2): number {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * Linear interpolation
   */
  static lerp(start: number, end: number, t: number): number {
    return start + (end - start) * t;
  }

  /**
   * Get center of a physics body
   */
  static getCenter(body: PhysicsBody): Vector2 {
    return {
      x: body.x + body.width / 2,
      y: body.y + body.height / 2,
    };
  }

  /**
   * Update configuration
   */
  setConfig(config: Partial<PhysicsConfig>): void {
    Object.assign(this.config, config);
  }

  /**
   * Get current configuration
   */
  getConfig(): PhysicsConfig {
    return { ...this.config };
  }
}

// Export factory function
export function createPhysicsSystem(config?: Partial<PhysicsConfig>): PhysicsSystem {
  return new PhysicsSystem(config);
}
