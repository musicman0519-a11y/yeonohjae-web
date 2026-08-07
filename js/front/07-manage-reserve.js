/* ===== 예약 변경/취소 스크립트 — 독립 범위 ===== */
(function(){
    function digits(v){ return String(v||'').replace(/[^0-9]/g,''); }
    function store(k,def){ try{ return (window.KK && KK.get(k,def)) || def; }catch(e){ return def; } }

    function badge(st){
      if(st==='확정')  return '<span class="krhead text-[11px] px-2 py-1 rounded-full bg-emerald-50 text-emerald-600" style="font-weight:700">확정</span>';
      if(st==='취소')  return '<span class="krhead text-[11px] px-2 py-1 rounded-full bg-ink/5 text-ink/40" style="font-weight:700">취소됨</span>';
      return '<span class="krhead text-[11px] px-2 py-1 rounded-full bg-pinksoft/60 text-pinkstrong" style="font-weight:700">확인중</span>';
    }

    function renderList(phone){
      var box=document.getElementById('mngResult');
      if(!box) return;
      var key=digits(phone);
      var list=store('reservations', []).filter(function(r){ return digits(r.phone)===key; });
      list.sort(function(a,b){ return (b.date+b.time).localeCompare(a.date+a.time); });
      if(!list.length){
        box.innerHTML='<p class="krhead text-sm text-muted break-keep py-6 text-center" style="font-weight:300">해당 연락처로 접수된 예약이 없습니다.</p>';
        return;
      }
      box.innerHTML='<div class="space-y-3">'+list.map(function(r){
        var canCancel = r.status!=='취소';
        return '<div class="rounded-xl border border-ink/12 p-5 text-left">'+
          '<div class="flex items-center gap-2 flex-wrap mb-2">'+
            '<span class="krhead text-[15px] text-ink" style="font-weight:700">'+r.date+' '+r.time+'</span>'+
            badge(r.status)+
            (r.first? '<span class="krhead text-[11px] px-2 py-1 rounded-full bg-ink/5 text-ink/50" style="font-weight:500">'+r.first+'</span>':'')+
          '</div>'+
          '<p class="krhead text-[13.5px] text-ink/70 break-keep" style="font-weight:300">'+(r.item||'상담하기')+'</p>'+
          '<p class="krhead text-[12px] text-muted mt-1" style="font-weight:300">'+(r.name||'')+' · '+(r.phone||'')+'</p>'+
          (canCancel
            ? '<button data-cancel="'+r.id+'" class="krhead mt-3 px-4 py-2 rounded-lg border border-ink/15 text-[13px] text-ink/70 hover:border-pinkstrong hover:text-pinkstrong transition" style="font-weight:500">예약 취소하기</button>'
            : '')+
        '</div>';
      }).join('')+'</div>';

      box.querySelectorAll('[data-cancel]').forEach(function(b){
        b.addEventListener('click', function(){
          if(!confirm('이 예약을 취소할까요?\n취소 후에는 되돌릴 수 없습니다.')) return;
          var all=store('reservations', []).slice();
          var hit=all.find(function(x){ return x.id===b.dataset.cancel; });
          if(hit){ hit.status='취소'; hit.canceledAt=new Date().toISOString(); }
          try{ KK.set('reservations', all); }catch(e){ alert('취소 처리에 실패했습니다.'); return; }
          alert('예약이 취소되었습니다.');
          renderList(phone);
        });
      });
    }

    document.getElementById('mngKakaoBtn').addEventListener('click', function(){
      document.getElementById('mngAuthBox').innerHTML =
        '<div class="rounded-2xl border border-ink/12 p-7 sm:p-9 flex flex-col items-center gap-2">'+
        '<svg viewBox="0 0 24 24" width="34" height="34"><circle cx="12" cy="12" r="11" fill="#10b981"/><path d="M7 12.4l3.2 3.2L17 9" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg>'+
        '<p class="krhead text-emerald-600" style="font-weight:700">인증 완료</p></div>';

      var after=document.getElementById('mngAfter');
      after.innerHTML =
        '<div class="rounded-2xl border border-ink/12 p-6 sm:p-8">'+
          '<h3 class="krhead text-lg text-ink mb-2" style="font-weight:700">예약 내역 조회</h3>'+
          '<p class="krhead text-sm text-muted break-keep mb-5" style="font-weight:300">예약하실 때 입력하신 연락처를 넣어주세요.</p>'+
          '<div class="flex items-center gap-2 flex-wrap">'+
            '<input id="mngPhone" type="tel" placeholder="010-0000-0000" class="krhead flex-1 min-w-[200px] px-4 py-3 rounded-lg border border-ink/12 bg-ink/[0.02] text-sm focus:outline-none focus:border-pink" style="font-weight:400">'+
            '<button id="mngFind" class="krhead px-6 py-3 rounded-xl bg-ink text-white hover:bg-pinkstrong transition text-sm" style="font-weight:700">조회하기</button>'+
          '</div>'+
          '<div id="mngResult" class="mt-6"></div>'+
          '<div class="text-center mt-6">'+
            '<button onclick="showView(\'reserve\')" class="krhead px-6 py-3 rounded-xl border border-ink/15 text-ink/70 hover:border-pinkstrong hover:text-pinkstrong transition text-sm" style="font-weight:500">온라인예약 하러 가기</button>'+
          '</div>'+
        '</div>';
      after.classList.remove('hidden');

      var find=function(){
        var v=(document.getElementById('mngPhone').value||'').trim();
        if(digits(v).length<9){ alert('연락처를 정확히 입력해주세요.'); return; }
        renderList(v);
      };
      document.getElementById('mngFind').addEventListener('click', find);
      document.getElementById('mngPhone').addEventListener('keydown', function(e){ if(e.key==='Enter') find(); });

      setTimeout(function(){ try{ after.scrollIntoView({behavior:'smooth'}); }catch(e){} }, 60);
    });

})();
