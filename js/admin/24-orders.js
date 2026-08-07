  /* ---------- 비대면 주문 관리 (store-backed) ---------- */
  const ORDER_STATES = ['결제대기','상담대기(결제완료)','상담완료(배송준비)','배송처리완료','취소/재청구','청구서파기'];
  const DEFAULT_ORDERS = [
    {id:'o1', at:'2026-06-24', name:'박지현', phone:'010-2233-4455', item:'[EVENT] 비대면 감비환 10일치', qty:1, amount:32890, status:'상담대기(결제완료)', first:'재진'}
  ];
  let _odFrom='', _odTo='', _odStatus='전체';

  function ordersGet(){
    const o=KK.get('orders', null);
    if(!Array.isArray(o)) return JSON.parse(JSON.stringify(DEFAULT_ORDERS));
    return o.map(x=>Object.assign({id:'o'+Math.random().toString(36).slice(2,7), at:'', name:'', phone:'', item:'', qty:1, amount:0, status:'결제대기', first:''}, x));
  }
  function ordersPut(list, msg){
    KK.set('orders', list);
    if(msg) toast(STORAGE_OK? msg : '미리보기 환경에선 저장이 제한됩니다.', STORAGE_OK);
  }
  function rerenderOrders(){
    const old=document.getElementById('view-remote'); if(old) old.remove();
    BUILDERS.remote(); go('remote');
  }
  function odYmd(d){ const z=n=>String(n).padStart(2,'0'); return d.getFullYear()+'-'+z(d.getMonth()+1)+'-'+z(d.getDate()); }
  function odRecent7(){
    const to=new Date(), from=new Date(Date.now()-6*86400000);
    _odFrom=odYmd(from); _odTo=odYmd(to);
    rerenderOrders();
    toast('최근 7일 ('+_odFrom+' ~ '+_odTo+') 기준으로 조회했습니다.');
  }
  function odSetFrom(v){ _odFrom=v||''; rerenderOrders(); }
  function odSetTo(v){ _odTo=v||''; rerenderOrders(); }
  function odSetStatus(s){ _odStatus=s; rerenderOrders(); }
  function odInRange(o){
    if(_odFrom && (o.at||'') < _odFrom) return false;
    if(_odTo   && (o.at||'') > _odTo)   return false;
    return true;
  }
  function odFiltered(){
    return ordersGet().filter(o=>odInRange(o) && (_odStatus==='전체' || o.status===_odStatus))
                      .sort((a,b)=>String(b.at).localeCompare(String(a.at)));
  }
  function odAdd(){
    const name=prompt('주문자 이름을 입력하세요');
    if(!name || !name.trim()) return;
    const phone=prompt('연락처') || '';
    const item=prompt('주문 상품명') || '';
    const amount=parseInt((prompt('결제 금액 (숫자만)','0')||'0').replace(/[^0-9]/g,''))||0;
    const qty=parseInt(prompt('수량','1'))||1;
    const at=prompt('주문일 (YYYY-MM-DD)', odYmd(new Date())) || '';
    if(!/^\d{4}-\d{2}-\d{2}$/.test(at)){ toast('날짜 형식이 올바르지 않습니다.', false); return; }
    const list=ordersGet();
    list.unshift({id:'o'+Date.now().toString(36), at, name:name.trim(), phone:phone.trim(), item:item.trim(), qty, amount, status:'결제대기', first:''});
    ordersPut(list, '주문을 등록했습니다.');
    rerenderOrders();
  }
  function odSetOrderStatus(id, v){
    const list=ordersGet();
    const o=list.find(x=>x.id===id); if(!o) return;
    o.status=v;
    ordersPut(list, '「'+(o.name||'')+'」 주문을 '+v+' 상태로 바꿨습니다.');
  }
  function odDelete(id){
    const list=ordersGet();
    const i=list.findIndex(x=>x.id===id); if(i<0) return;
    if(!confirm('「'+(list[i].name||'')+' · '+(list[i].item||'')+'」 주문을 삭제할까요?')) return;
    list.splice(i,1);
    ordersPut(list, '주문을 삭제했습니다.');
    rerenderOrders();
  }

  BUILDERS.remote = function(){
    if(typeof peCss==='function') peCss();
    const esc=v=>String(v==null?'':v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/"/g,'&quot;');
    const won=n=>(parseInt(n)||0).toLocaleString('ko-KR')+'원';
    const inRange=ordersGet().filter(odInRange);
    const paid=inRange.filter(o=>o.status!=='결제대기' && o.status!=='취소/재청구' && o.status!=='청구서파기');
    const sum=paid.reduce((s,o)=>s+(parseInt(o.amount)||0),0);
    const avg=paid.length? Math.round(sum/paid.length) : 0;
    const firstCnt=paid.filter(o=>o.first==='초진').length;
    const rows=odFiltered();

    /* 일별 매출 막대 */
    const byDay={};
    paid.forEach(o=>{ byDay[o.at]=(byDay[o.at]||0)+(parseInt(o.amount)||0); });
    const days=Object.keys(byDay).sort();
    const maxDay=Math.max(1, ...days.map(d=>byDay[d]));
    /* 상위 상품 */
    const byItem={};
    paid.forEach(o=>{ const k=o.item||'(상품명 없음)'; byItem[k]=byItem[k]||{amt:0,qty:0}; byItem[k].amt+=(parseInt(o.amount)||0); byItem[k].qty+=(parseInt(o.qty)||1); });
    const top=Object.entries(byItem).sort((a,b)=>b[1].amt-a[1].amt).slice(0,5);

    const stats=[['결제 매출',won(sum),'결제완료 상태 기준'],['결제 건수',paid.length+'건','현재 기간 내 결제완료'],
                 ['평균 결제액',won(avg),'건당 평균 결제 금액'],['초진 결제 건수',firstCnt+'건','초진 환자 결제 건수']];
    const cntOf=s=>ordersGet().filter(odInRange).filter(o=>o.status===s).length;

    const el = makeView('remote');
    el.innerHTML = pageHead('비대면 주문 관리','비대면 진료(앱결제) 주문과 매출을 관리합니다.',
      '<input type="date" value="'+esc(_odFrom)+'" onchange="odSetFrom(this.value)" class="px-2.5 h-9 rounded-lg text-[13px]" style="background:var(--panel);border:1px solid var(--border);color:var(--text-soft)">'+
      '<input type="date" value="'+esc(_odTo)+'" onchange="odSetTo(this.value)" class="px-2.5 h-9 rounded-lg text-[13px]" style="background:var(--panel);border:1px solid var(--border);color:var(--text-soft)">'+
      '<button onclick="odRecent7()" class="px-3 h-9 rounded-lg text-[13px] font-semibold" style="background:var(--panel-soft);border:1px solid var(--border);color:var(--text-soft)">최근 7일</button>'+
      '<button onclick="odAdd()" class="px-3 h-9 rounded-lg text-[13px] font-semibold btn-gold flex items-center gap-1.5"><iconify-icon icon="solar:add-circle-linear" width="15"></iconify-icon> 주문 등록</button>') +

      '<div class="panel rounded-2xl p-5 sm:p-6 mb-5">'+
        '<h2 class="font-bold text-[16px] mb-4">비대면 매출 통계'+((_odFrom||_odTo)?' <span class="text-[12.5px]" style="color:var(--muted);font-weight:500">'+esc(_odFrom||'처음')+' ~ '+esc(_odTo||'오늘')+'</span>':'')+'</h2>'+
        '<div class="grid grid-cols-2 lg:grid-cols-4 gap-3.5 mb-6">'+stats.map(s=>
          '<div class="rounded-xl p-4" style="border:1px solid var(--border);background:var(--panel)"><p class="text-[13px]" style="color:var(--muted)">'+s[0]+'</p><p class="text-2xl font-extrabold mt-1.5">'+s[1]+'</p><p class="text-[11.5px] mt-1" style="color:var(--muted)">'+s[2]+'</p></div>').join('')+'</div>'+
        '<div class="grid lg:grid-cols-2 gap-4">'+
          '<div class="rounded-xl p-5" style="background:var(--panel-soft);border:1px solid var(--border)">'+
            '<p class="font-bold text-[14px] mb-1">일별 결제 매출</p><p class="text-[12px] mb-4" style="color:var(--muted)">선택한 기간 안에서 결제완료된 주문만 집계합니다.</p>'+
            (days.length
              ? '<div class="flex items-end justify-center gap-2 h-40 overflow-x-auto">'+days.map(d=>
                  '<div class="flex flex-col items-center gap-1 shrink-0" title="'+esc(d)+' · '+won(byDay[d])+'">'+
                    '<div class="rounded-t" style="width:36px;height:'+Math.max(6, Math.round(byDay[d]/maxDay*130))+'px;background:linear-gradient(180deg,#c79f63,#b8935a)"></div>'+
                    '<span class="text-[10.5px]" style="color:var(--muted)">'+esc(d.slice(5).replace('-','/'))+'</span>'+
                  '</div>').join('')+'</div>'
              : '<p class="text-center py-12 text-[13px]" style="color:var(--muted)">기간 내 결제완료 주문이 없습니다.</p>')+
          '</div>'+
          '<div class="rounded-xl p-5" style="background:var(--panel-soft);border:1px solid var(--border)">'+
            '<p class="font-bold text-[14px] mb-1">매출 상위 상품</p><p class="text-[12px] mb-4" style="color:var(--muted)">주문 금액 기준 상위 5개 상품입니다.</p>'+
            (top.length ? top.map((t,i)=>
              '<div class="rounded-lg p-4 mb-2" style="background:var(--panel);border:1px solid var(--border)"><div class="flex items-center justify-between gap-3"><div class="min-w-0"><p class="text-[11px] font-bold" style="color:var(--accent-strong)">TOP '+(i+1)+'</p><p class="text-[13.5px] font-medium mt-0.5 break-keep">'+esc(t[0])+'</p></div><div class="text-right shrink-0"><p class="font-extrabold">'+won(t[1].amt)+'</p><p class="text-[11.5px]" style="color:var(--muted)">'+t[1].qty+'개 판매</p></div></div></div>').join('')
              : '<p class="text-center py-12 text-[13px]" style="color:var(--muted)">집계할 주문이 없습니다.</p>')+
          '</div>'+
        '</div>'+
      '</div>'+

      '<div class="flex flex-wrap gap-2 mb-4">'+
        '<button onclick="odSetStatus(\'전체\')" class="px-4 h-9 rounded-lg text-[13px] font-semibold '+(_odStatus==='전체'?'text-white':'')+'" style="'+(_odStatus==='전체'?'background:var(--side)':'background:var(--panel);border:1px solid var(--border);color:var(--text-soft)')+'">전체 '+inRange.length+'</button>'+
        ORDER_STATES.map(s=>'<button onclick="odSetStatus(\''+s+'\')" class="px-4 h-9 rounded-lg text-[13px] font-semibold '+(_odStatus===s?'text-white':'')+'" style="'+(_odStatus===s?'background:var(--side)':'background:var(--panel);border:1px solid var(--border);color:var(--text-soft)')+'">'+s+' '+cntOf(s)+'</button>').join('')+
      '</div>'+

      (rows.length
        ? '<div class="panel rounded-2xl overflow-hidden"><div class="overflow-x-auto"><table class="tbl w-full text-[13.5px] whitespace-nowrap">'+
            '<thead><tr style="background:var(--panel-soft);color:var(--muted)">'+
              ['주문일','주문자','연락처','상품','수량','금액','상태','관리'].map(h=>'<th class="px-4 py-3 font-semibold">'+h+'</th>').join('')+
            '</tr></thead><tbody>'+rows.map(o=>
              '<tr style="border-top:1px solid var(--border-soft)">'+
                '<td class="px-4 py-3.5" style="color:var(--text-soft)">'+esc(o.at)+'</td>'+
                '<td class="px-4 py-3.5 font-medium">'+esc(o.name)+'</td>'+
                '<td class="px-4 py-3.5" style="color:var(--text-soft)">'+esc(o.phone)+'</td>'+
                '<td class="px-4 py-3.5 whitespace-normal break-keep min-w-[220px]">'+esc(o.item)+'</td>'+
                '<td class="px-4 py-3.5">'+(parseInt(o.qty)||1)+'</td>'+
                '<td class="px-4 py-3.5 text-right font-bold" style="color:var(--accent-strong)">'+won(o.amount)+'</td>'+
                '<td class="px-4 py-3.5"><select onchange="odSetOrderStatus(\''+esc(o.id)+'\', this.value)" class="pmi" style="width:180px;padding:6px 8px">'+
                  ORDER_STATES.map(s=>'<option value="'+s+'"'+(s===o.status?' selected':'')+'>'+s+'</option>').join('')+'</select></td>'+
                '<td class="px-4 py-3.5"><button onclick="odDelete(\''+esc(o.id)+'\')" class="w-8 h-8 rounded-lg grid place-items-center text-white" style="background:var(--bad)" title="삭제"><iconify-icon icon="solar:trash-bin-trash-linear" width="14"></iconify-icon></button></td>'+
              '</tr>').join('')+'</tbody></table></div></div>'
        : '<div class="panel rounded-2xl p-14 text-center" style="color:var(--muted)">표시할 주문이 없습니다.<br><span class="text-[12.5px]">「주문 등록」으로 넣거나, 기간·상태 조건을 바꿔보세요.</span></div>');
    renderIcons(el);
  };
