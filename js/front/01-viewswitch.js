    /* ===== 뷰 전환 (메뉴 클릭 → 페이지 이동 없이 화면만 전환) ===== */
    function setHash(n){ try{ if(history.replaceState) history.replaceState(null,'','#'+n); }catch(e){ try{ location.hash=n; }catch(_){} } }
    window.showView=function(name, scrollSel){
      ['home','category','ba','reserve','detail','badetail','manage','notes','notedetail','care','doctors','docdetail','noninsured','network','hairprice'].forEach(function(v){
        document.getElementById('view-'+v).classList.toggle('hidden', v!==name);
      });
      document.querySelectorAll('#view-'+name+' .reveal').forEach(function(el){ el.classList.add('in'); });
      document.querySelectorAll('.navlink').forEach(function(a){ a.classList.remove('active'); });
      if(name==='category') document.querySelectorAll('.navlink[data-key="menu"]').forEach(function(a){a.classList.add('active');});
      if(name==='ba')       document.querySelectorAll('.navlink[data-key="ba"]').forEach(function(a){a.classList.add('active');});
      if(name==='notes')    document.querySelectorAll('.navlink[data-key="notes"]').forEach(function(a){a.classList.add('active');});
      if(name==='reserve'||name==='manage') document.querySelectorAll('.navlink[data-key="book"]').forEach(function(a){a.classList.add('active');});
      if(name==='detail')   document.querySelectorAll('.navlink[data-key="menu"]').forEach(function(a){a.classList.add('active');});
      if(name==='badetail') document.querySelectorAll('.navlink[data-key="ba"]').forEach(function(a){a.classList.add('active');});
      var cb=document.getElementById('consult'); if(cb) cb.style.display=(name==='detail'||name==='badetail')?'none':'';
      setHash(name);
      if(scrollSel){ var el=document.querySelector(scrollSel); if(el){ setTimeout(function(){ try{el.scrollIntoView({behavior:'smooth'});}catch(e){} },60); return; } }
      try{ window.scrollTo({top:0,behavior:'auto'}); }catch(e){}
    };
  
