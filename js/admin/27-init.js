  /* ===================== INIT ===================== */
  renderNav();
  renderIcons(document);
  new MutationObserver(()=>renderIcons(document)).observe(document.body,{childList:true,subtree:true});
  /* 로그인하면 바로 예약 목록이 열림 (주소에 #products 등이 있으면 그 화면) */
  const start = (location.hash||'#reservations').slice(1);
  go(start);
  
