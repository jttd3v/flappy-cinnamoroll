/**
 * Ghost.js - Ghost Enemy Character
 * 
 * Chasing ghost enemy that appears after certain score.
 * Can be reused in multiple Cinnamoroll games.
 * 
 * @module characters/enemies/Ghost
 * @version 1.0.0
 */

import { CharacterBase } from '../shared/CharacterBase.js';

/**
 * Ghost enemy character
 */
export class Ghost extends CharacterBase {
  /**
   * Create ghost enemy
   * @param {Object} config - Ghost configuration
   */
  constructor(config = {}) {
    super({
      ...config,
      type: 'enemy',
      name: 'Ghost',
      width: config.width || 50,
      height: config.height || 50
    });
    
    // Ghost-specific properties
    this.active = false;
    this.eyeGlow = 0;
    this.floatOffset = 0;
    this.wavePhase = 0;
    
    // Movement
    this.baseSpeed = config.baseSpeed || 1.5;
    this.chaseSpeed = this.baseSpeed;
    
    // Target (player to chase)
    this.target = null;
    
    // Colors
    this.colors = {
      body: 'rgba(20, 20, 30, 0.85)',
      eyes: '#FF0000',
      eyeGlow: 'rgba(255, 0, 0, 0.5)',
      pupil: '#000000'
    };
  }
  
  /**
   * Activate the ghost
   * @param {number} startX - Starting X position
   * @param {number} startY - Starting Y position
   */
  spawn(startX, startY) {
    this.x = startX;
    this.y = startY;
    this.active = true;
    this.isActive = true;
    this.isAlive = true;
  }
  
  /**
   * Deactivate the ghost
   */
  despawn() {
    this.active = false;
    this.isActive = false;
  }
  
  /**
   * Set the target to chase
   * @param {Object} target - Target with x, y properties
   */
  setTarget(target) {
    this.target = target;
  }
  
  /**
   * Update ghost movement and animation
   * @param {number} deltaTime
   * @param {number} [speedMultiplier=1] - Speed multiplier from game difficulty
   */
  update(deltaTime, speedMultiplier = 1) {
    if (!this.active || !this.target) return;
    
    const time = Date.now();
    
    // Calculate chase speed
    this.chaseSpeed = this.baseSpeed * speedMultiplier;
    
    // Chase target Y position
    const targetY = this.target.y || this.target.centerY;
    if (this.y < targetY) {
      this.y += this.chaseSpeed * 0.8;
    } else if (this.y > targetY) {
      this.y -= this.chaseSpeed * 0.8;
    }
    
    // Slowly move forward
    const targetX = (this.target.x || 0) - 80;
    if (this.x < targetX) {
      this.x += this.chaseSpeed * 0.5;
    }
    
    // Animations
    this.floatOffset = Math.sin(time / 200) * 3;
    this.eyeGlow = (Math.sin(time / 100) + 1) / 2;
    this.wavePhase = time / 150;
  }
  
  /**
   * Render the ghost
   * @param {CanvasRenderingContext2D} ctx
   */
  render(ctx) {
    if (!this.active) return;
    
    const x = this.centerX;
    const y = this.centerY + this.floatOffset;
    const size = this.width / 2;
    
    ctx.save();
    ctx.translate(x, y);
    
    // Shadow/glow effect
    ctx.shadowColor = 'rgba(139, 0, 0, 0.5)';
    ctx.shadowBlur = 20;
    
    // Ghost body
    ctx.fillStyle = this.colors.body;
    ctx.beginPath();
    ctx.ellipse(0, 0, size, size * 0.9, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Wavy bottom
    this._drawWavyBottom(ctx, size);
    
    // Eyes
    this._drawEyes(ctx, size);
    
    ctx.restore();
  }
  
  /**
   * Draw wavy ghost bottom
   * @private
   */
  _drawWavyBottom(ctx, size) {
    ctx.fillStyle = this.colors.body;
    ctx.beginPath();
    ctx.moveTo(-size, size * 0.3);
    
    for (let i = 0; i <= 6; i++) {
      const wx = -size + (i * size * 2 / 6);
      const wy = size * 0.3 + Math.sin(this.wavePhase + i) * 8 + (i % 2 === 0 ? 15 : 5);
      ctx.lineTo(wx, wy);
    }
    
    ctx.lineTo(size, size * 0.3);
    ctx.closePath();
    ctx.fill();
  }
  
  /**
   * Draw glowing red eyes
   * @private
   */
  _drawEyes(ctx, size) {
    const glowIntensity = 0.5 + this.eyeGlow * 0.5;
    
    ctx.shadowColor = `rgba(255, 0, 0, ${glowIntensity})`;
    ctx.shadowBlur = 15;
    ctx.fillStyle = `rgba(255, ${50 * (1 - this.eyeGlow)}, ${50 * (1 - this.eyeGlow)}, 1)`;
    
    // Left eye
    ctx.beginPath();
    ctx.ellipse(-size * 0.35, -size * 0.1, size * 0.18, size * 0.25, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Right eye
    ctx.beginPath();
    ctx.ellipse(size * 0.35, -size * 0.1, size * 0.18, size * 0.25, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Pupils
    ctx.shadowBlur = 0;
    ctx.fillStyle = this.colors.pupil;
    ctx.beginPath();
    ctx.arc(-size * 0.35, -size * 0.05, size * 0.08, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(size * 0.35, -size * 0.05, size * 0.08, 0, Math.PI * 2);
    ctx.fill();
  }
  
  /**
   * Get collision hitbox (slightly smaller than visual)
   * @returns {{x: number, y: number, width: number, height: number}}
   */
  getHitbox() {
    const shrink = this.width * 0.15;
    return {
      x: this.x + shrink,
      y: this.y + shrink,
      width: this.width - shrink * 2,
      height: this.height - shrink * 2
    };
  }
  
  /**
   * Reset ghost to initial state
   */
  reset() {
    super.reset();
    this.active = false;
    this.x = -this.width;
    this.eyeGlow = 0;
    this.floatOffset = 0;
  }
}

export default Ghost;
