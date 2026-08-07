  /* ---------- 쇼츠 영상 관리 (수동 등록 → front SNS CONTENTS) ---------- */
  function shortsGet(){ return KK.get('shorts', []); }
  function rerenderShorts(){ const old=document.getElementById('view-shorts'); if(old) old.remove(); BUILDERS.shorts(); go('shorts'); }
  function shortsSyncInline(base){
    document.querySelectorAll('#view-shorts [data-shrow]').forEach(tr=>{
      const i=parseInt(tr.dataset.shrow);
      if(!base[i]) return;
      const on=tr.querySelector('[data-shf="on"]');
      if(on) base[i].on=on.checked;
    });
    return base;
  }
  function saveShorts(){
    const base=shortsSyncInline(shortsGet());
    KK.set('shorts', base);
    rerenderShorts();
    toast(STORAGE_OK? '쇼츠가 저장됐습니다. 홈페이지 「SNS CONTENTS」에 반영됩니다.' : '미리보기 환경에선 저장이 제한됩니다.', STORAGE_OK);
  }
  function moveShort(i,d){
    const base=shortsSyncInline(shortsGet());
    const j=i+d; if(j<0||j>=base.length) return;
    const t=base[i]; base[i]=base[j]; base[j]=t;
    KK.set('shorts', base); rerenderShorts();
  }
  function deleteShort(i){
    const base=shortsSyncInline(shortsGet());
    const s=base[i]; if(!s) return;
    if(!confirm('「'+(s.t||'이 쇼츠')+'」를 삭제할까요?')) return;
    base.splice(i,1);
    KK.set('shorts', base); rerenderShorts();
    toast('쇼츠를 삭제하고 저장했습니다.');
  }
  function toggleShortsHelp(){
    const box=document.getElementById('shHelpBody'), btn=document.getElementById('shHelpBtn');
    const open=box.style.display==='none';
    box.style.display=open?'':'none';
    btn.textContent=open?'닫기':'보기';
  }
  /* ----- 쇼츠 추가/수정 모달 ----- */
  let _shortEditIdx=null, _shortImg='';
  function ensureShortModal(){
    if(document.getElementById('shortModal')) return;
    kkModalCss();
    const wrap=document.createElement('div');
    wrap.id='shortModal';
    wrap.className='hidden fixed inset-0 z-[80] items-center justify-center bg-black/50 px-4';
    wrap.innerHTML=
      `<div class="panel rounded-2xl w-full max-w-xl max-h-[92vh] overflow-y-auto no-sb" style="background:var(--panel)">
        <div class="flex items-center justify-between px-6 py-4" style="border-bottom:1px solid var(--border)">
          <h3 id="shTitle" class="text-[17px] font-bold">새 쇼츠 영상 추가</h3>
          <button onclick="closeShortModal()" class="w-8 h-8 rounded-lg grid place-items-center" style="color:var(--muted)"><iconify-icon icon="solar:close-circle-linear" width="20"></iconify-icon></button>
        </div>
        <div class="p-6 space-y-4">
          <div><label class="pml">제목 *</label><input id="shT" class="pmi" placeholder="쇼츠 영상 제목"></div>
          <div><label class="pml">영상 URL * (네이버 클립 / 유튜브 쇼츠 / 인스타 릴스 공유 링크)</label><input id="shUrl" class="pmi" placeholder="예) https://naver.me/... 또는 https://youtube.com/shorts/..."></div>
          <div>
            <label class="pml">썸네일 (직접 업로드 또는 이미지 주소 입력)</label>
            <div class="flex gap-3 items-start">
              <div class="shrink-0">
                <div id="shImgPrev" class="w-24 rounded-lg overflow-hidden grid place-items-center" style="aspect-ratio:9/16;background:var(--panel-soft);border:1px solid var(--border)"></div>
              </div>
              <div class="flex-1 space-y-2">
                <button id="shImgBtn" onclick="document.getElementById('shImgFile').click()" class="w-full py-2 rounded-lg text-[12.5px] font-semibold btn-gold">썸네일 업로드</button>
                <input id="shImgFile" type="file" accept="image/*" class="hidden" onchange="handleShortImage(this)">
                <input id="shImgUrl" class="pmi" placeholder="또는 이미지 주소 직접 입력" oninput="_shortImg=this.value.trim(); renderShortImgPrev(false)">
                <p class="text-[11.5px]" style="color:var(--muted)">영상 캡처 화면을 올리면 됩니다. 없으면 기본 배경으로 표시됩니다.</p>
              </div>
            </div>
          </div>
          <div class="flex items-center justify-between rounded-xl px-4 py-3" style="background:var(--panel-soft);border:1px solid var(--border)">
            <div><p class="text-[13.5px] font-semibold">노출여부</p><p class="text-[11.5px]" style="color:var(--muted)">홈페이지에 이 쇼츠를 노출할지 여부입니다.</p></div>
            <label class="flex items-center gap-2 text-[13px]" style="color:var(--text-soft)"><input id="shOn" type="checkbox" class="accent-[var(--accent)]" checked> 노출</label>
          </div>
        </div>
        <div class="flex items-center justify-end gap-2 px-6 py-4" style="border-top:1px solid var(--border)">
          <button onclick="closeShortModal()" class="px-4 h-9 rounded-lg text-[13px] font-semibold" style="background:var(--panel-soft);border:1px solid var(--border);color:var(--text-soft)">취소</button>
          <button onclick="submitShortModal()" class="px-5 h-9 rounded-lg text-[13px] font-semibold btn-gold">저장하기</button>
        </div>
      </div>`;
    document.body.appendChild(wrap);
  }
  function renderShortImgPrev(syncInput){
    const box=document.getElementById('shImgPrev');
    if(!box) return;
    box.innerHTML=_shortImg
      ? `<img src="${_shortImg}" style="width:100%;height:100%;object-fit:cover;display:block" alt="">`
      : `<span class="text-[10px] text-center px-1" style="color:var(--muted)">썸네일<br>없음</span>`;
    if(syncInput!==false){ const u=document.getElementById('shImgUrl'); if(u) u.value=_shortImg||''; }
  }
  async function handleShortImage(input){
    const file=input.files && input.files[0];
    if(!file) return;
    if(typeof window.uploadImage !== 'function'){ toast('이미지 업로드 기능을 사용할 수 없습니다. (Supabase 연결 확인)', false); input.value=''; return; }
    const btn=document.getElementById('shImgBtn');
    const prev=btn.innerHTML; btn.innerHTML='업로드 중…'; btn.disabled=true;
    try{
      const url=await window.uploadImage(file);
      _shortImg=url; renderShortImgPrev();
      toast('썸네일이 업로드됐습니다.');
    }catch(e){
      console.error(e); toast('이미지 업로드 실패: '+((e&&e.message)||e), false);
    }finally{
      btn.innerHTML=prev; btn.disabled=false; input.value='';
    }
  }
  function openShortModal(idx){
    ensureShortModal();
    const base=shortsGet();
    _shortEditIdx=(idx===undefined||idx===null)?null:idx;
    const blank={t:'', url:'', img:'', on:true};
    const s=_shortEditIdx===null?blank:Object.assign({},blank,base[_shortEditIdx]||{});
    _shortImg=s.img||'';
    document.getElementById('shTitle').textContent=_shortEditIdx===null?'새 쇼츠 영상 추가':'쇼츠 영상 수정';
    document.getElementById('shT').value=s.t||'';
    document.getElementById('shUrl').value=s.url||'';
    document.getElementById('shOn').checked=s.on!==false;
    renderShortImgPrev();
    const m=document.getElementById('shortModal');
    m.classList.remove('hidden'); m.classList.add('flex');
  }
  function closeShortModal(){
    const m=document.getElementById('shortModal');
    if(m){ m.classList.add('hidden'); m.classList.remove('flex'); }
  }
  function submitShortModal(){
    const t=document.getElementById('shT').value.trim();
    let url=document.getElementById('shUrl').value.trim();
    if(!t){ toast('제목을 입력해주세요.', false); return; }
    if(!url){ toast('영상 URL을 입력해주세요.', false); return; }
    if(!/^https?:\/\//i.test(url)) url='https://'+url;
    const d=new Date();
    const base=shortsSyncInline(shortsGet());
    const rec={ t:t, url:url, img:(_shortImg||'').trim(), on:document.getElementById('shOn').checked,
      date:d.getFullYear()+'.'+String(d.getMonth()+1).padStart(2,'0')+'.'+String(d.getDate()).padStart(2,'0') };
    if(_shortEditIdx===null) base.push(rec);
    else base[_shortEditIdx]=Object.assign({}, base[_shortEditIdx], rec);
    KK.set('shorts', base);
    closeShortModal();
    rerenderShorts();
    toast(_shortEditIdx===null?'쇼츠를 추가하고 저장했습니다.':'쇼츠를 수정하고 저장했습니다.');
  }
  BUILDERS.shorts = function(){
    ensureShortModal();
    const list=shortsGet();
    const el=makeView('shorts');
    const helpBox=`
      <div class="rounded-xl mb-5" style="background:var(--panel);border:1px solid var(--border)">
        <div class="px-5 py-3.5 flex items-center gap-3">
          <span class="text-[13.5px] font-bold">처음이라면 사용법 보기</span>
          <span class="text-[13px]" style="color:var(--muted)">홈페이지에 노출할 쇼츠(숏폼) 영상 링크를 관리합니다.</span>
          <button id="shHelpBtn" onclick="toggleShortsHelp()" class="ml-auto px-4 h-8 rounded-full text-[12.5px] font-bold text-white" style="background:var(--side)">보기</button>
        </div>
        <div id="shHelpBody" style="display:none;border-top:1px solid var(--border-soft)" class="px-6 py-4">
          <ol class="list-decimal pl-4 space-y-1.5 text-[13.5px]" style="color:var(--text-soft)">
            <li><b style="color:var(--text)">새 쇼츠 추가</b>로 제목·영상 링크(네이버 클립/유튜브 쇼츠/릴스)·썸네일을 등록합니다.</li>
            <li>등록된 쇼츠는 홈페이지 <b style="color:var(--text)">SNS CONTENTS</b> 섹션에 노출되고, 클릭하면 해당 영상이 새 창으로 열립니다.</li>
            <li>↑↓로 순서를 바꾸고, 노출 토글로 게시/숨김을 설정합니다. (즉시 저장)</li>
          </ol>
        </div>
      </div>`;
    el.innerHTML = pageHead('쇼츠 영상 관리','홈페이지에 노출할 쇼츠 영상을 관리합니다.',
      `<button onclick="openShortModal(null)" class="px-4 h-9 rounded-lg text-[13px] font-semibold btn-gold flex items-center gap-1.5"><iconify-icon icon="solar:add-circle-linear" width="15"></iconify-icon> 새 쇼츠 추가</button>
       <button onclick="saveShorts()" class="px-4 h-9 rounded-lg text-[13px] font-semibold flex items-center gap-1.5" style="background:var(--panel);border:1px solid var(--border);color:var(--text-soft)"><iconify-icon icon="solar:upload-minimalistic-linear" width="15"></iconify-icon> 노출 저장</button>`) +
      helpBox +
      `<div class="panel rounded-2xl overflow-hidden"><div class="overflow-x-auto">
        <table class="tbl w-full text-[13.5px] whitespace-nowrap">
          <thead><tr style="background:var(--panel-soft);color:var(--muted)">
            <th class="px-4 py-3.5 font-semibold">순서</th><th class="px-4 py-3.5 font-semibold">썸네일</th><th class="px-4 py-3.5 font-semibold">제목</th><th class="px-4 py-3.5 font-semibold">URL</th><th class="px-4 py-3.5 font-semibold">등록일</th><th class="px-4 py-3.5 font-semibold">노출여부</th><th class="px-4 py-3.5 font-semibold text-right">관리</th>
          </tr></thead>
          <tbody>${list.length ? list.map((s,i)=>`<tr style="border-top:1px solid var(--border-soft)" data-shrow="${i}">
            <td class="px-4 py-3"><div class="flex items-center gap-1"><span class="w-6 h-6 rounded-full grid place-items-center text-[12px] font-semibold" style="background:var(--accent-soft);color:var(--accent-strong)">${i+1}</span>
              <button onclick="moveShort(${i},-1)" class="w-7 h-7 rounded-lg grid place-items-center" style="background:var(--panel-soft);border:1px solid var(--border);color:var(--text-soft)"><iconify-icon icon="solar:arrow-up-linear" width="13"></iconify-icon></button>
              <button onclick="moveShort(${i},1)" class="w-7 h-7 rounded-lg grid place-items-center" style="background:var(--panel-soft);border:1px solid var(--border);color:var(--text-soft)"><iconify-icon icon="solar:arrow-down-linear" width="13"></iconify-icon></button></div></td>
            <td class="px-4 py-3">${s.img?`<div style="width:36px;aspect-ratio:9/16;overflow:hidden;border-radius:6px;border:1px solid var(--border)"><img src="${s.img}" style="width:100%;height:100%;object-fit:cover;display:block" alt=""></div>`:`<div style="width:36px;aspect-ratio:9/16;border-radius:6px;border:1px solid var(--border);background:var(--panel-soft)" class="grid place-items-center"><iconify-icon icon="solar:videocamera-linear" width="14" style="color:var(--muted)"></iconify-icon></div>`}</td>
            <td class="px-4 py-3.5 font-semibold">${s.t||''}</td>
            <td class="px-4 py-3.5"><a href="${(s.url||'#').replace(/"/g,'&quot;')}" target="_blank" rel="noopener" class="underline" style="color:var(--blue)">${(s.url||'').length>34 ? (s.url||'').slice(0,34)+'…' : (s.url||'')}</a></td>
            <td class="px-4 py-3.5" style="color:var(--text-soft)">${s.date||'-'}</td>
            <td class="px-4 py-3.5"><label class="inline-flex items-center gap-1.5 text-[12.5px]" style="color:var(--text-soft)"><input type="checkbox" data-shf="on" ${s.on!==false?'checked':''} class="accent-[var(--accent)]"> 노출</label></td>
            <td class="px-4 py-3.5"><div class="flex items-center justify-end gap-1.5">
              <button onclick="openShortModal(${i})" class="w-8 h-8 rounded-lg grid place-items-center" style="background:var(--accent-soft);color:var(--accent-strong)"><iconify-icon icon="solar:pen-linear" width="14"></iconify-icon></button>
              <button onclick="deleteShort(${i})" class="w-8 h-8 rounded-lg grid place-items-center text-white" style="background:var(--bad)"><iconify-icon icon="solar:trash-bin-trash-linear" width="14"></iconify-icon></button>
            </div></td>
          </tr>`).join('') : `<tr><td colspan="7" class="text-center py-16" style="color:var(--muted)">등록된 쇼츠 영상이 없습니다. 「새 쇼츠 추가」로 등록해보세요.</td></tr>`}</tbody>
        </table>
      </div></div>`;
  };
