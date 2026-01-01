/**
 * Story Cloud Adventure - Main Game Logic
 * An interactive fiction game with comprehension questions
 * 
 * @version 1.0.0
 */

// ==================== Configuration (inlined for file:// compatibility) ====================
const STORY_CONFIG = Object.freeze({
  TEXT_SPEED: {
    slow: 80,
    normal: 50,
    fast: 25,
    instant: 0
  },
  
  DIFFICULTY_SETTINGS: {
    1: { wordsPerPage: 20, questionType: 'who_what', readingLevel: 'K-1' },
    2: { wordsPerPage: 40, questionType: 'where_when', readingLevel: '2-3' },
    3: { wordsPerPage: 80, questionType: 'why_how', readingLevel: '4-5' },
    4: { wordsPerPage: 120, questionType: 'inference', readingLevel: '6-8' },
    5: { wordsPerPage: 180, questionType: 'analysis', readingLevel: '9-10' },
    6: { wordsPerPage: 250, questionType: 'theme', readingLevel: '11-12' },
    7: { wordsPerPage: 400, questionType: 'critical', readingLevel: 'college' }
  },
  
  QUESTION_TYPES: {
    who_what: 'Literal - Who/What questions',
    where_when: 'Literal - Where/When questions',
    why_how: 'Inferential - Why/How questions',
    inference: 'Draw conclusions from text',
    analysis: 'Analyze character/plot',
    theme: 'Identify themes and symbols',
    critical: 'Critical evaluation'
  },
  
  LEADERBOARD_KEY: 'storyCloudLeaderboard'
});

const STORIES = [
  { id: 'cloud-adventure', title: 'Cloud Adventure', difficulty: 1, pages: 12 },
  { id: 'rainbow-quest', title: 'Rainbow Quest', difficulty: 2, pages: 18 },
  { id: 'star-journey', title: 'Star Journey', difficulty: 3, pages: 24 },
  { id: 'dream-mystery', title: 'Dream Mystery', difficulty: 5, pages: 36 }
];

function getDifficultyFromAge(age) {
  if (age <= 8) return 1;
  if (age <= 10) return 2;
  if (age <= 12) return 3;
  if (age <= 15) return 4;
  if (age <= 18) return 5;
  if (age <= 25) return 6;
  return 7;
}

