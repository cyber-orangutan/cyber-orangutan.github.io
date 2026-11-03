/* Reads the files in /data and builds the page. To change content, edit those files. */
(() => {
  'use strict';

  const SECTIONS = {
    experience:   { title: 'Experience',   icon: 'briefcase', file: 'experience',   render: renderExperience },
    certificates: { title: 'Certificates', icon: 'cert',      file: 'certificates', render: renderCertificates },
    skills:       { title: 'Skills',       icon: 'tools',     file: 'skills',       render: renderSkills },
    projects:     { title: 'Projects',     icon: 'box',       file: 'projects',     render: renderProjects },
    videos:       { title: 'YouTube',      icon: 'play',      file: 'videos',       render: renderVideos },
    education:    { title: 'Education',    icon: 'book',      file: 'education',    render: renderEducation, half: true },
    contact:      { title: 'Contact',      icon: 'mail',      file: null,           render: renderContact,   half: true }
  };
  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const $ = (id) => document.getElementById(id);
  let profile = {};

  function h(tag, attrs = {}, ...kids) {
    const el = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) {
      if (v === undefined || v === null || v === false) continue;
      if (k === 'class') el.className = v;
      else if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
      else el.setAttribute(k, v === true ? '' : v);
    }
    el.append(...kids.flat().filter((k) => k !== null && k !== undefined && k !== false));
    return el;
  }
  function icon(name, cls = 'ico') {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('class', cls);
    svg.setAttribute('aria-hidden', 'true');
    const use = document.createElementNS('http://www.w3.org/2000/svg', 'use');
    use.setAttribute('href', '#i-' + name);
    svg.append(use);
    return svg;
  }
  async function getJSON(name) {
    const res = await fetch(`data/${name}.json`, { cache: 'no-cache' });
    if (!res.ok) throw new Error(`data/${name}.json could not be loaded`);
    return res.json();
  }
  function month(value) {
    if (!value) return '';
    const [y, m] = value.split('-').map(Number);
    return `${MONTHS[m - 1]} ${y}`;
  }
  function range(a, b) {
    if (!b) return month(a);
    return a === b ? month(a) : `${month(a)} to ${month(b)}`;
  }
  const safeUrl = (u) => (/^(https?:|mailto:|assets\/)/.test(u || '') ? u : null);

  /* renderers */
  function renderExperience(jobs) {
    return h('div', { class: 'jobs' }, jobs.map((j) =>
      h('article', { class: 'box job' },
        h('div', { class: 'job-head' }, h('h3', {}, j.role), h('p', { class: 'when' }, range(j.start, j.end))),
        h('p', { class: 'org' }, `${j.company}, ${j.location}`),
        h('ul', {}, j.duties.map((d) => h('li', {}, d)))
      )));
  }
  function renderCertificates(list) {
    return h('div', { class: 'certs' }, list.map((c) => {
      const dates = c.expires ? range(c.issued, c.expires) : month(c.issued);
      const meta = [c.issuer, dates].filter(Boolean).join(', ');
      const links = [
        safeUrl(c.verifyUrl) && h('a', { class: 'btn', href: c.verifyUrl, target: '_blank', rel: 'noopener', 'aria-label': `Verify ${c.name} on Credly` }, 'Verify'),
        c.image && h('button', { type: 'button', 'aria-label': `View ${c.name} certificate`, onclick: () => viewCert(c) }, 'View certificate')
      ].filter(Boolean);
      return h('article', { class: 'box cert' },
        icon('cert', 'ico ico-lg'),
        h('h3', {}, c.name),
        c.fullName && h('p', { class: 'meta' }, c.fullName),
        h('p', { class: 'meta' }, meta),
        c.grade && h('p', { class: 'meta' }, `Grade: ${c.grade}`),
        c.id && h('p', { class: 'cid' }, c.idLabel || 'ID', h('code', {}, c.id)),
        links.length ? h('div', { class: 'cert-links' }, links) : null
      );
    }));
  }
  function renderSkills(groups) {
    return h('div', { class: 'groups' }, groups.map((g) =>
      h('fieldset', { class: 'group' },
        h('legend', {}, icon(g.icon), g.group),
        h('ul', {}, g.items.map((s) => h('li', {}, s))))));
  }
  function renderEducation(ed) {
    const rows = (pairs) => h('dl', { class: 'props' }, pairs.flatMap(([k, v]) => [h('dt', {}, k), h('dd', {}, v)]));
    return h('div', { class: 'stack-gap' },
      ed.degrees.map((d) => h('article', { class: 'box' },
        h('h3', {}, d.degree),
        rows([['College', d.school], ['Location', d.location], ['Dates', range(d.start, d.end)], ['GPA', d.gpa]]))),
      ed.bootcamps.map((b) => h('article', { class: 'box' },
        h('h3', {}, b.name),
        rows([['Dates', range(b.start, b.end)]]))),
      h('article', { class: 'box' }, h('h3', {}, 'Languages'), rows([['Spoken', profile.languages.join(', ')]]))
    );
  }
  function renderContact() {
    const copyBtn = h('button', {
      type: 'button',
      onclick: async () => {
        try { await navigator.clipboard.writeText(profile.email); copyBtn.textContent = 'Copied'; }
        catch { copyBtn.textContent = 'Select the address to copy'; }
      }
    }, 'Copy email');
    return h('div', { class: 'box contact' },
      h('div', { class: 'contact-row' }, icon('mail', 'ico ico-lg'),
        h('p', {}, h('strong', {}, 'Email'), h('a', { href: `mailto:${profile.email}` }, profile.email))),
      h('div', { class: 'contact-row' }, icon('link', 'ico ico-lg'),
        h('p', {}, h('strong', {}, 'LinkedIn'), h('a', { href: profile.linkedin, target: '_blank', rel: 'noopener' }, profile.linkedinLabel))),
      h('div', { class: 'actions' }, h('a', { class: 'btn btn-go', href: profile.cv, download: true }, 'Download CV'), copyBtn)
    );
  }
  function renderProjects(list) {
    return h('div', { class: 'grid2' }, list.map((p) =>
      h('article', { class: 'box' },
        p.image && h('img', { src: p.image, alt: '', loading: 'lazy' }),
        h('h3', {}, p.title),
        h('p', { class: 'when' }, range(p.start, p.end)),
        h('p', {}, p.description),
        p.tags && p.tags.length ? h('ul', { class: 'tags' }, p.tags.map((t) => h('li', {}, t))) : null,
        safeUrl(p.link) && h('div', { class: 'cert-links' }, h('a', { class: 'btn', href: p.link, target: '_blank', rel: 'noopener' }, 'Open project'))
      )));
  }
  function renderVideos(data) {
    const channel = h('a', { class: 'btn', href: data.channel, target: '_blank', rel: 'noopener' }, 'Open YouTube channel');
    if (!data.videos.length) return h('div', { class: 'box' }, h('p', {}, 'New videos are on my channel.'), h('div', { class: 'cert-links' }, channel));
    return h('div', { class: 'stack-gap' },
      h('div', { class: 'grid2' }, data.videos.map((v) => {
        const card = h('article', { class: 'box' });
        const thumb = h('button', {
          class: 'thumb', type: 'button', 'aria-label': `Play ${v.title}`,
          onclick: () => thumb.replaceWith(h('iframe', { class: 'frame', src: `https://www.youtube-nocookie.com/embed/${encodeURIComponent(v.youtubeId)}?autoplay=1`, title: v.title, allow: 'autoplay; encrypted-media; picture-in-picture', allowfullscreen: true }))
        }, h('img', { src: `https://i.ytimg.com/vi/${encodeURIComponent(v.youtubeId)}/hqdefault.jpg`, alt: '', loading: 'lazy' }), icon('play', ''));
        card.append(thumb, h('h3', {}, v.title), h('p', {}, v.description || ''));
        return card;
      })),
      h('div', {}, channel));
  }

  /* window behaviour */
  function buildWindow(id, cfg, content) {
    const sec = h('section', { class: `window${cfg.half ? ' half' : ''}`, id, 'aria-labelledby': `t-${id}` });
    const body = h('div', { class: 'window-body', id: `b-${id}` }, content);
    const min = h('button', {
      type: 'button', 'aria-label': 'Minimize', title: `Minimize ${cfg.title}`, 'aria-expanded': 'true', 'aria-controls': `b-${id}`,
      onclick: () => {
        const isMin = sec.classList.toggle('is-min');
        min.setAttribute('aria-expanded', String(!isMin));
        min.setAttribute('aria-label', isMin ? 'Restore' : 'Minimize');
        min.title = `${isMin ? 'Restore' : 'Minimize'} ${cfg.title}`;
      }
    });
    const close = h('button', {
      type: 'button', 'aria-label': 'Close', title: `Close ${cfg.title}`,
      onclick: () => { sec.hidden = true; $('startBtn').focus(); }
    });
    sec.append(
      h('div', { class: 'title-bar' },
        h('div', { class: 'title-bar-text' }, icon(cfg.icon), h('h2', { id: `t-${id}` }, cfg.title)),
        h('div', { class: 'title-bar-controls' }, min, close)),
      body);
    return sec;
  }
  function openWindow(id) {
    const sec = $(id);
    if (!sec) return;
    sec.hidden = false;
    sec.classList.remove('is-min');
    const min = sec.querySelector('.title-bar-controls button[aria-expanded]');
    if (min) { min.setAttribute('aria-expanded', 'true'); min.setAttribute('aria-label', 'Minimize'); }
  }
  function viewCert(c) {
    $('viewerTitle').textContent = c.name;
    $('viewerImg').src = c.image;
    $('viewerImg').alt = `${c.name} certificate`;
    $('viewer').showModal();
  }

  /* start menu */
  function toggleStart(open) {
    const menu = $('startMenu');
    const next = open ?? menu.hidden;
    menu.hidden = !next;
    $('startBtn').setAttribute('aria-expanded', String(next));
  }

  function buildNav(ids) {
    const items = [['home', 'Welcome', 'computer'], ...ids.map((id) => [id, SECTIONS[id].title, SECTIONS[id].icon])];
    const go = (id) => () => { openWindow(id); toggleStart(false); };
    $('smNav').append(...items.map(([id, t, ic]) => h('a', { class: 'sm-link', href: `#${id}`, onclick: go(id) }, icon(ic), t)));
    $('tasks').append(...items.map(([id, t, ic]) => h('a', { class: 'task', href: `#${id}`, 'data-id': id, onclick: go(id) }, icon(ic, 'ico'), h('span', {}, t))));
    $('smLinks').append(
      h('a', { class: 'sm-link', href: profile.cv, download: true }, icon('doc'), 'Download CV'),
      h('a', { class: 'sm-link', href: `mailto:${profile.email}` }, icon('mail'), 'Email'),
      h('a', { class: 'sm-link', href: profile.linkedin, target: '_blank', rel: 'noopener' }, icon('link'), 'LinkedIn')
    );
    const spy = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        document.querySelectorAll('.task').forEach((t) => t.classList.toggle('is-active', t.dataset.id === e.target.id));
      }
    }, { rootMargin: '-35% 0px -60% 0px' });
    items.forEach(([id]) => { const el = $(id); if (el) spy.observe(el); });
  }

  function fillProfile(certs) {
    const p = profile;
    document.title = `${p.shortName} | ${p.title}`;
    $('name').textContent = p.name;
    $('role').textContent = p.title;
    $('place').textContent = p.location;
    $('summary').textContent = p.summary;
    $('smName').textContent = p.name;
    $('smRole').textContent = p.title;
    if (p.photo) { $('photo').src = p.photo; $('smPhoto').src = p.photo; }
    $('actions').append(
      h('a', { class: 'btn', href: `mailto:${p.email}` }, 'Email me'),
      h('a', { class: 'btn', href: p.linkedin, target: '_blank', rel: 'noopener' }, 'LinkedIn')
    );
    $('actions').querySelector('.btn-go').href = p.cv;
    if (certs) {
      const top = certs.filter((c) => c.verifyUrl).map((c) => c.name);
      $('chips').append(...top.map((n) => h('li', {}, h('a', { href: '#certificates' }, n))));
    } else $('chips').hidden = true;
  }

  function tick() {
    const time = new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit', timeZone: 'Asia/Riyadh' }).format(new Date());
    $('clock').textContent = time;
  }

  async function start() {
    tick();
    setInterval(tick, 20000);
    $('startBtn').addEventListener('click', (e) => { e.stopPropagation(); toggleStart(); });
    document.addEventListener('click', (e) => { if (!$('startMenu').contains(e.target)) toggleStart(false); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') { toggleStart(false); } });
    $('viewerClose').addEventListener('click', () => $('viewer').close());

    let site;
    try {
      site = await getJSON('site');
    } catch {
      const help = location.protocol === 'file:'
        ? 'This page needs a web server. In VS Code, right-click index.html and choose Open with Live Server.'
        : 'The file data/site.json could not be read. Check it for a missing comma or quote.';
      $('sections').append(h('p', { class: 'notice' }, help));
      return;
    }
    profile = site.profile;
    const ids = Object.keys(site.sections).filter((k) => site.sections[k] && SECTIONS[k]);
    const loaded = await Promise.all(ids.map(async (id) => {
      const cfg = SECTIONS[id];
      try {
        const data = cfg.file ? await getJSON(cfg.file) : null;
        return { id, data, node: cfg.render(data) };
      } catch {
        return { id, data: null, node: h('p', { class: 'notice' }, `The file data/${cfg.file}.json could not be read. Check it for a missing comma or quote.`) };
      }
    }));
    const certData = loaded.find((l) => l.id === 'certificates');
    fillProfile(certData && certData.data);
    $('sections').append(...loaded.map((l) => buildWindow(l.id, SECTIONS[l.id], l.node)));
    buildNav(ids);
    if (location.hash) { const t = document.querySelector(location.hash); if (t) t.scrollIntoView(); }
  }
  start();
})();
