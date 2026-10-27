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
