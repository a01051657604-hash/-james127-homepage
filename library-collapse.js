/* 나그네의 식탁 자료실: 기존 분류를 접고 펼치기 (2026-10)
   기존 자료 및 검색/정렬 코드는 변경하지 않음 */
(function () {
  'use strict';
  function init() {
    var root = document.getElementById('library-new');
    if (!root || root.dataset.collapseReady === '1') return;
    var grid = root.querySelector('.lib-grid');
    if (!grid) return;
    root.dataset.collapseReady = '1';
    var search = root.querySelector('#lib-search');
    var select = root.querySelector('#lib-category');
    var openGroups = new Set();
    var hasUserChoice = false;
    var autoMode = false;

    var css = document.createElement('style');
    css.textContent = '\n#library-new .lib-group > .lib-collapse-trigger{width:100%;display:flex;align-items:center;justify-content:space-between;gap:12px;text-align:left;background:transparent;border:0;color:inherit;cursor:pointer;padding:14px 2px;font:inherit;font-weight:800;}\n#library-new .lib-group > .lib-collapse-trigger:focus-visible{outline:3px solid #2463a0;outline-offset:2px;border-radius:8px;}\n#library-new .lib-collapse-icon{display:inline-grid;place-items:center;flex:none;font-size:1.2em;transition:transform .18s ease;}\n#library-new .lib-collapse-trigger[aria-expanded="true"] .lib-collapse-icon{transform:rotate(180deg);}\n#library-new .lib-group-grid[hidden]{display:none!important;}\n#library-new .lib-group > h3{margin:0;}\n';
    document.head.appendChild(css);

    function forcedOpen() {
      return Boolean((search && search.value.trim()) || (select && select.value && select.value !== 'all' && select.value !== '전체'));
    }
    function apply() {
      var automatic = forcedOpen();
      if (automatic !== autoMode) {
        autoMode = automatic;
        if (!automatic && !hasUserChoice) openGroups.clear();
      }
      var groups = grid.querySelectorAll('.lib-group');
      groups.forEach(function (section, index) {
        var title = section.querySelector('h3');
        var content = section.querySelector('.lib-group-grid');
        if (!title || !content) return;
        var key = section.getAttribute('data-group') || title.textContent.trim() || String(index);
        var btn = title.querySelector('button.lib-collapse-trigger');
        if (!btn) {
          var text = title.textContent.trim();
          title.textContent = '';
          btn = document.createElement('button');
          btn.type = 'button';
          btn.className = 'lib-collapse-trigger';
          var span = document.createElement('span');
          span.textContent = text;
          var arrow = document.createElement('span');
          arrow.className = 'lib-collapse-icon';
          arrow.setAttribute('aria-hidden', 'true');
          arrow.textContent = '⌄';
          btn.append(span, arrow);
          title.appendChild(btn);
          if (!content.id) content.id = 'lib-collapse-panel-' + index;
          btn.setAttribute('aria-controls', content.id);
          btn.addEventListener('click', function () {
            hasUserChoice = true;
            if (openGroups.has(key)) openGroups.delete(key);
            else openGroups.add(key);
            // User's explicit choice takes precedence within search results
            var expanded = openGroups.has(key);
            content.hidden = !expanded;
            btn.setAttribute('aria-expanded', String(expanded));
          });
        }
        var expanded = openGroups.has(key) || (automatic && !hasUserChoice);
        // On search/filter change, automatically show matching groups.
        if (automatic && !openGroups.has(key)) expanded = true;
        if (!automatic && !openGroups.has(key)) expanded = false;
        content.hidden = !expanded;
        btn.setAttribute('aria-expanded', String(expanded));
      });
    }

    // Existing library renderer replaces group sections when search, filter, sort or JSON changes.
    // Observe ONLY direct children to avoid reacting to our own button creation.
    var observer = new MutationObserver(function () { apply(); });
    observer.observe(grid, {childList: true});
    if (search) search.addEventListener('input', function () { requestAnimationFrame(apply); });
    if (select) select.addEventListener('change', function () { requestAnimationFrame(apply); });
    apply();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
