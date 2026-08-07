  /* ---------- 시술 상품 관리 (카드형 목록 + 풀 편집기 + 엑셀) ---------- */
  const PRODUCT_TYPES = [
    {v:'promo', l:'장비 프로모 배너'},
    {v:'photo', l:'모델·제품 사진'},
    {v:'ba',    l:'전후사진'},
  ];

  function pUid(pre){ return (pre||'x') + Date.now().toString(36) + Math.random().toString(36).slice(2,7); }

  function productCats(){
    const fromCats  = KK.get('categories', DEFAULT_CATEGORIES) || [];
    const fromProds = (KK.get('products', DEFAULT_PRODUCTS) || []).map(p=>p.cat);
    const out = [];
    [...fromCats, ...DEFAULT_CATEGORIES, ...fromProds].forEach(c=>{
      if(c && c!=='전체보기' && !out.includes(c)) out.push(c);
    });
    return out;
  }

  /* 구버전 데이터 자동 변환 */
  function migrateProducts(arr){
    const list = arr || [];
    list.forEach((p,i)=>{
      if(!p.id) p.id='p'+i+'_'+Math.random().toString(36).slice(2,6);
      if(!Array.isArray(p.details)){
        p.details = (p.event||p.price) ? [{t:p.event||p.title||'대표 상품', body:'', price:0, sale:p.price||0, on:true, perType:'always', start:'', end:'', avail:'', notice:''}] : [];
      }
      p.desc=p.desc||''; p.youtube=p.youtube||''; p.pageTitle=p.pageTitle||'';
      p.body=p.body||'';                                   /* 상품 상세 설명(본문) */
      p.stepsTitle=p.stepsTitle||''; p.steps=p.steps||[];
      p.basic=p.basic||{time:'',anesthesia:'',daily:'',duration:''};
      p.points=p.points||[]; p.qna=p.qna||[]; p.cautions=p.cautions||[];
      p.groups = Array.isArray(p.groups) ? p.groups : [];   /* 중분류(옵션 그룹) */
      p.groups.forEach(g=>{ if(!g.id) g.id=pUid('g'); if(g.on===undefined) g.on=true; });
      p.details.forEach(d=>{ if(!d.id) d.id=pUid('d'); if(d.gid===undefined) d.gid=''; if(d.body===undefined) d.body=''; if(d.voucher===undefined) d.voucher=''; });
      /* 추천 시술: 문자열 배열 → {id,name,note} 배열 */
      const recs = p.recs || [];
      p.recs = recs.map(r=>{
        if(r && typeof r === 'object') return {id:r.id||'', name:r.name||'', note:r.note||''};
        const nm = String(r||'');
        const hit = list.find(x=>x.big===nm || x.title===nm);
        return {id:hit?hit.id:'', name:nm, note:''};
      }).filter(r=>r.name || r.id);
    });
    return list;
  }
  function productsGet(){ return migrateProducts(KK.get('products', DEFAULT_PRODUCTS)); }
  function productById(id){ return productsGet().find(p=>p.id===id) || null; }

  /* 카테고리 카드용 대표값(첫 공개 상세 상품) 파생 */
  function syncLegacy(p){
    const vis=(p.details||[]).filter(d=>d.on!==false);
    if(vis.length){ p.event=vis[0].t||''; p.price=parseInt(vis[0].sale)||0; }
  }
  function productsPut(base, msg){
    base.forEach(syncLegacy);
    KK.set('products', base);
    if(msg) toast(STORAGE_OK ? msg : '미리보기 환경에선 저장이 제한됩니다.', STORAGE_OK);
  }

  /* ===================== 목록 화면 ===================== */
  let _prodQuery='', _prodCat='', _prodSort=null;   /* _prodSort: 정렬 수정 모드 임시 배열 */

  function prodHelpOn(){ try{ return localStorage.getItem('kkeut:_prodHelp')==='1'; }catch(e){ return false; } }
  function toggleProdHelp(){
    try{ localStorage.setItem('kkeut:_prodHelp', prodHelpOn()?'0':'1'); }catch(e){}
    rerenderProducts();
  }
  function prodSearch(v){
    _prodQuery=(v||'').trim().toLowerCase();
    renderProdGrid();
  }
  function prodCatFilter(v){ _prodCat=v||''; renderProdGrid(); }

  function prodFiltered(){
    const q=_prodQuery, c=_prodCat;
    return productsGet().map((p,i)=>({p,i})).filter(({p})=>{
      if(c && p.cat!==c) return false;
      if(!q) return true;
      const hay=[p.big,p.title,p.pageTitle,p.cat,p.script,p.desc,
        ...(p.details||[]).map(d=>d.t)].join(' ').toLowerCase();
      return hay.includes(q);
    });
  }

  function toggleProdOn(id, checked){
    const base=productsGet();
    const p=base.find(x=>x.id===id); if(!p) return;
    p.on=!!checked;
    productsPut(base, '「'+(p.big||'상품')+'」 공개 상태를 저장했습니다.');
  }
  function duplicateProduct(id){
    const base=productsGet();
    const src=base.find(x=>x.id===id); if(!src) return;
    const copy=JSON.parse(JSON.stringify(src));
    copy.id=pUid('p');
    copy.big=(src.big||'상품')+' (복사본)';
    copy.title=copy.big;
    copy.on=false;
    (copy.details||[]).forEach(d=>{ d.id=pUid('d'); });
    (copy.groups||[]).forEach(g=>{
      const old=g.id; g.id=pUid('g');
      (copy.details||[]).forEach(d=>{ if(d.gid===old) d.gid=g.id; });
    });
    const at=base.findIndex(x=>x.id===id);
    base.splice(at+1, 0, copy);
    productsPut(base, '상품을 복사했습니다. 비공개 상태이니 내용을 확인 후 공개해주세요.');
    rerenderProducts();
  }
  function deleteProductById(id){
    const base=productsGet();
    const at=base.findIndex(x=>x.id===id); if(at<0) return;
    const p=base[at];
    if(!confirm('「'+(p.big||p.title||'이 상품')+'」 상품을 삭제할까요?\n상세 상품도 함께 삭제되며 홈페이지에서 사라집니다.')) return;
    base.splice(at,1);
    productsPut(base, '상품을 삭제하고 저장했습니다.');
    rerenderProducts();
  }
  /* 구버전 인덱스 기반 호출 호환 */
  function deleteProduct(i){ const p=productsGet()[i]; if(p) deleteProductById(p.id); }

  function rerenderProducts(){
    const old = document.getElementById('view-products');
    if(old) old.remove();
    BUILDERS.products();
    go('products');
  }

  function prodCardHTML(p, idx){
    const price=(function(){ const vis=(p.details||[]).filter(d=>d.on!==false); return vis.length? (parseInt(vis[0].sale)||0).toLocaleString('ko-KR')+'원' : '-'; })();
    const esc=v=>String(v||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/"/g,'&quot;');
    const img = p.img
      ? '<img src="'+esc(p.img)+'" alt="" style="width:100%;height:100%;object-fit:cover;display:block">'
      : '<div class="w-full h-full grid place-items-center" style="background:var(--panel-soft)"><iconify-icon icon="solar:gallery-linear" width="28" style="color:var(--muted)"></iconify-icon></div>';
    return '<div class="panel rounded-2xl overflow-hidden flex flex-col" data-pcard="'+esc(p.id)+'">'+
      '<div style="aspect-ratio:4/3;overflow:hidden;border-bottom:1px solid var(--border-soft)">'+img+'</div>'+
      '<div class="p-4 flex-1 flex flex-col gap-1">'+
        '<p class="text-[13.5px] font-bold leading-snug break-keep">'+esc(p.pageTitle||p.big||'(제목 없음)')+'</p>'+
        '<p class="text-[12px]" style="color:var(--muted)">'+esc(p.cat||'미분류')+'</p>'+
        '<p class="mt-1 text-right text-[15px] font-extrabold" style="color:var(--accent-strong)">'+price+'</p>'+
        '<label class="mt-2 inline-flex items-center gap-2 text-[12.5px]" style="color:var(--text-soft)">'+
          '<input type="checkbox" class="pSw" '+(p.on!==false?'checked':'')+' onchange="toggleProdOn(\''+esc(p.id)+'\', this.checked)"><span>공개</span>'+
        '</label>'+
      '</div>'+
      '<div class="px-4 py-3" style="border-top:1px solid var(--border-soft);background:var(--panel-soft)">'+
        '<div class="flex items-center gap-1.5">'+
          '<button onclick="openProductEditor(\''+esc(p.id)+'\')" class="flex-1 h-8 rounded-lg text-[12.5px] font-semibold" style="background:var(--accent-soft);color:var(--accent-strong)">수정</button>'+
          '<button onclick="deleteProductById(\''+esc(p.id)+'\')" class="flex-1 h-8 rounded-lg text-[12.5px] font-semibold text-white" style="background:var(--bad)">삭제</button>'+
          '<button onclick="duplicateProduct(\''+esc(p.id)+'\')" class="flex-1 h-8 rounded-lg text-[12.5px] font-semibold" style="background:var(--panel);border:1px solid var(--border);color:var(--text-soft)">복사</button>'+
        '</div>'+
        '<p class="text-[10.5px] mt-2 text-center" style="color:var(--muted)">순서 변경은 상단 「정렬 수정」에서</p>'+
      '</div>'+
    '</div>';
  }

  function renderProdGrid(){
    const box=document.getElementById('prodGrid'); if(!box) return;
    const rows=prodFiltered();
    const cnt=document.getElementById('prodCount');
    if(cnt) cnt.textContent=rows.length+'개';
    box.innerHTML = rows.length
      ? rows.map(({p,i})=>prodCardHTML(p,i)).join('')
      : '<div class="col-span-full text-center py-16 text-[13.5px]" style="color:var(--muted)">조건에 맞는 상품이 없습니다.</div>';
    renderIcons(box);
  }

  BUILDERS.products = function(){
    peCss();
    const el = makeView('products');
    const cats = productCats();
    const help = prodHelpOn();
    el.innerHTML =
      '<div class="panel rounded-xl px-4 py-3 mb-4 flex items-center gap-3 flex-wrap">'+
        '<iconify-icon icon="solar:info-circle-linear" width="17" style="color:var(--accent-strong)"></iconify-icon>'+
        '<span class="text-[13px] font-semibold">처음이라면 사용법 보기</span>'+
        '<span class="text-[12.5px]" style="color:var(--muted)">홈페이지에 노출할 시술 상품(메뉴)을 추가·수정·정렬합니다.</span>'+
        '<button onclick="toggleProdHelp()" class="ml-auto px-3 h-8 rounded-lg text-[12.5px] font-semibold" style="background:var(--panel-soft);border:1px solid var(--border);color:var(--text-soft)">'+(help?'닫기':'보기')+'</button>'+
      '</div>'+
      (help ? '<div class="panel rounded-xl p-5 mb-4 text-[13px] leading-relaxed" style="color:var(--text-soft)">'+
        '<p class="font-bold mb-2" style="color:var(--text)">이렇게 쓰세요</p>'+
        '<p>1. <b>시술 상품 추가</b> — 홈페이지 시술메뉴에 보일 상품 하나를 만듭니다. 상품 = 카테고리 카드 하나입니다.</p>'+
        '<p>2. <b>수정</b> — 상세 페이지의 설명·시술과정·Q&amp;A와 <b>상세 상품(가격 항목)</b>을 편집합니다.</p>'+
        '<p>3. <b>공개</b> 체크를 끄면 홈페이지에서 즉시 숨겨집니다. (바로 저장됩니다)</p>'+
        '<p>4. <b>복사</b> — 비슷한 상품을 만들 때 통째로 복제합니다. 복사본은 비공개로 생성됩니다.</p>'+
        '<p>5. <b>전체보기 정렬 수정</b> — 홈페이지에 보이는 순서를 드래그로 바꿉니다.</p>'+
        '<p>6. <b>엑셀 다운로드/업로드</b> — 가격을 한꺼번에 바꿀 때 씁니다. ID 열은 절대 수정하지 마세요.</p>'+
      '</div>' : '')+
      pageHead('시술 상품 관리','상품을 추가하고, 「수정」으로 상세 페이지(설명·상세 상품·가격·기간)를 편집합니다.','') +
      '<div class="flex items-center gap-2 flex-wrap mb-4">'+
        '<button onclick="openProductEditor(null)" class="px-4 h-9 rounded-lg text-[13px] font-semibold btn-gold flex items-center gap-1.5"><iconify-icon icon="solar:add-circle-linear" width="15"></iconify-icon> 시술 상품 추가</button>'+
        '<button onclick="exportProductsExcel()" class="px-4 h-9 rounded-lg text-[13px] font-semibold flex items-center gap-1.5" style="background:var(--panel);border:1px solid var(--border);color:var(--text-soft)"><iconify-icon icon="solar:download-minimalistic-linear" width="15"></iconify-icon> 전체 엑셀 다운로드</button>'+
        '<button onclick="openSortMode()" class="px-4 h-9 rounded-lg text-[13px] font-semibold flex items-center gap-1.5" style="background:var(--panel);border:1px solid var(--border);color:var(--text-soft)"><iconify-icon icon="solar:sort-vertical-linear" width="15"></iconify-icon> 전체보기 정렬 수정</button>'+
        '<button onclick="document.getElementById(\'prodXlsxFile\').click()" class="px-4 h-9 rounded-lg text-[13px] font-semibold flex items-center gap-1.5" style="background:var(--panel);border:1px solid var(--border);color:var(--text-soft)"><iconify-icon icon="solar:upload-minimalistic-linear" width="15"></iconify-icon> 엑셀 일괄 업로드</button>'+
        '<input id="prodXlsxFile" type="file" accept=".xlsx,.xls" class="hidden" onchange="importProductsExcel(this)">'+
        '<select onchange="prodCatFilter(this.value)" class="pmi" style="width:200px">'+
          '<option value="">전체보기</option>'+cats.map(c=>'<option value="'+c.replace(/"/g,'&quot;')+'"'+(c===_prodCat?' selected':'')+'>'+c+'</option>').join('')+
        '</select>'+
        '<input value="'+String(_prodQuery||'').replace(/"/g,'&quot;')+'" oninput="prodSearch(this.value)" placeholder="검색어를 입력" class="pmi" style="width:220px">'+
        '<span id="prodCount" class="text-[12.5px] ml-1" style="color:var(--muted)"></span>'+
      '</div>'+
      '<div id="prodGrid" class="grid gap-4" style="grid-template-columns:repeat(auto-fill,minmax(262px,1fr))"></div>';
    renderProdGrid();
  };

  /* ===================== 전체보기 정렬 수정 ===================== */
  function openSortMode(){
    peCss();
    _prodSort = productsGet();
    buildSortView();
  }
  function buildSortView(){
    const old=document.getElementById('view-prodsort'); if(old) old.remove();
    const el=makeView('prodsort');
    const esc=v=>String(v||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/"/g,'&quot;');
    el.innerHTML =
      '<div class="flex items-center gap-3 mb-5 flex-wrap">'+
        '<button onclick="sortCancel()" class="w-9 h-9 rounded-lg grid place-items-center" style="background:var(--panel);border:1px solid var(--border);color:var(--text-soft)"><iconify-icon icon="solar:arrow-left-linear" width="18"></iconify-icon></button>'+
        '<h1 class="text-xl font-extrabold tracking-tight">전체보기 정렬 수정</h1>'+
        '<span class="text-[12.5px]" style="color:var(--muted)">행을 드래그하거나 번호를 직접 입력해 순서를 바꾼 뒤 저장하세요.</span>'+
        '<span class="ml-auto flex items-center gap-2">'+
          '<button onclick="sortCancel()" class="px-4 h-9 rounded-lg text-[13px] font-semibold" style="background:var(--panel);border:1px solid var(--border);color:var(--text-soft)">취소</button>'+
          '<button onclick="sortSave()" class="px-5 h-9 rounded-lg text-[13px] font-semibold btn-gold">정렬 저장</button>'+
        '</span>'+
      '</div>'+
      '<div class="panel rounded-2xl p-4"><div id="sortList">'+
        _prodSort.map((p,i)=>
          '<div class="peRow" draggable="true" data-srow="'+i+'">'+
            '<span class="peGrip"><iconify-icon icon="solar:menu-dots-bold" width="16"></iconify-icon></span>'+
            '<span class="peNoWrap">No.<input type="number" min="1" value="'+(i+1)+'" onchange="sortSetNo('+i+', this.value)" class="peNo"></span>'+
            '<span class="peBar" style="background:'+(p.on!==false?'var(--good)':'var(--muted)')+'"></span>'+
            '<span class="flex-1 text-[13.5px] font-semibold truncate">'+esc(p.big||'(제목 없음)')+'</span>'+
            '<span class="chip" style="background:var(--panel-soft);color:var(--muted)">'+esc(p.cat||'미분류')+'</span>'+
            '<span class="chip" style="background:'+(p.on!==false?'var(--good-bg)':'var(--panel-soft)')+';color:'+(p.on!==false?'var(--good)':'var(--muted)')+'">'+(p.on!==false?'공개':'비공개')+'</span>'+
          '</div>').join('')+
      '</div></div>';
    dndAttach('sortList', (from,to)=>{ const t=_prodSort.splice(from,1)[0]; _prodSort.splice(to,0,t); buildSortView(); });
    renderIcons(el);
    go('prodsort');
  }
  function sortSetNo(i, v){
    let to=parseInt(v)-1;
    if(isNaN(to)) return buildSortView();
    to=Math.max(0, Math.min(_prodSort.length-1, to));
    const t=_prodSort.splice(i,1)[0]; _prodSort.splice(to,0,t);
    buildSortView();
  }
  function sortCancel(){ _prodSort=null; rerenderProducts(); }
  function sortSave(){
    if(!_prodSort) return;
    productsPut(_prodSort, '정렬 순서를 저장했습니다. 홈페이지에 그대로 반영됩니다.');
    _prodSort=null;
    rerenderProducts();
  }

  /* ===================== 드래그 정렬 헬퍼 ===================== */
  function dndAttach(containerId, onMove){
    const box=document.getElementById(containerId); if(!box) return;
    let src=null;
    box.querySelectorAll('[draggable="true"]').forEach(row=>{
      row.addEventListener('dragstart', e=>{ src=row; row.classList.add('peDrag'); try{ e.dataTransfer.effectAllowed='move'; e.dataTransfer.setData('text/plain',''); }catch(err){} });
      row.addEventListener('dragend', ()=>{ row.classList.remove('peDrag'); box.querySelectorAll('.peOver').forEach(x=>x.classList.remove('peOver')); });
      row.addEventListener('dragover', e=>{ e.preventDefault(); if(row!==src) row.classList.add('peOver'); });
      row.addEventListener('dragleave', ()=>row.classList.remove('peOver'));
      row.addEventListener('drop', e=>{
        e.preventDefault(); row.classList.remove('peOver');
        if(!src || src===row) return;
        const list=Array.from(box.children);
        onMove(list.indexOf(src), list.indexOf(row));
      });
    });
  }

  /* ===================== 스타일 ===================== */
  function peCss(){
    if(typeof kkModalCss==='function') kkModalCss();
    if(document.getElementById('peCss')) return;
    const st=document.createElement('style'); st.id='peCss';
    st.textContent = [
      '.pSw{appearance:none;width:38px;height:21px;border-radius:999px;background:var(--border);position:relative;cursor:pointer;transition:background .18s;flex:0 0 auto}',
      '.pSw:checked{background:var(--accent)}',
      '.pSw::after{content:"";position:absolute;top:2px;left:2px;width:17px;height:17px;border-radius:50%;background:#fff;transition:transform .18s;box-shadow:0 1px 3px rgba(0,0,0,.25)}',
      '.pSw:checked::after{transform:translateX(17px)}',
      '.peRow{display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:12px;border:1px solid var(--border);background:var(--panel);margin-bottom:8px;cursor:grab}',
      '.peRow.peDrag{opacity:.4}',
      '.peRow.peOver{border-color:var(--accent);box-shadow:0 0 0 2px var(--accent-soft)}',
      '.peGrip{color:var(--muted);cursor:grab;display:inline-flex;transform:rotate(90deg)}',
      '.peBar{width:4px;height:22px;border-radius:3px;display:inline-block}',
      '.peNoWrap{display:inline-flex;align-items:center;gap:5px;font-size:11.5px;color:var(--muted)}',
      '.peNo{width:52px;padding:4px 6px;border-radius:8px;text-align:center;font-size:12.5px;background:var(--panel-soft);border:1px solid var(--border);color:var(--text)}',
      '.peAcc{border:1px solid var(--border);border-radius:14px;background:var(--panel);margin-bottom:10px;overflow:hidden}',
      '.peAcc.open{border-color:var(--accent)}',
      '.peAccHd{display:flex;align-items:center;gap:10px;padding:11px 13px;cursor:grab;background:var(--panel)}',
      '.peAccHd.peOver{box-shadow:inset 0 0 0 2px var(--accent-soft)}',
      '.peAccBody{padding:0 14px 16px;border-top:1px solid var(--border-soft)}',
      '.peChev{transition:transform .2s;color:var(--muted)}',
      '.peAcc.open .peChev{transform:rotate(90deg)}',
      '.peCard{border:1px solid var(--border);border-radius:14px;background:var(--panel-soft);padding:14px;margin-bottom:10px}',
      '.peCardHd{display:flex;align-items:center;gap:8px;margin-bottom:8px}',
      '.peCardHd .lbl{font-size:12.5px;font-weight:700;color:var(--text-soft);margin-right:auto}',
      '.peIco{width:30px;height:30px;border-radius:9px;display:grid;place-items:center;background:var(--panel);border:1px solid var(--border);color:var(--text-soft)}',
      '.peIco:hover{color:var(--accent-strong);border-color:var(--accent)}',
      '.peIco.bad{background:var(--bad);border-color:var(--bad);color:#fff}',
      '.rteBar{display:flex;flex-wrap:wrap;align-items:center;gap:4px;padding:7px 9px;border:1px solid var(--border);border-bottom:0;border-radius:11px 11px 0 0;background:var(--panel-soft)}',
      '.rteBtn{min-width:29px;height:29px;padding:0 7px;border-radius:7px;font-size:12.5px;font-weight:600;background:transparent;border:1px solid transparent;color:var(--text-soft);display:inline-flex;align-items:center;justify-content:center}',
      '.rteBtn:hover{background:var(--panel);border-color:var(--border);color:var(--accent-strong)}',
      '.rteSel{height:29px;padding:0 6px;border-radius:7px;font-size:12px;background:var(--panel);border:1px solid var(--border);color:var(--text)}',
      '.rteSep{width:1px;height:18px;background:var(--border);margin:0 3px}',
      '.rteCol{width:29px;height:29px;padding:0;border:1px solid var(--border);border-radius:7px;background:var(--panel);cursor:pointer}',
      '.rteEd{min-height:220px;max-height:520px;overflow-y:auto;padding:14px 16px;border:1px solid var(--border);border-radius:0 0 11px 11px;background:var(--panel);color:var(--text);font-size:13.5px;line-height:1.75}',
      '.rteEd:focus{outline:none;border-color:var(--accent)}',
      '.rteEd img{max-width:100%;border-radius:10px;margin:8px 0}',
      '.rteEd h2{font-size:19px;font-weight:800;margin:16px 0 8px}',
      '.rteEd h3{font-size:16px;font-weight:800;margin:14px 0 6px}',
      '.rteEd p{margin:6px 0}',
      '.rteEd blockquote{border-left:3px solid var(--accent);padding:4px 0 4px 12px;margin:10px 0;color:var(--text-soft)}',
      '.rteEd ul{list-style:disc;padding-left:22px;margin:8px 0}',
      '.rteEd ol{list-style:decimal;padding-left:22px;margin:8px 0}',
      '.rteEd hr{border:0;border-top:1px solid var(--border);margin:14px 0}',
      '.rteEd iframe{width:100%;aspect-ratio:16/9;border:0;border-radius:10px;margin:8px 0}',
      '.peBarBottom{position:sticky;bottom:0;z-index:20;display:flex;justify-content:flex-end;gap:8px;padding:12px 16px;margin:18px -4px -4px;background:var(--panel);border:1px solid var(--border);border-radius:14px;box-shadow:0 -6px 20px rgba(0,0,0,.06)}',
      '.peRecCard{border:1px solid var(--border);border-radius:14px;background:var(--panel-soft);padding:12px}',
    ].join('');
    document.head.appendChild(st);
  }

  /* ===================== 리치텍스트 에디터 ===================== */
  const RTE_SIZES=[12,13,14,16,18,20,24,32];
  function rteBar(target){
    const t="'"+target+"'";
    const b=(cmd,label,title)=>'<button class="rteBtn" onmousedown="event.preventDefault()" title="'+title+'" onmousedown="event.preventDefault()" onclick="rteCmd('+t+',\''+cmd+'\')">'+label+'</button>';
    return '<div class="rteBar" onmousedown="if(this===event.target)event.preventDefault()">'+
      '<select class="rteSel" onchange="rteSize('+t+',this.value)">'+RTE_SIZES.map(s=>'<option value="'+s+'"'+(s===13?' selected':'')+'>'+s+'px</option>').join('')+'</select>'+
      '<select class="rteSel" onchange="rteBlock('+t+',this.value)"><option value="p">Normal</option><option value="h2">제목 1</option><option value="h3">제목 2</option></select>'+
      '<span class="rteSep"></span>'+
      b('bold','<b>B</b>','굵게')+b('italic','<i>I</i>','기울임')+b('underline','<u>U</u>','밑줄')+b('strikeThrough','<s>S</s>','취소선')+
      '<button class="rteBtn" onmousedown="event.preventDefault()" title="인용" onclick="rteBlock('+t+',\'blockquote\')"><iconify-icon icon="solar:quote-up-square-linear" width="15"></iconify-icon></button>'+
      '<span class="rteSep"></span>'+
      '<button class="rteBtn" onmousedown="event.preventDefault()" title="번호 목록" onclick="rteCmd('+t+',\'insertOrderedList\')"><iconify-icon icon="solar:list-arrow-down-linear" width="15"></iconify-icon></button>'+
      '<button class="rteBtn" onmousedown="event.preventDefault()" title="글머리 목록" onclick="rteCmd('+t+',\'insertUnorderedList\')"><iconify-icon icon="solar:list-linear" width="15"></iconify-icon></button>'+
      '<button class="rteBtn" onmousedown="event.preventDefault()" title="내어쓰기" onclick="rteCmd('+t+',\'outdent\')"><iconify-icon icon="solar:text-field-linear" width="15"></iconify-icon></button>'+
      '<button class="rteBtn" onmousedown="event.preventDefault()" title="들여쓰기" onclick="rteCmd('+t+',\'indent\')"><iconify-icon icon="solar:text-field-focus-linear" width="15"></iconify-icon></button>'+
      '<span class="rteSep"></span>'+
      '<input type="color" class="rteCol" title="글자색" value="#2c2620" oninput="rteColor('+t+',\'foreColor\',this.value)">'+
      '<input type="color" class="rteCol" title="배경색" value="#ffe9a8" oninput="rteColor('+t+',\'hiliteColor\',this.value)">'+
      '<span class="rteSep"></span>'+
      '<button class="rteBtn" onmousedown="event.preventDefault()" title="왼쪽 정렬" onclick="rteCmd('+t+',\'justifyLeft\')"><iconify-icon icon="solar:align-left-linear" width="15"></iconify-icon></button>'+
      '<button class="rteBtn" onmousedown="event.preventDefault()" title="가운데 정렬" onclick="rteCmd('+t+',\'justifyCenter\')"><iconify-icon icon="solar:align-horizonta-center-linear" width="15"></iconify-icon></button>'+
      '<button class="rteBtn" onmousedown="event.preventDefault()" title="오른쪽 정렬" onclick="rteCmd('+t+',\'justifyRight\')"><iconify-icon icon="solar:align-right-linear" width="15"></iconify-icon></button>'+
      '<span class="rteSep"></span>'+
      '<button class="rteBtn" onmousedown="event.preventDefault()" title="링크" onclick="rteLink('+t+')"><iconify-icon icon="solar:link-linear" width="15"></iconify-icon></button>'+
      '<button class="rteBtn" onmousedown="event.preventDefault()" title="사진" onclick="rtePickImage('+t+')"><iconify-icon icon="solar:gallery-add-linear" width="15"></iconify-icon></button>'+
      '<button class="rteBtn" onmousedown="event.preventDefault()" title="동영상(YouTube)" onclick="rteVideo('+t+')"><iconify-icon icon="solar:videocamera-record-linear" width="15"></iconify-icon></button>'+
      '<span class="rteSep"></span>'+
      '<button class="rteBtn" onmousedown="event.preventDefault()" title="구분선" onclick="rteCmd('+t+',\'insertHorizontalRule\')">―</button>'+
      '<button class="rteBtn" onmousedown="event.preventDefault()" title="서식 지우기" onclick="rteCmd('+t+',\'removeFormat\')"><iconify-icon icon="solar:eraser-linear" width="15"></iconify-icon></button>'+
    '</div>';
  }
  const _rteSaved={};
  function rteSaveSel(target){
    const ed=document.getElementById(target); if(!ed) return;
    const s=window.getSelection();
    if(s.rangeCount && ed.contains(s.anchorNode)) _rteSaved[target]=s.getRangeAt(0).cloneRange();
  }
  function rteFocus(target){
    const ed=document.getElementById(target); if(!ed) return null;
    const s=window.getSelection();
    if(s.rangeCount && ed.contains(s.anchorNode)){ ed.focus(); return ed; }
    ed.focus();
    const saved=_rteSaved[target];
    if(saved && ed.contains(saved.startContainer)){
      try{ s.removeAllRanges(); s.addRange(saved); return ed; }catch(e){}
    }
    const r=document.createRange(); r.selectNodeContents(ed); r.collapse(false);
    s.removeAllRanges(); s.addRange(r);
    return ed;
  }
  function rteCmd(target, cmd){ if(!rteFocus(target)) return; try{ document.execCommand(cmd); }catch(e){} rteSaveSel(target); }
  function rteBlock(target, tag){ if(!rteFocus(target)) return; try{ document.execCommand('formatBlock', false, '<'+tag+'>'); }catch(e){} rteSaveSel(target); }
  function rteColor(target, cmd, val){ if(!rteFocus(target)) return; try{ document.execCommand('styleWithCSS', false, true); document.execCommand(cmd, false, val); }catch(e){} rteSaveSel(target); }
  function rteSize(target, px){
    const ed=rteFocus(target); if(!ed) return;
    try{
      try{ document.execCommand('styleWithCSS', false, false); }catch(e2){}
      document.execCommand('fontSize', false, '7');
      const made=[];
      /* CSS 모드에서 만들어진 경우(색 적용 뒤 등) 대비 */
      ed.querySelectorAll('[style*="xxx-large"]').forEach(el=>{ el.style.fontSize=px+'px'; made.push(el); });
      ed.querySelectorAll('font[size="7"]').forEach(f=>{
        const sp=document.createElement('span');
        sp.style.fontSize=px+'px';
        while(f.firstChild) sp.appendChild(f.firstChild);
        f.parentNode.replaceChild(sp, f);
        made.push(sp);
      });
      if(made.length){
        const r=document.createRange();
        r.setStartBefore(made[0]); r.setEndAfter(made[made.length-1]);
        const s=window.getSelection(); s.removeAllRanges(); s.addRange(r);
        _rteSaved[target]=r.cloneRange();
      }
    }catch(e){}
  }
  function rteLink(target){
    if(!rteFocus(target)) return;
    const url=prompt('연결할 주소를 입력하세요 (https:// 포함)');
    if(!url) return;
    try{ document.execCommand('createLink', false, url); }catch(e){}
  }
  function rteVideo(target){
    if(!rteFocus(target)) return;
    const url=prompt('유튜브 주소를 붙여넣으세요');
    if(!url) return;
    const m=String(url).match(/(?:v=|youtu\.be\/|embed\/|shorts\/)([A-Za-z0-9_-]{6,})/);
    if(!m){ toast('유튜브 주소를 인식하지 못했습니다.', false); return; }
    try{ document.execCommand('insertHTML', false, '<iframe src="https://www.youtube.com/embed/'+m[1]+'" allowfullscreen loading="lazy"></iframe><p><br></p>'); }catch(e){}
  }
  function rtePickImage(target){
    let inp=document.getElementById('rteImgPicker');
    if(!inp){
      inp=document.createElement('input');
      inp.type='file'; inp.accept='image/*'; inp.id='rteImgPicker'; inp.className='hidden';
      document.body.appendChild(inp);
    }
    inp.onchange=async function(){
      const file=inp.files && inp.files[0];
      inp.value='';
      if(!file) return;
      if(typeof window.uploadImage!=='function'){ toast('이미지 업로드 기능을 사용할 수 없습니다. (Supabase 연결 확인)', false); return; }
      toast('사진 업로드 중…');
      try{
        const url=await window.uploadImage(file);
        rteFocus(target);
        document.execCommand('insertHTML', false, '<img src="'+url+'" alt=""><p><br></p>');
        toast('사진을 넣었습니다.');
      }catch(e){ console.error(e); toast('이미지 업로드 실패: '+((e&&e.message)||e), false); }
    };
    inp.click();
  }

  /* ===================== 상품 편집기 ===================== */
  let _peIdx=null, _pe=null, _peOpen={}, _peGroupsOpen=true;

  function peBlank(){
    return {id:pUid('p'), cat:'', type:'promo', script:'', big:'', title:'', event:'', price:0, on:true, img:'',
      pageTitle:'', desc:'', body:'', youtube:'', groups:[], details:[], stepsTitle:'', steps:[],
      basic:{time:'',anesthesia:'',daily:'',duration:''}, points:[], qna:[], cautions:[], recs:[]};
  }
  function peDetailBlank(){ return {id:pUid('d'), gid:'', t:'', body:'', price:'', sale:'', on:true, perType:'always', start:'', end:'', avail:'', notice:''}; }

  function openProductEditor(arg){
    peCss();
    const base=productsGet();
    let idx=null;
    if(typeof arg==='number') idx=arg;
    else if(typeof arg==='string' && arg) idx=base.findIndex(p=>p.id===arg);
    if(idx!==null && (idx<0 || idx>=base.length)) idx=null;
    _peIdx=idx;
    _pe = idx===null ? peBlank() : JSON.parse(JSON.stringify(Object.assign(peBlank(), base[idx])));
    _peOpen={};
    buildProductEditor();
  }

  function peStash(){
    const g=id=>document.getElementById(id);
    if(!g('peBig')) return;
    _pe.big=g('peBig').value.trim();
    _pe.title=g('peTitle') ? (g('peTitle').value.trim() || _pe.big) : _pe.big;
    _pe.pageTitle=g('pePageTitle').value.trim();
    _pe.desc=g('peDesc').value;
    _pe.cat=g('peCat').value;
    _pe.type=g('peType').value;
    _pe.script=g('peScript').value.trim();
    _pe.youtube=g('peYoutube').value.trim();
    _pe.on=g('peOn').checked;
    const mb=g('peMainBody'); if(mb){ let v=mb.innerHTML.trim(); if(v==='<br>'||v==='<p><br></p>') v=''; _pe.body=v; }
    /* 중분류 */
    document.querySelectorAll('[data-pgrow]').forEach(row=>{
      const i=parseInt(row.dataset.pgrow); const gr=_pe.groups[i]; if(!gr) return;
      const nm=row.querySelector('[data-pg="name"]'); if(nm) gr.name=nm.value.trim();
      const on=row.querySelector('[data-pg="on"]'); if(on) gr.on=on.checked;
    });
    /* 상세 상품 */
    document.querySelectorAll('#peDetails [data-pdrow]').forEach(row=>{
      const i=parseInt(row.dataset.pdrow);
      const dt=_pe.details[i]; if(!dt) return;
      const q=s=>row.querySelector(s);
      const gv=s=>{ const e2=q(s); return e2? e2.value : null; };
      const t=gv('[data-pd="t"]'); if(t!==null) dt.t=t.trim();
      const on=q('[data-pd="on"]'); if(on) dt.on=on.checked;
      const price=gv('[data-pd="price"]'); if(price!==null) dt.price=price.trim();
      const sale=gv('[data-pd="sale"]'); if(sale!==null) dt.sale=sale.trim();
      const per=gv('[data-pd="perType"]'); if(per!==null) dt.perType=per;
      const st=gv('[data-pd="start"]'); if(st!==null) dt.start=st;
      const en=gv('[data-pd="end"]'); if(en!==null) dt.end=en;
      const av=gv('[data-pd="avail"]'); if(av!==null) dt.avail=av.trim();
      const no=gv('[data-pd="notice"]'); if(no!==null) dt.notice=no.trim();
      const gid=gv('[data-pd="gid"]'); if(gid!==null) dt.gid=gid;
      const vch=gv('[data-pd="voucher"]'); if(vch!==null) dt.voucher=vch;
      const ed=document.getElementById('peBody_'+i);
      if(ed){ let b=ed.innerHTML.trim(); if(b==='<br>'||b==='<p><br></p>') b=''; dt.body=b; }
    });
    const stt=g('peStepsTitle'); if(stt) _pe.stepsTitle=stt.value.trim();
    ['steps','points','cautions'].forEach(k=>{
      const els=document.querySelectorAll('[data-pl="'+k+'"]');
      if(els.length || document.getElementById('peList_'+k)) _pe[k]=Array.from(els).map(e=>e.value.trim()).filter(Boolean);
    });
    if(document.getElementById('peList_qna')){
      const rows=document.querySelectorAll('[data-pqa]');
      _pe.qna=Array.from(rows).map(r=>({q:r.querySelector('[data-pq]').value.trim(), a:r.querySelector('[data-pa]').value.trim()})).filter(x=>x.q||x.a);
    }
    if(document.getElementById('peList_recs')){
      document.querySelectorAll('[data-prec]').forEach(r=>{
        const i=parseInt(r.dataset.prec); if(!_pe.recs[i]) return;
        const n=r.querySelector('[data-precnote]'); if(n) _pe.recs[i].note=n.value.trim();
      });
    }
    ['time','anesthesia','daily','duration'].forEach(k=>{ const e2=g('peBasic_'+k); if(e2) _pe.basic[k]=e2.value.trim(); });
  }

  /* 리스트 조작 */
  function peListAdd(k){ peStash(); if(k==='qna') _pe.qna.push({q:'',a:''}); else _pe[k].push(''); buildProductEditor(); }
  function peListDel(k,i){ peStash(); _pe[k].splice(i,1); buildProductEditor(); }
  function peListMove(k,i,d){ peStash(); const j=i+d; if(j<0||j>=_pe[k].length) return; const t=_pe[k][i]; _pe[k][i]=_pe[k][j]; _pe[k][j]=t; buildProductEditor(); }

  /* 중분류(옵션 그룹) */
  function peAddGroup(){ peStash(); _pe.groups.push({id:pUid('g'), name:'', on:true}); _peGroupsOpen=true; buildProductEditor(); }
  function peDelGroup(i){
    peStash();
    const gr=_pe.groups[i]; if(!gr) return;
    if(!confirm('「'+(gr.name||'이 그룹')+'」을 삭제할까요?\n그룹에 속한 상세 상품은 「그룹 없음」으로 이동합니다.')) return;
    _pe.details.forEach(d=>{ if(d.gid===gr.id) d.gid=''; });
    _pe.groups.splice(i,1);
    buildProductEditor();
  }
  function peMoveGroup(i,d){ peStash(); const j=i+d; if(j<0||j>=_pe.groups.length) return; const t=_pe.groups[i]; _pe.groups[i]=_pe.groups[j]; _pe.groups[j]=t; buildProductEditor(); }
  function peToggleGroups(){ peStash(); _peGroupsOpen=!_peGroupsOpen; buildProductEditor(); }

  /* 상세 상품 */
  function peAddDetail(){ peStash(); const d=peDetailBlank(); _pe.details.push(d); _peOpen[d.id]=true; buildProductEditor(); }
  function peDeleteDetail(i){
    peStash();
    const dt=_pe.details[i];
    if(!confirm('「'+((dt&&dt.t)||'이 상세 상품')+'」을 삭제할까요?')) return;
    _pe.details.splice(i,1);
    buildProductEditor();
  }
  function peMoveDetail(i,d){
    peStash();
    const j=i+d; if(j<0||j>=_pe.details.length) return;
    const t=_pe.details[i]; _pe.details[i]=_pe.details[j]; _pe.details[j]=t;
    buildProductEditor();
  }
  function peDetailNo(i, v){
    peStash();
    let to=parseInt(v)-1;
    if(isNaN(to)) return buildProductEditor();
    to=Math.max(0, Math.min(_pe.details.length-1, to));
    const t=_pe.details.splice(i,1)[0]; _pe.details.splice(to,0,t);
    buildProductEditor();
  }
  function peToggleDetail(i){
    peStash();
    const dt=_pe.details[i]; if(!dt) return;
    _peOpen[dt.id]=!_peOpen[dt.id];
    buildProductEditor();
  }
  function peExpandAll(){
    peStash();
    const anyClosed=_pe.details.some(d=>!_peOpen[d.id]);
    _pe.details.forEach(d=>{ _peOpen[d.id]=anyClosed; });
    buildProductEditor();
  }

  /* 추천 시술 */
  function peAddRec(){
    peStash();
    const s=document.getElementById('peRecSel');
    if(!s || !s.value) return;
    if(_pe.recs.some(r=>r.id===s.value)) { toast('이미 추가된 시술입니다.', false); return; }
    const src=productById(s.value);
    _pe.recs.push({id:s.value, name:src?(src.big||src.title||''):'', note:''});
    buildProductEditor();
  }
  function peDelRec(i){ peStash(); _pe.recs.splice(i,1); buildProductEditor(); }
  function peMoveRec(i,d){ peStash(); const j=i+d; if(j<0||j>=_pe.recs.length) return; const t=_pe.recs[i]; _pe.recs[i]=_pe.recs[j]; _pe.recs[j]=t; buildProductEditor(); }

  function peBack(){
    if(!confirm('저장하지 않은 변경사항은 사라집니다. 목록으로 돌아갈까요?')) return;
    rerenderProducts();
  }
  function peSave(){
    peStash();
    if(!_pe.big){ toast('상품명을 입력해주세요.', false); return; }
    if(!_pe.cat){ toast('카테고리를 선택해주세요.', false); return; }
    if(!_pe.title) _pe.title=_pe.big;
    syncLegacy(_pe);
    const base=productsGet();
    if(_peIdx===null) base.push(_pe);
    else base[_peIdx]=_pe;
    productsPut(base, '상품을 저장했습니다. 홈페이지에 반영됩니다.');
    rerenderProducts();
  }
  async function handlePeImage(input){
    const file=input.files && input.files[0];
    if(!file) return;
    if(typeof window.uploadImage !== 'function'){ toast('이미지 업로드 기능을 사용할 수 없습니다. (Supabase 연결 확인)', false); input.value=''; return; }
    const btn=document.getElementById('peImgBtn');
    const prev=btn.innerHTML; btn.innerHTML='업로드 중…'; btn.disabled=true;
    try{
      const url=await window.uploadImage(file);
      peStash(); _pe.img=url; buildProductEditor();
      toast('이미지가 업로드됐습니다. 「저장하기」를 눌러야 반영됩니다.');
    }catch(e){
      console.error(e); toast('이미지 업로드 실패: '+((e&&e.message)||e), false);
    }finally{
      btn.innerHTML=prev; btn.disabled=false; input.value='';
    }
  }
  function peClearImg(){ peStash(); _pe.img=''; buildProductEditor(); }

  const peEsc = v => String(v==null?'':v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/"/g,'&quot;');

  /* 권종 선택 옵션 (카테고리 관리 > 권종 카테고리에서 관리) */
  function peVoucherOpts(sel){
    let list=[];
    try{ if(typeof vouchersGet==='function') list=vouchersGet().filter(v=>v.on!==false); }catch(e){}
    return '<option value="">권종 없음</option>'+list.map(v=>{
      let cond='';
      try{ cond=(typeof voucherLabel==='function') ? voucherLabel(v) : ''; }catch(e){}
      const lb=(cond && v.name.indexOf(cond)<0) ? ' ('+cond+')' : '';
      return '<option value="'+peEsc(v.id)+'"'+(v.id===sel?' selected':'')+'>'+peEsc(v.name+lb)+'</option>';
    }).join('');
  }
  function peDetailHTML(dt,i){
    const open=!!_peOpen[dt.id];
    const gOpts='<option value="">그룹 없음</option>'+_pe.groups.map(g=>'<option value="'+peEsc(g.id)+'"'+(g.id===dt.gid?' selected':'')+'>'+peEsc(g.name||'(이름 없는 그룹)')+'</option>').join('');
    return '<div class="peAcc'+(open?' open':'')+'" data-pdrow="'+i+'" data-pdid="'+peEsc(dt.id)+'">'+
      '<div class="peAccHd" draggable="true">'+
        '<span class="peGrip"><iconify-icon icon="solar:menu-dots-bold" width="16"></iconify-icon></span>'+
        '<button class="rteBtn peChev" onclick="peToggleDetail('+i+')" title="펼치기/접기"><iconify-icon icon="solar:alt-arrow-right-linear" width="16"></iconify-icon></button>'+
        '<span class="peBar" style="background:'+(dt.on!==false?'var(--good)':'var(--muted)')+'"></span>'+
        '<span class="peNoWrap">No.<input type="number" min="1" value="'+(i+1)+'" onchange="peDetailNo('+i+', this.value)" onclick="event.stopPropagation()" class="peNo"></span>'+
        '<span class="flex-1 text-[13.5px] font-semibold truncate" onclick="peToggleDetail('+i+')" style="cursor:pointer">'+(peEsc(dt.t)||'<span style="color:var(--muted);font-weight:400">(제목 없는 상세 상품)</span>')+'</span>'+
        '<span class="chip" style="background:'+(dt.on!==false?'var(--good-bg)':'var(--panel-soft)')+';color:'+(dt.on!==false?'var(--good)':'var(--muted)')+'">'+(dt.on!==false?'공개':'비공개')+'</span>'+
        '<button class="peIco bad" onclick="peDeleteDetail('+i+')" title="삭제"><iconify-icon icon="solar:trash-bin-trash-linear" width="14"></iconify-icon></button>'+
      '</div>'+
      (open ? '<div class="peAccBody">'+
        '<div class="grid sm:grid-cols-[1fr_auto_auto_auto] gap-3 items-end mt-4 mb-3">'+
          '<div><label class="pml">상세 상품 제목 *</label><input data-pd="t" value="'+peEsc(dt.t)+'" placeholder="예) [EVENT] 온다 리프팅 10kj" class="pmi"></div>'+
          '<div><label class="pml">중분류 그룹</label><select data-pd="gid" class="pmi" style="width:170px">'+gOpts+'</select></div>'+
          '<div><label class="pml">권종 (사용 조건)</label><select data-pd="voucher" class="pmi" style="width:180px">'+peVoucherOpts(dt.voucher)+'</select></div>'+
          '<label class="flex items-center gap-2 text-[12.5px] pb-2.5" style="color:var(--text-soft)"><input type="checkbox" data-pd="on" '+(dt.on!==false?'checked':'')+' class="pSw"> 공개</label>'+
        '</div>'+
        '<div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-3">'+
          '<div><label class="pml">정가 (원)</label><input data-pd="price" type="number" value="'+peEsc(dt.price)+'" placeholder="예) 55000" class="pmi"></div>'+
          '<div><label class="pml">할인가 (원)</label><input data-pd="sale" type="number" value="'+peEsc(dt.sale)+'" placeholder="예) 45000" class="pmi"></div>'+
          '<div><label class="pml">이용 가능</label><input data-pd="avail" value="'+peEsc(dt.avail)+'" placeholder="예) 1인 1회" class="pmi"></div>'+
          '<div><label class="pml">안내 문구</label><input data-pd="notice" value="'+peEsc(dt.notice)+'" placeholder="예) 첫 시술 한정" class="pmi"></div>'+
        '</div>'+
        '<div class="flex items-center gap-2 flex-wrap mb-4">'+
          '<label class="pml" style="margin:0">기간</label>'+
          '<select data-pd="perType" class="pmi" style="width:110px" onchange="this.closest(\'[data-pdrow]\').querySelector(\'[data-pd-range]\').style.display=this.value===\'range\'?\'\':\'none\'">'+
            '<option value="always" '+(dt.perType!=='range'?'selected':'')+'>상시</option>'+
            '<option value="range" '+(dt.perType==='range'?'selected':'')+'>기간 설정</option>'+
          '</select>'+
          '<span data-pd-range class="flex items-center gap-1.5" style="'+(dt.perType==='range'?'':'display:none')+'">'+
            '<input data-pd="start" type="date" value="'+peEsc(dt.start)+'" class="pmi" style="width:auto">'+
            '<span style="color:var(--muted)">~</span>'+
            '<input data-pd="end" type="date" value="'+peEsc(dt.end)+'" class="pmi" style="width:auto">'+
          '</span>'+
          '<span class="text-[11.5px]" style="color:var(--muted)">기간을 설정하면 종료일이 지난 상세 상품은 홈에서 자동으로 숨겨지고, 「기간별 이벤트」에서 모아볼 수 있습니다.</span>'+
        '</div>'+
        '<label class="pml">이 상세 상품의 설명</label>'+
        rteBar('peBody_'+i)+
        '<div id="peBody_'+i+'" class="rteEd" style="min-height:150px" contenteditable="true" onmouseup="rteSaveSel(\'peBody_'+i+'\')" onkeyup="rteSaveSel(\'peBody_'+i+'\')" onblur="rteSaveSel(\'peBody_'+i+'\')">'+(dt.body||'')+'</div>'+
      '</div>' : '')+
    '</div>';
  }

  function peStrListHTML(k, label, addLabel, ph, pre){
    return '<div class="panel rounded-2xl p-6 mt-5" id="peList_'+k+'">'+
      '<div class="flex items-center justify-between mb-4"><h2 class="text-[16px] font-bold">'+label+'</h2>'+
      '<button onclick="peListAdd(\''+k+'\')" class="px-4 h-9 rounded-lg text-[13px] font-semibold" style="background:var(--panel);border:1px solid var(--border);color:var(--text-soft)">+ '+addLabel+'</button></div>'+
      (_pe[k].length ? _pe[k].map((v,i)=>
        '<div class="peCard">'+
          '<div class="peCardHd">'+
            '<span class="lbl">'+pre+' '+(i+1)+'</span>'+
            '<button class="peIco" onclick="peListMove(\''+k+'\','+i+',-1)"><iconify-icon icon="solar:arrow-up-linear" width="14"></iconify-icon></button>'+
            '<button class="peIco" onclick="peListMove(\''+k+'\','+i+',1)"><iconify-icon icon="solar:arrow-down-linear" width="14"></iconify-icon></button>'+
            '<button class="peIco bad" onclick="peListDel(\''+k+'\','+i+')"><iconify-icon icon="solar:trash-bin-trash-linear" width="14"></iconify-icon></button>'+
          '</div>'+
          '<textarea data-pl="'+k+'" rows="2" placeholder="'+ph+'" class="pmi">'+peEsc(v)+'</textarea>'+
        '</div>').join('')
        : '<p class="text-center py-6 text-[12.5px]" style="color:var(--muted)">항목이 없습니다.</p>')+
    '</div>';
  }

  function buildProductEditor(){
    peCss();
    const old=document.getElementById('view-productedit');
    if(old) old.remove();
    const el=makeView('productedit');
    const anyClosed=_pe.details.some(d=>!_peOpen[d.id]);
    const others=productsGet().filter(x=>x.id!==_pe.id);

    el.innerHTML =
      '<div class="flex items-center gap-3 mb-5 flex-wrap">'+
        '<button onclick="peBack()" class="w-9 h-9 rounded-lg grid place-items-center" style="background:var(--panel);border:1px solid var(--border);color:var(--text-soft)"><iconify-icon icon="solar:arrow-left-linear" width="18"></iconify-icon></button>'+
        '<h1 class="text-xl font-extrabold tracking-tight">시술 상품 '+(_peIdx===null?'추가':'수정')+'</h1>'+
      '</div>'+

      /* --- 기본 정보 --- */
      '<div class="panel rounded-2xl p-6 space-y-4">'+
        '<div class="grid lg:grid-cols-[170px_1fr] gap-6">'+
          '<div>'+
            '<label class="pml">상품 이미지</label>'+
            '<div id="peImgPrev" class="w-full rounded-xl overflow-hidden grid place-items-center" style="aspect-ratio:4/3;background:var(--panel-soft);border:1px solid var(--border)">'+
              (_pe.img?'<img src="'+peEsc(_pe.img)+'" style="width:100%;height:100%;object-fit:cover;display:block" alt="">':'<iconify-icon icon="solar:gallery-linear" width="24" style="color:var(--muted)"></iconify-icon>')+
            '</div>'+
            '<button id="peImgBtn" onclick="document.getElementById(\'peImgFile\').click()" class="mt-2 w-full py-2 rounded-lg text-[12.5px] font-semibold btn-gold">이미지 업로드</button>'+
            '<button onclick="peClearImg()" class="mt-1 w-full py-1.5 rounded-lg text-[11.5px]" style="background:var(--panel-soft);border:1px solid var(--border);color:var(--text-soft)">이미지 제거</button>'+
            '<input id="peImgFile" type="file" accept="image/*" class="hidden" onchange="handlePeImage(this)">'+
          '</div>'+
          '<div class="space-y-3">'+
            '<div class="grid sm:grid-cols-2 gap-3">'+
              '<div><label class="pml">상품명 *</label><input id="peBig" value="'+peEsc(_pe.big)+'" placeholder="예) 온다 리프팅" class="pmi"></div>'+
              '<div><label class="pml">페이지 타이틀 (미입력 시 상품명 사용)</label><input id="pePageTitle" value="'+peEsc(_pe.pageTitle)+'" placeholder="예) [탄력은 더하고, 통증은 줄이고] 온다 리프팅" class="pmi"></div>'+
            '</div>'+
            '<div><label class="pml">설명 (상세 페이지 상단 소개)</label><textarea id="peDesc" rows="5" class="pmi" placeholder="✓ 특징을 줄바꿈으로 나열해보세요">'+peEsc(_pe.desc)+'</textarea></div>'+
            '<div class="grid sm:grid-cols-3 gap-3">'+
              '<div><label class="pml">카테고리 *</label><select id="peCat" class="pmi">'+('<option value="">카테고리 선택</option>'+productCats().map(c=>'<option value="'+peEsc(c)+'"'+(c===_pe.cat?' selected':'')+'>'+peEsc(c)+'</option>').join(''))+'</select></div>'+
              '<div><label class="pml">배너 형식 (이미지 없을 때)</label><select id="peType" class="pmi">'+PRODUCT_TYPES.map(t=>'<option value="'+t.v+'"'+(t.v===(_pe.type||'promo')?' selected':'')+'>'+t.l+'</option>').join('')+'</select></div>'+
              '<div><label class="pml">짧은 카피 (카드 상단)</label><input id="peScript" value="'+peEsc(_pe.script)+'" placeholder="예) 마이크로웨이브로 비대칭까지" class="pmi"></div>'+
            '</div>'+
            '<div class="grid sm:grid-cols-[1fr_auto] gap-3 items-end">'+
              '<div><label class="pml">유튜브 링크</label><input id="peYoutube" value="'+peEsc(_pe.youtube)+'" placeholder="예) https://www.youtube.com/watch?v=..." class="pmi"></div>'+
              '<label class="flex items-center gap-2 text-[13.5px] pb-2" style="color:var(--text-soft)"><input id="peOn" type="checkbox" '+(_pe.on!==false?'checked':'')+' class="pSw"> 홈페이지에 노출</label>'+
            '</div>'+
            '<input id="peTitle" type="hidden" value="'+peEsc(_pe.title)+'">'+
          '</div>'+
        '</div>'+
      '</div>'+

      /* --- 중분류(옵션 그룹) --- */
      '<div class="panel rounded-2xl p-6 mt-5">'+
        '<div class="flex items-center justify-between mb-4 flex-wrap gap-2">'+
          '<h2 class="text-[16px] font-bold flex items-center gap-2">'+
            '<button class="rteBtn peChev'+(_peGroupsOpen?'':'')+'" onclick="peToggleGroups()" style="transform:rotate('+(_peGroupsOpen?'90':'0')+'deg)"><iconify-icon icon="solar:alt-arrow-right-linear" width="16"></iconify-icon></button>'+
            '중분류(옵션 그룹) ('+_pe.groups.length+')</h2>'+
          '<span class="flex items-center gap-2">'+
            '<button onclick="peToggleGroups()" class="px-3 h-9 rounded-lg text-[12.5px] font-semibold" style="background:var(--panel-soft);border:1px solid var(--border);color:var(--text-soft)">전체 펼치기/접기</button>'+
            '<button onclick="peAddGroup()" class="px-4 h-9 rounded-lg text-[13px] font-semibold" style="background:var(--panel);border:1px solid var(--border);color:var(--text-soft)">+ 그룹 추가</button>'+
          '</span>'+
        '</div>'+
        (_peGroupsOpen ? (_pe.groups.length
          ? _pe.groups.map((g,i)=>{
              const cnt=_pe.details.filter(d=>d.gid===g.id).length;
              return '<div class="peCard" data-pgrow="'+i+'">'+
                '<div class="flex items-center gap-2 flex-wrap">'+
                  '<span class="w-7 h-7 rounded-full grid place-items-center text-[12px] font-bold" style="background:var(--accent-soft);color:var(--accent-strong)">'+(i+1)+'</span>'+
                  '<input data-pg="name" value="'+peEsc(g.name)+'" placeholder="그룹 이름 예) 얼굴 / 바디 / 패키지" class="pmi flex-1" style="min-width:200px">'+
                  '<span class="chip" style="background:var(--accent-soft);color:var(--accent-strong)">상세 '+cnt+'개</span>'+
                  '<label class="flex items-center gap-2 text-[12.5px]" style="color:var(--text-soft)"><input type="checkbox" data-pg="on" '+(g.on!==false?'checked':'')+' class="pSw"> 공개</label>'+
                  '<button class="peIco" onclick="peMoveGroup('+i+',-1)"><iconify-icon icon="solar:arrow-up-linear" width="14"></iconify-icon></button>'+
                  '<button class="peIco" onclick="peMoveGroup('+i+',1)"><iconify-icon icon="solar:arrow-down-linear" width="14"></iconify-icon></button>'+
                  '<button class="peIco bad" onclick="peDelGroup('+i+')"><iconify-icon icon="solar:trash-bin-trash-linear" width="14"></iconify-icon></button>'+
                '</div></div>';
            }).join('')
          : '<p class="text-[13px] py-4" style="color:var(--muted)">그룹이 없습니다. “그룹 추가” 버튼으로 만들어 주세요.</p>') : '')+
      '</div>'+

      /* --- 상세 상품 --- */
      '<div class="panel rounded-2xl p-6 mt-5">'+
        '<div class="flex items-center justify-between mb-4 flex-wrap gap-2">'+
          '<h2 class="text-[16px] font-bold">상세 상품 ('+_pe.details.length+')</h2>'+
          '<span class="flex items-center gap-2">'+
            '<button onclick="peExpandAll()" class="px-3 h-9 rounded-lg text-[12.5px] font-semibold" style="background:var(--panel-soft);border:1px solid var(--border);color:var(--text-soft)">'+(anyClosed?'전체 펼치기':'전체 접기')+'</button>'+
            '<button onclick="peAddDetail()" class="px-4 h-9 rounded-lg text-[13px] font-semibold btn-gold">상세 상품 추가</button>'+
          '</span>'+
        '</div>'+
        '<div id="peDetails">'+(_pe.details.length ? _pe.details.map(peDetailHTML).join('') : '<p class="text-center py-10 text-[13px]" style="color:var(--muted)">상세 상품이 없습니다. 「상세 상품 추가」로 가격 항목을 등록하세요.<br>첫 번째 공개 상세 상품이 카테고리 카드의 대표 이벤트·가격으로 표시됩니다.</p>')+'</div>'+
      '</div>'+

      /* --- 상세 설명(본문) --- */
      '<div class="panel rounded-2xl p-6 mt-5">'+
        '<h2 class="text-[16px] font-bold mb-3">상세 설명</h2>'+
        rteBar('peMainBody')+
        '<div id="peMainBody" class="rteEd" contenteditable="true" onmouseup="rteSaveSel(\'peMainBody\')" onkeyup="rteSaveSel(\'peMainBody\')" onblur="rteSaveSel(\'peMainBody\')">'+(_pe.body||'')+'</div>'+
      '</div>'+

      /* --- 시술 과정 --- */
      '<div class="panel rounded-2xl p-6 mt-5" id="peList_steps">'+
        '<div class="flex items-center justify-between mb-4"><h2 class="text-[16px] font-bold">시술 과정</h2>'+
        '<button onclick="peListAdd(\'steps\')" class="px-4 h-9 rounded-lg text-[13px] font-semibold" style="background:var(--panel);border:1px solid var(--border);color:var(--text-soft)">+ 단계 추가</button></div>'+
        '<input id="peStepsTitle" value="'+peEsc(_pe.stepsTitle)+'" placeholder="과정 제목 예) 시술 진행 단계" class="pmi mb-3" style="max-width:340px">'+
        (_pe.steps.length ? _pe.steps.map((v,i)=>
          '<div class="flex items-center gap-2 mb-2">'+
            '<span class="shrink-0 text-[11px] font-bold px-2 py-1 rounded" style="background:var(--accent-soft);color:var(--accent-strong)">STEP '+(i+1)+'</span>'+
            '<input data-pl="steps" value="'+peEsc(v)+'" placeholder="예) 개인별 세안 진행" class="pmi flex-1">'+
            '<button class="peIco" onclick="peListMove(\'steps\','+i+',-1)"><iconify-icon icon="solar:arrow-up-linear" width="14"></iconify-icon></button>'+
            '<button class="peIco" onclick="peListMove(\'steps\','+i+',1)"><iconify-icon icon="solar:arrow-down-linear" width="14"></iconify-icon></button>'+
            '<button class="peIco bad" onclick="peListDel(\'steps\','+i+')"><iconify-icon icon="solar:trash-bin-trash-linear" width="14"></iconify-icon></button>'+
          '</div>').join('') : '<p class="text-center py-6 text-[12.5px]" style="color:var(--muted)">단계가 없습니다.</p>')+
      '</div>'+

      /* --- 시술 기본정보 --- */
      '<div class="panel rounded-2xl p-6 mt-5"><h2 class="text-[16px] font-bold mb-4">시술 기본정보</h2>'+
        '<div class="grid sm:grid-cols-2 gap-3">'+
          '<div><label class="pml">시술시간</label><input id="peBasic_time" value="'+peEsc(_pe.basic.time)+'" placeholder="예) 30분 이내" class="pmi"></div>'+
          '<div><label class="pml">마취여부</label><input id="peBasic_anesthesia" value="'+peEsc(_pe.basic.anesthesia)+'" placeholder="예) 마취 없음" class="pmi"></div>'+
          '<div><label class="pml">회복기간</label><input id="peBasic_daily" value="'+peEsc(_pe.basic.daily)+'" placeholder="예) 일상생활 바로 가능" class="pmi"></div>'+
          '<div><label class="pml">유지기간</label><input id="peBasic_duration" value="'+peEsc(_pe.basic.duration)+'" placeholder="예) 6~12개월" class="pmi"></div>'+
        '</div></div>'+

      /* --- 추천 대상 --- */
      peStrListHTML('points','추천 대상','항목 추가','예) 깊어진 팔자주름과 함께 얼굴의 처짐이 느껴지는 분에게 권장됩니다.','POINT')+

      /* --- Q&A --- */
      '<div class="panel rounded-2xl p-6 mt-5" id="peList_qna">'+
        '<div class="flex items-center justify-between mb-4"><h2 class="text-[16px] font-bold">Q&amp;A</h2>'+
        '<button onclick="peListAdd(\'qna\')" class="px-4 h-9 rounded-lg text-[13px] font-semibold" style="background:var(--panel);border:1px solid var(--border);color:var(--text-soft)">+ Q&amp;A 추가</button></div>'+
        (_pe.qna.length ? _pe.qna.map((v,i)=>
          '<div data-pqa="'+i+'" class="peCard">'+
            '<input data-pq value="'+peEsc(v.q)+'" placeholder="질문" class="pmi font-semibold mb-2">'+
            '<textarea data-pa rows="2" placeholder="답변" class="pmi w-full">'+peEsc(v.a)+'</textarea>'+
            '<div class="flex items-center gap-2 mt-2">'+
              '<button class="peIco" onclick="peListMove(\'qna\','+i+',-1)"><iconify-icon icon="solar:arrow-up-linear" width="14"></iconify-icon></button>'+
              '<button class="peIco" onclick="peListMove(\'qna\','+i+',1)"><iconify-icon icon="solar:arrow-down-linear" width="14"></iconify-icon></button>'+
              '<button class="peIco bad ml-auto" onclick="peListDel(\'qna\','+i+')"><iconify-icon icon="solar:trash-bin-trash-linear" width="14"></iconify-icon></button>'+
            '</div>'+
          '</div>').join('') : '<p class="text-center py-6 text-[12.5px]" style="color:var(--muted)">Q&amp;A가 없습니다.</p>')+
      '</div>'+

      /* --- 주의사항 --- */
      peStrListHTML('cautions','주의사항','항목 추가','예) 시술 후 약 일주일간은 음주나 흡연을 삼가고, 사우나나 격렬한 운동은 자제하는 것이 바람직합니다.','항목')+

      /* --- 추천 시술 --- */
      '<div class="panel rounded-2xl p-6 mt-5" id="peList_recs">'+
        '<div class="flex items-center justify-between mb-4 flex-wrap gap-2"><h2 class="text-[16px] font-bold">추천 시술</h2>'+
        '<span class="flex items-center gap-2">'+
          '<select id="peRecSel" class="pmi" style="width:230px">'+others.map(x=>'<option value="'+peEsc(x.id)+'">'+peEsc(x.big||x.title||'(제목 없음)')+'</option>').join('')+'</select>'+
          '<button onclick="peAddRec()" class="px-4 h-9 rounded-lg text-[13px] font-semibold" style="background:var(--panel);border:1px solid var(--border);color:var(--text-soft)">+ 추천 시술 추가</button>'+
        '</span></div>'+
        (_pe.recs.length
          ? '<div class="grid gap-3" style="grid-template-columns:repeat(auto-fill,minmax(300px,1fr))">'+_pe.recs.map((r,i)=>{
              const src=r.id?productById(r.id):null;
              const nm=(src&&(src.big||src.title))||r.name||'(삭제된 상품)';
              const im=src&&src.img
                ? '<img src="'+peEsc(src.img)+'" alt="" style="width:44px;height:44px;object-fit:cover;border-radius:9px;border:1px solid var(--border);flex:0 0 auto">'
                : '<div style="width:44px;height:44px;border-radius:9px;border:1px solid var(--border);background:var(--panel);flex:0 0 auto" class="grid place-items-center"><iconify-icon icon="solar:gallery-linear" width="15" style="color:var(--muted)"></iconify-icon></div>';
              return '<div class="peRecCard" data-prec="'+i+'">'+
                '<div class="flex items-center gap-2.5 mb-2">'+im+
                  '<div class="min-w-0 flex-1">'+
                    '<p class="text-[13px] font-bold truncate">'+peEsc(nm)+'</p>'+
                    '<p class="text-[11px] truncate" style="color:var(--muted)">ID: '+peEsc(r.id||'-')+(src?'':' · 연결 끊김')+'</p>'+
                  '</div>'+
                  '<button class="peIco" onclick="peMoveRec('+i+',-1)"><iconify-icon icon="solar:arrow-up-linear" width="14"></iconify-icon></button>'+
                  '<button class="peIco" onclick="peMoveRec('+i+',1)"><iconify-icon icon="solar:arrow-down-linear" width="14"></iconify-icon></button>'+
                  '<button class="peIco bad" onclick="peDelRec('+i+')"><iconify-icon icon="solar:trash-bin-trash-linear" width="14"></iconify-icon></button>'+
                '</div>'+
                '<label class="pml">안내 문구 (선택)</label>'+
                '<textarea data-precnote rows="2" placeholder="예) 온다로 잡은 매끄러운 윤곽 위로 한 번 더 확실하게" class="pmi">'+peEsc(r.note)+'</textarea>'+
              '</div>';
            }).join('')+'</div>'
          : '<p class="text-[12.5px]" style="color:var(--muted)">선택된 추천 시술이 없습니다. 상품 상세 페이지 하단에 연결 카드로 표시됩니다.</p>')+
      '</div>'+

      /* --- 하단 고정 저장바 --- */
      '<div class="peBarBottom">'+
        '<button onclick="peBack()" class="px-5 h-10 rounded-lg text-[13px] font-semibold" style="background:var(--panel-soft);border:1px solid var(--border);color:var(--text-soft)">취소</button>'+
        '<button onclick="peSave()" class="px-6 h-10 rounded-lg text-[13px] font-semibold btn-gold flex items-center gap-1.5"><iconify-icon icon="solar:upload-minimalistic-linear" width="15"></iconify-icon> 저장하기</button>'+
      '</div>';

    /* 상세 상품 드래그 정렬 */
    const box=document.getElementById('peDetails');
    if(box){
      let src=null;
      box.querySelectorAll('.peAccHd[draggable="true"]').forEach(hd=>{
        hd.addEventListener('dragstart', e=>{ src=hd.parentElement; hd.parentElement.classList.add('peDrag'); try{ e.dataTransfer.effectAllowed='move'; e.dataTransfer.setData('text/plain',''); }catch(err){} });
        hd.addEventListener('dragend', ()=>{ if(src) src.classList.remove('peDrag'); box.querySelectorAll('.peOver').forEach(x=>x.classList.remove('peOver')); });
        hd.addEventListener('dragover', e=>{ e.preventDefault(); if(hd.parentElement!==src) hd.classList.add('peOver'); });
        hd.addEventListener('dragleave', ()=>hd.classList.remove('peOver'));
        hd.addEventListener('drop', e=>{
          e.preventDefault(); hd.classList.remove('peOver');
          const tgt=hd.parentElement;
          if(!src || src===tgt) return;
          const from=parseInt(src.dataset.pdrow), to=parseInt(tgt.dataset.pdrow);
          peStash();
          const t=_pe.details.splice(from,1)[0]; _pe.details.splice(to,0,t);
          buildProductEditor();
        });
      });
    }
    renderIcons(el);
    go('productedit');
  }

  /* ===================== 엑셀 다운로드 / 업로드 ===================== */
  function ensureXlsx(){
    return new Promise((res,rej)=>{
      if(window.XLSX) return res(window.XLSX);
      const s=document.createElement('script');
      s.src='https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js';
      s.onload=()=>window.XLSX?res(window.XLSX):rej(new Error('엑셀 라이브러리 로드 실패'));
      s.onerror=()=>rej(new Error('엑셀 라이브러리를 불러오지 못했습니다. 인터넷 연결을 확인해주세요.'));
      document.head.appendChild(s);
    });
  }
  function pDate(){ const d=new Date(); const z=n=>String(n).padStart(2,'0'); return d.getFullYear()+z(d.getMonth()+1)+z(d.getDate()); }

  async function exportProductsExcel(){
    let XLSX;
    try{ XLSX=await ensureXlsx(); }catch(e){ toast(e.message, false); return; }
    const products=productsGet();
    const prodRows=products.map((p,i)=>({
      '순번':i+1, '상품ID':p.id, '카테고리':p.cat||'', '상품명':p.big||'', '페이지타이틀':p.pageTitle||'',
      '짧은카피':p.script||'', '설명':p.desc||'', '유튜브':p.youtube||'', '이미지URL':p.img||'',
      '노출':p.on!==false?'Y':'N',
      '시술시간':(p.basic&&p.basic.time)||'', '마취여부':(p.basic&&p.basic.anesthesia)||'',
      '회복기간':(p.basic&&p.basic.daily)||'', '유지기간':(p.basic&&p.basic.duration)||'',
      '과정제목':p.stepsTitle||'', '시술과정(|구분)':(p.steps||[]).join(' | '),
      '추천대상(|구분)':(p.points||[]).join(' | '), '주의사항(|구분)':(p.cautions||[]).join(' | '),
      'QnA(질문::답변|구분)':(p.qna||[]).map(x=>x.q+'::'+x.a).join(' | '),
      '추천시술ID(|구분)':(p.recs||[]).map(r=>r.id).join(' | '),
    }));
    const detRows=[];
    products.forEach(p=>{
      (p.details||[]).forEach((d,j)=>{
        const g=(p.groups||[]).find(x=>x.id===d.gid);
        detRows.push({
          '상품ID':p.id, '상품명':p.big||'', '상세상품ID':d.id, 'No':j+1,
          '중분류그룹':g?(g.name||''):'', '권종':(function(){ try{ const v=voucherById(d.voucher); return v?v.name:''; }catch(e){ return ''; } })(), '상세상품명':d.t||'',
          '정가':d.price===''?'':(parseInt(d.price)||0), '할인가':d.sale===''?'':(parseInt(d.sale)||0),
          '공개':d.on!==false?'Y':'N', '기간유형':d.perType==='range'?'기간설정':'상시',
          '시작일':d.start||'', '종료일':d.end||'', '이용가능':d.avail||'', '안내문구':d.notice||'',
        });
      });
    });
    const wb=XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(prodRows), '상품');
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(detRows), '상세상품');
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet([
      {'안내':'1. 상품ID / 상세상품ID 열은 절대 수정하거나 지우지 마세요. 이 값으로 기존 데이터를 찾아 덮어씁니다.'},
      {'안내':'2. ID를 비워두고 새 행을 추가하면 새 상품(또는 새 상세 상품)으로 등록됩니다.'},
      {'안내':'3. 이 파일에서 지운 행은 홈페이지에서 삭제되지 않습니다. 삭제는 관리자 화면에서 해주세요.'},
      {'안내':'4. 리치텍스트로 작성한 「상세 설명」 본문은 서식 보존을 위해 엑셀에 포함되지 않습니다.'},
      {'안내':'5. 노출/공개 열은 Y 또는 N 으로만 입력하세요.'},
    ]), '사용안내');
    XLSX.writeFile(wb, '연오재_시술상품_'+pDate()+'.xlsx');
    toast('엑셀 파일을 내려받았습니다.');
  }

  async function importProductsExcel(input){
    const file=input.files && input.files[0];
    input.value='';
    if(!file) return;
    let XLSX;
    try{ XLSX=await ensureXlsx(); }catch(e){ toast(e.message, false); return; }
    try{
      const buf=await file.arrayBuffer();
      const wb=XLSX.read(buf, {type:'array'});
      const prodSheet=wb.Sheets['상품'];
      const detSheet=wb.Sheets['상세상품'];
      if(!prodSheet && !detSheet){ toast('「상품」 또는 「상세상품」 시트를 찾지 못했습니다.', false); return; }
      const base=productsGet();
      const byId={}; base.forEach(p=>{ byId[p.id]=p; });
      let uProd=0, nProd=0, uDet=0, nDet=0;
      const S=v=>String(v==null?'':v).trim();
      const splitList=v=>S(v).split('|').map(x=>x.trim()).filter(Boolean);

      if(prodSheet){
        XLSX.utils.sheet_to_json(prodSheet, {defval:''}).forEach(row=>{
          let p=byId[S(row['상품ID'])];
          if(!p){
            if(!S(row['상품명'])) return;
            p=peBlank(); p.id=S(row['상품ID'])||pUid('p');
            base.push(p); byId[p.id]=p; nProd++;
          } else uProd++;
          if(S(row['카테고리'])) p.cat=S(row['카테고리']);
          if(S(row['상품명'])){ p.big=S(row['상품명']); p.title=p.big; }
          p.pageTitle=S(row['페이지타이틀']);
          p.script=S(row['짧은카피']);
          p.desc=S(row['설명']);
          p.youtube=S(row['유튜브']);
          if(S(row['이미지URL'])) p.img=S(row['이미지URL']);
          if(S(row['노출'])) p.on = S(row['노출']).toUpperCase()!=='N';
          p.basic={time:S(row['시술시간']), anesthesia:S(row['마취여부']), daily:S(row['회복기간']), duration:S(row['유지기간'])};
          p.stepsTitle=S(row['과정제목']);
          p.steps=splitList(row['시술과정(|구분)']);
          p.points=splitList(row['추천대상(|구분)']);
          p.cautions=splitList(row['주의사항(|구분)']);
          p.qna=splitList(row['QnA(질문::답변|구분)']).map(x=>{ const i=x.indexOf('::'); return i<0?{q:x,a:''}:{q:x.slice(0,i).trim(),a:x.slice(i+2).trim()}; });
          p.recs=splitList(row['추천시술ID(|구분)']).map(id=>{ const s2=base.find(x=>x.id===id); const old=(p.recs||[]).find(r=>r.id===id); return {id:id, name:s2?(s2.big||''):'', note:old?old.note:''}; });
        });
      }
      if(detSheet){
        XLSX.utils.sheet_to_json(detSheet, {defval:''}).forEach(row=>{
          const p=byId[S(row['상품ID'])];
          if(!p) return;
          let d=(p.details||[]).find(x=>x.id===S(row['상세상품ID']));
          if(!d){
            if(!S(row['상세상품명'])) return;
            d=peDetailBlank(); if(S(row['상세상품ID'])) d.id=S(row['상세상품ID']);
            p.details.push(d); nDet++;
          } else uDet++;
          d.t=S(row['상세상품명']);
          d.price=S(row['정가']); d.sale=S(row['할인가']);
          if(S(row['공개'])) d.on = S(row['공개']).toUpperCase()!=='N';
          d.perType = S(row['기간유형'])==='기간설정' ? 'range' : 'always';
          d.start=S(row['시작일']); d.end=S(row['종료일']);
          d.avail=S(row['이용가능']); d.notice=S(row['안내문구']);
          const vname=S(row['권종']);
          if(vname){
            try{ const v=vouchersGet().find(x=>x.name===vname); if(v) d.voucher=v.id; }catch(e){}
          }
          const gname=S(row['중분류그룹']);
          if(gname){
            let g=(p.groups||[]).find(x=>x.name===gname);
            if(!g){ g={id:pUid('g'), name:gname, on:true}; p.groups.push(g); }
            d.gid=g.id;
          }
        });
        /* No 순서 반영 */
        if(detSheet){
          const order={};
          XLSX.utils.sheet_to_json(detSheet, {defval:''}).forEach(row=>{
            const pid=S(row['상품ID']), did=S(row['상세상품ID']);
            if(!pid||!did) return;
            order[pid]=order[pid]||{}; order[pid][did]=parseInt(row['No'])||9999;
          });
          Object.keys(order).forEach(pid=>{
            const p=byId[pid]; if(!p) return;
            p.details.sort((a,b)=>(order[pid][a.id]||9999)-(order[pid][b.id]||9999));
          });
        }
      }
      productsPut(base, '엑셀을 반영했습니다. (상품 수정 '+uProd+' · 추가 '+nProd+' / 상세 수정 '+uDet+' · 추가 '+nDet+')');
      rerenderProducts();
    }catch(e){
      console.error(e);
      toast('엑셀을 읽지 못했습니다: '+((e&&e.message)||e), false);
    }
  }

  /* 구버전 호환 */
  function saveProducts(){ productsPut(productsGet(), '상품이 저장됐습니다.'); }
  function productsSyncInline(base){ return base; }
