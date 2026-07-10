function updateClock() {
    const now = new Date();
    const h = String(now.getHours()).padStart(2, '0');
    const m = String(now.getMinutes()).padStart(2, '0');
    const el = document.getElementById('clock');
    if (el) el.textContent = h + ':' + m;
}
updateClock();
setInterval(updateClock, 30000);
function openApp(name) {
    document.querySelectorAll('.app-overlay').forEach(el => el.classList.remove('active'));
    const el = document.getElementById('app-' + name);
    if (!el) return;
    el.classList.add('active');
    if (name === 'messages') renderAAMessages();
    if (name === 'maps') initMapsApp();
    if (name === 'findmy') initFindMyMap();
}
function closeApp() {
    document.querySelectorAll('.app-overlay').forEach(el => el.classList.remove('active'));
}
let _alertMode = null;
function openLockedApp(name) {
    _alertMode = 'locked_app';
    showAlert('Заключено приложение', 'Въведи парола за достъп', true, 'Отмени', 'Отвори');
}
function openLockedChat() {
    _alertMode = 'locked_chat';
    showAlert('Заключен чат', 'Чатът с Даниел е заключен.\nВъведи парола.', true, 'Отмени', 'Отвори');
}
function handleFileClick() {
    _alertMode = 'file_not_found';
    showAlert('Файлът не е намерен', '„Курсова работа - Пламена.docx" не може да бъде намерен или е бил изтрит.', false, 'Затвори', 'ОК');
}
function showAlert(title, msg, showInput, cancelText, okText) {
    document.getElementById('alertTitle').textContent = title;
    document.getElementById('alertMsg').textContent = msg;
    document.getElementById('alertInputWrap').style.display = showInput ? 'block' : 'none';
    document.getElementById('alertInput').value = '';
    document.getElementById('alertCancelBtn').textContent = cancelText;
    document.getElementById('alertOkBtn').textContent = okText;
    document.getElementById('iosAlert').style.display = 'flex';
}
function closeAlert() {
    document.getElementById('iosAlert').style.display = 'none';
    _alertMode = null;
}
function submitAlert() {
    if (_alertMode === 'file_not_found') { closeAlert(); return; }
    if (_alertMode === 'locked_app' || _alertMode === 'locked_chat') {
        const pass = document.getElementById('alertInput').value;
        if (pass.length > 0) {
            document.getElementById('alertTitle').textContent = 'Грешна парола';
            document.getElementById('alertMsg').textContent = 'Неправилна парола. Опитай отново.';
            document.getElementById('alertInput').value = '';
            document.getElementById('alertInput').focus();
        } else { closeAlert(); }
        return;
    }
    closeAlert();
}
document.getElementById('alertInput').addEventListener('keydown', function (e) {
    if (e.key === 'Enter') submitAlert();
});