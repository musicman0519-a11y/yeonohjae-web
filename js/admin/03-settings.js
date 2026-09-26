  /* ---------- 기본 설정 (다국어 수동 입력 · 끗한의원 방식) ---------- */
  const SET_LANGS = [['KR','KO','ko'],['US','EN','en'],['JP','JA','ja'],['CN','ZH','zh'],['TH','TH','th']];
  const SET_TRANSLATABLE = ['addr1','addr2','biz','hWeek','hWeekend','hHoliday','extra','seo','seoTail','seoLocal'];
  let _setLang = 'ko';
  let _setDraft = null;

  function setDraftInit(){
    if(_setDraft) return;
    const ko = Object.assign({}, DEFAULT_SETTINGS, KK.get('settings', {}));
    const ml = KK.get('settings_ml', {});
    _setDraft = { ko: ko };
    ['en','ja','zh','th'].forEach(l=>{ _setDraft[l] = Object.assign({}, ml[l]||{}); });
  }
  /* 현재 화면의 입력값을 draft에 반영 */
  function setStashDom(){
    document.querySelectorAll('#view-settings [data-sk]').forEach(inp=>{
      const k = inp.dataset.sk;
      if(_setLang!=='ko' && SET_TRANSLATABLE.includes(k)) _setDraft[_setLang][k] = inp.value;
      else _setDraft.ko[k] = inp.value;
    });
  }
  /* draft 값을 화면에 채우기 (언어 전환 시) */
  function setFillDom(){
    document.querySelectorAll('#view-settings [data-sk]').forEach(inp=>{
      const k = inp.dataset.sk;
      const tr = SET_TRANSLATABLE.includes(k);
      inp.value = (_setLang==='ko' || !tr) ? (_setDraft.ko[k]||'') : (_setDraft[_setLang][k]||'');
    });
    document.querySelectorAll('#view-settings .setChip').forEach(ch=>{
      const tr = ch.dataset.tr==='1';
      ch.textContent = tr ? _setLang.toUpperCase() : '공통';
      ch.style.background = tr ? 'var(--accent-soft)' : 'var(--panel-soft)';
      ch.style.color = tr ? 'var(--accent-strong)' : 'var(--muted)';
    });
  }
  function setDirty(on){
    const b = document.getElementById('settingsBadge');
    if(!b) return;
    b.innerHTML = on
      ? '<span class="w-1.5 h-1.5 rounded-full" style="background:#d97706"></span> <i>변경 사항 있음</i> — 저장하기를 눌러야 반영됩니다'
      : '<span class="w-1.5 h-1.5 rounded-full" style="background:var(--good)"></span> 모든 변경사항 저장됨';
    b.style.color = on ? '#b45309' : 'var(--good)';
  }
  function pickLang(code){
    setStashDom();
    _setLang = code;
    document.querySelectorAll('#view-settings .langtab').forEach(b=>{
      const on = b.dataset.lang===code;
      b.style.cssText = on ? 'background:var(--side);color:#fff' : 'background:var(--panel);border:1px solid var(--border);color:var(--text-soft)';
    });
    setFillDom();
    renderSetPreview();
  }
  /* KO → 빈칸 채우기: 현재 언어 탭의 빈 칸에 한글 값을 복사 */
  function koFillBlanks(){
    if(_setLang==='ko'){ toast('KO 탭에서는 사용할 수 없습니다. EN/JA/ZH/TH 탭에서 눌러주세요.', false); return; }
    setStashDom();
    let n = 0;
    SET_TRANSLATABLE.forEach(k=>{
      if(!(_setDraft[_setLang][k]||'').trim() && (_setDraft.ko[k]||'').trim()){
        _setDraft[_setLang][k] = _setDraft.ko[k]; n++;
      }
    });
    setFillDom();
    renderSetPreview();
    setDirty(true);
    toast(n? '빈칸 '+n+'개를 한국어 값으로 채웠습니다. 번역문으로 수정 후 저장하세요.' : '채울 빈칸이 없습니다.');
  }
  function toggleSetHelp(){
    const box = document.getElementById('setHelpBody');
    const btn = document.getElementById('setHelpBtn');
    const open = box.style.display==='none';
    box.style.display = open ? '' : 'none';
    btn.textContent = open ? '닫기' : '보기';
  }
  function saveSettings(){
    setStashDom();
    const ko = {};
    Object.keys(_setDraft.ko).forEach(k=>{ ko[k] = (_setDraft.ko[k]||'').trim(); });
    ['naver','kakao','nblog','ntv','line','insta','whatsapp'].forEach(k=>{
      if(ko[k] && !/^https?:\/\//i.test(ko[k]) && !/^[a-z]+:\/\//i.test(ko[k])) ko[k] = 'https://' + ko[k];
    });
    const ml = {};
    ['en','ja','zh','th'].forEach(l=>{
      const o = {};
      SET_TRANSLATABLE.forEach(k=>{ const v=(_setDraft[l][k]||'').trim(); if(v) o[k]=v; });
      if(Object.keys(o).length) ml[l] = o;
    });
    _setDraft.ko = ko;
    KK.set('settings', ko);
    KK.set('settings_ml', ml);
    setDirty(false);
    renderSetPreview();
    toast(STORAGE_OK? '저장됐습니다. 홈페이지(옆 버튼·오시는 길·하단 정보)에 바로 반영됩니다.' : '미리보기 환경에선 저장이 제한됩니다.', STORAGE_OK);
  }
  function renderSetPreview(){
    const box = document.getElementById('setPreview');
    if(!box) return;
    const ko = _setDraft.ko;
    const cur = _setLang==='ko' ? ko : Object.assign({}, ko, _setDraft[_setLang]);
    const row = (label, val, dim)=>`<p class="text-[13px] leading-relaxed break-keep"><span style="color:var(--muted)">${label}</span> · <span style="color:${dim?'var(--muted)':'var(--text)'}">${val||'-'}</span></p>`;
    box.innerHTML =
      `<div class="flex items-center gap-2 mt-8 mb-3.5">
        <iconify-icon icon="solar:magic-stick-3-linear" width="18" style="color:var(--accent)"></iconify-icon>
        <h2 class="text-[16px] font-bold">요약 미리보기</h2>
      </div>
      <div class="grid md:grid-cols-2 gap-3.5">
        <div class="rounded-xl p-5 space-y-1.5" style="background:var(--panel);border:1px solid var(--border)">
          <p class="text-[12px] mb-2" style="color:var(--muted)">병원 정보</p>
          ${row('상호명', cur.biz)}
          ${row('주소', (cur.addr1||'')+(cur.addr2? ' '+cur.addr2:''))}
          ${row('평일', cur.hWeek)}
          ${row('주말/공휴일', cur.hWeekend)}
          ${row('명절/공휴', cur.hHoliday)}
          ${row('추가정보', cur.extra)}
          ${row('SEO 키워드', cur.seo)}
          ${row('지점명 꼬리표', cur.seoTail)}
          ${row('지역 키워드', cur.seoLocal)}
          ${row('네이버 인증', ko.navVerify, true)}
          ${row('구글 인증', ko.gVerify, true)}
        </div>
        <div class="rounded-xl p-5 space-y-1.5" style="background:var(--panel);border:1px solid var(--border)">
          <p class="text-[12px] mb-2" style="color:var(--muted)">연락처 & 링크</p>
          ${row('전화', ko.tel)}
          ${row('네이버', ko.naver)}
          ${row('카카오', ko.kakao)}
          ${row('인스타', ko.insta)}
          ${row('네이버 블로그', ko.nblog)}
          ${row('네이버 TV', ko.ntv)}
          ${row('WhatsApp', ko.whatsapp)}
          ${row('WeChat', ko.wechat)}
          ${row('LINE', ko.line)}
        </div>
      </div>`;
  }
  function fieldCard(icon, label, key, opt){
    opt = opt || {};
    const tr = SET_TRANSLATABLE.includes(key) ? '1' : '0';
    return `<div class="rounded-xl p-4" style="background:var(--panel); border:1px solid var(--border)">
      <div class="flex items-center gap-2 mb-2.5">
        <iconify-icon icon="${icon}" width="16" style="color:var(--accent)"></iconify-icon>
        <span class="text-[13px] font-semibold">${label}</span>
        
      </div>
      <input data-sk="${key}" ${opt.ph?`placeholder="${opt.ph}"`:''}
        class="w-full px-3 py-2.5 rounded-lg text-[13.5px]" style="background:var(--panel-soft); border:1px solid var(--border); color:var(--text)">
      ${opt.key2!==undefined?`<input data-sk="${opt.key2}" ${opt.ph2?`placeholder="${opt.ph2}"`:''} class="w-full px-3 py-2.5 rounded-lg text-[13.5px] mt-2" style="background:var(--panel-soft); border:1px solid var(--border); color:var(--text)">`:''}
      ${opt.hint?`<p class="text-[11.5px] mt-1.5" style="color:var(--muted)">${opt.hint}</p>`:''}
    </div>`;
  }
  BUILDERS.settings = function(){
    if(typeof peCss==='function') peCss();   /* 스위치(pSw) 모양 */
    setDraftInit();
    const langTabs = SET_LANGS.map(([c,l,code])=>
      `<button onclick="pickLang('${code}')" data-lang="${code}" class="langtab px-3 h-9 rounded-lg text-[12.5px] font-bold flex items-center gap-1.5"
        style="${code===_setLang?'background:var(--side);color:#fff':'background:var(--panel);border:1px solid var(--border);color:var(--text-soft)'}">
        <span class="opacity-60 text-[10px]">${c}</span> ${l}</button>`).join('');
    const right = `<a href="/" target="_blank" rel="noopener" class="px-4 h-9 rounded-lg text-[13px] font-semibold flex items-center gap-1.5" style="background:var(--panel);border:1px solid var(--border);color:var(--text-soft)"><iconify-icon icon="solar:link-linear" width="15"></iconify-icon> 홈페이지에서 확인</a>
      <button onclick="saveSettings()" class="px-4 h-9 rounded-lg text-[13px] font-semibold flex items-center gap-1.5 btn-gold">
        <iconify-icon icon="solar:upload-minimalistic-linear" width="15"></iconify-icon> 저장하기</button>`;

    const sectionTitle = (icon,t)=>`<div class="flex items-center gap-2 mt-8 mb-3.5 first:mt-0">
        <iconify-icon icon="${icon}" width="18" style="color:var(--accent)"></iconify-icon>
        <h2 class="text-[16px] font-bold">${t}</h2></div>`;

    const helpBox = `
      <div class="rounded-xl mb-5" style="background:var(--panel);border:1px solid var(--border)">
        <div class="px-5 py-3.5 flex items-center gap-3">
          <span class="text-[13.5px] font-bold">처음이라면 사용법 보기</span>
          <span class="text-[13px]" style="color:var(--muted)">지점 기본 정보, 연락처, SEO 등 홈페이지 설정을 관리합니다.</span>
          <button id="setHelpBtn" onclick="toggleSetHelp()" class="ml-auto px-4 h-8 rounded-full text-[12.5px] font-bold text-white" style="background:var(--side)">보기</button>
        </div>
        <div id="setHelpBody" style="display:none;border-top:1px solid var(--border-soft)" class="px-6 py-4">
          <ol class="list-decimal pl-4 space-y-1.5 text-[13.5px]" style="color:var(--text-soft)">
            <li>아래에서 <b style="color:var(--text)">지점 정보 / 연락처 & 링크 / SEO</b> 항목을 수정합니다.</li>
            <li>각 항목을 수정하면 상단에 <i>변경 사항 있음</i> 표시가 나타납니다.</li>
            <li>수정이 끝나면 우측 상단 <b style="color:var(--text)">저장하기</b> 버튼을 눌러야 홈페이지에 반영됩니다.</li>
            <li><b style="color:var(--text)">홈페이지 옆 버튼</b>에서 네이버 예약·카카오톡·인스타그램·전화·LINE 등 오른쪽에 떠 있는 버튼을 켜고 끕니다. 링크가 비어 있는 버튼은 켜 두어도 보이지 않습니다.</li>
          </ol>
        </div>
      </div>`;

    const el = makeView('settings');
    el.innerHTML =
      pageHead('기본 설정',
        '<span id="settingsBadge" class="inline-flex items-center gap-1.5 text-[12.5px] font-semibold" style="color:var(--good)"><span class="w-1.5 h-1.5 rounded-full" style="background:var(--good)"></span> 모든 변경사항 저장됨</span>',
        right) +
      helpBox +
      `<div class="panel rounded-2xl p-5 sm:p-7">
        ${sectionTitle('solar:buildings-2-linear','병원 정보')}
        <div class="grid md:grid-cols-2 gap-3.5">
          ${fieldCard('solar:map-point-linear','주소','addr1',{key2:'addr2', ph2:'상세주소를 입력해주세요.'})}
          ${fieldCard('solar:buildings-2-linear','상호명','biz')}
          ${fieldCard('solar:clock-circle-linear','운영시간 (평일)','hWeek')}
          ${fieldCard('solar:clock-circle-linear','운영시간 (주말 및 공휴일)','hWeekend')}
          ${fieldCard('solar:clock-circle-linear','운영시간 (추석, 설날 포함 공휴일)','hHoliday')}
          ${fieldCard('solar:info-circle-linear','추가정보','extra')}
        </div>

        ${sectionTitle('solar:link-circle-linear','연락처 & 링크')}
        <div class="grid md:grid-cols-2 gap-3.5">
          ${fieldCard('solar:phone-linear','전화번호','tel')}
          ${fieldCard('solar:user-id-linear','대표자명','ceo')}
          ${fieldCard('solar:hashtag-linear','사업자등록번호','reg')}
          ${fieldCard('solar:link-linear','네이버예약링크','naver',{hint:'http(s)로 시작하지 않으면 저장 시 자동으로 https://가 붙습니다.'})}
          ${fieldCard('solar:chat-round-dots-linear','카카오톡링크','kakao',{hint:'http(s)로 시작하지 않으면 저장 시 자동으로 https://가 붙습니다.'})}
          ${fieldCard('solar:link-linear','인스타그램 링크','insta',{hint:'프로필/DM 연결 URL을 넣어주세요.'})}
          ${fieldCard('solar:link-linear','네이버 블로그 링크','nblog',{ph:'예) https://blog.naver.com/yeonohjae', hint:'http(s)로 시작하지 않으면 저장 시 자동으로 https://가 붙습니다.'})}
          ${fieldCard('solar:link-linear','네이버 TV 링크','ntv',{ph:'예) https://tv.naver.com/yeonohjae', hint:'http(s)로 시작하지 않으면 저장 시 자동으로 https://가 붙습니다.'})}
          ${fieldCard('solar:chat-round-dots-linear','WhatsApp 링크','whatsapp',{ph:'예) https://wa.me/82XXXXXXXX', hint:'권장: wa.me 링크(국가코드 포함).'})}
          ${fieldCard('solar:chat-round-dots-linear','WeChat 링크','wechat',{ph:'예) 위챗 QR 페이지 URL 또는 weixin://', hint:'weixin:// 같은 스킴도 그대로 저장됩니다(자동 https:// 덧붙이지 않음).'})}
          ${fieldCard('solar:chat-round-dots-linear','LINE 링크','line',{ph:'예) https://line.me/R/ti/p/xxxx', hint:'공식 라인 추가 URL을 넣어주세요.'})}
        </div>

        ${sectionTitle('solar:list-check-linear','홈페이지 옆 버튼 (오른쪽에 떠 있는 아이콘)')}
        <div id="dockBox"></div>

        ${sectionTitle('solar:user-id-linear','카카오 간편 인증 (예약할 때)')}
        <div id="kakaoBox"></div>

        ${sectionTitle('solar:tag-linear','SEO')}
        <div class="grid md:grid-cols-2 gap-3.5">
          ${fieldCard('solar:tag-linear','SEO 키워드','seo',{hint:'쉼표(,)로 구분해 입력하세요. 예) 화정 피부, 고양 한의원, 화정 제모'})}
          ${fieldCard('solar:tag-linear','지점명 꼬리표','seoTail',{ph:'예) 연오재한의원', hint:'검색 결과 제목 뒤에 붙는 지점명입니다.'})}
          ${fieldCard('solar:map-point-linear','지역 키워드','seoLocal',{ph:'예) 화정 행신 원흥 삼송 덕양구 고양', hint:'공백으로 구분해 입력하세요.'})}
          ${fieldCard('solar:hashtag-linear','네이버 사이트 인증 코드','navVerify',{ph:'naver-site-verification 값', hint:'네이버 서치어드바이저의 메타태그 content 값만 붙여넣으세요.'})}
          ${fieldCard('solar:hashtag-linear','구글 사이트 인증 코드','gVerify',{ph:'google-site-verification 값', hint:'구글 서치콘솔의 메타태그 content 값만 붙여넣으세요.'})}
        </div>
        <p class="text-[12px] mt-2" style="color:var(--muted)">※ 네이버·구글 소유 확인은 홈페이지 파일 안에 직접 들어가야 인식됩니다. 코드를 받으면 개발 담당에게 전달해 주세요. 검색용 시술·노트 페이지 목록(사이트맵) 주소: <b>https://yeonohjae-web.vercel.app/sitemap-auto.xml</b></p>

        ${sectionTitle('solar:soundwave-linear','방문 분석 · 광고 전환 추적')}
        <div class="grid md:grid-cols-2 gap-3.5">
          ${fieldCard('solar:hashtag-linear','Google 태그 관리자(GTM) ID','gtmId',{ph:'예) GTM-ABC1234', hint:'GTM을 쓰면 여기에만 넣으세요. 예약 신청·전화·카카오 클릭 이벤트가 자동으로 전달됩니다.'})}
          ${fieldCard('solar:hashtag-linear','Google 애널리틱스(GA4) 측정 ID','ga4Id',{ph:'예) G-ABC123DEF4', hint:'GTM 없이 GA4만 쓸 때 넣으세요. 이벤트: reserve_submit(예약), lead_submit(상담), call_click(전화)'})}
          ${fieldCard('solar:hashtag-linear','네이버 프리미엄로그분석 ID','naverWa',{ph:'예) s_1a2b3c4d5e6f', hint:'네이버 검색광고 → 도구 → 프리미엄로그분석의 사이트 ID. 예약·상담 신청이 「신청」 전환으로 잡힙니다.'})}
        </div>
        <p class="text-[12px] mt-2" style="color:var(--muted)">※ ID를 넣고 저장하면 다음 방문부터 켜지고, 개인정보처리방침에 해당 업체가 자동으로 표시됩니다. 이름·연락처는 분석 도구로 보내지 않습니다.</p>

        <div id="setPreview"></div>

        <div class="mt-7 rounded-xl px-4 py-3.5 text-[12.5px] flex items-center gap-2" style="background:var(--accent-soft); color:var(--accent-strong)">
          <iconify-icon icon="solar:info-circle-linear" width="16"></iconify-icon>
          값을 수정하고 <b>저장하기</b>를 누르면 홈페이지 옆 버튼·오시는 길·하단 병원 정보에 바로 반영됩니다.
        </div>
      </div>`;
    setFillDom();
    renderSetPreview();
    renderDockBox();
    renderKakaoBox();
    el.addEventListener('input', function(e){
      if(e.target && e.target.matches('[data-sk]')){ setDirty(true); setStashDom(); renderSetPreview(); renderDockBox(); }
    });
  };

  /* 다국어 언어 탭은 API 연동 작업 때 함께 구현 예정 — 동작하지 않는 버튼은 두지 않습니다 */
  function langRow(){ return ''; }

  /* ---------- 홈페이지 옆 버튼 켜기/끄기 ----------
     저장: settings.dockOff = '끈 버튼 키,…' (문자열). 홈페이지 index.html 의 #quickDock 이 이 값과 링크를 보고 버튼을 만듦 */
  const DOCK_ITEMS = [
    ['naver','네이버 예약','naver','solar:calendar-linear','PC만 (모바일은 하단 바에 있음)'],
    ['kakao','카카오톡 상담','kakao','solar:chat-round-dots-linear',''],
    ['insta','인스타그램','insta','solar:link-linear',''],
    ['tel','전화 연결','tel','solar:phone-linear','PC만 (모바일은 하단 바에 있음)'],
    ['line','LINE 상담','line','solar:chat-round-dots-linear',''],
    ['whatsapp','WhatsApp','whatsapp','solar:chat-round-dots-linear',''],
    ['nblog','네이버 블로그','nblog','solar:notebook-linear',''],
    ['loc','오시는 길 (지도로 이동)','','solar:map-point-linear','링크 필요 없음'],
  ];
  function dockOffList(){ return String((_setDraft&&_setDraft.ko.dockOff)||'').split(',').map(x=>x.trim()).filter(Boolean); }
  function dockToggle(k, on){
    const l=dockOffList().filter(x=>x!==k); if(!on) l.push(k);
    _setDraft.ko.dockOff=l.join(','); setDirty(true); renderDockBox();
  }
  function renderDockBox(){
    const box=document.getElementById('dockBox'); if(!box || !_setDraft) return;
    const off=dockOffList(), ko=_setDraft.ko;
    box.innerHTML='<div class="rounded-xl overflow-hidden" style="background:var(--panel);border:1px solid var(--border)">'+
      DOCK_ITEMS.map(([k,label,field,icon,note],i)=>{
        const has = !field || String(ko[field]||'').trim();
        const on = off.indexOf(k)<0;
        const state = !on ? ['숨김','var(--muted)'] : (has ? ['홈페이지에 보임','var(--good)'] : ['링크가 비어 있어 안 보임','#b45309']);
        return '<div class="flex items-center gap-3 px-4 py-3"'+(i?' style="border-top:1px solid var(--border-soft)"':'')+'>'+
          '<span class="w-8 h-8 rounded-full grid place-items-center shrink-0" style="background:var(--accent-soft);color:var(--accent-strong)"><iconify-icon icon="'+icon+'" width="16"></iconify-icon></span>'+
          '<span class="min-w-0 flex-1"><span class="block text-[13.5px] font-semibold">'+label+'</span>'+
            '<span class="block text-[11.5px]" style="color:var(--muted)">'+(note|| (field? '위 「연락처 & 링크」의 주소를 사용':''))+'</span></span>'+
          '<span class="text-[12px] font-semibold" style="color:'+state[1]+'">● '+state[0]+'</span>'+
          '<input type="checkbox" class="pSw" '+(on?'checked':'')+' onchange="dockToggle(\''+k+'\', this.checked)">'+
        '</div>';
      }).join('')+'</div>'+
      '<p class="text-[11.5px] mt-2" style="color:var(--muted)">스위치를 바꾼 뒤 맨 위 <b>저장하기</b>를 눌러야 홈페이지에 반영됩니다. 위에서부터 보이는 순서입니다.</p>';
    if(typeof renderIcons==='function') renderIcons(box);
  }

  /* ---------- 카카오 간편 인증 켜기/끄기 ----------
     settings.kakaoAuth='on' → 홈페이지 예약 칸이 「카카오 인증하기」로 바뀜
     settings.kakaoPhone='on' → 이름·전화번호까지 요청(카카오 비즈앱 전환·동의항목 설정 후에만) */
  function kakaoToggle(k, on){ _setDraft.ko[k]= on?'on':''; setDirty(true); renderKakaoBox(); }
  function renderKakaoBox(){
    const box=document.getElementById('kakaoBox'); if(!box || !_setDraft) return;
    const ko=_setDraft.ko, row=(k,label,sub)=>
      '<div class="flex items-center gap-3 px-4 py-3.5" style="border-top:1px solid var(--border-soft)">'+
        '<span class="min-w-0 flex-1"><span class="block text-[13.5px] font-semibold">'+label+'</span><span class="block text-[11.5px] mt-0.5" style="color:var(--muted)">'+sub+'</span></span>'+
        '<span class="text-[12px] font-semibold" style="color:'+(ko[k]==='on'?'var(--good)':'var(--muted)')+'">● '+(ko[k]==='on'?'켜짐':'꺼짐')+'</span>'+
        '<input type="checkbox" class="pSw" '+(ko[k]==='on'?'checked':'')+' onchange="kakaoToggle(\''+k+'\', this.checked)"></div>';
    box.innerHTML='<div class="rounded-xl overflow-hidden" style="background:var(--panel);border:1px solid var(--border)">'+
      '<div class="px-4 py-3.5 text-[12.5px] leading-relaxed" style="background:#fff8db;color:#6b5200">'+
        '<b>켜기 전에 꼭 준비가 끝나야 합니다.</b> 준비 없이 켜면 손님이 예약할 수 없게 됩니다.<br>'+
        '① 카카오 개발자 앱 등록 → ② Supabase에 Kakao 로그인 연결 → ③ 권한 강화 SQL 실행 (작업 폴더의 「카카오_인증_설정방법.txt」 참고)</div>'+
      row('kakaoAuth','카카오 간편 인증 사용','켜면 홈페이지 예약 칸의 이름·연락처 대신 「카카오 인증하기」 버튼이 나옵니다.')+
      row('kakaoPhone','이름·전화번호까지 받기','카카오 「비즈 앱」 전환 후 동의항목(이름·전화번호)을 설정했을 때만 켜세요. 끄면 닉네임만 받고 전화번호는 손님이 직접 입력합니다.')+
      row('kakaoChannel','인증할 때 카카오톡 채널 추가 받기','카카오 개발자 앱에 우리 카카오톡 채널을 연결하고 동의항목 「카카오톡 채널 추가 상태 및 내역」을 설정했을 때만 켜세요. 인증 화면에 「채널 추가」 체크가 나옵니다.')+
    '</div>';
  }
