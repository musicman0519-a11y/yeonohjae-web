/* ===== 온라인예약 스크립트 — 독립 범위 ===== */
(function(){
    /* ===== 온라인예약 ===== */
    var resState={ y:0, m:0, date:null, time:null, item:'' };
    var today=new Date(); today.setHours(0,0,0,0);

    function pad(n){ return String(n).padStart(2,'0'); }
    function ymd(d){ return d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate()); }
    function store(k,def){ try{ return (window.KK && KK.get(k,def)) || def; }catch(e){ return def; } }

    /* 관리자 「예약 가능시간 수정」에서 저장한 값 */
    function hoursCfg(){
        var d=store('resHours', null) || {};
        return {
            open:     d.open     || '10:00',
            close:    d.close    || '18:00',
            interval: parseInt(d.interval) || 30,
            lunchStart: d.lunchStart || '13:00',
            lunchEnd:   d.lunchEnd   || '14:00',
            offDows:  Array.isArray(d.offDows) ? d.offDows : [0],   /* 기본 휴무: 일요일 */
            capacity: parseInt(d.capacity) || 1
        };
    }
    function closedDays(){ var c=store('resClosed', []); return Array.isArray(c)?c:[]; }
    function toMin(t){ var p=String(t||'').split(':'); return (+p[0])*60 + (+p[1]||0); }
    function toStr(m){ return pad(Math.floor(m/60))+':'+pad(m%60); }

    function slotsFor(dateObj){
        var c=hoursCfg();
        if(c.offDows.indexOf(dateObj.getDay())>=0) return [];
        if(closedDays().indexOf(ymd(dateObj))>=0) return [];
        var out=[], ls=toMin(c.lunchStart), le=toMin(c.lunchEnd);
        for(var m=toMin(c.open); m<toMin(c.close); m+=c.interval){
            if(ls<le && m>=ls && m<le) continue;                 /* 점심시간 제외 */
            out.push(toStr(m));
        }
        return out;
    }
    /* 이미 찬 시간대 (취소 제외) */
    function bookedCount(dateStr, time){
        var list=store('reservations', []);
        return list.filter(function(r){ return r.date===dateStr && r.time===time && r.status!=='취소'; }).length;
    }

    /* 시술 선택 UI 주입 (「남은 시술권으로 예약」 패널 자리) */
    function buildItemPicker(){
        var box=document.getElementById('resItemBox');
        if(box) return;
        var panels=document.querySelectorAll('#resAfter .rounded-2xl');
        var target=null;
        for(var i=0;i<panels.length;i++){
            var h=panels[i].querySelector('h3');
            if(h && h.textContent.indexOf('시술권')>=0){ target=panels[i]; break; }
        }
        if(!target) return;
        /* 03-category.js 가 만들어 둔 목록(기본값 포함)을 우선 사용 */
        var src = (window.__products && window.__products.length) ? window.__products : store('products', []);
        var prods = src.filter(function(p){ return p.on!==false; });
        var opts=['<option value="">상담 후 결정하기</option>'];
        prods.forEach(function(p){
            var vis=(p.details||[]).filter(function(d){ return d.on!==false; });
            if(vis.length){
                vis.forEach(function(d){
                    var nm=(p.big||'')+' · '+(d.t||'');
                    opts.push('<option value="'+nm.replace(/"/g,'&quot;')+'">'+nm+'</option>');
                });
            } else if(p.big){
                opts.push('<option value="'+p.big.replace(/"/g,'&quot;')+'">'+p.big+'</option>');
            }
        });
        target.innerHTML =
            '<h3 class="krhead text-lg text-ink mb-5" style="font-weight:700">예약할 시술 선택</h3>'+
            '<select id="resItemBox" class="krhead w-full px-4 py-3 rounded-lg border border-ink/12 bg-ink/[0.02] text-sm focus:outline-none focus:border-pink" style="font-weight:400">'+opts.join('')+'</select>'+
            '<p class="krhead text-[13px] text-muted mt-3 break-keep" style="font-weight:300">정하지 못하셨다면 「상담 후 결정하기」를 선택해 주세요. 내원 시 상담해 드립니다.</p>';
    }

    /* 카카오 인증 */
    document.getElementById('resKakaoBtn').addEventListener('click', function(){
      document.getElementById('resAuthBox').innerHTML =
        '<div class="rounded-2xl border border-ink/12 p-7 sm:p-9 flex flex-col items-center gap-2">'+
        '<svg viewBox="0 0 24 24" width="34" height="34"><circle cx="12" cy="12" r="11" fill="#10b981"/><path d="M7 12.4l3.2 3.2L17 9" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg>'+
        '<p class="krhead text-emerald-600" style="font-weight:700">인증 완료</p></div>';
      var after=document.getElementById('resAfter');
      after.classList.remove('hidden');
      buildItemPicker();
      resState.y=today.getFullYear(); resState.m=today.getMonth();
      renderCal();
      setTimeout(function(){ try{ after.scrollIntoView({behavior:'smooth'}); }catch(e){} }, 60);
    });

    /* 캘린더 */
    function renderTimes(){
      var wrap=document.getElementById('resTimeWrap');
      if(!resState.date){ wrap.className='krhead text-sm text-muted'; wrap.style.fontWeight='300'; wrap.textContent='날짜를 먼저 선택해주세요.'; return; }
      var slots=slotsFor(resState.date);
      if(!slots.length){
        wrap.className='krhead text-sm text-muted'; wrap.style.fontWeight='300';
        wrap.textContent='이 날짜는 예약을 받지 않습니다. 다른 날짜를 선택해주세요.';
        return;
      }
      var ds=ymd(resState.date), cap=hoursCfg().capacity;
      wrap.className='krhead grid grid-cols-2 md:grid-cols-1 gap-2';
      wrap.style.fontWeight='400';
      wrap.innerHTML=slots.map(function(t){
        var full = bookedCount(ds,t) >= cap;
        var on = resState.time===t;
        if(full) return '<button disabled class="px-3 py-2 rounded-lg border text-sm border-ink/10 text-ink/25 cursor-not-allowed line-through">'+t+'</button>';
        return '<button data-t="'+t+'" class="resTime px-3 py-2 rounded-lg border text-sm transition '+
          (on?'bg-pinkstrong text-white border-pinkstrong':'border-ink/15 text-ink/70 hover:border-pink')+'">'+t+'</button>';
      }).join('');
      wrap.querySelectorAll('.resTime').forEach(function(b){ b.addEventListener('click',function(){ resState.time=b.dataset.t; renderTimes(); }); });
    }

    function renderCal(){
      var y=resState.y, m=resState.m;
      document.getElementById('resCalTitle').textContent=y+'년 '+(m+1)+'월';
      var first=new Date(y,m,1).getDay();          // 0=일
      var dim=new Date(y,m+1,0).getDate();          // 말일
      var cells='';
      for(var i=0;i<first;i++){ cells+='<span></span>'; }
      for(var d=1; d<=dim; d++){
        var dateObj=new Date(y,m,d); dateObj.setHours(0,0,0,0);
        var dow=dateObj.getDay();
        var past = dateObj < today;
        var off  = !past && slotsFor(dateObj).length===0;      /* 휴무일·마감일 */
        var sel = resState.date && resState.date.getTime()===dateObj.getTime();
        var base='krhead mx-auto w-9 h-9 grid place-items-center rounded-full text-sm transition ';
        var cls;
        if(past || off){ cls='text-ink/20 cursor-not-allowed'; }
        else if(sel){ cls='bg-pinkstrong text-white'; }
        else {
          var col = dow===0?'text-red-400':(dow===6?'text-blue-400':'text-ink/80');
          cls=col+' hover:bg-pink hover:text-white cursor-pointer';
        }
        cells+='<button data-d="'+d+'" '+((past||off)?'disabled':'')+' title="'+(off?'휴무일 · 예약 불가':'')+'" class="resDay '+base+cls+'" style="font-weight:400">'+d+'</button>';
      }
      var days=document.getElementById('resCalDays');
      days.innerHTML=cells;
      days.querySelectorAll('.resDay:not([disabled])').forEach(function(b){
        b.addEventListener('click',function(){
          resState.date=new Date(resState.y,resState.m,+b.dataset.d); resState.date.setHours(0,0,0,0);
          resState.time=null; renderCal(); renderTimes();
        });
      });
      renderTimes();
    }

    document.getElementById('resCalPrev').addEventListener('click',function(){
      var cur=new Date(resState.y,resState.m,1), curMonth=new Date(today.getFullYear(),today.getMonth(),1);
      if(cur<=curMonth) return;                      // 이전 달(과거) 막기
      resState.m--; if(resState.m<0){ resState.m=11; resState.y--; } renderCal();
    });
    document.getElementById('resCalNext').addEventListener('click',function(){
      resState.m++; if(resState.m>11){ resState.m=0; resState.y++; } renderCal();
    });

    /* 예약하기 — 실제로 저장됩니다 (관리자 「고객 예약 목록」에 즉시 표시) */
    document.getElementById('resReserveBtn').addEventListener('click',function(){
      var name=(document.getElementById('resName').value||'').trim();
      var phone=(document.getElementById('resPhone').value||'').trim();
      if(!document.getElementById('resAgreeReq').checked){ alert('개인정보 취급방침 동의(필수)를 체크해주세요.'); return; }
      if(!name){ alert('이름을 입력해주세요.'); document.getElementById('resName').focus(); return; }
      if(!/[0-9]{9,}/.test(phone.replace(/[^0-9]/g,''))){ alert('연락처를 정확히 입력해주세요.'); document.getElementById('resPhone').focus(); return; }
      if(!resState.date){ alert('예약 날짜를 선택해주세요.'); return; }
      if(!resState.time){ alert('예약 시간을 선택해주세요.'); return; }

      var ds=ymd(resState.date);
      if(bookedCount(ds, resState.time) >= hoursCfg().capacity){
        alert('방금 다른 분이 이 시간을 예약했습니다. 다른 시간을 선택해주세요.');
        renderTimes(); return;
      }
      var smsBox=document.querySelectorAll('#resAfter input[type="checkbox"]')[0];
      var itemSel=document.getElementById('resItemBox');
      var list=store('reservations', []).slice();
      var isFirst = !list.some(function(r){ return String(r.phone||'').replace(/[^0-9]/g,'') === phone.replace(/[^0-9]/g,''); });

      list.unshift({
        id: 'r'+Date.now().toString(36)+Math.random().toString(36).slice(2,6),
        name: name,
        phone: phone,
        date: ds,
        time: resState.time,
        item: (itemSel && itemSel.value) || '상담하기',
        first: isFirst ? '초진' : '재진',
        sms: (smsBox && smsBox.checked) ? '동의' : '거부',
        status: '미확정',
        memo: '',
        createdAt: new Date().toISOString()
      });
      try{ KK.set('reservations', list); }
      catch(e){ alert('예약 저장에 실패했습니다. 잠시 후 다시 시도해주세요.'); return; }

      var d=resState.date;
      alert('예약이 접수되었습니다.\n\n'+name+' 님 · '+(d.getMonth()+1)+'월 '+d.getDate()+'일 '+resState.time+
            '\n'+((itemSel&&itemSel.value)||'상담하기')+
            '\n\n확정 여부는 병원에서 확인 후 안내드립니다.\n「예약 변경/취소」 메뉴에서 연락처로 조회하실 수 있습니다.');
      resState.time=null; renderCal();
    });

})();
