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
 ['One account. Everything in sync.','Use the same Google account in the extension and your dashboard. Your allowance stays in sync.'],
 ['A click to start. A click to stop.','Press Run on a supported assignment. The floating controls stay available when you click elsewhere.'],
 ['Keep the flow. Keep your space.','Supported questions move forward automatically. Minimize the panel to a compact Run and Stop bar.'],
 ['The finish line is built in.','The runner stops when the assignment displays 100%. You can also press Stop whenever you choose.']
];
let flowStep=0,flowTimer=null,flowVisible=false,flowPaused=reduced.matches;
function setFlowStep(step){flowStep=step;theater.dataset.step=String(step);chapters.forEach((button,index)=>{button.classList.toggle('active',index===step);button.setAttribute('aria-pressed',String(index===step));});document.getElementById('flow-stage-label').textContent=captions[step][0];document.getElementById('flow-explanation').textContent=captions[step][1];document.getElementById('flow-progress').textContent=['0%','0%','67%','100%'][step];}
function scheduleFlow(){clearInterval(flowTimer);flowTimer=null;pause.textContent=flowPaused?'▶ Play':'Ⅱ Pause';pause.setAttribute('aria-label',flowPaused?'Play walkthrough':'Pause walkthrough');if(flowVisible&&!flowPaused&&!document.hidden)flowTimer=setInterval(()=>setFlowStep((flowStep+1)%4),4500);}
chapters.forEach(button=>button.addEventListener('click',()=>{setFlowStep(Number(button.dataset.flowStep));flowPaused=true;scheduleFlow();}));
pause.addEventListener('click',()=>{flowPaused=!flowPaused;scheduleFlow();});
new IntersectionObserver(entries=>{flowVisible=entries[0].isIntersecting;scheduleFlow();},{threshold:.2}).observe(theater);
document.addEventListener('visibilitychange',scheduleFlow);
reduced.addEventListener('change',()=>{if(reduced.matches)flowPaused=true;scheduleFlow();});
scheduleFlow();
