  /* ---------- 관리자 관리 (store-backed) ---------- */
  const DEFAULT_ADMINS = [
    {id:'a1', email:'justinkang88@hanmail.net', branch:'화정', grade:'지점관리자', status:'승인됨'}
  ];
  function adminsGet(){
    const a=KK.get('admins', null);
    if(!Array.isArray(a) || !a.length) return JSON.parse(JSON.stringify(DEFAULT_ADMINS));
    return a.map(x=>({
      id:x.id||('a'+Math.random().toString(36).slice(2,7)),
      email:x.email||'', branch:x.branch||'', grade:x.grade||'지점관리자', status:x.status||'대기중'
    }));
  }
  function adminsPut(list, msg){
    KK.set('admins', list);
    if(msg) toast(STORAGE_OK? msg : '미리보기 환경에선 저장이 제한됩니다.', STORAGE_OK);
  }
  function rerenderAdmins(){
    const old=document.getElementById('view-admins'); if(old) old.remove();
    BUILDERS.admins(); go('admins');
  }
  function admAdd(){
    const email=prompt('추가할 관리자 이메일을 입력하세요');
    if(!email || !email.trim()) return;
    const v=email.trim();
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)){ toast('이메일 형식이 올바르지 않습니다.', false); return; }
    const list=adminsGet();
    if(list.some(a=>a.email.toLowerCase()===v.toLowerCase())){ toast('이미 등록된 이메일입니다.', false); return; }
    const branch=prompt('지점명을 입력하세요 (예: 화정)') || '';
    list.push({id:'a'+Date.now().toString(36), email:v, branch:branch.trim(), grade:'지점관리자', status:'대기중'});
    adminsPut(list, '관리자를 추가했습니다. 「승인」을 눌러 권한을 부여하세요.');
    rerenderAdmins();
  }
  function admToggle(id){
    const list=adminsGet();
    const a=list.find(x=>x.id===id); if(!a) return;
    a.status = a.status==='승인됨' ? '대기중' : '승인됨';
    adminsPut(list, '「'+a.email+'」 권한을 '+a.status+' 상태로 바꿨습니다.');
    rerenderAdmins();
  }
  function admGrade(id, v){
    const list=adminsGet();
    const a=list.find(x=>x.id===id); if(!a) return;
    a.grade=v;
    adminsPut(list, '등급을 「'+v+'」(으)로 저장했습니다.');
  }
  function admDelete(id){
    const list=adminsGet();
    const i=list.findIndex(x=>x.id===id); if(i<0) return;
    if(list.length<=1){ alert('마지막 관리자는 삭제할 수 없습니다.\n관리자가 한 명도 없으면 아무도 이 화면에 접근할 수 없게 됩니다.'); return; }
    if(!confirm('「'+list[i].email+'」 관리자를 삭제할까요?')) return;
    list.splice(i,1);
    adminsPut(list, '관리자를 삭제했습니다.');
    rerenderAdmins();
  }

  BUILDERS.admins = function(){
    const rows = adminsGet();
    const esc = v => String(v==null?'':v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/"/g,'&quot;');
    const GRADES=['최고관리자','지점관리자','조회전용'];
    const el = makeView('admins');
    el.innerHTML = pageHead('관리자 관리','지점 관리자 계정과 권한을 관리합니다.',
      '<button onclick="admAdd()" class="px-4 h-9 rounded-lg text-[13px] font-semibold btn-gold flex items-center gap-1.5"><iconify-icon icon="solar:add-circle-linear" width="15"></iconify-icon> 관리자 추가</button>') +
      '<div class="panel rounded-2xl overflow-hidden">'+
        '<table class="tbl w-full text-[14px]">'+
          '<thead><tr style="background:var(--panel-soft); color:var(--muted)">'+
            '<th class="px-6 py-3.5 font-semibold">이메일</th><th class="px-4 py-3.5 font-semibold">지점</th>'+
            '<th class="px-4 py-3.5 font-semibold">등급</th><th class="px-4 py-3.5 font-semibold">권한 상태</th>'+
            '<th class="px-4 py-3.5 font-semibold text-right">액션</th></tr></thead>'+
          '<tbody>'+rows.map(r=>
            '<tr style="border-top:1px solid var(--border-soft)">'+
              '<td class="px-6 py-4 font-medium">'+esc(r.email)+'</td>'+
              '<td class="px-4 py-4" style="color:var(--text-soft)">'+(esc(r.branch)||'-')+'</td>'+
              '<td class="px-4 py-4"><select onchange="admGrade(\''+esc(r.id)+'\', this.value)" class="px-2.5 h-8 rounded-lg text-[12.5px] font-semibold" style="background:#e7edff;border:1px solid #cbd8ff;color:#2549b8">'+
                GRADES.map(g=>'<option value="'+g+'"'+(g===r.grade?' selected':'')+'>'+g+'</option>').join('')+
              '</select></td>'+
              '<td class="px-4 py-4"><span class="chip" style="background:'+(r.status==='승인됨'?'var(--good-bg)':'var(--panel-soft)')+';color:'+(r.status==='승인됨'?'var(--good)':'var(--muted)')+'">'+esc(r.status)+'</span></td>'+
              '<td class="px-4 py-4"><div class="flex items-center justify-end gap-2">'+
                '<button onclick="admToggle(\''+esc(r.id)+'\')" class="px-3 h-8 rounded-lg text-[12.5px] font-semibold" style="'+
                  (r.status==='승인됨'
                    ? 'background:var(--panel-soft);border:1px solid var(--border);color:var(--text-soft)'
                    : 'background:var(--accent);color:#fff;border:1px solid var(--accent)')+
                  '">'+(r.status==='승인됨'?'승인 해제':'승인하기')+'</button>'+
                '<button onclick="admDelete(\''+esc(r.id)+'\')" class="px-3 h-8 rounded-lg text-[12.5px] font-semibold text-white" style="background:var(--bad)">삭제하기</button>'+
              '</div></td>'+
            '</tr>').join('')+
          '</tbody>'+
        '</table>'+
      '</div>'+
      '<p class="text-[12px] mt-3 leading-relaxed" style="color:var(--muted)">· 여기 목록은 누가 관리자 화면을 쓸 수 있는지에 대한 <b>기록·관리용</b>입니다.<br>'+
      '· 실제 로그인 차단은 아직 <b>'+'admin.html 의 비밀번호 한 겹</b>뿐입니다. 이메일별 로그인은 Supabase 인증을 붙이는 별도 작업이 필요합니다.</p>';
    renderIcons(el);
  };
