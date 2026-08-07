  /* ---------- 비급여 항목 관리 (store-backed → front /noninsured page) ---------- */
  function niStash(){
    const arr=[];
    document.querySelectorAll('#view-noninsured [data-ni]').forEach(tr=>{
      arr.push({
        name : tr.querySelector('[data-nif="name"]').value.trim(),
        unit : tr.querySelector('[data-nif="unit"]').value.trim(),
        price: tr.querySelector('[data-nif="price"]').value.trim()
      });
    });
    return arr;
  }
  function rerenderNoninsured(){
    const old=document.getElementById('view-noninsured'); if(old) old.remove();
    BUILDERS.noninsured(); go('noninsured');
  }
  function saveNoninsured(){
    KK.set('noninsured', niStash());
    toast(STORAGE_OK? '저장됐습니다. 홈페이지 「비급여 안내」에 반영됩니다.' : '미리보기 환경에선 저장이 제한됩니다.', STORAGE_OK);
  }
  function niAdd(){
    const arr=niStash();
    arr.push({name:'', unit:'', price:''});
    KK.set('noninsured', arr);
    rerenderNoninsured();
    toast('빈 줄을 추가했습니다. 항목명·기준·비용을 입력한 뒤 「전체 저장」을 눌러주세요.');
  }
  function niDelete(i){
    const arr=niStash();
    const it=arr[i]; if(!it) return;
    if(!confirm('「'+(it.name||'이 항목')+'」 을(를) 삭제할까요?')) return;
    arr.splice(i,1);
    KK.set('noninsured', arr);
    rerenderNoninsured();
    toast('삭제하고 저장했습니다. 홈페이지 「비급여 안내」에 반영됩니다.');
  }
  function niMove(i,d){
    const arr=niStash();
    const j=i+d; if(j<0||j>=arr.length) return;
    const t=arr[i]; arr[i]=arr[j]; arr[j]=t;
    KK.set('noninsured', arr);
    rerenderNoninsured();
  }
  BUILDERS.noninsured = function(){
    const items = KK.get('noninsured', DEFAULT_NONINSURED);
    const esc = v => String(v==null?'':v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/"/g,'&quot;');
    const el = makeView('noninsured');
    el.innerHTML = pageHead('비급여 항목 관리','「의료법」 제45조에 따른 비급여 진료비용 고지 항목을 관리합니다. (수정 → 저장 시 홈 반영)',
      '<button onclick="niAdd()" class="px-4 h-9 rounded-lg text-[13px] font-semibold flex items-center gap-1.5" style="background:var(--panel);border:1px solid var(--border);color:var(--text-soft)"><iconify-icon icon="solar:add-circle-linear" width="15"></iconify-icon> 항목 추가</button>'+
      '<button onclick="saveNoninsured()" class="px-4 h-9 rounded-lg text-[13px] font-semibold btn-gold flex items-center gap-1.5"><iconify-icon icon="solar:upload-minimalistic-linear" width="15"></iconify-icon> 전체 저장 (홈 반영)</button>') +
      '<div class="panel rounded-2xl overflow-hidden">'+
        '<table class="tbl w-full text-[14px]">'+
          '<thead><tr style="background:var(--panel-soft);color:var(--muted)">'+
            '<th class="px-6 py-3.5 font-semibold">항목명</th>'+
            '<th class="px-4 py-3.5 font-semibold w-36">기준</th>'+
            '<th class="px-4 py-3.5 font-semibold w-36">비용</th>'+
            '<th class="px-4 py-3.5 font-semibold text-right w-36">관리</th></tr></thead>'+
          '<tbody>'+
          (items.length ? items.map((it,i)=>
            '<tr style="border-top:1px solid var(--border-soft)" data-ni>'+
              '<td class="px-6 py-3"><input data-nif="name" value="'+esc(it.name)+'" placeholder="예) 온다 리프팅" class="w-full px-3 py-2 rounded-lg text-[14px] font-medium" style="background:var(--panel-soft);border:1px solid var(--border);color:var(--text)"></td>'+
              '<td class="px-4 py-3"><input data-nif="unit" value="'+esc(it.unit)+'" placeholder="예) 1회" class="w-full px-3 py-2 rounded-lg text-[13px]" style="background:var(--panel-soft);border:1px solid var(--border);color:var(--text-soft)"></td>'+
              '<td class="px-4 py-3"><input data-nif="price" value="'+esc(it.price)+'" placeholder="예) 45,000원" class="w-full px-3 py-2 rounded-lg text-[13px] text-right" style="background:var(--panel-soft);border:1px solid var(--border);color:var(--accent-strong);font-weight:600"></td>'+
              '<td class="px-4 py-3"><div class="flex items-center justify-end gap-1.5">'+
                '<button onclick="niMove('+i+',-1)" class="w-8 h-8 rounded-lg grid place-items-center" style="background:var(--panel);border:1px solid var(--border);color:var(--text-soft)" title="위로"><iconify-icon icon="solar:arrow-up-linear" width="14"></iconify-icon></button>'+
                '<button onclick="niMove('+i+',1)" class="w-8 h-8 rounded-lg grid place-items-center" style="background:var(--panel);border:1px solid var(--border);color:var(--text-soft)" title="아래로"><iconify-icon icon="solar:arrow-down-linear" width="14"></iconify-icon></button>'+
                '<button onclick="niDelete('+i+')" class="w-8 h-8 rounded-lg grid place-items-center text-white" style="background:var(--bad)" title="삭제"><iconify-icon icon="solar:trash-bin-trash-linear" width="14"></iconify-icon></button>'+
              '</div></td>'+
            '</tr>').join('')
          : '<tr><td colspan="4" class="text-center py-14" style="color:var(--muted)">등록된 항목이 없습니다. 「항목 추가」로 등록하세요.</td></tr>')+
          '</tbody>'+
        '</table>'+
      '</div>'+
      '<p class="text-[12px] mt-3" style="color:var(--muted)">· 순서를 바꾸거나 삭제하면 그 즉시 저장됩니다. 글자를 고친 뒤에는 「전체 저장」을 눌러주세요.</p>';
    renderIcons(el);
  };
