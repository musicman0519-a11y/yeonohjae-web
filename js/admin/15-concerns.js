  /* ---------- 고민별 접근 (고민 카테고리 + 세부 고민) ---------- */
  let _cdList=null, _cdEdit=null;

  function concernDetailsGet(){
    const d=KK.get('concernDetails', null);
    if(Array.isArray(d)) return d.map(x=>({id:x.id||('cd'+Math.random().toString(36).slice(2,7)), cat:x.cat||'', name:x.name||'', slug:x.slug||'', on:x.on!==false}));
    /* 최초 1회: 예시 세부 고민 */
    return [
      {id:'cd1', cat:'여드름/모공/흉터', name:'블랙헤드/화이트헤드', slug:'블랙헤드-화이트헤드', on:true},
      {id:'cd2', cat:'미백/기미/색소',   name:'기미 (난치성 색소)',  slug:'기미-난치성-색소',   on:true},
      {id:'cd3', cat:'리프팅/탄력/윤곽', name:'이중턱',              slug:'이중턱',             on:true},
      {id:'cd4', cat:'여드름/모공/흉터', name:'여드름 흉터',          slug:'여드름-흉터',        on:true},
      {id:'cd5', cat:'제모/문신제거',    name:'난치성/잔여 문신',     slug:'난치성-잔여-문신',   on:true}
    ];
  }
  function cdSlugify(v){ return String(v||'').trim().replace(/\s+/g,'-').replace(/[\/·,]/g,'-').replace(/-+/g,'-'); }
  function cdLoad(){ _cdList = concernDetailsGet(); }
  function rerenderConcerns(){
    const old=document.getElementById('view-concerns'); if(old) old.remove();
    BUILDERS.concerns(); go('concerns');
  }
  function cdStash(){
    document.querySelectorAll('#view-concerns [data-cdrow]').forEach(row=>{
      const i=parseInt(row.dataset.cdrow); const d=_cdList[i]; if(!d) return;
      const nm=row.querySelector('[data-cdf="name"]'); if(nm) d.name=nm.value.trim();
      const sl=row.querySelector('[data-cdf="slug"]'); if(sl) d.slug=sl.value.trim();
      const ct=row.querySelector('[data-cdf="cat"]');  if(ct) d.cat=ct.value;
      const on=row.querySelector('[data-cdf="on"]');   if(on) d.on=on.checked;
    });
  }
  function cdToggleEdit(i){ cdStash(); _cdEdit=(_cdEdit===i?null:i); rerenderConcerns(); }
  function cdMove(i,dir){ cdStash(); const j=i+dir; if(j<0||j>=_cdList.length) return; const t=_cdList[i]; _cdList[i]=_cdList[j]; _cdList[j]=t; _cdEdit=null; rerenderConcerns(); }
  function cdAdd(){
    cdStash();
    const el=document.getElementById('cdNewName');
    const v=(el&&el.value||'').trim();
    if(!v){ toast('추가할 세부 고민 이름을 입력해주세요.', false); if(el) el.focus(); return; }
    const cats=(typeof concernsGet==='function'? concernsGet(): []).filter(c=>c.on!==false);
    _cdList.push({id:'cd'+Date.now().toString(36), cat:(cats[0]&&cats[0].name)||'', name:v, slug:cdSlugify(v), on:true});
    _cdEdit=_cdList.length-1;
    rerenderConcerns();
  }
  function cdDelete(i){
    cdStash();
    const d=_cdList[i]; if(!d) return;
    if(!confirm('「'+(d.name||'이 항목')+'」 세부 고민을 삭제할까요?')) return;
    _cdList.splice(i,1); _cdEdit=null; rerenderConcerns();
  }
  function saveConcerns(){
    cdStash();
    KK.set('concernDetails', _cdList.map(d=>({id:d.id, cat:d.cat, name:d.name, slug:d.slug||cdSlugify(d.name), on:d.on!==false})));
    _cdEdit=null;
    toast(STORAGE_OK? '고민별 접근 설정을 저장했습니다.' : '미리보기 환경에선 저장이 제한됩니다.', STORAGE_OK);
    rerenderConcerns();
  }

  BUILDERS.concerns = function(){
    if(typeof peCss==='function') peCss();
    if(typeof catCss==='function') catCss();
    if(!_cdList) cdLoad();
    const esc=v=>String(v==null?'':v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/"/g,'&quot;');
    const cats=(typeof concernsGet==='function'? concernsGet(): []);
    const visCats=cats.filter(c=>c.on!==false);
    const el = makeView('concerns');

    el.innerHTML = pageHead('시술 노트 · 고민별 접근','고민 카테고리별로 세부 고민을 등록합니다. 고민 카테고리 자체는 「카테고리 관리」에서 추가·수정합니다.',
      '<button onclick="go(\'categories\')" class="px-4 h-9 rounded-lg text-[13px] font-semibold flex items-center gap-1.5" style="background:var(--panel);border:1px solid var(--border);color:var(--text-soft)"><iconify-icon icon="solar:folder-linear" width="15"></iconify-icon> 고민 카테고리 관리로</button>'+
      '<button onclick="saveConcerns()" class="px-4 h-9 rounded-lg text-[13px] font-semibold btn-gold flex items-center gap-1.5"><iconify-icon icon="solar:upload-minimalistic-linear" width="15"></iconify-icon> 저장</button>')+

      '<div class="panel rounded-2xl p-5 mb-5">'+
        '<div class="flex items-center justify-between mb-3 flex-wrap gap-2">'+
          '<h2 class="text-[15px] font-bold">고민 카테고리 <span class="text-[12px]" style="color:var(--muted);font-weight:500">'+cats.length+'개 · 노출 '+visCats.length+'개</span></h2>'+
          '<span class="text-[12px]" style="color:var(--muted)">추가·이름변경·순서는 「카테고리 관리」 화면에서 합니다.</span>'+
        '</div>'+
        (cats.length
          ? '<div class="flex flex-wrap gap-2">'+cats.map(c=>
              '<span class="chip" style="background:'+(c.on!==false?'var(--accent-soft)':'var(--panel-soft)')+';color:'+(c.on!==false?'var(--accent-strong)':'var(--muted)')+';font-size:12.5px;padding:6px 12px">'+
              esc(c.name)+(c.on===false?' · 숨김':'')+' <span style="opacity:.7">('+_cdList.filter(d=>d.cat===c.name).length+')</span></span>').join('')+'</div>'
          : '<p class="text-[13px]" style="color:var(--muted)">고민 카테고리가 없습니다. 「카테고리 관리」에서 추가해주세요.</p>')+
      '</div>'+

      '<div class="panel rounded-2xl p-5">'+
        '<h2 class="text-[15px] font-bold mb-3">세부 고민 <span class="text-[12px]" style="color:var(--muted);font-weight:500">'+_cdList.length+'개</span></h2>'+
        '<div class="flex items-center gap-2 mb-4" style="max-width:520px">'+
          '<input id="cdNewName" placeholder="새 세부 고민 예) 이중턱" class="pmi flex-1" onkeydown="if(event.key===\'Enter\')cdAdd()">'+
          '<button onclick="cdAdd()" class="px-3.5 h-9 rounded-lg text-[13px] font-semibold btn-gold shrink-0 flex items-center gap-1"><iconify-icon icon="solar:add-circle-linear" width="15"></iconify-icon> 추가</button>'+
        '</div>'+
        (_cdList.length ? '<div class="grid gap-3" style="grid-template-columns:repeat(auto-fill,minmax(320px,1fr))">'+
          _cdList.map((d,i)=>{
            const open=_cdEdit===i;
            const orphan=d.cat && !cats.some(c=>c.name===d.cat);
            return '<div class="ctCard'+(open?' open':'')+'" data-cdrow="'+i+'">'+
              '<div class="flex items-center gap-2">'+
                '<p class="flex-1 text-[13.5px] font-semibold break-keep">'+esc(d.name||'(이름 없음)')+'</p>'+
                '<button class="ctIco" onclick="cdMove('+i+',-1)"><iconify-icon icon="solar:arrow-up-linear" width="14"></iconify-icon></button>'+
                '<button class="ctIco" onclick="cdMove('+i+',1)"><iconify-icon icon="solar:arrow-down-linear" width="14"></iconify-icon></button>'+
                '<button class="ctIco'+(open?' act':'')+'" onclick="cdToggleEdit('+i+')" title="수정"><iconify-icon icon="solar:pen-2-linear" width="14"></iconify-icon></button>'+
                '<button class="ctIco bad" onclick="cdDelete('+i+')"><iconify-icon icon="solar:trash-bin-trash-linear" width="14"></iconify-icon></button>'+
              '</div>'+
              '<div class="flex items-center gap-1.5 flex-wrap mt-2">'+
                '<span class="ctTag">'+(esc(d.cat)||'분류 없음')+'</span>'+
                (orphan?'<span class="chip" style="background:var(--bad-bg);color:var(--bad)">없는 분류</span>':'')+
                '<span class="text-[11px]" style="color:var(--muted)">'+esc(d.slug||cdSlugify(d.name))+'</span>'+
                '<span class="chip" style="background:'+(d.on!==false?'var(--good-bg)':'var(--panel-soft)')+';color:'+(d.on!==false?'var(--good)':'var(--muted)')+'">'+(d.on!==false?'노출':'숨김')+'</span>'+
              '</div>'+
              (open ? '<div class="ctEdit">'+
                '<label class="pml">고민 카테고리</label>'+
                '<select data-cdf="cat" class="pmi mb-2.5"><option value="">분류 없음</option>'+
                  cats.map(c=>'<option value="'+esc(c.name)+'"'+(c.name===d.cat?' selected':'')+'>'+esc(c.name)+(c.on===false?' (숨김)':'')+'</option>').join('')+
                '</select>'+
                '<label class="pml">세부 고민 이름</label>'+
                '<input data-cdf="name" value="'+esc(d.name)+'" class="pmi mb-2.5">'+
                '<label class="pml">주소용 이름 (slug)</label>'+
                '<input data-cdf="slug" value="'+esc(d.slug||cdSlugify(d.name))+'" class="pmi mb-2.5">'+
                '<label class="flex items-center gap-2 text-[12.5px]" style="color:var(--text-soft)"><input type="checkbox" data-cdf="on" '+(d.on!==false?'checked':'')+' class="pSw"> 노출</label>'+
              '</div>' : '')+
            '</div>';
          }).join('')+'</div>'
          : '<p class="text-center py-10 text-[13px]" style="color:var(--muted)">등록된 세부 고민이 없습니다.</p>')+
      '</div>';
    renderIcons(el);
  };
