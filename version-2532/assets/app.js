(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function setupMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var nav = document.querySelector("[data-mobile-nav]");
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener("click", function () {
      nav.classList.toggle("is-open");
    });
  }

  function setupHero() {
    var slider = document.querySelector("[data-hero-slider]");
    if (!slider) {
      return;
    }
    var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
    var prev = slider.querySelector("[data-hero-prev]");
    var next = slider.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        restart();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        restart();
      });
    }

    show(0);
    restart();
  }

  function setupFilters() {
    var inputs = Array.prototype.slice.call(document.querySelectorAll("[data-filter-input]"));
    inputs.forEach(function (input) {
      var section = input.closest(".filter-section") || document;
      var cards = Array.prototype.slice.call(section.querySelectorAll("[data-filter-card]"));
      var buttons = Array.prototype.slice.call(section.querySelectorAll("[data-filter-token]"));
      var token = "";

      function apply() {
        var query = input.value.trim().toLowerCase();
        cards.forEach(function (card) {
          var haystack = (card.getAttribute("data-search") || "").toLowerCase();
          var category = (card.getAttribute("data-category") || "").toLowerCase();
          var type = (card.getAttribute("data-type") || "").toLowerCase();
          var matchesQuery = !query || haystack.indexOf(query) !== -1;
          var matchesToken = !token || haystack.indexOf(token) !== -1 || category.indexOf(token) !== -1 || type.indexOf(token) !== -1;
          card.hidden = !(matchesQuery && matchesToken);
        });
      }

      input.addEventListener("input", apply);
      buttons.forEach(function (button) {
        button.addEventListener("click", function () {
          token = (button.getAttribute("data-filter-token") || "").toLowerCase();
          buttons.forEach(function (other) {
            other.classList.toggle("is-active", other === button);
          });
          apply();
        });
      });
      apply();
    });
  }

  function movieCard(movie) {
    var tags = [movie.category, movie.type].concat(movie.tags || []).filter(Boolean).slice(0, 3).map(function (tag) {
      return "<span>" + escapeHtml(tag) + "</span>";
    }).join("");
    return "<article class=\"movie-card\">" +
      "<a class=\"poster-link\" href=\"" + escapeAttribute(movie.href) + "\" aria-label=\"" + escapeAttribute(movie.title) + "\">" +
      "<img src=\"" + escapeAttribute(movie.cover) + "\" alt=\"" + escapeAttribute(movie.title) + "\" loading=\"lazy\" onerror=\"this.parentElement.classList.add('is-empty'); this.remove();\">" +
      "<span class=\"poster-badge\">" + escapeHtml(movie.year) + "</span>" +
      "</a>" +
      "<div class=\"card-body\">" +
      "<div class=\"tag-row\">" + tags + "</div>" +
      "<h3><a href=\"" + escapeAttribute(movie.href) + "\">" + escapeHtml(movie.title) + "</a></h3>" +
      "<p>" + escapeHtml(movie.oneLine || "") + "</p>" +
      "<div class=\"card-meta\"><span>" + escapeHtml(movie.region) + "</span><span>" + escapeHtml(movie.genre) + "</span></div>" +
      "</div>" +
      "</article>";
  }

  function setupSearchPage() {
    var form = document.getElementById("searchPageForm");
    var input = document.getElementById("searchPageInput");
    var results = document.getElementById("searchResults");
    var status = document.getElementById("searchStatus");
    if (!form || !input || !results || typeof MOVIES === "undefined") {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get("q") || "";
    input.value = initialQuery;

    function render(query) {
      var q = query.trim().toLowerCase();
      var matches = q ? MOVIES.filter(function (movie) {
        return movie.search.indexOf(q) !== -1;
      }) : MOVIES.slice(0, 80);
      results.innerHTML = matches.slice(0, 160).map(movieCard).join("");
      status.textContent = q ? "匹配结果" : "热门推荐";
      if (!matches.length) {
        results.innerHTML = "<div class=\"article-block\"><h2>暂无匹配影片</h2><p>可以尝试输入其他片名、年份、地区或题材关键词。</p></div>";
      }
    }

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var query = input.value.trim();
      var nextUrl = query ? "search.html?q=" + encodeURIComponent(query) : "search.html";
      window.history.replaceState(null, "", nextUrl);
      render(query);
    });

    input.addEventListener("input", function () {
      render(input.value);
    });

    render(initialQuery);
  }

  function escapeHtml(value) {
    return String(value || "").replace(/[&<>"]/g, function (character) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "\"": "&quot;"
      }[character];
    });
  }

  function escapeAttribute(value) {
    return escapeHtml(value).replace(/'/g, "&#39;");
  }

  ready(function () {
    setupMenu();
    setupHero();
    setupFilters();
    setupSearchPage();
  });
}());
