(() => {
  const header = document.getElementById("site-header");
  const toggle = document.querySelector(".menu-toggle");
  const panel = document.getElementById("mobile-panel");

  const setHeaderState = () => {
    if (!header) {
      return;
    }
    header.classList.toggle("is-scrolled", window.scrollY > 36);
  };

  setHeaderState();
  window.addEventListener("scroll", setHeaderState, { passive: true });

  if (toggle && panel) {
    toggle.addEventListener("click", () => {
      const opened = panel.classList.toggle("open");
      toggle.setAttribute("aria-expanded", opened ? "true" : "false");
    });
  }

  const sliders = document.querySelectorAll("[data-hero-slider]");
  sliders.forEach((slider) => {
    const slides = Array.from(slider.querySelectorAll(".hero-slide"));
    const dots = Array.from(slider.querySelectorAll(".hero-dot"));
    const prev = slider.querySelector("[data-hero-prev]");
    const next = slider.querySelector("[data-hero-next]");
    let active = slides.findIndex((slide) => slide.classList.contains("active"));
    if (active < 0) {
      active = 0;
    }

    const show = (index) => {
      if (!slides.length) {
        return;
      }
      active = (index + slides.length) % slides.length;
      slides.forEach((slide, slideIndex) => {
        slide.classList.toggle("active", slideIndex === active);
      });
      dots.forEach((dot, dotIndex) => {
        dot.classList.toggle("active", dotIndex === active);
      });
    };

    prev?.addEventListener("click", () => show(active - 1));
    next?.addEventListener("click", () => show(active + 1));
    dots.forEach((dot) => {
      dot.addEventListener("click", () => {
        show(Number(dot.dataset.slide || 0));
      });
    });

    let timer = window.setInterval(() => show(active + 1), 5200);
    slider.addEventListener("mouseenter", () => window.clearInterval(timer));
    slider.addEventListener("mouseleave", () => {
      timer = window.setInterval(() => show(active + 1), 5200);
    });
  });

  const normalize = (value) => (value || "").toString().trim().toLowerCase();

  const textOfCard = (card) => {
    return normalize([
      card.dataset.title,
      card.dataset.type,
      card.dataset.region,
      card.dataset.year,
      card.dataset.genre,
      card.dataset.tags,
      card.textContent
    ].join(" "));
  };

  const applyFilters = (root, query, filter) => {
    const cards = Array.from(root.querySelectorAll(".searchable-card"));
    const keyword = normalize(query);
    const picked = normalize(filter);
    cards.forEach((card) => {
      const content = textOfCard(card);
      const matchedKeyword = !keyword || content.includes(keyword);
      const matchedFilter = !picked || content.includes(picked);
      card.classList.toggle("is-hidden", !(matchedKeyword && matchedFilter));
    });
  };

  document.querySelectorAll("[data-local-filter]").forEach((filterRoot) => {
    const section = filterRoot.parentElement || document;
    const input = filterRoot.querySelector("[data-filter-input]");
    const buttons = Array.from(filterRoot.querySelectorAll("[data-filter]"));
    let activeFilter = "";

    const update = () => {
      applyFilters(section, input?.value || "", activeFilter);
    };

    input?.addEventListener("input", update);
    buttons.forEach((button) => {
      button.addEventListener("click", () => {
        activeFilter = button.dataset.filter || "";
        buttons.forEach((item) => item.classList.toggle("active", item === button));
        update();
      });
    });
  });

  const searchPage = document.querySelector("[data-search-page]");
  if (searchPage) {
    const params = new URLSearchParams(window.location.search);
    const q = params.get("q") || "";
    const mainInput = document.querySelector("[data-global-search]");
    const localInput = searchPage.querySelector("[data-filter-input]");
    if (mainInput) {
      mainInput.value = q;
    }
    if (localInput) {
      localInput.value = q;
      localInput.dispatchEvent(new Event("input"));
    }
  }
})();
