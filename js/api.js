window.WinCraft = window.WinCraft || {};

window.WinCraft.API = (() => {
  async function _post(endpoint, body) {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const msg = await res.text().catch(() => 'Request failed');
      throw new Error(msg);
    }
    return res.json();
  }

  function checkGrammar(text) {
    return _post('/api/grammar', { text });
  }

  function getSummary(wins) {
    return _post('/api/summary', { wins });
  }

  function getResumeBullets(wins) {
    return _post('/api/resume', { wins });
  }

  return { checkGrammar, getSummary, getResumeBullets };
})();
