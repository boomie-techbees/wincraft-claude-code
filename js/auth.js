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
        netlifyIdentity.open('login');
      }
    });

    netlifyIdentity.on('login', user => {
      netlifyIdentity.close();
      onAuthenticated(user);
    });

    netlifyIdentity.on('logout', () => {
      location.reload();
    });

    netlifyIdentity.init({
      APIUrl: 'https://gleeful-puffpuff-8beac5.netlify.app/.netlify/identity',
    });
  }

  return { init, getToken, getCurrentUser, logout };
})();
