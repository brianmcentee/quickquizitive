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

const theater=document.querySelector('.flow-theater');
const chapters=[...document.querySelectorAll('[data-flow-step]')];
const pause=document.getElementById('flow-pause');
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const captions=[
 ['A permanent home for a small helper.','Download the ZIP, extract it, and move the folder to a permanent home before installing.','quickquizitive / download'],
 ['A few steps. One installation.','At chrome://extensions, enable Developer mode, choose Load unpacked, and select the extracted folder—not the ZIP.','chrome://extensions'],
 ['Your account, right in the panel.','Open QuickQuizitive from Chrome’s extensions menu on your assignment. Sign in with Google, check your allowance, or redeem an access code.','Your assignment / account'],
 ['Press Run. Keep control.','The runner uses supported question controls and advances automatically. Press Stop whenever you want to take over.','Your assignment / running'],
 ['Less panel. More room.','Minimize to Run and Stop. The runner keeps going while you click elsewhere. Drag the bar wherever it fits.','Your assignment / compact controls'],
 ['A clear finish. Built in.','The runner stops when the assignment displays 100%. The panel shows Completed · 100%, including in compact mode.','Your assignment / completed']
];
let flowStep=0,flowTimer=null,flowVisible=false,flowPaused=reduced.matches;
function setFlowStep(step){flowStep=step;theater.dataset.step=String(step);chapters.forEach((button,index)=>{button.classList.toggle('active',index===step);button.setAttribute('aria-pressed',String(index===step));});document.getElementById('scene-callout').textContent=captions[step][0];document.getElementById('scene-address').textContent=captions[step][2];document.getElementById('flow-explanation').textContent=captions[step][1];document.getElementById('flow-progress').textContent=['0%','0%','0%','42%','78%','100%'][step];document.getElementById('scene-toggle').textContent=step===4?'+':'−';document.querySelector('.product-account strong').textContent=step>=3?'2 of 3 assignments remaining':'3 of 3 assignments remaining';}
function scheduleFlow(){clearInterval(flowTimer);flowTimer=null;pause.textContent=flowPaused?'▶ Play':'Ⅱ Pause';pause.setAttribute('aria-label',flowPaused?'Play walkthrough':'Pause walkthrough');if(flowVisible&&!flowPaused&&!document.hidden)flowTimer=setInterval(()=>setFlowStep((flowStep+1)%captions.length),5200);}
chapters.forEach(button=>button.addEventListener('click',()=>{setFlowStep(Number(button.dataset.flowStep));flowPaused=true;scheduleFlow();}));
pause.addEventListener('click',()=>{flowPaused=!flowPaused;scheduleFlow();});
new IntersectionObserver(entries=>{flowVisible=entries[0].isIntersecting;scheduleFlow();},{threshold:.2}).observe(theater);
document.addEventListener('visibilitychange',scheduleFlow);
reduced.addEventListener('change',()=>{if(reduced.matches)flowPaused=true;scheduleFlow();});
scheduleFlow();

setFlowStep(0);
