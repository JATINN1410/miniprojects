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
        const grid = document.getElementById('grid');
        const movesEl = document.getElementById('moves');
        const startBtn = document.getElementById('start');
        const modal = document.getElementById('modal');
        const modalTitle = document.getElementById('modalTitle');
        const finalMoves = document.getElementById('finalMoves');
        const playAgain = document.getElementById('playAgain');
        const closeModal = document.getElementById('closeModal');
        let icons = ['🍎','🍌','🍇','🍒','🍋','🥝','🍓','🍍']; // 8 pairs => 16 tiles
        let tiles = [];
        let opened = [];
        let moves = 0;
        let busy = false; // lock clicks while resolving a pair


        function shuffle(a){return a.sort(()=>Math.random()-0.5)}

        // small audio util
        function beep(freq=440, duration=120, type='sine'){try{const ctx = new (window.AudioContext||window.webkitAudioContext)();const o = ctx.createOscillator();const g = ctx.createGain();o.type = type;o.frequency.value = freq;o.connect(g);g.connect(ctx.destination);g.gain.value = 0.06;o.start();g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration/1000);setTimeout(()=>{o.stop();ctx.close()}, duration+20)}catch(e){} }

        let pendingTimeout = null;
        const MISMATCH_DELAY = 1200; // ms to hold tiles visible on mismatch
        function build(){
          // clear any pending timeout when rebuilding
          if(pendingTimeout) { clearTimeout(pendingTimeout); pendingTimeout = null }
          busy = false; opened = []; moves = 0; movesEl.textContent = 'Moves: 0';
          grid.innerHTML='';
          grid.style.pointerEvents = 'auto';
          const deck = shuffle([...icons,...icons]);
          deck.forEach((val,idx)=>{
            const t = document.createElement('div');
            t.className='tile';
            t.dataset.value=val;
            t.dataset.locked='false';
            t.innerHTML='';
            // use pointerdown to avoid double click/tap issues
            t.addEventListener('pointerdown', (ev)=>{ ev.preventDefault(); flip(t); });
            grid.appendChild(t);
          });
        }

        function saveBest(moves){try{const prev = parseInt(localStorage.getItem('memory-match-best')||'9999'); if(moves<prev){localStorage.setItem('memory-match-best',moves); document.querySelectorAll('.card').forEach(()=>{});}}catch(e){}
        }

        function showModal(moves){finalMoves.textContent = moves; modal.setAttribute('aria-hidden','false'); modalTitle.textContent='You matched all cards!'; beep(520,140,'sine');}
        function hideModal(){modal.setAttribute('aria-hidden','true')}

        function flip(tile){
          try{
            console.log('MM flip called', tile.dataset.value, 'hasFlip', tile.classList.contains('flip'), 'openedLen', opened.length, 'busy', busy, 'locked', tile.dataset.locked);
            if(busy) return; // ignore clicks while resolving
            if(tile.dataset.locked === 'true') return; // per-tile lock
            if(tile.classList.contains('flip') || opened.length===2) return;
            // prevent double-clicking the same tile and treating it as a pair
            if(opened.length===1 && opened[0]===tile) return;

            // if this is the second tile to flip, preemptively lock interactions to avoid extra flips
            if(opened.length===1){
              busy = true;
              grid.style.pointerEvents = 'none';
            }

            // lock tile immediately and flip
            tile.dataset.locked = 'true';
            tile.classList.add('flip');
            tile.textContent = tile.dataset.value;
            beep(420,80,'sine');
            opened.push(tile);
            console.log('MM opened after push', opened.map(t=>t.dataset.value));
            if(opened.length===2){
              // moves increment and resolution handled here
              moves++; movesEl.textContent = 'Moves: '+moves;
              const a = opened[0], b = opened[1];
              if(a.dataset.value === b.dataset.value){
                console.log('MM match', a.dataset.value);
                a.classList.add('matched'); b.classList.add('matched');
                // keep tiles locked when matched
                a.dataset.locked = 'true'; b.dataset.locked = 'true';
                beep(800,160,'square');
                opened=[];
                busy = false;
                // re-enable interactions
                grid.style.pointerEvents = 'auto';
                if(document.querySelectorAll('.tile:not(.flip)').length===0){
                  setTimeout(()=>{saveBest(moves); showModal(moves);},400);
                }
              } else {
                console.log('MM mismatch', a.dataset.value, b.dataset.value);
                // ensure we clear previous timeout
                if(pendingTimeout) clearTimeout(pendingTimeout);
                pendingTimeout = setTimeout(()=>{
                  opened.forEach(t=>{t.classList.remove('flip'); t.textContent=''; t.dataset.locked='false'; console.log('MM unflip', t.dataset.value)});
                  opened=[];
                  busy = false;
                  pendingTimeout = null;
                  // re-enable interactions
                  grid.style.pointerEvents = 'auto';
                }, MISMATCH_DELAY);
              }
            }
          }catch(err){showErrorOverlay(err.message);console.error(err)}
        }

        startBtn.addEventListener('click', ()=>{moves=0;movesEl.textContent='Moves: 0';build();});
        playAgain.addEventListener('click', ()=>{hideModal();startBtn.click();});
        closeModal.addEventListener('click', ()=>{hideModal();});

        // auto start
        build();
      }catch(e){showErrorOverlay(e.message);console.error(e)}
    });

      // status badge
      const _s = document.createElement('div'); _s.textContent = 'JS OK'; _s.style.position='fixed'; _s.style.right='12px'; _s.style.top='12px'; _s.style.background='linear-gradient(90deg,#f97316,#06b6d4)'; _s.style.color='#021'; _s.style.padding='6px 10px'; _s.style.borderRadius='8px'; _s.style.zIndex=9999; _s.style.fontWeight='700'; document.body.appendChild(_s);

  }catch(e){
    console.error(e); document.addEventListener('DOMContentLoaded', ()=>showErrorOverlay(e.message));
  }
})();