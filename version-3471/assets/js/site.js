(function () {
  var body = document.body;
  var toggle = document.querySelector('[data-menu-toggle]');

  if (toggle) {
    toggle.addEventListener('click', function () {
      body.classList.toggle('menu-open');
    });
  }

  var slider = document.querySelector('[data-hero-slider]');

  if (slider) {
    var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
    var index = 0;
    var timer;

    function setSlide(nextIndex) {
      index = nextIndex % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    function start() {
      if (slides.length < 2) {
        return;
      }
      timer = window.setInterval(function () {
        setSlide(index + 1);
      }, 5200);
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        window.clearInterval(timer);
        setSlide(dotIndex);
        start();
      });
    });

    setSlide(0);
    start();
  }

  var localForm = document.querySelector('[data-local-search]');
  var localInput = localForm ? localForm.querySelector('input[type="search"]') : null;
  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-search-item]'));
  var chipButtons = Array.prototype.slice.call(document.querySelectorAll('[data-filter-chip]'));

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function filterCards() {
    if (!cards.length) {
      return;
    }

    var query = normalize(localInput ? localInput.value : '');
    var activeChip = document.querySelector('[data-filter-chip].is-active');
    var chip = activeChip ? activeChip.getAttribute('data-filter-chip') : 'all';
    var visible = 0;

    cards.forEach(function (card) {
      var text = normalize(card.getAttribute('data-title'));
      var category = normalize(card.getAttribute('data-category'));
      var matchedText = !query || text.indexOf(query) !== -1;
      var matchedChip = chip === 'all' || category.indexOf(normalize(chip)) !== -1;
      var show = matchedText && matchedChip;
      card.style.display = show ? '' : 'none';
      if (show) {
        visible += 1;
      }
    });

    body.classList.toggle('has-empty-search', visible === 0);
  }

  if (localForm && localInput) {
    var params = new URLSearchParams(window.location.search);
    var q = params.get('q');
    if (q) {
      localInput.value = q;
    }

    localForm.addEventListener('submit', function (event) {
      event.preventDefault();
      filterCards();
    });

    localInput.addEventListener('input', filterCards);
    filterCards();
  }

  chipButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      chipButtons.forEach(function (item) {
        item.classList.remove('is-active');
      });
      button.classList.add('is-active');
      filterCards();
    });
  });

  var globalSearch = document.querySelector('[data-global-search]');

  if (globalSearch) {
    globalSearch.addEventListener('submit', function () {
      var input = globalSearch.querySelector('input[name="q"]');
      if (input) {
        input.value = input.value.trim();
      }
    });
  }
}());
