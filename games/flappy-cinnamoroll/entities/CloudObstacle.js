/**
 * Cloud Obstacle Entity
 * 
 * Renders a cloud obstacle with a gap for the player to pass through.
 * Used in Flappy Cinnamoroll for the main obstacles.
 * 
 * @module games/flappy-cinnamoroll/entities/CloudObstacle
 * @version 1.0.0
 */

import { CharacterBase } from '../../../characters/shared/CharacterBase.js';

/**
 * Cloud obstacle with top and bottom sections and a gap
 */
export class CloudObstacle extends CharacterBase {
  /**
   * Create a cloud obstacle
   * @param {Object} options - Configuration
   * @param {number} options.x - X position (right edge of screen)
   * @param {number} options.gapY - Y position of gap center
   * @param {number} options.gapHeight - Height of the gap
   * @param {number} options.width - Cloud width
   * @param {number} options.speed - Movement speed
   * @param {number} options.canvasHeight - Canvas height for rendering
   */
  constructor(options = {}) {
    super({
      x: options.x || 0,
      y: options.gapY || 200,
      width: options.width || 60,
      height: options.gapHeight || 150
    });
    
    this.gapY = options.gapY || 200;
    this.gapHeight = options.gapHeight || 150;
    this.speed = options.speed || 3;
    this.canvasHeight = options.canvasHeight || 600;
    
    /** @type {boolean} Has this obstacle been scored */
    this.scored = false;
    
    /** @type {boolean} Is obstacle active */
    this.active = true;
    
    // Animation properties
    this.floatOffset = Math.random() * Math.PI * 2;
    this.floatSpeed = 0.05;
    this.floatAmount = 2;
    
    // Visual properties
    this.cloudColor = '#FFFFFF';
    this.shadowColor = 'rgba(0, 0, 0, 0.1)';
  }
  
  /**
   * Update obstacle position
   * @param {number} deltaTime - Time delta
   * @param {number} speedMultiplier - Speed multiplier for difficulty
   */
  update(deltaTime = 1, speedMultiplier = 1) {
    if (!this.active) return;
    
    // Move left
    this.x -= this.speed * speedMultiplier;
    
    // Floating animation
    this.floatOffset += this.floatSpeed;
    
    // Deactivate if off screen
    if (this.x + this.width < -50) {
      this.active = false;
    }
  }
  
  /**
   * Render the cloud obstacle
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   */
  render(ctx) {
    if (!this.active) return;
    
    const floatY = Math.sin(this.floatOffset) * this.floatAmount;
    
    // Draw top cloud (from top of screen to gap)
    this.drawCloud(ctx, this.x, 0, this.width, this.gapY - this.gapHeight / 2 + floatY, 'top');
    
    // Draw bottom cloud (from gap to bottom of screen)
    const bottomY = this.gapY + this.gapHeight / 2 + floatY;
    this.drawCloud(ctx, this.x, bottomY, this.width, this.canvasHeight - bottomY, 'bottom');
  }
  
  /**
   * Draw a single cloud section
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   * @param {number} x - X position
   * @param {number} y - Y position
   * @param {number} width - Width
   * @param {number} height - Height
   * @param {string} position - 'top' or 'bottom'
   */
  drawCloud(ctx, x, y, width, height, position) {
    if (height <= 0) return;
    
    ctx.save();
    
    // Shadow
    ctx.shadowColor = this.shadowColor;
    ctx.shadowBlur = 10;
    ctx.shadowOffsetX = 3;
    ctx.shadowOffsetY = 3;
    
    ctx.fillStyle = this.cloudColor;
    ctx.beginPath();
    
    const radius = width / 2;
    
    if (position === 'top') {
      // Cloud at bottom of top section (gap edge)
      const cloudY = y + height;
      
      // Main rectangle body
      ctx.moveTo(x, y);
      ctx.lineTo(x + width, y);
      ctx.lineTo(x + width, cloudY - radius / 2);
      
      // Fluffy bottom edge
      this.drawFluffyEdge(ctx, x + width, cloudY, x, cloudY, radius, 'bottom');
      
      ctx.lineTo(x, y);
    } else {
      // Cloud at top of bottom section (gap edge)
      const cloudY = y;
      
      // Fluffy top edge
      ctx.moveTo(x, cloudY + radius / 2);
      this.drawFluffyEdge(ctx, x, cloudY, x + width, cloudY, radius, 'top');
      
      // Main rectangle body
      ctx.lineTo(x + width, y + height);
      ctx.lineTo(x, y + height);
      ctx.lineTo(x, cloudY + radius / 2);
    }
    
    ctx.closePath();
    ctx.fill();
    
    // Add fluffy cloud decorations
    this.drawCloudPuffs(ctx, x, y, width, height, position);
    
    ctx.restore();
  }
  
