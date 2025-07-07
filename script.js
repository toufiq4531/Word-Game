const successSound = document.getElementById("successSound");
const errorSound = document.getElementById("errorSound");
const bgMusic = document.getElementById("bgMusic");
const toggleBtn = document.getElementById("toggleMusicBtn");
const grid = document.getElementById('grid');

const score1 = document.getElementById('score1');
const score2 = document.getElementById('score2');
const currentPlayerDisplay = document.getElementById('currentPlayer');
const lastScored = document.getElementById('lastScored');

const scoredWords = new Set();
const gridSize = 20;
let currentPlayer = 1;
let musicPlaying = false;
let gameEnded = false;


// Music toggle button
toggleBtn.addEventListener("click", () => {
    if (!musicPlaying) {
        bgMusic.play()
            .then(() => {
                musicPlaying = true;
                toggleBtn.textContent = "🔊";
            })
            .catch(err => {
                console.error("Music play failed:", err);
            });
    } else {
        bgMusic.pause();
        musicPlaying = false;
        toggleBtn.textContent = "🔇";
    }
});

// Grid creation
function createGrid() {
    for (let row = 0; row < gridSize; row++) {
        for (let col = 0; col < gridSize; col++) {
            const cell = document.createElement('input');
            cell.type = 'text';
            cell.maxLength = 1;
            cell.classList.add('grid-cell');
            cell.dataset.row = row;
            cell.dataset.col = col;
            grid.appendChild(cell);

            // Input handling per cell
            cell.addEventListener('click', () => handleClick(cell));
        }
    }
}
createGrid();

// Handle clicking on a cell
function handleClick(cell) {
    if (gameEnded || cell.disabled || cell.value !== '') return;

    cell.classList.add(currentPlayer === 1 ? 'player1' : 'player2');
    cell.focus();

    const handleInput = () => {
        let letter = cell.value.toUpperCase();

        if (!/^[A-Z]$/.test(letter)) {
            errorSound.play();
            alert('❌ Only one letter A-Z allowed!');
            cell.value = '';
            cell.focus();
            return;
        }

        // ✅ Valid input
        cell.value = letter;
        cell.disabled = true;
        cell.removeEventListener('input', handleInput);
        cell.classList.remove('player1', 'player2');

        checkAndScoreWords();

        // 🔁 Switch turn
        currentPlayer = currentPlayer === 1 ? 2 : 1;
        currentPlayerDisplay.textContent = `Player ${currentPlayer}`;
    };

    // Attach input listener once
    cell.addEventListener('input', handleInput, { once: true });
}

// Word scoring and checking
function checkAndScoreWords() {
    let newScore = 0;

    // Clear previous highlights
    document.querySelectorAll('.grid-cell').forEach(cell => {
        cell.style.backgroundColor = '';
    });

    // Build 2D board array
    let board = [];
    for (let r = 0; r < gridSize; r++) {
        let row = [];
        for (let c = 0; c < gridSize; c++) {
            const cell = document.querySelector(`[data-row="${r}"][data-col="${c}"]`);
            row.push(cell.value.toUpperCase() || '');
        }
        board.push(row);
    }

    // Helper: Process a valid word
    function processWord(fullWord, positions) {
        if (fullWord.length < 3) return;

        for (let i = 0; i <= fullWord.length - 3; i++) {
            for (let j = i + 3; j <= fullWord.length; j++) {
                const subWord = fullWord.slice(i, j);
                const subPositions = positions.slice(i, j);

                if (WORD_LIST.has(subWord) && !scoredWords.has(subWord)) {
                    newScore += subWord.length;
                    scoredWords.add(subWord);
                    successSound.play();

                    // Highlight cells
                    subPositions.forEach(pos => {
                        const cell = document.querySelector(`[data-row="${pos.row}"][data-col="${pos.col}"]`);
                        if (cell) cell.style.backgroundColor = 'lightgreen';
                    });

                    lastScored.textContent = `✅ Player ${currentPlayer} scored: "${subWord}" (+${subWord.length} points)`;
                }
            }
        }
    }


    // Horizontal check
    for (let r = 0; r < gridSize; r++) {
        let word = '', positions = [];
        for (let c = 0; c <= gridSize; c++) {
            let char = c < gridSize ? board[r][c] : '';
            if (/[A-Z]/.test(char)) {
                word += char;
                positions.push({ row: r, col: c });
            } else {
                processWord(word, positions);
                word = '';
                positions = [];
            }
        }
    }

    // Vertical check
    for (let c = 0; c < gridSize; c++) {
        let word = '', positions = [];
        for (let r = 0; r <= gridSize; r++) {
            let char = r < gridSize ? board[r][c] : '';
            if (/[A-Z]/.test(char)) {
                word += char;
                positions.push({ row: r, col: c });
            } else {
                processWord(word, positions);
                word = '';
                positions = [];
            }
        }
    }

    // Update score
    if (newScore > 0) {
        const scoreDisplay = currentPlayer === 1 ? score1 : score2;
        scoreDisplay.textContent = parseInt(scoreDisplay.textContent) + newScore;
    } else {
        lastScored.textContent = '';
    }

    checkGameEnd();
}

// Game end check
function checkGameEnd() {
    const allCells = document.querySelectorAll('.grid-cell');
    const isFull = [...allCells].every(cell => cell.value !== '');

    if (isFull) {
        gameEnded = true;

        const p1 = parseInt(score1.textContent);
        const p2 = parseInt(score2.textContent);
        let message = '';

        if (p1 > p2) {
            message = `🎉 Game Over! Player 1 Wins with ${p1} points!`;
        } else if (p2 > p1) {
            message = `🎉 Game Over! Player 2 Wins with ${p2} points!`;
        } else {
            message = `🤝 It's a Tie! Both players have ${p1} points.`;
        }

        setTimeout(() => {
            alert(message);
        }, 100);
    }
}

// Restart button
document.getElementById('restartBtn').addEventListener('click', () => {
    const cells = document.querySelectorAll('.grid-cell');
    cells.forEach(cell => {
        cell.value = '';
        cell.disabled = false;
        cell.style.backgroundColor = '';
    });

    currentPlayer = 1;
    gameEnded = false;
    score1.textContent = '0';
    score2.textContent = '0';
    currentPlayerDisplay.textContent = 'Player 1';
    lastScored.textContent = '';
    scoredWords.clear();
});
