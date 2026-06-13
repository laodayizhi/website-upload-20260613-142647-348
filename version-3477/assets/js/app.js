(function () {
  function normalize(value) {
    return (value || "").toString().toLowerCase().trim();
  }

  function setupMenu() {
    var button = document.querySelector("[data-menu-toggle]");
    var panel = document.querySelector("[data-mobile-panel]");
    if (!button || !panel) {
      return;
    }
    button.addEventListener("click", function () {
      panel.classList.toggle("is-open");
    });
  }

  function setupHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function show(target) {
      if (!slides.length) {
        return;
      }
      index = (target + slides.length) % slides.length;
      slides.forEach(function (slide, position) {
        slide.classList.toggle("is-active", position === index);
      });
      dots.forEach(function (dot, position) {
        dot.classList.toggle("is-active", position === index);
      });
    }

    function startTimer() {
      stopTimer();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stopTimer() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot, position) {
      dot.addEventListener("click", function () {
        show(position);
        startTimer();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        startTimer();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        startTimer();
      });
    }

    hero.addEventListener("mouseenter", stopTimer);
    hero.addEventListener("mouseleave", startTimer);
    show(0);
    startTimer();
  }

  function setupSearch() {
    var input = document.querySelector("[data-search-input]");
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-card]"));
    var empty = document.querySelector("[data-search-empty]");
    var chips = Array.prototype.slice.call(document.querySelectorAll("[data-filter]"));
    var activeFilter = "all";

    if (!input && !chips.length) {
      return;
    }

    function cardText(card) {
      return normalize([
        card.getAttribute("data-title"),
        card.getAttribute("data-year"),
        card.getAttribute("data-region"),
        card.getAttribute("data-genre"),
        card.getAttribute("data-tags"),
        card.textContent
      ].join(" "));
    }

    function apply() {
      var query = normalize(input ? input.value : "");
      var visibleCount = 0;
      cards.forEach(function (card) {
        var text = cardText(card);
        var queryOk = !query || text.indexOf(query) >= 0;
        var filterOk = activeFilter === "all" || text.indexOf(normalize(activeFilter)) >= 0;
        var visible = queryOk && filterOk;
        card.hidden = !visible;
        if (visible) {
          visibleCount += 1;
        }
      });
      if (empty) {
        empty.hidden = visibleCount !== 0;
      }
    }

    if (input) {
      input.addEventListener("input", apply);
    }

    chips.forEach(function (chip) {
      chip.addEventListener("click", function () {
        activeFilter = chip.getAttribute("data-filter") || "all";
        chips.forEach(function (item) {
          item.classList.toggle("is-active", item === chip);
        });
        apply();
      });
    });

    apply();
  }

  function setupPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));
    players.forEach(function (player) {
      var video = player.querySelector("video[data-stream]");
      var button = player.querySelector("[data-player-start]");
      if (!video || !button) {
        return;
      }
      var stream = video.getAttribute("data-stream");
      var hlsInstance = null;
      var preparing = false;

      function markPlaying() {
        player.classList.add("is-playing");
      }

      function start() {
        if (!stream || preparing) {
          return;
        }
        preparing = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          if (!video.getAttribute("src")) {
            video.setAttribute("src", stream);
          }
          video.play().then(markPlaying).catch(function () {
            preparing = false;
          });
          return;
        }
        if (window.Hls && window.Hls.isSupported()) {
          if (!hlsInstance) {
            hlsInstance = new window.Hls({
              enableWorker: true,
              lowLatencyMode: true,
              backBufferLength: 90
            });
            hlsInstance.loadSource(stream);
            hlsInstance.attachMedia(video);
          }
          var playNow = function () {
            video.play().then(markPlaying).catch(function () {
              preparing = false;
            });
          };
          if (video.readyState >= 1) {
            playNow();
          } else {
            video.addEventListener("loadedmetadata", playNow, { once: true });
          }
          return;
        }
        video.setAttribute("src", stream);
        video.play().then(markPlaying).catch(function () {
          preparing = false;
        });
      }

      button.addEventListener("click", start);
      video.addEventListener("play", markPlaying);
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    setupMenu();
    setupHero();
    setupSearch();
    setupPlayers();
  });
})();
