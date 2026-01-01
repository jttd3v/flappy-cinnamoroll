/**
 * CanvasRenderer.js - Canvas 2D Rendering Utilities
 * 
 * Helper functions for common canvas drawing operations.
 * 
 * @module core/rendering/CanvasRenderer
 * @version 1.0.0
 */

/**
 * Canvas rendering utilities
 */
export class CanvasRenderer {
  /**
   * Create renderer for a canvas
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   */
  constructor(ctx) {
    /** @type {CanvasRenderingContext2D} */
    this.ctx = ctx;
    
    /** @type {HTMLCanvasElement} */
    this.canvas = ctx.canvas;
  }
  
  // ==========================================
  // CANVAS OPERATIONS
  // ==========================================
  
  /**
   * Clear the entire canvas
   * @param {string} [fillColor] - Optional fill color
   */
  clear(fillColor) {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    if (fillColor) {
      this.ctx.fillStyle = fillColor;
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
  }
  
  /**
   * Draw a gradient background
   * @param {string} topColor - Top color
   * @param {string} bottomColor - Bottom color
   */
  drawGradientBackground(topColor, bottomColor) {
    const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
    gradient.addColorStop(0, topColor);
    gradient.addColorStop(1, bottomColor);
    
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }
  
  // ==========================================
  // SHAPES
  // ==========================================
  
  /**
   * Draw a rectangle
   * @param {number} x - X position
   * @param {number} y - Y position
   * @param {number} width - Width
   * @param {number} height - Height
   * @param {Object} options - Drawing options
   */
  rect(x, y, width, height, options = {}) {
    this.ctx.beginPath();
    this.ctx.rect(x, y, width, height);
    
    if (options.fill) {
      this.ctx.fillStyle = options.fill;
      this.ctx.fill();
    }
    
    if (options.stroke) {
      this.ctx.strokeStyle = options.stroke;
      this.ctx.lineWidth = options.lineWidth || 1;
      this.ctx.stroke();
    }
  }
  
  /**
   * Draw a rounded rectangle
   * @param {number} x - X position
   * @param {number} y - Y position
   * @param {number} width - Width
   * @param {number} height - Height
   * @param {number|number[]} radius - Corner radius
   * @param {Object} options - Drawing options
   */
  roundRect(x, y, width, height, radius, options = {}) {
    this.ctx.beginPath();
    this.ctx.roundRect(x, y, width, height, radius);
    
    if (options.fill) {
      this.ctx.fillStyle = options.fill;
      this.ctx.fill();
    }
    
    if (options.stroke) {
      this.ctx.strokeStyle = options.stroke;
      this.ctx.lineWidth = options.lineWidth || 1;
      this.ctx.stroke();
    }
  }
  
  /**
   * Draw a circle
   * @param {number} x - Center X
   * @param {number} y - Center Y
   * @param {number} radius - Radius
   * @param {Object} options - Drawing options
   */
  circle(x, y, radius, options = {}) {
    this.ctx.beginPath();
    this.ctx.arc(x, y, radius, 0, Math.PI * 2);
    
    if (options.fill) {
      this.ctx.fillStyle = options.fill;
      this.ctx.fill();
    }
    
    if (options.stroke) {
      this.ctx.strokeStyle = options.stroke;
      this.ctx.lineWidth = options.lineWidth || 1;
      this.ctx.stroke();
    }
  }
  
  /**
   * Draw an ellipse
   * @param {number} x - Center X
   * @param {number} y - Center Y
   * @param {number} radiusX - Horizontal radius
   * @param {number} radiusY - Vertical radius
   * @param {number} [rotation=0] - Rotation in radians
   * @param {Object} options - Drawing options
   */
  ellipse(x, y, radiusX, radiusY, rotation = 0, options = {}) {
    this.ctx.beginPath();
    this.ctx.ellipse(x, y, radiusX, radiusY, rotation, 0, Math.PI * 2);
    
    if (options.fill) {
      this.ctx.fillStyle = options.fill;
      this.ctx.fill();
    }
    
    if (options.stroke) {
      this.ctx.strokeStyle = options.stroke;
      this.ctx.lineWidth = options.lineWidth || 1;
      this.ctx.stroke();
    }
  }
  
  /**
   * Draw a line
   * @param {number} x1 - Start X
   * @param {number} y1 - Start Y
   * @param {number} x2 - End X
   * @param {number} y2 - End Y
   * @param {Object} options - Drawing options
   */
  line(x1, y1, x2, y2, options = {}) {
    this.ctx.beginPath();
    this.ctx.moveTo(x1, y1);
    this.ctx.lineTo(x2, y2);
    
    this.ctx.strokeStyle = options.stroke || '#000000';
    this.ctx.lineWidth = options.lineWidth || 1;
    this.ctx.lineCap = options.lineCap || 'round';
    this.ctx.stroke();
  }
  
  // ==========================================
  // CLOUD SHAPES (Cinnamoroll themed)
  // ==========================================
  
  /**
   * Draw a fluffy cloud shape
   * @param {number} x - Center X
   * @param {number} y - Center Y
   * @param {number} size - Cloud size
   * @param {Object} options - Drawing options
   */
  cloud(x, y, size, options = {}) {
    this.ctx.fillStyle = options.fill || '#FFFFFF';
    
    if (options.shadow) {
      this.ctx.shadowColor = options.shadowColor || 'rgba(0,0,0,0.1)';
      this.ctx.shadowBlur = options.shadowBlur || 10;
      this.ctx.shadowOffsetY = options.shadowOffsetY || 5;
    }
    
    this.ctx.beginPath();
    // Main cloud body with multiple overlapping circles
    this.ctx.arc(x, y, size * 0.5, 0, Math.PI * 2);
    this.ctx.arc(x + size * 0.4, y - size * 0.1, size * 0.4, 0, Math.PI * 2);
    this.ctx.arc(x + size * 0.8, y, size * 0.45, 0, Math.PI * 2);
    this.ctx.fill();
    
    // Reset shadow
    if (options.shadow) {
      this.ctx.shadowColor = 'transparent';
      this.ctx.shadowBlur = 0;
      this.ctx.shadowOffsetY = 0;
    }
  }
  
  /**
   * Draw cloud obstacle (top and bottom pair with gap)
   * @param {Object} cloud - Cloud obstacle data
   * @param {number} cloud.x - X position
   * @param {number} cloud.gapY - Y position where gap starts
   * @param {number} cloud.width - Cloud width
   * @param {number} gapHeight - Height of gap
   * @param {number} canvasHeight - Canvas height
   * @param {Object} options - Drawing options
   */
  cloudObstacle(cloud, gapHeight, canvasHeight, options = {}) {
    this.ctx.fillStyle = options.fill || '#FFFFFF';
    
    if (options.shadow) {
      this.ctx.shadowColor = 'rgba(0, 0, 0, 0.1)';
      this.ctx.shadowBlur = 10;
      this.ctx.shadowOffsetY = 5;
    }
    
    // Top cloud
    const topHeight = cloud.gapY;
    this.ctx.beginPath();
    this.ctx.roundRect(cloud.x, 0, cloud.width, topHeight, [0, 0, 20, 20]);
    this.ctx.fill();
    
    // Fluffy bumps on top cloud bottom
    this.ctx.beginPath();
    this.ctx.arc(cloud.x + 15, topHeight - 5, 15, 0, Math.PI * 2);
    this.ctx.arc(cloud.x + cloud.width / 2, topHeight - 8, 18, 0, Math.PI * 2);
    this.ctx.arc(cloud.x + cloud.width - 15, topHeight - 5, 15, 0, Math.PI * 2);
    this.ctx.fill();
    
    // Bottom cloud
    const bottomY = cloud.gapY + gapHeight;
    const bottomHeight = canvasHeight - bottomY;
    
    this.ctx.beginPath();
    this.ctx.roundRect(cloud.x, bottomY, cloud.width, bottomHeight, [20, 20, 0, 0]);
    this.ctx.fill();
    
    // Fluffy bumps on bottom cloud top
    this.ctx.beginPath();
    this.ctx.arc(cloud.x + 15, bottomY + 5, 15, 0, Math.PI * 2);
    this.ctx.arc(cloud.x + cloud.width / 2, bottomY + 8, 18, 0, Math.PI * 2);
    this.ctx.arc(cloud.x + cloud.width - 15, bottomY + 5, 15, 0, Math.PI * 2);
    this.ctx.fill();
    
    // Reset shadow
    if (options.shadow) {
      this.ctx.shadowColor = 'transparent';
      this.ctx.shadowBlur = 0;
      this.ctx.shadowOffsetY = 0;
    }
  }
  
  // ==========================================
  // TEXT
  // ==========================================
  
  /**
   * Draw text
   * @param {string} text - Text to draw
   * @param {number} x - X position
   * @param {number} y - Y position
   * @param {Object} options - Drawing options
   */
  text(text, x, y, options = {}) {
    this.ctx.font = options.font || '16px Arial';
    this.ctx.textAlign = options.align || 'left';
    this.ctx.textBaseline = options.baseline || 'top';
    
    // Draw stroke first (outline)
    if (options.stroke) {
      this.ctx.strokeStyle = options.stroke;
      this.ctx.lineWidth = options.lineWidth || 2;
      this.ctx.strokeText(text, x, y);
    }
    
    // Then fill
    this.ctx.fillStyle = options.fill || '#000000';
    this.ctx.fillText(text, x, y);
  }
  
  /**
   * Draw centered text
   * @param {string} text - Text to draw
   * @param {number} y - Y position
   * @param {Object} options - Drawing options
   */
  centeredText(text, y, options = {}) {
    this.text(text, this.canvas.width / 2, y, {
      ...options,
      align: 'center'
    });
  }
  
  // ==========================================
  // TRANSFORMS
  // ==========================================
  
  /**
   * Save current context state
   */
  save() {
    this.ctx.save();
  }
  
  /**
   * Restore previous context state
   */
  restore() {
    this.ctx.restore();
  }
  
  /**
   * Translate the canvas
   * @param {number} x - X translation
   * @param {number} y - Y translation
   */
  translate(x, y) {
    this.ctx.translate(x, y);
  }
  
  /**
   * Rotate the canvas
   * @param {number} angle - Angle in radians
   */
  rotate(angle) {
    this.ctx.rotate(angle);
  }
  
  /**
   * Scale the canvas
   * @param {number} x - X scale
   * @param {number} y - Y scale
   */
  scale(x, y) {
    this.ctx.scale(x, y);
  }
  
  // ==========================================
  // EFFECTS
  // ==========================================
  
  /**
   * Draw with shadow
   * @param {Function} drawFn - Drawing function to execute
   * @param {Object} shadowOptions - Shadow options
   */
  withShadow(drawFn, shadowOptions = {}) {
    this.ctx.shadowColor = shadowOptions.color || 'rgba(0,0,0,0.3)';
    this.ctx.shadowBlur = shadowOptions.blur || 10;
    this.ctx.shadowOffsetX = shadowOptions.offsetX || 0;
    this.ctx.shadowOffsetY = shadowOptions.offsetY || 5;
    
    drawFn();
    
    this.ctx.shadowColor = 'transparent';
    this.ctx.shadowBlur = 0;
    this.ctx.shadowOffsetX = 0;
    this.ctx.shadowOffsetY = 0;
  }
  
  /**
   * Draw with alpha/opacity
   * @param {Function} drawFn - Drawing function to execute
   * @param {number} alpha - Alpha value (0-1)
   */
  withAlpha(drawFn, alpha) {
    const prevAlpha = this.ctx.globalAlpha;
    this.ctx.globalAlpha = alpha;
    drawFn();
    this.ctx.globalAlpha = prevAlpha;
  }
  
  /**
   * Set global alpha
   * @param {number} alpha - Alpha value (0-1)
   */
  setAlpha(alpha) {
    this.ctx.globalAlpha = alpha;
  }
}

export default CanvasRenderer;
