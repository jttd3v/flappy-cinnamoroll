/**
 * PhysicsSystem Unit Tests
 * 
 * Tests for physics calculations and collision detection.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { 
  PhysicsSystem, 
  createPhysicsSystem,
  type PhysicsBody,
  type Rectangle,
  type Circle,
} from '../../src/core/physics/PhysicsSystem';

describe('PhysicsSystem', () => {
  let physics: PhysicsSystem;

  beforeEach(() => {
    physics = createPhysicsSystem({
      gravity: 0.5,
      maxVelocityY: 10,
    });
  });

  describe('gravity', () => {
    it('should apply gravity to velocity', () => {
      const body: PhysicsBody = {
        x: 100,
        y: 100,
        width: 40,
        height: 40,
        velocityX: 0,
        velocityY: 0,
      };

      // Apply gravity for one frame at 60fps (16.67ms)
      physics.applyGravity(body, 16.67);

      expect(body.velocityY).toBeCloseTo(0.5);
    });

    it('should scale gravity with delta time', () => {
      const body1: PhysicsBody = {
        x: 100, y: 100, width: 40, height: 40,
        velocityX: 0, velocityY: 0,
      };
      
      const body2: PhysicsBody = {
        x: 100, y: 100, width: 40, height: 40,
        velocityX: 0, velocityY: 0,
      };

      // Apply for different delta times
      physics.applyGravity(body1, 16.67); // 60fps
      physics.applyGravity(body2, 33.34); // 30fps (2x time)

      // Body2 should have roughly twice the velocity
      expect(body2.velocityY).toBeCloseTo(body1.velocityY * 2);
    });

    it('should not apply gravity to static bodies', () => {
      const body: PhysicsBody = {
        x: 100,
        y: 100,
        width: 40,
        height: 40,
        velocityX: 0,
        velocityY: 0,
        isStatic: true,
      };

      physics.applyGravity(body, 16.67);

      expect(body.velocityY).toBe(0);
    });
  });

  describe('velocity', () => {
    it('should apply velocity to position', () => {
      const body: PhysicsBody = {
        x: 100,
        y: 100,
        width: 40,
        height: 40,
        velocityX: 5,
        velocityY: 3,
      };

      physics.applyVelocity(body, 16.67);

      expect(body.x).toBeCloseTo(105);
      expect(body.y).toBeCloseTo(103);
    });

    it('should clamp velocity to maximum', () => {
      const body: PhysicsBody = {
        x: 100,
        y: 100,
        width: 40,
        height: 40,
        velocityX: 0,
        velocityY: 20, // Exceeds max of 10
      };

      physics.clampVelocity(body);

      expect(body.velocityY).toBe(10);
    });

    it('should apply impulse correctly', () => {
      const body: PhysicsBody = {
        x: 100,
        y: 100,
        width: 40,
        height: 40,
        velocityX: 0,
        velocityY: 0,
      };

      physics.applyImpulse(body, 3, -8);

      expect(body.velocityX).toBe(3);
      expect(body.velocityY).toBe(-8);
    });
  });

  describe('collision detection', () => {
    describe('AABB collision', () => {
      it('should detect overlapping rectangles', () => {
        const a: Rectangle = { x: 0, y: 0, width: 50, height: 50 };
        const b: Rectangle = { x: 25, y: 25, width: 50, height: 50 };

        expect(PhysicsSystem.checkAABB(a, b)).toBe(true);
      });

      it('should not detect non-overlapping rectangles', () => {
        const a: Rectangle = { x: 0, y: 0, width: 50, height: 50 };
        const b: Rectangle = { x: 100, y: 100, width: 50, height: 50 };

        expect(PhysicsSystem.checkAABB(a, b)).toBe(false);
      });

      it('should detect edge-touching rectangles', () => {
        const a: Rectangle = { x: 0, y: 0, width: 50, height: 50 };
        const b: Rectangle = { x: 49, y: 0, width: 50, height: 50 };

        expect(PhysicsSystem.checkAABB(a, b)).toBe(true);
      });
    });

    describe('circle collision', () => {
      it('should detect overlapping circles', () => {
        const a: Circle = { x: 0, y: 0, radius: 25 };
        const b: Circle = { x: 30, y: 0, radius: 25 };

        expect(PhysicsSystem.checkCircleCollision(a, b)).toBe(true);
      });

      it('should not detect non-overlapping circles', () => {
        const a: Circle = { x: 0, y: 0, radius: 25 };
        const b: Circle = { x: 100, y: 0, radius: 25 };

        expect(PhysicsSystem.checkCircleCollision(a, b)).toBe(false);
      });
    });

    describe('circle-rectangle collision', () => {
      it('should detect circle inside rectangle', () => {
        const circle: Circle = { x: 25, y: 25, radius: 10 };
        const rect: Rectangle = { x: 0, y: 0, width: 50, height: 50 };

        expect(PhysicsSystem.checkCircleRectCollision(circle, rect)).toBe(true);
      });

      it('should detect circle overlapping rectangle edge', () => {
        const circle: Circle = { x: 55, y: 25, radius: 10 };
        const rect: Rectangle = { x: 0, y: 0, width: 50, height: 50 };

        expect(PhysicsSystem.checkCircleRectCollision(circle, rect)).toBe(true);
      });

      it('should not detect non-overlapping circle and rectangle', () => {
        const circle: Circle = { x: 100, y: 100, radius: 10 };
        const rect: Rectangle = { x: 0, y: 0, width: 50, height: 50 };

        expect(PhysicsSystem.checkCircleRectCollision(circle, rect)).toBe(false);
      });

      it('should detect circle at rectangle corner', () => {
        const circle: Circle = { x: 55, y: 55, radius: 10 };
        const rect: Rectangle = { x: 0, y: 0, width: 50, height: 50 };

        expect(PhysicsSystem.checkCircleRectCollision(circle, rect)).toBe(true);
      });
    });

    describe('player-obstacle collision with forgiveness', () => {
      it('should use smaller hitbox with forgiveness', () => {
        const player: PhysicsBody = {
          x: 40,
          y: 0,
          width: 40,
          height: 40,
          velocityX: 0,
          velocityY: 0,
          collisionRadius: 20,
        };

        const obstacle: Rectangle = { x: 0, y: 0, width: 30, height: 100 };

        // With 70% forgiveness (radius 14), should NOT collide
        const noCollision = PhysicsSystem.checkPlayerObstacleCollision(player, obstacle, 0.7);
        
        // With 100% forgiveness (radius 20), SHOULD collide
        const collision = PhysicsSystem.checkPlayerObstacleCollision(player, obstacle, 1.0);

        expect(noCollision).toBe(false);
        expect(collision).toBe(true);
      });
    });

    describe('cloud gap collision', () => {
      it('should detect collision with top cloud', () => {
        const player: PhysicsBody = {
          x: 100,
          y: 50, // In the top cloud area
          width: 40,
          height: 40,
          velocityX: 0,
          velocityY: 0,
          collisionRadius: 20,
        };

        const collision = PhysicsSystem.checkCloudGapCollision(
          player,
          80, // cloudX
          60, // cloudWidth
          200, // gapY
          150, // gapHeight
          600, // canvasHeight
          0.7
        );

        expect(collision).toBe(true);
      });

      it('should detect collision with bottom cloud', () => {
        const player: PhysicsBody = {
          x: 100,
          y: 400, // In the bottom cloud area
          width: 40,
          height: 40,
          velocityX: 0,
          velocityY: 0,
          collisionRadius: 20,
        };

        const collision = PhysicsSystem.checkCloudGapCollision(
          player,
          80,
          60,
          200, // gapY
          150, // gapHeight (gap ends at 350)
          600,
          0.7
        );

        expect(collision).toBe(true);
      });

      it('should not detect collision when in gap', () => {
        const player: PhysicsBody = {
          x: 100,
          y: 260, // In the middle of the gap
          width: 40,
          height: 40,
          velocityX: 0,
          velocityY: 0,
          collisionRadius: 20,
        };

        const collision = PhysicsSystem.checkCloudGapCollision(
          player,
          80,
          60,
          200, // gapY
          150, // gapHeight
          600,
          0.7
        );

        expect(collision).toBe(false);
      });
    });
  });

  describe('bounds checking', () => {
    it('should detect out of bounds', () => {
      const body: PhysicsBody = {
        x: 100,
        y: -10, // Above top bound
        width: 40,
        height: 40,
        velocityX: 0,
        velocityY: 0,
      };

      const result = PhysicsSystem.isOutOfBounds(body, { minY: 0, maxY: 600 });

      expect(result.top).toBe(true);
      expect(result.bottom).toBe(false);
    });

    it('should clamp body to bounds', () => {
      const body: PhysicsBody = {
        x: 100,
        y: 700, // Below bottom bound
        width: 40,
        height: 40,
        velocityX: 0,
        velocityY: 10,
      };

      const result = PhysicsSystem.clampToBounds(body, { minY: 0, maxY: 600 });

      expect(result.hitBottom).toBe(true);
      expect(body.y).toBe(560); // 600 - 40
      expect(body.velocityY).toBe(0);
    });
  });

  describe('utility methods', () => {
    it('should calculate distance correctly', () => {
      const a = { x: 0, y: 0 };
      const b = { x: 3, y: 4 };

      expect(PhysicsSystem.distance(a, b)).toBe(5);
    });

    it('should lerp correctly', () => {
      expect(PhysicsSystem.lerp(0, 100, 0.5)).toBe(50);
      expect(PhysicsSystem.lerp(0, 100, 0)).toBe(0);
      expect(PhysicsSystem.lerp(0, 100, 1)).toBe(100);
    });

    it('should get center of body', () => {
      const body: PhysicsBody = {
        x: 100,
        y: 200,
        width: 40,
        height: 60,
        velocityX: 0,
        velocityY: 0,
      };

      const center = PhysicsSystem.getCenter(body);

      expect(center.x).toBe(120);
      expect(center.y).toBe(230);
    });
  });
});
