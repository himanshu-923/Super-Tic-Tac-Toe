class SuperTicTacToe {
    constructor() {
        this.currentPlayer = 'X';
        this.activeBoard = -1; // -1 means any board, 0-8 means specific board
        this.gameWon = false;
        
        // 9 small boards, each with 9 cells
        this.smallBoards = Array(9).fill(null).map(() => Array(9).fill(''));
        
        // Status of each small board: null (ongoing), 'X', 'O', 'draw'
        this.boardStatus = Array(9).fill(null);
        
        // The main board winner
        this.superBoardWinner = null;
        
        this.initializeGame();
    }
    
    initializeGame() {
        this.createGameBoard();
        this.updateDisplay();
        this.bindEvents();
    }
    
    createGameBoard() {
        const superBoard = document.getElementById('super-board');
        superBoard.innerHTML = '';
        
        for (let boardIndex = 0; boardIndex < 9; boardIndex++) {
            const smallBoard = document.createElement('div');
            smallBoard.className = 'small-board';
            smallBoard.setAttribute('data-board', boardIndex);
            
            for (let cellIndex = 0; cellIndex < 9; cellIndex++) {
                const cell = document.createElement('button');
                cell.className = 'cell';
                cell.setAttribute('data-board', boardIndex);
                cell.setAttribute('data-cell', cellIndex);
                cell.addEventListener('click', () => this.makeMove(boardIndex, cellIndex));
                smallBoard.appendChild(cell);
            }
            
            superBoard.appendChild(smallBoard);
        }
    }
    
    makeMove(boardIndex, cellIndex) {
        // Check if move is valid
        if (!this.isValidMove(boardIndex, cellIndex)) {
            return;
        }
        
        // Make the move
        this.smallBoards[boardIndex][cellIndex] = this.currentPlayer;
        
        // Update the cell visually
        const cell = document.querySelector(`[data-board="${boardIndex}"][data-cell="${cellIndex}"]`);
        cell.textContent = this.currentPlayer;
        cell.className = `cell ${this.currentPlayer.toLowerCase()}`;
        cell.disabled = true;
        
        // Check if this move wins the small board
        const boardWinner = this.checkSmallBoardWinner(boardIndex);
        if (boardWinner) {
            this.boardStatus[boardIndex] = boardWinner;
            this.updateBoardDisplay(boardIndex);
        } else if (this.isSmallBoardFull(boardIndex)) {
            this.boardStatus[boardIndex] = 'draw';
            this.updateBoardDisplay(boardIndex);
        }
        
        // Check if someone won the super board
        this.superBoardWinner = this.checkSuperBoardWinner();
        if (this.superBoardWinner) {
            this.gameWon = true;
            this.endGame();
            return;
        }
        
        // Check for super board draw
        if (this.isSuperBoardFull()) {
            this.gameWon = true;
            this.endGame(true); // true for draw
            return;
        }
        
        // Determine next active board
        this.activeBoard = this.boardStatus[cellIndex] === null ? cellIndex : -1;
        
        // Switch players
        this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';
        
        this.updateDisplay();
    }
    
    isValidMove(boardIndex, cellIndex) {
        // Game must not be won
        if (this.gameWon) return false;
        
        // Cell must be empty
        if (this.smallBoards[boardIndex][cellIndex] !== '') return false;
        
        // Board must not be won or drawn
        if (this.boardStatus[boardIndex] !== null) return false;
        
        // Must be in active board (or any board if activeBoard is -1)
        if (this.activeBoard !== -1 && this.activeBoard !== boardIndex) return false;
        
        return true;
    }
    
    checkSmallBoardWinner(boardIndex) {
        const board = this.smallBoards[boardIndex];
        const lines = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
            [0, 4, 8], [2, 4, 6] // diagonals
        ];
        
        for (const [a, b, c] of lines) {
            if (board[a] && board[a] === board[b] && board[a] === board[c]) {
                return board[a];
            }
        }
        
        return null;
    }
    
    checkSuperBoardWinner() {
        const lines = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
            [0, 4, 8], [2, 4, 6] // diagonals
        ];
        
        for (const [a, b, c] of lines) {
            if (this.boardStatus[a] && 
                this.boardStatus[a] === this.boardStatus[b] && 
                this.boardStatus[a] === this.boardStatus[c] &&
                this.boardStatus[a] !== 'draw') {
                return this.boardStatus[a];
            }
        }
        
        return null;
    }
    
    isSmallBoardFull(boardIndex) {
        return this.smallBoards[boardIndex].every(cell => cell !== '');
    }
    
    isSuperBoardFull() {
        return this.boardStatus.every(status => status !== null);
    }
    
    updateBoardDisplay(boardIndex) {
        const boardElement = document.querySelector(`[data-board="${boardIndex}"]`);
        const status = this.boardStatus[boardIndex];
        
        if (status === 'draw') {
            boardElement.classList.add('draw');
        } else if (status) {
            boardElement.classList.add('won');
            
            // Add winner overlay
            const winnerOverlay = document.createElement('div');
            winnerOverlay.className = `board-winner ${status.toLowerCase()}`;
            winnerOverlay.textContent = status;
            boardElement.appendChild(winnerOverlay);
            
            // Disable all cells in this board
            const cells = boardElement.querySelectorAll('.cell');
            cells.forEach(cell => {
                cell.disabled = true;
            });
        }
    }
    
    updateDisplay() {
        // Update current player
        document.getElementById('current-player').textContent = this.currentPlayer;
        
        // Update active board
        const activeBoardText = this.activeBoard === -1 ? 'Any' : `Board ${this.activeBoard + 1}`;
        document.getElementById('active-board').textContent = activeBoardText;
        
        // Update board highlighting
        const allBoards = document.querySelectorAll('.small-board');
        allBoards.forEach((board, index) => {
            board.classList.remove('active');
            if (!this.gameWon && 
                (this.activeBoard === -1 || this.activeBoard === index) && 
                this.boardStatus[index] === null) {
                board.classList.add('active');
            }
        });
        
        // Update game status
        let statusText = '';
        if (this.gameWon) {
            if (this.superBoardWinner) {
                statusText = `🎉 Player ${this.superBoardWinner} wins the game! 🎉`;
                document.getElementById('game-status').className = 'game-status winner';
            } else {
                statusText = "It's a draw! 🤝";
            }
        } else {
            statusText = `Player ${this.currentPlayer}'s turn`;
            if (this.activeBoard !== -1) {
                statusText += ` - Play in board ${this.activeBoard + 1}`;
            }
        }
        document.getElementById('game-status').textContent = statusText;
    }
    
    endGame(isDraw = false) {
        this.gameWon = true;
        
        // Disable all remaining cells
        const allCells = document.querySelectorAll('.cell');
        allCells.forEach(cell => {
            if (!cell.disabled) {
                cell.disabled = true;
            }
        });
        
        // Remove active highlighting
        const allBoards = document.querySelectorAll('.small-board');
        allBoards.forEach(board => {
            board.classList.remove('active');
        });
        
        this.updateDisplay();
    }
    
    resetGame() {
        this.currentPlayer = 'X';
        this.activeBoard = -1;
        this.gameWon = false;
        this.smallBoards = Array(9).fill(null).map(() => Array(9).fill(''));
        this.boardStatus = Array(9).fill(null);
        this.superBoardWinner = null;
        
        // Remove winner class from game status
        document.getElementById('game-status').className = 'game-status';
        
        this.createGameBoard();
        this.updateDisplay();
    }
    
    bindEvents() {
        document.getElementById('reset-btn').addEventListener('click', () => {
            this.resetGame();
        });
        
        // Add keyboard support
        document.addEventListener('keydown', (e) => {
            if (e.key === 'r' || e.key === 'R') {
                this.resetGame();
            }
        });
    }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    window.game = new SuperTicTacToe();
    
    // Add some helpful instructions
    console.log('🎮 Super Tic Tac Toe Game Started!');
    console.log('Rules:');
    console.log('1. Win small boards to claim them on the big board');
    console.log('2. Where you play determines where your opponent plays next');
    console.log('3. Get 3 small boards in a row to win the game!');
    console.log('4. Press R to reset the game anytime');
});