// Generated HLS player initializer for static detail pages.
(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function initPlayer(shell) {
    var video = shell.querySelector('video');
    var button = shell.querySelector('[data-player-start]');
    var message = shell.querySelector('[data-player-message]');
    var src = shell.getAttribute('data-src');
    var initialized = false;

    function setMessage(text) {
      if (message) {
        message.textContent = text || '';
      }
    }

    function play() {
      if (!video || !src) {
        setMessage('播放源暂不可用。');
        return;
      }

      if (!initialized) {
        if (window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(src);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.ERROR, function (_, data) {
            if (data && data.fatal) {
              setMessage('播放器正在尝试恢复，若仍无法播放请刷新页面。');
            }
          });
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = src;
        } else {
          video.src = src;
          setMessage('当前浏览器可能需要 HLS 支持才能播放 m3u8。');
        }
        initialized = true;
      }

      shell.classList.add('is-playing');
      var promise = video.play();
      if (promise && promise.catch) {
        promise.catch(function () {
          shell.classList.remove('is-playing');
          setMessage('浏览器阻止了自动播放，请再次点击播放按钮。');
        });
      }
    }

    if (button) {
      button.addEventListener('click', play);
    }
  }

  ready(function () {
    Array.prototype.slice.call(document.querySelectorAll('[data-player]')).forEach(initPlayer);
  });
})();
