  /* ---------- 고객 만족도 조사 (store-backed) ---------- */
  const DEFAULT_SURVEYS = [
    {id:'s1', kind:'설문', at:'2026-06-25 20:04', name:'김강률', doc:5, mgr:5, cordi:0, nurse:0, staff:0, good:'원장선생님이 정말 친절하셨어요', bad:'', who:''},
    {id:'s2', kind:'설문', at:'2026-06-23 19:14', name:'황미진', doc:5, mgr:5, cordi:5, nurse:5, staff:5, good:'시설도 깨끗하고 직원분들이 세심하게 케어해주셨어요', bad:'', who:''}
  ];
  let _svKind='설문';

  function surveysGet(){
    const s=KK.get('surveys', null);
    if(!Array.isArray(s)) return JSON.parse(JSON.stringify(DEFAULT_SURVEYS));
    return s.map(x=>Object.assign({id:'s'+Math.random().toString(36).slice(2,7), kind:'설문', at:'', name:'', doc:0,mgr:0,cordi:0,nurse:0,staff:0, good:'', bad:'', who:''}, x));
  }
  function surveysPut(list, msg){
    KK.set('surveys', list);
    if(msg) toast(STORAGE_OK? msg : '미리보기 환경에선 저장이 제한됩니다.', STORAGE_OK);
  }
  function rerenderSurveys(){
    const old=document.getElementById('view-satisfaction'); if(old) old.remove();
    BUILDERS.satisfaction(); go('satisfaction');
  }
  function svSetKind(k){ _svKind=k; rerenderSurveys(); }
  function svDelete(id){
    const list=surveysGet();
    const i=list.findIndex(x=>x.id===id); if(i<0) return;
    if(!confirm('「'+(list[i].name||'이 응답')+'」 설문 응답을 삭제할까요?')) return;
    list.splice(i,1);
    surveysPut(list, '응답을 삭제했습니다.');
    rerenderSurveys();
  }
  function svAdd(){
    const name=prompt('고객명을 입력하세요 (종이 설문·카톡 응답을 옮겨 적을 때 사용)');
    if(!name || !name.trim()) return;
    const ask=(label)=>{ const v=prompt(label+' 별점 (0~5)','5'); const n=parseInt(v); return isNaN(n)?0:Math.max(0,Math.min(5,n)); };
    const doc=ask('원장'), mgr=ask('상담실장'), cordi=ask('코디'), nurse=ask('간호사'), staff=ask('스태프');
    const good=prompt('잘한 점 (홈페이지 리뷰로 쓸 수 있습니다)') || '';
    const bad=prompt('개선점') || '';
    const d=new Date(); const z=n=>String(n).padStart(2,'0');
    const at=d.getFullYear()+'-'+z(d.getMonth()+1)+'-'+z(d.getDate())+' '+z(d.getHours())+':'+z(d.getMinutes());
    const list=surveysGet();
    list.unshift({id:'s'+Date.now().toString(36), kind:_svKind, at:at, name:name.trim(), doc,mgr,cordi,nurse,staff, good:good.trim(), bad:bad.trim(), who:''});
    surveysPut(list, '설문 응답을 등록했습니다.');
    rerenderSurveys();
  }
  function exportReviews(){
    const rows = surveysGet().filter(r=>r.good && r.good.trim());
    if(!rows.length){ toast('홈에 내보낼 「잘한 점」이 적힌 응답이 없습니다.', false); return; }
    const reviews = rows.map(r=>({ n:(r.name||'고')[0]+'**', t:r.good.trim() }));
    const merged = [...reviews, ...DEFAULT_REVIEWS].slice(0,8);
    KK.set('reviews', merged);
    toast(STORAGE_OK? rows.length+'건을 홈페이지 상단 리뷰 띠에 반영했습니다.' : '미리보기 환경에선 저장이 제한됩니다.', STORAGE_OK);
  }

  BUILDERS.satisfaction = function(){
    const all=surveysGet();
    const rows=all.filter(r=>(r.kind||'설문')===_svKind);
    const esc=v=>String(v==null?'':v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/"/g,'&quot;');
    const cnt=k=>all.filter(r=>(r.kind||'설문')===k).length;
    const star = v => '<span class="chip inline-flex items-center gap-0.5" style="background:'+(v>0?'var(--good-bg)':'#fbe9e7')+';color:'+(v>0?'var(--good)':'#c0362c')+'"><iconify-icon icon="solar:star-'+(v>0?'bold':'linear')+'" width="11"></iconify-icon> '+v+'</span>';
    const tab=(k,label)=>'<button onclick="svSetKind(\''+k+'\')" class="px-3 h-9 rounded-lg text-[13px] font-semibold" style="'+
      (_svKind===k?'background:var(--side);color:#fff':'background:var(--panel);border:1px solid var(--border);color:var(--muted)')+'">'+label+' ('+cnt(k)+')</button>';
    const el = makeView('satisfaction');
    el.innerHTML = pageHead('설문 응답 목록','고객 만족도 조사 응답을 확인하고, 좋은 후기를 홈페이지 리뷰로 내보냅니다.',
      tab('설문','고객 만족도 조사')+
      tab('카카오','카카오 상담 만족도')+
      '<button onclick="svAdd()" class="px-3 h-9 rounded-lg text-[13px] font-semibold flex items-center gap-1.5" style="background:var(--panel);border:1px solid var(--border);color:var(--text-soft)"><iconify-icon icon="solar:add-circle-linear" width="15"></iconify-icon> 응답 등록</button>'+
      '<button onclick="exportReviews()" class="px-3 h-9 rounded-lg text-[13px] font-semibold btn-gold flex items-center gap-1.5"><iconify-icon icon="solar:upload-minimalistic-linear" width="15"></iconify-icon> 리뷰로 홈 노출</button>') +
      '<div class="panel rounded-2xl overflow-hidden">'+
        '<p class="px-5 pt-4 text-[12.5px]" style="color:var(--muted)">'+_svKind+' '+rows.length+'건 · <b style="color:var(--accent-strong)">"리뷰로 홈 노출"</b>을 누르면 「잘한 점」이 홈 상단 리뷰 띠에 표시됩니다</p>'+
        '<div class="overflow-x-auto"><table class="tbl w-full text-[13.5px] mt-2 whitespace-nowrap">'+
          '<thead><tr style="background:var(--panel-soft);color:var(--muted)">'+
            ['작성일','고객명','원장','상담실장','코디','간호사','스태프','잘한 점','개선점','관리'].map(h=>'<th class="px-4 py-3 font-semibold">'+h+'</th>').join('')+
          '</tr></thead>'+
          '<tbody>'+
          (rows.length ? rows.map(r=>
            '<tr style="border-top:1px solid var(--border-soft)">'+
              '<td class="px-4 py-3.5" style="color:var(--text-soft)">'+esc(r.at)+'</td>'+
              '<td class="px-4 py-3.5 font-medium">'+esc(r.name)+'</td>'+
              '<td class="px-4 py-3.5">'+star(r.doc)+'</td>'+
              '<td class="px-4 py-3.5">'+star(r.mgr)+'</td>'+
              '<td class="px-4 py-3.5">'+star(r.cordi)+'</td>'+
              '<td class="px-4 py-3.5">'+star(r.nurse)+'</td>'+
              '<td class="px-4 py-3.5">'+star(r.staff)+'</td>'+
              '<td class="px-4 py-3.5 whitespace-normal break-keep min-w-[220px]" style="color:var(--text-soft)">'+esc(r.good)+'</td>'+
              '<td class="px-4 py-3.5 whitespace-normal break-keep min-w-[160px]" style="color:var(--text-soft)">'+esc(r.bad)+'</td>'+
              '<td class="px-4 py-3.5"><button onclick="svDelete(\''+esc(r.id)+'\')" class="w-8 h-8 rounded-lg grid place-items-center text-white" style="background:var(--bad)" title="삭제"><iconify-icon icon="solar:trash-bin-trash-linear" width="14"></iconify-icon></button></td>'+
            '</tr>').join('')
          : '<tr><td colspan="10" class="text-center py-14" style="color:var(--muted)">'+
              (_svKind==='카카오'
                ? '카카오 상담 만족도 응답이 없습니다. 「응답 등록」으로 옮겨 적을 수 있습니다.'
                : '설문 응답이 없습니다. 「응답 등록」으로 종이 설문 결과를 옮겨 적을 수 있습니다.')+
            '</td></tr>')+
          '</tbody>'+
        '</table></div>'+
      '</div>';
    renderIcons(el);
  };
