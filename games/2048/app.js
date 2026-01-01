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
        const scoreEl = document.getElementById('score');
        const bestEl = document.getElementById('best');
        const newBtn = document.getElementById('new');
        let grid = Array(16).fill(0);
        let score = 0;

        function loadBest(){bestEl.textContent = localStorage.getItem('2048-best')||0}
        function saveBest(){const prev = parseInt(localStorage.getItem('2048-best')||'0'); if(score>prev) localStorage.setItem('2048-best', score); loadBest()}

        function spawn(){
          const empties = grid.map((v,i)=>v?null:i).filter(v=>v!==null);
          if(empties.length===0) return false;
          const idx = empties[Math.floor(Math.random()*empties.length)];
          grid[idx] = Math.random()<0.9?2:4; return true;
        }

        function build(){
          boardEl.innerHTML = '';
          for(let i=0;i<16;i++){
            const cell = document.createElement('div'); cell.className='cell';
            if(grid[i]){const t = document.createElement('div'); t.className='tile t'+grid[i]; t.textContent = grid[i]; if(grid[i]>64) t.classList.add('large'); cell.appendChild(t)}
            boardEl.appendChild(cell);
          }
        }

        function compress(row){const newr = row.filter(v=>v); while(newr.length<4) newr.push(0); return newr}
        function merge(row){for(let i=0;i<3;i++){if(row[i] && row[i]===row[i+1]){row[i]*=2; score += row[i]; row[i+1]=0}} return row}

        function moveLeft(){
          let moved=false;
          for(let r=0;r<4;r++){
            const start = r*4; const row = [grid[start],grid[start+1],grid[start+2],grid[start+3]];
            let c = compress(row); c = merge(c); c = compress(c);
            for(let i=0;i<4;i++){ if(grid[start+i]!==c[i]) moved=true; grid[start+i]=c[i]; }
          }
          if(moved){ spawn(); build(); scoreEl.textContent = score; saveBest(); if(gameOver()){setTimeout(()=>alert('Game over — score: '+score),120)} return true }
          return false;
        }

        function moveRight(){
          let moved=false;
          for(let r=0;r<4;r++){
            const start = r*4; let row = [grid[start],grid[start+1],grid[start+2],grid[start+3]];
            row.reverse(); let c = compress(row); c = merge(c); c = compress(c); c.reverse();
            for(let i=0;i<4;i++){ if(grid[start+i]!==c[i]) moved=true; grid[start+i]=c[i]; }
          }
          if(moved){ spawn(); build(); scoreEl.textContent = score; saveBest(); if(gameOver()){setTimeout(()=>alert('Game over — score: '+score),120)} return true }
          return false;
        }

        function moveUp(){
          let moved=false;
          for(let col=0;col<4;col++){
            let colArr = [grid[col],grid[4+col],grid[8+col],grid[12+col]];
            let c = compress(colArr); c = merge(c); c = compress(c);
            for(let r=0;r<4;r++){ if(grid[r*4+col]!==c[r]) moved=true; grid[r*4+col]=c[r]; }
          }
          if(moved){ spawn(); build(); scoreEl.textContent = score; saveBest(); if(gameOver()){setTimeout(()=>alert('Game over — score: '+score),120)} return true }
          return false;
        }

        function moveDown(){
          let moved=false;
          for(let col=0;col<4;col++){
            let colArr = [grid[col],grid[4+col],grid[8+col],grid[12+col]];
            colArr.reverse(); let c = compress(colArr); c = merge(c); c = compress(c); c.reverse();
            for(let r=0;r<4;r++){ if(grid[r*4+col]!==c[r]) moved=true; grid[r*4+col]=c[r]; }
          }
          if(moved){ spawn(); build(); scoreEl.textContent = score; saveBest(); if(gameOver()){setTimeout(()=>alert('Game over — score: '+score),120)} return true }
          return false;
        }

        function gameOver(){
          if(grid.some(v=>v===0)) return false;
          for(let r=0;r<4;r++){for(let c=0;c<3;c++){if(grid[r*4+c]===grid[r*4+c+1]) return false}}
          for(let c=0;c<4;c++){for(let r=0;r<3;r++){if(grid[r*4+c]===grid[(r+1)*4+c]) return false}}
          return true
        }

        function init(){grid = Array(16).fill(0); score = 0; scoreEl.textContent = score; spawn(); spawn(); build(); loadBest()}

        document.addEventListener('keydown', (e)=>{
          let moved=false;
          if(e.key==='ArrowLeft') moved = moveLeft();
          if(e.key==='ArrowRight') moved = moveRight();
          if(e.key==='ArrowUp') moved = moveUp();
          if(e.key==='ArrowDown') moved = moveDown();
          // moved handlers already perform gameOver check
        });

        // simple swipe support
        let startX, startY;
        boardEl.addEventListener('touchstart', e=>{const t=e.touches[0];startX=t.clientX;startY=t.clientY});
        boardEl.addEventListener('touchend', e=>{const t=e.changedTouches[0];const dx=t.clientX-startX;const dy=t.clientY-startY; if(Math.abs(dx)>Math.abs(dy)){ if(dx>30) moveRight(); else if(dx<-30) moveLeft()} else { if(dy>30) moveDown(); else if(dy<-30) moveUp()}});

        newBtn.addEventListener('click', init);

        init();

        // status badge
        const _s = document.createElement('div');
        _s.textContent = 'JS OK';
        _s.style.position='fixed'; _s.style.right='12px'; _s.style.top='12px';
        _s.style.background='linear-gradient(90deg,#06b6d4,#f59e0b)'; _s.style.color='#021';
        _s.style.padding='6px 10px'; _s.style.borderRadius='8px'; _s.style.zIndex=9999; _s.style.fontWeight='700';
        document.body.appendChild(_s);
      }catch(e){showErrorOverlay(e.message);console.error(e)}
    });

    }catch(e){
      console.error(e); document.addEventListener('DOMContentLoaded', ()=>showErrorOverlay(e.message));
    }
})();