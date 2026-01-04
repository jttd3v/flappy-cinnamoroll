/**
 * Cloud Kingdom Explorer - Main Game Logic
 * A tile-based exploration game with inventory and quests
 * 
 * @version 1.0.0
 */

// ==================== Configuration (inlined for file:// compatibility) ====================
const KINGDOM_CONFIG = Object.freeze({
  TILE_SIZE: 48,
  VIEWPORT_TILES_X: 10,
  VIEWPORT_TILES_Y: 8,
  PLAYER_MOVE_SPEED: 150, // ms per tile
  
  DIFFICULTY_SETTINGS: {
    1: { mapSize: 8, puzzles: false, enemies: false, timeLimit: null },
    2: { mapSize: 12, puzzles: 'simple', enemies: false, timeLimit: null },
    3: { mapSize: 16, puzzles: 'moderate', enemies: false, timeLimit: null },
    4: { mapSize: 20, puzzles: 'complex', enemies: false, timeLimit: null },
    5: { mapSize: 24, puzzles: 'complex', enemies: 'passive', timeLimit: null },
    6: { mapSize: 32, puzzles: 'advanced', enemies: 'passive', timeLimit: 600 },
    7: { mapSize: 40, puzzles: 'advanced', enemies: 'active', timeLimit: 300 }
  },
  
  ITEMS: {
    golden_key: { name: 'Golden Key', icon: '🗝️', stackable: true },
    flower: { name: 'Cloud Flower', icon: '🌸', stackable: true },
    gem: { name: 'Star Gem', icon: '💎', stackable: true },
    candy: { name: 'Cloud Candy', icon: '🍬', stackable: true },
    map_scroll: { name: 'Map Fragment', icon: '📜', stackable: false }
  },
  
  LEADERBOARD_KEY: 'cloudKingdomLeaderboard'
});

const TILE_TYPES = {
  void: { walkable: false, sprite: '░', color: '#000' },
  cloud: { walkable: true, sprite: '☁️', color: '#fff' },
  tree: { walkable: false, sprite: '🌲', color: '#228b22' },
  flower: { walkable: true, sprite: '🌸', color: '#ffb7c5' },
  water: { walkable: false, sprite: '🌊', color: '#4169e1' },
  door: { walkable: false, sprite: '🚪', interactive: true },
  chest: { walkable: false, sprite: '📦', interactive: true }
};

function getDifficultyFromAge(age) {
  if (age <= 8) return 1;
  if (age <= 10) return 2;
  if (age <= 12) return 3;
  if (age <= 15) return 4;
  if (age <= 20) return 5;
  if (age <= 25) return 6;
  return 7;
}

// ==================== Map Data ======================================
const MAPS = {
    starter_island: {
        id: 'starter_island',
        name: 'Starter Island',
        width: 12,
        height: 10,
        tiles: [
            [0,0,0,1,1,1,1,1,1,0,0,0],
            [0,0,1,1,1,2,1,1,1,1,0,0],
            [0,1,1,3,1,1,1,1,2,1,1,0],
            [0,1,2,1,1,1,1,3,1,1,1,0],
            [1,1,1,1,1,1,1,1,1,1,1,1],
            [1,1,1,3,1,1,1,1,1,3,1,1],
            [0,1,1,1,1,2,1,1,1,1,1,0],
            [0,1,2,1,1,1,1,1,2,1,1,0],
            [0,0,1,1,1,1,1,1,1,1,0,0],
            [0,0,0,1,1,1,1,1,1,0,0,0]
        ],
        tileTypes: { 0: 'void', 1: 'cloud', 2: 'tree', 3: 'flower' },
        entities: [
            { id: 'gem_001', type: 'item', itemId: 'gem', x: 3, y: 2, sprite: '💎' },
            { id: 'gem_002', type: 'item', itemId: 'gem', x: 8, y: 5, sprite: '💎' },
            { id: 'gem_003', type: 'item', itemId: 'gem', x: 5, y: 7, sprite: '💎' },
            { id: 'key_001', type: 'item', itemId: 'golden_key', x: 9, y: 3, sprite: '🗝️' },
            { id: 'candy_001', type: 'item', itemId: 'candy', x: 2, y: 5, sprite: '🍬' },
            { id: 'npc_cinn', type: 'npc', x: 6, y: 4, sprite: '🐰', name: 'Cinnamoroll', dialog: [
                "Welcome to Cloud Kingdom! ☁️",
                "Explore and collect gems! 💎",
                "Press SPACE near objects to interact!"
            ]}
        ],
        playerStart: { x: 5, y: 5 },
        quests: [
            { id: 'collect_gems', title: 'Gem Collector', desc: 'Collect 3 gems', type: 'collect', target: 'gem', amount: 3 },
            { id: 'find_key', title: 'Key Finder', desc: 'Find the golden key', type: 'collect', target: 'golden_key', amount: 1 }
        ],
        exitPoint: { x: 10, y: 4, nextMap: 'rainbow_bridge' }
    },
    rainbow_bridge: {
        id: 'rainbow_bridge',
        name: 'Rainbow Bridge',
        width: 14,
        height: 10,
        tiles: [
            [0,0,0,0,1,1,1,1,1,1,0,0,0,0],
            [0,0,0,1,1,2,1,1,2,1,1,0,0,0],
            [0,0,1,1,1,1,1,1,1,1,1,1,0,0],
            [0,1,1,3,1,1,1,1,1,1,3,1,1,0],
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1],
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1],
            [0,1,1,3,1,1,1,1,1,1,3,1,1,0],
            [0,0,1,1,1,1,2,1,1,1,1,1,0,0],
            [0,0,0,1,1,1,1,1,1,1,1,0,0,0],
            [0,0,0,0,1,1,1,1,1,1,0,0,0,0]
        ],
        tileTypes: { 0: 'void', 1: 'cloud', 2: 'tree', 3: 'flower' },
        entities: [
            { id: 'gem_101', type: 'item', itemId: 'gem', x: 3, y: 3, sprite: '💎' },
            { id: 'gem_102', type: 'item', itemId: 'gem', x: 10, y: 3, sprite: '💎' },
            { id: 'gem_103', type: 'item', itemId: 'gem', x: 7, y: 7, sprite: '💎' },
            { id: 'gem_104', type: 'item', itemId: 'gem', x: 2, y: 5, sprite: '💎' },
            { id: 'gem_105', type: 'item', itemId: 'gem', x: 11, y: 5, sprite: '💎' },
            { id: 'candy_101', type: 'item', itemId: 'candy', x: 6, y: 2, sprite: '🍬' },
            { id: 'candy_102', type: 'item', itemId: 'candy', x: 8, y: 8, sprite: '🍬' },
            { id: 'npc_mocha', type: 'npc', x: 7, y: 5, sprite: '🐕', name: 'Mocha', dialog: [
                "Woof! You made it to Rainbow Bridge!",
                "This place is magical! 🌈",
                "Keep exploring, friend!"
            ]}
        ],
        playerStart: { x: 1, y: 5 },
        quests: [
            { id: 'collect_5_gems', title: 'Rainbow Gems', desc: 'Collect 5 gems', type: 'collect', target: 'gem', amount: 5 }
        ],
        exitPoint: { x: 12, y: 5, nextMap: null }
    }
};

