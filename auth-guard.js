const authCfg=window.CLIENTFLOW_CONFIG||{};
if(!authCfg.SUPABASE_URL||!authCfg.SUPABASE_ANON_KEY){
  location.replace("login.html");
}else{
  const clientflowAuth=supabase.createClient(authCfg.SUPABASE_URL,authCfg.SUPABASE_ANON_KEY);
  (async()=>{
    const {data:{user},error}=await clientflowAuth.auth.getUser();
    if(error||!user){location.replace("login.html");return;}
    window.CLIENTFLOW_STAFF=user;
    document.addEventListener("DOMContentLoaded",()=>{
      const sidebar=document.querySelector(".sidebar");
      if(!sidebar) return;
      const box=document.createElement("div");
      box.className="staff-auth-box";
      box.innerHTML=`<span>Signed in as</span><strong>${user.email||"Staff"}</strong><button id="staffLogout">Sign out</button>`;
      const note=sidebar.querySelector(".sidebar-note");
      sidebar.insertBefore(box,note||null);
      document.getElementById("staffLogout").addEventListener("click",async()=>{
        await clientflowAuth.auth.signOut({scope:"local"});
        location.replace("login.html");
      });
    });
  })();
}