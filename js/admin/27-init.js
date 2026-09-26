  /* ===================== INIT ===================== */
  renderNav();
  renderIcons(document);
  new MutationObserver(()=>renderIcons(document)).observe(document.body,{childList:true,subtree:true});
  /* 로그인하면 메인 대시보드가 열림 (주소에 #products 등이 있으면 그 화면) */
  const start = (location.hash||'#dashboard').slice(1);
  go(start);

  /* 로그인 직후(로그인 화면에서 막 들어온 경우) 예약 데이터를 관리자 권한으로 다시 불러오기 */
  let _adminLoginDone=false;
  window.adminAfterLogin = function(){
    if(_adminLoginDone) return; _adminLoginDone=true;
    const reload=()=>{
      if(typeof _dashBusy!=='undefined' && _dashBusy) return setTimeout(reload, 500);
      const a=document.querySelector('.view.active');
      if(a && a.id==='view-dashboard') dashLoad();
      else { if(typeof _rvState!=='undefined') _rvState='idle'; if(a && a.id==='view-reservations') rvLoad(); }
    };
    setTimeout(reload, 300);
  };

  /* ===================== 새 예약 알림 =====================
     관리자 화면이 열려 있는 동안 1분마다 새 예약을 확인 → 소리 + 화면 알림(허용 시) + 탭 제목에 숫자 + 목록 새로고침.
     「예약 알림 켜기」 설정은 이 브라우저에 기억됨. (화면을 닫으면 알림이 오지 않음) */
  let _raLast=null, _raTimer=null, _raNew=0;
  const _raTitle=document.title;
  function raOn(){ try{ return localStorage.getItem('yj_res_alert')!=='off'; }catch(e){ return true; } }
  function raLabel(){
    const l=document.getElementById('resAlertLabel'), b=document.getElementById('resAlertBtn'); if(!l||!b) return;
    const on=raOn();
    l.textContent = on ? '예약 알림 켜짐' : '예약 알림 꺼짐';
    b.style.color = on ? 'var(--good)' : 'var(--text-soft)';
  }
  function raBeep(){
    try{
      const C=window.AudioContext||window.webkitAudioContext; if(!C) return;
      const ctx=new C(); [0,0.22].forEach(t=>{ const o=ctx.createOscillator(), g=ctx.createGain(); o.type='sine'; o.frequency.value=880;
        g.gain.setValueAtTime(0.0001, ctx.currentTime+t); g.gain.exponentialRampToValueAtTime(0.25, ctx.currentTime+t+0.02); g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime+t+0.18);
        o.connect(g); g.connect(ctx.destination); o.start(ctx.currentTime+t); o.stop(ctx.currentTime+t+0.2); });
    }catch(e){}
  }
  function raCheck(){
    if(!raOn() || !window.__sb) return;
    window.__sb.from('reservations').select('id,name,res_date,res_time,item,created_at').order('created_at',{ascending:false}).limit(20).then(r=>{
      if(r.error || !r.data) return;
      if(_raLast===null){ _raLast = r.data[0] ? r.data[0].created_at : '1970'; return; }   /* 처음엔 기준만 잡음 */
      const fresh=r.data.filter(x=>x.created_at>_raLast);
      if(!fresh.length) return;
      _raLast=fresh[0].created_at; _raNew+=fresh.length;
      document.title='('+_raNew+') 새 예약 · '+_raTitle;
      raBeep();
      const f=fresh[0], msg=(f.name||'')+' 님 · '+(f.res_date||'날짜 미정')+' '+(f.res_time||'')+(fresh.length>1?' 외 '+(fresh.length-1)+'건':'');
      toast('🔔 새 예약: '+msg);
      try{ if('Notification' in window && Notification.permission==='granted'){ const n=new Notification('연오재 새 예약', {body: msg+'\n'+(f.item||''), tag:'yj-res'}); n.onclick=()=>{ window.focus(); go('reservations'); n.close(); }; } }catch(e){}
      /* 열려 있는 예약 목록·대시보드 최신화 */
      const a=document.querySelector('.view.active');
      if(a && a.id==='view-reservations' && typeof rvLoad==='function') rvLoad();
      else if(a && a.id==='view-dashboard' && typeof dashLoad==='function') dashLoad();
      else if(typeof _rvState!=='undefined') _rvState='idle';
    });
  }
  function raStart(){ if(_raTimer) return; raCheck(); _raTimer=setInterval(raCheck, 60000); }
  function resAlertToggle(){
    /* 켜져 있는데 아직 화면 알림 허락을 안 받았으면 → 이번 클릭은 허락 요청 */
    try{ if(raOn() && 'Notification' in window && Notification.permission==='default'){ Notification.requestPermission().then(p=>{ toast(p==='granted'?'화면 알림을 허용했습니다. 새 예약이 오면 알림이 뜹니다.':'화면 알림은 꺼져 있고, 소리와 안내로만 알려드립니다.'); }); raBeep(); return; } }catch(e){}
    const on=!raOn();
    try{ localStorage.setItem('yj_res_alert', on?'on':'off'); }catch(e){}
    if(on){
      try{ if('Notification' in window && Notification.permission==='default') Notification.requestPermission(); }catch(e){}
      raBeep(); toast('예약 알림을 켰습니다. 이 화면을 열어 두면 새 예약이 들어올 때 알려드려요.');
      raStart();
    } else toast('예약 알림을 껐습니다.');
    raLabel();
  }
  /* 탭으로 돌아오면 제목의 숫자 지우기 */
  document.addEventListener('visibilitychange', ()=>{ if(!document.hidden){ _raNew=0; document.title=_raTitle; } });
  raLabel();
  setTimeout(raStart, 3000);

  /* 로그인 확인이 메뉴 스크립트보다 먼저 끝난 경우: 여기서 등급별 메뉴를 적용 */
  if(window.__adminRole && typeof adminApplyRole==='function') adminApplyRole(window.__adminRole);
