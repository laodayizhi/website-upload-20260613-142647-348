(function () {
  function initPlayer() {
    var video = document.querySelector('[data-player-video]');
    var button = document.querySelector('[data-player-button]');
    var streamUrl = window.__streamUrl;
    var hlsInstance = null;
    var isReady = false;

    if (!video || !streamUrl) {
      return;
    }

    function attachStream() {
      if (isReady) {
        return;
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = streamUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: false,
          backBufferLength: 90
        });
        hlsInstance.loadSource(streamUrl);
        hlsInstance.attachMedia(video);
      } else {
        video.src = streamUrl;
      }

      isReady = true;
    }

    function requestPlay() {
      attachStream();
      var result = video.play();

      if (result && typeof result.catch === 'function') {
        result.catch(function () {});
      }

      if (button) {
        button.classList.add('is-hidden');
      }
    }

    if (button) {
      button.addEventListener('click', requestPlay);
    }

    video.addEventListener('click', function () {
      if (video.paused) {
        requestPlay();
      }
    });

    video.addEventListener('play', function () {
      if (button) {
        button.classList.add('is-hidden');
      }
    });

    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPlayer);
  } else {
    initPlayer();
  }
}());
