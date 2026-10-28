import {createWebAccount} from './web-account.js?v=20261027-codes1';
const $=id=>document.getElementById(id),account=createWebAccount();
let busy=false,currentAccount=null;
function message(text='',error=false){$('account-message').textContent=text;$('account-message').classList.toggle('is-error',error);}
function controls(disabled){['google-signin','signout','refresh-account','generate-code','refresh-codes','copy-code'].forEach(id=>$(id).disabled=disabled);document.querySelectorAll('#code-list button').forEach(button=>button.disabled=disabled);$('redeem-submit').disabled=disabled||Boolean(currentAccount?.unlimited)||currentAccount?.allowed===false;$('access-code').disabled=$('redeem-submit').disabled;}
function showSignedOut(){currentAccount=null;$('signin-card').hidden=false;$('account-dashboard').hidden=true;$('generated-code').value='';$('generated-code-panel').hidden=true;}
function render(data){
 currentAccount=data;
 $('signin-card').hidden=true;$('account-dashboard').hidden=false;
 const unlimited=data.unlimited===true,name=data.user.name||'Your account';
 $('user-name').textContent=name;$('user-email').textContent=data.user.email;$('user-initial').textContent=(name==='Your account'?data.user.email:name).slice(0,1).toUpperCase();
 $('plan-badge').textContent=unlimited?(data.plan==='admin'?'Admin · Unlimited':'Unlimited access'):data.plan==='paid'?'Paid plan':'Free plan';
 $('remaining').textContent=unlimited?'∞':String(data.remaining);$('remaining-label').textContent=unlimited?'Unlimited assignments':'assignments remaining';
 $('allowance-detail').textContent=unlimited?'Your account has no monthly assignment cap.':`${data.limit} assignments included each month.`;
 $('usage-fill').style.width=unlimited?'100%':`${Math.min(100,Math.max(0,data.limit?data.remaining/data.limit*100:0))}%`;
 $('usage-text').textContent=unlimited?'Unlimited access is active.':`${data.remaining} of ${data.limit} available · Restarts are included`;
 $('used').textContent=String(data.used);
 const reset=new Date(data.resetAt),valid=Number.isFinite(reset.getTime());
 $('reset-date').textContent=valid?new Intl.DateTimeFormat(undefined,{month:'long',day:'numeric',timeZone:'UTC'}).format(reset):'Not available';
 $('reset-detail').textContent=unlimited?'Your unlimited access doesn’t expire with the monthly reset.':valid?`${new Intl.DateTimeFormat(undefined,{year:'numeric',timeZone:'UTC'}).format(reset)} · 00:00 UTC. A fresh allowance every calendar month.`:'Refresh to check your next reset.';
 $('unlimited-existing').hidden=!unlimited;$('owner-codes').hidden=data.plan!=='admin'||data.allowed===false;
 $('updated-at').textContent=`Updated ${new Intl.DateTimeFormat(undefined,{hour:'numeric',minute:'2-digit'}).format(new Date())} · Live account data`;
 message(data.allowed===false?'This account is currently disabled. Contact support for help.':'',data.allowed===false);
}
async function refresh(){if(busy)return;busy=true;controls(true);message('Refreshing your account…');try{const data=await account.status();if(data){render(data);if(data.plan==='admin'&&data.allowed!==false){try{await loadCodes();}catch(error){codeMessage('owner-code-message',error.message,true);}}}else{showSignedOut();message();}}catch(error){showSignedOut();message(error.message,true);}finally{busy=false;controls(false);}}
$('google-signin').addEventListener('click',async()=>{controls(true);message('Opening Google sign-in…');try{if(window.top!==window){window.open(new URL('dashboard.html',location.href).href,'_blank','noopener');message('Open the dashboard in its own tab to sign in.');controls(false);return;}await account.login();}catch(error){message(error.message,true);controls(false);}});
$('signout').addEventListener('click',async()=>{controls(true);await account.logout();showSignedOut();message('You’re signed out of this website.');controls(false);});
$('refresh-account').addEventListener('click',refresh);
function codeMessage(id,text,error=false){$(id).textContent=text;$(id).classList.toggle('is-error',error);}
const redemptionMessages={already_unlimited:'Your account already has unlimited access. This code wasn’t used.',account_disabled:'This account is disabled. Contact support for help.',try_later:'Too many attempts. Please wait 15 minutes before trying again.',invalid_code:'This code is invalid, revoked, or already used. Check it and try again.'};
$('redeem-form').addEventListener('submit',async event=>{
 event.preventDefault();if(busy)return;const code=$('access-code').value.trim();if(!code)return;
 busy=true;controls(true);codeMessage('redeem-message','Checking your code…');
 try{const result=await account.redeemCode(code);if(result.redeemed){$('access-code').value='';render(await account.status());codeMessage('redeem-message','Unlimited assignments unlocked. Reopen your extension panel to refresh your allowance.');}else codeMessage('redeem-message',redemptionMessages[result.reason]||'The code could not be redeemed. Please try again.',true);}
 catch(error){codeMessage('redeem-message',error.message,true);}finally{busy=false;controls(false);}
});
async function loadCodes(){
 const {codes}=await account.listCodes();const list=$('code-list');list.replaceChildren();
 if(!codes?.length){const item=document.createElement('li');item.textContent='No codes yet. Generate one when you’re ready.';list.append(item);return;}
 for(const code of codes){
  const item=document.createElement('li'),detail=document.createElement('div'),title=document.createElement('strong'),subtitle=document.createElement('span');
  title.textContent=`Code …${code.id.slice(-8)}`;subtitle.textContent=new Intl.DateTimeFormat(undefined,{month:'short',day:'numeric',hour:'numeric',minute:'2-digit'}).format(new Date(code.createdAt));detail.append(title,subtitle);item.append(detail);
  const state=document.createElement('span');state.className='code-state';state.textContent=code.redeemedAt?'Redeemed':code.revoked?'Revoked':'Available';item.append(state);
  if(!code.revoked&&!code.redeemedAt){const revoke=document.createElement('button');revoke.className='quiet-button';revoke.textContent='Revoke';revoke.setAttribute('aria-label',`Revoke code ending ${code.id.slice(-8)}`);revoke.addEventListener('click',async()=>{if(busy)return;busy=true;controls(true);revoke.disabled=true;try{const result=await account.revokeCode(code.id);if($('generated-code-panel').dataset.codeId===code.id){$('generated-code').value='';$('generated-code-panel').hidden=true;}codeMessage('owner-code-message',result.revoked?'Unused code revoked.':'This code has already been redeemed or revoked.');await loadCodes();}catch(error){codeMessage('owner-code-message',error.message,true);}finally{busy=false;controls(false);revoke.disabled=false;}});item.append(revoke);}
  list.append(item);
 }
}
$('generate-code').addEventListener('click',async()=>{
 if(busy)return;busy=true;controls(true);codeMessage('owner-code-message','Creating your code…');
 try{const result=await account.createCode();$('generated-code').value=result.code;$('generated-code-label').textContent=`New code …${result.id.slice(-8)}`;$('generated-code-panel').dataset.codeId=result.id;$('generated-code-panel').hidden=false;codeMessage('owner-code-message','Ready to share privately. The first account to redeem it gets unlimited assignments.');await loadCodes();}
 catch(error){codeMessage('owner-code-message',error.message,true);}finally{busy=false;controls(false);}
});
$('copy-code').addEventListener('click',async()=>{try{await navigator.clipboard.writeText($('generated-code').value);codeMessage('owner-code-message','Code copied. Share it privately with the intended person.');}catch{codeMessage('owner-code-message','Select the code and copy it manually.');}});
$('refresh-codes').addEventListener('click',async()=>{if(busy)return;busy=true;controls(true);try{await loadCodes();codeMessage('owner-code-message','Code list refreshed.');}catch(error){codeMessage('owner-code-message',error.message,true);}finally{busy=false;controls(false);}});
const params=new URLSearchParams(location.search);
if(params.has('code')||params.has('error')){history.replaceState({},'',location.pathname);try{await account.finishLogin(params);}catch(error){showSignedOut();message(error.message,true);controls(false);}}
if(!$('account-message').classList.contains('is-error'))await refresh();
