// Browser-only account client. Public project key; no service-role or Google secret.
export function createWebAccount({storage=sessionStorage,fetcher=fetch,cryptoImpl=crypto,now=()=>Date.now(),navigate=url=>location.assign(url),origin=location.origin,basePath=new URL('.',location.href).pathname}={}) {
  const base='https://xzwvnobptsymbxmloudb.supabase.co';
  const key='sb_publishable_vTklhm1FqqWAtqaOXYzqnA_56cXjwoQ';
  const sessionKey='qq-web-session',pkceKey='qq-web-pkce';
  let refreshTask;
  const read=key=>{try{return JSON.parse(storage.getItem(key));}catch{return null;}};
  const encode=bytes=>btoa(String.fromCharCode(...new Uint8Array(bytes))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
  async function request(path,body,token,method='POST') {
    const response=await fetcher(base+path,{method,headers:{apikey:key,'Content-Type':'application/json',...(token?{Authorization:`Bearer ${token}`}:{})},...(body===undefined?{}:{body:JSON.stringify(body)}),signal:AbortSignal.timeout(15000),referrerPolicy:'no-referrer'});
    const data=await response.json().catch(()=>({}));
    if(!response.ok){const error=new Error(response.status===401||response.status===400?'Your sign-in has expired. Please sign in again.':'We couldn’t reach your account. Please try again.');error.status=response.status;throw error;}
    return data;
  }
  function save(data){
    if(!data.access_token||!data.refresh_token||!data.user?.id)throw new Error('Sign-in didn’t return a valid account. Please try again.');
    const user={id:data.user.id,email:data.user.email||'',name:String(data.user.user_metadata?.full_name||data.user.user_metadata?.name||'').slice(0,120)};
    const session={access_token:data.access_token,refresh_token:data.refresh_token,expires_at:now()/1000+Number(data.expires_in||3600),user};
    storage.setItem(sessionKey,JSON.stringify(session));return session;
  }
  async function session(force=false){
    const saved=read(sessionKey);if(!saved)return null;
    if(!force&&saved.expires_at>now()/1000+90)return saved;
    if(!refreshTask)refreshTask=request('/auth/v1/token?grant_type=refresh_token',{refresh_token:saved.refresh_token}).then(save).catch(error=>{if([400,401].includes(error.status))storage.removeItem(sessionKey);throw error;}).finally(()=>{refreshTask=null;});
    return refreshTask;
  }
  async function login(){
    const verifier=encode(cryptoImpl.getRandomValues(new Uint8Array(48)));
    const challenge=encode(await cryptoImpl.subtle.digest('SHA-256',new TextEncoder().encode(verifier)));
    storage.setItem(pkceKey,JSON.stringify({verifier,created:now()}));
    // The existing Supabase Site URL is this exact root, already authorized.
    const url=new URL(base+'/auth/v1/authorize');
    url.search=new URLSearchParams({provider:'google',redirect_to:origin+basePath,code_challenge:challenge,code_challenge_method:'s256'});
    navigate(url.href);
  }
  async function finishLogin(params){
    if(params.get('error')){storage.removeItem(pkceKey);throw new Error('Google sign-in was cancelled or denied. You can try again.');}
    const code=params.get('code');if(!code)return;
    const pending=read(pkceKey);storage.removeItem(pkceKey);
    if(!pending?.verifier||now()-pending.created>600000||now()<pending.created)throw new Error('This sign-in link has expired. Please start again from this tab.');
    save(await request('/auth/v1/token?grant_type=pkce',{auth_code:code,code_verifier:pending.verifier}));
  }
  async function rpc(name,args={}) {
    let current=await session();if(!current)throw new Error('Please sign in before continuing.');
    try{return await request('/rest/v1/rpc/'+name,args,current.access_token);}
    catch(error){if(error.status!==401)throw error;current=await session(true);return request('/rest/v1/rpc/'+name,args,current.access_token);}
  }
  async function status(){
    const current=await session();if(!current)return null;
    return {user:current.user,...await rpc('qq_account')};
  }
  const redeemCode=code=>rpc('qq_redeem_code',{p_code:code});
  const createCode=()=>rpc('qq_code_admin',{p_action:'create'});
  const listCodes=()=>rpc('qq_code_admin',{p_action:'list'});
  const revokeCode=id=>rpc('qq_code_admin',{p_action:'revoke',p_id:id});
  async function logout(){const current=read(sessionKey);storage.removeItem(sessionKey);storage.removeItem(pkceKey);if(current)await request('/auth/v1/logout?scope=local',{},current.access_token).catch(()=>{});}
  return {login,finishLogin,status,logout,redeemCode,createCode,listCodes,revokeCode};
}
