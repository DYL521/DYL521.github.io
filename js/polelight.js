(function () {
  "use strict";

  var THEME_KEY = 'dyl_site_theme';

  function getSystemTheme() {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  }

  function resolveTheme() {
    var saved;
    try { saved = localStorage.getItem(THEME_KEY); } catch (e) {}
    return (saved === 'dark' || saved === 'light') ? saved : getSystemTheme();
  }

  function updatePrismTheme(t) {
    document.querySelectorAll('link[data-prism-theme]').forEach(function (link) {
      link.disabled = link.getAttribute('data-prism-theme') !== t;
    });
  }

  function updateMermaidTheme(t) {
    if (!window.mermaid || typeof window.mermaid.initialize !== 'function') return;
    var isDark = t !== 'light';
    window.mermaid.initialize({
      startOnLoad: false,
      theme: isDark ? 'dark' : 'default',
      themeVariables: isDark ? {
        primaryColor: '#7C5CFF',
        primaryTextColor: '#F1ECFF',
        primaryBorderColor: '#9B7BFF',
        lineColor: '#C795FF',
        secondaryColor: '#140A2E',
        tertiaryColor: '#0C0820'
      } : {
        primaryColor: '#E0D4FF',
        primaryTextColor: '#1A1433',
        primaryBorderColor: '#7C3AED',
        lineColor: '#7C3AED',
        secondaryColor: '#F7F5FF',
        tertiaryColor: '#EDE9FA'
      }
    });
  }

  function updateThemeLabel() {
    var d = DICT[currentLang];
    if (!d) return;
    var txt = d.theme_toggle;
    if (!txt) return;
    var btn = document.getElementById('dyl-theme-toggle');
    if (btn) btn.setAttribute('aria-label', txt);
  }

  function rerenderMermaid() {
    if (!window.mermaid || typeof window.mermaid.render !== 'function') return;
    document.querySelectorAll('.mermaid').forEach(function (container) {
      var graph = container.dataset.graph;
      if (!graph || !container.id) return;
      window.mermaid.render(container.id, graph).then(function (result) {
        container.innerHTML = result.svg;
      }).catch(function () {});
    });
  }

  function syncThemeUI(t) {
    document.documentElement.setAttribute('data-theme', t);
    var btn = document.getElementById('dyl-theme-toggle');
    if (btn) {
      btn.setAttribute('aria-pressed', t === 'dark' ? 'true' : 'false');
      btn.textContent = t === 'dark' ? '☀' : '🌙';
    }
    updatePrismTheme(t);
    updateMermaidTheme(t);
    updateThemeLabel();
  }

  function toggleTheme() {
    var current = document.documentElement.getAttribute('data-theme') || 'dark';
    var next = current === 'light' ? 'dark' : 'light';
    try { localStorage.setItem(THEME_KEY, next); } catch (e) {}
    theme = next;
    syncThemeUI(next);
    rerenderMermaid();
  }

  function bindThemeToggle() {
    var btn = document.getElementById('dyl-theme-toggle');
    if (!btn) return;
    btn.addEventListener('click', toggleTheme);
  }

  var theme = resolveTheme();

  var reduceMotion = window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- reveal ---------- */
  var revealEls = Array.prototype.slice.call(document.querySelectorAll("[data-reveal]"));
  if (!reduceMotion) {
    revealEls.forEach(function (el, i) {
      el.style.transitionDelay = Math.min(i % 8, 6) * 45 + "ms";
    });
  } else {
    revealEls.forEach(function (el) { el.classList.add("in"); });
  }

  /* ---------- hero carousel ---------- */
  var slideData = [];
  var slideScript = document.getElementById("hero-slides");
  if (slideScript) {
    try { slideData = JSON.parse(slideScript.textContent); } catch (e) {}
  }
  var currentSlide = 0;
  var slideInterval = null;

  function applySlide(i) {
    currentSlide = i;
    var layers = document.querySelectorAll("[data-hero-layer]");
    layers.forEach(function (el) {
      el.style.opacity = (+el.getAttribute("data-hero-layer") === i) ? "1" : "0";
    });
    var dots = document.querySelectorAll("[data-hero-dot]");
    dots.forEach(function (el) {
      el.classList.toggle("active", +el.getAttribute("data-hero-dot") === i);
    });
    var s = slideData[i];
    if (!s) return;
    var set = function (sel, txt) {
        var el = document.querySelector(sel);
        if (el) el.textContent = txt;
    };
    var heroSub = (currentLang === 'en' && s.en_sub) ? s.en_sub : s.sub;
    var heroTitle = (currentLang === 'en' && s.en_title) ? s.en_title : s.title;
    var heroTag = (currentLang === 'en' && s.en_tag) ? s.en_tag : s.tag;
    set('[data-hero="eng"]', s.eng);
    set('[data-hero="title"]', heroTitle);
    set('[data-hero="sub"]', heroSub);
    set('[data-hero="meta"]', heroTag + " · " + s.date);
  }

  function nextSlide() {
    applySlide((currentSlide + 1) % Math.max(slideData.length, 1));
  }

  function bindCarousel() {
    var dots = document.querySelectorAll("[data-hero-dot]");
    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        applySlide(+dot.getAttribute("data-hero-dot"));
        resetInterval();
      });
    });
    var hero = document.querySelector(".hero");
    if (hero && slideData.length > 1) {
      hero.addEventListener("mouseenter", function () { clearInterval(slideInterval); });
      hero.addEventListener("mouseleave", resetInterval);
      resetInterval();
    }
  }

  function resetInterval() {
    clearInterval(slideInterval);
    if (slideData.length > 1) {
      slideInterval = setInterval(nextSlide, 5000);
    }
  }

  /* ---------- scroll effects ---------- */
  var raf = 0;
  function onScroll() {
    if (raf) return;
    raf = requestAnimationFrame(function () {
      raf = 0;
      var vh = window.innerHeight;
      var top = window.pageYOffset || document.documentElement.scrollTop || 0;

      if (!reduceMotion) {
        revealEls = revealEls.filter(function (el) {
          if (el.getBoundingClientRect().top < vh * 0.9) {
            el.classList.add("in");
            return false;
          }
          return true;
        });
      }

      var docH = document.documentElement.scrollHeight - vh;
      var bar = document.getElementById("dyl-progress");
      if (bar) {
        bar.style.transform = "scaleX(" + Math.min(1, Math.max(0, top / (docH || 1))) + ")";
      }

      var nav = document.getElementById("dyl-nav");
      if (nav) {
        nav.classList.toggle("scrolled", top > 40);
      }

      if (!reduceMotion) {
        Array.from(document.querySelectorAll("[data-parallax]")).forEach(function (el) {
          var r = el.getBoundingClientRect();
          var off = r.top + r.height / 2 - vh / 2;
          var f = parseFloat(el.getAttribute("data-parallax")) || 0.08;
          el.style.transform = "translate3d(0," + (off * f).toFixed(1) + "px,0)";
        });
      }
    });
  }

  /* ---------- i18n toggle ---------- */
  var i18nEl = document.getElementById('site-i18n');
  var DICT = {};
  try {
      DICT = JSON.parse(i18nEl ? i18nEl.textContent : '{}');
  } catch (e) {
      DICT = {};
  }

  var currentLang = 'zh';

  var LS_KEY = "dyl_site_lang";
  var lang = "zh";
  try { lang = localStorage.getItem(LS_KEY) || "zh"; } catch (e) {}

  function updateHeroKicker() {
    var el = document.querySelector('.kicker-label');
    if (!el) return;
    var zh = el.getAttribute('data-zh');
    var en = el.getAttribute('data-en');
    el.textContent = (currentLang === 'en' && en) ? en : (zh || '');
  }

  function updateFeaturedCards() {
    document.querySelectorAll('.featured-heading').forEach(function (el) {
      var key = currentLang === 'en' ? 'data-en-title' : 'data-zh-title';
      if (el.hasAttribute(key)) el.textContent = el.getAttribute(key);
    });
    document.querySelectorAll('.featured-desc').forEach(function (el) {
      var key = currentLang === 'en' ? 'data-en-sub' : 'data-zh-sub';
      if (el.hasAttribute(key)) el.textContent = el.getAttribute(key);
    });
    document.querySelectorAll('.featured-meta').forEach(function (el) {
      var zhTag = el.getAttribute('data-zh-tag');
      var enTag = el.getAttribute('data-en-tag');
      if (!zhTag) return;
      var tag = (currentLang === 'en' && enTag) ? enTag : zhTag;
      var date = el.textContent.split(' · ')[1] || '';
      el.textContent = tag + ' · ' + date;
    });
  }

  function applyLang(target) {
    var d = DICT[target];
    if (!d) return;
    var EXCLUDE_SELECTOR = ".article-body, .article-abstract, .article-title";
    var posts = document.querySelector("[data-site-posts]")?.getAttribute("data-site-posts") || "0";
    var tags = document.querySelector("[data-site-tags]")?.getAttribute("data-site-tags") || "0";
    var year = document.querySelector("[data-site-year]")?.getAttribute("data-site-year") || "2020";
    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      if (el.closest(EXCLUDE_SELECTOR)) return;
      var key = el.getAttribute("data-i18n");
      var raw = d[key];
      if (raw === undefined) return;
      var txt = raw.replace(/{posts}/g, posts).replace(/{tags}/g, tags).replace(/{year}/g, year);
      el.textContent = txt;
    });
    document.documentElement.lang = target === "en" ? "en" : "zh-CN";
    currentLang = target;
    updateThemeLabel();
    updateHeroKicker();
    updateFeaturedCards();
    if (typeof applySlide === 'function') {
      applySlide(currentSlide || 0);
    }
  }

  function bindLang() {
    var btn = document.getElementById("dyl-lang-toggle");
    if (!btn) return;
    btn.addEventListener("click", function () {
      lang = lang === "zh" ? "en" : "zh";
      try { localStorage.setItem(LS_KEY, lang); } catch (e) {}
      applyLang(lang);
    });
  }

  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text);
    }
    return new Promise(function (resolve, reject) {
      var ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.left = "-9999px";
      ta.style.top = "0";
      document.body.appendChild(ta);
      ta.select();
      ta.setSelectionRange(0, text.length);
      try {
        if (document.execCommand("copy")) {
          resolve();
        } else {
          reject(new Error("execCommand copy failed"));
        }
      } catch (err) {
        reject(err);
      } finally {
        document.body.removeChild(ta);
      }
    });
  }

  function setActiveToc(id) {
    document.querySelectorAll('.toc-item').forEach(function (link) {
      link.classList.toggle('active', link.getAttribute('href') === '#' + id);
    });
  }

  function initTocSpy() {
    var tocLinks = document.querySelectorAll('.toc-item');
    var headings = Array.prototype.slice.call(document.querySelectorAll('.article-body h2, .article-body h3'));
    if (!tocLinks.length || !headings.length) return;

    if ('IntersectionObserver' in window) {
      var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            setActiveToc(entry.target.id);
          }
        });
      }, { rootMargin: '-20% 0px -60% 0px', threshold: 0 });

      headings.forEach(function (h) { observer.observe(h); });
    } else {
      function onScrollSpy() {
        var top = window.pageYOffset || document.documentElement.scrollTop || 0;
        var target = top + window.innerHeight * 0.2;
        var current = headings[0] ? headings[0].id : '';
        for (var i = 0; i < headings.length; i++) {
          if (headings[i].offsetTop <= target) {
            current = headings[i].id;
          } else {
            break;
          }
        }
        setActiveToc(current);
      }
      window.addEventListener('scroll', onScrollSpy, { passive: true });
      onScrollSpy();
    }
  }

  function getI18n(key) {
    var d = DICT[currentLang];
    return (d && d[key]) || key;
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function initSearch() {
    var overlay = document.getElementById('dyl-search-overlay');
    var input = document.getElementById('dyl-search-input');
    var results = document.getElementById('dyl-search-results');
    var trigger = document.getElementById('dyl-search-trigger');
    var lastTrigger = null;
    if (!overlay || !input || !results) return;

    var cfg = window.DYL_SEARCH || {};
    var client = null;
    var index = null;
    if (cfg.appId && cfg.apiKey && cfg.indexName && window.algoliasearch) {
      client = window.algoliasearch(cfg.appId, cfg.apiKey);
      index = client.initIndex(cfg.indexName);
    }

    function open() {
      lastTrigger = document.activeElement;
      overlay.classList.add('active');
      overlay.setAttribute('aria-hidden', 'false');
      input.value = '';
      results.innerHTML = '<div class="search-empty" data-i18n="search_placeholder">' + escapeHtml(getI18n('search_placeholder')) + '</div>';
      setTimeout(function () { input.focus(); }, 50);
    }

    function close() {
      overlay.classList.remove('active');
      overlay.setAttribute('aria-hidden', 'true');
      if (lastTrigger && lastTrigger.focus) lastTrigger.focus();
    }

    function renderHits(hits) {
      if (!hits.length) {
        results.innerHTML = '<div class="search-no-results" data-i18n="search_no_results">' + escapeHtml(getI18n('search_no_results')) + '</div>';
        return;
      }
      results.innerHTML = hits.map(function (hit) {
        var title = (hit._highlightResult && hit._highlightResult.title && hit._highlightResult.title.value) || hit.title || '';
        var excerpt = (hit._highlightResult && hit._highlightResult.content && hit._highlightResult.content.value) || '';
        var link = hit.permalink || hit.url || '#';
        return '<a href="' + escapeHtml(link) + '" class="search-result">' +
          '<div class="search-result-title">' + title + '</div>' +
          '<div class="search-result-meta">' + escapeHtml(hit.date || '') + '</div>' +
          '<div class="search-result-excerpt">' + excerpt + '</div>' +
          '</a>';
      }).join('');
    }

    var debounce = 0;
    input.addEventListener('input', function () {
      clearTimeout(debounce);
      var q = input.value.trim();
      if (!q) {
        results.innerHTML = '<div class="search-empty" data-i18n="search_placeholder">' + escapeHtml(getI18n('search_placeholder')) + '</div>';
        return;
      }
      results.innerHTML = '<div class="search-empty">Searching...</div>';
      if (!index) {
        results.innerHTML = '<div class="search-error" data-i18n="search_index_missing">' + escapeHtml(getI18n('search_index_missing')) + '</div>';
        return;
      }
      debounce = setTimeout(function () {
        index.search(q, { hitsPerPage: 10 }).then(function (res) {
          renderHits(res.hits);
        }).catch(function () {
          results.innerHTML = '<div class="search-error" data-i18n="search_index_missing">' + escapeHtml(getI18n('search_index_missing')) + '</div>';
        });
      }, 150);
    });

    if (trigger) trigger.addEventListener('click', open);
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) close();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && overlay.classList.contains('active')) {
        close();
      } else if (e.key === '/' && !overlay.classList.contains('active') && document.activeElement && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
        e.preventDefault();
        open();
      }
    });
  }

  /* ---------- init ---------- */
  document.addEventListener("DOMContentLoaded", function () {
    syncThemeUI(theme);
    if (slideData.length) {
      applySlide(0);
      bindCarousel();
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    onScroll();
    bindLang();
    applyLang(lang);
    bindThemeToggle();
    initTocSpy();
    initSearch();

    /* ---------- mermaid diagrams ---------- */
    var mermaidBlocks = document.querySelectorAll('pre code.language-mermaid');
    if (mermaidBlocks.length && window.mermaid) {
      mermaidBlocks.forEach(function (code) {
        var pre = code.parentElement;
        var graph = code.textContent;
        var id = 'mermaid-' + Math.random().toString(36).substr(2, 9);
        var container = document.createElement('div');
        container.className = 'mermaid';
        container.id = id;
        container.dataset.graph = graph;
        container.textContent = graph;
        pre.parentElement.replaceChild(container, pre);
      });
      rerenderMermaid();
    }

    /* ---------- copy code buttons ---------- */
    document.querySelectorAll('.article-body pre').forEach(function (pre) {
      if (pre.querySelector('.code-copy-btn')) return;
      if (pre.querySelector('code.language-mermaid')) return;
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'code-copy-btn';
      btn.setAttribute('aria-label', 'Copy code');
      btn.textContent = 'Copy';
      btn.addEventListener('click', function () {
        var code = pre.querySelector('code');
        var text = code ? code.textContent : pre.textContent;
        copyText(text).then(function () {
          btn.textContent = 'Copied';
          setTimeout(function () { btn.textContent = 'Copy'; }, 1500);
        }).catch(function () {
          btn.textContent = 'Failed';
          setTimeout(function () { btn.textContent = 'Copy'; }, 1500);
        });
      });
      pre.style.position = 'relative';
      pre.appendChild(btn);
    });
  });
})();
