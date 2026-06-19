(function () {
  var menuButton = document.querySelector('[data-menu-button]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  var currentSlide = 0;
  var heroTimer = null;

  function setSlide(index) {
    if (!slides.length) {
      return;
    }

    currentSlide = (index + slides.length) % slides.length;
    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('active', slideIndex === currentSlide);
    });
    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('active', dotIndex === currentSlide);
    });
  }

  function nextSlide() {
    setSlide(currentSlide + 1);
  }

  if (slides.length) {
    setSlide(0);
    heroTimer = window.setInterval(nextSlide, 5200);
    document.querySelectorAll('[data-hero-next]').forEach(function (button) {
      button.addEventListener('click', function () {
        nextSlide();
      });
    });
    document.querySelectorAll('[data-hero-prev]').forEach(function (button) {
      button.addEventListener('click', function () {
        setSlide(currentSlide - 1);
      });
    });
    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        setSlide(dotIndex);
      });
    });
    var hero = document.querySelector('[data-hero]');
    if (hero && heroTimer) {
      hero.addEventListener('mouseenter', function () {
        window.clearInterval(heroTimer);
      });
      hero.addEventListener('mouseleave', function () {
        heroTimer = window.setInterval(nextSlide, 5200);
      });
    }
  }

  var filterPanel = document.querySelector('[data-filter-panel]');
  if (filterPanel) {
    var searchInput = filterPanel.querySelector('[data-search-input]');
    var typeFilter = filterPanel.querySelector('[data-type-filter]');
    var categoryFilter = filterPanel.querySelector('[data-category-filter]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));
    var empty = document.querySelector('[data-empty-state]');

    function normalize(value) {
      return String(value || '').trim().toLowerCase();
    }

    function applyFilters() {
      var query = normalize(searchInput ? searchInput.value : '');
      var typeValue = typeFilter ? typeFilter.value : 'all';
      var categoryValue = categoryFilter ? categoryFilter.value : 'all';
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = normalize(card.getAttribute('data-search'));
        var cardType = card.getAttribute('data-type') || '';
        var cardCategory = card.getAttribute('data-category') || '';
        var okQuery = !query || haystack.indexOf(query) !== -1;
        var okType = typeValue === 'all' || cardType === typeValue;
        var okCategory = categoryValue === 'all' || cardCategory === categoryValue;
        var show = okQuery && okType && okCategory;
        card.classList.toggle('hidden-card', !show);
        if (show) {
          visible += 1;
        }
      });

      if (empty) {
        empty.style.display = visible ? 'none' : 'block';
      }
    }

    [searchInput, typeFilter, categoryFilter].forEach(function (control) {
      if (control) {
        control.addEventListener('input', applyFilters);
        control.addEventListener('change', applyFilters);
      }
    });
  }

  document.querySelectorAll('[data-player]').forEach(function (player) {
    var video = player.querySelector('video');
    var button = player.querySelector('[data-play-button]');
    var source = video ? video.getAttribute('data-source') : '';
    var hlsInstance = null;

    function startPlayback() {
      if (!video || !source) {
        return;
      }

      if (!video.getAttribute('src')) {
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
        } else if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hlsInstance.loadSource(source);
          hlsInstance.attachMedia(video);
        } else {
          video.src = source;
        }
      }

      if (button) {
        button.classList.add('hidden');
      }

      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {
          if (button) {
            button.classList.remove('hidden');
          }
        });
      }
    }

    if (button) {
      button.addEventListener('click', startPlayback);
    }
    if (video) {
      video.addEventListener('click', function () {
        if (video.paused) {
          startPlayback();
        }
      });
      video.addEventListener('play', function () {
        if (button) {
          button.classList.add('hidden');
        }
      });
    }
    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  });
}());
