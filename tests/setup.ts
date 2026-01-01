/**
 * Vitest Test Setup
 * Global configuration and mocks for testing
 */

import { vi } from 'vitest';

// Mock Canvas API
class MockCanvasRenderingContext2D {
  canvas = { width: 400, height: 600 };
  fillStyle = '';
  strokeStyle = '';
  lineWidth = 1;
  font = '';
  textAlign = 'left';
  shadowColor = '';
  shadowBlur = 0;
  shadowOffsetX = 0;
  shadowOffsetY = 0;

  clearRect = vi.fn();
  fillRect = vi.fn();
  strokeRect = vi.fn();
  beginPath = vi.fn();
  closePath = vi.fn();
  moveTo = vi.fn();
  lineTo = vi.fn();
  arc = vi.fn();
  ellipse = vi.fn();
  fill = vi.fn();
  stroke = vi.fn();
  fillText = vi.fn();
  strokeText = vi.fn();
  measureText = vi.fn(() => ({ width: 100 }));
  save = vi.fn();
  restore = vi.fn();
  translate = vi.fn();
  rotate = vi.fn();
  scale = vi.fn();
  createLinearGradient = vi.fn(() => ({
    addColorStop: vi.fn(),
  }));
  createRadialGradient = vi.fn(() => ({
    addColorStop: vi.fn(),
  }));
  roundRect = vi.fn();
  drawImage = vi.fn();
}

// Mock HTMLCanvasElement
HTMLCanvasElement.prototype.getContext = vi.fn((contextId: string) => {
  if (contextId === '2d') {
    return new MockCanvasRenderingContext2D() as unknown as CanvasRenderingContext2D;
  }
  return null;
});

HTMLCanvasElement.prototype.captureStream = vi.fn(() => ({
  getTracks: vi.fn(() => []),
  addTrack: vi.fn(),
}));

// Mock Web Audio API
class MockAudioContext {
  state = 'running';
  currentTime = 0;
  destination = {};

  createOscillator = vi.fn(() => ({
    connect: vi.fn(),
    start: vi.fn(),
    stop: vi.fn(),
    frequency: { setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() },
    type: 'sine',
  }));

  createGain = vi.fn(() => ({
    connect: vi.fn(),
    gain: { value: 1, setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() },
  }));

  resume = vi.fn(() => Promise.resolve());
  suspend = vi.fn(() => Promise.resolve());
  close = vi.fn(() => Promise.resolve());
}

// @ts-ignore
window.AudioContext = MockAudioContext;
// @ts-ignore
window.webkitAudioContext = MockAudioContext;

// Mock localStorage
const localStorageMock = {
  store: {} as Record<string, string>,
  getItem: vi.fn((key: string) => localStorageMock.store[key] || null),
  setItem: vi.fn((key: string, value: string) => {
    localStorageMock.store[key] = value;
  }),
  removeItem: vi.fn((key: string) => {
    delete localStorageMock.store[key];
  }),
  clear: vi.fn(() => {
    localStorageMock.store = {};
  }),
};

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock requestAnimationFrame
let rafId = 0;
window.requestAnimationFrame = vi.fn((callback: FrameRequestCallback) => {
  rafId++;
  setTimeout(() => callback(performance.now()), 16);
  return rafId;
});

window.cancelAnimationFrame = vi.fn((id: number) => {
  // No-op in tests
});

// Mock performance.now for consistent timing
let mockTime = 0;
vi.spyOn(performance, 'now').mockImplementation(() => mockTime);

// Helper to advance mock time
export function advanceTime(ms: number): void {
  mockTime += ms;
}

// Reset mocks between tests
beforeEach(() => {
  vi.clearAllMocks();
  localStorageMock.store = {};
  mockTime = 0;
});

// Mock navigator.vibrate for haptic feedback tests
navigator.vibrate = vi.fn(() => true);

// Mock document.hidden for visibility tests
Object.defineProperty(document, 'hidden', {
  configurable: true,
  get: () => false,
});

// Console spy to catch warnings/errors in tests
vi.spyOn(console, 'warn').mockImplementation(() => {});
vi.spyOn(console, 'error').mockImplementation(() => {});
