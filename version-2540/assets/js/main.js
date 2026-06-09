(function () {
    var header = document.querySelector('[data-header]');
    var toggle = document.querySelector('[data-menu-toggle]');
    var mobilePanel = document.querySelector('[data-mobile-panel]');

    function updateHeader() {
        if (!header) {
            return;
        }
        if (window.scrollY > 24) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    }

    updateHeader();
    window.addEventListener('scroll', updateHeader, { passive: true });

    if (toggle && mobilePanel) {
        toggle.addEventListener('click', function () {
            mobilePanel.classList.toggle('open');
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    var prev = document.querySelector('[data-hero-prev]');
    var next = document.querySelector('[data-hero-next]');
    var active = 0;
    var timer = null;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }
        active = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle('active', slideIndex === active);
        });
        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle('active', dotIndex === active);
        });
    }

    function startHero() {
        if (timer || slides.length < 2) {
            return;
        }
        timer = window.setInterval(function () {
            showSlide(active + 1);
        }, 5000);
    }

    function resetHero() {
        if (timer) {
            window.clearInterval(timer);
            timer = null;
        }
        startHero();
    }

    if (slides.length) {
        showSlide(0);
        startHero();
    }

    if (prev) {
        prev.addEventListener('click', function () {
            showSlide(active - 1);
            resetHero();
        });
    }

    if (next) {
        next.addEventListener('click', function () {
            showSlide(active + 1);
            resetHero();
        });
    }

    dots.forEach(function (dot, index) {
        dot.addEventListener('click', function () {
            showSlide(index);
            resetHero();
        });
    });

    var list = document.querySelector('[data-filter-list]');
    var searchInput = document.querySelector('[data-list-search]');
    var typeSelect = document.querySelector('[data-list-type]');

    function filterCards() {
        if (!list) {
            return;
        }
        var keyword = searchInput ? searchInput.value.trim().toLowerCase() : '';
        var type = typeSelect ? typeSelect.value.trim() : '';
        var cards = Array.prototype.slice.call(list.querySelectorAll('[data-movie-card]'));

        cards.forEach(function (card) {
            var text = [
                card.getAttribute('data-title'),
                card.getAttribute('data-region'),
                card.getAttribute('data-type'),
                card.getAttribute('data-year'),
                card.getAttribute('data-genre')
            ].join(' ').toLowerCase();
            var typeText = card.getAttribute('data-type') || '';
            var matchKeyword = !keyword || text.indexOf(keyword) !== -1;
            var matchType = !type || typeText.indexOf(type) !== -1;
            card.classList.toggle('hidden-card', !(matchKeyword && matchType));
        });
    }

    if (searchInput) {
        searchInput.addEventListener('input', filterCards);
    }

    if (typeSelect) {
        typeSelect.addEventListener('change', filterCards);
    }
})();
