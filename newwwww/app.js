const CF = window.CONFIG || {};
const READY = !!(
  window.supabase &&
  typeof CF.SUPABASE_URL === "string" &&
  typeof CF.SUPABASE_ANON_KEY === "string" &&
  CF.SUPABASE_URL.startsWith("https://") &&
  !CF.SUPABASE_URL.includes("YOUR_") &&
  CF.SUPABASE_ANON_KEY.length > 20 &&
  !CF.SUPABASE_ANON_KEY.includes("YOUR_")
);
const sb = READY
  ? window.supabase.createClient(CF.SUPABASE_URL, CF.SUPABASE_ANON_KEY)
  : null;
const M=window.MODEL,S=M.symptoms,G=window.GEO,view=document.getElementById("view");
const $=id=>document.getElementById(id),sel=new Set(),DOC={};let me=null;
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const bn=n=>Number(n).toLocaleString("bn-BD");
const ST={pending:"অপেক্ষমাণ",confirmed:"নিশ্চিত",cancelled:"বাতিল",done:"সম্পন্ন"};
const DAYS=["রবি","সোম","মঙ্গল","বুধ","বৃহস্পতি","শুক্র","শনি"],ROLE={patient:"রোগী",doctor:"ডাক্তার",admin:"অ্যাডমিন"};
const SPECS=[["মেডিসিন",["মেডিসিন","সাধারণ চিকিৎসক"]],["গ্যাস্ট্রোএন্টেরোলজি",["গ্যাস্ট্রো"]],["হেপাটোলজি",["হেপাটো"]],["এন্ডোক্রাইনোলজি",["এন্ডোক্রাইনো","ডায়াবেটোলজিস্ট"]],["বক্ষব্যাধি",["বক্ষব্যাধি"]],["ইউরোলজি",["ইউরোলজি"]],["নিউরোলজি",["নিউরোলজি"]],["চর্মরোগ",["চর্মরোগ"]]];
const specKeys=t=>SPECS.filter(([n,k])=>k.some(x=>t.includes(x))).map(x=>x[0]);
const opts=(a,cur,ph)=>(ph?`<option value="">${ph}</option>`:"")+a.map(x=>`<option ${x==cur?"selected":""}>${esc(x)}</option>`).join("");
const setup=()=>'<div class="alert">Supabase সেটআপ হয়নি। README.md দেখে config.js এ URL ও key বসাও।</div>';
function geoPair(dv,ds,v1,v2,ph){const a=$(dv),b=$(ds);
 a.innerHTML=opts(Object.keys(G),v1,ph?"সব বিভাগ":"");
 const f=()=>{b.innerHTML=opts(G[a.value]||[],a.value===v1?v2:"",ph?"সব জেলা":"")};a.onchange=()=>{v1=null;f()};f()}
async function loadMe(){me=null;if(!sb)return;const{data:{session}}=await sb.auth.getSession();if(!session)return;
 const{data}=await sb.from("profiles").select("*").eq("id",session.user.id).maybeSingle();me=data}
function nav(){const l=[["#/","হোম"],["#/doctors","ডাক্তার খুঁজুন"]];
 $("nav").innerHTML=l.map(([h,t])=>`<a href="${h}">${t}</a>`).join("")+(me?`<a href="#/dash">👤 ${esc(me.full_name)} (${ROLE[me.role]})</a><a href="#" data-act="logout">লগআউট</a>`:'<a href="#/login">লগইন</a><a href="#/signup">সাইন আপ</a>')}
function route(){const[p,q]=(location.hash.slice(1)||"/").split("?");
 ({"/":home,"/doctors":doctors,"/login":login,"/signup":signup,"/dash":dash}[p]||home)(new URLSearchParams(q||""));nav()}

