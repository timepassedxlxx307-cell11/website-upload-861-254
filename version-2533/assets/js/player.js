(function () {
    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    ready(function () {
        var video = document.querySelector('[data-player-video]');
        var button = document.querySelector('[data-play-button]');
        var status = document.querySelector('[data-playback-status]');
        if (!video) {
            return;
        }

        var source = video.getAttribute('data-src');
        var hls = null;

        function setStatus(message) {
            if (status) {
                status.textContent = message || '';
            }
        }

        function attachSource() {
            if (!source) {
                setStatus('播放源暂不可用');
                return;
            }

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                if (video.src !== source) {
                    video.src = source;
                }
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                if (!hls) {
                    hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true,
                        backBufferLength: 90
                    });
                    hls.loadSource(source);
                    hls.attachMedia(video);
                    hls.on(window.Hls.Events.ERROR, function (event, data) {
                        if (data && data.fatal) {
                            setStatus('播放加载异常，请刷新后重试');
                        }
                    });
                }
                return;
            }

            setStatus('当前浏览器暂不支持 HLS 播放');
        }

        attachSource();

        if (button) {
            button.addEventListener('click', function () {
                attachSource();
                var playPromise = video.play();
                if (playPromise && typeof playPromise.catch === 'function') {
                    playPromise.catch(function () {
                        setStatus('请在播放器控件中再次点击播放');
                    });
                }
                button.classList.add('is-hidden');
            });
        }

        video.addEventListener('play', function () {
            if (button) {
                button.classList.add('is-hidden');
            }
            setStatus('');
        });
    });
})();
