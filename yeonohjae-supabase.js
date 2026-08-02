/* =========================================================================
   연오재 · Supabase 백엔드 연동 (localStorage 미러 방식)
   - index.html 과 admin.html 의 <head> 끝(</head> 바로 위)에 아래 2줄 추가:
       <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
       <script src="yeonohjae-supabase.js"></script>
   - 이 파일은 레포 최상위(index.html 과 같은 위치)에 둡니다.
   동작: 관리자 저장 → Supabase 업로드 / 방문자 접속 → Supabase에서 받아와 반영.
   ========================================================================= */
(function(){
  var SUPABASE_URL = 'https://funutqwltjmcfgxihcrr.supabase.co';
  var SUPABASE_KEY = 'sb_publishable_eVAu4Hgs7FZ13DBJdsTalQ_WjvVKfN4';
  var NS = 'kkeut:';

  if (!window.supabase || !window.supabase.createClient){
    console.warn('[연오재] Supabase 라이브러리가 로드되지 않았습니다. CDN <script>가 이 파일보다 먼저 있는지 확인하세요.');
    return;
  }
  var sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
  window.__sb = sb;

  /* 1) Supabase → localStorage 동기화 후, 바뀐 값이 있으면 1회 새로고침 */
  sb.from('site_kv').select('key,value').then(function(res){
    if (res.error){ console.warn('[연오재] 불러오기 오류:', res.error.message); return; }
    var changed = false;
    (res.data || []).forEach(function(row){
      try {
        var cur  = localStorage.getItem(NS + row.key);
        var next = JSON.stringify(row.value);
        if (cur !== next){ localStorage.setItem(NS + row.key, next); changed = true; }
      } catch(e){}
    });
    if (changed){
      try {
        var n = parseInt(sessionStorage.getItem('sb_reload') || '0', 10);
        if (n < 3){ sessionStorage.setItem('sb_reload', String(n + 1)); location.reload(); return; }
      } catch(e){ location.reload(); return; }
    } else {
      try { sessionStorage.setItem('sb_reload', '0'); } catch(e){}
    }
  });

  /* 2) 저장(KK.set) 시 Supabase 에도 함께 저장되도록 확장 */
  function wrapKK(){
    var K = window.KK;
    if (!K){ try { if (typeof KK !== 'undefined') K = KK; } catch(e){} }
    if (!K || K.__sbWrapped) return !!(K && K.__sbWrapped);
    var origSet = K.set.bind(K);
    K.set = function(key, val){
      var ok = origSet(key, val); /* 기존 localStorage 저장 유지 */
      try {
        sb.from('site_kv')
          .upsert({ key: key, value: val, updated_at: new Date().toISOString() })
          .then(function(r){ if (r && r.error) console.warn('[연오재] 저장 오류:', r.error.message); });
      } catch(e){ console.warn('[연오재] 저장 예외:', e); }
      return ok;
    };
    K.__sbWrapped = true;
    return true;
  }
  if (!wrapKK()){
    document.addEventListener('DOMContentLoaded', wrapKK);
    setTimeout(wrapKK, 800);
  }
})();
