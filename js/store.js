window.WinCraft = window.WinCraft || {};

window.WinCraft.Store = (() => {
  const SETTINGS_KEY = 'wincraft_settings';
  const LEGACY_WINS_KEY = 'wincraft_wins';

  function _read(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  }

  function _write(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  // --- Wins (async, backed by API) ---

  function getWins() {
    return WinCraft.API.getWins();
  }

  function addWin(text, tags) {
    return WinCraft.API.addWin(text, tags);
  }

  function deleteWin(id) {
    return WinCraft.API.deleteWin(id);
  }

  // Migrate any wins stored in LocalStorage from before auth was added.
  // Calls the API to import them, then clears the legacy key.
  async function migrateLegacyWins() {
    const legacy = _read(LEGACY_WINS_KEY, []);
    if (legacy.length === 0) return 0;

    // Add in reverse order so the most recent ends up first in Blobs.
    let migrated = 0;
    for (const win of [...legacy].reverse()) {
      try {
        await WinCraft.API.addWin(win.text, win.tags || []);
        migrated++;
      } catch {
        // Best-effort; skip individual failures.
      }
    }

    localStorage.removeItem(LEGACY_WINS_KEY);
    return migrated;
  }

  // --- Settings (local, not sensitive) ---

  function getSettings() {
    return _read(SETTINGS_KEY, { userName: '' });
  }

  function saveSettings(settings) {
    _write(SETTINGS_KEY, settings);
  }

  return { getWins, addWin, deleteWin, migrateLegacyWins, getSettings, saveSettings };
})();
