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
function def(){return {weeks:WEEKS.map(function(){return {done:false,notes:'',result:''};}),mode:'normal',days:[],reports:[],tasks:{},myTasks:[],hideDone:false,tab:'sys'};}
var S;
try{S=JSON.parse(localStorage.getItem(KEY))||def();}catch(e){S=def();}
function norm(){var d=def();for(var k in d)if(S[k]===undefined)S[k]=d[k];if(!Array.isArray(S.myTasks))S.myTasks=[];if(!S.tasks||typeof S.tasks!=='object')S.tasks={};while(S.weeks.length<6)S.weeks.push({done:false,notes:'',result:''});}
norm();
function save(){try{localStorage.setItem(KEY,JSON.stringify(S));}catch(e){}}
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
  cb.onchange=function(){st.done=cb.checked;c.classList.toggle('done',st.done);save();progress();};
  lab.appendChild(cb);lab.appendChild(document.createTextNode(' Выполнено'));c.appendChild(lab);
  var det=el('details');if(st.notes||st.result)det.open=true;det.appendChild(el('summary',null,'Заметки и результат недели'));
  var f=el('div',{'class':'form'});
  var l1=el('label',null,'Заметки');var ta=el('textarea',{rows:3});ta.value=st.notes;ta.oninput=function(){st.notes=ta.value;save();};l1.appendChild(ta);
  var l2=el('label',null,'Результат недели');var inp=el('textarea',{rows:2});inp.value=st.result;inp.oninput=function(){st.result=inp.value;save();};l2.appendChild(inp);
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
function delBtn(arr,i,re){var b=el('button',{'class':'del',title:'Удалить',type:'button'},'×');b.onclick=function(){if(confirm('Удалить запись?')){arr.splice(i,1);save();re();}};return b;}
function sortDesc(a){return a.map(function(x,i){return [x,i];}).sort(function(p,q){return p[0].date<q[0].date?1:-1;});}
function renderDays(){
 var ul=$('#dayList');ul.innerHTML='';
 sortDesc(S.days).forEach(function(p){var d=p[0];var li=el('li',null,(d.done?'✅ ':'⬜ ')+d.date+' · '+((MODES[d.mode]||{}).name||'')+'\nЗадача: '+d.task+(d.uncert?'\nНеопределённость: '+d.uncert:''));
  li.style.cursor='pointer';li.title='Нажми, чтобы отметить выполнение';li.onclick=function(e){if(e.target.className==='del')return;d.done=!d.done;save();renderDays();};
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
 df.onsubmit=function(e){e.preventDefault();S.days.push({date:df.date.value,mode:df.mode.value,task:df.task.value.trim(),uncert:df.uncert.value.trim(),done:df.done.checked});save();df.task.value='';df.uncert.value='';df.done.checked=false;renderDays();toast('Запись добавлена');};
 var rf=$('#repForm');rf.date.value=today();
 function cur(){return {date:rf.date.value||today(),q1:rf.q1.value.trim(),q2:rf.q2.value.trim(),q3:rf.q3.value.trim(),q4:rf.q4.value.trim()};}
 rf.onsubmit=function(e){e.preventDefault();S.reports.push(cur());save();['q1','q2','q3','q4'].forEach(function(k){rf[k].value='';});renderReps();toast('Отчёт сохранён');};
 $('#copyRep').onclick=function(){copy(repText(cur()));};
 $('#exportBtn').onclick=function(){var b=new Blob([JSON.stringify(S,null,2)],{type:'application/json'});var a=el('a',{href:URL.createObjectURL(b),download:'risefig-'+today()+'.json'});document.body.appendChild(a);a.click();a.remove();};
 $('#importFile').onchange=function(e){var f=e.target.files[0];if(!f)return;var r=new FileReader();r.onload=function(){try{var d=JSON.parse(r.result);if(!d||!Array.isArray(d.weeks))throw 0;if(!confirm('Заменить текущие данные импортированными?'))return;S=d;norm();save();all();toast('Данные импортированы');}catch(x){alert('Неверный файл');}};r.readAsText(f);e.target.value='';};
 $('#resetBtn').onclick=function(){if(confirm('Удалить все данные? Сначала лучше сделать экспорт.')){S=def();save();all();toast('Данные сброшены');}};
 all();
}
function taskRow(id,text,own,del,off,lbl){
 var li=el('li',{'class':(S.tasks[id]?'done':'')+(off?' off':'')});var lab=el('label',{'class':'check'});var cb=el('input',{type:'checkbox'});cb.checked=!!S.tasks[id];if(off){cb.disabled=true;}
 cb.onchange=function(){if(cb.checked)S.tasks[id]=1;else delete S.tasks[id];save();renderTasks();};
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
    if(sg.mine){var idx=it[3];del=delBtn(S.myTasks,idx,function(){delete S.tasks[it[0]];save();renderTasks();});}
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
initTasks();
init();
})();
