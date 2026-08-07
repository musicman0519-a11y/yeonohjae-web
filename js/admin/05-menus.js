  /* ---------- 메뉴 관리 (홈 상단 내비게이션 실제 관리 · 끗한의원 방식) ---------- */
  const MENU_VIEWS = [
    ['category','시술메뉴/이벤트 페이지'], ['reserve','온라인예약 페이지'], ['manage','예약 변경/취소 페이지'],
    ['ba','시술전후 페이지'], ['notes','시술 노트 페이지'], ['care','시술 후 주의사항 페이지'],
    ['doctors','의료진 소개 페이지'], ['noninsured','비급여 안내 페이지'], ['network','지점 안내 페이지'],
    ['about','병원 소개 (홈 소개 섹션)'], ['hairprice','제모 가격 안내 페이지'], ['home','홈 화면'], ['ext','외부 링크 (URL 직접 입력)'],
  ];
  const DEFAULT_MENUS = [
    {id:'m1',  label:'시술메뉴/이벤트', view:'category', parent:'', on:true},
    {id:'m2',  label:'온라인예약',     view:'reserve',  parent:'', on:true},
    {id:'m21', label:'온라인예약',     view:'reserve',  parent:'m2', on:true},
    {id:'m22', label:'예약 변경/취소', view:'manage',   parent:'m2', on:true},
    {id:'m3',  label:'시술전후',       view:'ba',       parent:'', on:true},
    {id:'m4',  label:'연오재한의원',   view:'about',    parent:'', on:true},
    {id:'m41', label:'병원 소개',      view:'about',    parent:'m4', on:true},
    {id:'m42', label:'의료진 소개',    view:'doctors',  parent:'m4', on:true},
    {id:'m43', label:'지점 안내',      view:'network',  parent:'m4', on:true},
    {id:'m5',  label:'시술 노트',      view:'notes',    parent:'', on:true},
  ];
  function menusGet(){ return KK.get('menus', DEFAULT_MENUS); }
  function rerenderMenus(){ const old=document.getElementById('view-menus'); if(old) old.remove(); BUILDERS.menus(); go('menus'); }
  function menuHrefLabel(m){ return m.view==='ext' ? (m.url||'외부 링크') : '/'+(m.view||''); }
  function toggleMenuOn(id){
    const arr=menusGet(); const m=arr.find(x=>x.id===id); if(!m) return;
    m.on = m.on===false ? true : false;
    KK.set('menus', arr);
    rerenderMenus();
    toast(m.on ? '메뉴를 노출로 변경하고 저장했습니다.' : '메뉴를 숨김으로 변경하고 저장했습니다.');
  }
  function moveMenu(id, d){
    const arr=menusGet(); const i=arr.findIndex(x=>x.id===id); if(i<0) return;
    const sib = arr.map((x,idx)=>({x:x,idx:idx})).filter(o=>(o.x.parent||'')===(arr[i].parent||''));
    const pos = sib.findIndex(o=>o.idx===i); const t = pos+d;
    if(t<0 || t>=sib.length) return;
    const j=sib[t].idx; const tmp=arr[i]; arr[i]=arr[j]; arr[j]=tmp;
    KK.set('menus', arr);
    rerenderMenus();
  }
  function deleteMenu(id){
    const arr=menusGet(); const m=arr.find(x=>x.id===id); if(!m) return;
    const kids=arr.filter(x=>x.parent===id);
    if(!confirm('「'+(m.label||'이 메뉴')+'」 메뉴를 삭제할까요?'+(kids.length? '\n하위 메뉴 '+kids.length+'개도 함께 삭제됩니다.':'')+'\n삭제하면 홈페이지 상단 메뉴에서도 사라집니다.')) return;
    KK.set('menus', arr.filter(x=>x.id!==id && x.parent!==id));
    rerenderMenus();
    toast('메뉴를 삭제하고 저장했습니다.');
  }
  function toggleMenuHelp(){
    const box=document.getElementById('menuHelpBody'), btn=document.getElementById('menuHelpBtn');
    const open=box.style.display==='none';
    box.style.display=open?'':'none';
    btn.textContent=open?'닫기':'보기';
  }

  /* ----- 메뉴 추가/수정 모달 ----- */
  let _menuEditId=null, _menuLang='ko', _menuLabels=null;
  const MENU_LANGS=[['ko','KO'],['en','EN'],['ja','JA'],['zh','ZH'],['th','TH']];
  function ensureMenuModal(){
    if(document.getElementById('menuModal')) return;
    kkModalCss();
    const wrap=document.createElement('div');
    wrap.id='menuModal';
    wrap.className='hidden fixed inset-0 z-[80] items-center justify-center bg-black/50 px-4';
    wrap.innerHTML=
      `<div class="panel rounded-2xl w-full max-w-xl max-h-[94vh] overflow-y-auto no-sb" style="background:var(--panel)">
        <div class="flex items-center justify-between px-6 py-4" style="border-bottom:1px solid var(--border)">
          <h3 id="mnTitle" class="text-[17px] font-bold">메뉴 수정</h3>
          <button onclick="closeMenuModal()" class="w-8 h-8 rounded-lg grid place-items-center" style="color:var(--muted)"><iconify-icon icon="solar:close-circle-linear" width="20"></iconify-icon></button>
        </div>
        <div class="p-6 space-y-4">
          <div>
            <label class="pml">라벨 언어</label>
            <div id="mnLangTabs" class="flex items-center gap-1.5">
              ${MENU_LANGS.map(([c,l])=>`<button onclick="pickMenuLang('${c}')" data-mlang="${c}" class="px-3 h-8 rounded-lg text-[12px] font-bold" style="${c==='ko'?'background:var(--side);color:#fff':'background:var(--panel);border:1px solid var(--border);color:var(--text-soft)'}">${l}</button>`).join('')}
            </div>
          </div>
          <div>
            <label class="pml">레이블 (<span id="mnLangName">KO</span>)</label>
            <input id="mnLabel" class="pmi" placeholder="예) 시술메뉴/이벤트">
            <p id="mnLabelHint" class="text-[11.5px] mt-1" style="color:var(--muted)">한국어(KO)는 필수입니다. 다른 언어를 비워두면 홈에서 한국어로 표시됩니다.</p>
          </div>
          <div>
            <label class="pml">링크 (연결할 페이지)</label>
            <select id="mnView" class="pmi" onchange="mnViewChange()">
              ${MENU_VIEWS.map(v=>`<option value="${v[0]}">${v[1]}</option>`).join('')}
            </select>
            <input id="mnUrl" class="pmi mt-2 hidden" placeholder="예) https://blog.naver.com/yeonohjae">
          </div>
          <div>
            <label class="pml">상위 메뉴</label>
            <select id="mnParent" class="pmi"></select>
            <p class="text-[11.5px] mt-1" style="color:var(--muted)">「없음」이면 상단 메뉴로, 상위 메뉴를 고르면 그 아래 드롭다운 메뉴로 들어갑니다.</p>
          </div>
          <div class="rounded-xl p-4" style="background:var(--panel-soft);border:1px solid var(--border)">
            <label class="flex items-center gap-2 text-[13.5px] font-semibold" style="color:var(--text)"><input id="mnOn" type="checkbox" class="accent-[var(--accent)]" checked> 전체 활성화</label>
            <div class="flex items-center gap-4 mt-2.5">
              ${MENU_LANGS.map(([c,l])=>`<label class="flex items-center gap-1.5 text-[12.5px]" style="color:var(--text-soft)"><input id="mnL_${c}" type="checkbox" class="accent-[var(--accent)]" checked> ${l}</label>`).join('')}
            </div>
            <p class="text-[11.5px] mt-2" style="color:var(--muted)">전체가 비활성화면 모든 언어에서 숨김. 각 언어 체크를 끄면 해당 언어에서만 숨깁니다.</p>
          </div>
        </div>
        <div class="flex items-center justify-end gap-2 px-6 py-4" style="border-top:1px solid var(--border)">
          <button onclick="closeMenuModal()" class="px-4 h-9 rounded-lg text-[13px] font-semibold" style="background:var(--panel-soft);border:1px solid var(--border);color:var(--text-soft)">취소</button>
          <button onclick="submitMenuModal()" class="px-5 h-9 rounded-lg text-[13px] font-semibold btn-gold">저장하기</button>
        </div>
      </div>`;
    document.body.appendChild(wrap);
  }
  function pickMenuLang(c){
    _menuLabels[_menuLang]=document.getElementById('mnLabel').value;
    _menuLang=c;
    document.querySelectorAll('#mnLangTabs [data-mlang]').forEach(b=>{
      b.style.cssText = b.dataset.mlang===c ? 'background:var(--side);color:#fff' : 'background:var(--panel);border:1px solid var(--border);color:var(--text-soft)';
    });
    document.getElementById('mnLangName').textContent=c.toUpperCase();
    document.getElementById('mnLabel').value=_menuLabels[c]||'';
  }
  function mnViewChange(){
    const ext=document.getElementById('mnView').value==='ext';
    document.getElementById('mnUrl').classList.toggle('hidden', !ext);
  }
  function openMenuModal(id){
    ensureMenuModal();
    const arr=menusGet();
    _menuEditId=(id===undefined||id===null)?null:id;
    const blank={label:'', ml:{}, view:'category', url:'', parent:'', on:true, langs:{}};
    const m=_menuEditId===null?blank:Object.assign({},blank,arr.find(x=>x.id===_menuEditId)||{});
    _menuLabels={ko:m.label||'', en:(m.ml||{}).en||'', ja:(m.ml||{}).ja||'', zh:(m.ml||{}).zh||'', th:(m.ml||{}).th||''};
    _menuLang='ko';
    document.querySelectorAll('#mnLangTabs [data-mlang]').forEach(b=>{
      b.style.cssText = b.dataset.mlang==='ko' ? 'background:var(--side);color:#fff' : 'background:var(--panel);border:1px solid var(--border);color:var(--text-soft)';
    });
    document.getElementById('mnLangName').textContent='KO';
    document.getElementById('mnLabel').value=_menuLabels.ko;
    document.getElementById('mnTitle').textContent=_menuEditId===null?'새 메뉴 추가':'메뉴 수정';
    document.getElementById('mnView').value=m.view||'category';
    document.getElementById('mnUrl').value=m.url||'';
    mnViewChange();
    const tops=arr.filter(x=>!x.parent && x.id!==_menuEditId);
    document.getElementById('mnParent').innerHTML='<option value="">없음 (상단 메뉴)</option>'+tops.map(t=>`<option value="${t.id}" ${t.id===m.parent?'selected':''}>${t.label}</option>`).join('');
    document.getElementById('mnOn').checked=m.on!==false;
    MENU_LANGS.forEach(([c])=>{ document.getElementById('mnL_'+c).checked=!(m.langs && m.langs[c]===false); });
    const mm=document.getElementById('menuModal');
    mm.classList.remove('hidden'); mm.classList.add('flex');
  }
  function closeMenuModal(){
    const mm=document.getElementById('menuModal');
    if(mm){ mm.classList.add('hidden'); mm.classList.remove('flex'); }
  }
  function submitMenuModal(){
    _menuLabels[_menuLang]=document.getElementById('mnLabel').value;
    const ko=(_menuLabels.ko||'').trim();
    if(!ko){ toast('한국어(KO) 레이블은 필수입니다.', false); return; }
    const view=document.getElementById('mnView').value;
    let url=document.getElementById('mnUrl').value.trim();
    if(view==='ext'){
      if(!url){ toast('외부 링크 URL을 입력해주세요.', false); return; }
      if(!/^https?:\/\//i.test(url)) url='https://'+url;
    } else { url=''; }
    const parent=document.getElementById('mnParent').value;
    const arr=menusGet();
    if(parent && _menuEditId && arr.some(x=>x.parent===_menuEditId)){
      toast('하위 메뉴가 있는 메뉴는 다른 메뉴 아래로 옮길 수 없습니다. (2단계까지 지원)', false); return;
    }
    const ml={};
    ['en','ja','zh','th'].forEach(c=>{ const v=(_menuLabels[c]||'').trim(); if(v) ml[c]=v; });
    const langs={};
    MENU_LANGS.forEach(([c])=>{ langs[c]=document.getElementById('mnL_'+c).checked; });
    const rec={
      label:ko, ml:ml, view:view, url:url, parent:parent,
      on:document.getElementById('mnOn').checked, langs:langs,
    };
    if(_menuEditId===null){
      rec.id='m'+Date.now().toString(36)+Math.floor(Math.random()*1000);
      arr.push(rec);
    } else {
      const i=arr.findIndex(x=>x.id===_menuEditId);
      if(i>=0) arr[i]=Object.assign({}, arr[i], rec);
    }
    KK.set('menus', arr);
    closeMenuModal();
    rerenderMenus();
    toast(_menuEditId===null?'메뉴를 추가하고 저장했습니다.':'메뉴를 수정하고 저장했습니다.');
  }

  BUILDERS.menus = function(){
    ensureMenuModal();
    const arr=menusGet();
    const tops=arr.filter(m=>!m.parent);
    const kidsOf=id=>arr.filter(m=>m.parent===id);
    const toggle=m=>`<button onclick="toggleMenuOn('${m.id}')" class="inline-flex items-center gap-1.5">
        ${m.on!==false?'<span class="text-[12px] font-semibold" style="color:var(--blue)">노출중</span>':'<span class="text-[12px] font-semibold" style="color:var(--muted)">숨김</span>'}
        <span class="w-9 h-5 rounded-full relative" style="background:${m.on!==false?'var(--blue)':'#cbc4ba'}">
          <span class="absolute top-0.5 w-4 h-4 rounded-full bg-white" style="${m.on!==false?'right:2px':'left:2px'}"></span></span></button>`;
    const langChips=m=>{
      const off=MENU_LANGS.filter(([c])=>m.langs && m.langs[c]===false).map(([c,l])=>l);
      const mlOn=['en','ja','zh','th'].filter(c=>m.ml && m.ml[c]);
      let out='';
      if(mlOn.length) out+=`<span class="chip" style="background:var(--accent-soft);color:var(--accent-strong)">번역 ${mlOn.map(c=>c.toUpperCase()).join('·')}</span>`;
      if(off.length) out+=`<span class="chip" style="background:var(--bad-bg);color:var(--bad)">${off.join('·')} 숨김</span>`;
      return out;
    };
    const btns=m=>`<div class="flex items-center gap-1.5">
        <button onclick="moveMenu('${m.id}',-1)" class="w-8 h-8 rounded-lg grid place-items-center" style="background:var(--panel-soft);border:1px solid var(--border);color:var(--text-soft)"><iconify-icon icon="solar:arrow-up-linear" width="14"></iconify-icon></button>
        <button onclick="moveMenu('${m.id}',1)" class="w-8 h-8 rounded-lg grid place-items-center" style="background:var(--panel-soft);border:1px solid var(--border);color:var(--text-soft)"><iconify-icon icon="solar:arrow-down-linear" width="14"></iconify-icon></button>
        <button onclick="openMenuModal('${m.id}')" class="w-8 h-8 rounded-lg grid place-items-center" style="background:var(--accent-soft);color:var(--accent-strong)"><iconify-icon icon="solar:pen-linear" width="15"></iconify-icon></button>
        <button onclick="deleteMenu('${m.id}')" class="w-8 h-8 rounded-lg grid place-items-center text-white" style="background:var(--bad)"><iconify-icon icon="solar:trash-bin-trash-linear" width="15"></iconify-icon></button></div>`;
    const helpBox=`
      <div class="rounded-xl mb-5" style="background:var(--panel);border:1px solid var(--border)">
        <div class="px-5 py-3.5 flex items-center gap-3">
          <span class="text-[13.5px] font-bold">처음이라면 사용법 보기</span>
          <span class="text-[13px]" style="color:var(--muted)">홈페이지 상단 네비게이션 메뉴 항목을 추가·수정·순서 변경합니다.</span>
          <button id="menuHelpBtn" onclick="toggleMenuHelp()" class="ml-auto px-4 h-8 rounded-full text-[12.5px] font-bold text-white" style="background:var(--side)">보기</button>
        </div>
        <div id="menuHelpBody" style="display:none;border-top:1px solid var(--border-soft)" class="px-6 py-4">
          <ol class="list-decimal pl-4 space-y-1.5 text-[13.5px]" style="color:var(--text-soft)">
            <li><b style="color:var(--text)">↑↓ 버튼</b>으로 순서를 바꾸고, 토글로 <b style="color:var(--text)">노출/숨김</b>을 전환합니다. (즉시 저장·홈 반영)</li>
            <li>연필 버튼으로 <b style="color:var(--text)">레이블(언어별)·링크·상위 메뉴·언어별 활성화</b>를 수정합니다.</li>
            <li>상위 메뉴 아래에 하위 메뉴를 넣으면 홈에서 <b style="color:var(--text)">드롭다운</b>으로 표시됩니다.</li>
            <li>「새 메뉴 추가」로 외부 링크(네이버 블로그 등)도 메뉴에 넣을 수 있습니다.</li>
          </ol>
        </div>
      </div>`;
    const el=makeView('menus');
    el.innerHTML = pageHead('메뉴 관리','홈페이지 상단 메뉴를 관리합니다. (변경 즉시 저장·홈 반영)',
      `<button onclick="openMenuModal(null)" class="px-4 h-9 rounded-lg text-[13px] font-semibold btn-gold flex items-center gap-1.5"><iconify-icon icon="solar:add-circle-linear" width="15"></iconify-icon> 새 메뉴 추가</button>`) +
      helpBox +
      `<div class="space-y-3">${tops.map(m=>`
        <div class="panel rounded-2xl p-3.5">
          <div class="flex items-center gap-3 px-2 py-2 flex-wrap">
            <iconify-icon icon="solar:menu-dots-bold" width="16" style="color:var(--muted)"></iconify-icon>
            <span class="chip text-white" style="background:#6d5ce0">상위</span>
            <span class="font-bold text-[15px]">${m.label||''}</span>
            <span class="text-[12.5px]" style="color:var(--accent-strong)">${menuHrefLabel(m)}</span>
            ${langChips(m)}
            <span class="ml-auto flex items-center gap-3">${toggle(m)}${btns(m)}</span>
          </div>
          <div class="mt-2 rounded-xl p-1.5" style="background:var(--panel-soft); border:1px dashed var(--border)">
            ${kidsOf(m.id).length? kidsOf(m.id).map(c=>`
              <div class="flex items-center gap-3 px-3 py-2.5 rounded-lg flex-wrap" style="background:var(--panel); border:1px solid var(--border-soft); margin:4px">
                <iconify-icon icon="solar:arrow-right-down-linear" width="14" style="color:var(--muted)"></iconify-icon>
                <span class="text-[14px] font-medium">${c.label||''}</span>
                <span class="text-[12px]" style="color:var(--accent-strong)">${menuHrefLabel(c)}</span>
                ${langChips(c)}
                <span class="ml-auto flex items-center gap-3">${toggle(c)}${btns(c)}</span>
              </div>`).join('')
              : `<p class="text-center text-[12.5px] py-3" style="color:var(--muted)">하위 메뉴 없음 — 메뉴 수정에서 상위 메뉴를 지정하면 여기로 들어옵니다.</p>`}
          </div>
        </div>`).join('')}</div>`;
  };
