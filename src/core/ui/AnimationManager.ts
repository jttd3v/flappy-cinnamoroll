/**
 * AnimationManager - GSAP Animation System
 * 
 * Provides smooth animations using GSAP for:
 * - UI transitions
 * - Score popups
 * - Screen transitions
 * - Character effects
 * 
 * @module core/ui/AnimationManager
 * @version 2.0.0
 */

import gsap from 'gsap';

export interface AnimationOptions {
  duration?: number;
  ease?: string;
  delay?: number;
  onComplete?: () => void;
}

/**
 * Animation presets for common game animations
 */
export const AnimationPresets = {
  // Easing presets
  BOUNCE: 'bounce.out',
  ELASTIC: 'elastic.out(1, 0.3)',
  SMOOTH: 'power2.out',
  SNAP: 'power4.out',
  GENTLE: 'power1.inOut',
  
  // Duration presets
  FAST: 0.2,
  NORMAL: 0.4,
  SLOW: 0.8,
} as const;

/**
 * Animation Manager using GSAP
 */
export class AnimationManager {
  private static instance: AnimationManager | null = null;
  private activeAnimations: Map<string, gsap.core.Tween> = new Map();

  private constructor() {
    // Configure GSAP defaults
    gsap.defaults({
      ease: AnimationPresets.SMOOTH,
      duration: AnimationPresets.NORMAL,
    });
  }

  /**
   * Get singleton instance
   */
  static getInstance(): AnimationManager {
    if (!AnimationManager.instance) {
      AnimationManager.instance = new AnimationManager();
    }
    return AnimationManager.instance;
  }

  // ==========================================
  // SCORE ANIMATIONS
  // ==========================================

  /**
   * Animate score popup ("+1" floating text)
   */
  scorePopup(
    element: HTMLElement | object,
    startX: number,
    startY: number,
    options: AnimationOptions = {}
  ): gsap.core.Tween {
    // If it's an object (for canvas), we track values
    if (!(element instanceof HTMLElement)) {
      return gsap.fromTo(element,
        { x: startX, y: startY, opacity: 1, scale: 1 },
        {
          y: startY - 60,
          opacity: 0,
          scale: 1.5,
          duration: options.duration ?? 0.8,
          ease: 'power2.out',
          onComplete: options.onComplete,
        }
      );
    }

    // For DOM elements
    gsap.set(element, { x: startX, y: startY, opacity: 1, scale: 1 });
    
    return gsap.to(element, {
      y: startY - 60,
      opacity: 0,
      scale: 1.5,
      duration: options.duration ?? 0.8,
      ease: 'power2.out',
      onComplete: () => {
        element.remove();
        options.onComplete?.();
      },
    });
  }

  /**
   * Animate score counter change
   */
  scoreCounter(
    element: HTMLElement,
    fromValue: number,
    toValue: number,
    options: AnimationOptions = {}
  ): gsap.core.Tween {
    const obj = { value: fromValue };
    
    return gsap.to(obj, {
      value: toValue,
      duration: options.duration ?? 0.5,
      ease: 'power2.out',
      onUpdate: () => {
        element.textContent = Math.round(obj.value).toString();
      },
      onComplete: options.onComplete,
    });
  }

  /**
   * Pulse animation for score milestones
   */
  scorePulse(element: HTMLElement | object): gsap.core.Tween {
    return gsap.fromTo(element,
      { scale: 1 },
      {
        scale: 1.3,
        duration: 0.15,
        ease: 'power2.out',
        yoyo: true,
        repeat: 1,
      }
    );
  }

  // ==========================================
  // UI TRANSITIONS
  // ==========================================

  /**
   * Fade in an element
   */
  fadeIn(element: HTMLElement, options: AnimationOptions = {}): gsap.core.Tween {
    return gsap.fromTo(element,
      { opacity: 0 },
      {
        opacity: 1,
        duration: options.duration ?? AnimationPresets.NORMAL,
        ease: options.ease ?? AnimationPresets.SMOOTH,
        delay: options.delay,
        onComplete: options.onComplete,
      }
    );
  }

  /**
   * Fade out an element
   */
  fadeOut(element: HTMLElement, options: AnimationOptions = {}): gsap.core.Tween {
    return gsap.to(element, {
      opacity: 0,
      duration: options.duration ?? AnimationPresets.NORMAL,
      ease: options.ease ?? AnimationPresets.SMOOTH,
      delay: options.delay,
      onComplete: options.onComplete,
    });
  }

  /**
   * Slide in from direction
   */
  slideIn(
    element: HTMLElement,
    direction: 'left' | 'right' | 'top' | 'bottom' = 'bottom',
    options: AnimationOptions = {}
  ): gsap.core.Tween {
    const offset = 50;
    const fromVars: gsap.TweenVars = { opacity: 0 };

    switch (direction) {
      case 'left':
        fromVars.x = -offset;
        break;
      case 'right':
        fromVars.x = offset;
        break;
      case 'top':
        fromVars.y = -offset;
        break;
      case 'bottom':
        fromVars.y = offset;
        break;
    }

    return gsap.fromTo(element, fromVars, {
      x: 0,
      y: 0,
      opacity: 1,
      duration: options.duration ?? AnimationPresets.NORMAL,
      ease: options.ease ?? AnimationPresets.SMOOTH,
      delay: options.delay,
      onComplete: options.onComplete,
    });
  }

