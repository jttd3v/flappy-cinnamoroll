/**
 * EffectsManager - Visual Effects with canvas-confetti
 * 
 * Provides celebration and visual effects for:
 * - Score milestones
 * - High scores
 * - Level completion
 * - Achievements
 * 
 * @module core/ui/EffectsManager
 * @version 2.0.0
 */

import confetti from 'canvas-confetti';

export interface ConfettiOptions {
  particleCount?: number;
  spread?: number;
  startVelocity?: number;
  decay?: number;
  gravity?: number;
  origin?: { x: number; y: number };
  colors?: string[];
  shapes?: ('square' | 'circle')[];
  scalar?: number;
  zIndex?: number;
  disableForReducedMotion?: boolean;
}

/**
 * Preset color palettes
 */
export const ColorPalettes = {
  SANRIO: ['#FFB6C1', '#FFD700', '#87CEEB', '#98FB98', '#DDA0DD', '#FFFFFF'] as string[],
  CINNAMOROLL: ['#87CEEB', '#FFFFFF', '#FFB6C1', '#E6E6FA'] as string[],
  GOLD: ['#FFD700', '#FFA500', '#FFEC8B', '#F0E68C'] as string[],
  RAINBOW: ['#FF6B6B', '#FFA07A', '#FFD93D', '#6BCB77', '#4D96FF', '#9B59B6'] as string[],
  CELEBRATION: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'] as string[],
};

/**
 * Effects Manager for visual celebrations
 */
export class EffectsManager {
  private static instance: EffectsManager | null = null;
  private customConfetti: confetti.CreateTypes | null = null;
  private isReducedMotion: boolean = false;

