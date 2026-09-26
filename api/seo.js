/* =========================================================================
   연오재 · 검색엔진용 페이지 (Vercel 서버 함수)
   - /t/<상품id>        → 시술 한 개의 안내 페이지 (제목·설명·가격·Q&A가 HTML로 들어 있어 네이버·구글이 읽음)
   - /note/<노트 제목>   → 시술 노트 글 페이지
   - /sitemap.xml 대신 /api/seo?type=sitemap → 위 주소 목록 (robots.txt 에 등록)
   데이터는 관리자에서 저장한 Supabase site_kv 를 그대로 읽으므로, 관리자에서 고치면 자동 반영됩니다.
   ========================================================================= */
const SB_URL = 'https://funutqwltjmcfgxihcrr.supabase.co';
const SB_KEY = 'sb_publishable_eVAu4Hgs7FZ13DBJdsTalQ_WjvVKfN4';
const SITE_URL = 'https://yeonohjae-web.vercel.app';

const esc = v => String(v == null ? '' : v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
/* 관리자 본문(HTML)에서 글자만 뽑기 — 검색엔진용 텍스트 (스크립트·스타일 제거) */
const text = html => String(html || '')
  .replace(/<(script|style)[\s\S]*?<\/\1>/gi, ' ')
  .replace(/<br\s*\/?>|<\/(p|div|li|h[1-6])>/gi, '\n')
  .replace(/<[^>]+>/g, ' ')
  .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
  .replace(/[ \t]+/g, ' ').replace(/\n\s*\n+/g, '\n').trim();
const won = n => (parseInt(n) || 0).toLocaleString('ko-KR');
const okImg = u => /^https:\/\//i.test(String(u || '')) ? u : '';

async function kv(keys) {
  const r = await fetch(`${SB_URL}/rest/v1/site_kv?select=key,value&key=in.(${keys.join(',')})`, {
    headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}` }
  });
  if (!r.ok) throw new Error('db ' + r.status);
  const out = {};
  (await r.json()).forEach(row => { out[row.key] = row.value; });
  return out;
}
/* 홈페이지와 같은 기준으로 노출 가능한 가격 항목만 */
function visibleOptions(p) {
  const hidden = new Set((p.groups || []).filter(g => g.on === false).map(g => g.id));
  const today = new Date().toISOString().slice(0, 10);
  return (p.details || []).filter(d => {
    if (d.on === false) return false;
    if (d.gid && hidden.has(d.gid)) return false;
    if (d.perType === 'range') { if (d.start && today < d.start) return false; if (d.end && today > d.end) return false; }
    if (!String(d.t || '').trim() && !parseInt(d.sale) && !parseInt(d.price)) return false;
    return true;
  });
}
const noteSlug = t => encodeURIComponent(String(t || '').trim());

function page({ title, desc, canonical, image, bodyHtml, jsonld, settings }) {
  const s = settings || {};
  const biz = esc(s.biz || '연오재한의원');
  return `<!doctype html><html lang="ko"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${esc(canonical)}">
<meta property="og:type" content="article"><meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(desc)}"><meta property="og:url" content="${esc(canonical)}">
${image ? `<meta property="og:image" content="${esc(image)}">` : ''}
<meta property="og:site_name" content="${biz}">
${jsonld.map(j => `<script type="application/ld+json">${JSON.stringify(j).replace(/</g, '\\u003c')}</script>`).join('')}
<style>
body{margin:0;background:#f5efe8;color:#2f343a;font:16px/1.8 'Pretendard','Apple SD Gothic Neo','Malgun Gothic',sans-serif;word-break:keep-all}
.w{max-width:760px;margin:0 auto;padding:28px 20px 80px}
header a{color:#4a5d4e;text-decoration:none;font-weight:700}
nav{font-size:14px;color:#8a8f87;margin:18px 0 6px} nav a{color:#8a8f87}
h1{font-size:28px;line-height:1.35;margin:6px 0 14px} h2{font-size:20px;margin:36px 0 10px;color:#4a5d4e}
img{max-width:100%;height:auto;border-radius:8px}
.opt{background:#fff;border:1px solid #e3dbcf;border-radius:10px;padding:14px 16px;margin:8px 0;display:flex;justify-content:space-between;gap:12px}
.opt b{white-space:nowrap} .muted{color:#7d8279;font-size:14px}
.cta{display:inline-block;margin:26px 8px 0 0;background:#4a5d4e;color:#fff;padding:14px 24px;border-radius:12px;text-decoration:none;font-weight:700}
.cta.o{background:#fff;color:#4a5d4e;border:1px solid #4a5d4e}
dl{display:grid;grid-template-columns:auto 1fr;gap:6px 16px} dt{color:#7d8279}
footer{margin-top:48px;border-top:1px solid #e3dbcf;padding-top:16px;font-size:13px;color:#7d8279}
</style></head><body><div class="w">
<header><a href="/">${biz}</a></header>
${bodyHtml}
<footer>${biz} · ${esc(((s.addr1 || '') + ' ' + (s.addr2 || '')).trim())}${s.tel ? ' · ' + esc(s.tel) : ''}<br>※ 시술 결과와 부작용(붉어짐·부기·색소침착 등)은 개인에 따라 다를 수 있습니다. 표시 가격은 VAT 별도이며 상담 후 결정됩니다.</footer>
</div></body></html>`;
}

module.exports = async (req, res) => {
  const q = req.query || {};
  const type = String(q.type || '');
  const id = String(q.id || '');
  try {
    const d = await kv(['products', 'notes', 'settings']);
    const s = d.settings || {};
    const products = (d.products || []).filter(p => p && p.on !== false && p.id);
    const notes = (d.notes || []).filter(n => n && n.on !== false && n.t);
    const loc = '화정역';

    if (type === 'sitemap') {
      const today = new Date().toISOString().slice(0, 10);
      const urls = [`${SITE_URL}/`]
        .concat(products.map(p => `${SITE_URL}/t/${encodeURIComponent(p.id)}`))
        .concat(notes.map(n => `${SITE_URL}/note/${noteSlug(n.t)}`));
      res.setHeader('Content-Type', 'application/xml; charset=utf-8');
      res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
      return res.status(200).send(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
        urls.map(u => `  <url><loc>${esc(u)}</loc><lastmod>${today}</lastmod></url>`).join('\n') + `\n</urlset>\n`);
    }

    if (type === 't') {
      const p = products.find(x => x.id === id);
      if (!p) return notFound(res);
      const name = p.big || p.title || '시술';
      const opts = visibleOptions(p);
      const desc = (text(p.desc) || `${loc} ${s.biz || '연오재한의원'}의 ${name} 안내입니다.`).replace(/\s+/g, ' ').slice(0, 150);
      const title = `${name} | ${loc} ${s.biz || '연오재한의원'}`;
      const canonical = `${SITE_URL}/t/${encodeURIComponent(p.id)}`;
      const basic = p.basic || {};
      const qna = (p.qna || []).filter(x => x && x.q);
      const cautions = (p.cautions || []).filter(Boolean);
      const body = text(p.body).slice(0, 6000);
      const bodyHtml = `
<nav><a href="/">홈</a> › <a href="/#category">시술메뉴</a> › ${esc(p.cat || '')}</nav>
<h1>${esc(p.pageTitle || p.title || name)}</h1>
${okImg(p.img) ? `<img src="${esc(p.img)}" alt="${esc(name)}" width="760">` : ''}
${p.desc ? `<p style="white-space:pre-line">${esc(text(p.desc))}</p>` : ''}
${opts.length ? `<h2>가격 안내</h2>${opts.map(o => {
        const price = parseInt(o.sale) || parseInt(o.price) || 0, orig = parseInt(o.price) || 0;
        return `<div class="opt"><span>${esc(o.t)}${o.notice ? `<br><span class="muted">${esc(o.notice)}</span>` : ''}</span><b>${price ? won(price) + '원' : '상담 후 안내'}${orig > price ? ` <s class="muted">${won(orig)}원</s>` : ''}</b></div>`;
      }).join('')}<p class="muted">VAT 별도 · 내원 후 결제 · 상담 결과에 따라 달라질 수 있습니다.</p>` : ''}
${body ? `<h2>시술 설명</h2><p style="white-space:pre-line">${esc(body)}</p>` : ''}
${(basic.time || basic.anesthesia || basic.daily || basic.duration) ? `<h2>시술 기본정보</h2><dl>${[['시술시간', basic.time], ['마취', basic.anesthesia], ['회복기간', basic.daily], ['유지기간', basic.duration]].filter(x => x[1]).map(x => `<dt>${x[0]}</dt><dd style="margin:0">${esc(x[1])}</dd>`).join('')}</dl>` : ''}
${qna.length ? `<h2>자주 묻는 질문</h2>${qna.map(x => `<p><b>Q. ${esc(x.q)}</b><br>A. ${esc(x.a)}</p>`).join('')}` : ''}
${cautions.length ? `<h2>시술 후 주의사항</h2><ul>${cautions.map(c => `<li>${esc(c)}</li>`).join('')}</ul>` : ''}
<a class="cta" href="/#t/${encodeURIComponent(p.id)}">예약하기 · 자세히 보기</a>${s.tel ? `<a class="cta o" href="tel:${esc(String(s.tel).replace(/[^0-9+-]/g, ''))}">전화 ${esc(s.tel)}</a>` : ''}`;
      const jsonld = [{
        '@context': 'https://schema.org', '@type': 'MedicalProcedure', name, description: desc, url: canonical,
        ...(okImg(p.img) ? { image: p.img } : {}),
        provider: { '@type': 'MedicalClinic', name: s.biz || '연오재한의원', telephone: s.tel || '', url: SITE_URL }
      }];
      if (qna.length) jsonld.push({ '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: qna.map(x => ({ '@type': 'Question', name: x.q, acceptedAnswer: { '@type': 'Answer', text: x.a } })) });
      return send(res, page({ title, desc, canonical, image: okImg(p.img), bodyHtml, jsonld, settings: s }));
    }

    if (type === 'note') {
      const n = notes.find(x => String(x.t).trim() === id.trim());
      if (!n) return notFound(res);
      const title = `${n.t} | ${loc} ${s.biz || '연오재한의원'} 시술 노트`;
      const desc = (n.sub || text(n.body).slice(0, 150) || n.t).replace(/\s+/g, ' ').slice(0, 150);
      const canonical = `${SITE_URL}/note/${noteSlug(n.t)}`;
      const kw = String(n.kw || '').split(/[,，]/).map(x => x.trim()).filter(Boolean);
      const body = text(n.body).slice(0, 8000);
      const recs = (n.recs || []).map(rid => products.find(p => p.id === rid)).filter(Boolean);
      const idx = (d.notes || []).findIndex(x => x && x.t === n.t);
      const bodyHtml = `
<nav><a href="/">홈</a> › <a href="/#notes">시술 노트</a></nav>
<h1>${esc(n.t)}</h1>
${n.sub ? `<p class="muted">${esc(n.sub)}</p>` : ''}
${okImg(n.img) ? `<img src="${esc(n.img)}" alt="${esc(n.t)}" width="760">` : ''}
${body ? `<p style="white-space:pre-line">${esc(body)}</p>` : ''}
${kw.length ? `<p class="muted">${kw.map(k => '#' + esc(k)).join(' ')}</p>` : ''}
${recs.length ? `<h2>함께 보면 좋은 시술</h2><ul>${recs.map(p => `<li><a href="/t/${encodeURIComponent(p.id)}">${esc(p.big || p.title)}</a></li>`).join('')}</ul>` : ''}
<a class="cta" href="/#note/${idx < 0 ? 0 : idx}">홈페이지에서 보기</a><a class="cta o" href="/#reserve">예약하기</a>`;
      const jsonld = [{ '@context': 'https://schema.org', '@type': 'Article', headline: n.t, description: desc, url: canonical,
        ...(okImg(n.img) ? { image: n.img } : {}), ...(n.date ? { datePublished: String(n.date).replace(/\./g, '-') } : {}),
        author: { '@type': 'Organization', name: s.biz || '연오재한의원' }, keywords: kw.join(', ') }];
      return send(res, page({ title, desc, canonical, image: okImg(n.img), bodyHtml, jsonld, settings: s }));
    }
    return notFound(res);
  } catch (e) {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(503).send('<!doctype html><meta charset="utf-8"><p>잠시 후 다시 시도해 주세요. <a href="/">홈으로</a></p>');
  }
};
function send(res, html) {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'public, s-maxage=600, stale-while-revalidate=86400');
  return res.status(200).send(html);
}
function notFound(res) {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  return res.status(404).send('<!doctype html><meta charset="utf-8"><title>페이지를 찾을 수 없습니다</title><p>페이지를 찾을 수 없습니다. <a href="/">연오재한의원 홈으로</a></p>');
}
