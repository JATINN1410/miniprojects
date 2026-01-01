(function(){
  function showErrorOverlay(msg){
    const ov = document.createElement('div');
    ov.style.position='fixed';ov.style.inset='12px';ov.style.zIndex=9999;ov.style.background='linear-gradient(90deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))';ov.style.backdropFilter='blur(6px)';ov.style.border='1px solid rgba(255,255,255,0.06)';ov.style.padding='12px';ov.style.borderRadius='10px';
    ov.innerHTML = `<strong>Init error</strong><div style="margin-top:8px">${String(msg)}</div><div style="margin-top:8px"><button id="dbgReload">Reload</button></div>`;
    document.body.appendChild(ov);
    document.getElementById('dbgReload').addEventListener('click', ()=>location.reload());
  }

  try{
    document.addEventListener('DOMContentLoaded', ()=>{
      try{
        const boardEl = document.getElementById('board');
        const cells = Array.from(document.querySelectorAll('.cell'));
        const statusTurn = document.getElementById('turn');
        const modeLabel = document.getElementById('modeLabel');
        const twoPlayerBtn = document.getElementById('twoPlayer');
        const vsCpuBtn = document.getElementById('vsCpu');
        const winsCountEl = document.getElementById('winsCount');

        let board = Array(9).fill(null);
        let turn = 'X';
        let gameOver = false;
        let mode = '2p'; // '2p' or 'cpu'

        const WIN = [
          [0,1,2],[3,4,5],[6,7,8],
          [0,3,6],[1,4,7],[2,5,8],
          [0,4,8],[2,4,6]
        ];

        function loadWins(){try{const v = parseInt(localStorage.getItem('tic-tac-toe-wins')||'0');winsCountEl.textContent = v}catch(e){winsCountEl.textContent = 0}}
        function addWin(){try{const v = parseInt(localStorage.getItem('tic-tac-toe-wins')||'0')+1;localStorage.setItem('tic-tac-toe-wins',v);winsCountEl.textContent=v}catch(e){}}

        function render(){
          // debug
          console.log('TTT render', board, 'turn', turn, 'gameOver', gameOver);
          // update on-page debug panel if present
          const dbg = document.getElementById('tttDebug'); if(dbg){ dbg.textContent = 'Last: ' + (board.join('|')) + '  (turn: '+turn+')' }
          cells.forEach((c,i)=>{c.textContent = board[i] || ''; c.classList.remove('win')});
          statusTurn.textContent = turn;
        }

        function highlightWinningLine(symbol){
          for(const w of WIN){const [a,b,c]=w; if(board[a]===symbol && board[b]===symbol && board[c]===symbol){cells[a].classList.add('win');cells[b].classList.add('win');cells[c].classList.add('win'); return}}}

        function checkWin(){
          for(const w of WIN){
            const [a,b,c] = w;
            if(board[a] && board[a]===board[b] && board[b]===board[c]) return board[a];
          }
          if(board.every(Boolean)) return 'draw';
          return null;
        }

        // simple minimax for 9-cell tic tac toe
        function avail(board){return board.map((v,i)=>v?null:i).filter(v=>v!==null)}
        function minimax(bd, player){
          const winner = (function(){
            for(const w of WIN){const [a,b,c]=w; if(bd[a] && bd[a]===bd[b] && bd[b]===bd[c]) return bd[a]}
            if(bd.every(Boolean)) return 'draw'; return null;
          })();
          if(winner==='X') return {score: -10};
          if(winner==='O') return {score: 10};
          if(winner==='draw') return {score:0};

          const moves = [];
          for(const i of avail(bd)){
            const mb = bd.slice(); mb[i] = player;
            const res = minimax(mb, player==='O' ? 'X' : 'O');
            moves.push({idx:i, score: res.score});
          }
          if(player==='O'){
            let best = moves.reduce((p,c)=> c.score>p.score?c:p,moves[0]); return best;
          } else {
            let best = moves.reduce((p,c)=> c.score<p.score?c:p,moves[0]); return best;
          }
        }

        function cpuMove(){
          if(gameOver) return;
          const best = minimax(board.slice(), 'O');
          console.log('TTT cpuMove best', best);
          const index = best && best.idx;
          if(index!==undefined){
            board[index] = 'O';
            const result = checkWin();
            if(result){
              gameOver=true;
              if(result==='draw'){setTimeout(()=>alert("It's a draw!"),80)}
              else {highlightWinningLine(result); setTimeout(()=>{alert(result+' wins!'); if(mode==='cpu' && result==='X'){addWin(); window.confettiBurst();}},80)}
            } else {turn='X'}
            render();
          }
        }

        // add on-page debug panel
        (function(){
          const d = document.createElement('div'); d.id='tttDebug'; d.style.position='fixed'; d.style.right='12px'; d.style.bottom='12px'; d.style.background='rgba(0,0,0,0.6)'; d.style.color='#fff'; d.style.padding='8px 10px'; d.style.borderRadius='8px'; d.style.fontFamily='monospace'; d.style.zIndex='9999'; d.style.fontSize='12px'; d.textContent='Last: (none)'; document.body.appendChild(d);
        })();

        // use event delegation on board to ensure clicks are handled even if DOM nodes are re-rendered
        boardEl.addEventListener('click', (ev)=>{
          try{
            const clicked = ev.target.closest('.cell');
            if(!clicked) return;
            const idx = parseInt(clicked.dataset.index, 10);
            // update on-page debug too
            const dbg = document.getElementById('tttDebug'); if(dbg) dbg.textContent = 'Click: '+idx+' — before: '+board.join('|')+' (turn:'+turn+')';
            console.log('TTT board click', idx, 'boardBefore', board.slice(), 'turn', turn, 'gameOver', gameOver);
            if(gameOver || board[idx]) return;
            if(mode==='cpu' && turn==='O') return; // block clicking while cpu's turn

            board[idx]=turn;
            console.log('TTT placed', idx, 'as', turn, 'boardAfter', board.slice());
            const result = checkWin();
            if(result){
              gameOver = true;
              if(result==='draw') alert('It\'s a draw!');
              else {highlightWinningLine(result); if(mode==='cpu' && result==='X'){addWin(); window.confettiBurst()} alert(result + ' wins!')}
            } else {
              turn = turn === 'X' ? 'O' : 'X';
              if(mode==='cpu' && turn==='O') setTimeout(cpuMove, 520);
            }
            render();
          }catch(err){showErrorOverlay(err.message);console.error(err)}
        });

        document.getElementById('reset').addEventListener('click', ()=>{
          board = Array(9).fill(null); turn = 'X'; gameOver=false; render();
        });

        twoPlayerBtn.addEventListener('click', ()=>{mode='2p';modeLabel.textContent='2 Players';twoPlayerBtn.setAttribute('aria-pressed', 'true');vsCpuBtn.setAttribute('aria-pressed','false')});
        vsCpuBtn.addEventListener('click', ()=>{mode='cpu';modeLabel.textContent='Play vs CPU';twoPlayerBtn.setAttribute('aria-pressed', 'false');vsCpuBtn.setAttribute('aria-pressed','true'); if(turn==='O' && !gameOver) setTimeout(cpuMove, 200)});

        // init
        render(); loadWins();
      }catch(e){ showErrorOverlay(e.message); console.error(e)}
    });

      // status badge
      const _s = document.createElement('div'); _s.textContent = 'JS OK'; _s.style.position='fixed'; _s.style.right='12px'; _s.style.top='12px'; _s.style.background='linear-gradient(90deg,#06b6d4,#7c3aed)'; _s.style.color='#021'; _s.style.padding='6px 10px'; _s.style.borderRadius='8px'; _s.style.zIndex=9999; _s.style.fontWeight='700'; document.body.appendChild(_s);

  }catch(e){
    console.error(e); document.addEventListener('DOMContentLoaded', ()=>showErrorOverlay(e.message));
  }
})();