  private constructor() {
    // Check for reduced motion preference
    this.isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  /**
   * Get singleton instance
   */
  static getInstance(): EffectsManager {
    if (!EffectsManager.instance) {
      EffectsManager.instance = new EffectsManager();
    }
    return EffectsManager.instance;
  }

  /**
   * Initialize with a custom canvas (optional)
   */
  init(canvas?: HTMLCanvasElement): void {
    if (canvas) {
      this.customConfetti = confetti.create(canvas, { resize: true });
    }
  }

  /**
   * Get confetti function (custom canvas or default)
   */
  private getConfetti(): confetti.CreateTypes {
    // Type assertion needed as confetti module export types don't perfectly align
    return (this.customConfetti ?? confetti) as confetti.CreateTypes;
  }

  // ==========================================
  // CELEBRATION EFFECTS
  // ==========================================

  /**
   * Basic confetti burst
   */
  burst(options: ConfettiOptions = {}): void {
    if (this.isReducedMotion && options.disableForReducedMotion !== false) return;

    this.getConfetti()({
      particleCount: options.particleCount ?? 50,
      spread: options.spread ?? 60,
      origin: options.origin ?? { x: 0.5, y: 0.6 },
      colors: options.colors ?? ColorPalettes.SANRIO,
      shapes: options.shapes ?? ['square', 'circle'],
      scalar: options.scalar ?? 1,
      gravity: options.gravity ?? 1,
      startVelocity: options.startVelocity ?? 30,
      decay: options.decay ?? 0.94,
      zIndex: options.zIndex ?? 1000,
    });
  }

  /**
   * Score milestone celebration (every 10 points)
   */
  scoreMilestone(score: number): void {
    if (this.isReducedMotion) return;

    const intensity = Math.min(score / 10, 5); // Cap at 5x intensity

    this.burst({
      particleCount: 20 + (intensity * 10),
      spread: 40 + (intensity * 10),
      origin: { x: 0.5, y: 0.3 },
      colors: ColorPalettes.CINNAMOROLL,
      startVelocity: 25 + (intensity * 5),
    });
  }

  /**
   * New high score celebration
   */
  highScore(): void {
    if (this.isReducedMotion) return;

    const duration = 3000;
    const animationEnd = Date.now() + duration;

    const frame = () => {
      this.getConfetti()({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ColorPalettes.GOLD,
      });

      this.getConfetti()({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ColorPalettes.GOLD,
      });

      if (Date.now() < animationEnd) {
        requestAnimationFrame(frame);
      }
    };

    frame();
  }

  /**
   * Level complete / game win celebration
   */
  victory(): void {
    if (this.isReducedMotion) return;

    const count = 200;
    const defaults = {
      origin: { y: 0.7 },
      colors: ColorPalettes.CELEBRATION,
    };

    function fire(particleRatio: number, opts: confetti.Options) {
      confetti({
        ...defaults,
        particleCount: Math.floor(count * particleRatio),
        ...opts,
      });
    }

    fire(0.25, { spread: 26, startVelocity: 55 });
    fire(0.2, { spread: 60 });
    fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
    fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
    fire(0.1, { spread: 120, startVelocity: 45 });
  }

  /**
   * Achievement unlocked effect
   */
  achievement(): void {
    if (this.isReducedMotion) return;

    // Star-shaped burst
    const shapes = confetti.shapeFromText({ text: '⭐', scalar: 2 });

    this.getConfetti()({
      particleCount: 30,
      spread: 360,
      origin: { x: 0.5, y: 0.5 },
      shapes: [shapes],
      scalar: 2,
      startVelocity: 30,
      gravity: 0.5,
      decay: 0.9,
    });

    // Add regular confetti
    setTimeout(() => {
      this.burst({
        particleCount: 60,
        spread: 80,
        origin: { x: 0.5, y: 0.5 },
        colors: ColorPalettes.RAINBOW,
      });
    }, 200);
  }

  /**
   * Side cannons effect
   */
  sideCannons(): void {
    if (this.isReducedMotion) return;

    const end = Date.now() + 1000;

    const frame = () => {
      this.getConfetti()({
        particleCount: 2,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.8 },
        colors: ColorPalettes.SANRIO,
      });

      this.getConfetti()({
        particleCount: 2,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.8 },
        colors: ColorPalettes.SANRIO,
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };

    frame();
  }

  /**
   * Fireworks effect
   */
  fireworks(): void {
    if (this.isReducedMotion) return;

    const duration = 5000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        clearInterval(interval);
        return;
      }

      const particleCount = 50 * (timeLeft / duration);

      this.getConfetti()({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        colors: ColorPalettes.CELEBRATION,
      });

      this.getConfetti()({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        colors: ColorPalettes.CELEBRATION,
      });
    }, 250);
  }

  /**
   * Snow/stars falling effect
   */
  snow(duration: number = 5000): void {
    if (this.isReducedMotion) return;

    const animationEnd = Date.now() + duration;
    let skew = 1;

    const frame = () => {
      const timeLeft = animationEnd - Date.now();
      const ticks = Math.max(200, 500 * (timeLeft / duration));

      skew = Math.max(0.8, skew - 0.001);

      this.getConfetti()({
        particleCount: 1,
        startVelocity: 0,
        ticks,
        gravity: 0.5,
        origin: {
          x: Math.random(),
          y: Math.random() * skew - 0.2,
        },
        colors: ['#FFFFFF', '#E6E6FA', '#87CEEB'],
        shapes: ['circle'],
        scalar: Math.random() * 0.5 + 0.5,
        drift: Math.random() - 0.5,
      });

      if (timeLeft > 0) {
        requestAnimationFrame(frame);
      }
    };

    frame();
  }

  /**
   * Hearts effect (for Sanrio theme)
   */
  hearts(): void {
    if (this.isReducedMotion) return;

    const heart = confetti.shapeFromText({ text: '💖', scalar: 2 });

    this.getConfetti()({
      particleCount: 20,
      spread: 100,
      origin: { x: 0.5, y: 0.5 },
      shapes: [heart],
      scalar: 2,
      gravity: 0.8,
    });
  }

  /**
   * Quick sparkle at a specific position
   */
  sparkle(x: number, y: number): void {
    if (this.isReducedMotion) return;

    this.getConfetti()({
      particleCount: 10,
      spread: 30,
      origin: { x, y },
      colors: ['#FFD700', '#FFFFFF', '#FFB6C1'],
      shapes: ['circle'],
      scalar: 0.5,
      startVelocity: 15,
      gravity: 0.5,
      decay: 0.9,
    });
  }

  // ==========================================
  // UTILITY METHODS
  // ==========================================

  /**
   * Reset/clear all confetti
   */
  reset(): void {
    if (this.customConfetti) {
      this.customConfetti.reset();
    } else {
      confetti.reset();
    }
  }

  /**
   * Check if reduced motion is enabled
   */
  get reducedMotion(): boolean {
    return this.isReducedMotion;
  }

  /**
   * Enable/disable reduced motion
   */
  setReducedMotion(enabled: boolean): void {
    this.isReducedMotion = enabled;
  }

  /**
   * Clean up
   */
  destroy(): void {
    this.reset();
    this.customConfetti = null;
    EffectsManager.instance = null;
  }
}

// Export singleton instance
export const effectsManager = EffectsManager.getInstance();