/* ---------- হোম: উপসর্গ বিশ্লেষণ ---------- */
function home(){view.innerHTML=`<h2>উপসর্গ বাছাই করুন</h2><p class="sub">সম্ভাব্য রোগ জানুন, তারপর আপনার এলাকার বিশেষজ্ঞ ডাক্তার খুঁজে অ্যাপয়েন্টমেন্ট নিন।</p>
 <div class="card"><input id="q" type="search" placeholder="উপসর্গ খুঁজুন (বাংলা/ইংরেজি: jor, kashi, headache…)"><div id="chips" class="chips"></div>
 <div class="row"><button class="main" id="go">বিশ্লেষণ করুন</button><button class="ghost" id="clr">মুছুন</button><span id="cnt" class="m"></span></div></div><div id="out"></div>`;
 const chips=()=>{const t=$("q").value.trim().toLowerCase();$("chips").innerHTML="";
  Object.entries(S).filter(([k,v])=>!t||(v[0]+" "+v[1]+" "+k).toLowerCase().includes(t)).forEach(([k,v])=>{
   const b=document.createElement("button");b.className="chip"+(sel.has(k)?" on":"");b.textContent=v[0];
   b.onclick=()=>{sel.has(k)?sel.delete(k):sel.add(k);chips();$("cnt").textContent=sel.size?bn(sel.size)+"টি নির্বাচিত":""};$("chips").appendChild(b)})};
 $("q").oninput=chips;chips();
 $("clr").onclick=()=>{sel.clear();$("out").innerHTML="";$("cnt").textContent="";chips()};
 $("go").onclick=()=>{
  if(sel.size<2){$("out").innerHTML='<div class="card">অন্তত ২টি উপসর্গ বাছাই করুন।</div>';return}
  const ks=Object.keys(S),sc=Object.entries(M.diseases).map(([id,d])=>{let l=0;
   ks.forEach(k=>{const p=Math.min(d.s[k]??.03,.97);l+=sel.has(k)?Math.log(p):.3*Math.log(1-p)});return{d,l}});
  const mx=Math.max(...sc.map(x=>x.l)),ex=sc.map(x=>Math.exp(x.l-mx)),sm=ex.reduce((a,b)=>a+b);
  const r=sc.map((x,i)=>({...x,p:ex[i]/sm*100})).sort((a,b)=>b.p-a.p).slice(0,3);
  let h='<div class="card">'+(M.red_flags.some(k=>sel.has(k))?'<div class="alert">⚠️ জরুরি লক্ষণ আছে। দেরি না করে হাসপাতালে যান বা ৯৯৯ এ কল করুন।</div>':'')+'<b>সম্ভাব্য ফলাফল</b>';
  r.forEach(x=>{h+=`<div class="res"><div class="top"><span>${x.d.bn}</span><span>${bn(Math.round(x.p))}%</span></div><div class="bar"><i style="width:${x.p}%"></i></div>
   <div class="m">👨‍⚕️ ${x.d.spec}</div>${specKeys(x.d.spec).map(s=>`<a class="btn sm" href="#/doctors?spec=${encodeURIComponent(s)}">${s} ডাক্তার খুঁজুন</a>`).join("")}</div>`});
  if(r[0].p<40)h+='<p class="note">নির্ভরযোগ্যতা কম, আরও উপসর্গ যোগ করুন বা সরাসরি ডাক্তার দেখান।</p>';
  $("out").innerHTML=h+"</div>"}}

