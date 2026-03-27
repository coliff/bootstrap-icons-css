(function () {
  if (typeof Prism !== "undefined") Prism.highlightAll();
})();

(function () {
  const grid = document.getElementById("grid");
  const searchInput = document.getElementById("search");
  const countEl = document.querySelector(".count");

  let allNames = [];
  let filtered = [];

  function render() {
    const fragment = document.createDocumentFragment();
    for (let i = 0; i < filtered.length; i++) {
      const name = filtered[i];
      const div = document.createElement("div");
      div.className = "grid-item";
      div.title = "Click to copy class";
      const icon = document.createElement("i");
      icon.className = "bi bi-" + name;
      const label = document.createElement("span");
      label.textContent = name;
      div.appendChild(icon);
      div.appendChild(label);
      fragment.appendChild(div);
    }
    grid.textContent = "";
    grid.appendChild(fragment);
  }

  function updateCount() {
    const q = searchInput.value.trim();
    if (q.length < 1) {
      countEl.textContent = allNames.length + " icons. Type to filter.";
    } else {
      countEl.textContent = filtered.length + " icons.";
    }
  }

  function applySearch() {
    const q = searchInput.value.trim().toLowerCase();
    filtered =
      q.length >= 1
        ? allNames.filter((n) => n.toLowerCase().includes(q))
        : allNames;
    updateCount();
    render();
  }

  function syncUrlFromSearch() {
    const q = searchInput.value.trim();
    const url = new URL(location.href);
    if (q.length >= 1) {
      url.searchParams.set("q", q);
    } else {
      url.searchParams.delete("q");
    }
    history.replaceState(null, "", url);
  }

  searchInput.addEventListener("input", () => {
    applySearch();
    syncUrlFromSearch();
  });

  document.addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "k") {
      e.preventDefault();
      searchInput.focus();
    }
  });

  grid.addEventListener("click", (e) => {
    const item = e.target.closest(".grid-item");
    if (!item) return;
    const label = item.querySelector("span:last-child");
    const name = label.textContent;
    if (name === "Copied!") return;
    const classNames = "bi bi-" + name;
    navigator.clipboard.writeText(classNames).then(
      () => {
        const original = name;
        label.textContent = "Copied!";
        setTimeout(() => {
          label.textContent = original;
        }, 1500);
      },
      () => {},
    );
  });

  fetch(new URL("icon-list.json", location.href))
    .then((r) => r.json())
    .then((names) => {
      allNames = names;
      const urlParam = new URLSearchParams(location.search).get("q");
      if (urlParam) {
        searchInput.value = urlParam;
      }
      applySearch();
      syncUrlFromSearch();
    })
    .catch((e) => {
      countEl.textContent =
        "Could not load icon list. Run npm run build first.";
      console.error(e);
    });
})();

(function () {
  var toggle = document.getElementById("theme-toggle");
  if (!toggle) return;
  function setLabel() {
    var isDark = document.documentElement.getAttribute("data-theme") === "dark";
    toggle.textContent = isDark ? "☀️" : "🌙";
    toggle.setAttribute(
      "aria-label",
      isDark ? "Switch to light mode" : "Switch to dark mode",
    );
  }
  setLabel();
  var prismDark = document.getElementById("prism-dark");
  if (prismDark)
    prismDark.media =
      document.documentElement.getAttribute("data-theme") === "dark"
        ? "all"
        : "none";
  toggle.addEventListener("click", function () {
    var isDark = document.documentElement.getAttribute("data-theme") === "dark";
    var next = isDark ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("theme", next);
    var prismDark = document.getElementById("prism-dark");
    if (prismDark) prismDark.media = next === "dark" ? "all" : "none";
    setLabel();
  });
})();
