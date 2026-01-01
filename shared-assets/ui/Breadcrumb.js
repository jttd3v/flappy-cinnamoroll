/**
 * Breadcrumb.js - Navigation Breadcrumb Component
 * 
 * Creates consistent breadcrumb navigation across all games.
 * Auto-injects into page when script is loaded.
 * 
 * @version 1.0.0
 */

const Breadcrumb = (function() {
    'use strict';
    
    // ==========================================
    // GAME METADATA
    // ==========================================
    
    const GAME_NAMES = {
        'flappy-cinnamoroll': 'Flappy Cinnamoroll',
        'treasure-chest-memory': 'Memory Match',
        'star-counter': 'Star Counter',
        'pattern-rainbow': 'Pattern Rainbow',
        'quiz-quest': 'Quiz Quest',
        'candy-shop': 'Candy Shop',
        'story-cloud': 'Story Cloud',
        'dream-journal': 'Dream Journal',
        'cloud-kingdom': 'Cloud Kingdom',
        'puzzle-path': 'Puzzle Path',
        'career-clouds': 'Career Clouds'
    };
    
    // ==========================================
    // STYLES
    // ==========================================
    
    const STYLES = `
        .game-breadcrumb {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            background: rgba(255, 255, 255, 0.95);
            padding: 8px 16px;
            display: flex;
            align-items: center;
            gap: 8px;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            font-size: 14px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
            z-index: 9999;
        }
        
        .game-breadcrumb a {
            color: #87CEEB;
            text-decoration: none;
            display: flex;
            align-items: center;
            gap: 4px;
            transition: color 0.2s;
        }
        
        .game-breadcrumb a:hover {
            color: #FFB6C1;
        }
        
        .game-breadcrumb .separator {
            color: #ccc;
            user-select: none;
        }
        
        .game-breadcrumb .current {
            color: #FFB6C1;
            font-weight: 500;
        }
        
        .game-breadcrumb .player-info {
            margin-left: auto;
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 12px;
            color: #888;
        }
        
        .game-breadcrumb .player-name {
            background: #E6E6FA;
            padding: 4px 10px;
            border-radius: 12px;
            color: #6B5B95;
        }
        
        /* Adjust body padding to account for breadcrumb */
        body.has-breadcrumb {
            padding-top: 44px !important;
        }
        
        /* Mobile responsiveness */
        @media (max-width: 480px) {
            .game-breadcrumb {
                font-size: 12px;
                padding: 6px 12px;
            }
            
            .game-breadcrumb .player-info {
                display: none;
            }
        }
    `;
    
    // ==========================================
    // PRIVATE METHODS
    // ==========================================
    
    /**
     * Get current game ID from URL
     */
    function getCurrentGameId() {
        const path = window.location.pathname;
        const match = path.match(/\/games\/([^\/]+)\//);
        if (match) return match[1];
        if (path.includes('index.html') && !path.includes('/games/')) {
            return 'flappy-cinnamoroll';
        }
        return null;
    }
    
    /**
     * Get launcher path based on current location
     */
    function getLauncherPath() {
        const path = window.location.pathname;
        if (path.includes('/games/')) {
            return '../../launcher.html';
        }
        return './launcher.html';
    }
    
    /**
     * Inject styles into page
     */
    function injectStyles() {
        if (document.getElementById('breadcrumb-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'breadcrumb-styles';
        style.textContent = STYLES;
        document.head.appendChild(style);
    }
    
    /**
     * Create breadcrumb element
     */
    function createBreadcrumb(gameId, gameName) {
        const nav = document.createElement('nav');
        nav.className = 'game-breadcrumb';
        nav.id = 'game-breadcrumb';
        
        // Home link
        const homeLink = document.createElement('a');
        homeLink.href = getLauncherPath();
        homeLink.innerHTML = '🏠 All Games';
        homeLink.addEventListener('click', (e) => {
            e.preventDefault();
            // Stop any audio before navigating
            if (typeof gameAudio !== 'undefined' && gameAudio.stopMusic) {
                try { gameAudio.stopMusic(); } catch(e) {}
            }
            window.location.href = getLauncherPath();
        });
        
        // Separator
        const separator = document.createElement('span');
        separator.className = 'separator';
        separator.textContent = '›';
        
        // Current game
        const current = document.createElement('span');
        current.className = 'current';
        current.textContent = gameName;
        
        // Player info
        const playerInfo = document.createElement('div');
        playerInfo.className = 'player-info';
        playerInfo.id = 'breadcrumb-player-info';
        
        // Check for player
        if (typeof PlayerManager !== 'undefined' && PlayerManager.hasActivePlayer()) {
            const player = PlayerManager.getCurrentPlayer();
            playerInfo.innerHTML = `
                <span>Playing as:</span>
                <span class="player-name">👤 ${player.name}</span>
            `;
        }
        
        nav.appendChild(homeLink);
        nav.appendChild(separator);
        nav.appendChild(current);
        nav.appendChild(playerInfo);
        
        return nav;
    }
    
    // ==========================================
    // PUBLIC API
    // ==========================================
    
    return {
        /**
         * Initialize breadcrumb
         * Auto-detects game and injects breadcrumb
         */
        init: function() {
            // Don't add to launcher itself
            if (window.location.pathname.includes('launcher.html')) {
                return;
            }
            
            const gameId = getCurrentGameId();
            if (!gameId) {
                console.log('Breadcrumb: Not on a game page');
                return;
            }
            
            const gameName = GAME_NAMES[gameId] || 'Game';
            
            // Inject styles
            injectStyles();
            
            // Remove existing breadcrumb if any
            const existing = document.getElementById('game-breadcrumb');
            if (existing) existing.remove();
            
            // Create and insert breadcrumb
            const breadcrumb = createBreadcrumb(gameId, gameName);
            document.body.insertBefore(breadcrumb, document.body.firstChild);
            
            // Add body class for padding
            document.body.classList.add('has-breadcrumb');
            
            console.log('Breadcrumb: Initialized for', gameName);
        },
        
        /**
         * Update player info in breadcrumb
         */
        updatePlayerInfo: function() {
            const playerInfo = document.getElementById('breadcrumb-player-info');
            if (!playerInfo) return;
            
            if (typeof PlayerManager !== 'undefined' && PlayerManager.hasActivePlayer()) {
                const player = PlayerManager.getCurrentPlayer();
                playerInfo.innerHTML = `
                    <span>Playing as:</span>
                    <span class="player-name">👤 ${player.name}</span>
                `;
            } else {
                playerInfo.innerHTML = '';
            }
        },
        
        /**
         * Get current game name
         */
        getCurrentGameName: function() {
            const gameId = getCurrentGameId();
            return GAME_NAMES[gameId] || null;
        },
        
        /**
         * Navigate to launcher
         */
        goHome: function() {
            // Stop audio
            if (typeof gameAudio !== 'undefined' && gameAudio.stopMusic) {
                try { gameAudio.stopMusic(); } catch(e) {}
            }
            window.location.href = getLauncherPath();
        }
    };
})();

// Auto-initialize when DOM is ready
if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => Breadcrumb.init());
    } else {
        Breadcrumb.init();
    }
}
