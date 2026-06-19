(function() {
  function initMoviePlayer(source, videoId, buttonId) {
    var video = document.getElementById(videoId);
    var button = document.getElementById(buttonId);
    if (!video || !button || !source) {
      return;
    }

    var attached = false;
    var hls = null;

    function attachSource() {
      if (attached) {
        return;
      }
      attached = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
      } else {
        video.src = source;
      }
    }

    function play() {
      attachSource();
      button.classList.add("is-hidden");
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(function() {
          button.classList.remove("is-hidden");
        });
      }
    }

    button.addEventListener("click", play);
    video.addEventListener("play", function() {
      button.classList.add("is-hidden");
    });
    video.addEventListener("pause", function() {
      if (!video.ended) {
        button.classList.remove("is-hidden");
      }
    });
    video.addEventListener("ended", function() {
      button.classList.remove("is-hidden");
    });
    video.addEventListener("click", function() {
      if (video.paused) {
        play();
      }
    });
    window.addEventListener("pagehide", function() {
      if (hls) {
        hls.destroy();
      }
    });
  }

  window.initMoviePlayer = initMoviePlayer;
})();