// ==================== Story Data ======================================
const STORY_DATA = {
    'cloud-adventure': {
        title: 'Cloud Adventure',
        startNode: 'start',
        nodes: {
            start: {
                id: 'start',
                scene: '☁️ 🐰 ☁️',
                content: `One beautiful morning, Cinnamoroll woke up on his fluffy cloud bed. The sun was shining brightly, and the sky was painted in beautiful shades of pink and orange.

"What a perfect day for an adventure!" said Cinnamoroll, stretching his big floppy ears.

He looked around and saw two interesting paths ahead...`,
                choices: [
                    { text: 'Follow the rainbow bridge', icon: '🌈', nextId: 'rainbow_path' },
                    { text: 'Visit the garden clouds', icon: '🌸', nextId: 'garden_path' }
                ],
                question: {
                    text: 'Where did Cinnamoroll wake up?',
                    options: ['On the ground', 'On a fluffy cloud bed', 'In a house', 'By a river'],
                    answer: 1
                }
            },
            rainbow_path: {
                id: 'rainbow_path',
                scene: '🌈 🐰 ✨',
                content: `Cinnamoroll bounced along the colorful rainbow bridge. Each step made a different musical sound - red was "do", orange was "re", yellow was "mi"!

As he reached the middle of the bridge, he found a sparkling treasure chest sitting on a purple cloud.`,
                choices: [
                    { text: 'Open the treasure chest', icon: '📦', nextId: 'treasure_open', item: 'golden_star' },
                    { text: 'Keep walking on the rainbow', icon: '🚶', nextId: 'rainbow_end' }
                ],
                question: {
                    text: 'What happened when Cinnamoroll stepped on the rainbow?',
                    options: ['Nothing', 'It made musical sounds', 'It disappeared', 'It changed colors'],
                    answer: 1
                }
            },
            garden_path: {
                id: 'garden_path',
                scene: '🌸 🐰 🌷',
                content: `Cinnamoroll floated down to the garden clouds, where beautiful flowers grew in every color imaginable. Butterflies danced around the petals, and the air smelled like sweet honey.

"Hello there!" said a friendly butterfly named Flutter. "Would you like to help me find my lost friends?"`,
                choices: [
                    { text: 'Help Flutter find friends', icon: '🦋', nextId: 'help_butterfly', item: 'flower_crown' },
                    { text: 'Explore the garden alone', icon: '🔍', nextId: 'garden_explore' }
                ],
                question: {
                    text: 'What did the garden smell like?',
                    options: ['Chocolate', 'Sweet honey', 'Rain', 'Nothing'],
                    answer: 1
                }
            },
            treasure_open: {
                id: 'treasure_open',
                scene: '⭐ 🐰 ✨',
                content: `Inside the treasure chest, Cinnamoroll found a beautiful golden star that sparkled with magic light!

"Wow!" he exclaimed. "This must be a wishing star!"

The star began to glow warmly in his paws, and suddenly he heard a voice...`,
                choices: [
                    { text: 'Make a wish', icon: '💫', nextId: 'make_wish' },
                    { text: 'Follow the voice', icon: '👂', nextId: 'follow_voice' }
                ],
                question: {
                    text: 'What did Cinnamoroll find in the treasure chest?',
                    options: ['Gold coins', 'A map', 'A golden star', 'Candy'],
                    answer: 2
                }
            },
            rainbow_end: {
                id: 'rainbow_end',
                scene: '🌈 🐰 🏰',
                content: `At the end of the rainbow, Cinnamoroll discovered a magnificent cloud castle! Its towers reached up into the sky, made entirely of fluffy white clouds.

A friendly cloud guard waved at him from the entrance.

"Welcome, traveler! The Cloud Queen has been expecting you!"`,
                choices: [
                    { text: 'Enter the castle', icon: '🏰', nextId: 'castle_enter' },
                    { text: 'Ask about the queen', icon: '❓', nextId: 'ask_queen' }
                ],
                question: {
                    text: 'What was at the end of the rainbow?',
                    options: ['A pot of gold', 'A cloud castle', 'A forest', 'Nothing'],
                    answer: 1
                }
            },
            help_butterfly: {
                id: 'help_butterfly',
                scene: '🦋 🐰 🌺',
                content: `Cinnamoroll and Flutter searched through the flower garden together. They found three butterfly friends hiding among the petals!

"Thank you so much!" said Flutter happily. She gave Cinnamoroll a beautiful flower crown as a gift.

The butterflies performed a beautiful dance to celebrate their reunion.`,
                choices: [
                    { text: 'Join the butterfly dance', icon: '💃', nextId: 'good_ending_butterfly' },
                    { text: 'Continue exploring', icon: '🗺️', nextId: 'garden_explore' }
                ],
                question: {
                    text: 'How many butterfly friends did they find?',
                    options: ['One', 'Two', 'Three', 'Four'],
                    answer: 2
                }
            },
            garden_explore: {
                id: 'garden_explore',
                scene: '🌻 🐰 🍯',
                content: `Wandering through the garden, Cinnamoroll discovered a hidden honey spring! The golden honey bubbled up from the cloud ground, creating sweet little pools.

A family of cloud bees buzzed around happily, sharing their honey with visitors.`,
                choices: [
                    { text: 'Taste the honey', icon: '🍯', nextId: 'honey_ending', item: 'honey_jar' },
                    { text: 'Thank the bees and leave', icon: '👋', nextId: 'good_ending_explore' }
                ],
                question: {
                    text: 'What did Cinnamoroll find in the garden?',
                    options: ['A cave', 'A honey spring', 'A river', 'A mountain'],
                    answer: 1
                }
            },
            make_wish: {
                id: 'make_wish',
                scene: '✨ 🐰 🌟',
                content: `Cinnamoroll closed his eyes and made a wish with all his heart.

"I wish for all my friends to be happy!"

The golden star burst into thousands of tiny sparkles that floated across the sky, spreading joy to everyone they touched.`,
                choices: [
                    { text: 'Watch the magic happen', icon: '✨', nextId: 'best_ending' }
                ],
                isEnding: false,
                question: {
                    text: 'What did Cinnamoroll wish for?',
                    options: ['More treasure', 'To fly higher', 'For his friends to be happy', 'For candy'],
                    answer: 2
                }
            },
            follow_voice: {
                id: 'follow_voice',
                scene: '👂 🐰 💫',
                content: `The magical voice led Cinnamoroll to a hidden garden behind a cloud waterfall. There, he met the Star Keeper - a wise old cloud rabbit.

"You have found my lost wishing star," said the Star Keeper kindly. "As a reward, I grant you one special ability!"`,
                choices: [
                    { text: 'Accept the gift', icon: '🎁', nextId: 'gift_ending' }
                ],
                question: {
                    text: 'Who was the Star Keeper?',
                    options: ['A bird', 'A wise old cloud rabbit', 'A fish', 'A butterfly'],
                    answer: 1
                }
            },
            castle_enter: {
                id: 'castle_enter',
                scene: '🏰 🐰 👑',
                content: `Inside the cloud castle, everything sparkled with dewdrops and starlight. The Cloud Queen sat on her throne, smiling warmly at Cinnamoroll.

"Welcome, little one! You've traveled far. Please, join us for the Cloud Festival tonight!"`,
                choices: [
                    { text: 'Join the festival', icon: '🎉', nextId: 'festival_ending' }
                ],
                question: {
                    text: 'What did the Cloud Queen invite Cinnamoroll to?',
                    options: ['A race', 'A festival', 'A meal', 'A meeting'],
                    answer: 1
                }
            },
            ask_queen: {
                id: 'ask_queen',
                scene: '❓ 🐰 👸',
                content: `"The Cloud Queen is the kindest ruler in all the sky kingdoms," explained the guard. "She protects all the cloud creatures and makes sure the rain falls gently on the world below."

The guard smiled and opened the castle gates wide.`,
                choices: [
                    { text: 'Enter and meet the queen', icon: '👸', nextId: 'castle_enter' }
                ],
                question: {
                    text: 'What does the Cloud Queen protect?',
                    options: ['Gold', 'Stars', 'All cloud creatures', 'The sun'],
                    answer: 2
                }
            },
            best_ending: {
                id: 'best_ending',
                scene: '🌟 🐰 💖',
                content: `The magic sparkles created the most beautiful sunset anyone had ever seen. Friends from all across the cloud kingdom gathered to watch.

Cinnamoroll smiled, surrounded by his friends old and new. His selfless wish had brought everyone together.

THE END - Best Ending! 🌟`,
                isEnding: true,
                endingType: 'best',
                choices: []
            },
            gift_ending: {
                id: 'gift_ending',
                scene: '🎁 🐰 ✨',
                content: `The Star Keeper touched Cinnamoroll's ears gently, and they began to glow with a soft light.

"From now on, your ears will always help you find those who need kindness," said the Star Keeper.

Cinnamoroll thanked him and flew home, ready for many more adventures to come!

THE END - Gift Ending! 🎁`,
                isEnding: true,
                endingType: 'good',
                choices: []
            },
            festival_ending: {
                id: 'festival_ending',
                scene: '🎉 🐰 🎆',
                content: `The Cloud Festival was magical! There were fireworks made of rainbows, games on bouncy clouds, and the most delicious cloud candy.

Cinnamoroll danced, laughed, and made many new friends. The Cloud Queen crowned him "Honorary Friend of the Clouds."

THE END - Festival Ending! 🎉`,
                isEnding: true,
                endingType: 'good',
                choices: []
            },
            good_ending_butterfly: {
                id: 'good_ending_butterfly',
                scene: '🦋 🐰 💃',
                content: `Cinnamoroll joined the butterfly dance, twirling and floating through the air. The flowers swayed in rhythm, and the whole garden seemed to celebrate.

As the sun began to set, Flutter and her friends led Cinnamoroll back home, filling the sky with beautiful colors.

THE END - Butterfly Dance Ending! 🦋`,
                isEnding: true,
                endingType: 'good',
                choices: []
            },
            good_ending_explore: {
                id: 'good_ending_explore',
                scene: '🌅 🐰 ☁️',
                content: `Cinnamoroll thanked the kind bees for their hospitality and continued his journey. He discovered many more wonders in the cloud kingdom before finally returning home.

That night, he fell asleep with a smile, dreaming of all the friends he had made.

THE END - Explorer Ending! 🔍`,
                isEnding: true,
                endingType: 'good',
                choices: []
            },
            honey_ending: {
                id: 'honey_ending',
                scene: '🍯 🐰 🐝',
                content: `The cloud honey was the most delicious thing Cinnamoroll had ever tasted! It was sweet like sunshine and fluffy like clouds.

The bees gave him a small jar to take home. Every morning after that, Cinnamoroll would have honey on his cloud pancakes!

THE END - Sweet Honey Ending! 🍯`,
                isEnding: true,
                endingType: 'good',
                choices: []
            }
        }
    },
    'rainbow-quest': {
        title: 'Rainbow Quest',
        startNode: 'rq_start',
        nodes: {
            rq_start: {
                id: 'rq_start',
                scene: '🌧️ 🐰 😢',
                content: `One day, Cinnamoroll noticed that all the colors had faded from the rainbow! The sky looked gray and sad.

"Oh no!" cried Cinnamoroll. "The rainbow needs our help!"

He decided to go on a quest to find the missing colors and restore the rainbow's beauty.`,
                choices: [
                    { text: 'Search for the red color', icon: '🔴', nextId: 'find_red' },
                    { text: 'Ask the wise owl for help', icon: '🦉', nextId: 'ask_owl' }
                ],
                question: {
                    text: 'What problem did Cinnamoroll discover?',
                    options: ['Lost treasure', 'Faded rainbow colors', 'Missing friends', 'Broken bridge'],
                    answer: 1
                }
            },
            find_red: {
                id: 'find_red',
                scene: '🔴 🐰 🍎',
                content: `Cinnamoroll flew to the Apple Orchard Clouds, where everything was bright red! The trees were full of shiny apples.

"Hello!" said a friendly apple. "Are you looking for the red color? It's been hiding in the deepest part of the orchard!"`,
                choices: [
                    { text: 'Search the deep orchard', icon: '🌳', nextId: 'red_found', item: 'red_gem' },
                    { text: 'Pick some apples first', icon: '🍎', nextId: 'pick_apples' }
                ],
                question: {
                    text: 'What kind of clouds did Cinnamoroll visit first?',
                    options: ['Banana clouds', 'Apple Orchard Clouds', 'Grape clouds', 'Orange clouds'],
                    answer: 1
                }
            },
            ask_owl: {
                id: 'ask_owl',
                scene: '🦉 🐰 📚',
                content: `The wise old owl lived in the Library Cloud, surrounded by ancient books about rainbow magic.

"To restore the rainbow," hooted the owl, "you must collect all seven color gems. Each gem is hidden in a special place."`,
                choices: [
                    { text: 'Start collecting gems', icon: '💎', nextId: 'find_red' },
                    { text: 'Read more about rainbows', icon: '📖', nextId: 'rainbow_lore', item: 'knowledge_badge' }
                ],
                question: {
                    text: 'Where did the wise owl live?',
                    options: ['In a tree', 'In the Library Cloud', 'In a cave', 'On a mountain'],
                    answer: 1
                }
            },
            red_found: {
                id: 'red_found',
                scene: '🔴 🐰 ✨',
                content: `Deep in the orchard, Cinnamoroll found a glowing red gem! As he touched it, warm feelings of love and courage filled his heart.

"One down, six to go!" he cheered. The gem floated up and attached itself to the faded rainbow.`,
                choices: [
                    { text: 'Find the orange gem next', icon: '🟠', nextId: 'find_orange' },
                    { text: 'Rest under an apple tree', icon: '😴', nextId: 'rest_apple' }
                ],
                question: {
                    text: 'What feelings did the red gem bring?',
                    options: ['Sadness and fear', 'Love and courage', 'Hunger and sleep', 'Anger and confusion'],
                    answer: 1
                }
            },
            pick_apples: {
                id: 'pick_apples',
                scene: '🍎 🐰 🧺',
                content: `Cinnamoroll picked the most beautiful apples and put them in a basket. The trees thanked him for being so gentle with their fruit.

"Take this basket of apples," they said. "They'll give you energy for your quest!"`,
                choices: [
                    { text: 'Continue to the deep orchard', icon: '🌳', nextId: 'red_found', item: 'apple_basket' }
                ],
                question: {
                    text: 'Why did the trees give Cinnamoroll apples?',
                    options: ['To sell them', 'For energy on his quest', 'For decoration', 'To plant more trees'],
                    answer: 1
                }
            },
            rainbow_lore: {
                id: 'rainbow_lore',
                scene: '📖 🐰 🌈',
                content: `Cinnamoroll learned amazing things about rainbows! They're actually made of hopes and dreams from everyone in the world. When people are happy, rainbows shine brighter.

The owl gave him a special badge for being such a good learner.`,
                choices: [
                    { text: 'Begin the gem quest', icon: '💎', nextId: 'find_red' }
                ],
                question: {
                    text: 'What are rainbows made of, according to the book?',
                    options: ['Water and light', 'Hopes and dreams', 'Paint', 'Magic powder'],
                    answer: 1
                }
            },
            find_orange: {
                id: 'find_orange',
                scene: '🟠 🐰 🍊',
                content: `The Orange Citrus Fields were warm and sunny! Orange trees stretched as far as the eye could see, and the air smelled wonderful.

A group of singing birds pointed the way to the orange gem.`,
                choices: [
                    { text: 'Follow the birds', icon: '🐦', nextId: 'orange_found', item: 'orange_gem' }
                ],
                question: {
                    text: 'Who helped Cinnamoroll find the orange gem?',
                    options: ['Fish', 'Singing birds', 'Cats', 'Frogs'],
                    answer: 1
                }
            },
            rest_apple: {
                id: 'rest_apple',
                scene: '😴 🐰 🌳',
                content: `Cinnamoroll took a short nap under the apple tree. He dreamed of all the colors of the rainbow dancing together in harmony.

When he woke up, he felt refreshed and ready to continue his quest!`,
                choices: [
                    { text: 'Continue the quest', icon: '➡️', nextId: 'find_orange' }
                ],
                question: {
                    text: 'What did Cinnamoroll dream about?',
                    options: ['Food', 'Colors dancing together', 'Flying', 'Swimming'],
                    answer: 1
                }
            },
            orange_found: {
                id: 'orange_found',
                scene: '🟠 🐰 ✨',
                content: `The orange gem was hidden inside a giant orange! When Cinnamoroll found it, feelings of creativity and joy filled his heart.

Two colors were now restored to the rainbow! It was starting to look beautiful again.

"You're doing great!" cheered the birds. "Keep going!"`,
                choices: [
                    { text: 'Continue collecting gems', icon: '💎', nextId: 'rainbow_complete' }
                ],
                question: {
                    text: 'Where was the orange gem hidden?',
                    options: ['Under a rock', 'Inside a giant orange', 'In a cloud', 'Behind a tree'],
                    answer: 1
                }
            },
            rainbow_complete: {
                id: 'rainbow_complete',
                scene: '🌈 🐰 🎉',
                content: `After many adventures, Cinnamoroll collected all seven color gems: red, orange, yellow, green, blue, indigo, and violet!

As the last gem floated into place, the rainbow burst into brilliant colors! Everyone in the cloud kingdom came out to celebrate.

"Thank you, Cinnamoroll!" they cheered. "You saved our rainbow!"

THE END - Rainbow Hero Ending! 🌈`,
                isEnding: true,
                endingType: 'best',
                choices: []
            }
        }
    }
};

