/* ===== 시술메뉴/이벤트(카테고리) 스크립트 — 독립 범위 ===== */
(function(){

    /* ===== compact header (index 와 동일 동작) ===== */
    
    /* ===== 카테고리 (이미지 좌측 사이드바 그대로) ===== */
    const categories=KK.get('categories', [
      '전체보기',
      '[안꿋나는] 레이저 제모',
      '[갸름하게] 윤곽 리프팅',
      '[탄력UP!] 탄력 리프팅',
      '[투명하게] 미백/색소/기미',
      '여드름/모공/흉터',
      '[피부영양제] 스킨부스터',
      '[고농도, 개인 맞춤] 다이어트',
      '[체질부터] 맞춤 한약',
      '패키지시술',
      '상담 후 결정하기',
      '[이것도 치료되나?] 잘 모르는 피부 고민/질환',
    ]);

    /* ===== 상품 데이터 (이미지의 실제 문구/가격 + 카테고리 채움용 샘플) ===== */
    /* type: 'promo' = 장비 프로모 배너 / 'ba' = 전후사진 / 'photo' = 모델·제품 사진 */
    const products=KK.get('products', [
      /* ── 레이저 제모 : 악센토 ── */
      {cat:'[안꿋나는] 레이저 제모', type:'photo', script:'OK할 때까지 안 꿋나요', big:'남자 레이저 제모',
       title:'[OK 할 때까지 꿋!] 남성 레이저 제모', event:'[첫 시술 EVENT] 남자 인중 or 앞턱 제모 1회', price:100},
      {cat:'[안꿋나는] 레이저 제모', type:'photo', script:'여성 원장님 상주', big:'여자 레이저 제모',
       title:'[털 고민 이제 꿋!] 여성 레이저 제모 (여성 원장님 진료)', event:'[첫 시술 EVENT] 여자 인중 or 겨드랑이 제모 1회', price:100},

      /* ── 윤곽 리프팅 : 슈링크 / 엑쏘웨이브(케이온다) ── */
      {cat:'[갸름하게] 윤곽 리프팅', type:'promo', script:'높은 에너지로 강하고 오래가는', big:'슈링크 리프팅',
       title:'[턱선까지 또렷하게] 슈링크 집속초음파 리프팅', event:'[첫 시술 EVENT] 정품팁 슈링크 100샷', price:7900},
      {cat:'[갸름하게] 윤곽 리프팅', type:'promo', script:'극초단파로 비대칭까지 바로잡는', big:'엑쏘웨이브 리프팅',
       title:'[탄력은 더하고, 통증은 줄이고] 엑쏘웨이브(케이온다) 리프팅', event:'[첫 시술 EVENT] 엑쏘웨이브 리프팅 10kj(1만줄)', price:45000},

      /* ── 탄력 리프팅 : 볼뉴머 / 시크릿 ── */
      {cat:'[탄력UP!] 탄력 리프팅', type:'promo', script:'고출력, 열제어시스템 온도상승 디테일차이', big:'볼뉴머 리프팅',
       title:'[볼륨과 탄력을 한번에] 볼뉴머 고주파 리프팅', event:'[첫 시술 EVENT] 정품팁 볼뉴머 100샷', price:89000},
      {cat:'[탄력UP!] 탄력 리프팅', type:'promo', script:'진피층에 직접 열을 전달하는 RF 니들', big:'시크릿 리프팅',
       title:'[속부터 차오르는 탄력] 시크릿 RF 니들 리프팅', event:'[첫 시술 EVENT] 시크릿 RF 1부위', price:99000},

      /* ── 미백/색소/기미 : 큐 마스터 플러스 / 피코하이 / 바이오쎌 ── */
      {cat:'[투명하게] 미백/색소/기미', type:'promo', script:'고민마다 다른설계 1:1 프리미엄 맞춤', big:'듀얼 토닝',
       title:'큐 마스터 플러스 듀얼 토닝, 한 단계 더 섬세하게', event:'[첫 시술 EVENT] 듀얼 토닝 (맞춤 모드 2000샷)', price:36000},
      {cat:'[투명하게] 미백/색소/기미', type:'promo', script:'한 끗 차이 결과', big:'레이저 토닝',
       title:'큐 마스터 플러스 레이저 토닝, 맑아지는 피부톤', event:'[첫 시술 EVENT] 레이저 토닝 (1000샷)', price:100},
      {cat:'[투명하게] 미백/색소/기미', type:'promo', script:'피코초 파장으로 잡티만 정밀하게', big:'피코하이 레이저',
       title:'[잡티·기미 한 번에] 피코하이 피코 토닝', event:'[첫 시술 EVENT] 피코 토닝 2000샷', price:9900},
      {cat:'[투명하게] 미백/색소/기미', type:'promo', script:'피부 재생과 색소 완화를 동시에', big:'바이오쎌 관리',
       title:'[속부터 맑게] 바이오쎌 피부 재생 관리', event:'[EVENT] 바이오쎌 1회', price:30000},

      /* ── 여드름/모공/흉터 : 피코프락셀 / 시크릿 ── */
      {cat:'여드름/모공/흉터', type:'promo', script:'모공·흉터 동시 케어', big:'피코프락셀',
       title:'[모공·흉터 리셋] 피코프락셀', event:'[첫 시술 EVENT] 피코프락셀 1부위', price:99000},
      {cat:'여드름/모공/흉터', type:'ba', script:'진피까지 닿는 RF 니들로 흉터 재생', big:'시크릿 흉터 케어',
       title:'[패인 흉터까지] 시크릿 RF 니들 흉터·모공 케어', event:'[첫 시술 EVENT] 시크릿 RF 여드름·흉터 1부위', price:99000},

      /* ── 스킨부스터 : 퓨라셀 MTS ── */
      {cat:'[피부영양제] 스킨부스터', type:'photo', script:'MTS 방식으로 흡수율을 끌어올린', big:'퓨라셀 스킨부스터',
       title:'퓨라셀 MTS 스킨부스터, 피부 속 영양 공급', event:'[EVENT] 퓨라셀 MTS 스킨부스터 1회 + 모델링팩', price:20000},

      /* ── 다이어트 : 린다이어트 프로그램 ── */
      {cat:'[고농도, 개인 맞춤] 다이어트', type:'photo', script:'한의사가 끝까지 밀착 관리하는', big:'린다이어트',
       title:'[한의사 1:1 밀착관리] 린다이어트 프로그램', event:'[첫 상담 EVENT] 린다이어트 1개월 프로그램', price:0},
      {cat:'[고농도, 개인 맞춤] 다이어트', type:'photo', script:'체질에 맞춰 조제하는', big:'다이어트 환약',
       title:'[체질 맞춤 조제] 다이어트 환약', event:'[EVENT] 다이어트 환약 1개월분', price:0},

      /* ── 맞춤 한약 ── */
      {cat:'[체질부터] 맞춤 한약', type:'photo', script:'피부 면역력부터 다시 세우는', big:'피부 맞춤 한약',
       title:'[속부터 바꾸는] 피부 면역 맞춤 한약', event:'[EVENT] 맞춤 한약 1개월분', price:0},
    ]).filter(function(p){ return p.on!==false; });
    /* 신형 데이터(details)가 있으면 카드용 대표 이벤트·가격 파생 */
    products.forEach(function(p){
      if(p.details && p.details.length){
        var now=Date.now();
        var vis=p.details.filter(function(dt){
          if(dt.on===false) return false;
          if(dt.gid && p.groups && p.groups.length){
            var gg=p.groups.find(function(x){ return x.id===dt.gid; });
            if(gg && gg.on===false) return false;   /* 비공개 중분류 그룹의 상품은 숨김 */
          }
          if(dt.perType==='range'){
            try{
              if(dt.start && now<new Date(dt.start+'T00:00').getTime()) return false;
              if(dt.end && now>new Date(dt.end+'T23:59').getTime()) return false;
            }catch(e){}
          }
          return true;
        });
        p._vis=vis;
        if(vis.length){ p.event=vis[0].t||p.event; p.price=parseInt(vis[0].sale)||p.price; }
      }
    });
    window.__products=products;
    window.__openProdByName=function(name){ var t=products.find(function(x){return x.big===name;}); if(t && window.openDetail){ showView('detail'); openDetail(t); } };
    window.__openProdById=function(id, name){
      var t=products.find(function(x){return x.id===id;});
      if(!t && name) t=products.find(function(x){return x.big===name;});
      if(t && window.openDetail){ showView('detail'); openDetail(t); window.scrollTo({top:0,behavior:'smooth'}); }
    };

    const TEX=['img/tex-water-ripple.jpg','img/tex-gel-glitter.jpg','img/tex-cream-beam.jpg',
               'img/tex-gel-dome.jpg','img/tex-cream-gel.jpg','img/tex-petal-water.jpg'];
    const won = n => n.toLocaleString('ko-KR');
    products.forEach(function(p,i){ p._seed=i; });

    /* ===== 상태 ===== */
    let curCat='전체보기', curSort='recent', curQuery='', curPage=1;
    const PER_PAGE=16;  /* 4열 × 4행 */

    /* ===== 카테고리 렌더 ===== */
    const catNav=document.getElementById('catNav');
    function renderCats(){
      catNav.innerHTML=categories.map((c)=>{
        const dot = c===curCat ? '<span class="w-1.5 h-1.5 rounded-full bg-pink inline-block"></span>' : '';
        return `
        <button data-cat="${c}" class="catItem krhead w-full text-left px-4 py-3.5 border-b border-ink/10 text-[14px] break-keep transition hover:text-pinkstrong
          ${c===curCat?'cat-active':'text-ink/70'}" style="font-weight:${c===curCat?700:300}">
          <span class="inline-flex items-center gap-2">${c}${dot}</span>
        </button>`;
      }).join('');
      catNav.querySelectorAll('.catItem').forEach(b=>b.addEventListener('click',()=>{
        curCat=b.dataset.cat; curPage=1;
        document.getElementById('catToggleLabel').textContent=curCat;
        renderCats(); render();
        if(window.innerWidth<1024){ catNav.classList.add('hidden'); }
      }));
    }

    /* ===== 정렬탭 렌더 ===== */
    const sorts=[{k:'recent',l:'최근등록순'},{k:'high',l:'높은가격순'},{k:'low',l:'낮은가격순'}];
    const sortTabs=document.getElementById('catSortTabs');
    function renderSorts(){
      sortTabs.innerHTML=sorts.map(s=>`
        <button data-sort="${s.k}" class="sortItem px-4 py-1.5 rounded-full border transition
          ${s.k===curSort?'bg-ink text-white border-ink':'border-ink/15 text-ink/60 hover:border-ink/40'}">${s.l}</button>`).join('');
      sortTabs.querySelectorAll('.sortItem').forEach(b=>b.addEventListener('click',()=>{
        curSort=b.dataset.sort; curPage=1; renderSorts(); render();
      }));
    }

    /* ===== 배너(카드 상단 이미지) ===== */
    function bannerHTML(p,idx){ if(idx===undefined) idx=p._seed;
      /* 관리자에서 업로드한 실제 이미지가 있으면 우선 사용 */
      if(p.img){
        return `
        <div class="relative aspect-[4/3] rounded-2xl overflow-hidden">
          <img src="${p.img}" class="w-full h-full object-cover" alt="" loading="lazy">
          <div class="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent"></div>
          <div class="absolute left-0 right-0 bottom-0 px-3 py-3 text-center">
            ${p.script?`<p class="promo-script text-white/85 text-[10px] leading-tight break-keep">${p.script}</p>`:''}
            ${p.big?`<p class="promo-title text-white text-lg leading-tight break-keep">${p.big}</p>`:''}
          </div>
          <span class="absolute top-2.5 left-2.5 px-2 h-6 rounded-full bg-white/25 grid place-items-center"><span class="marcellus text-white text-[10px] tracking-[0.1em]">XXI</span></span>
        </div>`;
      }
      if(p.type==='ba'){
        return `
        <div class="relative aspect-[4/3] rounded-2xl overflow-hidden">
          <div class="grid grid-cols-2 h-full">
            <div class="relative"><img src="https://picsum.photos/seed/ba${idx}b/300/300" class="w-full h-full object-cover" alt=""><span class="absolute top-2 left-2 text-[9px] font-bold text-white bg-black/45 px-1.5 py-0.5 rounded">BEFORE</span></div>
            <div class="relative"><img src="https://picsum.photos/seed/ba${idx}a/300/300" class="w-full h-full object-cover" alt=""><span class="absolute top-2 right-2 text-[9px] font-bold text-white bg-black/45 px-1.5 py-0.5 rounded">AFTER</span></div>
          </div>
          <div class="absolute left-1/2 top-[42%] -translate-x-1/2 -translate-y-1/2 w-16 h-16 border-2 border-dashed border-white/85 rounded-full"></div>
          <div class="absolute left-0 right-0 bottom-0 bg-pinkstrong/92 px-3 py-2 text-center">
            <p class="promo-script text-white/80 text-[10px] leading-tight break-keep">${p.script}</p>
            <p class="promo-title text-white text-base leading-tight break-keep">${p.big}</p>
          </div>
        </div>`;
      }
      if(p.type==='photo'){
        return `
        <div class="relative aspect-[4/3] rounded-2xl overflow-hidden">
          <img src="${TEX[idx%TEX.length]}" class="w-full h-full object-cover" alt="">
          <div class="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent"></div>
          <div class="absolute left-0 right-0 bottom-0 px-3 py-3 text-center">
            <p class="promo-script text-white/85 text-[10px] leading-tight break-keep">${p.script}</p>
            <p class="promo-title text-white text-lg leading-tight break-keep">${p.big}</p>
          </div>
          <span class="absolute top-2.5 left-2.5 px-2 h-6 rounded-full bg-white/25 grid place-items-center"><span class="marcellus text-white text-[10px] tracking-[0.1em]">XXI</span></span>
        </div>`;
      }
      /* promo (기본) */
      return `
      <div class="relative aspect-[4/3] rounded-2xl overflow-hidden promo-grad">
        <img src="https://picsum.photos/seed/dev${idx}/300/300" class="absolute right-2 top-1/2 -translate-y-1/2 h-[72%] object-contain opacity-95 mix-blend-multiply" alt="">
        <span class="absolute top-2.5 left-2.5 px-2 h-6 rounded-full bg-white/55 grid place-items-center"><span class="marcellus text-pinkstrong text-[10px] tracking-[0.1em]">XXI</span></span>
        <div class="absolute left-3 right-3 top-[34%]">
          <p class="promo-script text-pinkstrong text-[12px] leading-tight break-keep">${p.script}</p>
        </div>
        <div class="absolute left-0 right-0 bottom-0 bg-pinkstrong px-3 py-2">
          <p class="promo-title text-white text-lg leading-tight break-keep">${p.big}</p>
        </div>
      </div>`;
    }

    /* ===== 카드 ===== */
    function cardHTML(p,idx){
      return `
      <a href="#" data-pid="${p._seed}" class="card-hover block group">
        ${bannerHTML(p,idx)}
        <div class="mt-3.5 px-0.5">
          <p class="krhead text-[11px] text-pinkstrong/80 break-keep" style="font-weight:500">${p.cat}</p>
          <h3 class="krhead text-[15px] leading-snug text-ink mt-1.5 break-keep" style="font-weight:700">${p.title}</h3>
          <p class="krhead text-[12px] text-muted mt-1.5 break-keep line-clamp-1" style="font-weight:300">${p.event}</p>
          <p class="text-right mt-3"><span class="krhead text-xl text-ink" style="font-weight:900">${p.price?won(p.price)+"원":"상담 후 안내"}</span> <span class="text-muted text-sm">${p.price?"~":""}</span></p>
        </div>
      </a>`;
    }

    /* ===== 필터·정렬·렌더 ===== */
    function getFiltered(){
      let list=products.filter(p=>curCat==='전체보기'||p.cat===curCat);
      if(curQuery.trim()){
        const q=curQuery.trim().toLowerCase();
        list=list.filter(p=>(p.title+p.event+p.cat+p.big).toLowerCase().includes(q));
      }
      if(curSort==='high') list=[...list].sort((a,b)=>b.price-a.price);
      else if(curSort==='low') list=[...list].sort((a,b)=>a.price-b.price);
      return list;
    }

    const grid=document.getElementById('catGrid');
    const empty=document.getElementById('catEmpty');
    const pager=document.getElementById('catPager');
    const resultMeta=document.getElementById('catResultMeta');

    function render(){
      const list=getFiltered();
      resultMeta.textContent=`총 ${list.length}개의 시술·이벤트`;
      const pages=Math.max(1,Math.ceil(list.length/PER_PAGE));
      if(curPage>pages) curPage=1;
      const pageItems=list.slice((curPage-1)*PER_PAGE, curPage*PER_PAGE);

      if(pageItems.length===0){ grid.innerHTML=''; empty.classList.remove('hidden'); }
      else { empty.classList.add('hidden'); grid.innerHTML=pageItems.map((p,i)=>cardHTML(p,(curPage-1)*PER_PAGE+i)).join('');
        grid.querySelectorAll('a[data-pid]').forEach(function(el){ el.addEventListener('click',function(e){ e.preventDefault(); var pid=+el.getAttribute('data-pid'); var pp=products.find(function(x){return x._seed===pid;}); if(window.openDetail) window.openDetail(pp); }); });
      }

      /* 페이지네이션 — 이미지처럼 최소 8개까지 노출 (샘플) */
      const shown=Math.max(pages,8);
      let html=`<button class="pgArrow w-9 h-9 rounded-full border border-ink/15 grid place-items-center text-ink/50 hover:border-pink hover:text-pinkstrong transition" data-go="prev"><iconify-icon icon="solar:alt-arrow-left-linear"></iconify-icon></button>`;
      for(let i=1;i<=shown;i++){
        html+=`<button class="pgNum w-9 h-9 rounded-full text-sm transition ${i===curPage?'bg-pinkstrong text-white':'text-ink/60 hover:text-pinkstrong'}" data-page="${i}">${i}</button>`;
      }
      html+=`<button class="pgArrow w-9 h-9 rounded-full border border-ink/15 grid place-items-center text-ink/50 hover:border-pink hover:text-pinkstrong transition" data-go="next"><iconify-icon icon="solar:alt-arrow-right-linear"></iconify-icon></button>`;
      pager.innerHTML=html;
      pager.querySelectorAll('.pgNum').forEach(b=>b.addEventListener('click',()=>{ curPage=+b.dataset.page; render(); window.scrollTo({top:document.getElementById('list').offsetTop-80,behavior:'smooth'}); }));
      pager.querySelectorAll('.pgArrow').forEach(b=>b.addEventListener('click',()=>{
        if(b.dataset.go==='prev'&&curPage>1) curPage--;
        if(b.dataset.go==='next'&&curPage<shown) curPage++;
        render(); window.scrollTo({top:document.getElementById('list').offsetTop-80,behavior:'smooth'});
      }));
    }

    /* 검색 */
    document.getElementById('catSearch').addEventListener('input',e=>{ curQuery=e.target.value; curPage=1; render(); });
    /* 모바일 카테고리 토글 */
    document.getElementById('catToggle').addEventListener('click',()=>document.getElementById('catNav').classList.toggle('hidden'));

    window.__catBanner = bannerHTML;
    renderCats(); renderSorts(); render();
  
})();
  
