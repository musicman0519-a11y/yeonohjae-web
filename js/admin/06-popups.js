  /* ---------- 팝업 관리 (이미지 업로드 + 기간 제한 → front 첫화면 팝업) ---------- */
  function popupsSyncInline(base){
    document.querySelectorAll('#view-popups [data-poprow]').forEach(c=>{
      const i = parseInt(c.dataset.poprow);
      if(!base[i]) return;
      const g = sel => c.querySelector(sel);
      if(g('[data-ppf="title"]')) base[i].title = g('[data-ppf="title"]').value.trim();
      if(g('[data-ppf="link"]'))  base[i].link  = g('[data-ppf="link"]').value.trim();
      if(g('[data-ppf="on"]'))    base[i].on    = g('[data-ppf="on"]').checked;
      if(g('[data-ppf="order"]')) base[i].order = parseInt(g('[data-ppf="order"]').value)||0;
      if(g('[data-ppf="period"]'))base[i].period= g('[data-ppf="period"]').checked;
      if(g('[data-ppf="start"]')) base[i].start = g('[data-ppf="start"]').value;
      if(g('[data-ppf="end"]'))   base[i].end   = g('[data-ppf="end"]').value;
    });
    return base;
  }
  function savePopups(){
    const base = popupsSyncInline(KK.get('popups', []));
    base.forEach(p=>{ if(p.link && !/^https?:\/\//i.test(p.link) && p.link.indexOf('#')!==0) p.link='https://'+p.link; });
    base.sort((a,b)=>(a.order||0)-(b.order||0));
    KK.set('popups', base);
    rerenderPopups();
    toast(STORAGE_OK? '팝업이 저장됐습니다. 홈페이지 첫 화면에 반영됩니다.' : '미리보기 환경에선 저장이 제한됩니다.', STORAGE_OK);
  }
  function rerenderPopups(){
    const old = document.getElementById('view-popups');
    if(old) old.remove();
    BUILDERS.popups();
    go('popups');
  }
  function deletePopup(i){
    const base = popupsSyncInline(KK.get('popups', []));
    const p = base[i]; if(!p) return;
    if(!confirm('「'+(p.title||'이 팝업')+'」 팝업을 삭제할까요?')) return;
    base.splice(i,1);
    KK.set('popups', base);
    rerenderPopups();
    toast('팝업을 삭제하고 저장했습니다.');
  }
  async function handlePopupImage(input, i){
    const file = input.files && input.files[0];
    if(!file) return;
    if(typeof window.uploadImage !== 'function'){ toast('이미지 업로드 기능을 사용할 수 없습니다. (Supabase 연결 확인)', false); input.value=''; return; }
    toast('이미지 업로드 중…');
    try{
      const url = await window.uploadImage(file);
      const base = popupsSyncInline(KK.get('popups', []));
      if(base[i]) base[i].img = url;
      KK.set('popups', base);
      rerenderPopups();
      toast('팝업 이미지를 교체하고 저장했습니다.');
    }catch(e){
      console.error(e); toast('이미지 업로드 실패: '+((e&&e.message)||e), false);
    }finally{
      input.value='';
    }
  }
  /* ----- 새 팝업 등록 폼 ----- */
  let _npImg = '';
  function renderNpPrev(){
    const box = document.getElementById('npImgPrev');
    if(!box) return;
    box.innerHTML = _npImg
      ? `<img src="${_npImg}" style="width:100%;height:100%;object-fit:cover;display:block" alt="">`
      : `<span class="text-[11px]" style="color:var(--muted)">팝업 이미지 *</span>`;
  }
  async function handleNewPopupImage(input){
    const file = input.files && input.files[0];
    if(!file) return;
    if(typeof window.uploadImage !== 'function'){ toast('이미지 업로드 기능을 사용할 수 없습니다. (Supabase 연결 확인)', false); input.value=''; return; }
    const btn = document.getElementById('npImgBtn');
    const prev = btn.innerHTML; btn.innerHTML='업로드 중…'; btn.disabled=true;
    try{
      const url = await window.uploadImage(file);
      _npImg = url; renderNpPrev();
      toast('이미지가 업로드됐습니다. 「팝업 등록」을 눌러 등록하세요.');
    }catch(e){
      console.error(e); toast('이미지 업로드 실패: '+((e&&e.message)||e), false);
    }finally{
      btn.innerHTML=prev; btn.disabled=false; input.value='';
    }
  }
  function addPopup(){
    const title = document.getElementById('npTitle').value.trim();
    let link = document.getElementById('npLink').value.trim();
    if(!title){ toast('팝업 제목을 입력해주세요.', false); return; }
    if(!_npImg){ toast('팝업 이미지를 업로드해주세요.', false); return; }
    if(link && !/^https?:\/\//i.test(link)) link='https://'+link;
    const base = popupsSyncInline(KK.get('popups', []));
    const d = new Date();
    base.push({
      title: title, link: link, img: _npImg,
      on: true,
      order: base.length,
      period: document.getElementById('npPeriod').checked,
      start: document.getElementById('npStart').value,
      end: document.getElementById('npEnd').value,
      date: d.getFullYear()+'. '+(d.getMonth()+1)+'. '+d.getDate()+'. '+(d.getHours()<12?'오전':'오후')+' '+((d.getHours()%12)||12)+':'+String(d.getMinutes()).padStart(2,'0'),
    });
    KK.set('popups', base);
    _npImg='';
    rerenderPopups();
    toast('팝업을 등록하고 저장했습니다. 홈페이지 첫 화면에 노출됩니다.');
  }
  function togglePopupHelp(){
    const box=document.getElementById('popHelpBody'), btn=document.getElementById('popHelpBtn');
    const open=box.style.display==='none';
    box.style.display=open?'':'none';
    btn.textContent=open?'닫기':'보기';
  }
  BUILDERS.popups = function(){
    kkModalCss();
    const popups = KK.get('popups', []);
    const el = makeView('popups');
    const helpBox=`
      <div class="rounded-xl mb-5" style="background:var(--panel);border:1px solid var(--border)">
        <div class="px-5 py-3.5 flex items-center gap-3">
          <span class="text-[13.5px] font-bold">처음이라면 사용법 보기</span>
          <span class="text-[13px]" style="color:var(--muted)">홈페이지 접속 시 표시되는 팝업 이미지를 관리합니다.</span>
          <button id="popHelpBtn" onclick="togglePopupHelp()" class="ml-auto px-4 h-8 rounded-full text-[12.5px] font-bold text-white" style="background:var(--side)">보기</button>
        </div>
        <div id="popHelpBody" style="display:none;border-top:1px solid var(--border-soft)" class="px-6 py-4">
          <ol class="list-decimal pl-4 space-y-1.5 text-[13.5px]" style="color:var(--text-soft)">
            <li>위 등록 칸에 <b style="color:var(--text)">제목·링크·이미지</b>를 넣고 「팝업 등록」을 누르면 아래로 카드가 추가됩니다.</li>
            <li><b style="color:var(--text)">링크</b>는 팝업을 클릭했을 때 이동할 주소입니다. 홈페이지 시술 페이지 주소나 네이버 블로그 글 주소를 붙여넣으세요. (비워두면 이동 없음)</li>
            <li>카드에서 제목·링크·공개·순서·기간을 수정한 뒤 우측 상단 <b style="color:var(--text)">전체 저장</b>을 누르면 반영됩니다. (이미지 교체·삭제는 즉시 저장)</li>
            <li><b style="color:var(--text)">기간 제한 사용</b>을 켜고 시작/종료를 정하면 그 기간에만 팝업이 노출됩니다. 순서 숫자가 작을수록 먼저 표시됩니다.</li>
          </ol>
        </div>
      </div>`;
    el.innerHTML = pageHead('팝업 관리','홈페이지 첫 화면 팝업을 등록·관리합니다.',
      `<button onclick="savePopups()" class="px-4 h-9 rounded-lg text-[13px] font-semibold btn-gold flex items-center gap-1.5"><iconify-icon icon="solar:upload-minimalistic-linear" width="15"></iconify-icon> 전체 저장 (홈 반영)</button>`) +
      helpBox +
      `<div class="panel rounded-2xl p-5 mb-5">
        <div class="grid lg:grid-cols-[110px_1fr_1fr_auto] gap-3 items-start">
          <div>
            <div id="npImgPrev" class="w-full h-[76px] rounded-lg overflow-hidden grid place-items-center" style="background:var(--panel-soft);border:1px solid var(--border)"></div>
            <button id="npImgBtn" onclick="document.getElementById('npImgFile').click()" class="mt-1.5 w-full py-1.5 rounded-lg text-[11.5px] font-semibold btn-gold">이미지 업로드</button>
            <input id="npImgFile" type="file" accept="image/*" class="hidden" onchange="handleNewPopupImage(this)">
          </div>
          <div>
            <label class="pml">제목 *</label>
            <input id="npTitle" class="pmi" placeholder="예) 여름 이벤트 팝업">
            <label class="flex items-center gap-2 text-[13px] mt-3" style="color:var(--text-soft)"><input id="npPeriod" type="checkbox" class="accent-[var(--accent)]"> 기간 제한 사용</label>
          </div>
          <div>
            <label class="pml">링크 (클릭 시 이동할 주소)</label>
            <input id="npLink" class="pmi" placeholder="예) https://yeonohjae-web.vercel.app/#category 또는 블로그 주소">
            <div class="flex items-center gap-2 mt-3">
              <input id="npStart" type="datetime-local" class="pmi" style="width:auto">
              <span style="color:var(--muted)">~</span>
              <input id="npEnd" type="datetime-local" class="pmi" style="width:auto">
            </div>
          </div>
          <button onclick="addPopup()" class="px-5 h-10 rounded-lg text-[13px] font-semibold btn-gold lg:mt-6">팝업 등록</button>
        </div>
      </div>
      ${popups.length ? `<div class="grid md:grid-cols-2 xl:grid-cols-3 gap-4">${popups.map((p,i)=>`
        <div class="panel rounded-2xl p-4" data-poprow="${i}">
          <div class="flex items-center justify-between mb-3">
            <span class="font-bold text-[15px] truncate">${p.title||''}</span>
            <button onclick="deletePopup(${i})" class="w-7 h-7 grid place-items-center shrink-0" style="color:var(--bad)"><iconify-icon icon="solar:trash-bin-trash-linear" width="16"></iconify-icon></button>
          </div>
          <div class="rounded-xl overflow-hidden mb-2" style="border:1px solid var(--border)">
            ${p.img
              ? `<div style="height:190px;overflow:hidden"><img src="${p.img}" style="width:100%;height:100%;object-fit:cover;object-position:top;display:block" alt=""></div>`
              : `<div class="h-40 grid place-items-center text-center px-4" style="background:linear-gradient(135deg,#fbeef0,#f6e2e8)"><div><p class="text-[13px] font-bold" style="color:#8a5a66">${p.title||''}</p><p class="text-[11px] mt-1" style="color:#b08792">이미지 없음</p></div></div>`}
          </div>
          <p class="text-[11.5px] mb-3" style="color:var(--muted)">등록일: ${p.date||'-'}</p>
          <input data-ppf="title" value="${(p.title||'').replace(/"/g,'&quot;')}" class="w-full px-3 py-2 rounded-lg text-[13px] mb-2" style="background:var(--panel-soft);border:1px solid var(--border);color:var(--text)">
          <input data-ppf="link" value="${(p.link||'').replace(/"/g,'&quot;')}" placeholder="링크 (클릭 시 이동)" class="w-full px-3 py-2 rounded-lg text-[12px] mb-2" style="background:var(--panel-soft);border:1px solid var(--border);color:var(--text-soft)">
          <button onclick="document.getElementById('popImgFile${i}').click()" class="w-full py-2 rounded-lg text-[12.5px] font-semibold btn-gold mb-3">이미지 교체</button>
          <input id="popImgFile${i}" type="file" accept="image/*" class="hidden" onchange="handlePopupImage(this, ${i})">
          <div class="flex items-center gap-3 rounded-lg px-3 py-2.5 mb-2" style="background:var(--panel-soft);border:1px solid var(--border)">
            <label class="flex items-center gap-1.5 text-[12.5px]" style="color:var(--text-soft)"><input type="checkbox" data-ppf="on" ${p.on!==false?'checked':''} class="accent-[var(--accent)]"> 공개 여부</label>
            <span class="text-[12.5px] ml-auto" style="color:var(--text-soft)">순서</span>
            <input data-ppf="order" value="${p.order||0}" class="w-14 px-2 py-1 rounded text-[12.5px] text-center" style="background:var(--panel);border:1px solid var(--border);color:var(--text)">
          </div>
          <div class="rounded-lg px-3 py-2.5 space-y-1.5" style="background:var(--panel-soft);border:1px solid var(--border)">
            <label class="flex items-center gap-1.5 text-[12.5px]" style="color:var(--text-soft)"><input type="checkbox" data-ppf="period" ${p.period?'checked':''} class="accent-[var(--accent)]"> 기간 제한 사용</label>
            <div class="flex items-center gap-1.5 text-[11.5px]" style="color:var(--muted)">
              <span>시작</span><input data-ppf="start" type="datetime-local" value="${p.start||''}" class="flex-1 px-2 py-1 rounded text-[11.5px]" style="background:var(--panel);border:1px solid var(--border);color:var(--text)">
            </div>
            <div class="flex items-center gap-1.5 text-[11.5px]" style="color:var(--muted)">
              <span>종료</span><input data-ppf="end" type="datetime-local" value="${p.end||''}" class="flex-1 px-2 py-1 rounded text-[11.5px]" style="background:var(--panel);border:1px solid var(--border);color:var(--text)">
            </div>
          </div>
        </div>`).join('')}</div>`
      : `<div class="panel rounded-2xl p-16 text-center" style="color:var(--muted)">등록된 팝업이 없습니다. 위에서 이미지와 제목을 넣고 「팝업 등록」을 눌러보세요.<br><span class="text-[12px]">팝업이 없으면 홈페이지에는 아무것도 뜨지 않습니다.</span></div>`}`;
    renderNpPrev();
  };
