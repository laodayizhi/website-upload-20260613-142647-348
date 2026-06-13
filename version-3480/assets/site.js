(function () {
  const doc = document;
  const qs = (sel, root = doc) => root.querySelector(sel);
  const qsa = (sel, root = doc) => Array.from(root.querySelectorAll(sel));
  const params = new URLSearchParams(location.search);

  // Mobile navigation toggle, if present.
  const navToggle = qs('[data-nav-toggle]');
  const navMenu = qs('[data-nav-menu]');
  if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => navMenu.classList.toggle('open'));
  }

  // Hero slider.
  const slider = qs('[data-hero-slider]');
  if (slider) {
    const slides = qsa('[data-slide]', slider);
    const dots = qsa('[data-dot]', slider);
    const prev = qs('[data-prev]', slider);
    const next = qs('[data-next]', slider);
    let active = 0;
    let timer = null;
    const show = (i) => {
      active = (i + slides.length) % slides.length;
      slides.forEach((s, idx) => s.classList.toggle('active', idx === active));
      dots.forEach((d, idx) => d.classList.toggle('active', idx === active));
    };
    const play = () => {
      clearInterval(timer);
      timer = setInterval(() => show(active + 1), 5000);
    };
    if (slides.length) {
      show(0);
      play();
      prev && prev.addEventListener('click', () => { show(active - 1); play(); });
      next && next.addEventListener('click', () => { show(active + 1); play(); });
      dots.forEach((d, idx) => d.addEventListener('click', () => { show(idx); play(); }));
      slider.addEventListener('mouseenter', () => clearInterval(timer));
      slider.addEventListener('mouseleave', play);
    }
  }

  // Search form redirects to the dedicated search page.
  qsa('form[data-site-search]').forEach((form) => {
    form.addEventListener('submit', (ev) => {
      const input = qs('input[name="q"]', form);
      if (!input) return;
      ev.preventDefault();
      const value = input.value.trim();
      location.href = 'search.html?q=' + encodeURIComponent(value);
    });
  });

  // Detail page player logic.
  const player = qs('[data-player]');
  const playBtn = qs('[data-play-button]');
  const source = player ? player.getAttribute('data-src') : '';
  if (player && source) {
    const setSource = () => {
      if (source.endsWith('.m3u8') && window.Hls && window.Hls.isSupported && window.Hls.isSupported()) {
        const hls = new Hls();
        hls.loadSource(source);
        hls.attachMedia(player);
        player._hls = hls;
      } else {
        player.src = source;
      }
    };
    setSource();
    if (playBtn) {
      playBtn.addEventListener('click', async () => {
        try {
          await player.play();
          playBtn.textContent = '播放中';
        } catch (err) {
          console.warn(err);
        }
      });
    }
  }

  // Search page live filter.
  const searchBox = qs('[data-search-box]');
  const resultWrap = qs('[data-search-results]');
  const typeSelect = qs('[data-type-filter]');
  const regionSelect = qs('[data-region-filter]');
  if (searchBox && resultWrap) {
    const indexUrl = 'assets/movies-index.json';
    const initialQ = (params.get('q') || '').trim();
    if (initialQ) searchBox.value = initialQ;

    let dataset = [];
    let ready = false;

    const render = (items) => {
      resultWrap.innerHTML = '';
      const frag = document.createDocumentFragment();
      if (!items.length) {
        const empty = document.createElement('div');
        empty.className = 'panel';
        empty.innerHTML = '<h3>没有找到匹配内容</h3><p>请尝试更短的关键词，或者切换分类条件。</p>';
        frag.appendChild(empty);
      } else {
        items.forEach((m) => {
          const row = document.createElement('a');
          row.className = 'list-row';
          row.href = m.slug;
          row.innerHTML = `
            <div class="list-thumb">${m.idx}</div>
            <div>
              <h3>${escapeHtml(m.title)}</h3>
              <p>${escapeHtml(m.one_line || m.summary || '')}</p>
            </div>
            <div class="right">
              <span class="chip">${escapeHtml(m.year || '')}</span>
              <span class="chip">${escapeHtml(m.region || '')}</span>
              <span class="chip">${escapeHtml(m.genre || '')}</span>
            </div>`;
          frag.appendChild(row);
        });
      }
      resultWrap.appendChild(frag);
      const counter = qs('[data-result-count]');
      if (counter) counter.textContent = String(items.length);
    };

    const apply = () => {
      const q = searchBox.value.trim().toLowerCase();
      const typeVal = typeSelect ? typeSelect.value : '';
      const regionVal = regionSelect ? regionSelect.value : '';
      let items = dataset.slice();
      if (q) {
        items = items.filter((m) => {
          const hay = [m.title, m.region, m.type, m.genre, m.tags, m.one_line, m.summary, m.review].join(' ').toLowerCase();
          return hay.includes(q);
        });
      }
      if (typeVal) items = items.filter((m) => m.type === typeVal);
      if (regionVal) items = items.filter((m) => m.region === regionVal);
      render(items.slice(0, 300));
    };

    const loadIndex = async () => {
      const res = await fetch(indexUrl, { cache: 'no-store' });
      dataset = await res.json();
      ready = true;
      apply();
      if (initialQ) apply();
    };

    searchBox.addEventListener('input', () => ready && apply());
    typeSelect && typeSelect.addEventListener('change', () => ready && apply());
    regionSelect && regionSelect.addEventListener('change', () => ready && apply());
    loadIndex().catch((e) => {
      console.error(e);
      resultWrap.innerHTML = '<div class="panel"><h3>搜索数据加载失败</h3><p>请检查 assets/movies-index.json 是否存在。</p></div>';
    });
  }

  // Smooth scroll for anchor links.
  qsa('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href').slice(1);
      const target = id ? qs('#' + CSS.escape(id)) : null;
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  function escapeHtml(str) {
    return String(str || '').replace(/[&<>"']/g, (ch) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  }
})();
