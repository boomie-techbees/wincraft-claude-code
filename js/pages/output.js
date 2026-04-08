window.WinCraft = window.WinCraft || {};

window.WinCraft.OutputPage = (() => {
  let currentTab = 'list';
  let summaryCache = { hash: null, html: '' };
  let resumeCache = { hash: null, html: '' };

  function _winsHash(wins) {
    return wins.length + ':' + (wins[0]?.id || '');
  }

  async function render(container) {
    container.innerHTML = `
      <div class="page">
        <div class="output-tabs">
          <button class="output-tab ${currentTab === 'list' ? 'active' : ''}" data-tab="list">All Wins</button>
          <button class="output-tab ${currentTab === 'summary' ? 'active' : ''}" data-tab="summary">AI Summary</button>
          <button class="output-tab ${currentTab === 'resume' ? 'active' : ''}" data-tab="resume">Resume</button>
        </div>
        <div id="output-content"><div class="ai-content text-center"><span class="spinner"></span></div></div>
      </div>
    `;

    container.querySelectorAll('.output-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        currentTab = tab.dataset.tab;
        render(container);
      });
    });

    let wins;
    try {
      wins = await WinCraft.Store.getWins();
    } catch (err) {
      document.getElementById('output-content').innerHTML = `
        <div class="ai-content"><p>Could not load wins. Please try again.</p></div>
      `;
      return;
    }

    const content = document.getElementById('output-content');

    if (currentTab === 'list') {
      renderList(content, wins, container);
    } else if (currentTab === 'summary') {
      renderSummary(content, wins);
    } else if (currentTab === 'resume') {
      renderResume(content, wins);
    }
  }

  function renderList(content, wins, pageContainer) {
    if (wins.length === 0) {
      content.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">&#127942;</div>
          <h3>No wins yet</h3>
          <p>Start by <a href="#/entry">recording a win</a>!</p>
        </div>
      `;
      return;
    }

    content.innerHTML = '';
    wins.forEach(win => {
      const card = WinCraft.WinCard.render(win, async (id) => {
        try {
          await WinCraft.Store.deleteWin(id);
          WinCraft.Toast.show('Win deleted', 'default');
          render(pageContainer);
        } catch (err) {
          WinCraft.Toast.show('Could not delete win. Please try again.', 'error');
        }
      });
      content.appendChild(card);
    });
  }

  async function renderSummary(content, wins) {
    if (wins.length === 0) {
      content.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">&#128202;</div>
          <h3>Nothing to summarize</h3>
          <p><a href="#/entry">Add some wins</a> first!</p>
        </div>
      `;
      return;
    }

    const hash = _winsHash(wins);
    if (summaryCache.hash === hash) {
      content.innerHTML = summaryCache.html;
      return;
    }

    content.innerHTML = `
      <div class="ai-content text-center">
        <span class="spinner"></span>
        <p class="mt-8">Generating your summary...</p>
      </div>
    `;

    try {
      const result = await WinCraft.API.getSummary(wins);
      const html = `
        <div class="ai-content">
          <h3>Your Wins Summary</h3>
          <p>${WinCraft.WinCard.escapeHtml(result.summary)}</p>
        </div>
      `;
      summaryCache = { hash, html };
      content.innerHTML = html;
    } catch (err) {
      content.innerHTML = `
        <div class="ai-content">
          <p>Could not generate summary. Make sure the API is configured.</p>
        </div>
      `;
    }
  }

  async function renderResume(content, wins) {
    if (wins.length === 0) {
      content.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">&#128196;</div>
          <h3>No wins to convert</h3>
          <p><a href="#/entry">Add some wins</a> first!</p>
        </div>
      `;
      return;
    }

    const hash = _winsHash(wins);
    if (resumeCache.hash === hash) {
      content.innerHTML = resumeCache.html;
      attachCopyHandler(content, wins);
      return;
    }

    content.innerHTML = `
      <div class="ai-content text-center">
        <span class="spinner"></span>
        <p class="mt-8">Crafting resume bullets...</p>
      </div>
    `;

    try {
      const result = await WinCraft.API.getResumeBullets(wins);
      const html = `
        <div class="ai-content">
          <h3>Resume Bullets</h3>
          <ul>
            ${result.bullets.map(b => `<li>${WinCraft.WinCard.escapeHtml(b)}</li>`).join('')}
          </ul>
          <button class="btn btn-secondary btn-block mt-16" id="btn-copy-resume">Copy to Clipboard</button>
        </div>
      `;
      resumeCache = { hash, html };
      content.innerHTML = html;
      attachCopyHandler(content, result.bullets);
    } catch (err) {
      content.innerHTML = `
        <div class="ai-content">
          <p>Could not generate resume bullets. Make sure the API is configured.</p>
        </div>
      `;
    }
  }

  function attachCopyHandler(content, bullets) {
    const btn = content.querySelector('#btn-copy-resume');
    if (!btn) return;
    btn.addEventListener('click', async () => {
      const text = (Array.isArray(bullets) ? bullets : []).map(b => `• ${b}`).join('\n');
      try {
        await navigator.clipboard.writeText(text);
        WinCraft.Toast.show('Copied to clipboard!', 'success');
      } catch {
        WinCraft.Toast.show('Could not copy — try selecting manually', 'error');
      }
    });
  }

  return { render };
})();
