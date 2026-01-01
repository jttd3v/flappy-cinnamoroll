/**
 * Cinnamoroll's Candy Shop - Main Game Logic
 * A shop simulation game teaching math and money skills
 * 
 * @version 1.0.0
 */

// ==================== Configuration (inlined for file:// compatibility) ====================
const CANDY_ITEMS = [
  { id: 'lollipop', name: 'Lollipop', icon: '🍭', price: 0.50, cost: 0.20 },
  { id: 'chocolate', name: 'Chocolate', icon: '🍫', price: 2.00, cost: 0.80 },
  { id: 'gummy', name: 'Gummy Bears', icon: '🐻', price: 1.50, cost: 0.60 },
  { id: 'candy', name: 'Hard Candy', icon: '🍬', price: 0.25, cost: 0.10 },
  { id: 'cookie', name: 'Cookie', icon: '🍪', price: 1.00, cost: 0.40 },
  { id: 'cake', name: 'Cupcake', icon: '🧁', price: 3.00, cost: 1.20 },
  { id: 'icecream', name: 'Ice Cream', icon: '🍦', price: 2.50, cost: 1.00 },
  { id: 'donut', name: 'Donut', icon: '🍩', price: 1.50, cost: 0.50 }
];

const SHOP_CONFIG = Object.freeze({
  STARTING_MONEY: 20.00,
  CUSTOMERS_PER_DAY: 10,
  TIP_MULTIPLIER: 0.15,
  
  DIFFICULTY_SETTINGS: {
    1: { maxItems: 1, maxQuantity: 5, exactChange: true, discount: false, tax: false },
    2: { maxItems: 2, maxQuantity: 3, exactChange: false, discount: false, tax: false },
    3: { maxItems: 2, maxQuantity: 3, exactChange: false, discount: false, tax: false },
    4: { maxItems: 3, maxQuantity: 4, exactChange: false, discount: false, tax: false },
    5: { maxItems: 3, maxQuantity: 4, exactChange: false, discount: true, tax: false },
    6: { maxItems: 4, maxQuantity: 5, exactChange: false, discount: true, tax: true },
    7: { maxItems: 5, maxQuantity: 5, exactChange: false, discount: true, tax: true }
  },
  
  TAX_RATE: 0.08,
  
  LEADERBOARD_KEY: 'candyShopLeaderboard'
});

function getDifficultyFromAge(age) {
  if (age <= 8) return 1;
  if (age <= 10) return 2;
  if (age <= 12) return 3;
  if (age <= 15) return 4;
  if (age <= 18) return 5;
  if (age <= 25) return 6;
  return 7;
}

// ==================== Constants ====================
const CUSTOMERS = [
    { name: 'Mocha', icon: '🐶', patience: 'high' },
    { name: 'Chiffon', icon: '🐱', patience: 'medium' },
    { name: 'Espresso', icon: '🐰', patience: 'high' },
    { name: 'Milk', icon: '🐼', patience: 'low' },
    { name: 'Cappuccino', icon: '🦊', patience: 'medium' },
    { name: 'Latte', icon: '🐻', patience: 'high' }
];

const MESSAGES = {
    greetings: [
        "Hi! I'd like",
        "Hello! Can I get",
        "Excuse me! I want",
        "Good day! Please give me"
    ],
    correct: [
        "Perfect! Thank you! 🎉",
        "Exactly right! You're great! ✨",
        "Wonderful service! 💖",
        "That's correct! Amazing! 🌟"
    ],
    wrong: [
        "Hmm, that's not right... 😕",
        "I think there's a mistake... 🤔",
        "Could you try again? 😅",
        "Oops, that doesn't seem right... 😓"
    ]
};

// ==================== Utility Classes ====================
class CurrencyUtils {
    /**
     * Formats a number as currency string
     * @param {number} amount - Amount to format
     * @returns {string} Formatted currency string
     */
    static format(amount) {
        if (typeof amount !== 'number' || isNaN(amount)) {
            return '$0.00';
        }
        return '$' + Math.abs(amount).toFixed(2);
    }
    
