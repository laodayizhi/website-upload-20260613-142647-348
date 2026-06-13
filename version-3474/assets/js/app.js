(function () {
    var menuButton = document.querySelector(".menu-toggle");
    var mobilePanel = document.querySelector(".mobile-panel");

    if (menuButton && mobilePanel) {
        menuButton.addEventListener("click", function () {
            var open = mobilePanel.classList.toggle("is-open");
            menuButton.setAttribute("aria-expanded", open ? "true" : "false");
            menuButton.textContent = open ? "×" : "☰";
        });
    }

    document.querySelectorAll("[data-search-form]").forEach(function (form) {
        form.addEventListener("submit", function (event) {
            event.preventDefault();
            var input = form.querySelector("input[name='q'], input[type='search']");
            var value = input ? input.value.trim() : "";
            var target = form.getAttribute("action") || "./search.html";
            window.location.href = value ? target + "?q=" + encodeURIComponent(value) : target;
        });
    });

    var hero = document.querySelector("[data-hero]");
    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
        var prev = hero.querySelector(".hero-prev");
        var next = hero.querySelector(".hero-next");
        var current = 0;
        var timer = null;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, itemIndex) {
                slide.classList.toggle("is-active", itemIndex === current);
            });
            dots.forEach(function (dot, itemIndex) {
                dot.classList.toggle("is-active", itemIndex === current);
            });
        }

        function startTimer() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                showSlide(current + 1);
            }, 5200);
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                showSlide(Number(dot.getAttribute("data-slide")) || 0);
                startTimer();
            });
        });

        if (prev) {
            prev.addEventListener("click", function () {
                showSlide(current - 1);
                startTimer();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                showSlide(current + 1);
                startTimer();
            });
        }

        startTimer();
    }

    var scrollBox = document.querySelector("[data-category-scroll]");
    var scrollLeft = document.querySelector("[data-scroll-left]");
    var scrollRight = document.querySelector("[data-scroll-right]");

    if (scrollBox && scrollLeft && scrollRight) {
        scrollLeft.addEventListener("click", function () {
            scrollBox.scrollBy({ left: -320, behavior: "smooth" });
        });
        scrollRight.addEventListener("click", function () {
            scrollBox.scrollBy({ left: 320, behavior: "smooth" });
        });
    }

    var section = document.querySelector("[data-search-section]");
    if (section) {
        var input = section.querySelector("[data-page-search]");
        var cards = Array.prototype.slice.call(section.querySelectorAll(".movie-card"));
        var buttons = Array.prototype.slice.call(section.querySelectorAll(".filter-chip"));
        var clear = section.querySelector("[data-clear-search]");
        var empty = section.querySelector("[data-empty-state]");
        var activeFilter = "all";
        var activeValue = "all";
        var params = new URLSearchParams(window.location.search);
        var queryValue = params.get("q") || "";

        if (input && queryValue) {
            input.value = queryValue;
        }

        function normalize(value) {
            return (value || "").toString().toLowerCase().trim();
        }

        function filterCards() {
            var query = input ? normalize(input.value) : "";
            var visible = 0;

            cards.forEach(function (card) {
                var matchesQuery = !query || normalize(card.getAttribute("data-search")).indexOf(query) !== -1;
                var matchesFilter = true;

                if (activeFilter !== "all") {
                    var data = normalize(card.getAttribute("data-" + activeFilter));
                    matchesFilter = data.indexOf(normalize(activeValue)) !== -1;
                }

                if (matchesQuery && matchesFilter) {
                    card.style.display = "";
                    visible += 1;
                } else {
                    card.style.display = "none";
                }
            });

            if (empty) {
                empty.classList.toggle("is-visible", visible === 0);
            }
        }

        if (input) {
            input.addEventListener("input", filterCards);
        }

        buttons.forEach(function (button) {
            button.addEventListener("click", function () {
                buttons.forEach(function (item) {
                    item.classList.remove("is-active");
                });
                button.classList.add("is-active");
                activeFilter = button.getAttribute("data-filter") || "all";
                activeValue = button.getAttribute("data-value") || "all";
                filterCards();
            });
        });

        if (clear) {
            clear.addEventListener("click", function () {
                if (input) {
                    input.value = "";
                }
                activeFilter = "all";
                activeValue = "all";
                buttons.forEach(function (item, index) {
                    item.classList.toggle("is-active", index === 0);
                });
                filterCards();
            });
        }

        filterCards();
    }
})();

window.initMoviePlayer = function (movieSource) {
    var video = document.getElementById("movieVideo");
    var cover = document.querySelector(".player-cover");
    var started = false;
    var hlsInstance = null;

    if (!video || !movieSource) {
        return;
    }

    function begin() {
        if (cover) {
            cover.classList.add("is-hidden");
        }

        if (!started) {
            started = true;

            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = movieSource;
                video.play().catch(function () {});
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({ enableWorker: true, lowLatencyMode: true });
                hlsInstance.loadSource(movieSource);
                hlsInstance.attachMedia(video);
                hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    video.play().catch(function () {});
                });
                return;
            }

            video.src = movieSource;
        }

        video.play().catch(function () {});
    }

    if (cover) {
        cover.addEventListener("click", begin);
    }

    video.addEventListener("click", function () {
        if (video.paused) {
            begin();
        }
    });

    window.addEventListener("pagehide", function () {
        if (hlsInstance) {
            hlsInstance.destroy();
            hlsInstance = null;
        }
    });
};
