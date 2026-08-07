  /* ===================== SHARED STORE (admin ↔ front) ===================== */
  const KK = {
    ns:'kkeut:',
    get(k, def){ try{ const v=localStorage.getItem(this.ns+k); return v!==null? JSON.parse(v): def; }catch(e){ return def; } },
    set(k, val){ try{ localStorage.setItem(this.ns+k, JSON.stringify(val)); return true; }catch(e){ return false; } },
  };
  const STORAGE_OK = (()=>{ try{ localStorage.setItem('kkeut:_t','1'); localStorage.removeItem('kkeut:_t'); return true; }catch(e){ return false; } })();
  function toast(msg, ok=true){
    let t=document.getElementById('kkToast');
    if(!t){ t=document.createElement('div'); t.id='kkToast';
      t.style.cssText='position:fixed;left:50%;bottom:28px;transform:translateX(-50%) translateY(20px);z-index:90;padding:11px 18px;border-radius:12px;font-size:13.5px;font-weight:600;color:#fff;opacity:0;transition:.3s;box-shadow:0 8px 30px rgba(0,0,0,.25)';
      document.body.appendChild(t); }
    t.style.background = ok? '#2f6b46':'#b0392f';
    t.textContent = msg;
    requestAnimationFrame(()=>{ t.style.opacity='1'; t.style.transform='translateX(-50%) translateY(0)'; });
    clearTimeout(t._h); t._h=setTimeout(()=>{ t.style.opacity='0'; t.style.transform='translateX(-50%) translateY(20px)'; }, 2200);
  }
  /* canonical defaults shared with the front-end (index.html must match) */
  const DEFAULT_SETTINGS = {
    biz:'연오재한의원', addr1:'경기 고양시 덕양구 화중로 60, 화정빌딩 2층 205·206호', addr2:'(화정역 2번 출구 404m)',
    hWeek:'09:00 ~ 18:00', hWeekend:'09:00 ~ 17:00', hHoliday:'휴무',
    extra:'주차 가능 · 무선 인터넷 · 남/녀 화장실 구분',
    tel:'0507-1485-2378', ceo:'김경민', reg:'779-09-03367',
    naver:'https://booking.naver.com/booking/13/bizes/889', kakao:'',
    insta:'', whatsapp:'', wechat:'', line:'', nblog:'', ntv:'',
    seo:'화정역, 고양 한의원', seoTail:'연오재한의원', seoLocal:'화정 행신 원흥 삼송 덕양구 고양', navVerify:'', gVerify:'',
  };
  const DEFAULT_CATEGORIES = ['전체보기','[안꿋나는] 레이저 제모','[투명하게] 미백/기미/홍조/잡티','[탄력UP!] 리프팅/탄력/비대칭','[희석없는] 스킨케어','[피부영양제] 스킨부스터/피하수액','필러no!-콜라겐볼륨침','점/편평사마귀/검버섯/쥐젖 등','여드름/모공/흉터','윤곽/지방제거','[고농도, 개인 맞춤] 다이어트/한약','[꼼꼼한 원장님] 문신/타투 제거','[빠르다] 비만/체형','[집에서 편하게] 비대면','패키지시술','상담 후 결정하기','[이것도 치료되나?] 잘 모르는 피부 고민/질환','[진짜주름치료] No!톡스'];
  const DEFAULT_PRODUCTS = [
    {cat:'[탄력UP!] 리프팅/탄력/비대칭', type:'promo', script:'마이크로웨이브로 비대칭까지 바로잡는', big:'온다 리프팅', title:'[탄력은 더하고, 통증은 줄이고] 온다 리프팅 (6/26 입고 예정)', event:'[첫 시술 EVENT] 온다 리프팅 10kj(1만줄)', price:45000, on:true},
    {cat:'[탄력UP!] 리프팅/탄력/비대칭', type:'promo', script:'고출력, 열제어시스템 온도상승 디테일차이', big:'볼뉴머 리프팅', title:'[볼륨과 탄력을 한번에] 볼뉴머 리프팅', event:'[첫 시술 EVENT] 정품팁 볼뉴머 100샷', price:89000, on:true},
    {cat:'[탄력UP!] 리프팅/탄력/비대칭', type:'promo', script:'높은 에너지로 강하고 오래가는', big:'슈링크 유니버스', title:'[탄력은 더하고, 통증은 줄이고] 슈링크 유니버스', event:'[첫 시술 EVENT] 정품팁 슈링크 유니버스 100샷', price:7900, on:true},
    {cat:'[탄력UP!] 리프팅/탄력/비대칭', type:'promo', script:'페이크 타이머 NO! 에너지 시간만 카운트', big:'인모드 리프팅', title:'[정량 그대로] 인모드 리프팅', event:'[첫 시술 EVENT] 인모드 FX 1부위', price:2900, on:true},
    {cat:'[안꿋나는] 레이저 제모', type:'photo', script:'OK할 때까지 안 꿋나요', big:'남자 레이저 제모', title:'[OK 할 때까지 꿋!] 남성 레이저 제모', event:'[첫 시술 EVENT] 남자 인중 or 앞턱 제모 1회', price:100, on:true},
    {cat:'[안꿋나는] 레이저 제모', type:'photo', script:'여성 원장님 상주', big:'여자 레이저 제모', title:'[털 고민 이제 꿋!] 여성 레이저 제모 (여성 원장님 진료)', event:'[첫 시술 EVENT] 여자 인중 or 겨드랑이 제모 1회', price:100, on:true},
    {cat:'[투명하게] 미백/기미/홍조/잡티', type:'promo', script:'고민마다 다른설계 1:1 프리미엄 맞춤', big:'듀얼 토닝', title:'듀얼 토닝, 한 단계 더 섬세하게', event:'[첫 시술 EVENT] 듀얼 토닝 (맞춤 모드 2000샷)', price:36000, on:true},
    {cat:'[투명하게] 미백/기미/홍조/잡티', type:'promo', script:'한 끗 차이 결과', big:'레이저 토닝', title:'레이저 토닝, 맑아지는 피부톤', event:'[첫 시술 EVENT] 레이저 토닝 (1000샷)', price:100, on:true},
    {cat:'[피부영양제] 스킨부스터/피하수액', type:'photo', script:'4-D 레이어링 방식으로 흡수율을 끌어올린', big:'쥬베룩 스킨부스터', title:'쥬베룩 스킨부스터, 피부 속 콜라겐 관리', event:'[EVENT] 쥬베룩 스킨부스터 2cc + 모델링팩', price:20000, on:true},
    {cat:'점/편평사마귀/검버섯/쥐젖 등', type:'ba', script:'어붐+CO2 듀얼레이저', big:'흉터 적은 점제거', title:'[재발한 점까지] 점,돌출점 제거', event:'[EVENT] 점 제거(2mm이하) 개당', price:100, on:true},
    {cat:'[희석없는] 스킨케어', type:'promo', script:'12분 이상 꽉채운', big:'LDM 관리', title:'LDM 고밀도 초음파 관리 [12분 이상 꽉 채워 진행!]', event:'[첫 시술 EVENT] LDM 초음파 관리 (국산) 60분', price:9900, on:true},
    {cat:'여드름/모공/흉터', type:'ba', script:'3단계 패인흉터 케어 표피부터 진피하부까지', big:'흉터 새살침', title:'[흉터 재생을 위한] 흉터 새살침', event:'[첫 시술 EVENT] 새살침 1포인트 (0.5*0.5 미만)', price:43000, on:true},
    {cat:'[투명하게] 미백/기미/홍조/잡티', type:'promo', script:'여러 피부 고민 한 번에', big:'토닝 레이저', title:'[잡티·기미 한 번에] 레이저 토닝', event:'[첫 시술 EVENT] 토닝 2000샷', price:9900, on:true},
    {cat:'[희석없는] 스킨케어', type:'photo', script:'각질·노폐물 클렌징', big:'아쿠아필', title:'[속부터 맑게] 아쿠아필 딥클렌징', event:'[EVENT] 아쿠아필 1회', price:30000, on:true},
    {cat:'여드름/모공/흉터', type:'promo', script:'모공·흉터 동시 케어', big:'포텐자', title:'[모공·흉터 리셋] 포텐자', event:'[첫 시술 EVENT] 포텐자 1부위', price:99000, on:true},
    {cat:'[진짜주름치료] No!톡스', type:'photo', script:'주름 잡는 한 끗', big:'이마 보톡스', title:'[진짜주름치료] No!톡스 이마/미간', event:'[EVENT] 국산 보톡스 1부위', price:5900, on:true},
  ];
  const DEFAULT_POPUPS = [
    {title:'오픈특가 이벤트', link:'https://www.kkeutclinic-hongdae.co.kr/clinicPrice', on:true, order:1, seed:'popup-open'},
    {title:'아쿠아필 특가', link:'https://www.kkeutclinic-hongdae.co.kr/clinicPrice/gEnFbnGEGEfBA775hChk', on:true, order:2, seed:'popup-aqua'},
    {title:'LDM 특가', link:'https://www.kkeutclinic-hongdae.co.kr/clinicPrice/7PQcq2XSB9cMHUmx6s1M', on:true, order:3, seed:'popup-ldm'},
  ];
  const DEFAULT_REVIEWS = [
    {n:'김**', t:'원장님께서 친절하게 상담해주셔서 감사했습니다.'},
    {n:'이**', t:'직원분들이 정말 친절하고 세심하게 케어해주셨어요.'},
    {n:'박**', t:'시술 후 피부가 많이 좋아졌어요.'},
    {n:'최**', t:'시설도 깨끗하고 대기시간도 짧아 만족스러웠습니다.'},
    {n:'정**', t:'전문적인 상담과 시술로 효과를 바로 봤어요.'},
    {n:'강**', t:'친구 소개로 방문했는데 정말 만족스럽네요.'},
  ];
  const DEFAULT_NOTES = [
    {t:'수두흉터치료', sub:'수두 흉터와 패인 자국 개선, 포텐자가 흉터에 작용하는 방식', on:true},
    {t:'여드름흉터필러', sub:'여드름 흉터 치료, 필러의 짧은 효과 vs 포텐자의 긴 지속력.', on:true},
    {t:'등털제모', sub:'쉐이빙 없이 등 털 제모를 편안하게 받는 방법', on:true},
    {t:'셀엑소좀', sub:'여드름 피부에 셀엑소좀? 어떤 효과가 있길래 주목받을까요', on:true},
    {t:'피부과잡티제거', sub:'피부과 잡티 제거, 토닝과 잡티 레이저! 당신에게 맞는 시술은?', on:true},
    {t:'쥬베룩시술', sub:'포텐자 X 쥬베룩 시술, 왜 환상의 시너지를 만들까?', on:true},
    {t:'무통리쥬란', sub:'수면마취 없이도 OK! 무통 리쥬란 시술 통증 줄이는 3가지 노하우', on:true},
    {t:'쥬베룩볼륨', sub:'쥬베룩 볼륨, 코바 차이점 총정리: 현명한 선택을 위한 가이드', on:true},
    {t:'온다레이저', sub:'화정 온다 레이저: 지방과 처짐, 마이크로웨이브로 동시에 케어하세요', on:true},
  ];
  const DEFAULT_CARE = [
    {title:'점, 편평사마귀, 비립종, 한관종, 피지선증식증 등 돌출병변 제거', on:true, body:'시술 후 일시적으로 출혈·삼출액·딱지가 생길 수 있으며 정상적인 회복 과정입니다. 시술 부위는 초기에 패여 보일 수 있으나 2~4주 차부터 새살이 차오릅니다. 딱지는 인위적으로 제거하지 마세요. 세안·샤워는 다음 날부터 미온수로 가볍게 가능합니다.'},
    {title:'새살레이저 (비후성 흉터)', on:true, body:'붉은기는 1개월에서 최대 6개월 이상 지속될 수 있으나 시간이 지나며 옅어집니다. 시술 후 1주간은 미백·고농축 앰플 등 자극이 될 수 있는 제품 사용을 중단해 주세요.'},
    {title:'여드름 압출', on:true, body:'압출 후 붉은기와 미세한 딱지가 생길 수 있습니다. 손으로 만지지 마시고, 자외선 차단제를 꼼꼼히 발라 색소침착을 예방하세요.'},
    {title:'주근깨, 흑자 레이저', on:true, body:'시술 후 딱지가 생기며 7~14일에 걸쳐 자연 탈락합니다. 억지로 떼면 색소침착이 남을 수 있습니다.'},
    {title:'골드 PPT', on:true, body:'시술 직후 미세한 따끔거림과 붉은기가 있을 수 있으며 수 시간 내 가라앉습니다.'},
    {title:'스킨부스터 시술 (엔드란, PDRN주사, 쥬베룩, 엑소좀)', on:true, body:'주사 부위에 멍·부기가 있을 수 있고 3~7일 내 호전됩니다. 당일 음주·사우나는 피해 주세요.'},
    {title:'리프팅 시술 (온다, 텐써마, 올리지오, 슈링크, 인모드, 끗다)', on:true, body:'시술 후 일시적 붉은기·부기가 있을 수 있습니다. 충분한 수분 섭취와 보습을 권장합니다.'},
    {title:'제모', on:true, body:'시술 후 모낭 주변 붉은기가 정상적으로 나타날 수 있습니다. 24시간 내 사우나·격한 운동·태닝을 피해 주세요.'},
    {title:'VIP 회원권 및 환불/변경 규정', on:true, body:'할인된 금액으로 결제 후 취소 시 10%의 위약금이 차감됩니다. 환불 금액은 정상가 1회 기준으로 환산하여 남은 금액을 산정합니다.'},
  ];
  const DEFAULT_DOCTORS = [
    {name:'김경민', role:'대표원장 · 한의사', desc:'피부·미용 시술 전문. 연오재한의원 대표원장.', img:''},
  ];
  const DEFAULT_NONINSURED = [
    {name:'보톡스 (국산)', unit:'1부위', price:'5,900원'},
    {name:'보톡스 (수입)', unit:'1부위', price:'29,000원'},
    {name:'레이저 토닝', unit:'1회', price:'9,900원'},
    {name:'포텐자', unit:'1부위', price:'99,000원'},
    {name:'LDM 고밀도 초음파', unit:'60분', price:'9,900원'},
    {name:'쥬베룩 스킨부스터', unit:'2cc', price:'20,000원'},
    {name:'새살침(흉터 재생)', unit:'1포인트', price:'43,000원'},
    {name:'아쿠아필 딥클렌징', unit:'1회', price:'30,000원'},
  ];
  const DEFAULT_NETWORK = [
    {name:'연오재 (화정 본점)', addr:'경기 고양시 덕양구 화중로 60', phone:'0507-1485-2378', open:true},
    {name:'더스물하나 2호점 (오픈예정)', addr:'-', phone:'-', open:false},
    {name:'더스물하나 3호점 (오픈예정)', addr:'-', phone:'-', open:false},
  ];