/* ---------- ডাক্তার খুঁজুন ---------- */
async function doctors(qs){
 const dv=qs.get("div")||"",ds=qs.get("dist")||"",sp=qs.get("spec")||"";
 view.innerHTML=`<h2>ডাক্তার খুঁজুন</h2><div class="card"><div class="grid"><div><label>বিভাগ</label><select id="fd"></select></div>
 <div><label>জেলা</label><select id="fs"></select></div><div><label>বিশেষজ্ঞ</label><select id="fp">${opts(SPECS.map(x=>x[0]),sp,"সব বিশেষজ্ঞ")}</select></div></div>
 <button class="main" id="fb">খুঁজুন</button></div><div id="dl"></div>`;
 geoPair("fd","fs",dv,ds,1);
 $("fb").onclick=()=>{location.hash=`#/doctors?div=${encodeURIComponent($("fd").value)}&dist=${encodeURIComponent($("fs").value)}&spec=${encodeURIComponent($("fp").value)}`};
 if(!sb){$("dl").innerHTML=setup();return}
 $("dl").textContent="লোড হচ্ছে…";
 let q=sb.from("doctors").select("*").eq("approved",true);
 if(dv)q=q.eq("division",dv);if(ds)q=q.eq("district",ds);if(sp)q=q.eq("specialty",sp);
 const{data,error}=await q.order("fee");
 if(error){$("dl").innerHTML='<div class="alert">'+esc(error.message)+"</div>";return}
 if(!data.length){$("dl").innerHTML='<div class="card">এই এলাকায় এখনো কোনো ডাক্তার নেই। জেলা বদলে বা শুধু বিভাগ দিয়ে খুঁজে দেখুন।</div>';return}
 $("dl").innerHTML=`<p class="m">${bn(data.length)} জন ডাক্তার পাওয়া গেছে</p>`+data.map(d=>{DOC[d.id]=d;
  return`<div class="card dc"><div><b>ডা. ${esc(d.name)}</b><div class="m">${esc(d.specialty)} · BMDC ${esc(d.bmdc||"—")}</div>
  <div class="m">📍 ${esc(d.chamber||"চেম্বার")}, ${esc(d.district)}, ${esc(d.division)}</div>
  <div class="m">💰 ফি ৳${bn(d.fee)} · 🗓 ${[...d.days].sort().map(i=>DAYS[i]).join(", ")}</div></div>
  <button class="main" data-act="book" data-id="${d.id}">অ্যাপয়েন্টমেন্ট নিন</button></div>`}).join("")}

/* ---------- বুকিং ---------- */
function book(d){
 if(!me){alert("আগে রোগী হিসেবে লগইন করো");location.hash="#/login";return}
 if(me.role!=="patient"){alert("শুধু রোগী account দিয়ে বুকিং করা যায়");return}
 const m=document.createElement("div");m.className="modal";
 const today=new Date().toISOString().slice(0,10),max=new Date(Date.now()+30*864e5).toISOString().slice(0,10);
 m.innerHTML=`<div class="card"><h3>ডা. ${esc(d.name)}</h3><label>তারিখ</label><input type="date" id="bd" min="${today}" max="${max}">
 <div id="bs" class="chips"></div><label>মোবাইল নম্বর</label><input id="bp" value="${esc(me.phone||"")}"><label>সমস্যার সংক্ষেপ (ঐচ্ছিক)</label><input id="bt">
 <div id="bm" class="m"></div><div class="row"><button class="main" id="bok">নিশ্চিত করুন</button><button class="ghost" id="bx">বন্ধ</button></div></div>`;
 document.body.appendChild(m);let slot=null,taken=new Set();
 const draw=()=>{const v=$("bd").value,now=new Date().toTimeString().slice(0,5);$("bs").innerHTML="";
  [...d.slots].sort().forEach(t=>{const b=document.createElement("button");b.className="chip"+(slot===t?" on":"");b.textContent=t;
   b.disabled=taken.has(t)||(v===today&&t<=now);b.onclick=()=>{slot=t;draw()};$("bs").appendChild(b)})};
 $("bx").onclick=()=>m.remove();
 $("bd").onchange=async()=>{slot=null;const v=$("bd").value;$("bs").innerHTML="";
  if(!d.days.includes(new Date(v+"T00:00:00").getDay())){$("bm").textContent="এই দিন ডাক্তার বসেন না। বসেন: "+[...d.days].sort().map(i=>DAYS[i]).join(", ");return}
  $("bm").textContent="";const{data}=await sb.rpc("taken_slots",{doc:d.id,d:v});taken=new Set((data||[]).map(x=>x.t));draw()};
 $("bok").onclick=async()=>{const v=$("bd").value;if(!v||!slot){$("bm").textContent="তারিখ ও সময় বাছাই করো";return}
  const{error}=await sb.from("appointments").insert({doctor_id:d.id,patient_id:me.id,patient_name:me.full_name,patient_phone:$("bp").value,appt_date:v,appt_time:slot,note:$("bt").value});
  if(error){$("bm").textContent=error.code==="23505"?"এই সময়টি এইমাত্র বুক হয়ে গেছে, অন্য সময় বাছাই করো":error.message;return}
  m.remove();alert("অনুরোধ পাঠানো হয়েছে। ডাক্তার নিশ্চিত করলে স্ট্যাটাস বদলে যাবে।");location.hash="#/dash"}}

