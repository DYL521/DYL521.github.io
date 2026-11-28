<?xml version="1.0" encoding="utf-8"?>
<xsl:stylesheet version="1.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:atom="http://www.w3.org/2005/Atom">
  <xsl:output method="html" version="1.0" encoding="UTF-8" indent="yes"/>

  <xsl:template match="/">
    <html lang="zh-CN" data-theme="dark">
      <head>
        <meta charset="utf-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
        <title><xsl:value-of select="/atom:feed/atom:title"/> · RSS / Atom Feed</title>
        <style>
          :root {
            color-scheme: light;
            --bg: #f4f5f9;
            --bg-2: #f0eff6;
            --surface: #ffffff;
            --surface-hover: #f7f5fc;
            --text: #272334;
            --text-2: #4b445e;
            --text-3: #68607d;
            --heading: #141022;
            --accent: #7546bc;
            --accent-2: #6337a4;
            --accent-soft: rgba(117, 70, 188, .1);
            --border: #e4e2ee;
            --border-hover: #a78bc9;
            --shadow: 0 2px 10px rgba(20, 16, 34, .04), 0 12px 30px -14px rgba(20, 16, 34, .08);
            --font-sans: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif;
            --font-mono: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
          }
          [data-theme="dark"] {
            color-scheme: dark;
            --bg: #0e0c14;
            --bg-2: #191524;
            --surface: #15121e;
            --surface-hover: #211b2e;
            --text: #d7d0e6;
            --text-2: #a89ec0;
            --text-3: #7f7499;
            --heading: #f5f2fc;
            --accent: #bd95f9;
            --accent-2: #d4b8ff;
            --accent-soft: rgba(189, 149, 249, .14);
            --border: #2a233a;
            --border-hover: #6d529e;
            --shadow: 0 2px 12px rgba(0, 0, 0, .28), 0 16px 36px -16px rgba(0, 0, 0, .45);
          }
          *, *::before, *::after { box-sizing: border-box; }
          body {
            margin: 0;
            background: var(--bg);
            color: var(--text);
            font: 15px/1.75 var(--font-sans);
            -webkit-font-smoothing: antialiased;
          }
          a { color: inherit; text-decoration: none; }
          button, input { font: inherit; }
          button { cursor: pointer; }
          .topbar {
            position: sticky;
            top: 0;
            z-index: 20;
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            background: color-mix(in srgb, var(--bg) 82%, transparent);
            border-bottom: 1px solid var(--border);
          }
          .topbar-inner {
            max-width: 920px;
            margin: 0 auto;
            padding: 14px 24px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 12px;
          }
          .brand {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            font-weight: 700;
            font-size: 18px;
            color: var(--heading);
            letter-spacing: -.3px;
          }
          .brand-mark { color: var(--accent); font-size: 20px; }
          .brand-dot { color: var(--accent); margin-left: -4px; }
          .topbar-actions {
            display: inline-flex;
            align-items: center;
            gap: 8px;
          }
          .pill-btn {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            padding: 6px 12px;
            border-radius: 999px;
            border: 1px solid var(--border);
            background: var(--surface);
            color: var(--text-2);
            font: 12px var(--font-mono);
            transition: border-color .15s, color .15s, background .15s;
          }
          .pill-btn:hover {
            border-color: var(--accent);
            color: var(--accent);
            background: var(--surface-hover);
          }
          .wrap {
            max-width: 920px;
            margin: 0 auto;
            padding: 36px 24px 72px;
          }
          .hero {
            background: var(--surface);
            border: 1px solid var(--border);
            border-radius: 16px;
            padding: 28px 30px;
            box-shadow: var(--shadow);
            margin-bottom: 28px;
          }
          .badge {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            padding: 3px 11px;
            border-radius: 999px;
            background: var(--accent-soft);
            color: var(--accent);
            font: 600 11px var(--font-mono);
            letter-spacing: .6px;
            margin-bottom: 14px;
          }
          .hero h1 {
            margin: 0 0 8px;
            font-size: clamp(24px, 3vw, 32px);
            line-height: 1.25;
            color: var(--heading);
            letter-spacing: -.02em;
          }
          .hero-sub {
            margin: 0 0 18px;
            color: var(--text-2);
            font-size: 14.5px;
          }
          .feed-box {
            display: flex;
            flex-wrap: wrap;
            align-items: center;
            gap: 10px;
            padding: 10px 12px 10px 16px;
            border-radius: 12px;
            background: var(--bg-2);
            border: 1px solid var(--border);
            margin-bottom: 14px;
          }
          .feed-url {
            flex: 1 1 240px;
            font: 13px var(--font-mono);
            color: var(--heading);
            overflow-wrap: anywhere;
            user-select: all;
          }
          .copy-btn {
            border: 0;
            border-radius: 8px;
            padding: 7px 14px;
            background: var(--accent);
            color: #fff;
            font: 600 12px var(--font-mono);
            transition: opacity .15s;
          }
          [data-theme="dark"] .copy-btn { color: #120d1d; }
          .copy-btn:hover { opacity: .9; }
          .readers {
            display: flex;
            flex-wrap: wrap;
            align-items: center;
            gap: 8px;
            margin-bottom: 16px;
          }
          .readers-label {
            font: 11.5px var(--font-mono);
            color: var(--text-3);
            margin-right: 4px;
          }
          .reader-chip {
            display: inline-flex;
            align-items: center;
            gap: 4px;
            padding: 4px 11px;
            border-radius: 999px;
            border: 1px solid var(--border);
            background: var(--bg-2);
            color: var(--text-2);
            font: 12px var(--font-mono);
            transition: border-color .15s, color .15s, background .15s;
          }
          .reader-chip:hover {
            border-color: var(--accent);
            color: var(--accent);
            background: var(--surface-hover);
          }
          .hero-meta {
            display: flex;
            flex-wrap: wrap;
            gap: 10px 18px;
            font: 12px var(--font-mono);
            color: var(--text-3);
          }
          .section-head {
            display: flex;
            flex-wrap: wrap;
            align-items: center;
            justify-content: space-between;
            gap: 12px;
            margin: 0 0 16px;
            padding: 0 4px;
          }
          .section-head h2 {
            margin: 0;
            font-size: 16px;
            font-weight: 600;
            color: var(--heading);
          }
          .feed-filter {
            width: min(280px, 100%);
            padding: 7px 13px;
            border-radius: 999px;
            border: 1px solid var(--border);
            background: var(--surface);
            color: var(--text);
            font: 12.5px var(--font-sans);
            outline: none;
            transition: border-color .15s;
          }
          .feed-filter:focus { border-color: var(--accent); }
          .entries {
            display: flex;
            flex-direction: column;
            gap: 14px;
          }
          .entry {
            display: block;
            background: var(--surface);
            border: 1px solid var(--border);
            border-radius: 14px;
            padding: 20px 24px;
            box-shadow: var(--shadow);
            transition: border-color .16s, transform .16s, background .16s;
          }
          .entry[hidden] { display: none; }
          .entry:hover {
            border-color: var(--border-hover);
            background: var(--surface-hover);
            transform: translateY(-2px);
          }
          .entry-meta {
            display: flex;
            flex-wrap: wrap;
            align-items: center;
            gap: 8px;
            margin-bottom: 8px;
            font: 11.5px var(--font-mono);
            color: var(--text-3);
          }
          .entry-cat {
            padding: 1px 8px;
            border-radius: 999px;
            background: var(--bg-2);
            border: 1px solid var(--border);
            color: var(--text-2);
          }
          .entry-title {
            margin: 0 0 8px;
            font-size: 17.5px;
            font-weight: 600;
            line-height: 1.4;
            color: var(--heading);
            text-wrap: balance;
            transition: color .15s;
          }
          .entry:hover .entry-title { color: var(--accent); }
          .entry-summary {
            margin: 0 0 12px;
            font-size: 13.8px;
            line-height: 1.72;
            color: var(--text-2);
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }
          .entry-read {
            font: 12px var(--font-mono);
            color: var(--accent);
          }
          .empty-state {
            text-align: center;
            padding: 36px 20px;
            border-radius: 14px;
            border: 1px dashed var(--border);
            color: var(--text-3);
            font-size: 13.5px;
          }
          .empty-state[hidden] { display: none; }
          .foot {
            margin-top: 38px;
            padding-top: 20px;
            border-top: 1px solid var(--border);
            display: flex;
            flex-wrap: wrap;
            justify-content: space-between;
            gap: 10px;
            font: 12px var(--font-mono);
            color: var(--text-3);
          }
          .foot-links {
            display: inline-flex;
            gap: 16px;
          }
          .foot a:hover { color: var(--accent); }
          @media (max-width: 640px) {
            .topbar-inner { padding: 12px 16px; }
            .wrap { padding: 22px 16px 52px; }
            .hero { padding: 20px 18px; }
            .entry { padding: 16px 18px; }
          }
        </style>
        <script>
          (function () {
            var t;
            try { t = localStorage.getItem('dyl_site_theme'); } catch (e) {}
            if (t !== 'dark' &amp;&amp; t !== 'light') {
              t = (window.matchMedia &amp;&amp; window.matchMedia('(prefers-color-scheme: light)').matches) ? 'light' : 'dark';
            }
            document.documentElement.setAttribute('data-theme', t);
          })();
        </script>
      </head>
      <body>
        <header class="topbar">
          <div class="topbar-inner">
            <a class="brand" href="/">
              <span class="brand-mark" aria-hidden="true">✳</span>
              <span><xsl:value-of select="/atom:feed/atom:title"/></span>
              <span class="brand-dot">.</span>
            </a>
            <div class="topbar-actions">
              <button type="button" class="pill-btn" id="feed-lang-btn">中 / EN</button>
              <button type="button" class="pill-btn" id="feed-theme-btn" aria-label="切换明暗主题">☀</button>
              <a class="pill-btn" href="/" data-zh="← 返回博客" data-en="← Back to blog">← 返回博客</a>
            </div>
          </div>
        </header>

        <main class="wrap">
          <section class="hero">
            <div class="badge">● ATOM 1.0 · RSS FEED</div>
            <h1>
              <xsl:value-of select="/atom:feed/atom:title"/>
              <xsl:text> </xsl:text>
              <span data-zh="订阅源" data-en="Feed">订阅源</span>
            </h1>
            <p class="hero-sub">
              <xsl:value-of select="/atom:feed/atom:subtitle"/>
              <span data-zh=" — 这是一个标准 Atom 订阅源，复制下方地址或点击阅读器图标即可持续接收博客更新。" data-en=" — Standard Atom 1.0 feed. Copy the URL below or pick a reader to follow new articles."> — 这是一个标准 Atom 订阅源，复制下方地址或点击阅读器图标即可持续接收博客更新。</span>
            </p>
            <div class="feed-box">
              <code class="feed-url" id="feed-url-text">
                <xsl:value-of select="/atom:feed/atom:link[@rel='self']/@href"/>
              </code>
              <button type="button" class="copy-btn" id="feed-copy-btn" data-zh="复制订阅地址" data-en="Copy Feed URL">复制订阅地址</button>
            </div>
            <div class="readers">
              <span class="readers-label" data-zh="快捷订阅：" data-en="Quick subscribe:">快捷订阅：</span>
              <a class="reader-chip" id="sub-follow" target="_blank" rel="noopener">Follow ↗</a>
              <a class="reader-chip" id="sub-feedly" target="_blank" rel="noopener">Feedly ↗</a>
              <a class="reader-chip" id="sub-inoreader" target="_blank" rel="noopener">Inoreader ↗</a>
            </div>
            <div class="hero-meta">
              <span>
                <span data-zh="收录最新 " data-en="Latest ">收录最新 </span>
                <xsl:value-of select="count(/atom:feed/atom:entry)"/>
                <span data-zh=" 篇文章" data-en=" entries"> 篇文章</span>
              </span>
              <span>
                <xsl:text>· </xsl:text>
                <span data-zh="最近更新 " data-en="Updated ">最近更新 </span>
                <xsl:value-of select="substring(/atom:feed/atom:updated, 1, 10)"/>
              </span>
              <span data-zh="· 摘要直出，点击阅读完整排版与交互图表" data-en="· Clean summaries; open articles for full diagrams &amp; code">· 摘要直出，点击阅读完整排版与交互图表</span>
            </div>
          </section>

          <div class="section-head">
            <h2 data-zh="最新文章" data-en="Latest Articles">最新文章</h2>
            <input type="search" class="feed-filter" id="feed-filter" placeholder="按标题、标签筛选订阅内容…" data-zh-ph="按标题、标签筛选订阅内容…" data-en-ph="Filter feed entries…" autocomplete="off"/>
          </div>

          <div class="entries" id="feed-entries">
            <xsl:for-each select="/atom:feed/atom:entry">
              <a class="entry">
                <xsl:attribute name="href">
                  <xsl:value-of select="atom:link/@href"/>
                </xsl:attribute>
                <div class="entry-meta">
                  <time><xsl:value-of select="substring(atom:published, 1, 10)"/></time>
                  <xsl:for-each select="atom:category[not(@term = preceding-sibling::atom:category/@term)][position() &lt;= 4]">
                    <span class="entry-cat"><xsl:value-of select="@term"/></span>
                  </xsl:for-each>
                </div>
                <h3 class="entry-title"><xsl:value-of select="atom:title"/></h3>
                <xsl:if test="normalize-space(atom:summary) != ''">
                  <p class="entry-summary"><xsl:value-of select="atom:summary"/></p>
                </xsl:if>
                <span class="entry-read" data-zh="阅读全文 ↗" data-en="Read article ↗">阅读全文 ↗</span>
              </a>
            </xsl:for-each>
          </div>
          <div class="empty-state" id="feed-empty" hidden="hidden" data-zh="没有匹配的订阅条目" data-en="No matching entries">没有匹配的订阅条目</div>

          <footer class="foot">
            <span><xsl:value-of select="/atom:feed/atom:rights"/></span>
            <div class="foot-links">
              <a href="/sitemap.xml" data-zh="站点地图 ↗" data-en="Sitemap ↗">站点地图 ↗</a>
              <a href="/" data-zh="返回首页 ↗" data-en="Back home ↗">返回首页 ↗</a>
            </div>
          </footer>
        </main>

        <script>
          (function () {
            var THEME_KEY = 'dyl_site_theme';
            var LANG_KEY = 'dyl_site_lang';
            var lang = 'zh';
            try { if (localStorage.getItem(LANG_KEY) === 'en') lang = 'en'; } catch (e) {}

            function applyLang(l) {
              lang = l === 'en' ? 'en' : 'zh';
              document.documentElement.lang = lang === 'en' ? 'en' : 'zh-CN';
              document.querySelectorAll('[data-zh][data-en]').forEach(function (el) {
                el.textContent = el.getAttribute(lang === 'en' ? 'data-en' : 'data-zh');
              });
              var filterInput = document.getElementById('feed-filter');
              if (filterInput) {
                filterInput.setAttribute('placeholder', filterInput.getAttribute(lang === 'en' ? 'data-en-ph' : 'data-zh-ph'));
              }
            }
            applyLang(lang);

            var langBtn = document.getElementById('feed-lang-btn');
            if (langBtn) {
              langBtn.addEventListener('click', function () {
                var next = lang === 'en' ? 'zh' : 'en';
                try { localStorage.setItem(LANG_KEY, next); } catch (e) {}
                applyLang(next);
              });
            }

            var themeBtn = document.getElementById('feed-theme-btn');
            function syncBtn() {
              var cur = document.documentElement.getAttribute('data-theme') || 'dark';
              if (themeBtn) themeBtn.textContent = cur === 'dark' ? '☀' : '◐';
            }
            syncBtn();
            if (themeBtn) {
              themeBtn.addEventListener('click', function () {
                var cur = document.documentElement.getAttribute('data-theme') || 'dark';
                var next = cur === 'dark' ? 'light' : 'dark';
                document.documentElement.setAttribute('data-theme', next);
                try { localStorage.setItem(THEME_KEY, next); } catch (e) {}
                syncBtn();
              });
            }

            var urlEl = document.getElementById('feed-url-text');
            var feedUrl = urlEl ? (urlEl.textContent || '').trim() : window.location.href;
            var enc = encodeURIComponent(feedUrl);
            var fFollow = document.getElementById('sub-follow');
            var fFeedly = document.getElementById('sub-feedly');
            var fIno = document.getElementById('sub-inoreader');
            if (fFollow) fFollow.href = 'https://app.follow.is/add?url=' + enc;
            if (fFeedly) fFeedly.href = 'https://feedly.com/i/subscription/feed/' + enc;
            if (fIno) fIno.href = 'https://www.inoreader.com/feed/' + enc;

            var copyBtn = document.getElementById('feed-copy-btn');
            if (copyBtn) {
              var timer = 0;
              copyBtn.addEventListener('click', function () {
                clearTimeout(timer);
                function done(ok) {
                  copyBtn.textContent = ok
                    ? (lang === 'en' ? 'Copied ✓' : '已复制 ✓')
                    : (lang === 'en' ? 'Copy failed' : '复制失败');
                  timer = setTimeout(function () {
                    copyBtn.textContent = copyBtn.getAttribute(lang === 'en' ? 'data-en' : 'data-zh');
                  }, 1600);
                }
                if (navigator.clipboard &amp;&amp; navigator.clipboard.writeText) {
                  navigator.clipboard.writeText(feedUrl).then(function () { done(true); }, function () { done(false); });
                } else {
                  done(false);
                }
              });
            }

            // 本地预览时保持文章跳转在当前主机，避免意外跳出 localhost
            if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
              document.querySelectorAll('#feed-entries .entry').forEach(function (a) {
                try {
                  var u = new URL(a.getAttribute('href'));
                  a.setAttribute('href', u.pathname + u.search + u.hash);
                } catch (e) {}
              });
            }

            var filter = document.getElementById('feed-filter');
            var empty = document.getElementById('feed-empty');
            if (filter) {
              filter.addEventListener('input', function () {
                var q = (filter.value || '').trim().toLowerCase();
                var shown = 0;
                document.querySelectorAll('#feed-entries .entry').forEach(function (card) {
                  var ok = !q || (card.textContent || '').toLowerCase().indexOf(q) !== -1;
                  card.hidden = !ok;
                  if (ok) shown++;
                });
                if (empty) empty.hidden = shown > 0;
              });
            }
          })();
        </script>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>
