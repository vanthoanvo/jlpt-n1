let lessons=[], reviewQuestions=[], state={done:[],seen:[],reviews:{},lastScore:null};let current=null,quizItems=[],quizIndex=0,quizScore=0;
const $=s=>document.querySelector(s);
async function init(){
  try{
    const [lessonRes,reviewRes]=await Promise.all([fetch('data/grammar.json'),fetch('data/week1-review.json')]);
    if(!lessonRes.ok||!reviewRes.ok)throw new Error('Không tải được dữ liệu');
    lessons=await lessonRes.json();reviewQuestions=await reviewRes.json();
  }catch(e){$('#lessonList').textContent='Không tải được dữ liệu. Hãy mở ứng dụng qua GitHub Pages hoặc máy chủ cục bộ.';return}
  loadState();render();
  if('serviceWorker'in navigator)navigator.serviceWorker.register('./sw.js').catch(()=>{});
}
function loadState(){
  try{
    const x=JSON.parse(localStorage.getItem('n1state'));
    if(x)state={...state,...x};
  }catch(e){}
  const valid=new Set(lessons.map(x=>x.id));
  state.done=(state.done||[]).filter(id=>valid.has(id));
  state.seen=(state.seen||[]).filter(id=>valid.has(id));
  state.reviews=Object.fromEntries(Object.entries(state.reviews||{}).filter(([id])=>valid.has(id)));
  saveStateOnly();
}
function saveStateOnly(){localStorage.setItem('n1state',JSON.stringify(state))}
function save(){saveStateOnly();renderProgress();renderReview()}
function renderProgress(){
  const doneCount=state.done.length,pct=lessons.length?Math.round(doneCount/lessons.length*100):0;
  $('#progressPct').textContent=pct+'%';$('#progressText').textContent=`${doneCount} / ${lessons.length} mục đã hoàn thành`;
  $('#progressBar').style.width=pct+'%';$('#statDone').textContent=doneCount;$('#statSeen').textContent=state.seen.length;
  $('#statScore').textContent=state.lastScore===null?'—':state.lastScore+'%';
}
function render(){
  renderProgress();renderList();renderReview();
}
function renderList(){
  const q=($('#search')?.value||'').toLowerCase();
  const filtered=lessons.filter(x=>(x.pattern+x.meaning+x.group+x.dayTitle).toLowerCase().includes(q));
  let lastDay=null;
  $('#lessonList').innerHTML=filtered.map(x=>{
    let heading='';
    if(x.day!==lastDay){
      heading=`<div class="day-heading"><span class="eyebrow">TUẦN 1 · NGÀY ${x.day}</span><h3>${x.dayTitle}</h3><p>${dayDescriptions[x.day]||''}</p></div>`;
      lastDay=x.day;
    }
    return `${heading}<button class="lesson-item" data-id="${x.id}"><div class="top"><span class="tag">${x.group}</span><span class="done">${state.done.includes(x.id)?'✓ Đã học':''}</span></div><h3>${x.pattern}</h3><p>${x.meaning}</p></button>`;
  }).join('')||'<p>Không tìm thấy bài học phù hợp.</p>';
  document.querySelectorAll('.lesson-item').forEach(b=>b.onclick=()=>openLesson(b.dataset.id));
}
const dayDescriptions={
  1:'Nhấn mạnh điều kiện, sự thừa nhận và ý đối lập với こそ.',
  2:'Diễn tả lựa chọn, giới hạn, giả định và quy định.',
  3:'Phòng tránh, điều kiện thiếu vắng, suy đoán về người và cách coi một việc như đã / chưa xảy ra.',
  4:'Cách diễn đạt nhận định chung, cảm xúc tự phát và quan điểm cá nhân.',
  5:'Suy đoán từ dấu hiệu, đánh giá và đặt giả định.',
  6:'Nhượng bộ trong một tình huống, ước lượng và kết quả không thay đổi.'
};
function openLesson(id){
  current=lessons.find(x=>x.id===id);if(!current)return;
  if(!state.seen.includes(id))state.seen.push(id);save();
  $('#lessonDetail').innerHTML=`<span class="tag">Tuần ${current.week} · Ngày ${current.day}</span><span class="tag">${current.group}</span>
    <h2>${current.pattern}</h2><p><b>Ý nghĩa:</b> ${current.meaning}</p>
    <h3>Cấu trúc</h3><p>${current.formation}</p>
    <div class="example-heading"><h3>Ví dụ tự biên soạn</h3><div class="audio-controls"><button type="button" class="audio-btn" id="speakExample">🔊 Nghe</button><button type="button" class="audio-stop" id="stopExample">■ Dừng</button></div></div>
    <p class="jp">${current.example}</p><p class="translation">${current.translation}</p>
    <h3>Giải thích cách dùng</h3><p>${current.note}</p><h3>Phân biệt</h3><p>${current.compare}</p>
    <div class="action-row"><button class="primary" id="markDone">${state.done.includes(id)?'Bỏ đánh dấu hoàn thành':'Đánh dấu đã học'}</button></div>`;
  $('#markDone').onclick=()=>{
    if(state.done.includes(id)){state.done=state.done.filter(v=>v!==id);delete state.reviews[id]}
    else{state.done.push(id);state.reviews[id]=Date.now()+86400000}
    save();openLesson(id);
  };
  $('#speakExample').onclick=()=>speakJapanese(current.example);$('#stopExample').onclick=stopJapaneseAudio;
  showPanel('detail');
}
function speakJapanese(text){
  if(!('speechSynthesis'in window)){alert('Trình duyệt này chưa hỗ trợ đọc văn bản.');return}
  const synth=window.speechSynthesis;synth.cancel();const utterance=new SpeechSynthesisUtterance(text);
  utterance.lang='ja-JP';utterance.rate=0.88;utterance.pitch=1;
  const voices=synth.getVoices();const voice=voices.find(v=>v.lang.toLowerCase()==='ja-jp')||voices.find(v=>v.lang.toLowerCase().startsWith('ja'));
  if(voice)utterance.voice=voice;synth.speak(utterance);
}
function stopJapaneseAudio(){if('speechSynthesis'in window)window.speechSynthesis.cancel()}
function renderReview(){
  const due=lessons.filter(x=>state.reviews[x.id]&&state.reviews[x.id]<=Date.now());
  $('#reviewList').innerHTML=due.length?due.map(x=>`<div class="review-item"><div><b>${x.pattern}</b><div class="muted">${x.meaning}</div></div><button data-id="${x.id}">Ôn ngay</button></div>`).join(''):'<div class="quiz-card"><p>Chưa có bài ôn đến hạn. Hãy học một số mục và đánh dấu hoàn thành; ứng dụng sẽ nhắc ôn sau 1 ngày.</p></div>';
  document.querySelectorAll('#reviewList button').forEach(b=>b.onclick=()=>{delete state.reviews[b.dataset.id];save();openLesson(b.dataset.id)});
}
function showPanel(id){
  document.querySelectorAll('.panel').forEach(p=>p.classList.toggle('active',p.id===id));
  document.querySelectorAll('.tab').forEach(t=>t.classList.toggle('active',t.dataset.tab===id));
  window.scrollTo({top:0,behavior:'smooth'});
}
document.querySelectorAll('.tab').forEach(t=>t.onclick=()=>showPanel(t.dataset.tab));
$('#backBtn').onclick=()=>showPanel('learn');$('#search').oninput=renderList;
function startWeekTest(){
  quizItems=[...reviewQuestions].sort(()=>Math.random()-.5);quizIndex=0;quizScore=0;showPanel('quiz');showQuestion();
}
$('#newQuiz').onclick=startWeekTest;$('#weekTestBtn').onclick=startWeekTest;
function showQuestion(){
  if(quizIndex>=quizItems.length){
    state.lastScore=Math.round(quizScore/quizItems.length*100);save();
    $('#quizArea').innerHTML=`<h3>Hoàn thành bài kiểm tra Tuần 1</h3><p>Bạn trả lời đúng <b>${quizScore}/${quizItems.length}</b> câu (${state.lastScore}%).</p><p class="muted">Hãy xem lại những mẫu chưa chắc chắn rồi làm lại bài kiểm tra.</p><button class="primary" id="retryQuiz">Làm lại bài kiểm tra</button>`;
    $('#retryQuiz').onclick=startWeekTest;return;
  }
  const q=quizItems[quizIndex],opts=[...q.options].sort(()=>Math.random()-.5);
  $('#quizArea').innerHTML=`<span class="eyebrow">CÂU ${quizIndex+1}/${quizItems.length}</span><h3>Chọn mẫu ngữ pháp phù hợp để hoàn thành câu:</h3><p class="jp">${q.question}</p>${opts.map(o=>`<button class="option" data-option="${o}">${o}</button>`).join('')}<div id="quizFeedback"></div>`;
  document.querySelectorAll('.option').forEach(b=>b.onclick=()=>{
    document.querySelectorAll('.option').forEach(v=>v.disabled=true);
    const ok=b.dataset.option===q.answer;if(ok){quizScore++;b.classList.add('correct')}
    else{b.classList.add('wrong');document.querySelectorAll('.option').forEach(v=>{if(v.dataset.option===q.answer)v.classList.add('correct')})}
    $('#quizFeedback').innerHTML=`<div class="feedback"><b>${ok?'Chính xác.':'Chưa chính xác.'}</b><p>${q.explanation}</p><div class="quiz-example"><b>Ví dụ:</b><p class="jp">${q.example}</p><button type="button" class="audio-btn" id="quizSpeak">🔊 Nghe câu ví dụ</button></div><button class="primary" id="nextQ">Câu tiếp theo</button></div>`;
    $('#quizSpeak').onclick=()=>speakJapanese(q.example);
    $('#nextQ').onclick=()=>{quizIndex++;showQuestion()};
  });
}
$('#exportBtn').onclick=()=>{
  const blob=new Blob([JSON.stringify(state,null,2)],{type:'application/json'}),a=document.createElement('a');
  a.href=URL.createObjectURL(blob);a.download='jlpt-n1-progress.json';a.click();URL.revokeObjectURL(a.href);
};
$('#importFile').onchange=async e=>{
  try{
    const x=JSON.parse(await e.target.files[0].text());if(!Array.isArray(x.done)||!Array.isArray(x.seen))throw Error();
    const valid=new Set(lessons.map(v=>v.id));state={...state,...x};
    state.done=state.done.filter(id=>valid.has(id));state.seen=state.seen.filter(id=>valid.has(id));
    state.reviews=Object.fromEntries(Object.entries(state.reviews||{}).filter(([id])=>valid.has(id)));
    save();render();alert('Đã nhập tiến độ.');
  }catch(err){alert('Tệp sao lưu không hợp lệ.')}
};
let installPrompt=null;
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();installPrompt=e;$('#installBtn').hidden=false});
$('#installBtn').onclick=async()=>{
  if(installPrompt){installPrompt.prompt();await installPrompt.userChoice;installPrompt=null;$('#installBtn').hidden=true}
  else alert('Trên iPhone: mở bằng Safari → Chia sẻ → Thêm vào Màn hình chính.');
};
init();