// ==================== Utility Functions ====================
function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
}

// ==================== Inventory System ====================
class InventorySystem {
    constructor(maxSlots = 16) {
        this.items = {};
        this.maxSlots = maxSlots;
    }
    
    addItem(itemId, quantity = 1) {
        if (!itemId) return false;
        
        if (this.items[itemId]) {
            this.items[itemId] += quantity;
        } else {
            if (Object.keys(this.items).length >= this.maxSlots) {
                return false;
            }
            this.items[itemId] = quantity;
        }
        return true;
    }
    
    removeItem(itemId, quantity = 1) {
        if (!this.hasItem(itemId, quantity)) return false;
        
        this.items[itemId] -= quantity;
        if (this.items[itemId] <= 0) {
            delete this.items[itemId];
        }
        return true;
    }
    
    hasItem(itemId, quantity = 1) {
        return (this.items[itemId] || 0) >= quantity;
    }
    
    getCount(itemId) {
        return this.items[itemId] || 0;
    }
    
    getAll() {
        return { ...this.items };
    }
    
    clear() {
        this.items = {};
    }
    
    toJSON() {
        return { items: this.items };
    }
    
    fromJSON(data) {
        if (data && data.items) {
            this.items = { ...data.items };
        }
    }
}

// ==================== Quest Manager ====================
class QuestManager {
    constructor() {
        this.activeQuests = [];
        this.completedQuests = [];
    }
    
    loadQuests(quests) {
        if (!Array.isArray(quests)) return;
        
        this.activeQuests = quests.map(q => ({
            ...q,
            progress: 0,
            completed: false
        }));
    }
    
    updateProgress(type, target, amount = 1) {
        let completedQuest = null;
        
        this.activeQuests.forEach(quest => {
            if (quest.completed) return;
            if (quest.type === type && quest.target === target) {
                quest.progress = Math.min(quest.progress + amount, quest.amount);
                if (quest.progress >= quest.amount) {
                    quest.completed = true;
                    completedQuest = quest;
                }
            }
        });
        
        return completedQuest;
    }
    
    getActiveQuests() {
        return this.activeQuests.filter(q => !q.completed);
    }
    
    getAllQuests() {
        return this.activeQuests;
    }
    
    areAllComplete() {
        return this.activeQuests.length > 0 && 
               this.activeQuests.every(q => q.completed);
    }
    
    getCompletedCount() {
        return this.activeQuests.filter(q => q.completed).length;
    }
}

// ==================== Tile Map Engine ====================
class TileMapEngine {
    constructor(mapData, tileSize = KINGDOM_CONFIG.TILE_SIZE) {
        this.originalMap = mapData;
        this.map = deepClone(mapData);
        this.tileSize = tileSize;
        this.tileTypes = TILE_TYPES;
    }
    
    reset() {
        this.map = deepClone(this.originalMap);
    }
    
