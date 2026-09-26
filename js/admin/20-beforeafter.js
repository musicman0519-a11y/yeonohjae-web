  /* ---------- 시술전후 관리 (시술/진료 관리) ----------
     저장 키: KK 'ba' (목록) · 'baCats' (분류 탭) · 'baBlur' (블러) → 홈페이지 「시술전후」 목록·상세
     항목: {title, sub, cat, date, on, mode:'pair'|'single', layout:'h'|'v', imgB, imgA, imgC, body, recs:[상품id], loc}
     목록의 공개 스위치·순서·삭제·블러·분류는 즉시 저장, 글 편집은 「저장하기」로 저장 */
  const BA_CATS_DEFAULT = ['다이어트','리프팅/탄력/윤곽','미백/기미/색소','여드름/모공/흉터','제모/문신제거','기타'];
  let _baCat='', _baEdit=null, _baIdx=null, _baRecCat='', _baRecQ='';
  const baEsc = v => String(v==null?'':v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/"/g,'&quot;');
  function baAll(){ const l=KK.get('ba', []); return Array.isArray(l)? l : []; }
  function baCats(){
    const c=KK.get('baCats', null);
    const base=Array.isArray(c)&&c.length ? c.slice() : BA_CATS_DEFAULT.slice();
    baAll().forEach(b=>{ if(b.cat && base.indexOf(b.cat)<0) base.push(b.cat); });   /* 글에 쓰인 분류는 항상 포함 */
    return base;
  }
  function baPut(list, msg){ KK.set('ba', list); if(msg) toast(STORAGE_OK? msg : '미리보기 환경에선 저장이 제한됩니다.', STORAGE_OK); }
  function rerenderBA(){ const y=window.scrollY; const old=document.getElementById('view-beforeafter'); if(old) old.remove(); BUILDERS.beforeafter(); go('beforeafter'); window.scrollTo(0,y); }
  function baToggle(i,on){ const l=baAll(); if(!l[i]) return; l[i].on=on; baPut(l, on?'홈페이지에 공개했습니다.':'숨겼습니다.'); rerenderBA(); }
  function moveBA(i,d){ const l=baAll(), j=i+d; if(j<0||j>=l.length) return; const t=l[i]; l[i]=l[j]; l[j]=t; baPut(l,'순서를 바꿨습니다.'); rerenderBA(); }
  function deleteBA(i){ const l=baAll(), b=l[i]; if(!b) return; if(!confirm('「'+(b.title||'이 전후사진')+'」을 삭제할까요?\n홈페이지에서도 사라집니다.')) return; l.splice(i,1); baPut(l,'삭제했습니다.'); rerenderBA(); }
  function toggleBABlur(chk){ KK.set('baBlur', !!chk.checked); toast(chk.checked?'블러를 켰습니다. 홈페이지 전후사진이 흐리게 보입니다.':'블러를 껐습니다.'); rerenderBA(); }
  function baFilter(v){ _baCat=v||''; rerenderBA(); }
  function baThumb(b, h){
    h=h||150;
    const img=(src,label)=> src ? '<div style="position:relative;overflow:hidden"><img src="'+baEsc(src)+'" style="width:100%;height:100%;object-fit:cover;display:block" alt=""><span style="position:absolute;bottom:5px;left:6px;font-size:9px;font-weight:700;color:#fff;background:rgba(0,0,0,.5);padding:1px 6px;border-radius:4px">'+label+'</span></div>'
      : '<div style="display:grid;place-items:center;background:var(--panel-soft);font-size:10px;color:var(--muted)">'+label+'</div>';
    if(b.mode==='single') return '<div style="height:'+h+'px;overflow:hidden;background:var(--panel-soft)">'+(b.imgC?'<img src="'+baEsc(b.imgC)+'" style="width:100%;height:100%;object-fit:cover;display:block" alt="">':'')+'</div>';
    const v=b.layout==='v';
    return '<div style="height:'+h+'px;display:grid;gap:1px;background:#fff;'+(v?'grid-template-rows:1fr 1fr':'grid-template-columns:1fr 1fr')+'">'+img(b.imgB,'BEFORE')+img(b.imgA,'AFTER')+'</div>';
  }

  /* ----- 분류(카테고리) 관리 창 ----- */
  function openBACats(){
    peCss && peCss();
    let m=document.getElementById('baCatModal'); if(m) m.remove();
    m=document.createElement('div'); m.id='baCatModal'; m.className='fixed inset-0 z-[80] flex items-center justify-center bg-black/50 px-4';
    m.innerHTML='<div class="panel rounded-2xl w-full max-w-md" style="background:var(--panel)">'+
      '<div class="px-6 py-4 font-bold text-[16px]" style="border-bottom:1px solid var(--border)">시술전후 분류 관리</div>'+
      '<div class="p-6"><p class="text-[12.5px] mb-2" style="color:var(--muted)">한 줄에 하나씩 적어주세요. 위에서부터 홈페이지 탭 순서입니다.</p>'+
      '<textarea id="baCatText" rows="9" class="pmi">'+baEsc(baCats().join('\n'))+'</textarea></div>'+
      '<div class="flex justify-end gap-2 px-6 py-4" style="border-top:1px solid var(--border)">'+
        '<button onclick="document.getElementById(\'baCatModal\').remove()" class="px-4 h-9 rounded-lg text-[13px] font-semibold" style="background:var(--panel-soft);border:1px solid var(--border);color:var(--text-soft)">취소</button>'+
        '<button onclick="saveBACats()" class="px-5 h-9 rounded-lg text-[13px] font-semibold btn-gold">저장</button></div></div>';
    document.body.appendChild(m);
  }
  function saveBACats(){
    const list=document.getElementById('baCatText').value.split('\n').map(s=>s.trim()).filter(Boolean).filter((v,i,a)=>a.indexOf(v)===i);
    if(!list.length){ toast('분류를 하나 이상 적어주세요.', false); return; }
    KK.set('baCats', list); document.getElementById('baCatModal').remove(); toast('분류를 저장했습니다.'); rerenderBA();
  }
  function toggleBAHelp(){ const b=document.getElementById('baHelpBody'), t=document.getElementById('baHelpBtn'); const o=b.style.display==='none'; b.style.display=o?'':'none'; t.textContent=o?'닫기':'보기'; }

  BUILDERS.beforeafter = function(){
    kkModalCss(); if(typeof peCss==='function') peCss();
    const all=baAll().map((b,i)=>({b,i})), blurOn=!!KK.get('baBlur', false), cats=baCats();
    const rows=all.filter(({b})=>!_baCat || b.cat===_baCat);
    const el=makeView('beforeafter');
    const sw=(checked,on)=>'<input type="checkbox" class="pSw" '+(checked?'checked':'')+' onchange="'+on+'">';
    el.innerHTML=
      '<div class="rounded-xl mb-5" style="background:var(--panel);border:1px solid var(--border)">'+
        '<div class="px-5 py-3.5 flex items-center gap-3"><span class="text-[13.5px] font-bold">처음이라면 사용법 보기</span><span class="text-[13px]" style="color:var(--muted)">홈페이지에 노출할 시술 전후 사진을 관리합니다.</span>'+
        '<button id="baHelpBtn" onclick="toggleBAHelp()" class="ml-auto px-4 h-8 rounded-full text-[12.5px] font-bold text-white" style="background:var(--side)">보기</button></div>'+
        '<div id="baHelpBody" style="display:none;border-top:1px solid var(--border-soft)" class="px-6 py-4"><ol class="list-decimal pl-4 space-y-1.5 text-[13.5px]" style="color:var(--text-soft)">'+
          '<li>「+ 추가하기」에서 제목·분류와 BEFORE / AFTER 사진을 올리고 저장합니다. (이미 합쳐진 사진 1장도 가능)</li>'+
          '<li>본문에 치료 과정 설명·사진을 쓰고, 아래 「추천 시술」을 고르면 상세 페이지 아래에 시술 카드가 붙습니다.</li>'+
          '<li>카드의 스위치로 공개/숨김, ↑↓로 순서를 바꿉니다. 누르는 즉시 홈페이지에 반영됩니다.</li>'+
          '<li><b style="color:var(--text)">환자 동의를 받은 사진만</b> 올려 주세요. 의료광고 심의가 걱정되면 「블러 처리」를 켜세요.</li></ol></div>'+
      '</div>'+
      pageHead('시술전후 관리','', '<a href="/#ba" target="_blank" rel="noopener" class="px-4 h-9 rounded-lg text-[13px] font-semibold flex items-center gap-1.5" style="background:var(--panel);border:1px solid var(--border);color:var(--text-soft)"><iconify-icon icon="solar:link-linear" width="15"></iconify-icon> 홈페이지에서 보기</a>'+
        '<button onclick="openBAEditor(null)" class="px-4 h-9 rounded-lg text-[13px] font-semibold btn-gold flex items-center gap-1.5"><iconify-icon icon="solar:add-circle-linear" width="15"></iconify-icon> 추가하기</button>')+
      '<div class="rounded-xl px-5 py-3.5 mb-3 flex items-center gap-3" style="background:var(--panel);border:1px solid var(--border)">'+
        '<div class="flex-1"><p class="text-[13.5px] font-bold">전후 사진 블러 처리</p><p class="text-[12px]" style="color:var(--muted)">켜면 홈페이지의 모든 전후 사진이 흐리게 보입니다. (의료광고 대응)</p></div>'+
        '<span class="text-[12px] font-semibold" style="color:'+(blurOn?'var(--good)':'var(--muted)')+'">'+(blurOn?'ON':'OFF')+'</span>'+sw(blurOn,'toggleBABlur(this)')+
      '</div>'+
      '<div class="flex flex-wrap items-center gap-2 mb-4">'+
        '<select onchange="baFilter(this.value)" class="pmi" style="width:220px;background:var(--panel)"><option value="">전체 분류</option>'+cats.map(c=>'<option value="'+baEsc(c)+'"'+(c===_baCat?' selected':'')+'>'+baEsc(c)+'</option>').join('')+'</select>'+
        '<button onclick="openBACats()" class="px-4 h-10 rounded-lg text-[13px] font-semibold" style="background:var(--panel);border:1px solid var(--border);color:var(--text-soft)">분류 관리</button>'+
        '<span class="text-[12.5px] ml-1" style="color:var(--muted)">'+rows.length+'개</span>'+
      '</div>'+
      (rows.length ? '<div class="grid gap-4" style="grid-template-columns:repeat(auto-fill,minmax(270px,1fr))">'+rows.map(({b,i})=>
        '<div class="panel rounded-2xl overflow-hidden flex flex-col">'+
          '<div style="cursor:pointer'+(b.on===false?';opacity:.45':'')+'" onclick="openBAEditor('+i+')">'+baThumb(b,160)+'</div>'+
          '<div class="p-4 flex-1 flex flex-col">'+
            '<div class="flex items-center gap-1.5 flex-wrap"><span class="chip" style="background:var(--accent-soft);color:var(--accent-strong)">'+baEsc(b.cat||'미분류')+'</span>'+
              (b.date?'<span class="chip" style="background:var(--panel-soft);color:var(--muted)">'+baEsc(b.date)+'</span>':'')+
              ((b.recs||[]).length?'<span class="chip" style="background:var(--panel-soft);color:var(--muted)">추천 '+b.recs.length+'</span>':'')+'</div>'+
            '<p class="font-bold text-[15px] mt-2 truncate">'+baEsc(b.title||'')+'</p>'+
            '<p class="text-[12.5px] mt-0.5 truncate" style="color:var(--text-soft)">'+baEsc(b.sub||'')+'</p>'+
            '<div class="flex items-center justify-between mt-auto pt-3">'+
              '<label class="flex items-center gap-2 text-[12.5px]" style="color:var(--text-soft)">'+sw(b.on!==false,'baToggle('+i+',this.checked)')+' 공개</label>'+
              '<span class="flex gap-1.5">'+
                '<button class="peIco" onclick="moveBA('+i+',-1)" title="앞으로"><iconify-icon icon="solar:arrow-up-linear" width="14"></iconify-icon></button>'+
                '<button class="peIco" onclick="moveBA('+i+',1)" title="뒤로"><iconify-icon icon="solar:arrow-down-linear" width="14"></iconify-icon></button>'+
                '<button class="peIco" onclick="openBAEditor('+i+')" title="수정" style="background:var(--accent-soft);color:var(--accent-strong)"><iconify-icon icon="solar:pen-linear" width="14"></iconify-icon></button>'+
                '<button class="peIco bad" onclick="deleteBA('+i+')" title="삭제"><iconify-icon icon="solar:trash-bin-trash-linear" width="14"></iconify-icon></button>'+
              '</span>'+
            '</div>'+
          '</div>'+
        '</div>').join('')+'</div>'
      : '<div class="panel rounded-2xl p-16 text-center" style="color:var(--muted)">'+(_baCat?'해당 분류에 맞는 항목이 없습니다.':'등록된 전후사진이 없습니다. 「+ 추가하기」로 첫 사례를 올려보세요.<br><span class="text-[12px]">등록 전에는 홈페이지에 샘플 사례가 보입니다.</span>')+'</div>');
  };

  /* ===================== 추가 / 수정 화면 ===================== */
  function baBlank(){ return {title:'', sub:'', cat:'', date:'', on:true, mode:'pair', layout:'h', imgB:'', imgA:'', imgC:'', body:'', recs:[], loc:'화정'}; }
  function openBAEditor(i){
    const l=baAll();
    _baIdx=(i===null||i===undefined||!l[i]) ? null : i;
    _baEdit=Object.assign(baBlank(), _baIdx===null ? {} : JSON.parse(JSON.stringify(l[_baIdx])));
    if(!Array.isArray(_baEdit.recs)) _baEdit.recs=[];
    if(!_baEdit.mode) _baEdit.mode = _baEdit.imgC && !_baEdit.imgB ? 'single' : 'pair';
    _baRecCat=''; _baRecQ='';
    buildBAEditor();
  }
  function baStash(){
    const g=id=>document.getElementById(id); if(!g('baT') || !_baEdit) return;
    _baEdit.title=g('baT').value.trim(); _baEdit.sub=g('baSub').value.trim(); _baEdit.cat=g('baCat').value; _baEdit.date=g('baDate').value.trim(); _baEdit.on=g('baOn').checked;
    const m=document.querySelector('input[name=baMode]:checked'); if(m) _baEdit.mode=m.value;
    const lo=document.querySelector('input[name=baLayout]:checked'); if(lo) _baEdit.layout=lo.value;
    let b=g('baBodyEd').innerHTML.trim(); if(b==='<br>'||b==='<p><br></p>') b=''; _baEdit.body=b;
  }
  function baSet(k,v){ baStash(); _baEdit[k]=v; buildBAEditor(true); }
  async function baPickImg(input, key){
    const f=input.files&&input.files[0]; input.value=''; if(!f) return;
    if(typeof window.uploadImage!=='function'){ toast('이미지 업로드 기능을 사용할 수 없습니다. (Supabase 연결 확인)', false); return; }
    toast('사진 업로드 중…');
    try{ const url=await window.uploadImage(f); baStash(); _baEdit[key]=url; buildBAEditor(true); toast('사진을 넣었습니다. 「저장하기」를 눌러야 반영됩니다.'); }
    catch(e){ console.error(e); toast('이미지 업로드 실패: '+((e&&e.message)||e), false); }
  }
  async function baAddBodyImages(input){
    const files=Array.from(input.files||[]); input.value=''; if(!files.length) return;
    if(typeof window.uploadImage!=='function'){ toast('이미지 업로드 기능을 사용할 수 없습니다. (Supabase 연결 확인)', false); return; }
    let ok=0;
    for(const f of files){ try{ const url=await window.uploadImage(f); const ed=document.getElementById('baBodyEd'); if(ed){ ed.insertAdjacentHTML('beforeend','<p><img src="'+baEsc(url)+'" alt=""></p>'); ok++; } }catch(e){ toast('「'+f.name+'」 업로드 실패', false); } }
    if(ok) toast('본문에 사진 '+ok+'장을 넣었습니다.');
  }
  function baProducts(){ try{ return (typeof productsGet==='function') ? productsGet() : (KK.get('products',[])||[]); }catch(e){ return []; } }
  function baRecList(){
    const box=document.getElementById('baRecList'); if(!box) return;
    const q=_baRecQ.toLowerCase();
    const list=baProducts().filter(p=>p.on!==false && (!_baRecCat || p.cat===_baRecCat) && (!q || [p.big,p.title,p.pageTitle].join(' ').toLowerCase().includes(q)));
    box.innerHTML = list.length ? list.map(p=>{
      const added=_baEdit.recs.indexOf(p.id)>=0;
      return '<div class="flex items-center gap-2.5 px-3 py-2" style="border-top:1px solid var(--border-soft)">'+
        (p.img?'<img src="'+baEsc(p.img)+'" alt="" style="width:36px;height:36px;object-fit:cover;border-radius:7px;flex:0 0 auto">':'<span style="width:36px;height:36px;border-radius:7px;background:var(--panel-soft);flex:0 0 auto"></span>')+
        '<span class="flex-1 min-w-0 text-[13px] truncate">'+baEsc(p.pageTitle||p.big||p.title||'')+'</span>'+
        (added?'<span class="text-[12px] font-semibold px-2" style="color:var(--good)">추가됨</span>'
              :'<button onclick="baRecAdd(\''+baEsc(p.id)+'\')" class="px-3 h-8 rounded-full text-[12px] font-semibold" style="background:var(--panel);border:1px solid var(--border);color:var(--text-soft)">추가</button>')+
      '</div>';
    }).join('') : '<p class="text-center py-8 text-[12.5px]" style="color:var(--muted)">조건에 맞는 시술이 없습니다.</p>';
  }
  function baRecFilter(){ _baRecCat=document.getElementById('baRecCat').value; _baRecQ=document.getElementById('baRecQ').value.trim(); baRecList(); }
  function baRecAdd(id){ baStash(); if(_baEdit.recs.indexOf(id)<0) _baEdit.recs.push(id); buildBAEditor(true); }
  function baRecDel(i){ baStash(); _baEdit.recs.splice(i,1); buildBAEditor(true); }
  function baRecMove(i,d){ baStash(); const j=i+d; if(j<0||j>=_baEdit.recs.length) return; const t=_baEdit.recs[i]; _baEdit.recs[i]=_baEdit.recs[j]; _baEdit.recs[j]=t; buildBAEditor(true); }
  function baBack(){ if(!confirm('저장하지 않은 변경사항은 사라집니다. 목록으로 돌아갈까요?')) return; _baEdit=null; rerenderBA(); }
  function baSave(){
    baStash(); const b=_baEdit;
    if(!b.title){ toast('제목을 입력해주세요.', false); return; }
    if(!b.cat){ toast('분류를 선택해주세요.', false); return; }
    if(b.mode==='single' ? !b.imgC : (!b.imgB || !b.imgA)){ toast(b.mode==='single'?'전후 사진(1장)을 올려주세요.':'BEFORE / AFTER 사진을 모두 올려주세요.', false); return; }
    const l=baAll();
    if(_baIdx===null) l.unshift(b); else l[_baIdx]=Object.assign({}, l[_baIdx], b);
    baPut(l, _baIdx===null ? '등록했습니다. 홈페이지 「시술전후」에 바로 보입니다.' : '수정했습니다.');
    _baEdit=null; rerenderBA();
  }
  function buildBAEditor(keepScroll){
    kkModalCss(); if(typeof peCss==='function') peCss();
    const y=window.scrollY;
    const old=document.getElementById('view-baedit'); if(old) old.remove();
    const el=makeView('baedit'), b=_baEdit, cats=baCats(), pcats=(typeof productCats==='function')?productCats():[];
    const soft='style="background:var(--panel);border:1px solid var(--border);color:var(--text-soft)"';
    const upBox=(key,label,ratio)=>'<div><p class="pml">'+label+' <span style="color:var(--bad)">*</span></p>'+
      '<div onclick="document.getElementById(\'baF_'+key+'\').click()" class="rounded-xl overflow-hidden grid place-items-center cursor-pointer" style="aspect-ratio:'+ratio+';background:var(--panel-soft);border:1px dashed var(--border)">'+
        (b[key]?'<img src="'+baEsc(b[key])+'" style="width:100%;height:100%;object-fit:cover;display:block" alt="">':'<p class="text-[12px] text-center" style="color:var(--muted)">눌러서 사진 올리기</p>')+'</div>'+
      '<input id="baF_'+key+'" type="file" accept="image/*" class="hidden" onchange="baPickImg(this,\''+key+'\')"></div>';
    const radio=(name,val,cur,label,sub,fn)=>'<label class="flex items-center gap-2 text-[13.5px] cursor-pointer"><input type="radio" name="'+name+'" value="'+val+'" '+(cur===val?'checked':'')+' onchange="'+fn+'" class="accent-[var(--accent)]"> '+label+(sub?' <span class="text-[12px]" style="color:var(--muted)">'+sub+'</span>':'')+'</label>';
    el.innerHTML=
      '<div class="flex items-center gap-3 mb-3"><button onclick="baBack()" class="w-9 h-9 rounded-lg grid place-items-center" '+soft+'><iconify-icon icon="solar:arrow-left-linear" width="18"></iconify-icon></button>'+
        '<h1 class="text-xl font-extrabold tracking-tight">시술전후 '+(_baIdx===null?'추가':'수정')+'</h1></div>'+
      '<p class="text-[13px] mb-5" style="color:var(--muted)">위에서부터 채우고 맨 아래 <b style="color:var(--text)">저장하기</b>를 누르세요. <b style="color:var(--text)">*</b> 표시만 꼭 채우면 돼요.</p>'+
      '<div class="grid lg:grid-cols-2 gap-5">'+
        '<div class="panel rounded-2xl p-6 space-y-3">'+
          '<h2 class="text-[16px] font-bold mb-1">① 기본 정보</h2>'+
          '<div><label class="pml">제목 *</label><input id="baT" value="'+baEsc(b.title)+'" placeholder="예) 홍조개선 전후" class="pmi"></div>'+
          '<div><label class="pml">한 줄 설명</label><input id="baSub" value="'+baEsc(b.sub)+'" placeholder="예) 볼 및 나비존 붉은 기 진정" class="pmi"></div>'+
          '<div class="grid grid-cols-2 gap-3"><div><label class="pml">분류 *</label><select id="baCat" class="pmi"><option value="">분류 선택</option>'+cats.map(c=>'<option value="'+baEsc(c)+'"'+(c===b.cat?' selected':'')+'>'+baEsc(c)+'</option>').join('')+'</select></div>'+
            '<div><label class="pml">촬영일 (선택)</label><input id="baDate" value="'+baEsc(b.date)+'" placeholder="예) 26.02.06" class="pmi"></div></div>'+
          '<label class="inline-flex items-center gap-2 text-[13.5px] pt-1" style="color:var(--text-soft)"><input id="baOn" type="checkbox" '+(b.on!==false?'checked':'')+' class="pSw"> 홈페이지에 공개</label>'+
        '</div>'+
        '<div class="panel rounded-2xl p-6">'+
          '<h2 class="text-[16px] font-bold mb-3">② 전후 사진</h2>'+
          '<div class="flex flex-wrap gap-x-5 gap-y-2 mb-3">'+radio('baMode','pair',b.mode,'BEFORE · AFTER 따로 올리기','','baSet(\'mode\',\'pair\')')+radio('baMode','single',b.mode,'합쳐진 사진 1장','','baSet(\'mode\',\'single\')')+'</div>'+
          (b.mode==='single'
            ? upBox('imgC','전후 사진 (이미 합쳐진 1장)','4/3')
            : '<div class="flex flex-wrap gap-x-5 gap-y-2 mb-3 text-[13px]"><span class="pml" style="margin:0">합성 방향</span>'+radio('baLayout','h',b.layout,'가로','(좌 = Before, 우 = After)','baSet(\'layout\',\'h\')')+radio('baLayout','v',b.layout,'세로','(상 = Before, 하 = After)','baSet(\'layout\',\'v\')')+'</div>'+
              '<div class="grid grid-cols-2 gap-3">'+upBox('imgB','BEFORE','1/1')+upBox('imgA','AFTER','1/1')+'</div>'+
              '<p class="pml mt-4">홈페이지 목록 미리보기</p><div class="rounded-xl overflow-hidden" style="border:1px solid var(--border)">'+baThumb(b,170)+'</div>')+
          '<p class="text-[11.5px] mt-3 break-keep" style="color:var(--muted)">※ 환자 동의를 받은 사진만 올려 주세요. 전후 사진은 의료광고 심의 대상이 될 수 있습니다.</p>'+
        '</div>'+
      '</div>'+
      '<div class="panel rounded-2xl p-6 mt-5">'+
        '<div class="flex items-center justify-between mb-1 flex-wrap gap-2"><h2 class="text-[16px] font-bold">③ 본문 (치료 과정 설명 · 사진)</h2>'+
          '<button onclick="document.getElementById(\'baBodyFiles\').click()" class="px-4 h-9 rounded-lg text-[13px] font-semibold btn-gold">사진 올리기 (여러 장 가능)</button>'+
          '<input id="baBodyFiles" type="file" accept="image/*" multiple class="hidden" onchange="baAddBodyImages(this)"></div>'+
        '<p class="text-[12.5px] mb-3" style="color:var(--muted)">상세 페이지에 보일 내용입니다. 예) 치료 전 상태 → 치료 방법 → 치료 후 변화 → 시술 정보. 비워 두면 사진과 주의 문구만 보입니다.</p>'+
        (typeof rteBar==='function'?rteBar('baBodyEd'):'')+
        '<div id="baBodyEd" class="rteEd" contenteditable="true" style="min-height:260px" onmouseup="rteSaveSel&&rteSaveSel(\'baBodyEd\')" onkeyup="rteSaveSel&&rteSaveSel(\'baBodyEd\')" onblur="rteSaveSel&&rteSaveSel(\'baBodyEd\')">'+(b.body||'')+'</div>'+
      '</div>'+
      '<div class="panel rounded-2xl p-6 mt-5">'+
        '<h2 class="text-[16px] font-bold">④ 추천 시술 (선택)</h2>'+
        '<p class="text-[12.5px] mt-1 mb-4" style="color:var(--muted)">상세 페이지 아래에 카드로 보이고, 누르면 그 시술 상세 페이지로 이동합니다.</p>'+
        '<div class="flex flex-wrap gap-2 mb-3"><select id="baRecCat" onchange="baRecFilter()" class="pmi" style="width:220px"><option value="">전체 카테고리</option>'+pcats.map(c=>'<option value="'+baEsc(c)+'"'+(c===_baRecCat?' selected':'')+'>'+baEsc(c)+'</option>').join('')+'</select>'+
          '<input id="baRecQ" value="'+baEsc(_baRecQ)+'" oninput="baRecFilter()" placeholder="시술명 검색" class="pmi" style="width:220px"></div>'+
        '<div class="grid lg:grid-cols-2 gap-4">'+
          '<div class="rounded-xl overflow-hidden" style="border:1px solid var(--border)"><p class="px-3 py-2 text-[12.5px] font-bold" style="background:var(--panel-soft)">시술 목록</p><div id="baRecList" style="max-height:300px;overflow-y:auto"></div></div>'+
          '<div class="rounded-xl overflow-hidden" style="border:1px solid var(--border)"><p class="px-3 py-2 text-[12.5px] font-bold" style="background:var(--panel-soft)">선택된 추천 시술 ('+b.recs.length+')</p>'+
            (b.recs.length ? b.recs.map((id,i)=>{ const p=baProducts().find(x=>x.id===id);
              return '<div class="flex items-center gap-2.5 px-3 py-2" style="border-top:1px solid var(--border-soft)">'+
                (p&&p.img?'<img src="'+baEsc(p.img)+'" alt="" style="width:36px;height:36px;object-fit:cover;border-radius:7px;flex:0 0 auto">':'<span style="width:36px;height:36px;border-radius:7px;background:var(--panel-soft);flex:0 0 auto"></span>')+
                '<span class="flex-1 min-w-0 text-[13px] truncate">'+(p?baEsc(p.pageTitle||p.big||p.title):'<span style="color:var(--bad)">(삭제된 시술)</span>')+'</span>'+
                '<button class="peIco" onclick="baRecMove('+i+',-1)"><iconify-icon icon="solar:arrow-up-linear" width="14"></iconify-icon></button>'+
                '<button class="peIco" onclick="baRecMove('+i+',1)"><iconify-icon icon="solar:arrow-down-linear" width="14"></iconify-icon></button>'+
                '<button class="peIco bad" onclick="baRecDel('+i+')"><iconify-icon icon="solar:trash-bin-trash-linear" width="14"></iconify-icon></button></div>'; }).join('')
              : '<p class="text-center py-10 text-[12.5px]" style="color:var(--muted)">왼쪽 목록에서 「추가」를 눌러 선택하세요.</p>')+
          '</div>'+
        '</div>'+
      '</div>'+
      '<div class="peBarBottom">'+
        '<button onclick="baBack()" class="px-5 h-10 rounded-lg text-[13px] font-semibold" style="background:var(--panel-soft);border:1px solid var(--border);color:var(--text-soft)">취소</button>'+
        '<button onclick="baSave()" class="px-6 h-10 rounded-lg text-[13px] font-semibold btn-gold flex items-center gap-1.5"><iconify-icon icon="solar:upload-minimalistic-linear" width="15"></iconify-icon> 저장하기</button>'+
      '</div>';
    baRecList();
    if(typeof renderIcons==='function') renderIcons(el);
    go('baedit');
    if(keepScroll) window.scrollTo(0,y);
  }
