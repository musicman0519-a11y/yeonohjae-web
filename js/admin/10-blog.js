  /* ---------- 블로그 (외부 블로그 글 링크 관리 → front 시술노트 사이드) ---------- */
  function blogSyncInline(base){
    document.querySelectorAll('#view-blog [data-brow]').forEach(tr=>{
      const i = parseInt(tr.dataset.brow);
      if(!base[i]) return;
      const on = tr.querySelector('[data-bf="on"]');
      if(on) base[i].on = on.checked;
    });
    return base;
  }
  function saveBlog(){
    const base = blogSyncInline(KK.get('blog', []));
    KK.set('blog', base);
    toast(STORAGE_OK? '블로그 글이 저장됐습니다. 홈페이지 「시술 노트」 옆에 노출됩니다.' : '미리보기 환경에선 저장이 제한됩니다.', STORAGE_OK);
  }
  function rerenderBlog(){
    const old = document.getElementById('view-blog');
    if(old) old.remove();
    BUILDERS.blog();
    go('blog');
  }
  function moveBlogPost(i, d){
    const base = blogSyncInline(KK.get('blog', []));
    const j = i + d;
    if(j < 0 || j >= base.length) return;
    const tmp = base[i]; base[i] = base[j]; base[j] = tmp;
    KK.set('blog', base);
    rerenderBlog();
  }
  function deleteBlogPost(i){
    const base = blogSyncInline(KK.get('blog', []));
    const b = base[i]; if(!b) return;
    if(!confirm('「'+(b.t||'이 글')+'」 블로그 글을 삭제할까요?')) return;
    base.splice(i,1);
    KK.set('blog', base);
    rerenderBlog();
    toast('블로그 글을 삭제하고 저장했습니다.');
  }

  /* ----- 블로그 글 추가/수정 모달 ----- */
  let _blogEditIdx = null, _blogImg = '';
  function ensureBlogModal(){
    if(document.getElementById('blogModal')) return;
    kkModalCss();
    const wrap = document.createElement('div');
    wrap.id = 'blogModal';
    wrap.className = 'hidden fixed inset-0 z-[80] items-center justify-center bg-black/50 px-4';
    wrap.innerHTML =
      `<div class="panel rounded-2xl w-full max-w-xl max-h-[92vh] overflow-y-auto no-sb" style="background:var(--panel)">
        <div class="flex items-center justify-between px-6 py-4" style="border-bottom:1px solid var(--border)">
          <h3 id="bgTitle" class="text-[17px] font-bold">블로그 글 추가</h3>
          <button onclick="closeBlogModal()" class="w-8 h-8 rounded-lg grid place-items-center" style="color:var(--muted)"><iconify-icon icon="solar:close-circle-linear" width="20"></iconify-icon></button>
        </div>
        <div class="p-6 space-y-4">
          <div class="flex gap-4 items-start">
            <div class="shrink-0">
              <div id="bgImgPreview" class="w-28 h-28 rounded-xl overflow-hidden grid place-items-center" style="background:var(--panel-soft);border:1px solid var(--border)"></div>
              <button id="bgImgBtn" onclick="document.getElementById('bgImgFile').click()" class="mt-2 w-28 py-2 rounded-lg text-[12.5px] font-semibold btn-gold">썸네일 업로드</button>
              <button onclick="clearBlogImg()" class="mt-1 w-28 py-1.5 rounded-lg text-[11.5px]" style="background:var(--panel-soft);border:1px solid var(--border);color:var(--text-soft)">썸네일 제거</button>
              <input id="bgImgFile" type="file" accept="image/*" class="hidden" onchange="handleBlogImage(this)">
            </div>
            <div class="flex-1 space-y-3">
              <div><label class="pml">제목 *</label><input id="bgT" class="pmi" placeholder="예) 화정 온다 리프팅 후기"></div>
              <div><label class="pml">블로그 글 주소(URL) *</label><input id="bgUrl" class="pmi" placeholder="예) https://blog.naver.com/..."></div>
              <label class="flex items-center gap-2 text-[13.5px]" style="color:var(--text-soft)"><input id="bgOn" type="checkbox" class="accent-[var(--accent)]" checked> 홈페이지에 노출</label>
            </div>
          </div>
          <p class="text-[11.5px]" style="color:var(--muted)">네이버 블로그 등 외부 글 주소를 등록하면 홈페이지 「시술 노트」 페이지 옆 「블로그 최신 글」에 노출되고, 누르면 해당 글이 새 창으로 열립니다.</p>
        </div>
        <div class="flex items-center justify-end gap-2 px-6 py-4" style="border-top:1px solid var(--border)">
          <button onclick="closeBlogModal()" class="px-4 h-9 rounded-lg text-[13px] font-semibold" style="background:var(--panel-soft);border:1px solid var(--border);color:var(--text-soft)">취소</button>
          <button onclick="submitBlogModal()" class="px-5 h-9 rounded-lg text-[13px] font-semibold btn-gold">저장 (홈 반영)</button>
        </div>
      </div>`;
    document.body.appendChild(wrap);
  }
  function renderBlogImgPreview(){
    const box = document.getElementById('bgImgPreview');
    if(!box) return;
    box.innerHTML = _blogImg
      ? `<img src="${_blogImg}" style="width:100%;height:100%;object-fit:cover;display:block" alt="">`
      : `<div class="text-center px-2"><iconify-icon icon="solar:gallery-linear" width="24" style="color:var(--muted)"></iconify-icon><p class="text-[11px] mt-1" style="color:var(--muted)">썸네일 없음</p></div>`;
  }
  function clearBlogImg(){ _blogImg=''; renderBlogImgPreview(); }
  async function handleBlogImage(input){
    const file = input.files && input.files[0];
    if(!file) return;
    if(typeof window.uploadImage !== 'function'){ toast('이미지 업로드 기능을 사용할 수 없습니다. (Supabase 연결 확인)', false); input.value=''; return; }
    const btn = document.getElementById('bgImgBtn');
    const prev = btn.innerHTML; btn.innerHTML='업로드 중…'; btn.disabled=true;
    try{
      const url = await window.uploadImage(file);
      _blogImg = url; renderBlogImgPreview();
      toast('썸네일이 업로드됐습니다.');
    }catch(e){
      console.error(e); toast('이미지 업로드 실패: '+((e&&e.message)||e), false);
    }finally{
      btn.innerHTML=prev; btn.disabled=false; input.value='';
    }
  }
  function openBlogModal(idx){
    ensureBlogModal();
    const base = KK.get('blog', []);
    _blogEditIdx = (idx===undefined || idx===null) ? null : idx;
    const blank = {t:'', url:'', img:'', on:true};
    const b = _blogEditIdx===null ? blank : Object.assign({}, blank, base[_blogEditIdx]);
    _blogImg = b.img || '';
    document.getElementById('bgTitle').textContent = _blogEditIdx===null ? '블로그 글 추가' : '블로그 글 수정';
    document.getElementById('bgT').value = b.t||'';
    document.getElementById('bgUrl').value = b.url||'';
    document.getElementById('bgOn').checked = b.on!==false;
    renderBlogImgPreview();
    const m = document.getElementById('blogModal');
    m.classList.remove('hidden'); m.classList.add('flex');
  }
  function closeBlogModal(){
    const m = document.getElementById('blogModal');
    if(m){ m.classList.add('hidden'); m.classList.remove('flex'); }
  }
  function submitBlogModal(){
    const t = document.getElementById('bgT').value.trim();
    let url = document.getElementById('bgUrl').value.trim();
    if(!t){ toast('제목을 입력해주세요.', false); return; }
    if(!url){ toast('블로그 글 주소(URL)를 입력해주세요.', false); return; }
    if(!/^https?:\/\//i.test(url)) url = 'https://' + url;
    const d = new Date();
    const today = d.getFullYear()+'.'+String(d.getMonth()+1).padStart(2,'0')+'.'+String(d.getDate()).padStart(2,'0');
    const base = blogSyncInline(KK.get('blog', []));
    const rec = {
      t: t, url: url, img: _blogImg||'',
      on: document.getElementById('bgOn').checked,
      date: (_blogEditIdx!==null && base[_blogEditIdx] && base[_blogEditIdx].date) || today,
    };
    if(_blogEditIdx===null) base.unshift(rec);
    else base[_blogEditIdx] = Object.assign({}, base[_blogEditIdx], rec);
    KK.set('blog', base);
    closeBlogModal();
    rerenderBlog();
    toast(_blogEditIdx===null ? '블로그 글을 등록하고 저장했습니다.' : '블로그 글을 수정하고 저장했습니다.');
  }

  BUILDERS.blog = function(){
    ensureBlogModal();
    const posts = KK.get('blog', []);
    const el = makeView('blog');
    const thumb = (b)=> b.img
      ? `<img src="${b.img}" class="w-12 h-12 rounded-lg object-cover" style="border:1px solid var(--border)" alt="">`
      : `<div class="w-12 h-12 rounded-lg grid place-items-center" style="background:var(--panel-soft);border:1px solid var(--border)"><iconify-icon icon="solar:notebook-linear" width="16" style="color:var(--muted)"></iconify-icon></div>`;
    el.innerHTML = pageHead('블로그 관리','네이버 블로그 등 외부 글을 등록하고 노출을 관리합니다. (저장 시 홈 반영)',
      `<button onclick="openBlogModal(null)" class="px-4 h-9 rounded-lg text-[13px] font-semibold btn-gold flex items-center gap-1.5"><iconify-icon icon="solar:add-circle-linear" width="15"></iconify-icon> 새 글 추가</button>
       <button onclick="saveBlog()" class="px-4 h-9 rounded-lg text-[13px] font-semibold flex items-center gap-1.5" style="background:var(--panel);border:1px solid var(--border);color:var(--text-soft)"><iconify-icon icon="solar:upload-minimalistic-linear" width="15"></iconify-icon> 노출 저장</button>`) +
      `<div class="panel rounded-2xl overflow-hidden"><div class="overflow-x-auto">
        <table class="tbl w-full text-[13.5px] whitespace-nowrap">
          <thead><tr style="background:var(--panel-soft);color:var(--muted)">
            <th class="px-4 py-3.5 font-semibold">순서</th><th class="px-4 py-3.5 font-semibold">썸네일</th><th class="px-4 py-3.5 font-semibold">제목</th><th class="px-4 py-3.5 font-semibold">URL</th><th class="px-4 py-3.5 font-semibold">등록일</th><th class="px-4 py-3.5 font-semibold">노출</th><th class="px-4 py-3.5 font-semibold text-right">관리</th>
          </tr></thead>
          <tbody>${posts.length ? posts.map((b,i)=>`<tr style="border-top:1px solid var(--border-soft)" data-brow="${i}">
            <td class="px-4 py-3"><div class="flex items-center gap-1"><span class="w-6 h-6 rounded-full grid place-items-center text-[12px] font-semibold" style="background:var(--accent-soft);color:var(--accent-strong)">${i+1}</span>
              <button onclick="moveBlogPost(${i},-1)" class="w-7 h-7 rounded-lg grid place-items-center" style="background:var(--panel-soft);border:1px solid var(--border);color:var(--text-soft)"><iconify-icon icon="solar:arrow-up-linear" width="13"></iconify-icon></button>
              <button onclick="moveBlogPost(${i},1)" class="w-7 h-7 rounded-lg grid place-items-center" style="background:var(--panel-soft);border:1px solid var(--border);color:var(--text-soft)"><iconify-icon icon="solar:arrow-down-linear" width="13"></iconify-icon></button></div></td>
            <td class="px-4 py-3">${thumb(b)}</td>
            <td class="px-4 py-3.5 font-semibold">${b.t||''}</td>
            <td class="px-4 py-3.5"><a href="${(b.url||'#').replace(/"/g,'&quot;')}" target="_blank" rel="noopener" class="underline" style="color:var(--blue)">${(b.url||'').length>38 ? (b.url||'').slice(0,38)+'…' : (b.url||'')}</a></td>
            <td class="px-4 py-3.5" style="color:var(--text-soft)">${b.date||'-'}</td>
            <td class="px-4 py-3.5"><label class="inline-flex items-center gap-1.5 text-[12.5px]" style="color:var(--text-soft)"><input type="checkbox" data-bf="on" ${b.on!==false?'checked':''} class="accent-[var(--accent)]"> 노출</label></td>
            <td class="px-4 py-3.5"><div class="flex items-center justify-end gap-1.5">
              <button onclick="openBlogModal(${i})" class="w-8 h-8 rounded-lg grid place-items-center" style="background:var(--accent-soft);color:var(--accent-strong)"><iconify-icon icon="solar:pen-linear" width="14"></iconify-icon></button>
              <button onclick="deleteBlogPost(${i})" class="w-8 h-8 rounded-lg grid place-items-center text-white" style="background:var(--bad)"><iconify-icon icon="solar:trash-bin-trash-linear" width="14"></iconify-icon></button>
            </div></td>
          </tr>`).join('') : `<tr><td colspan="7" class="text-center py-16" style="color:var(--muted)">등록된 글이 없습니다. 「새 글 추가」로 블로그 글 주소를 등록하세요.</td></tr>`}</tbody>
        </table>
      </div></div>`;
  };