    getTile(x, y) {
        if (x < 0 || y < 0 || x >= this.map.width || y >= this.map.height) {
            return this.tileTypes.void;
        }
        const tileId = this.map.tiles[y][x];
        const typeName = this.map.tileTypes[tileId];
        return this.tileTypes[typeName] || this.tileTypes.void;
    }
    
    isWalkable(x, y) {
        const tile = this.getTile(x, y);
        return tile && tile.walkable;
    }
    
    getEntityAt(x, y) {
        if (!this.map.entities) return null;
        return this.map.entities.find(e => e.x === x && e.y === y);
    }
    
    removeEntity(entityId) {
        if (!this.map.entities) return;
        const index = this.map.entities.findIndex(e => e.id === entityId);
        if (index !== -1) {
            this.map.entities.splice(index, 1);
        }
    }
    
    getInteractableAt(x, y) {
        const directions = [
            { dx: 0, dy: -1 },
            { dx: 0, dy: 1 },
            { dx: -1, dy: 0 },
            { dx: 1, dy: 0 }
        ];
        
        for (const { dx, dy } of directions) {
            const entity = this.getEntityAt(x + dx, y + dy);
            if (entity && (entity.type === 'npc' || entity.interactive)) {
                return { entity, x: x + dx, y: y + dy };
            }
        }
        
        return null;
    }
    
    render(ctx, viewportX, viewportY, viewportWidth, viewportHeight) {
        const startTileX = Math.floor(viewportX / this.tileSize);
        const startTileY = Math.floor(viewportY / this.tileSize);
        const endTileX = Math.ceil((viewportX + viewportWidth) / this.tileSize);
        const endTileY = Math.ceil((viewportY + viewportHeight) / this.tileSize);
        
        ctx.font = `${this.tileSize * 0.8}px Arial`;
        ctx.textBaseline = 'middle';
        ctx.textAlign = 'center';
        
        // Draw tiles
        for (let y = startTileY; y <= endTileY; y++) {
            for (let x = startTileX; x <= endTileX; x++) {
                const tile = this.getTile(x, y);
                const screenX = Math.floor(x * this.tileSize - viewportX + this.tileSize / 2);
                const screenY = Math.floor(y * this.tileSize - viewportY + this.tileSize / 2);
                
                // Draw background color
                if (tile.color) {
                    ctx.fillStyle = tile.color;
                    ctx.fillRect(
                        screenX - this.tileSize / 2,
                        screenY - this.tileSize / 2,
                        this.tileSize,
                        this.tileSize
                    );
                }
                
                // Draw sprite
                if (tile.sprite && tile.sprite !== '░') {
                    ctx.fillText(tile.sprite, screenX, screenY);
                }
            }
        }
        
        // Draw entities
        if (this.map.entities) {
            for (const entity of this.map.entities) {
                const screenX = Math.floor(entity.x * this.tileSize - viewportX + this.tileSize / 2);
                const screenY = Math.floor(entity.y * this.tileSize - viewportY + this.tileSize / 2);
                
                // Check if visible
                if (screenX < -this.tileSize || screenX > viewportWidth + this.tileSize ||
                    screenY < -this.tileSize || screenY > viewportHeight + this.tileSize) {
                    continue;
                }
                
                ctx.fillText(entity.sprite || '❓', screenX, screenY);
            }
        }
        
        // Draw exit point indicator
        if (this.map.exitPoint) {
            const ep = this.map.exitPoint;
            const screenX = Math.floor(ep.x * this.tileSize - viewportX + this.tileSize / 2);
            const screenY = Math.floor(ep.y * this.tileSize - viewportY + this.tileSize / 2);
            
            ctx.fillStyle = 'rgba(255, 215, 0, 0.3)';
            ctx.fillRect(
                screenX - this.tileSize / 2,
                screenY - this.tileSize / 2,
                this.tileSize,
                this.tileSize
            );
            ctx.fillStyle = '#000';
            ctx.fillText('🚪', screenX, screenY);
        }
    }
}

// ==================== Player Controller ====================
class PlayerController {
    constructor(tileMap, startX, startY) {
        this.tileMap = tileMap;
        this.x = startX;
        this.y = startY;
        this.moving = false;
        this.moveSpeed = KINGDOM_CONFIG.PLAYER_MOVE_SPEED;
        this.sprite = '🐰';
        this.steps = 0;
    }
    
    move(direction) {
        if (this.moving) return { success: false };
        
        const delta = {
            up: { dx: 0, dy: -1 },
            down: { dx: 0, dy: 1 },
            left: { dx: -1, dy: 0 },
            right: { dx: 1, dy: 0 }
        }[direction];
        
        if (!delta) return { success: false };
        
        const newX = this.x + delta.dx;
        const newY = this.y + delta.dy;
        
        if (this.tileMap.isWalkable(newX, newY)) {
            this.moving = true;
            this.x = newX;
            this.y = newY;
            this.steps++;
            
            const result = this.checkTileInteraction();
            
            setTimeout(() => { this.moving = false; }, this.moveSpeed);
            
            return { success: true, ...result };
        }
        
        return { success: false };
    }
    
