const board = document.getElementById('board');
const cells = document.querySelectorAll('.cell');
const statusText = document.getElementById('statusText');
const newGameBtn = document.getElementById('newGameBtn');
const modeBtn = document.getElementById('modeBtn');
const resetScoreBtn = document.getElementById('resetScoreBtn');

const catScoreEl = document.getElementById('catScore');
const dogScoreEl = document.getElementById('dogScore');

const catCharacter = document.getElementById('catCharacter');
const dogCharacter = document.getElementById('dogCharacter');

const catSpeech = document.getElementById('catSpeech');
const dogSpeech = document.getElementById('dogSpeech');

let boardState = Array(9).fill('');
let currentPlayer = '🐱';
let gameOver = false;
let vsAI = true;

let scores = {
  cat: 0,
  dog: 0
};

const winPatterns = [
  [0,1,2],[3,4,5],[6,7,8],
  [0,3,6],[1,4,7],[2,5,8],
  [0,4,8],[2,4,6]
];

function randomShock(character) {
  const shock = Math.random() < 0.25;

  if (shock) {
    character.classList.add('shocked');

    if (character === catCharacter) {
      catSpeech.textContent = 'МЯЯЯУ⚡';
    } else {
      dogSpeech.textContent = 'ГАААВ⚡';
    }

    setTimeout(() => {
      character.classList.remove('shocked');
    }, 500);
  }
}

function updateStatus() {
  statusText.textContent = `Ход: ${currentPlayer}`;
}

function startGame() {
  boardState = Array(9).fill('');
  gameOver = false;

  cells.forEach(cell => {
    cell.textContent = '';
  });

  currentPlayer = Math.random() < 0.5 ? '🐱' : '🐶';

  statusText.textContent = `${currentPlayer} ходит первым!`;

  catSpeech.textContent = 'Я победю!';
  dogSpeech.textContent = 'Посмотрим!';

  if (vsAI && currentPlayer === '🐶') {
    setTimeout(aiMove, 700);
  }
}

function checkWinner(player) {
  return winPatterns.some(pattern => {
    return pattern.every(index => boardState[index] === player);
  });
}

function checkDraw() {
  return boardState.every(cell => cell !== '');
}

function endGame(winner) {
  gameOver = true;

  if (winner === '🐱') {
    scores.cat++;
    catScoreEl.textContent = scores.cat;
    statusText.textContent = '🐱 Cat победил!';
    catSpeech.textContent = 'Ха-ха!';
    dogSpeech.textContent = 'Нечестно...';
  } else {
    scores.dog++;
    dogScoreEl.textContent = scores.dog;
    statusText.textContent = '🐶 Dog победил!';
    dogSpeech.textContent = 'Гав-гав!';
    catSpeech.textContent = 'Мяя...';
  }
}

function makeMove(index) {
  if (boardState[index] || gameOver) return;

  boardState[index] = currentPlayer;
  cells[index].textContent = currentPlayer;

  if (currentPlayer === '🐱') {
    catSpeech.textContent = 'Сюда!';
    randomShock(catCharacter);
  } else {
    dogSpeech.textContent = 'Твой ход!';
    randomShock(dogCharacter);
  }

  if (checkWinner(currentPlayer)) {
    endGame(currentPlayer);
    return;
  }

  if (checkDraw()) {
    gameOver = true;
    statusText.textContent = 'Ничья!';
    catSpeech.textContent = 'Мур.';
    dogSpeech.textContent = 'Ладно.';
    return;
  }

  currentPlayer = currentPlayer === '🐱' ? '🐶' : '🐱';
  updateStatus();

  if (vsAI && currentPlayer === '🐶' && !gameOver) {
    setTimeout(aiMove, 500);
  }
}

function aiMove() {
  const free = boardState
    .map((v, i) => v === '' ? i : null)
    .filter(v => v !== null);

  const move = free[Math.floor(Math.random() * free.length)];

  makeMove(move);
}

cells.forEach(cell => {
  cell.addEventListener('click', () => {
    const index = Number(cell.dataset.index);

    if (vsAI && currentPlayer === '🐶') return;

    makeMove(index);
  });
});

newGameBtn.addEventListener('click', startGame);

modeBtn.addEventListener('click', () => {
  vsAI = !vsAI;

  modeBtn.textContent = vsAI
    ? 'Режим: против AI'
    : 'Режим: 1 vs 1';

  startGame();
});

resetScoreBtn.addEventListener('click', () => {
  scores.cat = 0;
  scores.dog = 0;

  catScoreEl.textContent = '0';
  dogScoreEl.textContent = '0';
});

startGame();
