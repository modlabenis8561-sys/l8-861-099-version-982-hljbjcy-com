(function () {
  var toggle = document.querySelector('[data-menu-toggle]');
  var panel = document.querySelector('[data-mobile-panel]');
  if (toggle && panel) {
    toggle.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  var prev = document.querySelector('[data-hero-prev]');
  var next = document.querySelector('[data-hero-next]');
  var index = 0;

  function showHero(nextIndex) {
    if (!slides.length) {
      return;
    }
    index = (nextIndex + slides.length) % slides.length;
    slides.forEach(function (slide, i) {
      slide.classList.toggle('is-active', i === index);
    });
    dots.forEach(function (dot, i) {
      dot.classList.toggle('is-active', i === index);
    });
  }

  if (slides.length) {
    if (prev) {
      prev.addEventListener('click', function () {
        showHero(index - 1);
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        showHero(index + 1);
      });
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        showHero(i);
      });
    });
    window.setInterval(function () {
      showHero(index + 1);
    }, 5000);
  }

  var list = document.querySelector('[data-filter-list]');
  var listInput = document.querySelector('[data-list-filter]');
  var chips = Array.prototype.slice.call(document.querySelectorAll('[data-filter-chip]'));
  var noResults = document.querySelector('[data-no-results]');
  var activeFilter = 'all';

  function itemText(item) {
    return [
      item.getAttribute('data-title'),
      item.getAttribute('data-region'),
      item.getAttribute('data-year'),
      item.getAttribute('data-genre'),
      item.getAttribute('data-type')
    ].join(' ').toLowerCase();
  }

  function applyListFilter() {
    if (!list) {
      return;
    }
    var query = listInput ? listInput.value.trim().toLowerCase() : '';
    var shown = 0;
    Array.prototype.slice.call(list.querySelectorAll('.movie-card')).forEach(function (item) {
      var text = itemText(item);
      var region = (item.getAttribute('data-region') || '').toLowerCase();
      var passText = !query || text.indexOf(query) !== -1;
      var passChip = activeFilter === 'all' || region === activeFilter.toLowerCase();
      var visible = passText && passChip;
      item.hidden = !visible;
      if (visible) {
        shown += 1;
      }
    });
    if (noResults) {
      noResults.hidden = shown !== 0;
    }
  }

  if (listInput) {
    listInput.addEventListener('input', applyListFilter);
  }
  chips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      activeFilter = chip.getAttribute('data-filter-chip') || 'all';
      chips.forEach(function (item) {
        item.classList.toggle('is-active', item === chip);
      });
      applyListFilter();
    });
  });

  var categoryInput = document.querySelector('[data-category-filter]');
  var categoryList = document.querySelector('[data-category-list]');
  if (categoryInput && categoryList) {
    categoryInput.addEventListener('input', function () {
      var query = categoryInput.value.trim().toLowerCase();
      Array.prototype.slice.call(categoryList.querySelectorAll('.category-card')).forEach(function (card) {
        var text = (card.getAttribute('data-title') || '').toLowerCase();
        card.hidden = query && text.indexOf(query) === -1;
      });
    });
  }
})();