    checkTileInteraction() {
        const entity = this.tileMap.getEntityAt(this.x, this.y);
        
        if (entity && entity.type === 'item') {
            this.tileMap.removeEntity(entity.id);
            return { type: 'pickup', entity };
        }
        
        return { type: 'move' };
    }
    
    canInteract() {
        return this.tileMap.getInteractableAt(this.x, this.y) !== null;
    }
    
    interact() {
        return this.tileMap.getInteractableAt(this.x, this.y);
    }
    
    isAtExit() {
        const exit = this.tileMap.map.exitPoint;
        return exit && this.x === exit.x && this.y === exit.y;
    }
    
    render(ctx, viewportX, viewportY) {
        const screenX = Math.floor(this.x * this.tileMap.tileSize - viewportX + this.tileMap.tileSize / 2);
        const screenY = Math.floor(this.y * this.tileMap.tileSize - viewportY + this.tileMap.tileSize / 2);
        
        ctx.font = `${this.tileMap.tileSize * 0.9}px Arial`;
        ctx.textBaseline = 'middle';
        ctx.textAlign = 'center';
        ctx.fillText(this.sprite, screenX, screenY);
    }
}

// ==================== Camera System ====================
class Camera {
    constructor(viewportWidth, viewportHeight, tileSize) {
        this.viewportWidth = viewportWidth;
        this.viewportHeight = viewportHeight;
        this.tileSize = tileSize;
        this.x = 0;
        this.y = 0;
    }
    
    follow(targetX, targetY, mapWidth, mapHeight) {
        const targetPixelX = targetX * this.tileSize + this.tileSize / 2;
        const targetPixelY = targetY * this.tileSize + this.tileSize / 2;
        
        this.x = targetPixelX - this.viewportWidth / 2;
        this.y = targetPixelY - this.viewportHeight / 2;
        
        // Clamp to map bounds
        const maxX = mapWidth * this.tileSize - this.viewportWidth;
        const maxY = mapHeight * this.tileSize - this.viewportHeight;
        
        this.x = clamp(this.x, 0, Math.max(0, maxX));
        this.y = clamp(this.y, 0, Math.max(0, maxY));
        
        // Round to prevent jitter
        this.x = Math.floor(this.x);
        this.y = Math.floor(this.y);
    }
}

// ==================== Dialog System ====================
class DialogSystem {
    constructor() {
        this.active = false;
        this.messages = [];
        this.currentIndex = 0;
        this.speaker = '';
        this.onComplete = null;
        
        this.dialogBox = document.getElementById('dialog-box');
        this.speakerEl = document.getElementById('dialog-speaker');
        this.textEl = document.getElementById('dialog-text');
    }
    
    show(speaker, messages, onComplete = null) {
        if (!Array.isArray(messages) || messages.length === 0) return;
        
        this.speaker = speaker;
        this.messages = messages;
        this.currentIndex = 0;
        this.onComplete = onComplete;
        this.active = true;
        
        this.renderCurrent();
        this.dialogBox?.classList.remove('hidden');
    }
    
    renderCurrent() {
        if (this.speakerEl) {
            this.speakerEl.textContent = this.speaker;
        }
        if (this.textEl) {
            this.textEl.textContent = this.messages[this.currentIndex];
        }
    }
    
    advance() {
        if (!this.active) return false;
        
        this.currentIndex++;
        
        if (this.currentIndex >= this.messages.length) {
            this.hide();
            if (this.onComplete) {
                this.onComplete();
            }
            return true;
        }
        
        this.renderCurrent();
        return true;
    }
    
    hide() {
        this.active = false;
        this.dialogBox?.classList.add('hidden');
    }
}

// ==================== Main Game Class ====================
class CloudKingdomGame {
    constructor() {
        // Audio system - safely initialize
        this.audio = typeof gameAudio !== 'undefined' ? gameAudio : null;
        this.musicEnabled = true;
        this.sfxEnabled = true;
        
        // Game state
        this.difficulty = 1;
        this.isPlaying = false;
        this.isPaused = false;
        this.currentMapId = 'starter_island';
        this.startTime = 0;
        this.totalGems = 0;
        
        // Components
        this.tileMap = null;
        this.player = null;
        this.camera = null;
        this.inventory = new InventorySystem();
        this.questManager = new QuestManager();
        this.dialogSystem = new DialogSystem();
        
        // Canvas
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas?.getContext('2d');
        
        // DOM elements
        this.screens = {
            start: document.getElementById('start-screen'),
            game: document.getElementById('game-screen'),
            result: document.getElementById('result-screen')
        };
        
        this.elements = this.initElements();
        this.keysPressed = new Set();
        
        this.init();
    }
    
