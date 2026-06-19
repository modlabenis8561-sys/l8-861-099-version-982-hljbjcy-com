(function () {
  var navToggle = document.querySelector('[data-nav-toggle]');
  var navMenu = document.querySelector('[data-nav-menu]');

  if (navToggle && navMenu) {
    navToggle.addEventListener('click', function () {
      navMenu.classList.toggle('is-open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  var prev = document.querySelector('[data-hero-prev]');
  var next = document.querySelector('[data-hero-next]');
  var current = 0;
  var timer = null;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    current = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('is-active', slideIndex === current);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('is-active', dotIndex === current);
    });
  }

  function restartHero() {
    if (timer) {
      clearInterval(timer);
    }

    if (slides.length > 1) {
      timer = setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }
  }

  if (slides.length) {
    showSlide(0);
    restartHero();

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        showSlide(dotIndex);
        restartHero();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(current - 1);
        restartHero();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(current + 1);
        restartHero();
      });
    }
  }

  var filterRoot = document.querySelector('[data-filter-root]');

  if (filterRoot) {
    var cards = Array.prototype.slice.call(filterRoot.querySelectorAll('[data-movie-card]'));
    var keyword = filterRoot.querySelector('[data-filter-keyword]');
    var genre = filterRoot.querySelector('[data-filter-genre]');
    var region = filterRoot.querySelector('[data-filter-region]');
    var year = filterRoot.querySelector('[data-filter-year]');

    function valueOf(input) {
      return input ? input.value.trim().toLowerCase() : '';
    }

    function applyFilter() {
      var query = valueOf(keyword);
      var genreValue = valueOf(genre);
      var regionValue = valueOf(region);
      var yearValue = valueOf(year);

      cards.forEach(function (card) {
        var text = (card.getAttribute('data-search') || '').toLowerCase();
        var cardGenre = (card.getAttribute('data-genre') || '').toLowerCase();
        var cardRegion = (card.getAttribute('data-region') || '').toLowerCase();
        var cardYear = (card.getAttribute('data-year') || '').toLowerCase();
        var matched = true;

        if (query && text.indexOf(query) === -1) {
          matched = false;
        }

        if (genreValue && cardGenre.indexOf(genreValue) === -1) {
          matched = false;
        }

        if (regionValue && cardRegion !== regionValue) {
          matched = false;
        }

        if (yearValue && cardYear !== yearValue) {
          matched = false;
        }

        card.classList.toggle('hidden-card', !matched);
      });
    }

    [keyword, genre, region, year].forEach(function (input) {
      if (input) {
        input.addEventListener('input', applyFilter);
        input.addEventListener('change', applyFilter);
      }
    });
  }
})();
