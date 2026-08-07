  /* ---------- 병원 소개 / 오시는 길 / 주차 안내 (다국어 · 끗한의원 방식) ---------- */
  const INTRO_SECS = [['intro','병원 소개'],['way','오시는 길'],['parking','주차 안내']];
  const INTRO_LANGS = [['ko','KO'],['en','EN'],['ja','JA'],['zh','ZH'],['th','TH']];
  let _introImg = '', _introSec = 'intro', _introLang = 'ko', _introDraft = null;
  function introDraftInit(){
    if(_introDraft) return;
    const cur = Object.assign({body:'', img:'', ml:{}, way:{}, parking:{}}, KK.get('intro', {}));
    _introDraft = {
      intro: { ko:cur.body||'', en:(cur.ml||{}).en||'', ja:(cur.ml||{}).ja||'', zh:(cur.ml||{}).zh||'', th:(cur.ml||{}).th||'' },
      way: Object.assign({ko:'',en:'',ja:'',zh:'',th:''}, cur.way||{}),
      parking: Object.assign({ko:'',en:'',ja:'',zh:'',th:''}, cur.parking||{}),
    };
    _introImg = cur.img||'';
  }
  function introStash(){
    const ed = document.getElementById('inBody');
    if(ed) _introDraft[_introSec][_introLang] = ed.innerHTML;
  }
  function introLoad(){
    const ed = document.getElementById('inBody');
    if(ed) ed.innerHTML = _introDraft[_introSec][_introLang]||'';
    document.querySelectorAll('#view-intro .inSecTab').forEach(b=>{
      b.style.cssText = b.dataset.sec===_introSec ? 'background:var(--side);color:#fff' : 'background:var(--panel);border:1px solid var(--border);color:var(--text-soft)';
    });
    document.querySelectorAll('#view-intro .inLangTab').forEach(b=>{
      b.style.cssText = b.dataset.lang===_introLang ? 'background:var(--side);color:#fff' : 'background:var(--panel);border:1px solid var(--border);color:var(--text-soft)';
    });
    const wrap = document.getElementById('inImgWrap');
    if(wrap) wrap.style.display = _introSec==='intro' ? '' : 'none';
    const nm = document.getElementById('inSecName');
    if(nm){ const f=INTRO_SECS.find(s=>s[0]===_introSec); nm.textContent = (f?f[1]:'') + ' · ' + _introLang.toUpperCase(); }
  }
  function pickIntroSec(s){ introStash(); _introSec=s; introLoad(); }
  function pickIntroLang(l){ introStash(); _introLang=l; introLoad(); }
  function introDirty(on){
    const b = document.getElementById('introBadge');
    if(!b) return;
    b.innerHTML = on
      ? '<span class="w-1.5 h-1.5 rounded-full" style="background:#d97706"></span> <i>변경 사항 있음</i> — 저장하기를 눌러야 반영됩니다'
      : '<span class="w-1.5 h-1.5 rounded-full" style="background:var(--good)"></span> 모든 변경사항 저장됨';
    b.style.color = on ? '#b45309' : 'var(--good)';
  }
  function introKoFill(){
    if(_introLang==='ko'){ toast('KO 탭에서는 사용할 수 없습니다. EN/JA/ZH/TH 탭에서 눌러주세요.', false); return; }
    introStash();
    const cur = (_introDraft[_introSec][_introLang]||'').replace(/<[^>]*>/g,'').trim();
    if(cur){ toast('이미 내용이 있습니다. 지우고 다시 눌러주세요.', false); return; }
    if(!(_introDraft[_introSec].ko||'').trim()){ toast('복사할 한국어 내용이 없습니다.', false); return; }
    _introDraft[_introSec][_introLang] = _introDraft[_introSec].ko;
    introLoad();
    introDirty(true);
    toast('한국어 내용을 복사했습니다. 번역문으로 수정 후 저장하세요.');
  }
  function toggleIntroHelp(){
    const box=document.getElementById('inHelpBody'), btn=document.getElementById('inHelpBtn');
    const open=box.style.display==='none';
    box.style.display=open?'':'none';
    btn.textContent=open?'닫기':'보기';
  }
  function renderIntroImgPreview(){
    const box = document.getElementById('inImgPreview');
    if(!box) return;
    box.innerHTML = _introImg
      ? `<img src="${_introImg}" style="width:100%;height:100%;object-fit:cover;display:block" alt="">`
      : `<div class="text-center px-2"><iconify-icon icon="solar:gallery-linear" width="24" style="color:var(--muted)"></iconify-icon><p class="text-[11px] mt-1" style="color:var(--muted)">사진 없음 (기본 사진 사용)</p></div>`;
  }
  function clearIntroImg(){ _introImg=''; renderIntroImgPreview(); introDirty(true); }
  async function handleIntroImage(input){
    const file = input.files && input.files[0];
    if(!file) return;
    if(typeof window.uploadImage !== 'function'){ toast('이미지 업로드 기능을 사용할 수 없습니다. (Supabase 연결 확인)', false); input.value=''; return; }
    const btn = document.getElementById('inImgBtn');
    const prev = btn.innerHTML; btn.innerHTML='업로드 중…'; btn.disabled=true;
    try{
      const url = await window.uploadImage(file);
      _introImg = url; renderIntroImgPreview();
      introDirty(true);
      toast('사진이 업로드됐습니다. 「저장하기」를 눌러야 홈에 반영됩니다.');
    }catch(e){
      console.error(e); toast('이미지 업로드 실패: '+((e&&e.message)||e), false);
    }finally{
      btn.innerHTML=prev; btn.disabled=false; input.value='';
    }
  }
  function inFocus(){
    const ed = document.getElementById('inBody');
    const s = window.getSelection();
    if(s.rangeCount && ed.contains(s.anchorNode)) return;
    ed.focus();
    const r = document.createRange();
    r.selectNodeContents(ed); r.collapse(false);
    s.removeAllRanges(); s.addRange(r);
  }
  function inCmd(c){
    inFocus();
    if(c==='bold') document.execCommand('bold');
    else if(c==='h3') document.execCommand('formatBlock', false, '<h3>');
    else if(c==='p') document.execCommand('formatBlock', false, '<p>');
    else if(c==='hr') document.execCommand('insertHorizontalRule');
  }
  async function handleIntroBodyImage(input){
    const file = input.files && input.files[0];
    if(!file) return;
    if(typeof window.uploadImage !== 'function'){ toast('이미지 업로드 기능을 사용할 수 없습니다. (Supabase 연결 확인)', false); input.value=''; return; }
    toast('본문 사진 업로드 중…');
    try{
      const url = await window.uploadImage(file);
      inFocus();
      document.execCommand('insertHTML', false, '<img src="'+url+'" alt=""><p><br></p>');
      introDirty(true);
      toast('본문에 사진을 넣었습니다.');
    }catch(e){
      console.error(e); toast('이미지 업로드 실패: '+((e&&e.message)||e), false);
    }finally{
      input.value='';
    }
  }
  function saveIntro(){
    introStash();
    const clean = v=>{ v=(v||'').trim(); return (v==='<br>'||v==='<p><br></p>')?'':v; };
    const secObj = k=>{ const o={}; ['ko','en','ja','zh','th'].forEach(l=>{ const v=clean(_introDraft[k][l]); if(v) o[l]=v; }); return o; };
    const intro=secObj('intro'), way=secObj('way'), parking=secObj('parking');
    const ml={}; ['en','ja','zh','th'].forEach(l=>{ if(intro[l]) ml[l]=intro[l]; });
    KK.set('intro', { img:_introImg||'', body:intro.ko||'', ml:ml, way:way, parking:parking });
    introDirty(false);
    toast(STORAGE_OK? '저장됐습니다. 홈페이지 「병원 소개」와 「오시는 길」에 반영됩니다.' : '미리보기 환경에선 저장이 제한됩니다.', STORAGE_OK);
  }
  BUILDERS.intro = function(){
    kkModalCss();
    introDraftInit();
    const secTabs = INTRO_SECS.map(([k,l])=>
      `<button onclick="pickIntroSec('${k}')" data-sec="${k}" class="inSecTab px-3.5 h-9 rounded-full text-[13px] font-bold" style="${k===_introSec?'background:var(--side);color:#fff':'background:var(--panel);border:1px solid var(--border);color:var(--text-soft)'}">${l}</button>`).join('');
    const langTabs = INTRO_LANGS.map(([c,l])=>
      `<button onclick="pickIntroLang('${c}')" data-lang="${c}" class="inLangTab px-3 h-9 rounded-lg text-[12.5px] font-bold" style="${c===_introLang?'background:var(--side);color:#fff':'background:var(--panel);border:1px solid var(--border);color:var(--text-soft)'}">${l}</button>`).join('');
    const right = `
      <div class="flex items-center gap-1.5">${secTabs}</div>
      <div class="flex items-center gap-1.5">${langTabs}</div>
      <button onclick="introKoFill()" class="px-3 h-9 rounded-lg text-[13px] font-semibold" style="background:var(--accent-soft);color:var(--accent-strong)">✦ KO → 빈칸</button>
      <button onclick="saveIntro()" class="px-4 h-9 rounded-lg text-[13px] font-semibold flex items-center gap-1.5 btn-gold"><iconify-icon icon="solar:upload-minimalistic-linear" width="15"></iconify-icon> 저장하기</button>`;
    const helpBox = `
      <div class="rounded-xl mb-5" style="background:var(--panel);border:1px solid var(--border)">
        <div class="px-5 py-3.5 flex items-center gap-3">
          <span class="text-[13.5px] font-bold">처음이라면 사용법 보기</span>
          <span class="text-[13px]" style="color:var(--muted)">병원 소개, 오시는 길, 주차 안내 텍스트와 이미지를 관리합니다.</span>
          <button id="inHelpBtn" onclick="toggleIntroHelp()" class="ml-auto px-4 h-8 rounded-full text-[12.5px] font-bold text-white" style="background:var(--side)">보기</button>
        </div>
        <div id="inHelpBody" style="display:none;border-top:1px solid var(--border-soft)" class="px-6 py-4">
          <ol class="list-decimal pl-4 space-y-1.5 text-[13.5px]" style="color:var(--text-soft)">
            <li>상단 탭으로 <b style="color:var(--text)">병원 소개 / 오시는 길 / 주차 안내</b> 섹션을 전환합니다.</li>
            <li>다국어는 언어 탭(KO/EN/JA 등)을 전환하며 언어별로 내용을 입력합니다. 비워두면 홈에서 한국어로 표시됩니다.</li>
            <li>사진 업로드·「본문 사진 넣기」 후 텍스트를 수정하고 <b style="color:var(--text)">저장하기</b>를 클릭합니다.</li>
            <li>저장하지 않으면 변경 내용이 사라집니다 — 상단에 <i>변경 사항 있음</i>이 뜨면 저장을 잊지 마세요.</li>
          </ol>
        </div>
      </div>`;
    const el = makeView('intro');
    el.innerHTML = pageHead('병원 소개 / 오시는 길 / 주차 안내 (다국어)',
      '<span id="introBadge" class="inline-flex items-center gap-1.5 text-[12.5px] font-semibold" style="color:var(--good)"><span class="w-1.5 h-1.5 rounded-full" style="background:var(--good)"></span> 모든 변경사항 저장됨</span>',
      right) +
      helpBox +
      `<div class="panel rounded-2xl p-6">
        <p class="text-[13px] mb-4" style="color:var(--accent-strong)">지금 편집 중: <b id="inSecName"></b> — 병원 소개는 홈 「병원 소개」 섹션에, 오시는 길·주차 안내는 홈 「LOCATION(오시는 길)」에 표시됩니다.</p>
        <div class="grid lg:grid-cols-[240px_1fr] gap-7">
          <div id="inImgWrap">
            <label class="pml">병원 소개 사진</label>
            <div id="inImgPreview" class="w-full h-48 rounded-xl overflow-hidden grid place-items-center" style="background:var(--panel-soft);border:1px solid var(--border)"></div>
            <button id="inImgBtn" onclick="document.getElementById('inImgFile').click()" class="mt-2 w-full py-2 rounded-lg text-[12.5px] font-semibold btn-gold">사진 업로드</button>
            <button onclick="clearIntroImg()" class="mt-1 w-full py-1.5 rounded-lg text-[11.5px]" style="background:var(--panel-soft);border:1px solid var(--border);color:var(--text-soft)">사진 제거</button>
            <input id="inImgFile" type="file" accept="image/*" class="hidden" onchange="handleIntroImage(this)">
            <p class="text-[11.5px] mt-2 break-keep" style="color:var(--muted)">홈 「병원 소개」의 왼쪽 큰 사진이 이 사진으로 바뀝니다. (모든 언어 공통)</p>
          </div>
          <div>
            <div class="flex flex-wrap items-center gap-1.5 mb-1.5">
              <button class="ntTb" onclick="inCmd('bold')"><b>굵게</b></button>
              <button class="ntTb" onclick="inCmd('h3')">소제목</button>
              <button class="ntTb" onclick="inCmd('p')">본문 글</button>
              <button class="ntTb" onclick="inCmd('hr')">구분선</button>
              <button class="ntTb" style="background:var(--accent-soft);color:var(--accent-strong);border-color:var(--accent)" onclick="document.getElementById('inBodyImgFile').click()">🖼 본문 사진 넣기</button>
              <input id="inBodyImgFile" type="file" accept="image/*" class="hidden" onchange="handleIntroBodyImage(this)">
            </div>
            <div id="inBody" contenteditable="true"></div>
            <p class="text-[11.5px] mt-1.5" style="color:var(--muted)">내용을 입력하세요. 비워두고 저장하면 해당 섹션은 홈에서 숨겨지거나 기본 문구가 표시됩니다.</p>
          </div>
        </div>
      </div>`;
    renderIntroImgPreview();
    introLoad();
    el.addEventListener('input', function(e){
      if(e.target && e.target.id==='inBody') introDirty(true);
    });
  };
