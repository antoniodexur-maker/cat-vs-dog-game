const SHEET_URL = 'https://raw.githubusercontent.com/antoniodexur-maker/cat-vs-dog-game/main/1D381A6C-BCC8-4697-88D2-B78A173B71F5.png';

const cells = [...document.querySelectorAll('.cell')];
const statusEl = document.getElementById('status');
const coinBox = document.getElementById('coinBox');
const coin = document.getElementById('coin');
const catScoreEl = document.getElementById('catScore');
const dogScoreEl = document.getElementById('dogScore');
const catBox = document.getElementById('catBox');
const dogBox = document.getElementById('dogBox');
const victorySvg = document.getElementById('victorySvg');
const victoryLine = document.getElementById('victoryLine');

let board = Array(9).fill('');
let current = 'cat';
let gameOver = false;
let started = false;
let vsAI = true;
let aiLevel = 0;
let score = { cat: 0, dog: 0 };

const wins = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
const centers = [[16.7,16.7],[50,16.7],[83.3,16.7],[16.7,50],[50,50],[83.3,50],[16.7,83.3],[50,83.3],[83.3,83.3]];

// Calibrated for the uploaded 8-frame sheet.
// These are source-image crop coordinates, not CSS percentages.
const spriteRows = {
  cat: { idle: 52, shock: 300 },
  dog: { idle: 560, shock: 802 }
};

const startX = 284;
const stepX = 220;

function makeSprite(player, state = 'idle') {
  const safeState = state === 'shock' ? 'shock' : 'idle';
  const y = spriteRows[player][safeState];
  const speed = safeState === 'shock' ? 75 : 145;
  return `<div class="sprite" data-y="${y}" data-frame="0" data-speed="${speed}" data-last="0" style="--x:${startX};--y:${y}"><img src="${SHEET_URL}" alt=""></div>`;
}

setInterval(() => {
  const now = Date.now();
  document.querySelectorAll('.sprite').forEach(sprite => {
    const speed = Number(sprite.dataset.speed || 140);
    const last = Number(sprite.dataset.last || 0);
    if (now - last < speed) return;
    const frame = (Number(sprite.dataset.frame || 0) + 1) % 8;
    sprite.dataset.frame = frame;
    sprite.dataset.last = now;
    sprite.style.setProperty('--x', startX + frame * stepX);
  });
}, 45);

function clearBoard() {
  board = Array(9).fill('');
  victorySvg.classList.add('hidden');
  victorySvg.classList.remove('freeze');
  victoryLine.setAttribute('points', '');
  cells.forEach(cell => {
    cell.innerHTML = '';
    cell.className = 'cell';
  });
}

function newGame() {
  gameOver = true;
  started = false;
  clearBoard();
  cells.forEach((cell, i) => {
    cell.innerHTML = makeSprite(i % 2 === 0 ? 'cat' : 'dog');
  });
  current = Math.random() < 0.5 ? 'cat' : 'dog';
  coin.textContent = current === 'cat' ? '🐱' : '🐶';
  coinBox.classList.add('show');
  statusEl.textContent = 'Бросаем монетку...';
  setTimeout(() => {
    coinBox.classList.remove('show');
    clearBoard();
    gameOver = false;
    started = true;
    statusEl.textContent = `${current === 'cat' ? '🐱 Cat' : '🐶 Dog'} ходит первым!`;
    if (vsAI && current === 'dog') setTimeout(aiMove, 600);
  }, 1560);
}

function winPattern(player) {
  return wins.find(pattern => pattern.every(i => board[i] === player)) || null;
}

function isDraw() {
  return board.every(Boolean);
}

function animateCell(cell, className) {
  cell.classList.add(className);
  setTimeout(() => cell.classList.remove(className), 900);
}

function drawVictory(pattern) {
  const points = pattern.map(i => centers[i]);
  const jagged = [];
  for (let segment = 0; segment < 2; segment++) {
    const [x1, y1] = points[segment];
    const [x2, y2] = points[segment + 1];
    jagged.push([x1, y1]);
    for (let s = 1; s <= 3; s++) {
      const t = s / 4;
      const x = x1 + (x2 - x1) * t;
      const y = y1 + (y2 - y1) * t;
      const dx = x2 - x1;
      const dy = y2 - y1;
      const len = Math.hypot(dx, dy) || 1;
      const offset = s % 2 ? 4 : -4;
      jagged.push([x - dy / len * offset, y + dx / len * offset]);
    }
  }
  jagged.push(points[2]);
  victoryLine.setAttribute('points', jagged.map(p => p.join(',')).join(' '));
  victorySvg.classList.remove('hidden');
  pattern.forEach(i => cells[i].classList.add('win-cell'));
  setTimeout(() => victorySvg.classList.add('freeze'), 4000);
  setTimeout(() => {
    cells.forEach((cell, i) => {
      if (!pattern.includes(i)) cell.classList.add('fadeout');
    });
  }, 6000);
}

