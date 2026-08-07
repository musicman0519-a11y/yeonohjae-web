  /* ===================== INIT ===================== */
  renderNav();
  renderIcons(document);
  new MutationObserver(()=>renderIcons(document)).observe(document.body,{childList:true,subtree:true});
  const start = (location.hash||'#dashboard').slice(1);
  go(start);
  
