  /* ---------- 의료진 소개 관리 (프로필 폼 + 소개 본문 → front 의료진 소개/상세) ---------- */
  function doctorsSyncInline(base){
    document.querySelectorAll('#view-doctors [data-doc-i]').forEach(c=>{
      const i = parseInt(c.dataset.docI);
      if(!base[i]) return;
      base[i].name = c.querySelector('[data-df="name"]').value.trim();
      base[i].role = c.querySelector('[data-df="role"]').value.trim();
      base[i].desc = c.querySelector('[data-df="desc"]').value.trim();
    });
    return base;
  }
  function saveDoctors(){
    const base = doctorsSyncInline(KK.get('doctors', DEFAULT_DOCTORS));
    KK.set('doctors', base);
    toast(STORAGE_OK? '저장됐습니다. 홈페이지 「의료진 소개」에 반영됩니다.' : '미리보기 환경에선 저장이 제한됩니다.', STORAGE_OK);
  }
  function rerenderDoctors(){
    const old = document.getElementById('view-doctors');
    if(old) old.remove();
    BUILDERS.doctors();
    go('doctors');
  }
  function deleteDoctor(i){
    const base = doctorsSyncInline(KK.get('doctors', DEFAULT_DOCTORS));
    const d = base[i]; if(!d) return;
    if(!confirm('「'+(d.name||'이 의료진')+'」을(를) 삭제할까요?\n삭제 시 홈페이지에서 즉시 사라집니다.')) return;
    base.splice(i,1);
    KK.set('doctors', base);
    rerenderDoctors();
    toast('의료진을 삭제하고 저장했습니다.');
  }
  async function handleDoctorPhoto(input, i){
    const file = input.files && input.files[0];
    if(!file) return;
    if(typeof window.uploadImage !== 'function'){ toast('이미지 업로드 기능을 사용할 수 없습니다. (Supabase 연결 확인)', false); input.value=''; return; }
    toast('사진 업로드 중…');
    try{
      const url = await window.uploadImage(file);
      const base = doctorsSyncInline(KK.get('doctors', DEFAULT_DOCTORS));
      if(base[i]) base[i].img = url;
      KK.set('doctors', base);
      rerenderDoctors();
      toast('사진을 업로드하고 저장했습니다.');
    }catch(e){
      console.error(e); toast('이미지 업로드 실패: '+((e&&e.message)||e), false);
    }finally{
      input.value='';
    }
  }
  function toggleDocHelp(){
    const box=document.getElementById('docHelpBody'), btn=document.getElementById('docHelpBtn');
    const open=box.style.display==='none';
    box.style.display=open?'':'none';
    btn.textContent=open?'닫기':'보기';
  }

  /* ----- 의료진 추가/수정 모달 (프로필 + 소개 본문) ----- */
  let _docEditIdx = null, _docImg = '';
  function ensureDocModal(){
    if(document.getElementById('docModal')) return;
    kkModalCss();
    const wrap = document.createElement('div');
    wrap.id = 'docModal';
    wrap.className = 'hidden fixed inset-0 z-[80] items-center justify-center bg-black/50 px-4';
    wrap.innerHTML =
      `<div class="panel rounded-2xl w-full max-w-3xl max-h-[94vh] overflow-y-auto no-sb" style="background:var(--panel)">
        <div class="flex items-center justify-between px-6 py-4" style="border-bottom:1px solid var(--border)">
          <h3 id="dcTitle" class="text-[17px] font-bold">의료진 추가</h3>
          <button onclick="closeDocModal()" class="w-8 h-8 rounded-lg grid place-items-center" style="color:var(--muted)"><iconify-icon icon="solar:close-circle-linear" width="20"></iconify-icon></button>
        </div>
        <div class="p-6 space-y-4">
          <p class="text-[13px] font-bold" style="color:var(--text)">기본 정보 <span class="font-normal" style="color:var(--muted)">— 의료진 이름과 대표 이미지를 입력합니다.</span></p>
          <div class="flex gap-4 items-start">
            <div class="shrink-0">
              <div id="dcImgPreview" class="w-28 h-36 rounded-xl overflow-hidden grid place-items-center" style="background:var(--panel-soft);border:1px solid var(--border)"></div>
              <button id="dcImgBtn" onclick="document.getElementById('dcImgFile').click()" class="mt-2 w-28 py-2 rounded-lg text-[12.5px] font-semibold btn-gold">대표 이미지</button>
              <button onclick="clearDocImg()" class="mt-1 w-28 py-1.5 rounded-lg text-[11.5px]" style="background:var(--panel-soft);border:1px solid var(--border);color:var(--text-soft)">이미지 제거</button>
              <input id="dcImgFile" type="file" accept="image/*" class="hidden" onchange="handleDocModalImage(this)">
            </div>
            <div class="flex-1 space-y-3">
              <div><label class="pml">이름 *</label><input id="dcName" class="pmi" placeholder="이름을 입력해주세요."></div>
              <div><label class="pml">직책</label><input id="dcRole" class="pmi" placeholder="예) 대표원장 · 한의사"></div>
              <div><label class="pml">짧은 소개 (목록 카드에 보이는 한두 줄)</label><input id="dcDesc" class="pmi" placeholder="예) 피부·미용 시술 전문. 연오재한의원 대표원장."></div>
            </div>
          </div>
          <div>
            <p class="text-[13px] font-bold mb-1" style="color:var(--text)">소개 본문 <span class="font-normal" style="color:var(--muted)">— 홈페이지 의료진 상세 페이지에 노출될 본문을 작성합니다.</span></p>
            <div class="flex flex-wrap items-center gap-1.5 mb-1.5">
              <button class="ntTb" onclick="dcCmd('bold')"><b>굵게</b></button>
              <button class="ntTb" onclick="dcCmd('h3')">소제목</button>
              <button class="ntTb" onclick="dcCmd('p')">본문 글</button>
              <button class="ntTb" onclick="dcCmd('hr')">구분선</button>
              <button class="ntTb" style="background:var(--accent-soft);color:var(--accent-strong);border-color:var(--accent)" onclick="document.getElementById('dcBodyImgFile').click()">🖼 본문 사진 넣기</button>
              <input id="dcBodyImgFile" type="file" accept="image/*" class="hidden" onchange="handleDocBodyImage(this)">
            </div>
            <div id="dcBody" contenteditable="true"></div>
            <p class="text-[11.5px] mt-1.5" style="color:var(--muted)">약력·전문 분야·인사말 등을 자유롭게 작성하세요. 비워두면 상세 페이지에 짧은 소개만 표시됩니다.</p>
          </div>
        </div>
        <div class="flex items-center justify-end gap-2 px-6 py-4" style="border-top:1px solid var(--border)">
          <button onclick="closeDocModal()" class="px-4 h-9 rounded-lg text-[13px] font-semibold" style="background:var(--panel-soft);border:1px solid var(--border);color:var(--text-soft)">취소</button>
          <button onclick="submitDocModal()" class="px-5 h-9 rounded-lg text-[13px] font-semibold btn-gold flex items-center gap-1.5"><iconify-icon icon="solar:upload-minimalistic-linear" width="15"></iconify-icon> 저장하기</button>
        </div>
      </div>`;
    document.body.appendChild(wrap);
  }
  function renderDocImgPreview(){
    const box = document.getElementById('dcImgPreview');
    if(!box) return;
    box.innerHTML = _docImg
      ? `<img src="${_docImg}" style="width:100%;height:100%;object-fit:cover;display:block" alt="">`
      : `<div class="text-center px-2"><iconify-icon icon="solar:user-linear" width="24" style="color:var(--muted)"></iconify-icon><p class="text-[11px] mt-1" style="color:var(--muted)">이미지 없음</p></div>`;
  }
  function clearDocImg(){ _docImg=''; renderDocImgPreview(); }
  async function handleDocModalImage(input){
    const file = input.files && input.files[0];
    if(!file) return;
    if(typeof window.uploadImage !== 'function'){ toast('이미지 업로드 기능을 사용할 수 없습니다. (Supabase 연결 확인)', false); input.value=''; return; }
    const btn = document.getElementById('dcImgBtn');
    const prev = btn.innerHTML; btn.innerHTML='업로드 중…'; btn.disabled=true;
    try{
      const url = await window.uploadImage(file);
      _docImg = url; renderDocImgPreview();
      toast('대표 이미지가 업로드됐습니다.');
    }catch(e){
      console.error(e); toast('이미지 업로드 실패: '+((e&&e.message)||e), false);
    }finally{
      btn.innerHTML=prev; btn.disabled=false; input.value='';
    }
  }
  function dcFocus(){
    const ed = document.getElementById('dcBody');
    const s = window.getSelection();
    if(s.rangeCount && ed.contains(s.anchorNode)) return;
    ed.focus();
    const r = document.createRange();
    r.selectNodeContents(ed); r.collapse(false);
    s.removeAllRanges(); s.addRange(r);
  }
  function dcCmd(c){
    dcFocus();
    if(c==='bold') document.execCommand('bold');
    else if(c==='h3') document.execCommand('formatBlock', false, '<h3>');
    else if(c==='p') document.execCommand('formatBlock', false, '<p>');
    else if(c==='hr') document.execCommand('insertHorizontalRule');
  }
  async function handleDocBodyImage(input){
    const file = input.files && input.files[0];
    if(!file) return;
    if(typeof window.uploadImage !== 'function'){ toast('이미지 업로드 기능을 사용할 수 없습니다. (Supabase 연결 확인)', false); input.value=''; return; }
    toast('본문 사진 업로드 중…');
    try{
      const url = await window.uploadImage(file);
      dcFocus();
      document.execCommand('insertHTML', false, '<img src="'+url+'" alt=""><p><br></p>');
      toast('본문에 사진을 넣었습니다.');
    }catch(e){
      console.error(e); toast('이미지 업로드 실패: '+((e&&e.message)||e), false);
    }finally{
      input.value='';
    }
  }
  function openDoctorModal(idx){
    ensureDocModal();
    const base = doctorsSyncInline(KK.get('doctors', DEFAULT_DOCTORS));
    KK.set('doctors', base); /* 인라인 수정분 보존 */
    _docEditIdx = (idx===undefined || idx===null) ? null : idx;
    const blank = {name:'', role:'원장 · 한의사', desc:'', img:'', body:''};
    const d = _docEditIdx===null ? blank : Object.assign({}, blank, base[_docEditIdx]||{});
    _docImg = d.img||'';
    document.getElementById('dcTitle').textContent = _docEditIdx===null ? '의료진 추가' : '의료진 수정';
    document.getElementById('dcName').value = d.name||'';
    document.getElementById('dcRole').value = d.role||'';
    document.getElementById('dcDesc').value = d.desc||'';
    document.getElementById('dcBody').innerHTML = d.body||'';
    renderDocImgPreview();
    const m = document.getElementById('docModal');
    m.classList.remove('hidden'); m.classList.add('flex');
  }
  function closeDocModal(){
    const m = document.getElementById('docModal');
    if(m){ m.classList.add('hidden'); m.classList.remove('flex'); }
  }
  function submitDocModal(){
    const name = document.getElementById('dcName').value.trim();
    if(!name){ toast('이름을 입력해주세요.', false); return; }
    let body = document.getElementById('dcBody').innerHTML.trim();
    if(body==='<br>' || body==='<p><br></p>') body='';
    const base = KK.get('doctors', DEFAULT_DOCTORS);
    const rec = {
      name: name,
      role: document.getElementById('dcRole').value.trim(),
      desc: document.getElementById('dcDesc').value.trim(),
      img: _docImg||'',
      body: body,
    };
    if(_docEditIdx===null) base.push(rec);
    else base[_docEditIdx] = Object.assign({}, base[_docEditIdx], rec);
    KK.set('doctors', base);
    closeDocModal();
    rerenderDoctors();
    toast(_docEditIdx===null ? '의료진을 추가하고 저장했습니다.' : '의료진 프로필을 수정하고 저장했습니다.');
  }

  BUILDERS.doctors = function(){
    ensureDocModal();
    const docs = KK.get('doctors', DEFAULT_DOCTORS);
    const el = makeView('doctors');
    const helpBox = `
      <div class="rounded-xl mb-5" style="background:var(--panel);border:1px solid var(--border)">
        <div class="px-5 py-3.5 flex items-center gap-3">
          <span class="text-[13.5px] font-bold">처음이라면 사용법 보기</span>
          <span class="text-[13px]" style="color:var(--muted)">홈페이지에 노출되는 의료진 프로필을 관리합니다.</span>
          <button id="docHelpBtn" onclick="toggleDocHelp()" class="ml-auto px-4 h-8 rounded-full text-[12.5px] font-bold text-white" style="background:var(--side)">보기</button>
        </div>
        <div id="docHelpBody" style="display:none;border-top:1px solid var(--border-soft)" class="px-6 py-4">
          <ol class="list-decimal pl-4 space-y-1.5 text-[13.5px]" style="color:var(--text-soft)">
            <li><b style="color:var(--text)">추가하기</b> 버튼으로 새 의료진 프로필(이름·사진·소개 본문)을 등록합니다.</li>
            <li>카드의 연필 버튼으로 <b style="color:var(--text)">이름·사진·소개 본문</b>을 수정할 수 있습니다. (카드에서 바로 고친 이름·소개는 「전체 저장」)</li>
            <li>삭제 시 홈페이지에서 즉시 사라집니다. 소개 본문을 쓰면 홈에서 의료진 카드를 눌러 <b style="color:var(--text)">상세 프로필</b>을 볼 수 있습니다.</li>
          </ol>
        </div>
      </div>`;
    el.innerHTML = pageHead('의료진 소개 수정','의료진 프로필과 소개 본문을 관리합니다.',
      `<button onclick="openDoctorModal(null)" class="px-4 h-9 rounded-lg text-[13px] font-semibold btn-gold flex items-center gap-1.5"><iconify-icon icon="solar:add-circle-linear" width="15"></iconify-icon> 추가하기</button>
       <button onclick="saveDoctors()" class="px-4 h-9 rounded-lg text-[13px] font-semibold flex items-center gap-1.5" style="background:var(--panel);border:1px solid var(--border);color:var(--text-soft)"><iconify-icon icon="solar:upload-minimalistic-linear" width="15"></iconify-icon> 전체 저장 (홈 반영)</button>`) +
      helpBox +
      `${docs.length ? `<div class="grid md:grid-cols-2 gap-4">${docs.map((d,i)=>`
        <div class="panel rounded-2xl p-5" data-doc-i="${i}">
          <div class="flex items-start gap-4">
            <div class="w-20 h-24 rounded-xl shrink-0 overflow-hidden grid place-items-center" style="background:linear-gradient(135deg,#e9e1d6,#d8cabb)">
              ${d.img?`<img src="${d.img}" style="width:100%;height:100%;object-fit:cover;display:block" alt="">`:`<iconify-icon icon="solar:user-linear" width="28" style="color:var(--accent-strong)"></iconify-icon>`}
            </div>
            <div class="flex-1 space-y-2">
              <input data-df="name" value="${(d.name||'').replace(/"/g,'&quot;')}" placeholder="이름" class="w-full px-3 py-2 rounded-lg text-[14px] font-semibold" style="background:var(--panel-soft);border:1px solid var(--border);color:var(--text)">
              <input data-df="role" value="${(d.role||'').replace(/"/g,'&quot;')}" placeholder="직책" class="w-full px-3 py-2 rounded-lg text-[13px]" style="background:var(--panel-soft);border:1px solid var(--border);color:var(--text-soft)">
            </div>
          </div>
          <textarea data-df="desc" rows="2" placeholder="짧은 소개" class="w-full px-3 py-2 rounded-lg text-[13px] mt-3 break-keep" style="background:var(--panel-soft);border:1px solid var(--border);color:var(--text-soft)">${d.desc||''}</textarea>
          <div class="flex items-center justify-between mt-3">
            <span class="chip" style="background:${d.body?'var(--good-bg)':'var(--panel-soft)'};color:${d.body?'var(--good)':'var(--muted)'}">${d.body?'소개 본문 있음':'소개 본문 없음'}</span>
            <div class="flex items-center gap-1.5">
              <button onclick="document.getElementById('docPhoto${i}').click()" class="px-3 h-8 rounded-lg text-[12.5px] font-semibold" style="background:var(--panel-soft);border:1px solid var(--border);color:var(--text-soft)">사진 변경</button>
              <input id="docPhoto${i}" type="file" accept="image/*" class="hidden" onchange="handleDoctorPhoto(this, ${i})">
              <button onclick="openDoctorModal(${i})" class="w-8 h-8 rounded-lg grid place-items-center" style="background:var(--accent-soft);color:var(--accent-strong)"><iconify-icon icon="solar:pen-linear" width="14"></iconify-icon></button>
              <button onclick="deleteDoctor(${i})" class="w-8 h-8 rounded-lg grid place-items-center text-white" style="background:var(--bad)"><iconify-icon icon="solar:trash-bin-trash-linear" width="14"></iconify-icon></button>
            </div>
          </div>
        </div>`).join('')}</div>`
      : `<div class="panel rounded-2xl p-16 text-center" style="border-style:dashed;color:var(--muted)"><p class="font-semibold" style="color:var(--text-soft)">등록된 의료진이 없습니다.</p><p class="text-[12.5px] mt-1">상단의 「추가하기」 버튼으로 새 의료진을 등록할 수 있습니다.</p></div>`}`;
  };
