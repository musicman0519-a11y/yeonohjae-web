/* ===== 시술 상세 스크립트 — 독립 범위 ===== */
(function(){
    /* ===== 시술 상세 ===== */
    var DETAIL_PARTS=['전체','얼굴/목','상체','하체','기타'];
    function dwon(n){ return n.toLocaleString('ko-KR'); }
    /* 권종(이용 조건) 라벨 — 관리자 「카테고리 관리 > 권종 카테고리」에서 관리 */
    var FRONT_DAYS=['일','월','화','수','목','금','토'];
    function __voucherOf(id){
      if(!id) return '';
      try{
        var list=(window.KK && KK.get('voucherTypes', [])) || [];
        var v=list.find(function(x){ return x.id===id; });
        if(!v || v.on===false) return '';
        var d=v.days||[], base='';
        if(d.length && d.length<7){
          var wk=[1,2,3,4,5], isWeek=wk.every(function(x){return d.indexOf(x)>=0;}) && d.indexOf(6)<0;
          if(isWeek && d.indexOf(0)>=0) base='평일+일요일';
          else if(isWeek && d.length===5) base='평일';
          else if(d.length===1) base=FRONT_DAYS[d[0]]+'요일';
          else base=d.slice().sort().map(function(x){ return FRONT_DAYS[x]; }).join('');
        }
        var hr=v.before ? (v.before+'시 이전') : '';
        var cond=[base,hr].filter(Boolean).join(' ');
        if(!cond) return v.name;
        var full=cond+' 한정';
        return (v.name.indexOf(cond)>=0) ? v.name : (v.name+' · '+full);
      }catch(e){ return ''; }
    }
    /* 추천 시술 원본 상품 찾기 (썸네일용) */
    function __recProd(r){
      try{
        var list=(window.KK && KK.get('products', [])) || [];
        return list.find(function(x){ return (r.id && x.id===r.id) || (r.name && (x.big===r.name || x.title===r.name)); }) || null;
      }catch(e){ return null; }
    }

    /* 제모 등 일부 시술은 레퍼런스 그대로의 상세 콘텐츠 */
    var DETAILS={
      '[OK 할 때까지 꿋!] 남성 레이저 제모':{
        desc:'아침에 면도해도 저녁이면 다시 올라오는 수염이 고민이신가요?\n\n남성 레이저 제모는 반복적인 면도 부담을 줄이고 보다 깔끔한 피부 관리를 원하는 분들을 위한 시술입니다.\n수염뿐 아니라 다양한 부위의 체모 관리가 가능하며, 개인의 털 상태와 피부 특성을 고려해 진행합니다.\n\n모든 제모 시술은 5회 패키지를 기준으로 운영되며, 1회 시술 비용은 5회 패키지 가격의 약 34.5%로 책정됩니다.\n*VAT 별도',
        options:[
          {name:'[첫 시술 EVENT] 남자 인중 or 앞턱 제모 1회', sub:'정품 악센토로 확실한 효과, 철저한 냉각으로 통증 감소! 쿨러 O 마취X', price:100, orig:199, off:'49%', part:'얼굴/목'},
          {name:'[EVENT] 남자 겨드랑이 제모 1년 무제한', sub:'시술 주기 3주 간격이라면 최대 17번, 4주 간격이라면 12번 받을 수 있는 1년권. 제모는 최소 주기 21일로, 안전상 하루도 당겨 받을 수 없습니다.', price:59000, orig:100000, off:'41%', part:'상체'},
          {name:'[EVENT] 남자 앞턱 or 인중 1년 무제한', price:89000, orig:150000, off:'40%', part:'얼굴/목'},
          {name:'[EVENT] 남자 앞턱 + 인중 제모 1년 무제한', price:159000, orig:310000, off:'48%', part:'얼굴/목'},
          {name:'[EVENT] 남자 얼굴전체(볼+구렛+인중+앞턱+앞목+턱라인 / 이마 제외) 제모 1년 무제한', sub:'*남성 쉐이빙 라인 전체 (눈 아래) 입니다.', price:269000, orig:530000, off:'49%', part:'얼굴/목'},
          {name:'[EVENT] 남자 브라질리언 + 항문 제모 1년 무제한', price:419000, orig:809000, off:'48%', part:'기타'},
          {name:'[EVENT] 남자 다리전체 제모 1년 무제한', sub:'허벅지 + 무릎 + 종아리 + 발등 + 발가락 포함', price:939000, orig:1850000, off:'49%', part:'하체'}
        ],
        introTitle:'제모',
        question:'10회 넘게 제모를 받았지만 효과가 없었거나\n통증, 피부 자극 때문에 제모 시술을 망설였던 경험 있으신가요?',
        emphasis:'저희 클리닉은 정확한 분석, 맞춤 시술을 진행하며\n고객이 시술 부위를 확인하고\nOK! 해야 시술이 종료됩니다.',
        features:['신경쓰이는 부위 확인 후 시술','고객과 소통하며 실시간으로 조율','굵은 털, 가는 털, 밝은 털 맞춤 시술','매회 출력·쿨링·파장을 세심하게 조정','제모에 특화된 악센토'],
        precisionPhoto:true,
        precisionIntro:'털의 굵기·색·밀도, 피부톤, 민감도까지 레이저의 작용 원리를 기반으로 정밀하게 계산하고 적용합니다.',
        precision:[
          {label:'굵은 털', problem:'짧은 펄스로 시술 시, 에너지가 급격히 흡수돼 표피 손상 위험', solution:'긴 펄스를 적용, 천천히 깊게 열 전달'},
          {label:'가는 털, 밝은 털', problem:'멜라닌 함량이 적어 레이저 반응이 약함', solution:'반복 조사 or 고출력 세팅'},
          {label:'털이 빽빽한 부위', problem:'열이 과하게 축적되기 쉬운 부위', solution:'분산 조사로 과열 방지'},
          {label:'민감성 피부', problem:'피부 자체의 멜라닌까지 빛을 받아 색소침착 위험', solution:'저자극 모드·충분한 쿨링으로 보호'}
        ],
        aftercare:[
          '시술을 받는 당일 또는 하루 전, 시술할 부위의 털을 면도해 주시는 것이 좋습니다.',
          '시술 후 일주일 정도는 음주, 흡연, 사우나 이용 및 과격한 운동을 삼가 주십시오.',
          '시술을 받고 나면 붉어짐, 열감, 약간의 통증이 2~3시간 가량 나타날 수 있습니다.'
        ]
      },
      '[털 고민 이제 꿋!] 여성 레이저 제모 (여성 원장님 진료)':{
        desc:'반복되는 면도와 왁싱이 번거롭고, 자극으로 인한 색소침착이 걱정되신가요?\n\n여성 레이저 제모는 여성 원장님이 직접 진료·시술하여 민감한 부위도 편안하게 케어합니다.\n개인의 털 상태와 피부 특성을 고려해 출력과 파장을 맞춤 조정합니다.\n\n모든 제모 시술은 5회 패키지를 기준으로 운영되며, 1회 시술 비용은 5회 패키지 가격의 약 34.5%로 책정됩니다.\n*VAT 별도',
        options:[
          {name:'[첫 시술 EVENT] 여자 인중 or 겨드랑이 제모 1회', sub:'여성 원장님 진료, 철저한 냉각으로 통증 감소! 쿨러 O 마취X', price:100, orig:199, off:'49%', part:'얼굴/목'},
          {name:'[EVENT] 여자 겨드랑이 제모 1년 무제한', price:55000, orig:100000, off:'45%', part:'상체'},
          {name:'[EVENT] 여자 얼굴 전체 제모 1년 무제한', sub:'볼+구렛+인중+앞턱+턱라인 (이마 제외)', price:249000, orig:490000, off:'49%', part:'얼굴/목'},
          {name:'[EVENT] 여자 브라질리언 제모 1년 무제한', price:299000, orig:580000, off:'48%', part:'기타'},
          {name:'[EVENT] 여자 다리전체 제모 1년 무제한', sub:'허벅지 + 무릎 + 종아리 + 발등 + 발가락 포함', price:899000, orig:1750000, off:'49%', part:'하체'}
        ],
        introTitle:'제모',
        question:'10회 넘게 제모를 받았지만 효과가 없었거나\n통증, 피부 자극 때문에 제모 시술을 망설였던 경험 있으신가요?',
        emphasis:'저희 클리닉은 정확한 분석, 맞춤 시술을 진행하며\n고객이 시술 부위를 확인하고\nOK! 해야 시술이 종료됩니다.',
        features:['여성 원장님 직접 진료','신경쓰이는 부위 확인 후 시술','굵은 털, 가는 털, 밝은 털 맞춤 시술','매회 출력·쿨링·파장을 세심하게 조정','제모에 특화된 악센토'],
        precisionPhoto:true,
        precisionIntro:'털의 굵기·색·밀도, 피부톤, 민감도까지 레이저의 작용 원리를 기반으로 정밀하게 계산하고 적용합니다.',
        precision:[
          {label:'굵은 털', problem:'짧은 펄스로 시술 시, 에너지가 급격히 흡수돼 표피 손상 위험', solution:'긴 펄스를 적용, 천천히 깊게 열 전달'},
          {label:'가는 털, 밝은 털', problem:'멜라닌 함량이 적어 레이저 반응이 약함', solution:'반복 조사 or 고출력 세팅'},
          {label:'민감성 피부', problem:'피부 자체의 멜라닌까지 빛을 받아 색소침착 위험', solution:'저자극 모드·충분한 쿨링으로 보호'}
        ],
        aftercare:[
          '시술을 받는 당일 또는 하루 전, 시술할 부위의 털을 면도해 주시는 것이 좋습니다.',
          '시술 후 일주일 정도는 음주, 흡연, 사우나 이용 및 과격한 운동을 삼가 주십시오.',
          '시술을 받고 나면 붉어짐, 열감, 약간의 통증이 2~3시간 가량 나타날 수 있습니다.'
        ]
      }
    };

    /* 그 외 시술은 데이터 기반의 일반 상세를 자동 생성 */
    function genericDetail(p){
      var base=p.price||10000;
      return {
        desc:p.title+' 안내입니다.\n\n'+(p.event||'')+' 구성으로 진행되며, 개인의 상태와 피부 특성을 고려해 맞춤으로 진행합니다.\n결과는 시술과 사후관리의 합이며, 충분한 상담 후 진행해 드립니다.\n*VAT 별도',
        options:[
          {name:(p.event||'1회 시술'), sub:'첫 시술 특별가', price:base, orig:Math.round(base*1.9), off:'47%', part:'전체'},
          {name:'3회 패키지', price:Math.round(base*3*0.85), orig:base*3, off:'15%', part:'전체'},
          {name:'5회 패키지', sub:'가장 인기있는 구성', price:Math.round(base*5*0.8), orig:base*5, off:'20%', part:'전체'}
        ],
        introTitle:'맞춤 케어',
        question:'반복되는 피부 고민, 효과와 안전 사이에서 망설이고 계신가요?',
        emphasis:'저희 클리닉은 정확한 분석과 맞춤 시술로,\n고객이 충분히 확인하고 만족해야 마무리합니다.',
        features:['1:1 맞춤 설계','정품·정량 원칙','자극 최소화 케어','꼼꼼한 사후관리'],
        precisionPhoto:false, precisionIntro:'', precision:[],
        aftercare:[
          '시술 후 일주일 정도는 음주, 흡연, 사우나 및 과격한 운동을 삼가 주세요.',
          '시술 부위는 자외선 차단에 특히 신경 써 주세요.',
          '붉어짐·열감 등은 보통 수 시간 내 가라앉습니다. 이상 시 내원해 주세요.'
        ]
      };
    }
    /* 공개 + 기간이 유효한 상세 상품만 (카테고리 화면을 거치지 않고 바로 들어온 경우도 대비) */
    function visOf(p){
      if(p._vis) return p._vis;
      var now=Date.now();
      return (p.details||[]).filter(function(dt){
        if(dt.on===false) return false;
        if(dt.gid && p.groups && p.groups.length){
          var gg=p.groups.find(function(x){ return x.id===dt.gid; });
          if(gg && gg.on===false) return false;   /* 비공개 중분류 그룹의 상품은 숨김 */
        }
        if(dt.perType==='range'){
          try{
            if(dt.start && now < new Date(dt.start+'T00:00').getTime()) return false;
            if(dt.end   && now > new Date(dt.end+'T23:59').getTime())   return false;
          }catch(e){}
        }
        return true;
      });
    }
    function realDetail(p){
      var g=genericDetail(p);
      var vis=visOf(p);
      return {
        desc: (p.desc&&p.desc.trim()) ? p.desc : g.desc,
        options: vis.map(function(dt){
          var sub=[];
          if(dt.perType==='range' && (dt.start||dt.end)) sub.push('기간 '+(dt.start||'')+' ~ '+(dt.end||''));
          var vc=__voucherOf(dt.voucher);
          if(vc) sub.push(vc);
          if(dt.avail) sub.push(dt.avail);
          if(dt.notice) sub.push(dt.notice);
          var price=parseInt(dt.sale)||parseInt(dt.price)||0, orig=parseInt(dt.price)||0;
          var off=(orig>price&&orig>0)? Math.round((1-price/orig)*100)+'%':'';
          var gr=null;
          if(dt.gid && p.groups && p.groups.length){
            var gg=p.groups.find(function(x){ return x.id===dt.gid; });
            if(gg && gg.on!==false && gg.name) gr=gg.name;
          }
          return {name:dt.t||'', sub:sub.join(' · '), price:price, orig:(orig>price?orig:0), off:off, part:'전체', group:gr};
        }),
        bodies: vis.filter(function(dt){ return dt.body && String(dt.body).replace(/<[^>]*>/g,'').trim().length || String(dt.body||'').indexOf('<img')>=0; }),
        youtube: p.youtube||'',
        stepsTitle:p.stepsTitle||'', steps:p.steps||[], basic:p.basic||null,
        mainBody:p.body||'',
        points:p.points||[], qna:p.qna||[],
        recs:(p.recs||[]).map(function(r){
          if(r && typeof r === 'object') return {id:r.id||'', name:r.name||'', note:r.note||''};
          return {id:'', name:String(r||''), note:''};
        }),
        introTitle:g.introTitle, question:g.question, emphasis:g.emphasis,
        features:g.features, precisionPhoto:false, precisionIntro:'', precision:[],
        aftercare:(p.cautions&&p.cautions.length)? p.cautions : g.aftercare
      };
    }
    function detailOf(p){ if(p.details && p.details.length) return realDetail(p); return DETAILS[p.title] || genericDetail(p); }

    var detState={ p:null, q:'', sort:'none', part:'전체' };

    function optHTML(o){
      return '<div class="rounded-xl border border-ink/10 p-4 flex items-start justify-between gap-3">'+
        '<div class="min-w-0">'+
          '<p class="krhead text-[14px] text-ink leading-snug break-keep" style="font-weight:700">'+o.name+'</p>'+
          (o.sub?'<p class="krhead text-[12px] text-muted mt-1 break-keep" style="font-weight:300">'+o.sub+'</p>':'')+
          '<p class="mt-2 flex items-baseline gap-2 flex-wrap">'+
            '<span class="krhead text-lg text-ink" style="font-weight:900">'+dwon(o.price)+'원</span>'+
            (o.orig?'<span class="text-xs text-muted line-through">'+dwon(o.orig)+'원</span>':'')+
            (o.off?'<span class="text-[11px] text-pinkstrong bg-pinksoft/50 rounded-full px-2 py-0.5">'+o.off+'</span>':'')+
          '</p>'+
        '</div>'+
        '<button onclick="alert(\'데모: 장바구니에 담았습니다.\')" class="krhead shrink-0 px-4 py-2 rounded-lg border border-ink/15 text-sm text-ink/70 hover:border-pink hover:text-pinkstrong transition" style="font-weight:500">담기</button>'+
      '</div>';
    }

    function renderOptions(){
      var d=detailOf(detState.p);
      var list=d.options.slice();
      if(detState.part!=='전체') list=list.filter(function(o){ return (o.part||'전체')===detState.part; });
      if(detState.q.trim()){ var q=detState.q.trim().toLowerCase(); list=list.filter(function(o){ return (o.name+(o.sub||'')).toLowerCase().includes(q); }); }
      if(detState.sort==='low') list.sort(function(a,b){return a.price-b.price;});
      else if(detState.sort==='high') list.sort(function(a,b){return b.price-a.price;});
      var wrap=document.getElementById('detOptList');
      if(!list.length){
        wrap.innerHTML='<p class="krhead text-sm text-muted py-8 text-center" style="font-weight:300">해당 조건의 상품이 없습니다.</p>';
        return;
      }
      /* 중분류(옵션 그룹)가 있으면 그룹별로 묶어서 표시 (정렬 적용 중에는 평면 목록) */
      var grouped = detState.sort==='none' && list.some(function(o){ return !!o.group; });
      if(!grouped){ wrap.innerHTML=list.map(optHTML).join(''); return; }
      var order=[], buckets={};
      list.forEach(function(o){
        var k=o.group||'__none';
        if(!buckets[k]){ buckets[k]=[]; order.push(k); }
        buckets[k].push(o);
      });
      wrap.innerHTML = order.map(function(k){
        var head = k==='__none' ? '' :
          '<div class="flex items-center gap-2.5 mt-2 mb-1">'+
            '<span class="h-3.5 w-1 rounded bg-pink"></span>'+
            '<span class="krhead text-[14px] text-ink" style="font-weight:700">'+k+'</span>'+
            '<span class="krhead text-[11.5px] text-muted" style="font-weight:300">'+buckets[k].length+'개</span>'+
            '<span class="flex-1 h-px bg-ink/10"></span>'+
          '</div>';
        return head + buckets[k].map(optHTML).join('');
      }).join('');
    }

    function renderDetPills(){
      document.getElementById('detPills').innerHTML = DETAIL_PARTS.map(function(pt){
        var on=detState.part===pt;
        return '<button data-pt="'+pt+'" class="detPill px-3.5 py-1.5 rounded-full text-sm transition '+
          (on?'bg-pinkstrong text-white':'border border-ink/15 text-ink/60 hover:border-ink/40')+'">'+pt+'</button>';
      }).join('');
      document.querySelectorAll('#detPills .detPill').forEach(function(b){
        b.addEventListener('click',function(){ detState.part=b.dataset.pt; renderDetPills(); renderOptions(); });
      });
    }

    window.openDetail=function(p){
      detState={ p:p, q:'', sort:'none', part:'전체' };
      var d=detailOf(p);
      var banner = (window.__catBanner ? window.__catBanner(p) : '');
      var html=''+
      '<div class="flex items-center justify-between gap-3 border-b border-ink/10 pb-5 mb-8">'+
        '<div class="krhead flex items-center gap-2 text-sm break-keep min-w-0" style="font-weight:500">'+
          '<button onclick="showView(\'category\')" class="text-pinkstrong/80 hover:text-pinkstrong transition shrink-0">'+p.cat+'</button>'+
          '<iconify-icon icon="solar:alt-arrow-right-linear" class="text-ink/30 shrink-0"></iconify-icon>'+
          '<span class="text-ink truncate">'+p.title+'</span>'+
        '</div>'+
        '<button onclick="showView(\'category\')" class="krhead text-xs text-ink/45 hover:text-pinkstrong flex items-center gap-1 shrink-0" style="font-weight:400"><iconify-icon icon="solar:list-linear"></iconify-icon> 목록</button>'+
      '</div>'+

      '<div class="grid lg:grid-cols-2 gap-8 lg:gap-12 mb-20">'+
        '<div class="space-y-5">'+
          '<div class="rounded-2xl overflow-hidden">'+banner+'</div>'+
          (function(){
            var yt=d.youtube||'';
            var m=yt.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([\w-]{6,20})/);
            if(m) return '<div class="relative aspect-video rounded-2xl overflow-hidden bg-black"><iframe src="https://www.youtube.com/embed/'+m[1]+'" style="position:absolute;inset:0;width:100%;height:100%;border:0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>';
            if(p.details && p.details.length) return '';
            return '<div class="relative aspect-video rounded-2xl overflow-hidden bg-black grid place-items-center">'+
              '<img src="https://picsum.photos/seed/vid'+(p._seed||0)+'/800/450" class="absolute inset-0 w-full h-full object-cover opacity-55" alt="">'+
              '<span class="relative w-16 h-16 rounded-full bg-white/90 grid place-items-center"><iconify-icon icon="solar:play-bold" width="26" class="text-ink"></iconify-icon></span>'+
              '<span class="absolute top-3 left-3 krhead text-[11px] text-white/85 bg-black/40 px-2 py-0.5 rounded" style="font-weight:400">시술 영상</span>'+
            '</div>';
          })()+
        '</div>'+
        '<div>'+
          '<div class="rounded-2xl bg-white border border-ink/8 p-6 sm:p-7 mb-8">'+
            '<h2 class="krhead text-lg text-ink" style="font-weight:700">'+p.title+'</h2>'+
            '<div class="h-0.5 w-10 bg-pink rounded my-3"></div>'+
            '<p class="krhead text-[14px] leading-relaxed text-ink/70 whitespace-pre-line break-keep" style="font-weight:300">'+d.desc+'</p>'+
          '</div>'+
          '<h3 class="krhead text-base text-ink mb-4" style="font-weight:700">시술 상품</h3>'+
          '<div class="flex items-center gap-2 mb-3">'+
            '<input id="detSearch" placeholder="검색(이름/설명)" class="krhead flex-1 px-3 py-2 rounded-lg border border-ink/12 text-sm focus:outline-none focus:border-pink" style="font-weight:300">'+
            '<select id="detSort" class="krhead px-3 py-2 rounded-lg border border-ink/12 text-sm text-ink/70 focus:outline-none focus:border-pink" style="font-weight:400"><option value="none">정렬 없음</option><option value="low">낮은가격순</option><option value="high">높은가격순</option></select>'+
          '</div>'+
          '<div id="detPills" class="flex flex-wrap gap-1.5 mb-4"></div>'+
          '<div id="detOptList" class="max-h-[440px] overflow-y-auto pr-1 space-y-2.5 no-scrollbar"></div>'+
        '</div>'+
      '</div>'+

      (d.mainBody && String(d.mainBody).replace(/<[^>]*>/g,'').trim().length + (String(d.mainBody).indexOf('<img')>=0?1:0) ?
        '<div class="max-w-3xl mx-auto mb-20"><div class="note-body krhead text-[15px] text-ink/75 leading-loose break-keep" style="font-weight:300">'+d.mainBody+'</div></div>' : '')+

      (d.bodies && d.bodies.length ?
        '<div class="max-w-3xl mx-auto mb-20">'+
          d.bodies.map(function(dt){
            return '<div class="mb-12"><h3 class="krhead text-xl text-ink mb-3 break-keep" style="font-weight:700">'+dt.t+'</h3>'+
              '<div class="h-0.5 w-10 bg-pink rounded mb-5"></div>'+
              '<div class="note-body krhead text-[15px] text-ink/75 leading-loose break-keep" style="font-weight:300">'+dt.body+'</div></div>';
          }).join('')+
        '</div>' : '')+
      (d.steps && d.steps.length ?
        '<div class="max-w-3xl mx-auto mb-20"><h3 class="krhead text-2xl text-ink mb-2 text-center" style="font-weight:700">'+(d.stepsTitle||'시술 과정')+'</h3>'+
          '<div class="flex items-center justify-center gap-3 my-4"><span class="h-px w-10 bg-ink/20"></span><span class="w-1.5 h-1.5 rotate-45 border border-ink/35"></span><span class="h-px w-10 bg-ink/20"></span></div>'+
          '<div class="space-y-2.5 mt-6">'+d.steps.map(function(s,i){ return '<div class="flex items-center gap-4 rounded-xl bg-white border border-ink/8 px-5 py-3.5"><span class="krhead shrink-0 text-[11px] tracking-widest text-pinkstrong" style="font-weight:700">STEP '+(i+1)+'</span><span class="krhead text-[14.5px] text-ink/80 break-keep" style="font-weight:400">'+s+'</span></div>'; }).join('')+'</div></div>' : '')+
      (d.basic && (d.basic.time||d.basic.anesthesia||d.basic.daily||d.basic.duration) ?
        '<div class="max-w-3xl mx-auto mb-20"><h3 class="krhead text-2xl text-ink mb-6 text-center" style="font-weight:700">시술 기본정보</h3>'+
          '<div class="grid grid-cols-2 lg:grid-cols-4 gap-3">'+[['시술시간',d.basic.time],['마취여부',d.basic.anesthesia],['회복기간',d.basic.daily],['유지기간',d.basic.duration]].map(function(b){ return b[1]? '<div class="rounded-xl bg-pinksoft/35 px-4 py-5 text-center"><p class="krhead text-[11.5px] text-pinkstrong mb-1.5" style="font-weight:700">'+b[0]+'</p><p class="krhead text-[13.5px] text-ink/80 break-keep" style="font-weight:400">'+b[1]+'</p></div>':''; }).join('')+'</div></div>' : '')+
      (d.points && d.points.length ?
        '<div class="max-w-3xl mx-auto mb-20"><h3 class="krhead text-2xl text-ink mb-6 text-center" style="font-weight:700">이런 분께 추천해요</h3>'+
          '<div class="space-y-3">'+d.points.map(function(pt,i){ return '<div class="flex items-start gap-3 rounded-xl bg-white border border-ink/8 px-5 py-4"><span class="krhead shrink-0 text-[11px] tracking-widest text-pinkstrong mt-0.5" style="font-weight:700">POINT '+(i+1)+'</span><span class="krhead text-[14.5px] text-ink/80 break-keep" style="font-weight:300">'+pt+'</span></div>'; }).join('')+'</div></div>' : '')+
      (d.qna && d.qna.length ?
        '<div class="max-w-3xl mx-auto mb-20"><h3 class="krhead text-2xl text-ink mb-6 text-center" style="font-weight:700">자주 묻는 질문</h3>'+
          d.qna.map(function(x){ return '<div class="rounded-xl bg-white border border-ink/8 p-5 mb-3"><p class="krhead text-[15px] text-ink mb-2 break-keep" style="font-weight:700"><span class="text-pinkstrong">Q.</span> '+x.q+'</p><p class="krhead text-[14px] text-ink/70 leading-relaxed break-keep" style="font-weight:300"><span class="text-pinkstrong" style="font-weight:700">A.</span> '+x.a+'</p></div>'; }).join('')+'</div>' : '')+
      (d.recs && d.recs.length ?
        '<div class="max-w-3xl mx-auto mb-20 text-center"><h3 class="krhead text-xl text-ink mb-5" style="font-weight:700">함께 보면 좋은 시술</h3>'+
          '<div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 text-left">'+d.recs.map(function(r){
            var src=__recProd(r);
            var nm=(src&&(src.big||src.title))||r.name||'';
            var img=(src&&src.img)
              ? '<img src="'+src.img+'" alt="" style="width:52px;height:52px;object-fit:cover;border-radius:10px;flex:0 0 auto">'
              : '<div style="width:52px;height:52px;border-radius:10px;flex:0 0 auto" class="bg-pinksoft/50"></div>';
            return '<button onclick="__openProdById(\''+String(r.id||'').replace(/'/g,'')+'\',\''+String(nm).replace(/'/g,'')+'\')" class="rounded-xl bg-white border border-ink/8 hover:border-pink/50 transition p-4 text-left">'+
              '<span class="flex items-center gap-3">'+img+
                '<span class="min-w-0"><span class="krhead block text-[13.5px] text-ink leading-snug break-keep" style="font-weight:700">'+nm+'</span>'+
                '<span class="krhead block text-[11.5px] text-pinkstrong mt-0.5" style="font-weight:500">자세히 보기 →</span></span>'+
              '</span>'+
              (r.note? '<span class="krhead block text-[12.5px] text-ink/60 leading-relaxed break-keep mt-3" style="font-weight:300">'+r.note+'</span>':'')+
            '</button>';
          }).join('')+'</div></div>' : '')+
      '<div class="text-center max-w-2xl mx-auto mb-16">'+
        '<h3 class="krhead text-2xl text-ink mb-8" style="font-weight:500">'+(d.introTitle||'맞춤 케어')+'</h3>'+
        '<p class="krhead text-ink/70 leading-loose break-keep whitespace-pre-line mb-10" style="font-weight:300">'+d.question+'</p>'+
        '<p class="krhead text-pinkstrong leading-loose break-keep whitespace-pre-line" style="font-weight:500">'+d.emphasis+'</p>'+
      '</div>'+

      (d.features&&d.features.length ?
        '<div class="max-w-xl mx-auto space-y-3 mb-20">'+
          d.features.map(function(f,i){ return '<div class="krhead text-center py-3.5 rounded-full '+(i%2?'bg-pink/15':'bg-pinksoft/40')+' text-ink/80 break-keep" style="font-weight:500">'+f+'</div>'; }).join('')+
        '</div>' : '')+

      (d.precision&&d.precision.length ?
        '<div class="mb-20">'+
          (d.precisionPhoto ? '<div class="rounded-2xl overflow-hidden mb-6 max-w-2xl mx-auto"><img src="https://picsum.photos/seed/laser'+(p._seed||0)+'/900/520" class="w-full h-full object-cover" alt=""></div>' : '')+
          (d.precisionIntro ? '<p class="krhead text-center text-ink/70 leading-relaxed break-keep max-w-2xl mx-auto mb-8" style="font-weight:300">'+d.precisionIntro+'</p>' : '')+
          '<div class="max-w-3xl mx-auto space-y-3">'+
            d.precision.map(function(r){ return '<div class="flex flex-col sm:flex-row sm:items-stretch gap-2 sm:gap-4">'+
              '<div class="krhead shrink-0 sm:w-40 flex items-center justify-center text-center px-4 py-3 rounded-lg bg-pinksoft/45 text-pinkstrong text-sm" style="font-weight:700">'+r.label+'</div>'+
              '<div class="krhead flex-1 px-4 py-3 rounded-lg bg-ink/[0.03] text-sm text-ink/70 break-keep" style="font-weight:300"><span class="block">'+r.problem+'</span><span class="block text-pinkstrong mt-1" style="font-weight:500">▶ '+r.solution+'</span></div>'+
            '</div>'; }).join('')+
          '</div>'+
        '</div>' : '')+

      '<div class="max-w-3xl mx-auto">'+
        '<span class="krhead inline-block text-[11px] tracking-widest text-pinkstrong border border-pink/30 rounded-full px-3 py-1 mb-3" style="font-weight:500">AFTERCARE GUIDE</span>'+
        '<h3 class="krhead text-2xl text-ink mb-2" style="font-weight:700">주의사항</h3>'+
        '<div class="h-0.5 w-12 bg-pink rounded mb-4"></div>'+
        '<p class="krhead text-sm text-muted mb-6 break-keep" style="font-weight:300">결과는 시술과 사후관리의 합입니다. 아래를 꼭 지켜주세요.</p>'+
        '<ul class="space-y-3">'+
          d.aftercare.map(function(a){ return '<li class="krhead flex gap-3 text-[15px] text-ink/75 break-keep" style="font-weight:300"><span class="w-1.5 h-1.5 rounded-full bg-pink mt-2 shrink-0"></span><span>'+a+'</span></li>'; }).join('')+
        '</ul>'+
      '</div>';

      document.getElementById('detailBody').innerHTML=html;
      document.getElementById('detailBarTitle').textContent=p.title;

      document.getElementById('detSearch').addEventListener('input',function(e){ detState.q=e.target.value; renderOptions(); });
      document.getElementById('detSort').addEventListener('change',function(e){ detState.sort=e.target.value; renderOptions(); });
      renderDetPills();
      renderOptions();
      showView('detail');
    };

})();
  
