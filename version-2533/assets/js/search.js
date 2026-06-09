(function () {
    function getQuery() {
        return new URLSearchParams(window.location.search).get('q') || '';
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

    function card(movie) {
        var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
            return '<span class="tag-chip">' + escapeHtml(tag) + '</span>';
        }).join('');
        return '' +
            '<article class="movie-card">' +
                '<a class="movie-poster" href="' + escapeHtml(movie.url) + '">' +
                    '<img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">' +
                    '<span class="poster-badge">' + escapeHtml(movie.year) + '</span>' +
                '</a>' +
                '<div class="movie-card-body">' +
                    '<a class="movie-title" href="' + escapeHtml(movie.url) + '">' + escapeHtml(movie.title) + '</a>' +
                    '<div class="movie-meta">' + escapeHtml(movie.region) + ' · ' + escapeHtml(movie.type) + ' · ' + escapeHtml(movie.genre) + '</div>' +
                    '<p class="movie-desc">' + escapeHtml(movie.oneLine) + '</p>' +
                    '<div class="tag-row">' + tags + '</div>' +
                '</div>' +
            '</article>';
    }

    function runSearch(query) {
        var input = document.querySelector('[data-search-input]');
        var results = document.querySelector('[data-search-results]');
        var meta = document.querySelector('[data-search-meta]');
        var data = window.MOVIE_SEARCH_DATA || [];
        if (!results) {
            return;
        }
        if (input) {
            input.value = query;
        }
        var normalized = query.trim().toLowerCase();
        var matches = data.filter(function (movie) {
            if (!normalized) {
                return true;
            }
            var text = [
                movie.title,
                movie.year,
                movie.region,
                movie.type,
                movie.genre,
                movie.category,
                (movie.tags || []).join(' '),
                movie.oneLine
            ].join(' ').toLowerCase();
            return text.indexOf(normalized) !== -1;
        }).slice(0, 120);
        if (meta) {
            meta.textContent = normalized ? '搜索结果：' + matches.length + ' 项' : '默认展示片库内容';
        }
        results.innerHTML = matches.length ? matches.map(card).join('') : '<div class="empty-state">未找到匹配影片</div>';
    }

    document.addEventListener('DOMContentLoaded', function () {
        var form = document.querySelector('[data-search-form]');
        var input = document.querySelector('[data-search-input]');
        runSearch(getQuery());
        if (form && input) {
            form.addEventListener('submit', function (event) {
                event.preventDefault();
                var query = input.value.trim();
                var url = query ? 'search.html?q=' + encodeURIComponent(query) : 'search.html';
                history.replaceState(null, '', url);
                runSearch(query);
            });
            input.addEventListener('input', function () {
                runSearch(input.value);
            });
        }
    });
})();
