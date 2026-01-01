// Pong - canvas based with AI paddle and scoring
(function(){
  'use strict';
  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d');
  const startBtn = document.getElementById('start');
  const pauseBtn = document.getElementById('pause');
  const resetBtn = document.getElementById('reset');
  const aiToggle = document.getElementById('aiToggle');
  const scoreEl = document.getElementById('score');
  const bestEl = document.getElementById('best');
  const statusEl = document.getElementById('status');
  const jsOkEl = document.getElementById('jsOk');
  const STORAGE_KEY = 'pong-best';

  // logical size
  let W = 800, H = 480;
  function resizeCanvas(){
    // keep internal resolution fixed for gameplay
    const rect = canvas.getBoundingClientRect();
    canvas.width = Math.max(560, Math.floor(rect.width));
    canvas.height = Math.floor(canvas.width * (H / W));
  }
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  // game state (sizes adapt to canvas)
  function getSizes(){
    const ph = Math.max(36, Math.floor(canvas.height * 0.18));
    const pw = Math.max(8, Math.floor(canvas.width * 0.015));
    const br = Math.max(6, Math.floor(canvas.width * 0.01));
    return {paddleH:ph, paddleW:pw, ballR:br};
  }
  let leftY = 0, rightY = 0; // top positions (initialized on reset)
  let leftScore = 0, rightScore = 0;
  let ballX=canvas.width/2, ballY=canvas.height/2, ballVX=6, ballVY=3;
  let running = false, paused = false, lastTime = 0;
  let keys = {};

  function loadBest(){ const v = localStorage.getItem(STORAGE_KEY); bestEl.textContent = v||'—'; }
  function saveBest(score){ const prev = parseInt(localStorage.getItem(STORAGE_KEY)||'0',10); if(!prev || score>prev){ localStorage.setItem(STORAGE_KEY, score.toString()); loadBest(); } }

  function resetGame(){ leftScore=0; rightScore=0; scoreEl.textContent = `${leftScore} - ${rightScore}`; const s = getSizes(); leftY = (canvas.height - s.paddleH)/2; rightY = (canvas.height - s.paddleH)/2; resetBall(); }
  function resetBall(){ ballX = canvas.width/2; ballY = canvas.height/2; ballVX = (Math.random()>0.5?1:-1) * (5 + Math.random()*3); ballVY = (Math.random()*4-2); }

  // input
  document.addEventListener('keydown', e=>{ keys[e.key.toLowerCase()]=true; if(e.key===' '){ paused=!paused; } });
  document.addEventListener('keyup', e=>{ keys[e.key.toLowerCase()]=false; });

  function update(dt){
    if(paused) return;
    // player controls: w/s for left, up/down for right when not AI
    if(keys['w']) leftY -= 300 * dt;
    if(keys['s']) leftY += 300 * dt;
    if(!aiToggle.checked){ if(keys['arrowup']) rightY -= 300 * dt; if(keys['arrowdown']) rightY += 300 * dt; }

    // clamp using dynamic sizes
    const sizes = getSizes(); const paddleH = sizes.paddleH; const paddleW = sizes.paddleW; const ballR = sizes.ballR;
    leftY = Math.max(0, Math.min(canvas.height - paddleH, leftY));
    rightY = Math.max(0, Math.min(canvas.height - paddleH, rightY));

    // AI for right paddle
    if(aiToggle.checked){
      // simple proportional controller with smoothing
      const target = ballY - paddleH/2;
      rightY += (target - rightY) * (0.04 + Math.min(0.08, Math.abs(ballVX)/40));
      rightY = Math.max(0, Math.min(canvas.height - paddleH, rightY));
    }

    // move ball
    ballX += ballVX;
    ballY += ballVY;

    // top/bottom collision
    if(ballY - ballR < 0){ ballY = ballR; ballVY = -ballVY; }
    if(ballY + ballR > canvas.height){ ballY = canvas.height - ballR; ballVY = -ballVY; }

    // left paddle collision (using dynamic sizes)
    if(ballX - ballR < paddleW){ if(ballY > leftY && ballY < leftY + paddleH){ ballX = paddleW + ballR; ballVX = -ballVX * 1.05; ballVY += (Math.random()-0.5)*2; } }
    // right paddle collision
    if(ballX + ballR > canvas.width - paddleW){ if(ballY > rightY && ballY < rightY + paddleH){ ballX = canvas.width - paddleW - ballR; ballVX = -ballVX * 1.05; ballVY += (Math.random()-0.5)*2; } }

    // scoring
    if(ballX < 0){ rightScore++; scoreEl.textContent = `${leftScore} - ${rightScore}`; resetBall(); }
    if(ballX > canvas.width){ leftScore++; scoreEl.textContent = `${leftScore} - ${rightScore}`; resetBall(); }

    // update best by total points (leftScore wins or rightScore)
    const total = Math.max(leftScore, rightScore);
    saveBest(total);
  }

  function draw(){
    ctx.clearRect(0,0,canvas.width,canvas.height);
    const sizes = getSizes(); const paddleH = sizes.paddleH; const paddleW = sizes.paddleW; const ballR = sizes.ballR;
    // middle line
    ctx.fillStyle = 'rgba(255,255,255,0.06)';
    const step = Math.max(12, Math.floor(canvas.height*0.04)); for(let y=0;y<canvas.height;y+=step){ ctx.fillRect(canvas.width/2-1,y,2,Math.floor(step*0.6)); }
    // paddles
    ctx.fillStyle = '#06b6d4'; ctx.fillRect(0,leftY,paddleW,paddleH);
    ctx.fillStyle = '#ffb86b'; ctx.fillRect(canvas.width - paddleW, rightY, paddleW, paddleH);
    // ball
    ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(ballX, ballY, ballR, 0, Math.PI*2); ctx.fill();
  }

  function loop(ts){ if(!running) return; if(!lastTime) lastTime = ts; const dt = Math.min(0.05,(ts - lastTime)/1000); lastTime = ts; update(dt); draw(); requestAnimationFrame(loop); }

  startBtn.addEventListener('click', ()=>{ if(!running){ running = true; paused = false; lastTime = 0; requestAnimationFrame(loop); statusEl.firstChild.nodeValue = 'Running '; } });
  pauseBtn.addEventListener('click', ()=>{ paused = !paused; statusEl.firstChild.nodeValue = paused? 'Paused ' : 'Running '; });
  resetBtn.addEventListener('click', ()=>{ running = false; paused = false; resetGame(); draw(); statusEl.firstChild.nodeValue = 'Ready '; });

  // init
  document.addEventListener('DOMContentLoaded', ()=>{
    try{
      loadBest(); resetGame(); draw(); if(jsOkEl) jsOkEl.textContent = 'JS OK';
    }catch(err){ console.error('Pong init error', err); const overlay=document.createElement('div'); overlay.textContent='JS Error: '+err.message; overlay.style.color='red'; document.body.appendChild(overlay); }
  });
})();