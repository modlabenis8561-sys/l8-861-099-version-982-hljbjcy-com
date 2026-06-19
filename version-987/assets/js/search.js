(function () {
  var params = new URLSearchParams(window.location.search);
  var query = (params.get('q') || '').trim();
  var input = document.getElementById('searchInput');
  var status = document.getElementById('searchStatus');
  var results = document.getElementById('searchResults');

  function clean(value) {
    return String(value || '').replace(/[&<>"]/g, function (char) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;'
      }[char];
    });
  }

  function card(movie) {
    var tags = (movie.tags || []).slice(0, 2).map(function (tag) {
      return '<span>' + clean(tag) + '</span>';
    }).join('');
    return [
      '<article class="movie-card">',
      '<a href="' + clean(movie.href) + '" class="card-media">',
      '<img src="' + clean(movie.cover) + '" alt="' + clean(movie.title) + '" loading="lazy">',
      '<span class="card-year">' + clean(movie.year) + '</span>',
      '</a>',
      '<div class="card-body">',
      '<h3><a href="' + clean(movie.href) + '">' + clean(movie.title) + '</a></h3>',
      '<p>' + clean(movie.oneLine) + '</p>',
      '<div class="card-meta"><span>' + clean(movie.category) + '</span><span>' + clean(movie.region) + '</span></div>',
      '<div class="card-tags">' + tags + '</div>',
      '</div>',
      '</article>'
    ].join('');
  }

  function searchable(movie) {
    return [
      movie.title,
      movie.region,
      movie.type,
      movie.year,
      movie.genre,
      movie.category,
      movie.oneLine,
      (movie.tags || []).join(' ')
    ].join(' ').toLowerCase();
  }

  if (input) {
    input.value = query;
  }
  if (!results || !status || typeof SITE_MOVIES === "undefined") {
    return;
  }

  var source = SITE_MOVIES;
  var shown;
  if (!query) {
    shown = source.slice(0, 24);
    status.textContent = '热门影片推荐';
  } else {
    var parts = query.toLowerCase().split(/\s+/).filter(Boolean);
    shown = source.filter(function (movie) {
      var text = searchable(movie);
      return parts.every(function (part) {
        return text.indexOf(part) !== -1;
      });
    });
    status.textContent = shown.length ? '搜索结果' : '没有找到相关影片';
  }

  results.innerHTML = shown.map(card).join('');
})();
