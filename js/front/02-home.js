/* ===== HOME 스크립트 ===== */

    const hdr=document.getElementById('hdr'), hdrBar=document.getElementById('hdrBar');
    function onScroll(){
      if(window.scrollY>120){ hdr.style.opacity='0'; hdr.style.pointerEvents='none'; hdrBar.style.transform='translateY(0)'; }
      else { hdr.style.opacity='1'; hdr.style.pointerEvents='auto'; hdrBar.style.transform='translateY(-100%)'; }
    }
    window.addEventListener('scroll', onScroll); onScroll();

    const reviews=KK.get('reviews', [
      {n:'김**',t:'원장님께서 친절하게 상담해주셔서 감사했습니다.'},
      {n:'이**',t:'직원분들이 정말 친절하고 세심하게 케어해주셨어요.'},
      {n:'박**',t:'시술 후 피부가 많이 좋아졌어요.'},
      {n:'최**',t:'시설도 깨끗하고 대기시간도 짧아 만족스러웠습니다.'},
      {n:'정**',t:'전문적인 상담과 시술로 효과를 바로 봤어요.'},
      {n:'강**',t:'친구 소개로 방문했는데 정말 만족스럽네요.'},
    ]);
    document.getElementById('reviewMarquee').innerHTML=[...reviews,...reviews].map(r=>
      `<div class="krhead flex items-center gap-2 px-6 shrink-0 text-sm" style="font-weight:300"><span class="text-pink">★★★★★</span><span class="font-medium" style="font-weight:500">${r.n}</span><span class="text-white/55">"${r.t}"</span></div>`).join('');

    const PROG_IMG={
      hair:'img/kv-wide-shadow.jpg',        diet:'img/kv-body-sportswear.jpg',
      contour:'img/kv-wide-travertine.jpg', whitening:'img/kv-wide-water.jpg',
      lifting:'img/tex-gel-dome.jpg',       acne:'img/tex-cream-gel.jpg',
      booster:'img/tex-gel-glitter.jpg',    immune:'img/tex-petal-water.jpg',
    };
    /* c = 「자세히 보기」를 눌렀을 때 이동할 시술 카테고리 힌트.
       실제 카테고리명과 글자가 조금 달라도 __goCategory 가 유사도로 찾아줍니다. */
    const programs=[
      {t:'제모', s:'hair', c:'레이저 제모', b:['남성 제모','여성 제모','매끄러운 피부'], d:['악센토']},
      {t:'다이어트', s:'diet', c:'다이어트', b:['한의사 밀착관리 린다이어트','다이어트 환약, 체질 개선 한약','맞춤 관리'], d:['린다이어트 프로그램']},
      {t:'윤곽 리프팅', s:'contour', c:'윤곽 리프팅', b:['아름다운 얼굴 형태','주름 개선','자연스러운 볼륨감'], d:['슈링크','엑쏘웨이브(케이온다)']},
      {t:'미백/색소/기미', s:'whitening', c:'미백/색소/기미', b:['진단 장비와 섬세한 손길','다양한 깊이의 색소를','다양한 레이저 파장으로 정밀하게'], d:['큐 마스터 플러스','피코하이','바이오쎌']},
      {t:'탄력 리프팅', s:'lifting', c:'탄력 리프팅', b:['초음파','고주파','극초단파','RF 니들 방식'], d:['볼뉴머','시크릿']},
      {t:'여드름/모공/흉터', s:'acne', c:'여드름/모공/흉터', b:['모공축소·주름감소','피부톤·탄력 개선','염증성 여드름 진정'], d:['피코프락셀','시크릿']},
      {t:'스킨부스터', s:'booster', c:'스킨부스터', b:['피부 영양공급','미백, 색소 완화효과'], d:['퓨라셀 MTS']},
      {t:'맞춤한약', s:'immune', c:'맞춤 한약', b:['피부 면역력 강화','피로 회복','혈액순환 개선'], d:[]},
    ];
    let pi=0;
    function renderProg(){
      const p=programs[pi];
      document.getElementById('progImg').src=PROG_IMG[p.s]||'img/kv-wide-travertine.jpg';
      document.getElementById('progTitle').textContent=p.t;
      document.getElementById('progList').innerHTML=p.b.map(x=>`<li>${x}</li>`).join('');
      const dev=document.getElementById('progDev');
      if(p.d&&p.d.length){
        dev.style.display='';
        dev.innerHTML=`<p class="krhead text-[11px] tracking-widest text-ink/35 mb-2.5" style="font-weight:400">${p.t==='다이어트'?'PROGRAM':'EQUIPMENT'}</p>`
          +`<div class="flex flex-wrap gap-1.5">`+p.d.map(x=>
            `<span class="krhead text-[12px] text-pinkstrong/80 bg-pinksoft/50 border border-pink/20 rounded-full px-3 py-1 break-keep" style="font-weight:400">${x}</span>`).join('')+`</div>`;
      } else { dev.style.display='none'; dev.innerHTML=''; }
      document.getElementById('progNum').textContent=String(pi+1).padStart(2,'0')+' / '+String(programs.length).padStart(2,'0');
    }
    function progSlide(d){ pi=(pi+d+programs.length)%programs.length; renderProg(); }
    renderProg();
    /* 「자세히 보기」 → 현재 보고 있는 프로그램의 카테고리로 이동 */
    window.progGo=function(){
      var p=programs[pi];
      if(window.__goCategory) window.__goCategory(p && (p.c||p.t));
      else if(window.showView) showView('category');
    };
    /* 이미지·제목 클릭으로도 이동되게 */
    ['progImg','progTitle'].forEach(function(id){
      var el=document.getElementById(id);
      if(el){ el.style.cursor='pointer'; el.addEventListener('click', function(){ window.progGo(); }); }
    });

    const ssData=[
      { t:'여러 피부 고민, 한 번에', e:'[첫 시술 EVENT] 토닝 (2000샷)', o:'18,900', p:'9,900', s:'img/tex-cream-beam.jpg'},
      { t:'정밀 색소 레이저', e:'[EVENT] 색소 레이저 1개 + 모델링팩', o:'19,000', p:'10,000', s:'img/tex-water-ripple.jpg'},
      { t:'듀얼 토닝 한 끗 결과', e:'[첫 시술 EVENT] 듀얼 토닝 (3000샷)', o:'75,000', p:'36,000', s:'img/tex-gel-dome.jpg'},
      { t:'잡티/주근깨 레이저', e:'[EVENT] 원데이 화이트닝 1회', o:'110,000', p:'58,000', s:'img/tex-gel-glitter.jpg'},
    ];
    /* 현재 선택된 탭 — 카드 라벨과 클릭 시 이동할 카테고리가 이 탭을 따라갑니다 */
    const ssTabEls=[].slice.call(document.querySelectorAll('#ssTabs .tab'));
    let ssActive=0;
    function ssTabCat(i){
      var b=ssTabEls[i]; if(!b) return '';
      return b.getAttribute('data-cat') || (b.textContent||'').trim();
    }
    function ssTabLabel(i){
      var b=ssTabEls[i]; if(!b) return '';
      return (b.textContent||'').replace(/\s+/g,' ').trim();
    }
    const ssWon = n => (Number(n)||0).toLocaleString('ko-KR');
    const ssTex = ['img/tex-cream-beam.jpg','img/tex-water-ripple.jpg','img/tex-gel-dome.jpg','img/tex-gel-glitter.jpg'];
    function ssEsc(s){ return String(s==null?'':s).replace(/[&<>"]/g,function(m){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m]; }); }

    function renderSS(){
      var label = ssTabLabel(ssActive);
      var track = document.getElementById('ssTrack');
      if(!track) return;

      /* 관리자에 등록된 실제 상품을 우선 사용. 아직 상품 스크립트가 로드되기 전이면 샘플로 그림 */
      var real = (typeof window.__productsFor==='function') ? window.__productsFor(ssTabCat(ssActive), 4) : null;

      var cards = (real && real.length)
        ? real.map(function(p,i){
            return {
              t: p.title || p.name, e: p.event,
              priceTxt: p.price ? ssWon(p.price)+'원' : '상담 후 안내',
              origTxt : p.orig  ? ssWon(p.orig)+'원'  : '',
              img: p.img || ssTex[i%ssTex.length],
              cat: p.cat || label, id: p.id, name: p.name
            };
          })
        : ssData.map(function(c,i){
            return { t:c.t, e:c.e, priceTxt:c.p+'원', origTxt:c.o+'원', img:c.s, cat:label, id:'', name:'' };
          });

      track.innerHTML = cards.map(function(c){
        return `
      <div class="ssCard snap-start shrink-0 w-[80%] sm:w-[300px] rounded-xl overflow-hidden olive-card relative group cursor-pointer"
           data-pid="${ssEsc(c.id)}" data-pname="${ssEsc(c.name)}">
        <img src="${ssEsc(c.img)}" class="w-full h-[300px] object-cover" alt="" loading="lazy">
        <div class="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent"></div>
        <div class="krhead absolute bottom-0 p-5 text-white w-full" style="font-weight:300">
          <p class="text-[11px] text-pinkneon mb-1 break-keep">${ssEsc(c.cat)}</p>
          <h4 class="font-medium text-lg leading-snug break-keep" style="font-weight:500">${ssEsc(c.t)}</h4>
          <p class="text-white/70 text-xs mt-1 break-keep line-clamp-1">${ssEsc(c.e)}</p>
          <p class="mt-2">${c.origTxt?`<span class="line-through text-white/40 text-sm mr-2">${ssEsc(c.origTxt)}</span>`:''}<span class="text-2xl font-bold" style="font-weight:700">${ssEsc(c.priceTxt)}</span></p>
        </div>
      </div>`;
      }).join('');

      /* 카드 클릭 → 실제 상품이면 그 상품 상세로, 아니면 해당 카테고리 목록으로 */
      track.querySelectorAll('.ssCard').forEach(function(el){
        el.addEventListener('click', function(){
          var id=el.getAttribute('data-pid'), nm=el.getAttribute('data-pname');
          if((id||nm) && typeof window.__openProdById==='function'){ window.__openProdById(id, nm); return; }
          window.ssGo();
        });
      });
    }
    /* 「VIEW MORE」 → 현재 탭의 카테고리로 이동 */
    window.ssGo=function(){
      if(window.__goCategory) window.__goCategory(ssTabCat(ssActive));
      else if(window.showView) showView('category');
    };
    ssTabEls.forEach((b,i)=>b.addEventListener('click',()=>{
      ssActive=i;
      ssTabEls.forEach(x=>{x.classList.remove('font-medium','border-pinkneon'); x.classList.add('text-white/40','border-transparent');});
      b.classList.add('font-medium','border-pinkneon'); b.classList.remove('text-white/40','border-transparent');
      renderSS();
    }));
    renderSS();
    /* 상품 스크립트(03-category.js)는 이 파일보다 뒤에 로드됩니다.
       준비되면 실제 상품으로 한 번 더 그립니다. */
    document.addEventListener('yj:catready', renderSS);

    var __storedBA=(window.KK? KK.get('ba', []): []).filter(function(x){return x.on!==false;});
    var __baBlur = window.KK ? !!KK.get('baBlur', false) : false;
    const ba = __storedBA.length
      ? __storedBA.slice(0,6).map(function(s,i){ return {t:s.title||'', sub:s.sub||'', s:'ba'+(i+1), bImg:s.imgB||'', aImg:s.imgA||''}; })
      : [
      {t:'홍조개선 전후', sub:'볼 및 나비존 붉은 기 진정', s:'ba1'},
      {t:'모공 개선 전후', sub:'코 모공 축소 개선', s:'ba2'},
      {t:'안면홍조 재생', sub:'얼굴 붉은기 피부 재생', s:'ba3'},
      {t:'피지·여드름 개선', sub:'모공·피지 관리', s:'ba4'},
      {t:'리프팅 시술 개선', sub:'탄력·라인 개선', s:'ba5'},
    ];
    document.getElementById('baTrack').innerHTML=ba.map((c,ci)=>`
      <div class="baCard snap-start shrink-0 w-[70%] sm:w-[300px] rounded-xl overflow-hidden bg-white shadow-sm border border-ink/5 cursor-pointer card-hover" data-bi="${ci}">
        <div class="relative">
          <div class="grid grid-rows-2">
            <div class="relative h-32 overflow-hidden"><img src="${c.bImg||('https://picsum.photos/seed/'+c.s+'b/400/200')}" class="w-full h-full object-cover" style="${__baBlur&&c.bImg?'filter:blur(12px);transform:scale(1.08)':''}" alt="" loading="lazy"><span class="absolute top-2 right-2 text-[10px] font-bold bg-pink text-white px-2 py-0.5 rounded">BEFORE</span></div>
            <div class="relative h-32 overflow-hidden"><img src="${c.aImg||('https://picsum.photos/seed/'+c.s+'a/400/200')}" class="w-full h-full object-cover" style="${__baBlur&&c.aImg?'filter:blur(12px);transform:scale(1.08)':''}" alt="" loading="lazy"><span class="absolute bottom-2 right-2 text-[10px] font-bold bg-ink text-white px-2 py-0.5 rounded">AFTER</span></div>
          </div>
          <div class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 border-2 border-dashed border-white/70 rounded-full"></div>
        </div>
        <div class="krhead p-4" style="font-weight:300">
          <span class="text-[10px] bg-pinksoft text-pinkstrong px-2 py-0.5 rounded">Before &amp; After</span>
          <h4 class="font-medium mt-2 break-keep" style="font-weight:500">${c.t}</h4>
          <p class="text-ink/55 text-xs mt-1 break-keep">${c.sub}</p>
        </div>
      </div>`).join('');

    /* 전후사진 카드 클릭 → 해당 전후사진 상세로 (없으면 전후사진 목록) */
    document.querySelectorAll('#baTrack .baCard').forEach(function(el){
      el.addEventListener('click', function(){
        var i=el.getAttribute('data-bi');
        if(typeof window.__goBA==='function') window.__goBA(i);
        else if(window.showView) showView('ba');
      });
    });

    const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target);}}),{threshold:.12});
    document.querySelectorAll('.reveal').forEach(el=>io.observe(el));
  
  
