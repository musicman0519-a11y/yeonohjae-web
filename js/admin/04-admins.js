  /* ---------- 관리자 관리 (운영/설정) ----------
     저장소: Supabase 「admin_members」 테이블 (SQL: supabase-관리자승인.sql)
     흐름: 로그인 화면 「관리자 계정 신청」 → 여기서 최고관리자가 승인/거절 → 승인된 사람만 관리자 화면 입장
     등급: owner 최고관리자(전부 + 이 화면) / manager 관리자(홈페이지·예약) / staff 직원(예약만)
     승인·등급 변경·삭제는 최고관리자만 가능 (서버에서도 막음) */
  const ADM_ROLES = [['owner','최고관리자','모든 기능 + 관리자 승인'],['manager','관리자','홈페이지 내용 수정 + 예약 관리'],['staff','직원','예약 확인·확정만']];
  const ADM_STATUS = {pending:['승인 대기','#b45309','#fdf2dc'], approved:['승인됨','var(--good)','var(--good-bg)'], rejected:['거절됨','var(--bad)','var(--bad-bg)']};
  let _admList=[], _admState='idle', _admErr='', _admTab='pending';
  const admEsc = v => String(v==null?'':v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/"/g,'&quot;');
  function admIsOwner(){ return (window.__adminRole||'owner')==='owner'; }
  function admMe(){ try{ return (document.getElementById('hdrUserEmail')||{}).value || window.__adminEmail || ''; }catch(e){ return ''; } }
  function rerenderAdmins(){ const y=window.scrollY; const old=document.getElementById('view-admins'); if(old) old.remove(); BUILDERS.admins(); go('admins'); window.scrollTo(0,y); }
  function admLoad(){
    if(!window.__sb){ setTimeout(admLoad, 300); return; }
    _admState='loading';
    window.__sb.from('admin_members').select('*').order('requested_at',{ascending:false}).then(r=>{
      if(r.error){ _admState=/relation|does not exist|schema cache|Could not find/i.test(r.error.message||'')?'setup':'error'; _admErr=r.error.message||''; }
      else { _admList=r.data||[]; _admState='ok'; }
      rerenderAdmins();
    });
    if(!window.__adminEmail && window.__sb.auth.getUser) window.__sb.auth.getUser().then(r=>{ window.__adminEmail = (r.data && r.data.user && r.data.user.email || '').toLowerCase(); });
  }
  function admUpdate(email, patch, msg){
    if(!admIsOwner()){ toast('최고관리자만 변경할 수 있습니다.', false); return; }
    patch = Object.assign({}, patch, patch.status ? {decided_at:new Date().toISOString(), decided_by: window.__adminEmail||''} : {});
    window.__sb.from('admin_members').update(patch).eq('email', email).then(r=>{
      if(r.error){ toast(/최고관리자는 최소/.test(r.error.message)?'최고관리자는 최소 1명이 있어야 합니다.':('변경 실패: '+r.error.message), false); admLoad(); return; }
      toast(msg); admLoad();
    });
  }
  function admApprove(email){
    const sel=document.querySelector('[data-admrole="'+CSS.escape(email)+'"]');
    const role=sel ? sel.value : 'staff';
    const name=(ADM_ROLES.find(x=>x[0]===role)||[])[1];
    if(!confirm(email+' 님을 「'+name+'」(으)로 승인할까요?\n승인하면 바로 관리자 화면에 로그인할 수 있습니다.')) return;
    admUpdate(email, {status:'approved', role}, '승인했습니다. 이제 이 계정으로 로그인할 수 있습니다.');
  }
  function admReject(email){ if(!confirm(email+' 님의 신청을 거절할까요?')) return; admUpdate(email, {status:'rejected'}, '거절했습니다.'); }
  function admRole(email, role){
    if(email===window.__adminEmail && role!=='owner' && !confirm('내 등급을 낮추면 이 화면(관리자 관리)을 더 이상 볼 수 없습니다. 계속할까요?')){ rerenderAdmins(); return; }
    admUpdate(email, {role}, '등급을 바꿨습니다.');
  }
  function admSuspend(email){
    if(email===window.__adminEmail){ toast('내 계정은 사용 중지할 수 없습니다.', false); return; }
    if(!confirm(email+' 님의 관리자 권한을 중지할까요?\n다시 승인하면 사용할 수 있습니다.')) return;
    admUpdate(email, {status:'rejected'}, '권한을 중지했습니다.');
  }
  function admDelete(email){
    if(!admIsOwner()){ toast('최고관리자만 삭제할 수 있습니다.', false); return; }
    if(email===window.__adminEmail){ toast('내 계정은 삭제할 수 없습니다.', false); return; }
    if(!confirm(email+' 님을 관리자 명단에서 삭제할까요?\n삭제하면 관리자 화면에 들어올 수 없습니다.')) return;
    window.__sb.from('admin_members').delete().eq('email', email).then(r=>{
      if(r.error){ toast(/최고관리자는 최소/.test(r.error.message)?'최고관리자는 최소 1명이 있어야 합니다.':('삭제 실패: '+r.error.message), false); return; }
      toast('명단에서 삭제했습니다.'); admLoad();
    });
  }
  function admTab(t){ _admTab=t; rerenderAdmins(); }
  function toggleAdmHelp(){ const b=document.getElementById('admHelpBody'), t=document.getElementById('admHelpBtn'); const o=b.style.display==='none'; b.style.display=o?'':'none'; t.textContent=o?'닫기':'보기'; }

  BUILDERS.admins = function(){
    if(_admState==='idle') setTimeout(admLoad, 0);
    const el=makeView('admins'), owner=admIsOwner();
    const pend=_admList.filter(m=>m.status==='pending'), rows=_admTab==='pending'?pend:_admList;
    const d=v=>{ if(!v) return '-'; const x=new Date(v); return x.getFullYear()+'.'+String(x.getMonth()+1).padStart(2,'0')+'.'+String(x.getDate()).padStart(2,'0'); };
    const roleSel=(m, forApprove)=>'<select '+(forApprove?'data-admrole="'+admEsc(m.email)+'"':'onchange="admRole(\''+admEsc(m.email)+'\', this.value)"')+' class="pmi" style="width:auto;padding:6px 10px;font-size:13px" '+(owner?'':'disabled')+'>'+
      ADM_ROLES.map(r=>'<option value="'+r[0]+'"'+((forApprove?'staff':m.role)===r[0]?' selected':'')+'>'+r[1]+'</option>').join('')+'</select>';
    const btn=(label, fn, style)=>'<button onclick="'+fn+'" class="px-3 h-8 rounded-lg text-[12.5px] font-semibold" style="'+(style||'background:var(--panel);border:1px solid var(--border);color:var(--text-soft)')+'">'+label+'</button>';
    let body='';
    if(_admState==='loading' || _admState==='idle') body='<p class="text-center py-14 text-[13px]" style="color:var(--muted)">관리자 명단을 불러오는 중…</p>';
    else if(_admState==='setup') body='<div class="p-8 text-center text-[13.5px] break-keep" style="color:var(--text-soft)"><p class="font-bold mb-2">아직 관리자 승인 기능이 준비되지 않았습니다.</p><p>작업 폴더의 <b>supabase-관리자승인.sql</b> 을 Supabase SQL Editor에서 한 번 실행해 주세요.</p></div>';
    else if(_admState==='error') body='<p class="text-center py-14 text-[13px]" style="color:var(--bad)">불러오지 못했습니다: '+admEsc(_admErr)+'</p>';
    else if(!rows.length) body='<p class="text-center py-14 text-[13px]" style="color:var(--muted)">'+(_admTab==='pending'?'승인을 기다리는 신청이 없습니다.':'등록된 관리자가 없습니다.')+'</p>';
    else body='<div class="overflow-x-auto"><table class="tbl w-full text-[13.5px] whitespace-nowrap"><thead><tr style="background:var(--panel-soft);color:var(--muted)">'+
        '<th class="px-4 py-3 font-semibold text-left">이름</th><th class="px-4 py-3 font-semibold text-left">이메일</th><th class="px-4 py-3 font-semibold text-left">등급</th><th class="px-4 py-3 font-semibold text-left">상태</th><th class="px-4 py-3 font-semibold text-left">신청일</th><th class="px-4 py-3 font-semibold text-right">관리</th></tr></thead><tbody>'+
        rows.map(m=>{
          const st=ADM_STATUS[m.status]||ADM_STATUS.pending, me=m.email===window.__adminEmail;
          let act='';
          if(owner){
            if(m.status==='pending') act=btn('승인', "admApprove('"+admEsc(m.email)+"')", 'background:var(--good);color:#fff')+btn('거절', "admReject('"+admEsc(m.email)+"')");
            else if(m.status==='approved') act=me?'<span class="text-[12px]" style="color:var(--muted)">내 계정</span>':btn('권한 중지', "admSuspend('"+admEsc(m.email)+"')");
            else act=btn('다시 승인', "admApprove('"+admEsc(m.email)+"')");
            if(!me) act+=btn('삭제', "admDelete('"+admEsc(m.email)+"')", 'background:var(--bad);color:#fff');
          }
          return '<tr style="border-top:1px solid var(--border-soft)">'+
            '<td class="px-4 py-3 font-semibold">'+admEsc(m.name||'-')+(me?' <span class="chip" style="background:var(--accent-soft);color:var(--accent-strong)">나</span>':'')+'</td>'+
            '<td class="px-4 py-3">'+admEsc(m.email)+'</td>'+
            '<td class="px-4 py-3">'+(m.status==='pending' ? roleSel(m,true) : roleSel(m,false))+'</td>'+
            '<td class="px-4 py-3"><span class="chip" style="background:'+st[2]+';color:'+st[1]+'">'+st[0]+'</span></td>'+
            '<td class="px-4 py-3" style="color:var(--text-soft)">'+d(m.requested_at)+'</td>'+
            '<td class="px-4 py-3"><div class="flex justify-end gap-1.5">'+act+'</div></td></tr>';
        }).join('')+'</tbody></table></div>';
    el.innerHTML=
      '<div class="rounded-xl mb-5" style="background:var(--panel);border:1px solid var(--border)">'+
        '<div class="px-5 py-3.5 flex items-center gap-3 flex-wrap"><span class="text-[13.5px] font-bold">처음이라면 사용법 보기</span><span class="text-[13px]" style="color:var(--muted)">직원이 신청한 관리자 계정을 승인하고 등급을 정합니다.</span>'+
        '<button id="admHelpBtn" onclick="toggleAdmHelp()" class="ml-auto px-4 h-8 rounded-full text-[12.5px] font-bold text-white" style="background:var(--side)">보기</button></div>'+
        '<div id="admHelpBody" style="display:none;border-top:1px solid var(--border-soft)" class="px-6 py-4"><ol class="list-decimal pl-4 space-y-1.5 text-[13.5px]" style="color:var(--text-soft)">'+
          '<li>직원이 관리자 로그인 화면에서 <b style="color:var(--text)">「관리자 계정 신청하기」</b>로 이름·이메일·비밀번호를 신청합니다. (이메일 인증 필요)</li>'+
          '<li>여기 <b style="color:var(--text)">「승인 대기」</b>에 신청이 뜨면, 등급을 고르고 <b style="color:var(--text)">승인</b>을 누릅니다.</li>'+
          '<li>등급: <b style="color:var(--text)">최고관리자</b> 모든 기능 + 승인 / <b style="color:var(--text)">관리자</b> 홈페이지 내용·예약 / <b style="color:var(--text)">직원</b> 예약 확인·확정만</li>'+
          '<li>퇴사자는 <b style="color:var(--text)">권한 중지</b> 또는 <b style="color:var(--text)">삭제</b>를 누르면 바로 관리자 화면에 들어올 수 없습니다.</li></ol></div>'+
      '</div>'+
      pageHead('관리자 관리','관리자 계정 신청을 승인하고 등급을 관리합니다.'+(owner?'':' (최고관리자만 변경할 수 있습니다)'),
        '<button onclick="admLoad()" class="px-3 h-9 rounded-lg text-[13px] font-semibold" style="background:var(--panel);border:1px solid var(--border);color:var(--text-soft)">↻ 새로고침</button>')+
      '<div class="flex gap-2 mb-3">'+
        '<button onclick="admTab(\'pending\')" class="px-4 h-9 rounded-full text-[13px] font-semibold" style="'+(_admTab==='pending'?'background:var(--side);color:#fff':'background:var(--panel);border:1px solid var(--border);color:var(--text-soft)')+'">승인 대기 '+(pend.length?'<span class="ml-1 px-1.5 rounded-full text-[11px]" style="background:#e0b64a;color:#3a2a00">'+pend.length+'</span>':'')+'</button>'+
        '<button onclick="admTab(\'all\')" class="px-4 h-9 rounded-full text-[13px] font-semibold" style="'+(_admTab==='all'?'background:var(--side);color:#fff':'background:var(--panel);border:1px solid var(--border);color:var(--text-soft)')+'">전체 관리자 ('+_admList.length+')</button>'+
      '</div>'+
      '<div class="panel rounded-2xl overflow-hidden">'+body+'</div>'+
      '<p class="text-[12px] mt-3" style="color:var(--muted)">※ 등급 표: '+ADM_ROLES.map(r=>'<b>'+r[1]+'</b> '+r[2]).join(' · ')+'</p>';
    if(typeof renderIcons==='function') renderIcons(el);
  };
