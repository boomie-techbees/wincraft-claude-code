window.WinCraft = window.WinCraft || {};

window.WinCraft.WinCard = (() => {
  function render(win, onDelete) {
    const card = document.createElement('div');
    card.className = 'win-card';

    const date = new Date(win.date);
    const dateStr = date.toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
    });

    const tagsHtml = win.tags.length
      ? `<div class="win-card-tags">${win.tags.map(t => `<span class="tag-badge">${escapeHtml(t)}</span>`).join('')}</div>`
      : '';

    card.innerHTML = `
      <div class="win-card-date">${dateStr}</div>
      <div class="win-card-text">${escapeHtml(win.text)}</div>
      ${tagsHtml}
      <div class="win-card-actions">
        <button class="btn-delete" data-id="${win.id}">Delete</button>
      </div>
    `;

    card.querySelector('.btn-delete').addEventListener('click', () => {
      if (confirm('Delete this win?')) {
        onDelete(win.id);
      }
    });

    return card;
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  return { render, escapeHtml };
})();
