(function(){
'use strict';
var KEY='risefig-v1';
var WEEKS=[
 ['Диагностика существующей игры','Изучить первые пять минут Mahjong Rise, сравнить с 2–3 успешными играми. Разобраться, что понятно, что интересно и где теряется внимание.','3 конкретные проблемы, которые необходимо решить.'],
 ['Изучение игрового дизайна','Разобрать понятие core gameplay loop — основного игрового цикла. Спроектировать простую последовательность: маджонг → семя → растение → награда → следующий маджонг.','схема игрового цикла и одна проверяемая гипотеза.'],
 ['Минимальный прототип','Сделать только один полный игровой цикл. Пока без рынка, набегов, сложного скрещивания и десятков растений.','сборка, в которой можно пережить полный цикл.'],
 ['Исследование игроков','Найти пять человек и наблюдать, как они играют, желательно без подсказок. Записать, где они теряются и хотят ли продолжить.','реальные наблюдения вместо собственных догадок.'],
 ['Улучшение и повторный тест','Исправить одну-две главные проблемы. Проверить изменения на новых игроках.','понимание, улучшился ли игровой опыт.'],
 ['Первые эксперименты с привлечением','Проверить несколько коротких TikTok-роликов или публикаций в игровых сообществах. Посмотреть, что приводит настоящих игроков.','первый проверенный канал или понимание, почему выбранный канал пока не работает.']
];
var MODES={
 low:{name:'Сил почти нет',time:'10–15 минут',items:['Прочитать один небольшой раздел по игровому дизайну.','Записать один вопрос или наблюдение.','Не открывать редактор/проект без необходимости.']},
 normal:{name:'Обычный день',time:'40–60 минут',items:['Выбрать один небольшой шаг текущей недели программы.','Сформулировать, какую неопределённость он уменьшает.','Сделать этот шаг или проверить одну маленькую гипотезу.','Записать результат в дневник.']},
 high:{name:'Есть энергия',time:'2–3 часа',items:['Собрать кусок прототипа или провести тестовую сессию с игроком.','Пройти полный мини-цикл: изучить → гипотеза → сделать → проверить.','Зафиксировать выводы и следующий шаг.','Остановиться, когда задача выполнена, — не «пока есть силы».']}
};
function def(){return {weeks:WEEKS.map(function(){return {done:false,notes:'',result:''};}),mode:'normal',days:[],reports:[],tasks:{},taskTs:{},del:{},myTasks:[],hideDone:false,tab:'sys'};}
var S;
try{S=JSON.parse(localStorage.getItem(KEY))||def();}catch(e){S=def();}
function norm(){var d=def();for(var k in d)if(S[k]===undefined)S[k]=d[k];if(!Array.isArray(S.myTasks))S.myTasks=[];if(!S.tasks||typeof S.tasks!=='object')S.tasks={};if(!S.taskTs||typeof S.taskTs!=='object')S.taskTs={};if(!S.del||typeof S.del!=='object')S.del={};while(S.weeks.length<6)S.weeks.push({done:false,notes:'',result:''});}
norm();
function save(nosync){try{localStorage.setItem(KEY,JSON.stringify(S));}catch(e){}if(!nosync&&window.RFSync)RFSync.schedule();}
function $(s){return document.querySelector(s);}
function el(t,a,txt){var e=document.createElement(t);if(a)for(var k in a)e.setAttribute(k,a[k]);if(txt!=null)e.textContent=txt;return e;}
function toast(m){var t=$('#toast');t.textContent=m;t.classList.add('show');clearTimeout(toast.t);toast.t=setTimeout(function(){t.classList.remove('show');},1800);}
function today(){var d=new Date();d.setMinutes(d.getMinutes()-d.getTimezoneOffset());return d.toISOString().slice(0,10);}

function renderWeeks(){
 var box=$('#weeks');box.innerHTML='';
 WEEKS.forEach(function(w,i){
  var st=S.weeks[i],c=el('div',{'class':'week'+(st.done?' done':'')});
  var h=el('div',{'class':'week-head'});h.appendChild(el('div',{'class':'num'},'0'+(i+1)));
  var b=el('div');b.appendChild(el('h3',null,w[0]));b.appendChild(el('p',null,w[1]));b.appendChild(el('div',{'class':'res'},'Результат: '+w[2]));
  h.appendChild(b);c.appendChild(h);
  var lab=el('label',{'class':'check'});var cb=el('input',{type:'checkbox'});cb.checked=st.done;
  cb.onchange=function(){st.done=cb.checked;st.ts=Date.now();c.classList.toggle('done',st.done);save();progress();};
  lab.appendChild(cb);lab.appendChild(document.createTextNode(' Выполнено'));c.appendChild(lab);
  var det=el('details');if(st.notes||st.result)det.open=true;det.appendChild(el('summary',null,'Заметки и результат недели'));
  var f=el('div',{'class':'form'});
  var l1=el('label',null,'Заметки');var ta=el('textarea',{rows:3});ta.value=st.notes;ta.oninput=function(){st.notes=ta.value;st.ts=Date.now();save();};l1.appendChild(ta);
  var l2=el('label',null,'Результат недели');var inp=el('textarea',{rows:2});inp.value=st.result;inp.oninput=function(){st.result=inp.value;st.ts=Date.now();save();};l2.appendChild(inp);
  f.appendChild(l1);f.appendChild(l2);det.appendChild(f);c.appendChild(det);box.appendChild(c);
 });progress();
}
function progress(){var n=S.weeks.filter(function(w){return w.done;}).length;$('#progText').textContent=n+' / 6';$('#progBar').style.width=(n/6*100)+'%';}

function renderModes(){
 var bx=$('#modeBtns');bx.innerHTML='';
 Object.keys(MODES).forEach(function(k){var m=MODES[k];var btn=el('button',{type:'button'},m.name);if(S.mode===k)btn.className='on';btn.onclick=function(){S.mode=k;save();renderModes();$('#dayForm').mode.value=k;};bx.appendChild(btn);});
 var m=MODES[S.mode]||MODES.normal,body=$('#modeBody');body.innerHTML='';
 body.appendChild(el('b',null,m.time));var ul=el('ul');m.items.forEach(function(x){ul.appendChild(el('li',null,x));});body.appendChild(ul);
}
function delBtn(arr,i,re){var b=el('button',{'class':'del',title:'Удалить',type:'button'},'×');b.onclick=function(){if(confirm('Удалить запись?')){S.del[ikey(arr[i])]=Date.now();arr.splice(i,1);save();re();}};return b;}
function sortDesc(a){return a.map(function(x,i){return [x,i];}).sort(function(p,q){return p[0].date<q[0].date?1:-1;});}
function renderDays(){
 var ul=$('#dayList');ul.innerHTML='';
 sortDesc(S.days).forEach(function(p){var d=p[0];var li=el('li',null,(d.done?'✅ ':'⬜ ')+d.date+' · '+((MODES[d.mode]||{}).name||'')+'\nЗадача: '+d.task+(d.uncert?'\nНеопределённость: '+d.uncert:''));
  li.style.cursor='pointer';li.title='Нажми, чтобы отметить выполнение';li.onclick=function(e){if(e.target.className==='del')return;d.done=!d.done;d.ts=Date.now();save();renderDays();};
  li.appendChild(delBtn(S.days,p[1],renderDays));ul.appendChild(li);});
}
function repText(r){return 'Еженедельный отчёт — '+r.date+'\n\n1. Чему я научился?\n'+(r.q1||'—')+'\n\n2. Что я проверил?\n'+(r.q2||'—')+'\n\n3. Что узнал о своей игре или игроках?\n'+(r.q3||'—')+'\n\n4. Какой следующий шаг?\n'+(r.q4||'—');}
function renderReps(){
 var ul=$('#repList');ul.innerHTML='';
 sortDesc(S.reports).forEach(function(p){var li=el('li',null,repText(p[0]));var cp=el('button',{'class':'btn',type:'button',style:'margin-top:8px'},'Скопировать');cp.onclick=function(){copy(repText(p[0]));};li.appendChild(el('br'));li.appendChild(cp);li.appendChild(delBtn(S.reports,p[1],renderReps));ul.appendChild(li);});
}
function copy(t){
 function fb(){var a=el('textarea');a.value=t;document.body.appendChild(a);a.select();try{document.execCommand('copy');toast('Скопировано');}catch(e){toast('Не удалось скопировать');}a.remove();}
 if(navigator.clipboard&&window.isSecureContext)navigator.clipboard.writeText(t).then(function(){toast('Скопировано');},fb);else fb();
}
function init(){
 var df=$('#dayForm');Object.keys(MODES).forEach(function(k){df.mode.appendChild(el('option',{value:k},MODES[k].name));});
 df.date.value=today();df.mode.value=S.mode;
 df.onsubmit=function(e){e.preventDefault();S.days.push({u:uid(),ts:Date.now(),date:df.date.value,mode:df.mode.value,task:df.task.value.trim(),uncert:df.uncert.value.trim(),done:df.done.checked});save();df.task.value='';df.uncert.value='';df.done.checked=false;renderDays();toast('Запись добавлена');};
 var rf=$('#repForm');rf.date.value=today();
 function cur(){return {date:rf.date.value||today(),q1:rf.q1.value.trim(),q2:rf.q2.value.trim(),q3:rf.q3.value.trim(),q4:rf.q4.value.trim()};}
 rf.onsubmit=function(e){e.preventDefault();var rr=cur();rr.u=uid();S.reports.push(rr);save();['q1','q2','q3','q4'].forEach(function(k){rf[k].value='';});renderReps();toast('Отчёт сохранён');};
 $('#copyRep').onclick=function(){copy(repText(cur()));};
 $('#exportBtn').onclick=function(){var b=new Blob([JSON.stringify(S,null,2)],{type:'application/json'});var a=el('a',{href:URL.createObjectURL(b),download:'risefig-'+today()+'.json'});document.body.appendChild(a);a.click();a.remove();};
 $('#importFile').onchange=function(e){var f=e.target.files[0];if(!f)return;var r=new FileReader();r.onload=function(){try{var d=JSON.parse(r.result);if(!d||!Array.isArray(d.weeks))throw 0;if(!confirm('Заменить текущие данные импортированными?'))return;S=d;norm();save();all();toast('Данные импортированы');}catch(x){alert('Неверный файл');}};r.readAsText(f);e.target.value='';};
 $('#resetBtn').onclick=function(){if(confirm('Удалить все данные? Сначала лучше сделать экспорт.')){S=def();save();all();toast('Данные сброшены');}};
 all();
}
function taskRow(id,text,own,del,off,lbl){
 var li=el('li',{'class':(S.tasks[id]?'done':'')+(off?' off':'')});var lab=el('label',{'class':'check'});var cb=el('input',{type:'checkbox'});cb.checked=!!S.tasks[id];if(off){cb.disabled=true;}
 cb.onchange=function(){if(cb.checked)S.tasks[id]=1;else delete S.tasks[id];S.taskTs[id]=Date.now();save();renderTasks();};
 lab.appendChild(cb);var sp=el('span',null,text+' ');sp.appendChild(el('span',{'class':'tag'+(own==='Алексей'?' me':'')},own));if(off&&lbl)sp.appendChild(el('span',{'class':'tag off-tag'},'Отложено — вернусь позже'));lab.appendChild(sp);li.appendChild(lab);
 if(del)li.appendChild(del);return li;}
function renderTasks(){
 var G=window.RISEFIG_TASKS||[],box=$('#taskGroups');if(!box)return;box.innerHTML='';var tot=0,dn=0;
 box.classList.toggle('hide-done',!!S.hideDone);var hb=$('#hideDone');if(hb)hb.textContent=S.hideDone?'Показать выполненные':'Скрыть выполненные';
 var groups=G.map(function(g){return {disabled:g.disabled,id:g.id,title:g.title,owner:g.owner,note:g.note,rules:g.rules,sub:g.sub.slice()};});
 groups.push({id:'my',title:'Мои задачи',owner:'Алексей',sub:[]});
 S.myTasks.forEach(function(t,i){var g=groups.filter(function(x){return x.id===t.group;})[0]||groups[groups.length-1];
  var sg=g.sub.filter(function(s){return s.mine;})[0];if(!sg){sg={title:'Добавлено мной',mine:true,items:[]};g.sub.push(sg);}sg.items.push([t.id,t.text,t.owner||'Алексей',i]);});
 groups.forEach(function(g){if(g.id==='my'&&!g.sub.length)return;var gt=0,gd=0;
  var c=el('section',{'class':'week tgroup'+(g.disabled?' off':'')});var h=el('div',{'class':'ghead'});h.appendChild(el('h3',null,g.title));if(g.disabled)h.appendChild(el('span',{'class':'tag off-tag'},'Отложено — вернусь позже'));var cnt=el('span',{'class':'gcount'});h.appendChild(cnt);c.appendChild(h);
  var pb=el('div',{'class':'progress small'});var bar=el('div',{'class':'gbar'});pb.appendChild(bar);c.appendChild(pb);
  if(g.note)c.appendChild(el('p',{'class':'note'},g.note));
  if(g.rules){var r=el('div',{'class':'note rules'});r.appendChild(el('b',null,'Правила: '));var ul0=el('ul');[].concat(g.rules).forEach(function(x){ul0.appendChild(el('li',null,x));});r.appendChild(ul0);c.appendChild(r);}
  g.sub.forEach(function(sg){c.appendChild(el('h4',null,sg.title));var ul=el('ul',{'class':'tlist'});
   sg.items.forEach(function(it){var off=!!g.disabled||(window.RISEFIG_DISABLED_TASKS||[]).indexOf(it[0])>=0;if(!off){gt++;if(S.tasks[it[0]])gd++;}var del=null;
    if(sg.mine){var idx=it[3];del=delBtn(S.myTasks,idx,function(){delete S.tasks[it[0]];S.taskTs[it[0]]=Date.now();save();renderTasks();});}
    ul.appendChild(taskRow(it[0],it[1],it[2]||g.owner,del,off,!g.disabled));});
   c.appendChild(ul);});
  cnt.textContent=gd+' / '+gt;bar.style.width=(gt?gd/gt*100:0)+'%';if(gt&&gd===gt)c.classList.add('done');
  tot+=gt;dn+=gd;box.appendChild(c);});
 $('#taskText').textContent=dn+' / '+tot;$('#taskBar').style.width=(tot?dn/tot*100:0)+'%';
 var sel=$('#taskForm')&&$('#taskForm').group;if(sel&&!sel.options.length){groups.forEach(function(g){sel.appendChild(el('option',{value:g.id},g.title));});sel.value='my';}
}
function setTab(t){S.tab=t;save();['sys','dev'].forEach(function(k){$('#pane-'+k).hidden=(k!==t);});
 [].forEach.call(document.querySelectorAll('.tab'),function(b){b.classList.toggle('on',b.getAttribute('data-tab')===t);});window.scrollTo(0,0);}
function initTasks(){
 [].forEach.call(document.querySelectorAll('.tab'),function(b){b.onclick=function(){setTab(b.getAttribute('data-tab'));};});
 [].forEach.call(document.querySelectorAll('.subnav a'),function(){});
 $('#hideDone').onclick=function(){S.hideDone=!S.hideDone;save();renderTasks();};
 var tf=$('#taskForm');tf.onsubmit=function(e){e.preventDefault();var tx=tf.text.value.trim();if(!tx)return;
  S.myTasks.push({id:'u'+Date.now().toString(36),text:tx,group:tf.group.value,owner:tf.owner.value.trim()||'Алексей'});save();tf.text.value='';renderTasks();toast('Задача добавлена');};
 var h=location.hash;setTab(h==='#dev'||h==='#tasks'?'dev':(S.tab==='dev'?'dev':'sys'));
}
function all(){renderTasks();renderWeeks();renderModes();renderDays();renderReps();var df=$('#dayForm');if(df)df.mode.value=S.mode;}
function uid(){return Date.now().toString(36)+Math.random().toString(36).slice(2,8);}
function ikey(x){return x&&x.u?x.u:(x&&x.id?x.id:JSON.stringify(x));}
function mergeState(a,b){ // a=local, b=remote
 var o=JSON.parse(JSON.stringify(a));if(!b||typeof b!=='object')return o;
 var del={};[a.del||{},b.del||{}].forEach(function(d){for(var k in d)del[k]=Math.max(del[k]||0,d[k]);});o.del=del;
 var at=a.taskTs||{},bt=b.taskTs||{},ids={};[a.tasks||{},b.tasks||{},at,bt].forEach(function(m){for(var k in m)ids[k]=1;});
 o.tasks={};o.taskTs={};
 for(var id in ids){var ta=at[id]||0,tb=bt[id]||0,v;
  if(ta===0&&tb===0)v=!!((a.tasks||{})[id]||(b.tasks||{})[id]);else v=tb>ta?!!(b.tasks||{})[id]:!!(a.tasks||{})[id];
  if(v)o.tasks[id]=1;if(ta||tb)o.taskTs[id]=Math.max(ta,tb);}
 o.weeks=(a.weeks||[]).map(function(w,i){var r=(b.weeks||[])[i];if(!r)return w;var x=w.ts||0,y=r.ts||0;
  if(x||y)return y>x?r:w;return {done:w.done||r.done,notes:(w.notes||'').length>=(r.notes||'').length?w.notes:r.notes,result:(w.result||'').length>=(r.result||'').length?w.result:r.result};});
 ['days','reports','myTasks'].forEach(function(f){var m={},ord=[];[].concat(a[f]||[],b[f]||[]).forEach(function(x){var k=ikey(x);if(del[k])return;
  if(!m[k]){m[k]=x;ord.push(k);}else if((x.ts||0)>(m[k].ts||0))m[k]=x;});o[f]=ord.map(function(k){return m[k];});});
 return o;}
window.RFSync=(function(){
 var SK='risefig-sync',API='https://textdb.dev/api/data/',code=null,t=null,busy=false,again=false;
 try{code=localStorage.getItem(SK);}catch(e){}
 function st(m,c){var e=$('#syncStatus');if(e){e.textContent=m;e.className='sync-st '+(c||'');}}
 function ui(){var on=!!code;var a=$('#syncOn'),b=$('#syncOff');if(!a)return;a.hidden=!on;b.hidden=on;if(on)$('#syncCode').value=code;}
 function get(){return fetch(API+code+'?t='+Date.now(),{cache:'no-store'}).then(function(r){if(!r.ok)throw r.status;return r.text();}).then(function(t){t=(t||'').trim();if(!t)return null;try{return JSON.parse(t);}catch(e){return null;}});}
 function put(o){var x=JSON.parse(JSON.stringify(o));delete x.tab;delete x.hideDone;delete x.mode;
  return fetch(API+code,{method:'POST',headers:{'Content-Type':'text/plain'},body:JSON.stringify(x)}).then(function(r){if(!r.ok)throw r.status;});}
 function run(){if(!code)return Promise.resolve();if(busy){again=true;return Promise.resolve();}busy=true;st('Синхронизация…');
  var before=JSON.stringify(S);
  return get().then(function(rem){var m=mergeState(S,rem);m.tab=S.tab;m.hideDone=S.hideDone;m.mode=S.mode;var ch=JSON.stringify(m)!==before;S=m;norm();save(true);if(ch)all();
   return put(S);})
  .then(function(){var d=new Date();st('Синхронизировано · '+d.toLocaleTimeString().slice(0,5),'ok');})
  .catch(function(e){st('Ошибка синхронизации ('+e+'). Данные сохранены на устройстве, повторю позже.','err');})
  .then(function(){busy=false;if(again){again=false;schedule();}});}
 function schedule(){if(!code)return;clearTimeout(t);st('Есть изменения…');t=setTimeout(run,1500);}
 function connect(c){c=(c||'').trim();if(!/^rf-[a-z0-9]{16,}$/i.test(c)){alert('Неверный код. Он начинается с rf- .');return;}code=c;localStorage.setItem(SK,code);ui();run();}
 function init(){if(!$('#syncOn'))return;ui();
  $('#syncNew').onclick=function(){var a=new Uint8Array(16);crypto.getRandomValues(a);connect('rf-'+[].map.call(a,function(x){return ('0'+x.toString(16)).slice(-2);}).join(''));};
  $('#syncJoin').onclick=function(){connect($('#syncInput').value);};
  $('#syncCopy').onclick=function(){copy(code);};
  $('#syncNow').onclick=function(){run();};
  $('#syncOffBtn').onclick=function(){if(confirm('Отключить синхронизацию на этом устройстве? Данные останутся здесь.')){code=null;localStorage.removeItem(SK);ui();st('Синхронизация выключена');}};
  if(code)run();else st('Синхронизация выключена');
  window.addEventListener('focus',function(){if(code)run();});
  document.addEventListener('visibilitychange',function(){if(!document.hidden&&code)run();});}
 return {schedule:schedule,run:run,init:init};})();
initTasks();
init();
RFSync.init();
})();
