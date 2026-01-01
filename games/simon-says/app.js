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

      const startBtn = document.getElementById('start');
const segments = Array.from(document.querySelectorAll('.segment'));
const levelEl = document.getElementById('level');
const bestEl = document.getElementById('bestLevel');
let sequence = [];
let pos = 0;
let playing = false;

function rnd(){return Math.floor(Math.random()*4)}
function colorByIndex(i){return ['green','red','yellow','blue'][i]}
function segmentByColor(c){return segments.find(s=>s.dataset.color===c)}

function wait(ms){return new Promise(r=>setTimeout(r,ms))}

// WebAudio tones mapped to colors
const ctx = (function(){try{return new (window.AudioContext||window.webkitAudioContext)()}catch(e){return null}})();
const tones = {green:392, red:330, yellow:262, blue:196};
function tone(color, dur=300){if(!ctx) return; const o = ctx.createOscillator(); const g = ctx.createGain(); o.type='sine'; o.frequency.value = tones[color]; o.connect(g); g.connect(ctx.destination); g.gain.value = 0.06; o.start(); g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur/1000); setTimeout(()=>{o.stop()}, dur+10)}

async function flash(el){
  el.classList.add('active'); tone(el.dataset.color, 280);
  await wait(340); el.classList.remove('active');
}

async function playSequence(){
  for(const c of sequence){
    await flash(segmentByColor(c));
    await wait(180);
  }
}

function loadBest(){try{bestEl.textContent = 'Best: '+(localStorage.getItem('simon-says-best')||0)}catch(e){bestEl.textContent='Best: 0'}}
function saveBest(level){try{const prev = parseInt(localStorage.getItem('simon-says-best')||'0'); if(level>prev){localStorage.setItem('simon-says-best',level); loadBest(); window.confettiBurst();}}catch(e){}}

async function nextLevel(){
  sequence.push(colorByIndex(rnd()));
  pos=0;levelEl.textContent = 'Level: '+sequence.length;
  await wait(300);
  await playSequence();
  playing=true;
}

segments.forEach(s=>s.addEventListener('click', async ()=>{
  if(!playing) return;
  await flash(s);
  if(s.dataset.color !== sequence[pos]){alert('Wrong! Game over at level '+sequence.length); if(sequence.length-1>0) saveBest(sequence.length-1); reset(); return}
  pos++;
  if(pos===sequence.length){playing=false; await wait(300); nextLevel();}
}));

startBtn.addEventListener('click', ()=>{reset();nextLevel();});

function reset(){sequence=[];pos=0;playing=false;levelEl.textContent='Level: 0'}

loadBest();

      // status badge
      const _s = document.createElement('div'); _s.textContent = 'JS OK'; _s.style.position='fixed'; _s.style.right='12px'; _s.style.top='12px'; _s.style.background='linear-gradient(90deg,#10b981,#06b6d4)'; _s.style.color='#021'; _s.style.padding='6px 10px'; _s.style.borderRadius='8px'; _s.style.zIndex=9999; _s.style.fontWeight='700'; document.body.appendChild(_s);

    });
  }catch(e){
    console.error(e); document.addEventListener('DOMContentLoaded', ()=>showErrorOverlay(e.message));
  }
})();