(function () {
  function selectAll(selector, parent) {
    return Array.prototype.slice.call((parent || document).querySelectorAll(selector));
  }

  function text(value) {
    return (value || '').toString().trim().toLowerCase();
  }

  function setupNavigation() {
    var toggle = document.querySelector('[data-nav-toggle]');
    var nav = document.querySelector('[data-site-nav]');
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  function setupHero() {
    var root = document.querySelector('[data-hero-carousel]');
    if (!root) {
      return;
    }
    var slides = selectAll('.hero-slide', root);
    var dots = selectAll('.hero-dot', root);
    if (!slides.length) {
      return;
    }
    var index = 0;
    var timer = null;

    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, current) {
        slide.classList.toggle('is-active', current === index);
      });
      dots.forEach(function (dot, current) {
        dot.classList.toggle('is-active', current === index);
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
        timer = null;
      }
    }

    dots.forEach(function (dot, current) {
      dot.addEventListener('click', function () {
        show(current);
        start();
      });
    });

    root.addEventListener('mouseenter', stop);
    root.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function setupFilters() {
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q') || '';
    selectAll('[data-filter-area]').forEach(function (area) {
      var input = area.querySelector('[data-search-input]');
      if (input && initialQuery && !input.value) {
        input.value = initialQuery;
      }
      var typeSelect = area.querySelector('[data-type-filter]');
      var yearSelect = area.querySelector('[data-year-filter]');
      var regionSelect = area.querySelector('[data-region-filter]');
      var cards = selectAll('.movie-card', area);
      var empty = area.querySelector('[data-empty-result]');

      function apply() {
        var query = text(input && input.value);
        var type = text(typeSelect && typeSelect.value);
        var year = text(yearSelect && yearSelect.value);
        var region = text(regionSelect && regionSelect.value);
        var visible = 0;

        cards.forEach(function (card) {
          var haystack = text([
            card.getAttribute('data-title'),
            card.getAttribute('data-meta'),
            card.getAttribute('data-tags')
          ].join(' '));
          var matchesQuery = !query || haystack.indexOf(query) !== -1;
          var matchesType = !type || text(card.getAttribute('data-type')) === type;
          var matchesYear = !year || text(card.getAttribute('data-year')) === year;
          var matchesRegion = !region || text(card.getAttribute('data-region')).indexOf(region) !== -1;
          var matches = matchesQuery && matchesType && matchesYear && matchesRegion;
          card.hidden = !matches;
          if (matches) {
            visible += 1;
          }
        });

        if (empty) {
          empty.classList.toggle('is-visible', visible === 0);
        }
      }

      [input, typeSelect, yearSelect, regionSelect].forEach(function (element) {
        if (element) {
          element.addEventListener('input', apply);
          element.addEventListener('change', apply);
        }
      });

      apply();
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupNavigation();
    setupHero();
    setupFilters();
  });
})();
