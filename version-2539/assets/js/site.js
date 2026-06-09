// Generated static movie site interactions.
(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function movieCardHtml(movie) {
    var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');

    return [
      '<article class="movie-card">',
      '  <a href="' + escapeHtml(movie.url) + '" class="poster-frame" aria-label="观看 ' + escapeHtml(movie.title) + '">',
      '    <img src="' + escapeHtml(movie.poster) + '" alt="' + escapeHtml(movie.title) + ' 海报" loading="lazy" onerror="this.classList.add(&quot;image-hidden&quot;);">',
      '    <span class="poster-type">' + escapeHtml(movie.type) + '</span>',
      '    <span class="poster-year">' + escapeHtml(movie.year) + '</span>',
      '  </a>',
      '  <div class="movie-card-body">',
      '    <h3><a href="' + escapeHtml(movie.url) + '">' + escapeHtml(movie.title) + '</a></h3>',
      '    <p>' + escapeHtml(movie.oneLine || '') + '</p>',
      '    <div class="movie-meta"><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.genre) + '</span></div>',
      '    <div class="tag-row">' + tags + '</div>',
      '  </div>',
      '</article>'
    ].join('\\n');
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function setupHeader() {
    var header = document.querySelector('[data-header]');
    var toggle = document.querySelector('[data-menu-toggle]');
    var panel = document.querySelector('[data-mobile-panel]');

    function updateHeader() {
      if (!header) {
        return;
      }
      header.classList.toggle('is-scrolled', window.scrollY > 18);
    }

    updateHeader();
    window.addEventListener('scroll', updateHeader, { passive: true });

    if (toggle && panel) {
      toggle.addEventListener('click', function () {
        panel.classList.toggle('is-open');
      });
    }
  }

  function setupHero() {
    var root = document.querySelector('[data-hero]');
    if (!root) {
      return;
    }

    var slides = Array.prototype.slice.call(root.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(root.querySelectorAll('[data-hero-dot]'));
    var prev = root.querySelector('[data-hero-prev]');
    var next = root.querySelector('[data-hero-next]');
    var active = 0;
    var timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, idx) {
        slide.classList.toggle('is-active', idx === active);
      });
      dots.forEach(function (dot, idx) {
        dot.classList.toggle('is-active', idx === active);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(active + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(active - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(active + 1);
        start();
      });
    }

    dots.forEach(function (dot, idx) {
      dot.addEventListener('click', function () {
        show(idx);
        start();
      });
    });

    root.addEventListener('mouseenter', stop);
    root.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function setupLibraryFilter() {
    var wrapper = document.querySelector('[data-library-filter]');
    var grid = document.querySelector('[data-library-grid]');
    if (!wrapper || !grid) {
      return;
    }

    var input = wrapper.querySelector('[data-library-input]');
    var typeSelect = wrapper.querySelector('[data-filter-type]');
    var count = wrapper.querySelector('[data-visible-count]');
    var cards = Array.prototype.slice.call(grid.querySelectorAll('.movie-card'));

    function applyFilter() {
      var keyword = normalize(input && input.value);
      var type = normalize(typeSelect && typeSelect.value);
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-type'),
          card.getAttribute('data-year'),
          card.getAttribute('data-genre')
        ].join(' '));
        var matchesKeyword = !keyword || haystack.indexOf(keyword) !== -1;
        var matchesType = !type || normalize(card.getAttribute('data-type')) === type;
        var show = matchesKeyword && matchesType;
        card.style.display = show ? '' : 'none';
        if (show) {
          visible += 1;
        }
      });

      if (count) {
        count.textContent = visible;
      }
    }

    if (input) {
      input.addEventListener('input', applyFilter);
    }
    if (typeSelect) {
      typeSelect.addEventListener('change', applyFilter);
    }
    applyFilter();
  }

  function setupSearchPage() {
    var form = document.querySelector('[data-search-form]');
    var results = document.querySelector('[data-search-results]');
    if (!form || !results || !window.MOVIES) {
      return;
    }

    var input = form.querySelector('[data-search-input]');
    var typeSelect = form.querySelector('[data-search-type]');
    var regionSelect = form.querySelector('[data-search-region]');
    var yearSelect = form.querySelector('[data-search-year]');
    var count = document.querySelector('[data-search-count]');
    var keywordLabel = document.querySelector('[data-search-keyword]');
    var params = new URLSearchParams(window.location.search);

    if (params.get('q') && input) {
      input.value = params.get('q');
    }

    function render() {
      var keyword = normalize(input && input.value);
      var type = normalize(typeSelect && typeSelect.value);
      var region = normalize(regionSelect && regionSelect.value);
      var year = normalize(yearSelect && yearSelect.value);
      var matches = window.MOVIES.filter(function (movie) {
        var haystack = normalize([
          movie.title,
          movie.region,
          movie.type,
          movie.year,
          movie.genre,
          movie.oneLine,
          movie.summary,
          (movie.tags || []).join(' ')
        ].join(' '));
        return (!keyword || haystack.indexOf(keyword) !== -1)
          && (!type || normalize(movie.type) === type)
          && (!region || normalize(movie.region) === region)
          && (!year || normalize(movie.year) === year);
      });

      if (count) {
        count.textContent = matches.length;
      }
      if (keywordLabel) {
        keywordLabel.textContent = keyword ? '关键词：' + keyword : '';
      }
      var oldNote = document.querySelector('[data-search-note]');
      if (oldNote) {
        oldNote.remove();
      }
      results.innerHTML = matches.slice(0, 120).map(movieCardHtml).join('\\n');
      if (matches.length > 120) {
        results.insertAdjacentHTML('afterend', '<p class="search-note" data-search-note>当前展示前 120 条结果，可继续增加关键词缩小范围。</p>');
      }
    }

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      render();
    });
    [input, typeSelect, regionSelect, yearSelect].forEach(function (field) {
      if (field) {
        field.addEventListener(field.tagName === 'INPUT' ? 'input' : 'change', render);
      }
    });
    render();
  }

  ready(function () {
    setupHeader();
    setupHero();
    setupLibraryFilter();
    setupSearchPage();
  });
})();
