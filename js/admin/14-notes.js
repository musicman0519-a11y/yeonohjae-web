  /* ---------- 시술노트 (글+사진 에디터 → front /notes page) ---------- */
  function kkModalCss(){
    if(document.getElementById('kkModalCss')) return;
    const st = document.createElement('style');
    st.id = 'kkModalCss';
    st.textContent = '.pml{display:block;font-size:12.5px;font-weight:600;margin-bottom:5px;color:var(--text-soft)} .pmi{width:100%;padding:9px 12px;border-radius:9px;font-size:13.5px;background:var(--panel-soft);border:1px solid var(--border);color:var(--text);outline:none} .pmi:focus{border-color:var(--accent)}'
      + ' .ntTb{padding:0 10px;height:30px;border-radius:8px;font-size:12px;font-weight:600;background:var(--panel-soft);border:1px solid var(--border);color:var(--text-soft)} .ntTb:hover{color:var(--accent-strong);border-color:var(--accent)}'
      + ' .peEd{min-height:160px;max-height:320px;overflow-y:auto;padding:12px 14px;border-radius:10px;font-size:13.5px;line-height:1.7;background:var(--panel);border:1px solid var(--border);color:var(--text)} .peEd:focus{outline:none;border-color:var(--accent)} .peEd h3{font-weight:800;font-size:15px;margin:14px 0 6px} .peEd p{margin:6px 0} .peEd img{max-width:100%;border-radius:10px;margin:8px 0} .peEd hr{border:0;border-top:1px solid var(--border);margin:14px 0} #ntBody,#inBody,#dcBody{min-height:220px;max-height:340px;overflow-y:auto;padding:12px 14px;border-radius:10px;font-size:13.5px;line-height:1.7;background:var(--panel-soft);border:1px solid var(--border);color:var(--text)}'
      + ' #ntBody:focus,#inBody:focus,#dcBody:focus{outline:none;border-color:var(--accent)}'
      + ' #ntBody h3,#inBody h3,#dcBody h3{font-weight:800;font-size:15px;margin:14px 0 6px} #ntBody p,#inBody p,#dcBody p{margin:6px 0} #ntBody img,#inBody img,#dcBody img{max-width:100%;border-radius:10px;margin:8px 0} #ntBody hr,#inBody hr,#dcBody hr{border:0;border-top:1px solid var(--border);margin:14px 0}';
    document.head.appendChild(st);
  }
  /* ---------- 시술 노트 (마케팅/홍보) ----------
     저장 키: KK 'notes' → site_kv → 홈페이지 「시술 노트」 목록·상세 (index.html)
     항목: {t 제목, sub 요약, img 대표이미지, body 본문HTML, on 공개, date, recs:[상품id], kw '키워드,키워드'}
     목록의 공개 스위치·순서·삭제는 즉시 저장, 글 편집은 「저장하기」로 저장 */
  let _ntQ='', _ntPage=1, _ntEdit=null, _ntIdx=null, _ntRecCat='', _ntRecQ='';
  const NT_PER=12;
  const ntEsc = v => String(v==null?'':v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/"/g,'&quot;');
  function ntAll(){ const l=KK.get('notes', DEFAULT_NOTES); return Array.isArray(l)? l : []; }
  function ntPut(list, msg){ KK.set('notes', list); if(msg) toast(STORAGE_OK? msg : '미리보기 환경에선 저장이 제한됩니다.', STORAGE_OK); }
  function rerenderNotes(){
    const y=window.scrollY;
    const old=document.getElementById('view-notes'); if(old) old.remove();
    BUILDERS.notes(); go('notes'); window.scrollTo(0,y);
  }
  function ntToggle(i, on){ const l=ntAll(); if(!l[i]) return; l[i].on=on; ntPut(l, on?'글을 공개했습니다.':'글을 숨겼습니다.'); rerenderNotes(); }
  function moveNote(i, d){ const l=ntAll(), j=i+d; if(j<0||j>=l.length) return; const t=l[i]; l[i]=l[j]; l[j]=t; ntPut(l,'순서를 바꿨습니다.'); rerenderNotes(); }
  function deleteNote(i){
    const l=ntAll(), n=l[i]; if(!n) return;
    if(!confirm('「'+(n.t||'이 글')+'」 글을 삭제할까요?\n삭제하면 홈페이지에서도 사라집니다.')) return;
    l.splice(i,1); ntPut(l,'글을 삭제했습니다.'); rerenderNotes();
  }
  function ntSearch(v){ _ntQ=(v||'').trim().toLowerCase(); _ntPage=1; ntRenderList(); }
  function ntGo(p){ _ntPage=p; ntRenderList(); window.scrollTo(0,0); }
  function ntHasBody(n){ const b=String(n.body||''); return b.replace(/<[^>]*>/g,'').trim().length>0 || b.indexOf('<img')>=0; }

  function ntRenderList(){
    const box=document.getElementById('ntList'); if(!box) return;
    const all=ntAll().map((n,i)=>({n,i}));
    const rows=all.filter(({n})=>!_ntQ || [n.t,n.sub,n.kw].join(' ').toLowerCase().includes(_ntQ));
    const pages=Math.max(1,Math.ceil(rows.length/NT_PER)); if(_ntPage>pages) _ntPage=pages;
    const slice=rows.slice((_ntPage-1)*NT_PER, _ntPage*NT_PER);
    document.getElementById('ntMeta').textContent='전체 '+rows.length+'개'+(pages>1?' · '+_ntPage+' / '+pages+' 페이지':'');
    box.innerHTML = slice.length ? slice.map(({n,i})=>{
      const recN=(n.recs||[]).length;
      return '<div class="flex items-center gap-3 px-4 py-3" style="border-top:1px solid var(--border-soft)">'+
        (n.img ? '<img src="'+ntEsc(n.img)+'" alt="" style="width:52px;height:52px;object-fit:cover;border-radius:8px;border:1px solid var(--border);flex:0 0 auto">'
               : '<div style="width:52px;height:52px;border-radius:8px;border:1px solid var(--border);background:var(--panel-soft);flex:0 0 auto" class="grid place-items-center text-[10px] font-bold text-center leading-tight px-1" >'+ntEsc(String(n.t||'').slice(0,6))+'</div>')+
        '<div class="min-w-0 flex-1">'+
          '<p class="text-[14px] font-semibold truncate cursor-pointer" onclick="openNoteEditor('+i+')">'+ntEsc(n.t||'(제목 없음)')+'</p>'+
          '<p class="text-[12px] truncate mt-0.5" style="color:var(--muted)">'+ntEsc(n.sub||'')+'</p>'+
          '<div class="flex flex-wrap gap-1.5 mt-1.5">'+
            '<span class="chip" style="background:'+(ntHasBody(n)?'var(--good-bg)':'var(--bad-bg)')+';color:'+(ntHasBody(n)?'var(--good)':'var(--bad)')+'">'+(ntHasBody(n)?'본문 있음':'본문 없음')+'</span>'+
            (recN?'<span class="chip" style="background:var(--accent-soft);color:var(--accent-strong)">추천 시술 '+recN+'</span>':'')+
            (n.date?'<span class="chip" style="background:var(--panel-soft);color:var(--muted)">'+ntEsc(n.date)+'</span>':'')+
          '</div>'+
        '</div>'+
        '<label class="ppSw" title="공개/숨김"><input type="checkbox" '+(n.on!==false?'checked':'')+' onchange="ntToggle('+i+',this.checked)"><span></span></label>'+
        '<button onclick="moveNote('+i+',-1)" class="peIco" title="위로"><iconify-icon icon="solar:arrow-up-linear" width="14"></iconify-icon></button>'+
        '<button onclick="moveNote('+i+',1)" class="peIco" title="아래로"><iconify-icon icon="solar:arrow-down-linear" width="14"></iconify-icon></button>'+
        '<button onclick="openNoteEditor('+i+')" class="peIco" title="수정" style="background:var(--accent-soft);color:var(--accent-strong)"><iconify-icon icon="solar:pen-linear" width="14"></iconify-icon></button>'+
        '<button onclick="deleteNote('+i+')" class="peIco bad" title="삭제"><iconify-icon icon="solar:trash-bin-trash-linear" width="14"></iconify-icon></button>'+
      '</div>';
    }).join('') : '<p class="text-center py-14 text-[13px]" style="color:var(--muted)">'+(_ntQ?'검색 결과가 없습니다.':'등록된 글이 없습니다. 「+ 새 글 쓰기」로 첫 글을 등록하세요.')+'</p>';
    const pg=document.getElementById('ntPager');
    if(pg) pg.innerHTML = pages>1 ? '<button class="px-4 h-9 rounded-full text-[13px] font-semibold" style="background:var(--panel);border:1px solid var(--border);color:var(--text-soft)'+(_ntPage===1?';opacity:.4':'')+'" '+(_ntPage===1?'disabled':'onclick="ntGo('+(_ntPage-1)+')"')+'>이전</button>'+
      '<span class="text-[13px]" style="color:var(--muted)">'+_ntPage+' / '+pages+'</span>'+
      '<button class="px-4 h-9 rounded-full text-[13px] font-semibold" style="background:var(--panel);border:1px solid var(--border);color:var(--text-soft)'+(_ntPage===pages?';opacity:.4':'')+'" '+(_ntPage===pages?'disabled':'onclick="ntGo('+(_ntPage+1)+')"')+'>다음</button>' : '';
    if(typeof renderIcons==='function') renderIcons(box);
  }

  BUILDERS.notes = function(){
    kkModalCss(); if(typeof peCss==='function') peCss();
    if(typeof BUILDERS.popups==='function' && !document.getElementById('ppCss')){ /* 스위치 모양(ppSw) 스타일 공유 */
      const st=document.createElement('style'); st.id='ppCss';
      st.textContent='.ppSw{position:relative;display:inline-block;width:40px;height:22px;flex-shrink:0;cursor:pointer}.ppSw input{opacity:0;width:0;height:0;position:absolute}.ppSw span{position:absolute;inset:0;border-radius:999px;background:#cfc8bd;transition:.2s}.ppSw span:before{content:"";position:absolute;width:16px;height:16px;left:3px;top:3px;border-radius:50%;background:#fff;box-shadow:0 1px 2px rgba(0,0,0,.25);transition:.2s}.ppSw input:checked+span{background:#1fae78}.ppSw input:checked+span:before{transform:translateX(18px)}';
      document.head.appendChild(st);
    }
    const el=makeView('notes');
    el.innerHTML = pageHead('시술 노트 관리','시술을 설명하는 글(아티클)을 쓰고 관리합니다. 공개 스위치·순서·삭제는 누르는 즉시 홈페이지에 반영됩니다.',
        '<a href="/#notes" target="_blank" rel="noopener" class="px-4 h-9 rounded-lg text-[13px] font-semibold flex items-center gap-1.5" style="background:var(--panel);border:1px solid var(--border);color:var(--text-soft)"><iconify-icon icon="solar:link-linear" width="15"></iconify-icon> 홈페이지에서 보기</a>'+
        '<button onclick="openNoteEditor(null)" class="px-4 h-9 rounded-lg text-[13px] font-semibold btn-gold flex items-center gap-1.5"><iconify-icon icon="solar:add-circle-linear" width="15"></iconify-icon> 새 글 쓰기</button>')+
      '<input value="'+ntEsc(_ntQ)+'" oninput="ntSearch(this.value)" placeholder="제목·요약·키워드로 검색" class="pmi mb-2" style="background:var(--panel)">'+
      '<p id="ntMeta" class="text-[12.5px] mb-3" style="color:var(--muted)"></p>'+
      '<div class="panel rounded-2xl overflow-hidden" style="border-top:0"><div id="ntList"></div></div>'+
      '<div id="ntPager" class="flex items-center justify-center gap-3 mt-5"></div>';
    ntRenderList();
  };

  /* ===================== 글 쓰기 / 수정 화면 ===================== */
  function ntBlank(){ return {t:'', sub:'', img:'', body:'', on:true, recs:[], kw:''}; }
  function openNoteEditor(i){
    const l=ntAll();
    _ntIdx = (i===null||i===undefined||!l[i]) ? null : i;
    _ntEdit = Object.assign(ntBlank(), _ntIdx===null ? {} : JSON.parse(JSON.stringify(l[_ntIdx])));
    if(!Array.isArray(_ntEdit.recs)) _ntEdit.recs=[];
    _ntRecCat=''; _ntRecQ='';
    buildNoteEditor();
  }
  function ntStash(){
    const g=id=>document.getElementById(id); if(!g('ntT') || !_ntEdit) return;
    _ntEdit.t=g('ntT').value.trim(); _ntEdit.sub=g('ntSub').value.trim(); _ntEdit.kw=g('ntKw').value.trim();
    _ntEdit.on=g('ntOn').checked;
    let b=g('ntBodyEd').innerHTML.trim(); if(b==='<br>'||b==='<p><br></p>') b=''; _ntEdit.body=b;
  }
  function ntProducts(){ try{ return (typeof productsGet==='function') ? productsGet() : (KK.get('products',[])||[]); }catch(e){ return []; } }
  function ntRecList(){
    const box=document.getElementById('ntRecList'); if(!box) return;
    const q=_ntRecQ.toLowerCase();
    const list=ntProducts().filter(p=>p.on!==false && (!_ntRecCat || p.cat===_ntRecCat) && (!q || [p.big,p.title,p.pageTitle].join(' ').toLowerCase().includes(q)));
    box.innerHTML = list.length ? list.map(p=>{
      const added=_ntEdit.recs.indexOf(p.id)>=0;
      return '<div class="flex items-center gap-2.5 px-3 py-2" style="border-top:1px solid var(--border-soft)">'+
        (p.img?'<img src="'+ntEsc(p.img)+'" alt="" style="width:36px;height:36px;object-fit:cover;border-radius:7px;flex:0 0 auto">':'<span style="width:36px;height:36px;border-radius:7px;background:var(--panel-soft);flex:0 0 auto"></span>')+
        '<span class="flex-1 min-w-0 text-[13px] truncate">'+ntEsc(p.pageTitle||p.big||p.title||'')+'</span>'+
        (added?'<span class="text-[12px] font-semibold px-2" style="color:var(--good)">추가됨</span>'
              :'<button onclick="ntRecAdd(\''+ntEsc(p.id)+'\')" class="px-3 h-8 rounded-full text-[12px] font-semibold" style="background:var(--panel);border:1px solid var(--border);color:var(--text-soft)">추가</button>')+
      '</div>';
    }).join('') : '<p class="text-center py-8 text-[12.5px]" style="color:var(--muted)">조건에 맞는 시술이 없습니다.</p>';
  }
  function ntRecFilter(){ _ntRecCat=document.getElementById('ntRecCat').value; _ntRecQ=document.getElementById('ntRecQ').value.trim(); ntRecList(); }
  function ntRecAdd(id){ ntStash(); if(_ntEdit.recs.indexOf(id)<0) _ntEdit.recs.push(id); buildNoteEditor(true); }
  function ntRecDel(i){ ntStash(); _ntEdit.recs.splice(i,1); buildNoteEditor(true); }
  function ntRecMove(i,d){ ntStash(); const j=i+d; if(j<0||j>=_ntEdit.recs.length) return; const t=_ntEdit.recs[i]; _ntEdit.recs[i]=_ntEdit.recs[j]; _ntEdit.recs[j]=t; buildNoteEditor(true); }
  async function ntPickCover(input){
    const f=input.files&&input.files[0]; input.value=''; if(!f) return;
    if(typeof window.uploadImage!=='function'){ toast('이미지 업로드 기능을 사용할 수 없습니다. (Supabase 연결 확인)', false); return; }
    toast('대표 이미지 업로드 중…');
    try{ const url=await window.uploadImage(f); ntStash(); _ntEdit.img=url; buildNoteEditor(true); toast('대표 이미지를 넣었습니다. 「저장하기」를 눌러야 반영됩니다.'); }
    catch(e){ console.error(e); toast('이미지 업로드 실패: '+((e&&e.message)||e), false); }
  }
  function ntClearCover(){ ntStash(); _ntEdit.img=''; buildNoteEditor(true); }
  async function ntAddBodyImages(input){
    const files=Array.from(input.files||[]); input.value=''; if(!files.length) return;
    if(typeof window.uploadImage!=='function'){ toast('이미지 업로드 기능을 사용할 수 없습니다. (Supabase 연결 확인)', false); return; }
    let ok=0;
    for(const f of files){
      toast('본문 사진 올리는 중… ('+(ok+1)+'/'+files.length+')');
      try{ const url=await window.uploadImage(f); const ed=document.getElementById('ntBodyEd'); if(ed){ ed.insertAdjacentHTML('beforeend','<p><img src="'+ntEsc(url)+'" alt=""></p>'); ok++; } }
      catch(e){ console.error(e); toast('「'+f.name+'」 업로드 실패', false); }
    }
    if(ok) toast('본문에 사진 '+ok+'장을 넣었습니다.');
  }
  function ntBack(){ if(!confirm('저장하지 않은 변경사항은 사라집니다. 목록으로 돌아갈까요?')) return; _ntEdit=null; rerenderNotes(); }
  function ntSave(){
    ntStash();
    if(!_ntEdit.t){ toast('제목을 입력해주세요.', false); return; }
    const l=ntAll(), d=new Date();
    const today=d.getFullYear()+'.'+String(d.getMonth()+1).padStart(2,'0')+'.'+String(d.getDate()).padStart(2,'0');
    _ntEdit.kw=_ntEdit.kw.split(/[,，]/).map(s=>s.trim()).filter(Boolean).join(', ');
    if(_ntIdx===null){ _ntEdit.date=today; l.unshift(_ntEdit); }
    else l[_ntIdx]=Object.assign({}, l[_ntIdx], _ntEdit, {date:l[_ntIdx].date||today});
    ntPut(l, _ntIdx===null ? '글을 등록했습니다. 홈페이지 「시술 노트」에 바로 보입니다.' : '글을 수정했습니다.');
    _ntEdit=null; _ntQ=''; _ntPage=1;
    rerenderNotes();
  }
  function buildNoteEditor(keepScroll){
    kkModalCss(); if(typeof peCss==='function') peCss();
    const y=window.scrollY;
    const old=document.getElementById('view-noteedit'); if(old) old.remove();
    const el=makeView('noteedit'), n=_ntEdit;
    const cats=(typeof productCats==='function') ? productCats() : [];
    const soft='style="background:var(--panel);border:1px solid var(--border);color:var(--text-soft)"';
    const prod=id=>ntProducts().find(p=>p.id===id);
    el.innerHTML =
      '<div class="flex items-center gap-3 mb-3">'+
        '<button onclick="ntBack()" class="w-9 h-9 rounded-lg grid place-items-center" '+soft+'><iconify-icon icon="solar:arrow-left-linear" width="18"></iconify-icon></button>'+
        '<h1 class="text-xl font-extrabold tracking-tight">시술 노트 '+(_ntIdx===null?'쓰기':'수정')+'</h1>'+
      '</div>'+
      '<p class="text-[13px] mb-5" style="color:var(--muted)">블로그 글 쓰듯 위에서부터 채우고 맨 아래 <b style="color:var(--text)">저장하기</b>를 누르세요. <b style="color:var(--text)">*</b> 표시만 꼭 채우면 돼요.</p>'+

      '<div class="panel rounded-2xl p-6">'+
        '<h2 class="text-[16px] font-bold mb-4">① 대표 이미지 · 제목</h2>'+
        '<div class="grid md:grid-cols-[180px_1fr] gap-6">'+
          '<div>'+
            '<div onclick="document.getElementById(\'ntCoverFile\').click()" class="w-full rounded-xl overflow-hidden grid place-items-center cursor-pointer" style="aspect-ratio:1/1;background:var(--panel-soft);border:1px dashed var(--border)">'+
              (n.img?'<img src="'+ntEsc(n.img)+'" style="width:100%;height:100%;object-fit:cover;display:block" alt="">':'<p class="text-[11.5px] text-center" style="color:var(--muted)">눌러서 사진 올리기<br>정사각형 권장<br>(없으면 기본 이미지)</p>')+
            '</div>'+
            '<input id="ntCoverFile" type="file" accept="image/*" class="hidden" onchange="ntPickCover(this)">'+
            (n.img?'<button onclick="ntClearCover()" class="mt-2 w-full py-1.5 rounded-lg text-[12px]" '+soft+'>사진 빼기</button>':'')+
          '</div>'+
          '<div class="space-y-3">'+
            '<div><label class="pml">제목 *</label><input id="ntT" value="'+ntEsc(n.t)+'" placeholder="예) 여드름흉터 치료, 어떻게 개선할까?" class="pmi"></div>'+
            '<div><label class="pml">요약 (목록 카드에 보이는 한 줄)</label><input id="ntSub" value="'+ntEsc(n.sub)+'" placeholder="예) 패인 흉터가 생기는 이유와 개선 방법을 정리했어요." class="pmi"></div>'+
            '<div><label class="pml">대표 키워드 (쉼표로 구분 · 글 아래 #태그로 표시, 검색에도 사용)</label><input id="ntKw" value="'+ntEsc(n.kw)+'" placeholder="예) 여드름흉터, 화정 피부, 흉터치료" class="pmi"></div>'+
            '<label class="inline-flex items-center gap-2 text-[13.5px]" style="color:var(--text-soft)"><input id="ntOn" type="checkbox" '+(n.on!==false?'checked':'')+' class="pSw"> 홈페이지에 공개</label>'+
          '</div>'+
        '</div>'+
      '</div>'+

      '<div class="panel rounded-2xl p-6 mt-5">'+
        '<div class="flex items-center justify-between mb-1 flex-wrap gap-2">'+
          '<h2 class="text-[16px] font-bold">② 본문 (글 · 사진)</h2>'+
          '<button onclick="document.getElementById(\'ntBodyFiles\').click()" class="px-4 h-9 rounded-lg text-[13px] font-semibold btn-gold">사진 올리기 (여러 장 가능)</button>'+
          '<input id="ntBodyFiles" type="file" accept="image/*" multiple class="hidden" onchange="ntAddBodyImages(this)">'+
        '</div>'+
        '<p class="text-[12.5px] mb-3" style="color:var(--muted)">블로그처럼 자유롭게 쓰세요. 소제목은 도구막대의 「Normal → 제목 2」, 사진은 위 버튼이나 도구막대의 사진 아이콘으로 넣습니다.</p>'+
        (typeof rteBar==='function' ? rteBar('ntBodyEd') : '')+
        '<div id="ntBodyEd" class="rteEd" contenteditable="true" style="min-height:320px" onmouseup="rteSaveSel&&rteSaveSel(\'ntBodyEd\')" onkeyup="rteSaveSel&&rteSaveSel(\'ntBodyEd\')" onblur="rteSaveSel&&rteSaveSel(\'ntBodyEd\')">'+(n.body||'')+'</div>'+
      '</div>'+

      '<div class="panel rounded-2xl p-6 mt-5">'+
        '<h2 class="text-[16px] font-bold">③ 추천 시술 (선택)</h2>'+
        '<p class="text-[12.5px] mt-1 mb-4" style="color:var(--muted)">글 아래에 카드로 보여지고, 누르면 그 시술 상세 페이지로 이동합니다. 글을 읽은 분이 바로 시술을 볼 수 있어요.</p>'+
        '<div class="flex flex-wrap gap-2 mb-3">'+
          '<select id="ntRecCat" onchange="ntRecFilter()" class="pmi" style="width:220px"><option value="">전체 카테고리</option>'+cats.map(c=>'<option value="'+ntEsc(c)+'"'+(c===_ntRecCat?' selected':'')+'>'+ntEsc(c)+'</option>').join('')+'</select>'+
          '<input id="ntRecQ" value="'+ntEsc(_ntRecQ)+'" oninput="ntRecFilter()" placeholder="시술명 검색" class="pmi" style="width:220px">'+
        '</div>'+
        '<div class="grid lg:grid-cols-2 gap-4">'+
          '<div class="rounded-xl overflow-hidden" style="border:1px solid var(--border)">'+
            '<p class="px-3 py-2 text-[12.5px] font-bold" style="background:var(--panel-soft)">시술 목록</p>'+
            '<div id="ntRecList" style="max-height:300px;overflow-y:auto"></div>'+
          '</div>'+
          '<div class="rounded-xl overflow-hidden" style="border:1px solid var(--border)">'+
            '<p class="px-3 py-2 text-[12.5px] font-bold" style="background:var(--panel-soft)">선택된 추천 시술 ('+n.recs.length+')</p>'+
            (n.recs.length ? n.recs.map((id,i)=>{ const p=prod(id);
              return '<div class="flex items-center gap-2.5 px-3 py-2" style="border-top:1px solid var(--border-soft)">'+
                (p&&p.img?'<img src="'+ntEsc(p.img)+'" alt="" style="width:36px;height:36px;object-fit:cover;border-radius:7px;flex:0 0 auto">':'<span style="width:36px;height:36px;border-radius:7px;background:var(--panel-soft);flex:0 0 auto"></span>')+
                '<span class="flex-1 min-w-0 text-[13px] truncate">'+(p?ntEsc(p.pageTitle||p.big||p.title):'<span style="color:var(--bad)">(삭제된 시술)</span>')+'</span>'+
                '<button class="peIco" onclick="ntRecMove('+i+',-1)"><iconify-icon icon="solar:arrow-up-linear" width="14"></iconify-icon></button>'+
                '<button class="peIco" onclick="ntRecMove('+i+',1)"><iconify-icon icon="solar:arrow-down-linear" width="14"></iconify-icon></button>'+
                '<button class="peIco bad" onclick="ntRecDel('+i+')"><iconify-icon icon="solar:trash-bin-trash-linear" width="14"></iconify-icon></button>'+
              '</div>'; }).join('')
              : '<p class="text-center py-10 text-[12.5px]" style="color:var(--muted)">왼쪽 목록에서 「추가」를 눌러 선택하세요.</p>')+
          '</div>'+
        '</div>'+
      '</div>'+

      '<div class="peBarBottom">'+
        '<button onclick="ntBack()" class="px-5 h-10 rounded-lg text-[13px] font-semibold" style="background:var(--panel-soft);border:1px solid var(--border);color:var(--text-soft)">취소</button>'+
        '<button onclick="ntSave()" class="px-6 h-10 rounded-lg text-[13px] font-semibold btn-gold flex items-center gap-1.5"><iconify-icon icon="solar:upload-minimalistic-linear" width="15"></iconify-icon> 저장하기</button>'+
      '</div>';
    ntRecList();
    if(typeof renderIcons==='function') renderIcons(el);
    go('noteedit');
    if(keepScroll) window.scrollTo(0,y);
  }
