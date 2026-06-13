(function () {
  var header = document.getElementById('site-header');
  var modal = document.querySelector('[data-search-modal]');
  var searchInput = document.querySelector('[data-search-input]');
  var instantResults = document.querySelector('[data-instant-results]');
  var mobilePanel = document.querySelector('[data-mobile-panel]');
  var menuToggle = document.querySelector('[data-menu-toggle]');
  var searchIndex = window.SITE_SEARCH_INDEX || [];

  function onScroll() {
    if (!header) {
      return;
    }
    if (window.scrollY > 40) {
      header.classList.add('is-scrolled');
    } else {
      header.classList.remove('is-scrolled');
    }
  }

  function openSearch() {
    if (!modal) {
      return;
    }
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    if (searchInput) {
      setTimeout(function () {
        searchInput.focus();
      }, 40);
    }
  }

  function closeSearch() {
    if (!modal) {
      return;
    }
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
  }

  function cardMarkup(item) {
    return [
      '<a href="' + item.href + '">',
      '<img src="' + item.cover + '" alt="' + escapeHtml(item.title) + '">',
      '<div>',
      '<h3>' + escapeHtml(item.title) + '</h3>',
      '<p>' + escapeHtml(item.oneLine) + '</p>',
      '</div>',
      '</a>'
    ].join('');
  }

  function resultMarkup(item) {
    return [
      '<a class="search-result-card" href="' + item.href + '">',
      '<img src="' + item.cover + '" alt="' + escapeHtml(item.title) + '">',
      '<div>',
      '<h3>' + escapeHtml(item.title) + '</h3>',
      '<p>' + escapeHtml(item.oneLine) + '</p>',
      '</div>',
      '</a>'
    ].join('');
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function searchItems(query, limit) {
    var q = String(query || '').trim().toLowerCase();
    if (!q) {
      return [];
    }
    return searchIndex.filter(function (item) {
      return item.search.indexOf(q) !== -1;
    }).slice(0, limit || 8);
  }

  function updateInstantResults() {
    if (!searchInput || !instantResults) {
      return;
    }
    var results = searchItems(searchInput.value, 6);
    instantResults.innerHTML = results.map(cardMarkup).join('');
  }

  function initHero() {
    var carousel = document.querySelector('[data-hero-carousel]');
    if (!carousel) {
      return;
    }
    var slides = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-dot]'));
    var active = 0;
    var timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === active);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === active);
      });
    }

    function next() {
      show(active + 1);
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        if (timer) {
          clearInterval(timer);
        }
        timer = setInterval(next, 5800);
      });
    });

    timer = setInterval(next, 5800);
  }

  function initPageFilter() {
    var input = document.querySelector('[data-page-filter]');
    var yearFilter = document.querySelector('[data-year-filter]');
    var list = document.querySelector('[data-card-list]');
    var empty = document.querySelector('[data-empty-state]');
    if (!list) {
      return;
    }
    var cards = Array.prototype.slice.call(list.querySelectorAll('[data-search]'));

    function apply() {
      var q = input ? input.value.trim().toLowerCase() : '';
      var year = yearFilter ? yearFilter.value : '';
      var visible = 0;
      cards.forEach(function (card) {
        var text = (card.getAttribute('data-search') || '').toLowerCase();
        var cardYear = card.getAttribute('data-year') || '';
        var ok = (!q || text.indexOf(q) !== -1) && (!year || cardYear === year);
        card.style.display = ok ? '' : 'none';
        if (ok) {
          visible += 1;
        }
      });
      if (empty) {
        empty.classList.toggle('is-visible', visible === 0);
      }
    }

    if (input) {
      input.addEventListener('input', apply);
    }
    if (yearFilter) {
      yearFilter.addEventListener('change', apply);
    }
  }

  function initSearchPage() {
    var input = document.querySelector('[data-search-page-input]');
    var button = document.querySelector('[data-search-page-button]');
    var resultsBox = document.querySelector('[data-search-page-results]');
    var empty = document.querySelector('[data-search-page-empty]');
    if (!input || !resultsBox) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var initial = params.get('q') || '';
    input.value = initial;

    function render() {
      var results = searchItems(input.value, 120);
      resultsBox.innerHTML = results.map(resultMarkup).join('');
      if (empty) {
        empty.classList.toggle('is-visible', results.length === 0);
      }
    }

    input.addEventListener('input', render);
    if (button) {
      button.addEventListener('click', render);
    }
    render();
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  document.querySelectorAll('[data-search-open]').forEach(function (button) {
    button.addEventListener('click', openSearch);
  });

  document.querySelectorAll('[data-search-close]').forEach(function (button) {
    button.addEventListener('click', closeSearch);
  });

  if (modal) {
    modal.addEventListener('click', function (event) {
      if (event.target === modal) {
        closeSearch();
      }
    });
  }

  if (searchInput) {
    searchInput.addEventListener('input', updateInstantResults);
  }

  if (menuToggle && mobilePanel) {
    menuToggle.addEventListener('click', function () {
      mobilePanel.classList.toggle('is-open');
    });
  }

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') {
      closeSearch();
    }
  });

  initHero();
  initPageFilter();
  initSearchPage();
})();
