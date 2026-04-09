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

    netlifyIdentity.init();
  }

  return { init, getToken, getCurrentUser, logout };
})();
