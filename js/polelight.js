(function () {
  "use strict";

  var THEME_KEY = 'dyl_site_theme';

  var SYSTEM_LIGHT = window.matchMedia ? window.matchMedia('(prefers-color-scheme: light)') : null;

  // 未手动选择过时跟随系统；不支持或系统无偏好时默认暗色
  function getSystemTheme() {
    return SYSTEM_LIGHT && SYSTEM_LIGHT.matches ? 'light' : 'dark';
  }

  function hasSavedTheme() {
    try { var v = localStorage.getItem(THEME_KEY); return v === 'dark' || v === 'light'; } catch (e) { return false; }
  }

  function resolveTheme() {
    var saved;
    try { saved = localStorage.getItem(THEME_KEY); } catch (e) {}
    return (saved === 'dark' || saved === 'light') ? saved : getSystemTheme();
  }

  function updateMermaidTheme(t) {
    if (!window.mermaid || typeof window.mermaid.initialize !== 'function') return;
    var isDark = t !== 'light';
    window.mermaid.initialize({
      startOnLoad: false,
      theme: 'base',
      flowchart: {
        curve: 'basis',
        padding: 16,
        nodeSpacing: 40,
        rankSpacing: 64,
        htmlLabels: true
      },
      themeVariables: isDark ? {
        darkMode: true,
        background: '#191524',
        fontFamily: "-apple-system,BlinkMacSystemFont,'Segoe UI','PingFang SC','Microsoft YaHei',sans-serif",
        fontSize: '13px',
        primaryColor: '#251d3a',
        primaryTextColor: '#F2ECFC',
        primaryBorderColor: '#8C68D0',
        mainBkg: '#251d3a',
        nodeBkg: '#251d3a',
        nodeBorder: '#8C68D0',
        lineColor: '#B68DF8',
        defaultLinkColor: '#B68DF8',
        textColor: '#EAE2FA',
        secondaryColor: '#1E1730',
        tertiaryColor: '#191428',
        clusterBkg: '#1C162B',
        clusterBorder: '#4B3B6B',
        titleColor: '#D8CAF5',
        edgeLabelBackground: '#201933',
        actorBkg: '#251d3a',
        actorBorder: '#8C68D0',
        actorTextColor: '#F2ECFC',
        actorLineColor: '#695294',
        signalColor: '#C4A3FC',
        signalTextColor: '#EAE2FA',
        labelBoxBkgColor: '#251d3a',
        labelBoxBorderColor: '#695294',
        labelTextColor: '#F2ECFC',
        noteBkgColor: '#2C2245',
        noteBorderColor: '#8C68D0',
        noteTextColor: '#F2ECFC',
        doneTaskBkgColor: '#3D2B5E',
        doneTaskBorderColor: '#8B68C7',
        activeTaskBkgColor: '#674397',
        activeTaskBorderColor: '#C795FF',
        taskBkgColor: '#2B1F42',
        taskBorderColor: '#7E5BB8',
        taskTextColor: '#F1ECFF',
        taskTextDarkColor: '#F1ECFF',
        taskTextOutsideColor: '#D8CEF0',
        gridColor: '#3B2F52',
        pie1: '#7E57C2',
        pie2: '#5C6BC0',
        pie3: '#26A69A',
        pie4: '#AB47BC',
        pieTitleTextColor: '#F1ECFF',
        pieSectionTextColor: '#FFFFFF',
        pieLegendTextColor: '#D8CEF0'
      } : {
        darkMode: false,
        background: '#f7f5fc',
        fontFamily: "-apple-system,BlinkMacSystemFont,'Segoe UI','PingFang SC','Microsoft YaHei',sans-serif",
        fontSize: '13px',
        primaryColor: '#FFFFFF',
        primaryTextColor: '#1E1833',
        primaryBorderColor: '#8C63C9',
        mainBkg: '#FFFFFF',
        nodeBkg: '#FFFFFF',
        nodeBorder: '#8C63C9',
        lineColor: '#7546BC',
        defaultLinkColor: '#7546BC',
        textColor: '#272334',
        secondaryColor: '#F5F2FB',
        tertiaryColor: '#EFEAF8',
        clusterBkg: '#F2EEF9',
        clusterBorder: '#C7B6E4',
        titleColor: '#3A285C',
        edgeLabelBackground: '#FFFFFF',
        actorBkg: '#FFFFFF',
        actorBorder: '#8C63C9',
        actorTextColor: '#1E1833',
        actorLineColor: '#9E82CE',
        signalColor: '#7546BC',
        signalTextColor: '#272334',
        noteBkgColor: '#F5F0FC',
        noteBorderColor: '#8C63C9',
        noteTextColor: '#272334',
        doneTaskBkgColor: '#D8CCF0',
        doneTaskBorderColor: '#8255ba',
        activeTaskBkgColor: '#7546bc',
        activeTaskBorderColor: '#572e94',
        taskBkgColor: '#EDE7F8',
        taskBorderColor: '#9B80BC',
        taskTextColor: '#1A1433',
        taskTextDarkColor: '#1A1433',
        pie1: '#7546bc',
        pie2: '#4F6D9A',
        pie3: '#2E8B7D',
        pie4: '#A65E9A'
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
    if (container.classList && container.classList.contains('mermaid--collapsed')) {
      setMermaidCollapsed(container, false);
    }
    if (container.dataset) container.dataset.showSrc = showSrc ? 'true' : 'false';
    src.hidden = !showSrc;
    view.hidden = showSrc;
    setButtonText(toggle, showSrc ? 'diagram_view' : 'diagram_source');
    toggle.setAttribute('aria-expanded', showSrc ? 'true' : 'false');
  }

  function setMermaidCollapsed(container, collapsed) {
    var view = container.querySelector('.mermaid-view');
    var src = container.querySelector('.mermaid-source');
    var btn = container.querySelector('.mermaid-collapse-btn');
    if (!view || !src || !btn) return;
    if (container.classList) container.classList.toggle('mermaid--collapsed', collapsed);
    if (collapsed) {
      view.hidden = true;
      src.hidden = true;
    } else {
      var showSrc = container.dataset && container.dataset.showSrc === 'true';
      src.hidden = !showSrc;
      view.hidden = showSrc;
    }
    setButtonText(btn, collapsed ? 'diagram_expand' : 'diagram_collapse');
    btn.setAttribute('aria-expanded', collapsed ? 'false' : 'true');
  }

  function parseRgbColor(str) {
    if (!str) return null;
    str = String(str).trim();
    var hex = str.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
    if (hex) {
      var h = hex[1];
      if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
      return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
    }
    var rgb = str.match(/^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i);
    if (rgb) return [Number(rgb[1]), Number(rgb[2]), Number(rgb[3])];
    return null;
  }

  function fixMermaidNodeContrast(view) {
    if (!view || !view.querySelectorAll) return;
    view.querySelectorAll('.node').forEach(function (node) {
      var shape = node.querySelector('rect, path, polygon, circle');
      if (!shape) return;
      var fill = (shape.style && shape.style.fill) || shape.getAttribute('fill');
      if ((!fill || fill === 'none') && window.getComputedStyle) {
        try { fill = window.getComputedStyle(shape).fill; } catch (e) {}
      }
      if (!fill || fill === 'none') return;
      var rgb = parseRgbColor(fill);
      if (!rgb) return;
      var lum = 0.299 * rgb[0] + 0.587 * rgb[1] + 0.114 * rgb[2];
      var contrastColor = lum > 155 ? '#1A1433' : (lum < 95 ? '#F4EFFC' : null);
      if (!contrastColor) return;
      node.querySelectorAll('.nodeLabel, span, p, div, text, tspan').forEach(function (el) {
        if (el.style) {
          el.style.color = contrastColor;
          el.style.fill = contrastColor;
        }
      });
    });
  }

  function applyMermaidScale(container, nextScale) {
    var scale = Math.min(2.5, Math.max(0.5, Math.round(nextScale * 100) / 100));
    container.dataset.scale = String(scale);
    var label = container.querySelector('.mermaid-zoom-reset');
    if (label) label.textContent = Math.round(scale * 100) + '%';
    var svg = container.querySelector('.mermaid-view svg');
    if (!svg) return;
    if (scale === 1) {
      svg.style.maxWidth = '100%';
      svg.style.width = '';
      return;
    }
    var baseWidth = Number(svg.dataset.baseWidth || 0);
    if (!baseWidth) {
      var rect = svg.getBoundingClientRect ? svg.getBoundingClientRect() : null;
      baseWidth = (rect && rect.width) || 640;
      svg.dataset.baseWidth = String(baseWidth);
    }
    svg.style.maxWidth = 'none';
    svg.style.width = Math.round(baseWidth * scale) + 'px';
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

    var label = document.createElement('span');
    label.className = 'mermaid-label';
    label.textContent = 'MERMAID';

    var zoomOut = document.createElement('button');
    zoomOut.type = 'button';
    zoomOut.className = 'mermaid-btn mermaid-zoom-out';
    zoomOut.setAttribute('data-i18n-aria-label', 'zoom_out');
    zoomOut.setAttribute('aria-label', getI18n('zoom_out'));
    zoomOut.textContent = '−';
    zoomOut.addEventListener('click', function () {
      var cur = Number(container.dataset.scale || '1');
      applyMermaidScale(container, cur - 0.25);
    });

    var zoomReset = document.createElement('button');
    zoomReset.type = 'button';
    zoomReset.className = 'mermaid-btn mermaid-zoom-reset';
    zoomReset.setAttribute('data-i18n-aria-label', 'zoom_reset');
    zoomReset.setAttribute('aria-label', getI18n('zoom_reset'));
    zoomReset.textContent = '100%';
    zoomReset.addEventListener('click', function () {
      applyMermaidScale(container, 1);
    });

    var zoomIn = document.createElement('button');
    zoomIn.type = 'button';
    zoomIn.className = 'mermaid-btn mermaid-zoom-in';
    zoomIn.setAttribute('data-i18n-aria-label', 'zoom_in');
    zoomIn.setAttribute('aria-label', getI18n('zoom_in'));
    zoomIn.textContent = '+';
    zoomIn.addEventListener('click', function () {
      var cur = Number(container.dataset.scale || '1');
      applyMermaidScale(container, cur + 0.25);
    });

    var zoomGroup = document.createElement('span');
    zoomGroup.className = 'mermaid-zoom-group';
    zoomGroup.appendChild(zoomOut);
    zoomGroup.appendChild(zoomReset);
    zoomGroup.appendChild(zoomIn);

    var zoomFull = document.createElement('button');
    zoomFull.type = 'button';
    zoomFull.className = 'mermaid-btn mermaid-zoom-btn';
    setButtonText(zoomFull, 'diagram_zoom');
    zoomFull.addEventListener('click', function () {
      var svg = view.querySelector('svg');
      if (!svg) return;
      var cloned = svg.cloneNode(true);
      var vb = svg.viewBox && svg.viewBox.baseVal;
      var rect = svg.getBoundingClientRect ? svg.getBoundingClientRect() : null;
      var natW = (vb && vb.width) || (rect && rect.width) || 800;
      var natH = (vb && vb.height) || (rect && rect.height) || 480;
      var maxW = Math.min(window.innerWidth * 0.88, 1320);
      var maxH = window.innerHeight * 0.78;
      var ratio = Math.min(maxW / natW, maxH / natH, 2.2);
      var dispW = Math.max(240, Math.round(natW * ratio));
      var dispH = Math.max(140, Math.round(natH * ratio));
      if (cloned.id) {
        var oldId = cloned.id;
        var newId = oldId + '-lb';
        cloned.id = newId;
        cloned.querySelectorAll('style').forEach(function (st) {
          st.textContent = st.textContent.split('#' + oldId).join('#' + newId);
        });
      }
      cloned.setAttribute('width', String(dispW));
      cloned.setAttribute('height', String(dispH));
      cloned.style.width = dispW + 'px';
      cloned.style.height = dispH + 'px';
      cloned.style.maxWidth = 'none';
      cloned.style.maxHeight = 'none';
      openMediaLightbox(cloned, 'Mermaid');
    });

    var collapse = document.createElement('button');
    collapse.type = 'button';
    collapse.className = 'mermaid-btn mermaid-collapse-btn';
    collapse.setAttribute('aria-expanded', 'true');
    setButtonText(collapse, 'diagram_collapse');
    collapse.addEventListener('click', function () {
      setMermaidCollapsed(container, !container.classList.contains('mermaid--collapsed'));
    });

    var toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'mermaid-btn mermaid-toggle-btn';
    toggle.setAttribute('data-i18n-aria-label', 'diagram_toggle');
    toggle.setAttribute('aria-label', getI18n('diagram_toggle'));
    toggle.setAttribute('aria-expanded', 'false');
    setButtonText(toggle, 'diagram_source');
    toggle.addEventListener('click', function () {
      mermaidShowSource(container, container.dataset.showSrc !== 'true');
    });

    var copy = document.createElement('button');
    copy.type = 'button';
    copy.className = 'mermaid-btn mermaid-copy-btn';
    bindCopyButton(copy, container.dataset.graph || '', 'diagram_copy');

    var bar = document.createElement('div');
    bar.className = 'mermaid-toolbar';
    bar.appendChild(label);
    bar.appendChild(zoomGroup);
    bar.appendChild(zoomFull);
    bar.appendChild(collapse);
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
      container.dataset.renderId = renderId;
      window.mermaid.render(renderId, graph).then(function (result) {
        if (container.dataset.renderId !== renderId) return;
        var view = ensureMermaidScaffold(container);
        view.innerHTML = result.svg;
        if (view.querySelectorAll) {
          view.querySelectorAll('.node rect, .node .basic.label-container, .actor, .note').forEach(function (el) {
            el.setAttribute('rx', '8');
            el.setAttribute('ry', '8');
          });
          view.querySelectorAll('.cluster rect').forEach(function (el) {
            el.setAttribute('rx', '12');
            el.setAttribute('ry', '12');
          });
          view.querySelectorAll('.edgeLabel rect').forEach(function (el) {
            el.setAttribute('rx', '5');
            el.setAttribute('ry', '5');
          });
        }
        fixMermaidNodeContrast(view);
        var savedScale = Number(container.dataset.scale || '1');
        if (savedScale !== 1) applyMermaidScale(container, savedScale);
      }).catch(function (err) {
        ['', 'd'].forEach(function (prefix) {
          var leftover = document.getElementById(prefix + renderId);
          if (leftover && !container.contains(leftover)) leftover.remove();
        });
        if (container.dataset.renderId !== renderId) return;
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
      btn.textContent = t === 'dark' ? '☀' : '◐';
    }
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
    if (btn) btn.addEventListener('click', toggleTheme);
    // 系统明暗变化时（如日落自动切换），未手动选择过的访客随之切换
    if (SYSTEM_LIGHT) {
      var onSystemChange = function () {
        if (hasSavedTheme()) return;
        theme = getSystemTheme();
        syncThemeUI(theme);
        rerenderMermaid();
      };
      if (SYSTEM_LIGHT.addEventListener) SYSTEM_LIGHT.addEventListener('change', onSystemChange);
      else if (SYSTEM_LIGHT.addListener) SYSTEM_LIGHT.addListener(onSystemChange);
    }
  }

  var theme = resolveTheme();

  /* ---------- scroll effects ---------- */
  var raf = 0;
  function onScroll() {
    if (raf) return;
    raf = requestAnimationFrame(function () {
      raf = 0;
      var vh = window.innerHeight;
      var top = window.pageYOffset || document.documentElement.scrollTop || 0;

      var docH = document.documentElement.scrollHeight - vh;
      var bar = document.getElementById("dyl-progress");
      if (bar) {
        bar.style.transform = "scaleX(" + Math.min(1, Math.max(0, top / (docH || 1))) + ")";
      }

      var nav = document.getElementById("dyl-nav");
      if (nav) {
        nav.classList.toggle("scrolled", top > 40);
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

  function applyLang(target) {
    var d = DICT[target];
    if (!d) return;
    var EXCLUDE_SELECTOR = ".article-body, .article-abstract, .article-title";
    var posts = document.querySelector("[data-site-posts]")?.getAttribute("data-site-posts") || "0";
    var tags = document.querySelector("[data-site-tags]")?.getAttribute("data-site-tags") || "0";
    var year = document.querySelector("[data-site-year]")?.getAttribute("data-site-year") || "2020";
    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      if (el.closest(EXCLUDE_SELECTOR) && !el.matches('.code-copy-btn, .mermaid-btn, .media-btn, .media-label')) return;
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
    document.querySelectorAll('[data-i18n-aria-label]').forEach(function (el) {
      if (el.closest(EXCLUDE_SELECTOR) && !el.matches('.code-copy-btn, .mermaid-btn, .media-btn')) return;
      var key = el.getAttribute('data-i18n-aria-label');
      if (d[key] !== undefined) el.setAttribute('aria-label', d[key]);
    });
    document.documentElement.lang = target === "en" ? "en" : "zh-CN";
    if (document.documentElement.removeAttribute) document.documentElement.removeAttribute('data-i18n-pending');
    currentLang = target;
    updateThemeLabel();
    document.querySelectorAll('[data-zh][data-en]').forEach(function (el) {
      el.textContent = el.getAttribute(target === 'en' ? 'data-en' : 'data-zh');
    });

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

  function setButtonText(button, key) {
    button.setAttribute('data-i18n', key);
    button.textContent = getI18n(key);
  }

  function bindCopyButton(button, text, labelKey) {
    var resetTimer = 0;
    var copySeq = 0;
    button.setAttribute('data-i18n-aria-label', labelKey);
    button.setAttribute('aria-label', getI18n(labelKey));
    setButtonText(button, 'copy');
    button.addEventListener('click', function () {
      var seq = ++copySeq;
      clearTimeout(resetTimer);
      copyText(text).then(function () {
        if (seq !== copySeq) return;
        setButtonText(button, 'copy_success');
      }).catch(function () {
        if (seq !== copySeq) return;
        setButtonText(button, 'copy_failed');
      }).finally(function () {
        if (seq !== copySeq) return;
        resetTimer = setTimeout(function () {
          resetTimer = 0;
          setButtonText(button, 'copy');
        }, 1500);
      });
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
    var activeLink = null;
    var activeGroup = null;
    var links = document.querySelectorAll('.toc-item');
    links.forEach(function (link) {
      var isActive = link.getAttribute('href') === '#' + id;
      link.classList.toggle('active', isActive);
      if (isActive) {
        activeLink = link;
        activeGroup = link.getAttribute('data-toc-group');
      }
    });
    if (activeGroup !== null) {
      links.forEach(function (link) {
        if (link.classList.contains('toc-item--sub')) {
          link.classList.toggle('toc-sub-open', link.getAttribute('data-toc-group') === activeGroup);
        }
      });
    }
    if (activeLink) {
      var tocBox = activeLink.closest ? (activeLink.closest('.toc-list') || activeLink.closest('.toc')) : null;
      if (tocBox && tocBox.scrollHeight > tocBox.clientHeight) {
        var targetTop = activeLink.offsetTop - tocBox.clientHeight * 0.35;
        if (Math.abs(tocBox.scrollTop - targetTop) > 24) {
          tocBox.scrollTop = Math.max(0, targetTop);
        }
      }
    }
  }

  function slugifyHeading(text) {
    return String(text || '').toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9\u4e00-\u9fa5-]/g, '');
  }

  function initTocSpy() {
    var tocLinks = document.querySelectorAll('.toc-item');
    var headings = Array.prototype.slice.call(document.querySelectorAll('.article-body h2, .article-body h3'));
    if (!tocLinks.length || !headings.length) return;

    headings.forEach(function (h) {
      if (!h.id) {
        var slug = slugifyHeading(h.textContent);
        if (slug) h.id = slug;
      }
    });

    var spyRaf = 0;
    function updateActive() {
      spyRaf = 0;
      var top = window.pageYOffset || document.documentElement.scrollTop || 0;
      var docH = document.documentElement.scrollHeight;
      var atBottom = top + window.innerHeight >= docH - 24;
      if (atBottom && headings.length) {
        setActiveToc(headings[headings.length - 1].id);
        return;
      }
      var target = top + 128;
      var current = headings[0] ? headings[0].id : '';
      for (var i = 0; i < headings.length; i++) {
        var rectTop = headings[i].getBoundingClientRect().top + top;
        if (rectTop <= target) {
          current = headings[i].id;
        } else {
          break;
        }
      }
      setActiveToc(current);
    }

    function onScrollSpy() {
      if (spyRaf) return;
      spyRaf = requestAnimationFrame(updateActive);
    }

    window.addEventListener('scroll', onScrollSpy, { passive: true });
    window.addEventListener('resize', onScrollSpy, { passive: true });
    updateActive();
  }

  function getI18n(key, fallback) {
    var d = DICT[currentLang];
    if (d && d[key] !== undefined) return d[key];
    return fallback !== undefined ? fallback : key;
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function initTocToggle() {
    var header = document.getElementById('dyl-toc-header');
    var toggle = document.getElementById('dyl-toc-toggle');
    var list = document.getElementById('dyl-toc-list');
    var grid = document.querySelector('.article-grid');
    if (!header || !toggle || !list) return;

    function setExpanded(expanded) {
      toggle.setAttribute('aria-expanded', expanded ? 'true' : 'false');
      list.classList.toggle('collapsed', !expanded);
      if (grid) grid.classList.toggle('toc-collapsed', !expanded);
    }

    if (window.innerWidth <= 960) setExpanded(false);
    header.addEventListener('click', function () {
      var isExpanded = toggle.getAttribute('aria-expanded') === 'true';
      setExpanded(!isExpanded);
    });
  }

  function initSearch() {
    var overlay = document.getElementById('dyl-search-overlay');
    var input = document.getElementById('dyl-search-input');
    var results = document.getElementById('dyl-search-results');
    var trigger = document.getElementById('dyl-search-trigger');
    var lastTrigger = null;
    var closeBtn = document.getElementById('dyl-search-close');
    if (!overlay || !input || !results) return;

    var searchData;
    function loadSearch() {
      if (!searchData) searchData = fetch(window.DYL_SEARCH.url).then(function (response) {
        if (!response.ok) throw new Error('Search index unavailable');
        return response.json();
      }).catch(function (error) { searchData = null; throw error; });
      return searchData;
    }

    function open() {
      ++requestId;
      clearTimeout(debounce);
      lastTrigger = document.activeElement;
      overlay.classList.add('active');
      overlay.setAttribute('aria-hidden', 'false');
      if (document.body && document.body.style) document.body.style.overflow = 'hidden';
      input.value = '';
      results.innerHTML = '<div class="search-empty" data-i18n="search_shortcut">' + escapeHtml(getI18n('search_shortcut')) + '</div>';
      resetFocus();
      if (window.DYL_SEARCH && window.DYL_SEARCH.url) {
        loadSearch().catch(function () {});
      }
      setTimeout(function () { input.focus(); }, 50);
    }

    function close() {
      ++requestId;
      clearTimeout(debounce);
      overlay.classList.remove('active');
      overlay.setAttribute('aria-hidden', 'true');
      if (document.body && document.body.style) document.body.style.overflow = '';
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

    // 字段权重：标题 > 标签/分类 > 小标题 > 正文；所有关键词都需命中（任意字段）
    var FIELDS = [['title', 12], ['tags', 6], ['categories', 5], ['headings', 3], ['summary', 2], ['text', 1]];
    function scorePost(post, terms) {
      var score = 0;
      for (var i = 0; i < terms.length; i++) {
        var best = 0;
        for (var j = 0; j < FIELDS.length; j++) {
          var value = (post[FIELDS[j][0]] || '').toLowerCase();
          if (value.indexOf(terms[i]) !== -1) best = Math.max(best, FIELDS[j][1]);
        }
        if (!best) return 0;
        score += best;
      }
      if ((post.title || '').toLowerCase().indexOf(terms.join(' ')) !== -1) score += 8;
      return score;
    }
    function escapeRegExp(str) { return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
    // 先在原文上按关键词切分，再逐段转义，避免关键词命中 &amp; 之类的实体
    function highlight(str, terms) {
      str = String(str || '');
      if (!terms.length) return escapeHtml(str);
      var re = new RegExp('(' + terms.map(escapeRegExp).join('|') + ')', 'gi');
      return str.split(re).map(function (part, i) {
        return i % 2 ? '<mark>' + escapeHtml(part) + '</mark>' : escapeHtml(part);
      }).join('');
    }
    function snippet(post, terms) {
      var sources = [post.text || '', post.headings || '', post.summary || ''];
      for (var i = 0; i < sources.length; i++) {
        var lower = sources[i].toLowerCase();
        for (var j = 0; j < terms.length; j++) {
          var at = lower.indexOf(terms[j]);
          if (at === -1) continue;
          var start = Math.max(0, at - 30), end = Math.min(sources[i].length, at + 70);
          return (start > 0 ? '…' : '') + sources[i].slice(start, end) + (end < sources[i].length ? '…' : '');
        }
      }
      return post.summary || '';
    }

    function renderHits(hits, terms) {
      if (!hits.length) {
        results.innerHTML = '<div class="search-no-results" data-i18n="search_no_results">' + escapeHtml(getI18n('search_no_results')) + '</div>';
        resetFocus();
        return;
      }
      results.innerHTML = hits.map(function (hit) {
        var meta = [hit.date, hit.categories].concat(hit.tags ? ['#' + hit.tags.split(' ').join(' #')] : []).join(' · ');
        return '<a href="' + escapeHtml(hit.url) + '" class="search-result">' +
          '<div class="search-result-title">' + highlight(hit.title, terms) + '</div>' +
          '<div class="search-result-excerpt">' + highlight(snippet(hit, terms), terms) + '</div>' +
          '<div class="search-result-meta">' + highlight(meta, terms) + '</div></a>';
      }).join('');
      resetFocus();
    }

    var debounce = 0;
    var requestId = 0;
    input.addEventListener('input', function () {
      clearTimeout(debounce);
      var currentRequest = ++requestId;
      var q = input.value.trim().toLowerCase();
      if (!q) {
        results.innerHTML = '<div class="search-empty" data-i18n="search_shortcut">' + escapeHtml(getI18n('search_shortcut')) + '</div>';
        resetFocus();
        return;
      }
      results.innerHTML = '<div class="search-empty" data-i18n="search_loading">' + escapeHtml(getI18n('search_loading')) + '</div>';
      debounce = setTimeout(function () {
        loadSearch().then(function (posts) {
          if (currentRequest !== requestId) return;
          var terms = q.split(/\s+/).filter(Boolean);
          renderHits(posts.map(function (post, i) {
            return { post: post, score: scorePost(post, terms), order: i };
          }).filter(function (r) { return r.score > 0; }).sort(function (a, b) {
            return b.score - a.score || a.order - b.order;
          }).slice(0, 30).map(function (r) { return r.post; }), terms);
        }).catch(function () {
          if (currentRequest !== requestId) return;
          results.innerHTML = '<div class="search-error" data-i18n="search_index_missing">' + escapeHtml(getI18n('search_index_missing')) + '</div>';
        });
      }, 120);
    });

    if (trigger) trigger.addEventListener('click', open);
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) close();
    });
    document.addEventListener('keydown', function (e) {
      if ((e.metaKey || e.ctrlKey) && String(e.key || '').toLowerCase() === 'k') {
        e.preventDefault();
        if (overlay.classList.contains('active')) close();
        else open();
        return;
      }
      if (!overlay.classList.contains('active')) {
        if (e.key === '/' && document.activeElement && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
          e.preventDefault();
          open();
        }
        return;
      }
      if (e.key === 'Tab') {
        var focusable = Array.from(overlay.querySelectorAll('input, button, a[href]'));
        var first = focusable[0], last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
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
      var dateSpan = document.createElement('span');
      dateSpan.className = 'archive-date';
      dateSpan.textContent = post.d;
      var catSpan = document.createElement('span');
      catSpan.className = 'archive-cat';
      if (!post.c) {
        catSpan.setAttribute('data-i18n', 'uncategorized');
        catSpan.textContent = getI18n('uncategorized');
      } else {
        catSpan.setAttribute('data-zh', post.c);
        catSpan.setAttribute('data-en', post.ce || post.c);
        catSpan.textContent = currentLang === 'en' ? (post.ce || post.c) : post.c;
      }
      var titleSpan = document.createElement('span');
      titleSpan.className = 'archive-item-title';
      titleSpan.textContent = post.t;
      var arrow = document.createElement('span');
      arrow.className = 'archive-arrow';
      arrow.textContent = '→';
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
        var haystack = (post.t + ' ' + (post.c || '') + ' ' + (post.ce || '')).toLowerCase();
        return terms.every(function (term) { return haystack.indexOf(term) !== -1; });
      });
      results.textContent = '';
      if (!matched.length) {
        var empty = document.createElement('div');
        empty.className = 'posts-filter-empty';
        empty.setAttribute('data-i18n', 'posts_filter_empty');
        empty.textContent = getI18n('posts_filter_empty', '没有匹配的文章');
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
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && menu.classList.contains('active')) { toggle.click(); toggle.focus(); }
    });
    window.addEventListener('resize', function () {
      if (window.innerWidth > 760 && menu.classList.contains('active')) toggle.click();
    });
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
        '<div class="repo-desc">' + (desc || getI18n('about_repos_no_desc', 'No description provided.')) + '</div>' +
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
    container.innerHTML = '<a class="repo-card repo-card--error" href="https://github.com/DYL521" target="_blank" rel="noopener">' + escapeHtml(message) + ' ↗</a>';
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

    var CACHE_KEY = 'dyl_github_cache_v2';
    var CACHE_TTL = 30 * 60 * 1000;
    var REDUCED_MOTION = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;

    function animateCount(el, target, duration) {
      if (!el) return;
      function setValue(value) {
        el.textContent = value >= 1000 ? (value / 1000).toFixed(1).replace(/\.0$/, '') + 'k' : String(value);
      }
      if (REDUCED_MOTION && REDUCED_MOTION.matches) {
        setValue(target);
        return;
      }
      var start = 0;
      var startTime = null;
      var rafId = null;
      function finish() {
        if (rafId) cancelAnimationFrame(rafId);
        setValue(target);
      }
      function frame() {
        var now = Date.now();
        if (!startTime) startTime = now;
        var progress = Math.min((now - startTime) / duration, 1);
        setValue(Math.floor(progress * (target - start) + start));
        if (progress >= 1) {
          finish();
          return;
        }
        rafId = requestAnimationFrame(frame);
      }
      if (typeof requestAnimationFrame === 'function') {
        rafId = requestAnimationFrame(frame);
      } else {
        setValue(target);
      }
    }

    function applyGitHubData(profile, popularRepos) {
      var reposCountEl = document.getElementById('github-repos-count');
      var followersCountEl = document.getElementById('github-followers-count');
      animateCount(reposCountEl, profile.public_repos || 0, 800);
      animateCount(followersCountEl, profile.followers || 0, 800);
      renderGitHubRepos(popularRepos);
      if (starsEl) {
        var total = popularRepos.reduce(function (sum, r) { return sum + (r.stargazers_count || 0); }, 0);
        animateCount(starsEl, total, 800);
      }
    }

    try {
      var rawCache = sessionStorage.getItem(CACHE_KEY);
      if (rawCache) {
        var cached = JSON.parse(rawCache);
        if (cached && Date.now() - cached.ts < CACHE_TTL && cached.profile && Array.isArray(cached.repos)) {
          applyGitHubData(cached.profile, cached.repos);
          return;
        }
      }
    } catch (e) {}

    var EXCLUDED_REPOS = [
      'DYL521/DYL521'
    ];

    var repoController = new AbortController();
    var repoTimeout = setTimeout(function () { repoController.abort(); }, 10000);
    var userPromise = fetch(USER_API, { signal: repoController.signal, headers: { 'Accept': 'application/vnd.github.v3+json' } }).then(function (res) {
      if (!res.ok) throw new Error('GitHub user API ' + res.status);
      return res.json();
    });

    var reposPromise = fetch(REPOS_API, { signal: repoController.signal, headers: { 'Accept': 'application/vnd.github.v3+json' } }).then(function (res) {
      if (!res.ok) throw new Error('GitHub repos API ' + res.status);
      return res.json();
    });

    var featuredPromise = Promise.allSettled(FEATURED_REPOS.map(function (url) {
      return fetch(url, { signal: repoController.signal, headers: { 'Accept': 'application/vnd.github.v3+json' } }).then(function (res) {
        if (!res.ok) throw new Error('GitHub featured repo API ' + res.status);
        return res.json();
      });
    }));

    Promise.all([userPromise, reposPromise, featuredPromise])
      .then(function (values) {
        clearTimeout(repoTimeout);
        var profile = values[0];
        var repos = values[1];
        if (!Array.isArray(repos)) throw new Error('Unexpected response');
        var extras = values[2]
          .filter(function (r) { return r.status === 'fulfilled' && r.value && r.value.full_name; })
          .map(function (r) { return r.value; });

        var ownRepos = repos.filter(function (r) { return !r.fork; });
        var allRepos = ownRepos.concat(extras);
        var popularRepos = allRepos
          .filter(function (r) { return EXCLUDED_REPOS.indexOf(r.full_name) === -1; })
          .sort(function (a, b) { return (b.stargazers_count || 0) - (a.stargazers_count || 0); })
          .slice(0, 6);

        try {
          sessionStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), profile: profile, repos: popularRepos }));
        } catch (e) {}
        applyGitHubData(profile, popularRepos);
      })
      .catch(function (err) {
        clearTimeout(repoTimeout);
        if (window.console && console.warn) console.warn('GitHub repos load failed:', err);
        renderGitHubError(getI18n('about_repos_error', 'Projects are temporarily unavailable. Visit GitHub instead.'));
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

  function initBackToTop() {
    if (!document.querySelector('.article-page, .archive-page')) return;
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'back-to-top';
    btn.setAttribute('data-i18n-aria-label', 'back_to_top');
    btn.setAttribute('aria-label', getI18n('back_to_top'));
    btn.textContent = '↑';
    document.body.appendChild(btn);

    function toggle() {
      var top = window.pageYOffset || document.documentElement.scrollTop || 0;
      btn.classList.toggle('visible', top > 480);
    }
    btn.addEventListener('click', function () {
      var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
    });
    window.addEventListener('scroll', toggle, { passive: true });
    toggle();
  }

  var activeLightbox = null;

  function openMediaLightbox(node, label) {
    if (activeLightbox && activeLightbox.close) activeLightbox.close();
    var lastFocus = document.activeElement;
    var scale = 1;
    var tx = 0;
    var ty = 0;
    var dragging = false;
    var startX = 0;
    var startY = 0;

    var overlay = document.createElement('div');
    overlay.className = 'lightbox-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', label || getI18n('lightbox_close'));

    var stage = document.createElement('div');
    stage.className = 'lightbox-stage';
    var content = document.createElement('div');
    content.className = 'lightbox-content';
    content.appendChild(node);
    stage.appendChild(content);

    var zoomOutBtn = document.createElement('button');
    zoomOutBtn.type = 'button';
    zoomOutBtn.className = 'lightbox-btn';
    zoomOutBtn.setAttribute('aria-label', getI18n('zoom_out'));
    zoomOutBtn.textContent = '−';

    var zoomResetBtn = document.createElement('button');
    zoomResetBtn.type = 'button';
    zoomResetBtn.className = 'lightbox-btn';
    zoomResetBtn.setAttribute('aria-label', getI18n('zoom_reset'));
    zoomResetBtn.textContent = '100%';

    var zoomInBtn = document.createElement('button');
    zoomInBtn.type = 'button';
    zoomInBtn.className = 'lightbox-btn';
    zoomInBtn.setAttribute('aria-label', getI18n('zoom_in'));
    zoomInBtn.textContent = '+';

    var toolbar = document.createElement('div');
    toolbar.className = 'lightbox-toolbar';
    toolbar.appendChild(zoomOutBtn);
    toolbar.appendChild(zoomResetBtn);
    toolbar.appendChild(zoomInBtn);

    var closeBtn = document.createElement('button');
    closeBtn.type = 'button';
    closeBtn.className = 'lightbox-close';
    closeBtn.setAttribute('aria-label', getI18n('lightbox_close'));
    closeBtn.textContent = '×';

    function applyTransform() {
      content.style.transform = 'translate(' + tx + 'px, ' + ty + 'px) scale(' + scale + ')';
      zoomResetBtn.textContent = Math.round(scale * 100) + '%';
    }

    function setScale(next) {
      scale = Math.min(3.5, Math.max(0.5, Math.round(next * 100) / 100));
      if (scale <= 1) { tx = 0; ty = 0; }
      applyTransform();
    }

    function onKeyDown(e) {
      if (e.key === 'Escape') { e.preventDefault(); close(); }
      else if (e.key === '+' || e.key === '=') { e.preventDefault(); setScale(scale + 0.25); }
      else if (e.key === '-') { e.preventDefault(); setScale(scale - 0.25); }
      else if (e.key === '0') { e.preventDefault(); setScale(1); }
    }

    function onMouseMove(e) {
      if (!dragging) return;
      tx = e.clientX - startX;
      ty = e.clientY - startY;
      applyTransform();
    }

    function onMouseUp() {
      if (!dragging) return;
      dragging = false;
      stage.classList.remove('dragging');
    }

    function close() {
      window.removeEventListener('keydown', onKeyDown, true);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      overlay.remove();
      activeLightbox = null;
      document.body.style.overflow = '';
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    }

    zoomOutBtn.addEventListener('click', function () { setScale(scale - 0.25); });
    zoomResetBtn.addEventListener('click', function () { setScale(1); });
    zoomInBtn.addEventListener('click', function () { setScale(scale + 0.25); });
    closeBtn.addEventListener('click', close);

    stage.addEventListener('wheel', function (e) {
      e.preventDefault();
      setScale(scale + (e.deltaY < 0 ? 0.2 : -0.2));
    }, { passive: false });

    stage.addEventListener('mousedown', function (e) {
      if (e.target === stage && scale <= 1) { close(); return; }
      dragging = true;
      startX = e.clientX - tx;
      startY = e.clientY - ty;
      stage.classList.add('dragging');
    });

    overlay.appendChild(toolbar);
    overlay.appendChild(closeBtn);
    overlay.appendChild(stage);
    document.body.appendChild(overlay);
    document.body.style.overflow = 'hidden';

    window.addEventListener('keydown', onKeyDown, true);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    activeLightbox = { close: close };
    closeBtn.focus();
  }

  function initImageLightbox() {
    var imgs = Array.prototype.slice.call(document.querySelectorAll('.article-body img'));
    if (!imgs.length) return;

    imgs.forEach(function (img) {
      if (img.closest('a') || img.closest('.media-card')) return;
      img.classList.add('zoomable');

      function openImg() {
        var preview = document.createElement('img');
        preview.src = img.currentSrc || img.src;
        preview.alt = img.alt || '';
        openMediaLightbox(preview, img.alt || getI18n('media_image_label'));
      }
      img.addEventListener('click', openImg);

      var fig = img.closest('figure');
      var card = document.createElement('div');
      card.className = 'media-card';

      var toolbar = document.createElement('div');
      toolbar.className = 'media-toolbar';

      var label = document.createElement('span');
      label.className = 'media-label';
      if (img.alt && img.alt.trim()) {
        label.textContent = img.alt.trim();
      } else {
        label.setAttribute('data-i18n', 'media_image_label');
        label.textContent = getI18n('media_image_label');
      }

      var zoomBtn = document.createElement('button');
      zoomBtn.type = 'button';
      zoomBtn.className = 'media-btn media-zoom-btn';
      setButtonText(zoomBtn, 'media_zoom');
      zoomBtn.addEventListener('click', openImg);

      var body = document.createElement('div');
      body.className = 'media-body';

      var collapseBtn = document.createElement('button');
      collapseBtn.type = 'button';
      collapseBtn.className = 'media-btn media-collapse-btn';
      collapseBtn.setAttribute('aria-expanded', 'true');
      setButtonText(collapseBtn, 'media_collapse');
      collapseBtn.addEventListener('click', function () {
        var collapsed = card.classList.toggle('media-card--collapsed');
        body.hidden = collapsed;
        setButtonText(collapseBtn, collapsed ? 'media_expand' : 'media_collapse');
        collapseBtn.setAttribute('aria-expanded', collapsed ? 'false' : 'true');
      });

      toolbar.appendChild(label);
      toolbar.appendChild(zoomBtn);
      toolbar.appendChild(collapseBtn);
      card.appendChild(toolbar);
      card.appendChild(body);

      if (fig && fig.parentNode) {
        fig.parentNode.insertBefore(card, fig);
        body.appendChild(fig);
      } else if (img.parentNode) {
        var parentP = img.parentNode.tagName === 'P' && img.parentNode.childNodes.length === 1 ? img.parentNode : null;
        if (parentP && parentP.parentNode) {
          parentP.parentNode.insertBefore(card, parentP);
          body.appendChild(img);
          parentP.remove();
        } else {
          img.parentNode.insertBefore(card, img);
          body.appendChild(img);
        }
      }
    });
  }

  /* ---------- init ---------- */
  document.addEventListener("DOMContentLoaded", function () {
    syncThemeUI(theme);

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    onScroll();
    bindLang();
    applyLang(lang);
    bindThemeToggle();
    bindMobileNav();
    initPostsFilter();
    initTocSpy();
    initTocToggle();
    initSearch();
    initBackToTop();
    initImageLightbox();

    /* ---------- mermaid diagrams ---------- */
    initMermaidBlocks();
    renderBareMermaidBlocks();
    rerenderMermaid();

    /* ---------- code block terminal headers ---------- */
    document.querySelectorAll('.article-body pre[class*="language-"]').forEach(function (pre) {
      if (pre.previousElementSibling && pre.previousElementSibling.classList.contains('code-header')) return;
      if (pre.querySelector('code.language-mermaid')) return;
      var code = pre.querySelector('code[class*="language-"]');
      if (!code) return;
      var langMatch = code.className.match(/language-(\w+)/);
      var lang = langMatch ? langMatch[1] : '';
      if (!lang || lang === 'mermaid') return;
      var displayLang = (lang === 'undefined' || lang === 'none' || lang === 'plain') ? 'text' : lang;
      var header = document.createElement('div');
      header.className = 'code-header';
      header.innerHTML = '<span class="code-dot"></span><span class="code-dot"></span><span class="code-dot"></span><span class="code-filename">' + escapeHtml(displayLang) + '</span>';
      pre.parentNode.insertBefore(header, pre);
    });

    /* ---------- copy code buttons ---------- */
    document.querySelectorAll('.article-body pre').forEach(function (pre) {
      var prev = pre.previousElementSibling;
      var header = prev && prev.classList.contains('code-header') ? prev : null;
      if (pre.classList.contains('mermaid-source') || pre.querySelector('.code-copy-btn') || (header && header.querySelector('.code-copy-btn'))) return;
      if (pre.querySelector('code.language-mermaid')) return;
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'code-copy-btn';
      var code = pre.querySelector('code');
      bindCopyButton(btn, code ? code.textContent : pre.textContent, 'code_copy');
      if (header) {
        header.appendChild(btn);
      } else {
        pre.style.position = 'relative';
        pre.appendChild(btn);
      }
    });
  });

  scheduleInitGitHubRepos();
})();
