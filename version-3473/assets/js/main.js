(function () {
  function selectAll(selector, scope) {
    return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
  }

  function initMenu() {
    var button = document.querySelector('[data-menu-button]');
    var panel = document.querySelector('[data-mobile-panel]');
    if (!button || !panel) {
      return;
    }
    button.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  }

  function initHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = selectAll('[data-hero-slide]', hero);
    var dots = selectAll('[data-hero-dot]', hero);
    if (slides.length < 2) {
      return;
    }
    var index = 0;
    var timer = null;
    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
    }
    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }
    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
        start();
      });
    });
    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    start();
  }

  function filterCards(cards, query) {
    var value = (query || '').trim().toLowerCase();
    var visible = 0;
    cards.forEach(function (card) {
      var text = (card.getAttribute('data-filter') || '').toLowerCase();
      var matched = !value || text.indexOf(value) !== -1;
      card.classList.toggle('is-hidden', !matched);
      if (matched) {
        visible += 1;
      }
    });
    return visible;
  }

  function initLocalFilters() {
    var input = document.querySelector('[data-local-filter]');
    var list = document.querySelector('[data-card-list]');
    if (!input || !list) {
      return;
    }
    var cards = selectAll('[data-card]', list);
    var chips = selectAll('[data-filter-chip]');
    function run(value) {
      filterCards(cards, value);
    }
    input.addEventListener('input', function () {
      chips.forEach(function (chip) {
        chip.classList.remove('is-active');
      });
      run(input.value);
    });
    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        var value = chip.getAttribute('data-filter-chip') || '';
        input.value = value;
        chips.forEach(function (item) {
          item.classList.toggle('is-active', item === chip);
        });
        run(value);
      });
    });
  }

  function initSearchPage() {
    var page = document.querySelector('[data-page="search"]');
    if (!page) {
      return;
    }
    var input = page.querySelector('[data-search-box]');
    var status = page.querySelector('[data-search-status]');
    var cards = selectAll('[data-card]', page);
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q') || '';
    function run(value) {
      var visible = filterCards(cards, value);
      if (status) {
        status.textContent = value ? '搜索结果：' + visible + ' 部' : '热门影片推荐';
      }
    }
    if (input) {
      input.value = query;
      input.addEventListener('input', function () {
        run(input.value);
      });
    }
    run(query);
  }

  document.addEventListener('DOMContentLoaded', function () {
    initMenu();
    initHero();
    initLocalFilters();
    initSearchPage();
  });
})();
