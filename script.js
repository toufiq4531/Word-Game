const successSound = document.getElementById("successSound");
const errorSound = document.getElementById("errorSound");


const gridSize = 20; // 20x20 grid
const grid = document.getElementById('grid');

const scoredWords = new Set();


const bgMusic = document.getElementById("bgMusic");
const toggleBtn = document.getElementById("toggleMusicBtn");
let musicPlaying = false;

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


function createGrid() {
    for (let row = 0; row < gridSize; row++) {
        for (let col = 0; col < gridSize; col++) {
            const cell = document.createElement('input');
            cell.type = 'text';
            cell.maxLength = 1;
            cell.classList.add('grid-cell');
            cell.dataset.row = row;
            cell.dataset.col = col;
            //cell.disabled = true;
            grid.appendChild(cell);
        }
    }
}

createGrid();

let currentPlayer = 1;
const score1 = document.getElementById('score1');
const score2 = document.getElementById('score2');
const currentPlayerDisplay = document.getElementById('currentPlayer');

// Enable all cells for clicking
const cells = document.querySelectorAll('.grid-cell');
cells.forEach(cell => {
    cell.addEventListener('click', () => handleClick(cell));
});


function handleClick(cell) {
    if (cell.disabled || cell.value !== '') return;

    cell.classList.add(currentPlayer === 1 ? 'player1' : 'player2');
    cell.focus();

    const handleInput = () => {
        let letter = cell.value.toUpperCase();

        // Only allow A-Z letters
        if (!/^[A-Z]$/.test(letter)) {
            errorSound.play(); // 🔊 play error
            alert('❌ Only one letter A-Z allowed!');
            cell.value = '';
            cell.focus(); // Keep focus so they can retry
            return;
        }


        // Set the value as uppercase
        cell.value = letter;
        cell.disabled = true;

        // ✅ Check for words and score
        checkAndScoreWords();

        // ✅ Switch player
        currentPlayer = currentPlayer === 1 ? 2 : 1;
        currentPlayerDisplay.textContent = `Player ${currentPlayer}`;

        // 🧹 Remove input listener so it doesn't trigger again
        cell.removeEventListener('input', handleInput);

        // Clear the cell's class for player
        cell.classList.remove('player1', 'player2');

    };

    // Attach only once for this cell
    cell.addEventListener('input', handleInput, { once: true });

    // 🚫 Prevent multiple clicks from re-adding the input listener
    cell.removeEventListener('click', () => handleClick(cell));
}


function checkAndScoreWords() {
    let newScore = 0;

    // 1. Clear all highlights from previous turn
    document.querySelectorAll('.grid-cell').forEach(cell => {
        cell.style.backgroundColor = '';
    });

    // 2. Read the board into a 2D array
    let board = [];
    for (let r = 0; r < gridSize; r++) {
        let row = [];
        for (let c = 0; c < gridSize; c++) {
            const cell = document.querySelector(`[data-row="${r}"][data-col="${c}"]`);
            row.push(cell.value.toUpperCase() || '');
        }
        board.push(row);
    }

    // Helper function to process found words and highlight cells
    function processWord(word, positions) {
        if (word.length >= 3 && WORD_LIST.has(word) && !scoredWords.has(word)) {
            newScore += word.length;
            scoredWords.add(word);

            successSound.play();

            // Highlight the word's cells
            positions.forEach(pos => {
                const cell = document.querySelector(`[data-row="${pos.row}"][data-col="${pos.col}"]`);
                if (cell) cell.style.backgroundColor = 'lightgreen';
            });

            // Display scored word
            const lastScored = document.getElementById('lastScored');
            lastScored.textContent = `✅ Player ${currentPlayer} scored: "${word}" (+${word.length} points)`;
        }
    }


    // 3. Check rows for words
    for (let r = 0; r < gridSize; r++) {
        let word = '';
        let positions = [];
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

    // 4. Check columns for words
    for (let c = 0; c < gridSize; c++) {
        let word = '';
        let positions = [];
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

    // 5. Update score for current player
    if (newScore > 0) {
        if (currentPlayer === 1) {
            score1.textContent = parseInt(score1.textContent) + newScore;
        } else {
            score2.textContent = parseInt(score2.textContent) + newScore;
        }
    }

    // Clear last scored message if no score
    if (newScore === 0) {
        document.getElementById('lastScored').textContent = '';
    }

    // 6. Check if the game is over
    checkGameEnd();
}


function highlightCells(type, fixed, start, end) {
    for (let i = start; i <= end; i++) {
        const cell = type === 'row'
            ? document.querySelector(`[data-row="${fixed}"][data-col="${i}"]`)
            : document.querySelector(`[data-row="${i}"][data-col="${fixed}"]`);
        cell.style.backgroundColor = 'lightgreen';
    }
}


function checkGameEnd() {
    const allCells = document.querySelectorAll('.grid-cell');
    let isFull = true;

    allCells.forEach(cell => {
        if (cell.value === '') {
            isFull = false;
        }
    });

    if (isFull) {
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

document.getElementById('restartBtn').addEventListener('click', () => {
    // Clear board
    const cells = document.querySelectorAll('.grid-cell');
    cells.forEach(cell => {
        cell.value = '';
        cell.disabled = false;
        cell.style.backgroundColor = '';
    });

    // Reset game state
    currentPlayer = 1;
    currentPlayerDisplay.textContent = 'Player 1';
    score1.textContent = '0';
    score2.textContent = '0';
    scoredWords.clear();
});
