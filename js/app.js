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

  function init() {
    if (!location.hash) {
      location.hash = '#/entry';
      return; // hashchange will fire and call navigate
    }
    navigate();
  }

  window.addEventListener('hashchange', navigate);
  window.addEventListener('DOMContentLoaded', init);

  return { navigate };
})();
