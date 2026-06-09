(function() {
  var toggle = document.querySelector(".mobile-toggle");
  var panel = document.querySelector(".mobile-panel");
  if (toggle && panel) {
    toggle.addEventListener("click", function() {
      var isOpen = panel.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(isOpen));
      toggle.textContent = isOpen ? "×" : "☰";
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
  var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
  if (slides.length) {
    var current = 0;
    var timer = null;
    var showSlide = function(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function(slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === current);
      });
      dots.forEach(function(dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === current);
      });
    };
    var startTimer = function() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function() {
        showSlide(current + 1);
      }, 5600);
    };
    dots.forEach(function(dot) {
      dot.addEventListener("click", function() {
        showSlide(Number(dot.getAttribute("data-slide") || 0));
        startTimer();
      });
    });
    startTimer();
  }

  var searchInput = document.getElementById("site-search");
  var genreFilter = document.getElementById("genre-filter");
  var typeFilter = document.getElementById("type-filter");
  var yearFilter = document.getElementById("year-filter");
  var sortFilter = document.getElementById("sort-filter");
  var grid = document.querySelector(".filter-grid");

  if (grid) {
    var cards = Array.prototype.slice.call(grid.querySelectorAll(".movie-card"));
    var textOf = function(card) {
      return [
        card.getAttribute("data-title"),
        card.getAttribute("data-genre"),
        card.getAttribute("data-region"),
        card.getAttribute("data-type"),
        card.getAttribute("data-year"),
        card.textContent
      ].join(" ").toLowerCase();
    };
    var applyFilter = function() {
      var keyword = searchInput ? searchInput.value.trim().toLowerCase() : "";
      var genre = genreFilter ? genreFilter.value : "";
      var type = typeFilter ? typeFilter.value : "";
      var year = yearFilter ? yearFilter.value : "";
      cards.forEach(function(card) {
        var matched = true;
        if (keyword && textOf(card).indexOf(keyword) === -1) {
          matched = false;
        }
        if (genre && (card.getAttribute("data-genre") || "").indexOf(genre) === -1) {
          matched = false;
        }
        if (type && card.getAttribute("data-type") !== type) {
          matched = false;
        }
        if (year && card.getAttribute("data-year") !== year) {
          matched = false;
        }
        card.classList.toggle("hidden-by-filter", !matched);
      });
    };
    var applySort = function() {
      var mode = sortFilter ? sortFilter.value : "default";
      var sorted = cards.slice();
      if (mode === "views") {
        sorted.sort(function(a, b) {
          return Number(b.getAttribute("data-views") || 0) - Number(a.getAttribute("data-views") || 0);
        });
      } else if (mode === "year") {
        sorted.sort(function(a, b) {
          return Number(b.getAttribute("data-year") || 0) - Number(a.getAttribute("data-year") || 0);
        });
      } else if (mode === "score") {
        sorted.sort(function(a, b) {
          return Number(b.getAttribute("data-score") || 0) - Number(a.getAttribute("data-score") || 0);
        });
      } else {
        sorted = cards.slice();
      }
      sorted.forEach(function(card) {
        grid.appendChild(card);
      });
      applyFilter();
    };
    [searchInput, genreFilter, typeFilter, yearFilter].forEach(function(control) {
      if (control) {
        control.addEventListener("input", applyFilter);
        control.addEventListener("change", applyFilter);
      }
    });
    if (sortFilter) {
      sortFilter.addEventListener("change", applySort);
    }
  }

  var backTop = document.createElement("button");
  backTop.className = "back-top";
  backTop.type = "button";
  backTop.setAttribute("aria-label", "返回顶部");
  backTop.textContent = "↑";
  document.body.appendChild(backTop);
  backTop.addEventListener("click", function() {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
  window.addEventListener("scroll", function() {
    backTop.classList.toggle("show", window.scrollY > 360);
  });
})();
