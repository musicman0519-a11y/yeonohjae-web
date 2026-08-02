/* =========================================================================
   연오재 · Supabase 백엔드 연동 (localStorage 미러 + 이미지 업로드)
   - index.html / admin.html <head> 에 아래 2줄이 있어야 함:
       <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
       <script src="yeonohjae-supabase.js"></script>
   - 이 파일은 레포 최상위(index.html 과 같은 위치)에 둡니다.
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

  /* ===== 1) Supabase → localStorage 동기화 후, 바뀐 값 있으면 1회 새로고침 ===== */
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

  /* ===== 2) 저장(KK.set) 시 Supabase 에도 저장 ===== */
  function wrapKK(){
    var K = window.KK;
    if (!K){ try { if (typeof KK !== 'undefined') K = KK; } catch(e){} }
    if (!K || K.__sbWrapped) return !!(K && K.__sbWrapped);
    var origSet = K.set.bind(K);
    K.set = function(key, val){
      var ok = origSet(key, val);
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

  /* ===== 3) 이미지 업로드 헬퍼 =====
     사용법(관리자 화면에서): const url = await uploadImage(파일);  // 공개 URL 반환
     - media 버킷에 저장하고, 홈페이지에서 바로 쓸 수 있는 공개 주소를 돌려줍니다. */
  window.uploadImage = async function(file){
    if (!file) throw new Error('업로드할 파일이 없습니다.');
    var dot = (file.name || '').lastIndexOf('.');
    var ext = dot >= 0 ? file.name.slice(dot + 1).toLowerCase() : 'jpg';
    var rand = Math.random().toString(36).slice(2, 8);
    var path = 'uploads/' + Date.now() + '_' + rand + '.' + ext;
    var up = await sb.storage.from('media').upload(path, file, {
      cacheControl: '3600',
      upsert: false,
      contentType: file.type || undefined
    });
    if (up.error) throw up.error;
    var pub = sb.storage.from('media').getPublicUrl(path);
    return pub.data.publicUrl;
  };
})();
