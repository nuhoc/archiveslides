/* ===================================================================
   Gallery — filtering, search, and lightbox
   =================================================================== */
(function () {
  "use strict";

  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];

  // --- State ---
  let activeTag = "all";
  let activeYear = "all";
  let searchQuery = "";

  const cards = $$(".photo-card");
  const searchInput = $("#search");
  const countEl = $("#photo-count");
  const gallery = $("#gallery");

  if (!gallery) return; // bail if page has no gallery

  // --- Filtering ---
  function applyFilters() {
    const q = searchQuery.toLowerCase();
    let visible = 0;

    for (const card of cards) {
      const tags = card.dataset.tags ? card.dataset.tags.split("|||") : [];
      const year = card.dataset.year || "";
      const title = (card.dataset.title || "").toLowerCase();
      const caption = (card.dataset.caption || "").toLowerCase();
      const tagStr = tags.join(" ").toLowerCase();

      const matchTag = activeTag === "all" || tags.includes(activeTag);
      const matchYear = activeYear === "all" || year === activeYear;
      const matchSearch = !q || title.includes(q) || caption.includes(q) || tagStr.includes(q);

      if (matchTag && matchYear && matchSearch) {
        card.hidden = false;
        visible++;
      } else {
        card.hidden = true;
      }
    }

    countEl.textContent = visible;
  }

  // Tag pills
  $$("#tag-filters .pill").forEach((btn) => {
    btn.addEventListener("click", () => {
      $$("#tag-filters .pill").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      activeTag = btn.dataset.tag;
      applyFilters();
    });
  });

  // Search with debounce
  let searchTimer;
  searchInput.addEventListener("input", () => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
      searchQuery = searchInput.value.trim();
      applyFilters();
    }, 150);
  });

  // --- Lightbox ---
  const lightbox = $("#lightbox");
  const lbImg = $(".lightbox-img");
  const lbTitle = $(".lightbox-title");
  const lbCaption = $(".lightbox-caption");
  const lbDate = $(".lightbox-date");   // may be null if removed from layout
  const lbTags = $(".lightbox-tags");
  const lbClose = $(".lightbox-close");
  const lbPrev = $(".lightbox-prev");
  const lbNext = $(".lightbox-next");

  let currentIndex = -1;

  function visibleCards() {
    return cards.filter((c) => !c.hidden);
  }

  function openLightbox(index) {
    const vis = visibleCards();
    if (index < 0 || index >= vis.length) return;
    currentIndex = index;
    const card = vis[index];
    const img = $("img", card);

    // Use the full-size URL from data attribute
    lbImg.src = img.dataset.full || img.src;
    lbImg.alt = img.alt;

    lbTitle.textContent = card.dataset.title || "";
    lbCaption.textContent = card.dataset.caption || "";
    if (lbDate) lbDate.textContent = card.dataset.date || "";

    // Tags
    const tags = card.dataset.tags ? card.dataset.tags.split("|||").filter(Boolean) : [];
    lbTags.innerHTML = tags
      .map((t) => `<span class="tag-chip">${t}</span>`)
      .join("");

    lightbox.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  function closeLightbox() {
    lightbox.setAttribute("aria-hidden", "true");
    lbImg.src = "";
    document.body.style.overflow = "";
    currentIndex = -1;
  }

  function navigate(delta) {
    const vis = visibleCards();
    let next = currentIndex + delta;
    if (next < 0) next = vis.length - 1;
    if (next >= vis.length) next = 0;
    openLightbox(next);
  }

  // Click on photo card → open lightbox
  gallery.addEventListener("click", (e) => {
    const card = e.target.closest(".photo-card");
    if (!card) return;
    e.preventDefault();
    const vis = visibleCards();
    const idx = vis.indexOf(card);
    if (idx !== -1) openLightbox(idx);
  });

  lbClose.addEventListener("click", closeLightbox);
  lbPrev.addEventListener("click", () => navigate(-1));
  lbNext.addEventListener("click", () => navigate(1));

  // Click outside image closes lightbox
  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox || e.target.classList.contains("lightbox-content")) {
      closeLightbox();
    }
  });

  // Keyboard navigation
  document.addEventListener("keydown", (e) => {
    if (lightbox.getAttribute("aria-hidden") === "false") {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") navigate(-1);
      if (e.key === "ArrowRight") navigate(1);
    }
  });

  // Touch swipe support for lightbox
  let touchStartX = 0;
  lightbox.addEventListener("touchstart", (e) => {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });

  lightbox.addEventListener("touchend", (e) => {
    const dx = e.changedTouches[0].screenX - touchStartX;
    if (Math.abs(dx) > 50) navigate(dx > 0 ? -1 : 1);
  }, { passive: true });
})();