// ==================== Utility Classes ====================
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
}

// ==================== Story Engine ====================
class StoryEngine {
    constructor(storyData) {
        if (!storyData || !storyData.nodes) {
            throw new Error('Invalid story data provided');
        }
        
        this.story = storyData;
        this.currentNodeId = storyData.startNode || 'start';
        this.inventory = [];
        this.history = [];
        this.questionsAnswered = 0;
        this.questionsCorrect = 0;
    }
    
    /**
     * Gets the current story node
     * @returns {Object|null} Current node
     */
    getCurrentNode() {
        return this.story.nodes[this.currentNodeId] || null;
    }
    
    /**
     * Makes a choice and advances the story
     * @param {number} choiceIndex - Index of the choice
     * @returns {Object|null} New current node
     */
    makeChoice(choiceIndex) {
        const node = this.getCurrentNode();
        if (!node || !node.choices || !node.choices[choiceIndex]) {
            return null;
        }
        
        const choice = node.choices[choiceIndex];
        
        // Add item if choice grants one
        if (choice.item) {
            this.inventory.push(choice.item);
        }
        
        // Record history
        this.history.push({
            nodeId: this.currentNodeId,
            choice: choiceIndex,
            timestamp: Date.now()
        });
        
        // Move to next node
        this.currentNodeId = choice.nextId;
        
        return this.getCurrentNode();
    }
    