    /**
     * Calculates change avoiding floating point errors
     * @param {number} paid - Amount paid
     * @param {number} total - Total cost
     * @returns {number} Change amount
     */
    static calculateChange(paid, total) {
        const paidCents = Math.round((paid || 0) * 100);
        const totalCents = Math.round((total || 0) * 100);
        return (paidCents - totalCents) / 100;
    }
    
    /**
     * Rounds to two decimal places safely
     * @param {number} amount - Amount to round
     * @returns {number} Rounded amount
     */
    static round(amount) {
        return Math.round((amount || 0) * 100) / 100;
    }
    
    /**
     * Generates a payment amount that makes sense for the total
     * @param {number} total - Order total
     * @returns {number} Payment amount
     */
    static generatePayment(total) {
        if (!total || total <= 0) return 1;
        
        const roundedUp = Math.ceil(total);
        const options = [roundedUp];
        
        // Add nice round numbers above total
        if (total <= 5) options.push(5);
        if (total <= 10) options.push(10);
        if (total <= 20) options.push(20);
        
        // Filter to only amounts >= total and pick one
        const validOptions = options.filter(opt => opt >= total);
        return validOptions[Math.floor(Math.random() * validOptions.length)] || roundedUp;
    }
}

class MathUtils {
    /**
     * Returns a random element from an array
     * @param {Array} array - Source array
     * @returns {*} Random element
     */
    static randomPick(array) {
        if (!Array.isArray(array) || array.length === 0) return null;
        return array[Math.floor(Math.random() * array.length)];
    }
    
    /**
     * Returns a random integer between min and max (inclusive)
     * @param {number} min - Minimum value
     * @param {number} max - Maximum value
     * @returns {number} Random integer
     */
    static randomInt(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    
    /**
     * Shuffles an array in place
     * @param {Array} array - Array to shuffle
     * @returns {Array} Shuffled array
     */
    static shuffle(array) {
        if (!Array.isArray(array)) return [];
        const result = [...array];
        for (let i = result.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [result[i], result[j]] = [result[j], result[i]];
        }
        return result;
    }
}

// ==================== Order Processor ====================
class OrderProcessor {
    constructor(taxRate = 0) {
        this.taxRate = taxRate;
    }
    
    /**
     * Calculates subtotal for items
     * @param {Array} items - Array of {item, quantity} objects
     * @returns {number} Subtotal
     */
    calculateSubtotal(items) {
        if (!Array.isArray(items)) return 0;
        return items.reduce((sum, entry) => {
            const price = entry?.item?.price || 0;
            const quantity = entry?.quantity || 0;
            return sum + (price * quantity);
        }, 0);
    }
    
    /**
     * Applies discount to amount
     * @param {number} amount - Original amount
     * @param {Object|null} discount - Discount object {type, value}
     * @returns {number} Discounted amount
     */
    applyDiscount(amount, discount) {
        if (!discount || !amount) return amount || 0;
        
        if (discount.type === 'percent') {
            return amount * (1 - (discount.value || 0) / 100);
        }
        if (discount.type === 'fixed') {
            return Math.max(0, amount - (discount.value || 0));
        }
        return amount;
    }
    
    /**
     * Applies tax to amount
     * @param {number} amount - Amount before tax
     * @returns {number} Amount with tax
     */
    applyTax(amount) {
        return (amount || 0) * (1 + this.taxRate);
    }
    
    /**
     * Calculates total with optional discount and tax
     * @param {Array} items - Order items
     * @param {Object|null} discount - Optional discount
     * @param {boolean} includeTax - Whether to include tax
     * @returns {Object} Breakdown of costs
     */
    calculateTotal(items, discount = null, includeTax = false) {
        const subtotal = this.calculateSubtotal(items);
        const discountAmount = discount ? subtotal - this.applyDiscount(subtotal, discount) : 0;
        const afterDiscount = subtotal - discountAmount;
        const taxAmount = includeTax ? afterDiscount * this.taxRate : 0;
        const total = afterDiscount + taxAmount;
        
        return {
            subtotal: CurrencyUtils.round(subtotal),
            discountAmount: CurrencyUtils.round(discountAmount),
            taxAmount: CurrencyUtils.round(taxAmount),
            total: CurrencyUtils.round(total)
        };
    }
}

// ==================== Order Generator ====================
class OrderGenerator {
    constructor(difficulty) {
        this.difficulty = difficulty;
        this.settings = SHOP_CONFIG.DIFFICULTY_SETTINGS[difficulty] || SHOP_CONFIG.DIFFICULTY_SETTINGS[1];
    }
    
