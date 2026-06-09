(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function initMenu() {
    var toggle = document.querySelector('.menu-toggle');
    var panel = document.querySelector('.mobile-panel');
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener('click', function () {
      var isOpen = panel.hasAttribute('hidden') === false;
      if (isOpen) {
        panel.setAttribute('hidden', '');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.textContent = '☰';
      } else {
        panel.removeAttribute('hidden');
        toggle.setAttribute('aria-expanded', 'true');
        toggle.textContent = '×';
      }
    });
  }

  function initCarousel() {
    var carousel = document.querySelector('[data-carousel]');
    if (!carousel) {
      return;
    }
    var slides = Array.prototype.slice.call(carousel.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll('.hero-dot'));
    var prev = carousel.querySelector('.hero-prev');
    var next = carousel.querySelector('.hero-next');
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
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
    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        show(dotIndex);
        start();
      });
    });
    carousel.addEventListener('mouseenter', stop);
    carousel.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function initPlayers() {
    var shells = Array.prototype.slice.call(document.querySelectorAll('.player-shell'));
    shells.forEach(function (shell) {
      var video = shell.querySelector('.player-video');
      var overlay = shell.querySelector('.player-overlay');
      if (!video) {
        return;
      }
      var src = video.getAttribute('data-src');
      var hlsInstance = null;

      function attachSource() {
        if (!src || video.dataset.ready === '1') {
          return;
        }
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = src;
        } else if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hlsInstance.loadSource(src);
          hlsInstance.attachMedia(video);
        } else {
          video.src = src;
        }
        video.dataset.ready = '1';
      }

      function startPlay() {
        attachSource();
        var promise = video.play();
        if (promise && typeof promise.then === 'function') {
          promise.then(function () {
            if (overlay) {
              overlay.classList.add('is-hidden');
            }
          }).catch(function () {
            if (overlay) {
              overlay.classList.remove('is-hidden');
            }
          });
        } else if (overlay) {
          overlay.classList.add('is-hidden');
        }
      }

      if (overlay) {
        overlay.addEventListener('click', startPlay);
      }
      video.addEventListener('play', function () {
        if (overlay) {
          overlay.classList.add('is-hidden');
        }
      });
      video.addEventListener('pause', function () {
        if (video.currentTime === 0 && overlay) {
          overlay.classList.remove('is-hidden');
        }
      });
      video.addEventListener('click', function () {
        if (video.paused) {
          startPlay();
        }
      });
      window.addEventListener('beforeunload', function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    });
  }

  function getQueryValue(name) {
    var params = new URLSearchParams(window.location.search);
    return params.get(name) || '';
  }

  function createOption(value) {
    var option = document.createElement('option');
    option.value = value;
    option.textContent = value;
    return option;
  }

  function uniqueValues(items, key) {
    var seen = {};
    items.forEach(function (item) {
      if (item[key]) {
        seen[item[key]] = true;
      }
    });
    return Object.keys(seen).sort(function (a, b) {
      if (/^\d+$/.test(a) && /^\d+$/.test(b)) {
        return Number(b) - Number(a);
      }
      return a.localeCompare(b, 'zh-CN');
    });
  }

  function renderSearchCard(movie) {
    return [
      '<article class="movie-card">',
      '  <a class="poster-link" href="' + movie.url + '" aria-label="观看' + escapeHtml(movie.title) + '">',
      '    <img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy" decoding="async">',
      '    <span class="region-badge">' + escapeHtml(movie.region) + '</span>',
      '    <span class="year-badge">' + escapeHtml(movie.year) + '</span>',
      '    <span class="play-hover">▶</span>',
      '  </a>',
      '  <div class="card-body">',
      '    <h3><a href="' + movie.url + '">' + escapeHtml(movie.title) + '</a></h3>',
      '    <p>' + escapeHtml(movie.oneLine) + '</p>',
      '    <div class="meta-line"><span>' + escapeHtml(movie.type) + '</span><span>' + escapeHtml(movie.genre) + '</span></div>',
      '  </div>',
      '</article>'
    ].join('');
  }

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"]/g, function (char) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;'
      }[char];
    });
  }

  function initSearchPage() {
    var data = window.MOVIE_SEARCH_INDEX;
    var form = document.getElementById('site-search-form');
    var input = document.getElementById('site-search-input');
    var results = document.getElementById('search-results');
    var status = document.getElementById('search-status');
    var region = document.getElementById('filter-region');
    var year = document.getElementById('filter-year');
    var type = document.getElementById('filter-type');
    if (!data || !form || !input || !results || !status) {
      return;
    }

    uniqueValues(data, 'region').forEach(function (value) {
      region.appendChild(createOption(value));
    });
    uniqueValues(data, 'year').forEach(function (value) {
      year.appendChild(createOption(value));
    });
    uniqueValues(data, 'type').forEach(function (value) {
      type.appendChild(createOption(value));
    });

    input.value = getQueryValue('q');

    function matches(movie, words) {
      var haystack = [
        movie.title,
        movie.region,
        movie.type,
        movie.year,
        movie.genre,
        movie.tags,
        movie.oneLine
      ].join(' ').toLowerCase();
      return words.every(function (word) {
        return haystack.indexOf(word) !== -1;
      });
    }

    function render() {
      var query = input.value.trim().toLowerCase();
      var words = query ? query.split(/\s+/) : [];
      var filtered = data.filter(function (movie) {
        if (region.value && movie.region !== region.value) {
          return false;
        }
        if (year.value && movie.year !== year.value) {
          return false;
        }
        if (type.value && movie.type !== type.value) {
          return false;
        }
        return words.length ? matches(movie, words) : true;
      });
      var visible = filtered.slice(0, 160);
      results.innerHTML = visible.map(renderSearchCard).join('');
      if (filtered.length) {
        status.textContent = '已为你匹配相关影片，继续输入可缩小范围';
      } else {
        status.textContent = '没有找到匹配影片，可以更换关键词或筛选条件';
      }
    }

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      render();
      var query = input.value.trim();
      var url = query ? './search.html?q=' + encodeURIComponent(query) : './search.html';
      window.history.replaceState({}, '', url);
    });
    [input, region, year, type].forEach(function (element) {
      element.addEventListener('input', render);
      element.addEventListener('change', render);
    });
    render();
  }

  ready(function () {
    initMenu();
    initCarousel();
    initPlayers();
    initSearchPage();
  });
})();
