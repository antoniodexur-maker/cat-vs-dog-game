const ASSET_VERSION='side1';
const GIFS={cat:'assets/cat_idle.gif',dog:'assets/dog_idle.gif'};
const LANGS={ru:{new:'🎲 Новая партия',modeAI:'Режим: против AI',modePVP:'Режим: 1 vs 1',side:p=>`Игрок: ${p==='cat'?'Cat':'Dog'}`,ai:['AI: простой','AI: умный','AI: злой'],reset:'Сброс счёта'},en:{new:'🎲 New Game',modeAI:'Mode: vs AI',modePVP:'Mode: 1 vs 1',side:p=>`Player: ${p==='cat'?'Cat':'Dog'}`,ai:['AI: easy','AI: smart','AI: evil'],reset:'Reset Score'},tr:{new:'🎲 Yeni Oyun',modeAI:'Mod: AI karşı',modePVP:'Mod: 1 vs 1',side:p=>`Oyuncu: ${p==='cat'?'Cat':'Dog'}`,ai:['AI: kolay','AI: akıllı','AI: şeytan'],reset:'Skoru sıfırla'}};
let lang=localStorage.getItem('lang')||'ru';
const T=()=>LANGS[lang];
const cells=[...document.querySelectorAll('.cell')],statusEl=document.getElementById('status'),coinBox=document.getElementById('coinBox'),coin=document.getElementById('coin');
const catScoreEl=document.getElementById('catScore'),dogScoreEl=document.getElementById('dogScore');
const victorySvg=document.getElementById('victorySvg'),victoryLine=document.getElementById('victoryLine');
const newBtn=document.getElementById('newGameBtn'),modeBtn=document.getElementById('modeBtn'),diffBtn=document.getElementById('difficultyBtn'),resetBtn=document.getElementById('resetBtn'),langBtn=document.getElementById('langBtn'),sideBtn=document.getElementById('sideBtn');
let playerSide='cat';
let board=Array(9).fill(''),current='cat',gameOver=false,started=false,vsAI=true,aiLevel=0,score={cat:0,dog:0};
const wins=[[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]],centers=[[16.7,16.7],[50,16.7],[83.3,16.7],[16.7,50],[50,50],[83.3,50],[16.7,83.3],[50,83.3],[83.3,83.3]];
function applyLang(){newBtn.textContent=T().new;modeBtn.textContent=vsAI?T().modeAI:T().modePVP;sideBtn.textContent=T().side(playerSide);diffBtn.textContent=T().ai[aiLevel];resetBtn.textContent=T().reset;langBtn.textContent='🌐 '+lang.toUpperCase()}
function makeSprite(player){return `<div class="sprite"><img src="${GIFS[player]}?v=${ASSET_VERSION}"></div>`}
function clearBoard(){board=Array(9).fill('');victorySvg.classList.add('hidden');victoryLine.setAttribute('points','');cells.forEach(c=>{c.innerHTML='';c.className='cell'})}
function newGame(){gameOver=true;started=false;clearBoard();current=Math.random()<.5?'cat':'dog';coin.textContent=current==='cat'?'🐱':'🐶';coinBox.classList.add('show');statusEl.textContent='...';setTimeout(()=>{coinBox.classList.remove('show');gameOver=false;started=true;statusEl.textContent=`${current.toUpperCase()} turn`;if(vsAI&&current!==playerSide)setTimeout(aiMove,600)},1200)}
function winPattern(p){return wins.find(a=>a.every(i=>board[i]===p))}
function isDraw(){return board.every(Boolean)}
function drawVictory(pattern){const pts=pattern.map(i=>centers[i]);victoryLine.setAttribute('points',pts.map(p=>p.join(',')).join(' '));victorySvg.classList.remove('hidden')}
function finish(winner){gameOver=true;if(winner==='cat'){score.cat++;catScoreEl.textContent=score.cat}else{score.dog++;dogScoreEl.textContent=score.dog}const p=winPattern(winner);if(p)drawVictory(p)}
function move(i){if(gameOver||board[i])return;board[i]=current;cells[i].innerHTML=makeSprite(current);if(winPattern(current))return finish(current);if(isDraw()){gameOver=true;return}current=current==='cat'?'dog':'cat';if(vsAI&&current!==playerSide)setTimeout(aiMove,400)}
function freeCells(){return board.map((v,i)=>v?null:i).filter(v=>v!==null)}
function aiMove(){const free=freeCells();if(!free.length)return;move(free[Math.floor(Math.random()*free.length)])}
cells.forEach(c=>c.addEventListener('click',()=>{const i=+c.dataset.index;if(vsAI&&current!==playerSide)return;move(i)}));
newBtn.onclick=newGame;
modeBtn.onclick=()=>{vsAI=!vsAI;applyLang()};
sideBtn.onclick=()=>{playerSide=playerSide==='cat'?'dog':'cat';applyLang()};
diffBtn.onclick=()=>{aiLevel=(aiLevel+1)%3;applyLang()};
resetBtn.onclick=()=>{score={cat:0,dog:0};catScoreEl.textContent=0;dogScoreEl.textContent=0};
langBtn.onclick=()=>{lang=lang==='ru'?'en':lang==='en'?'tr':'ru';localStorage.setItem('lang',lang);applyLang()};
applyLang();
newGame();