    /**
     * Generates a random customer order
     * @returns {Object} Order details
     */
    generate() {
        const customer = MathUtils.randomPick(CUSTOMERS);
        const items = this.generateItems();
        const discount = this.settings.discount ? this.generateDiscount() : null;
        
        return {
            customer,
            items,
            discount,
            useTax: this.settings.tax,
            exactChange: this.settings.exactChange
        };
    }
    
    /**
     * Generates random items for order
     * @returns {Array} Array of {item, quantity} objects
     */
    generateItems() {
        const itemCount = MathUtils.randomInt(1, this.settings.maxItems);
        const availableItems = MathUtils.shuffle([...CANDY_ITEMS]);
        const orderItems = [];
        
        for (let i = 0; i < itemCount && i < availableItems.length; i++) {
            const item = availableItems[i];
            const quantity = MathUtils.randomInt(1, this.settings.maxQuantity);
            orderItems.push({ item, quantity });
        }
        
        return orderItems;
    }
    
    /**
     * Generates a random discount
     * @returns {Object} Discount object
     */
    generateDiscount() {
        const discounts = [
            { type: 'percent', value: 10, display: '10% off!' },
            { type: 'percent', value: 15, display: '15% off!' },
            { type: 'percent', value: 20, display: '20% off!' },
            { type: 'percent', value: 25, display: '25% off!' }
        ];
        return MathUtils.randomPick(discounts);
    }
    
    /**
     * Builds order request text
     * @param {Array} items - Order items
     * @param {Object|null} discount - Optional discount
     * @returns {string} Order request string
     */
    buildOrderText(items, discount = null) {
        if (!items || items.length === 0) return "Just looking, thanks!";
        
        const greeting = MathUtils.randomPick(MESSAGES.greetings);
        const itemTexts = items.map(entry => {
            const qty = entry.quantity;
            const name = entry.item.name + (qty > 1 ? 's' : '');
            return `${qty} ${name}`;
        });
        
        let text = `${greeting} ${itemTexts.join(' and ')}, please!`;
        if (discount) {
            text += ` (${discount.display})`;
        }
        
        return text;
    }
}

// ==================== Main Game Class ====================
class CandyShopGame {
    constructor() {
        // Audio manager reference
        this.audio = typeof gameAudio !== 'undefined' ? gameAudio : null;
        this.musicEnabled = true;
        this.sfxEnabled = true;
        
        // Game state
        this.money = SHOP_CONFIG.STARTING_MONEY;
        this.tips = 0;
        this.day = 1;
        this.customerIndex = 0;
        this.customersPerDay = SHOP_CONFIG.CUSTOMERS_PER_DAY;
        this.difficulty = 1;
        this.isPlaying = false;
        this.correctOrders = 0;
        this.totalOrders = 0;
        
        // Current order state
        this.currentOrder = null;
        this.selectedItems = [];
        this.orderProcessor = null;
        this.awaitingChange = false;
        this.expectedChange = 0;
        this.paymentAmount = 0;
        
        // DOM elements
        this.screens = {
            start: document.getElementById('start-screen'),
            game: document.getElementById('game-screen'),
            result: document.getElementById('result-screen')
        };
        
        this.elements = this.initElements();
        this.init();
    }
    
