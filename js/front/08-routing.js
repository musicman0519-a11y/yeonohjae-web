    /* 최초 진입 라우팅 (해시 기준) */
    (function(){
      var h=(location.hash||'').replace('#','');
      if(h==='category') showView('category');
      else if(h==='ba'||h==='before-after') showView('ba');
      else if(h==='reserve'||h==='booking') showView('reserve');
      else if(h==='manage') showView('manage');
      else if(h==='notes') showView('notes');
      else if(h==='care') showView('care');
      else if(h==='doctors') showView('doctors');
      else if(h==='noninsured') showView('noninsured');
      else if(h==='network') showView('network');
      else if(h==='hairprice') showView('hairprice');
      else showView('home');
    })();
  
