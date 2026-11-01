// OAuth returns to the authorized site root; complete it on the account page.
const authParams = new URLSearchParams(location.search);
if ((authParams.has('code') || authParams.has('error')) && sessionStorage.getItem('qq-web-pkce')) {
  location.replace(new URL('dashboard.html' + location.search, location.href).href);
}
const copyButton = document.getElementById('copy-address');
copyButton.addEventListener('click', async () => {
  const result = document.getElementById('copy-result');
  try { await navigator.clipboard.writeText('chrome://extensions'); result.textContent = 'Copied. Paste it into Chrome’s address bar.'; }
  catch { result.textContent = 'Copy this address manually: chrome://extensions'; }
});
const demo = document.querySelector('.helper-demo');
const message = document.getElementById('demo-message');
document.getElementById('demo-run').addEventListener('click', () => {
  demo.classList.add('running'); message.textContent = 'Preview running · No assignment is connected';
});
document.getElementById('demo-stop').addEventListener('click', () => {
  demo.classList.remove('running'); message.textContent = 'Preview stopped · You’re in control';
});
document.getElementById('demo-minimize').addEventListener('click', event => {
  const minimized = demo.classList.toggle('minimized');
  event.currentTarget.textContent = minimized ? '+' : '−';
  event.currentTarget.setAttribute('aria-expanded', String(!minimized));
  event.currentTarget.setAttribute('aria-label', minimized ? 'Expand preview' : 'Minimize preview');
});

const film=document.querySelector('.product-film');
const filmSteps=[...document.querySelectorAll('[data-film-step]')];
const filmPlay=document.getElementById('film-play');
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const shots=[
 ['A small download. A simple start.','Download, extract, and load the extension in Chrome. Keep the extracted folder somewhere permanent.'],
 ['Everything, right where you work.','Open QuickQuizitive on your assignment. Your account, allowance, and Run and Stop controls live in the floating panel.'],
 ['Press Run. Find your rhythm.','The runner works through supported questions and advances automatically. Stop whenever you want to answer on your own.'],
 ['A little panel. A lot more room.','Minimize to compact controls, then drag the bar out of the way. Clicking elsewhere doesn’t stop the runner.'],
 ['The finish line is built in.','The runner stops at 100%. The latest version also shows a Completed · 100% message in both panel sizes.']
];
let shot=0,playing=false,inView=false,elapsed=0,lastTime=0,frame=null,finishedFilm=false;
const shotLength=6500;
function drawFilm(){document.querySelectorAll('.film-shot').forEach((el,i)=>el.classList.toggle('is-active',i===shot));film.dataset.shot=String(shot);film.dataset.playing=String(playing);filmSteps.forEach((button,i)=>{button.setAttribute('aria-pressed',String(i===shot));button.style.setProperty('--played',`${i<shot?100:i===shot?elapsed/shotLength*100:0}%`);});document.getElementById('film-number').textContent=`0${shot+1} / 05`;document.getElementById('film-title').textContent=shots[shot][0];document.getElementById('film-description').textContent=shots[shot][1];filmPlay.textContent=playing?'Ⅱ Pause':finishedFilm?'↺ Play again':'▶ Play';filmPlay.setAttribute('aria-label',playing?'Pause product demo':'Play product demo');}
function tickFilm(now){if(!playing||!inView||document.hidden){frame=null;lastTime=0;return;}if(lastTime)elapsed+=Math.min(now-lastTime,100);lastTime=now;if(elapsed>=shotLength){if(shot===shots.length-1){elapsed=shotLength;playing=false;finishedFilm=true;}else{shot++;elapsed=0;}}drawFilm();if(playing)frame=requestAnimationFrame(tickFilm);else frame=null;}
function scheduleFilm(){if(frame)cancelAnimationFrame(frame);frame=null;lastTime=0;if(playing&&inView&&!document.hidden)frame=requestAnimationFrame(tickFilm);drawFilm();}
filmPlay.addEventListener('click',()=>{if(finishedFilm){shot=0;elapsed=0;finishedFilm=false;}playing=!playing;scheduleFilm();});
document.getElementById('film-replay').addEventListener('click',()=>{shot=0;elapsed=0;finishedFilm=false;playing=!reduced.matches;scheduleFilm();});
filmSteps.forEach(button=>button.addEventListener('click',()=>{shot=Number(button.dataset.filmStep);elapsed=0;finishedFilm=false;playing=false;scheduleFilm();}));
new IntersectionObserver(entries=>{inView=entries[0].isIntersecting;scheduleFilm();},{threshold:.25}).observe(film);
document.addEventListener('visibilitychange',scheduleFilm);
reduced.addEventListener('change',()=>{if(reduced.matches)playing=false;scheduleFilm();});
drawFilm();
