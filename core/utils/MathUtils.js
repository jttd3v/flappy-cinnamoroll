/**
 * MathUtils.js - Mathematical Utility Functions
 * 
 * Common math operations for game development.
 * 
 * @module core/utils/MathUtils
 * @version 1.0.0
 */

export const MathUtils = {
  
  // ==========================================
  // CLAMPING & RANGE
  // ==========================================
  
  /**
   * Clamp a value between min and max
   * @param {number} value - Value to clamp
   * @param {number} min - Minimum value
   * @param {number} max - Maximum value
   * @returns {number}
   */
  clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  },
  
  /**
   * Check if value is within range (inclusive)
   * @param {number} value - Value to check
   * @param {number} min - Minimum
   * @param {number} max - Maximum
   * @returns {boolean}
   */
  inRange(value, min, max) {
    return value >= min && value <= max;
  },
  
  /**
   * Wrap value within range (for circular values)
   * @param {number} value - Value to wrap
   * @param {number} min - Minimum
   * @param {number} max - Maximum
   * @returns {number}
   */
  wrap(value, min, max) {
    const range = max - min;
    while (value < min) value += range;
    while (value >= max) value -= range;
    return value;
  },
  
  // ==========================================
  // INTERPOLATION
  // ==========================================
  
  /**
   * Linear interpolation between two values
   * @param {number} start - Start value
   * @param {number} end - End value
   * @param {number} t - Interpolation factor (0-1)
   * @returns {number}
   */
  lerp(start, end, t) {
    return start + (end - start) * t;
  },
  
  /**
   * Inverse lerp - find t for given value
   * @param {number} start - Start value
   * @param {number} end - End value
   * @param {number} value - Value to find t for
   * @returns {number}
   */
  inverseLerp(start, end, value) {
    if (start === end) return 0;
    return (value - start) / (end - start);
  },
  
  /**
   * Smooth step interpolation (ease in-out)
   * @param {number} t - Input (0-1)
   * @returns {number}
   */
  smoothStep(t) {
    t = this.clamp(t, 0, 1);
    return t * t * (3 - 2 * t);
  },
  
  /**
   * Smoother step interpolation
   * @param {number} t - Input (0-1)
   * @returns {number}
   */
  smootherStep(t) {
    t = this.clamp(t, 0, 1);
    return t * t * t * (t * (t * 6 - 15) + 10);
  },
  
  /**
   * Map value from one range to another
   * @param {number} value - Input value
   * @param {number} inMin - Input range min
   * @param {number} inMax - Input range max
   * @param {number} outMin - Output range min
   * @param {number} outMax - Output range max
   * @returns {number}
   */
  map(value, inMin, inMax, outMin, outMax) {
    const t = this.inverseLerp(inMin, inMax, value);
    return this.lerp(outMin, outMax, t);
  },
  
  // ==========================================
  // RANDOM
  // ==========================================
  
  /**
   * Random integer between min and max (inclusive)
   * @param {number} min - Minimum
   * @param {number} max - Maximum
   * @returns {number}
   */
  randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  },
  
  /**
   * Random float between min and max
   * @param {number} min - Minimum
   * @param {number} max - Maximum
   * @returns {number}
   */
  randomFloat(min, max) {
    return Math.random() * (max - min) + min;
  },
  
  /**
   * Random boolean with probability
   * @param {number} [probability=0.5] - Probability of true (0-1)
   * @returns {boolean}
   */
  randomBool(probability = 0.5) {
    return Math.random() < probability;
  },
  
  /**
   * Pick random element from array
   * @param {Array} array - Array to pick from
   * @returns {*}
   */
  randomPick(array) {
    if (!array || array.length === 0) return null;
    return array[Math.floor(Math.random() * array.length)];
  },
  
  /**
   * Shuffle array (Fisher-Yates)
   * @param {Array} array - Array to shuffle
   * @returns {Array} Shuffled array (mutates original)
   */
  shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  },
  
  /**
   * Random value with normal distribution (Box-Muller)
   * @param {number} [mean=0] - Mean
   * @param {number} [stdDev=1] - Standard deviation
   * @returns {number}
   */
  randomGaussian(mean = 0, stdDev = 1) {
    const u1 = Math.random();
    const u2 = Math.random();
    const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    return mean + z * stdDev;
  },
  
  // ==========================================
  // DISTANCE & ANGLES
  // ==========================================
  
  /**
   * Calculate distance between two points
   * @param {number} x1 - First point X
   * @param {number} y1 - First point Y
   * @param {number} x2 - Second point X
   * @param {number} y2 - Second point Y
   * @returns {number}
   */
  distance(x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    return Math.sqrt(dx * dx + dy * dy);
  },
  
  /**
   * Calculate squared distance (faster, no sqrt)
   * @param {number} x1 - First point X
   * @param {number} y1 - First point Y
   * @param {number} x2 - Second point X
   * @param {number} y2 - Second point Y
   * @returns {number}
   */
  distanceSquared(x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    return dx * dx + dy * dy;
  },
  
  /**
   * Calculate angle between two points
   * @param {number} x1 - First point X
   * @param {number} y1 - First point Y
   * @param {number} x2 - Second point X
   * @param {number} y2 - Second point Y
   * @returns {number} Angle in radians
   */
  angleBetween(x1, y1, x2, y2) {
    return Math.atan2(y2 - y1, x2 - x1);
  },
  
  /**
   * Convert degrees to radians
   * @param {number} degrees - Angle in degrees
   * @returns {number} Angle in radians
   */
  degToRad(degrees) {
    return degrees * (Math.PI / 180);
  },
  
  /**
   * Convert radians to degrees
   * @param {number} radians - Angle in radians
   * @returns {number} Angle in degrees
   */
  radToDeg(radians) {
    return radians * (180 / Math.PI);
  },
  
  /**
   * Normalize angle to range [-PI, PI]
   * @param {number} angle - Angle in radians
   * @returns {number}
   */
  normalizeAngle(angle) {
    while (angle > Math.PI) angle -= Math.PI * 2;
    while (angle < -Math.PI) angle += Math.PI * 2;
    return angle;
  },
  
  // ==========================================
  // VECTORS (2D)
  // ==========================================
  
  /**
   * Get vector magnitude
   * @param {number} x - X component
   * @param {number} y - Y component
   * @returns {number}
   */
  magnitude(x, y) {
    return Math.sqrt(x * x + y * y);
  },
  
  /**
   * Normalize vector to unit length
   * @param {number} x - X component
   * @param {number} y - Y component
   * @returns {{x: number, y: number}}
   */
  normalize(x, y) {
    const mag = this.magnitude(x, y);
    if (mag === 0) return { x: 0, y: 0 };
    return { x: x / mag, y: y / mag };
  },
  
  /**
   * Dot product of two vectors
   * @param {number} x1 - First vector X
   * @param {number} y1 - First vector Y
   * @param {number} x2 - Second vector X
   * @param {number} y2 - Second vector Y
   * @returns {number}
   */
  dot(x1, y1, x2, y2) {
    return x1 * x2 + y1 * y2;
  },
  
  /**
   * Cross product (scalar for 2D)
   * @param {number} x1 - First vector X
   * @param {number} y1 - First vector Y
   * @param {number} x2 - Second vector X
   * @param {number} y2 - Second vector Y
   * @returns {number}
   */
  cross(x1, y1, x2, y2) {
    return x1 * y2 - y1 * x2;
  },
  
  // ==========================================
  // EASING FUNCTIONS
  // ==========================================
  
  easing: {
    linear: t => t,
    
    easeInQuad: t => t * t,
    easeOutQuad: t => t * (2 - t),
    easeInOutQuad: t => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
    
    easeInCubic: t => t * t * t,
    easeOutCubic: t => (--t) * t * t + 1,
    easeInOutCubic: t => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,
    
    easeInElastic: t => {
      if (t === 0 || t === 1) return t;
      return -Math.pow(2, 10 * (t - 1)) * Math.sin((t - 1.1) * 5 * Math.PI);
    },
    
    easeOutElastic: t => {
      if (t === 0 || t === 1) return t;
      return Math.pow(2, -10 * t) * Math.sin((t - 0.1) * 5 * Math.PI) + 1;
    },
    
    easeOutBounce: t => {
      if (t < 1 / 2.75) {
        return 7.5625 * t * t;
      } else if (t < 2 / 2.75) {
        return 7.5625 * (t -= 1.5 / 2.75) * t + 0.75;
      } else if (t < 2.5 / 2.75) {
        return 7.5625 * (t -= 2.25 / 2.75) * t + 0.9375;
      } else {
        return 7.5625 * (t -= 2.625 / 2.75) * t + 0.984375;
      }
    }
  }
};

export default MathUtils;
