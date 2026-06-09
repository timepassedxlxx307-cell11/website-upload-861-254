(() => {
  const video = document.getElementById("movie-video");
  const overlay = document.getElementById("play-overlay");
  const configElement = document.getElementById("player-config");

  if (!video || !configElement) {
    return;
  }

  let config = null;

  try {
    config = JSON.parse(configElement.textContent || "{}");
  } catch (error) {
    config = null;
  }

  if (!config || !config.source) {
    return;
  }

  let initialized = false;
  let hlsInstance = null;

  const initialize = () => {
    if (initialized) {
      return;
    }

    initialized = true;

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = config.source;
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: false
      });
      hlsInstance.loadSource(config.source);
      hlsInstance.attachMedia(video);
      return;
    }

    video.src = config.source;
  };

  const start = () => {
    initialize();
    overlay?.classList.add("is-hidden");
    const playPromise = video.play();
    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(() => {
        overlay?.classList.remove("is-hidden");
      });
    }
  };

  overlay?.addEventListener("click", start);

  video.addEventListener("click", () => {
    if (video.paused) {
      start();
    }
  });

  video.addEventListener("play", () => {
    overlay?.classList.add("is-hidden");
  });

  video.addEventListener("pause", () => {
    if (!video.ended) {
      overlay?.classList.remove("is-hidden");
    }
  });

  video.addEventListener("ended", () => {
    overlay?.classList.remove("is-hidden");
  });

  initialize();

  window.addEventListener("beforeunload", () => {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
})();
