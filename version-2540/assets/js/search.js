(function () {
    var movies = window.SITE_MOVIES || [];
    var input = document.getElementById('siteSearchInput');
    var typeFilter = document.getElementById('siteTypeFilter');
    var yearFilter = document.getElementById('siteYearFilter');
    var results = document.getElementById('searchResults');
    var status = document.getElementById('searchStatus');

    if (!input || !results || !status) {
        return;
    }

    function getParam(name) {
        var params = new URLSearchParams(window.location.search);
        return params.get(name) || '';
    }

    function createCard(movie) {
        var tags = (movie.tags || []).slice(0, 2).map(function (tag) {
            return '<span>' + escapeHtml(tag) + '</span>';
        }).join('');

        return [
            '<article class="movie-card">',
            '<a class="poster-wrap" href="' + escapeHtml(movie.url) + '" aria-label="观看 ' + escapeHtml(movie.title) + '">',
            '<img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
            '<span class="play-hover">▶</span>',
            '<span class="type-badge">' + escapeHtml(movie.type) + '</span>',
            '<span class="year-badge">' + escapeHtml(movie.year) + '</span>',
            '</a>',
            '<div class="movie-card-body">',
            '<a href="' + escapeHtml(movie.url) + '" class="movie-card-title">' + escapeHtml(movie.title) + '</a>',
            '<div class="meta-line"><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.genre) + '</span></div>',
            '<div class="tag-row">' + tags + '</div>',
            '</div>',
            '</article>'
        ].join('');
    }

    function escapeHtml(value) {
        return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function matchYear(movieYear, selected) {
        if (!selected) {
            return true;
        }
        if (selected.length === 4 && selected.slice(2) === '00') {
            return String(movieYear || '').slice(0, 2) === selected.slice(0, 2);
        }
        return String(movieYear || '') === selected;
    }

    function render() {
        var keyword = input.value.trim().toLowerCase();
        var type = typeFilter ? typeFilter.value : '';
        var year = yearFilter ? yearFilter.value : '';

        if (!keyword && !type && !year) {
            status.textContent = '输入关键词或使用筛选器后，结果会在这里更新。';
            return;
        }

        var filtered = movies.filter(function (movie) {
            var haystack = [
                movie.title,
                movie.region,
                movie.type,
                movie.year,
                movie.genre,
                movie.oneLine,
                (movie.tags || []).join(' ')
            ].join(' ').toLowerCase();
            var matchKeyword = !keyword || haystack.indexOf(keyword) !== -1;
            var matchType = !type || String(movie.type || '').indexOf(type) !== -1;
            var matchYearValue = matchYear(movie.year, year);
            return matchKeyword && matchType && matchYearValue;
        }).slice(0, 120);

        if (!filtered.length) {
            status.textContent = '暂未找到匹配内容，可更换关键词继续搜索。';
            results.innerHTML = '';
            return;
        }

        status.textContent = '已筛选出相关影片，点击卡片进入详情页。';
        results.innerHTML = filtered.map(createCard).join('');
    }

    var initialQuery = getParam('q');
    if (initialQuery) {
        input.value = initialQuery;
        render();
    }

    input.addEventListener('input', render);
    if (typeFilter) {
        typeFilter.addEventListener('change', render);
    }
    if (yearFilter) {
        yearFilter.addEventListener('change', render);
    }
})();
