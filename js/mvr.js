function openMvrSection(section) {
    document.getElementById('app-mvr-' + section).classList.add('active');
}
function closeMvrSection() {
    ['razpit', 'veshti'].forEach(s => {
        const el = document.getElementById('app-mvr-' + s);
        if (el) el.classList.remove('active');
    });
}