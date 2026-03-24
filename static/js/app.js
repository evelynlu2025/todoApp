document.addEventListener('DOMContentLoaded', () => {
  const grid         = document.getElementById('task-grid');
  const overlay      = document.getElementById('modal-overlay');
  const form         = document.getElementById('task-form');
  const modalTitle   = document.getElementById('modal-title');
  const modalSubmit  = document.getElementById('modal-submit');
  const openBtn      = document.getElementById('open-add-modal');
  const cancelBtn    = document.getElementById('modal-cancel');
  const dateSub      = document.getElementById('date-subtitle');

  let editingId = null;

  /* --- date subtitle --- */
  dateSub.textContent = new Date().toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'
  });

  /* ===================== Modal ===================== */
  function openModal(task) {
    editingId = task ? task.id : null;
    modalTitle.textContent = task ? 'Edit Task' : 'New Task';
    modalSubmit.textContent = task ? 'Save Changes' : 'Add Task';
    form.title.value       = task ? task.title : '';
    form.course.value      = task ? task.course : '';
    form.due_date.value    = task ? task.due_date : '';
    form.description.value = task ? task.description : '';
    overlay.classList.add('open');
    form.title.focus();
  }

  function closeModal() {
    overlay.classList.remove('open');
    form.reset();
    editingId = null;
  }

  openBtn.addEventListener('click', () => openModal(null));
  cancelBtn.addEventListener('click', closeModal);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) closeModal(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });

  /* ===================== Toast ===================== */
  function showToast(msg) {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      document.body.appendChild(container);
    }
    const toast = document.createElement('div');
    toast.className = 'toast toast-error';
    toast.textContent = msg;
    container.appendChild(toast);
    setTimeout(() => { toast.style.opacity = '0'; }, 2500);
    setTimeout(() => toast.remove(), 3000);
  }

  /* ===================== Helpers ===================== */
  function removeEmptyState() {
    const el = document.getElementById('empty-state');
    if (el) el.remove();
  }

  function dateClass(due, completed) {
    if (completed) return '';
    if (due === TODAY) return 'due-today';
    if (due < TODAY) return 'overdue';
    return '';
  }

  function badgeClass(due, completed) {
    if (completed) return 'badge-normal';
    if (due === TODAY) return 'badge-today';
    if (due < TODAY) return 'badge-overdue';
    return 'badge-normal';
  }

  function formatDate(iso) {
    const d = new Date(iso + 'T00:00:00');
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  function buildCard(t) {
    const cls = [
      'task-card',
      t.completed ? 'completed' : '',
      dateClass(t.due_date, t.completed),
    ].filter(Boolean).join(' ');

    return `
      <div class="${cls}" data-id="${t.id}" data-due="${t.due_date}" data-completed="${t.completed}">
        <div class="task-card-top">
          <button class="check-btn ${t.completed ? 'checked' : ''}" title="Toggle complete">
            <svg viewBox="0 0 24 24" width="22" height="22"><circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="2"/><path class="check-mark" d="M8 12l2.5 3L16 9" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </button>
          <div class="task-info">
            <span class="task-title">${escape(t.title)}</span>
            ${t.course ? `<span class="task-course">${escape(t.course)}</span>` : ''}
          </div>
          <div class="task-actions">
            <button class="icon-btn edit-btn" title="Edit">
              <svg viewBox="0 0 24 24" width="16" height="16"><path d="M17 3a2.83 2.83 0 114 4L7.5 20.5 2 22l1.5-5.5Z" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </button>
            <button class="icon-btn delete-btn" title="Delete">
              <svg viewBox="0 0 24 24" width="16" height="16"><polyline points="3 6 5 6 21 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6m4 0V4a1 1 0 011-1h4a1 1 0 011 1v2" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </button>
          </div>
        </div>
        ${t.description ? `<p class="task-desc">${escape(t.description)}</p>` : ''}
        <div class="task-meta">
          <span class="due-badge ${badgeClass(t.due_date, t.completed)}">Due ${formatDate(t.due_date)}</span>
        </div>
      </div>`;
  }

  function escape(s) {
    const d = document.createElement('div');
    d.textContent = s;
    return d.innerHTML;
  }

  /* ===================== Initial Render ===================== */
  const EMPTY_STATE_HTML = `
    <div class="empty-state" id="empty-state">
      <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 12l2 2 4-4"/></svg>
      <h3>No tasks yet</h3>
      <p>Click <strong>+ New Task</strong> to add your first assignment.</p>
    </div>`;

  const initialData = JSON.parse(document.getElementById('initial-tasks').textContent);
  if (initialData.length === 0) {
    grid.innerHTML = EMPTY_STATE_HTML;
  } else {
    grid.innerHTML = initialData.map(buildCard).join('');
  }

  /* ===================== CRUD ===================== */
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const payload = new FormData(form);

    if (editingId) {
      const body = JSON.stringify({
        title: payload.get('title'),
        course: payload.get('course'),
        due_date: payload.get('due_date'),
        description: payload.get('description'),
      });
      const res = await fetch(`/api/tasks/${editingId}/`, {
        method: 'POST',
        headers: { 'X-CSRFToken': CSRF, 'Content-Type': 'application/json' },
        body,
      });
      if (!res.ok) { showToast('Failed to update task. Please try again.'); return; }
      const t = await res.json();
      const card = grid.querySelector(`[data-id="${t.id}"]`);
      if (card) card.outerHTML = buildCard(t);
    } else {
      const res = await fetch('/api/tasks/', {
        method: 'POST',
        headers: { 'X-CSRFToken': CSRF },
        body: payload,
      });
      if (!res.ok) { showToast('Failed to create task. Please try again.'); return; }
      const t = await res.json();
      removeEmptyState();
      grid.insertAdjacentHTML('afterbegin', buildCard(t));
    }
    closeModal();
  });

  grid.addEventListener('click', async (e) => {
    const card = e.target.closest('.task-card');
    if (!card) return;
    const id = card.dataset.id;

    if (e.target.closest('.check-btn')) {
      const res = await fetch(`/api/tasks/${id}/toggle/`, {
        method: 'POST',
        headers: { 'X-CSRFToken': CSRF },
      });
      if (!res.ok) { showToast('Failed to toggle task. Please try again.'); return; }
      const data = await res.json();
      const t = {
        id: data.id,
        completed: data.completed,
        title: card.querySelector('.task-title').textContent,
        course: card.querySelector('.task-course')?.textContent || '',
        due_date: card.dataset.due,
        description: card.querySelector('.task-desc')?.textContent || '',
      };
      card.outerHTML = buildCard(t);
      return;
    }

    if (e.target.closest('.delete-btn')) {
      if (!confirm('Delete this task?')) return;
      const res = await fetch(`/api/tasks/${id}/delete/`, {
        method: 'POST',
        headers: { 'X-CSRFToken': CSRF },
      });
      if (!res.ok) { showToast('Failed to delete task. Please try again.'); return; }
      card.style.opacity = '0';
      card.style.transform = 'translateY(-8px)';
      setTimeout(() => card.remove(), 250);
      return;
    }

    if (e.target.closest('.edit-btn')) {
      openModal({
        id,
        title: card.querySelector('.task-title').textContent,
        course: card.querySelector('.task-course')?.textContent || '',
        due_date: card.dataset.due,
        description: card.querySelector('.task-desc')?.textContent || '',
      });
    }
  });

  /* ===================== Filters ===================== */
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelector('.filter-btn.active').classList.remove('active');
      btn.classList.add('active');
      const filter = btn.dataset.filter;

      grid.querySelectorAll('.task-card').forEach(card => {
        const due  = card.dataset.due;
        const done = card.dataset.completed === 'true';
        let show = true;
        if (filter === 'today')     show = due === TODAY && !done;
        if (filter === 'upcoming')  show = due > TODAY && !done;
        if (filter === 'overdue')   show = due < TODAY && !done;
        if (filter === 'completed') show = done;
        card.style.display = show ? '' : 'none';
      });
    });
  });
});
