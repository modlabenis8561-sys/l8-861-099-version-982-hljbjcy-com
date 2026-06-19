(function () {
  var video = document.querySelector('[data-video-player]');
  var overlay = document.querySelector('[data-video-overlay]');
  var button = document.querySelector('[data-video-play]');
  var url = window.__videoUrl;
  var ready = false;

  if (!video || !url) {
    return;
  }

  function attachStream() {
    if (ready) {
      return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = url;
      ready = true;
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });

      hls.loadSource(url);
      hls.attachMedia(video);
      ready = true;
      return;
    }

    video.src = url;
    ready = true;
  }

  function start() {
    attachStream();

    if (overlay) {
      overlay.classList.add('is-hidden');
    }

    video.controls = true;

    var playResult = video.play();

    if (playResult && typeof playResult.catch === 'function') {
      playResult.catch(function () {
        video.controls = true;
      });
    }
  }

  if (button) {
    button.addEventListener('click', start);
  }

  if (overlay) {
    overlay.addEventListener('click', start);
  }

  video.addEventListener('click', function () {
    if (video.paused) {
      start();
    }
  });
})();