  /**
   * Bounce in animation
   */
  bounceIn(element: HTMLElement, options: AnimationOptions = {}): gsap.core.Tween {
    return gsap.fromTo(element,
      { scale: 0, opacity: 0 },
      {
        scale: 1,
        opacity: 1,
        duration: options.duration ?? 0.6,
        ease: AnimationPresets.BOUNCE,
        delay: options.delay,
        onComplete: options.onComplete,
      }
    );
  }

  /**
   * Modal open animation
   */
  modalOpen(modal: HTMLElement, overlay?: HTMLElement): gsap.core.Timeline {
    const tl = gsap.timeline();

    if (overlay) {
      tl.fromTo(overlay,
        { opacity: 0 },
        { opacity: 1, duration: 0.2 },
        0
      );
    }

    tl.fromTo(modal,
      { scale: 0.8, opacity: 0, y: 20 },
      { scale: 1, opacity: 1, y: 0, duration: 0.3, ease: AnimationPresets.BOUNCE },
      0.1
    );

    return tl;
  }

  /**
   * Modal close animation
   */
  modalClose(modal: HTMLElement, overlay?: HTMLElement): gsap.core.Timeline {
    const tl = gsap.timeline();

    tl.to(modal, {
      scale: 0.8,
      opacity: 0,
      y: 20,
      duration: 0.2,
      ease: 'power2.in',
    });

    if (overlay) {
      tl.to(overlay, { opacity: 0, duration: 0.2 }, 0.1);
    }

    return tl;
  }

  // ==========================================
  // GAME-SPECIFIC ANIMATIONS
  // ==========================================

  /**
   * Player hurt/damage shake
   */
  shake(element: HTMLElement | object, intensity: number = 5): gsap.core.Timeline {
    const tl = gsap.timeline();

    tl.to(element, { x: -intensity, duration: 0.05 })
      .to(element, { x: intensity, duration: 0.05 })
      .to(element, { x: -intensity * 0.5, duration: 0.05 })
      .to(element, { x: intensity * 0.5, duration: 0.05 })
      .to(element, { x: 0, duration: 0.05 });

    return tl;
  }

  /**
   * Screen shake effect
   */
  screenShake(container: HTMLElement, intensity: number = 10): gsap.core.Timeline {
    return this.shake(container, intensity);
  }

  /**
   * Ghost warning pulse
   */
  ghostWarning(element: HTMLElement): gsap.core.Tween {
    return gsap.to(element, {
      opacity: 0.5,
      scale: 1.1,
      duration: 0.3,
      ease: 'power1.inOut',
      yoyo: true,
      repeat: 5,
    });
  }

  /**
   * Speed up indicator animation
   */
  speedUpIndicator(element: HTMLElement): gsap.core.Timeline {
    const tl = gsap.timeline();

    tl.fromTo(element,
      { scale: 0, opacity: 0 },
      { scale: 1.2, opacity: 1, duration: 0.2, ease: 'back.out(1.7)' }
    )
    .to(element, { scale: 1, duration: 0.1 })
    .to(element, { opacity: 0, y: -20, duration: 0.5, delay: 1 });

    return tl;
  }

  /**
   * Float animation (for objects)
   */
  float(element: HTMLElement | object, amplitude: number = 5): gsap.core.Tween {
    return gsap.to(element, {
      y: `+=${amplitude}`,
      duration: 1.5,
      ease: 'sine.inOut',
      yoyo: true,
      repeat: -1,
    });
  }

  // ==========================================
  // UTILITY METHODS
  // ==========================================

  /**
   * Kill a specific animation by ID
   */
  kill(id: string): void {
    const tween = this.activeAnimations.get(id);
    if (tween) {
      tween.kill();
      this.activeAnimations.delete(id);
    }
  }

  /**
   * Kill all active animations
   */
  killAll(): void {
    this.activeAnimations.forEach(tween => tween.kill());
    this.activeAnimations.clear();
    gsap.killTweensOf('*');
  }

  /**
   * Pause all animations
   */
  pauseAll(): void {
    gsap.globalTimeline.pause();
  }

  /**
   * Resume all animations
   */
  resumeAll(): void {
    gsap.globalTimeline.resume();
  }

  /**
   * Create a timeline
   */
  createTimeline(options?: gsap.TimelineVars): gsap.core.Timeline {
    return gsap.timeline(options);
  }

  /**
   * Get GSAP instance for advanced usage
   */
  get gsap() {
    return gsap;
  }
}

// Export singleton instance
export const animationManager = AnimationManager.getInstance();
