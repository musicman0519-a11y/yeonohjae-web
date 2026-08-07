  /* ===================== DASHBOARD DATA (실제 예약 데이터 집계) ===================== */
  const won = n => n.toLocaleString('ko-KR');

  function dashZ(n){ return String(n).padStart(2,'0'); }
  function dashYmd(d){ return d.getFullYear()+'-'+dashZ(d.getMonth()+1)+'-'+dashZ(d.getDate()); }
  function dashResv(){ const l=KK.get('reservations', []); return Array.isArray(l)? l : []; }
  function dashRange(){
    const f=document.getElementById('dashFrom'), t=document.getElementById('dashTo');
    return { from:(f&&f.value)||'', to:(t&&t.value)||'' };
  }
  function dashRows(){
    const {from,to}=dashRange();
    return dashResv().filter(r=>{
      if(from && (r.date||'') < from) return false;
      if(to   && (r.date||'') > to)   return false;
      return true;
    }).sort((a,b)=> (b.date+b.time).localeCompare(a.date+a.time));
  }
  /* 기간 프리셋 */
  function dashPreset(v){
    const now=new Date(); now.setHours(0,0,0,0);
    let from, to;
    if(v==='thisWeek'){ const d=now.getDay(); from=new Date(now); from.setDate(now.getDate()-d); to=new Date(from); to.setDate(from.getDate()+6); }
    else if(v==='lastWeek'){ const d=now.getDay(); to=new Date(now); to.setDate(now.getDate()-d-1); from=new Date(to); from.setDate(to.getDate()-6); }
    else if(v==='thisMonth'){ from=new Date(now.getFullYear(), now.getMonth(), 1); to=new Date(now.getFullYear(), now.getMonth()+1, 0); }
    else return;
    const f=document.getElementById('dashFrom'), t=document.getElementById('dashTo');
    if(f) f.value=dashYmd(from);
    if(t) t.value=dashYmd(to);
    renderDashboard();
  }
  function dashExportCsv(){
    const rows=dashRows();
    if(!rows.length){ toast('선택한 기간에 예약이 없습니다.', false); return; }
    const head=['날짜','시간','이름','전화','초진','상태','시술/이벤트'];
    const body=rows.map(r=>[r.date,r.time,r.name,r.phone,r.first,r.status,(r.item||'').replace(/,/g,' ')]);
    const csv='﻿'+[head,...body].map(l=>l.map(c=>'"'+String(c==null?'':c).replace(/"/g,'""')+'"').join(',')).join('\n');
    const a=document.createElement('a');
    a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));
    const d=new Date();
    a.download='연오재_대시보드_'+d.getFullYear()+dashZ(d.getMonth()+1)+dashZ(d.getDate())+'.csv';
    a.click(); URL.revokeObjectURL(a.href);
    toast(rows.length+'건을 CSV로 내려받았습니다.');
  }

  function renderDashboard(){
    const rows=dashRows();
    const live=rows.filter(r=>r.status!=='취소');
    const conf=live.filter(r=>r.status==='확정').length;
    const pend=live.filter(r=>(r.status||'미확정')==='미확정').length;
    const firstN=live.filter(r=>r.first==='초진').length;

    /* --- 상단 카드 --- */
    const stats = [
      {label:'총 예약', value:live.length, icon:'solar:calendar-linear', color:'var(--text-soft)'},
      {label:'확정',   value:conf,        icon:'solar:check-circle-linear', color:'var(--good)'},
      {label:'미확정', value:pend,        icon:'solar:close-circle-linear', color:'var(--bad)'},
      {label:'초진',   value:firstN,      icon:'solar:clock-circle-linear', color:'var(--teal)'},
    ];
    const sc=document.getElementById('statCards');
    if(sc) sc.innerHTML = stats.map(s=>
      '<div class="rounded-xl p-4 sm:p-5" style="border:1px solid var(--border); background:var(--panel)">'+
        '<div class="flex items-start justify-between">'+
          '<span class="text-[13px] font-medium" style="color:var(--muted)">'+s.label+'</span>'+
          '<iconify-icon icon="'+s.icon+'" width="20" style="color:'+s.color+'"></iconify-icon>'+
        '</div><p class="text-[30px] font-extrabold mt-2 tracking-tight">'+s.value+'</p></div>').join('');

    /* --- 일자별 차트 --- */
    const DOW=['일','월','화','수','목','금','토'];
    const byDay={};
    live.forEach(r=>{ byDay[r.date]=byDay[r.date]||{total:0,chojin:0}; byDay[r.date].total++; if(r.first==='초진') byDay[r.date].chojin++; });
    const days=Object.keys(byDay).sort();
    const chartData=days.map(d=>{
      const dt=new Date(d+'T00:00');
      return {d:(dt.getMonth()+1)+'/'+dt.getDate()+'('+DOW[dt.getDay()]+')', total:byDay[d].total, chojin:byDay[d].chojin};
    });
    const chartEl=document.getElementById('chart');
    if(chartEl){
      if(!chartData.length){
        chartEl.innerHTML='<p class="text-center py-20 text-[13px]" style="color:var(--muted)">선택한 기간에 예약이 없습니다.<br><span class="text-[12px]">홈페이지 「온라인예약」으로 예약이 들어오면 여기에 표시됩니다.</span></p>';
      } else {
        const peak=Math.max(...chartData.map(c=>c.total));
        const step=Math.max(1, Math.ceil(peak/4));
        const max=step*4, H=240;
        const grid=[0,1,2,3,4].map(i=>i*step);
        const gridLines=grid.map(g=>
          '<div class="absolute left-0 right-0 flex items-center gap-2" style="bottom:'+((g/max)*H+28)+'px">'+
            '<span class="text-[11px] w-5 text-right" style="color:var(--muted)">'+g+'</span>'+
            '<span class="flex-1 border-t border-dashed" style="border-color:var(--border)"></span></div>').join('');
        const bars=chartData.map(c=>
          '<div class="flex-1 flex flex-col items-center justify-end gap-1" style="height:'+H+'px" title="'+c.d+' · 전체 '+c.total+'건 / 초진 '+c.chojin+'건">'+
            '<div class="flex items-end gap-1.5 w-full justify-center" style="height:'+H+'px">'+
              '<div class="bar rounded-t-sm w-[26px] sm:w-[40px]" style="height:'+((c.total/max)*H)+'px; background:linear-gradient(180deg,#c79f63,#b8935a)"></div>'+
              '<div class="bar rounded-t-sm w-[26px] sm:w-[40px]" style="height:'+((c.chojin/max)*H)+'px; background:linear-gradient(180deg,#4a7088,#3f6377)"></div>'+
            '</div></div>').join('');
        const labels=chartData.map(c=>'<div class="flex-1 text-center text-[11.5px] pt-2" style="color:var(--muted)">'+c.d+'</div>').join('');
        chartEl.innerHTML =
          '<div class="relative pl-7" style="height:'+(H+28)+'px">'+gridLines+'<div class="flex items-end gap-1.5 sm:gap-3 h-full relative z-10">'+bars+'</div></div>'+
          '<div class="flex gap-1.5 sm:gap-3 pl-7">'+labels+'</div>';
      }
    }

    /* --- 시간대별 --- */
    const byTime={};
    live.forEach(r=>{ const h=String(r.time||'').slice(0,2)+':00'; if(h.length===5) byTime[h]=(byTime[h]||0)+1; });
    const tr=document.getElementById('timeRows');
    if(tr) tr.innerHTML = Object.keys(byTime).sort().length
      ? Object.keys(byTime).sort().map(t=>'<tr style="border-top:1px solid var(--border-soft)"><td class="px-4 py-2.5">'+t+'</td><td class="px-4 py-2.5 font-semibold">'+byTime[t]+'</td></tr>').join('')
      : '<tr><td colspan="2" class="px-4 py-8 text-center" style="color:var(--muted)">데이터 없음</td></tr>';

    /* --- 인기 시술 --- */
    const byItem={};
    live.forEach(r=>{ const k=(r.item||'상담하기'); byItem[k]=(byItem[k]||0)+1; });
    const top=Object.entries(byItem).sort((a,b)=>b[1]-a[1]).slice(0,10);
    const tp=document.getElementById('topRows');
    if(tp) tp.innerHTML = top.length
      ? top.map(t=>'<tr style="border-top:1px solid var(--border-soft)"><td class="px-4 py-2.5 break-keep" style="color:var(--text-soft)">'+String(t[0]).replace(/</g,'&lt;')+'</td><td class="px-4 py-2.5 font-semibold text-right">'+t[1]+'</td></tr>').join('')
      : '<tr><td colspan="2" class="px-4 py-8 text-center" style="color:var(--muted)">데이터 없음</td></tr>';

    /* --- 예약 목록 --- */
    const rr=document.getElementById('resvRows');
    const esc=v=>String(v==null?'':v).replace(/&/g,'&amp;').replace(/</g,'&lt;');
    if(rr) rr.innerHTML = rows.length
      ? rows.map(r=>
        '<tr style="border-top:1px solid var(--border-soft)'+(r.status==='취소'?';opacity:.5':'')+'">'+
          '<td class="px-3 py-2.5">'+esc((KK.get('settings',{})||{}).branch || '연오재')+'</td>'+
          '<td class="px-3 py-2.5">'+esc(String(r.date||'').replace(/-/g,''))+'</td>'+
          '<td class="px-3 py-2.5">'+esc(r.time)+'</td>'+
          '<td class="px-3 py-2.5 font-medium">'+esc(r.name)+'</td>'+
          '<td class="px-3 py-2.5" style="color:var(--text-soft)">'+esc(r.phone)+'</td>'+
          '<td class="px-3 py-2.5 text-center">'+(r.first==='초진'?'<span style="color:var(--good)">Y</span>':'')+'</td>'+
          '<td class="px-3 py-2.5 text-center">'+(r.status==='확정'?'<span style="color:var(--good)">Y</span>':'')+'</td>'+
          '<td class="px-3 py-2.5 text-center font-semibold" style="color:var(--accent-strong)">'+(r.status==='취소'?'취소':'')+'</td>'+
          '<td class="px-3 py-2.5 whitespace-normal break-keep text-[12.5px]" style="color:var(--text-soft); min-width:280px">'+esc(r.item||'상담하기')+'</td>'+
        '</tr>').join('')
      : '<tr><td colspan="9" class="px-3 py-14 text-center" style="color:var(--muted)">선택한 기간에 예약이 없습니다.</td></tr>';

    const cntEl=document.getElementById('dashResvCount');
    if(cntEl) cntEl.textContent='('+rows.length+'건)';
    if(typeof renderIcons==='function') renderIcons(document.getElementById('view-dashboard'));
  }

  /* 최초 렌더: 기본 기간 = 이번 주
     (아이콘 GLYPH 정의가 이 파일 아래쪽에 있어 한 틱 뒤에 실행) */
  setTimeout(function initDash(){
    const f=document.getElementById('dashFrom'), t=document.getElementById('dashTo');
    if(f && t && !f.value){ dashPreset('thisWeek'); }
    else renderDashboard();
  }, 0);

  /* ===================== INLINE SVG ICONS (self-contained) ===================== */
  const GLYPH = {
    home:'<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M9 22V12h6v10"/>',
    settings:'<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>',
    user:'<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
    userid:'<rect x="2" y="4" width="20" height="16" rx="2"/><circle cx="8" cy="11" r="2.4"/><path d="M4.5 16.5a3.5 3.5 0 0 1 7 0"/><path d="M15 9.5h4M15 13.5h4"/>',
    users:'<path d="M17 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9.5" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
    list:'<path d="M8 6h13M8 12h13M8 18h13M3.5 6h.01M3.5 12h.01M3.5 18h.01"/>',
    listcheck:'<path d="M11 6h10M11 12h10M11 18h10"/><path d="M3 6l1.4 1.4L7 5"/><path d="M3 12l1.4 1.4L7 11"/><path d="M3 18l1.4 1.4L7 17"/>',
    image:'<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/>',
    pen:'<path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4z"/>',
    speaker:'<path d="M3 11v2a1 1 0 0 0 1 1h2.5L11 18V6L6.5 10H4a1 1 0 0 0-1 1z"/><path d="M15.5 8.5a4 4 0 0 1 0 7M18 5a8 8 0 0 1 0 14"/>',
    book:'<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>',
    bookmark:'<path d="M6 3h12a1 1 0 0 1 1 1v17l-7-5-7 5V4a1 1 0 0 1 1-1z"/>',
    filetext:'<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M8 13h8M8 17h8M8 9h2"/>',
    folder:'<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
    calendar:'<rect x="3" y="4.5" width="18" height="17" rx="2"/><path d="M16 2.5v4M8 2.5v4M3 10h18"/>',
    calendarmark:'<rect x="3" y="4.5" width="18" height="17" rx="2"/><path d="M16 2.5v4M8 2.5v4M3 10h18"/><path d="M12 14h4v4h-4z"/>',
    code:'<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9.5 9l-2.5 3 2.5 3M14.5 9l2.5 3-2.5 3"/>',
    like:'<path d="M7 10.5V21H4.5a1 1 0 0 1-1-1v-8.5a1 1 0 0 1 1-1z"/><path d="M7 10.5l4-7a2 2 0 0 1 3 1.6V8.5h5a2 2 0 0 1 2 2.3l-1.2 7A2 2 0 0 1 20.6 19.5H7z"/>',
    award:'<circle cx="12" cy="8" r="6"/><path d="M8.5 13.5L7 22l5-3 5 3-1.5-8.5"/>',
    stethoscope:'<path d="M5 3v6a4 4 0 0 0 8 0V3"/><path d="M9 13.5V16a5 5 0 0 0 10 0v-2"/><circle cx="19" cy="11" r="2.2"/>',
    building:'<rect x="4" y="2" width="16" height="20" rx="1"/><path d="M9.5 22v-4h5v4"/><path d="M8 6h.01M12 6h.01M16 6h.01M8 10h.01M12 10h.01M16 10h.01M8 14h.01M12 14h.01M16 14h.01"/>',
    mappin:'<path d="M21 10c0 6-9 12-9 12s-9-6-9-12a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>',
    phone:'<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.13.96.36 1.9.7 2.8a2 2 0 0 1-.45 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.45c.9.34 1.85.57 2.8.7A2 2 0 0 1 22 16.9z"/>',
    hashtag:'<path d="M4 9h16M4 15h16M10 3L8 21M16 3l-2 18"/>',
    info:'<circle cx="12" cy="12" r="9"/><path d="M12 16v-4M12 8h.01"/>',
    link:'<path d="M10 13a5 5 0 0 0 7.1 0l2.9-2.9a5 5 0 0 0-7.1-7.1L11.5 4.4"/><path d="M14 11a5 5 0 0 0-7.1 0L4 13.9a5 5 0 0 0 7.1 7.1l1.4-1.4"/>',
    tag:'<path d="M20.6 13.4l-7.2 7.2a2 2 0 0 1-2.8 0L2 12V2h10l8.6 8.6a2 2 0 0 1 0 2.8z"/><path d="M7 7h.01"/>',
    globe:'<circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3a14 14 0 0 1 0 18 14 14 0 0 1 0-18z"/>',
    sparkles:'<path d="M12 3l1.6 4.9L18 9l-4.4 1.1L12 15l-1.6-4.9L6 9l4.4-1.1z"/><path d="M19 13.5l.7 2.1 2.3.4-2 1.2.2 2.3-1.5-1.4-2 .9 1-2.1-1.4-1.7 2.2-.2z"/>',
    checkcircle:'<circle cx="12" cy="12" r="9"/><path d="M8 12l2.8 2.8L16 9"/>',
    closecircle:'<circle cx="12" cy="12" r="9"/><path d="M15 9l-6 6M9 9l6 6"/>',
    clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7.5v5l3.2 2"/>',
    download:'<path d="M12 3v12"/><path d="M7 11l5 5 5-5"/><path d="M5 21h14"/>',
    upload:'<path d="M12 21V9"/><path d="M7 8l5-5 5 5"/><path d="M5 21h14"/>',
    logout:'<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="M16 17l5-5-5-5"/><path d="M21 12H9"/>',
    trash:'<path d="M3 6h18"/><path d="M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2"/><path d="M19 6l-1 14a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1L5 6"/><path d="M10 11v6M14 11v6"/>',
    pluscircle:'<circle cx="12" cy="12" r="9"/><path d="M12 8v8M8 12h8"/>',
    chevdown:'<path d="M6 9.5l6 6 6-6"/>',
    chevup:'<path d="M6 14.5l6-6 6 6"/>',
    arrowdown:'<path d="M12 5v14"/><path d="M6 13l6 6 6-6"/>',
    arrowup:'<path d="M12 19V5"/><path d="M6 11l6-6 6 6"/>',
    cornerdr:'<path d="M5 4v8a2 2 0 0 0 2 2h11"/><path d="M14 10l4 4-4 4"/>',
    sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
    moon:'<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/>',
    eyeoff:'<path d="M9.9 4.4A9.6 9.6 0 0 1 12 4.2c5 0 9 4.9 9 7.8a13 13 0 0 1-2.2 2.9M6.5 6.6A13 13 0 0 0 3 12c0 2.9 4 7.8 9 7.8a9.4 9.4 0 0 0 3.6-.7"/><path d="M3 3l18 18"/>',
    sidebar:'<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18"/>',
    starline:'<path d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.1 6.5L12 17.6 6.2 20.5l1.1-6.5L2.5 9.4l6.6-.9z"/>',
    starbold:'<path d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.1 6.5L12 17.6 6.2 20.5l1.1-6.5L2.5 9.4l6.6-.9z" fill="currentColor" stroke="none"/>',
    tool:'<path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.6 2.6-2.4-2.4z"/>',
    bold:'<path d="M6.5 4h6a4 4 0 0 1 0 8h-6z"/><path d="M6.5 12h7a4 4 0 0 1 0 8h-7z"/>',
    italic:'<path d="M19 4h-7M12 20H5M15 4L9 20"/>',
    underline:'<path d="M6 4v6a6 6 0 0 0 12 0V4"/><path d="M4 21h16"/>',
    strike:'<path d="M4 12h16"/><path d="M8.5 8a4 3 0 0 1 7-1M9 16a4 3 0 0 0 7 1"/>',
    quote:'<path d="M8 7H5a1.5 1.5 0 0 0-1.5 1.5V11A1.5 1.5 0 0 0 5 12.5h2v1.5a2.5 2.5 0 0 1-2.5 2.5"/><path d="M18 7h-3a1.5 1.5 0 0 0-1.5 1.5V11a1.5 1.5 0 0 0 1.5 1.5h2v1.5a2.5 2.5 0 0 1-2.5 2.5"/>',
    type:'<path d="M4 7V4h16v3M9 20h6M12 4v16"/>',
    palette:'<path d="M12 21a9 9 0 1 1 9-9c0 2.2-1.8 3-3.5 3H16a2 2 0 0 0-2 2 2.5 2.5 0 0 1-2 3z"/><circle cx="7.5" cy="11" r="1"/><circle cx="11" cy="7.5" r="1"/><circle cx="15.5" cy="9" r="1"/>',
    alignleft:'<path d="M4 6h16M4 12h11M4 18h14"/>',
    eraser:'<path d="M4 14.5l6-6 7 7-4.5 4.5H8.5z"/><path d="M21 21H9"/>',
    video:'<rect x="3" y="6" width="13" height="12" rx="2"/><path d="M16 10l5-3v10l-5-3z"/>',
    chat:'<path d="M21 11.5a8 8 0 0 1-11.6 7.1L3.5 20.5l1.9-5.9A8 8 0 1 1 21 11.5z"/><path d="M8.5 11.5h.01M12 11.5h.01M15.5 11.5h.01"/>',
    grip:'<circle cx="9" cy="6" r="1.3" fill="currentColor" stroke="none"/><circle cx="15" cy="6" r="1.3" fill="currentColor" stroke="none"/><circle cx="9" cy="12" r="1.3" fill="currentColor" stroke="none"/><circle cx="15" cy="12" r="1.3" fill="currentColor" stroke="none"/><circle cx="9" cy="18" r="1.3" fill="currentColor" stroke="none"/><circle cx="15" cy="18" r="1.3" fill="currentColor" stroke="none"/>',
    dot:'<circle cx="12" cy="12" r="3" fill="currentColor" stroke="none"/>',
  };
  const ICON_ALIAS = {
    'solar:home-2-linear':'home','solar:settings-linear':'settings','solar:user-linear':'user','solar:user-id-linear':'userid',
    'solar:users-group-rounded-linear':'users','solar:list-linear':'list','solar:list-bold-linear':'list','solar:list-check-linear':'listcheck',
    'solar:gallery-linear':'image','solar:gallery-wide-linear':'image','solar:pen-linear':'pen','solar:soundwave-linear':'speaker',
    'solar:book-2-linear':'book','solar:notebook-linear':'book','solar:book-bookmark-linear':'bookmark','solar:bill-list-linear':'filetext',
    'solar:document-text-linear':'filetext','solar:folder-linear':'folder','solar:calendar-linear':'calendar','solar:calendar-mark-linear':'calendarmark',
    'solar:code-square-linear':'code','solar:like-linear':'like','solar:hand-stars-linear':'award','solar:stethoscope-linear':'stethoscope',
    'solar:buildings-2-linear':'building','solar:map-point-linear':'mappin','solar:phone-linear':'phone','solar:hashtag-linear':'hashtag',
    'solar:info-circle-linear':'info','solar:link-linear':'link','solar:link-circle-linear':'link','solar:tag-linear':'tag',
    'solar:translation-linear':'globe','solar:magic-stick-3-linear':'sparkles','solar:check-circle-linear':'checkcircle','solar:close-circle-linear':'closecircle',
    'solar:clock-circle-linear':'clock','solar:download-minimalistic-linear':'download','solar:upload-minimalistic-linear':'upload','solar:logout-2-linear':'logout',
    'solar:trash-bin-trash-linear':'trash','solar:add-circle-linear':'pluscircle','solar:alt-arrow-down-linear':'chevdown','solar:alt-arrow-up-linear':'chevup',
    'solar:arrow-down-linear':'arrowdown','solar:arrow-up-linear':'arrowup','solar:arrow-right-down-linear':'cornerdr','solar:sun-linear':'sun','solar:moon-linear':'moon',
    'solar:eye-closed-linear':'eyeoff','solar:siderbar-linear':'sidebar','solar:star-linear':'starline','solar:star-bold':'starbold','solar:hammer-linear':'tool',
    'solar:text-bold-linear':'bold','solar:text-italic-linear':'italic','solar:text-underline-linear':'underline','solar:text-cross-linear':'strike',
    'solar:quote-up-linear':'quote','solar:text-field-linear':'type','solar:palette-linear':'palette','solar:align-left-linear':'alignleft',
    'solar:eraser-linear':'eraser','solar:videocamera-linear':'video','solar:chat-round-dots-linear':'chat','solar:menu-dots-bold':'grip',
  };
  function svgFor(name, size){
    const g = GLYPH[ICON_ALIAS[name]] || GLYPH.dot;
    return `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" style="display:block">${g}</svg>`;
  }
  function renderIcons(root){
    (root||document).querySelectorAll('iconify-icon:not([data-ico])').forEach(el=>{
      const size = el.getAttribute('width') || 18;
      el.innerHTML = svgFor(el.getAttribute('icon'), size);
      el.setAttribute('data-ico','1');
      el.style.display='inline-flex'; el.style.lineHeight='0'; el.style.verticalAlign='-0.15em';
    });
  }
