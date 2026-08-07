  /* ---------- 제모 가격 안내 관리 (페이지 토글 + 가격표 → front /hairprice) ---------- */
  function hpGet(){ return Object.assign({on:false, items:[]}, KK.get('hairprice', {})); }
  function rerenderHp(){ const old=document.getElementById('view-hairprice'); if(old) old.remove(); BUILDERS.hairprice(); go('hairprice'); }
  function toggleHpOn(chk){
    const d=hpGet(); d.on=!!chk.checked;
    KK.set('hairprice', d);
    toast(d.on? '가격 안내 페이지를 홈페이지에 노출합니다.' : '가격 안내 페이지를 숨겼습니다.');
  }
  function moveHpItem(i,dir){
    const d=hpGet(); const j=i+dir;
    if(j<0||j>=d.items.length) return;
    const t=d.items[i]; d.items[i]=d.items[j]; d.items[j]=t;
    KK.set('hairprice', d); rerenderHp();
  }
  function deleteHpItem(i){
    const d=hpGet(); const it=d.items[i]; if(!it) return;
    if(!confirm('「'+(it.part||it.title||'이 항목')+'」을 삭제할까요?')) return;
    d.items.splice(i,1);
    KK.set('hairprice', d); rerenderHp();
    toast('항목을 삭제하고 저장했습니다.');
  }
  function toggleHpHelp(){
    const box=document.getElementById('hpHelpBody'), btn=document.getElementById('hpHelpBtn');
    const open=box.style.display==='none';
    box.style.display=open?'':'none';
    btn.textContent=open?'닫기':'보기';
  }
  /* ----- 항목 추가/수정 모달 ----- */
  let _hpEditIdx=null, _hpImg='';
  function ensureHpModal(){
    if(document.getElementById('hpModal')) return;
    kkModalCss();
    const wrap=document.createElement('div');
    wrap.id='hpModal';
    wrap.className='hidden fixed inset-0 z-[80] items-center justify-center bg-black/50 px-4';
    wrap.innerHTML=
      `<div class="panel rounded-2xl w-full max-w-xl max-h-[92vh] overflow-y-auto no-sb" style="background:var(--panel)">
        <div class="flex items-center justify-between px-6 py-4" style="border-bottom:1px solid var(--border)">
          <h3 id="hpMTitle" class="text-[17px] font-bold">가격 안내 추가</h3>
          <button onclick="closeHpModal()" class="w-8 h-8 rounded-lg grid place-items-center" style="color:var(--muted)"><iconify-icon icon="solar:close-circle-linear" width="20"></iconify-icon></button>
        </div>
        <div class="p-6 space-y-4">
          <div><label class="pml">제목 (그룹명) *</label><input id="hpT" class="pmi" placeholder="예: 얼굴 제모 가격 안내"></div>
          <div class="rounded-xl p-4" style="background:var(--panel-soft);border:1px solid var(--border)">
            <div class="flex items-center justify-between mb-2">
              <span class="text-[13px] font-semibold">이미지 (선택)</span>
              <button id="hpImgBtn" onclick="document.getElementById('hpImgFile').click()" class="px-3 h-8 rounded-lg text-[12px] font-semibold btn-gold">+ 파일 선택</button>
              <input id="hpImgFile" type="file" accept="image/*" class="hidden" onchange="handleHpImage(this)">
            </div>
            <div id="hpImgPrev" class="rounded-lg overflow-hidden grid place-items-center" style="min-height:64px;border:1px dashed var(--border)"><span class="text-[12px]" style="color:var(--muted)">이미지를 추가해주세요. (같은 제목 그룹 상단에 표시)</span></div>
            <button onclick="_hpImg='';renderHpImgPrev()" class="mt-2 px-3 h-7 rounded-lg text-[11.5px]" style="background:var(--panel);border:1px solid var(--border);color:var(--text-soft)">이미지 제거</button>
          </div>
          <div class="rounded-xl p-4" style="background:var(--panel-soft);border:1px solid var(--border)">
            <p class="text-[13px] font-semibold mb-2.5">가격표</p>
            <label class="pml">시술부위 *</label>
            <input id="hpPart" class="pmi mb-3" placeholder="예: 전체 얼굴">
            <div class="grid grid-cols-3 gap-3">
              <div><label class="pml">1회</label><input id="hpP1" class="pmi" placeholder="예: 30,000원 또는 -"></div>
              <div><label class="pml">5회</label><input id="hpP5" class="pmi" placeholder="-"></div>
              <div><label class="pml">10회</label><input id="hpP10" class="pmi" placeholder="-"></div>
            </div>
            <p class="text-[11.5px] mt-2" style="color:var(--muted)">금액은 자유롭게 입력하세요. (예: 30,000원 / 5.9만원 / 상담 후 안내 / -)</p>
          </div>
        </div>
        <div class="flex items-center justify-end gap-2 px-6 py-4" style="border-top:1px solid var(--border)">
          <button onclick="submitHpModal()" class="px-6 h-9 rounded-lg text-[13px] font-semibold btn-gold">등록</button>
          <button onclick="closeHpModal()" class="px-4 h-9 rounded-lg text-[13px] font-semibold" style="background:var(--panel-soft);border:1px solid var(--border);color:var(--text-soft)">취소</button>
        </div>
      </div>`;
    document.body.appendChild(wrap);
  }
  function renderHpImgPrev(){
    const box=document.getElementById('hpImgPrev');
    if(!box) return;
    box.innerHTML=_hpImg
      ? `<img src="${_hpImg}" style="width:100%;max-height:180px;object-fit:cover;display:block" alt="">`
      : `<span class="text-[12px] py-4" style="color:var(--muted)">이미지를 추가해주세요. (같은 제목 그룹 상단에 표시)</span>`;
  }
  async function handleHpImage(input){
    const file=input.files && input.files[0];
    if(!file) return;
    if(typeof window.uploadImage !== 'function'){ toast('이미지 업로드 기능을 사용할 수 없습니다. (Supabase 연결 확인)', false); input.value=''; return; }
    const btn=document.getElementById('hpImgBtn');
    const prev=btn.innerHTML; btn.innerHTML='업로드 중…'; btn.disabled=true;
    try{
      const url=await window.uploadImage(file);
      _hpImg=url; renderHpImgPrev();
      toast('이미지가 업로드됐습니다.');
    }catch(e){
      console.error(e); toast('이미지 업로드 실패: '+((e&&e.message)||e), false);
    }finally{
      btn.innerHTML=prev; btn.disabled=false; input.value='';
    }
  }
  function openHpModal(idx){
    ensureHpModal();
    const d=hpGet();
    _hpEditIdx=(idx===undefined||idx===null)?null:idx;
    const blank={title:'', img:'', part:'', p1:'', p5:'', p10:''};
    const it=_hpEditIdx===null?blank:Object.assign({},blank,d.items[_hpEditIdx]||{});
    _hpImg=it.img||'';
    document.getElementById('hpMTitle').textContent=_hpEditIdx===null?'가격 안내 추가':'가격 안내 수정';
    document.getElementById('hpT').value=it.title||'';
    document.getElementById('hpPart').value=it.part||'';
    document.getElementById('hpP1').value=it.p1||'';
    document.getElementById('hpP5').value=it.p5||'';
    document.getElementById('hpP10').value=it.p10||'';
    renderHpImgPrev();
    const m=document.getElementById('hpModal');
    m.classList.remove('hidden'); m.classList.add('flex');
  }
  function closeHpModal(){
    const m=document.getElementById('hpModal');
    if(m){ m.classList.add('hidden'); m.classList.remove('flex'); }
  }
  function submitHpModal(){
    const title=document.getElementById('hpT').value.trim();
    const part=document.getElementById('hpPart').value.trim();
    if(!title){ toast('제목을 입력해주세요.', false); return; }
    if(!part){ toast('시술부위를 입력해주세요.', false); return; }
    const d=hpGet();
    const rec={ title:title, img:(_hpImg||'').trim(), part:part,
      p1:document.getElementById('hpP1').value.trim(),
      p5:document.getElementById('hpP5').value.trim(),
      p10:document.getElementById('hpP10').value.trim() };
    if(_hpEditIdx===null) d.items.push(rec);
    else d.items[_hpEditIdx]=Object.assign({}, d.items[_hpEditIdx], rec);
    KK.set('hairprice', d);
    closeHpModal();
    rerenderHp();
    toast(_hpEditIdx===null?'항목을 추가하고 저장했습니다.':'항목을 수정하고 저장했습니다.');
  }
  BUILDERS.hairprice = function(){
    ensureHpModal();
    const d=hpGet();
    const el=makeView('hairprice');
    const helpBox=`
      <div class="rounded-xl mb-5" style="background:var(--panel);border:1px solid var(--border)">
        <div class="px-5 py-3.5 flex items-center gap-3">
          <span class="text-[13.5px] font-bold">처음이라면 사용법 보기</span>
          <span class="text-[13px]" style="color:var(--muted)">홈페이지 제모 가격 안내 페이지의 항목을 관리합니다.</span>
          <button id="hpHelpBtn" onclick="toggleHpHelp()" class="ml-auto px-4 h-8 rounded-full text-[12.5px] font-bold text-white" style="background:var(--side)">보기</button>
        </div>
        <div id="hpHelpBody" style="display:none;border-top:1px solid var(--border-soft)" class="px-6 py-4">
          <ol class="list-decimal pl-4 space-y-1.5 text-[13.5px]" style="color:var(--text-soft)">
            <li><b style="color:var(--text)">페이지 노출 여부</b> 토글로 가격 안내 페이지를 홈페이지에 노출하거나 숨길 수 있습니다.</li>
            <li><b style="color:var(--text)">새 항목 추가</b> 버튼으로 시술 항목(제목·시술부위·1/5/10회 가격)을 추가합니다. 같은 제목끼리 한 그룹으로 묶여 표시됩니다.</li>
            <li>↑↓ 버튼으로 표시 순서를 변경합니다.</li>
            <li>항목 수정은 <b style="color:var(--text)">연필 아이콘</b>, 삭제는 <b style="color:var(--text)">휴지통 아이콘</b>을 이용합니다.</li>
            <li>변경 사항은 즉시 저장되며 홈페이지에 반영됩니다. 메뉴에 넣으려면 「메뉴 관리」에서 <b style="color:var(--text)">제모 가격 안내 페이지</b>를 추가하세요.</li>
          </ol>
        </div>
      </div>`;
    el.innerHTML = pageHead('제모 가격 안내 관리','홈페이지 가격 안내 페이지의 항목을 관리합니다.',
      `<button onclick="openHpModal(null)" class="px-4 h-9 rounded-lg text-[13px] font-semibold btn-gold flex items-center gap-1.5"><iconify-icon icon="solar:add-circle-linear" width="15"></iconify-icon> 새 항목 추가</button>`) +
      helpBox +
      `<div class="panel rounded-xl px-5 py-4 mb-5 flex items-center justify-between">
        <div><p class="text-[13.5px] font-semibold">페이지 노출 여부</p><p class="text-[12px]" style="color:var(--muted)">홈페이지에 가격 안내 페이지를 노출할지 설정합니다.</p></div>
        <label class="flex items-center gap-2 text-[13px]" style="color:var(--text-soft)"><input type="checkbox" ${d.on?'checked':''} onchange="toggleHpOn(this)" class="accent-[var(--accent)]"> 노출</label>
      </div>
      <div class="panel rounded-2xl overflow-hidden"><div class="overflow-x-auto">
        <table class="tbl w-full text-[13.5px] whitespace-nowrap">
          <thead><tr style="background:var(--panel-soft);color:var(--muted)">
            <th class="px-4 py-3.5 font-semibold">순서</th><th class="px-4 py-3.5 font-semibold">제목</th><th class="px-4 py-3.5 font-semibold">시술부위</th><th class="px-4 py-3.5 font-semibold text-right">1회</th><th class="px-4 py-3.5 font-semibold text-right">5회</th><th class="px-4 py-3.5 font-semibold text-right">10회</th><th class="px-4 py-3.5 font-semibold text-right">관리</th>
          </tr></thead>
          <tbody>${d.items.length ? d.items.map((it,i)=>`<tr style="border-top:1px solid var(--border-soft)">
            <td class="px-4 py-3"><div class="flex items-center gap-1"><span class="w-6 h-6 rounded-full grid place-items-center text-[12px] font-semibold" style="background:var(--accent-soft);color:var(--accent-strong)">${i+1}</span>
              <button onclick="moveHpItem(${i},-1)" class="w-7 h-7 rounded-lg grid place-items-center" style="background:var(--panel-soft);border:1px solid var(--border);color:var(--text-soft)"><iconify-icon icon="solar:arrow-up-linear" width="13"></iconify-icon></button>
              <button onclick="moveHpItem(${i},1)" class="w-7 h-7 rounded-lg grid place-items-center" style="background:var(--panel-soft);border:1px solid var(--border);color:var(--text-soft)"><iconify-icon icon="solar:arrow-down-linear" width="13"></iconify-icon></button></div></td>
            <td class="px-4 py-3.5 font-semibold">${it.title||''} ${it.img?'<span class="chip" style="background:var(--accent-soft);color:var(--accent-strong)">이미지</span>':''}</td>
            <td class="px-4 py-3.5" style="color:var(--text-soft)">${it.part||''}</td>
            <td class="px-4 py-3.5 text-right" style="color:var(--accent-strong);font-weight:600">${it.p1||'-'}</td>
            <td class="px-4 py-3.5 text-right" style="color:var(--accent-strong);font-weight:600">${it.p5||'-'}</td>
            <td class="px-4 py-3.5 text-right" style="color:var(--accent-strong);font-weight:600">${it.p10||'-'}</td>
            <td class="px-4 py-3.5"><div class="flex items-center justify-end gap-1.5">
              <button onclick="openHpModal(${i})" class="w-8 h-8 rounded-lg grid place-items-center" style="background:var(--accent-soft);color:var(--accent-strong)"><iconify-icon icon="solar:pen-linear" width="14"></iconify-icon></button>
              <button onclick="deleteHpItem(${i})" class="w-8 h-8 rounded-lg grid place-items-center text-white" style="background:var(--bad)"><iconify-icon icon="solar:trash-bin-trash-linear" width="14"></iconify-icon></button>
            </div></td>
          </tr>`).join('') : `<tr><td colspan="7" class="text-center py-16" style="color:var(--muted)">등록된 항목이 없습니다.</td></tr>`}</tbody>
        </table>
      </div></div>`;
  };