    initElements() {
        const getElement = (id) => document.getElementById(id);
        
        return {
            ageSelect: getElement('age-select'),
            startBtn: getElement('start-btn'),
            continueBtn: getElement('continue-btn'),
            totalGems: getElement('total-gems'),
            areasDiscovered: getElement('areas-discovered'),
            questsCompleted: getElement('quests-completed'),
            menuBtn: getElement('menu-btn'),
            areaName: getElement('area-name'),
            gemCount: getElement('gem-count'),
            keyCount: getElement('key-count'),
            currentQuest: getElement('current-quest'),
            interactionPrompt: getElement('interaction-prompt'),
            inventoryBtn: getElement('inventory-btn'),
            questBtn: getElement('quest-btn'),
            inventoryModal: getElement('inventory-modal'),
            questModal: getElement('quest-modal'),
            pauseModal: getElement('pause-modal'),
            inventoryGrid: getElement('inventory-grid'),
            itemDescription: getElement('item-description'),
            questList: getElement('quest-list'),
            closeInventory: getElement('close-inventory'),
            closeQuests: getElement('close-quests'),
            resumeBtn: getElement('resume-btn'),
            saveBtn: getElement('save-btn'),
            quitBtn: getElement('quit-btn'),
            interactBtn: getElement('interact-btn'),
            nextAreaBtn: getElement('next-area-btn'),
            replayBtn: getElement('replay-btn'),
            homeBtn: getElement('home-btn'),
            resultTitle: getElement('result-title'),
            resultGems: getElement('result-gems'),
            resultTime: getElement('result-time'),
            resultSteps: getElement('result-steps'),
            resultStars: getElement('result-stars')
        };
    }
    
    init() {
        this.setupCanvas();
        this.setupEventListeners();
        this.loadProgress();
        this.updateStartScreen();
    }
    
    setupCanvas() {
        if (!this.canvas || !this.ctx) return;
        
        const container = this.canvas.parentElement;
        if (!container) return;
        
        const resize = () => {
            const rect = container.getBoundingClientRect();
            const width = Math.floor(rect.width);
            const height = Math.floor(rect.height);
            
            this.canvas.width = width;
            this.canvas.height = height;
            
            if (this.camera) {
                this.camera.viewportWidth = width;
                this.camera.viewportHeight = height;
            }
        };
        
        resize();
        window.addEventListener('resize', resize);
    }
    
    setupEventListeners() {
        // Start screen
        this.elements.startBtn?.addEventListener('click', () => this.startGame());
        this.elements.continueBtn?.addEventListener('click', () => this.continueGame());
        
        // Game controls
        this.elements.menuBtn?.addEventListener('click', () => this.togglePause());
        this.elements.inventoryBtn?.addEventListener('click', () => this.showInventory());
        this.elements.questBtn?.addEventListener('click', () => this.showQuests());
        
        // Modal buttons
        this.elements.closeInventory?.addEventListener('click', () => this.hideInventory());
        this.elements.closeQuests?.addEventListener('click', () => this.hideQuests());
        this.elements.resumeBtn?.addEventListener('click', () => this.togglePause());
        this.elements.saveBtn?.addEventListener('click', () => this.saveGame());
        this.elements.quitBtn?.addEventListener('click', () => this.quitToMenu());
        
        // Result screen
        this.elements.nextAreaBtn?.addEventListener('click', () => this.nextArea());
        this.elements.replayBtn?.addEventListener('click', () => this.replayArea());
        this.elements.homeBtn?.addEventListener('click', () => this.goHome());
        
        // Keyboard input
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
        document.addEventListener('keyup', (e) => this.handleKeyUp(e));
        
        // D-Pad with hold-to-move support
        let moveInterval = null;
        const startMove = (dir) => {
            this.handleMove(dir);
            clearInterval(moveInterval);
            moveInterval = setInterval(() => this.handleMove(dir), 180);
        };
        const stopMove = () => {
            clearInterval(moveInterval);
            moveInterval = null;
        };
        
        document.querySelectorAll('.dpad-btn[data-dir]').forEach(btn => {
            const dir = btn.dataset.dir;
            btn.addEventListener('touchstart', (e) => { e.preventDefault(); startMove(dir); });
            btn.addEventListener('touchend', stopMove);
            btn.addEventListener('touchcancel', stopMove);
            btn.addEventListener('mousedown', () => startMove(dir));
            btn.addEventListener('mouseup', stopMove);
            btn.addEventListener('mouseleave', stopMove);
        });
        
        this.elements.interactBtn?.addEventListener('click', () => this.handleInteract());
    }
    
    handleKeyDown(e) {
        if (!this.isPlaying || this.isPaused) {
            if (e.key === 'Escape' && this.isPaused) {
                this.togglePause();
            }
            return;
        }
        
        // Dialog active - only allow space
        if (this.dialogSystem.active) {
            if (e.key === ' ' || e.key === 'Enter') {
                e.preventDefault();
                this.dialogSystem.advance();
            }
            return;
        }
        
        // Movement
        const moveKeys = {
            'ArrowUp': 'up', 'w': 'up', 'W': 'up',
            'ArrowDown': 'down', 's': 'down', 'S': 'down',
            'ArrowLeft': 'left', 'a': 'left', 'A': 'left',
            'ArrowRight': 'right', 'd': 'right', 'D': 'right'
        };
        
        if (moveKeys[e.key]) {
            e.preventDefault();
            this.handleMove(moveKeys[e.key]);
        }
        
        // Interact
        if (e.key === ' ' || e.key === 'Enter') {
            e.preventDefault();
            this.handleInteract();
        }
        
        // Escape - pause
        if (e.key === 'Escape') {
            this.togglePause();
        }
        
        // I - inventory
        if (e.key === 'i' || e.key === 'I') {
            this.showInventory();
        }
        
        // Q - quests
        if (e.key === 'q' || e.key === 'Q') {
            this.showQuests();
        }
    }
    
