(function () {
  function startPlayer(shell) {
    var video = shell.querySelector('video');
    var overlay = shell.querySelector('.play-overlay');
    var stream = shell.getAttribute('data-stream');

    if (!video || !stream) {
      return;
    }

    if (overlay) {
      overlay.classList.add('is-hidden');
    }

    if (shell.getAttribute('data-ready') === '1') {
      video.play().catch(function () {});
      return;
    }

    shell.setAttribute('data-ready', '1');

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = stream;
      video.addEventListener('loadedmetadata', function () {
        video.play().catch(function () {});
      }, { once: true });
      video.play().catch(function () {});
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({ enableWorker: true });
      hls.loadSource(stream);
      hls.attachMedia(video);
      hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
        video.play().catch(function () {});
      });
      return;
    }

    video.src = stream;
    video.play().catch(function () {});
  }

  document.querySelectorAll('.player-shell').forEach(function (shell) {
    var overlay = shell.querySelector('.play-overlay');
    var video = shell.querySelector('video');

    if (overlay) {
      overlay.addEventListener('click', function () {
        startPlayer(shell);
      });
    }

    if (video) {
      video.addEventListener('click', function () {
        startPlayer(shell);
      }, { once: true });
    }
  });
})();