function finish(winner) {
  gameOver = true;
  const pattern = winPattern(winner);
  if (winner === 'cat') {
    score.cat += 1;
    catScoreEl.textContent = score.cat;
    catBox.classList.add('win');
    dogBox.classList.add('lose');
    statusEl.textContent = '🐱 Cat победил!';
  } else {
    score.dog += 1;
    dogScoreEl.textContent = score.dog;
    dogBox.classList.add('win');
    catBox.classList.add('lose');
    statusEl.textContent = '🐶 Dog победил!';
  }
  cells.forEach((cell, i) => {
    if (board[i] === winner) cell.innerHTML = makeSprite(winner, 'idle');
    else if (board[i]) cell.innerHTML = makeSprite(board[i], 'shock');
  });
  if (pattern) drawVictory(pattern);
  setTimeout(() => {
    catBox.classList.remove('win', 'lose');
    dogBox.classList.remove('win', 'lose');
  }, 900);
}

function move(index) {
  if (!started || gameOver || board[index]) return;
  board[index] = current;
  const shocked = Math.random() < 0.25;
  cells[index].innerHTML = makeSprite(current, shocked ? 'shock' : 'idle');
  cells[index].className = 'cell played';
  animateCell(cells[index], shocked ? 'shock' : current === 'cat' ? 'happy' : 'angry');
  if (winPattern(current)) return finish(current);
  if (isDraw()) {
    gameOver = true;
    statusEl.textContent = 'Ничья!';
    return;
  }
  current = current === 'cat' ? 'dog' : 'cat';
  statusEl.textContent = `Ход: ${current === 'cat' ? '🐱 Cat' : '🐶 Dog'}`;
  if (vsAI && current === 'dog') setTimeout(aiMove, 500);
}

function freeCells() {
  return board.map((value, i) => value ? null : i).filter(value => value !== null);
}

function findWinningMove(player) {
  for (const pattern of wins) {
    const values = pattern.map(i => board[i]);
    if (values.filter(v => v === player).length === 2 && values.includes('')) {
      return pattern[values.indexOf('')];
    }
  }
  return null;
}

function minimax(player) {
  if (winPattern('dog')) return { score: 10 };
  if (winPattern('cat')) return { score: -10 };
  if (isDraw()) return { score: 0 };
  const moves = [];
  for (const i of freeCells()) {
    board[i] = player;
    const result = minimax(player === 'dog' ? 'cat' : 'dog');
    moves.push({ i, score: result.score });
    board[i] = '';
  }
  return player === 'dog'
    ? moves.reduce((a, b) => b.score > a.score ? b : a)
    : moves.reduce((a, b) => b.score < a.score ? b : a);
}

function aiMove() {
  const free = freeCells();
  if (!free.length) return;
  let index;
  if (aiLevel === 0) index = free[Math.floor(Math.random() * free.length)];
  else if (aiLevel === 1) index = findWinningMove('dog') ?? findWinningMove('cat') ?? (board[4] === '' ? 4 : null) ?? free[Math.floor(Math.random() * free.length)];
  else index = minimax('dog').i;
  move(index);
}

cells.forEach(cell => {
  cell.addEventListener('click', () => {
    if (vsAI && current === 'dog') return;
    move(Number(cell.dataset.index));
  });
});

document.getElementById('newGameBtn').addEventListener('click', newGame);
document.getElementById('modeBtn').addEventListener('click', () => {
  vsAI = !vsAI;
  document.getElementById('modeBtn').textContent = vsAI ? 'Режим: против AI' : 'Режим: 1 vs 1';
  statusEl.textContent = vsAI ? 'Включен AI' : 'Режим 1 vs 1';
});
document.getElementById('difficultyBtn').addEventListener('click', () => {
  aiLevel = (aiLevel + 1) % 3;
  document.getElementById('difficultyBtn').textContent = ['AI: простой', 'AI: умный', 'AI: злой'][aiLevel];
  statusEl.textContent = document.getElementById('difficultyBtn').textContent;
});
document.getElementById('resetBtn').addEventListener('click', () => {
  score = { cat: 0, dog: 0 };
  catScoreEl.textContent = 0;
  dogScoreEl.textContent = 0;
  statusEl.textContent = 'Счёт сброшен';
});

newGame();