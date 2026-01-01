// Connect Four - 7x6 with optional CPU opponent (minimax + heuristics)
(function(){
  'use strict';
  const COLS = 7, ROWS = 6;
  const boardEl = document.getElementById('board');
  const resetBtn = document.getElementById('reset');
  const winsCountEl = document.getElementById('winsCount');
  const cpuToggle = document.getElementById('cpuToggle');
  const statusEl = document.getElementById('status');
  const jsOkEl = document.getElementById('jsOk');
  const STORAGE_KEY = 'connect-four-wins';

  let grid = []; // grid[col][row] where row 0 is bottom
  let current = 1; // 1 = human, 2 = second player or CPU
  let winner = null;
  let winCoords = [];
  let locked = false; // lock while AI is thinking
  let history = []; // stack of {col,row,player}

  function loadWins(){
    const val = parseInt(localStorage.getItem(STORAGE_KEY)||'0',10);
    winsCountEl.textContent = isNaN(val)?0:val;
  }

  function saveWin(){
    const cur = parseInt(localStorage.getItem(STORAGE_KEY)||'0',10) || 0;
    localStorage.setItem(STORAGE_KEY, (cur+1).toString());
    loadWins();
  }

  function makeGrid(){
    grid = Array.from({length:COLS}, ()=> Array.from({length:ROWS}, ()=> 0));
    history = [];
  }

  function makeColsFocusable(){
    const cols = boardEl.querySelectorAll('.col');
    cols.forEach(c=>{ c.tabIndex = 0; c.setAttribute('role','button'); c.setAttribute('aria-label', 'Column '+(parseInt(c.dataset.col,10)+1)); c.addEventListener('keydown', (ev)=>{ if(ev.key==='Enter' || ev.key===' ') playerMove(parseInt(c.dataset.col,10)); }); });
  }

  function render(){
    boardEl.innerHTML = '';
    for(let c=0;c<COLS;c++){
      const colEl = document.createElement('div');
      colEl.className = 'col';
      colEl.dataset.col = c;
      for(let r=0;r<ROWS;r++){
        const cell = document.createElement('div');
        cell.className = 'cell ' + (grid[c][r] === 0 ? 'empty' : 'filled');
        cell.dataset.col = c; cell.dataset.row = r;
        if(grid[c][r] !== 0){
          const d = document.createElement('div');
          d.className = 'disc ' + (grid[c][r]===1? 'p1':'p2');
          cell.appendChild(d);
        } else {
          cell.addEventListener('click', onColClick);
        }
        colEl.appendChild(cell);
      }
      boardEl.appendChild(colEl);
    }

    // accessibility & focus for columns
    makeColsFocusable();

    // apply win highlight if present
    if(winCoords && winCoords.length){
      for(const p of winCoords){
        const sel = `.cell[data-col="${p.c}"][data-row="${p.r}"]`;
        const el = boardEl.querySelector(sel);
        if(el && el.querySelector('.disc')) el.querySelector('.disc').classList.add('win');
      }
      // celebration
      if(typeof window.confettiBurst === 'function') window.confettiBurst();
    }

    // trigger drop animation for last placed disc
    if(lastPlaced){
      const sel = `.cell[data-col="${lastPlaced.col}"][data-row="${lastPlaced.row}"]`;
      const el = boardEl.querySelector(sel);
      if(el && el.querySelector('.disc')){
        const disc = el.querySelector('.disc');
        disc.classList.add('drop');
        // force reflow then remove class to animate down
        requestAnimationFrame(()=>{ requestAnimationFrame(()=>{ disc.classList.remove('drop'); }); });
      }
      lastPlaced = null;
    }

    // update undo/redo UI
    const undoBtn = document.getElementById('undo'); if(undoBtn) undoBtn.disabled = history.length===0;
    const redoBtn = document.getElementById('redo'); if(redoBtn) redoBtn.disabled = redoStack.length===0;

    // update status
    if(locked) statusEl.firstChild.nodeValue = 'CPU thinking... ';
    else if(winner) statusEl.firstChild.nodeValue = 'Done ';
    else statusEl.firstChild.nodeValue = 'Ready ';
  }

  function onColClick(e){
    if(winner || locked) return;
    const col = parseInt(e.currentTarget.dataset.col,10);
    playerMove(col);
  }

  function playerMove(col){
    if(winner || locked) return;
    if(!isValidMove(col)) return;
    placeDisc(col);

    // If playing vs CPU and now it's CPU's turn, schedule AI
    if(cpuToggle && cpuToggle.checked && !winner){
      locked = true;
      render();
      setTimeout(()=>{ aiMove(); }, 220);
    }
  }

  function isValidMove(col){
    return col>=0 && col<COLS && grid[col].indexOf(0)!==-1;
  }

  function placeDisc(col){
    if(col<0||col>=COLS) return;
    const colArr = grid[col];
    const slot = colArr.indexOf(0);
    if(slot === -1) return; // column full
    grid[col][slot] = current;
    history.push({col, row: slot, player: current});
    // a new move clears the redo stack
    redoStack = [];
    // animate drop by creating the disc and translating from top
    animateDrop(col, slot, current);

    if(checkWin(col, slot, current)){
      winner = current;
      saveWin();
      highlightWin();
      setTimeout(()=> alert('Player '+current+' wins!'), 150);
    } else {
      current = current === 1 ? 2 : 1;
    }
    // enable/disable undo/redo
    const undoBtn = document.getElementById('undo'); const redoBtn = document.getElementById('redo');
    if(undoBtn) undoBtn.disabled = history.length===0;
    if(redoBtn) redoBtn.disabled = redoStack.length===0;
    render();
  }

  let lastPlaced = null;
  let redoStack = [];
  function animateDrop(col, row, player){
    // mark last placed so render can animate the disc
    lastPlaced = {col,row,player};
  }

  function undoMove(){
    if(history.length===0) return;
    const last = history.pop();
    grid[last.col][last.row] = 0;
    redoStack.push(last);
    winner = null; winCoords = [];
    current = last.player; // give turn back to the player who made that move
    const undoBtn = document.getElementById('undo'); if(undoBtn) undoBtn.disabled = history.length===0;
    const redoBtn = document.getElementById('redo'); if(redoBtn) redoBtn.disabled = redoStack.length===0;
    render();
  }

  function redoMove(){
    if(redoStack.length===0) return;
    const mv = redoStack.pop();
    grid[mv.col][mv.row] = mv.player;
    history.push(mv);
    current = mv.player===1?2:1;
    const undoBtn = document.getElementById('undo'); if(undoBtn) undoBtn.disabled = history.length===0;
    const redoBtn = document.getElementById('redo'); if(redoBtn) redoBtn.disabled = redoStack.length===0;
    // animate redo placement
    lastPlaced = {col: mv.col, row: mv.row, player: mv.player};
    render();
  }

  function checkWin(col, row, player){
    // set winCoords if found
    function lineInDir(dc, dr){
      const lst = [];
      let c = col; let r = row;
      // go negative side
      while(true){
        const nc = c - dc; const nr = r - dr;
        if(nc<0||nc>=COLS||nr<0||nr>=ROWS) break;
        if(grid[nc][nr]===player){ c=nc; r=nr; } else break;
      }
      // now move forward collecting
      let cc = c, rr = r;
      while(cc>=0 && cc<COLS && rr>=0 && rr<ROWS && grid[cc][rr]===player){ lst.push({c:cc,r:rr}); cc+=dc; rr+=dr; }
      return lst;
    }
    const dirs = [[1,0],[0,1],[1,1],[1,-1]];
    for(const [dc,dr] of dirs){
      const ln = lineInDir(dc,dr);
      if(ln.length>=4){
        // if longer than 4, pick the 4 that include the placed piece
        if(ln.length>4){
          // find index of the placed piece
          let idx = ln.findIndex(p=>p.c===col && p.r===row);
          if(idx<0) idx = 0;
          const start = Math.max(0, Math.min(idx, ln.length-4));
          winCoords = ln.slice(start, start+4);
        } else {
          winCoords = ln.slice(0,4);
        }
        return true;
      }
    }
    return false;
  }

  function highlightWin(){ /* handled in render which applies winCoords */ }

  // ----- AI  helpers -----
  function getValidMoves(board){
    const moves = [];
    for(let c=0;c<COLS;c++) if(board[c].indexOf(0)!==-1) moves.push(c);
    return moves;
  }

  function makeMove(board, col, player){
    const copy = board.map(colArr => colArr.slice());
    const slot = copy[col].indexOf(0);
    if(slot!==-1) copy[col][slot] = player;
    return copy;
  }

  function hasWinnerOnBoard(board, player){
    // brute-force check every cell for a win for player
    for(let c=0;c<COLS;c++){
      for(let r=0;r<ROWS;r++){
        if(board[c][r]!==player) continue;
        // check dirs
        const dirs = [[1,0],[0,1],[1,1],[1,-1]];
        for(const [dc,dr] of dirs){
          let cnt=1; let cc=c+dc, rr=r+dr;
          while(cc>=0 && cc<COLS && rr>=0 && rr<ROWS && board[cc][rr]===player){ cnt++; cc+=dc; rr+=dr; }
          cc=c-dc; rr=r-dr;
          while(cc>=0 && cc<COLS && rr>=0 && rr<ROWS && board[cc][rr]===player){ cnt++; cc-=dc; rr-=dr; }
          if(cnt>=4) return true;
        }
      }
    }
    return false;
  }

  function evaluateWindow(window, player){
    const opp = player===2?1:2;
    const countPlayer = window.filter(v=>v===player).length;
    const countOpp = window.filter(v=>v===opp).length;
    const countEmpty = window.filter(v=>v===0).length;
    let score = 0;
    if(countPlayer===4) score += 100;
    else if(countPlayer===3 && countEmpty===1) score += 5;
    else if(countPlayer===2 && countEmpty===2) score += 2;
    if(countOpp===3 && countEmpty===1) score -= 4;
    return score;
  }

  function scorePosition(board, player){
    let score = 0;
    // center column preference
    const centerArray = board[Math.floor(COLS/2)];
    score += centerArray.filter(v=>v===player).length * 3;
    // horizontal
    for(let r=0;r<ROWS;r++){
      const rowArray = [];
      for(let c=0;c<COLS;c++) rowArray.push(board[c][r]);
      for(let c=0;c<COLS-3;c++){
        const window = rowArray.slice(c,c+4);
        score += evaluateWindow(window, player);
      }
    }
    // vertical
    for(let c=0;c<COLS;c++){
      for(let r=0;r<ROWS-3;r++){
        const window = [board[c][r],board[c][r+1],board[c][r+2],board[c][r+3]];
        score += evaluateWindow(window, player);
      }
    }
    // pos diag
    for(let c=0;c<COLS-3;c++){
      for(let r=0;r<ROWS-3;r++){
        const window = [board[c][r],board[c+1][r+1],board[c+2][r+2],board[c+3][r+3]];
        score += evaluateWindow(window, player);
      }
    }
    // neg diag
    for(let c=0;c<COLS-3;c++){
      for(let r=3;r<ROWS;r++){
        const window = [board[c][r],board[c+1][r-1],board[c+2][r-2],board[c+3][r-3]];
        score += evaluateWindow(window, player);
      }
    }
    return score;
  }

  function isTerminalNode(board){
    return getValidMoves(board).length===0 || hasWinnerOnBoard(board,1) || hasWinnerOnBoard(board,2);
  }

  function minimax(board, depth, alpha, beta, maximizingPlayer){
    const validLocations = getValidMoves(board);
    const isTerminal = isTerminalNode(board);
    if(depth===0 || isTerminal){
      if(isTerminal){
        if(hasWinnerOnBoard(board,2)) return {score: 1000000000};
        else if(hasWinnerOnBoard(board,1)) return {score: -1000000000};
        else return {score: 0};
      } else {
        return {score: scorePosition(board, 2)};
      }
    }

    if(maximizingPlayer){
      let value = -Infinity; let column = validLocations[0];
      for(const col of validLocations){
        const b = makeMove(board, col, 2);
        const newScore = minimax(b, depth-1, alpha, beta, false).score;
        if(newScore > value){ value = newScore; column = col; }
        alpha = Math.max(alpha, value);
        if(alpha >= beta) break;
      }
      return {score: value, column};
    } else {
      let value = Infinity; let column = validLocations[0];
      for(const col of validLocations){
        const b = makeMove(board, col, 1);
        const newScore = minimax(b, depth-1, alpha, beta, true).score;
        if(newScore < value){ value = newScore; column = col; }
        beta = Math.min(beta, value);
        if(alpha >= beta) break;
      }
      return {score: value, column};
    }
  }

  function aiMove(){
    // quick immediate win or block
    const valid = getValidMoves(grid);
    for(const col of valid){
      const temp = makeMove(grid, col, 2);
      if(hasWinnerOnBoard(temp,2)){ placeDisc(col); locked=false; render(); return; }
    }
    for(const col of valid){
      const temp = makeMove(grid, col, 1);
      if(hasWinnerOnBoard(temp,1)){ placeDisc(col); locked=false; render(); return; }
    }

    // minimax search (depth scaled by available moves and difficulty)
    let depth = Math.min(6, Math.max(2, Math.floor(24/Math.max(1, getValidMoves(grid).length)) + 1));
    if(document.getElementById('cpuDifficulty')){
      const d = document.getElementById('cpuDifficulty').value;
      if(d==='easy') depth = Math.max(2, Math.min(depth, 3));
      else if(d==='medium') depth = Math.max(4, Math.min(depth, 5));
      else if(d==='hard') depth = Math.max(6, depth);
    }
    const {column} = minimax(grid, depth, -Infinity, Infinity, true);
    if(typeof column === 'number' && isValidMove(column)){
      placeDisc(column);
    } else {
      // fallback random
      const picks = getValidMoves(grid);
      if(picks.length) placeDisc(picks[Math.floor(Math.random()*picks.length)]);
    }
    locked=false; render();
  }

  // ----- Reset / Init -----
  function reset(){
    winner = null; winCoords = []; locked = false; current = 1; makeGrid(); redoStack = []; loadWins(); render();
    const undoBtn = document.getElementById('undo'); if(undoBtn) undoBtn.disabled = true;
    const redoBtn = document.getElementById('redo'); if(redoBtn) redoBtn.disabled = true;
  }

  document.addEventListener('DOMContentLoaded', ()=>{
    try{
      makeGrid(); loadWins(); render();
      resetBtn.addEventListener('click', reset);
      const undoBtn = document.getElementById('undo');
      const redoBtn = document.getElementById('redo');
      if(undoBtn){ undoBtn.addEventListener('click', ()=>{ undoMove(); }); undoBtn.disabled = true; }
      if(redoBtn){ redoBtn.addEventListener('click', ()=>{ redoMove(); }); redoBtn.disabled = true; }
      if(cpuToggle) cpuToggle.addEventListener('change', ()=>{ reset(); });
      if(jsOkEl) jsOkEl.textContent = 'JS OK';

      // keyboard shortcuts: 1-7 to drop in columns, U to undo, R to redo
      document.addEventListener('keydown', (e)=>{
        if(document.activeElement && (document.activeElement.tagName==='INPUT' || document.activeElement.tagName==='SELECT')) return;
        if(e.key >= '1' && e.key <= '7'){ const col = parseInt(e.key,10)-1; playerMove(col); }
        if(e.key.toLowerCase() === 'u'){ undoMove(); }
        if(e.key.toLowerCase() === 'r'){ redoMove(); }
      });

      // enhance accessibility: make columns focusable
      const makeColsFocusable = ()=>{
        const cols = boardEl.querySelectorAll('.col');
        cols.forEach(c=>{ c.tabIndex = 0; c.setAttribute('role','button'); c.setAttribute('aria-label', 'Column '+(parseInt(c.dataset.col,10)+1)); c.addEventListener('keydown', (ev)=>{ if(ev.key==='Enter' || ev.key===' ') playerMove(parseInt(c.dataset.col,10)); }); });
      };
      // call after first render
      makeColsFocusable();


      // If starting vs CPU and CPU starts as player 2, nothing to do until human plays
    }catch(err){
      console.error('Connect Four init error', err);
      const overlay = document.createElement('div'); overlay.textContent = 'JS Error: '+err.message; overlay.style.color='red'; document.body.appendChild(overlay);
    }
  });
})();