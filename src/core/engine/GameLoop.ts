/**
 * GameLoop - Frame-rate Independent Game Loop
 * 
 * Provides a robust game loop with:
 * - Delta time for frame-rate independence
 * - Automatic pause on tab switch
 * - FPS tracking and limiting
 * - Graceful handling of long pauses
 * 
 * @module core/engine/GameLoop
 * @version 2.0.0
 */

import { EventSystem, GameEvents } from './EventSystem';
import { VisibilityManager } from './VisibilityManager';

export interface GameLoopConfig {
  /** Target FPS (0 = unlimited/vsync) */
  targetFPS?: number;
  /** Maximum delta time in ms (prevents huge jumps after pause) */
  maxDeltaTime?: number;
  /** Fixed timestep for physics (ms) */
  fixedTimestep?: number;
  /** Enable automatic pause on tab hidden */
  autoPauseOnHidden?: boolean;
}

export interface FrameInfo {
  /** Time since last frame in milliseconds */
  deltaTime: number;
  /** Normalized delta (1.0 = 60fps baseline) */
  deltaNormalized: number;
  /** Current timestamp */
  timestamp: number;
  /** Current FPS */
  fps: number;
  /** Total elapsed time since start */
  elapsedTime: number;
  /** Frame count since start */
  frameCount: number;
}

export type UpdateCallback = (frameInfo: FrameInfo) => void;
export type RenderCallback = (frameInfo: FrameInfo) => void;

/**
 * High-performance game loop with frame-rate independence
 */
export class GameLoop {
  private config: Required<GameLoopConfig>;
  private rafId: number | null = null;
  private lastTimestamp: number = 0;
  private elapsedTime: number = 0;
  private frameCount: number = 0;
  private isRunning: boolean = false;
  private isPaused: boolean = false;
  
  // FPS tracking
  private fpsHistory: number[] = [];
  private fpsUpdateInterval: number = 500; // Update FPS every 500ms
  private lastFpsUpdate: number = 0;
  private currentFps: number = 60;
  
  // Fixed timestep accumulator (for physics)
  private accumulator: number = 0;
  
  // Callbacks
  private updateCallbacks: UpdateCallback[] = [];
  private renderCallbacks: RenderCallback[] = [];
  private fixedUpdateCallbacks: UpdateCallback[] = [];
  
  // Visibility manager
  private visibilityManager: VisibilityManager;

  constructor(config: GameLoopConfig = {}) {
    this.config = {
      targetFPS: config.targetFPS ?? 0,
      maxDeltaTime: config.maxDeltaTime ?? 100, // Max 100ms delta (10 FPS minimum)
      fixedTimestep: config.fixedTimestep ?? 16.67, // 60 FPS fixed step
      autoPauseOnHidden: config.autoPauseOnHidden ?? true,
    };

    this.visibilityManager = VisibilityManager.getInstance();
    
    // Bind methods
    this.tick = this.tick.bind(this);
    
    // Setup visibility handling
    this.setupVisibilityHandling();
  }

  /**
   * Setup automatic pause/resume on visibility change
   */
  private setupVisibilityHandling(): void {
    if (!this.config.autoPauseOnHidden) return;

    EventSystem.on(GameEvents.VISIBILITY_HIDDEN, () => {
      if (this.isRunning && !this.isPaused) {
        this.pause();
        console.log('🎮 GameLoop auto-paused (tab hidden)');
      }
    });

    EventSystem.on(GameEvents.VISIBILITY_VISIBLE, (data: { hiddenDuration: number }) => {
      // Don't auto-resume - let the game decide
      // But we do need to reset timing to prevent huge delta spikes
      if (this.isPaused) {
        this.lastTimestamp = performance.now();
        this.accumulator = 0;
        console.log(`🎮 GameLoop ready to resume (was hidden ${Math.round(data.hiddenDuration)}ms)`);
      }
    });
  }

  /**
   * Main loop tick
   */
  private tick(timestamp: number): void {
    if (!this.isRunning) return;

    // Schedule next frame first (ensures consistent timing)
    this.rafId = requestAnimationFrame(this.tick);

    // Skip if paused
    if (this.isPaused) {
      this.lastTimestamp = timestamp;
      return;
    }

    // Calculate delta time
    let deltaTime = timestamp - this.lastTimestamp;
    this.lastTimestamp = timestamp;

    // Handle first frame
    if (deltaTime === timestamp) {
      deltaTime = this.config.fixedTimestep;
    }

    // Clamp delta time to prevent huge jumps
    if (deltaTime > this.config.maxDeltaTime) {
      console.warn(`⚠️ Large delta clamped: ${deltaTime.toFixed(1)}ms -> ${this.config.maxDeltaTime}ms`);
      deltaTime = this.config.maxDeltaTime;
    }

    // Update elapsed time and frame count
    this.elapsedTime += deltaTime;
    this.frameCount++;

    // Update FPS
    this.updateFPS(deltaTime, timestamp);

    // Create frame info
    const frameInfo: FrameInfo = {
      deltaTime,
      deltaNormalized: deltaTime / 16.67, // Normalized to 60fps
      timestamp,
      fps: this.currentFps,
      elapsedTime: this.elapsedTime,
      frameCount: this.frameCount,
    };

    // Fixed timestep updates (for physics)
    this.accumulator += deltaTime;
    while (this.accumulator >= this.config.fixedTimestep) {
      const fixedFrameInfo: FrameInfo = {
        ...frameInfo,
        deltaTime: this.config.fixedTimestep,
        deltaNormalized: 1.0,
      };
      
      for (const callback of this.fixedUpdateCallbacks) {
        callback(fixedFrameInfo);
      }
      
      this.accumulator -= this.config.fixedTimestep;
    }

    // Variable timestep updates
    for (const callback of this.updateCallbacks) {
      callback(frameInfo);
    }

    // Render
    for (const callback of this.renderCallbacks) {
      callback(frameInfo);
    }
  }

