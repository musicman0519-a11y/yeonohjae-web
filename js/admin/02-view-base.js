  /* ===================== VIEW BUILDERS ===================== */
  const BUILDERS = {};

  function makeView(id){
    const el = document.createElement('section');
    el.id = 'view-'+id; el.className='view';
    document.getElementById('placeholders').appendChild(el);
    return el;
  }
  function pageHead(title, sub, right){
    return `<div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
      <div><h1 class="text-2xl font-bold tracking-tight">${title}</h1>
      ${sub?`<p class="text-[13.5px] mt-1.5" style="color:var(--muted)">${sub}</p>`:''}</div>
      ${right?`<div class="flex flex-wrap items-center gap-2">${right}</div>`:''}
    </div>`;
  }
