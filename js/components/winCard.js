window.WinCraft = window.WinCraft || {};

window.WinCraft.WinCard = (() => {
  // callbacks: { onArchive } for active wins, { onRestore, onDelete } for archived wins
  function render(win, callbacks) {
    const card = document.createElement('div');
    card.className = 'win-card';

    const date = new Date(win.date);
    const dateStr = date.toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
    });

    const tagsHtml = win.tags.length
      ? `<div class="win-card-tags">${win.tags.map(t => `<span class="tag-badge">${escapeHtml(t)}</span>`).join('')}</div>`
      : '';

    const actionsHtml = win.archived
      ? `<button class="btn-restore" data-id="${win.id}">Restore</button>
         <button class="btn-delete" data-id="${win.id}">Delete</button>`
      : `<button class="btn-archive" data-id="${win.id}">Archive</button>`;

    card.innerHTML = `
      <div class="win-card-date">${dateStr}</div>
      <div class="win-card-text">${escapeHtml(win.text)}</div>
      ${tagsHtml}
      <div class="win-card-actions">
        ${actionsHtml}
      </div>
    `;

    if (win.archived) {
      card.querySelector('.btn-restore').addEventListener('click', () => {
        callbacks.onRestore(win.id);
      });
      card.querySelector('.btn-delete').addEventListener('click', () => {
        if (confirm('Permanently delete this win? This cannot be undone.')) {
          callbacks.onDelete(win.id);
        }
      });
    } else {
      card.querySelector('.btn-archive').addEventListener('click', () => {
        callbacks.onArchive(win.id);
      });
    }

    return card;
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  return { render, escapeHtml };
})();
