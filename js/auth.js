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
      console.log('[Auth] init fired, user:', user);
      if (user) {
        onAuthenticated(user);
      } else {
        netlifyIdentity.open('login');
      }
    });

    netlifyIdentity.on('login', user => {
      console.log('[Auth] login fired, user:', user);
      netlifyIdentity.close();
      onAuthenticated(user);
    });

    netlifyIdentity.on('logout', () => {
      console.log('[Auth] logout fired');
      location.reload();
    });

    netlifyIdentity.on('error', err => {
      console.error('[Auth] error:', err);
    });

    console.log('[Auth] calling netlifyIdentity.init()');
    netlifyIdentity.init({
      APIUrl: 'https://gleeful-puffpuff-8beac5.netlify.app/.netlify/identity',
    });
  }

  return { init, getToken, getCurrentUser, logout };
})();
