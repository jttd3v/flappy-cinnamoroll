/**
 * Proverb Ascension - Complete Game Implementation
 * 
 * A mastery-based cognitive game for scripture memorization
 * with multiple game modes: Multiple Choice, Fill-in-Blanks, 
 * Match the Lines (physics-based), and True/False verification.
 * 
 * @version 3.0.0
 */

// ==================== Configuration ====================

const PROVERB_CONFIG = Object.freeze({
    STORAGE_KEY: 'proverbAscensionProgress',
    LEADERBOARD_KEY: 'proverbAscensionLeaderboard',
    
    POINTS: {
        CORRECT_ANSWER: 100,
        STREAK_BONUS: 25,
        TIME_BONUS_PER_SECOND: 5,
        PERFECT_LEVEL: 200,
        MATCH_BONUS: 50,
        TYPING_BONUS: 75
    },
    
    // Game modes per level - progressively harder
    LEVEL_MODES: {
        1: ['multipleChoice'],
        2: ['multipleChoice', 'trueFalse'],
        3: ['multipleChoice', 'trueFalse', 'fillBlanks'],
        4: ['multipleChoice', 'trueFalse', 'fillBlanks', 'matchLines'],
        5: ['trueFalse', 'fillBlanks', 'matchLines', 'multipleChoice'],
        6: ['trueFalse', 'fillBlanks', 'matchLines', 'multipleChoice']
    }
});

const DIFFICULTY_PRESETS = Object.freeze({
    1: { name: 'Seedling', choices: 2, timeLimit: null, hintEnabled: true, blanks: 1 },
    2: { name: 'Sprout', choices: 3, timeLimit: 45, hintEnabled: true, blanks: 1 },
    3: { name: 'Sapling', choices: 4, timeLimit: 30, hintEnabled: true, blanks: 2 },
    4: { name: 'Tree', choices: 4, timeLimit: 25, hintEnabled: false, blanks: 2 },
    5: { name: 'Oak', choices: 4, timeLimit: 20, hintEnabled: false, blanks: 3 },
    6: { name: 'Ancient', choices: 4, timeLimit: 15, hintEnabled: false, blanks: 3 },
    7: { name: 'Sage', choices: 5, timeLimit: 12, hintEnabled: false, blanks: 4 }
});

const PROVERBS_DATA = Object.freeze([
    {
        id: 1,
        reference: 'Proverbs 1:1',
        text: 'The proverbs of Solomon the son of David, king of Israel;',
        theme: 'Purpose',
        keywords: ['proverbs', 'Solomon', 'David', 'king', 'Israel'],
        questions: [
            { type: 'meaning', question: 'What is this verse introducing?', correct: 'Wise sayings from King Solomon', wrong: ['A story about David', 'Laws for Israel', 'A prayer to God', 'A song of praise'] },
            { type: 'fill', question: 'The proverbs of _____ the son of David, king of Israel;', correct: 'Solomon', wrong: ['Abraham', 'Moses', 'Samuel', 'Isaiah'] },
            { type: 'application', question: 'Why does it matter that Solomon wrote these proverbs?', correct: 'Solomon was known as the wisest king', wrong: ['Solomon was the strongest king', 'Solomon lived the longest', 'Solomon had the most money'] },
            { type: 'recall', question: 'Complete: "The proverbs of Solomon the son of David, _____ of Israel"', correct: 'king', wrong: ['prince', 'prophet', 'judge', 'shepherd'] }
        ],
        falsified: [
            'The proverbs of Moses the son of David, king of Israel;',
            'The proverbs of Solomon the son of Abraham, king of Israel;',
            'The proverbs of Solomon the son of David, prophet of Israel;'
        ]
    },
    {
        id: 2,
        reference: 'Proverbs 1:2',
        text: 'To know wisdom and instruction; to perceive the words of understanding;',
        theme: 'Understanding',
        keywords: ['know', 'wisdom', 'instruction', 'perceive', 'words', 'understanding'],
        questions: [
            { type: 'meaning', question: 'What is the PURPOSE of these proverbs?', correct: 'To know wisdom and perceive understanding', wrong: ['To become rich and famous', 'To win arguments', 'To memorize long texts', 'To follow rules blindly'] },
            { type: 'fill', question: 'To know _____ and instruction;', correct: 'wisdom', wrong: ['wealth', 'power', 'fame', 'strength'] },
            { type: 'application', question: 'How can "words of understanding" help you daily?', correct: 'They help you make better decisions', wrong: ['They make you popular', 'They give you powers', 'They make everything easy'] },
            { type: 'recall', question: 'Complete: "to perceive the words of _____"', correct: 'understanding', wrong: ['wealth', 'power', 'glory', 'fortune'] }
        ],
        falsified: [
            'To know power and instruction; to perceive the words of understanding;',
            'To know wisdom and wealth; to perceive the words of understanding;',
            'To know wisdom and instruction; to perceive the words of knowledge;'
        ]
    },
    {
        id: 3,
        reference: 'Proverbs 1:3',
        text: 'To receive the instruction of wisdom, justice, and judgment, and equity;',
        theme: 'Moral Judgment',
        keywords: ['receive', 'instruction', 'wisdom', 'justice', 'judgment', 'equity'],
        questions: [
            { type: 'meaning', question: 'What four things does this verse mention receiving instruction in?', correct: 'Wisdom, justice, judgment, and equity', wrong: ['Gold, silver, bronze, and iron', 'Health, wealth, fame, and power', 'Reading, writing, math, and science'] },
            { type: 'fill', question: 'To receive the instruction of wisdom, justice, and _____, and equity;', correct: 'judgment', wrong: ['joy', 'jealousy', 'jokes', 'journeys'] },
            { type: 'application', question: 'Why is "equity" (fairness) important in daily life?', correct: 'It helps us treat everyone fairly', wrong: ['It makes us rich', 'It makes us popular', 'It gives us power'] },
            { type: 'recall', question: 'This verse teaches us to receive the instruction of what?', correct: 'Wisdom, justice, judgment, and equity', wrong: ['Gold and silver', 'Fame and fortune', 'Health and wealth', 'Power and glory'] }
        ],
        falsified: [
            'To receive the instruction of power, justice, and judgment, and equity;',
            'To receive the instruction of wisdom, mercy, and judgment, and equity;',
            'To receive the instruction of wisdom, justice, and knowledge, and equity;'
        ]
    },
    {
        id: 4,
        reference: 'Proverbs 1:4',
        text: 'To give subtilty to the simple, to the young man knowledge and discretion.',
        theme: 'Discretion & Youth',
        keywords: ['give', 'subtilty', 'simple', 'young', 'man', 'knowledge', 'discretion'],
        questions: [
            { type: 'meaning', question: 'Who especially benefits from these proverbs?', correct: 'The simple and the young', wrong: ['Only old people', 'Only rich people', 'Only scholars', 'Only kings'] },
            { type: 'fill', question: 'To give _____ to the simple,', correct: 'subtilty', wrong: ['strength', 'silver', 'swords', 'songs'] },
            { type: 'application', question: 'What does "discretion" help young people do?', correct: 'Make careful choices and avoid mistakes', wrong: ['Become famous quickly', 'Do whatever they want', 'Ignore advice'] },
            { type: 'recall', question: 'What two things are given to the young man?', correct: 'Knowledge and discretion', wrong: ['Gold and silver', 'Food and shelter', 'Fame and power', 'Toys and games'] }
        ],
        falsified: [
            'To give power to the simple, to the young man knowledge and discretion.',
            'To give subtilty to the wise, to the young man knowledge and discretion.',
            'To give subtilty to the simple, to the old man knowledge and discretion.'
        ]
    },
    {
        id: 5,
        reference: 'Proverbs 1:5',
        text: 'A wise man will hear, and will increase learning; and a man of understanding shall attain unto wise counsels:',
        theme: 'Growth Through Listening',
        difficulty: 'easy',
        keywords: ['wise', 'man', 'hear', 'increase', 'learning', 'understanding', 'attain', 'counsels'],
        questions: [
            { type: 'meaning', difficulty: 'easy', question: 'What should a wise man do according to this verse?', correct: 'Hear and increase learning', wrong: ['Stop learning since he is wise', 'Teach others only', 'Keep wisdom secret', 'Show off knowledge'] },
            { type: 'fill', difficulty: 'easy', question: 'A wise man will _____, and will increase learning;', correct: 'hear', wrong: ['talk', 'sleep', 'fight', 'hide'] },
            { type: 'application', difficulty: 'medium', question: 'Why should wise people keep seeking counsel?', correct: 'There is always more to learn', wrong: ['To prove they are smart', 'They forgot everything', 'To make others feel bad'] },
            { type: 'recall', difficulty: 'hard', question: 'What shall a man of understanding attain unto?', correct: 'Wise counsels', wrong: ['Great riches', 'Many servants', 'High towers', 'Fine clothes'] }
        ],
        falsified: [
            'A wise man will speak, and will increase learning; and a man of understanding shall attain unto wise counsels:',
            'A wise man will hear, and will decrease learning; and a man of understanding shall attain unto wise counsels:',
            'A wise man will hear, and will increase learning; and a man of power shall attain unto wise counsels:'
        ]
    },
    {
        id: 6,
        reference: 'Proverbs 1:6',
        text: 'To understand a proverb, and the interpretation; the words of the wise, and their dark sayings.',
        theme: 'Deep Understanding',
        difficulty: 'medium',
        keywords: ['understand', 'proverb', 'interpretation', 'words', 'wise', 'dark', 'sayings'],
        questions: [
            { type: 'meaning', difficulty: 'easy', question: 'What does this verse say we should understand?', correct: 'Proverbs and their interpretation', wrong: ['Only stories', 'Just numbers', 'Nothing at all', 'Only songs'] },
            { type: 'fill', difficulty: 'easy', question: 'To understand a _____, and the interpretation;', correct: 'proverb', wrong: ['story', 'song', 'riddle', 'poem'] },
            { type: 'meaning', difficulty: 'medium', question: 'What are "dark sayings" in this context?', correct: 'Deeper, harder-to-understand wisdom', wrong: ['Evil words', 'Night time stories', 'Scary tales', 'Bad advice'] },
            { type: 'fill', difficulty: 'medium', question: 'the words of the wise, and their _____ sayings.', correct: 'dark', wrong: ['light', 'simple', 'short', 'loud'] },
            { type: 'application', difficulty: 'hard', question: 'Why is it important to understand "dark sayings"?', correct: 'They contain hidden wisdom that requires deeper thought', wrong: ['They are fun to read', 'They are easy to memorize', 'They are always literal'] },
            { type: 'recall', difficulty: 'hard', question: 'Complete: "To understand a proverb, and the _____"', correct: 'interpretation', wrong: ['meaning', 'story', 'lesson', 'message'] }
        ],
        falsified: [
            'To understand a story, and the interpretation; the words of the wise, and their dark sayings.',
            'To understand a proverb, and the lesson; the words of the wise, and their dark sayings.',
            'To understand a proverb, and the interpretation; the words of the fool, and their dark sayings.'
        ]
    }
]);

