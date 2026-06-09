(function () {
    var commonReady = false;

    function ready(fn) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", fn, { once: true });
        } else {
            fn();
        }
    }

    function initImages() {
        document.querySelectorAll("img").forEach(function (img) {
            img.addEventListener("error", function () {
                img.classList.add("is-missing");
                img.removeAttribute("src");
            }, { once: true });
        });
    }

    function initMobileNav() {
        var toggle = document.querySelector("[data-mobile-toggle]");
        var links = document.querySelector("[data-nav-links]");
        if (!toggle || !links) {
            return;
        }
        toggle.addEventListener("click", function () {
            links.classList.toggle("is-open");
        });
    }

    function initHeroCarousel() {
        var root = document.querySelector("[data-hero-carousel]");
        if (!root) {
            return;
        }
        var slides = Array.prototype.slice.call(root.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(root.querySelectorAll("[data-hero-dot]"));
        var prev = root.querySelector("[data-hero='prev']");
        var next = root.querySelector("[data-hero='next']");
        if (slides.length < 2) {
            return;
        }
        var current = 0;
        var timer = null;

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("active", dotIndex === current);
            });
        }

        function move(step) {
            show(current + step);
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                move(1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        if (prev) {
            prev.addEventListener("click", function () {
                move(-1);
                start();
            });
        }
        if (next) {
            next.addEventListener("click", function () {
                move(1);
                start();
            });
        }
        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                show(Number(dot.getAttribute("data-hero-dot")) || 0);
                start();
            });
        });
        root.addEventListener("mouseenter", stop);
        root.addEventListener("mouseleave", start);
        start();
    }

    function initCommon() {
        if (commonReady) {
            return;
        }
        commonReady = true;
        initImages();
        initMobileNav();
        initHeroCarousel();
    }

    function setupPlayer(options) {
        ready(function () {
            var video = document.querySelector(options.videoSelector);
            var cover = document.querySelector(options.coverSelector);
            var streamUrl = options.streamUrl;
            var loaded = false;
            var busy = false;

            if (!video || !streamUrl) {
                return;
            }

            function attach() {
                if (loaded) {
                    return;
                }
                loaded = true;
                if (video.canPlayType("application/vnd.apple.mpegURL")) {
                    video.src = streamUrl;
                    return;
                }
                if (window.Hls && window.Hls.isSupported()) {
                    var hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hls.loadSource(streamUrl);
                    hls.attachMedia(video);
                    return;
                }
                video.src = streamUrl;
            }

            function start() {
                if (busy) {
                    return;
                }
                busy = true;
                attach();
                if (cover) {
                    cover.hidden = true;
                }
                var attempt = video.play();
                if (attempt && typeof attempt.finally === "function") {
                    attempt.finally(function () {
                        busy = false;
                    });
                } else {
                    busy = false;
                }
            }

            if (cover) {
                cover.addEventListener("click", start);
            }
            video.addEventListener("click", function () {
                if (!loaded || video.paused) {
                    start();
                }
            });
        });
    }

    ready(initCommon);
    window.RealtimePlayer = {
        setupPlayer: setupPlayer
    };
})();
