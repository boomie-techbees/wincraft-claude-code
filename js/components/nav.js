window.WinCraft = window.WinCraft || {};

window.WinCraft.Nav = (() => {
  function update(currentPage) {
    const links = document.querySelectorAll('#app-nav .nav-link');
    links.forEach(link => {
      const page = link.dataset.page;
      link.classList.toggle('active', page === currentPage);
    });
  }

  return { update };
})();
