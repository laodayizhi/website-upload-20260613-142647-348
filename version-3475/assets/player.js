function initMoviePlayer(streamUrl) {
  var video = document.getElementById('movie-video');
  var overlay = document.getElementById('poster-play');
  if (!video || !overlay || !streamUrl) {
    return;
  }

  var hls = null;
  var attached = false;
  var ready = false;
  var pending = false;

  function reveal() {
    overlay.classList.add('is-hidden');
  }

  function conceal() {
    if (video.paused) {
      overlay.classList.remove('is-hidden');
    }
  }

  function playNow() {
    reveal();
    var playPromise = video.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(function () {
        conceal();
      });
    }
  }

  function attach() {
    if (attached) {
      return;
    }
    attached = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = streamUrl;
      ready = true;
      if (pending) {
        playNow();
      }
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
      hls.loadSource(streamUrl);
      hls.attachMedia(video);
      hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
        ready = true;
        if (pending) {
          playNow();
        }
      });
      hls.on(window.Hls.Events.ERROR, function (event, data) {
        if (data && data.fatal) {
          if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
            hls.startLoad();
          } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
            hls.recoverMediaError();
          } else {
            hls.destroy();
          }
        }
      });
      return;
    }

    video.src = streamUrl;
    ready = true;
  }

  function start() {
    pending = true;
    attach();
    if (ready) {
      playNow();
    } else {
      reveal();
    }
  }

  overlay.addEventListener('click', start);
  video.addEventListener('click', function () {
    if (!attached || video.paused) {
      start();
    } else {
      video.pause();
    }
  });
  video.addEventListener('play', reveal);
  video.addEventListener('pause', conceal);
  video.addEventListener('ended', conceal);
  window.addEventListener('beforeunload', function () {
    if (hls) {
      hls.destroy();
    }
  });
}
