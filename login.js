const cfg=window.CLIENTFLOW_CONFIG||{};
const statusEl=document.getElementById("status");
if(!cfg.SUPABASE_URL||!cfg.SUPABASE_ANON_KEY){
  statusEl.textContent="ClientFlow cloud configuration is missing.";
  throw new Error("Missing Supabase configuration");
}
const authClient=supabase.createClient(cfg.SUPABASE_URL,cfg.SUPABASE_ANON_KEY);
(async()=>{
  const {data:{user}}=await authClient.auth.getUser();
  if(user) location.replace("index.html");
})();
document.getElementById("loginForm").addEventListener("submit",async e=>{
  e.preventDefault();
  const btn=document.getElementById("loginBtn");
  btn.disabled=true; btn.textContent="Signing in…"; statusEl.textContent="";
  const email=document.getElementById("email").value.trim();
  const password=document.getElementById("password").value;
  const {error}=await authClient.auth.signInWithPassword({email,password});
  if(error){
    statusEl.textContent="Sign-in failed. Check your email and password.";
    btn.disabled=false; btn.textContent="Sign in"; return;
  }
  location.replace("index.html");
});