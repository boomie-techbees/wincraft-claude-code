window.WinCraft = window.WinCraft || {};

window.WinCraft.API = (() => {
  function _authHeaders() {
    const token = WinCraft.Auth.getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  async function _post(endpoint, body) {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ..._authHeaders() },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const msg = await res.text().catch(() => 'Request failed');
      throw new Error(msg);
    }
    return res.json();
  }

  async function _delete(endpoint, body) {
    const res = await fetch(endpoint, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json', ..._authHeaders() },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const msg = await res.text().catch(() => 'Request failed');
      throw new Error(msg);
    }
    return res.json();
  }

  // --- Wins ---

  async function getWins() {
    const res = await fetch('/api/wins', {
      headers: _authHeaders(),
    });
    if (!res.ok) throw new Error('Failed to load wins');
    return res.json();
  }

  function addWin(text, tags) {
    return _post('/api/wins', { text, tags });
  }

  function deleteWin(id) {
    return _delete('/api/wins', { id });
  }

  // --- AI ---

  function checkGrammar(text) {
    return _post('/api/grammar', { text });
  }

  function getSummary(wins) {
    return _post('/api/summary', { wins });
  }

  function getResumeBullets(wins) {
    return _post('/api/resume', { wins });
  }

  return { getWins, addWin, deleteWin, checkGrammar, getSummary, getResumeBullets };
})();
