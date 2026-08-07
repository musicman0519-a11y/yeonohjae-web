  /* ---------- 시술 전후 관리 (BEFORE/AFTER 사진 업로드 CRUD → front /ba) ---------- */
  const BA_CATS = ['다이어트','리프팅/탄력/윤곽','미백/기미/색소','여드름/모공/흉터','제모/문신제거','코/윤곽/실리프팅','콜라겐 볼륨침 CoVA','기타'];
  function baSyncInline(base){
    document.querySelectorAll('#view-beforeafter [data-barow]').forEach(c=>{
      const i = parseInt(c.dataset.barow);
      if(!base[i]) return;
      const on = c.querySelector('[data-baf="on"]');
      if(on) base[i].on = on.checked;
    });
    return base;
  }
  function saveBA(){
    const base = baSyncInline(KK.get('ba', []));
    KK.set('ba', base);
    toast(STORAGE_OK? '전후사진이 저장됐습니다. 홈페이지 「시술전후」에 반영됩니다.' : '미리보기 환경에선 저장이 제한됩니다.', STORAGE_OK);
  }
  function toggleBABlur(chk){
    KK.set('baBlur', !!chk.checked);
    toast(chk.checked? '전후사진이 블러 처리되어 노출됩니다.' : '블러 처리를 해제했습니다.');
  }
  function rerenderBA(){
    const old = document.getElementById('view-beforeafter');
    if(old) old.remove();
    BUILDERS.beforeafter();
    go('beforeafter');
  }
  function moveBA(i, d){
    const base = baSyncInline(KK.get('ba', []));
    const j = i + d;
    if(j < 0 || j >= base.length) return;
    const tmp = base[i]; base[i] = base[j]; base[j] = tmp;
    KK.set('ba', base);
    rerenderBA();
  }
  function deleteBA(i){
    const base = baSyncInline(KK.get('ba', []));
    const b = base[i]; if(!b) return;
    if(!confirm('「'+(b.title||'이 전후사진')+'」을(를) 삭제할까요?\n삭제하면 홈페이지에서도 사라집니다.')) return;
    base.splice(i,1);
    KK.set('ba', base);
    rerenderBA();
    toast('전후사진을 삭제하고 저장했습니다.');
  }

  /* ----- 전후사진 추가/수정 모달 ----- */
  let _baEditIdx = null, _baImgB = '', _baImgA = '';
  function ensureBAModal(){
    if(document.getElementById('baModal')) return;
    kkModalCss();
    const wrap = document.createElement('div');
    wrap.id = 'baModal';
    wrap.className = 'hidden fixed inset-0 z-[80] items-center justify-center bg-black/50 px-4';
    wrap.innerHTML =
      `<div class="panel rounded-2xl w-full max-w-2xl max-h-[94vh] overflow-y-auto no-sb" style="background:var(--panel)">
        <div class="flex items-center justify-between px-6 py-4" style="border-bottom:1px solid var(--border)">
          <h3 id="bamTitle" class="text-[17px] font-bold">전후사진 추가</h3>
          <button onclick="closeBAModal()" class="w-8 h-8 rounded-lg grid place-items-center" style="color:var(--muted)"><iconify-icon icon="solar:close-circle-linear" width="20"></iconify-icon></button>
        </div>
        <div class="p-6 space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="pml">BEFORE 사진 *</label>
              <div id="bamBPrev" class="w-full h-40 rounded-xl overflow-hidden grid place-items-center" style="background:var(--panel-soft);border:1px solid var(--border)"></div>
              <button id="bamBBtn" onclick="document.getElementById('bamBFile').click()" class="mt-2 w-full py-2 rounded-lg text-[12.5px] font-semibold btn-gold">BEFORE 업로드</button>
              <input id="bamBFile" type="file" accept="image/*" class="hidden" onchange="handleBAImage(this,'B')">
            </div>
            <div>
              <label class="pml">AFTER 사진 *</label>
              <div id="bamAPrev" class="w-full h-40 rounded-xl overflow-hidden grid place-items-center" style="background:var(--panel-soft);border:1px solid var(--border)"></div>
              <button id="bamABtn" onclick="document.getElementById('bamAFile').click()" class="mt-2 w-full py-2 rounded-lg text-[12.5px] font-semibold btn-gold">AFTER 업로드</button>
              <input id="bamAFile" type="file" accept="image/*" class="hidden" onchange="handleBAImage(this,'A')">
            </div>
          </div>
          <div><label class="pml">분류(카테고리) *</label><select id="bamCat" class="pmi"></select></div>
          <div><label class="pml">제목 *</label><input id="bamT" class="pmi" placeholder="예) 홍조개선 전후"></div>
          <div><label class="pml">설명 (한 줄)</label><input id="bamSub" class="pmi" placeholder="예) 볼 및 나비존 붉은 기 진정"></div>
          <label class="flex items-center gap-2 text-[13.5px]" style="color:var(--text-soft)"><input id="bamOn" type="checkbox" class="accent-[var(--accent)]" checked> 홈페이지에 노출</label>
          <p class="text-[11.5px] break-keep" style="color:var(--muted)">※ 전후사진은 의료광고 규정의 영향을 받을 수 있습니다. 환자 동의를 받은 사진만 올려주시고, 필요 시 목록 상단의 「블러 처리」를 켜세요.</p>
        </div>
        <div class="flex items-center justify-end gap-2 px-6 py-4" style="border-top:1px solid var(--border)">
          <button onclick="closeBAModal()" class="px-4 h-9 rounded-lg text-[13px] font-semibold" style="background:var(--panel-soft);border:1px solid var(--border);color:var(--text-soft)">취소</button>
          <button onclick="submitBAModal()" class="px-5 h-9 rounded-lg text-[13px] font-semibold btn-gold">저장 (홈 반영)</button>
        </div>
      </div>`;
    document.body.appendChild(wrap);
  }
  function renderBAPrev(){
    const pb = document.getElementById('bamBPrev'), pa = document.getElementById('bamAPrev');
    const ph = t=>`<div class="text-center px-2"><iconify-icon icon="solar:gallery-linear" width="24" style="color:var(--muted)"></iconify-icon><p class="text-[11px] mt-1" style="color:var(--muted)">${t}</p></div>`;
    if(pb) pb.innerHTML = _baImgB ? `<img src="${_baImgB}" style="width:100%;height:100%;object-fit:cover;display:block" alt="">` : ph('시술 전 사진');
    if(pa) pa.innerHTML = _baImgA ? `<img src="${_baImgA}" style="width:100%;height:100%;object-fit:cover;display:block" alt="">` : ph('시술 후 사진');
  }
  async function handleBAImage(input, which){
    const file = input.files && input.files[0];
    if(!file) return;
    if(typeof window.uploadImage !== 'function'){ toast('이미지 업로드 기능을 사용할 수 없습니다. (Supabase 연결 확인)', false); input.value=''; return; }
    const btn = document.getElementById(which==='B'?'bamBBtn':'bamABtn');
    const prev = btn.innerHTML; btn.innerHTML='업로드 중…'; btn.disabled=true;
    try{
      const url = await window.uploadImage(file);
      if(which==='B') _baImgB = url; else _baImgA = url;
      renderBAPrev();
      toast((which==='B'?'BEFORE':'AFTER')+' 사진이 업로드됐습니다.');
    }catch(e){
      console.error(e); toast('이미지 업로드 실패: '+((e&&e.message)||e), false);
    }finally{
      btn.innerHTML=prev; btn.disabled=false; input.value='';
    }
  }
  function openBAModal(idx){
    ensureBAModal();
    const base = KK.get('ba', []);
    _baEditIdx = (idx===undefined || idx===null) ? null : idx;
    const blank = {cat:'', title:'', sub:'', imgB:'', imgA:'', on:true};
    const b = _baEditIdx===null ? blank : Object.assign({}, blank, base[_baEditIdx]);
    _baImgB = b.imgB||''; _baImgA = b.imgA||'';
    document.getElementById('bamTitle').textContent = _baEditIdx===null ? '전후사진 추가' : '전후사진 수정';
    document.getElementById('bamCat').innerHTML = '<option value="">분류 선택</option>' +
      BA_CATS.map(c=>`<option value="${c}" ${c===b.cat?'selected':''}>${c}</option>`).join('');
    document.getElementById('bamT').value = b.title||'';
    document.getElementById('bamSub').value = b.sub||'';
    document.getElementById('bamOn').checked = b.on!==false;
    renderBAPrev();
    const m = document.getElementById('baModal');
    m.classList.remove('hidden'); m.classList.add('flex');
  }
  function closeBAModal(){
    const m = document.getElementById('baModal');
    if(m){ m.classList.add('hidden'); m.classList.remove('flex'); }
  }
  function submitBAModal(){
    const cat = document.getElementById('bamCat').value;
    const title = document.getElementById('bamT').value.trim();
    if(!cat){ toast('분류를 선택해주세요.', false); return; }
    if(!title){ toast('제목을 입력해주세요.', false); return; }
    if(!_baImgB || !_baImgA){ toast('BEFORE / AFTER 사진을 모두 올려주세요.', false); return; }
    const d = new Date();
    const today = String(d.getFullYear()).slice(2)+'.'+String(d.getMonth()+1).padStart(2,'0')+'.'+String(d.getDate()).padStart(2,'0');
    const base = baSyncInline(KK.get('ba', []));
    const rec = {
      cat: cat, title: title,
      sub: document.getElementById('bamSub').value.trim(),
      loc: '화정', imgB: _baImgB, imgA: _baImgA,
      on: document.getElementById('bamOn').checked,
      date: (_baEditIdx!==null && base[_baEditIdx] && base[_baEditIdx].date) || today,
    };
    if(_baEditIdx===null) base.unshift(rec);
    else base[_baEditIdx] = Object.assign({}, base[_baEditIdx], rec);
    KK.set('ba', base);
    closeBAModal();
    rerenderBA();
    toast(_baEditIdx===null ? '전후사진을 등록하고 저장했습니다.' : '전후사진을 수정하고 저장했습니다.');
  }

  BUILDERS.beforeafter = function(){
    ensureBAModal();
    const items = KK.get('ba', []);
    const blurOn = !!KK.get('baBlur', false);
    const el = makeView('beforeafter');
    el.innerHTML = pageHead('시술전후 관리','전후사진을 등록·수정·삭제합니다. (저장 시 홈 「시술전후」 반영)',
      `<button onclick="openBAModal(null)" class="px-4 h-9 rounded-lg text-[13px] font-semibold btn-gold flex items-center gap-1.5"><iconify-icon icon="solar:add-circle-linear" width="15"></iconify-icon> 전후사진 추가</button>
       <button onclick="saveBA()" class="px-4 h-9 rounded-lg text-[13px] font-semibold flex items-center gap-1.5" style="background:var(--panel);border:1px solid var(--border);color:var(--text-soft)"><iconify-icon icon="solar:upload-minimalistic-linear" width="15"></iconify-icon> 노출 저장</button>`) +
      `<div class="panel rounded-2xl p-5">
        <div class="flex items-center justify-between rounded-xl px-4 py-3.5 mb-5" style="background:var(--panel-soft);border:1px solid var(--border)">
          <div><p class="font-semibold text-[14px]">전후 사진 블러 처리</p><p class="text-[12.5px]" style="color:var(--muted)">켜면 홈페이지의 모든 전후사진이 흐리게 노출됩니다. (의료광고 대응)</p></div>
          <label class="flex items-center gap-2 text-[13px]" style="color:var(--text-soft)"><input id="baBlurChk" type="checkbox" ${blurOn?'checked':''} onchange="toggleBABlur(this)" class="accent-[var(--accent)]"> 블러 켜기</label>
        </div>
        ${items.length ? `<div class="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">${items.map((b,i)=>`
          <div class="rounded-2xl overflow-hidden" style="border:1px solid var(--border)" data-barow="${i}">
            <div style="height:132px;display:grid;grid-template-columns:1fr 1fr">
              <div style="position:relative;overflow:hidden"><img src="${b.imgB}" style="width:100%;height:100%;object-fit:cover;display:block" alt=""><span style="position:absolute;top:6px;left:6px;font-size:9px;font-weight:700;color:#fff;background:rgba(0,0,0,.5);padding:2px 6px;border-radius:4px">BEFORE</span></div>
              <div style="position:relative;overflow:hidden"><img src="${b.imgA}" style="width:100%;height:100%;object-fit:cover;display:block" alt=""><span style="position:absolute;top:6px;right:6px;font-size:9px;font-weight:700;color:#fff;background:rgba(0,0,0,.5);padding:2px 6px;border-radius:4px">AFTER</span></div>
            </div>
            <div class="p-4">
              <div class="flex items-center gap-1.5 flex-wrap">
                <span class="chip" style="background:var(--accent-soft);color:var(--accent-strong)">${b.cat||''}</span>
                ${b.date?`<span class="chip" style="background:var(--panel-soft);color:var(--muted)">${b.date}</span>`:''}
              </div>
              <p class="font-bold text-[15px] mt-2">${b.title||''}</p>
              <p class="text-[12.5px] mt-0.5 break-keep" style="color:var(--text-soft)">${b.sub||''}</p>
              <div class="flex items-center justify-between mt-3">
                <label class="flex items-center gap-1.5 text-[12.5px]" style="color:var(--text-soft)"><input type="checkbox" data-baf="on" ${b.on!==false?'checked':''} class="accent-[var(--accent)]"> 노출</label>
                <div class="flex items-center gap-1.5">
                  <button onclick="moveBA(${i},-1)" class="w-8 h-8 rounded-lg grid place-items-center" style="background:var(--panel-soft);border:1px solid var(--border);color:var(--text-soft)"><iconify-icon icon="solar:arrow-up-linear" width="14"></iconify-icon></button>
                  <button onclick="moveBA(${i},1)" class="w-8 h-8 rounded-lg grid place-items-center" style="background:var(--panel-soft);border:1px solid var(--border);color:var(--text-soft)"><iconify-icon icon="solar:arrow-down-linear" width="14"></iconify-icon></button>
                  <button onclick="openBAModal(${i})" class="w-8 h-8 rounded-lg grid place-items-center" style="background:var(--accent-soft);color:var(--accent-strong)"><iconify-icon icon="solar:pen-linear" width="14"></iconify-icon></button>
                  <button onclick="deleteBA(${i})" class="w-8 h-8 rounded-lg grid place-items-center text-white" style="background:var(--bad)"><iconify-icon icon="solar:trash-bin-trash-linear" width="14"></iconify-icon></button>
                </div>
              </div>
            </div>
          </div>`).join('')}</div>`
        : `<div class="text-center py-16" style="color:var(--muted)">등록된 전후사진이 없습니다. 「전후사진 추가」로 BEFORE/AFTER 사진을 올려보세요.<br><span class="text-[12px]">등록 전에는 홈페이지에 기존 샘플 전후사진이 표시됩니다.</span></div>`}
      </div>`;
  };
