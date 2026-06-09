(function () {
    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    ready(function () {
        var toggle = document.querySelector('[data-menu-toggle]');
        var panel = document.querySelector('[data-mobile-panel]');
        if (toggle && panel) {
            toggle.addEventListener('click', function () {
                panel.classList.toggle('is-open');
            });
        }

        var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
        var previous = document.querySelector('[data-hero-prev]');
        var next = document.querySelector('[data-hero-next]');
        var current = 0;
        var timer = null;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        }

        function startHero() {
            if (slides.length < 2) {
                return;
            }
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                showSlide(current + 1);
            }, 5200);
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
                startHero();
            });
        });

        if (previous) {
            previous.addEventListener('click', function () {
                showSlide(current - 1);
                startHero();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                showSlide(current + 1);
                startHero();
            });
        }

        showSlide(0);
        startHero();

        var filterInput = document.querySelector('[data-page-filter]');
        var filterScope = document.querySelector('[data-filter-scope]');
        var filterCount = document.querySelector('[data-filter-count]');
        if (filterInput && filterScope) {
            var items = Array.prototype.slice.call(filterScope.children);
            function applyFilter() {
                var query = filterInput.value.trim().toLowerCase();
                var shown = 0;
                items.forEach(function (item) {
                    var text = (item.getAttribute('data-filter-text') || item.textContent || '').toLowerCase();
                    var matched = !query || text.indexOf(query) !== -1;
                    item.classList.toggle('is-filter-hidden', !matched);
                    if (matched) {
                        shown += 1;
                    }
                });
                if (filterCount) {
                    filterCount.textContent = query ? '已匹配 ' + shown + ' 项' : '';
                }
            }
            filterInput.addEventListener('input', applyFilter);
            applyFilter();
        }
    });
})();
