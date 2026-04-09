window.WinCraft = window.WinCraft || {};

window.WinCraft.Auth = (() => {
  function getToken() {
    const user = netlifyIdentity.currentUser();
    return user ? user.token.access_token : null;
  }

  function getCurrentUser() {
    return netlifyIdentity.currentUser();
  }

  function logout() {
    netlifyIdentity.logout();
  }

  function init(onAuthenticated) {
    netlifyIdentity.on('init', user => {
      if (user) {
        onAuthenticated(user);
      } else {
        setTimeout(() => netlifyIdentity.open('signup'), 0);
      }
    });

    netlifyIdentity.on('login', user => {
      netlifyIdentity.close();
      onAuthenticated(user);
    });

    netlifyIdentity.on('logout', () => {
      location.reload();
    });

    // On custom domains, auto-detection fails — point explicitly to the Netlify Identity endpoint.
    // On *.netlify.app URLs (production and deploy previews), let the widget detect it.
    const onCustomDomain = !window.location.hostname.endsWith('.netlify.app');
    netlifyIdentity.init(onCustomDomain
      ? { APIUrl: 'https://gleeful-puffpuff-8beac5.netlify.app/.netlify/identity' }
      : {}
    );
  }

  return { init, getToken, getCurrentUser, logout };
})();
