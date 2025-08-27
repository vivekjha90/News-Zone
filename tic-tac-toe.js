// Tic Tac Toe Game Implementation
class TicTacToeGame {
    constructor() {
        this.board = ['', '', '', '', '', '', '', '', ''];
        this.currentPlayer = 'X';
        this.gameActive = true;
        this.scoreX = 0;
        this.scoreO = 0;
        this.cells = [];
        this.winningConditions = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
            [0, 4, 8], [2, 4, 6] // diagonals
        ];
    }

    init() {
        this.cells = document.querySelectorAll('.cell');
        this.cells.forEach((cell, index) => {
            cell.addEventListener('click', () => this.handleCellClick(index));
        });
        this.updateStatus();
    }

    handleCellClick(index) {
        if (this.board[index] !== '' || !this.gameActive) {
            return;
        }

        this.board[index] = this.currentPlayer;
        this.updateCell(index);
        
        if (this.checkWin()) {
            this.handleWin();
        } else if (this.checkDraw()) {
            this.handleDraw();
        } else {
            this.switchPlayer();
        }
    }

    updateCell(index) {
        const cell = this.cells[index];
        cell.textContent = this.currentPlayer;
        cell.classList.add(this.currentPlayer.toLowerCase());
    }

    checkWin() {
        return this.winningConditions.some(condition => {
            const [a, b, c] = condition;
            if (this.board[a] && this.board[a] === this.board[b] && this.board[a] === this.board[c]) {
                this.winningCells = condition;
                return true;
            }
            return false;
        });
    }

    checkDraw() {
        return this.board.every(cell => cell !== '');
    }

    handleWin() {
        this.gameActive = false;
        
        // Highlight winning cells
        this.winningCells.forEach(index => {
            this.cells[index].classList.add('winning');
        });

        // Update score
        if (this.currentPlayer === 'X') {
            this.scoreX++;
            document.getElementById('score-x').textContent = this.scoreX;
        } else {
            this.scoreO++;
            document.getElementById('score-o').textContent = this.scoreO;
        }

        document.getElementById('current-player-text').textContent = `Player ${this.currentPlayer} Wins! 🎉`;
        
        // Show celebration
        this.showCelebration();
        
        // Auto restart after delay
        setTimeout(() => {
            this.restartGame();
        }, 3000);
    }

    handleDraw() {
        this.gameActive = false;
        document.getElementById('current-player-text').textContent = "It's a Draw! 🤝";
        
        setTimeout(() => {
            this.restartGame();
        }, 2000);
    }

    switchPlayer() {
        this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';
        this.updateStatus();
    }

    updateStatus() {
        document.getElementById('current-player-text').textContent = `Player ${this.currentPlayer}'s Turn`;
    }

    restartGame() {
        this.board = ['', '', '', '', '', '', '', '', ''];
        this.currentPlayer = 'X';
        this.gameActive = true;
        this.winningCells = [];

        this.cells.forEach(cell => {
            cell.textContent = '';
            cell.classList.remove('x', 'o', 'winning');
        });

        this.updateStatus();
    }

    resetScore() {
        this.scoreX = 0;
        this.scoreO = 0;
        document.getElementById('score-x').textContent = '0';
        document.getElementById('score-o').textContent = '0';
        this.restartGame();
    }

    showCelebration() {
        // Add some celebration effects
        const modal = document.querySelector('.tic-tac-toe-content');
        modal.style.animation = 'celebrate 0.6s ease';
        
        setTimeout(() => {
            modal.style.animation = '';
        }, 600);
    }
}

// Global game instance
let ticTacToeGame;

// Global functions for navigation and game control
function showTicTacToeGame() {
    // Update navigation
    document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
    document.getElementById('game').classList.add('active');
    
    // Hide other pages
    const newsPage = document.getElementById('news-page');
    const geetaPage = document.getElementById('bhagavad-geeta-page');
    if (newsPage) newsPage.classList.add('hidden');
    if (geetaPage) geetaPage.classList.add('hidden');
    
    // Show game modal
    const modal = document.getElementById('tic-tac-toe-modal');
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    
    setTimeout(() => {
        modal.classList.add('active');
    }, 50);
    
    // Initialize game
    if (!ticTacToeGame) {
        ticTacToeGame = new TicTacToeGame();
        ticTacToeGame.init();
    }
    
    // Show toast notification
    if (typeof authManager !== 'undefined') {
        authManager.showToast('success', 'Game Loaded', 'Tic Tac Toe is ready to play!');
    }
}

function closeTicTacToeGame() {
    const modal = document.getElementById('tic-tac-toe-modal');
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
    
    setTimeout(() => {
        modal.classList.add('hidden');
    }, 400);
    
    // Reset navigation
    document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
    document.getElementById('ipl').classList.add('active');
    
    // Show news page
    const newsPage = document.getElementById('news-page');
    if (newsPage) newsPage.classList.remove('hidden');
}

function restartGame() {
    if (ticTacToeGame) {
        ticTacToeGame.restartGame();
    }
}

function resetScore() {
    if (ticTacToeGame) {
        ticTacToeGame.resetScore();
    }
}

// Add celebration animation
const style = document.createElement('style');
style.textContent = `
    @keyframes celebrate {
        0%, 100% { transform: scale(1); }
        25% { transform: scale(1.05) rotate(2deg); }
        75% { transform: scale(1.05) rotate(-2deg); }
    }
`;
document.head.appendChild(style);

// Close game with ESC key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        const modal = document.getElementById('tic-tac-toe-modal');
        if (modal && modal.classList.contains('active')) {
            closeTicTacToeGame();
        }
    }
});
