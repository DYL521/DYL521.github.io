<?xml version="1.0" encoding="utf-8"?>
<xsl:stylesheet version="1.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:sm="http://www.sitemaps.org/schemas/sitemap/0.9">
  <xsl:output method="html" version="1.0" encoding="UTF-8" indent="yes"/>

  <xsl:template match="/">
    <html lang="zh-CN" data-theme="dark">
      <head>
        <meta charset="utf-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
        <title>DYL521 · XML Sitemap</title>
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
            --accent-soft: rgba(189, 149, 249, .14);
            --border: #2a233a;
            --border-hover: #6d529e;
            --shadow: 0 2px 12px rgba(0, 0, 0, .28), 0 16px 36px -16px rgba(0, 0, 0, .45);
          }
          *, *::before, *::after { box-sizing: border-box; }
          body { margin: 0; background: var(--bg); color: var(--text); font: 14.5px/1.7 var(--font-sans); -webkit-font-smoothing: antialiased; }
          a { color: inherit; text-decoration: none; }
          button, input { font: inherit; }
          button { cursor: pointer; }
          .topbar {
            position: sticky; top: 0; z-index: 20;
            backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
            background: color-mix(in srgb, var(--bg) 82%, transparent);
            border-bottom: 1px solid var(--border);
          }
          .topbar-inner {
            max-width: 960px; margin: 0 auto; padding: 14px 24px;
            display: flex; align-items: center; justify-content: space-between; gap: 12px;
          }
          .brand { display: inline-flex; align-items: center; gap: 8px; font-weight: 700; font-size: 18px; color: var(--heading); }
          .brand-mark { color: var(--accent); font-size: 20px; }
          .brand-dot { color: var(--accent); margin-left: -4px; }
          .topbar-actions { display: inline-flex; gap: 8px; }
          .pill-btn {
            display: inline-flex; align-items: center; padding: 6px 12px; border-radius: 999px;
            border: 1px solid var(--border); background: var(--surface); color: var(--text-2);
            font: 12px var(--font-mono); transition: border-color .15s, color .15s;
          }
          .pill-btn:hover { border-color: var(--accent); color: var(--accent); }
          .wrap { max-width: 960px; margin: 0 auto; padding: 32px 24px 72px; }
          .hero {
            background: var(--surface); border: 1px solid var(--border); border-radius: 16px;
            padding: 24px 28px; box-shadow: var(--shadow); margin-bottom: 24px;
            display: flex; flex-wrap: wrap; align-items: flex-end; justify-content: space-between; gap: 16px;
          }
          .badge {
            display: inline-flex; padding: 3px 10px; border-radius: 999px;
            background: var(--accent-soft); color: var(--accent);
            font: 600 11px var(--font-mono); margin-bottom: 10px;
          }
          .hero h1 { margin: 0 0 6px; font-size: 26px; color: var(--heading); }
          .hero p { margin: 0; color: var(--text-2); font-size: 13.5px; }
          .filter {
            width: min(300px, 100%); padding: 8px 14px; border-radius: 999px;
            border: 1px solid var(--border); background: var(--bg-2); color: var(--text);
            font: 13px var(--font-sans); outline: none;
          }
          .filter:focus { border-color: var(--accent); }
          .card {
            background: var(--surface); border: 1px solid var(--border); border-radius: 14px;
            overflow: hidden; box-shadow: var(--shadow);
          }
          table { width: 100%; border-collapse: collapse; font-size: 13px; }
          th {
            text-align: left; padding: 12px 18px; background: var(--bg-2);
            color: var(--text-3); font: 600 11.5px var(--font-mono); border-bottom: 1px solid var(--border);
          }
          td { padding: 11px 18px; border-bottom: 1px solid var(--border); vertical-align: middle; }
          tr:last-child td { border-bottom: 0; }
          tbody tr:hover td { background: var(--surface-hover); }
          tr[hidden] { display: none; }
          .url-link {
            color: var(--heading); font-family: var(--font-mono); font-size: 12.5px;
            overflow-wrap: anywhere; transition: color .15s;
          }
          .url-link:hover { color: var(--accent); }
          .date-col { white-space: nowrap; font: 12px var(--font-mono); color: var(--text-3); width: 124px; }
          @media (max-width: 640px) {
            .topbar-inner { padding: 12px 16px; }
            .wrap { padding: 20px 16px 52px; }
            .hero { padding: 18px; }
            th, td { padding: 10px 12px; }
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
              <span>DYL521</span>
              <span class="brand-dot">.</span>
            </a>
            <div class="topbar-actions">
              <button type="button" class="pill-btn" id="sm-theme-btn" aria-label="切换明暗主题">☀</button>
              <a class="pill-btn" href="/atom.xml">RSS</a>
              <a class="pill-btn" href="/">← 返回博客</a>
            </div>
          </div>
        </header>
        <main class="wrap">
          <section class="hero">
            <div>
              <div class="badge">● SITEMAP 0.9</div>
              <h1>站点地图</h1>
              <p>共收录 <strong id="sm-count"><xsl:value-of select="count(/sm:urlset/sm:url)"/></strong> 个公开索引页面，供搜索引擎与访客快速检索。</p>
            </div>
            <input type="search" class="filter" id="sm-filter" placeholder="按路径关键词筛选…" autocomplete="off"/>
          </section>
          <div class="card">
            <table>
              <thead>
                <tr>
                  <th>URL</th>
                  <th class="date-col">LASTMOD</th>
                </tr>
              </thead>
              <tbody id="sm-rows">
                <xsl:for-each select="/sm:urlset/sm:url">
                  <tr>
                    <td>
                      <a class="url-link">
                        <xsl:attribute name="href"><xsl:value-of select="sm:loc"/></xsl:attribute>
                        <xsl:value-of select="sm:loc"/>
                      </a>
                    </td>
                    <td class="date-col"><xsl:value-of select="substring(sm:lastmod, 1, 10)"/></td>
                  </tr>
                </xsl:for-each>
              </tbody>
            </table>
          </div>
        </main>
        <script>
          (function () {
            var KEY = 'dyl_site_theme';
            var btn = document.getElementById('sm-theme-btn');
            function sync() {
              var cur = document.documentElement.getAttribute('data-theme') || 'dark';
              if (btn) btn.textContent = cur === 'dark' ? '☀' : '◐';
            }
            sync();
            if (btn) {
              btn.addEventListener('click', function () {
                var cur = document.documentElement.getAttribute('data-theme') || 'dark';
                var next = cur === 'dark' ? 'light' : 'dark';
                document.documentElement.setAttribute('data-theme', next);
                try { localStorage.setItem(KEY, next); } catch (e) {}
                sync();
              });
            }
            var isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
            document.querySelectorAll('#sm-rows .url-link').forEach(function (a) {
              try {
                var u = new URL(a.getAttribute('href'));
                var decoded = decodeURIComponent(u.pathname);
                a.textContent = decoded;
                if (isLocal) a.setAttribute('href', u.pathname);
              } catch (e) {}
            });
            var input = document.getElementById('sm-filter');
            var countEl = document.getElementById('sm-count');
            if (input) {
              input.addEventListener('input', function () {
                var q = (input.value || '').trim().toLowerCase();
                var n = 0;
                document.querySelectorAll('#sm-rows tr').forEach(function (tr) {
                  var ok = !q || (tr.textContent || '').toLowerCase().indexOf(q) !== -1;
                  tr.hidden = !ok;
                  if (ok) n++;
                });
                if (countEl) countEl.textContent = String(n);
              });
            }
          })();
        </script>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>
