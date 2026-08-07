  /* ---------- 고객 예약 목록 (홈페이지 온라인예약과 실시간 연동) ---------- */
  let _rvQuery='', _rvDate='', _rvStatus='전체', _rvPanel=null;

  function rvGet(){
    const l=KK.get('reservations', []);
    return Array.isArray(l)? l : [];
  }
  function rvPut(list, msg){
    KK.set('reservations', list);
    if(msg) toast(STORAGE_OK? msg : '미리보기 환경에선 저장이 제한됩니다.', STORAGE_OK);
  }
  function rvHours(){
    const d=KK.get('resHours', null) || {};
    return {
      open:d.open||'10:00', close:d.close||'18:00', interval:parseInt(d.interval)||30,
      lunchStart:d.lunchStart||'13:00', lunchEnd:d.lunchEnd||'14:00',
      offDows:Array.isArray(d.offDows)?d.offDows:[0], capacity:parseInt(d.capacity)||1
    };
  }
  function rvClosed(){ const c=KK.get('resClosed', []); return Array.isArray(c)?c:[]; }
  function rvDigits(v){ return String(v||'').replace(/[^0-9]/g,''); }

  function rerenderReservations(){
    const old=document.getElementById('view-reservations'); if(old) old.remove();
    BUILDERS.reservations(); go('reservations');
  }
  function rvSearch(v){ _rvQuery=(v||'').trim().toLowerCase(); rerenderReservations(); }
  function rvSetDate(v){ _rvDate=v||''; rerenderReservations(); }
  function rvSetStatus(v){ _rvStatus=v||'전체'; rerenderReservations(); }
  function rvReset(){ _rvQuery=''; _rvDate=''; _rvStatus='전체'; rerenderReservations(); }
  function rvTogglePanel(p){ _rvPanel = (_rvPanel===p? null : p); rerenderReservations(); }

  function rvFiltered(){
    const q=_rvQuery;
    return rvGet().filter(r=>{
      if(_rvStatus!=='전체' && (r.status||'미확정')!==_rvStatus) return false;
      if(_rvDate && r.date!==_rvDate) return false;
      if(!q) return true;
      return [r.name, r.phone, r.item].join(' ').toLowerCase().includes(q);
    }).sort((a,b)=> (b.date+b.time).localeCompare(a.date+a.time));
  }
  function rvSetStatusOf(id, st){
    const list=rvGet().slice();
    const hit=list.find(x=>x.id===id); if(!hit) return;
    hit.status=st;
    rvPut(list, '「'+(hit.name||'')+'」 예약을 '+st+' 처리했습니다.');
    rerenderReservations();
  }
  function rvDelete(id){
    const list=rvGet().slice();
    const i=list.findIndex(x=>x.id===id); if(i<0) return;
    const r=list[i];
    if(!confirm('「'+(r.name||'')+' · '+r.date+' '+r.time+'」 예약을 목록에서 완전히 삭제할까요?\n(고객에게 취소 안내를 하려면 「취소」를 쓰세요)')) return;
    list.splice(i,1);
    rvPut(list, '예약을 삭제했습니다.');
    rerenderReservations();
  }
  function rvAddManual(){
    const name=prompt('예약자 이름을 입력하세요 (전화 예약 등 수기 등록)');
    if(!name || !name.trim()) return;
    const phone=prompt('연락처를 입력하세요 (예: 010-1234-5678)') || '';
    const date=prompt('예약 날짜 (YYYY-MM-DD)', new Date().toISOString().slice(0,10)) || '';
    if(!/^\d{4}-\d{2}-\d{2}$/.test(date)){ toast('날짜 형식이 올바르지 않습니다.', false); return; }
    const time=prompt('예약 시간 (예: 14:30)') || '';
    if(!/^\d{1,2}:\d{2}$/.test(time)){ toast('시간 형식이 올바르지 않습니다.', false); return; }
    const item=prompt('시술/이벤트 (비우면 상담하기)') || '상담하기';
    const list=rvGet().slice();
    list.unshift({
      id:'r'+Date.now().toString(36)+Math.random().toString(36).slice(2,6),
      name:name.trim(), phone:phone.trim(), date:date, time:time, item:item,
      first: list.some(x=>rvDigits(x.phone)===rvDigits(phone)) ? '재진':'초진',
      sms:'동의', status:'확정', memo:'수기 등록', createdAt:new Date().toISOString()
    });
    rvPut(list, '예약을 수기로 등록했습니다.');
    rerenderReservations();
  }
  function rvExport(){
    const rows=rvFiltered();
    if(!rows.length){ toast('내보낼 예약이 없습니다.', false); return; }
    const head=['예약일','시간','이름','연락처','초진','SMS','시술/이벤트','상태','접수시각'];
    const body=rows.map(r=>[r.date,r.time,r.name,r.phone,r.first,r.sms,(r.item||'').replace(/,/g,' '),r.status,(r.createdAt||'').slice(0,19)]);
    const csv='﻿'+[head,...body].map(l=>l.map(c=>'"'+String(c==null?'':c).replace(/"/g,'""')+'"').join(',')).join('\n');
    const a=document.createElement('a');
    a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));
    const d=new Date(); const z=n=>String(n).padStart(2,'0');
    a.download='연오재_예약목록_'+d.getFullYear()+z(d.getMonth()+1)+z(d.getDate())+'.csv';
    a.click(); URL.revokeObjectURL(a.href);
    toast('예약 목록을 CSV로 내려받았습니다. 엑셀에서 열면 됩니다.');
  }

  /* ----- 예약 가능시간 수정 ----- */
  function rvSaveHours(){
    const g=id=>document.getElementById(id);
    const offs=Array.from(document.querySelectorAll('[data-rvdow]')).filter(x=>x.checked).map(x=>parseInt(x.dataset.rvdow));
    const cfg={
      open:g('rvOpen').value||'10:00', close:g('rvClose').value||'18:00',
      interval:parseInt(g('rvInterval').value)||30,
      lunchStart:g('rvLunchS').value||'', lunchEnd:g('rvLunchE').value||'',
      offDows:offs, capacity:parseInt(g('rvCap').value)||1
    };
    KK.set('resHours', cfg);
    toast(STORAGE_OK? '예약 가능시간을 저장했습니다. 홈페이지 예약 화면에 즉시 반영됩니다.' : '미리보기 환경에선 저장이 제한됩니다.', STORAGE_OK);
    rerenderReservations();
  }
  /* ----- 마감처리 ----- */
  function rvAddClosed(){
    const v=document.getElementById('rvClosedDate').value;
    if(!v){ toast('마감할 날짜를 선택해주세요.', false); return; }
    const list=rvClosed().slice();
    if(list.includes(v)){ toast('이미 마감된 날짜입니다.', false); return; }
    list.push(v); list.sort();
    KK.set('resClosed', list);
    toast(STORAGE_OK? v+' 을(를) 마감 처리했습니다. 홈페이지에서 예약이 불가능해집니다.' : '미리보기 환경에선 저장이 제한됩니다.', STORAGE_OK);
    rerenderReservations();
  }
  function rvDelClosed(d){
    const list=rvClosed().filter(x=>x!==d);
    KK.set('resClosed', list);
    toast(d+' 마감을 해제했습니다.');
    rerenderReservations();
  }

  BUILDERS.reservations = function(){
    if(typeof peCss==='function') peCss();
    if(typeof catCss==='function') catCss();
    const esc=v=>String(v==null?'':v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/"/g,'&quot;');
    const all=rvGet(), rows=rvFiltered(), cfg=rvHours(), closed=rvClosed();
    const cnt=s=>all.filter(r=>(r.status||'미확정')===s).length;
    const DOW=['일','월','화','수','목','금','토'];
    const el = makeView('reservations');

    el.innerHTML = pageHead('고객 예약 목록','홈페이지 「온라인예약」으로 접수된 예약이 실시간으로 여기에 쌓입니다.',
      '<button onclick="rvAddManual()" class="px-3 h-9 rounded-lg text-[13px] font-semibold flex items-center gap-1.5" style="background:var(--panel);border:1px solid var(--border);color:var(--text-soft)"><iconify-icon icon="solar:add-circle-linear" width="15"></iconify-icon> 수기 등록</button>'+
      '<button onclick="rvExport()" class="px-3 h-9 rounded-lg text-[13px] font-semibold flex items-center gap-1.5" style="background:var(--panel);border:1px solid var(--border);color:var(--text-soft)"><iconify-icon icon="solar:download-minimalistic-linear" width="15"></iconify-icon> CSV 내려받기</button>'+
      '<button onclick="rvTogglePanel(\'hours\')" class="px-3 h-9 rounded-lg text-[13px] font-semibold text-white" style="background:'+(_rvPanel==='hours'?'var(--accent-strong)':'#5849d4')+'">예약 가능시간 수정</button>'+
      '<button onclick="rvTogglePanel(\'closed\')" class="px-3 h-9 rounded-lg text-[13px] font-semibold text-white" style="background:'+(_rvPanel==='closed'?'var(--accent-strong)':'var(--bad)')+'">마감처리</button>') +

      (_rvPanel==='hours' ? '<div class="panel rounded-2xl p-5 mb-4">'+
        '<h2 class="text-[15px] font-bold mb-4">예약 가능시간</h2>'+
        '<div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-3">'+
          '<div><label class="pml">시작 시간</label><input id="rvOpen" type="time" value="'+esc(cfg.open)+'" class="pmi"></div>'+
          '<div><label class="pml">종료 시간</label><input id="rvClose" type="time" value="'+esc(cfg.close)+'" class="pmi"></div>'+
          '<div><label class="pml">예약 간격 (분)</label><input id="rvInterval" type="number" min="10" step="10" value="'+cfg.interval+'" class="pmi"></div>'+
          '<div><label class="pml">같은 시간 동시 예약 수</label><input id="rvCap" type="number" min="1" value="'+cfg.capacity+'" class="pmi"></div>'+
          '<div><label class="pml">점심 시작</label><input id="rvLunchS" type="time" value="'+esc(cfg.lunchStart)+'" class="pmi"></div>'+
          '<div><label class="pml">점심 종료</label><input id="rvLunchE" type="time" value="'+esc(cfg.lunchEnd)+'" class="pmi"></div>'+
        '</div>'+
        '<label class="pml">휴무 요일 (체크하면 예약을 받지 않습니다)</label>'+
        '<div class="flex items-center gap-1.5 flex-wrap mb-4">'+
          DOW.map((d,i)=>'<label class="ctDay'+(cfg.offDows.includes(i)?' on':'')+'"><input type="checkbox" data-rvdow="'+i+'" '+(cfg.offDows.includes(i)?'checked':'')+' onchange="this.closest(\'label\').classList.toggle(\'on\', this.checked)" style="display:none">'+d+'</label>').join('')+
        '</div>'+
        '<button onclick="rvSaveHours()" class="px-5 h-9 rounded-lg text-[13px] font-semibold btn-gold">예약 가능시간 저장</button>'+
        '<p class="text-[12px] mt-3" style="color:var(--muted)">저장하면 홈페이지 예약 달력의 선택 가능한 날짜·시간이 바로 바뀝니다. 이미 찬 시간대는 자동으로 막힙니다.</p>'+
      '</div>' : '')+

      (_rvPanel==='closed' ? '<div class="panel rounded-2xl p-5 mb-4">'+
        '<h2 class="text-[15px] font-bold mb-4">임시 마감일</h2>'+
        '<div class="flex items-center gap-2 flex-wrap mb-4">'+
          '<input id="rvClosedDate" type="date" class="pmi" style="width:180px">'+
          '<button onclick="rvAddClosed()" class="px-4 h-9 rounded-lg text-[13px] font-semibold btn-gold">이 날짜 마감</button>'+
          '<span class="text-[12.5px]" style="color:var(--muted)">공휴일·학회·연차 등 하루만 예약을 막을 때 사용합니다.</span>'+
        '</div>'+
        (closed.length
          ? '<div class="flex flex-wrap gap-2">'+closed.map(d=>'<span class="chip" style="background:var(--bad-bg);color:var(--bad);font-size:12.5px;padding:6px 10px">'+esc(d)+' <button onclick="rvDelClosed(\''+esc(d)+'\')" style="font-weight:700;margin-left:4px">✕</button></span>').join('')+'</div>'
          : '<p class="text-[13px]" style="color:var(--muted)">마감 처리된 날짜가 없습니다.</p>')+
      '</div>' : '')+

      '<div class="flex flex-wrap items-center gap-2 mb-4">'+
        ['전체','미확정','확정','취소'].map(s=>
          '<button onclick="rvSetStatus(\''+s+'\')" class="px-3.5 h-9 rounded-lg text-[12.5px] font-semibold" style="'+
          (_rvStatus===s?'background:var(--accent);color:#fff;border:1px solid var(--accent)':'background:var(--panel);border:1px solid var(--border);color:var(--text-soft)')+
          '">'+s+' <span style="opacity:.75">'+(s==='전체'?all.length:cnt(s))+'</span></button>').join('')+
        '<input value="'+esc(_rvQuery)+'" oninput="rvSearch(this.value)" placeholder="이름·연락처·시술 검색" class="pmi" style="width:220px">'+
        '<input type="date" value="'+esc(_rvDate)+'" onchange="rvSetDate(this.value)" class="pmi" style="width:170px">'+
        '<button onclick="rvReset()" class="px-3 h-9 rounded-lg text-[12.5px] font-semibold" style="background:var(--panel-soft);border:1px solid var(--border);color:var(--text-soft)">검색 초기화</button>'+
        '<span class="text-[12.5px] ml-auto" style="color:var(--muted)">'+rows.length+'건 표시</span>'+
      '</div>'+

      '<div class="panel rounded-2xl overflow-hidden"><div class="overflow-x-auto"><table class="tbl w-full text-[13px] whitespace-nowrap">'+
        '<thead><tr style="background:var(--panel-soft);color:var(--muted)">'+
          ['예약일','시간','이름','연락처','초진','SMS','시술/이벤트','상태','관리'].map(h=>'<th class="px-3 py-3 font-semibold">'+h+'</th>').join('')+
        '</tr></thead><tbody>'+
        (rows.length ? rows.map(r=>{
          const st=r.status||'미확정';
          const stChip = st==='확정' ? '<span class="chip text-white" style="background:#16a34a">확정</span>'
                        : st==='취소' ? '<span class="chip" style="background:var(--panel-soft);color:var(--muted)">취소</span>'
                        : '<span class="chip text-white" style="background:#dc2626">미확정</span>';
          return '<tr style="border-top:1px solid var(--border-soft)'+(st==='취소'?';opacity:.55':'')+'">'+
            '<td class="px-3 py-3 font-medium">'+esc(r.date)+'</td>'+
            '<td class="px-3 py-3" style="color:var(--text-soft)">'+esc(r.time)+'</td>'+
            '<td class="px-3 py-3 font-medium">'+esc(r.name)+'</td>'+
            '<td class="px-3 py-3" style="color:var(--text-soft)">'+esc(r.phone)+'</td>'+
            '<td class="px-3 py-3" style="color:var(--text-soft)">'+esc(r.first||'')+'</td>'+
            '<td class="px-3 py-3" style="color:var(--text-soft)">'+esc(r.sms||'')+'</td>'+
            '<td class="px-3 py-3 whitespace-normal break-keep min-w-[240px]" style="color:var(--accent-strong)">'+esc(r.item||'상담하기')+'</td>'+
            '<td class="px-3 py-3">'+stChip+'</td>'+
            '<td class="px-3 py-3"><div class="flex items-center gap-1.5">'+
              (st!=='확정' ? '<button onclick="rvSetStatusOf(\''+esc(r.id)+'\',\'확정\')" class="px-2.5 h-7 rounded-lg text-[12px] font-semibold text-white" style="background:#16a34a">확정</button>' : '')+
              (st!=='미확정' ? '<button onclick="rvSetStatusOf(\''+esc(r.id)+'\',\'미확정\')" class="px-2.5 h-7 rounded-lg text-[12px] font-semibold" style="background:var(--panel-soft);border:1px solid var(--border);color:var(--text-soft)">미확정</button>' : '')+
              (st!=='취소' ? '<button onclick="rvSetStatusOf(\''+esc(r.id)+'\',\'취소\')" class="px-2.5 h-7 rounded-lg text-[12px] font-semibold" style="background:var(--panel-soft);border:1px solid var(--border);color:var(--text-soft)">취소</button>' : '')+
              '<button onclick="rvDelete(\''+esc(r.id)+'\')" class="w-7 h-7 rounded-lg grid place-items-center text-white" style="background:var(--bad)" title="삭제"><iconify-icon icon="solar:trash-bin-trash-linear" width="13"></iconify-icon></button>'+
            '</div></td>'+
          '</tr>';
        }).join('')
        : '<tr><td colspan="9" class="text-center py-16" style="color:var(--muted)">'+
            (all.length ? '조건에 맞는 예약이 없습니다.' :
             '아직 접수된 예약이 없습니다.<br><span class="text-[12.5px]">홈페이지 「온라인예약」에서 예약이 들어오면 이 목록에 자동으로 표시됩니다. 전화 예약은 「수기 등록」으로 넣으세요.</span>')+
          '</td></tr>')+
      '</tbody></table></div></div>';
    renderIcons(el);
  };
