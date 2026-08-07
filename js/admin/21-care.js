  /* ---------- 시술 후 주의사항 관리 (store-backed → front /care page) ---------- */
  function saveCare(){
    const arr=[];
    document.querySelectorAll('#view-care [data-care]').forEach(tr=>{
      arr.push({ title:tr.dataset.care, on:tr.querySelector('[data-cf="on"]').checked, body:tr.querySelector('[data-cf="body"]').value.trim() });
    });
    KK.set('care', arr);
    toast(STORAGE_OK? '저장됐습니다. 홈페이지 「시술 후 주의사항」에 반영됩니다.' : '미리보기 환경에선 저장이 제한됩니다.', STORAGE_OK);
  }
  BUILDERS.care = function(){
    const rows = KK.get('care', DEFAULT_CARE);
    const dates = ['2025. 11. 4.','2025. 11. 4.','2025. 11. 12.','2025. 6. 4.','2025. 6. 4.','2025. 6. 4.','2025. 6. 4.','2025. 6. 4.','2025. 12. 13.'];
    const el = makeView('care');
    el.innerHTML = pageHead('시술 후 주의사항 관리','시술별 주의사항 문서를 관리합니다. (내용·공개 수정 → 저장 시 홈 반영)', `<div class="flex items-center gap-1.5"></div>
      <button onclick="saveCare()" class="px-4 h-9 rounded-lg text-[13px] font-semibold btn-gold flex items-center gap-1.5"><iconify-icon icon="solar:upload-minimalistic-linear" width="15"></iconify-icon> 전체 저장 (홈 반영)</button>`) +
      `<div class="panel rounded-2xl overflow-hidden"><table class="tbl w-full text-[14px]">
        <thead><tr style="background:var(--panel-soft);color:var(--muted)"><th class="px-6 py-3.5 font-semibold">제목 (KO)</th><th class="px-4 py-3.5 font-semibold text-center w-20">순서</th><th class="px-4 py-3.5 font-semibold w-28">작성일</th><th class="px-4 py-3.5 font-semibold text-center w-20">공개</th></tr></thead>
        <tbody>${rows.map((r,i)=>`<tr style="border-top:1px solid var(--border-soft)" data-care="${(r.title||'').replace(/"/g,'&quot;')}">
          <td class="px-6 py-3.5">
            <p class="font-medium break-keep mb-1.5">${r.title}</p>
            <textarea data-cf="body" rows="2" class="w-full px-3 py-2 rounded-lg text-[12.5px] break-keep" style="background:var(--panel-soft);border:1px solid var(--border);color:var(--text-soft)">${r.body||''}</textarea>
          </td>
          <td class="px-4 py-3.5 text-center align-top"><span class="inline-flex items-center gap-1"><span class="w-6 h-6 rounded-full grid place-items-center text-[12px] font-semibold" style="background:var(--accent-soft);color:var(--accent-strong)">${i+1}</span></span></td>
          <td class="px-4 py-3.5 align-top" style="color:var(--text-soft)">${dates[i]||'-'}</td>
          <td class="px-4 py-3.5 text-center align-top"><input type="checkbox" data-cf="on" ${r.on!==false?'checked':''} class="accent-[var(--accent)]"></td>
        </tr>`).join('')}</tbody>
      </table></div>
      <p class="text-[12px] mt-3" style="color:var(--muted)">※ 내용을 수정하고 저장하면 홈페이지 「시술 후 주의사항」 페이지에 그대로 노출됩니다.</p>`;
  };
