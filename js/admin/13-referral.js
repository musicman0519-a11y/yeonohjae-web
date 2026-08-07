  /* ---------- 추천인 코드 관리 (코드 발급 + 공유 링크) ---------- */
  const REF_CHANNELS=['파트너(지인/인플루언서)','기존 고객','직원','광고/미디어','기타'];
  function refGet(){ return KK.get('referrals', []); }
  function rerenderRef(){ const old=document.getElementById('view-referral'); if(old) old.remove(); BUILDERS.referral(); go('referral'); }
  function refLink(code){ return location.origin + location.pathname.replace(/admin\.html.*/, '') + '?ref=' + encodeURIComponent(code||''); }
  function toggleRefOn(i){
    const arr=refGet(); if(!arr[i]) return;
    arr[i].on = arr[i].on===false ? true : false;
    KK.set('referrals', arr); rerenderRef();
    toast(arr[i].on? '코드를 활성화했습니다.' : '코드를 비활성화했습니다. (링크 자체는 유효)');
  }
  function deleteRef(i){
    const arr=refGet(); const r=arr[i]; if(!r) return;
    if(!confirm('「'+(r.name||r.code)+'」 추천인 코드를 삭제할까요?')) return;
    arr.splice(i,1);
    KK.set('referrals', arr); rerenderRef();
    toast('추천인 코드를 삭제했습니다.');
  }
  function copyRefLink(code){
    const link=refLink(code);
    function done(){ toast('추천 링크가 복사되었습니다.'); }
    try{
      if(navigator.clipboard && navigator.clipboard.writeText){ navigator.clipboard.writeText(link).then(done, function(){ prompt('아래 링크를 복사하세요', link); }); }
      else prompt('아래 링크를 복사하세요', link);
    }catch(e){ prompt('아래 링크를 복사하세요', link); }
  }
  function toggleRefHelp(){
    const box=document.getElementById('refHelpBody'), btn=document.getElementById('refHelpBtn');
    const open=box.style.display==='none';
    box.style.display=open?'':'none';
    btn.textContent=open?'닫기':'보기';
  }
  function genRefCode(){
    const c='yj-'+Math.random().toString(36).slice(2,8);
    const inp=document.getElementById('rfCode');
    if(inp){ inp.value=c; refPreviewUpdate(); }
  }
  function refPreviewUpdate(){
    const c=(document.getElementById('rfCode')||{value:''}).value.trim();
    const pv=document.getElementById('rfPreview');
    if(pv) pv.value=refLink(c||'…');
  }
  /* ----- 코드 등록/수정 모달 ----- */
  let _refEditIdx=null;
  function ensureRefModal(){
    if(document.getElementById('refModal')) return;
    kkModalCss();
    const wrap=document.createElement('div');
    wrap.id='refModal';
    wrap.className='hidden fixed inset-0 z-[80] items-center justify-center bg-black/50 px-4';
    wrap.innerHTML=
      `<div class="panel rounded-2xl w-full max-w-xl max-h-[92vh] overflow-y-auto no-sb" style="background:var(--panel)">
        <div class="flex items-center justify-between px-6 py-4" style="border-bottom:1px solid var(--border)">
          <h3 id="rfTitle" class="text-[17px] font-bold">새 코드 등록</h3>
          <button onclick="closeRefModal()" class="w-8 h-8 rounded-lg grid place-items-center" style="color:var(--muted)"><iconify-icon icon="solar:close-circle-linear" width="20"></iconify-icon></button>
        </div>
        <div class="p-6 space-y-4">
          <div>
            <label class="pml">코드 *</label>
            <div class="flex gap-2">
              <input id="rfCode" class="pmi" placeholder="예: jw-friend1" oninput="refPreviewUpdate()">
              <button onclick="genRefCode()" class="shrink-0 px-4 h-10 rounded-lg text-[12.5px] font-bold text-white" style="background:var(--side)">코드 생성하기</button>
            </div>
            <p class="text-[11.5px] mt-1" style="color:var(--muted)">영문/숫자/-_.만, 최대 64자.</p>
          </div>
          <div><label class="pml">표시 이름 *</label><input id="rfName" class="pmi" placeholder="예: 원장님 친구 A"></div>
          <div><label class="pml">채널</label><select id="rfChannel" class="pmi">${REF_CHANNELS.map(c=>`<option>${c}</option>`).join('')}</select></div>
          <div class="flex items-center gap-3">
            <label class="pml" style="margin:0">활성화</label>
            <label class="flex items-center gap-2 text-[13px]" style="color:var(--text-soft)"><input id="rfOn" type="checkbox" class="accent-[var(--accent)]" checked> ON</label>
            <span class="text-[11.5px]" style="color:var(--muted)">비활성 시 신규 집계 제외 (링크 자체는 유효)</span>
          </div>
          <div>
            <label class="pml">지급 방식</label>
            <div class="flex gap-2">
              <select id="rfPayType" class="pmi" style="width:130px"><option value="won">정액(원)</option><option value="pct">정률(%)</option></select>
              <input id="rfPayAmt" type="number" min="0" class="pmi" placeholder="0">
            </div>
          </div>
          <div>
            <label class="pml">공유 링크 미리보기</label>
            <input id="rfPreview" class="pmi" readonly style="color:var(--muted)">
          </div>
          <p class="text-[11.5px] break-keep" style="color:var(--muted)">※ 가입자 수·사용 현황 집계는 예약 시스템(네이버예약/자체예약) 연동 후 제공됩니다. 지금은 코드 발급과 링크 공유용으로 사용하세요. 링크로 들어온 방문은 기록됩니다.</p>
        </div>
        <div class="flex items-center justify-end gap-2 px-6 py-4" style="border-top:1px solid var(--border)">
          <button onclick="closeRefModal()" class="px-4 h-9 rounded-lg text-[13px] font-semibold" style="background:var(--panel-soft);border:1px solid var(--border);color:var(--text-soft)">닫기</button>
          <button onclick="submitRefModal()" class="px-5 h-9 rounded-lg text-[13px] font-semibold text-white" style="background:#5849d4">저장</button>
        </div>
      </div>`;
    document.body.appendChild(wrap);
  }
  function openRefModal(idx){
    ensureRefModal();
    const arr=refGet();
    _refEditIdx=(idx===undefined||idx===null)?null:idx;
    const blank={code:'', name:'', channel:REF_CHANNELS[0], on:true, payType:'won', payAmt:0};
    const r=_refEditIdx===null?blank:Object.assign({},blank,arr[_refEditIdx]||{});
    document.getElementById('rfTitle').textContent=_refEditIdx===null?'새 코드 등록':'코드 수정';
    document.getElementById('rfCode').value=r.code||'';
    document.getElementById('rfCode').disabled=_refEditIdx!==null;
    document.getElementById('rfName').value=r.name||'';
    document.getElementById('rfChannel').value=r.channel||REF_CHANNELS[0];
    document.getElementById('rfOn').checked=r.on!==false;
    document.getElementById('rfPayType').value=r.payType||'won';
    document.getElementById('rfPayAmt').value=r.payAmt||0;
    refPreviewUpdate();
    const m=document.getElementById('refModal');
    m.classList.remove('hidden'); m.classList.add('flex');
  }
  function closeRefModal(){
    const m=document.getElementById('refModal');
    if(m){ m.classList.add('hidden'); m.classList.remove('flex'); }
  }
  function submitRefModal(){
    const code=document.getElementById('rfCode').value.trim();
    const name=document.getElementById('rfName').value.trim();
    if(!code){ toast('코드를 입력하거나 「코드 생성하기」를 눌러주세요.', false); return; }
    if(!/^[a-zA-Z0-9\-_.]{1,64}$/.test(code)){ toast('코드는 영문/숫자/-_.만, 최대 64자입니다.', false); return; }
    if(!name){ toast('표시 이름을 입력해주세요.', false); return; }
    const arr=refGet();
    const dup=arr.findIndex(r=>r.code===code);
    if(dup>=0 && dup!==_refEditIdx){ toast('이미 사용 중인 코드입니다.', false); return; }
    const d=new Date();
    const rec={ code:code, name:name,
      channel:document.getElementById('rfChannel').value,
      on:document.getElementById('rfOn').checked,
      payType:document.getElementById('rfPayType').value,
      payAmt:parseInt(document.getElementById('rfPayAmt').value)||0,
      date:(_refEditIdx!==null && arr[_refEditIdx] && arr[_refEditIdx].date) || (d.getFullYear()+'.'+String(d.getMonth()+1).padStart(2,'0')+'.'+String(d.getDate()).padStart(2,'0')) };
    if(_refEditIdx===null) arr.push(rec);
    else arr[_refEditIdx]=Object.assign({}, arr[_refEditIdx], rec);
    KK.set('referrals', arr);
    closeRefModal();
    rerenderRef();
    toast(_refEditIdx===null?'추천인 코드를 발급했습니다.':'코드를 수정했습니다.');
  }
  let _refQuery='';
  function refSearch(v){ _refQuery=(v||'').trim().toLowerCase(); rerenderRef(); }
  BUILDERS.referral = function(){
    ensureRefModal();
    const all=refGet();
    const list=_refQuery? all.filter(r=>((r.name||'')+(r.code||'')).toLowerCase().includes(_refQuery)) : all;
    const el=makeView('referral');
    const helpBox=`
      <div class="rounded-xl mb-5" style="background:var(--panel);border:1px solid var(--border)">
        <div class="px-5 py-3.5 flex items-center gap-3">
          <span class="text-[13.5px] font-bold">처음이라면 사용법 보기</span>
          <span class="text-[13px]" style="color:var(--muted)">고객 추천인 코드를 발급하고 링크를 공유합니다.</span>
          <button id="refHelpBtn" onclick="toggleRefHelp()" class="ml-auto px-4 h-8 rounded-full text-[12.5px] font-bold text-white" style="background:var(--side)">보기</button>
        </div>
        <div id="refHelpBody" style="display:none;border-top:1px solid var(--border-soft)" class="px-6 py-4">
          <ol class="list-decimal pl-4 space-y-1.5 text-[13.5px]" style="color:var(--text-soft)">
            <li><b style="color:var(--text)">새 코드</b>로 추천인 코드를 발급합니다. (코드 생성하기 버튼으로 자동 생성 가능)</li>
            <li><b style="color:var(--text)">링크 아이콘</b>을 클릭하면 추천 링크(?ref=코드)가 복사됩니다 — 추천인에게 이 링크를 공유하세요.</li>
            <li>비활성화하면 신규 집계에서 제외됩니다. (링크 자체는 유효)</li>
            <li>가입자 수·사용 현황 집계는 예약 시스템 연동 후 제공됩니다.</li>
          </ol>
        </div>
      </div>`;
    el.innerHTML = pageHead('추천인 코드 관리','추천인 코드를 발급하고 사용 현황을 확인합니다.') +
      helpBox +
      `<div class="flex flex-wrap items-center gap-2 mb-5">
        <input id="refSearchInp" placeholder="이름/코드로 검색" value="${_refQuery.replace(/"/g,'&quot;')}" oninput="refSearch(this.value)" class="px-3 h-9 rounded-lg text-[13px] w-56" style="background:var(--panel);border:1px solid var(--border);color:var(--text)">
        <button onclick="refSearch('')" class="px-3 h-9 rounded-lg text-[13px] font-semibold" style="background:var(--panel-soft);border:1px solid var(--border);color:var(--text-soft)">검색 초기화</button>
        <button onclick="openRefModal(null)" class="ml-auto px-4 h-9 rounded-lg text-[13px] font-semibold text-white flex items-center gap-1.5" style="background:#5849d4"><iconify-icon icon="solar:add-circle-linear" width="15"></iconify-icon> 새 코드</button>
      </div>
      ${list.length ? `<div class="panel rounded-2xl overflow-hidden"><div class="overflow-x-auto">
        <table class="tbl w-full text-[13.5px] whitespace-nowrap">
          <thead><tr style="background:var(--panel-soft);color:var(--muted)">
            <th class="px-4 py-3.5 font-semibold">코드</th><th class="px-4 py-3.5 font-semibold">표시 이름</th><th class="px-4 py-3.5 font-semibold">채널</th><th class="px-4 py-3.5 font-semibold">지급</th><th class="px-4 py-3.5 font-semibold">등록일</th><th class="px-4 py-3.5 font-semibold">사용 현황</th><th class="px-4 py-3.5 font-semibold">활성</th><th class="px-4 py-3.5 font-semibold text-right">관리</th>
          </tr></thead>
          <tbody>${list.map(r=>{ const i=all.indexOf(r); return `<tr style="border-top:1px solid var(--border-soft)">
            <td class="px-4 py-3.5"><span class="chip" style="background:#e7edff;color:#2549b8">${r.code||''}</span></td>
            <td class="px-4 py-3.5 font-semibold">${r.name||''}</td>
            <td class="px-4 py-3.5" style="color:var(--text-soft)">${r.channel||''}</td>
            <td class="px-4 py-3.5" style="color:var(--text-soft)">${r.payType==='pct' ? (r.payAmt||0)+'%' : (r.payAmt||0).toLocaleString('ko-KR')+'원'}</td>
            <td class="px-4 py-3.5" style="color:var(--text-soft)">${r.date||'-'}</td>
            <td class="px-4 py-3.5" style="color:var(--muted)">예약 연동 후 집계</td>
            <td class="px-4 py-3.5">${r.on!==false?`<span class="chip" style="background:var(--good-bg);color:var(--good)">ON</span>`:`<span class="chip" style="background:var(--bad-bg);color:var(--bad)">OFF</span>`}</td>
            <td class="px-4 py-3.5"><div class="flex items-center justify-end gap-1.5">
              <button onclick="copyRefLink('${(r.code||'').replace(/'/g,"\\'")}')" title="추천 링크 복사" class="w-8 h-8 rounded-lg grid place-items-center" style="background:var(--panel-soft);border:1px solid var(--border);color:var(--blue)"><iconify-icon icon="solar:link-linear" width="14"></iconify-icon></button>
              <button onclick="toggleRefOn(${i})" class="px-2.5 h-8 rounded-lg text-[12px] font-semibold" style="background:var(--panel-soft);border:1px solid var(--border);color:var(--text-soft)">${r.on!==false?'끄기':'켜기'}</button>
              <button onclick="openRefModal(${i})" class="w-8 h-8 rounded-lg grid place-items-center" style="background:var(--accent-soft);color:var(--accent-strong)"><iconify-icon icon="solar:pen-linear" width="14"></iconify-icon></button>
              <button onclick="deleteRef(${i})" class="w-8 h-8 rounded-lg grid place-items-center text-white" style="background:var(--bad)"><iconify-icon icon="solar:trash-bin-trash-linear" width="14"></iconify-icon></button>
            </div></td>
          </tr>`; }).join('')}</tbody>
        </table>
      </div></div>`
      : `<div class="panel rounded-2xl p-14 text-center"><p style="color:var(--text-soft)">등록된 추천인 코드가 없습니다.</p></div>`}`;
  };
