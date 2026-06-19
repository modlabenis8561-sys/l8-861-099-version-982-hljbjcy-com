(function () {
  window.startMoviePlayer = function (stream) {
    const player = document.getElementById('moviePlayer');
    const button = document.getElementById('playButton');
    if (!player || !button || !stream) {
      return;
    }

    let ready = false;
    let hls = null;

    const prepare = function () {
      if (ready) {
        return;
      }
      ready = true;

      if (player.canPlayType('application/vnd.apple.mpegurl')) {
        player.src = stream;
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(stream);
        hls.attachMedia(player);
        return;
      }

      player.src = stream;
    };

    const begin = function () {
      button.classList.add('is-hidden');
      prepare();
      const playPromise = player.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {
          button.classList.remove('is-hidden');
        });
      }
    };

    button.addEventListener('click', begin);
    player.addEventListener('click', function () {
      if (!ready && player.paused) {
        begin();
      }
    });

    window.addEventListener('pagehide', function () {
      if (hls) {
        hls.destroy();
        hls = null;
      }
    });
  };
})();
