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
        const canvas = document.getElementById('c');
        const ctx = canvas.getContext('2d');
        const scoreEl = document.getElementById('score');
        const bestEl = document.getElementById('best');
        const startBtn = document.getElementById('start');
        const pauseBtn = document.getElementById('pause');
        let gridSize = 18; // number of cells across (canvas 360 -> cell 20)
        let cell = canvas.width / gridSize;
        let snake = [{x:8,y:8}];
        let dir = {x:0,y:0};
        let food = {x:3,y:3};
        let running = false; let speed = 120; let timer = null; let score = 0;

        function loadBest(){bestEl.textContent = localStorage.getItem('snake-best')||0}
        function saveBest(){const prev = parseInt(localStorage.getItem('snake-best')||'0'); if(score>prev) localStorage.setItem('snake-best',score); loadBest()}

        function placeFood(){while(true){const x = Math.floor(Math.random()*gridSize); const y = Math.floor(Math.random()*gridSize); if(!snake.some(s=>s.x===x && s.y===y)){food={x,y};break}}}

        function draw(){ctx.clearRect(0,0,canvas.width,canvas.height);
          // draw food
          ctx.fillStyle='#ffb86b'; ctx.fillRect(food.x*cell+2,food.y*cell+2,cell-4,cell-4);
          // draw snake
          for(let i=0;i<snake.length;i++){const s = snake[i]; ctx.fillStyle = i===0 ? '#10b981' : '#06b6d4'; ctx.fillRect(s.x*cell+1,s.y*cell+1,cell-2,cell-2)} }

        function step(){ if(!running) return; const head = {x: snake[0].x + dir.x, y: snake[0].y + dir.y};
          // wrap around
          if(head.x<0) head.x = gridSize-1; if(head.x>=gridSize) head.x=0;
          if(head.y<0) head.y = gridSize-1; if(head.y>=gridSize) head.y=0;
          // collision
          if(snake.some(s=>s.x===head.x && s.y===head.y)){running=false; clearInterval(timer); alert('Game over — score: '+score); saveBest(); return}
          snake.unshift(head);
          if(head.x===food.x && head.y===food.y){score++; scoreEl.textContent = score; placeFood();} else {snake.pop()}
          draw(); }

        function start(){ if(running) return; running=true; clearInterval(timer); timer = setInterval(step, speed)}
        function pause(){ running=false; clearInterval(timer)}

        document.addEventListener('keydown',(e)=>{
          if(e.key==='ArrowUp' && dir.y!==1) dir={x:0,y:-1};
          if(e.key==='ArrowDown' && dir.y!==-1) dir={x:0,y:1};
          if(e.key==='ArrowLeft' && dir.x!==1) dir={x:-1,y:0};
          if(e.key==='ArrowRight' && dir.x!==-1) dir={x:1,y:0};
        });

        // simple swipe handling
        let sx, sy;
        canvas.addEventListener('touchstart', e=>{const t=e.touches[0]; sx=t.clientX; sy=t.clientY});
        canvas.addEventListener('touchend', e=>{const t=e.changedTouches[0]; const dx=t.clientX-sx; const dy=t.clientY-sy; if(Math.abs(dx)>Math.abs(dy)){ if(dx>30 && dir.x!==-1) dir={x:1,y:0}; if(dx<-30 && dir.x!==1) dir={x:-1,y:0} } else { if(dy>30 && dir.y!==-1) dir={x:0,y:1}; if(dy<-30 && dir.y!==1) dir={x:0,y:-1} }});

        startBtn.addEventListener('click', ()=>{ // reset
          snake=[{x:8,y:8}]; dir={x:1,y:0}; score=0; scoreEl.textContent=0; placeFood(); start();});
        pauseBtn.addEventListener('click', ()=>{ if(running) pause(); else start()});

        // init
        placeFood(); draw(); loadBest();
      }catch(e){showErrorOverlay(e.message);console.error(e)}
    });

      // status badge
      const _s = document.createElement('div'); _s.textContent = 'JS OK'; _s.style.position='fixed'; _s.style.right='12px'; _s.style.top='12px'; _s.style.background='linear-gradient(90deg,#06b6d4,#10b981)'; _s.style.color='#021'; _s.style.padding='6px 10px'; _s.style.borderRadius='8px'; _s.style.zIndex=9999; _s.style.fontWeight='700'; document.body.appendChild(_s);

  }catch(e){
    console.error(e); document.addEventListener('DOMContentLoaded', ()=>showErrorOverlay(e.message));
  }
})();