(function () {
  function setupMoviePlayer(videoId, buttonId, coverId, streamUrl) {
    var video = document.getElementById(videoId);
    var button = document.getElementById(buttonId);
    var cover = document.getElementById(coverId);
    var hls = null;
    var attached = false;

    if (!video || !streamUrl) {
      return;
    }

    function attachStream() {
      if (attached) {
        return;
      }
      attached = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = streamUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          autoStartLoad: false,
          capLevelToPlayerSize: true,
          enableWorker: true
        });
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
      } else {
        video.src = streamUrl;
      }
    }

    function startPlayback() {
      attachStream();
      if (cover) {
        cover.classList.add('is-hidden');
      }
      video.controls = true;
      if (hls && typeof hls.startLoad === 'function') {
        hls.startLoad();
      }
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {
          video.controls = true;
        });
      }
    }

    if (cover) {
      cover.addEventListener('click', startPlayback);
    }
    if (button) {
      button.addEventListener('click', function (event) {
        event.stopPropagation();
        startPlayback();
      });
    }
    video.addEventListener('click', function () {
      if (video.paused) {
        startPlayback();
      }
    });
    video.addEventListener('play', function () {
      if (cover) {
        cover.classList.add('is-hidden');
      }
    });
  }

  window.setupMoviePlayer = setupMoviePlayer;
})();
