(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  var activeSlide = 0;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    activeSlide = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('is-active', slideIndex === activeSlide);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('is-active', dotIndex === activeSlide);
    });
  }

  dots.forEach(function (dot) {
    dot.addEventListener('click', function () {
      var index = parseInt(dot.getAttribute('data-hero-dot'), 10);
      showSlide(index);
    });
  });

  if (slides.length > 1) {
    window.setInterval(function () {
      showSlide(activeSlide + 1);
    }, 5200);
  }

  var searchInputs = Array.prototype.slice.call(document.querySelectorAll('[data-search-input]'));

  searchInputs.forEach(function (input) {
    input.addEventListener('input', function () {
      var query = input.value.trim().toLowerCase();
      var cards = Array.prototype.slice.call(document.querySelectorAll('[data-title]'));

      cards.forEach(function (card) {
        var text = [
          card.getAttribute('data-title'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-year'),
          card.getAttribute('data-region'),
          card.textContent
        ].join(' ').toLowerCase();

        card.classList.toggle('is-filtered-out', query && text.indexOf(query) === -1);
      });
    });
  });

  function activateVideo(video, button) {
    if (!video) {
      return;
    }

    var src = video.getAttribute('data-m3u8');

    if (src && window.Hls && window.Hls.isSupported()) {
      if (!video.hlsInstance) {
        var hls = new window.Hls({
          maxBufferLength: 30,
          backBufferLength: 30
        });

        hls.loadSource(src);
        hls.attachMedia(video);
        video.hlsInstance = hls;
      }
    } else if (src && video.canPlayType('application/vnd.apple.mpegurl')) {
      if (!video.getAttribute('src')) {
        video.setAttribute('src', src);
      }
    } else if (src && !video.getAttribute('src')) {
      video.setAttribute('src', src);
    }

    if (button) {
      button.classList.add('is-hidden');
    }

    var promise = video.play();

    if (promise && typeof promise.catch === 'function') {
      promise.catch(function () {
        if (button) {
          button.classList.remove('is-hidden');
        }
      });
    }
  }

  Array.prototype.slice.call(document.querySelectorAll('.video-shell')).forEach(function (shell) {
    var video = shell.querySelector('video');
    var button = shell.querySelector('[data-play-button]');

    if (button) {
      button.addEventListener('click', function () {
        activateVideo(video, button);
      });
    }

    if (video) {
      video.addEventListener('click', function () {
        if (video.paused) {
          activateVideo(video, button);
        }
      });

      video.addEventListener('play', function () {
        if (button) {
          button.classList.add('is-hidden');
        }
      });
    }
  });
})();
