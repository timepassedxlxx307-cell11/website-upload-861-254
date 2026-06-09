(function () {
    function ready(fn) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", fn, { once: true });
        } else {
            fn();
        }
    }

    function escapeHtml(value) {
        return String(value || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;");
    }

    function card(movie) {
        return "" +
            "<article class=\"movie-card\">" +
            "<a class=\"poster-link\" href=\"./" + escapeHtml(movie.file) + "\" aria-label=\"" + escapeHtml(movie.title) + "\">" +
            "<span class=\"poster-bg\"><img src=\"" + escapeHtml(movie.image) + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\"></span>" +
            "<span class=\"poster-badge\">" + escapeHtml(movie.year || movie.type) + "</span>" +
            "</a>" +
            "<div class=\"card-body\">" +
            "<h3><a href=\"./" + escapeHtml(movie.file) + "\">" + escapeHtml(movie.title) + "</a></h3>" +
            "<p>" + escapeHtml(movie.oneLine) + "</p>" +
            "<div class=\"card-tags\"><span>" + escapeHtml(movie.region) + "</span><span>" + escapeHtml(movie.type) + "</span></div>" +
            "</div>" +
            "</article>";
    }

    function init() {
        var input = document.querySelector("[data-search-input]");
        var results = document.getElementById("search-results");
        var title = document.querySelector("[data-search-title]");
        var movies = window.SEARCH_MOVIES || [];
        if (!input || !results || !movies.length) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var initial = params.get("q") || "";
        input.value = initial;

        function render() {
            var query = input.value.trim().toLowerCase();
            var list = movies;
            if (query) {
                list = movies.filter(function (movie) {
                    var text = [
                        movie.title,
                        movie.region,
                        movie.type,
                        movie.year,
                        movie.genre,
                        (movie.tags || []).join(" "),
                        movie.oneLine
                    ].join(" ").toLowerCase();
                    return text.indexOf(query) !== -1;
                });
            } else {
                list = movies.slice(0, 60);
            }
            if (title) {
                title.textContent = query ? "搜索结果" : "热门搜索";
            }
            results.innerHTML = list.slice(0, 120).map(card).join("");
            results.querySelectorAll("img").forEach(function (img) {
                img.addEventListener("error", function () {
                    img.classList.add("is-missing");
                    img.removeAttribute("src");
                }, { once: true });
            });
        }

        input.addEventListener("input", render);
        render();
    }

    ready(init);
})();
