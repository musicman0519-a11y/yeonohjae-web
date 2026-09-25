  /* ===================== 사용 중인 메뉴 =====================
     지금은 아래 6개만 켜 둡니다. 나머지 메뉴를 다시 쓰려면 ADMIN_ENABLED 에 id를 추가하고
     SIMPLE_NAV 에 항목을 한 줄 넣으면 됩니다. (전체 메뉴 목록은 아래 ALL_NAV 에 그대로 보관) */
  const ADMIN_ENABLED = ['reservations', 'products', 'categories', 'popups', 'blog', 'menus'];
  const SIMPLE_NAV = [
    {type:'section', label:'예약 관리'},
    {type:'item', id:'reservations', label:'예약 목록', desc:'홈페이지 예약 확인·확정·취소', icon:'solar:calendar-mark-linear'},
    {type:'section', label:'홈페이지 관리'},
    {type:'item', id:'products',   label:'시술 상품',   desc:'시술·가격·이벤트 등록', icon:'solar:folder-linear'},
    {type:'item', id:'categories', label:'카테고리',    desc:'시술메뉴의 분류 탭',    icon:'solar:tag-linear'},
    {type:'item', id:'popups',     label:'팝업',        desc:'첫 화면 공지·이벤트 팝업', icon:'solar:gallery-wide-linear'},
    {type:'item', id:'blog',       label:'블로그',      desc:'블로그 글 링크 연결',   icon:'solar:notebook-linear'},
    {type:'item', id:'menus',      label:'상단 메뉴',   desc:'홈페이지 메뉴 이름·순서', icon:'solar:list-linear'},
  ];

  /* ===================== 전체 메뉴 (보관용 — 현재 사이드바에는 SIMPLE_NAV만 표시) ===================== */
  const ALL_NAV = [
    {type:'item', id:'dashboard', label:'메인 대시보드', icon:'solar:home-2-linear'},
    {type:'section', label:'지점별 관리'},
    {type:'branch', label:'화정', icon:'solar:buildings-2-linear', groups:[
      {label:'운영/설정', icon:'solar:settings-linear', items:[
        {id:'settings', label:'기본 설정', icon:'solar:settings-linear'},
        {id:'admins', label:'관리자 관리', icon:'solar:user-linear'},
        {id:'menus', label:'메뉴 관리', icon:'solar:list-linear'},
        {id:'popups', label:'팝업 관리', icon:'solar:gallery-wide-linear'},
      ]},
      {label:'병원/마케팅', icon:'solar:soundwave-linear', items:[
        {id:'intro', label:'병원 소개 문구 관리', icon:'solar:pen-linear'},
        {id:'doctors', label:'의료진 소개 관리', icon:'solar:users-group-rounded-linear'},
        {id:'blog', label:'블로그', icon:'solar:notebook-linear'},
        {id:'shorts', label:'쇼츠 영상', icon:'solar:videocamera-linear'},
        {id:'hairprice', label:'제모 가격 안내', icon:'solar:soundwave-linear'},
        {id:'referral', label:'추천인 관리', icon:'solar:list-check-linear'},
        {id:'notes', label:'시술노트', icon:'solar:book-2-linear'},
        {id:'concerns', label:'고민별 접근', icon:'solar:book-bookmark-linear'},
        {id:'noninsured', label:'비급여 항목 관리', icon:'solar:bill-list-linear'},
      ]},
      {label:'시술/진료 관리', icon:'solar:stethoscope-linear', items:[
        {id:'products', label:'시술 상품 관리', icon:'solar:folder-linear'},
        {id:'events', label:'기간별 이벤트', icon:'solar:calendar-linear'},
        {id:'categories', label:'카테고리 관리', icon:'solar:gallery-linear'},
        {id:'beforeafter', label:'시술 전후 관리', icon:'solar:code-square-linear'},
        {id:'care', label:'시술 후 주의사항', icon:'solar:document-text-linear'},
      ]},
      {label:'예약/고객 관리', icon:'solar:calendar-mark-linear', items:[
        {id:'reservations', label:'예약 목록 확인', icon:'solar:calendar-linear'},
        {id:'satisfaction', label:'고객 만족도 조사', icon:'solar:like-linear'},
      ]},
    ]},
    {type:'item', id:'remote', label:'비대면 진료(앱결제)', icon:'solar:hand-stars-linear'},
  ];
  const NAV = SIMPLE_NAV;

  /* page titles + subtitles for placeholder views */
  const PAGES = {
    settings:['기본 설정','지점 정보·연락처·SNS·SEO를 다국어로 관리합니다.'],
    admins:['관리자 관리','지점 관리자 계정과 권한을 관리합니다.'],
    menus:['상단 메뉴 관리','홈페이지 맨 위 메뉴의 이름·순서·표시 여부를 정합니다. 드래그해서 순서를 바꿀 수 있어요.'],
    popups:['팝업 관리','홈페이지에 처음 들어왔을 때 뜨는 공지·이벤트 팝업을 등록합니다.'],
    intro:['병원 소개 문구 관리','각 지점의 소개·오시는 길·주차 안내를 관리합니다.'],
    doctors:['의료진 소개 수정','지점별 의료진 프로필을 등록·수정합니다.'],
    blog:['블로그 관리','네이버 블로그 등의 글 주소를 등록하면 홈페이지 「시술 노트」 아래에 목록으로 보여줍니다.'],
    shorts:['쇼츠 영상 관리','홈페이지에 노출할 쇼츠(숏폼) 영상 링크를 관리합니다.'],
    hairprice:['제모 가격 안내 관리','홈페이지 제모 가격 안내 페이지의 항목을 관리합니다.'],
    referral:['추천인 코드 관리','추천인 코드를 발급하고 사용 현황을 확인합니다.'],
    notes:['시술노트 관리','시술노트(아티클)를 다국어·지점별로 관리합니다.'],
    concerns:['시술 노트 - 고민별 접근 관리','고민 카테고리·세부 고민과 추천 시술을 연결합니다.'],
    noninsured:['비급여 항목 관리','의료법 고지용 비급여 진료비를 관리합니다.'],
    products:['시술 상품 관리','홈페이지 「시술메뉴/이벤트」에 보이는 시술과 가격을 등록·수정합니다.'],
    events:['기간별 이벤트','기간 한정 이벤트를 등록하고 노출을 제어합니다.'],
    categories:['카테고리 관리','시술메뉴 화면 위쪽의 분류 탭(레이저 제모, 리프팅 등)을 정합니다.'],
    beforeafter:['시술전후 관리','시술 전후 사진을 다국어·카테고리별로 관리합니다.'],
    care:['시술 후 주의사항 관리','시술별 주의사항 문서를 순서대로 관리합니다.'],
    reservations:['예약 목록','홈페이지로 들어온 예약을 확인하고 확정·취소합니다.'],
    satisfaction:['설문 응답 목록','고객 만족도 조사 응답을 확인합니다.'],
    remote:['비대면 주문 관리','비대면 진료(앱결제) 주문과 매출을 관리합니다.'],
  };

  /* ===================== RENDER SIDEBAR ===================== */
  function navItem(it, sub){
    /* desc가 있으면 메뉴 이름 아래에 무엇을 하는 곳인지 짧게 표시 */
    return `<button data-view="${it.id}" onclick="go('${it.id}')"
      class="navlink active:scale-[.99] w-full flex items-center gap-3 ${sub?'pl-9 pr-3':'px-3'} ${it.desc?'py-3':'py-2.5'} rounded-lg text-left"
      style="color:var(--side-text)">
      <iconify-icon icon="${it.icon}" width="${sub?16:20}" class="shrink-0" style="color:var(--side-muted)"></iconify-icon>
      <span class="min-w-0 leading-tight">
        <span class="block truncate font-semibold text-[14.5px]">${it.label}</span>
        ${it.desc?`<span class="block truncate text-[11.5px] mt-1" style="color:var(--side-muted)">${it.desc}</span>`:''}
      </span>
      <span class="navdot ml-auto w-1.5 h-1.5 rounded-full shrink-0" style="background:var(--side-active); opacity:0"></span>
    </button>`;
  }
  function renderNav(){
    let html='';
    NAV.forEach((n,i)=>{
      if(n.type==='item'){ html += navItem(n,false); }
      else if(n.type==='section'){
        html += `<p class="px-3 pt-4 pb-1.5 text-[11px] font-semibold tracking-wide" style="color:var(--side-muted)">${n.label}</p>`;
      }
      else if(n.type==='branch'){
        html += `<div class="mb-1">
          <button onclick="toggleGrp(this)" class="grp open w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg" style="color:#cdc4b6">
            <iconify-icon icon="${n.icon}" width="18" class="shrink-0" style="color:var(--side-active)"></iconify-icon>
            <span class="font-semibold">${n.label}</span>
            <iconify-icon icon="solar:alt-arrow-down-linear" width="16" class="chev ml-auto" style="color:var(--side-muted)"></iconify-icon>
          </button>
          <div class="grp-body" style="max-height:2000px"><div class="pl-2 mt-0.5 space-y-0.5">`;
        n.groups.forEach(g=>{
          html += `<div>
            <button onclick="toggleGrp(this)" class="grp open w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13.5px]" style="color:var(--side-text)">
              <iconify-icon icon="${g.icon}" width="16" class="shrink-0" style="color:var(--side-muted)"></iconify-icon>
              <span class="font-medium">${g.label}</span>
              <iconify-icon icon="solar:alt-arrow-down-linear" width="14" class="chev ml-auto" style="color:var(--side-muted)"></iconify-icon>
            </button>
            <div class="grp-body" style="max-height:1000px"><div class="space-y-0.5 mt-0.5">
              ${g.items.map(it=>navItem(it,true)).join('')}
            </div></div></div>`;
        });
        html += `</div></div></div>`;
      }
    });
    document.getElementById('nav').innerHTML = html;
  }
  function toggleGrp(btn){
    btn.classList.toggle('open');
    const body = btn.nextElementSibling;
    if(btn.classList.contains('open')){ body.style.maxHeight = body.scrollHeight+200+'px'; }
    else { body.style.maxHeight = '0px'; }
  }
