/* ===== 시술전후 스크립트 — 독립 범위 ===== */
(function(){

    /* ===== compact header ===== */
    
    /* ===== 필터 (이미지 상단 탭) ===== */
    const filters=['전체 시술','다이어트','리프팅/탄력/윤곽','미백/기미/색소','여드름/모공/흉터','제모/문신제거','코/윤곽/실리프팅','콜라겐 볼륨침 CoVA'];

    /* ===== 전후 데이터 (이미지의 지점/분류/제목 그대로) =====
       layout: 'v'(상하) | 'h'(좌우)
       opts: uv(블루광 촬영) · circle('white'|'red') · arrow · privacy(눈가 가림) · after(배지) · chart(피지 분석 그래프) · dates[] */
    const items=[
      {loc:'연오재', cat:'미백/기미/색소',        title:['홍조개선 전후','볼 및 나비존 붉은 기 진정','화정'],            layout:'v', circle:'white', after:true,  dates:['26.02.06']},
      {loc:'연오재', cat:'여드름/모공/흉터',       title:['모공 개선 전후','코 모공 축소 개선','화정'],                    layout:'v', circle:'white', after:true,  dates:['26.02.06']},
      {loc:'연오재', cat:'미백/기미/색소',        title:['홍조개선 전후','안면홍조 얼굴 붉은기 피부 재생','고양 화정'], layout:'v', uv:true, circle:'white', after:true, dates:['26.02.06']},
      {loc:'연오재', cat:'여드름/모공/흉터',       title:['피지 감소 및 여드름 개선 전후','PTT와 제네시스 토닝을 활용한 모공·피지 관리','화정'], layout:'v', uv:true, circle:'white', chart:true, dates:['BEFORE : 26.01.28']},
      {loc:'연오재', cat:'여드름/모공/흉터',       title:['리프팅 시술 전후','엘리시스 엑소좀 모공 및 피지 개선','고양 화정'], layout:'v', circle:'white', privacy:true, chart:true, dates:['BEFORE : 26.01.28']},
      {loc:'연오재', cat:'리프팅/탄력/윤곽',       title:['이중턱 지방','윤곽 꿋 이펙터 전후 사진','고양 화정'],     layout:'h', circle:'red', arrow:true, privacy:true},
      {loc:'연오재', cat:'여드름/모공/흉터',       title:['새살침 전후','패인 흉터 치료','화정'],                          layout:'h', circle:'red', arrow:true, dates:['25.08.03 시술 전','26.05.30 10회 시술 후']},
      {loc:'부산 서면',  cat:'콜라겐 볼륨침 CoVA',     title:['콜라겐 볼륨침 전후','필러 없는 콜라겐 볼륨침으로 팔자주름 개선','부산 서면'], layout:'v', after:true, arrow:true, dates:['26.04.28']},
      {loc:'연오재', cat:'미백/기미/색소',        title:['색소 레이저 토닝 전후','흑자 · 잡티 병행 치료','화정'],          layout:'h', uv:true, circle:'white'},
    ];

    /* 관리자 등록 전후사진이 있으면 그것만 사용 (없으면 샘플 유지) */
    var stored=(window.KK? KK.get('ba', []): []).filter(function(x){return x.on!==false;});
    var BLUR = window.KK ? !!KK.get('baBlur', false) : false;
    if(stored.length){
      items.length=0;
      stored.forEach(function(s){
        items.push({loc:s.loc||'연오재', cat:s.cat||'기타', title:[s.title||'', s.sub||'', s.loc||'화정'].filter(Boolean), layout:'v', imgB:s.imgB||'', imgA:s.imgA||'', dates:s.date?[s.date]:[]});
      });
      filters.splice(1);
      stored.forEach(function(s){ if(s.cat && filters.indexOf(s.cat)<0) filters.push(s.cat); });
    }

    items.forEach(function(c,i){ c._seed=i; });

    /* ===== 상태 ===== */
    let curFilter='전체 시술', curPage=1;
    const PER_PAGE=9;

    /* ===== 필터탭 렌더 ===== */
    const filterTabs=document.getElementById('baFilterTabs');
    function renderFilters(){
      filterTabs.innerHTML=filters.map(f=>`
        <button data-f="${f}" class="filterItem px-5 py-2.5 rounded-full border text-sm transition break-keep
          ${f===curFilter?'bg-ink text-white border-ink':'bg-white border-ink/15 text-ink/65 hover:border-ink/40'}">${f}</button>`).join('');
      filterTabs.querySelectorAll('.filterItem').forEach(b=>b.addEventListener('click',()=>{
        curFilter=b.dataset.f; curPage=1; renderFilters(); render();
      }));
    }

    /* ===== 작은 피지 분석 그래프 ===== */
    function chartStrip(label){
      const bars=[17,18,11,19,8].map((v,i)=>{
        const h=10+v; const x=58+i*46;
        return `<rect x="${x}" y="${64-h}" width="14" height="${h}" rx="2" fill="#9bbf3a"/><rect x="${x+16}" y="${64-h*0.55}" width="14" height="${h*0.55}" rx="2" fill="#d9e8a8"/><text x="${x+15}" y="${60-h}" font-size="9" fill="#7a7a7a" text-anchor="middle">${v}</text>`;
      }).join('');
      return `
      <div class="bg-white px-3 pt-2 pb-1.5 border-t border-ink/5">
        <svg viewBox="0 0 320 66" class="w-full h-[52px]">
          <circle cx="26" cy="33" r="20" fill="#f1ede7"/><text x="26" y="37" font-size="11" fill="#b6ada3" text-anchor="middle">피지</text>
          ${bars}
          <text x="318" y="60" font-size="9" fill="#8a857e" text-anchor="end">${label||''}</text>
        </svg>
      </div>`;
    }

    /* ===== 전후 이미지 영역 ===== */
    function baImage(c,idx){ idx=c._seed;
      /* 관리자 업로드 실제 전후사진 */
      if(c.imgB || c.imgA){
        var blurCss = BLUR ? 'filter:blur(14px);transform:scale(1.08);' : '';
        var dateLb = (c.dates&&c.dates[0]) ? '<span class="absolute top-2 right-2 text-[10px] font-medium text-white drop-shadow z-10">'+c.dates[0]+'</span>' : '';
        return '<div class="relative aspect-[4/3] overflow-hidden">'
          +'<div class="grid grid-rows-2 h-full">'
          +'<div class="relative overflow-hidden"><img src="'+(c.imgB||c.imgA)+'" class="w-full h-full object-cover" style="'+blurCss+'" alt=""><span class="absolute top-2 left-2 text-[10px] font-bold text-white bg-black/50 px-2 py-0.5 rounded z-10">BEFORE</span></div>'
          +'<div class="relative overflow-hidden"><img src="'+(c.imgA||c.imgB)+'" class="w-full h-full object-cover" style="'+blurCss+'" alt=""><span class="absolute bottom-2 left-2 text-[10px] font-bold text-white bg-black/50 px-2 py-0.5 rounded z-10">AFTER</span></div>'
          +'</div>'
          +dateLb
          +'<span class="absolute bottom-2 right-2 px-2.5 h-7 rounded-full bg-white/70 grid place-items-center shadow z-10"><span class="marcellus text-pinkstrong text-[11px] tracking-[0.1em]">XXI</span></span>'
        +'</div>';
      }
      const uv = c.uv ? 'uv' : '';
      const wm = `<span class="absolute bottom-2 right-2 px-2.5 h-7 rounded-full bg-white/70 grid place-items-center shadow"><span class="marcellus text-pinkstrong text-[11px] tracking-[0.1em]">XXI</span></span>`;
      const circleColor = c.circle==='red' ? 'border-red-500' : 'border-white/85';
      const circle = c.circle ? `<span class="absolute top-1/2 left-1/4 -translate-x-1/2 -translate-y-1/2 w-16 h-16 border-2 border-dashed ${circleColor} rounded-full"></span><span class="absolute top-1/2 left-3/4 -translate-x-1/2 -translate-y-1/2 w-16 h-16 border-2 border-dashed ${circleColor} rounded-full"></span>` : '';
      const arrow = c.arrow ? `<span class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-red-500 grid place-items-center shadow-lg"><iconify-icon icon="solar:arrow-right-bold" class="text-white" width="18"></iconify-icon></span>` : '';
      const privacy = c.privacy ? `<span class="absolute top-[30%] left-[8%] w-[34%] h-[10%] bg-black"></span><span class="absolute top-[30%] right-[8%] w-[34%] h-[10%] bg-black"></span>` : '';

      let imgs;
      if(c.layout==='h'){
        imgs = `<div class="grid grid-cols-2 h-full">
          <img src="https://picsum.photos/seed/baL${idx}/360/360" class="w-full h-full object-cover ${uv}" alt="">
          <img src="https://picsum.photos/seed/baR${idx}/360/360" class="w-full h-full object-cover ${uv}" alt="">
        </div>`;
      } else {
        imgs = `<div class="grid grid-rows-2 h-full">
          <img src="https://picsum.photos/seed/baT${idx}/480/240" class="w-full h-full object-cover ${uv}" alt="">
          <img src="https://picsum.photos/seed/baB${idx}/480/240" class="w-full h-full object-cover ${uv}" alt="">
        </div>`;
      }

      // 날짜 라벨
      let dateLabels='';
      if(c.dates && c.dates.length===1){
        dateLabels = `<span class="absolute top-2 left-2 text-[10px] font-medium text-white drop-shadow">${c.dates[0]}</span>`;
      } else if(c.dates && c.dates.length>=2){
        dateLabels = `<span class="absolute top-2 left-2 text-[10px] font-medium text-white drop-shadow leading-tight">${c.dates[0]}<br><b>BEFORE</b></span>
                      <span class="absolute top-2 right-2 text-[10px] font-medium text-white drop-shadow text-right leading-tight">${c.dates[1]}<br><b>AFTER</b></span>`;
      }
      // AFTER 배지 (가로 밴드 중앙)
      const afterBadge = c.after ? `<span class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-sm font-extrabold text-ink bg-white/0 z-20">AFTER</span>` : '';

      return `
      <div class="relative aspect-[4/3] overflow-hidden">
        ${imgs}
        ${c.uv?'<div class="absolute inset-0 bg-blue-900/10"></div>':''}
        ${privacy}
        ${circle}
        ${arrow}
        ${dateLabels}
        ${afterBadge}
        ${wm}
      </div>
      ${c.chart?chartStrip(c.dates&&c.dates[0]):''}`;
    }

    /* ===== 카드 ===== */
    function cardHTML(c,idx){
      const titleHTML = c.title.map((t,i)=> i===0
        ? `<span>${t}</span>`
        : `<span class="text-ink/30 mx-1.5">|</span><span>${t}</span>`).join('');
      return `
      <a href="#" data-bid="${c._seed}" class="card-hover block bg-white rounded-2xl overflow-hidden border border-ink/5 shadow-[0_4px_20px_rgba(47,52,58,0.06)] group">
        ${baImage(c,idx)}
        <div class="p-5">
          <div class="flex items-center gap-2 mb-3">
            <span class="krhead text-[11px] text-ink/60 bg-ink/5 px-2.5 py-1 rounded-full" style="font-weight:500">${c.loc}</span>
            <span class="krhead text-[11px] text-pinkstrong bg-pinksoft/55 px-2.5 py-1 rounded-full" style="font-weight:500">${c.cat}</span>
          </div>
          <h3 class="ba-title krhead text-[15px] leading-relaxed text-ink break-keep transition-colors" style="font-weight:700">${titleHTML}</h3>
        </div>
      </a>`;
    }

    /* ===== 렌더 ===== */
    const grid=document.getElementById('baGrid');
    const empty=document.getElementById('baEmpty');
    const pager=document.getElementById('baPager');
    const resultMeta=document.getElementById('baResultMeta');

    function getFiltered(){
      return items.filter(c=>curFilter==='전체 시술'||c.cat===curFilter);
    }

    function render(){
      const list=getFiltered();
      resultMeta.textContent=`총 ${list.length}개의 전후사례`;
      const pages=Math.max(1,Math.ceil(list.length/PER_PAGE));
      if(curPage>pages) curPage=1;
      const pageItems=list.slice((curPage-1)*PER_PAGE, curPage*PER_PAGE);

      if(pageItems.length===0){ grid.innerHTML=''; empty.classList.remove('hidden'); }
      else { empty.classList.add('hidden'); grid.innerHTML=pageItems.map((c,i)=>cardHTML(c,(curPage-1)*PER_PAGE+i)).join('');
        grid.querySelectorAll('a[data-bid]').forEach(function(el){ el.addEventListener('click',function(e){ e.preventDefault(); var bid=+el.getAttribute('data-bid'); openBADetail(items.find(function(x){return x._seed===bid;})); }); });
      }

      /* 페이지네이션 — 이미지처럼 최소 5개 노출 (샘플) */
      const shown=Math.max(pages,5);
      let html=`<button class="pgArrow w-9 h-9 rounded-full border border-ink/15 grid place-items-center text-ink/50 hover:border-pink hover:text-pinkstrong transition" data-go="prev"><iconify-icon icon="solar:alt-arrow-left-linear"></iconify-icon></button>`;
      for(let i=1;i<=shown;i++){
        html+=`<button class="pgNum w-9 h-9 rounded-full text-sm transition ${i===curPage?'bg-pinkstrong text-white':'text-ink/60 hover:text-pinkstrong'}" data-page="${i}">${i}</button>`;
      }
      html+=`<button class="pgArrow w-9 h-9 rounded-full border border-ink/15 grid place-items-center text-ink/50 hover:border-pink hover:text-pinkstrong transition" data-go="next"><iconify-icon icon="solar:alt-arrow-right-linear"></iconify-icon></button>`;
      pager.innerHTML=html;
      pager.querySelectorAll('.pgNum').forEach(b=>b.addEventListener('click',()=>{ curPage=+b.dataset.page; render(); window.scrollTo({top:document.getElementById('ba-list').offsetTop-80,behavior:'smooth'}); }));
      pager.querySelectorAll('.pgArrow').forEach(b=>b.addEventListener('click',()=>{
        if(b.dataset.go==='prev'&&curPage>1) curPage--;
        if(b.dataset.go==='next'&&curPage<shown) curPage++;
        render(); window.scrollTo({top:document.getElementById('ba-list').offsetTop-80,behavior:'smooth'});
      }));
    }


    /* ===== 전후 상세 ===== */
    var BA_DISCLAIMERS=[
      '해당 전후사진은 동일 인물의 촬영 결과이며, 보정 없이 제공되었습니다.',
      '시술 결과는 개인에 따라 차이가 있을 수 있으며, 홍조, 멍, 붓기 등의 부작용이 발생할 수 있습니다.',
      '숙련된 의료진에 의해 시술받을 것을 권장합니다.'
    ];
    var BA_DETAILS={
      '홍조개선 전후|볼 및 나비존 붉은 기 진정|화정':{
        sections:[
          {n:'1) 안면홍조의 발생 원인', body:'안면홍조는 피부 장벽이 무너지면서 진피층의 미세혈관이 확장된 후 제때 수축하지 못해 발생하는 만성 질환입니다.\n한의학에서는 이를 체내 기혈 순환의 불균형으로 인해 상체와 얼굴로 열이 쏠리는 상열 현상으로 진단합니다.'},
          {n:'2) 치료 전 피부 상태', body:'내원 당시 환자는 양측 볼과 코 주변 나비존을 중심으로 광범위한 홍반과 붉은 기가 관찰되었습니다.\n표피가 얇아져 작은 자극에도 쉽게 열감이 오르고 따가움을 느끼는 전형적인 민감성 피부 상태였습니다.'},
          {n:'3) 한방 맞춤 치료 전략', body:'저희 클리닉에서는 진피층의 염증과 혈관 확장을 가라앉히는 소염 약침을 환부에 직접 시술하였습니다.\n이와 함께 피부 세포 재생을 촉진하는 침 치료를 병행하여 무너진 피부 장벽을 탄탄하게 재건하는 데 집중했습니다.'},
          {n:'4) 치료 후 변화 결과', body:'치료 후 볼과 나비존의 붉은 기가 확연히 진정되면서 얼룩덜룩했던 피부 톤이 맑고 균일해졌습니다.\n만성적으로 겪던 안면 열감과 당김 증상이 소실되었으며, 피부 장벽이 회복되면서 자극에 쉽게 붉어지지 않는 홍조 개선 전후 결과를 확인했습니다.'},
          {n:'5) 시술 정보', body:'시술명 : 한방 안면홍조 치료 (피부 재생 침 및 약침 치료)\n시술부위 : 양측 볼 및 코 주변 나비존 피부 전반'}
        ]
      }
    };
    function genericBADetail(c){
      var topic=(c.title[0]||'').replace(' 전후','').replace(' 전/후','');
      var area=c.title[2]||'해당 부위';
      return { sections:[
        {n:'1) 고민의 원인', body:topic+'은(는) 피부 상태와 생활 습관 등 복합적인 요인으로 나타날 수 있습니다.\n정확한 진단을 통해 원인을 파악하고 그에 맞는 치료 계획을 수립합니다.'},
        {n:'2) 치료 전 피부 상태', body:'내원 당시 '+area+'를 중심으로 개선이 필요한 상태가 관찰되었습니다.\n개인의 피부 특성과 민감도를 고려해 시술 강도를 설계했습니다.'},
        {n:'3) 맞춤 치료 전략', body:'저희 클리닉에서는 '+c.cat+' 관점에서 환부에 맞춘 시술을 진행했습니다.\n자극을 최소화하면서 효과를 높이는 단계별 프로토콜을 적용했습니다.'},
        {n:'4) 치료 후 변화 결과', body:'시술 후 '+area+'의 상태가 눈에 띄게 개선되었습니다.\n전후 사진을 통해 변화 결과를 확인했습니다.'},
        {n:'5) 시술 정보', body:'시술명 : '+(c.title[1]||c.title[0])+'\n시술부위 : '+area}
      ]};
    }
    function baDetailOf(c){ return BA_DETAILS[c.title.join('|')] || genericBADetail(c); }

    window.openBADetail=function(c){
      var d=baDetailOf(c);
      var caption=c.title[0];
      var titleHTML=c.title.map(function(t,i){ return i===0 ? '<span>'+t+'</span>' : '<span class="text-ink/30 mx-1.5">|</span><span>'+t+'</span>'; }).join('');
      var img='<p class="krhead text-xl text-ink mb-2" style="font-weight:900">'+caption+'</p><div class="rounded-2xl overflow-hidden border border-ink/8">'+baImage(c)+'</div>';
      var html=''+
        '<div class="krhead flex items-center gap-2 text-sm text-muted mb-4" style="font-weight:400">'+
          '<button onclick="showView(\'home\')" class="hover:text-pinkstrong">홈</button><span>/</span>'+
          '<button onclick="showView(\'ba\')" class="hover:text-pinkstrong">전후사진</button><span>/</span>'+
          '<span class="text-ink/70">'+c.loc+'</span>'+
        '</div>'+
        '<h1 class="krhead text-2xl text-ink break-keep" style="font-weight:700">'+titleHTML+'</h1>'+
        '<div class="flex items-center gap-2 mt-3 mb-7">'+
          '<span class="krhead text-[11px] text-ink/60 bg-ink/5 px-2.5 py-1 rounded-full" style="font-weight:500">'+c.loc+'</span>'+
          '<span class="krhead text-[11px] text-pinkstrong bg-pinksoft/55 px-2.5 py-1 rounded-full" style="font-weight:500">'+c.cat+'</span>'+
        '</div>'+
        '<div class="max-w-3xl">'+img+'</div>'+
        '<div class="max-w-3xl rounded-xl bg-ink/[0.03] border border-ink/8 p-5 my-8">'+
          BA_DISCLAIMERS.map(function(t){ return '<p class="krhead text-[13px] text-ink/60 break-keep leading-relaxed" style="font-weight:300">※ '+t+'</p>'; }).join('')+
        '</div>'+
        '<div class="max-w-3xl space-y-8">'+
          d.sections.map(function(sec){ return '<div><p class="krhead text-ink mb-2" style="font-weight:700">'+sec.n+'</p><p class="krhead text-[14px] text-ink/70 leading-relaxed whitespace-pre-line break-keep" style="font-weight:300">'+sec.body+'</p></div>'; }).join('')+
        '</div>'+
        '<div class="max-w-3xl mt-12">'+img+'</div>'+
        '<div class="max-w-3xl mt-10"><button onclick="showView(\'ba\')" class="krhead px-6 py-3 rounded-full border border-ink/15 text-sm hover:bg-ink hover:text-white transition flex items-center gap-2" style="font-weight:400"><iconify-icon icon="solar:alt-arrow-left-linear"></iconify-icon> 전후사진 목록으로</button></div>';
      document.getElementById('baDetailBody').innerHTML=html;
      showView('badetail');
    };

    /* ===== 홈 화면의 「BEFORE & AFTER」 카드에서 바로 열기 =====
       홈 목록과 이 화면의 items 는 같은 원본(KK 'ba')을 같은 순서로 쓰므로 index 로 맞춥니다.
       해당 항목을 못 찾으면 전후사진 목록 화면이라도 열어 줍니다. */
    window.__goBA = function(i){
      var c = items.find(function(x){ return x._seed===Number(i); });
      if(c && window.openBADetail){ openBADetail(c); try{ window.scrollTo({top:0,behavior:'smooth'}); }catch(e){} return; }
      if(window.showView) showView('ba');
    };

    renderFilters(); render();

})();
  
