  /* ---------- 팝업 관리 (운영/설정) ----------
     저장 키: KK 'popups' → Supabase site_kv 'popups' → 홈페이지 첫 화면 팝업(index.html 「팝업 노출」)
     항목: {title, link, img, on, order, period, start, end, date}
     모든 조작(공개 전환·순서·저장·교체·삭제·기간)은 누르는 즉시 저장되어 홈페이지에 반영됩니다. */
  const ppEsc = v => String(v==null?'':v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/"/g,'&quot;');
  function ppList(){ return (KK.get('popups', [])||[]).slice().sort((a,b)=>(a.order||0)-(b.order||0)); }
  function ppSave(list, msg){
    list.forEach((p,i)=>{ p.order = i; });
    KK.set('popups', list);
    if(msg) toast(STORAGE_OK ? msg : '미리보기 환경에선 저장이 제한됩니다.', STORAGE_OK);
  }
  function ppLink(v){
    v = String(v||'').trim();
    if(v && !/^https?:\/\//i.test(v) && v.indexOf('#')!==0) v = 'https://'+v;
    return v;
  }
  function ppStatus(p){
    if(p.on===false) return ['숨김','var(--muted)'];
    if(p.period){
      const now = Date.now();
      if(p.start && now < new Date(p.start).getTime()) return ['시작 전','#b8935a'];
      if(p.end && now > new Date(p.end).getTime()) return ['기간 끝남','var(--bad)'];
    }
    return ['홈페이지 노출 중','#1f9d6b'];
  }
  function rerenderPopups(){
    const y = window.scrollY;   /* 저장 후에도 보던 위치 그대로 */
    const old = document.getElementById('view-popups');
    if(old) old.remove();
    BUILDERS.popups();
    go('popups');
    window.scrollTo(0, y);
  }

  /* ----- 카드 조작 ----- */
  function popupToggle(i, on){
    const l = ppList(); if(!l[i]) return;
    l[i].on = on; ppSave(l, on ? '팝업을 공개했습니다. 홈페이지에 바로 보입니다.' : '팝업을 숨겼습니다.');
    rerenderPopups();
  }
  function popupSaveField(i, field){
    const l = ppList(); if(!l[i]) return;
    const inp = document.querySelector(`#view-popups [data-poprow="${i}"] [data-ppf="${field}"]`);
    let v = inp ? inp.value.trim() : '';
    if(field==='title' && !v){ toast('제목을 입력해주세요.', false); return; }
    if(field==='link') v = ppLink(v);
    l[i][field] = v; ppSave(l, field==='title' ? '제목을 저장했습니다.' : (v ? '링크를 저장했습니다.' : '링크를 지웠습니다. (클릭해도 이동 없음)'));
    rerenderPopups();
  }
  function popupMove(i, to){
    const l = ppList();
    to = Math.max(0, Math.min(l.length-1, to));
    if(!l[i] || to===i) { rerenderPopups(); return; }
    const [it] = l.splice(i,1); l.splice(to,0,it);
    ppSave(l, '순서를 바꿨습니다.');
    rerenderPopups();
  }
  function popupPeriod(i){
    const l = ppList(); if(!l[i]) return;
    const c = document.querySelector(`#view-popups [data-poprow="${i}"]`);
    l[i].period = c.querySelector('[data-ppf="period"]').checked;
    l[i].start  = c.querySelector('[data-ppf="start"]').value;
    l[i].end    = c.querySelector('[data-ppf="end"]').value;
    if(l[i].period && l[i].start && l[i].end && l[i].start > l[i].end){ toast('종료일이 시작일보다 빠릅니다.', false); return; }
    ppSave(l, l[i].period ? '노출 기간을 저장했습니다.' : '기간 제한을 껐습니다. (항상 노출)');
    rerenderPopups();
  }
  function deletePopup(i){
    const l = ppList(); const p = l[i]; if(!p) return;
    if(!confirm('「'+(p.title||'이 팝업')+'」 팝업을 삭제할까요?\n삭제하면 되돌릴 수 없습니다.')) return;
    l.splice(i,1); ppSave(l, '팝업을 삭제했습니다.');
    rerenderPopups();
  }
  async function handlePopupImage(input, i){
    const file = input.files && input.files[0];
    if(!file) return;
    if(typeof window.uploadImage !== 'function'){ toast('이미지 업로드 기능을 사용할 수 없습니다. (Supabase 연결 확인)', false); input.value=''; return; }
    toast('이미지 업로드 중…');
    try{
      const url = await window.uploadImage(file);
      const l = ppList(); if(l[i]) l[i].img = url;
      ppSave(l, '팝업 이미지를 교체했습니다.');
      rerenderPopups();
    }catch(e){
      console.error(e); toast('이미지 업로드 실패: '+((e&&e.message)||e), false);
    }finally{ input.value=''; }
  }
  /* 드래그로 순서 바꾸기 */
  let _ppDrag = -1;
  function ppDragStart(e, i){ _ppDrag = i; e.dataTransfer.effectAllowed='move'; try{ e.dataTransfer.setData('text/plain', String(i)); }catch(_){} }
  function ppDragOver(e){ if(_ppDrag<0) return; e.preventDefault(); e.currentTarget.style.outline='2px dashed var(--accent)'; }
  function ppDragLeave(e){ e.currentTarget.style.outline=''; }
  function ppDrop(e, i){ e.preventDefault(); e.currentTarget.style.outline=''; const from=_ppDrag; _ppDrag=-1; if(from>=0 && from!==i) popupMove(from, i); }

  /* ----- 새 팝업 등록 폼 ----- */
  let _npImg = '';
  function renderNpPrev(){
    const box = document.getElementById('npImgPrev');
    if(!box) return;
    box.innerHTML = _npImg
      ? `<img src="${ppEsc(_npImg)}" style="width:100%;height:100%;object-fit:cover;display:block" alt="">`
      : `<span class="text-[11.5px] text-center leading-snug" style="color:var(--muted)">미리보기<br>600×800</span>`;
    const nm = document.getElementById('npImgName');
    if(nm) nm.textContent = _npImg ? '업로드 완료' : '선택된 파일 없음';
  }
  async function handleNewPopupImage(input){
    const file = input.files && input.files[0];
    if(!file) return;
    if(typeof window.uploadImage !== 'function'){ toast('이미지 업로드 기능을 사용할 수 없습니다. (Supabase 연결 확인)', false); input.value=''; return; }
    const nm = document.getElementById('npImgName'); if(nm) nm.textContent='업로드 중…';
    try{
      _npImg = await window.uploadImage(file); renderNpPrev();
      toast('이미지가 올라갔습니다. 「팝업 등록」을 눌러 마무리하세요.');
    }catch(e){
      console.error(e); toast('이미지 업로드 실패: '+((e&&e.message)||e), false); renderNpPrev();
    }finally{ input.value=''; }
  }
  function npPeriodToggle(cb){ document.getElementById('npDates').style.display = cb.checked ? '' : 'none'; }
  function addPopup(){
    const title = document.getElementById('npTitle').value.trim();
    const link = ppLink(document.getElementById('npLink').value);
    const period = document.getElementById('npPeriod').checked;
    const start = document.getElementById('npStart').value, end = document.getElementById('npEnd').value;
    if(!title){ toast('팝업 제목을 입력해주세요.', false); return; }
    if(!_npImg){ toast('팝업 이미지를 올려주세요.', false); return; }
    if(period && start && end && start > end){ toast('종료일이 시작일보다 빠릅니다.', false); return; }
    const l = ppList();
    const d = new Date();
    l.unshift({ title, link, img:_npImg, on:true, period, start, end,
      date: d.getFullYear()+'. '+(d.getMonth()+1)+'. '+d.getDate()+'.' });
    ppSave(l, '팝업을 등록했습니다. 홈페이지 첫 화면에 바로 보입니다.');
    _npImg='';
    rerenderPopups();
  }
  function togglePopupHelp(){
    const box=document.getElementById('popHelpBody'), btn=document.getElementById('popHelpBtn');
    const open=box.style.display==='none';
    box.style.display=open?'':'none';
    btn.textContent=open?'닫기':'보기';
  }

  BUILDERS.popups = function(){
    kkModalCss();
    if(!document.getElementById('ppCss')){
      const st=document.createElement('style'); st.id='ppCss';
      st.textContent='.ppSw{position:relative;display:inline-block;width:40px;height:22px;flex-shrink:0;cursor:pointer}.ppSw input{opacity:0;width:0;height:0;position:absolute}.ppSw span{position:absolute;inset:0;border-radius:999px;background:#cfc8bd;transition:.2s}.ppSw span:before{content:"";position:absolute;width:16px;height:16px;left:3px;top:3px;border-radius:50%;background:#fff;box-shadow:0 1px 2px rgba(0,0,0,.25);transition:.2s}.ppSw input:checked+span{background:#1fae78}.ppSw input:checked+span:before{transform:translateX(18px)}.ppSw input:focus-visible+span{outline:2px solid var(--accent);outline-offset:2px}'
        +'.ppBtn{height:34px;padding:0 14px;border-radius:999px;font-size:12.5px;font-weight:700;white-space:nowrap}.ppSq{width:30px;height:30px;border-radius:8px;display:grid;place-items:center;background:var(--panel);border:1px solid var(--border);color:var(--text-soft)}.ppSq:disabled{opacity:.35}.ppSq:not(:disabled):hover{border-color:var(--accent);color:var(--accent-strong)}'
        +'.ppCard[draggable=true]:active{cursor:grabbing}.ppGrip{cursor:grab;color:var(--muted);letter-spacing:-2px;font-weight:900;user-select:none}';
      document.head.appendChild(st);
    }
    const popups = ppList();
    const total = popups.length;
    const live = popups.filter(p=>ppStatus(p)[0]==='홈페이지 노출 중').length;
    const el = makeView('popups');
    const helpBox=`
      <div class="rounded-xl mb-5" style="background:var(--panel);border:1px solid var(--border)">
        <div class="px-5 py-3.5 flex flex-wrap items-center gap-x-3 gap-y-1">
          <span class="text-[13.5px] font-bold">처음이라면 사용법 보기</span>
          <span class="text-[13px]" style="color:var(--muted)">팝업 등록 및 관리 방법 안내</span>
          <button id="popHelpBtn" onclick="togglePopupHelp()" class="ml-auto px-4 h-8 rounded-full text-[12.5px] font-bold text-white" style="background:var(--side)">보기</button>
        </div>
        <div id="popHelpBody" style="display:none;border-top:1px solid var(--border-soft)" class="px-6 py-4">
          <ol class="list-decimal pl-4 space-y-1.5 text-[13.5px]" style="color:var(--text-soft)">
            <li>아래 「새 팝업 등록」에서 제목·이미지(링크는 선택)를 넣고 <b style="color:var(--text)">팝업 등록</b>을 누릅니다.</li>
            <li>등록된 팝업은 카드로 보이며, 오른쪽 위 <b style="color:var(--text)">스위치</b>로 공개/숨김, <b style="color:var(--text)">휴지통</b>으로 삭제합니다.</li>
            <li>카드를 <b style="color:var(--text)">끌어서 놓거나</b> ↑↓ 버튼으로 노출 순서를 바꿉니다. 1번이 가장 먼저 보입니다.</li>
            <li><b style="color:var(--text)">기간 제한</b>을 켜고 시작·종료를 정하면 그 기간에만 보입니다. (예: 추석 연휴 안내)</li>
            <li>모든 변경은 <b style="color:var(--text)">누르는 즉시 저장</b>되고 홈페이지에 바로 반영됩니다. 손님이 「오늘 하루 보지 않기」를 누르면 그날은 다시 뜨지 않습니다.</li>
          </ol>
        </div>
      </div>`;
    const sizeBox=`
      <div class="rounded-xl mb-5 px-5 py-4 flex gap-3" style="background:#a47b3c;color:#fff">
        <iconify-icon icon="solar:info-circle-linear" width="18" class="shrink-0 mt-0.5"></iconify-icon>
        <div class="text-[13px] leading-relaxed">
          <p class="font-bold text-[14px] mb-1">이미지 권장 사이즈 안내</p>
          <p>팝업은 <b>가로 600 × 세로 800 px</b> 비율(3:4)로 보여집니다.</p>
          <p style="opacity:.85">비율이 다른 이미지는 위아래나 좌우에 여백이 생길 수 있으니, <b>600 × 800 px</b> 기준으로 만들어 주세요. (JPG·PNG, 1MB 이하 권장)</p>
        </div>
      </div>`;
    const newForm=`
      <div class="panel rounded-2xl mb-6 overflow-hidden">
        <div class="px-5 py-3.5 font-bold text-[14.5px]" style="background:var(--panel-soft);border-bottom:1px solid var(--border)">새 팝업 등록</div>
        <div class="p-5 grid md:grid-cols-[120px_1fr] gap-5">
          <div id="npImgPrev" class="w-[120px] aspect-[3/4] rounded-xl overflow-hidden grid place-items-center" style="background:var(--panel-soft);border:1px dashed var(--border)"></div>
          <div class="space-y-3.5 min-w-0">
            <div class="grid sm:grid-cols-2 gap-3">
              <div><label class="pml">제목 <span style="color:var(--bad)">*</span></label><input id="npTitle" class="pmi" placeholder="예) 10월 휴진 안내"></div>
              <div><label class="pml">링크 URL <span style="color:var(--muted);font-weight:400">선택</span></label><input id="npLink" class="pmi" placeholder="클릭 시 이동할 주소 (비워두면 이동 없음)"></div>
            </div>
            <div>
              <label class="pml">이미지 <span style="color:var(--bad)">*</span> <b style="color:var(--text)">권장 600 × 800 px</b></label>
              <div class="flex items-center gap-2.5">
                <button onclick="document.getElementById('npImgFile').click()" class="ppBtn btn-gold">파일 선택</button>
                <span id="npImgName" class="text-[13px]" style="color:var(--muted)">선택된 파일 없음</span>
                <input id="npImgFile" type="file" accept="image/*" class="hidden" onchange="handleNewPopupImage(this)">
              </div>
            </div>
            <div class="rounded-xl px-4 py-3" style="background:var(--panel-soft);border:1px solid var(--border)">
              <label class="flex items-center gap-2.5 text-[13.5px] font-semibold"><span class="ppSw"><input id="npPeriod" type="checkbox" onchange="npPeriodToggle(this)"><span></span></span> 기간 제한 사용</label>
              <div id="npDates" style="display:none" class="flex flex-wrap items-center gap-2 mt-3">
                <input id="npStart" type="datetime-local" class="pmi" style="width:auto">
                <span style="color:var(--muted)">~</span>
                <input id="npEnd" type="datetime-local" class="pmi" style="width:auto">
              </div>
            </div>
            <div class="flex justify-end"><button onclick="addPopup()" class="ppBtn btn-gold" style="height:40px;padding:0 22px;font-size:13.5px">팝업 등록</button></div>
          </div>
        </div>
      </div>`;
    const card = (p,i)=>{
      const [st, stc] = ppStatus(p);
      return `
      <div class="ppCard panel rounded-2xl overflow-hidden flex flex-col" data-poprow="${i}" draggable="true"
           ondragstart="ppDragStart(event,${i})" ondragover="ppDragOver(event)" ondragleave="ppDragLeave(event)" ondrop="ppDrop(event,${i})">
        <div class="px-4 py-3 flex items-center gap-2.5" style="background:var(--panel-soft);border-bottom:1px solid var(--border)">
          <span class="ppGrip" title="끌어서 순서 변경">⋮⋮</span>
          <span class="font-bold text-[14.5px] truncate min-w-0">${ppEsc(p.title)}</span>
          <label class="ppSw ml-auto" title="${p.on!==false?'공개 중 (누르면 숨김)':'숨김 (누르면 공개)'}"><input type="checkbox" ${p.on!==false?'checked':''} onchange="popupToggle(${i}, this.checked)"><span></span></label>
          <button onclick="deletePopup(${i})" title="삭제" class="w-7 h-7 grid place-items-center shrink-0" style="color:var(--bad)"><iconify-icon icon="solar:trash-bin-trash-linear" width="17"></iconify-icon></button>
        </div>
        <div class="p-4 flex-1 flex flex-col gap-3">
          <div class="rounded-xl overflow-hidden aspect-[3/4] w-full" style="background:var(--panel-soft);border:1px solid var(--border)${p.on===false?';opacity:.45':''}">
            ${p.img ? `<img src="${ppEsc(p.img)}" loading="lazy" draggable="false" style="width:100%;height:100%;object-fit:cover;display:block" alt="">`
                    : `<div class="w-full h-full grid place-items-center text-[12px]" style="color:var(--muted)">이미지 없음</div>`}
          </div>
          <div class="flex items-center justify-between text-[12px]">
            <span style="color:var(--muted)">등록일 ${ppEsc(p.date||'-')}</span>
            <span class="font-bold" style="color:${stc}">● ${st}</span>
          </div>
          <div class="rounded-xl p-3 space-y-2" style="background:var(--panel-soft);border:1px solid var(--border)">
            <div class="flex gap-2"><input data-ppf="title" value="${ppEsc(p.title)}" class="pmi" style="background:var(--panel)" onkeydown="if(event.key==='Enter')popupSaveField(${i},'title')"><button onclick="popupSaveField(${i},'title')" class="ppBtn btn-gold">저장</button></div>
            <div class="flex gap-2"><input data-ppf="link" value="${ppEsc(p.link)}" placeholder="링크 (클릭 시 이동, 선택)" class="pmi" style="background:var(--panel)" onkeydown="if(event.key==='Enter')popupSaveField(${i},'link')"><button onclick="popupSaveField(${i},'link')" class="ppBtn btn-gold">저장</button></div>
            <div class="flex items-center gap-2"><span class="flex-1 text-[12.5px] truncate" style="color:var(--muted)">이미지 바꾸기 (600×800)</span><button onclick="document.getElementById('popImgFile${i}').click()" class="ppBtn btn-gold">교체</button>
              <input id="popImgFile${i}" type="file" accept="image/*" class="hidden" onchange="handlePopupImage(this, ${i})"></div>
          </div>
          <div class="flex items-center gap-2 text-[12.5px]" style="color:var(--text-soft)">
            <span>순서</span>
            <button class="ppSq" onclick="popupMove(${i},${i-1})" ${i===0?'disabled':''} title="앞으로"><iconify-icon icon="solar:arrow-up-linear" width="15"></iconify-icon></button>
            <button class="ppSq" onclick="popupMove(${i},${i+1})" ${i===total-1?'disabled':''} title="뒤로"><iconify-icon icon="solar:arrow-down-linear" width="15"></iconify-icon></button>
            <input value="${i+1}" class="w-12 h-[30px] rounded-lg text-center" style="background:var(--panel);border:1px solid var(--border);color:var(--text)" onchange="popupMove(${i}, (parseInt(this.value)||1)-1)">
            <span style="color:var(--muted)">/ ${total}</span>
          </div>
          <div class="rounded-xl px-3.5 py-3" style="background:var(--panel-soft);border:1px solid var(--border)">
            <label class="flex items-center gap-2.5 text-[13px] font-semibold"><span class="ppSw"><input type="checkbox" data-ppf="period" ${p.period?'checked':''} onchange="popupPeriod(${i})"><span></span></span> 기간 제한</label>
            <div class="${p.period?'':'hidden'} mt-2.5 space-y-1.5 text-[12px]" style="color:var(--muted)">
              <div class="flex items-center gap-2"><span class="w-7">시작</span><input data-ppf="start" type="datetime-local" value="${ppEsc(p.start)}" onchange="popupPeriod(${i})" class="flex-1 min-w-0 px-2 py-1.5 rounded-lg" style="background:var(--panel);border:1px solid var(--border);color:var(--text)"></div>
              <div class="flex items-center gap-2"><span class="w-7">종료</span><input data-ppf="end" type="datetime-local" value="${ppEsc(p.end)}" onchange="popupPeriod(${i})" class="flex-1 min-w-0 px-2 py-1.5 rounded-lg" style="background:var(--panel);border:1px solid var(--border);color:var(--text)"></div>
            </div>
          </div>
        </div>
      </div>`;
    };
    el.innerHTML = pageHead('팝업 관리','홈페이지 접속 시 표시되는 팝업 이미지를 관리합니다.',
        `<a href="/" target="_blank" rel="noopener" class="px-4 h-9 rounded-lg text-[13px] font-semibold flex items-center gap-1.5" style="background:var(--panel);border:1px solid var(--border);color:var(--text-soft)"><iconify-icon icon="solar:link-linear" width="15"></iconify-icon> 홈페이지에서 확인</a>`) +
      helpBox + sizeBox + newForm +
      `<p class="text-[14px] font-bold mb-3">등록된 팝업 <span class="font-normal text-[13px]" style="color:var(--muted)">(${total}개 · 노출 중 ${live}개)</span></p>` +
      (total ? `<div class="grid sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">${popups.map(card).join('')}</div>`
             : `<div class="panel rounded-2xl p-16 text-center" style="color:var(--muted)">등록된 팝업이 없습니다. 위에서 제목과 이미지를 넣고 「팝업 등록」을 눌러보세요.<br><span class="text-[12px]">팝업이 없으면 홈페이지에는 아무것도 뜨지 않습니다.</span></div>`);
    renderNpPrev();
  };
