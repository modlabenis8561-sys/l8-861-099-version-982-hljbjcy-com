(function() {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function setupMobileMenu() {
    var toggle = document.querySelector(".mobile-toggle");
    var panel = document.querySelector(".mobile-panel");
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener("click", function() {
      var open = panel.hasAttribute("hidden");
      if (open) {
        panel.removeAttribute("hidden");
      } else {
        panel.setAttribute("hidden", "");
      }
      toggle.setAttribute("aria-expanded", String(open));
    });
  }

  function setupHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
    if (!slides.length) {
      return;
    }
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function(slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });
      dots.forEach(function(dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function() {
        show(current + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function(dot) {
      dot.addEventListener("click", function() {
        show(Number(dot.getAttribute("data-slide")) || 0);
        start();
      });
    });

    var prev = document.querySelector("[data-hero-prev]");
    var next = document.querySelector("[data-hero-next]");
    if (prev) {
      prev.addEventListener("click", function() {
        show(current - 1);
        start();
      });
    }
    if (next) {
      next.addEventListener("click", function() {
        show(current + 1);
        start();
      });
    }
    start();
  }

  function setupLocalFilter() {
    var input = document.getElementById("local-search");
    if (!input) {
      return;
    }
    var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card"));
    input.addEventListener("input", function() {
      var keyword = input.value.trim().toLowerCase();
      cards.forEach(function(card) {
        var text = [
          card.getAttribute("data-title"),
          card.getAttribute("data-region"),
          card.getAttribute("data-genre"),
          card.textContent
        ].join(" ").toLowerCase();
        card.classList.toggle("is-hidden", keyword && text.indexOf(keyword) === -1);
      });
    });
  }

  function escapeHTML(value) {
    return String(value || "").replace(/[&<>\"']/g, function(character) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "\"": "&quot;",
        "'": "&#39;"
      }[character];
    });
  }

  function renderSearchResults() {
    var results = document.getElementById("search-results");
    var title = document.getElementById("search-result-title");
    var input = document.getElementById("search-page-input");
    if (!results || !title || !input || !window.SEARCH_INDEX) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var q = params.get("q") || "";
    input.value = q;
    var keyword = q.trim().toLowerCase();
    var items = window.SEARCH_INDEX.filter(function(item) {
      if (!keyword) {
        return item.rank <= 60;
      }
      return [item.title, item.region, item.type, item.year, item.genre, item.tags, item.summary]
        .join(" ")
        .toLowerCase()
        .indexOf(keyword) !== -1;
    }).slice(0, keyword ? 120 : 60);

    title.textContent = keyword ? "搜索结果" : "热门推荐";
    results.innerHTML = items.map(function(item) {
      var tags = String(item.tags || "")
        .split(/[,，、/\s]+/)
        .filter(Boolean)
        .slice(0, 3)
        .map(function(tag) {
          return "<span>" + escapeHTML(tag) + "</span>";
        })
        .join("");
      return [
        "<article class=\"movie-card\" data-title=\"" + escapeHTML(item.title) + "\" data-region=\"" + escapeHTML(item.region) + "\" data-genre=\"" + escapeHTML(item.genre) + "\">",
        "<a class=\"poster-link\" href=\"" + escapeHTML(item.file) + "\" aria-label=\"" + escapeHTML(item.title) + "\">",
        "<img src=\"" + escapeHTML(item.image) + "\" alt=\"" + escapeHTML(item.title) + "\" loading=\"lazy\">",
        "<span class=\"card-badge\">" + escapeHTML(item.year) + " · " + escapeHTML(item.type) + "</span>",
        "</a>",
        "<div class=\"movie-card-body\">",
        "<a class=\"movie-title\" href=\"" + escapeHTML(item.file) + "\">" + escapeHTML(item.title) + "</a>",
        "<p class=\"movie-meta\">" + escapeHTML(item.region) + " · " + escapeHTML(item.genre) + "</p>",
        "<p class=\"movie-desc\">" + escapeHTML(item.summary) + "</p>",
        "<div class=\"tag-row\">" + tags + "</div>",
        "</div>",
        "</article>"
      ].join("");
    }).join("");
  }

  ready(function() {
    setupMobileMenu();
    setupHero();
    setupLocalFilter();
    renderSearchResults();
  });
})();