/* ---------- লগইন / সাইন আপ ---------- */
function login(){
 view.innerHTML=`<h2>লগইন</h2><div class="card">${READY?"":setup()}<div class="tabs">${["patient","doctor","admin"].map((r,i)=>`<label><input type="radio" name="r" value="${r}" ${i?"":"checked"}>${ROLE[r]}</label>`).join("")}</div>
 <label>ইমেইল</label><input id="le" type="email"><label>পাসওয়ার্ড</label><input id="lp" type="password"><div id="lm" class="m"></div>
 <button class="main" id="lb">লগইন</button> <a href="#/signup" class="m">নতুন account?</a></div>`;
 $("lb").onclick=async()=>{if(!sb)return;const role=document.querySelector("input[name=r]:checked").value;
  const{error}=await sb.auth.signInWithPassword({email:$("le").value.trim(),password:$("lp").value});
  if(error){$("lm").textContent=error.message;return}
  await loadMe();
  if(!me||me.role!==role){await sb.auth.signOut();me=null;$("lm").textContent=`এই account টি ${ROLE[role]} account নয়। সঠিক ট্যাব বাছাই করো।`;return}
  location.hash="#/dash";route()}}
function signup(){
 view.innerHTML=`<h2>সাইন আপ</h2><div class="card">${READY?"":setup()}<div class="tabs"><label><input type="radio" name="r" value="patient" checked>রোগী</label><label><input type="radio" name="r" value="doctor">ডাক্তার</label></div>
 <div class="grid"><div><label>পুরো নাম</label><input id="sn"></div><div><label>মোবাইল</label><input id="sp"></div>
 <div><label>ইমেইল</label><input id="se" type="email"></div><div><label>পাসওয়ার্ড (৬+ অক্ষর)</label><input id="sw" type="password"></div></div>
 <div id="dx" hidden><div class="grid"><div><label>বিশেষজ্ঞতা</label><select id="ss">${opts(SPECS.map(x=>x[0]))}</select></div><div><label>BMDC রেজিঃ নং</label><input id="sb"></div>
 <div><label>বিভাগ</label><select id="sv"></select></div><div><label>জেলা</label><select id="sd"></select></div>
 <div><label>চেম্বারের ঠিকানা</label><input id="sc"></div><div><label>ফি (৳)</label><input id="sf" type="number" value="500"></div></div>
 <p class="note">ডাক্তার account অ্যাডমিন অনুমোদন দেওয়ার পর তালিকায় আসবে।</p></div>
 <div id="sm" class="m"></div><button class="main" id="sbt">সাইন আপ</button></div>`;
 geoPair("sv","sd","Dhaka","Dhaka");
 document.querySelectorAll("input[name=r]").forEach(i=>i.onchange=()=>{$("dx").hidden=document.querySelector("input[name=r]:checked").value!=="doctor"});
 $("sbt").onclick=async()=>{if(!sb)return;const role=document.querySelector("input[name=r]:checked").value;
  if(!$("sn").value.trim()||$("sw").value.length<6){$("sm").textContent="নাম দাও ও ৬+ অক্ষরের পাসওয়ার্ড দাও";return}
  const data={full_name:$("sn").value.trim(),phone:$("sp").value,role};
  if(role==="doctor")Object.assign(data,{specialty:$("ss").value,bmdc:$("sb").value,division:$("sv").value,district:$("sd").value,chamber:$("sc").value,fee:$("sf").value});
  const{data:r,error}=await sb.auth.signUp({email:$("se").value.trim(),password:$("sw").value,options:{data}});
  if(error){$("sm").textContent=error.message;return}
  if(r.session){await loadMe();location.hash="#/dash";route()}else $("sm").textContent="ইমেইলে পাঠানো লিংকে ক্লিক করে account চালু করো, তারপর লগইন করো।"}}