    /**
     * Checks answer for current node's question
     * @param {number} answerIndex - Index of the answer
     * @returns {Object} Result of the answer check
     */
    checkAnswer(answerIndex) {
        const node = this.getCurrentNode();
        if (!node || !node.question) {
            return { correct: false, message: 'No question available' };
        }
        
        this.questionsAnswered++;
        const correct = answerIndex === node.question.answer;
        
        if (correct) {
            this.questionsCorrect++;
        }
        
        return {
            correct,
            correctAnswer: node.question.options[node.question.answer],
            userAnswer: node.question.options[answerIndex]
        };
    }
    
    /**
     * Checks if current node is an ending
     * @returns {boolean} Whether current node is an ending
     */
    isEnding() {
        const node = this.getCurrentNode();
        return node?.isEnding === true;
    }
    
    /**
     * Gets story progress as percentage
     * @returns {number} Progress percentage (0-100)
     */
    getProgress() {
        const totalNodes = Object.keys(this.story.nodes).length;
        const visitedNodes = new Set(this.history.map(h => h.nodeId)).size + 1; // +1 for current
        return Math.min(100, Math.round((visitedNodes / totalNodes) * 100));
    }
    
    /**
     * Gets game statistics
     * @returns {Object} Statistics object
     */
    getStats() {
        return {
            nodesVisited: this.history.length + 1,
            itemsCollected: this.inventory.length,
            questionsAnswered: this.questionsAnswered,
            questionsCorrect: this.questionsCorrect,
            accuracy: this.questionsAnswered > 0 
                ? Math.round((this.questionsCorrect / this.questionsAnswered) * 100) 
                : 0
        };
    }
}

