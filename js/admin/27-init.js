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