    handleKeyUp(e) {
        this.keysPressed.delete(e.key);
    }
    
    handleMove(direction) {
        if (!this.player || this.dialogSystem.active) return;
        
        const result = this.player.move(direction);
        
        if (result.success) {
            this.playSound('move');
            // Update camera
            this.camera?.follow(
                this.player.x,
                this.player.y,
                this.tileMap.map.width,
                this.tileMap.map.height
            );
            
            // Handle pickup
            if (result.type === 'pickup' && result.entity) {
                this.handlePickup(result.entity);
            }
            
            // Check for exit
            if (this.player.isAtExit() && this.questManager.areAllComplete()) {
                this.completeArea();
            }
            
            // Update interaction prompt
            this.updateInteractionPrompt();
            
            this.render();
        }
    }
    
    handleInteract() {
        if (!this.player || this.dialogSystem.active) return;
        
        // Check for exit - show feedback if locked
        if (this.player.isAtExit()) {
            if (this.questManager.areAllComplete()) {
                this.completeArea();
                return;
            } else {
                this.showToast('Complete all quests first! 📋');
                this.playSound('error');
                return;
            }
        }
        
        const interactable = this.player.interact();
        
        if (interactable?.entity?.type === 'npc') {
            const npc = interactable.entity;
            this.playSound('click');
            this.dialogSystem.show(npc.name, npc.dialog);
        }
    }
    
    handlePickup(entity) {
        if (!entity || !entity.itemId) return;
        
        this.inventory.addItem(entity.itemId, 1);
        this.playSound('pickup');
        this.updateHUD();
        
        // Update quests
        const completedQuest = this.questManager.updateProgress('collect', entity.itemId, 1);
        
        if (completedQuest) {
            this.playSound('success');
            this.showToast(`Quest Complete: ${completedQuest.title} ⭐`);
        } else {
            const itemInfo = KINGDOM_CONFIG.ITEMS[entity.itemId];
            // Show quest progress if collecting for an active quest
            const relatedQuest = this.questManager.getActiveQuests().find(
                q => q.type === 'collect' && q.target === entity.itemId
            );
            if (relatedQuest) {
                this.showToast(`${itemInfo?.icon || ''} ${relatedQuest.progress}/${relatedQuest.amount} ${itemInfo?.name || entity.itemId}`);
            } else {
                this.showToast(`Got ${itemInfo?.name || entity.itemId}! ${itemInfo?.icon || ''}`);
            }
        }
        
        // Track gems
        if (entity.itemId === 'gem') {
            this.totalGems++;
        }
    }
    
    updateInteractionPrompt() {
        if (!this.elements.interactionPrompt || !this.player) return;
        
        const canInteract = this.player.canInteract();
        const atExit = this.player.isAtExit();
        const questsComplete = this.questManager.areAllComplete();
        
        if (atExit && !questsComplete) {
            // At exit but quests incomplete - show locked message
            this.elements.interactionPrompt.classList.remove('hidden');
            this.elements.interactionPrompt.textContent = '🔒 Complete quests to unlock exit';
        } else if (canInteract || (atExit && questsComplete)) {
            // Can interact with NPC or exit is unlocked
            this.elements.interactionPrompt.classList.remove('hidden');
            this.elements.interactionPrompt.textContent = (atExit && questsComplete) ? 
                'Press SPACE to continue' : 'Press SPACE to interact';
        } else {
            this.elements.interactionPrompt.classList.add('hidden');
        }
    }
    
    showToast(message) {
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;
        document.querySelector('.game-container')?.appendChild(toast);
        
        setTimeout(() => toast.remove(), 2500);
    }
    
    showScreen(screenName) {
        Object.values(this.screens).forEach(screen => {
            if (screen) screen.classList.remove('active');
        });
        if (this.screens[screenName]) {
            this.screens[screenName].classList.add('active');
        }
    }
    
    updateStartScreen() {
        const progress = this.loadProgress();
        
        if (this.elements.totalGems) {
            this.elements.totalGems.textContent = progress.totalGems || 0;
        }
        if (this.elements.areasDiscovered) {
            this.elements.areasDiscovered.textContent = progress.areasCompleted?.length || 0;
        }
        if (this.elements.questsCompleted) {
            this.elements.questsCompleted.textContent = progress.questsCompleted || 0;
        }
        
        // Show continue button if there's a saved game
        if (progress.currentMap && this.elements.continueBtn) {
            this.elements.continueBtn.classList.remove('hidden');
        }
    }
    
