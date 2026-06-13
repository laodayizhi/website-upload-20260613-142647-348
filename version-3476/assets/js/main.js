
(function () {
    var toggle = document.querySelector('[data-menu-toggle]');
    var panel = document.querySelector('[data-mobile-panel]');

    if (toggle && panel) {
        toggle.addEventListener('click', function () {
            panel.classList.toggle('open');
            toggle.textContent = panel.classList.contains('open') ? '×' : '☰';
        });
    }

    var scrollRow = document.querySelector('[data-scroll-row]');
    var left = document.querySelector('[data-scroll-left]');
    var right = document.querySelector('[data-scroll-right]');

    if (scrollRow && left && right) {
        left.addEventListener('click', function () {
            scrollRow.scrollBy({ left: -280, behavior: 'smooth' });
        });
        right.addEventListener('click', function () {
            scrollRow.scrollBy({ left: 280, behavior: 'smooth' });
        });
    }

    var hero = document.querySelector('[data-hero]');

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var current = 0;

        function showSlide(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === current);
            });
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                showSlide(parseInt(dot.getAttribute('data-hero-dot'), 10));
            });
        });

        if (slides.length > 1) {
            window.setInterval(function () {
                showSlide(current + 1);
            }, 5600);
        }
    }

    var input = document.querySelector('[data-filter-input]');
    var list = document.querySelector('[data-filter-list]');
    var empty = document.querySelector('[data-empty-state]');

    if (input && list) {
        var items = Array.prototype.slice.call(list.children);
        input.addEventListener('input', function () {
            var query = input.value.trim().toLowerCase();
            var visible = 0;
            items.forEach(function (item) {
                var text = (item.getAttribute('data-filter') || item.textContent || '').toLowerCase();
                var matched = !query || text.indexOf(query) !== -1;
                item.style.display = matched ? '' : 'none';
                if (matched) {
                    visible += 1;
                }
            });
            if (empty) {
                empty.classList.toggle('show', visible === 0);
            }
        });
    }
})();
