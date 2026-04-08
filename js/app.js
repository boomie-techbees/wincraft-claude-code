window.WinCraft = window.WinCraft || {};

window.WinCraft.App = (() => {
  const mount = () => document.getElementById('app-mount');

  const routes = {
    entry: () => WinCraft.EntryPage.render(mount()),
    output: () => WinCraft.OutputPage.render(mount()),
    settings: () => WinCraft.SettingsPage.render(mount()),
  };

  function getPage() {
    const hash = location.hash.replace('#/', '') || 'entry';
    return routes[hash] ? hash : 'entry';
  }

  function navigate() {
    const page = getPage();
    WinCraft.Nav.update(page);
    routes[page]();
  }

  function showAuthLoading() {
    mount().innerHTML = '<div class="auth-loading"><span class="spinner"></span></div>';
    document.getElementById('app-nav').style.visibility = 'hidden';
  }

  function showApp() {
    document.getElementById('app-nav').style.visibility = '';
    // Strip OAuth tokens from the URL (e.g. #access_token=... after Google login).
    if (location.hash.startsWith('#access_token') || location.hash.startsWith('#error')) {
      history.replaceState(null, '', location.pathname);
    }
    if (!location.hash) {
      location.hash = '#/entry';
      return;
    }
    navigate();
  }

  async function onAuthenticated() {
    // Migrate any pre-auth LocalStorage wins on first login.
    const migrated = await WinCraft.Store.migrateLegacyWins();
    if (migrated > 0) {
      WinCraft.Toast.show(`Migrated ${migrated} existing win${migrated === 1 ? '' : 's'} to your account!`, 'success');
    }
    showApp();
  }

  function init() {
    showAuthLoading();
    WinCraft.Auth.init(onAuthenticated);
  }

  window.addEventListener('hashchange', () => {
    if (WinCraft.Auth.getCurrentUser()) navigate();
  });

  window.addEventListener('DOMContentLoaded', init);

  return { navigate };
})();