  /**
   * Draw fluffy cloud edge
   * @param {CanvasRenderingContext2D} ctx
   * @param {number} startX
   * @param {number} startY
   * @param {number} endX
   * @param {number} endY
   * @param {number} radius
   * @param {string} side - 'top' or 'bottom'
   */
  drawFluffyEdge(ctx, startX, startY, endX, endY, radius, side) {
    const bumps = 3;
    const width = Math.abs(endX - startX);
    const bumpWidth = width / bumps;
    const direction = startX > endX ? -1 : 1;
    
    for (let i = 0; i < bumps; i++) {
      const cx = startX + (i + 0.5) * bumpWidth * direction;
      const cy = startY;
      const r = bumpWidth / 2;
      
      if (side === 'bottom') {
        ctx.arc(cx, cy, r, 0, Math.PI, false);
      } else {
        ctx.arc(cx, cy, r, Math.PI, 0, false);
      }
    }
  }
  
  /**
   * Draw decorative cloud puffs
   * @param {CanvasRenderingContext2D} ctx
   * @param {number} x
   * @param {number} y
   * @param {number} width
   * @param {number} height
   * @param {string} position
   */
  drawCloudPuffs(ctx, x, y, width, height, position) {
    ctx.shadowColor = 'transparent';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    
    const puffSize = width / 4;
    
    if (position === 'top' && height > puffSize * 2) {
      // Puffs at bottom edge
      const edgeY = y + height - puffSize;
      ctx.beginPath();
      ctx.arc(x + width * 0.25, edgeY, puffSize * 0.6, 0, Math.PI * 2);
      ctx.arc(x + width * 0.75, edgeY, puffSize * 0.5, 0, Math.PI * 2);
      ctx.fill();
    } else if (position === 'bottom' && height > puffSize * 2) {
      // Puffs at top edge
      const edgeY = y + puffSize;
      ctx.beginPath();
      ctx.arc(x + width * 0.25, edgeY, puffSize * 0.6, 0, Math.PI * 2);
      ctx.arc(x + width * 0.75, edgeY, puffSize * 0.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  
  /**
   * Get hitbox for top cloud section
   * @returns {Object} Hitbox {x, y, width, height}
   */
  getTopHitbox() {
    return {
      x: this.x,
      y: 0,
      width: this.width,
      height: this.gapY - this.gapHeight / 2
    };
  }
  
  /**
   * Get hitbox for bottom cloud section
   * @returns {Object} Hitbox {x, y, width, height}
   */
  getBottomHitbox() {
    const topOfBottom = this.gapY + this.gapHeight / 2;
    return {
      x: this.x,
      y: topOfBottom,
      width: this.width,
      height: this.canvasHeight - topOfBottom
    };
  }
  
  /**
   * Check if player passes through gap
   * @param {Object} player - Player entity with x position
   * @returns {boolean} True if player passed through
   */
  checkScoring(player) {
    if (this.scored) return false;
    
    // Player has passed the obstacle
    if (player.x > this.x + this.width) {
      this.scored = true;
      return true;
    }
    return false;
  }
  
  /**
   * Check collision with player
   * @param {Object} player - Player with getHitbox()
   * @param {number} margin - Collision margin (makes it forgiving)
   * @returns {boolean} True if collision
   */
  checkCollision(player, margin = 5) {
    const playerBox = player.getHitbox ? player.getHitbox() : player;
    
    // Shrink hitbox slightly for more forgiving collision
    const shrunkPlayer = {
      x: playerBox.x + margin,
      y: playerBox.y + margin,
      width: playerBox.width - margin * 2,
      height: playerBox.height - margin * 2
    };
    
    // Check collision with top cloud
    const topHit = this.checkAABB(shrunkPlayer, this.getTopHitbox());
    
    // Check collision with bottom cloud
    const bottomHit = this.checkAABB(shrunkPlayer, this.getBottomHitbox());
    
    return topHit || bottomHit;
  }
  
  /**
   * Simple AABB collision check
   * @param {Object} a - First rectangle
   * @param {Object} b - Second rectangle
   * @returns {boolean} True if overlapping
   */
  checkAABB(a, b) {
    return a.x < b.x + b.width &&
           a.x + a.width > b.x &&
           a.y < b.y + b.height &&
           a.y + a.height > b.y;
  }
  
  /**
   * Reset obstacle for reuse (object pooling)
   * @param {Object} options - New configuration
   */
  reset(options = {}) {
    this.x = options.x || this.x;
    this.gapY = options.gapY || this.gapY;
    this.gapHeight = options.gapHeight || this.gapHeight;
    this.speed = options.speed || this.speed;
    this.scored = false;
    this.active = true;
    this.floatOffset = Math.random() * Math.PI * 2;
  }
  
  /**
   * Create a cloud obstacle at right edge of screen
   * @param {Object} config - Game config
   * @param {number} canvasWidth - Canvas width
   * @param {number} canvasHeight - Canvas height
   * @returns {CloudObstacle}
   */
  static spawn(config, canvasWidth, canvasHeight) {
    const minGapY = config.MIN_GAP_Y || 80;
    const maxGapY = canvasHeight - (config.MAX_GAP_Y_OFFSET || 180);
    
    const gapY = minGapY + Math.random() * (maxGapY - minGapY);
    
    return new CloudObstacle({
      x: canvasWidth,
      gapY: gapY,
      gapHeight: config.CLOUD_GAP || 150,
      width: config.CLOUD_WIDTH || 60,
      speed: config.BASE_CLOUD_SPEED || 3,
      canvasHeight: canvasHeight
    });
  }
}

export default CloudObstacle;
