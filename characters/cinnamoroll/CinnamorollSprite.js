/**
 * CinnamorollSprite.js - Cinnamoroll Character Rendering
 * 
 * Handles drawing the cute Cinnamoroll character.
 * Can be used across all Cinnamoroll games.
 * 
 * @module characters/cinnamoroll/CinnamorollSprite
 * @version 1.0.0
 */

import { CharacterBase } from '../shared/CharacterBase.js';

/**
 * Cinnamoroll character class
 */
export class CinnamorollSprite extends CharacterBase {
  /**
   * Create Cinnamoroll character
   * @param {Object} config - Character config
   */
  constructor(config = {}) {
    super({
      ...config,
      type: 'player',
      name: 'Cinnamoroll'
    });
    
    // Cinnamoroll-specific properties
    this.earFlap = 0;           // Ear animation
    this.blinkTimer = 0;        // Blink animation
    this.isBlinking = false;
    
    // Colors
    this.colors = {
      body: '#FFFFFF',
      ears: '#FFFFFF',
      innerEar: '#FFB6C1',
      eyes: '#2C3E50',
      eyeShine: '#FFFFFF',
      blush: 'rgba(255, 182, 193, 0.6)',
      nose: '#FFB6C1'
    };
  }
  
  /**
   * Update character animation
   * @param {number} deltaTime
   */
  update(deltaTime) {
    // Ear flap animation when moving up
    if (this.velocity < 0 || this.velocityY < 0) {
      this.earFlap = Math.min(this.earFlap + 0.3, 1);
    } else {
      this.earFlap = Math.max(this.earFlap - 0.1, 0);
    }
    
    // Blink animation
    this.blinkTimer += deltaTime || 16;
    if (this.blinkTimer > 3000 && !this.isBlinking) {
      this.isBlinking = true;
      setTimeout(() => {
        this.isBlinking = false;
        this.blinkTimer = 0;
      }, 150);
    }
    
    // Calculate rotation based on velocity
    this.rotation = this.calculateVelocityRotation(45);
  }
  
  /**
   * Render Cinnamoroll
   * @param {CanvasRenderingContext2D} ctx
   */
  render(ctx) {
    const x = this.centerX;
    const y = this.centerY;
    const size = this.width / 2;
    
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(this.rotation);
    
    // Apply scale
    if (this.scale !== 1) {
      ctx.scale(this.scale, this.scale);
    }
    
    // Shadow
    ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
    ctx.shadowBlur = 8;
    
    // Body (white, fluffy)
    ctx.fillStyle = this.colors.body;
    ctx.beginPath();
    ctx.ellipse(0, 0, size, size * 0.85, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    
    // Ears (long, floppy like Cinnamoroll)
    this._drawEars(ctx, size);
    
    // Face
    this._drawFace(ctx, size);
    
    // Tail
    this._drawTail(ctx, size);
    
    ctx.restore();
  }
  
  /**
   * Draw ears
   * @private
   */
  _drawEars(ctx, size) {
    const flapOffset = this.earFlap * 0.2;
    
    ctx.fillStyle = this.colors.ears;
    
    // Left ear
    ctx.beginPath();
    ctx.ellipse(
      -size * 0.6, 
      -size * (0.8 + flapOffset), 
      size * 0.25, 
      size * 0.5, 
      -0.3 - flapOffset * 0.3, 
      0, 
      Math.PI * 2
    );
    ctx.fill();
    
    // Right ear
    ctx.beginPath();
    ctx.ellipse(
      size * 0.6, 
      -size * (0.8 + flapOffset), 
      size * 0.25, 
      size * 0.5, 
      0.3 + flapOffset * 0.3, 
      0, 
      Math.PI * 2
    );
    ctx.fill();
    
    // Inner ear (pink)
    ctx.fillStyle = this.colors.innerEar;
    
    ctx.beginPath();
    ctx.ellipse(
      -size * 0.6, 
      -size * (0.75 + flapOffset), 
      size * 0.12, 
      size * 0.3, 
      -0.3 - flapOffset * 0.3, 
      0, 
      Math.PI * 2
    );
    ctx.fill();
    
    ctx.beginPath();
    ctx.ellipse(
      size * 0.6, 
      -size * (0.75 + flapOffset), 
      size * 0.12, 
      size * 0.3, 
      0.3 + flapOffset * 0.3, 
      0, 
      Math.PI * 2
    );
    ctx.fill();
  }
  
  /**
   * Draw face (eyes, nose, mouth, blush)
   * @private
   */
  _drawFace(ctx, size) {
    // Eyes
    if (!this.isBlinking) {
      ctx.fillStyle = this.colors.eyes;
      ctx.beginPath();
      ctx.ellipse(-size * 0.3, -size * 0.1, size * 0.12, size * 0.15, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(size * 0.3, -size * 0.1, size * 0.12, size * 0.15, 0, 0, Math.PI * 2);
      ctx.fill();
      
      // Eye shine
      ctx.fillStyle = this.colors.eyeShine;
      ctx.beginPath();
      ctx.arc(-size * 0.33, -size * 0.15, size * 0.05, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(size * 0.27, -size * 0.15, size * 0.05, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Closed eyes (cute lines)
      ctx.strokeStyle = this.colors.eyes;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(-size * 0.3, -size * 0.1, size * 0.1, 0.1 * Math.PI, 0.9 * Math.PI);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(size * 0.3, -size * 0.1, size * 0.1, 0.1 * Math.PI, 0.9 * Math.PI);
      ctx.stroke();
    }
    
    // Blush
    ctx.fillStyle = this.colors.blush;
    ctx.beginPath();
    ctx.ellipse(-size * 0.5, size * 0.15, size * 0.15, size * 0.1, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(size * 0.5, size * 0.15, size * 0.15, size * 0.1, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Nose
    ctx.fillStyle = this.colors.nose;
    ctx.beginPath();
    ctx.arc(0, size * 0.1, size * 0.08, 0, Math.PI * 2);
    ctx.fill();
    
    // Mouth (cute smile)
    ctx.strokeStyle = this.colors.eyes;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(0, size * 0.2, size * 0.15, 0.1 * Math.PI, 0.9 * Math.PI);
    ctx.stroke();
  }
  
  /**
   * Draw tail
   * @private
   */
  _drawTail(ctx, size) {
    ctx.fillStyle = this.colors.body;
    ctx.beginPath();
    ctx.arc(size * 0.9, size * 0.1, size * 0.2, 0, Math.PI * 2);
    ctx.fill();
  }
  
  /**
   * Draw death/hurt animation
   * @param {CanvasRenderingContext2D} ctx
   */
  renderHurt(ctx) {
    // Save original colors
    const originalBody = this.colors.body;
    
    // Flash red
    this.colors.body = '#FFB6C1';
    this.render(ctx);
    
    // Restore
    this.colors.body = originalBody;
  }
  
  /**
   * Create a Cinnamoroll from config
   * @param {Object} config - Game config with PLAYER_SIZE, PLAYER_X_PERCENT, etc.
   * @param {number} canvasWidth - Canvas width
   * @param {number} canvasHeight - Canvas height
   * @returns {CinnamorollSprite}
   */
  static fromConfig(config, canvasWidth, canvasHeight) {
    const size = config.PLAYER_SIZE || 40;
    const xPercent = config.PLAYER_X_PERCENT || 0.15;
    
    return new CinnamorollSprite({
      x: canvasWidth * xPercent,
      y: canvasHeight / 2 - size / 2,
      width: size,
      height: size
    });
  }
}

export default CinnamorollSprite;
