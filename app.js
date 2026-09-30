'use strict';
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const LS=(k,d)=>{try{return JSON.parse(localStorage.getItem(k))??d}catch{return d}},put=(k,v)=>localStorage.setItem(k,JSON.stringify(v));
const idb=new Promise(r=>{const q=indexedDB.open('study',1);q.onupgradeneeded=()=>q.result.createObjectStore('s');q.onsuccess=()=>r(q.result)});
const db=async(k,v)=>{const s=(await idb).transaction('s',v===undefined?'readonly':'readwrite').objectStore('s');return new Promise(r=>{const q=v===undefined?s.get(k):s.put(v,k);q.onsuccess=()=>r(q.result)})};
const uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,6),pad=n=>String(n).padStart(2,'0'),app=$('#app');
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const fmt=t=>new Date(t).toLocaleString([],{weekday:'short',day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'});
const local=t=>new Date(t-new Date(t).getTimezoneOffset()*6e4).toISOString().slice(0,16);
const rem=d=>{const m=d/6e4%60|0,h=d/36e5%24|0,y=d/864e5|0;return(y?y+'d ':'')+(h?h+'h ':'')+m+'m'};
let offs=[],refresh=()=>{},ringing=0,asShown=0,wl,dp;
const page=(t,b,to='home',c='')=>{app.innerHTML=`<div class="page ${c}"><header><a class=back href="#${to}">←</a><h2>${t}</h2></header>${b}</div>`};
function toast(t){const e=$('#toast');e.textContent=t;e.className='show';clearTimeout(toast.t);toast.t=setTimeout(()=>e.className='',2400)}
function dlg(html,ok,okText='OK'){const d=$('#dlg');d.innerHTML=`<div class=box>${html}<div class=row><button class=ghost id=dx>Cancel</button>${ok?`<button id=dok>${okText}</button>`:''}</div></div>`;d.hidden=false;const c=()=>d.hidden=true;$('#dx').onclick=c;if(ok)$('#dok').onclick=()=>{if(ok()!==false)c()};return c}
function pick(t,o){const c=dlg(`<h3>${t}</h3>`+o.map((x,i)=>`<button class=opt data-i=${i}>${x[0]}</button>`).join(''));$$('.opt',$('#dlg')).forEach(b=>b.onclick=()=>{c();o[b.dataset.i][1]()})}
const over=h=>{$('#ring').innerHTML=`<div>${h}</div>`;$('#ring').hidden=false},overOff=()=>$('#ring').hidden=true;
/* ---------- notifications ---------- */
const sw=navigator.serviceWorker;let reg;
sw?.register('sw.js').then(r=>reg=r).catch(()=>{});sw?.addEventListener('message',e=>{if(e.data=='awake')awake()});
const ask=()=>{try{'Notification'in window&&Notification.permission=='default'&&Notification.requestPermission()}catch{}};
async function notify(t,b,o={}){if(!('Notification'in window)||Notification.permission!='granted')return;const op={body:b,icon:'img/app_logo1.png',badge:'icons/icon-192.png',vibrate:[200,100,200],...o};try{const r=reg||await sw.ready;r.showNotification(t,op)}catch{new Notification(t,op)}}
async function schedule(tag,t,b,when){try{const r=reg||await sw.ready;await r.showNotification(t,{body:b,tag,icon:'img/app_logo1.png',showTrigger:new TimestampTrigger(when)})}catch{}}
async function unschedule(tag){try{(await(reg||await sw.ready).getNotifications({tag,includeTriggered:true})).forEach(n=>n.close())}catch{}}
/* ---------- sound ---------- */
const AC=window.AudioContext||window.webkitAudioContext,TONES={Beep:[[880,.2]],Siren:[[700,.25],[1000,.25]],Chime:[[660,.15],[880,.15],[1320,.3]]};
let ac,lp,au;const tones=Object.keys(TONES).map(k=>`<option>${k}`).join('');
const beep=(f,d)=>{ac=ac||new AC();ac.resume();const o=ac.createOscillator(),g=ac.createGain();o.type='square';o.frequency.value=f;g.gain.value=.35;o.connect(g);g.connect(ac.destination);o.start();o.stop(ac.currentTime+d)};
function sound(tone,url){hush();if(url){au=new Audio(url);au.loop=true;au.play().catch(()=>{});return}let i=0;const q=TONES[tone]||TONES.Beep,s=()=>beep(...q[i++%q.length]);s();lp=setInterval(s,400)}
function hush(){clearInterval(lp);au&&au.pause();au=null;navigator.vibrate?.(0)}
const snd=async k=>{const b=await db(k);return b?URL.createObjectURL(b):null};
const wake=async()=>{try{wl=await navigator.wakeLock.request('screen')}catch{}};
/* ---------- home ---------- */
const C=[['todo','img_todo_list','Todo'],['timer','img_timer','Timer'],['clock','img_clock_bear','Clock'],['boards','img_books','White Board'],['alarm','img_alarm','Alarm'],['notes','img_notes','Notes']];
function home(){
 app.innerHTML=`<div class="page wide"><header><button id=mn>☰</button><h1>Study App</h1><span style="width:44px"></span></header><div class=grid>${C.map(([r,i,t])=>`<a class=card href="#${r}"><img src="img/${i}.webp" alt="${t}"><span class=btn>${t}</span></a>`).join('')}<a class="card wide2" href="#anti"><img src="img/antisleep.webp" alt=""><div><b>Anti Sleep System</b><span class=btn>Anti Sleep</span></div></a></div><p class=q>“Small daily improvements over time lead to stunning results.”</p></div>
 <div id=dr hidden><div class=sc></div><aside><img src="img/app_logo1.png" alt=""><h3>★ About STUDY APP ★</h3><h2>ABOUT</h2><hr><p>THIS APP IS FOR STUDY PURPOSE<br>IT CONTAINS LOT OF FUNCTIONALITY ACCORDING TO YOU: A TIMER, A CLOCK, A WHITE BOARD, A TO DO LIST, ALARMS, NOTES AND ANTI SLEEP</p><b>USE THIS APP FOR STUDY<br>PURPOSE ONLY</b><br><br><button id=ins ${dp?'':'hidden'}>Install App</button><small>Made By - Saksham:<br>@Dev_Book1<br>★ 71117 ★</small></aside></div>`;
 $('#mn').onclick=()=>$('#dr').hidden=false;$('#dr .sc').onclick=()=>$('#dr').hidden=true;$('#ins').onclick=()=>dp?.prompt();
}
addEventListener('beforeinstallprompt',e=>{e.preventDefault();dp=e;const b=$('#ins');if(b)b.hidden=false});
/* ---------- todo ---------- */
const tasks=()=>LS('tasks',[]),saveT=t=>put('tasks',t.sort((a,b)=>a.time-b.time));
function todo(){
 page('Todo Manager','<ul id=tl></ul><button class=fab id=add>＋</button>');
 const R=todo.R=()=>{const t=tasks();$('#tl').innerHTML=t.length?t.map(x=>`<li class="${x.time<Date.now()?'late':''}"><input type=checkbox data-i=${x.id}><div><b>${esc(x.title)}</b><small>${fmt(x.time)}</small></div><button class=x data-i=${x.id}>✕</button></li>`).join(''):'<p class=empty>No tasks yet. Tap ＋ to add one.</p>'};R();
 $('#tl').onclick=e=>{const i=e.target.dataset.i;if(!i)return;saveT(tasks().filter(x=>x.id!=i));unschedule('t'+i);R()};
 $('#add').onclick=()=>{ask();dlg(`<h3>New task</h3><input id=tt placeholder="Enter your task"><label>Remind me at</label><input id=td type=datetime-local value="${local(Date.now()+6e5)}">`,()=>{const title=$('#tt').value.trim();if(!title)return false;const x={id:uid(),title,time:new Date($('#td').value).getTime()||Date.now()+6e5};saveT([...tasks(),x]);schedule('t'+x.id,'★ '+title+' ★','· Complete Task ·',x.time);R()},'Add')};
}
/* ---------- timer & clock ---------- */
const T={left:15e5,run:0,end:0,started:0};
function timer(){
 page('STUDY TIMER','<div class=center><div id=td class=big font-family=bold></div><div id=adj class=row><button class=ghost id=mi>− 1 Min</button><button id=pl>+ 1 Min</button></div><button class=wide id=go>Start</button></div><button class=pausebtn id=ps hidden>Pause</button>');
 const show=refresh=()=>{const s=Math.ceil((T.run?Math.max(0,T.end-Date.now()):T.left)/1000);$('#td').textContent=pad(s/60|0)+':'+pad(s%60);$('.page').classList.toggle('started',!!T.started);$('#ps').hidden=!T.started;$('#ps').textContent=T.run?'Pause':'Resume'};show();
 $('#pl').onclick=()=>{T.left+=6e4;show()};$('#mi').onclick=()=>{T.left=Math.max(0,T.left-6e4);show()};
 $('#go').onclick=()=>{if(!T.left)return;ask();T.started=T.run=1;T.end=Date.now()+T.left;show()};
 $('#ps').onclick=()=>{if(T.run){T.left=T.end-Date.now();T.run=0}else{T.run=1;T.end=Date.now()+T.left}show()};
}
function clock(){page('Clock','<div class=center><div id=ck class="big clk"></div></div>');const u=refresh=()=>{const d=new Date();$('#ck').textContent=pad(d.getHours()%12||12)+':'+pad(d.getMinutes())+':'+pad(d.getSeconds())};u()}
/* ---------- alarm ---------- */
const alarms=()=>LS('alarms',[]),saveA=a=>put('alarms',a);
function alarm(){
 page('Alarm',`<label>Date & time</label><input type=datetime-local id=at value="${local(Date.now()+36e5)}"><label>Dismiss challenge</label><select id=am><option>NORMAL<option>TAP_20<option>SHAKE_20</select><label>Sound</label><select id=as>${tones}</select><input type=file id=af accept="audio/*"><button class=wide id=sv>Set Alarm</button><ul id=al></ul>`);
 const R=()=>{$('#al').innerHTML=alarms().map(x=>`<li><div><b>${fmt(x.time)}</b><small>Challenge: ${x.mode}</small><small ${x.on&&x.time>Date.now()?`class=or data-rt=${x.time}`:''}>${!x.on?'Alarm Disabled':x.time>Date.now()?'Rings in: '+rem(x.time-Date.now()):'Alarm Expired'}</small></div><input type=checkbox data-i=${x.id} ${x.on?'checked':''}><button class=x data-d=${x.id}>✕</button></li>`).join('')||'<p class=empty>No alarms</p>'};R();
 refresh=()=>$$('[data-rt]').forEach(e=>{const d=e.dataset.rt-Date.now();e.textContent=d>0?'Rings in: '+rem(d):'Alarm Expired'});
 $('#al').onclick=e=>{const t=e.target,a=alarms();if(t.dataset.d){unschedule('a'+t.dataset.d);saveA(a.filter(x=>x.id!=t.dataset.d));toast('Alarm Deleted');R()}else if(t.dataset.i){const x=a.find(y=>y.id==t.dataset.i);if(t.checked&&x.time<=Date.now()){t.checked=false;return toast('That time has passed')}x.on=t.checked;x.fired=0;saveA(a);t.checked?schedule('a'+x.id,'⏰ ALARM','Open Study App to dismiss',x.time):unschedule('a'+x.id);R()}};
 $('#sv').onclick=async()=>{const time=new Date($('#at').value).getTime();if(!(time>Date.now()))return toast('Please select a future time!');const f=$('#af').files[0],x={id:uid(),time,mode:$('#am').value,tone:$('#as').value,snd:!!f,on:1};if(f)await db('snd_'+x.id,f);ask();if(x.mode=='SHAKE_20')DeviceMotionEvent?.requestPermission?.();saveA([...alarms(),x]);schedule('a'+x.id,'⏰ ALARM','Open Study App to dismiss',time);toast('Alarm Set Successfully!');R()};
}
async function ring(a){
 ringing=a;sound(a.tone,a.snd&&await snd('snd_'+a.id));notify('⏰ ALARM RINGING','Tap to open dismiss screen',{tag:'a'+a.id,requireInteraction:true,renotify:true});wake();navigator.vibrate?.([500,300,500,300,500]);
 const m=a.mode,N=20;let c=0;
 over(`<img src="img/img_alarm.webp" alt=""><h1>${m=='NORMAL'?'Alarm Ringing!':m=='TAP_20'?'Tap the button 20 times to stop!':'Shake your phone 20 times to stop!'}</h1><h2 id=pr>${m=='NORMAL'?'':'0 / 20'}</h2>${m=='SHAKE_20'?'':`<button class=wide id=ob>${m=='NORMAL'?'STOP ALARM':'TAP TO DISMISS'}</button>`}`);
 const done=()=>{hush();ringing=0;overOff();removeEventListener('devicemotion',mv);unschedule('a'+a.id)},inc=()=>{$('#pr').textContent=++c+' / '+N;if(c>=N)done()};
 const mv=e=>{const g=e.accelerationIncludingGravity;if(g&&Math.hypot(g.x,g.y,g.z)-9.81>11&&Date.now()-mv.t>150){mv.t=Date.now();inc()}};mv.t=0;
 if(m=='SHAKE_20')addEventListener('devicemotion',mv);
 const b=$('#ob');if(b)b.onclick=m=='NORMAL'?done:inc;
}
/* ---------- anti sleep ---------- */
const AS=()=>LS('as',{on:0});
function anti(){
 const a=AS();
 page('Anti Sleep',`<div class=center style="min-height:60vh"><img src="img/antisleep.webp" width=150 alt=""><h2 id=st></h2><div class=g2><div><label>Check every</label><div class=row2><input type=number id=im min=0 max=59 value=2>m<input type=number id=is min=0 max=59 value=0>s</div></div><div><label>Grace time</label><div class=row2><input type=number id=gm min=0 max=59 value=0>m<input type=number id=gs min=0 max=59 value=19>s</div></div></div><label>Alert sound</label><select id=ts>${tones}</select><input type=file id=tf accept="audio/*"><button class=wide id=go></button></div>`);
 if(a.on){$('#im').value=a.iv/60|0;$('#is').value=a.iv%60;$('#gm').value=a.gr/60|0;$('#gs').value=a.gr%60;$('#ts').value=a.tone}
 const ui=()=>{const o=AS().on;$('#st').textContent='Status: '+(o?'ON':'OFF');$('#st').style.color=o?'#4CAF50':'#FF5252';$('#go').textContent=o?'STOP MONITORING':'START MONITORING';$('#go').style.background=o?'#D32F2F':'#FFA000'};ui();
 $('#go').onclick=async()=>{if(AS().on){hush();overOff();asShown=0;unschedule('as');put('as',{on:0});return ui()}
  const v=i=>+$(i).value||0,iv=v('#im')*60+v('#is'),gr=v('#gm')*60+v('#gs');if(iv<=0)return toast('Please set an interval greater than 0');
  const f=$('#tf').files[0];await db('snd_as',f||null);ask();wake();put('as',{on:1,iv,gr,tone:$('#ts').value,snd:!!f,phase:'wait',next:Date.now()+iv*1000});ui()};
}
function awake(){const a=AS();if(!a.on)return;hush();overOff();asShown=0;unschedule('as');a.phase='wait';a.next=Date.now()+a.iv*1000;put('as',a);toast('Timer reset! Keep studying.')}
async function antiTick(n){
 const a=AS();if(!a.on)return;
 if(a.phase=='wait'&&n>=a.next){a.phase='ask';a.dl=n+a.gr*1000;put('as',a);notify('Anti-Sleep Alert!',`Are you awake? Tap 'I'M AWAKE' within ${a.gr} seconds!`,{tag:'as',requireInteraction:true,renotify:true,actions:[{action:'awake',title:"I'M AWAKE"}]})}
 else if(a.phase=='ask'&&n>=a.dl){a.phase='alarm';put('as',a);sound(a.tone,a.snd&&await snd('snd_as'));navigator.vibrate?.([800,300,800])}
 if(a.phase!='wait'&&!asShown&&!ringing){asShown=1;over(`<img src="img/antisleep.webp" alt=""><h1>Are you awake?</h1><h2 id=cd></h2><button class=wide id=aw>I'M AWAKE</button>`);$('#aw').onclick=awake}
 const c=$('#cd');if(c)c.textContent=a.phase=='ask'?Math.max(0,Math.ceil((a.dl-n)/1000))+'s left':'WAKE UP!';
}
/* ---------- notes ---------- */
const mk=b=>{const e=document.createElement(b.type=='image'?'img':b.type=='text'?'p':b.type);if(b.type=='text')e.textContent=b.content;else{e.src=URL.createObjectURL(b.content);if(b.type!='image')e.controls=true}return e};
async function notes(){
 page('Notes','<ul id=nl></ul><a class=fab href="#note">＋</a>');const n=await db('notes')||[];
 $('#nl').innerHTML=n.map(x=>`<li data-v=${x.id}><div><b>${esc(x.title)}</b><small>${x.date}</small></div><a class=x href="#note/${x.id}">✎</a><button class=x data-d=${x.id}>🗑</button></li>`).join('')||'<p class=empty>No notes yet. Tap ＋ to add one.</p>';
 $('#nl').onclick=async e=>{const d=e.target.dataset.d,li=e.target.closest('li');if(d){await db('notes',n.filter(x=>x.id!=d));notes()}else if(li&&!e.target.closest('a'))location.hash='#view/'+li.dataset.v};
}
async function note(id){
 const all=await db('notes')||[],cur=all.find(x=>x.id==id);let B=cur?cur.blocks.map(b=>({...b})):[],rec;
 page(id?'Edit Note':'New Note',`<input id=nt placeholder="Note title" value="${esc(cur?.title||'')}"><div id=bl></div><div class="row wrap"><button id=bt>+ Text</button><button id=bi>+ Image</button><button id=bv>+ Voice</button><button id=bx>+ Video</button></div><button class=wide id=sv>Save</button>`,'notes');
 const R=()=>{$('#bl').innerHTML='';B.forEach((b,i)=>{const d=document.createElement('div');d.className='blk';if(b.type=='text'){const t=document.createElement('textarea');t.value=b.content;t.placeholder='Type text here...';t.oninput=()=>b.content=t.value;d.append(t)}else d.append(mk(b));const x=document.createElement('button');x.className='x';x.textContent='✕';x.onclick=()=>{B.splice(i,1);R()};d.append(x);$('#bl').append(d)})};R();
 const file=(t,cap)=>{const f=document.createElement('input');f.type='file';f.accept=t+'/*';if(cap)f.setAttribute('capture','environment');f.onchange=()=>{if(f.files[0]){B.push({type:t,content:f.files[0]});R()}};f.click()};
 const choose=(t,live)=>pick('Add '+t,[['Take Live '+t,live],['Choose from Device',()=>file(t)]]);
 const startRec=async()=>{try{const st=await navigator.mediaDevices.getUserMedia({audio:1}),ch=[];rec=new MediaRecorder(st);rec.ondataavailable=e=>ch.push(e.data);rec.onstop=()=>{st.getTracks().forEach(t=>t.stop());B.push({type:'audio',content:new Blob(ch,{type:rec.mimeType})});rec=0;$('#bv').textContent='+ Voice';R()};rec.start();$('#bv').textContent='⏹ Stop Rec';toast('Recording audio...')}catch{toast('Microphone not available')}};
 $('#bt').onclick=()=>{B.push({type:'text',content:''});R()};$('#bi').onclick=()=>choose('image',()=>file('image',1));$('#bx').onclick=()=>choose('video',()=>file('video',1));$('#bv').onclick=()=>rec?rec.stop():choose('audio',startRec);
 $('#sv').onclick=async()=>{const n={id:cur?.id||uid(),title:$('#nt').value.trim()||'Untitled Note',date:new Date().toISOString().slice(0,10),blocks:B.filter(b=>b.type!='text'||b.content)};await db('notes',cur?all.map(x=>x.id==n.id?n:x):[n,...all]);toast('Note Saved');location.hash='#notes'};
}
async function view(id){
 const n=(await db('notes')||[]).find(x=>x.id==id);if(!n)return location.hash='#notes';
 page(esc(n.title),`<small>${n.date}</small><div id=vb></div>`,'notes');n.blocks.forEach(b=>$('#vb').append(mk(b)));
}
/* ---------- whiteboard ---------- */
async function gallery(){
 page('White Boards','<div id=gv class=gal></div><a class=fab href="#board">＋</a>','home','wide');let bs=await db('boards')||[],urls=[],held=0,t;
 const ca=document.createElement('button');ca.className='ghost';ca.textContent='🗑 Delete all';$('header').append(ca);offs.push(()=>urls.forEach(u=>URL.revokeObjectURL(u)));
 const R=()=>{urls.forEach(u=>URL.revokeObjectURL(u));urls=bs.map(b=>URL.createObjectURL(b.img));$('#gv').innerHTML=bs.map((b,i)=>`<div class=tile><img data-i=${b.id} src="${urls[i]}" alt="board"><button class=del data-x=${b.id} aria-label="Delete board" title="Delete board">🗑</button></div>`).join('')||'<p class=empty style="grid-column:1/-1">No boards saved yet. Tap ＋ to draw.</p>';ca.hidden=!bs.length};R();
 const del=(ids,msg,ok)=>dlg(`<h3>Delete</h3><p>${msg}</p>`,async()=>{bs=bs.filter(b=>!ids.includes(b.id));await db('boards',bs);toast(ok);R()},'Delete');
 ca.onclick=()=>del(bs.map(b=>b.id),`Delete all ${bs.length} saved boards? This cannot be undone.`,'All boards deleted');
 $('#gv').oncontextmenu=e=>e.preventDefault();
 $('#gv').onpointerdown=e=>{const i=e.target.dataset.i;if(!i)return;held=0;t=setTimeout(()=>{held=1;pick('Board Options',[['View',()=>location.hash=`#board/${i}/ro`],['Delete',()=>del([i],'Delete this board? This cannot be undone.','Board deleted')]])},500)};
 $('#gv').onpointerup=$('#gv').onpointercancel=$('#gv').onpointermove=()=>clearTimeout(t);
 $('#gv').onclick=e=>{const x=e.target.dataset.x,i=e.target.dataset.i;if(x)return del([x],'Delete this board? This cannot be undone.','Board deleted');if(i&&!held)location.hash='#board/'+i};
}
async function board(id,ro){
 const cols=['#ffffff','#ff0000','#0000ff','#00ff00','#ffff00'];
 app.innerHTML=`<div class=bd><canvas id=cv></canvas><a class=bk href="#boards">←</a>${ro?'':`<div class=tb><button id=un>↶</button><button id=re>↷</button><select id=tl><option value=pen>Pencil<option value=line>Line<option value=rect>Rectangle<option value=circle>Circle<option value=arrow>Arrow</select>${cols.map(c=>`<i class=sw2 data-c=${c} style="background:${c}"></i>`).join('')}<input type=color id=cc value="#ff8800"><button id=er class=ghost>Eraser</button><input type=range id=rg min=2 max=60 value=12><select id=bc><option value=#0A0A0A>Default<option value=#212121>Dark Gray<option value=#000000>Pitch Black<option value=#0D1B2A>Navy Blue<option value=#1B4332>Dark Green<option value=#4A0E0E>Maroon</select><label class=btn>🖼 Image<input type=file id=bi accept="image/*" hidden></label><button id=cl class=ghost>Clear</button><button id=sv>💾 Save</button></div>`}</div>`;
 const cv=$('#cv'),x=cv.getContext('2d'),D=devicePixelRatio||1,W={x:0,y:0,k:1},P=new Map();
 let S=[],U=[],bg='#0A0A0A',img=null,tool='pen',col='#ffffff',sz=12,er=0,cur=null,g0,cid=id;
 const ex=id&&(await db('boards')||[]).find(b=>b.id==id);if(ex)img=await createImageBitmap(ex.img);
 const shape=(s,c)=>{c.strokeStyle=s.c;c.lineWidth=s.w;c.lineCap=c.lineJoin='round';c.beginPath();const p=s.p,a=p[0],b=p[p.length-1];
  if(s.t=='pen'){c.moveTo(a[0],a[1]);p.forEach(q=>c.lineTo(q[0],q[1]))}else if(s.t=='rect')c.rect(a[0],a[1],b[0]-a[0],b[1]-a[1]);else if(s.t=='circle')c.arc(a[0],a[1],Math.hypot(b[0]-a[0],b[1]-a[1]),0,7);
  else{c.moveTo(a[0],a[1]);c.lineTo(b[0],b[1]);if(s.t=='arrow'){const t=Math.atan2(b[1]-a[1],b[0]-a[0]);for(const d of[-1,1]){c.moveTo(b[0],b[1]);c.lineTo(b[0]-30*Math.cos(t+d*Math.PI/6),b[1]-30*Math.sin(t+d*Math.PI/6))}}}c.stroke()};
 const render=(c,v,w,h)=>{c.setTransform(1,0,0,1,0,0);c.fillStyle=bg;c.fillRect(0,0,w,h);c.setTransform(D*v.k,0,0,D*v.k,D*v.x,D*v.y);if(img)c.drawImage(img,0,0,img.width/D,img.height/D);[...S,cur].forEach(s=>s&&shape(s,c))};
 const draw=()=>render(x,W,cv.width,cv.height),fit=()=>{cv.width=innerWidth*D;cv.height=innerHeight*D;draw()};fit();addEventListener('resize',fit);offs.push(()=>removeEventListener('resize',fit));
 const wp=e=>[(e.offsetX-W.x)/W.k,(e.offsetY-W.y)/W.k],gest=()=>{const[a,b]=[...P.values()];return{cx:(a[0]+b[0])/2,cy:(a[1]+b[1])/2,d:Math.hypot(a[0]-b[0],a[1]-b[1])||1}};
 const zoom=(cx,cy,f)=>{const k=Math.min(5,Math.max(.2,W.k*f)),wx=(cx-W.x)/W.k,wy=(cy-W.y)/W.k;W.k=k;W.x=cx-wx*k;W.y=cy-wy*k};
 cv.onpointerdown=e=>{cv.setPointerCapture(e.pointerId);P.set(e.pointerId,[e.offsetX,e.offsetY]);if(P.size>1){cur=null;g0=gest()}else if(!ro){const w=wp(e);cur={t:er?'pen':tool,c:er?bg:col,w:sz,p:tool=='pen'||er?[w]:[w,w]}}draw()};
 cv.onpointermove=e=>{if(!P.has(e.pointerId))return;P.set(e.pointerId,[e.offsetX,e.offsetY]);if(P.size>1){const g=gest(),ox=g0.cx,oy=g0.cy;zoom(ox,oy,g.d/g0.d);W.x+=g.cx-ox;W.y+=g.cy-oy;g0=g}else if(cur){cur.t=='pen'?cur.p.push(wp(e)):cur.p[1]=wp(e)}draw()};
 cv.onpointerup=cv.onpointercancel=e=>{P.delete(e.pointerId);if(cur&&!P.size){S.push(cur);U=[];cur=null}draw()};
 cv.onwheel=e=>{e.preventDefault();zoom(e.offsetX,e.offsetY,e.deltaY<0?1.1:.9);draw()};
 if(ro)return;
 const sel=el=>{$$('.sw2').forEach(s=>s.classList.toggle('on',s==el))};
 $$('.sw2').forEach(s=>s.onclick=()=>{col=s.dataset.c;er=0;sel(s)});$('#cc').oninput=e=>{col=e.target.value;er=0;sel()};$('#er').onclick=()=>{er=1;sel()};
 $('#tl').onchange=e=>tool=e.target.value;$('#rg').oninput=e=>sz=+e.target.value;$('#un').onclick=()=>{S.length&&U.push(S.pop());draw()};$('#re').onclick=()=>{U.length&&S.push(U.pop());draw()};
 $('#bc').onchange=e=>{bg=e.target.value;img=null;draw()};$('#cl').onclick=()=>{S=[];U=[];draw()};
 $('#bi').onchange=async e=>{if(e.target.files[0]){img=await createImageBitmap(e.target.files[0]);draw()}};
 $('#sv').onclick=async()=>{const o=document.createElement('canvas');o.width=cv.width;o.height=cv.height;render(o.getContext('2d'),{x:0,y:0,k:1},o.width,o.height);const blob=await new Promise(r=>o.toBlob(r,'image/webp',.9)),L=await db('boards')||[],rec={id:cid||uid(),img:blob};await db('boards',L.some(b=>b.id==rec.id)?L.map(b=>b.id==rec.id?rec:b):[rec,...L]);cid=rec.id;toast('Board saved to gallery')};
}
/* ---------- engine ---------- */
function tick(){
 const n=Date.now();let t=tasks(),c=0;
 t.forEach(x=>{if(x.time<=n&&!x.n){x.n=c=1;notify('★ '+x.title+' ★','· Complete Task ·',{tag:'t'+x.id});toast('⏰ '+x.title)}});if(c){saveT(t);if($('#tl'))todo.R()}
 const al=alarms();c=0;al.forEach(x=>{if(x.on&&!x.fired&&x.time<=n&&!ringing){x.fired=c=1;if(n-x.time<6e5)ring(x)}});if(c)saveA(al);
 if(T.run&&n>=T.end){T.run=T.started=0;T.left=0;sound('Chime');setTimeout(hush,4e3);notify('Timer finished','Time is up! Take a break.',{tag:'timer'});toast('⏱ Time is up!')}
 antiTick(n);refresh();
}
const VIEWS={home,todo,timer,clock,boards:gallery,board,alarm,notes,note,view,anti};
function route(){offs.forEach(f=>f());offs=[];refresh=()=>{};const[p,...a]=location.hash.slice(1).split('/');(VIEWS[p]||home)(...a)}
addEventListener('hashchange',route);
document.addEventListener('visibilitychange',()=>{if(!document.hidden){if(AS().on||ringing)wake();tick()}});
document.addEventListener('click',()=>{ask();ac=ac||new AC();ac.resume()},{once:true});
route();setInterval(tick,1000);tick();
setTimeout(()=>{$('#splash').classList.add('out');setTimeout(()=>$('#splash').remove(),500)},500+Math.random()*1500);