    startGame(mapId = 'starter_island') {
        // Stop any existing music first to prevent duplicates
        if (this.audio) {
            try {
                this.audio.stopMusic();
            } catch (e) {}
        }
        
        // Start background music with defensive programming
        if (this.audio && this.musicEnabled) {
            try {
                this.audio.ensureReady();
                this.audio.playMusic('adventure');
            } catch (e) {
                console.warn('Audio not available:', e);
            }
        }
        
        // Get difficulty from age selector or PlayerManager
        let age = 16;
        if (this.elements.ageSelect) {
            age = parseInt(this.elements.ageSelect.value, 10) || 16;
        } else if (typeof PlayerManager !== 'undefined' && PlayerManager.hasActivePlayer()) {
            age = PlayerManager.getPlayerAge() || 16;
        }
        this.difficulty = getDifficultyFromAge(age);
        console.log(`Starting game with age ${age}, difficulty ${this.difficulty}`);
        
        this.currentMapId = mapId;
        this.loadMap(mapId);
        
        this.startTime = Date.now();
        this.isPlaying = true;
        this.isPaused = false;
        
        this.showScreen('game');
        this.render();
        this.gameLoop();
    }
    
    continueGame() {
        const progress = this.loadProgress();
        if (progress.currentMap) {
            this.currentMapId = progress.currentMap;
            this.inventory.fromJSON(progress.inventory || {});
            this.totalGems = progress.totalGems || 0;
        }
        this.startGame(this.currentMapId);
    }
    
    loadMap(mapId) {
        const mapData = MAPS[mapId];
        if (!mapData) {
            console.error('Map not found:', mapId);
            return;
        }
        
        this.tileMap = new TileMapEngine(mapData);
        
        this.player = new PlayerController(
            this.tileMap,
            mapData.playerStart.x,
            mapData.playerStart.y
        );
        
        this.camera = new Camera(
            this.canvas?.width || 480,
            this.canvas?.height || 400,
            KINGDOM_CONFIG.TILE_SIZE
        );
        
        this.camera.follow(
            this.player.x,
            this.player.y,
            mapData.width,
            mapData.height
        );
        
        this.questManager.loadQuests(mapData.quests || []);
        
        // Update HUD
        if (this.elements.areaName) {
            this.elements.areaName.textContent = mapData.name;
        }
        this.updateHUD();
        this.updateQuestDisplay();
    }
    
    updateHUD() {
        if (this.elements.gemCount) {
            this.elements.gemCount.textContent = `💎 ${this.inventory.getCount('gem')}`;
        }
        if (this.elements.keyCount) {
            this.elements.keyCount.textContent = `🗝️ ${this.inventory.getCount('golden_key')}`;
        }
    }
    
    updateQuestDisplay() {
        const activeQuests = this.questManager.getActiveQuests();
        if (this.elements.currentQuest && activeQuests.length > 0) {
            const quest = activeQuests[0];
            this.elements.currentQuest.textContent = `${quest.title}: ${quest.progress}/${quest.amount}`;
        } else if (this.elements.currentQuest) {
            this.elements.currentQuest.textContent = this.questManager.areAllComplete() ? 
                'Find the exit! 🚪' : 'Explore the area!';
        }
    }
    
    render() {
        if (!this.ctx || !this.canvas) return;
        
        // Clear canvas
        this.ctx.fillStyle = '#87ceeb';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        if (!this.tileMap || !this.player || !this.camera) return;
        
        // Render map
        this.tileMap.render(
            this.ctx,
            this.camera.x,
            this.camera.y,
            this.canvas.width,
            this.canvas.height
        );
        
        // Render player
        this.player.render(this.ctx, this.camera.x, this.camera.y);
    }
    
    gameLoop() {
        if (!this.isPlaying) return;
        
        this.updateQuestDisplay();
        this.render();
        
        requestAnimationFrame(() => this.gameLoop());
    }
    
    togglePause() {
        this.isPaused = !this.isPaused;
        this.elements.pauseModal?.classList.toggle('hidden', !this.isPaused);
    }
    
    showInventory() {
        this.renderInventory();
        this.elements.inventoryModal?.classList.remove('hidden');
    }
    
    hideInventory() {
        this.elements.inventoryModal?.classList.add('hidden');
    }
    
    renderInventory() {
        if (!this.elements.inventoryGrid) return;
        
        this.elements.inventoryGrid.innerHTML = '';
        const items = this.inventory.getAll();
        
        // Render filled slots
        for (const [itemId, count] of Object.entries(items)) {
            const itemInfo = KINGDOM_CONFIG.ITEMS[itemId];
            const slot = document.createElement('div');
            slot.className = 'inventory-slot filled';
            slot.innerHTML = `
                <span class="item-icon">${itemInfo?.icon || '❓'}</span>
                <span class="item-count">x${count}</span>
            `;
            slot.addEventListener('click', () => {
                if (this.elements.itemDescription) {
                    this.elements.itemDescription.textContent = itemInfo?.name || itemId;
                }
            });
            this.elements.inventoryGrid.appendChild(slot);
        }
        
        // Fill remaining slots
        const remaining = 16 - Object.keys(items).length;
        for (let i = 0; i < remaining; i++) {
            const slot = document.createElement('div');
            slot.className = 'inventory-slot';
            this.elements.inventoryGrid.appendChild(slot);
        }
    }
    
