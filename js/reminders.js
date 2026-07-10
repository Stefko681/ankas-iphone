function toggleReminder(row) {
    const circle = row.querySelector('.rem-circle');
    if (!circle) return;
    const done = circle.classList.toggle('rem-done');
    if (done) {
        circle.style.background = '#34c759';
        circle.style.borderColor = '#34c759';
        circle.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg>`;
        setTimeout(() => { row.style.opacity = '0.4'; }, 300);
    } else {
        circle.style.background = '';
        circle.style.borderColor = circle.dataset.color || '#007aff';
        circle.innerHTML = '';
        row.style.opacity = '1';
    }
}