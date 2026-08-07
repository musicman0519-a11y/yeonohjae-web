  /* ---------- 카테고리 관리 (시술 / 권종 / 고민 3분류) ---------- */

  const DEFAULT_VOUCHERS = [
    {id:'v1', name:'평일 한정',              on:true, days:[1,2,3,4,5],   before:''},
    {id:'v2', name:'평일+일요일 한정',        on:true, days:[0,1,2,3,4,5], before:''},
    {id:'v3', name:'평일 18시 이전 한정',     on:true, days:[1,2,3,4,5],   before:'18'},
    {id:'v4', name:'평일 18시 이전+일요일 한정', on:true, days:[0,1,2,3,4,5], before:'18'},
    {id:'v5', name:'화수목 한정',             on:true, days:[2,3,4],       before:''},
    {id:'v6', name:'화수목 18시 이전',        on:true, days:[2,3,4],       before:'18'}
  ];
  const DEFAULT_CONCERNS = [
    {id:'c1', name:'미백/기미/색소',      on:true},
    {id:'c2', name:'다이어트',            on:true},
    {id:'c3', name:'리프팅/탄력/윤곽',    on:true},
    {id:'c4', name:'여드름/모공/흉터',    on:true},
    {id:'c5', name:'코/윤곽/실리프팅',    on:true},
    {id:'c6', name:'제모/문신제거',       on:true},
    {id:'c7', name:'콜라겐 볼륨침 CoVA',  on:true}
  ];
  const DAY_NAMES = ['일','월','화','수','목','금','토'];

  let _catMeta=null, _vcList=null, _ccList=null;
  let _catEdit=null, _vcEdit=null, _ccEdit=null, _vcCond=null;
  let _catQuery='';

  function cUid(p){ return (p||'x')+Date.now().toString(36)+Math.random().toString(36).slice(2,6); }
  const cEsc = v => String(v==null?'':v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/"/g,'&quot;');

  /* ===== 데이터 ===== */
  function catsMetaGet(){
    const saved   = KK.get('categoriesMeta', null);
    const visible = KK.get('categories', DEFAULT_CATEGORIES) || [];
    const prodCats= (KK.get('products', DEFAULT_PRODUCTS) || []).map(p=>p.cat).filter(Boolean);
    let meta;
    if(Array.isArray(saved) && saved.length){
      meta = saved.map(x => typeof x==='string'
        ? {name:x, on:true, chart:'', prio:0}
        : {name:x.name, on:x.on!==false, chart:x.chart||'', prio:parseInt(x.prio)||0});
    } else {
      const names=[];
      DEFAULT_CATEGORIES.forEach(c=>{ if(c && !names.includes(c)) names.push(c); });
      visible.forEach(c=>{ if(c && !names.includes(c)) names.push(c); });
      meta = names.map(n=>({name:n, on: n==='전체보기' ? true : visible.includes(n), chart:'', prio:0}));
    }
    prodCats.forEach(c=>{ if(!meta.some(m=>m.name===c)) meta.push({name:c, on:true, chart:'', prio:0}); });
    const i=meta.findIndex(m=>m.name==='전체보기');
    if(i<0) meta.unshift({name:'전체보기', on:true, chart:'', prio:0});
    else { const t=meta.splice(i,1)[0]; t.on=true; meta.unshift(t); }
    meta.forEach((m,idx)=>{ if(!m.prio) m.prio=idx; });
    return meta;
  }
  function vouchersGet(){
    const v=KK.get('voucherTypes', null);
    if(!Array.isArray(v) || !v.length) return JSON.parse(JSON.stringify(DEFAULT_VOUCHERS));
    return v.map(x=>({id:x.id||cUid('v'), name:x.name||'', on:x.on!==false, days:Array.isArray(x.days)?x.days:[], before:x.before||''}));
  }
  function concernsGet(){
    const c=KK.get('concernCats', null);
    if(!Array.isArray(c) || !c.length) return JSON.parse(JSON.stringify(DEFAULT_CONCERNS));
    return c.map(x=> typeof x==='string' ? {id:cUid('c'), name:x, on:true} : {id:x.id||cUid('c'), name:x.name||'', on:x.on!==false});
  }
  /* 다른 화면에서 쓰는 공용 조회 */
  function voucherById(id){ return vouchersGet().find(v=>v.id===id) || null; }
  function voucherLabel(v){
    if(!v) return '';
    const d=v.days||[];
    let base='';
    if(d.length && d.length<7){
      const wk=[1,2,3,4,5], isWeek = wk.every(x=>d.includes(x)) && !d.includes(6);
      if(isWeek && d.includes(0)) base='평일+일요일';
      else if(isWeek && d.length===5) base='평일';
      else if(d.length===1) base=DAY_NAMES[d[0]]+'요일';
      else base=d.slice().sort().map(x=>DAY_NAMES[x]).join('');
    }
    const hr=v.before? (v.before+'시 이전') : '';
    const txt=[base,hr].filter(Boolean).join(' ');
    return txt ? txt+' 한정' : '';
  }
  function catLoad(){
    _catMeta = catsMetaGet().map(m=>Object.assign({}, m, {_orig:m.name}));
    _vcList  = vouchersGet();
    _ccList  = concernsGet();
  }
  function catProductCount(name){
    return (KK.get('products', DEFAULT_PRODUCTS) || []).filter(p=>p.cat===name).length;
  }
  function rerenderCategories(){
    const old=document.getElementById('view-categories'); if(old) old.remove();
    BUILDERS.categories(); go('categories');
  }

  /* ===== 시술 카테고리 ===== */
  function catStash(){
    document.querySelectorAll('#view-categories [data-crow]').forEach(row=>{
      const i=parseInt(row.dataset.crow); const m=_catMeta[i]; if(!m) return;
      const nm=row.querySelector('[data-cf="name"]');
      if(nm && m.name!=='전체보기'){ const v=nm.value.trim(); if(v) m.name=v; }
      const ch=row.querySelector('[data-cf="chart"]'); if(ch) m.chart=ch.value.trim();
      const pr=row.querySelector('[data-cf="prio"]');  if(pr) m.prio=parseInt(pr.value)||0;
      const on=row.querySelector('[data-cf="on"]');    if(on) m.on = (m.name==='전체보기') ? true : on.checked;
    });
  }
  function catSearch(v){ catStash(); _catQuery=(v||'').trim().toLowerCase(); rerenderCategories(); }
  function catToggleEdit(i){ catStash(); _catEdit = (_catEdit===i? null : i); rerenderCategories(); }
  function catMove(i,d){
    catStash();
    const j=i+d;
    if(i<1 || j<1 || j>=_catMeta.length) return;
    const t=_catMeta[i]; _catMeta[i]=_catMeta[j]; _catMeta[j]=t;
    _catMeta.forEach((m,idx)=>{ m.prio=idx; });
    _catEdit=null; rerenderCategories();
  }
  function catSetPrio(i,v){
    catStash();
    let to=parseInt(v);
    if(isNaN(to) || i<1) return rerenderCategories();
    to=Math.max(1, Math.min(_catMeta.length-1, to));
    const t=_catMeta.splice(i,1)[0]; _catMeta.splice(to,0,t);
    _catMeta.forEach((m,idx)=>{ m.prio=idx; });
    _catEdit=null; rerenderCategories();
  }
  function catAdd(){
    catStash();
    const el=document.getElementById('catNewName');
    const v=(el&&el.value||'').trim();
    if(!v){ toast('추가할 카테고리 이름을 입력해주세요.', false); if(el) el.focus(); return; }
    if(_catMeta.some(m=>m.name===v)){ toast('이미 있는 카테고리입니다.', false); return; }
    _catMeta.push({name:v, on:true, chart:'', prio:_catMeta.length, _orig:''});
    _catEdit=_catMeta.length-1;
    rerenderCategories();
    toast('카테고리를 추가했습니다. 「전체 저장」을 눌러야 홈페이지에 반영됩니다.');
  }
  function catDelete(i){
    catStash();
    const m=_catMeta[i]; if(!m || m.name==='전체보기') return;
    const n=catProductCount(m._orig || m.name);
    if(n>0){
      alert('「'+m.name+'」 카테고리를 쓰는 시술 상품이 '+n+'개 있습니다.\n\n먼저 「시술 상품 관리」에서 해당 상품들의 카테고리를 바꾼 뒤 삭제해주세요.\n(상품이 사라지는 것을 막기 위한 안전장치입니다)');
      return;
    }
    if(!confirm('「'+m.name+'」 카테고리를 삭제할까요?')) return;
    _catMeta.splice(i,1);
    _catEdit=null; rerenderCategories();
    toast('삭제했습니다. 「전체 저장」을 눌러야 홈페이지에 반영됩니다.');
  }

  /* ===== 권종 카테고리 ===== */
  function vcStash(){
    document.querySelectorAll('#view-categories [data-vrow]').forEach(row=>{
      const i=parseInt(row.dataset.vrow); const v=_vcList[i]; if(!v) return;
      const nm=row.querySelector('[data-vf="name"]'); if(nm){ const t=nm.value.trim(); if(t) v.name=t; }
      const on=row.querySelector('[data-vf="on"]');   if(on) v.on=on.checked;
      const bf=row.querySelector('[data-vf="before"]'); if(bf) v.before=bf.value.trim();
      const days=row.querySelectorAll('[data-vday]');
      if(days.length) v.days=Array.from(days).filter(x=>x.checked).map(x=>parseInt(x.dataset.vday));
    });
  }
  function vcToggleEdit(i){ vcStash(); _vcEdit=(_vcEdit===i?null:i); _vcCond=null; rerenderCategories(); }
  function vcToggleCond(i){ vcStash(); _vcCond=(_vcCond===i?null:i); _vcEdit=null; rerenderCategories(); }
  function vcMove(i,d){ vcStash(); const j=i+d; if(j<0||j>=_vcList.length) return; const t=_vcList[i]; _vcList[i]=_vcList[j]; _vcList[j]=t; _vcEdit=null;_vcCond=null; rerenderCategories(); }
  function vcAdd(){
    vcStash();
    const el=document.getElementById('vcNewName');
    const v=(el&&el.value||'').trim();
    if(!v){ toast('추가할 권종 이름을 입력해주세요.', false); if(el) el.focus(); return; }
    _vcList.push({id:cUid('v'), name:v, on:true, days:[], before:''});
    _vcCond=_vcList.length-1;
    rerenderCategories();
    toast('권종을 추가했습니다. 달력 버튼으로 사용 조건을 정해주세요.');
  }
  function vcDelete(i){
    vcStash();
    const v=_vcList[i]; if(!v) return;
    const used=productsGet().reduce((n,p)=>n+(p.details||[]).filter(d=>d.voucher===v.id).length, 0);
    if(used>0){
      alert('「'+v.name+'」 권종을 쓰는 상세 상품이 '+used+'개 있습니다.\n\n먼저 「시술 상품 관리」에서 해당 상세 상품의 권종을 바꾼 뒤 삭제해주세요.');
      return;
    }
    if(!confirm('「'+v.name+'」 권종을 삭제할까요?')) return;
    _vcList.splice(i,1); _vcEdit=null; _vcCond=null; rerenderCategories();
  }
  function vcApplyPreset(i, preset){
    vcStash();
    const v=_vcList[i]; if(!v) return;
    if(preset==='week')      { v.days=[1,2,3,4,5]; }
    else if(preset==='weeksun'){ v.days=[0,1,2,3,4,5]; }
    else if(preset==='all')  { v.days=[]; v.before=''; }
    rerenderCategories();
  }

  /* ===== 고민 카테고리 ===== */
  function ccStash(){
    document.querySelectorAll('#view-categories [data-ccrow]').forEach(row=>{
      const i=parseInt(row.dataset.ccrow); const c=_ccList[i]; if(!c) return;
      const nm=row.querySelector('[data-ccf="name"]'); if(nm){ const t=nm.value.trim(); if(t) c.name=t; }
      const on=row.querySelector('[data-ccf="on"]');   if(on) c.on=on.checked;
    });
  }
  function ccToggleEdit(i){ ccStash(); _ccEdit=(_ccEdit===i?null:i); rerenderCategories(); }
  function ccMove(i,d){ ccStash(); const j=i+d; if(j<0||j>=_ccList.length) return; const t=_ccList[i]; _ccList[i]=_ccList[j]; _ccList[j]=t; _ccEdit=null; rerenderCategories(); }
  function ccAdd(){
    ccStash();
    const el=document.getElementById('ccNewName');
    const v=(el&&el.value||'').trim();
    if(!v){ toast('추가할 고민 카테고리 이름을 입력해주세요.', false); if(el) el.focus(); return; }
    if(_ccList.some(c=>c.name===v)){ toast('이미 있는 고민 카테고리입니다.', false); return; }
    _ccList.push({id:cUid('c'), name:v, on:true});
    rerenderCategories();
  }
  function ccDelete(i){
    ccStash();
    const c=_ccList[i]; if(!c) return;
    if(!confirm('「'+c.name+'」 고민 카테고리를 삭제할까요?')) return;
    _ccList.splice(i,1); _ccEdit=null; rerenderCategories();
  }

  /* ===== 저장 ===== */
  function saveCategories(){
    catStash(); vcStash(); ccStash();
    const renames=_catMeta.filter(m=>m._orig && m._orig!==m.name).map(m=>({from:m._orig, to:m.name}));
    if(renames.length){
      const base=productsGet();
      let changed=0;
      base.forEach(p=>{ const r=renames.find(x=>x.from===p.cat); if(r){ p.cat=r.to; changed++; } });
      if(changed) KK.set('products', base);
    }
    _catMeta.forEach((m,idx)=>{ if(!m.prio && m.prio!==0) m.prio=idx; });
    const clean=_catMeta.map((m,idx)=>({name:m.name, on:m.on!==false, chart:m.chart||'', prio:(m.prio||idx)}));
    KK.set('categoriesMeta', clean);
    KK.set('categories', clean.filter(m=>m.on!==false).map(m=>m.name));
    KK.set('voucherTypes', _vcList.map(v=>({id:v.id, name:v.name, on:v.on!==false, days:v.days||[], before:v.before||''})));
    KK.set('concernCats', _ccList.map(c=>({id:c.id, name:c.name, on:c.on!==false})));
    _catMeta.forEach(m=>{ m._orig=m.name; });
    _catEdit=null; _vcEdit=null; _ccEdit=null; _vcCond=null;
    toast(STORAGE_OK
      ? ('카테고리를 저장했습니다.'+(renames.length? ' 이름이 바뀐 '+renames.length+'건은 상품에도 반영했습니다.':''))
      : '미리보기 환경에선 저장이 제한됩니다.', STORAGE_OK);
    rerenderCategories();
  }
  function catHelpOn(){ try{ return localStorage.getItem('kkeut:_catHelp')==='1'; }catch(e){ return false; } }
  function toggleCatHelp(){ try{ localStorage.setItem('kkeut:_catHelp', catHelpOn()?'0':'1'); }catch(e){} rerenderCategories(); }

  /* ===== 화면 ===== */
  BUILDERS.categories = function(){
    if(typeof peCss==='function') peCss();
    catCss();
    if(!_catMeta) catLoad();
    const el = makeView('categories');
    const q=_catQuery;
    const chartOpts=[...new Set(_catMeta.map(m=>m.chart).filter(Boolean))];
    const help=catHelpOn();

    /* --- 1열: 시술 카테고리 --- */
    const shown=_catMeta.filter(m=>!q || m.name.toLowerCase().includes(q));
    const colCat =
      '<div class="panel rounded-2xl p-5">'+
        '<div class="flex items-center justify-between mb-3 flex-wrap gap-2">'+
          '<h2 class="text-[15px] font-bold">시술 카테고리 <span class="text-[12px]" style="color:var(--muted);font-weight:500">'+_catMeta.length+'개</span></h2>'+
          '<input value="'+cEsc(_catQuery)+'" oninput="catSearch(this.value)" placeholder="검색" class="pmi" style="width:120px;padding:6px 10px">'+
        '</div>'+
        '<div class="flex items-center gap-2 mb-4">'+
          '<input id="catNewName" placeholder="새 카테고리" class="pmi flex-1" onkeydown="if(event.key===\'Enter\')catAdd()">'+
          '<button onclick="catAdd()" class="px-3.5 h-9 rounded-lg text-[13px] font-semibold btn-gold shrink-0 flex items-center gap-1"><iconify-icon icon="solar:add-circle-linear" width="15"></iconify-icon> 추가</button>'+
        '</div>'+
        (shown.length ? _catMeta.map((m,i)=>{
          if(q && !m.name.toLowerCase().includes(q)) return '';
          const fixed = m.name==='전체보기';
          const open  = _catEdit===i;
          const cnt   = catProductCount(m._orig || m.name);
          return '<div class="ctCard'+(open?' open':'')+'" data-crow="'+i+'">'+
            '<div class="flex items-start gap-2">'+
              '<p class="flex-1 text-[13.5px] font-semibold leading-snug break-keep">'+cEsc(m.name)+
                (fixed?'<span class="text-[11px] ml-1" style="color:var(--muted);font-weight:400">· 고정</span>':'')+'</p>'+
              (fixed ? '<span style="width:104px"></span>' :
                '<button class="ctIco" onclick="catMove('+i+',-1)" title="위로"><iconify-icon icon="solar:arrow-up-linear" width="14"></iconify-icon></button>'+
                '<button class="ctIco" onclick="catMove('+i+',1)" title="아래로"><iconify-icon icon="solar:arrow-down-linear" width="14"></iconify-icon></button>'+
                '<button class="ctIco'+(open?' act':'')+'" onclick="catToggleEdit('+i+')" title="수정"><iconify-icon icon="solar:pen-2-linear" width="14"></iconify-icon></button>'+
                '<button class="ctIco bad" onclick="catDelete('+i+')" title="삭제"><iconify-icon icon="solar:trash-bin-trash-linear" width="14"></iconify-icon></button>')+
            '</div>'+
            '<div class="flex items-center gap-1.5 flex-wrap mt-2">'+
              '<span class="ctTag">'+(m.chart? cEsc(m.chart) : '차트 분류 없음')+'</span>'+
              '<span class="chip" style="background:var(--accent-soft);color:var(--accent-strong)">상품 '+cnt+'개</span>'+
              '<span class="chip" style="background:'+(m.on!==false?'var(--good-bg)':'var(--panel-soft)')+';color:'+(m.on!==false?'var(--good)':'var(--muted)')+'">'+(m.on!==false?'노출':'숨김')+'</span>'+
              (fixed?'':'<span class="ctPrio">대표 우선순위 <b>'+(i)+'</b></span>')+
            '</div>'+
            (open && !fixed ? '<div class="ctEdit">'+
              '<label class="pml">카테고리 이름</label>'+
              '<input data-cf="name" value="'+cEsc(m.name)+'" class="pmi mb-2.5">'+
              '<label class="pml">차트 분류 (연동용 · 선택)</label>'+
              '<input data-cf="chart" value="'+cEsc(m.chart)+'" list="ctChartOpts" placeholder="예) 리프팅" class="pmi mb-2.5">'+
              '<div class="flex items-end gap-2.5">'+
                '<div style="width:120px"><label class="pml">대표 우선순위</label>'+
                  '<input data-cf="prio" type="number" min="1" value="'+i+'" onchange="catSetPrio('+i+', this.value)" class="pmi"></div>'+
                '<label class="flex items-center gap-2 text-[12.5px] pb-2.5" style="color:var(--text-soft)"><input type="checkbox" data-cf="on" '+(m.on!==false?'checked':'')+' class="pSw"> 홈페이지 노출</label>'+
              '</div>'+
            '</div>' : '')+
          '</div>';
        }).join('') : '<p class="text-center py-10 text-[13px]" style="color:var(--muted)">검색 결과가 없습니다.</p>')+
        '<datalist id="ctChartOpts">'+chartOpts.map(c=>'<option value="'+cEsc(c)+'">').join('')+'</datalist>'+
      '</div>';

    /* --- 2열: 권종 카테고리 --- */
    const colVc =
      '<div class="panel rounded-2xl p-5">'+
        '<h2 class="text-[15px] font-bold mb-3">권종 카테고리 <span class="text-[12px]" style="color:var(--muted);font-weight:500">'+_vcList.length+'개</span></h2>'+
        '<div class="flex items-center gap-2 mb-4">'+
          '<input id="vcNewName" placeholder="새 권종" class="pmi flex-1" onkeydown="if(event.key===\'Enter\')vcAdd()">'+
          '<button onclick="vcAdd()" class="px-3.5 h-9 rounded-lg text-[13px] font-semibold btn-gold shrink-0 flex items-center gap-1"><iconify-icon icon="solar:add-circle-linear" width="15"></iconify-icon> 추가</button>'+
        '</div>'+
        (_vcList.length ? _vcList.map((v,i)=>{
          const openE=_vcEdit===i, openC=_vcCond===i;
          const lb=voucherLabel(v);
          return '<div class="ctCard'+(openE||openC?' open':'')+'" data-vrow="'+i+'">'+
            '<div class="flex items-center gap-2">'+
              '<p class="flex-1 text-[13.5px] font-semibold break-keep">'+cEsc(v.name)+'</p>'+
              '<button class="ctIco" onclick="vcMove('+i+',-1)" title="위로"><iconify-icon icon="solar:arrow-up-linear" width="14"></iconify-icon></button>'+
              '<button class="ctIco" onclick="vcMove('+i+',1)" title="아래로"><iconify-icon icon="solar:arrow-down-linear" width="14"></iconify-icon></button>'+
              '<button class="ctIco'+(openC?' act':'')+'" onclick="vcToggleCond('+i+')" title="사용 조건"><iconify-icon icon="solar:calendar-linear" width="14"></iconify-icon></button>'+
              '<button class="ctIco'+(openE?' act':'')+'" onclick="vcToggleEdit('+i+')" title="이름 수정"><iconify-icon icon="solar:pen-2-linear" width="14"></iconify-icon></button>'+
              '<button class="ctIco bad" onclick="vcDelete('+i+')" title="삭제"><iconify-icon icon="solar:trash-bin-trash-linear" width="14"></iconify-icon></button>'+
            '</div>'+
            '<div class="flex items-center gap-1.5 flex-wrap mt-2">'+
              '<span class="ctTag">'+(lb||'조건 없음 (언제나 사용)')+'</span>'+
              '<span class="chip" style="background:'+(v.on!==false?'var(--good-bg)':'var(--panel-soft)')+';color:'+(v.on!==false?'var(--good)':'var(--muted)')+'">'+(v.on!==false?'사용':'중지')+'</span>'+
            '</div>'+
            (openE ? '<div class="ctEdit">'+
              '<label class="pml">권종 이름</label>'+
              '<input data-vf="name" value="'+cEsc(v.name)+'" class="pmi mb-2">'+
              '<label class="flex items-center gap-2 text-[12.5px]" style="color:var(--text-soft)"><input type="checkbox" data-vf="on" '+(v.on!==false?'checked':'')+' class="pSw"> 사용</label>'+
            '</div>' : '')+
            (openC ? '<div class="ctEdit">'+
              '<label class="pml">사용 가능 요일</label>'+
              '<div class="flex items-center gap-1 flex-wrap mb-2.5">'+
                DAY_NAMES.map((d,di)=>'<label class="ctDay'+((v.days||[]).includes(di)?' on':'')+'"><input type="checkbox" data-vday="'+di+'" '+((v.days||[]).includes(di)?'checked':'')+' onchange="vcStash();rerenderCategories()" style="display:none">'+d+'</label>').join('')+
              '</div>'+
              '<div class="flex items-center gap-1.5 mb-2.5 flex-wrap">'+
                '<button onclick="vcApplyPreset('+i+',\'week\')" class="ctMini">평일</button>'+
                '<button onclick="vcApplyPreset('+i+',\'weeksun\')" class="ctMini">평일+일요일</button>'+
                '<button onclick="vcApplyPreset('+i+',\'all\')" class="ctMini">조건 없음</button>'+
              '</div>'+
              '<label class="pml">시간 제한 (선택)</label>'+
              '<div class="flex items-center gap-2">'+
                '<input data-vf="before" type="number" min="1" max="23" value="'+cEsc(v.before)+'" placeholder="18" class="pmi" style="width:90px">'+
                '<span class="text-[12.5px]" style="color:var(--text-soft)">시 이전까지만 사용 가능 (비우면 제한 없음)</span>'+
              '</div>'+
              '<p class="text-[12px] mt-2.5" style="color:var(--muted)">미리보기: <b>'+(voucherLabel(v)||'조건 없음')+'</b></p>'+
            '</div>' : '')+
          '</div>';
        }).join('') : '<p class="text-center py-10 text-[13px]" style="color:var(--muted)">등록된 권종이 없습니다.</p>')+
      '</div>';

    /* --- 3열: 고민 카테고리 --- */
    const colCc =
      '<div class="panel rounded-2xl p-5">'+
        '<h2 class="text-[15px] font-bold mb-3">고민 카테고리 <span class="text-[12px]" style="color:var(--muted);font-weight:500">'+_ccList.length+'개</span></h2>'+
        '<div class="flex items-center gap-2 mb-4">'+
          '<input id="ccNewName" placeholder="새 고민 카테고리" class="pmi flex-1" onkeydown="if(event.key===\'Enter\')ccAdd()">'+
          '<button onclick="ccAdd()" class="px-3.5 h-9 rounded-lg text-[13px] font-semibold btn-gold shrink-0 flex items-center gap-1"><iconify-icon icon="solar:add-circle-linear" width="15"></iconify-icon> 추가</button>'+
        '</div>'+
        (_ccList.length ? _ccList.map((c,i)=>{
          const open=_ccEdit===i;
          return '<div class="ctCard'+(open?' open':'')+'" data-ccrow="'+i+'">'+
            '<div class="flex items-center gap-2">'+
              '<p class="flex-1 text-[13.5px] font-semibold break-keep">'+cEsc(c.name)+'</p>'+
              '<button class="ctIco" onclick="ccMove('+i+',-1)" title="위로"><iconify-icon icon="solar:arrow-up-linear" width="14"></iconify-icon></button>'+
              '<button class="ctIco" onclick="ccMove('+i+',1)" title="아래로"><iconify-icon icon="solar:arrow-down-linear" width="14"></iconify-icon></button>'+
              '<button class="ctIco'+(open?' act':'')+'" onclick="ccToggleEdit('+i+')" title="수정"><iconify-icon icon="solar:pen-2-linear" width="14"></iconify-icon></button>'+
              '<button class="ctIco bad" onclick="ccDelete('+i+')" title="삭제"><iconify-icon icon="solar:trash-bin-trash-linear" width="14"></iconify-icon></button>'+
            '</div>'+
            (open ? '<div class="ctEdit">'+
              '<label class="pml">고민 카테고리 이름</label>'+
              '<input data-ccf="name" value="'+cEsc(c.name)+'" class="pmi mb-2">'+
              '<label class="flex items-center gap-2 text-[12.5px]" style="color:var(--text-soft)"><input type="checkbox" data-ccf="on" '+(c.on!==false?'checked':'')+' class="pSw"> 노출</label>'+
            '</div>'
            : '<div class="mt-2"><span class="chip" style="background:'+(c.on!==false?'var(--good-bg)':'var(--panel-soft)')+';color:'+(c.on!==false?'var(--good)':'var(--muted)')+'">'+(c.on!==false?'노출':'숨김')+'</span></div>')+
          '</div>';
        }).join('') : '<p class="text-center py-10 text-[13px]" style="color:var(--muted)">등록된 고민 카테고리가 없습니다.</p>')+
      '</div>';

    el.innerHTML =
      '<div class="panel rounded-xl px-4 py-3 mb-4 flex items-center gap-3 flex-wrap">'+
        '<iconify-icon icon="solar:info-circle-linear" width="17" style="color:var(--accent-strong)"></iconify-icon>'+
        '<span class="text-[13px] font-semibold">처음이라면 사용법 보기</span>'+
        '<span class="text-[12.5px]" style="color:var(--muted)">시술 카테고리, 권종 카테고리, 고민 카테고리를 관리합니다.</span>'+
        '<button onclick="toggleCatHelp()" class="ml-auto px-3 h-8 rounded-lg text-[12.5px] font-semibold" style="background:var(--panel-soft);border:1px solid var(--border);color:var(--text-soft)">'+(help?'닫기':'보기')+'</button>'+
      '</div>'+
      (help ? '<div class="panel rounded-xl p-5 mb-4 text-[13px] leading-relaxed" style="color:var(--text-soft)">'+
        '<p>1. 아래 3개 섹션(<b>시술 카테고리 / 권종 카테고리 / 고민 카테고리</b>)을 각각 편집합니다.</p>'+
        '<p>2. 시술 카테고리를 추가하면 <b>시술 상품 등록 시 선택 옵션</b>으로 나타납니다.</p>'+
        '<p>3. <b>연필</b> 버튼을 누르면 이름·차트 분류·대표 우선순위를 고칠 수 있는 칸이 열립니다.</p>'+
        '<p>4. 권종의 <b>달력</b> 버튼에서 요일·시간 조건을 정하면, 상세 상품에 권종을 붙였을 때 홈페이지에 조건이 함께 표시됩니다.</p>'+
        '<p>5. 상품이 연결된 시술 카테고리·권종은 실수 방지를 위해 <b>삭제되지 않습니다</b>. 먼저 상품에서 분류를 바꿔주세요.</p>'+
        '<p>6. 무엇을 바꾸든 마지막에 <b>「전체 저장」</b>을 눌러야 홈페이지에 반영됩니다.</p>'+
      '</div>' : '')+
      pageHead('카테고리 관리','홈페이지 시술메뉴 분류와 이용권 조건, 고민 분류를 관리합니다.',
        '<button onclick="saveCategories()" class="px-4 h-9 rounded-lg text-[13px] font-semibold btn-gold flex items-center gap-1.5"><iconify-icon icon="solar:upload-minimalistic-linear" width="15"></iconify-icon> 전체 저장 (홈 반영)</button>')+
      '<div class="grid gap-4 items-start" style="grid-template-columns:repeat(auto-fit,minmax(300px,1fr))">'+colCat+colVc+colCc+'</div>';

    renderIcons(el);
  };

  function catCss(){
    if(document.getElementById('catCss')) return;
    const st=document.createElement('style'); st.id='catCss';
    st.textContent=[
      '.ctCard{border:1px solid var(--border);border-radius:13px;background:var(--panel-soft);padding:12px 13px;margin-bottom:9px}',
      '.ctCard.open{border-color:var(--accent);background:var(--panel)}',
      '.ctIco{width:28px;height:28px;border-radius:8px;display:grid;place-items:center;background:var(--panel);border:1px solid var(--border);color:var(--text-soft);flex:0 0 auto}',
      '.ctIco:hover{color:var(--accent-strong);border-color:var(--accent)}',
      '.ctIco.act{background:var(--accent);border-color:var(--accent);color:#fff}',
      '.ctIco.bad{background:var(--bad);border-color:var(--bad);color:#fff}',
      '.ctTag{font-size:11px;font-weight:600;padding:3px 9px;border-radius:7px;background:#eaf0ff;color:#2549b8}',
      'html.dark .ctTag{background:#1e2a4a;color:#9db6ff}',
      '.ctPrio{font-size:11px;color:var(--muted)}',
      '.ctPrio b{color:var(--text-soft)}',
      '.ctEdit{margin-top:11px;padding-top:11px;border-top:1px dashed var(--border)}',
      '.ctDay{width:32px;height:32px;border-radius:9px;display:inline-grid;place-items:center;font-size:12.5px;font-weight:600;background:var(--panel);border:1px solid var(--border);color:var(--text-soft);cursor:pointer}',
      '.ctDay.on{background:var(--accent);border-color:var(--accent);color:#fff}',
      '.ctMini{padding:0 9px;height:27px;border-radius:7px;font-size:11.5px;font-weight:600;background:var(--panel);border:1px solid var(--border);color:var(--text-soft)}',
      '.ctMini:hover{border-color:var(--accent);color:var(--accent-strong)}'
    ].join('');
    document.head.appendChild(st);
  }
