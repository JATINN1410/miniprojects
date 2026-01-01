// Main hub interactions (enhanced hub UX)
function readScore(key){try{return localStorage.getItem(key)}catch(e){return null}}
function setBadge(selector, key, label){const el = document.querySelector(selector); const v = readScore(key); if(el){el.textContent = v ? label.replace('{v}', v) : '—'}}

document.addEventListener('DOMContentLoaded', ()=>{
  // keyboard shortcut (G) to focus first card
  document.addEventListener('keydown', (e)=>{
    if(e.key.toLowerCase()==='g'){
      const first = document.querySelector('.card');
      if(first) first.focus();
    }
  });

  // populate best scores where applicable
  setBadge('#tttBadge','tic-tac-toe-best','Best: {v}');
  setBadge('#connectBadge','connect-four-wins','Wins: {v}');
  setBadge('#minesBadge','minesweeper-best','Best: {v}s');
  setBadge('#pongBadge','pong-best','Best: {v}');
  setBadge('#simonBadge','simon-says-best','Best: {v}');
  setBadge('#2048Badge','2048-best','Best: {v}');
  setBadge('#snakeBadge','snake-best','Best: {v}');

  // simple 3D tilt on mouse move
  document.querySelectorAll('.card').forEach(card=>{
    card.addEventListener('mousemove', (e)=>{
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      card.style.transform = `perspective(900px) rotateX(${ -y * 6 }deg) rotateY(${ x * 6 }deg) translateZ(6px)`;
    });
    card.addEventListener('mouseleave', ()=>{card.style.transform='';});
    card.addEventListener('click', ()=>{card.blur()});
  });

  // Theme toggle (simple; adds .light class to body)
  const t = document.getElementById('themeToggle');
  if(t) t.addEventListener('click', ()=>{document.body.classList.toggle('light');});
});

// small confetti util (used by games)
window.confettiBurst = function(){
  const c = document.createElement('div'); c.className='confetti-container';
  for(let i=0;i<30;i++){const p = document.createElement('div');p.className='confetti';p.style.left=Math.random()*100+'%';p.style.background=['#7c3aed','#06b6d4','#f97316'][Math.floor(Math.random()*3)];p.style.transform='rotate('+Math.random()*360+'deg)';c.appendChild(p)}
  document.body.appendChild(c);setTimeout(()=>c.remove(),1600);
};