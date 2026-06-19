
(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function setHero(index, slides, dots) {
    slides.forEach(function (slide, i) {
      slide.classList.toggle("is-active", i === index);
    });
    dots.forEach(function (dot, i) {
      dot.classList.toggle("is-active", i === index);
    });
  }

  function initHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
    var prev = document.querySelector(".hero-control.prev");
    var next = document.querySelector(".hero-control.next");
    if (!slides.length) {
      return;
    }
    var index = 0;
    var timer = null;
    function go(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      setHero(index, slides, dots);
    }
    function restart() {
      if (timer) {
        clearInterval(timer);
      }
      timer = setInterval(function () {
        go(index + 1);
      }, 5200);
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        go(i);
        restart();
      });
    });
    if (prev) {
      prev.addEventListener("click", function () {
        go(index - 1);
        restart();
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        go(index + 1);
        restart();
      });
    }
    restart();
  }

  function initMenu() {
    var toggle = document.querySelector(".menu-toggle");
    var panel = document.querySelector(".mobile-panel");
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener("click", function () {
      panel.classList.toggle("is-open");
    });
  }

  function initSearchForms() {
    var forms = Array.prototype.slice.call(document.querySelectorAll(".search-form, .search-page-form"));
    forms.forEach(function (form) {
      form.addEventListener("submit", function (event) {
        var input = form.querySelector("input[name='q']");
        if (!input) {
          return;
        }
        var query = input.value.trim();
        if (!query) {
          event.preventDefault();
          location.href = "./search.html";
        }
      });
    });
  }

  function getQuery() {
    var params = new URLSearchParams(location.search);
    return (params.get("q") || "").trim();
  }

  function initMovieFilters() {
    var grid = document.querySelector(".searchable-grid");
    if (!grid) {
      return;
    }
    var cards = Array.prototype.slice.call(grid.querySelectorAll(".movie-card"));
    var empty = document.querySelector(".empty-state");
    var searchInput = document.querySelector(".search-page-form input[name='q'], .local-filter input[name='q']");
    var filters = Array.prototype.slice.call(document.querySelectorAll(".movie-filter"));
    var initial = getQuery();
    if (searchInput && initial) {
      searchInput.value = initial;
    }
    function matches(card, query) {
      if (!query) {
        return true;
      }
      return (card.getAttribute("data-search") || "").toLowerCase().indexOf(query.toLowerCase()) !== -1;
    }
    function filterCard(card, key, value) {
      if (!value) {
        return true;
      }
      return (card.getAttribute("data-" + key) || "").indexOf(value) !== -1;
    }
    function apply() {
      var query = searchInput ? searchInput.value.trim() : initial;
      var shown = 0;
      cards.forEach(function (card) {
        var ok = matches(card, query);
        filters.forEach(function (select) {
          ok = ok && filterCard(card, select.getAttribute("data-filter"), select.value);
        });
        card.style.display = ok ? "" : "none";
        if (ok) {
          shown += 1;
        }
      });
      if (empty) {
        empty.classList.toggle("is-visible", shown === 0);
      }
    }
    if (searchInput) {
      searchInput.addEventListener("input", apply);
    }
    filters.forEach(function (select) {
      select.addEventListener("change", apply);
    });
    apply();
  }

  ready(function () {
    initHero();
    initMenu();
    initSearchForms();
    initMovieFilters();
  });
})();

function initMoviePlayer(streamUrl) {
  var video = document.getElementById("movieVideo");
  var layer = document.querySelector(".player-layer");
  var hls = null;
  var prepared = false;
  if (!video || !streamUrl) {
    return;
  }
  function prepare() {
    if (prepared) {
      return;
    }
    prepared = true;
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = streamUrl;
    } else if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(streamUrl);
      hls.attachMedia(video);
    } else {
      video.src = streamUrl;
    }
  }
  function play() {
    prepare();
    video.controls = true;
    if (layer) {
      layer.classList.add("is-hidden");
    }
    var attempt = video.play();
    if (attempt && typeof attempt.catch === "function") {
      attempt.catch(function () {
        if (layer) {
          layer.classList.remove("is-hidden");
        }
      });
    }
  }
  if (layer) {
    layer.addEventListener("click", play);
  }
  video.addEventListener("click", function () {
    if (video.paused) {
      play();
    }
  });
  video.addEventListener("play", function () {
    if (layer) {
      layer.classList.add("is-hidden");
    }
  });
  window.addEventListener("pagehide", function () {
    if (hls && typeof hls.destroy === "function") {
      hls.destroy();
    }
  });
}