/* ---------- ড্যাশবোর্ড (role অনুযায়ী) ---------- */
const apRow=(a,who,btns)=>`<div class="ap"><b>${a.appt_date} · ${a.appt_time}</b> <span class="badge b-${a.status}">${ST[a.status]}</span><div class="m">${who}</div>${a.note?`<div class="m">📝 ${esc(a.note)}</div>`:""}${btns}</div>`;
const sbtn=(id,v,t)=>`<button class="s" data-act="status" data-id="${id}" data-v="${v}">${t}</button>`;
async function dash(){
 if(!sb){view.innerHTML=setup();return}
 await loadMe();nav();if(!me){location.hash="#/login";return}
 if(me.role==="patient"){
  const{data}=await sb.from("appointments").select("*,doctors(name,specialty,chamber,district)").eq("patient_id",me.id).order("appt_date",{ascending:false});
  view.innerHTML=`<h2>আমার অ্যাপয়েন্টমেন্ট</h2><div class="card">`+((data||[]).map(a=>apRow(a,`ডা. ${esc(a.doctors?.name)} · ${esc(a.doctors?.specialty)} · ${esc(a.doctors?.chamber||"")}, ${esc(a.doctors?.district)}`,
   ["pending","confirmed"].includes(a.status)?sbtn(a.id,"cancelled","বাতিল করুন"):"")).join("")||'কোনো অ্যাপয়েন্টমেন্ট নেই। <a href="#/doctors">ডাক্তার খুঁজুন</a>')+"</div>";
 }else if(me.role==="doctor"){
  const{data:d}=await sb.from("doctors").select("*").eq("id",me.id).single();
  const{data:ap}=await sb.from("appointments").select("*").eq("doctor_id",me.id).order("appt_date",{ascending:false});
  view.innerHTML=`<h2>ডাক্তার ড্যাশবোর্ড</h2>${d.approved?"":'<div class="alert">আপনার account এখনো অনুমোদিত হয়নি। অনুমোদনের পর রোগীরা আপনাকে খুঁজে পাবে।</div>'}
  <div class="card"><b>প্রোফাইল ও সময়সূচি</b><div class="grid"><div><label>চেম্বার</label><input id="pc" value="${esc(d.chamber)}"></div><div><label>ফি (৳)</label><input id="pf" type="number" value="${d.fee}"></div></div>
  <label>বসার দিন</label><div class="row">${DAYS.map((n,i)=>`<label><input type="checkbox" class="pd" value="${i}" ${d.days.includes(i)?"checked":""} style="width:auto;margin:0 4px">${n}</label>`).join("")}</div>
  <label>সময় (কমা দিয়ে, যেমন 17:00,17:30)</label><input id="ps" value="${esc(d.slots.join(","))}"><button class="main" id="pb">সংরক্ষণ</button> <span id="pm" class="m"></span></div>
  <div class="card"><b>রোগীর অ্যাপয়েন্টমেন্ট</b>`+((ap||[]).map(a=>apRow(a,`রোগী: ${esc(a.patient_name)} · 📞 ${esc(a.patient_phone||"—")}`,
   (a.status==="pending"?sbtn(a.id,"confirmed","নিশ্চিত")+sbtn(a.id,"cancelled","বাতিল"):"")+(a.status==="confirmed"?sbtn(a.id,"done","সম্পন্ন")+sbtn(a.id,"cancelled","বাতিল"):""))).join("")||"এখনো কেউ বুক করেনি।")+"</div>";
  $("pb").onclick=async()=>{const days=[...document.querySelectorAll(".pd:checked")].map(x=>+x.value),slots=$("ps").value.split(",").map(x=>x.trim()).filter(x=>/^\d\d:\d\d$/.test(x));
   const{error}=await sb.from("doctors").update({chamber:$("pc").value,fee:+$("pf").value,days,slots}).eq("id",me.id);$("pm").textContent=error?error.message:"সংরক্ষিত ✓"};
 }else{
  const cnt=async(t,f)=>{let q=sb.from(t).select("*",{count:"exact",head:true});if(f)q=f(q);return(await q).count||0};
  const[nd,np,npat,na]=await Promise.all([cnt("doctors",q=>q.eq("approved",true)),cnt("doctors",q=>q.eq("approved",false)),cnt("profiles",q=>q.eq("role","patient")),cnt("appointments")]);
  const{data:ds}=await sb.from("doctors").select("*").order("approved");
  const{data:ap}=await sb.from("appointments").select("*,doctors(name)").order("created_at",{ascending:false}).limit(20);
  view.innerHTML=`<h2>অ্যাডমিন প্যানেল</h2><div class="stats"><div class="card"><b>${bn(nd)}</b><div class="m">অনুমোদিত ডাক্তার</div></div><div class="card"><b>${bn(np)}</b><div class="m">অপেক্ষমাণ</div></div>
  <div class="card"><b>${bn(npat)}</b><div class="m">রোগী</div></div><div class="card"><b>${bn(na)}</b><div class="m">অ্যাপয়েন্টমেন্ট</div></div></div>
  <div class="card"><b>ডাক্তার ব্যবস্থাপনা</b>`+(ds||[]).map(d=>`<div class="ap"><b>ডা. ${esc(d.name)}</b> <span class="badge ${d.approved?"b-confirmed":""}">${d.approved?"অনুমোদিত":"অপেক্ষমাণ"}</span>
   <div class="m">${esc(d.specialty)} · BMDC ${esc(d.bmdc||"—")} · ${esc(d.district)}, ${esc(d.division)}</div>
   ${d.approved?`<button class="s" data-act="approve" data-id="${d.id}" data-v="0">স্থগিত</button>`:`<button class="s" data-act="approve" data-id="${d.id}" data-v="1">অনুমোদন দিন</button>`}
   <button class="s" data-act="deldoc" data-id="${d.id}">মুছুন</button></div>`).join("")+`</div><div class="card"><b>সাম্প্রতিক অ্যাপয়েন্টমেন্ট</b>`+
  (ap||[]).map(a=>apRow(a,`ডা. ${esc(a.doctors?.name)} ← ${esc(a.patient_name)}`,"")).join("")+"</div>"}}

document.addEventListener("click",async e=>{const b=e.target.closest("[data-act]");if(!b)return;const a=b.dataset.act,id=b.dataset.id;
 if(a==="logout"){e.preventDefault();await sb.auth.signOut();me=null;location.hash="#/";route()}
 else if(a==="book")book(DOC[id]);
 else if(a==="status"){await sb.from("appointments").update({status:b.dataset.v}).eq("id",id);dash()}
 else if(a==="approve"){await sb.from("doctors").update({approved:b.dataset.v==="1"}).eq("id",id);dash()}
 else if(a==="deldoc"&&confirm("ডাক্তারকে মুছে ফেলবে?")){await sb.from("doctors").delete().eq("id",id);dash()}});
window.addEventListener("hashchange",route);
loadMe().then(route);
