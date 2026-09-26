  /* ===================== ROUTING ===================== */
  function ensurePlaceholder(id){
    if(document.getElementById('view-'+id)) return;
    const [title, sub] = PAGES[id] || [id,''];
    const el = document.createElement('section');
    el.id = 'view-'+id; el.className='view';
    el.innerHTML = `
      <div class="mb-5">
        <h1 class="text-2xl font-bold tracking-tight">${title}</h1>
        <p class="text-[13.5px] mt-1.5" style="color:var(--muted)">${sub}</p>
      </div>
      <div class="panel rounded-2xl p-16 text-center">
        <div class="w-14 h-14 mx-auto rounded-2xl grid place-items-center mb-4" style="background:var(--accent-soft)">
          <iconify-icon icon="solar:hammer-linear" width="26" style="color:var(--accent)"></iconify-icon>
        </div>
        <p class="font-semibold">이 화면은 다음 단계에서 구성합니다.</p>
        <p class="text-[13.5px] mt-1.5" style="color:var(--muted)">스크린샷을 보며 <b>${title}</b> 화면을 이어서 채워 넣을 예정입니다.</p>
      </div>`;
    document.getElementById('placeholders').appendChild(el);
  }
  function go(id){
    /* 지금 쓰지 않는 메뉴(주소로 직접 들어온 경우 포함)는 예약 목록으로 */
    /* 시술 상품의 하위 화면(추가·수정 / 정렬 / 공통 고정 내용)은 허용. 새로고침 등으로 화면이 없으면 상품 목록으로 */
    const SUB = {productedit:'products', prodsort:'products', prodcommon:'products', noteedit:'notes', baedit:'beforeafter'};
    if(SUB[id] && !document.getElementById('view-'+id) && !(typeof BUILDERS!=='undefined' && BUILDERS[id])) id=SUB[id];
    if(typeof ADMIN_ENABLED!=='undefined' && ADMIN_ENABLED.indexOf(id)<0 && !SUB[id]) id='reservations';
    if(!document.getElementById('view-'+id)){
      if(typeof BUILDERS!=='undefined' && BUILDERS[id]) BUILDERS[id]();
      else ensurePlaceholder(id);
    }
    document.querySelectorAll('.view').forEach(v=>v.classList.remove('active'));
    document.getElementById('view-'+id).classList.add('active');
    document.querySelectorAll('.navlink').forEach(a=>a.classList.toggle('active', a.dataset.view===id));
    history.replaceState(null,'','#'+id);
    if(id==='dashboard' && typeof dashEnter==='function') dashEnter();   /* 열 때마다 최신 예약으로 */
    document.body.classList.remove('nav-open');
    window.scrollTo({top:0,behavior:'auto'});
  }

  /* ===================== TOGGLES ===================== */
  function toggleSidebar(){
    if(window.innerWidth<1024){ document.body.classList.toggle('nav-open'); document.getElementById('backdrop').classList.toggle('hidden'); }
    else document.body.classList.toggle('collapsed');
  }
  function toggleTheme(){
    document.documentElement.classList.toggle('dark');
    const dark = document.documentElement.classList.contains('dark');
    document.getElementById('themeIcon').setAttribute('icon', dark?'solar:moon-linear':'solar:sun-linear');
  }