    /**
     * Initializes DOM element references with null checks
     * @returns {Object} Element references
     */
    initElements() {
        const getElement = (id) => {
            const el = document.getElementById(id);
            if (!el) console.warn(`Element not found: ${id}`);
            return el;
        };
        
        return {
            ageSelect: getElement('age-select'),
            startBtn: getElement('start-btn'),
            highScoreValue: getElement('high-score-value'),
            dayDisplay: getElement('day-display'),
            moneyDisplay: getElement('money-display'),
            customerProgress: getElement('customer-progress'),
            satisfactionDisplay: getElement('satisfaction-display'),
            customerIcon: getElement('customer-icon'),
            orderText: getElement('order-text'),
            candyShelf: getElement('candy-shelf'),
            orderItems: getElement('order-items'),
            subtotalValue: getElement('subtotal-value'),
            discountRow: getElement('discount-row'),
            discountValue: getElement('discount-value'),
            taxRow: getElement('tax-row'),
            taxValue: getElement('tax-value'),
            totalValue: getElement('total-value'),
            paymentArea: getElement('payment-area'),
            paymentAmount: getElement('payment-amount'),
            changeInput: getElement('change-input'),
            submitChangeBtn: getElement('submit-change-btn'),
            clearBtn: getElement('clear-btn'),
            completeBtn: getElement('complete-btn'),
            feedbackOverlay: getElement('feedback-overlay'),
            feedbackIcon: getElement('feedback-icon'),
            feedbackText: getElement('feedback-text'),
            tipText: getElement('tip-text'),
            playAgainBtn: getElement('play-again-btn'),
            homeBtn: getElement('home-btn'),
            finalEarnings: getElement('final-earnings'),
            finalTips: getElement('final-tips'),
            customersServed: getElement('customers-served'),
            accuracyDisplay: getElement('accuracy-display'),
            starRating: getElement('star-rating'),
            newHighScore: getElement('new-high-score'),
            resultTitle: getElement('result-title')
        };
    }
    
    /**
     * Initializes the game
     */
    init() {
        this.loadHighScore();
        this.setupEventListeners();
        this.renderCandyShelf();
    }
    
    /**
     * Sets up all event listeners
     */
    setupEventListeners() {
        // Start screen - with explicit error handling
        if (this.elements.startBtn) {
            this.elements.startBtn.addEventListener('click', () => {
                console.log('Start button clicked');
                this.startGame();
            });
        } else {
            console.warn('Start button not found, attaching to DOM directly');
            const startBtn = document.getElementById('start-btn');
            if (startBtn) {
                startBtn.addEventListener('click', () => {
                    console.log('Start button clicked (fallback)');
                    this.startGame();
                });
            }
        }
        
        // Game controls
        this.elements.clearBtn?.addEventListener('click', () => this.clearOrder());
        this.elements.completeBtn?.addEventListener('click', () => this.completeOrder());
        this.elements.submitChangeBtn?.addEventListener('click', () => this.submitChange());
        
        // Change input - allow Enter key
        this.elements.changeInput?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.submitChange();
        });
        