  /**
   * Update FPS tracking
   */
  private updateFPS(deltaTime: number, timestamp: number): void {
    // Calculate instant FPS
    const instantFps = 1000 / deltaTime;
    this.fpsHistory.push(instantFps);

    // Keep only last N samples
    if (this.fpsHistory.length > 60) {
      this.fpsHistory.shift();
    }

    // Update displayed FPS periodically
    if (timestamp - this.lastFpsUpdate > this.fpsUpdateInterval) {
      const avgFps = this.fpsHistory.reduce((a, b) => a + b, 0) / this.fpsHistory.length;
      this.currentFps = Math.round(avgFps);
      this.lastFpsUpdate = timestamp;
    }
  }

  /**
   * Start the game loop
   */
  start(): void {
    if (this.isRunning) return;

    this.isRunning = true;
    this.isPaused = false;
    this.lastTimestamp = performance.now();
    this.accumulator = 0;

    // Initialize visibility manager
    this.visibilityManager.init();

    // Start the loop
    this.rafId = requestAnimationFrame(this.tick);

    console.log('🎮 GameLoop started');
    EventSystem.emit(GameEvents.LOOP_START, { timestamp: this.lastTimestamp });
  }

  /**
   * Stop the game loop completely
   */
  stop(): void {
    if (!this.isRunning) return;

    this.isRunning = false;
    this.isPaused = false;

    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }

    console.log('🎮 GameLoop stopped');
    EventSystem.emit(GameEvents.LOOP_STOP, { 
      elapsedTime: this.elapsedTime,
      frameCount: this.frameCount,
    });
  }

  /**
   * Pause the game loop (keeps RAF running but skips updates)
   */
  pause(): void {
    if (!this.isRunning || this.isPaused) return;

    this.isPaused = true;
    console.log('🎮 GameLoop paused');
    EventSystem.emit(GameEvents.LOOP_PAUSE, { timestamp: performance.now() });
  }

  /**
   * Resume the game loop
   */
  resume(): void {
    if (!this.isRunning || !this.isPaused) return;

    this.isPaused = false;
    this.lastTimestamp = performance.now();
    this.accumulator = 0;

    console.log('🎮 GameLoop resumed');
    EventSystem.emit(GameEvents.LOOP_RESUME, { timestamp: this.lastTimestamp });
  }

  /**
   * Toggle pause state
   */
  togglePause(): boolean {
    if (this.isPaused) {
      this.resume();
    } else {
      this.pause();
    }
    return this.isPaused;
  }

  /**
   * Register an update callback (variable timestep)
   */
  onUpdate(callback: UpdateCallback): () => void {
    this.updateCallbacks.push(callback);
    return () => {
      const index = this.updateCallbacks.indexOf(callback);
      if (index > -1) this.updateCallbacks.splice(index, 1);
    };
  }

  /**
   * Register a fixed update callback (fixed timestep, ideal for physics)
   */
  onFixedUpdate(callback: UpdateCallback): () => void {
    this.fixedUpdateCallbacks.push(callback);
    return () => {
      const index = this.fixedUpdateCallbacks.indexOf(callback);
      if (index > -1) this.fixedUpdateCallbacks.splice(index, 1);
    };
  }

  /**
   * Register a render callback
   */
  onRender(callback: RenderCallback): () => void {
    this.renderCallbacks.push(callback);
    return () => {
      const index = this.renderCallbacks.indexOf(callback);
      if (index > -1) this.renderCallbacks.splice(index, 1);
    };
  }

  /**
   * Get current state
   */
  get state() {
    return {
      isRunning: this.isRunning,
      isPaused: this.isPaused,
      fps: this.currentFps,
      frameCount: this.frameCount,
      elapsedTime: this.elapsedTime,
    };
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    this.stop();
    this.updateCallbacks = [];
    this.renderCallbacks = [];
    this.fixedUpdateCallbacks = [];
    this.fpsHistory = [];
  }
}

// Export factory function
export function createGameLoop(config?: GameLoopConfig): GameLoop {
  return new GameLoop(config);
}
