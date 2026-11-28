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
      var shape = node.querySelector('rect, path, polygon, circle, ellipse');
      if (!shape) return;
      var fill = shape.style && shape.style.fill;
      if ((!fill || fill === 'none') && window.getComputedStyle) {
        try { fill = window.getComputedStyle(shape).fill; } catch (e) {}
      }
      if (!fill || fill === 'none') fill = shape.getAttribute('fill');
      if (!fill || fill === 'none') return;
      var rgb = parseRgbColor(fill);
      if (!rgb) return;
      var lum = 0.299 * rgb[0] + 0.587 * rgb[1] + 0.114 * rgb[2];
      var contrastColor = lum > 155 ? '#1A1433' : (lum < 95 ? '#F4EFFC' : null);
      if (!contrastColor) return;
      node.querySelectorAll('.nodeLabel, span, p, div, text, tspan').forEach(function (el) {
        if (el.style) {
          if (typeof el.style.setProperty === 'function') {
            el.style.setProperty('color', contrastColor, 'important');
            el.style.setProperty('fill', contrastColor, 'important');
          } else {
            el.style.color = contrastColor;
            el.style.fill = contrastColor;
          }
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
    function openMermaidFull() {
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
      var prev = container.previousElementSibling;
      for (var hops = 0; prev && hops < 6 && !/^H[2-4]$/.test(prev.tagName || ''); hops++) {
        prev = prev.previousElementSibling;
      }
      var diagLabel = (prev && /^H[2-4]$/.test(prev.tagName || '') && (prev.textContent || '').replace(/[¶✓]+$/, '').trim()) || 'Mermaid';
      openMediaLightbox(cloned, diagLabel);
    }
    zoomFull.addEventListener('click', openMermaidFull);
    if (view.addEventListener) view.addEventListener('dblclick', openMermaidFull);

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

  var mermaidObserver = null;

  function renderSingleMermaid(container) {
    if (!window.mermaid || typeof window.mermaid.render !== 'function') return;
    var graph = container.dataset && container.dataset.graph;
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
      container.dataset.rendered = 'true';
      if (container.classList) container.classList.remove('mermaid--loading');
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
      if (container.classList) container.classList.remove('mermaid--loading');
      mermaidShowSource(container, true);
      if (window.console && console.warn) console.warn('Mermaid render failed:', err);
    });
  }

  function rerenderMermaid(onlyRendered) {
    if (!window.mermaid || typeof window.mermaid.render !== 'function') return;
    var nodes = document.querySelectorAll('.mermaid');
    if (onlyRendered) {
      nodes.forEach(function (container) {
        if (container.dataset && container.dataset.rendered === 'true') renderSingleMermaid(container);
      });
      return;
    }
    if (typeof window.IntersectionObserver === 'function') {
      if (!mermaidObserver) {
        mermaidObserver = new window.IntersectionObserver(function (entries) {
          entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;
            mermaidObserver.unobserve(entry.target);
            renderSingleMermaid(entry.target);
          });
        }, { rootMargin: '420px 0px' });
      }
      nodes.forEach(function (container) {
        if (!container.dataset || !container.dataset.graph || !container.id) return;
        ensureMermaidScaffold(container);
        if (container.dataset.rendered === 'true') {
          renderSingleMermaid(container);
        } else {
          if (container.classList) container.classList.add('mermaid--loading');
          mermaidObserver.observe(container);
        }
      });
      return;
    }
    nodes.forEach(renderSingleMermaid);
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
    var tc = document.getElementById('dyl-theme-color');
    if (tc) tc.setAttribute('content', t === 'light' ? '#f4f5f9' : '#0e0c14');
    var btn = document.getElementById('dyl-theme-toggle');
    if (btn) {
      btn.setAttribute('aria-pressed', t === 'dark' ? 'true' : 'false');
      btn.textContent = t === 'dark' ? '☀' : '◐';
    }
    updateMermaidTheme(t);
    updateThemeLabel();
  }

  function applyThemeState(next) {
    try { localStorage.setItem(THEME_KEY, next); } catch (e) {}
    theme = next;
    syncThemeUI(next);
    rerenderMermaid(true);
  }

  function toggleTheme(event) {
    var current = document.documentElement.getAttribute('data-theme') || 'dark';
    var next = current === 'light' ? 'dark' : 'light';
    var btn = document.getElementById('dyl-theme-toggle');
    if (btn && btn.classList) {
      btn.classList.remove('is-switching');
      void btn.offsetWidth;
      btn.classList.add('is-switching');
      setTimeout(function () { if (btn.classList) btn.classList.remove('is-switching'); }, 420);
    }

    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce || typeof document.startViewTransition !== 'function' || !document.documentElement.style) {
      applyThemeState(next);
      return;
    }

    var x = window.innerWidth ? window.innerWidth - 48 : 0;
    var y = 40;
    if (event && typeof event.clientX === 'number' && (event.clientX || event.clientY)) {
      x = event.clientX;
      y = event.clientY;
    } else if (btn && typeof btn.getBoundingClientRect === 'function') {
      var rect = btn.getBoundingClientRect();
      x = rect.left + rect.width / 2;
      y = rect.top + rect.height / 2;
    }
    var maxX = Math.max(x, (window.innerWidth || 1200) - x);
    var maxY = Math.max(y, (window.innerHeight || 800) - y);
    var radius = Math.ceil(Math.hypot(maxX, maxY));

    var root = document.documentElement;
    root.style.setProperty('--vt-x', Math.round(x) + 'px');
    root.style.setProperty('--vt-y', Math.round(y) + 'px');
    root.style.setProperty('--vt-r', radius + 'px');
    if (root.classList) root.classList.add('theme-transitioning');

    try {
      var vt = document.startViewTransition(function () {
        applyThemeState(next);
      });
      if (vt && vt.finished && typeof vt.finished.then === 'function') {
        vt.finished.then(function () {
          if (root.classList) root.classList.remove('theme-transitioning');
        }, function () {
          if (root.classList) root.classList.remove('theme-transitioning');
        });
      } else {
        setTimeout(function () {
          if (root.classList) root.classList.remove('theme-transitioning');
        }, 600);
      }
    } catch (e) {
      if (root.classList) root.classList.remove('theme-transitioning');
      applyThemeState(next);
    }
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
      var ratio = Math.min(1, Math.max(0, top / (docH || 1)));
      var bar = document.getElementById("dyl-progress");
      if (bar) {
        bar.style.transform = "scaleX(" + ratio + ")";
      }
      var tocPct = document.getElementById("dyl-toc-progress");
      if (tocPct) {
        var pct = Math.round(ratio * 100);
        var totalMins = Number(tocPct.getAttribute("data-read-mins") || 0);
        if (totalMins >= 3 && pct > 0 && pct < 98) {
          var left = Math.max(1, Math.ceil(totalMins * (1 - ratio)));
          tocPct.textContent = pct + "% · ~" + left + "m";
        } else {
          tocPct.textContent = pct + "%";
        }
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
  var I18N_CACHE_PREFIX = 'dyl_i18n_v1:';
  var i18nFullPromise = null;
  (function hydrateCachedI18n() {
    var url = window.DYL_I18N && window.DYL_I18N.url;
    if (!url || typeof sessionStorage === 'undefined') return;
    try {
      var raw = sessionStorage.getItem(I18N_CACHE_PREFIX + url);
      if (raw) {
        var parsed = JSON.parse(raw);
        if (parsed && parsed.zh && parsed.en) DICT = parsed;
      }
    } catch (e) {}
  })();

  function ensureFullI18n() {
    if (DICT.zh && DICT.en && Object.keys(DICT.zh).length > 50) return Promise.resolve(DICT);
    var url = window.DYL_I18N && window.DYL_I18N.url;
    if (!url || typeof fetch !== 'function') return Promise.resolve(DICT);
    if (!i18nFullPromise) {
      i18nFullPromise = fetch(url).then(function (res) {
        if (!res.ok) throw new Error('i18n unavailable');
        return res.json();
      }).then(function (data) {
        if (data && data.zh && data.en) {
          DICT = data;
          try {
            if (typeof sessionStorage !== 'undefined') {
              sessionStorage.setItem(I18N_CACHE_PREFIX + url, JSON.stringify(data));
            }
          } catch (e) {}
        }
        return DICT;
      }).catch(function () {
        i18nFullPromise = null;
        return DICT;
      });
    }
    return i18nFullPromise;
  }

  var currentLang = 'zh';

  var LS_KEY = "dyl_site_lang";
  var lang = "zh";
  try { lang = localStorage.getItem(LS_KEY) || "zh"; } catch (e) {}

  function applyLang(target) {
    var d = DICT[target];
    if (!d) {
      ensureFullI18n().then(function () {
        if (DICT[target]) applyLang(target);
        else if (document.documentElement.removeAttribute) document.documentElement.removeAttribute('data-i18n-pending');
      });
      return;
    }
    var EXCLUDE_SELECTOR = ".article-body, .article-abstract, .article-title";
    var posts = document.querySelector("[data-site-posts]")?.getAttribute("data-site-posts") || "0";
    var tags = document.querySelector("[data-site-tags]")?.getAttribute("data-site-tags") || "0";
    var year = document.querySelector("[data-site-year]")?.getAttribute("data-site-year") || "2020";
    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      if (el.closest(EXCLUDE_SELECTOR) && !el.matches('.code-copy-btn, .mermaid-btn, .media-btn, .media-label, .media-broken-note')) return;
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
      if (el.closest(EXCLUDE_SELECTOR) && !el.matches('.code-copy-btn, .mermaid-btn, .media-btn, .heading-anchor')) return;
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
    if (d.post_series_count) {
      document.querySelectorAll('[data-series-cur][data-series-total]').forEach(function (el) {
        el.textContent = d.post_series_count
          .replace('{cur}', el.getAttribute('data-series-cur'))
          .replace('{total}', el.getAttribute('data-series-total'));
      });
    }

  }

  function bindLang() {
    var btn = document.getElementById("dyl-lang-toggle");
    if (!btn) return;
    btn.addEventListener("click", function () {
      lang = lang === "zh" ? "en" : "zh";
      try { localStorage.setItem(LS_KEY, lang); } catch (e) {}
      if (DICT[lang] && Object.keys(DICT[lang]).length > 50) {
        applyLang(lang);
      } else {
        ensureFullI18n().then(function () { applyLang(lang); });
      }
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
    var TOC_KEY = 'dyl_toc_collapsed';

    function setExpanded(expanded, persist) {
      toggle.setAttribute('aria-expanded', expanded ? 'true' : 'false');
      list.classList.toggle('collapsed', !expanded);
      if (grid) grid.classList.toggle('toc-collapsed', !expanded);
      if (persist && window.innerWidth > 960) {
        try { localStorage.setItem(TOC_KEY, expanded ? '0' : '1'); } catch (e) {}
      }
    }

    if (window.innerWidth <= 960) {
      setExpanded(false, false);
    } else {
      var savedCollapsed = '';
      try { savedCollapsed = localStorage.getItem(TOC_KEY) || ''; } catch (e) {}
      if (savedCollapsed === '1') setExpanded(false, false);
    }
    header.addEventListener('click', function () {
      var isExpanded = toggle.getAttribute('aria-expanded') === 'true';
      setExpanded(!isExpanded, true);
    });
    if (list.querySelectorAll) {
      list.querySelectorAll('.toc-item').forEach(function (link) {
        link.addEventListener('click', function () {
          if (window.innerWidth <= 960) setExpanded(false, false);
        });
      });
    }
    document.addEventListener('keydown', function (e) {
      if (e.key !== '[' || e.metaKey || e.ctrlKey || e.altKey) return;
      var target = e.target;
      if (target && (/^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName) || target.isContentEditable)) return;
      var searchOverlay = document.getElementById('dyl-search-overlay');
      if (searchOverlay && searchOverlay.classList.contains('active')) return;
      if (activeLightbox) return;
      e.preventDefault();
      var isExpanded = toggle.getAttribute('aria-expanded') === 'true';
      setExpanded(!isExpanded, true);
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

    var RECENT_KEY = 'dyl_search_recent_v1';
    var QUICK_LINKS = [
      { key: 'nav_posts', url: '/posts/' },
      { key: 'category', url: '/categories/' },
      { key: 'archive', url: '/archives/' },
      { key: 'about_me', url: '/pages/dyl521/' },
      { key: 'resume_cn', url: '/posts/dyl521-resume/' },
      { key: 'resume_en', url: '/pages/dyl521-en/' }
    ];
    var QUICK_ACTIONS = [
      { key: 'theme_toggle', cmd: 'theme', hint: '☀ / ◐' },
      { key: 'lang_toggle_label', cmd: 'lang', hint: '中 / EN' },
      { key: 'post_copy_link', cmd: 'copy-url', hint: 'URL' },
      { key: 'shortcuts_title', cmd: 'shortcuts', hint: '?' }
    ];

    function runQuickAction(cmd) {
      if (cmd === 'theme') {
        toggleTheme();
        close();
      } else if (cmd === 'lang') {
        var langBtn = document.getElementById('dyl-lang-toggle');
        if (langBtn && langBtn.click) langBtn.click();
        close();
      } else if (cmd === 'copy-url') {
        var url = (window.location && window.location.origin ? window.location.origin + window.location.pathname : '');
        if (url) copyText(url).catch(function () {});
        close();
      } else if (cmd === 'shortcuts') {
        close();
        if (typeof openShortcutsDialog === 'function') openShortcutsDialog();
      }
    }

    function getRecentQueries() {
      try {
        var raw = localStorage.getItem(RECENT_KEY);
        var arr = raw ? JSON.parse(raw) : [];
        return Array.isArray(arr) ? arr.slice(0, 5) : [];
      } catch (e) { return []; }
    }

    function saveRecentQuery(q) {
      q = String(q || '').trim();
      if (q.length < 2) return;
      try {
        var list = getRecentQueries().filter(function (item) { return item !== q; });
        list.unshift(q);
        localStorage.setItem(RECENT_KEY, JSON.stringify(list.slice(0, 5)));
      } catch (e) {}
    }

    function renderIdlePalette() {
      var recent = getRecentQueries();
      var html = '';
      if (recent.length) {
        html += '<div class="search-section">' +
          '<div class="search-section-head"><span data-i18n="search_recent_title">' + escapeHtml(getI18n('search_recent_title')) + '</span>' +
          '<button type="button" class="search-recent-clear" data-clear-recent data-i18n="search_recent_clear">' + escapeHtml(getI18n('search_recent_clear')) + '</button></div>' +
          '<div class="search-recent-list">' + recent.map(function (q) {
            return '<button type="button" class="search-recent-chip" data-recent-query="' + escapeHtml(q) + '">' + escapeHtml(q) + '</button>';
          }).join('') + '</div></div>';
      }
      html += '<div class="search-section">' +
        '<div class="search-section-head"><span data-i18n="search_quick_title">' + escapeHtml(getI18n('search_quick_title')) + '</span></div>' +
        '<div class="search-quick-grid">' +
        QUICK_LINKS.map(function (item) {
          return '<a href="' + escapeHtml(item.url) + '" class="search-result search-quick-item">' +
            '<span class="search-result-title" data-i18n="' + item.key + '">' + escapeHtml(getI18n(item.key)) + '</span>' +
            '<span class="search-quick-path">' + escapeHtml(item.url) + '</span></a>';
        }).join('') + '</div></div>';
      html += '<div class="search-section">' +
        '<div class="search-section-head"><span data-i18n="search_actions_title">' + escapeHtml(getI18n('search_actions_title')) + '</span></div>' +
        '<div class="search-quick-grid">' +
        QUICK_ACTIONS.map(function (item) {
          return '<button type="button" class="search-result search-quick-item" data-quick-cmd="' + escapeHtml(item.cmd) + '">' +
            '<span class="search-result-title" data-i18n="' + item.key + '">' + escapeHtml(getI18n(item.key)) + '</span>' +
            '<span class="search-quick-path">' + escapeHtml(item.hint) + '</span></button>';
        }).join('') + '</div></div>';
      results.innerHTML = html;
      resetFocus();
    }

    function open(initialQuery) {
      ++requestId;
      clearTimeout(debounce);
      lastTrigger = document.activeElement;
      overlay.classList.add('active');
      overlay.setAttribute('aria-hidden', 'false');
      if (document.body && document.body.style) document.body.style.overflow = 'hidden';
      var preset = typeof initialQuery === 'string' ? initialQuery.trim() : '';
      input.value = preset;
      if (window.DYL_SEARCH && window.DYL_SEARCH.url) {
        loadSearch().catch(function () {});
      }
      if (preset) {
        handleSearchInput();
      } else {
        renderIdlePalette();
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

    function renderHits(hits, terms, totalCount) {
      if (!hits.length) {
        results.innerHTML = '<div class="search-no-results" data-i18n="search_no_results">' + escapeHtml(getI18n('search_no_results')) + '</div>';
        resetFocus();
        return;
      }
      var countLabel = getI18n('search_hits_count').replace('{count}', String(totalCount || hits.length));
      var countBar = '<div class="search-hits-bar">' + escapeHtml(countLabel) + '</div>';
      results.innerHTML = countBar + hits.map(function (hit) {
        var meta = [hit.date, hit.categories].concat(hit.tags ? ['#' + hit.tags.split(' ').join(' #')] : []).join(' · ');
        return '<a href="' + escapeHtml(hit.url) + '" class="search-result">' +
          '<div class="search-result-title">' + highlight(hit.title, terms) + '</div>' +
          '<div class="search-result-excerpt">' + highlight(snippet(hit, terms), terms) + '</div>' +
          '<div class="search-result-meta">' + highlight(meta, terms) + '</div></a>';
      }).join('');
      focusedIndex = 0;
      updateFocus();
    }

    function renderHeadingHits(q) {
      var headings = Array.prototype.slice.call(document.querySelectorAll('.article-body h2[id], .article-body h3[id]'));
      var kw = q.slice(1).trim().toLowerCase();
      var terms = kw ? kw.split(/\s+/).filter(Boolean) : [];
      var matched = headings.filter(function (h) {
        var text = (h.textContent || '').replace(/[¶✓]+$/, '').trim();
        if (!text) return false;
        if (!terms.length) return true;
        var lower = text.toLowerCase();
        return terms.every(function (t) { return lower.indexOf(t) !== -1; });
      });
      if (!matched.length) {
        results.innerHTML = '<div class="search-no-results" data-i18n="search_no_results">' + escapeHtml(getI18n('search_no_results')) + '</div>';
        resetFocus();
        return;
      }
      var headBar = '<div class="search-hits-bar">' + escapeHtml(getI18n('search_section_headings')) + ' · ' + matched.length + '</div>';
      results.innerHTML = headBar + matched.map(function (h) {
        var text = (h.textContent || '').replace(/[¶✓]+$/, '').trim();
        var level = String(h.tagName || 'H2').toUpperCase();
        return '<a href="#' + escapeHtml(h.id) + '" class="search-result search-heading-item" data-heading-id="' + escapeHtml(h.id) + '">' +
          '<span class="search-heading-level">' + level + '</span>' +
          '<span class="search-result-title">' + highlight(text, terms) + '</span></a>';
      }).join('');
      focusedIndex = 0;
      updateFocus();
    }

    var debounce = 0;
    var requestId = 0;
    function handleSearchInput() {
      clearTimeout(debounce);
      var currentRequest = ++requestId;
      var q = input.value.trim().toLowerCase();
      if (!q) {
        renderIdlePalette();
        return;
      }
      if (q.charAt(0) === '#') {
        renderHeadingHits(q);
        return;
      }
      results.innerHTML = '<div class="search-empty" data-i18n="search_loading">' + escapeHtml(getI18n('search_loading')) + '</div>';
      debounce = setTimeout(function () {
        loadSearch().then(function (posts) {
          if (currentRequest !== requestId) return;
          var terms = q.split(/\s+/).filter(Boolean);
          var matched = posts.map(function (post, i) {
            return { post: post, score: scorePost(post, terms), order: i };
          }).filter(function (r) { return r.score > 0; }).sort(function (a, b) {
            return b.score - a.score || a.order - b.order;
          });
          var hits = matched.slice(0, 30).map(function (r) { return r.post; });
          if (hits.length) saveRecentQuery(input.value.trim());
          renderHits(hits, terms, matched.length);
        }).catch(function () {
          if (currentRequest !== requestId) return;
          results.innerHTML = '<div class="search-error" data-i18n="search_index_missing">' + escapeHtml(getI18n('search_index_missing')) + '</div>';
        });
      }, 120);
    }
    input.addEventListener('input', handleSearchInput);

    if (results.addEventListener) {
      results.addEventListener('click', function (e) {
        var target = e.target;
        if (!target || !target.closest) return;
        var clearBtn = target.closest('[data-clear-recent]');
        if (clearBtn) {
          try { localStorage.removeItem(RECENT_KEY); } catch (err) {}
          renderIdlePalette();
          return;
        }
        var chip = target.closest('[data-recent-query]');
        if (chip) {
          input.value = chip.getAttribute('data-recent-query') || '';
          input.dispatchEvent(new Event('input'));
          input.focus();
          return;
        }
        var cmdBtn = target.closest('[data-quick-cmd]');
        if (cmdBtn) {
          runQuickAction(cmdBtn.getAttribute('data-quick-cmd'));
          return;
        }
        var headingLink = target.closest('[data-heading-id]');
        if (headingLink) {
          var hid = headingLink.getAttribute('data-heading-id');
          var headingEl = hid ? document.getElementById(hid) : null;
          if (headingEl && headingEl.scrollIntoView) {
            e.preventDefault();
            close();
            var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
            headingEl.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
            if (window.history && window.history.replaceState) {
              try { window.history.replaceState(null, '', '#' + encodeURIComponent(hid)); } catch (err) {}
            }
          } else {
            close();
          }
        }
      });
    }

    if (trigger) trigger.addEventListener('click', function () { open(); });
    if (document.querySelectorAll) {
      document.querySelectorAll('[data-open-search]').forEach(function (el) {
        el.addEventListener('click', function () { open(); });
      });
      document.querySelectorAll('[data-search-query]').forEach(function (el) {
        el.addEventListener('click', function () {
          open(el.getAttribute('data-search-query') || '');
        });
      });
    }
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
        var activeItem = items[focusedIndex];
        var quickCmd = activeItem.getAttribute('data-quick-cmd');
        var headingId = activeItem.getAttribute('data-heading-id');
        if (quickCmd) {
          runQuickAction(quickCmd);
        } else if (headingId) {
          var targetHeading = document.getElementById(headingId);
          close();
          if (targetHeading && targetHeading.scrollIntoView) {
            var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
            targetHeading.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
          }
          if (window.history && window.history.replaceState) {
            try { window.history.replaceState(null, '', '#' + encodeURIComponent(headingId)); } catch (err) {}
          }
        } else {
          window.location.href = activeItem.getAttribute('href');
        }
      }
    });
    if (closeBtn) closeBtn.addEventListener('click', close);
  }

  function initPostsFilter() {
    var input = document.getElementById('dyl-posts-filter');
    var results = document.getElementById('dyl-posts-results');
    if (!input || !results) return;
    var indexEl = document.getElementById('dyl-posts-index');
    var indexUrl = input.getAttribute ? input.getAttribute('data-index-url') : '';
    var postsCache = null;
    var postsPromise = null;
    if (indexEl) {
      try { postsCache = JSON.parse(indexEl.textContent); } catch (e) { postsCache = null; }
    }
    if (!postsCache && !indexUrl) return;

    function loadPostsIndex() {
      if (postsCache) return Promise.resolve(postsCache);
      if (!postsPromise) {
        postsPromise = fetch(indexUrl).then(function (res) {
          if (!res.ok) throw new Error('Posts index unavailable');
          return res.json();
        }).then(function (data) {
          postsCache = Array.isArray(data) ? data : [];
          return postsCache;
        }).catch(function (err) {
          postsPromise = null;
          throw err;
        });
      }
      return postsPromise;
    }

    var list = document.querySelector('.posts-list:not(.posts-filter-results)');
    var pagination = document.querySelector('.pagination');
    var MAX_RESULTS = 100;
    var filterReqId = 0;

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

    var activeCat = '';

    function renderMatches(posts, query, catFilter) {
      var terms = query ? query.split(/\s+/).filter(Boolean) : [];
      var catLower = (catFilter || '').toLowerCase();
      var matched = posts.filter(function (post) {
        if (catLower && String(post.c || '').toLowerCase() !== catLower) return false;
        if (!terms.length) return true;
        var haystack = (post.t + ' ' + (post.c || '') + ' ' + (post.ce || '')).toLowerCase();
        return terms.every(function (term) { return haystack.indexOf(term) !== -1; });
      });
      results.textContent = '';
      var summaryBar = document.createElement('div');
      summaryBar.className = 'posts-filter-summary';
      var countEl = document.createElement('span');
      countEl.textContent = getI18n('search_hits_count').replace('{count}', String(matched.length));
      var resetBtn = document.createElement('button');
      resetBtn.type = 'button';
      resetBtn.className = 'posts-filter-reset';
      setButtonText(resetBtn, 'posts_filter_reset');
      if (resetBtn.addEventListener) {
        resetBtn.addEventListener('click', function () {
          input.value = '';
          activeCat = '';
          runFilter();
          if (input.focus) input.focus();
        });
      }
      summaryBar.appendChild(countEl);
      summaryBar.appendChild(resetBtn);
      results.appendChild(summaryBar);
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
    }

    if (indexUrl) {
      input.addEventListener('focus', function () { loadPostsIndex().catch(function () {}); });
    }

    function runFilter() {
      var req = ++filterReqId;
      var query = input.value.trim().toLowerCase();
      var chips = document.querySelectorAll('#dyl-posts-cats .posts-cat-chip');
      chips.forEach(function (chip) {
        var c = (chip.getAttribute('data-filter-cat') || '').toLowerCase();
        var active = Boolean(activeCat && activeCat.toLowerCase() === c);
        chip.classList.toggle('active', active);
        chip.setAttribute('aria-pressed', active ? 'true' : 'false');
      });
      if (!query && !activeCat) {
        results.hidden = true;
        results.textContent = '';
        if (list) list.hidden = false;
        if (pagination) pagination.hidden = false;
        return;
      }
      if (postsCache) {
        renderMatches(postsCache, query, activeCat);
        return;
      }
      loadPostsIndex().then(function (posts) {
        if (req !== filterReqId) return;
        renderMatches(posts, query, activeCat);
      }).catch(function () {});
    }

    input.addEventListener('input', runFilter);

    var catBox = document.getElementById('dyl-posts-cats');
    if (catBox && catBox.addEventListener) {
      catBox.addEventListener('click', function (e) {
        var chip = e.target && e.target.closest ? e.target.closest('.posts-cat-chip') : null;
        if (!chip) return;
        var cat = chip.getAttribute('data-filter-cat') || '';
        activeCat = activeCat.toLowerCase() === cat.toLowerCase() ? '' : cat;
        runFilter();
      });
    }
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
      var updated = '';
      if (repo.updated_at) {
        var ud = new Date(repo.updated_at);
        if (!isNaN(ud.getTime())) {
          updated = ud.getFullYear() + '-' + String(ud.getMonth() + 1).padStart(2, '0') + '-' + String(ud.getDate()).padStart(2, '0');
        }
      }
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
    var CIRC = 106.81;
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'back-to-top';
    btn.setAttribute('data-i18n-aria-label', 'back_to_top');
    btn.setAttribute('aria-label', getI18n('back_to_top'));
    btn.innerHTML = '<svg class="back-to-top-ring" viewBox="0 0 38 38" aria-hidden="true">' +
      '<circle class="back-to-top-track" cx="19" cy="19" r="17"/>' +
      '<circle class="back-to-top-fill" cx="19" cy="19" r="17" stroke-dasharray="' + CIRC + '" stroke-dashoffset="' + CIRC + '"/>' +
      '</svg><span class="back-to-top-arrow" aria-hidden="true">↑</span>';
    document.body.appendChild(btn);
    var ring = btn.querySelector ? btn.querySelector('.back-to-top-fill') : null;

    function toggle() {
      var top = window.pageYOffset || document.documentElement.scrollTop || 0;
      btn.classList.toggle('visible', top > 480);
      if (ring && ring.style) {
        var total = document.documentElement.scrollHeight - window.innerHeight;
        var ratio = total > 0 ? Math.min(1, Math.max(0, top / total)) : 0;
        ring.style.strokeDashoffset = String(Math.round((CIRC * (1 - ratio)) * 100) / 100);
      }
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

    var nodeTag = node && String(node.tagName || '').toLowerCase();
    var isSvgNode = nodeTag === 'svg';
    var isImgNode = nodeTag === 'img';
    var downloadBtn = null;
    if (isSvgNode || (isImgNode && node.src)) {
      downloadBtn = document.createElement('button');
      downloadBtn.type = 'button';
      downloadBtn.className = 'lightbox-btn lightbox-download-btn';
      downloadBtn.setAttribute('aria-label', getI18n('lightbox_download'));
      downloadBtn.textContent = isSvgNode ? '↓ SVG' : '↓ ' + getI18n('lightbox_download');
      downloadBtn.addEventListener('click', function () {
        var baseName = String(label || 'diagram').replace(/[^\w\u4e00-\u9fa5-]+/g, '-').replace(/^-|-$/g, '').slice(0, 48) || 'diagram';
        var a = document.createElement('a');
        if (isSvgNode) {
          var exportSvg = node.cloneNode ? node.cloneNode(true) : node;
          if (exportSvg.setAttribute) {
            exportSvg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
            exportSvg.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');
          }
          if (document.createElementNS && exportSvg.insertBefore) {
            var bgRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            bgRect.setAttribute('width', '100%');
            bgRect.setAttribute('height', '100%');
            bgRect.setAttribute('fill', document.documentElement.getAttribute('data-theme') === 'light' ? '#f7f5fc' : '#191524');
            exportSvg.insertBefore(bgRect, exportSvg.firstChild || null);
          }
          var serializer = typeof XMLSerializer === 'function' ? new XMLSerializer() : null;
          var svgMarkup = serializer && typeof serializer.serializeToString === 'function'
            ? serializer.serializeToString(exportSvg)
            : (exportSvg.outerHTML || '');
          if (!svgMarkup || typeof Blob !== 'function' || !window.URL || typeof window.URL.createObjectURL !== 'function') return;
          var blob = new Blob(['<?xml version="1.0" encoding="UTF-8"?>\n' + svgMarkup], { type: 'image/svg+xml;charset=utf-8' });
          var blobUrl = window.URL.createObjectURL(blob);
          a.href = blobUrl;
          a.download = baseName + '.svg';
          a.click();
          setTimeout(function () {
            if (window.URL && window.URL.revokeObjectURL) window.URL.revokeObjectURL(blobUrl);
          }, 1000);
        } else {
          a.href = node.src;
          a.download = baseName;
          a.click();
        }
      });
    }

    var toolbar = document.createElement('div');
    toolbar.className = 'lightbox-toolbar';
    toolbar.appendChild(zoomOutBtn);
    toolbar.appendChild(zoomResetBtn);
    toolbar.appendChild(zoomInBtn);
    if (downloadBtn) toolbar.appendChild(downloadBtn);

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
      else if (e.key === 'Tab') {
        var focusable = [zoomOutBtn, zoomResetBtn, zoomInBtn].concat(downloadBtn ? [downloadBtn] : []).concat([closeBtn]);
        var first = focusable[0], last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
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

    var pinchStartDist = 0;
    var pinchStartScale = 1;
    var lastTapTime = 0;

    stage.addEventListener('touchstart', function (e) {
      if (!e.touches) return;
      if (e.touches.length === 2) {
        dragging = false;
        pinchStartDist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        pinchStartScale = scale;
        stage.classList.add('dragging');
      } else if (e.touches.length === 1) {
        var now = Date.now();
        if (now - lastTapTime < 280) {
          setScale(scale > 1.05 ? 1 : 1.8);
          lastTapTime = 0;
          return;
        }
        lastTapTime = now;
        if (scale > 1) {
          dragging = true;
          startX = e.touches[0].clientX - tx;
          startY = e.touches[0].clientY - ty;
          stage.classList.add('dragging');
        }
      }
    }, { passive: true });

    stage.addEventListener('touchmove', function (e) {
      if (!e.touches) return;
      if (e.touches.length === 2 && pinchStartDist > 0) {
        e.preventDefault();
        var dist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        setScale(pinchStartScale * (dist / pinchStartDist));
      } else if (e.touches.length === 1 && dragging) {
        e.preventDefault();
        tx = e.touches[0].clientX - startX;
        ty = e.touches[0].clientY - startY;
        applyTransform();
      }
    }, { passive: false });

    stage.addEventListener('touchend', function (e) {
      if (!e.touches || e.touches.length < 2) pinchStartDist = 0;
      if (!e.touches || e.touches.length === 0) {
        dragging = false;
        stage.classList.remove('dragging');
      }
    }, { passive: true });

    overlay.appendChild(toolbar);
    overlay.appendChild(closeBtn);
    overlay.appendChild(stage);
    if (label && String(label).trim()) {
      var caption = document.createElement('div');
      caption.className = 'lightbox-caption';
      caption.textContent = String(label).trim();
      overlay.appendChild(caption);
    }
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

      function markBroken() {
        if (card.classList.contains('media-card--broken')) return;
        card.classList.add('media-card--broken');
        zoomBtn.hidden = true;
        img.hidden = true;
        var note = document.createElement('div');
        note.className = 'media-broken-note';
        note.setAttribute('data-i18n', 'media_image_broken');
        note.textContent = getI18n('media_image_broken');
        body.appendChild(note);
      }
      img.addEventListener('error', markBroken);
      if (img.complete && img.naturalWidth === 0) markBroken();

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

  function initHeadingAnchors() {
    var body = document.querySelector('.article-body:not(.article-body--resume)');
    if (!body) return;
    body.querySelectorAll('h2, h3').forEach(function (h) {
      if (!h.id || h.querySelector('.heading-anchor')) return;
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'heading-anchor';
      btn.setAttribute('data-i18n-aria-label', 'heading_copy_link');
      btn.setAttribute('aria-label', getI18n('heading_copy_link'));
      btn.textContent = '¶';
      var resetTimer = 0;
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        var url = window.location.origin + window.location.pathname + '#' + encodeURIComponent(h.id);
        if (window.history && window.history.replaceState) {
          try { window.history.replaceState(null, '', '#' + encodeURIComponent(h.id)); } catch (err) {}
        }
        clearTimeout(resetTimer);
        copyText(url).then(function () {
          btn.textContent = '✓';
          btn.classList.add('copied');
          btn.setAttribute('title', getI18n('heading_link_copied'));
          resetTimer = setTimeout(function () {
            btn.textContent = '¶';
            btn.classList.remove('copied');
          }, 1400);
        }).catch(function () {});
      });
      h.appendChild(btn);
    });
  }

  function initReaderFontSize() {
    var FONT_KEY = 'dyl_reader_font';
    var buttons = Array.prototype.slice.call(document.querySelectorAll('[data-font-choice]'));
    if (!buttons.length) return;

    function applyFontPref(size) {
      var valid = (size === 'sm' || size === 'md' || size === 'lg') ? size : 'md';
      document.documentElement.setAttribute('data-font-size', valid);
      try { localStorage.setItem(FONT_KEY, valid); } catch (e) {}
      document.querySelectorAll('[data-font-choice]').forEach(function (btn) {
        var active = btn.getAttribute('data-font-choice') === valid;
        if (btn.classList) btn.classList.toggle('active', active);
        btn.setAttribute('aria-pressed', active ? 'true' : 'false');
      });
    }

    var saved = 'md';
    try {
      var v = localStorage.getItem(FONT_KEY);
      if (v === 'sm' || v === 'md' || v === 'lg') saved = v;
    } catch (e) {}
    applyFontPref(saved);

    document.addEventListener('click', function (e) {
      var btn = e.target && e.target.closest ? e.target.closest('[data-font-choice]') : null;
      if (!btn) return;
      applyFontPref(btn.getAttribute('data-font-choice'));
    });
  }

  function initMobileTocDrawer() {
    var tocList = document.getElementById('dyl-toc-list');
    if (!tocList || !document.body) return;

    var fab = document.createElement('button');
    fab.type = 'button';
    fab.className = 'mobile-toc-fab';
    fab.setAttribute('data-i18n-aria-label', 'toc_open_drawer');
    fab.setAttribute('aria-label', getI18n('toc_open_drawer'));
    fab.setAttribute('aria-expanded', 'false');
    fab.textContent = '☰';

    var backdrop = document.createElement('div');
    backdrop.className = 'toc-drawer-backdrop';
    backdrop.setAttribute('aria-hidden', 'true');

    var drawer = document.createElement('div');
    drawer.className = 'toc-drawer';
    drawer.setAttribute('role', 'dialog');
    drawer.setAttribute('aria-modal', 'true');
    drawer.setAttribute('data-i18n-aria-label', 'post_toc_label');
    drawer.setAttribute('aria-label', getI18n('post_toc_label'));

    var head = document.createElement('div');
    head.className = 'toc-drawer-head';
    var title = document.createElement('span');
    title.className = 'toc-label';
    title.setAttribute('data-i18n', 'post_toc_label');
    title.textContent = getI18n('post_toc_label');
    var closeBtn = document.createElement('button');
    closeBtn.type = 'button';
    closeBtn.className = 'toc-drawer-close';
    closeBtn.setAttribute('data-i18n-aria-label', 'toc_close_drawer');
    closeBtn.setAttribute('aria-label', getI18n('toc_close_drawer'));
    closeBtn.textContent = '×';
    head.appendChild(title);
    head.appendChild(closeBtn);

    var drawerBody = document.createElement('div');
    drawerBody.className = 'toc-drawer-body';

    drawer.appendChild(head);
    var desktopFontBar = document.querySelector('.toc-font-bar');
    if (desktopFontBar && desktopFontBar.cloneNode) {
      drawer.appendChild(desktopFontBar.cloneNode(true));
    }
    drawer.appendChild(drawerBody);
    backdrop.appendChild(drawer);
    document.body.appendChild(fab);
    document.body.appendChild(backdrop);

    function closeDrawer() {
      backdrop.classList.remove('active');
      backdrop.setAttribute('aria-hidden', 'true');
      fab.setAttribute('aria-expanded', 'false');
      if (document.body.style) document.body.style.overflow = '';
    }

    function openDrawer() {
      drawerBody.innerHTML = '';
      var links = tocList.querySelectorAll ? tocList.querySelectorAll('.toc-item') : [];
      links.forEach(function (src) {
        var a = document.createElement('a');
        a.className = src.className;
        a.setAttribute('href', src.getAttribute('href') || '#');
        a.textContent = src.textContent;
        a.addEventListener('click', closeDrawer);
        drawerBody.appendChild(a);
      });
      backdrop.classList.add('active');
      backdrop.setAttribute('aria-hidden', 'false');
      fab.setAttribute('aria-expanded', 'true');
      if (document.body.style) document.body.style.overflow = 'hidden';
      var activeInDrawer = drawerBody.querySelector ? drawerBody.querySelector('.toc-item.active') : null;
      if (activeInDrawer && activeInDrawer.scrollIntoView) {
        activeInDrawer.scrollIntoView({ block: 'center' });
      }
      if (closeBtn.focus) closeBtn.focus();
    }

    fab.addEventListener('click', openDrawer);
    closeBtn.addEventListener('click', closeDrawer);
    backdrop.addEventListener('click', function (e) {
      if (e.target === backdrop) closeDrawer();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && backdrop.classList.contains('active')) closeDrawer();
    });

    function toggleFab() {
      var top = window.pageYOffset || document.documentElement.scrollTop || 0;
      fab.classList.toggle('visible', top > 240);
    }
    window.addEventListener('scroll', toggleFab, { passive: true });
    toggleFab();
  }

  function initPillFilter() {
    var input = document.querySelector('[data-pill-filter]');
    var list = document.querySelector('[data-pill-list]');
    if (!input || !list) return;
    var empty = document.querySelector('[data-pill-empty]');
    input.addEventListener('input', function () {
      var q = input.value.trim().toLowerCase();
      var shown = 0;
      list.querySelectorAll('.tag-pill').forEach(function (pill) {
        var span = pill.querySelector('[data-zh]');
        var haystack = ((pill.textContent || '') + ' ' + (span ? (span.getAttribute('data-zh') || '') + ' ' + (span.getAttribute('data-en') || '') : '')).toLowerCase();
        var ok = !q || haystack.indexOf(q) !== -1;
        pill.hidden = !ok;
        if (ok) shown++;
      });
      if (empty) empty.hidden = shown > 0;
    });
  }

  var openShortcutsDialog = null;

  function initShortcutsModal() {
    var overlay = null;
    function close() {
      if (!overlay) return;
      overlay.remove();
      overlay = null;
      if (document.body && document.body.style) document.body.style.overflow = '';
    }
    function open() {
      if (overlay || !document.body) return;
      overlay = document.createElement('div');
      overlay.className = 'shortcuts-overlay';
      overlay.setAttribute('role', 'dialog');
      overlay.setAttribute('aria-modal', 'true');
      overlay.setAttribute('aria-label', getI18n('shortcuts_title'));
      var rows = [
        ['⌘K / /', getI18n('shortcuts_search')],
        ['⌘K → #', getI18n('search_section_headings')],
        ['[', getI18n('shortcuts_toc')],
        ['+ / - / 0', getI18n('shortcuts_lightbox')],
        ['Esc', getI18n('shortcuts_close')],
        ['?', getI18n('shortcuts_help')]
      ];
      overlay.innerHTML = '<div class="shortcuts-modal">' +
        '<div class="shortcuts-head"><span>' + escapeHtml(getI18n('shortcuts_title')) + '</span><button type="button" class="toc-drawer-close" aria-label="' + escapeHtml(getI18n('search_close')) + '">×</button></div>' +
        '<div class="shortcuts-list">' + rows.map(function (r) {
          return '<div class="shortcut-row"><kbd>' + escapeHtml(r[0]) + '</kbd><span>' + escapeHtml(r[1]) + '</span></div>';
        }).join('') + '</div></div>';
      overlay.addEventListener('click', function (e) {
        if (e.target === overlay || (e.target.closest && e.target.closest('.toc-drawer-close'))) close();
      });
      document.body.appendChild(overlay);
      if (document.body.style) document.body.style.overflow = 'hidden';
      var btn = overlay.querySelector('.toc-drawer-close');
      if (btn && btn.focus) btn.focus();
    }
    openShortcutsDialog = open;
    if (document.querySelectorAll) {
      document.querySelectorAll('[data-open-shortcuts]').forEach(function (el) {
        el.addEventListener('click', open);
      });
    }
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && overlay) { e.preventDefault(); close(); return; }
      if (e.key !== '?' || e.metaKey || e.ctrlKey || e.altKey) return;
      var target = e.target;
      if (target && (/^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName) || target.isContentEditable)) return;
      var searchOverlay = document.getElementById('dyl-search-overlay');
      if ((searchOverlay && searchOverlay.classList.contains('active')) || activeLightbox) return;
      e.preventDefault();
      if (overlay) close();
      else open();
    });
  }

  function initLinkPrefetch() {
    if (!document.head || !document.addEventListener) return;
    var conn = navigator && navigator.connection;
    if (conn && (conn.saveData || /2g/.test(String(conn.effectiveType || '')))) return;
    var prefetched = {};
    var count = 0;

    function maybePrefetch(target) {
      if (count >= 25 || !target || !target.closest) return;
      var a = target.closest('a[href]');
      if (!a || a.target === '_blank' || a.hasAttribute('download')) return;
      var raw = a.getAttribute('href') || '';
      if (!raw || raw[0] === '#' || /^(mailto:|tel:|javascript:)/i.test(raw)) return;
      var url;
      try { url = new URL(a.href || raw, window.location.origin); } catch (e) { return; }
      if (url.origin !== window.location.origin) return;
      if (url.pathname === window.location.pathname && url.search === window.location.search) return;
      if (/\.(xml|json|pdf|zip|png|jpe?g|webp|svg|mp4)$/i.test(url.pathname)) return;
      var key = url.pathname + url.search;
      if (prefetched[key]) return;
      prefetched[key] = true;
      count++;
      var link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = url.href;
      document.head.appendChild(link);
    }

    document.addEventListener('mouseover', function (e) { maybePrefetch(e.target); }, { passive: true });
    document.addEventListener('touchstart', function (e) { maybePrefetch(e.target); }, { passive: true });
  }

  function initTableScrollHints() {
    var wraps = Array.prototype.slice.call(document.querySelectorAll('.article-body .table-wrap'));
    if (!wraps.length) return;
    function sync(wrap) {
      var overflow = wrap.scrollWidth - wrap.clientWidth > 6;
      wrap.classList.toggle('table-wrap--scrollable', overflow);
      var atEnd = !overflow || (wrap.scrollLeft + wrap.clientWidth >= wrap.scrollWidth - 4);
      wrap.classList.toggle('table-wrap--scrolled-end', atEnd);
    }
    wraps.forEach(function (wrap) {
      wrap.addEventListener('scroll', function () { sync(wrap); }, { passive: true });
      sync(wrap);
    });
    window.addEventListener('resize', function () { wraps.forEach(sync); }, { passive: true });
  }

  function initReadingResume() {
    var articleBody = document.querySelector('.article-body:not(.article-body--resume)');
    if (!articleBody || typeof localStorage === 'undefined') return;
    var KEY = 'dyl_read_progress_v1';
    var MAX_AGE = 14 * 24 * 60 * 60 * 1000;
    var path = window.location.pathname;

    function loadMap() {
      try {
        var raw = localStorage.getItem(KEY);
        var obj = raw ? JSON.parse(raw) : {};
        return obj && typeof obj === 'object' ? obj : {};
      } catch (e) { return {}; }
    }

    function saveMap(map) {
      try {
        var entries = Object.keys(map)
          .filter(function (k) { return map[k] && Date.now() - map[k].ts < MAX_AGE; })
          .sort(function (a, b) { return (map[b].ts || 0) - (map[a].ts || 0); })
          .slice(0, 25);
        var pruned = {};
        entries.forEach(function (k) { pruned[k] = map[k]; });
        localStorage.setItem(KEY, JSON.stringify(pruned));
      } catch (e) {}
    }

    var toast = null;
    function dismissToast() {
      if (toast) {
        toast.remove();
        toast = null;
      }
    }

    var saved = loadMap()[path];
    var topNow = window.pageYOffset || document.documentElement.scrollTop || 0;
    if (saved && Date.now() - saved.ts < MAX_AGE && saved.pct >= 12 && saved.pct <= 92 && !window.location.hash && topNow < 120) {
      toast = document.createElement('div');
      toast.className = 'reading-resume-toast';
      toast.setAttribute('role', 'status');

      var text = document.createElement('span');
      text.className = 'reading-resume-text';
      text.textContent = getI18n('reading_resume_label').replace('{pct}', String(saved.pct));

      var jumpBtn = document.createElement('button');
      jumpBtn.type = 'button';
      jumpBtn.className = 'reading-resume-jump';
      setButtonText(jumpBtn, 'reading_resume_jump');
      jumpBtn.addEventListener('click', function () {
        var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        window.scrollTo({ top: saved.y, behavior: reduce ? 'auto' : 'smooth' });
        dismissToast();
      });

      var closeBtn = document.createElement('button');
      closeBtn.type = 'button';
      closeBtn.className = 'reading-resume-close';
      closeBtn.setAttribute('data-i18n-aria-label', 'reading_resume_close');
      closeBtn.setAttribute('aria-label', getI18n('reading_resume_close'));
      closeBtn.textContent = '×';
      closeBtn.addEventListener('click', dismissToast);

      toast.appendChild(text);
      toast.appendChild(jumpBtn);
      toast.appendChild(closeBtn);
      document.body.appendChild(toast);
    }

    var saveTimer = 0;
    window.addEventListener('scroll', function () {
      var y = window.pageYOffset || document.documentElement.scrollTop || 0;
      if (toast && y > 260) dismissToast();
      clearTimeout(saveTimer);
      saveTimer = setTimeout(function () {
        var total = document.documentElement.scrollHeight - window.innerHeight;
        if (total < window.innerHeight * 1.2) return;
        var pct = Math.min(100, Math.max(0, Math.round((y / total) * 100)));
        var map = loadMap();
        if (pct < 12 || pct > 92) {
          delete map[path];
        } else {
          map[path] = { y: Math.round(y), pct: pct, ts: Date.now() };
        }
        saveMap(map);
      }, 450);
    }, { passive: true });
  }

  function initArticleShare() {
    var btn = document.getElementById('dyl-share-link');
    if (!btn) return;
    var timer = 0;
    btn.addEventListener('click', function () {
      var url = window.location.origin + window.location.pathname;
      clearTimeout(timer);
      copyText(url).then(function () {
        btn.classList.add('copied');
        setButtonText(btn, 'post_link_copied');
        timer = setTimeout(function () {
          btn.classList.remove('copied');
          setButtonText(btn, 'post_copy_link');
        }, 1500);
      }).catch(function () {});
    });
  }

  function initHeroArt() {
    var art = document.querySelector('.hero-art');
    if (!art) return;
    var coords = art.querySelector('.hero-coords');
    var defaultCoords = coords ? coords.textContent : 'NODE · ∞';
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var frame = 0;
    var lastX = 0;
    var lastY = 0;
    var pulseTimer = 0;

    function applyOffset(nx, ny) {
      art.style.setProperty('--hero-px', (nx * 9).toFixed(2) + 'px');
      art.style.setProperty('--hero-py', (ny * 7).toFixed(2) + 'px');
      art.style.setProperty('--hero-rot', (nx * 4.5).toFixed(2) + 'deg');
    }

    if (!reduce) {
      art.addEventListener('pointermove', function (e) {
        if (e.pointerType === 'touch') return;
        lastX = e.clientX;
        lastY = e.clientY;
        if (frame) return;
        frame = requestAnimationFrame(function () {
          frame = 0;
          var rect = art.getBoundingClientRect();
          if (!rect.width || !rect.height) return;
          var rx = Math.max(0, Math.min(1, (lastX - rect.left) / rect.width));
          var ry = Math.max(0, Math.min(1, (lastY - rect.top) / rect.height));
          applyOffset(rx * 2 - 1, ry * 2 - 1);
          if (coords) {
            var sx = String(Math.round(rx * 420)).padStart(3, '0');
            var sy = String(Math.round(ry * 360)).padStart(3, '0');
            coords.textContent = 'X:' + sx + ' Y:' + sy;
          }
        });
      }, { passive: true });

      art.addEventListener('pointerleave', function () {
        if (frame) { cancelAnimationFrame(frame); frame = 0; }
        applyOffset(0, 0);
        if (coords) coords.textContent = defaultCoords;
      });

      art.addEventListener('click', function () {
        if (!art.classList) return;
        art.classList.remove('is-pulsing');
        void art.offsetWidth;
        art.classList.add('is-pulsing');
        clearTimeout(pulseTimer);
        pulseTimer = setTimeout(function () {
          art.classList.remove('is-pulsing');
        }, 1250);
      });
    }
  }

  function initCardSpotlight() {
    if (window.matchMedia) {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      if (window.matchMedia('(hover: none)').matches) return;
    }
    var SELECTOR = '.story-card, .now-card, .topic-item, .related-card, .nav-card:not(.empty), .footprint-panel, .repo-card, .terminal-window';
    var frame = 0;
    var activeCard = null;
    var px = 0;
    var py = 0;

    document.addEventListener('pointermove', function (e) {
      if (e.pointerType === 'touch') return;
      var target = e.target && typeof e.target.closest === 'function' ? e.target.closest(SELECTOR) : null;
      if (!target) return;
      activeCard = target;
      px = e.clientX;
      py = e.clientY;
      if (frame) return;
      frame = requestAnimationFrame(function () {
        frame = 0;
        if (!activeCard || !activeCard.style || typeof activeCard.getBoundingClientRect !== 'function') return;
        var rect = activeCard.getBoundingClientRect();
        activeCard.style.setProperty('--spot-x', Math.round(px - rect.left) + 'px');
        activeCard.style.setProperty('--spot-y', Math.round(py - rect.top) + 'px');
      });
    }, { passive: true });
  }

  function initScrollReveal() {
    if (typeof window.IntersectionObserver !== 'function') return;
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    var vh = window.innerHeight || 800;
    var nodes = Array.prototype.slice.call(document.querySelectorAll(
      '.story-card, .note-row, .now-card, .topic-item, .footprint-stat, .footprint-panel, .about-hero-side, .related-card'
    ));
    var toReveal = [];
    nodes.forEach(function (el, idx) {
      if (typeof el.getBoundingClientRect !== 'function') return;
      if (el.getBoundingClientRect().top > vh * 0.92) {
        el.classList.add('reveal-ready');
        el.style.setProperty('--reveal-delay', ((idx % 6) * 45) + 'ms');
        toReveal.push(el);
      }
    });

    if (toReveal.length) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-revealed');
          io.unobserve(entry.target);
        });
      }, { threshold: 0.08, rootMargin: '0px 0px -24px 0px' });
      toReveal.forEach(function (el) { io.observe(el); });
    }

    var fp = document.querySelector('.about-footprint');
    if (fp && typeof fp.getBoundingClientRect === 'function') {
      if (fp.getBoundingClientRect().top > vh * 0.88) {
        fp.classList.add('bars-ready');
        var fpIo = new IntersectionObserver(function (entries) {
          entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;
            fp.classList.add('is-bars-visible');
            fpIo.unobserve(fp);
          });
        }, { threshold: 0.15 });
        fpIo.observe(fp);
      }
    }
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
    initHeroArt();
    initCardSpotlight();
    initScrollReveal();
    initPostsFilter();
    initPillFilter();
    initShortcutsModal();
    initLinkPrefetch();
    initTocSpy();
    initTocToggle();
    initReaderFontSize();
    initMobileTocDrawer();
    initHeadingAnchors();
    initArticleShare();
    initReadingResume();
    initTableScrollHints();
    initSearch();
    initBackToTop();
    initImageLightbox();

    /* ---------- mermaid diagrams ---------- */
    initMermaidBlocks();
    renderBareMermaidBlocks();
    rerenderMermaid();
    window.addEventListener('beforeprint', function () {
      document.querySelectorAll('.mermaid').forEach(function (container) {
        if (container.dataset && container.dataset.rendered !== 'true') {
          if (mermaidObserver) mermaidObserver.unobserve(container);
          renderSingleMermaid(container);
        }
      });
    });

    /* ---------- code block terminal headers ---------- */
    document.querySelectorAll('.article-body pre').forEach(function (pre) {
      if (pre.classList.contains('mermaid-source')) return;
      if (pre.previousElementSibling && pre.previousElementSibling.classList.contains('code-header')) return;
      if (pre.querySelector('code.language-mermaid')) return;
      var code = pre.querySelector('code');
      if (!code) return;
      var langMatch = (code.className || '').match(/language-(\w+)/);
      var lang = langMatch ? langMatch[1] : '';
      if (lang === 'mermaid') return;
      var displayLang = (!lang || lang === 'undefined' || lang === 'none' || lang === 'plain') ? 'text' : lang;
      var rawText = (code.textContent || '').replace(/\n$/, '');
      var lineCount = rawText ? rawText.split('\n').length : 0;
      var header = document.createElement('div');
      header.className = 'code-header';
      header.innerHTML = '<span class="code-dot"></span><span class="code-dot"></span><span class="code-dot"></span><span class="code-filename">' + escapeHtml(displayLang) + '</span>' + (lineCount > 1 ? '<span class="code-lines">' + lineCount + 'L</span>' : '');
      pre.dataset.lines = String(lineCount);
      pre.parentNode.insertBefore(header, pre);
    });

    /* ---------- copy, wrap & collapse code buttons ---------- */
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
        var actions = document.createElement('span');
        actions.className = 'code-header-actions';
        var lineCount = Number(pre.dataset.lines || 0);
        if (lineCount >= 20) {
          var foldBtn = document.createElement('button');
          foldBtn.type = 'button';
          foldBtn.className = 'code-copy-btn code-fold-btn';
          foldBtn.setAttribute('aria-expanded', 'true');
          setButtonText(foldBtn, 'code_collapse');
          foldBtn.addEventListener('click', function () {
            var collapsed = pre.classList.toggle('code-collapsed');
            header.classList.toggle('code-header--collapsed', collapsed);
            foldBtn.setAttribute('aria-expanded', collapsed ? 'false' : 'true');
            setButtonText(foldBtn, collapsed ? 'code_expand' : 'code_collapse');
          });
          actions.appendChild(foldBtn);
        }
        var wrapBtn = document.createElement('button');
        wrapBtn.type = 'button';
        wrapBtn.className = 'code-copy-btn code-wrap-btn';
        wrapBtn.setAttribute('data-i18n-aria-label', 'code_wrap_toggle');
        wrapBtn.setAttribute('aria-label', getI18n('code_wrap_toggle'));
        wrapBtn.setAttribute('aria-pressed', 'false');
        setButtonText(wrapBtn, 'code_wrap');
        wrapBtn.addEventListener('click', function () {
          var wrapped = pre.classList.toggle('code-wrap');
          wrapBtn.setAttribute('aria-pressed', wrapped ? 'true' : 'false');
          setButtonText(wrapBtn, wrapped ? 'code_nowrap' : 'code_wrap');
        });
        actions.appendChild(wrapBtn);
        actions.appendChild(btn);
        header.appendChild(actions);
      } else {
        pre.style.position = 'relative';
        pre.appendChild(btn);
      }
    });
  });

  scheduleInitGitHubRepos();
})();
