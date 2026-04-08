window.WinCraft = window.WinCraft || {};

window.WinCraft.EntryPage = (() => {
  function render(container) {
    const settings = WinCraft.Store.getSettings();
    const greeting = settings.userName
      ? `Hey ${WinCraft.WinCard.escapeHtml(settings.userName)}!`
      : `Hey! <a href="#/settings">Set your name</a>`;

    container.innerHTML = `
      <div class="page">
        <p class="page-greeting">${greeting}</p>
        <div class="card">
          <div class="form-group">
            <label for="win-text">What did you win today?</label>
            <textarea id="win-text" placeholder="I shipped a new feature that..." rows="4"></textarea>
          </div>
          <div class="form-group">
            <label for="win-tags">Tags (optional)</label>
            <input type="text" id="win-tags" placeholder="e.g. work, coding, health" />
            <p class="form-hint">Comma-separated tags to organize your wins.</p>
          </div>
          <div id="suggestions-area"></div>
          <div class="btn-group">
            <button class="btn btn-secondary" id="btn-grammar">Check Spelling &amp; Grammar</button>
            <button class="btn btn-primary" id="btn-save">Save My Win!</button>
          </div>
        </div>
      </div>
    `;

    const textarea = document.getElementById('win-text');
    const tagsInput = document.getElementById('win-tags');
    const suggestionsArea = document.getElementById('suggestions-area');
    const btnGrammar = document.getElementById('btn-grammar');
    const btnSave = document.getElementById('btn-save');

    btnGrammar.addEventListener('click', async () => {
      const text = textarea.value.trim();
      if (!text) {
        WinCraft.Toast.show('Write something first!', 'error');
        return;
      }

      btnGrammar.disabled = true;
      btnGrammar.innerHTML = '<span class="spinner spinner-white"></span> Checking...';
      suggestionsArea.innerHTML = '';

      try {
        const result = await WinCraft.API.checkGrammar(text);
        if (result.hasSuggestions) {
          suggestionsArea.innerHTML = `
            <div class="suggestions-panel">
              <h3>Suggestions</h3>
              <div class="corrected-text">${WinCraft.WinCard.escapeHtml(result.correctedText)}</div>
              <ul>
                ${result.suggestions.map(s => `<li>${WinCraft.WinCard.escapeHtml(s)}</li>`).join('')}
              </ul>
            </div>
          `;
        } else {
          suggestionsArea.innerHTML = `
            <div class="no-suggestions">Looks great — no suggestions!</div>
          `;
        }
      } catch (err) {
        WinCraft.Toast.show('Grammar check unavailable. You can still save!', 'error');
      } finally {
        btnGrammar.disabled = false;
        btnGrammar.innerHTML = 'Check Spelling &amp; Grammar';
      }
    });

    btnSave.addEventListener('click', async () => {
      const text = textarea.value.trim();
      if (!text) {
        WinCraft.Toast.show('Write something first!', 'error');
        return;
      }

      const tags = tagsInput.value
        .split(',')
        .map(t => t.trim())
        .filter(Boolean);

      btnSave.disabled = true;
      btnSave.innerHTML = '<span class="spinner spinner-white"></span> Saving...';

      try {
        await WinCraft.Store.addWin(text, tags);
        WinCraft.Toast.show('Win saved!', 'success');
        textarea.value = '';
        tagsInput.value = '';
        suggestionsArea.innerHTML = '';
      } catch (err) {
        WinCraft.Toast.show('Could not save win. Please try again.', 'error');
      } finally {
        btnSave.disabled = false;
        btnSave.innerHTML = 'Save My Win!';
      }
    });
  }

  return { render };
})();
