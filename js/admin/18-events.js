  /* ---------- 기간별 이벤트 (상세 상품 자동 집계) ---------- */
  let _evFilter='all', _evQuery='';

  function evStatus(dt){
    if(dt.perType!=='range' || (!dt.start && !dt.end)) return 'always';
    const now=Date.now();
    try{
      if(dt.start && now < new Date(dt.start+'T00:00').getTime()) return 'soon';
      if(dt.end   && now > new Date(dt.end+'T23:59').getTime())   return 'ended';
    }catch(e){}
    return 'live';
  }
  function evDaysLeft(dt){
    if(!dt.end) return null;
    try{ return Math.ceil((new Date(dt.end+'T23:59').getTime()-Date.now())/86400000); }
    catch(e){ return null; }
  }
  function evRows(){
    const out=[];
    productsGet().forEach(p=>{
      (p.details||[]).forEach(dt=>{
        const g=(p.groups||[]).find(x=>x.id===dt.gid);
        out.push({p:p, dt:dt, group:g?(g.name||''):'', st:evStatus(dt)});
      });
    });
    return out;
  }
  function evFiltered(){
    const q=_evQuery;
    return evRows().filter(r=>{
      if(_evFilter!=='all' && r.st!==_evFilter) return false;
      if(!q) return true;
      return [r.p.big, r.dt.t, r.group, r.dt.notice, r.dt.avail].join(' ').toLowerCase().includes(q);
    });
  }
  function rerenderEvents(){
    const old=document.getElementById('view-events'); if(old) old.remove();
    BUILDERS.events(); go('events');
  }
  function evSetFilter(f){ _evFilter=f; rerenderEvents(); }
  function evSearch(v){ _evQuery=(v||'').trim().toLowerCase(); rerenderEvents(); }
  function evHideEnded(){
    const base=productsGet();
    let n=0;
    base.forEach(p=>{ (p.details||[]).forEach(dt=>{ if(evStatus(dt)==='ended' && dt.on!==false) n++; }); });
    if(!n){ toast('비공개로 바꿀 종료된 상세 상품이 없습니다.', false); return; }
    if(!confirm('기간이 끝난 상세 상품 '+n+'건을 모두 비공개로 바꿀까요?\n(홈페이지에서는 이미 자동으로 숨겨져 있습니다)')) return;
    base.forEach(p=>{ (p.details||[]).forEach(dt=>{ if(evStatus(dt)==='ended') dt.on=false; }); });
    productsPut(base, '종료된 상세 상품 '+n+'건을 비공개로 바꿨습니다.');
    rerenderEvents();
  }

  BUILDERS.events = function(){
    if(typeof peCss==='function') peCss();
    const all=evRows();
    const rows=evFiltered();
    const esc=v=>String(v==null?'':v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/"/g,'&quot;');
    const cnt=s=>all.filter(r=>r.st===s).length;
    const TABS=[['all','전체',all.length],['live','진행중',cnt('live')],['soon','예정',cnt('soon')],['ended','종료',cnt('ended')],['always','상시',cnt('always')]];
    const STY={
      live  :{bg:'var(--good-bg)',    cl:'var(--good)',  t:'진행중'},
      soon  :{bg:'#e7edff',           cl:'#2549b8',      t:'예정'},
      ended :{bg:'var(--bad-bg)',     cl:'var(--bad)',   t:'종료'},
      always:{bg:'var(--panel-soft)', cl:'var(--muted)', t:'상시'}
    };
    const el=makeView('events');
    el.innerHTML = pageHead('기간별 이벤트','시술 상품의 상세 상품(가격 항목)을 한눈에 모아 봅니다. 행을 클릭하면 해당 상품 편집기로 이동합니다.',
      '<button onclick="evHideEnded()" class="px-4 h-9 rounded-lg text-[13px] font-semibold flex items-center gap-1.5" style="background:var(--panel);border:1px solid var(--border);color:var(--text-soft)"><iconify-icon icon="solar:eye-closed-linear" width="15"></iconify-icon> 종료된 항목 일괄 비공개</button>') +
      '<div class="flex items-center gap-2 flex-wrap mb-4">'+
        TABS.map(([k,label,n])=>
          '<button onclick="evSetFilter(\''+k+'\')" class="px-3.5 h-9 rounded-lg text-[12.5px] font-semibold" style="'+
            (_evFilter===k ? 'background:var(--accent);color:#fff;border:1px solid var(--accent)'
                           : 'background:var(--panel);border:1px solid var(--border);color:var(--text-soft)')+
          '">'+label+' <span style="opacity:.75">'+n+'</span></button>').join('')+
        '<input value="'+esc(_evQuery)+'" oninput="evSearch(this.value)" placeholder="상품·상세 상품 검색" class="pmi" style="width:230px">'+
        '<span class="text-[12.5px] ml-auto" style="color:var(--muted)">기간이 끝난 항목은 홈페이지에서 자동으로 숨겨집니다.</span>'+
      '</div>'+
      '<div class="panel rounded-2xl overflow-hidden"><div class="overflow-x-auto"><table class="tbl w-full text-[13.5px] whitespace-nowrap">'+
      '<thead><tr style="background:var(--panel-soft);color:var(--muted)">'+
        '<th class="px-4 py-3.5 font-semibold">시술 상품</th>'+
        '<th class="px-4 py-3.5 font-semibold">중분류</th>'+
        '<th class="px-4 py-3.5 font-semibold">상세 상품</th>'+
        '<th class="px-4 py-3.5 font-semibold">상태 · 기간</th>'+
        '<th class="px-4 py-3.5 font-semibold">이용 가능</th>'+
        '<th class="px-4 py-3.5 font-semibold">안내 문구</th>'+
        '<th class="px-4 py-3.5 font-semibold text-right">정가</th>'+
        '<th class="px-4 py-3.5 font-semibold text-right">할인가</th>'+
      '</tr></thead><tbody>'+
      (rows.length ? rows.map(r=>{
        const s=STY[r.st];
        const dleft=(r.st==='live') ? evDaysLeft(r.dt) : null;
        const period = r.st==='always' ? '' :
          '<span class="text-[12px] ml-1.5" style="color:var(--text-soft)">'+esc(r.dt.start||'')+' ~ '+esc(r.dt.end||'')+'</span>'+
          (dleft!==null && dleft>=0 && dleft<=14 ? '<span class="chip ml-1.5" style="background:#fff3cd;color:#8a6100">마감 D-'+dleft+'</span>' : '');
        return '<tr style="border-top:1px solid var(--border-soft);cursor:pointer'+(r.st==='ended'?';opacity:.62':'')+'" onclick="openProductEditor(\''+esc(r.p.id)+'\')">'+
          '<td class="px-4 py-3.5" style="color:var(--text-soft)">'+esc(r.p.big)+'</td>'+
          '<td class="px-4 py-3.5">'+(r.group?'<span class="chip" style="background:var(--accent-soft);color:var(--accent-strong)">'+esc(r.group)+'</span>':'<span style="color:var(--muted)">-</span>')+'</td>'+
          '<td class="px-4 py-3.5 font-semibold">'+esc(r.dt.t)+(r.dt.on===false?' <span class="chip" style="background:var(--bad-bg);color:var(--bad)">비공개</span>':'')+'</td>'+
          '<td class="px-4 py-3.5"><span class="chip" style="background:'+s.bg+';color:'+s.cl+'">'+s.t+'</span>'+period+'</td>'+
          '<td class="px-4 py-3.5" style="color:var(--text-soft)">'+(esc(r.dt.avail)||'-')+'</td>'+
          '<td class="px-4 py-3.5" style="color:var(--text-soft)">'+(esc(r.dt.notice)||'-')+'</td>'+
          '<td class="px-4 py-3.5 text-right" style="color:var(--muted)">'+(r.dt.price? parseInt(r.dt.price).toLocaleString('ko-KR')+'원':'-')+'</td>'+
          '<td class="px-4 py-3.5 text-right" style="color:var(--accent-strong);font-weight:700">'+(r.dt.sale? parseInt(r.dt.sale).toLocaleString('ko-KR')+'원':'-')+'</td>'+
        '</tr>';
      }).join('') : '<tr><td colspan="8" class="text-center py-14" style="color:var(--muted)">조건에 맞는 상세 상품이 없습니다.</td></tr>')+
      '</tbody></table></div></div>';
    renderIcons(el);
  };
