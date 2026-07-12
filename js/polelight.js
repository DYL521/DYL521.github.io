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
      },
      securityLevel: 'loose'
    });
  }

  function renderMermaidBlock(code) {
    var pre = code.parentElement;
    var graph = code.textContent;
    var id = 'mermaid-' + Math.random().toString(36).substr(2, 9);
    var container = document.createElement('div');
    container.className = 'mermaid';
    container.id = id;
    container.dataset.graph = graph;
    container.textContent = graph;
    pre.parentElement.replaceChild(container, pre);
  }

  function initMermaidBlocks() {
    if (!window.mermaid) return;
    var selectors = [
      'pre code.language-mermaid',
      'pre.language-mermaid code',
      'pre[class*="language-mermaid"] code',
      'code.language-mermaid'
    ];
    var blocks = [];
    selectors.forEach(function (sel) {
      document.querySelectorAll(sel).forEach(function (code) {
        if (blocks.indexOf(code) === -1) blocks.push(code);
      });
    });
    blocks.forEach(renderMermaidBlock);
  }

  function updateThemeLabel() {
    var d = DICT[currentLang];
    if (!d) return;
    var txt = d.theme_toggle;
    if (!txt) return;
    var btn = document.getElementById('dyl-theme-toggle');
    if (btn) btn.setAttribute('aria-label', txt);
  }

  var mermaidRenderSeq = 0;

  function mermaidShowSource(container, showSrc) {
    var view = container.querySelector('.mermaid-view');
    var src = container.querySelector('.mermaid-source');
    var toggle = container.querySelector('.mermaid-toggle-btn');
    if (!view || !src || !toggle) return;
    src.hidden = !showSrc;
    view.hidden = showSrc;
    toggle.textContent = showSrc ? 'Diagram' : 'Source';
  }

  function ensureMermaidScaffold(container) {
    var view = container.querySelector('.mermaid-view');
    if (view) return view;

    view = document.createElement('div');
    view.className = 'mermaid-view';

    var src = document.createElement('pre');
    src.className = 'mermaid-source';
    src.textContent = container.dataset.graph || '';
    src.hidden = true;

    var toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'mermaid-btn mermaid-toggle-btn';
    toggle.setAttribute('aria-label', 'Toggle diagram source');
    toggle.textContent = 'Source';
    toggle.addEventListener('click', function () {
      mermaidShowSource(container, !view.hidden);
    });

    var copy = document.createElement('button');
    copy.type = 'button';
    copy.className = 'mermaid-btn mermaid-copy-btn';
    copy.setAttribute('aria-label', 'Copy diagram source');
    copy.textContent = 'Copy';
    copy.addEventListener('click', function () {
      copyText(container.dataset.graph || '').then(function () {
        copy.textContent = 'Copied';
        setTimeout(function () { copy.textContent = 'Copy'; }, 1500);
      }).catch(function () {
        copy.textContent = 'Failed';
        setTimeout(function () { copy.textContent = 'Copy'; }, 1500);
      });
    });

    var bar = document.createElement('div');
    bar.className = 'mermaid-toolbar';
    bar.appendChild(toggle);
    bar.appendChild(copy);

    container.textContent = '';
    container.appendChild(bar);
    container.appendChild(view);
    container.appendChild(src);
    return view;
  }

  function rerenderMermaid() {
    if (!window.mermaid || typeof window.mermaid.render !== 'function') return;
    document.querySelectorAll('.mermaid').forEach(function (container) {
      var graph = container.dataset.graph;
      if (!graph || !container.id) return;
      // The render id must differ from container.id and be unique per call:
      // mermaid.render() deletes any existing DOM element matching the id it
      // is given, so a reused id lets concurrent renders destroy each other.
      var renderId = container.id + '-svg-' + (++mermaidRenderSeq);
      window.mermaid.render(renderId, graph).then(function (result) {
        ensureMermaidScaffold(container).innerHTML = result.svg;
      }).catch(function (err) {
        ['', 'd'].forEach(function (prefix) {
          var leftover = document.getElementById(prefix + renderId);
          if (leftover && !container.contains(leftover)) leftover.remove();
        });
        ensureMermaidScaffold(container);
        mermaidShowSource(container, true);
        if (window.console && console.warn) console.warn('Mermaid render failed:', err);
      });
    });
  }

  function normalizeMermaidText(el) {
    return el.innerHTML.replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]+>/g, '').replace(/&gt;/g, '>').replace(/&lt;/g, '<').replace(/&amp;/g, '&').trim();
  }

  function collectBareMermaid(startParagraph) {
    var lines = [normalizeMermaidText(startParagraph)];
    var node = startParagraph.nextElementSibling;
    var continuationPattern = /^(participant|note|loop|alt|opt|rect|par|and|end|activate|deactivate|class|%%|-->|-?->>|:|graph|flowchart|subgraph|end$)/i;
    while (node && node.tagName === 'P') {
      var text = normalizeMermaidText(node);
      if (!text) { node = node.nextElementSibling; continue; }
      if (continuationPattern.test(text) || text.includes('->>') || text.includes('-->>') || text.includes('->') || text.includes('--')) {
        lines.push(text);
        var current = node;
        node = node.nextElementSibling;
        current.remove();
      } else {
        break;
      }
    }
    return lines.join('\n');
  }

  function renderBareMermaidBlocks() {
    if (!window.mermaid || typeof window.mermaid.render !== 'function') return;
    var article = document.querySelector('.article-body');
    if (!article || article.querySelector('.mermaid, pre code.language-mermaid')) return;
    var startKeywords = ['sequenceDiagram', 'graph TD', 'graph LR', 'graph RL', 'graph BT', 'flowchart TD', 'flowchart LR', 'flowchart RL', 'flowchart BT', 'classDiagram', 'stateDiagram', 'stateDiagram-v2', 'journey', 'gantt', 'pie', 'erDiagram'];
    var paragraphs = Array.from(article.querySelectorAll('p'));
    paragraphs.forEach(function (p) {
      var text = normalizeMermaidText(p);
      var keyword = startKeywords.find(function (k) { return text.indexOf(k) === 0; });
      if (!keyword) return;
      var graph = collectBareMermaid(p);
      var id = 'mermaid-' + Math.random().toString(36).substr(2, 9);
      var container = document.createElement('div');
      container.className = 'mermaid';
      container.id = id;
      container.dataset.graph = graph;
      p.parentElement.replaceChild(container, p);
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
    var link = document.querySelector('[data-hero="link"]');
    if (link && s.url) link.setAttribute('href', s.url);
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

  function updateRecentItems() {
    document.querySelectorAll('.recent-cat').forEach(function (el) {
      var zh = el.getAttribute('data-zh-cat');
      var en = el.getAttribute('data-en-cat');
      if (!zh) return;
      el.textContent = (currentLang === 'en' && en) ? en : zh;
    });
    document.querySelectorAll('.recent-title').forEach(function (el) {
      var zh = el.getAttribute('data-zh-title');
      var en = el.getAttribute('data-en-title');
      if (!zh) return;
      el.textContent = (currentLang === 'en' && en) ? en : zh;
    });
  }

  function updateTagChips() {
    document.querySelectorAll('.tag-chip').forEach(function (el) {
      var zh = el.getAttribute('data-zh-name');
      var en = el.getAttribute('data-en-name');
      if (!zh) return;
      var name = (currentLang === 'en' && en) ? en : zh;
      var count = el.querySelector('.tag-count');
      var countText = count ? count.textContent : '';
      el.textContent = '';
      el.appendChild(document.createTextNode('#' + name + ' '));
      if (count) {
        count.textContent = countText;
        el.appendChild(count);
      } else {
        var newCount = document.createElement('span');
        newCount.className = 'tag-count';
        newCount.textContent = countText;
        el.appendChild(newCount);
      }
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
    document.querySelectorAll("[data-i18n-placeholder]").forEach(function (el) {
      var key = el.getAttribute("data-i18n-placeholder");
      if (d[key] !== undefined) el.setAttribute("placeholder", d[key]);
    });
    document.documentElement.lang = target === "en" ? "en" : "zh-CN";
    currentLang = target;
    updateThemeLabel();
    updateHeroKicker();
    updateFeaturedCards();
    updateRecentItems();
    updateTagChips();
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
      return navigator.clipboard.writeText(text).catch(function () {
        return legacyCopyText(text);
      });
    }
    return legacyCopyText(text);
  }

  function legacyCopyText(text) {
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
    var closeBtn = document.getElementById('dyl-search-close');
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
      results.innerHTML = '<div class="search-empty" data-i18n="search_shortcut">' + escapeHtml(getI18n('search_shortcut')) + '</div>';
      resetFocus();
      setTimeout(function () { input.focus(); }, 50);
    }

    function close() {
      overlay.classList.remove('active');
      overlay.setAttribute('aria-hidden', 'true');
      if (lastTrigger && lastTrigger.focus) lastTrigger.focus();
    }

    var focusedIndex = -1;
    function updateFocus() {
      var items = Array.from(results.querySelectorAll('.search-result'));
      items.forEach(function (item, i) {
        item.classList.toggle('focused', i === focusedIndex);
        if (i === focusedIndex) item.scrollIntoView({ block: 'nearest' });
      });
    }
    function resetFocus() { focusedIndex = -1; }

    function renderHits(hits) {
      if (!hits.length) {
        results.innerHTML = '<div class="search-no-results" data-i18n="search_no_results">' + escapeHtml(getI18n('search_no_results')) + '</div>';
        resetFocus();
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
      resetFocus();
    }

    var debounce = 0;
    input.addEventListener('input', function () {
      clearTimeout(debounce);
      var q = input.value.trim();
      if (!q) {
        results.innerHTML = '<div class="search-empty" data-i18n="search_shortcut">' + escapeHtml(getI18n('search_shortcut')) + '</div>';
        resetFocus();
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
      if (!overlay.classList.contains('active')) {
        if (e.key === '/' && document.activeElement && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
          e.preventDefault();
          open();
        }
        return;
      }
      if (e.key === 'Escape') {
        close();
        return;
      }
      var items = Array.from(results.querySelectorAll('.search-result'));
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        focusedIndex = Math.min(focusedIndex + 1, items.length - 1);
        updateFocus();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        focusedIndex = Math.max(focusedIndex - 1, -1);
        updateFocus();
      } else if (e.key === 'Enter' && focusedIndex >= 0 && items[focusedIndex]) {
        e.preventDefault();
        window.location.href = items[focusedIndex].getAttribute('href');
      }
    });
    if (closeBtn) closeBtn.addEventListener('click', close);
  }

  function getI18nKey(key, fallback) {
    var d = DICT[currentLang];
    return (d && d[key] !== undefined) ? d[key] : fallback;
  }

  function initPostsFilter() {
    var input = document.getElementById('dyl-posts-filter');
    var results = document.getElementById('dyl-posts-results');
    var indexEl = document.getElementById('dyl-posts-index');
    if (!input || !results || !indexEl) return;
    var posts;
    try { posts = JSON.parse(indexEl.textContent); } catch (e) { return; }
    var list = document.querySelector('.posts-list:not(.posts-filter-results)');
    var pagination = document.querySelector('.pagination');
    var MAX_RESULTS = 100;

    function buildItem(post) {
      var a = document.createElement('a');
      a.href = post.u;
      a.className = 'archive-item';
      var coverImg = document.createElement('img');
      coverImg.className = 'archive-item-cover';
      coverImg.src = post.v || '';
      coverImg.alt = '';
      coverImg.loading = 'lazy';
      var dateSpan = document.createElement('span');
      dateSpan.className = 'archive-date';
      dateSpan.textContent = post.d;
      var catSpan = document.createElement('span');
      catSpan.className = 'archive-cat';
      catSpan.textContent = post.c;
      var titleSpan = document.createElement('span');
      titleSpan.className = 'archive-item-title';
      titleSpan.textContent = post.t;
      var arrow = document.createElement('span');
      arrow.className = 'archive-arrow';
      arrow.textContent = '→';
      a.appendChild(coverImg);
      a.appendChild(dateSpan);
      a.appendChild(catSpan);
      a.appendChild(titleSpan);
      a.appendChild(arrow);
      return a;
    }

    input.addEventListener('input', function () {
      var query = input.value.trim().toLowerCase();
      if (!query) {
        results.hidden = true;
        results.textContent = '';
        if (list) list.hidden = false;
        if (pagination) pagination.hidden = false;
        return;
      }
      var terms = query.split(/\s+/);
      var matched = posts.filter(function (post) {
        var title = post.t.toLowerCase();
        return terms.every(function (term) { return title.indexOf(term) !== -1; });
      });
      results.textContent = '';
      if (!matched.length) {
        var empty = document.createElement('div');
        empty.className = 'posts-filter-empty';
        empty.textContent = getI18nKey('posts_filter_empty', '没有匹配的文章');
        results.appendChild(empty);
      } else {
        matched.slice(0, MAX_RESULTS).forEach(function (post) {
          results.appendChild(buildItem(post));
        });
      }
      results.hidden = false;
      if (list) list.hidden = true;
      if (pagination) pagination.hidden = true;
    });
  }

  function bindMobileNav() {
    var toggle = document.getElementById('dyl-mobile-menu-toggle');
    var menu = document.getElementById('dyl-mobile-nav');
    if (!toggle || !menu) return;
    toggle.addEventListener('click', function () {
      var open = menu.classList.toggle('active');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      menu.setAttribute('aria-hidden', open ? 'false' : 'true');
      document.body.style.overflow = open ? 'hidden' : '';
    });
    menu.querySelectorAll('.mobile-nav-link').forEach(function (link) {
      link.addEventListener('click', function () {
        menu.classList.remove('active');
        toggle.setAttribute('aria-expanded', 'false');
        menu.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
      });
    });
  }


  /* ---------- github repos ---------- */
  function renderGitHubRepos(repos) {
    var container = document.getElementById('github-repos');
    if (!container) return;

    var langColors = {
      'JavaScript': '#E8B339',
      'TypeScript': '#3B82F6',
      'Python': '#30A46C',
      'Go': '#00ADD8',
      'Rust': '#DEA584',
      'Java': '#B07219',
      'Vue': '#41B883',
      'HTML': '#E44D26',
      'CSS': '#563D7C',
      'Shell': '#89E051',
      'C': '#555555',
      'C++': '#F34B7D'
    };

    function langDot(language) {
      var color = langColors[language] || 'var(--accent)';
      return '<span class="repo-lang-dot" style="background:' + color + ';"></span>';
    }

    function starSvg() {
      return '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>';
    }

    function fmtCount(n) {
      if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
      return String(n);
    }

    var html = repos.map(function (repo) {
      var desc = escapeHtml(repo.description || '');
      var lang = repo.language || '';
      var updated = repo.updated_at ? new Date(repo.updated_at).toLocaleDateString() : '';
      return '<a href="' + escapeHtml(repo.html_url) + '" target="_blank" rel="noopener" class="repo-card">' +
        '<div class="repo-header">' +
          '<span class="repo-name">' + escapeHtml(repo.name) + '</span>' +
          '<span class="repo-stars">' + starSvg() + fmtCount(repo.stargazers_count || 0) + '</span>' +
        '</div>' +
        '<div class="repo-desc">' + (desc || getI18nKey('about_repos_no_desc', 'No description provided.')) + '</div>' +
        '<div class="repo-meta">' +
          (lang ? '<span class="repo-lang">' + langDot(lang) + escapeHtml(lang) + '</span>' : '') +
          '<span>' + updated + '</span>' +
        '</div>' +
      '</a>';
    }).join('');

    container.innerHTML = html;
  }

  function renderGitHubError(message) {
    var container = document.getElementById('github-repos');
    if (!container) return;
    container.innerHTML = '<div class="repo-card repo-card--error">' + escapeHtml(message) + '</div>';
  }

  function initGitHubRepos() {
    var container = document.getElementById('github-repos');
    var starsEl = document.getElementById('github-stars');
    if (!container) return;

    // GitHub API: fetch the user's public repos plus a curated list of other
    // notable repos, then sort all of them by stars together.
    var REPOS_API = 'https://api.github.com/users/DYL521/repos?sort=updated&direction=desc&per_page=100';
    var USER_API = 'https://api.github.com/users/DYL521';
    var FEATURED_REPOS = [
      'https://api.github.com/repos/ascending-llc/jarvis-registry'
    ];

    function animateCount(el, target, duration) {
      if (!el) return;
      var start = 0;
      var startTime = null;
      var rafId = null;
      var intervalId = null;
      var fallbackTimer = null;
      function setValue(value) {
        el.textContent = value >= 1000 ? (value / 1000).toFixed(1).replace(/\.0$/, '') + 'k' : String(value);
      }
      function finish() {
        if (rafId) cancelAnimationFrame(rafId);
        if (intervalId) clearInterval(intervalId);
        if (fallbackTimer) clearTimeout(fallbackTimer);
        setValue(target);
      }
      function tick(now) {
        if (!startTime) startTime = now;
        var progress = Math.min((now - startTime) / duration, 1);
        var value = Math.floor(progress * (target - start) + start);
        setValue(value);
        if (progress >= 1) {
          finish();
          return false;
        }
        return true;
      }
      function frame() {
        if (!tick(Date.now())) return;
        rafId = requestAnimationFrame(frame);
      }
      function startFallback() {
        intervalId = setInterval(function () {
          if (!tick(Date.now())) finish();
        }, 16);
      }
      if (typeof requestAnimationFrame === 'function') {
        rafId = requestAnimationFrame(frame);
        fallbackTimer = setTimeout(function () {
          if (rafId) cancelAnimationFrame(rafId);
          startFallback();
        }, 100);
      } else {
        startFallback();
      }
    }

    var EXCLUDED_REPOS = [
      'DYL521/DYL521'
    ];

    var userPromise = fetch(USER_API, { headers: { 'Accept': 'application/vnd.github.v3+json' } }).then(function (res) {
      if (!res.ok) throw new Error('GitHub user API ' + res.status);
      return res.json();
    });

    var reposPromise = fetch(REPOS_API, { headers: { 'Accept': 'application/vnd.github.v3+json' } }).then(function (res) {
      if (!res.ok) throw new Error('GitHub repos API ' + res.status);
      return res.json();
    });

    var featuredPromises = FEATURED_REPOS.map(function (url) {
      return fetch(url, { headers: { 'Accept': 'application/vnd.github.v3+json' } }).then(function (res) {
        if (!res.ok) throw new Error('GitHub featured repo API ' + res.status);
        return res.json();
      });
    });

    Promise.all([userPromise, reposPromise].concat(featuredPromises))
      .then(function (values) {
        var profile = values[0];
        var repos = values[1];
        if (!Array.isArray(repos)) throw new Error('Unexpected response');

        // Merge user's repos with any curated featured repos, filter out
        // uninteresting ones, then sort by stars descending and keep the top 6.
        var allRepos = repos.concat(values.slice(2));
        var popularRepos = allRepos
          .filter(function (r) { return EXCLUDED_REPOS.indexOf(r.full_name) === -1; })
          .sort(function (a, b) { return (b.stargazers_count || 0) - (a.stargazers_count || 0); })
          .slice(0, 6);

        var reposCountEl = document.getElementById('github-repos-count');
        var followersCountEl = document.getElementById('github-followers-count');
        animateCount(reposCountEl, profile.public_repos || 0, 800);
        animateCount(followersCountEl, profile.followers || 0, 800);

        renderGitHubRepos(popularRepos);
        if (starsEl) {
          var total = popularRepos.reduce(function (sum, r) { return sum + (r.stargazers_count || 0); }, 0);
          animateCount(starsEl, total, 800);
        }
      })
      .catch(function (err) {
        if (window.console && console.warn) console.warn('GitHub repos load failed:', err);
        renderGitHubError(getI18nKey('about_repos_error', 'Projects are temporarily unavailable. Visit GitHub instead.'));
      });
  }
  function scheduleInitGitHubRepos() {
    function run() {
      try { initGitHubRepos(); } catch (e) {
        if (window.console && console.warn) console.warn('GitHub repos init failed:', e);
      }
    }
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', run);
    } else {
      run();
    }
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
    bindMobileNav();
    initPostsFilter();
    initTocSpy();
    initSearch();

    /* ---------- mermaid diagrams ---------- */
    initMermaidBlocks();
    rerenderMermaid();
    renderBareMermaidBlocks();
    rerenderMermaid();

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

  scheduleInitGitHubRepos();
})();
