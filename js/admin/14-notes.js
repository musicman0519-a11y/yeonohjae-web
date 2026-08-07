  /* ---------- 시술노트 (글+사진 에디터 → front /notes page) ---------- */
  function kkModalCss(){
    if(document.getElementById('kkModalCss')) return;
    const st = document.createElement('style');
    st.id = 'kkModalCss';
    st.textContent = '.pml{display:block;font-size:12.5px;font-weight:600;margin-bottom:5px;color:var(--text-soft)} .pmi{width:100%;padding:9px 12px;border-radius:9px;font-size:13.5px;background:var(--panel-soft);border:1px solid var(--border);color:var(--text);outline:none} .pmi:focus{border-color:var(--accent)}'
      + ' .ntTb{padding:0 10px;height:30px;border-radius:8px;font-size:12px;font-weight:600;background:var(--panel-soft);border:1px solid var(--border);color:var(--text-soft)} .ntTb:hover{color:var(--accent-strong);border-color:var(--accent)}'
      + ' .peEd{min-height:160px;max-height:320px;overflow-y:auto;padding:12px 14px;border-radius:10px;font-size:13.5px;line-height:1.7;background:var(--panel);border:1px solid var(--border);color:var(--text)} .peEd:focus{outline:none;border-color:var(--accent)} .peEd h3{font-weight:800;font-size:15px;margin:14px 0 6px} .peEd p{margin:6px 0} .peEd img{max-width:100%;border-radius:10px;margin:8px 0} .peEd hr{border:0;border-top:1px solid var(--border);margin:14px 0} #ntBody,#inBody,#dcBody{min-height:220px;max-height:340px;overflow-y:auto;padding:12px 14px;border-radius:10px;font-size:13.5px;line-height:1.7;background:var(--panel-soft);border:1px solid var(--border);color:var(--text)}'
      + ' #ntBody:focus,#inBody:focus,#dcBody:focus{outline:none;border-color:var(--accent)}'
      + ' #ntBody h3,#inBody h3,#dcBody h3{font-weight:800;font-size:15px;margin:14px 0 6px} #ntBody p,#inBody p,#dcBody p{margin:6px 0} #ntBody img,#inBody img,#dcBody img{max-width:100%;border-radius:10px;margin:8px 0} #ntBody hr,#inBody hr,#dcBody hr{border:0;border-top:1px solid var(--border);margin:14px 0}';
    document.head.appendChild(st);
  }
  function notesSyncInline(base){
    document.querySelectorAll('#view-notes [data-nrow]').forEach(c=>{
      const i = parseInt(c.dataset.nrow);
      if(!base[i]) return;
      const on = c.querySelector('[data-nf="on"]');
      if(on) base[i].on = on.checked;
    });
    return base;
  }
  function saveNotes(){
    const base = notesSyncInline(KK.get('notes', DEFAULT_NOTES));
    KK.set('notes', base);
    toast(STORAGE_OK? '시술노트가 저장됐습니다. 홈페이지 「시술 노트」에 반영됩니다.' : '미리보기 환경에선 저장이 제한됩니다.', STORAGE_OK);
  }
  function rerenderNotes(){
    const old = document.getElementById('view-notes');
    if(old) old.remove();
    BUILDERS.notes();
    go('notes');
  }
  function moveNote(i, d){
    const base = notesSyncInline(KK.get('notes', DEFAULT_NOTES));
    const j = i + d;
    if(j < 0 || j >= base.length) return;
    const tmp = base[i]; base[i] = base[j]; base[j] = tmp;
    KK.set('notes', base);
    rerenderNotes();
  }
  function deleteNote(i){
    const base = notesSyncInline(KK.get('notes', DEFAULT_NOTES));
    const n = base[i]; if(!n) return;
    if(!confirm('「'+(n.t||'이 글')+'」 글을 삭제할까요?\n삭제하면 홈페이지에서도 사라집니다.')) return;
    base.splice(i,1);
    KK.set('notes', base);
    rerenderNotes();
    toast('글을 삭제하고 저장했습니다.');
  }

  /* ----- 글 작성/수정 모달 ----- */
  let _noteEditIdx = null, _noteImg = '';
  function ensureNoteModal(){
    if(document.getElementById('noteModal')) return;
    kkModalCss();
    const wrap = document.createElement('div');
    wrap.id = 'noteModal';
    wrap.className = 'hidden fixed inset-0 z-[80] items-center justify-center bg-black/50 px-4';
    wrap.innerHTML =
      `<div class="panel rounded-2xl w-full max-w-3xl max-h-[94vh] overflow-y-auto no-sb" style="background:var(--panel)">
        <div class="flex items-center justify-between px-6 py-4" style="border-bottom:1px solid var(--border)">
          <h3 id="ntTitle" class="text-[17px] font-bold">시술노트 글 쓰기</h3>
          <button onclick="closeNoteModal()" class="w-8 h-8 rounded-lg grid place-items-center" style="color:var(--muted)"><iconify-icon icon="solar:close-circle-linear" width="20"></iconify-icon></button>
        </div>
        <div class="p-6 space-y-4">
          <div class="flex gap-4 items-start">
            <div class="shrink-0">
              <div id="ntImgPreview" class="w-28 h-28 rounded-xl overflow-hidden grid place-items-center" style="background:var(--panel-soft);border:1px solid var(--border)"></div>
              <button id="ntImgBtn" onclick="document.getElementById('ntImgFile').click()" class="mt-2 w-28 py-2 rounded-lg text-[12.5px] font-semibold btn-gold">대표사진 업로드</button>
              <button onclick="clearNoteImg()" class="mt-1 w-28 py-1.5 rounded-lg text-[11.5px]" style="background:var(--panel-soft);border:1px solid var(--border);color:var(--text-soft)">사진 제거</button>
              <input id="ntImgFile" type="file" accept="image/*" class="hidden" onchange="handleNoteImage(this)">
            </div>
            <div class="flex-1 space-y-3">
              <div><label class="pml">제목 *</label><input id="ntT" class="pmi" placeholder="예) 온다레이저"></div>
              <div><label class="pml">요약 (목록에 보이는 한 줄)</label><input id="ntSub" class="pmi" placeholder="예) 화정 온다 레이저: 지방과 처짐을 동시에 케어하세요"></div>
              <label class="flex items-center gap-2 text-[13.5px]" style="color:var(--text-soft)"><input id="ntOn" type="checkbox" class="accent-[var(--accent)]" checked> 홈페이지에 공개</label>
            </div>
          </div>
          <div>
            <label class="pml">본문 (글 + 사진)</label>
            <div class="flex flex-wrap items-center gap-1.5 mb-1.5">
              <button class="ntTb" onclick="ntCmd('bold')"><b>굵게</b></button>
              <button class="ntTb" onclick="ntCmd('h3')">소제목</button>
              <button class="ntTb" onclick="ntCmd('p')">본문 글</button>
              <button class="ntTb" onclick="ntCmd('hr')">구분선</button>
              <button class="ntTb" style="background:var(--accent-soft);color:var(--accent-strong);border-color:var(--accent)" onclick="document.getElementById('ntBodyImgFile').click()">🖼 본문 사진 넣기</button>
              <input id="ntBodyImgFile" type="file" accept="image/*" class="hidden" onchange="handleNoteBodyImage(this)">
            </div>
            <div id="ntBody" contenteditable="true"></div>
            <p class="text-[11.5px] mt-1.5" style="color:var(--muted)">글을 쓰다가 「본문 사진 넣기」를 누르면 커서 위치에 사진이 들어갑니다. 저장하면 홈페이지 「시술 노트」에서 글 전체를 볼 수 있습니다.</p>
          </div>
        </div>
        <div class="flex items-center justify-end gap-2 px-6 py-4" style="border-top:1px solid var(--border)">
          <button onclick="closeNoteModal()" class="px-4 h-9 rounded-lg text-[13px] font-semibold" style="background:var(--panel-soft);border:1px solid var(--border);color:var(--text-soft)">취소</button>
          <button onclick="submitNoteModal()" class="px-5 h-9 rounded-lg text-[13px] font-semibold btn-gold">저장 (홈 반영)</button>
        </div>
      </div>`;
    document.body.appendChild(wrap);
  }
  function renderNoteImgPreview(){
    const box = document.getElementById('ntImgPreview');
    if(!box) return;
    box.innerHTML = _noteImg
      ? `<img src="${_noteImg}" style="width:100%;height:100%;object-fit:cover;display:block" alt="">`
      : `<div class="text-center px-2"><iconify-icon icon="solar:gallery-linear" width="24" style="color:var(--muted)"></iconify-icon><p class="text-[11px] mt-1" style="color:var(--muted)">대표사진 없음</p></div>`;
  }
  function clearNoteImg(){ _noteImg=''; renderNoteImgPreview(); }
  async function handleNoteImage(input){
    const file = input.files && input.files[0];
    if(!file) return;
    if(typeof window.uploadImage !== 'function'){ toast('이미지 업로드 기능을 사용할 수 없습니다. (Supabase 연결 확인)', false); input.value=''; return; }
    const btn = document.getElementById('ntImgBtn');
    const prev = btn.innerHTML; btn.innerHTML='업로드 중…'; btn.disabled=true;
    try{
      const url = await window.uploadImage(file);
      _noteImg = url; renderNoteImgPreview();
      toast('대표사진이 업로드됐습니다.');
    }catch(e){
      console.error(e); toast('이미지 업로드 실패: '+((e&&e.message)||e), false);
    }finally{
      btn.innerHTML=prev; btn.disabled=false; input.value='';
    }
  }
  function ntFocus(){
    const ed = document.getElementById('ntBody');
    const s = window.getSelection();
    if(s.rangeCount && ed.contains(s.anchorNode)) return;
    ed.focus();
    const r = document.createRange();
    r.selectNodeContents(ed); r.collapse(false);
    s.removeAllRanges(); s.addRange(r);
  }
  function ntCmd(c){
    ntFocus();
    if(c==='bold') document.execCommand('bold');
    else if(c==='h3') document.execCommand('formatBlock', false, '<h3>');
    else if(c==='p') document.execCommand('formatBlock', false, '<p>');
    else if(c==='hr') document.execCommand('insertHorizontalRule');
  }
  async function handleNoteBodyImage(input){
    const file = input.files && input.files[0];
    if(!file) return;
    if(typeof window.uploadImage !== 'function'){ toast('이미지 업로드 기능을 사용할 수 없습니다. (Supabase 연결 확인)', false); input.value=''; return; }
    toast('본문 사진 업로드 중…');
    try{
      const url = await window.uploadImage(file);
      ntFocus();
      document.execCommand('insertHTML', false, '<img src="'+url+'" alt=""><p><br></p>');
      toast('본문에 사진을 넣었습니다.');
    }catch(e){
      console.error(e); toast('이미지 업로드 실패: '+((e&&e.message)||e), false);
    }finally{
      input.value='';
    }
  }
  function openNoteModal(idx){
    ensureNoteModal();
    const base = KK.get('notes', DEFAULT_NOTES);
    _noteEditIdx = (idx===undefined || idx===null) ? null : idx;
    const blank = {t:'', sub:'', img:'', body:'', on:true};
    const n = _noteEditIdx===null ? blank : Object.assign({}, blank, base[_noteEditIdx]);
    _noteImg = n.img || '';
    document.getElementById('ntTitle').textContent = _noteEditIdx===null ? '시술노트 글 쓰기' : '시술노트 글 수정';
    document.getElementById('ntT').value = n.t||'';
    document.getElementById('ntSub').value = n.sub||'';
    document.getElementById('ntOn').checked = n.on!==false;
    document.getElementById('ntBody').innerHTML = n.body||'';
    renderNoteImgPreview();
    const m = document.getElementById('noteModal');
    m.classList.remove('hidden'); m.classList.add('flex');
  }
  function closeNoteModal(){
    const m = document.getElementById('noteModal');
    if(m){ m.classList.add('hidden'); m.classList.remove('flex'); }
  }
  function submitNoteModal(){
    const t = document.getElementById('ntT').value.trim();
    if(!t){ toast('제목을 입력해주세요.', false); return; }
    let body = document.getElementById('ntBody').innerHTML.trim();
    if(body==='<br>' || body==='<p><br></p>') body='';
    const base = notesSyncInline(KK.get('notes', DEFAULT_NOTES));
    const d = new Date();
    const today = d.getFullYear()+'.'+String(d.getMonth()+1).padStart(2,'0')+'.'+String(d.getDate()).padStart(2,'0');
    const rec = {
      t: t,
      sub: document.getElementById('ntSub').value.trim(),
      img: _noteImg||'',
      body: body,
      on: document.getElementById('ntOn').checked,
      date: (_noteEditIdx!==null && base[_noteEditIdx] && base[_noteEditIdx].date) || today,
    };
    if(_noteEditIdx===null) base.unshift(rec);
    else base[_noteEditIdx] = Object.assign({}, base[_noteEditIdx], rec);
    KK.set('notes', base);
    closeNoteModal();
    rerenderNotes();
    toast(_noteEditIdx===null ? '글을 등록하고 저장했습니다.' : '글을 수정하고 저장했습니다.');
  }

  BUILDERS.notes = function(){
    ensureNoteModal();
    const notes = KK.get('notes', DEFAULT_NOTES);
    const el = makeView('notes');
    const media = n => n.img
      ? `<img src="${n.img}" style="width:100%;height:144px;object-fit:cover;display:block" alt="">`
      : `<div class="h-36 grid place-items-center px-4 text-center" style="background:linear-gradient(135deg,#f3ede6,#e8ded2)"><h3 class="text-2xl font-extrabold tracking-tight" style="color:#2c2620">${n.t||''}</h3></div>`;
    const hasBody = n => !!(n.body && String(n.body).trim());
    el.innerHTML = pageHead('시술노트 관리','글 + 사진 아티클을 등록·수정·삭제합니다. (저장 시 홈페이지 「시술 노트」 반영)',
      `<button onclick="openNoteModal(null)" class="px-4 h-9 rounded-lg text-[13px] font-semibold btn-gold flex items-center gap-1.5"><iconify-icon icon="solar:add-circle-linear" width="15"></iconify-icon> 글 추가</button>
       <button onclick="saveNotes()" class="px-4 h-9 rounded-lg text-[13px] font-semibold flex items-center gap-1.5" style="background:var(--panel);border:1px solid var(--border);color:var(--text-soft)"><iconify-icon icon="solar:upload-minimalistic-linear" width="15"></iconify-icon> 공개 여부 저장</button>`) +
      `<p class="text-[12.5px] mb-4" style="color:var(--muted)">전체 ${notes.length}개 · <b style="color:var(--accent-strong)">공개를 끄면 홈페이지에서 숨겨집니다</b> · 펜 아이콘으로 글과 사진을 수정할 수 있습니다.</p>
      <div class="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">${notes.length ? notes.map((n,i)=>`
        <div class="panel rounded-2xl overflow-hidden" data-nrow="${i}">
          <div class="relative">${media(n)}
            <span class="absolute top-0 right-0 px-2 py-3 text-[9px] font-bold tracking-widest text-white" style="background:#d98a9a;writing-mode:vertical-rl">NOTE</span>
          </div>
          <div class="p-4">
            <div class="flex items-center gap-1.5 flex-wrap">
              <span class="chip" style="background:${hasBody(n)?'var(--good-bg)':'var(--bad-bg)'};color:${hasBody(n)?'var(--good)':'var(--bad)'}">${hasBody(n)?'본문 있음':'본문 없음'}</span>
              ${n.img?`<span class="chip" style="background:var(--accent-soft);color:var(--accent-strong)">대표사진</span>`:''}
              ${n.date?`<span class="chip" style="background:var(--panel-soft);color:var(--muted)">${n.date}</span>`:''}
            </div>
            <p class="font-bold text-[15px] mt-2.5">${n.t||''}</p>
            <p class="text-[12.5px] mt-1 break-keep" style="color:var(--text-soft)">${n.sub||''}</p>
            <div class="flex items-center justify-between mt-3">
              <label class="flex items-center gap-1.5 text-[12.5px]" style="color:var(--text-soft)"><input type="checkbox" data-nf="on" ${n.on!==false?'checked':''} class="accent-[var(--accent)]"> 공개</label>
              <div class="flex items-center gap-1.5">
                <button onclick="moveNote(${i},-1)" class="w-8 h-8 rounded-lg grid place-items-center" style="background:var(--panel-soft);border:1px solid var(--border);color:var(--text-soft)"><iconify-icon icon="solar:arrow-up-linear" width="14"></iconify-icon></button>
                <button onclick="moveNote(${i},1)" class="w-8 h-8 rounded-lg grid place-items-center" style="background:var(--panel-soft);border:1px solid var(--border);color:var(--text-soft)"><iconify-icon icon="solar:arrow-down-linear" width="14"></iconify-icon></button>
                <button onclick="openNoteModal(${i})" class="w-8 h-8 rounded-lg grid place-items-center" style="background:var(--accent-soft);color:var(--accent-strong)"><iconify-icon icon="solar:pen-linear" width="14"></iconify-icon></button>
                <button onclick="deleteNote(${i})" class="w-8 h-8 rounded-lg grid place-items-center text-white" style="background:var(--bad)"><iconify-icon icon="solar:trash-bin-trash-linear" width="14"></iconify-icon></button>
              </div>
            </div>
          </div>
        </div>`).join('') : `<div class="panel rounded-2xl p-14 text-center col-span-full" style="color:var(--muted)">등록된 글이 없습니다. 「글 추가」로 첫 글을 등록하세요.</div>`}</div>`;
  };
