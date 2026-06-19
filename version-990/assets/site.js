(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function normalize(value) {
    return (value || '').toString().trim().toLowerCase();
  }

  function setupImages() {
    qsa('img').forEach(function (img) {
      img.addEventListener('error', function () {
        img.classList.add('is-hidden');
      }, { once: true });
    });
  }

  function setupMobileMenu() {
    var toggle = qs('[data-mobile-toggle]');
    var panel = qs('[data-mobile-panel]');
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener('click', function () {
      panel.classList.toggle('open');
    });
  }

  function setupHero() {
    var root = qs('[data-hero-carousel]');
    if (!root) {
      return;
    }
    var slides = qsa('[data-hero-slide]', root);
    var dots = qsa('[data-hero-dot]', root);
    var prev = qs('[data-hero-prev]', root);
    var next = qs('[data-hero-next]', root);
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5600);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        start();
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        start();
      });
    }
    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(parseInt(dot.getAttribute('data-hero-dot'), 10) || 0);
        start();
      });
    });
    root.addEventListener('mouseenter', stop);
    root.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function setupFilters() {
    qsa('[data-filter-scope]').forEach(function (scope) {
      var search = qs('[data-filter-search]', scope);
      var region = qs('[data-filter-region]', scope);
      var type = qs('[data-filter-type]', scope);
      var year = qs('[data-filter-year]', scope);
      var category = qs('[data-filter-category]', scope);
      var cardsRoot = scope.parentElement || document;
      var cards = qsa('[data-movie-card]', cardsRoot);
      var empty = qs('[data-empty-note]', scope);

      function valueOf(element) {
        return element ? normalize(element.value) : '';
      }

      function apply() {
        var keyword = valueOf(search);
        var selectedRegion = valueOf(region);
        var selectedType = valueOf(type);
        var selectedYear = valueOf(year);
        var selectedCategory = valueOf(category);
        var visible = 0;

        cards.forEach(function (card) {
          var haystack = normalize(card.getAttribute('data-text'));
          var ok = true;
          if (keyword && haystack.indexOf(keyword) === -1) {
            ok = false;
          }
          if (selectedRegion && normalize(card.getAttribute('data-region')) !== selectedRegion) {
            ok = false;
          }
          if (selectedType && normalize(card.getAttribute('data-type')) !== selectedType) {
            ok = false;
          }
          if (selectedYear && normalize(card.getAttribute('data-year')) !== selectedYear) {
            ok = false;
          }
          if (selectedCategory && normalize(card.getAttribute('data-category')) !== selectedCategory) {
            ok = false;
          }
          card.style.display = ok ? '' : 'none';
          if (ok) {
            visible += 1;
          }
        });

        if (empty) {
          empty.classList.toggle('show', visible === 0);
        }
      }

      [search, region, type, year, category].forEach(function (element) {
        if (!element) {
          return;
        }
        element.addEventListener('input', apply);
        element.addEventListener('change', apply);
      });
    });
  }

  function setupPlayers() {
    qsa('[data-player]').forEach(function (root) {
      var video = qs('video', root);
      var button = qs('[data-player-toggle]', root);
      var status = qs('[data-player-status]', root);
      var source = root.getAttribute('data-source');
      var attached = false;
      var hls = null;

      if (!video || !button || !source) {
        return;
      }

      function setStatus(text) {
        if (status) {
          status.textContent = text || '';
        }
      }

      function attach() {
        if (attached) {
          return;
        }
        attached = true;
        if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({ enableWorker: true });
          hls.loadSource(source);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.ERROR, function (event, data) {
            if (data && data.fatal) {
              setStatus('播放失败，请稍后重试');
              if (hls) {
                hls.destroy();
              }
            }
          });
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
        } else {
          video.src = source;
        }
      }

      function play() {
        attach();
        var request = video.play();
        if (request && typeof request.then === 'function') {
          request.then(function () {
            button.classList.add('hidden');
            setStatus('');
          }).catch(function () {
            setStatus('点击视频控件开始播放');
          });
        } else {
          button.classList.add('hidden');
        }
      }

      button.addEventListener('click', play);
      video.addEventListener('play', function () {
        button.classList.add('hidden');
      });
      video.addEventListener('pause', function () {
        if (!video.ended) {
          button.classList.remove('hidden');
        }
      });
      video.addEventListener('ended', function () {
        button.classList.remove('hidden');
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupImages();
    setupMobileMenu();
    setupHero();
    setupFilters();
    setupPlayers();
  });
})();