// ==================== Dialogue System ====================
class DialogueSystem {
    constructor(container, speed = 50) {
        this.container = container;
        this.speed = speed;
        this.currentAnimation = null;
        this.currentText = '';
    }
    
    /**
     * Displays text with typewriter effect
     * @param {string} text - Text to display
     * @returns {Promise} Promise that resolves when animation completes
     */
    async displayText(text) {
        // Cancel any existing animation
        this.skipToEnd();
        
        this.currentText = text;
        if (!this.container) return Promise.resolve();
        
        this.container.textContent = '';
        
        if (this.speed === 0) {
            this.container.textContent = text;
            return Promise.resolve();
        }
        
        let index = 0;
        
        return new Promise(resolve => {
            this.currentAnimation = setInterval(() => {
                if (index < text.length) {
                    this.container.textContent += text[index];
                    index++;
                } else {
                    clearInterval(this.currentAnimation);
                    this.currentAnimation = null;
                    resolve();
                }
            }, this.speed);
        });
    }
    
    /**
     * Skips typewriter animation and shows full text
     */
    skipToEnd() {
        if (this.currentAnimation) {
            clearInterval(this.currentAnimation);
            this.currentAnimation = null;
        }
        if (this.container && this.currentText) {
            this.container.textContent = this.currentText;
        }
    }
    
    /**
     * Sets text speed
     * @param {number} speed - Milliseconds per character
     */
    setSpeed(speed) {
        this.speed = Math.max(0, speed);
    }
    
    /**
     * Checks if animation is currently running
     * @returns {boolean} Whether animation is running
     */
    isAnimating() {
        return this.currentAnimation !== null;
    }
}

