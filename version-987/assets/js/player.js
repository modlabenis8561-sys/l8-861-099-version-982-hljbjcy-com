function initMoviePlayer(videoId, buttonId, sourceUrl) {
  var video = document.getElementById(videoId);
  var button = document.getElementById(buttonId);
  var shell = video ? video.closest('.player-shell') : null;
  var hlsInstance = null;
  var ready = false;

  function prepare() {
    if (!video || ready) {
      return;
    }
    ready = true;
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = sourceUrl;
    } else if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hlsInstance.loadSource(sourceUrl);
      hlsInstance.attachMedia(video);
    } else {
      video.src = sourceUrl;
    }
  }

  function start() {
    if (!video) {
      return;
    }
    prepare();
    if (button) {
      button.hidden = true;
    }
    if (shell) {
      shell.classList.add('is-playing');
    }
    var playPromise = video.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(function () {
        if (button) {
          button.hidden = false;
        }
      });
    }
  }

  if (button) {
    button.addEventListener('click', start);
  }
  if (video) {
    video.addEventListener('click', function () {
      if (video.paused) {
        start();
      }
    });
    video.addEventListener('play', function () {
      if (button) {
        button.hidden = true;
      }
    });
  }

  window.addEventListener('beforeunload', function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
}
