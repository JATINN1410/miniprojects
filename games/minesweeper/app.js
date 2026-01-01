// Minesweeper - 9x9 beginner (10 mines)
(function(){
  'use strict';
  const COLS = 9, ROWS = 9, MINES = 10;
  const boardEl = document.getElementById('board');
  const newBtn = document.getElementById('newGame');
  const minesLeftEl = document.getElementById('minesLeft');
  const timerEl = document.getElementById('timer');
  const bestEl = document.getElementById('bestTime');
  const statusEl = document.getElementById('status');
  const jsOkEl = document.getElementById('jsOk');
  const STORAGE_KEY = 'minesweeper-best';

  let grid = []; // objects {mine, revealed, flagged, count}
  let started = false, timer = null, time = 0;
  let minesLeft = MINES;
  let gameOver = false;

  function loadBest(){ const v = localStorage.getItem(STORAGE_KEY); bestEl.textContent = v||'—'; }
  function saveBest(t){ const prev = parseInt(localStorage.getItem(STORAGE_KEY)||'0',10); if(!prev || t < prev){ localStorage.setItem(STORAGE_KEY, t.toString()); loadBest(); } }

  function makeGrid(){
    grid = Array.from({length:COLS*ROWS}, ()=> ({mine:false, revealed:false, flagged:false, count:0}));
    started = false; gameOver = false; time=0; clearInterval(timer); timer=null; timerEl.textContent='0'; minesLeft = MINES; minesLeftEl.textContent = minesLeft;
  }

  function index(c,r){ return c + r*COLS; }
  function inside(c,r){ return c>=0 && c<COLS && r>=0 && r<ROWS; }

  function placeMines(firstC, firstR){
    // ensure first click is not a mine
    const forbid = new Set(); forbid.add(index(firstC, firstR));
    for(let dc=-1;dc<=1;dc++) for(let dr=-1;dr<=1;dr++){ const nc=firstC+dc, nr=firstR+dr; if(inside(nc,nr)) forbid.add(index(nc,nr)); }
    let placed = 0;
    while(placed < MINES){
      const c = Math.floor(Math.random()*COLS);
      const r = Math.floor(Math.random()*ROWS);
      const idx = index(c,r);
      if(forbid.has(idx) || grid[idx].mine) continue;
      grid[idx].mine = true; placed++;
    }
    // compute counts
    for(let c=0;c<COLS;c++){
      for(let r=0;r<ROWS;r++){
        const idx = index(c,r);
        if(grid[idx].mine) continue;
        let cnt=0;
        for(let dc=-1;dc<=1;dc++) for(let dr=-1;dr<=1;dr++){ const nc=c+dc, nr=r+dr; if(inside(nc,nr) && grid[index(nc,nr)].mine) cnt++; }
        grid[idx].count = cnt;
      }
    }
  }

  function reveal(c,r){
    if(!inside(c,r)) return; const idx = index(c,r); const cell = grid[idx]; if(cell.revealed || cell.flagged) return;
    cell.revealed = true;
    if(cell.mine){ gameOver = true; revealAllMines(); setTimeout(()=> alert('Boom! Game over.'), 100); clearInterval(timer); }
    else if(cell.count===0){ // flood fill
      for(let dc=-1;dc<=1;dc++) for(let dr=-1;dr<=1;dr++){ const nc=c+dc, nr=r+dr; if(inside(nc,nr)) reveal(nc,nr); }
    }
    checkWin(); render();
  }

  function revealAllMines(){ for(let i=0;i<grid.length;i++){ if(grid[i].mine) grid[i].revealed = true; } render(); }

  function toggleFlag(c,r){ if(gameOver) return; const idx = index(c,r); const cell = grid[idx]; if(cell.revealed) return; cell.flagged = !cell.flagged; minesLeft += cell.flagged? -1 : 1; minesLeftEl.textContent = minesLeft; render(); checkWin(); }

  function checkWin(){ if(gameOver) return; // check all non-mines revealed
    const all = grid.every(c=> (c.mine && !c.revealed) || (!c.mine && c.revealed));
    if(all){ gameOver = true; clearInterval(timer); saveBest(time); setTimeout(()=>{ if(typeof window.confettiBurst === 'function') window.confettiBurst(); alert('You win! Time: '+time+'s'); }, 120); }
  }

  function startTimer(){ if(timer) return; timer = setInterval(()=>{ time++; timerEl.textContent = time; }, 1000); }

  function render(){ boardEl.innerHTML=''; for(let r=0;r<ROWS;r++){ for(let c=0;c<COLS;c++){ const idx = index(c,r); const cell = grid[idx]; const el = document.createElement('div'); el.className = 'cell'; el.dataset.c=c; el.dataset.r=r;
        if(cell.revealed){ el.classList.add('revealed'); if(cell.mine) el.classList.add('mine'); else if(cell.count>0) el.textContent = cell.count; }
        else if(cell.flagged){ el.classList.add('flag'); el.textContent = '⚑'; }
        el.addEventListener('click', (e)=>{ if(gameOver) return; if(!started){ placeMines(c,r); started=true; startTimer(); } reveal(c,r); });
        el.addEventListener('contextmenu', (e)=>{ e.preventDefault(); toggleFlag(c,r); });
        boardEl.appendChild(el);
      }} }

  document.addEventListener('DOMContentLoaded', ()=>{
    try{
      makeGrid(); loadBest(); render(); newBtn.addEventListener('click', ()=>{ makeGrid(); render(); }); if(jsOkEl) jsOkEl.textContent='JS OK';
      // accessibility: keyboard keys 1-9 for columns then Enter to reveal last column row? Keep simple: space toggles flag on focused cell
      document.addEventListener('keydown',(e)=>{ if(e.key===' ' && document.activeElement && document.activeElement.classList.contains('cell')){ const c=parseInt(document.activeElement.dataset.c,10); const r=parseInt(document.activeElement.dataset.r,10); toggleFlag(c,r); } });
    }catch(err){ console.error('Minesweeper init error',err); const overlay=document.createElement('div'); overlay.textContent='JS Error: '+err.message; overlay.style.color='red'; document.body.appendChild(overlay); }
  });
})();