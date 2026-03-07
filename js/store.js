window.WinCraft = window.WinCraft || {};

window.WinCraft.Store = (() => {
  const WINS_KEY = 'wincraft_wins';
  const SETTINGS_KEY = 'wincraft_settings';

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

  // --- Wins ---

  function getWins() {
    return _read(WINS_KEY, []);
  }

  function addWin(text, tags) {
    const wins = getWins();
    const win = {
      id: crypto.randomUUID(),
      text: text.trim(),
      date: new Date().toISOString(),
      tags: (tags || []).map(t => t.trim()).filter(Boolean),
    };
    wins.unshift(win);
    _write(WINS_KEY, wins);
    return win;
  }

  function deleteWin(id) {
    const wins = getWins().filter(w => w.id !== id);
    _write(WINS_KEY, wins);
  }

  function getWinsHash() {
    const wins = getWins();
    return wins.length + ':' + (wins[0]?.id || '');
  }

  // --- Settings ---

  function getSettings() {
    return _read(SETTINGS_KEY, { userName: '' });
  }

  function saveSettings(settings) {
    _write(SETTINGS_KEY, settings);
  }

  return { getWins, addWin, deleteWin, getWinsHash, getSettings, saveSettings };
})();