// ==================== Main Game Class ====================
class StoryCloudGame {
    constructor() {
        // Audio system - safely initialize
        this.audio = typeof gameAudio !== 'undefined' ? gameAudio : null;
        this.musicEnabled = true;
        this.sfxEnabled = true;
        
        // Game state
        this.difficulty = 1;
        this.currentStoryId = 'cloud-adventure';
        this.storyEngine = null;
        this.dialogueSystem = null;
        this.isPlaying = false;
        this.score = 0;
        this.textSpeedIndex = 1; // 0=slow, 1=normal, 2=fast, 3=instant
        
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
     * Initializes DOM element references
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
            storySelect: getElement('story-select'),
            startBtn: getElement('start-btn'),
            storiesCompleted: getElement('stories-completed'),
            chapterDisplay: getElement('chapter-display'),
            progressBar: getElement('progress-bar'),
            inventoryDisplay: getElement('inventory-display'),
            storyScene: getElement('story-scene'),
            storyContent: getElement('story-content'),
            choicesContainer: getElement('choices-container'),
            questionArea: getElement('question-area'),
            questionText: getElement('question-text'),
            answerOptions: getElement('answer-options'),
            textSpeedBtn: getElement('text-speed-btn'),
            inventoryBtn: getElement('inventory-btn'),
            homeBtn: getElement('home-btn'),
            inventoryModal: getElement('inventory-modal'),
            inventoryItems: getElement('inventory-items'),
            closeInventoryBtn: getElement('close-inventory-btn'),
            feedbackOverlay: getElement('feedback-overlay'),
            feedbackIcon: getElement('feedback-icon'),
            feedbackText: getElement('feedback-text'),
            playAgainBtn: getElement('play-again-btn'),
            homeResultBtn: getElement('home-result-btn'),
            resultTitle: getElement('result-title'),
            endingText: getElement('ending-text'),
            finalScore: getElement('final-score'),
            questionsCorrect: getElement('questions-correct'),
            itemsCollected: getElement('items-collected'),
            accuracyDisplay: getElement('accuracy-display'),
            starRating: getElement('star-rating')
        };
    }
    
    /**
     * Initializes the game
     */
    init() {
        this.loadProgress();
        this.setupEventListeners();
    }
    
    /**
     * Sets up event listeners
     */
    setupEventListeners() {
        // Start screen
        this.elements.startBtn?.addEventListener('click', () => this.startGame());
        
        // Game controls
        this.elements.textSpeedBtn?.addEventListener('click', () => this.cycleTextSpeed());
        this.elements.inventoryBtn?.addEventListener('click', () => this.showInventory());
        this.elements.homeBtn?.addEventListener('click', () => this.confirmGoHome());
        this.elements.closeInventoryBtn?.addEventListener('click', () => this.hideInventory());
        
        // Result screen
        this.elements.playAgainBtn?.addEventListener('click', () => this.startGame());
        this.elements.homeResultBtn?.addEventListener('click', () => this.goHome());
        
        // Click to skip text animation
        document.getElementById('story-area')?.addEventListener('click', () => {
            if (this.dialogueSystem?.isAnimating()) {
                this.dialogueSystem.skipToEnd();
            }
        });
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
     * Loads saved progress
     */
    loadProgress() {
        try {
            const saved = localStorage.getItem(STORY_CONFIG.LEADERBOARD_KEY);
            const data = saved ? JSON.parse(saved) : { storiesCompleted: 0 };
            if (this.elements.storiesCompleted) {
                this.elements.storiesCompleted.textContent = data.storiesCompleted || 0;
            }
        } catch (e) {
            console.warn('Could not load progress:', e);
        }
    }
    
    /**
     * Saves progress
     * @param {boolean} completed - Whether story was completed
     */
    saveProgress(completed = false) {
        try {
            const saved = localStorage.getItem(STORY_CONFIG.LEADERBOARD_KEY);
            const data = saved ? JSON.parse(saved) : { storiesCompleted: 0 };
            
            if (completed) {
                data.storiesCompleted = (data.storiesCompleted || 0) + 1;
            }
            
            localStorage.setItem(STORY_CONFIG.LEADERBOARD_KEY, JSON.stringify(data));
        } catch (e) {
            console.warn('Could not save progress:', e);
        }
    }
    
    /**
     * Starts a new game
     */
    startGame() {
        // Start background music with defensive programming
        if (this.audio && this.musicEnabled) {
            try {
                this.audio.ensureReady();
                this.audio.playMusic('story');
            } catch (e) {
                console.warn('Audio not available:', e);
            }
        }
        
        // Get settings from PlayerManager age
        let age = 16;
        if (typeof PlayerManager !== 'undefined' && PlayerManager.hasActivePlayer()) {
            age = PlayerManager.getPlayerAge() || 16;
        }
        this.difficulty = getDifficultyFromAge(age);
        this.currentStoryId = this.elements.storySelect?.value || 'cloud-adventure';
        
        const settings = STORY_CONFIG.DIFFICULTY_SETTINGS[this.difficulty];
        
        // Get story data
        const storyData = STORY_DATA[this.currentStoryId];
        if (!storyData) {
            console.error('Story not found:', this.currentStoryId);
            return;
        }
        
        // Initialize story engine
        this.storyEngine = new StoryEngine(storyData);
        
        // Initialize dialogue system with appropriate speed
        const speedValues = [
            STORY_CONFIG.TEXT_SPEED.slow,
            STORY_CONFIG.TEXT_SPEED.normal,
            STORY_CONFIG.TEXT_SPEED.fast,
            STORY_CONFIG.TEXT_SPEED.instant
        ];
        this.dialogueSystem = new DialogueSystem(
            this.elements.storyContent,
            speedValues[this.textSpeedIndex]
        );
        
        // Reset game state
        this.score = 0;
        this.isPlaying = true;
        
        // Update UI
        this.showScreen('game');
        this.renderCurrentNode();
    }
    
    /**
     * Renders the current story node
     */
    async renderCurrentNode() {
        const node = this.storyEngine?.getCurrentNode();
        if (!node) return;
        
        // Update header
        this.updateHeader();
        
        // Update scene
        if (this.elements.storyScene) {
            this.elements.storyScene.textContent = node.scene || '☁️ 🐰 ☁️';
        }
        
        // Clear choices while text animates
        if (this.elements.choicesContainer) {
            this.elements.choicesContainer.innerHTML = '';
        }
        
        // Display story text with typewriter effect
        await this.dialogueSystem?.displayText(node.content);
        
        // Check if ending
        if (node.isEnding) {
            setTimeout(() => this.endStory(node), 1500);
            return;
        }
        
        // Show question if exists
        if (node.question) {
            this.showQuestion(node.question);
        } else {
            // Show choices
            this.renderChoices(node.choices);
        }
    }
    
    /**
     * Updates the header display
     */
    updateHeader() {
        const node = this.storyEngine?.getCurrentNode();
        const progress = this.storyEngine?.getProgress() || 0;
        
        if (this.elements.chapterDisplay) {
            this.elements.chapterDisplay.textContent = node?.id || 'Story';
        }
        
        if (this.elements.progressBar) {
            this.elements.progressBar.style.width = `${progress}%`;
        }
        
        if (this.elements.inventoryDisplay) {
            const itemCount = this.storyEngine?.inventory?.length || 0;
            this.elements.inventoryDisplay.textContent = `🎒 ${itemCount}`;
        }
    }
    
    /**
     * Renders choice buttons
     * @param {Array} choices - Array of choice objects
     */
    renderChoices(choices) {
        if (!this.elements.choicesContainer || !choices) return;
        
        this.elements.choicesContainer.innerHTML = '';
        
        choices.forEach((choice, index) => {
            const btn = document.createElement('button');
            btn.className = 'choice-btn';
            btn.innerHTML = `
                <span class="choice-icon">${choice.icon || '➡️'}</span>
                <span class="choice-text">${choice.text}</span>
            `;
            btn.addEventListener('click', () => this.makeChoice(index));
            this.elements.choicesContainer.appendChild(btn);
        });
    }
    
    /**
     * Makes a story choice
     * @param {number} choiceIndex - Index of the choice
     */
    makeChoice(choiceIndex) {
        if (!this.isPlaying) return;
        
        const node = this.storyEngine?.makeChoice(choiceIndex);
        if (node) {
            this.renderCurrentNode();
        }
    }
    
    /**
     * Shows a comprehension question
     * @param {Object} question - Question object
     */
    showQuestion(question) {
        if (!this.elements.questionArea || !question) return;
        
        if (this.elements.questionText) {
            this.elements.questionText.textContent = question.text;
        }
        
        if (this.elements.answerOptions) {
            this.elements.answerOptions.innerHTML = '';
            
            question.options.forEach((option, index) => {
                const btn = document.createElement('button');
                btn.className = 'answer-btn';
                btn.textContent = option;
                btn.addEventListener('click', () => this.answerQuestion(index));
                this.elements.answerOptions.appendChild(btn);
            });
        }
        
        this.elements.questionArea.classList.remove('hidden');
    }
    
    /**
     * Handles question answer
     * @param {number} answerIndex - Index of the answer
     */
    answerQuestion(answerIndex) {
        const result = this.storyEngine?.checkAnswer(answerIndex);
        if (!result) return;
        
        // Highlight correct/wrong answers
        const buttons = this.elements.answerOptions?.querySelectorAll('.answer-btn');
        buttons?.forEach((btn, index) => {
            btn.disabled = true;
            if (index === this.storyEngine.getCurrentNode().question.answer) {
                btn.classList.add('correct');
            } else if (index === answerIndex && !result.correct) {
                btn.classList.add('wrong');
            }
        });
        
        // Update score
        if (result.correct) {
            this.score += 100;
        }
        
        // Show feedback and continue
        setTimeout(() => {
            this.elements.questionArea?.classList.add('hidden');
            this.renderChoices(this.storyEngine.getCurrentNode().choices);
        }, 1500);
    }
    
    /**
     * Cycles through text speed options
     */
    cycleTextSpeed() {
        this.textSpeedIndex = (this.textSpeedIndex + 1) % 4;
        
        const speeds = ['🐢', '⏩', '⏭️', '💨'];
        if (this.elements.textSpeedBtn) {
            this.elements.textSpeedBtn.textContent = speeds[this.textSpeedIndex];
        }
        
        const speedValues = [
            STORY_CONFIG.TEXT_SPEED.slow,
            STORY_CONFIG.TEXT_SPEED.normal,
            STORY_CONFIG.TEXT_SPEED.fast,
            STORY_CONFIG.TEXT_SPEED.instant
        ];
        
        this.dialogueSystem?.setSpeed(speedValues[this.textSpeedIndex]);
    }
    
    /**
     * Shows inventory modal
     */
    showInventory() {
        if (!this.elements.inventoryModal || !this.elements.inventoryItems) return;
        
        const inventory = this.storyEngine?.inventory || [];
        
        this.elements.inventoryItems.innerHTML = '';
        
        if (inventory.length === 0) {
            this.elements.inventoryItems.innerHTML = '<p>No items yet!</p>';
        } else {
            const itemIcons = {
                golden_star: '⭐',
                flower_crown: '👑',
                honey_jar: '🍯',
                apple_basket: '🍎',
                red_gem: '🔴',
                orange_gem: '🟠',
                knowledge_badge: '📚'
            };
            
            inventory.forEach(item => {
                const itemEl = document.createElement('div');
                itemEl.className = 'inventory-item';
                itemEl.innerHTML = `
                    <span class="item-icon">${itemIcons[item] || '📦'}</span>
                    <span>${item.replace(/_/g, ' ')}</span>
                `;
                this.elements.inventoryItems.appendChild(itemEl);
            });
        }
        
        this.elements.inventoryModal.classList.remove('hidden');
    }
    
    /**
     * Hides inventory modal
     */
    hideInventory() {
        this.elements.inventoryModal?.classList.add('hidden');
    }
    
    /**
     * Confirms going home
     */
    confirmGoHome() {
        if (confirm('Are you sure you want to leave? Your progress will be lost.')) {
            this.goHome();
        }
    }
    
    /**
     * Shows feedback overlay
     * @param {boolean} isCorrect - Whether answer was correct
     * @param {string} message - Message to display
     */
    showFeedback(isCorrect, message) {
        if (!this.elements.feedbackOverlay) return;
        
        if (this.elements.feedbackIcon) {
            this.elements.feedbackIcon.textContent = isCorrect ? '✅' : '❌';
        }
        if (this.elements.feedbackText) {
            this.elements.feedbackText.textContent = message;
        }
        
        this.elements.feedbackOverlay.classList.remove('hidden');
        
        setTimeout(() => {
            this.elements.feedbackOverlay?.classList.add('hidden');
        }, 1500);
    }
    
    /**
     * Ends the story
     * @param {Object} endingNode - The ending node
     */
    endStory(endingNode) {
        this.isPlaying = false;
        
        const stats = this.storyEngine?.getStats() || {};
        const endingType = endingNode?.endingType || 'good';
        
        // Calculate stars
        let stars = 1;
        if (stats.accuracy >= 80) stars++;
        if (stats.itemsCollected >= 2) stars++;
        if (endingType === 'best') stars = 3;
        
        // Calculate final score
        this.score += stats.itemsCollected * 50;
        if (endingType === 'best') this.score += 200;
        
        // Update result screen
        if (this.elements.resultTitle) {
            const titles = {
                best: '🌟 Perfect Adventure! 🌟',
                good: '🎉 Story Complete! 🎉'
            };
            this.elements.resultTitle.textContent = titles[endingType] || 'The End!';
        }
        
        if (this.elements.endingText) {
            this.elements.endingText.textContent = endingNode?.content?.split('\n\n').pop() || 'You reached an ending!';
        }
        
        if (this.elements.finalScore) {
            this.elements.finalScore.textContent = this.score.toString();
        }
        if (this.elements.questionsCorrect) {
            this.elements.questionsCorrect.textContent = `${stats.questionsCorrect}/${stats.questionsAnswered}`;
        }
        if (this.elements.itemsCollected) {
            this.elements.itemsCollected.textContent = stats.itemsCollected.toString();
        }
        if (this.elements.accuracyDisplay) {
            this.elements.accuracyDisplay.textContent = `${stats.accuracy}%`;
        }
        
        // Update stars
        if (this.elements.starRating) {
            const starEls = this.elements.starRating.querySelectorAll('.star');
            starEls.forEach((star, index) => {
                setTimeout(() => {
                    star.classList.toggle('earned', index < stars);
                }, index * 300);
            });
        }
        
        // Save progress
        this.saveProgress(true);
        this.loadProgress();
        
        this.showScreen('result');
    }
    
    /**
     * Returns to home screen
     */
    goHome() {
        // Stop music when going home
        if (this.audio) {
            try {
                this.audio.stopMusic();
            } catch (e) {
                console.warn('Audio stop failed:', e);
            }
        }
        
        this.isPlaying = false;
        this.storyEngine = null;
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
}

// ==================== Initialize Game ====================
document.addEventListener('DOMContentLoaded', () => {
    try {
        window.game = new StoryCloudGame();
    } catch (error) {
        console.error('Failed to initialize Story Cloud game:', error);
    }
});
