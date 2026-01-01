/**
 * PauseOverlay - Pause Menu UI Component
 * 
 * Provides a pause menu with:
 * - Resume, Restart, Quit options
 * - GSAP animations
 * - Keyboard navigation
 * 
 * @module core/ui/PauseOverlay
 * @version 2.0.0
 */

import { animationManager } from './AnimationManager';
import { EventSystem, GameEvents } from '../engine/EventSystem';

export interface PauseOverlayOptions {
  container: HTMLElement;
  onResume?: () => void;
  onRestart?: () => void;
  onQuit?: () => void;
  showQuit?: boolean;
}

/**
 * Pause overlay component
 */
export class PauseOverlay {
  private container: HTMLElement;
  private overlay: HTMLElement | null = null;
  private modal: HTMLElement | null = null;
  private isVisible: boolean = false;
  private options: PauseOverlayOptions;
  private keyHandler: ((e: KeyboardEvent) => void) | null = null;

  constructor(options: PauseOverlayOptions) {
    this.options = options;
    this.container = options.container;
    this.createOverlay();
    this.setupKeyboardHandler();
  }

  /**
   * Create the overlay DOM structure
   */
  private createOverlay(): void {
    // Create overlay backdrop
    this.overlay = document.createElement('div');
    this.overlay.className = 'pause-overlay';
    this.overlay.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.7);
      backdrop-filter: blur(5px);
      display: none;
      justify-content: center;
      align-items: center;
      z-index: 1000;
    `;

    // Create modal
    this.modal = document.createElement('div');
    this.modal.className = 'pause-modal';
    this.modal.style.cssText = `
      background: linear-gradient(135deg, #FFFFFF 0%, #F5F5F5 100%);
      border-radius: 20px;
      padding: 30px 40px;
      text-align: center;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
      min-width: 280px;
    `;

    // Modal content
    this.modal.innerHTML = `
      <div class="pause-title" style="
        font-size: 28px;
        font-weight: bold;
        color: #5BA3D0;
        margin-bottom: 10px;
      ">⏸️ Paused</div>
      <div class="pause-subtitle" style="
        font-size: 14px;
        color: #888;
        margin-bottom: 25px;
      ">Press Escape to resume</div>
      <div class="pause-buttons" style="
        display: flex;
        flex-direction: column;
        gap: 12px;
      ">
        <button class="pause-btn resume-btn" style="
          padding: 14px 40px;
          font-size: 18px;
          font-weight: bold;
          background: linear-gradient(135deg, #87CEEB, #5BA3D0);
          color: white;
          border: none;
          border-radius: 10px;
          cursor: pointer;
          transition: transform 0.2s, box-shadow 0.2s;
        ">▶️ Resume</button>
        <button class="pause-btn restart-btn" style="
          padding: 14px 40px;
          font-size: 18px;
          font-weight: bold;
          background: linear-gradient(135deg, #FFB6C1, #FF69B4);
          color: white;
          border: none;
          border-radius: 10px;
          cursor: pointer;
          transition: transform 0.2s, box-shadow 0.2s;
        ">🔄 Restart</button>
        ${this.options.showQuit !== false ? `
          <button class="pause-btn quit-btn" style="
            padding: 14px 40px;
            font-size: 18px;
            font-weight: bold;
            background: linear-gradient(135deg, #E0E0E0, #BDBDBD);
            color: #555;
            border: none;
            border-radius: 10px;
            cursor: pointer;
            transition: transform 0.2s, box-shadow 0.2s;
          ">🚪 Quit</button>
        ` : ''}
      </div>
    `;

    // Add event listeners to buttons
    const resumeBtn = this.modal.querySelector('.resume-btn');
    const restartBtn = this.modal.querySelector('.restart-btn');
    const quitBtn = this.modal.querySelector('.quit-btn');

    resumeBtn?.addEventListener('click', () => this.handleResume());
    restartBtn?.addEventListener('click', () => this.handleRestart());
    quitBtn?.addEventListener('click', () => this.handleQuit());

    // Add hover effects
    this.modal.querySelectorAll('.pause-btn').forEach(btn => {
      btn.addEventListener('mouseenter', () => {
        (btn as HTMLElement).style.transform = 'scale(1.05)';
        (btn as HTMLElement).style.boxShadow = '0 5px 20px rgba(0, 0, 0, 0.2)';
      });
      btn.addEventListener('mouseleave', () => {
        (btn as HTMLElement).style.transform = 'scale(1)';
        (btn as HTMLElement).style.boxShadow = 'none';
      });
    });

    // Append to DOM
    this.overlay.appendChild(this.modal);
    this.container.appendChild(this.overlay);
  }

  /**
   * Setup keyboard handler for pause menu
   */
  private setupKeyboardHandler(): void {
    this.keyHandler = (e: KeyboardEvent) => {
      if (!this.isVisible) return;

      switch (e.key) {
        case 'Escape':
          e.preventDefault();
          this.handleResume();
          break;
        case 'Enter':
          e.preventDefault();
          this.handleResume();
          break;
        case 'r':
        case 'R':
          e.preventDefault();
          this.handleRestart();
          break;
        case 'q':
        case 'Q':
          if (this.options.showQuit !== false) {
            e.preventDefault();
            this.handleQuit();
          }
          break;
      }
    };

    document.addEventListener('keydown', this.keyHandler);
  }

  /**
   * Show the pause overlay
   */
  show(): void {
    if (this.isVisible || !this.overlay || !this.modal) return;

    this.isVisible = true;
    this.overlay.style.display = 'flex';

    // Animate in
    animationManager.modalOpen(this.modal, this.overlay);

    EventSystem.emit(GameEvents.MODAL_OPEN, { type: 'pause' });
  }

  /**
   * Hide the pause overlay
   */
  hide(): void {
    if (!this.isVisible || !this.overlay || !this.modal) return;

    // Animate out
    const tl = animationManager.modalClose(this.modal, this.overlay);
    
    tl.then(() => {
      if (this.overlay) {
        this.overlay.style.display = 'none';
      }
      this.isVisible = false;
      EventSystem.emit(GameEvents.MODAL_CLOSE, { type: 'pause' });
    });
  }

  /**
   * Toggle visibility
   */
  toggle(): boolean {
    if (this.isVisible) {
      this.hide();
    } else {
      this.show();
    }
    return this.isVisible;
  }

  /**
   * Handle resume action
   */
  private handleResume(): void {
    this.hide();
    this.options.onResume?.();
    EventSystem.emit(GameEvents.GAME_RESUME, { source: 'pause-menu' });
  }

  /**
   * Handle restart action
   */
  private handleRestart(): void {
    this.hide();
    this.options.onRestart?.();
    EventSystem.emit(GameEvents.GAME_RESTART, { source: 'pause-menu' });
  }

  /**
   * Handle quit action
   */
  private handleQuit(): void {
    this.hide();
    this.options.onQuit?.();
  }

  /**
   * Check if overlay is visible
   */
  get visible(): boolean {
    return this.isVisible;
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    if (this.keyHandler) {
      document.removeEventListener('keydown', this.keyHandler);
    }

    if (this.overlay && this.overlay.parentNode) {
      this.overlay.parentNode.removeChild(this.overlay);
    }

    this.overlay = null;
    this.modal = null;
  }
}

// Export factory function
export function createPauseOverlay(options: PauseOverlayOptions): PauseOverlay {
  return new PauseOverlay(options);
}
