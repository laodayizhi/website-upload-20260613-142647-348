(function () {
    var menuButton = document.querySelector('[data-menu-toggle]');
    var mobilePanel = document.querySelector('[data-mobile-panel]');

    if (menuButton && mobilePanel) {
        menuButton.addEventListener('click', function () {
            mobilePanel.classList.toggle('is-open');
        });
    }

    var hero = document.querySelector('[data-hero]');

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dotsWrap = hero.querySelector('[data-hero-dots]');
        var index = 0;
        var timer = null;

        function showSlide(nextIndex) {
            if (!slides.length) {
                return;
            }

            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === index);
            });

            if (dotsWrap) {
                Array.prototype.slice.call(dotsWrap.children).forEach(function (dot, dotIndex) {
                    dot.classList.toggle('is-active', dotIndex === index);
                });
            }
        }

        function startHero() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                showSlide(index + 1);
            }, 5200);
        }

        if (dotsWrap) {
            slides.forEach(function (_, slideIndex) {
                var dot = document.createElement('button');
                dot.type = 'button';
                dot.addEventListener('click', function () {
                    showSlide(slideIndex);
                    startHero();
                });
                dotsWrap.appendChild(dot);
            });
        }

        showSlide(0);
        startHero();
    }

    var filterInput = document.querySelector('[data-filter-input]');
    var filterYear = document.querySelector('[data-filter-year]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));
    var searchPageInput = document.querySelector('[data-search-page-input]');

    if (searchPageInput) {
        var params = new URLSearchParams(window.location.search);
        var initialQuery = params.get('q');

        if (initialQuery) {
            searchPageInput.value = initialQuery;
        }
    }

    function filterCards() {
        if (!cards.length) {
            return;
        }

        var query = filterInput ? filterInput.value.trim().toLowerCase() : '';
        var year = filterYear ? filterYear.value : '';

        cards.forEach(function (card) {
            var haystack = [
                card.getAttribute('data-title'),
                card.getAttribute('data-region'),
                card.getAttribute('data-genre'),
                card.getAttribute('data-tags'),
                card.getAttribute('data-year')
            ].join(' ').toLowerCase();
            var cardYear = card.getAttribute('data-year') || '';
            var visible = (!query || haystack.indexOf(query) !== -1) && (!year || cardYear === year);
            card.classList.toggle('is-hidden', !visible);
        });
    }

    if (filterInput) {
        filterInput.addEventListener('input', filterCards);
        filterCards();
    }

    if (filterYear) {
        filterYear.addEventListener('change', filterCards);
        filterCards();
    }

    var video = document.querySelector('[data-player-video]');
    var playButton = document.querySelector('[data-player-button]');

    if (video && playButton) {
        var loaded = false;
        var hls = null;
        var source = video.getAttribute('data-stream');

        function attachSource() {
            if (loaded || !source) {
                return;
            }

            loaded = true;

            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(source);
                hls.attachMedia(video);
                hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    video.play().catch(function () {});
                });
            } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
                video.addEventListener('loadedmetadata', function () {
                    video.play().catch(function () {});
                }, { once: true });
            } else {
                video.src = source;
                video.play().catch(function () {});
            }
        }

        function startPlayback() {
            playButton.classList.add('is-hidden');
            video.controls = true;
            attachSource();
            video.play().catch(function () {});
        }

        playButton.addEventListener('click', startPlayback);
        video.addEventListener('click', function () {
            if (!loaded) {
                startPlayback();
            }
        });

        window.addEventListener('beforeunload', function () {
            if (hls && hls.destroy) {
                hls.destroy();
            }
        });
    }
})();
