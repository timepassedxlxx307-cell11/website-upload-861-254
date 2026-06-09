const menuButton = document.querySelector('[data-menu-toggle]');
const mobileMenu = document.querySelector('[data-mobile-menu]');

if (menuButton && mobileMenu) {
    menuButton.addEventListener('click', () => {
        mobileMenu.classList.toggle('is-open');
    });
}

const hero = document.querySelector('[data-hero]');

if (hero) {
    const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
    let activeIndex = 0;

    const showSlide = (nextIndex) => {
        if (!slides.length) {
            return;
        }

        activeIndex = (nextIndex + slides.length) % slides.length;

        slides.forEach((slide, index) => {
            slide.classList.toggle('is-active', index === activeIndex);
        });

        dots.forEach((dot, index) => {
            dot.classList.toggle('is-active', index === activeIndex);
        });
    };

    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            showSlide(index);
        });
    });

    window.setInterval(() => {
        showSlide(activeIndex + 1);
    }, 5200);
}

const toolbar = document.querySelector('[data-toolbar]');
const movieList = document.querySelector('[data-movie-list]');

if (toolbar && movieList) {
    const searchInput = toolbar.querySelector('[data-inline-search]');
    const filterButtons = Array.from(toolbar.querySelectorAll('[data-filter-value]'));
    const cards = Array.from(movieList.querySelectorAll('.movie-card'));
    const emptyState = document.querySelector('[data-empty-state]');
    const params = new URLSearchParams(window.location.search);
    let activeFilter = 'all';

    if (searchInput && params.has('q')) {
        searchInput.value = params.get('q') || '';
    }

    const applyFilters = () => {
        const query = searchInput ? searchInput.value.trim().toLowerCase() : '';
        let visibleCount = 0;

        cards.forEach((card) => {
            const text = (card.dataset.search || '').toLowerCase();
            const category = card.dataset.category || '';
            const matchesQuery = !query || text.includes(query);
            const matchesFilter = activeFilter === 'all' || category === activeFilter;
            const isVisible = matchesQuery && matchesFilter;

            card.hidden = !isVisible;

            if (isVisible) {
                visibleCount += 1;
            }
        });

        if (emptyState) {
            emptyState.hidden = visibleCount !== 0;
        }
    };

    if (searchInput) {
        searchInput.addEventListener('input', applyFilters);
    }

    filterButtons.forEach((button) => {
        button.addEventListener('click', () => {
            activeFilter = button.dataset.filterValue || 'all';

            filterButtons.forEach((item) => {
                item.classList.toggle('is-active', item === button);
            });

            applyFilters();
        });
    });

    applyFilters();
}

const player = document.querySelector('[data-player]');
const playerButton = document.querySelector('[data-play-button]');
let playerReady = false;
let playerLoading = false;

const preparePlayer = async () => {
    if (!player || playerReady || playerLoading) {
        return;
    }

    const source = player.dataset.src;

    if (!source) {
        return;
    }

    playerLoading = true;

    try {
        if (player.canPlayType('application/vnd.apple.mpegurl')) {
            player.src = source;
            playerReady = true;
            return;
        }

        const Hls = window.Hls;

        if (Hls && Hls.isSupported()) {
            const hls = new Hls({
                enableWorker: true,
                lowLatencyMode: true
            });

            hls.loadSource(source);
            hls.attachMedia(player);
            playerReady = true;
            return;
        }

        player.src = source;
        playerReady = true;
    } catch (error) {
        player.src = source;
        playerReady = true;
    } finally {
        playerLoading = false;
    }
};

const startPlayer = async () => {
    if (!player) {
        return;
    }

    await preparePlayer();

    if (playerButton) {
        playerButton.hidden = true;
    }

    try {
        await player.play();
    } catch (error) {
        player.controls = true;
    }
};

if (player) {
    player.addEventListener('play', () => {
        if (playerButton) {
            playerButton.hidden = true;
        }
    });

    player.addEventListener('click', () => {
        if (player.paused) {
            startPlayer();
        }
    });
}

if (playerButton) {
    playerButton.addEventListener('click', startPlayer);
}
