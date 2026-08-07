  /* ===== 시술 노트 렌더 (admin 시술노트 연동: 썸네일 + 글 상세 + 블로그 위젯) ===== */
  (function(){
    var DEFAULT_NOTES = [
      {t:'수두흉터치료', sub:'수두 흉터와 패인 자국 개선, 피코프락셀이 흉터에 작용하는 방식', on:true},
      {t:'여드름흉터치료', sub:'여드름 흉터 치료, 표면 관리 vs 시크릿 RF 니들의 진피 재생.', on:true},
      {t:'등털제모', sub:'쉐이빙 없이 등 털 제모를 편안하게 받는 방법', on:true},
      {t:'셀엑소좀', sub:'여드름 피부에 셀엑소좀? 어떤 효과가 있길래 주목받을까요', on:true},
      {t:'피부과잡티제거', sub:'피부과 잡티 제거, 토닝과 잡티 레이저! 당신에게 맞는 시술은?', on:true},
      {t:'스킨부스터시술', sub:'시크릿 X 퓨라셀 MTS, 왜 환상의 시너지를 만들까?', on:true},
      {t:'무통스킨부스터', sub:'수면마취 없이도 OK! 스킨부스터 시술 통증 줄이는 3가지 노하우', on:true},
      {t:'콜라겐볼륨침', sub:'필러 없이 채우는 콜라겐 볼륨침, 현명한 선택을 위한 가이드', on:true},
      {t:'엑쏘웨이브', sub:'화정 엑쏘웨이브(케이온다): 지방과 처짐, 극초단파로 동시에 케어하세요', on:true},
    ];
    var all = (window.KK? KK.get('notes', DEFAULT_NOTES): DEFAULT_NOTES);
    all.forEach(function(n,i){ n._i=i; });
    var notes = all.filter(function(n){return n.on!==false;});
    var page=1, PER=6, query='';
    function esc(s){ return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;'); }
    function filtered(){ if(!query) return notes; var q=query.toLowerCase(); return notes.filter(function(n){return ((n.t||'')+(n.sub||'')).toLowerCase().indexOf(q)>=0;}); }
    function media(n){
      if(n.img){
        return '<div class="relative aspect-square rounded-2xl overflow-hidden shadow-sm transition group-hover:-translate-y-1">'
          +'<img src="'+n.img+'" class="w-full h-full object-cover" alt="" loading="lazy">'
          +'<div class="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent"></div>'
          +'<span class="krhead absolute top-3 right-3 text-[9px] tracking-widest text-white/85" style="font-weight:700;writing-mode:vertical-rl">XXI</span>'
          +'<div class="absolute left-0 right-0 bottom-0 p-5 text-left">'
            +'<h3 class="krhead text-xl sm:text-2xl text-white break-keep leading-snug" style="font-weight:900">'+esc(n.t)+'</h3>'
            +(n.date?'<p class="krhead text-[10px] text-white/60 mt-1.5" style="font-weight:400">'+esc(n.date)+'</p>':'')
          +'</div>'
        +'</div>';
      }
      return '<div class="relative aspect-square rounded-2xl p-3 shadow-sm transition group-hover:-translate-y-1" style="background:linear-gradient(135deg,#f0c8d2,#e9b8c6)">'
        +'<div class="relative h-full w-full rounded-xl grid place-items-center text-center px-5" style="background:linear-gradient(160deg,#fbf7f4,#f1ebe4)">'
          +'<span class="absolute top-3 left-1/2 -translate-x-1/2 w-12 h-3 rounded-b-lg border border-ink/15 bg-white/70"></span>'
          +'<span class="krhead absolute top-3 right-3 text-[8px] tracking-widest font-bold text-pink/70" style="writing-mode:vertical-rl">XXI</span>'
          +'<span class="absolute top-3 left-4 krhead text-[9px] text-ink/40" style="font-weight:500">XXI</span>'
          +'<div><h3 class="krhead text-2xl sm:text-3xl font-extrabold text-ink/85 tracking-tight" style="font-weight:900">'+esc(n.t)+'</h3>'
            +'<p class="krhead text-[11px] text-ink/50 mt-2 break-keep leading-relaxed" style="font-weight:400">'+esc((n.sub||'').slice(0,28))+((n.sub||'').length>28?'…':'')+'</p></div>'
        +'</div>'
      +'</div>';
    }
    function card(n){
      return '<div class="group cursor-pointer" onclick="__noteOpen('+n._i+')">'
        + media(n)
        +'<h4 class="krhead text-[15px] text-ink/90 mt-4 break-keep leading-snug" style="font-weight:700">'+esc((n.sub||n.t||'').slice(0,34))+((n.sub||'').length>34?'…':'')+'</h4>'
        +'<p class="krhead text-xs text-ink/40 mt-2 flex items-center gap-1" style="font-weight:400">Read Note <iconify-icon icon="solar:alt-arrow-right-linear"></iconify-icon></p>'
        +'</div>';
    }
    function render(){
      var list=filtered(); var pages=Math.max(1,Math.ceil(list.length/PER));
      if(page>pages) page=pages;
      var slice=list.slice((page-1)*PER, page*PER);
      var grid=document.getElementById('noteGrid'); if(!grid) return;
      grid.innerHTML = slice.length? slice.map(card).join('') : '<p class="krhead col-span-full text-center text-ink/40 py-16" style="font-weight:300">검색 결과가 없습니다.</p>';
      var pg='';
      pg+='<button '+(page<=1?'disabled':'')+' onclick="__notePage('+(page-1)+')" class="w-9 h-9 rounded-full grid place-items-center border border-ink/15 text-ink/50 disabled:opacity-30"><iconify-icon icon="solar:alt-arrow-left-linear"></iconify-icon></button>';
      for(var i=1;i<=Math.min(pages,5);i++){ pg+='<button onclick="__notePage('+i+')" class="w-9 h-9 rounded-full grid place-items-center text-sm '+(i===page?'bg-ink text-white':'text-ink/60 hover:bg-ink/5')+'">'+i+'</button>'; }
      pg+='<button '+(page>=pages?'disabled':'')+' onclick="__notePage('+(page+1)+')" class="w-9 h-9 rounded-full grid place-items-center border border-ink/15 text-ink/50 disabled:opacity-30"><iconify-icon icon="solar:alt-arrow-right-linear"></iconify-icon></button>';
      document.getElementById('notePager').innerHTML=pg;
    }
    window.__notePage=function(p){ page=p; render(); window.scrollTo({top:0,behavior:'smooth'}); };

    /* ===== 글 상세 보기 ===== */
    window.__noteOpen=function(i){
      var n=all[i]; if(!n) return;
      var hasBody = !!(n.body && String(n.body).replace(/<[^>]*>/g,'').trim().length) || String(n.body||'').indexOf('<img')>=0;
      var bodyHTML = hasBody ? n.body
        : '<p>'+esc(n.sub||'')+'</p><p class="text-ink/45">자세한 내용은 카카오톡 또는 전화로 문의해주세요 :)</p>';
      var html=''+
        '<div class="krhead flex items-center gap-2 text-sm text-muted mb-6" style="font-weight:400">'+
          '<button onclick="showView(\'home\')" class="hover:text-pinkstrong">홈</button><span>/</span>'+
          '<button onclick="showView(\'notes\')" class="hover:text-pinkstrong">시술 노트</button>'+
        '</div>'+
        '<h1 class="krhead text-3xl sm:text-4xl text-ink break-keep leading-snug" style="font-weight:900">'+esc(n.t)+'</h1>'+
        (n.sub?'<p class="krhead text-[15px] text-ink/55 mt-3 break-keep" style="font-weight:300">'+esc(n.sub)+'</p>':'')+
        (n.date?'<p class="krhead text-xs text-ink/35 mt-3" style="font-weight:400">'+esc(n.date)+' · 연오재한의원</p>':'')+
        '<div class="flex items-center gap-3 my-8"><span class="h-px flex-1 bg-ink/10"></span><span class="w-1.5 h-1.5 rotate-45 border border-ink/30"></span><span class="h-px flex-1 bg-ink/10"></span></div>'+
        (n.img?'<div class="rounded-2xl overflow-hidden mb-8"><img src="'+n.img+'" class="w-full object-cover" alt=""></div>':'')+
        '<div class="note-body krhead text-[15px] text-ink/75 leading-loose break-keep" style="font-weight:300">'+bodyHTML+'</div>'+
        '<div class="mt-14 flex flex-wrap items-center gap-3">'+
          '<button onclick="showView(\'notes\')" class="krhead px-6 py-3 rounded-full border border-ink/15 text-sm hover:bg-ink hover:text-white transition flex items-center gap-2" style="font-weight:400"><iconify-icon icon="solar:alt-arrow-left-linear"></iconify-icon> 시술 노트 목록</button>'+
          '<button onclick="showView(\'reserve\')" class="krhead px-6 py-3 rounded-full bg-ink text-white text-sm hover:bg-pinkstrong transition flex items-center gap-2" style="font-weight:500">온라인예약 하러 가기 <iconify-icon icon="solar:alt-arrow-right-linear"></iconify-icon></button>'+
        '</div>';
      document.getElementById('noteDetailBody').innerHTML=html;
      showView('notedetail');
    };

    /* ===== 블로그 최신 글 위젯 (admin 블로그 연동) ===== */
    (function(){
      var posts=(window.KK? KK.get('blog', []): []).filter(function(b){return b.on!==false;});
      var bw=document.getElementById('blogWidget');
      if(!bw) return;
      if(!posts.length){ bw.innerHTML=''; return; }
      bw.innerHTML='<div class="rounded-2xl border border-ink/10 p-7 bg-white shadow-sm">'
        +'<span class="w-12 h-12 rounded-full bg-pink/10 grid place-items-center mb-4"><iconify-icon icon="solar:notebook-linear" class="text-pink text-xl"></iconify-icon></span>'
        +'<h3 class="krhead text-lg text-ink mb-3" style="font-weight:700">블로그 최신 글</h3>'
        +'<div class="divide-y divide-ink/5">'
        +posts.slice(0,5).map(function(b){
          return '<a href="'+(b.url||'#').replace(/"/g,'&quot;')+'" target="_blank" rel="noopener" class="flex items-center gap-3 py-3 group">'
            +(b.img?'<img src="'+b.img+'" class="w-12 h-12 rounded-lg object-cover shrink-0" alt="">'
                   :'<span class="w-12 h-12 rounded-lg bg-pinksoft/50 grid place-items-center shrink-0"><iconify-icon icon="solar:notebook-linear" class="text-pinkstrong"></iconify-icon></span>')
            +'<span class="min-w-0"><span class="krhead block text-[13.5px] text-ink/80 leading-snug break-keep group-hover:text-pinkstrong transition" style="font-weight:500">'+esc(b.t)+'</span>'
            +(b.date?'<span class="krhead block text-[11px] text-ink/35 mt-0.5" style="font-weight:300">'+esc(b.date)+'</span>':'')+'</span>'
            +'</a>';
        }).join('')
        +'</div></div>';
    })();

    var s=document.getElementById('noteSearch'); if(s) s.addEventListener('input', function(e){ query=e.target.value.trim(); page=1; render(); });
    render();
  })();

  /* ===== 상단 메뉴 렌더 (admin 메뉴 관리 연동) ===== */
  (function(){
    if(!window.KK) return;
    var menus = KK.get('menus', null);
    if(!menus || !menus.length) return; /* 관리자에서 저장한 적 없으면 기본 메뉴 유지 */
    var lang='ko';
    try{ var sv=localStorage.getItem('yj_lang'); if(sv) lang=sv; }catch(e){}
    if(['ko','en','ja','zh','th'].indexOf(lang)<0) lang='ko';
    function visible(m){ return m.on!==false && !(m.langs && m.langs[lang]===false); }
    function lbl(m){ return (lang!=='ko' && m.ml && m.ml[lang]) ? m.ml[lang] : (m.label||''); }
    function esc(s){ return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/"/g,'&quot;'); }
    function act(m){
      if(m.view==='ext'){
        var u=(m.url||'#').replace(/'/g,"\\'");
        return { href: esc(m.url||'#'), base: "window.open('"+u+"','_blank')" };
      }
      if(m.view==='about') return { href:'#home', base:"showView('home','#about')" };
      return { href:'#'+m.view, base:"showView('"+m.view+"')" };
    }
    function dataKey(m){
      if(m.view==='category') return 'menu';
      if(m.view==='ba') return 'ba';
      if(m.view==='notes') return 'notes';
      if(m.view==='reserve'||m.view==='manage') return 'book';
      return '';
    }
    var tops=menus.filter(function(m){ return !m.parent && visible(m); });
    function kidsOf(id){ return menus.filter(function(m){ return m.parent===id && visible(m); }); }
    function itemHTML(m){
      var a=act(m), dk=dataKey(m);
      var link='<a href="'+a.href+'" '+(dk?'data-key="'+dk+'" ':'')+'onclick="'+a.base+';return false" class="navlink hover:text-pinkstrong transition">'+esc(lbl(m))+'</a>';
      var kids=kidsOf(m.id);
      if(!kids.length) return link;
      var dd='<div class="absolute left-1/2 -translate-x-1/2 top-full pt-3 hidden group-hover:block z-50"><div class="bg-white rounded-xl shadow-xl border border-ink/10 py-2 min-w-[160px]">'
        + kids.map(function(c){ var ca=act(c);
            return '<a href="'+ca.href+'" onclick="'+ca.base+';return false" class="krhead block w-full text-center px-5 py-2.5 text-sm text-ink/75 hover:text-pinkstrong hover:bg-bglight transition" style="font-weight:400">'+esc(lbl(c))+'</a>'; }).join('')
        +'</div></div>';
      return '<div class="relative group">'+link+dd+'</div>';
    }
    var linksHTML=tops.map(itemHTML).join('');
    var globeBtn='<button class="hover:text-pinkstrong"><iconify-icon icon="solar:global-linear" width="18"></iconify-icon></button>';
    var hdrNav=document.querySelector('#hdr nav');
    if(hdrNav) hdrNav.innerHTML=linksHTML+globeBtn;
    var barNav=document.querySelector('#hdrBar nav');
    if(barNav) barNav.innerHTML=linksHTML;
    var mnav=document.getElementById('mnav');
    if(mnav){
      mnav.innerHTML=tops.map(function(m){
        var a=act(m);
        var out='<a href="'+a.href+'" onclick="'+a.base+";document.getElementById('mnav').classList.add('hidden');return false"+'">'+esc(lbl(m))+'</a>';
        kidsOf(m.id).forEach(function(c){
          var ca=act(c);
          out+='<a href="'+ca.href+'" onclick="'+ca.base+";document.getElementById('mnav').classList.add('hidden');return false"+'" class="pl-3 text-ink/60">└ '+esc(lbl(c))+'</a>';
        });
        return out;
      }).join('');
    }
  })();

  /* ===== 제모 가격 안내 렌더 (admin hairprice 연동) ===== */
  (function(){
    var box=document.getElementById('hpBody');
    if(!box) return;
    var d=(window.KK? KK.get('hairprice', null): null);
    function esc(s){ return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;'); }
    if(!d || d.on===false || !(d.items&&d.items.length)){
      box.innerHTML='<div class="rounded-2xl border border-ink/10 bg-white p-14 text-center"><p class="krhead text-ink/50 break-keep" style="font-weight:300">가격 안내 준비 중입니다. 자세한 내용은 카카오톡 또는 전화로 문의해주세요.</p></div>';
      return;
    }
    var groups=[];
    d.items.forEach(function(it){
      var g=groups.find(function(x){return x.title===it.title;});
      if(!g){ g={title:it.title, img:'', rows:[]}; groups.push(g); }
      if(it.img && !g.img) g.img=it.img;
      g.rows.push(it);
    });
    box.innerHTML=groups.map(function(g){
      return '<div class="mb-10">'
        +'<h2 class="krhead text-xl text-ink mb-4 break-keep" style="font-weight:700">'+esc(g.title)+'</h2>'
        +(g.img?'<div class="rounded-2xl overflow-hidden mb-4"><img src="'+g.img+'" style="width:100%;display:block" alt=""></div>':'')
        +'<div class="rounded-2xl border border-ink/10 overflow-hidden bg-white shadow-sm"><table class="w-full text-sm">'
        +'<thead><tr class="krhead bg-cream text-ink/60" style="font-weight:500"><th class="text-left px-6 py-4">시술부위</th><th class="text-right px-4 py-4">1회</th><th class="text-right px-4 py-4">5회</th><th class="text-right px-6 py-4">10회</th></tr></thead>'
        +'<tbody class="krhead" style="font-weight:300">'
        +g.rows.map(function(r){ return '<tr class="border-t border-ink/8"><td class="px-6 py-3.5 text-ink/85 break-keep">'+esc(r.part)+'</td><td class="px-4 py-3.5 text-right text-pinkstrong" style="font-weight:600">'+esc(r.p1||'-')+'</td><td class="px-4 py-3.5 text-right text-pinkstrong" style="font-weight:600">'+esc(r.p5||'-')+'</td><td class="px-6 py-3.5 text-right text-pinkstrong" style="font-weight:600">'+esc(r.p10||'-')+'</td></tr>'; }).join('')
        +'</tbody></table></div></div>';
    }).join('');
  })();

  /* ===== 추천인 링크 방문 기록 (?ref=) ===== */
  (function(){
    try{
      var m=location.search.match(/[?&]ref=([^&]+)/);
      if(m && m[1]){
        var code=decodeURIComponent(m[1]);
        localStorage.setItem('yj_ref', code);
        localStorage.setItem('yj_ref_at', new Date().toISOString());
      }
    }catch(e){}
  })();

  /* ===== 쇼츠 영상 렌더 (admin 쇼츠 연동 → SNS CONTENTS) ===== */
  (function(){
    if(!window.KK) return;
    var shorts=(KK.get('shorts', [])||[]).filter(function(s){return s.on!==false;});
    if(!shorts.length) return;
    var box=document.getElementById('snsPhones');
    if(!box) return;
    function esc(s){ return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/"/g,'&quot;'); }
    box.innerHTML=shorts.slice(0,4).map(function(s){
      var bg=s.img
        ? '<img src="'+esc(s.img)+'" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:.9" alt="">'
        : '<div style="position:absolute;inset:0;background:linear-gradient(160deg,#3a4047,#2f343a)"></div>';
      return '<a href="'+esc(s.url||'#')+'" target="_blank" rel="noopener" class="relative overflow-hidden shadow-2xl group" style="width:200px;max-width:42%;aspect-ratio:9/16;border-radius:1.6rem;border:5px solid rgba(0,0,0,.5);background:#000;display:block">'
        + bg
        + '<span class="absolute inset-0 grid place-items-center"><span class="w-14 h-14 rounded-full bg-pink/90 grid place-items-center group-hover:scale-110 transition"><iconify-icon icon="solar:play-bold" width="24" class="text-white"></iconify-icon></span></span>'
        + '<span class="krhead absolute left-0 right-0 bottom-0 px-3 py-3 text-white text-[12.5px] leading-snug break-keep" style="font-weight:500;background:linear-gradient(0deg,rgba(0,0,0,.75),transparent)">'+esc(s.t)+'</span>'
        + '</a>';
    }).join('');
  })();

  /* ===== 기본 설정 반영 (다국어 + SEO 메타태그, admin 기본 설정 연동) ===== */
  (function(){
    if(!window.KK) return;
    var LANGS=[['ko','한국어'],['en','English'],['ja','日本語'],['zh','中文'],['th','ไทย']];
    var lang='ko';
    try{ var sv=localStorage.getItem('yj_lang'); if(sv) lang=sv; }catch(e){}
    if(['ko','en','ja','zh','th'].indexOf(lang)<0) lang='ko';

    var ko = KK.get('settings', null);
    if(ko){
      var ml = KK.get('settings_ml', {}) || {};
      var s = lang==='ko' ? ko : Object.assign({}, ko, ml[lang]||{});
      function set(id, val){ var el=document.getElementById(id); if(el && val) el.textContent=val; }
      set('locAddr', (s.addr1||'') + (s.addr2? ' '+s.addr2 : ''));
      set('locTel', ko.tel);
      set('locWeek', (s.hWeek||'').replace(/\s*\(.*?\)\s*/g,''));
      set('locWeekend', (s.hWeekend||'').replace(/\s*\(.*?\)\s*/g,''));
      set('locHoliday', (s.hHoliday||'').replace(/\s*\(.*?\)\s*/g,''));
      var biz=document.getElementById('ftBiz'); if(biz) biz.textContent='상호 : '+(s.biz||'')+' | 대표 : '+(ko.ceo||'')+' | 사업자등록번호 : '+(ko.reg||'');
      var fa=document.getElementById('ftAddr'); if(fa) fa.textContent='주소 : '+(s.addr1||'')+(s.addr2? ' '+s.addr2:'');
      var nv=document.getElementById('locNaver'); if(nv && ko.naver) nv.onclick=function(){ window.open(ko.naver,'_blank'); };
      var kk=document.getElementById('locKakao'); if(kk && ko.kakao) kk.onclick=function(){ window.open(ko.kakao,'_blank'); };

      /* SEO 메타태그 주입 (한국어 기준) */
      function meta(name, content){
        if(!content) return;
        var ex=document.querySelector('meta[name="'+name+'"]');
        if(ex){ ex.setAttribute('content', content); return; }
        var m=document.createElement('meta'); m.name=name; m.content=content; document.head.appendChild(m);
      }
      var kw=(ko.seo||'');
      if(ko.seoLocal) kw += (kw?', ':'') + ko.seoLocal.split(/\s+/).filter(Boolean).join(', ');
      meta('keywords', kw);
      meta('naver-site-verification', ko.navVerify);
      meta('google-site-verification', ko.gVerify);
      if(ko.seoTail){ try{ if(document.title.indexOf(ko.seoTail)<0) document.title = document.title + ' | ' + ko.seoTail; }catch(e){} }
    }

    /* 지구본 버튼 → 언어 선택 메뉴 */
    var menu=null;
    function closeMenu(){ if(menu){ menu.remove(); menu=null; } }
    function openMenu(btn){
      if(menu){ closeMenu(); return; }
      var r=btn.getBoundingClientRect();
      menu=document.createElement('div');
      menu.id='langMenu';
      menu.style.cssText='position:fixed;z-index:99;top:'+(r.bottom+8)+'px;left:'+Math.max(8,Math.min(window.innerWidth-160, r.left-50))+'px;background:#fff;border:1px solid rgba(47,52,58,.12);border-radius:12px;box-shadow:0 12px 32px rgba(0,0,0,.14);padding:6px;min-width:140px';
      menu.innerHTML=LANGS.map(function(L){
        var on=L[0]===lang;
        return '<button data-l="'+L[0]+'" class="krhead" style="display:block;width:100%;text-align:left;padding:9px 14px;border-radius:8px;font-size:13.5px;'+(on?'background:#2f343a;color:#fff;font-weight:700':'color:#3a4047')+'">'+L[1]+(on?' ✓':'')+'</button>';
      }).join('');
      menu.addEventListener('click', function(e){
        var b=e.target.closest('button[data-l]'); if(!b) return;
        try{ localStorage.setItem('yj_lang', b.dataset.l); }catch(err){}
        location.reload();
      });
      document.body.appendChild(menu);
      setTimeout(function(){
        document.addEventListener('click', function h(ev){
          if(menu && !menu.contains(ev.target)){ closeMenu(); document.removeEventListener('click', h); }
        });
      }, 50);
    }
    document.querySelectorAll('iconify-icon[icon="solar:global-linear"]').forEach(function(ic){
      var btn=ic.closest('button'); if(!btn) return;
      btn.title='언어 / Language';
      btn.addEventListener('click', function(ev){ ev.stopPropagation(); openMenu(btn); });
    });
  })();

  /* ===== 병원 소개 / 오시는 길 / 주차 안내 반영 (admin intro 연동 · 다국어) ===== */
  (function(){
    if(!window.KK) return;
    var it = KK.get('intro', null); if(!it) return;
    var lang='ko';
    try{ var sv=localStorage.getItem('yj_lang'); if(sv) lang=sv; }catch(e){}
    if(['ko','en','ja','zh','th'].indexOf(lang)<0) lang='ko';
    if(it.img){ var im=document.getElementById('aboutImg'); if(im) im.src=it.img; }
    var body = lang==='ko' ? (it.body||'') : ((it.ml&&it.ml[lang])||it.body||'');
    if(body){
      var b=document.getElementById('aboutBody');
      if(b) b.innerHTML='<div class="note-body krhead text-ink/75 leading-loose break-keep text-left text-[16px]" style="font-weight:300">'+body+'</div>';
    }
    function secText(sec){
      if(!sec) return '';
      return (lang!=='ko' && sec[lang]) ? sec[lang] : (sec.ko||'');
    }
    var way=secText(it.way), parking=secText(it.parking);
    if(way){ var wb=document.getElementById('locWayBox'); if(wb){ wb.classList.remove('hidden'); document.getElementById('locWay').innerHTML=way; } }
    if(parking){ var pb=document.getElementById('locParkingBox'); if(pb){ pb.classList.remove('hidden'); document.getElementById('locParking').innerHTML=parking; } }
  })();

  /* ===== 팝업 노출 (admin 팝업 관리 연동: 이미지 + 기간 제한 + 오늘 하루 닫기) ===== */
  (function(){
    if(!window.KK) return;
    var now = Date.now();
    var popups = (KK.get('popups', [])||[]).filter(function(p){
      if(p.on===false) return false;
      if(!p.img && !p.title) return false;
      if(p.period){
        try{
          if(p.start && now < new Date(p.start).getTime()) return false;
          if(p.end && now > new Date(p.end).getTime()) return false;
        }catch(e){}
      }
      return true;
    }).sort(function(a,b){return (a.order||0)-(b.order||0);});
    if(!popups.length) return;
    try{ if(localStorage.getItem('yj_popup_closed')===new Date().toDateString()) return; }catch(e){}
    var idx=0, modal=document.getElementById('popupModal');
    var box=document.getElementById('popupImg');
    function show(){
      var p=popups[idx];
      if(p.img){
        box.style.height='auto';
        box.style.background='none';
        box.innerHTML='<img src="'+p.img+'" style="width:100%;max-height:70vh;object-fit:contain;display:block" alt="'+String(p.title||'').replace(/"/g,'&quot;')+'">';
      } else {
        box.style.height='288px';
        box.style.background='linear-gradient(135deg,#e9e1d6,#dccfc0)';
        box.innerHTML='<div><p class="krhead text-lg font-bold" style="color:#8a5a66;font-weight:700">'+(p.title||'')+'</p></div>';
      }
      var lk=document.getElementById('popupLink');
      if(p.link){ lk.href=p.link; lk.style.display=''; }
      else { lk.style.display='none'; }
      document.getElementById('popupDots').innerHTML=popups.map(function(_,i){return '<span class="w-1.5 h-1.5 rounded-full" style="background:'+(i===idx?'#4a5d4e':'#cdc4ba')+'"></span>';}).join('');
      document.getElementById('popupPrev').style.visibility = popups.length>1?'visible':'hidden';
      document.getElementById('popupNext').style.visibility = popups.length>1?'visible':'hidden';
    }
    document.getElementById('popupPrev').onclick=function(){ idx=(idx-1+popups.length)%popups.length; show(); };
    document.getElementById('popupNext').onclick=function(){ idx=(idx+1)%popups.length; show(); };
    var closeBtn=document.getElementById('popupCloseToday');
    if(closeBtn){
      closeBtn.onclick=function(){
        try{ localStorage.setItem('yj_popup_closed', new Date().toDateString()); }catch(e){}
        modal.classList.add('hidden'); modal.classList.remove('flex');
      };
    }
    show(); modal.classList.remove('hidden'); modal.classList.add('flex');
    modal.addEventListener('click', function(e){ if(e.target===modal){ modal.classList.add('hidden'); modal.classList.remove('flex'); } });
  })();

  /* ===== 시술 후 주의사항 / 의료진 / 비급여 / 지점 안내 렌더 ===== */
  (function(){
    var K = window.KK;
    var DEF_CARE=[
      {title:'점, 편평사마귀, 비립종, 한관종, 피지선증식증 등 돌출병변 제거', on:true, body:'시술 후 일시적으로 출혈·삼출액·딱지가 생길 수 있으며 정상적인 회복 과정입니다. 딱지는 인위적으로 제거하지 마세요. 세안·샤워는 다음 날부터 미온수로 가볍게 가능합니다.'},
      {title:'새살레이저 (비후성 흉터)', on:true, body:'붉은기는 1개월에서 최대 6개월 이상 지속될 수 있으나 시간이 지나며 옅어집니다.'},
      {title:'여드름 압출', on:true, body:'압출 후 붉은기와 미세한 딱지가 생길 수 있습니다. 자외선 차단제를 꼼꼼히 발라 색소침착을 예방하세요.'},
      {title:'리프팅 시술 (슈링크, 볼뉴머, 엑쏘웨이브, 시크릿)', on:true, body:'시술 후 일시적 붉은기·부기가 있을 수 있습니다. 충분한 수분 섭취와 보습을 권장합니다.'},
      {title:'VIP 회원권 및 환불/변경 규정', on:true, body:'할인된 금액으로 결제 후 취소 시 10%의 위약금이 차감됩니다. 환불 금액은 정상가 1회 기준으로 환산합니다.'},
    ];
    var DEF_DOC=[{name:'김경민', role:'대표원장 · 한의사', desc:'피부·미용 시술 전문. 연오재한의원 대표원장.', img:''}];
    var DEF_NI=[
      {name:'레이저 토닝 (큐 마스터 플러스)', unit:'1회', price:'9,900원'},{name:'피코 토닝 (피코하이)', unit:'2,000샷', price:'9,900원'},
      {name:'슈링크 초음파 리프팅', unit:'100샷', price:'7,900원'},{name:'볼뉴머 고주파 리프팅', unit:'100샷', price:'89,000원'},
      {name:'시크릿 RF 니들', unit:'1부위', price:'99,000원'},{name:'피코프락셀', unit:'1부위', price:'99,000원'},
      {name:'퓨라셀 MTS 스킨부스터', unit:'1회', price:'20,000원'},{name:'새살침(흉터 재생)', unit:'1포인트', price:'43,000원'},
    ];
    var DEF_NET=[
      {name:'연오재 (화정 본점)', addr:'경기 고양시 덕양구 화중로 60', phone:'0507-1485-2378', open:true},
      {name:'XXI 2호점 (오픈예정)', addr:'-', phone:'-', open:false},
      {name:'XXI 3호점 (오픈예정)', addr:'-', phone:'-', open:false},
    ];

    // care
    var care=(K?K.get('care',DEF_CARE):DEF_CARE).filter(function(c){return c.on!==false;});
    var cl=document.getElementById('careList');
    if(cl) cl.innerHTML = care.map(function(c,i){
      return '<details class="group rounded-2xl border border-ink/10 bg-white overflow-hidden"'+(i===0?' open':'')+'>'
        +'<summary class="krhead flex items-center gap-3 px-6 py-5 cursor-pointer list-none" style="font-weight:500">'
          +'<span class="w-7 h-7 rounded-full bg-pink/10 text-pinkstrong grid place-items-center text-xs shrink-0" style="font-weight:700">'+(i+1)+'</span>'
          +'<span class="flex-1 text-ink/90 break-keep">'+c.title+'</span>'
          +'<iconify-icon icon="solar:alt-arrow-down-linear" class="text-ink/40 transition group-open:rotate-180"></iconify-icon>'
        +'</summary>'
        +'<div class="krhead px-6 pb-6 pt-1 text-sm text-ink/65 leading-relaxed break-keep" style="font-weight:300">'+(c.body||'')+'</div>'
      +'</details>';
    }).join('');

    // doctors (카드 클릭 → 상세 프로필)
    var docs=(K?K.get('doctors',DEF_DOC):DEF_DOC);
    window.__docs = docs;
    var dl=document.getElementById('docList');
    if(dl) dl.innerHTML = docs.map(function(d,i){
      return '<div onclick="__docOpen('+i+')" class="rounded-2xl border border-ink/10 bg-white overflow-hidden shadow-sm flex cursor-pointer card-hover">'
        +'<div class="w-32 shrink-0 grid place-items-center overflow-hidden" style="background:linear-gradient(135deg,#e9e1d6,#d8cabb)">'
        +(d.img?'<img src="'+d.img+'" style="width:100%;height:100%;object-fit:cover;display:block" alt="">':'<iconify-icon icon="solar:user-rounded-bold" width="44" class="text-pinkstrong/60"></iconify-icon>')
        +'</div>'
        +'<div class="p-6">'
          +'<h3 class="krhead text-xl text-ink/90" style="font-weight:700">'+(d.name||'')+'</h3>'
          +'<p class="krhead text-sm text-pinkstrong mt-1" style="font-weight:500">'+(d.role||'')+'</p>'
          +'<p class="krhead text-sm text-ink/60 mt-3 break-keep leading-relaxed" style="font-weight:300">'+(d.desc||'')+'</p>'
          +'<p class="krhead text-xs text-ink/40 mt-3 flex items-center gap-1" style="font-weight:400">프로필 보기 <iconify-icon icon="solar:alt-arrow-right-linear"></iconify-icon></p>'
        +'</div></div>';
    }).join('');
    window.__docOpen=function(i){
      var d=(window.__docs||[])[i]; if(!d) return;
      var body = (d.body && String(d.body).replace(/<[^>]*>/g,'').trim().length) || String(d.body||'').indexOf('<img')>=0
        ? d.body
        : '<p>'+(d.desc||'')+'</p>';
      var html=''+
        '<div class="krhead flex items-center gap-2 text-sm text-muted mb-6" style="font-weight:400">'+
          '<button onclick="showView(\'home\')" class="hover:text-pinkstrong">홈</button><span>/</span>'+
          '<button onclick="showView(\'doctors\')" class="hover:text-pinkstrong">의료진 소개</button>'+
        '</div>'+
        '<div class="flex items-start gap-6 flex-wrap">'+
          (d.img?'<div class="w-40 rounded-2xl overflow-hidden shrink-0"><img src="'+d.img+'" style="width:100%;display:block" alt=""></div>':'')+
          '<div class="min-w-0">'+
            '<h1 class="krhead text-3xl sm:text-4xl text-ink break-keep leading-snug" style="font-weight:900">'+(d.name||'')+'</h1>'+
            (d.role?'<p class="krhead text-[15px] text-pinkstrong mt-2" style="font-weight:500">'+d.role+'</p>':'')+
            (d.desc?'<p class="krhead text-[14px] text-ink/55 mt-3 break-keep" style="font-weight:300">'+d.desc+'</p>':'')+
          '</div>'+
        '</div>'+
        '<div class="flex items-center gap-3 my-8"><span class="h-px flex-1 bg-ink/10"></span><span class="w-1.5 h-1.5 rotate-45 border border-ink/30"></span><span class="h-px flex-1 bg-ink/10"></span></div>'+
        '<div class="note-body krhead text-[15px] text-ink/75 leading-loose break-keep" style="font-weight:300">'+body+'</div>'+
        '<div class="mt-14 flex flex-wrap items-center gap-3">'+
          '<button onclick="showView(\'doctors\')" class="krhead px-6 py-3 rounded-full border border-ink/15 text-sm hover:bg-ink hover:text-white transition flex items-center gap-2" style="font-weight:400"><iconify-icon icon="solar:alt-arrow-left-linear"></iconify-icon> 의료진 목록</button>'+
          '<button onclick="showView(\'reserve\')" class="krhead px-6 py-3 rounded-full bg-ink text-white text-sm hover:bg-pinkstrong transition flex items-center gap-2" style="font-weight:500">온라인예약 하러 가기 <iconify-icon icon="solar:alt-arrow-right-linear"></iconify-icon></button>'+
        '</div>';
      document.getElementById('docDetailBody').innerHTML=html;
      showView('docdetail');
    };

    // non-insured
    var ni=(K?K.get('noninsured',DEF_NI):DEF_NI);
    var nl=document.getElementById('niList');
    if(nl) nl.innerHTML = ni.map(function(it){
      return '<tr class="border-t border-ink/8"><td class="px-6 py-3.5 text-ink/85">'+it.name+'</td><td class="px-4 py-3.5 text-ink/50">'+(it.unit||'')+'</td><td class="px-6 py-3.5 text-right text-pinkstrong" style="font-weight:600">'+(it.price||'')+'</td></tr>';
    }).join('');

    // network
    var net=(K?K.get('network',DEF_NET):DEF_NET);
    var netl=document.getElementById('netList');
    if(netl) netl.innerHTML = net.map(function(n){
      return '<div class="rounded-2xl border border-ink/10 bg-white p-6 shadow-sm">'
        +'<div class="flex items-center justify-between mb-2"><h3 class="krhead text-lg text-ink/90" style="font-weight:700">'+n.name+'</h3>'
        +(n.open?'<span class="krhead text-[11px] px-2 py-0.5 rounded-full bg-pink/10 text-pinkstrong" style="font-weight:500">운영중</span>':'<span class="krhead text-[11px] px-2 py-0.5 rounded-full bg-ink/8 text-ink/45" style="font-weight:500">오픈예정</span>')+'</div>'
        +'<p class="krhead text-sm text-ink/55 break-keep" style="font-weight:300"><iconify-icon icon="solar:map-point-linear" class="text-ink/35"></iconify-icon> '+(n.addr||'')+'</p>'
        +'<p class="krhead text-sm text-ink/55 mt-1" style="font-weight:300"><iconify-icon icon="solar:phone-linear" class="text-ink/35"></iconify-icon> '+(n.phone||'-')+'</p>'
      +'</div>';
    }).join('');
  })();

  /* ===== 실시간 동기화: 다른 탭(어드민)에서 저장 시 자동 반영 ===== */
  window.addEventListener('storage', function(e){
    if(e.key && e.key.indexOf('kkeut:')===0){ location.reload(); }
  });
  
