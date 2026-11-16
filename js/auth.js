(function(){
  var $=function(s){return document.querySelector(s)};
  var SESSION="fes-session";

  /* Demo accounts only. Real sign-in must be checked by a server. */
  var ACCOUNTS=[
    {email:"admin@school.edu",password:"admin123",name:"Administrator",role:"Administrator"},
    {email:"it@school.edu",password:"it12345",name:"Engr. Paolo Dizon",role:"IT Expert"},
    {email:"head@school.edu",password:"head12345",name:"Dr. Elena Ramos",role:"Supervisor"},
    {email:"m.santos@school.edu",password:"faculty123",name:"Dr. Maria Santos",role:"Faculty"},
    {email:"l.garcia@school.edu",password:"student123",name:"Leo Garcia",role:"Student Evaluator"},
    {email:"m.clara@school.edu",password:"student123",name:"Maria Clara Reyes",role:"Student Evaluator"}
  ];
  /* accounts the administrator created on the Users page (with a password) */
  function stored(){try{var d=JSON.parse(localStorage.getItem("fes-admin-v2"));return(d&&d.users||[]).filter(function(u){return u.password&&u.status==="Active"}).map(function(u){return{email:String(u.email).toLowerCase(),password:u.password,name:u.name,role:u.role}})}catch(e){return[]}}
  function home(role){return role==="Student Evaluator"?"student.html":"index.html"}

  function current(){try{return sessionStorage.getItem(SESSION)||localStorage.getItem(SESSION)}catch(e){return null}}
  if(current()){var cs=null;try{cs=JSON.parse(current())}catch(e){}location.replace(home(cs&&cs.role));return}

  /* theme follows the dashboard's saved choice */
  var t=null;try{t=localStorage.getItem("fes-theme")}catch(e){}
  document.documentElement.classList.toggle("dark",t?t==="d":matchMedia("(prefers-color-scheme: dark)").matches);

  /* institution name from saved settings */
  try{var d=JSON.parse(localStorage.getItem("fes-admin-v2"));
    if(d&&d.settings&&d.settings.name){$("#inst").textContent=d.settings.name;document.title="Sign in – "+d.settings.name}
    var c=d&&d.settings&&d.settings.brandColor;
    if(/^#[0-9a-f]{6}$/i.test(c||"")){
      var rgb=[1,3,5].map(function(i){return parseInt(c.slice(i,i+2),16)}),
          lum=function(x){return(.2126*x[0]+.7152*x[1]+.0722*x[2])/255};
      if(document.documentElement.classList.contains("dark")&&lum(rgb)<.35)rgb=rgb.map(function(v){return Math.round(v+(255-v)*.45)});
      var hex="#"+rgb.map(function(v){return("0"+v.toString(16)).slice(-2)}).join(""),s=document.documentElement.style;
      s.setProperty("--pri",hex);s.setProperty("--ring",hex);s.setProperty("--prif",lum(rgb)>.6?"#171717":"#ffffff");
      if(d.settings.tint==="Tinted"){
        var dk=document.documentElement.classList.contains("dark"),b=dk?[10,10,10]:[250,250,250],k=dk?.12:.07;
        s.setProperty("--bg","#"+b.map(function(v,i){return("0"+Math.round(v+(rgb[i]-v)*k).toString(16)).slice(-2)}).join(""));
      }
    }}catch(e){}

  /* show / hide password */
  $("#toggle").addEventListener("click",function(){
    var p=$("#password"),show=p.type==="password";
    p.type=show?"text":"password";
    this.setAttribute("aria-pressed",show);
    this.setAttribute("aria-label",show?"Hide password":"Show password");
  });

  function fieldError(id,msg){
    $("#e_"+id).textContent=msg||"";
    $("#"+id).closest(".fld").classList.toggle("bad",!!msg);
  }

  $("#login").addEventListener("submit",function(e){
    e.preventDefault();
    var email=$("#email").value.trim().toLowerCase(),pw=$("#password").value,ok=true;
    $("#err").hidden=true;

    if(!email){fieldError("email","Enter your email");ok=false}
    else if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)){fieldError("email","Enter a valid email address");ok=false}
    else fieldError("email");

    if(!pw){fieldError("password","Enter your password");ok=false}
    else fieldError("password");
    if(!ok)return;

    var acct=stored().concat(ACCOUNTS).filter(function(a){return a.email===email&&a.password===pw})[0];
    if(!acct){
      $("#err").textContent="Incorrect email or password. Check your details and try again.";
      $("#err").hidden=false;
      $("#password").value="";$("#password").focus();
      return;
    }

    var data=JSON.stringify({email:acct.email,name:acct.name,role:acct.role});
    try{
      if($("#remember").checked)localStorage.setItem(SESSION,data);
      else sessionStorage.setItem(SESSION,data);
    }catch(err){
      $("#err").textContent="Your browser blocked storage, so sign-in can't be saved. Allow site data and try again.";
      $("#err").hidden=false;return;
    }
    try{var d2=JSON.parse(localStorage.getItem("fes-admin-v2"));
      if(d2){d2.audit=d2.audit||[];d2.audit.unshift({id:Date.now()+Math.random(),time:new Date().toISOString(),user:acct.name,action:"Signed in"});d2.audit=d2.audit.slice(0,300);localStorage.setItem("fes-admin-v2",JSON.stringify(d2))}}catch(e){}
    location.replace(home(acct.role));
  });
})();