        // Result screen
        this.elements.playAgainBtn?.addEventListener('click', () => this.startGame());
        this.elements.homeBtn?.addEventListener('click', () => this.goHome());
    }
    
    /**
     * Shows a specific screen
     * @param {string} screenName - Screen to show
     */
    showScreen(screenName) {
        Object.values(this.screens).forEach(screen => {
            if (screen) screen.classList.remove('active');
        });
        if (this.screens[screenName]) {
            this.screens[screenName].classList.add('active');
        }
    }
    
    /**
     * Loads high score from storage
     */
    loadHighScore() {
        try {
            const saved = localStorage.getItem(SHOP_CONFIG.LEADERBOARD_KEY);
            const highScore = saved ? parseFloat(saved) : 0;
            if (this.elements.highScoreValue) {
                this.elements.highScoreValue.textContent = highScore.toFixed(2);
            }
        } catch (e) {
            console.warn('Could not load high score:', e);
        }
    }
    
    /**
     * Saves high score to storage
     * @param {number} score - Score to save
     */
    saveHighScore(score) {
        try {
            const current = parseFloat(localStorage.getItem(SHOP_CONFIG.LEADERBOARD_KEY) || '0');
            if (score > current) {
                localStorage.setItem(SHOP_CONFIG.LEADERBOARD_KEY, score.toString());
                return true;
            }
        } catch (e) {
            console.warn('Could not save high score:', e);
        }
        return false;
    }
    
    /**
     * Renders the candy shelf with items
     */
    renderCandyShelf() {
        if (!this.elements.candyShelf) return;
        
        this.elements.candyShelf.innerHTML = '';
        
        CANDY_ITEMS.forEach((item, index) => {
            const itemEl = document.createElement('div');
            itemEl.className = 'candy-item';
            itemEl.dataset.index = index;
            itemEl.innerHTML = `
                <span class="candy-icon">${item.icon}</span>
                <span class="candy-name">${item.name}</span>
                <span class="candy-price">${CurrencyUtils.format(item.price)}</span>
            `;
            itemEl.addEventListener('click', () => this.addToOrder(index));
            this.elements.candyShelf.appendChild(itemEl);
        });
    }
    
    /**
     * Starts a new game
     */
    startGame() {
        console.log('startGame() called');
        
        // Initialize and start background music
        if (this.audio && this.musicEnabled) {
            try {
                this.audio.ensureReady();
                this.audio.playMusic('shop');
            } catch (e) {
                // Silently ignore audio errors
            }
        }
        
        // Get difficulty from PlayerManager age
        let age = 16;
        if (typeof PlayerManager !== 'undefined' && PlayerManager.hasActivePlayer()) {
            age = PlayerManager.getPlayerAge() || 16;
        }
        this.difficulty = getDifficultyFromAge(age);
        
        const settings = SHOP_CONFIG.DIFFICULTY_SETTINGS[this.difficulty];
        
        // Initialize order processor with tax rate if applicable
        const taxRate = settings.tax ? SHOP_CONFIG.TAX_RATE : 0;
        this.orderProcessor = new OrderProcessor(taxRate);
        
        // Reset game state
        this.money = SHOP_CONFIG.STARTING_MONEY;
        this.tips = 0;
        this.customerIndex = 0;
        this.correctOrders = 0;
        this.totalOrders = 0;
        this.isPlaying = true;
        
        // Update UI
        this.updateHeader();
        this.showScreen('game');
        
        // Generate first customer
        this.nextCustomer();
    }
    
    /**
     * Generates and displays next customer
     */
    nextCustomer() {
        if (this.customerIndex >= this.customersPerDay) {
            this.endDay();
            return;
        }
        
        // Generate order
        const generator = new OrderGenerator(this.difficulty);
        this.currentOrder = generator.generate();
        
        // Reset order state
        this.selectedItems = [];
        this.awaitingChange = false;
        this.expectedChange = 0;
        
        // Update UI
        this.renderCurrentOrder();
        this.updateOrderDisplay();
        this.updateHeader();
        
        // Show customer
        if (this.elements.customerIcon) {
            this.elements.customerIcon.textContent = this.currentOrder.customer.icon;
        }
        if (this.elements.orderText) {
            this.elements.orderText.textContent = generator.buildOrderText(
                this.currentOrder.items,
                this.currentOrder.discount
            );
        }
        
        // Hide payment area, show action buttons
        this.elements.paymentArea?.classList.add('hidden');
        this.elements.completeBtn?.removeAttribute('disabled');
        this.elements.clearBtn?.classList.remove('hidden');
        
        // Update progress dots
        this.updateProgressDots();
    }
    
    /**
     * Updates the progress dots display
     */
    updateProgressDots() {
        if (!this.elements.customerProgress) return;
        
        const dots = this.elements.customerProgress.querySelectorAll('.progress-dot');
        dots.forEach((dot, index) => {
            dot.classList.remove('filled', 'current');
            if (index < this.customerIndex) {
                dot.classList.add('filled');
            } else if (index === this.customerIndex) {
                dot.classList.add('current');
            }
        });
    }
    
    /**
     * Renders current order display
     */
    renderCurrentOrder() {
        if (!this.elements.orderItems) return;
        
        this.elements.orderItems.innerHTML = '';
        
        // Group selected items by id
        const grouped = this.selectedItems.reduce((acc, item) => {
            const existing = acc.find(e => e.item.id === item.id);
            if (existing) {
                existing.quantity++;
            } else {
                acc.push({ item, quantity: 1 });
            }
            return acc;
        }, []);
        
        grouped.forEach((entry, index) => {
            const itemEl = document.createElement('div');
            itemEl.className = 'order-item';
            itemEl.innerHTML = `
                <span>${entry.item.icon} x${entry.quantity}</span>
                <span class="remove-item" data-index="${index}">×</span>
            `;
            
            itemEl.querySelector('.remove-item')?.addEventListener('click', () => {
                this.removeFromOrder(entry.item.id);
            });
            
            this.elements.orderItems.appendChild(itemEl);
        });
    }
    
    /**
     * Adds item to order
     * @param {number} itemIndex - Index of item in CANDY_ITEMS
     */
    addToOrder(itemIndex) {
        if (!this.isPlaying || this.awaitingChange) return;
        
        const item = CANDY_ITEMS[itemIndex];
        if (item) {
            this.selectedItems.push(item);
            this.renderCurrentOrder();
            this.updateOrderDisplay();
        }
    }
    
    /**
     * Removes item from order by id
     * @param {string} itemId - Item id to remove
     */
    removeFromOrder(itemId) {
        if (!this.isPlaying || this.awaitingChange) return;
        
        const index = this.selectedItems.findIndex(item => item.id === itemId);
        if (index !== -1) {
            this.selectedItems.splice(index, 1);
            this.renderCurrentOrder();
            this.updateOrderDisplay();
        }
    }
    
    /**
     * Clears the current order
     */
    clearOrder() {
        if (!this.isPlaying || this.awaitingChange) return;
        
        this.selectedItems = [];
        this.renderCurrentOrder();
        this.updateOrderDisplay();
    }
    
    /**
     * Updates the order summary display
     */
    updateOrderDisplay() {
        const settings = SHOP_CONFIG.DIFFICULTY_SETTINGS[this.difficulty];
        
        // Group items for calculation
        const grouped = this.selectedItems.reduce((acc, item) => {
            const existing = acc.find(e => e.item.id === item.id);
            if (existing) {
                existing.quantity++;
            } else {
                acc.push({ item, quantity: 1 });
            }
            return acc;
        }, []);
        
        const breakdown = this.orderProcessor.calculateTotal(
            grouped,
            this.currentOrder?.discount,
            settings.tax
        );
        
        // Update display
        if (this.elements.subtotalValue) {
            this.elements.subtotalValue.textContent = CurrencyUtils.format(breakdown.subtotal);
        }
        
        // Show/hide discount
        if (this.elements.discountRow && this.elements.discountValue) {
            if (breakdown.discountAmount > 0) {
                this.elements.discountRow.classList.remove('hidden');
                this.elements.discountValue.textContent = '-' + CurrencyUtils.format(breakdown.discountAmount);
            } else {
                this.elements.discountRow.classList.add('hidden');
            }
        }
        
        // Show/hide tax
        if (this.elements.taxRow && this.elements.taxValue) {
            if (breakdown.taxAmount > 0) {
                this.elements.taxRow.classList.remove('hidden');
                this.elements.taxValue.textContent = CurrencyUtils.format(breakdown.taxAmount);
            } else {
                this.elements.taxRow.classList.add('hidden');
            }
        }
        
        if (this.elements.totalValue) {
            this.elements.totalValue.textContent = CurrencyUtils.format(breakdown.total);
        }
        
        // Enable/disable complete button
        if (this.elements.completeBtn) {
            this.elements.completeBtn.disabled = this.selectedItems.length === 0;
        }
    }
    
    /**
     * Completes the order - either validates items or prompts for change
     */
    completeOrder() {
        if (!this.isPlaying || !this.currentOrder) return;
        
        const settings = SHOP_CONFIG.DIFFICULTY_SETTINGS[this.difficulty];
        
        // First, validate items match the order
        if (!this.validateOrder()) {
            this.showFeedback(false, "That's not what I ordered!");
            return;
        }
        
        // Calculate total
        const grouped = this.selectedItems.reduce((acc, item) => {
            const existing = acc.find(e => e.item.id === item.id);
            if (existing) {
                existing.quantity++;
            } else {
                acc.push({ item, quantity: 1 });
            }
            return acc;
        }, []);
        
        const breakdown = this.orderProcessor.calculateTotal(
            grouped,
            this.currentOrder.discount,
            settings.tax
        );
        
        // If exact change mode or difficulty 1, skip change calculation
        if (settings.exactChange || this.difficulty === 1) {
            this.processCorrectOrder(breakdown.total);
            return;
        }
        
        // Otherwise, prompt for change
        this.paymentAmount = CurrencyUtils.generatePayment(breakdown.total);
        this.expectedChange = CurrencyUtils.calculateChange(this.paymentAmount, breakdown.total);
        
        this.awaitingChange = true;
        
        // Update UI
        if (this.elements.paymentAmount) {
            this.elements.paymentAmount.textContent = CurrencyUtils.format(this.paymentAmount);
        }
        if (this.elements.changeInput) {
            this.elements.changeInput.value = '';
            this.elements.changeInput.focus();
        }
        
        this.elements.paymentArea?.classList.remove('hidden');
        this.elements.completeBtn?.setAttribute('disabled', 'true');
        this.elements.clearBtn?.classList.add('hidden');
    }
    
    /**
     * Validates if selected items match the order
     * @returns {boolean} Whether order is valid
     */
    validateOrder() {
        if (!this.currentOrder || !this.currentOrder.items) return false;
        
        // Create frequency maps
        const expectedMap = new Map();
        this.currentOrder.items.forEach(entry => {
            expectedMap.set(entry.item.id, entry.quantity);
        });
        
        const selectedMap = new Map();
        this.selectedItems.forEach(item => {
            selectedMap.set(item.id, (selectedMap.get(item.id) || 0) + 1);
        });
        
        // Check if maps match
        if (expectedMap.size !== selectedMap.size) return false;
        
        for (const [id, qty] of expectedMap) {
            if (selectedMap.get(id) !== qty) return false;
        }
        
        return true;
    }
    
    /**
     * Submits change calculation
     */
    submitChange() {
        if (!this.awaitingChange) return;
        
        const inputValue = parseFloat(this.elements.changeInput?.value || '0');
        const roundedInput = CurrencyUtils.round(inputValue);
        const roundedExpected = CurrencyUtils.round(this.expectedChange);
        
        // Allow small tolerance for floating point
        const isCorrect = Math.abs(roundedInput - roundedExpected) < 0.01;
        
        if (isCorrect) {
            // Calculate total from current order
            const settings = SHOP_CONFIG.DIFFICULTY_SETTINGS[this.difficulty];
            const grouped = this.selectedItems.reduce((acc, item) => {
                const existing = acc.find(e => e.item.id === item.id);
                if (existing) {
                    existing.quantity++;
                } else {
                    acc.push({ item, quantity: 1 });
                }
                return acc;
            }, []);
            
            const breakdown = this.orderProcessor.calculateTotal(
                grouped,
                this.currentOrder.discount,
                settings.tax
            );
            
            this.processCorrectOrder(breakdown.total);
        } else {
            this.showFeedback(false, `The correct change was ${CurrencyUtils.format(this.expectedChange)}`);
            this.awaitingChange = false;
            this.elements.paymentArea?.classList.add('hidden');
            this.totalOrders++;
            
            setTimeout(() => {
                this.customerIndex++;
                this.nextCustomer();
            }, 2000);
        }
    }
    
    /**
     * Processes a correct order
     * @param {number} total - Order total
     */
    processCorrectOrder(total) {
        const tip = CurrencyUtils.round(total * SHOP_CONFIG.TIP_MULTIPLIER);
        
        this.money += total;
        this.tips += tip;
        this.correctOrders++;
        this.totalOrders++;
        
        this.awaitingChange = false;
        this.elements.paymentArea?.classList.add('hidden');
        
        this.showFeedback(true, MathUtils.randomPick(MESSAGES.correct), `+${CurrencyUtils.format(tip)} tip!`);
        this.updateHeader();
        
        setTimeout(() => {
            this.customerIndex++;
            this.nextCustomer();
        }, 2000);
    }
    
    /**
     * Shows feedback overlay
     * @param {boolean} isCorrect - Whether answer was correct
     * @param {string} message - Message to display
     * @param {string} tipMessage - Optional tip message
     */
    showFeedback(isCorrect, message, tipMessage = '') {
        if (!this.elements.feedbackOverlay) return;
        
        if (this.elements.feedbackIcon) {
            this.elements.feedbackIcon.textContent = isCorrect ? '✅' : '❌';
        }
        if (this.elements.feedbackText) {
            this.elements.feedbackText.textContent = message;
        }
        if (this.elements.tipText) {
            this.elements.tipText.textContent = tipMessage;
            this.elements.tipText.style.display = tipMessage ? 'block' : 'none';
        }
        
        this.elements.feedbackOverlay.classList.remove('hidden');
        
        setTimeout(() => {
            this.elements.feedbackOverlay?.classList.add('hidden');
        }, 1800);
    }
    
    /**
     * Updates header display
     */
    updateHeader() {
        if (this.elements.dayDisplay) {
            this.elements.dayDisplay.textContent = `Day ${this.day}`;
        }
        if (this.elements.moneyDisplay) {
            this.elements.moneyDisplay.textContent = `💰 ${CurrencyUtils.format(this.money)}`;
        }
        
        // Update satisfaction stars based on accuracy
        if (this.elements.satisfactionDisplay && this.totalOrders > 0) {
            const accuracy = this.correctOrders / this.totalOrders;
            const stars = Math.ceil(accuracy * 5);
            this.elements.satisfactionDisplay.textContent = '⭐'.repeat(stars) + '☆'.repeat(5 - stars);
        }
    }
    
    /**
     * Ends the current day
     */
    endDay() {
        this.isPlaying = false;
        
        const accuracy = this.totalOrders > 0 ? (this.correctOrders / this.totalOrders) * 100 : 0;
        const stars = Math.ceil((this.correctOrders / this.customersPerDay) * 3);
        const isNewRecord = this.saveHighScore(this.tips);
        
        // Update result screen
        if (this.elements.resultTitle) {
            this.elements.resultTitle.textContent = stars >= 2 ? 'Great Day!' : 'Shop Closed';
        }
        if (this.elements.finalEarnings) {
            this.elements.finalEarnings.textContent = CurrencyUtils.format(this.money);
        }
        if (this.elements.finalTips) {
            this.elements.finalTips.textContent = CurrencyUtils.format(this.tips);
        }
        if (this.elements.customersServed) {
            this.elements.customersServed.textContent = this.correctOrders.toString();
        }
        if (this.elements.accuracyDisplay) {
            this.elements.accuracyDisplay.textContent = accuracy.toFixed(0) + '%';
        }
        
        // Update stars
        if (this.elements.starRating) {
            const starEls = this.elements.starRating.querySelectorAll('.star');
            starEls.forEach((star, index) => {
                star.classList.toggle('earned', index < stars);
            });
        }
        
        // Show new record
        if (this.elements.newHighScore) {
            this.elements.newHighScore.classList.toggle('hidden', !isNewRecord);
        }
        
        this.showScreen('result');
        this.loadHighScore();
    }
    
    /**
     * Returns to home screen
     */
    goHome() {
        this.isPlaying = false;
        this.day = 1;
        
        // Stop background music
        if (this.audio) {
            try {
                this.audio.stopMusic();
            } catch (e) {
                // Silently ignore
            }
        }
        
        this.showScreen('start');
    }
    
    /**
     * Plays a sound effect
     * @param {string} type - Sound type
     */
    playSound(type) {
        if (!this.sfxEnabled || !this.audio) return;
        
        try {
            this.audio.ensureReady();
            this.audio.playSFX(type);
        } catch (e) {
            // Silently ignore audio errors
        }
    }
}

// ==================== Initialize Game ====================
document.addEventListener('DOMContentLoaded', () => {
    try {
        window.game = new CandyShopGame();
    } catch (error) {
        console.error('Failed to initialize Candy Shop game:', error);
    }
});