    showQuests() {
        this.renderQuests();
        this.elements.questModal?.classList.remove('hidden');
    }
    
    hideQuests() {
        this.elements.questModal?.classList.add('hidden');
    }
    
    renderQuests() {
        if (!this.elements.questList) return;
        
        const quests = this.questManager.getAllQuests();
        this.elements.questList.innerHTML = '';
        
        if (quests.length === 0) {
            this.elements.questList.innerHTML = '<p>No active quests</p>';
            return;
        }
        
        quests.forEach(quest => {
            const questEl = document.createElement('div');
            questEl.className = `quest-item ${quest.completed ? 'completed' : ''}`;
            questEl.innerHTML = `
                <span class="quest-status">${quest.completed ? '✅' : '📋'}</span>
                <div class="quest-info">
                    <div class="quest-title">${quest.title}</div>
                    <div class="quest-desc">${quest.desc}</div>
                    <div class="quest-progress">${quest.progress}/${quest.amount}</div>
                </div>
            `;
            this.elements.questList.appendChild(questEl);
        });
    }
    
    completeArea() {
        this.isPlaying = false;
        
        const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
        const minutes = Math.floor(elapsed / 60);
        const seconds = elapsed % 60;
        
        // Calculate stars
        const gems = this.inventory.getCount('gem');
        let stars = 1;
        if (gems >= 3) stars = 2;
        if (gems >= 5) stars = 3;
        
        // Update result screen
        if (this.elements.resultGems) {
            this.elements.resultGems.textContent = gems;
        }
        if (this.elements.resultTime) {
            this.elements.resultTime.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        }
        if (this.elements.resultSteps) {
            this.elements.resultSteps.textContent = this.player?.steps || 0;
        }
        
        if (this.elements.resultStars) {
            const starEls = this.elements.resultStars.querySelectorAll('.star');
            starEls.forEach((star, index) => {
                setTimeout(() => {
                    star.classList.toggle('earned', index < stars);
                }, index * 300);
            });
        }
        
        // Check for next area
        const nextMap = this.tileMap?.map.exitPoint?.nextMap;
        if (this.elements.nextAreaBtn) {
            this.elements.nextAreaBtn.classList.toggle('hidden', !nextMap);
        }
        
        // Save progress
        this.saveProgress(nextMap);
        
        this.showScreen('result');
    }
    
    nextArea() {
        const nextMap = this.tileMap?.map.exitPoint?.nextMap;
        if (nextMap) {
            this.startGame(nextMap);
        }
    }
    
    replayArea() {
        this.inventory.clear();
        this.startGame(this.currentMapId);
    }
    
    quitToMenu() {
        // Stop music when quitting
        if (this.audio) {
            try {
                this.audio.stopMusic();
            } catch (e) {
                console.warn('Audio stop failed:', e);
            }
        }
        
        this.isPlaying = false;
        this.isPaused = false;
        this.elements.pauseModal?.classList.add('hidden');
        this.updateStartScreen();
        this.showScreen('start');
    }
    
    goHome() {
        // Stop music when going home
        if (this.audio) {
            try {
                this.audio.stopMusic();
            } catch (e) {
                console.warn('Audio stop failed:', e);
            }
        }
        
        this.updateStartScreen();
        this.showScreen('start');
    }
    
    /**
     * Helper method to play sound effects with defensive programming
     * @param {string} type - Type of sound effect
     */
    playSound(type) {
        if (this.audio && this.sfxEnabled) {
            try {
                this.audio.playSFX(type);
            } catch (e) {
                console.warn('Sound effect failed:', e);
            }
        }
    }
    
    saveGame() {
        this.saveProgress();
        this.showToast('Game Saved! 💾');
    }
    
    saveProgress(nextMap = null) {
        try {
            const existing = this.loadProgress();
            
            const progress = {
                totalGems: (existing.totalGems || 0) + this.inventory.getCount('gem'),
                questsCompleted: (existing.questsCompleted || 0) + this.questManager.getCompletedCount(),
                areasCompleted: [...(existing.areasCompleted || [])],
                currentMap: nextMap || this.currentMapId,
                inventory: this.inventory.toJSON()
            };
            
            if (!progress.areasCompleted.includes(this.currentMapId)) {
                progress.areasCompleted.push(this.currentMapId);
            }
            
            localStorage.setItem(KINGDOM_CONFIG.LEADERBOARD_KEY, JSON.stringify(progress));
        } catch (e) {
            console.warn('Could not save progress:', e);
        }
    }
    
    loadProgress() {
        try {
            const stored = localStorage.getItem(KINGDOM_CONFIG.LEADERBOARD_KEY);
            return stored ? JSON.parse(stored) : {};
        } catch (e) {
            return {};
        }
    }
}

// ==================== Initialize Game ====================
document.addEventListener('DOMContentLoaded', () => {
    try {
        window.game = new CloudKingdomGame();
    } catch (error) {
        console.error('Failed to initialize Cloud Kingdom game:', error);
    }
});
