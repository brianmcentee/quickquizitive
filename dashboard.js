import {createWebAccount} from './web-account.js';
const $=id=>document.getElementById(id),account=createWebAccount();
let busy=false;
function message(text='',error=false){$('account-message').textContent=text;$('account-message').classList.toggle('is-error',error);}
function controls(disabled){['google-signin','signout','refresh-account'].forEach(id=>$(id).disabled=disabled);}
function showSignedOut(){ $('signin-card').hidden=false;$('account-dashboard').hidden=true; }
function render(data){
 $('signin-card').hidden=true;$('account-dashboard').hidden=false;
 const unlimited=data.unlimited===true,name=data.user.name||'Your account';
 $('user-name').textContent=name;$('user-email').textContent=data.user.email;$('user-initial').textContent=(name==='Your account'?data.user.email:name).slice(0,1).toUpperCase();
 $('plan-badge').textContent=unlimited?'Admin · Unlimited':data.plan==='paid'?'Paid plan':'Free plan';
 $('remaining').textContent=unlimited?'∞':String(data.remaining);$('remaining-label').textContent=unlimited?'Unlimited assignments':'assignments remaining';
 $('allowance-detail').textContent=unlimited?'Your account has no monthly assignment cap.':`${data.limit} assignments included each month.`;
 $('usage-fill').style.width=unlimited?'100%':`${Math.min(100,Math.max(0,data.limit?data.remaining/data.limit*100:0))}%`;
 $('usage-text').textContent=unlimited?'Unlimited access is active.':`${data.remaining} of ${data.limit} available · Restarts are included`;
 $('used').textContent=String(data.used);
 const reset=new Date(data.resetAt),valid=Number.isFinite(reset.getTime());
 $('reset-date').textContent=valid?new Intl.DateTimeFormat(undefined,{month:'long',day:'numeric',timeZone:'UTC'}).format(reset):'Not available';
 $('reset-detail').textContent=unlimited?'Your unlimited access doesn’t expire with the monthly reset.':valid?`${new Intl.DateTimeFormat(undefined,{year:'numeric',timeZone:'UTC'}).format(reset)} · 00:00 UTC. A fresh allowance every calendar month.`:'Refresh to check your next reset.';
 $('updated-at').textContent=`Updated ${new Intl.DateTimeFormat(undefined,{hour:'numeric',minute:'2-digit'}).format(new Date())} · Live account data`;
 message(data.allowed===false?'This account is currently disabled. Contact support for help.':'',data.allowed===false);
}
async function refresh(){if(busy)return;busy=true;controls(true);message('Refreshing your account…');try{const data=await account.status();if(data)render(data);else{showSignedOut();message();}}catch(error){showSignedOut();message(error.message,true);}finally{busy=false;controls(false);}}
$('google-signin').addEventListener('click',async()=>{controls(true);message('Opening Google sign-in…');try{if(window.top!==window){window.open(new URL('dashboard.html',location.href).href,'_blank','noopener');message('Open the dashboard in its own tab to sign in.');controls(false);return;}await account.login();}catch(error){message(error.message,true);controls(false);}});
$('signout').addEventListener('click',async()=>{controls(true);await account.logout();showSignedOut();message('You’re signed out of this website.');controls(false);});
$('refresh-account').addEventListener('click',refresh);
const params=new URLSearchParams(location.search);
if(params.has('code')||params.has('error')){history.replaceState({},'',location.pathname);try{await account.finishLogin(params);}catch(error){showSignedOut();message(error.message,true);controls(false);}}
if(!$('account-message').classList.contains('is-error'))await refresh();