// ==================== Utilities ====================

function getDifficultyFromAge(age) {
    if (age <= 8) return 1;
    if (age <= 10) return 2;
    if (age <= 12) return 3;
    if (age <= 15) return 4;
    if (age <= 18) return 5;
    if (age <= 25) return 6;
    return 7;
}

function shuffleArray(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

// ==================== Sound Manager ====================

class SoundManager {
    constructor() {
        this.audioManager = null;
        this.enabled = true;
    }
    
    async init() {
        try {
            if (!window.gameAudio) {
                const script = document.createElement('script');
                script.src = '../../shared-assets/audio/GameAudioManager.js';
                document.head.appendChild(script);
                await new Promise((resolve) => {
                    script.onload = resolve;
                    setTimeout(resolve, 1000);
                });
            }
            this.audioManager = window.gameAudio || null;
            const initAudio = () => {
                if (this.audioManager && !this.audioManager.initialized) {
                    this.audioManager.init();
                }
            };
            document.addEventListener('click', initAudio, { once: true });
            document.addEventListener('keydown', initAudio, { once: true });
        } catch (e) {
            this.audioManager = null;
        }
    }
    
    play(name) {
        if (!this.enabled) return;
        if (this.audioManager && !this.audioManager.initialized) this.audioManager.init();
        if (this.audioManager) {
            const sfxMap = { 'correct': 'correct', 'wrong': 'wrong', 'click': 'click', 'levelUp': 'levelUp', 'complete': 'victory' };
            this.audioManager.playSFX(sfxMap[name] || name);
        }
    }
    
    toggle() {
        this.enabled = !this.enabled;
        if (this.audioManager) this.audioManager.setSFXEnabled(this.enabled);
        return this.enabled;
    }
}

// ==================== Storage ====================

class ProgressStorage {
    constructor() { this.key = PROVERB_CONFIG.STORAGE_KEY; }
    load() {
        try {
            const data = localStorage.getItem(this.key);
            return data ? JSON.parse(data) : this.defaults();
        } catch { return this.defaults(); }
    }
    save(data) { try { localStorage.setItem(this.key, JSON.stringify(data)); } catch {} }
    defaults() {
        return { playerName: '', playerAge: 0, difficulty: 3, currentLevel: 1, totalScore: 0, streak: 0, bestStreak: 0, levelsCompleted: {}, badges: [], soundEnabled: true, startTime: null };
    }
    clear() { localStorage.removeItem(this.key); }
}

// ==================== Animations ====================

class Anim {
    static shake(el) { if (!el) return; el.classList.add('shake'); setTimeout(() => el.classList.remove('shake'), 500); }
    static pulse(el) { if (!el) return; el.classList.add('pulse'); setTimeout(() => el.classList.remove('pulse'), 600); }
    static bounce(el) { if (!el) return; el.classList.add('bounce'); setTimeout(() => el.classList.remove('bounce'), 500); }
    static confetti(container) {
        if (!container) return;
        const colors = ['#C9A227', '#7B68A6', '#4A7C59', '#E8D491', '#FFD700'];
        const emojis = ['⭐', '✨', '🌟', '💫', '🎉'];
        for (let i = 0; i < 35; i++) {
            const c = document.createElement('div');
            c.className = 'confetti';
            c.textContent = Math.random() > 0.5 ? emojis[Math.floor(Math.random() * emojis.length)] : '';
            c.style.left = Math.random() * 100 + '%';
            c.style.backgroundColor = c.textContent ? 'transparent' : colors[Math.floor(Math.random() * colors.length)];
            c.style.animationDelay = Math.random() * 0.5 + 's';
            container.appendChild(c);
            setTimeout(() => c.remove(), 3000);
        }
    }
    static scorePopup(container, pts) {
        if (!container) return;
        const p = document.createElement('div');
        p.className = 'score-popup';
        p.textContent = `+${pts}`;
        container.appendChild(p);
        setTimeout(() => p.remove(), 1000);
    }
}

// ==================== Match Lines Physics ====================

class MatchLinesGame {
    constructor(container, proverbs, onComplete) {
        this.container = container;
        this.proverbs = proverbs;
        this.onComplete = onComplete;
        this.connections = new Map();
        this.selectedLeft = null;
        this.canvas = null;
        this.ctx = null;
        this.lines = [];
        this.gravity = 0.3;
        this.animationId = null;
    }
    
    init() {
        this.container.innerHTML = `
            <div class="match-header">
                <h3>🔗 Match the Lines</h3>
                <p>Connect each reference to its correct verse</p>
            </div>
            <div class="match-area">
                <canvas id="match-canvas" class="match-canvas"></canvas>
                <div class="match-columns">
                    <div class="match-left" id="match-left"></div>
                    <div class="match-right" id="match-right"></div>
                </div>
            </div>
            <button id="check-matches-btn" class="btn btn-primary" disabled>Check Answers</button>
        `;
        
        this.canvas = document.getElementById('match-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.resizeCanvas();
        
        const leftCol = document.getElementById('match-left');
        const rightCol = document.getElementById('match-right');
        
        // Create shuffled arrays
        const refs = this.proverbs.map(p => ({ id: p.id, ref: p.reference }));
        const texts = shuffleArray(this.proverbs.map(p => ({ id: p.id, text: p.text.substring(0, 50) + '...' })));
        
        refs.forEach(r => {
            const item = document.createElement('div');
            item.className = 'match-item match-ref';
            item.dataset.id = r.id;
            item.textContent = r.ref;
            item.addEventListener('click', () => this.selectLeft(r.id, item));
            leftCol.appendChild(item);
        });
        
        texts.forEach(t => {
            const item = document.createElement('div');
            item.className = 'match-item match-text';
            item.dataset.id = t.id;
            item.textContent = t.text;
            item.addEventListener('click', () => this.selectRight(t.id, item));
            rightCol.appendChild(item);
        });
        
        document.getElementById('check-matches-btn').addEventListener('click', () => this.checkAnswers());
        window.addEventListener('resize', () => this.resizeCanvas());
        this.animate();
    }
    
    resizeCanvas() {
        const area = this.container.querySelector('.match-area');
        if (area && this.canvas) {
            this.canvas.width = area.offsetWidth;
            this.canvas.height = area.offsetHeight;
        }
    }
    
    selectLeft(id, el) {
        document.querySelectorAll('.match-ref').forEach(e => e.classList.remove('selected'));
        el.classList.add('selected');
        this.selectedLeft = { id, el };
    }
    
    selectRight(id, el) {
        if (!this.selectedLeft) return;
        
        // Remove existing connection to this right item
        for (const [leftId, conn] of this.connections) {
            if (conn.rightId === id) {
                this.connections.delete(leftId);
                document.querySelector(`.match-ref[data-id="${leftId}"]`)?.classList.remove('connected');
            }
        }
        
        // Create new connection
        this.connections.set(this.selectedLeft.id, { rightId: id, leftEl: this.selectedLeft.el, rightEl: el });
        this.selectedLeft.el.classList.add('connected');
        this.selectedLeft.el.classList.remove('selected');
        el.classList.add('connected');
        this.selectedLeft = null;
        
        this.updateLines();
        document.getElementById('check-matches-btn').disabled = this.connections.size < this.proverbs.length;
    }
    
    updateLines() {
        this.lines = [];
        for (const [leftId, conn] of this.connections) {
            const leftRect = conn.leftEl.getBoundingClientRect();
            const rightRect = conn.rightEl.getBoundingClientRect();
            const canvasRect = this.canvas.getBoundingClientRect();
            
            this.lines.push({
                x1: leftRect.right - canvasRect.left,
                y1: leftRect.top + leftRect.height / 2 - canvasRect.top,
                x2: rightRect.left - canvasRect.left,
                y2: rightRect.top + rightRect.height / 2 - canvasRect.top,
                leftId,
                rightId: conn.rightId,
                // Physics properties for dangling effect
                controlY: 0,
                velocityY: 0
            });
        }
    }
    
    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        for (const line of this.lines) {
            // Apply gravity physics to control point
            line.velocityY += this.gravity;
            line.controlY += line.velocityY;
            
            // Damping and bounds
            const maxSag = Math.abs(line.x2 - line.x1) * 0.3;
            if (line.controlY > maxSag) {
                line.controlY = maxSag;
                line.velocityY *= -0.5;
            }
            line.velocityY *= 0.95;
            
            // Draw curved line (yarn-like)
            this.ctx.beginPath();
            this.ctx.moveTo(line.x1, line.y1);
            const midX = (line.x1 + line.x2) / 2;
            const midY = (line.y1 + line.y2) / 2 + line.controlY;
            this.ctx.quadraticCurveTo(midX, midY, line.x2, line.y2);
            this.ctx.strokeStyle = line.correct === true ? '#27ae60' : line.correct === false ? '#c0392b' : '#7B68A6';
            this.ctx.lineWidth = 3;
            this.ctx.stroke();
            
            // Draw connector dots
            this.ctx.beginPath();
            this.ctx.arc(line.x1, line.y1, 6, 0, Math.PI * 2);
            this.ctx.arc(line.x2, line.y2, 6, 0, Math.PI * 2);
            this.ctx.fillStyle = this.ctx.strokeStyle;
            this.ctx.fill();
        }
        
        this.animationId = requestAnimationFrame(() => this.animate());
    }
    
    checkAnswers() {
        let correct = 0;
        for (const line of this.lines) {
            line.correct = line.leftId === line.rightId;
            if (line.correct) correct++;
        }
        
        // Visual feedback
        for (const [leftId, conn] of this.connections) {
            const isCorrect = leftId === conn.rightId;
            conn.leftEl.classList.toggle('correct', isCorrect);
            conn.leftEl.classList.toggle('wrong', !isCorrect);
            conn.rightEl.classList.toggle('correct', isCorrect);
            conn.rightEl.classList.toggle('wrong', !isCorrect);
        }
        
        setTimeout(() => {
            cancelAnimationFrame(this.animationId);
            this.onComplete(correct, this.proverbs.length);
        }, 1500);
    }
    
    destroy() {
        if (this.animationId) cancelAnimationFrame(this.animationId);
    }
}

// ==================== Fill in Blanks Game ====================

class FillBlanksGame {
    constructor(container, proverb, difficulty, onComplete) {
        this.container = container;
        this.proverb = proverb;
        this.difficulty = difficulty;
        this.onComplete = onComplete;
        this.blanks = [];
        this.answers = [];
    }
    
    init() {
        const numBlanks = DIFFICULTY_PRESETS[this.difficulty]?.blanks || 2;
        const words = this.proverb.text.split(' ');
        const blankIndices = [];
        
        // Select keywords to blank out
        const keywordIndices = words.map((w, i) => 
            this.proverb.keywords.some(k => w.toLowerCase().includes(k.toLowerCase())) ? i : -1
        ).filter(i => i >= 0);
        
        const selected = shuffleArray(keywordIndices).slice(0, numBlanks);
        selected.forEach(i => blankIndices.push(i));
        
        // Build HTML
        let html = `
            <div class="fill-header">
                <h3>✏️ Fill in the Blanks</h3>
                <p class="fill-reference">${this.proverb.reference}</p>
            </div>
            <div class="fill-verse">
        `;
        
        words.forEach((word, i) => {
            if (blankIndices.includes(i)) {
                const cleanWord = word.replace(/[.,;:]/g, '');
                const punct = word.match(/[.,;:]/)?.[0] || '';
                this.blanks.push({ index: i, word: cleanWord });
                html += `<input type="text" class="fill-input" data-index="${i}" placeholder="..." maxlength="${cleanWord.length + 2}">${punct} `;
            } else {
                html += `<span class="fill-word">${word}</span> `;
            }
        });
        
        html += `
            </div>
            <div class="fill-hint">
                <button id="hint-btn" class="btn btn-secondary btn-small">💡 Show First Letter</button>
            </div>
            <button id="check-fill-btn" class="btn btn-primary">Check Answers</button>
        `;
        
        this.container.innerHTML = html;
        
        document.getElementById('check-fill-btn').addEventListener('click', () => this.checkAnswers());
        document.getElementById('hint-btn')?.addEventListener('click', () => this.showHint());
        
        // Auto-focus first input
        this.container.querySelector('.fill-input')?.focus();
    }
    
    showHint() {
        const inputs = this.container.querySelectorAll('.fill-input');
        inputs.forEach((input, i) => {
            if (!input.value && this.blanks[i]) {
                input.placeholder = this.blanks[i].word[0] + '...';
            }
        });
        document.getElementById('hint-btn').disabled = true;
    }
    
    checkAnswers() {
        const inputs = this.container.querySelectorAll('.fill-input');
        let correct = 0;
        
        inputs.forEach((input, i) => {
            const expected = this.blanks[i]?.word.toLowerCase();
            const answer = input.value.trim().toLowerCase();
            const isCorrect = answer === expected;
            
            input.classList.remove('correct', 'wrong');
            input.classList.add(isCorrect ? 'correct' : 'wrong');
            
            if (!isCorrect) {
                input.value = this.blanks[i]?.word;
            }
            
            if (isCorrect) correct++;
        });
        
        setTimeout(() => {
            this.onComplete(correct, this.blanks.length);
        }, 1500);
    }
}

// ==================== True/False Game ====================

class TrueFalseGame {
    constructor(container, proverbs, onComplete) {
        this.container = container;
        this.proverbs = proverbs;
        this.onComplete = onComplete;
        this.currentIndex = 0;
        this.correct = 0;
        this.statements = [];
    }
    
    init() {
        // Generate statements: mix of true (original) and false (modified)
        this.proverbs.forEach(p => {
            // Add true statement
            this.statements.push({ text: p.text, reference: p.reference, isTrue: true });
            // Add false statement
            if (p.falsified && p.falsified.length > 0) {
                const falseText = p.falsified[Math.floor(Math.random() * p.falsified.length)];
                this.statements.push({ text: falseText, reference: p.reference, isTrue: false });
            }
        });
        
        this.statements = shuffleArray(this.statements).slice(0, 6); // Limit to 6 questions
        this.showStatement();
    }
    
    showStatement() {
        if (this.currentIndex >= this.statements.length) {
            this.onComplete(this.correct, this.statements.length);
            return;
        }
        
        const stmt = this.statements[this.currentIndex];
        this.container.innerHTML = `
            <div class="tf-header">
                <h3>✅❌ True or False?</h3>
                <p class="tf-progress">${this.currentIndex + 1} / ${this.statements.length}</p>
            </div>
            <div class="tf-card">
                <div class="tf-reference">${stmt.reference}</div>
                <blockquote class="tf-text">"${stmt.text}"</blockquote>
                <p class="tf-question">Is this the correct verse?</p>
            </div>
            <div class="tf-buttons">
                <button class="btn btn-true" data-answer="true">
                    <span class="btn-emoji">✅</span>
                    <span>TRUE</span>
                </button>
                <button class="btn btn-false" data-answer="false">
                    <span class="btn-emoji">❌</span>
                    <span>FALSE</span>
                </button>
            </div>
        `;
        
        this.container.querySelectorAll('.tf-buttons button').forEach(btn => {
            btn.addEventListener('click', () => this.handleAnswer(btn.dataset.answer === 'true'));
        });
    }
    
    handleAnswer(answeredTrue) {
        const stmt = this.statements[this.currentIndex];
        const isCorrect = answeredTrue === stmt.isTrue;
        
        if (isCorrect) this.correct++;
        
        // Show feedback
        const card = this.container.querySelector('.tf-card');
        card.classList.add(isCorrect ? 'correct' : 'wrong');
        
        const buttons = this.container.querySelectorAll('.tf-buttons button');
        buttons.forEach(btn => {
            btn.disabled = true;
            const btnIsTrue = btn.dataset.answer === 'true';
            if (btnIsTrue === stmt.isTrue) btn.classList.add('correct-answer');
        });
        
        // Add explanation
        const explanation = document.createElement('div');
        explanation.className = `tf-explanation ${isCorrect ? 'correct' : 'wrong'}`;
        explanation.innerHTML = isCorrect 
            ? `<span>✓ Correct!</span>` 
            : `<span>✗ ${stmt.isTrue ? 'This IS the correct verse!' : 'This verse was modified!'}</span>`;
        this.container.querySelector('.tf-card').appendChild(explanation);
        
        setTimeout(() => {
            this.currentIndex++;
            this.showStatement();
        }, 2000);
    }
}

// ==================== Main Game ====================

class ProverbAscensionGame {
    constructor() {
        this.phase = 'start';
        this.level = 1;
        this.proverb = null;
        this.question = null;
        this.qIndex = 0;
        this.difficulty = 3;
        this.score = 0;
        this.streak = 0;
        this.bestStreak = 0;
        this.levelScore = 0;
        this.levelCorrect = 0;
        this.totalQuestions = 0;
        this.timer = null;
        this.timeLeft = 0;
        
        this.currentMode = 'multipleChoice';
        this.modeIndex = 0;
        this.levelModes = [];
        
        this.storage = new ProgressStorage();
        this.sound = new SoundManager();
        this.progress = this.storage.load();
        this.el = {};
        
        this.matchGame = null;
        this.fillGame = null;
        this.tfGame = null;
    }
    
    async init() {
        this.bindElements();
        this.setupEvents();
        await this.sound.init();
        this.loadProgress();
        this.updateUI();
    }
    
    bindElements() {
        this.el = {
            startScreen: document.getElementById('start-screen'),
            introScreen: document.getElementById('intro-screen'),
            questionScreen: document.getElementById('question-screen'),
            feedbackScreen: document.getElementById('feedback-screen'),
            levelCompleteScreen: document.getElementById('level-complete-screen'),
            completeScreen: document.getElementById('complete-screen'),
            modeScreen: document.getElementById('mode-screen'),
            
            playerWelcome: document.getElementById('player-welcome'),
            verseSelector: document.getElementById('verse-selector'),
            startFeedback: document.getElementById('start-feedback'),
            
            introRef: document.getElementById('intro-reference'),
            introText: document.getElementById('intro-text'),
            introTheme: document.getElementById('intro-theme'),
            startQBtn: document.getElementById('start-questions-btn'),
            
            qProgress: document.getElementById('question-progress'),
            qTimer: document.getElementById('question-timer'),
            timerRing: document.getElementById('timer-ring'),
            timerText: document.getElementById('timer-text'),
            qType: document.getElementById('question-type'),
            qText: document.getElementById('question-text'),
            choices: document.getElementById('choices-container'),
            streakDisp: document.getElementById('streak-display'),
            
            fbIcon: document.getElementById('feedback-icon'),
            fbTitle: document.getElementById('feedback-title'),
            fbMsg: document.getElementById('feedback-message'),
            fbPts: document.getElementById('feedback-points'),
            nextQBtn: document.getElementById('next-question-btn'),
            
            lcTitle: document.getElementById('level-complete-title'),
            lcScore: document.getElementById('level-score'),
            lcAccuracy: document.getElementById('level-accuracy'),
            lcBadge: document.getElementById('level-badge'),
            nextLevelBtn: document.getElementById('next-level-btn'),
            
            finalScore: document.getElementById('final-score'),
            finalStreak: document.getElementById('final-streak'),
            finalAccuracy: document.getElementById('final-accuracy'),
            playAgainBtn: document.getElementById('play-again-btn'),
            
            scoreDisp: document.getElementById('score-display'),
            levelDisp: document.getElementById('level-display'),
            diffBadge: document.getElementById('difficulty-badge'),
            soundToggle: document.getElementById('sound-toggle'),
            confetti: document.getElementById('confetti-container'),
            container: document.getElementById('game-container'),
            
            modeContainer: document.getElementById('mode-container'),
            modeTitle: document.getElementById('mode-title')
        };
    }
    
    setupEvents() {
        this.el.startQBtn?.addEventListener('click', () => this.startLevelModes());
        this.el.nextQBtn?.addEventListener('click', () => this.nextQuestion());
        this.el.nextLevelBtn?.addEventListener('click', () => this.nextLevel());
        this.el.playAgainBtn?.addEventListener('click', () => this.resetGame());
        this.el.soundToggle?.addEventListener('click', () => {
            const on = this.sound.toggle();
            this.el.soundToggle.textContent = on ? '🔊' : '🔇';
            this.progress.soundEnabled = on;
            this.storage.save(this.progress);
        });
        
        document.addEventListener('keydown', (e) => {
            if (this.phase === 'question' && this.currentMode === 'multipleChoice' && e.key >= '1' && e.key <= '5') {
                const btns = this.el.choices?.querySelectorAll('.choice-btn');
                const i = parseInt(e.key) - 1;
                if (btns && btns[i] && !btns[i].disabled) btns[i].click();
            }
            if (e.key === 'Enter') {
                if (this.phase === 'intro') this.el.startQBtn?.click();
                if (this.phase === 'feedback') this.el.nextQBtn?.click();
            }
        });
    }
    
    initPlayerFromManager() {
        // Try to get player data from global PlayerManager (set in launcher)
        if (typeof PlayerManager !== 'undefined' && PlayerManager.hasActivePlayer && PlayerManager.hasActivePlayer()) {
            const player = PlayerManager.getCurrentPlayer();
            if (player) {
                this.progress.playerName = player.name;
                this.progress.playerAge = player.age;
                this.difficulty = getDifficultyFromAge(player.age);
                this.progress.difficulty = this.difficulty;
                this.storage.save(this.progress);
                return true;
            }
        }
        
        // Fallback: check localStorage for player data
        try {
            const playerData = localStorage.getItem('cinnamorollPlayerData');
            if (playerData) {
                const data = JSON.parse(playerData);
                if (data.currentPlayer && data.players && data.players[data.currentPlayer]) {
                    const player = data.players[data.currentPlayer];
                    this.progress.playerName = player.name;
                    this.progress.playerAge = player.age;
                    this.difficulty = getDifficultyFromAge(player.age);
                    this.progress.difficulty = this.difficulty;
                    this.storage.save(this.progress);
                    return true;
                }
            }
        } catch (e) {
            console.log('Could not load player data:', e);
        }
        
        return false;
    }
    
    renderVerseSelector() {
        if (!this.el.verseSelector) return;
        
        // Show player welcome
        if (this.el.playerWelcome && this.progress.playerName) {
            this.el.playerWelcome.innerHTML = `Welcome, <span class="welcome-name">${this.progress.playerName}</span>! 🌟`;
        }
        
        this.el.verseSelector.innerHTML = '';
        
        PROVERBS_DATA.forEach((proverb, index) => {
            const completed = this.progress.levelsCompleted && this.progress.levelsCompleted[proverb.id];
            const difficultyTag = proverb.difficulty || 'medium';
            
            const btn = document.createElement('button');
            btn.className = `verse-btn ${completed ? 'completed' : ''}`;
            btn.innerHTML = `
                <span class="verse-ref">${proverb.reference}</span>
                <span class="verse-preview">${proverb.text.substring(0, 45)}...</span>
                <span class="difficulty-tag ${difficultyTag}">${difficultyTag}</span>
                <span class="verse-status">${completed ? '✅' : '📖'}</span>
            `;
            btn.addEventListener('click', () => this.selectVerse(index + 1));
            this.el.verseSelector.appendChild(btn);
        });
    }
    
    selectVerse(verseLevel) {
        this.sound.play('click');
        this.startLevel(verseLevel);
    }
    
    startGame() {
        // This is now handled by selecting a verse
        this.sound.play('click');
        if (!this.progress.playerName) {
            this.showMsg('Please set up your profile in the launcher first');
            return;
        }
        this.progress.startTime = Date.now();
        this.storage.save(this.progress);
    }
    
    startLevel(lvl) {
        if (lvl > PROVERBS_DATA.length) return this.showComplete();
        
        this.level = lvl;
        this.progress.currentLevel = lvl;
        this.proverb = PROVERBS_DATA[lvl - 1];
        this.qIndex = 0;
        this.modeIndex = 0;
        this.levelScore = 0;
        this.levelCorrect = 0;
        this.totalQuestions = 0;
        
        // Get modes for this level
        this.levelModes = PROVERB_CONFIG.LEVEL_MODES[lvl] || ['multipleChoice'];
        
        this.updateUI();
        this.showIntro();
    }
    
    showIntro() {
        this.phase = 'intro';
        this.el.introRef.textContent = this.proverb.reference;
        this.el.introText.textContent = `"${this.proverb.text}"`;
        this.el.introTheme.textContent = `Theme: ${this.proverb.theme}`;
        this.showScreen('intro');
    }
    
    startLevelModes() {
        this.sound.play('click');
        this.modeIndex = 0;
        this.runNextMode();
    }
    
    runNextMode() {
        if (this.modeIndex >= this.levelModes.length) {
            return this.showLevelComplete();
        }
        
        this.currentMode = this.levelModes[this.modeIndex];
        
        switch (this.currentMode) {
            case 'multipleChoice':
                this.qIndex = 0;
                this.showQuestion();
                break;
            case 'fillBlanks':
                this.showFillBlanks();
                break;
            case 'matchLines':
                this.showMatchLines();
                break;
            case 'trueFalse':
                this.showTrueFalse();
                break;
            default:
                this.modeIndex++;
                this.runNextMode();
        }
    }
    
    // ==================== Multiple Choice Mode ====================
    
    showQuestion() {
        if (this.qIndex >= this.proverb.questions.length) {
            this.modeIndex++;
            return this.runNextMode();
        }
        
        this.phase = 'question';
        this.question = this.proverb.questions[this.qIndex];
        
        const settings = DIFFICULTY_PRESETS[this.difficulty];
        const numChoices = Math.min(settings.choices, this.question.wrong.length + 1);
        const wrongs = shuffleArray(this.question.wrong).slice(0, numChoices - 1);
        const allChoices = shuffleArray([this.question.correct, ...wrongs]);
        
        this.el.qProgress.textContent = `${this.qIndex + 1} / ${this.proverb.questions.length}`;
        this.el.qType.textContent = this.getTypeLabel(this.question.type);
        this.el.qText.textContent = this.question.question;
        
        this.el.choices.innerHTML = '';
        allChoices.forEach((c, i) => {
            const btn = document.createElement('button');
            btn.className = 'choice-btn';
            btn.innerHTML = `<span class="choice-key">${i + 1}</span><span class="choice-text">${c}</span>`;
            btn.dataset.answer = c;
            btn.addEventListener('click', () => this.handleAnswer(c, btn));
            this.el.choices.appendChild(btn);
            setTimeout(() => btn.classList.add('visible'), i * 80);
        });
        
        this.startTimer(settings.timeLimit);
        this.updateStreak();
        this.showScreen('question');
    }
    
    getTypeLabel(type) {
        const labels = { meaning: '💡 Understanding', fill: '✏️ Fill in Blank', application: '🌍 Real Life', recall: '🧠 Remember' };
        return labels[type] || '❓ Question';
    }
    
    handleAnswer(answer, btn) {
        if (this.phase !== 'question') return;
        this.phase = 'feedback';
        clearInterval(this.timer);
        
        const correct = answer === this.question.correct;
        this.totalQuestions++;
        
        const btns = this.el.choices.querySelectorAll('.choice-btn');
        btns.forEach(b => {
            b.disabled = true;
            b.classList.add('disabled');
            if (b.dataset.answer === this.question.correct) b.classList.add('correct');
            else if (b === btn && !correct) b.classList.add('wrong');
        });
        
        let pts = 0;
        if (correct) {
            this.sound.play('correct');
            btn.classList.add('correct-anim');
            Anim.pulse(this.el.scoreDisp);
            pts = PROVERB_CONFIG.POINTS.CORRECT_ANSWER;
            const settings = DIFFICULTY_PRESETS[this.difficulty];
            if (settings.timeLimit) pts += Math.floor((this.timeLeft / 1000) * PROVERB_CONFIG.POINTS.TIME_BONUS_PER_SECOND);
            this.streak++;
            if (this.streak > 1) pts += PROVERB_CONFIG.POINTS.STREAK_BONUS * (this.streak - 1);
            if (this.streak > this.bestStreak) { this.bestStreak = this.streak; this.progress.bestStreak = this.bestStreak; }
            this.levelCorrect++;
            Anim.scorePopup(this.el.container, pts);
        } else {
            this.sound.play('wrong');
            Anim.shake(this.el.questionScreen);
            this.streak = 0;
        }
        
        this.score += pts;
        this.levelScore += pts;
        this.progress.totalScore = this.score;
        this.progress.streak = this.streak;
        this.storage.save(this.progress);
        this.updateUI();
        
        setTimeout(() => this.showFeedback(correct, pts), 800);
    }
    
    showFeedback(correct, pts) {
        this.el.fbIcon.textContent = correct ? '✅' : '❌';
        this.el.fbIcon.className = `feedback-icon ${correct ? 'correct' : 'wrong'}`;
        
        const goods = ['Excellent!', 'Well Done!', 'Correct!', 'Great!', 'Perfect!'];
        const bads = ['Not Quite', 'Keep Trying', 'Almost!'];
        this.el.fbTitle.textContent = correct ? goods[Math.floor(Math.random() * goods.length)] : bads[Math.floor(Math.random() * bads.length)];
        
        if (correct) {
            this.el.fbMsg.textContent = this.streak > 1 ? `🔥 ${this.streak} in a row!` : 'You got it right!';
            this.el.fbPts.textContent = `+${pts}`;
            this.el.fbPts.classList.add('show');
            Anim.bounce(this.el.fbIcon);
        } else {
            this.el.fbMsg.innerHTML = `Answer: <strong>"${this.question.correct}"</strong>`;
            this.el.fbPts.classList.remove('show');
        }
        
        this.showScreen('feedback');
    }
    
    nextQuestion() {
        this.sound.play('click');
        this.qIndex++;
        this.showQuestion();
    }
    
    // ==================== Fill in Blanks Mode ====================
    
    showFillBlanks() {
        this.phase = 'mode';
        this.el.modeTitle.textContent = '✏️ Fill in the Blanks';
        
        this.fillGame = new FillBlanksGame(
            this.el.modeContainer,
            this.proverb,
            this.difficulty,
            (correct, total) => this.onModeComplete('fillBlanks', correct, total)
        );
        this.fillGame.init();
        this.showScreen('mode');
    }
    
    // ==================== Match Lines Mode ====================
    
    showMatchLines() {
        this.phase = 'mode';
        this.el.modeTitle.textContent = '🔗 Match the Lines';
        
        // Use all proverbs up to current level for matching
        const proverbsToMatch = PROVERBS_DATA.slice(0, Math.min(this.level, 5));
        
        this.matchGame = new MatchLinesGame(
            this.el.modeContainer,
            proverbsToMatch,
            (correct, total) => this.onModeComplete('matchLines', correct, total)
        );
        this.matchGame.init();
        this.showScreen('mode');
    }
    
    // ==================== True/False Mode ====================
    
    showTrueFalse() {
        this.phase = 'mode';
        this.el.modeTitle.textContent = '✅❌ True or False';
        
        this.tfGame = new TrueFalseGame(
            this.el.modeContainer,
            [this.proverb],
            (correct, total) => this.onModeComplete('trueFalse', correct, total)
        );
        this.tfGame.init();
        this.showScreen('mode');
    }
    
    // ==================== Mode Complete Handler ====================
    
    onModeComplete(mode, correct, total) {
        this.totalQuestions += total;
        this.levelCorrect += correct;
        
        let pts = correct * PROVERB_CONFIG.POINTS.CORRECT_ANSWER;
        if (mode === 'matchLines') pts += correct * PROVERB_CONFIG.POINTS.MATCH_BONUS;
        if (mode === 'fillBlanks') pts += correct * PROVERB_CONFIG.POINTS.TYPING_BONUS;
        
        this.score += pts;
        this.levelScore += pts;
        this.progress.totalScore = this.score;
        this.storage.save(this.progress);
        this.updateUI();
        
        if (correct === total) {
            this.sound.play('correct');
            Anim.confetti(this.el.confetti);
        } else {
            this.sound.play('click');
        }
        
        // Clean up
        if (this.matchGame) { this.matchGame.destroy(); this.matchGame = null; }
        this.fillGame = null;
        this.tfGame = null;
        
        this.modeIndex++;
        setTimeout(() => this.runNextMode(), 1500);
    }
    
    // ==================== Level Complete ====================
    
    showLevelComplete() {
        this.phase = 'levelComplete';
        const acc = this.totalQuestions > 0 ? Math.round((this.levelCorrect / this.totalQuestions) * 100) : 0;
        const perfect = acc === 100;
        
        if (perfect) {
            this.score += PROVERB_CONFIG.POINTS.PERFECT_LEVEL;
            this.progress.totalScore = this.score;
            this.sound.play('levelUp');
            setTimeout(() => Anim.confetti(this.el.confetti), 300);
        } else {
            this.sound.play('click');
        }
        
        this.progress.levelsCompleted[this.level] = { score: this.levelScore, accuracy: acc, time: Date.now() };
        this.storage.save(this.progress);
        
        this.el.lcTitle.textContent = `${this.proverb.reference} Complete!`;
        this.el.lcScore.textContent = this.levelScore;
        this.el.lcAccuracy.textContent = `${acc}%`;
        this.el.lcBadge.textContent = perfect ? '⭐ Perfect!' : acc >= 75 ? '🎉 Great!' : '📚 Keep Learning';
        this.el.lcBadge.className = `level-badge ${perfect ? 'perfect' : acc >= 75 ? 'great' : 'good'}`;
        this.el.nextLevelBtn.textContent = 'Choose Another Verse →';
        
        this.updateUI();
        this.showScreen('levelComplete');
    }
    
    nextLevel() {
        this.sound.play('click');
        // Go back to verse selection instead of auto-advancing
        this.renderVerseSelector();
        this.showScreen('start');
    }
    
    showComplete() {
        this.phase = 'complete';
        
        let tc = 0, tq = 0;
        for (const p of PROVERBS_DATA) {
            const c = this.progress.levelsCompleted[p.id];
            if (c) { tc += Math.round(c.accuracy / 100 * 4); tq += 4; }
        }
        const acc = tq > 0 ? Math.round((tc / tq) * 100) : 0;
        
        this.el.finalScore.textContent = this.score;
        this.el.finalStreak.textContent = this.bestStreak;
        this.el.finalAccuracy.textContent = `${acc}%`;
        
        this.sound.play('complete');
        setTimeout(() => Anim.confetti(this.el.confetti), 500);
        this.showScreen('complete');
    }
    
    // ==================== Timer ====================
    
    startTimer(secs) {
        if (!secs) { this.el.qTimer.style.display = 'none'; return; }
        this.el.qTimer.style.display = 'flex';
        this.timeLeft = secs * 1000;
        const total = this.timeLeft;
        this.updateTimerDisplay();
        if (this.el.timerRing) this.el.timerRing.style.stroke = '#7B68A6';
        
        this.timer = setInterval(() => {
            this.timeLeft -= 100;
            this.updateTimerDisplay();
            const progress = this.timeLeft / total;
            const circ = 2 * Math.PI * 45;
            if (this.el.timerRing) {
                this.el.timerRing.style.strokeDasharray = circ;
                this.el.timerRing.style.strokeDashoffset = circ * (1 - progress);
                if (this.timeLeft < 5000) this.el.timerRing.style.stroke = '#c0392b';
                else if (this.timeLeft < 10000) this.el.timerRing.style.stroke = '#f39c12';
            }
            if (this.timeLeft <= 0) { clearInterval(this.timer); this.handleTimeout(); }
        }, 100);
    }
    
    updateTimerDisplay() { if (this.el.timerText) this.el.timerText.textContent = Math.ceil(this.timeLeft / 1000); }
    
    handleTimeout() {
        if (this.phase !== 'question') return;
        this.sound.play('wrong');
        const btns = this.el.choices?.querySelectorAll('.choice-btn');
        btns?.forEach(b => { b.disabled = true; b.classList.add('disabled'); if (b.dataset.answer === this.question.correct) b.classList.add('correct'); });
        this.streak = 0;
        this.progress.streak = 0;
        this.totalQuestions++;
        this.storage.save(this.progress);
        Anim.shake(this.el.questionScreen);
        setTimeout(() => this.showFeedback(false, 0), 800);
    }
    
    // ==================== UI Helpers ====================
    
    showScreen(name) {
        ['start', 'intro', 'question', 'feedback', 'levelComplete', 'complete', 'mode'].forEach(n => {
            const el = this.el[n + 'Screen'];
            if (el) el.classList.toggle('active', n === name);
        });
    }
    
    showMsg(msg) {
        if (this.el.startFeedback) {
            this.el.startFeedback.textContent = msg;
            this.el.startFeedback.classList.add('show');
            setTimeout(() => this.el.startFeedback.classList.remove('show'), 3000);
        }
    }
    
    updateStreak() {
        if (!this.el.streakDisp) return;
        if (this.streak > 0) {
            this.el.streakDisp.classList.add('show');
            this.el.streakDisp.innerHTML = '🔥'.repeat(Math.min(this.streak, 5));
        } else { this.el.streakDisp.classList.remove('show'); }
    }
    
    updateUI() {
        if (this.el.scoreDisp) this.el.scoreDisp.textContent = this.score;
        if (this.el.levelDisp) this.el.levelDisp.textContent = this.proverb ? this.proverb.reference : `Level ${this.level}/${PROVERBS_DATA.length}`;
        if (this.el.diffBadge) this.el.diffBadge.textContent = DIFFICULTY_PRESETS[this.difficulty]?.name || 'Sapling';
    }
    
    loadProgress() {
        this.progress = this.storage.load();
        this.score = this.progress.totalScore || 0;
        this.streak = this.progress.streak || 0;
        this.bestStreak = this.progress.bestStreak || 0;
        if (this.progress.soundEnabled === false) {
            this.sound.enabled = false;
            if (this.el.soundToggle) this.el.soundToggle.textContent = '🔇';
        }
        
        // Load player from PlayerManager if not already set
        if (!this.progress.playerName) {
            this.initPlayerFromManager();
        } else {
            this.difficulty = this.progress.difficulty || getDifficultyFromAge(this.progress.playerAge || 12);
        }
        
        // Render verse selector
        this.renderVerseSelector();
    }
    
    resetGame() {
        this.sound.play('click');
        this.storage.clear();
        this.progress = this.storage.defaults();
        
        // Reload player from PlayerManager
        this.initPlayerFromManager();
        
        this.score = 0;
        this.streak = 0;
        this.bestStreak = 0;
        this.level = 1;
        this.updateUI();
        this.renderVerseSelector();
        this.showScreen('start');
    }
}

// ==================== Recording Manager ====================

class RecordingManager {
    constructor(game) {
        this.game = game;
        this.webcamEnabled = false;
        this.isRecording = false;
        this.mediaRecorder = null;
        this.recordedChunks = [];
        this.webcamStream = null;
        
        this.els = {
            webcamVideo: document.getElementById('webcam-video'),
            recIndicator: document.getElementById('rec-indicator'),
            toggleBtn: document.getElementById('toggle-webcam-btn'),
            startBtn: document.getElementById('start-recording-btn'),
            stopBtn: document.getElementById('stop-recording-btn'),
            status: document.getElementById('recording-status'),
            closeBtn: document.getElementById('close-btn'),
            exitModal: document.getElementById('exit-modal'),
            exitCancel: document.getElementById('exit-cancel-btn'),
            exitConfirm: document.getElementById('exit-confirm-btn')
        };
        
        this.init();
    }
    
    init() {
        // Webcam toggle
        if (this.els.toggleBtn) {
            this.els.toggleBtn.addEventListener('click', () => this.toggleWebcam());
        }
        
        // Recording controls
        if (this.els.startBtn) {
            this.els.startBtn.addEventListener('click', () => this.startRecording());
        }
        if (this.els.stopBtn) {
            this.els.stopBtn.addEventListener('click', () => this.stopRecording());
        }
        
        // Exit/Close handling
        if (this.els.closeBtn) {
            this.els.closeBtn.addEventListener('click', () => this.showExitModal());
        }
        if (this.els.exitCancel) {
            this.els.exitCancel.addEventListener('click', () => this.hideExitModal());
        }
        if (this.els.exitConfirm) {
            this.els.exitConfirm.addEventListener('click', () => this.confirmExit());
        }
        
        // Click outside modal to close
        if (this.els.exitModal) {
            this.els.exitModal.addEventListener('click', (e) => {
                if (e.target === this.els.exitModal) this.hideExitModal();
            });
        }
    }
    
    async toggleWebcam() {
        if (this.webcamEnabled) {
            this.disableWebcam();
        } else {
            await this.enableWebcam();
        }
    }
    
    async enableWebcam() {
        try {
            this.webcamStream = await navigator.mediaDevices.getUserMedia({
                video: { width: 640, height: 480 },
                audio: true
            });
            
            if (this.els.webcamVideo) {
                this.els.webcamVideo.srcObject = this.webcamStream;
                this.els.webcamVideo.play();
            }
            
            this.webcamEnabled = true;
            if (this.els.toggleBtn) {
                this.els.toggleBtn.textContent = '📷 Disable Webcam';
            }
            if (this.els.startBtn) {
                this.els.startBtn.disabled = false;
            }
            
            this.setStatus('Webcam enabled - ready to record!');
        } catch (err) {
            console.error('Webcam access error:', err);
            this.setStatus('⚠️ Could not access webcam');
        }
    }
    
    disableWebcam() {
        if (this.isRecording) {
            this.stopRecording();
        }
        
        if (this.webcamStream) {
            this.webcamStream.getTracks().forEach(track => track.stop());
            this.webcamStream = null;
        }
        
        if (this.els.webcamVideo) {
            this.els.webcamVideo.srcObject = null;
        }
        
        this.webcamEnabled = false;
        if (this.els.toggleBtn) {
            this.els.toggleBtn.textContent = '📷 Enable Webcam';
        }
        if (this.els.startBtn) {
            this.els.startBtn.disabled = true;
        }
        
        this.setStatus('Webcam disabled');
    }
    
    startRecording() {
        if (!this.webcamEnabled || !this.webcamStream) {
            this.setStatus('⚠️ Enable webcam first');
            return;
        }
        
        this.recordedChunks = [];
        
        try {
            this.mediaRecorder = new MediaRecorder(this.webcamStream, {
                mimeType: 'video/webm;codecs=vp9'
            });
        } catch (e) {
            // Fallback if vp9 not supported
            this.mediaRecorder = new MediaRecorder(this.webcamStream);
        }
        
        this.mediaRecorder.ondataavailable = (e) => {
            if (e.data.size > 0) {
                this.recordedChunks.push(e.data);
            }
        };
        
        this.mediaRecorder.onstop = () => {
            this.saveRecording();
        };
        
        this.mediaRecorder.start();
        this.isRecording = true;
        
        // Update UI
        if (this.els.recIndicator) {
            this.els.recIndicator.classList.add('active');
        }
        if (this.els.startBtn) {
            this.els.startBtn.style.display = 'none';
        }
        if (this.els.stopBtn) {
            this.els.stopBtn.classList.add('active');
        }
        
        this.setStatus('🔴 Recording...');
    }
    
    stopRecording() {
        if (!this.isRecording || !this.mediaRecorder) return;
        
        this.mediaRecorder.stop();
        this.isRecording = false;
        
        // Update UI
        if (this.els.recIndicator) {
            this.els.recIndicator.classList.remove('active');
        }
        if (this.els.startBtn) {
            this.els.startBtn.style.display = 'inline-block';
        }
        if (this.els.stopBtn) {
            this.els.stopBtn.classList.remove('active');
        }
        
        this.setStatus('Saving recording...');
    }
    
    saveRecording() {
        if (this.recordedChunks.length === 0) {
            this.setStatus('⚠️ No recording data');
            return;
        }
        
        const blob = new Blob(this.recordedChunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        
        // Create filename with game info
        const now = new Date();
        const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
        const timeStr = now.toTimeString().slice(0, 5).replace(':', '');
        const level = this.game?.level || 1;
        const score = this.game?.score || 0;
        const filename = `${dateStr}_${timeStr}_proverb_level${level}_score${score}.webm`;
        
        // Trigger download
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        URL.revokeObjectURL(url);
        this.recordedChunks = [];
        
        this.setStatus(`✅ Saved: ${filename}`);
        setTimeout(() => this.setStatus(''), 5000);
    }
    
    setStatus(msg) {
        if (this.els.status) {
            this.els.status.textContent = msg;
            this.els.status.classList.toggle('active', !!msg);
        }
    }
    
    showExitModal() {
        if (this.els.exitModal) {
            this.els.exitModal.classList.add('active');
        }
    }
    
    hideExitModal() {
        if (this.els.exitModal) {
            this.els.exitModal.classList.remove('active');
        }
    }
    
    confirmExit() {
        // Stop any recording in progress
        if (this.isRecording) {
            this.stopRecording();
        }
        
        // Disable webcam
        if (this.webcamEnabled) {
            this.disableWebcam();
        }
        
        // Save progress before leaving
        if (this.game && this.game.storage && this.game.progress) {
            this.game.storage.save(this.game.progress);
        }
        
        // Navigate home
        window.location.href = '../../launcher.html';
    }
    
    cleanup() {
        if (this.isRecording) {
            this.stopRecording();
        }
        if (this.webcamEnabled) {
            this.disableWebcam();
        }
    }
}

// Initialize
let game;
let recordingManager;

document.addEventListener('DOMContentLoaded', () => {
    game = new ProverbAscensionGame();
    game.init();
    window.proverbGame = game;
    
    // Initialize recording manager
    recordingManager = new RecordingManager(game);
    window.recordingManager = recordingManager;
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (recordingManager) {
        recordingManager.cleanup();
    }
});