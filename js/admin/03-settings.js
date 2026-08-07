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
    ['naver','kakao','nblog','ntv','line','insta'].forEach(k=>{
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
    toast(STORAGE_OK? '저장됐습니다. 홈페이지에 반영됩니다. (다국어는 홈 상단 지구본에서 전환)' : '미리보기 환경에선 저장이 제한됩니다.', STORAGE_OK);
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
          <p class="text-[12px]" style="color:var(--muted)">현재 언어</p>
          <p class="text-xl font-extrabold mb-2">${_setLang.toUpperCase()}</p>
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
          <p class="text-[12px] mb-2" style="color:var(--muted)">연락처 & 링크 (공통)</p>
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
        <span class="chip ml-auto setChip" data-tr="${tr}" style="background:var(--accent-soft); color:var(--accent-strong)">KO</span>
      </div>
      <input data-sk="${key}" ${opt.ph?`placeholder="${opt.ph}"`:''}
        class="w-full px-3 py-2.5 rounded-lg text-[13.5px]" style="background:var(--panel-soft); border:1px solid var(--border); color:var(--text)">
      ${opt.key2!==undefined?`<input data-sk="${opt.key2}" ${opt.ph2?`placeholder="${opt.ph2}"`:''} class="w-full px-3 py-2.5 rounded-lg text-[13.5px] mt-2" style="background:var(--panel-soft); border:1px solid var(--border); color:var(--text)">`:''}
      ${opt.hint?`<p class="text-[11.5px] mt-1.5" style="color:var(--muted)">${opt.hint}</p>`:''}
    </div>`;
  }
  BUILDERS.settings = function(){
    setDraftInit();
    const langTabs = SET_LANGS.map(([c,l,code])=>
      `<button onclick="pickLang('${code}')" data-lang="${code}" class="langtab px-3 h-9 rounded-lg text-[12.5px] font-bold flex items-center gap-1.5"
        style="${code===_setLang?'background:var(--side);color:#fff':'background:var(--panel);border:1px solid var(--border);color:var(--text-soft)'}">
        <span class="opacity-60 text-[10px]">${c}</span> ${l}</button>`).join('');
    const right = `
      <span class="px-3 h-9 rounded-lg text-[13px] font-semibold flex items-center gap-1.5" style="background:var(--panel);border:1px solid var(--border);color:var(--text-soft)">
        <iconify-icon icon="solar:translation-linear" width="15"></iconify-icon> 언어 선택</span>
      <div class="flex items-center gap-1.5">${langTabs}</div>
      <button onclick="koFillBlanks()" class="px-3 h-9 rounded-lg text-[13px] font-semibold" style="background:var(--accent-soft);color:var(--accent-strong)">✦ KO → 빈칸 채우기</button>
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
            <li>다국어는 언어 탭(KO/EN/JA 등)을 전환하며 각 언어를 따로 입력합니다. <b style="color:var(--text)">✦ KO → 빈칸 채우기</b>를 누르면 비어있는 칸에 한국어 값이 복사되니, 그 위에 번역문을 덮어쓰면 편합니다. 홈페이지에서는 상단 지구본 아이콘으로 언어를 전환하며, 번역이 없는 항목은 한국어로 표시됩니다.</li>
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
        ${sectionTitle('solar:translation-linear','지점 정보 (다국어)')}
        <div class="grid md:grid-cols-2 gap-3.5">
          ${fieldCard('solar:map-point-linear','주소','addr1',{key2:'addr2', ph2:'상세주소를 입력해주세요.'})}
          ${fieldCard('solar:buildings-2-linear','상호명','biz')}
          ${fieldCard('solar:clock-circle-linear','운영시간 (평일)','hWeek')}
          ${fieldCard('solar:clock-circle-linear','운영시간 (주말 및 공휴일)','hWeekend')}
          ${fieldCard('solar:clock-circle-linear','운영시간 (추석, 설날 포함 공휴일)','hHoliday')}
          ${fieldCard('solar:info-circle-linear','추가정보','extra')}
        </div>

        ${sectionTitle('solar:link-circle-linear','연락처 & 링크 (모든 언어 공통)')}
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

        ${sectionTitle('solar:tag-linear','SEO')}
        <div class="grid md:grid-cols-2 gap-3.5">
          ${fieldCard('solar:tag-linear','SEO 키워드','seo',{hint:'쉼표(,)로 구분해 입력하세요. 예) 화정 피부, 고양 한의원, 화정 제모'})}
          ${fieldCard('solar:tag-linear','지점명 꼬리표','seoTail',{ph:'예) 연오재한의원', hint:'검색 결과 제목 뒤에 붙는 지점명입니다.'})}
          ${fieldCard('solar:map-point-linear','지역 키워드','seoLocal',{ph:'예) 화정 행신 원흥 삼송 덕양구 고양', hint:'공백으로 구분해 입력하세요.'})}
          ${fieldCard('solar:hashtag-linear','네이버 사이트 인증 코드','navVerify',{ph:'naver-site-verification 값', hint:'네이버 서치어드바이저의 메타태그 content 값만 붙여넣으세요.'})}
          ${fieldCard('solar:hashtag-linear','구글 사이트 인증 코드','gVerify',{ph:'google-site-verification 값', hint:'구글 서치콘솔의 메타태그 content 값만 붙여넣으세요.'})}
        </div>

        <div id="setPreview"></div>

        <div class="mt-7 rounded-xl px-4 py-3.5 text-[12.5px] flex items-center gap-2" style="background:var(--accent-soft); color:var(--accent-strong)">
          <iconify-icon icon="solar:info-circle-linear" width="16"></iconify-icon>
          값을 수정하고 <b>저장하기</b>를 누르면 홈페이지 하단·오시는 길·검색 설정에 반영됩니다. 다국어는 홈 상단 지구본 아이콘으로 전환됩니다.
        </div>
      </div>`;
    setFillDom();
    renderSetPreview();
    el.addEventListener('input', function(e){
      if(e.target && e.target.matches('[data-sk]')){ setDirty(true); setStashDom(); renderSetPreview(); }
    });
  };

  /* 다국어 언어 탭은 API 연동 작업 때 함께 구현 예정 — 동작하지 않는 버튼은 두지 않습니다 */
  function langRow(){ return ''; }
