window.WinCraft = window.WinCraft || {};

window.WinCraft.SettingsPage = (() => {
  function render(container) {
    const settings = WinCraft.Store.getSettings();

    container.innerHTML = `
      <div class="page">
        <div class="card">
          <h2 class="mb-16">Settings</h2>
          <div class="form-group">
            <label for="settings-name">Your Name</label>
            <input type="text" id="settings-name" placeholder="Enter your name" value="${WinCraft.WinCard.escapeHtml(settings.userName)}" />
            <p class="form-hint">Used to personalize your greeting on the entry page.</p>
          </div>
          <button class="btn btn-primary btn-block" id="settings-save">Save Settings</button>
        </div>
      </div>
    `;

    document.getElementById('settings-save').addEventListener('click', () => {
      const name = document.getElementById('settings-name').value.trim();
      WinCraft.Store.saveSettings({ userName: name });
      WinCraft.Toast.show('Settings saved!', 'success');
    });
  }

  return { render };
})();
