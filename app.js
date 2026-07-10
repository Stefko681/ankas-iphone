// ─── Clock ───────────────────────────────────────────────────────────────────
function updateClock() {
  const now = new Date();
  const h = String(now.getHours()).padStart(2, '0');
  const m = String(now.getMinutes()).padStart(2, '0');
  const el = document.getElementById('clock');
  if (el) el.textContent = h + ':' + m;
}
updateClock();
setInterval(updateClock, 30000);

// ─── App Navigation ───────────────────────────────────────────────────────────
function openApp(name) {
  // Close all top-level overlays
  document.querySelectorAll('.app-overlay').forEach(el => el.classList.remove('active'));
  const el = document.getElementById('app-' + name);
  if (!el) return;
  el.classList.add('active');
  if (name === 'messages') renderAAMessages();
  if (name === 'maps')    initMapsApp();
  if (name === 'findmy')  initFindMyMap();
}

function closeApp() {
  document.querySelectorAll('.app-overlay').forEach(el => el.classList.remove('active'));
}

// ─── Locked Apps ──────────────────────────────────────────────────────────────
let _alertMode = null; // 'locked_app' | 'file_not_found' | 'locked_chat'

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
  showAlert(
    'Файлът не е намерен',
    '„Курсова работа - Пламена.docx" не може да бъде намерен или е бил изтрит.',
    false, 'Затвори', 'ОК'
  );
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
      // Always wrong password
      document.getElementById('alertTitle').textContent = 'Грешна парола';
      document.getElementById('alertMsg').textContent = 'Неправилна парола. Опитай отново.';
      document.getElementById('alertInput').value = '';
      document.getElementById('alertInput').focus();
    } else {
      closeAlert();
    }
    return;
  }
  closeAlert();
}

// Allow Enter key in alert input
document.getElementById('alertInput').addEventListener('keydown', function(e) {
  if (e.key === 'Enter') submitAlert();
});

// ─── Mail ──────────────────────────────────────────────────────────────────────
const mailItems = [
  {
    from: 'Евгени Игнатов',
    subject: 'Курсовата работа',
    date: 'Вчера, 18:20',
    body: 'Здравей,\n\nИсках да те попитам за срока на предаване на курсовата работа по Икономическа социология. Доколкото знам, крайният срок е 8 юли, но не съм сигурен дали е окончателен.\n\nТи предала ли си вече? Имаш ли написано нещо? Аз съм на около 60% готов, но ми трябват още примери.\n\nМоже ли да се срещнем утре в библиотеката и да поработим заедно?\n\nПоздрави,\nЕвгени',
    attachment: null
  },
  null,
  {
    from: 'Пловдивски Университет',
    subject: 'Уверение за студентски статус',
    date: 'Днес, 17:42',
    body: 'Уважаеми студент,\n\nПрикачен е Вашият документ „Уверение за студентски статус" за академичната 2025/2026 г.\n\nДокументът е валиден за всички официални цели.\n\nС уважение,\nСтудентска канцелария',
    attachment: 'Уверение.pdf'
  }
];

function openMail(idx) {
  const mail = mailItems[idx];
  if (!mail) return;
  const detail = document.getElementById('mailDetailContent');
  detail.innerHTML = `
    <div style="border-bottom:0.5px solid #e5e5ea;padding-bottom:16px;margin-bottom:16px;">
      <div style="font-size:22px;font-weight:700;color:#000;margin-bottom:10px;">${mail.subject}</div>
      <div style="display:flex;justify-content:space-between;align-items:flex-start;">
        <div>
          <div style="font-size:16px;font-weight:600;">${mail.from}</div>
          <div style="font-size:13px;color:#8e8e93;">До: мен</div>
        </div>
        <div style="font-size:13px;color:#8e8e93;">${mail.date}</div>
      </div>
    </div>
    ${mail.attachment ? `
    <div style="display:flex;align-items:center;gap:10px;background:#f2f2f7;border-radius:12px;padding:10px 14px;margin-bottom:16px;">
      <div style="width:38px;height:38px;background:#ff3b30;border-radius:8px;display:flex;align-items:center;justify-content:center;flex-shrink:0;">
        <span style="color:#fff;font-size:8px;font-weight:900;letter-spacing:0.5px;">PDF</span>
      </div>
      <div>
        <div style="font-size:14px;font-weight:600;">${mail.attachment}</div>
        <div style="font-size:12px;color:#8e8e93;">PDF Document • 348 KB</div>
      </div>
    </div>` : ''}
    <div style="font-size:16px;line-height:1.65;white-space:pre-wrap;color:#000;">${mail.body}</div>
  `;
  document.getElementById('app-mail-detail').classList.add('active');
}

function closeMail() {
  document.getElementById('app-mail-detail').classList.remove('active');
}

// ─── MVR Sub-sections ─────────────────────────────────────────────────────────
function openMvrSection(section) {
  document.getElementById('app-mvr-' + section).classList.add('active');
}

function closeMvrSection() {
  ['razpit', 'veshti'].forEach(s => {
    const el = document.getElementById('app-mvr-' + s);
    if (el) el.classList.remove('active');
  });
}

// ─── Reminders toggle ─────────────────────────────────────────────────────────
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

// ─── Messages ─────────────────────────────────────────────────────────────────
const avatarColors = {
  red:    'linear-gradient(135deg,#ff6b6b,#ee5a24)',
  blue:   'linear-gradient(135deg,#4da6ff,#007aff)',
  pink:   'linear-gradient(135deg,#f093fb,#f5576c)',
  green:  'linear-gradient(135deg,#43e97b,#38f9d7)',
  purple: 'linear-gradient(135deg,#a18cd1,#fbc2eb)',
  orange: 'linear-gradient(135deg,#f6d365,#fda085)',
  gray:   'linear-gradient(180deg,#a4b2c6,#7a8ba3)',
  teal:   'linear-gradient(135deg,#0abde3,#48dbfb)',
  dark:   '#3a3a3c',
};

const aaContacts = [
  { name: 'Елия',    avatar: 'red',    time: 'Сега',  preview: 'Ок, довиждане! ❤️', msgs: [
    { out: false, text: 'Здравей! Как си?',                   time: '10:00' },
    { out: true,  text: 'Добре, ти?',                         time: '10:02' },
    { out: false, text: 'Страхотно! Идваш ли вечерта?',      time: '10:04' },
    { out: true,  text: 'Да, ще дойда около 19:00',           time: '10:06' },
    { out: false, text: 'Ок, довиждане! ❤️',                  time: 'Сега'  },
  ]},
  { name: 'Митко',   avatar: 'blue',   time: '12:30', preview: 'Бе, тия задачи ли ти ги даде проф.а?', msgs: [
    { out: false, text: 'Бе, тия задачи ли ти ги даде проф.а?', time: '12:30' },
    { out: true,  text: 'Да, вчера ни ги даде',                  time: '12:35' },
    { out: false, text: 'Как ги реши ти?',                        time: '12:36' },
  ]},
  { name: 'Росина',  avatar: 'pink',   time: '11:05', preview: 'Идваш ли на рожденика в събота?', msgs: [
    { out: false, text: 'Идваш ли на рожденика в събота?',  time: '11:05' },
    { out: true,  text: 'Разбира се! Подарък куплено ✓',    time: '11:10' },
  ]},
  { name: 'Енислав', avatar: 'green',  time: 'Вчера', preview: 'Виж тази снимка 😂', msgs: [
    { out: false, text: 'Виж тази снимка 😂', time: 'Вчера' },
    { out: true,  text: 'HAHAHA 💀',           time: 'Вчера' },
  ]},
  { name: 'Бела',    avatar: 'purple', time: 'Вчера', preview: 'Утре следобед?', msgs: [
    { out: false, text: 'Ела да се видим!',     time: 'Вчера' },
    { out: true,  text: 'Кога ти е удобно?',    time: 'Вчера' },
    { out: false, text: 'Утре следобед?',       time: 'Вчера' },
  ]},
  { name: 'Мама',    avatar: 'orange', time: '08:00', preview: 'Добре. Пази се!', msgs: [
    { out: false, text: 'Яла ли си?',        time: '08:00' },
    { out: true,  text: 'Да мамо, ядох',     time: '08:05' },
    { out: false, text: 'Добре. Пази се!',   time: '08:06' },
  ]},
  { name: 'Баща',    avatar: 'gray',   time: 'Пет.',  preview: 'В неделя', msgs: [
    { out: false, text: 'Кога идваш вкъщи?', time: 'Пет.' },
    { out: true,  text: 'В неделя',          time: 'Пет.' },
  ]},
  { name: 'Кари',    avatar: 'teal',   time: 'Чет.',  preview: 'Ok да тогава!', msgs: [
    { out: true,  text: 'Можеш ли да ми помогнеш с нещо?', time: 'Чет.' },
    { out: false, text: 'Ok да тогава!',                   time: 'Чет.' },
  ]},
  { name: 'Даниел',  avatar: 'dark',   time: 'Ср.',   preview: '🔒 Заключено', msgs: [], locked: true },
];

function renderAAMessages() {
  const list = document.getElementById('aaMsgList');
  if (!list) return;
  list.innerHTML = aaContacts.map((c, i) => {
    const col = avatarColors[c.avatar] || '#8e8e93';
    return `
      <div class="aa-msg-item" onclick="${c.locked ? 'openLockedChat()' : 'openChat(' + i + ')'}">
        <div class="aa-msg-avatar" style="background:${col};">${c.locked ? '🔒' : c.name[0]}</div>
        <div class="aa-msg-info">
          <div class="aa-msg-top">
            <div class="aa-msg-name">${c.name}</div>
            <div style="display:flex;align-items:center;gap:4px;">
              <span class="aa-msg-time">${c.time}</span>
              <span style="color:#c7c7cc;font-size:18px;">›</span>
            </div>
          </div>
          <div class="aa-msg-preview">${c.preview}</div>
        </div>
      </div>`;
  }).join('');
}
renderAAMessages();

// ─── Chat ──────────────────────────────────────────────────────────────────────
let currentChatIdx = 0;

function openChat(idx) {
  currentChatIdx = idx;
  const c = aaContacts[idx];
  document.getElementById('chatTitle').textContent = c.name;
  const col = avatarColors[c.avatar] || '#8e8e93';
  const av = document.getElementById('chatAvatarNode');
  av.style.background = col;
  av.innerHTML = `<span style="font-weight:700;font-size:16px;">${c.name[0]}</span>`;

  const box = document.getElementById('chatMessages');
  box.innerHTML = c.msgs.map((m, i) => {
    const isLast = i === c.msgs.length - 1;
    const nextDiff = isLast || c.msgs[i + 1].out !== m.out;
    return `
      <div style="display:flex;flex-direction:column;align-items:${m.out ? 'flex-end' : 'flex-start'};width:100%;">
        <div class="bubble ${m.out ? 'out' : 'in'} ${nextDiff ? 'tail' : ''}" style="white-space:pre-wrap;">${m.text}</div>
        ${nextDiff ? `<div class="bubble-time">${m.time}</div>` : ''}
      </div>`;
  }).join('');
  box.scrollTop = box.scrollHeight;
  document.getElementById('chatInput').value = '';
  document.getElementById('app-chat').classList.add('active');
}

function closeChat() {
  document.getElementById('app-chat').classList.remove('active');
}

function sendChatMsg() {
  const inp = document.getElementById('chatInput');
  const text = inp.value.trim();
  if (!text) return;
  const now = new Date();
  const t = String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0');
  aaContacts[currentChatIdx].msgs.push({ out: true, text, time: t });
  aaContacts[currentChatIdx].preview = text;
  aaContacts[currentChatIdx].time = t;
  inp.value = '';
  renderAAMessages();
  openChat(currentChatIdx);
}

document.getElementById('chatInput').addEventListener('keydown', e => { if (e.key === 'Enter') sendChatMsg(); });

// ─── Maps (Leaflet) ───────────────────────────────────────────────────────────
let mapInstance = null;
let mapRoute = null;
let mapPins = [];

function initMapsApp() {
  const container = document.getElementById('mapLeaflet');
  if (!container) return;
  if (mapInstance) { setTimeout(() => mapInstance.invalidateSize(), 100); return; }

  mapInstance = L.map('mapLeaflet', {
    center: [43.5731, 27.8269],
    zoom: 14,
    zoomControl: false,
    attributionControl: false
  });
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(mapInstance);

  setTimeout(() => {
    mapInstance.invalidateSize();
    drawEliyaRoute();
  }, 400);
}

async function drawEliyaRoute() {
  if (!mapInstance) return;
  if (mapRoute) { mapInstance.removeLayer(mapRoute); mapRoute = null; }
  mapPins.forEach(p => mapInstance.removeLayer(p));
  mapPins = [];

  const from = [43.5731, 27.8269];
  const to   = [43.5621, 27.8430];

  const mkIcon = (color) => L.divIcon({
    className: '',
    html: `<div style="width:14px;height:14px;background:${color};border:3px solid #fff;border-radius:50%;box-shadow:0 2px 8px rgba(0,0,0,0.4);"></div>`,
    iconSize: [14, 14], iconAnchor: [7, 7]
  });

  mapPins.push(
    L.marker(from, { icon: mkIcon('#34c759') }).addTo(mapInstance).bindPopup('Вие сте тук'),
    L.marker(to,   { icon: mkIcon('#ff3b30') }).addTo(mapInstance).bindPopup('Апартамент на Елия')
  );

  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${from[1]},${from[0]};${to[1]},${to[0]}?overview=full&geometries=geojson`;
    const res  = await fetch(url);
    const data = await res.json();
    if (data.routes && data.routes[0]) {
      const coords = data.routes[0].geometry.coordinates.map(c => [c[1], c[0]]);
      mapRoute = L.polyline(coords, { color: '#007aff', weight: 8, opacity: 0.85, lineCap: 'round', lineJoin: 'round' }).addTo(mapInstance);
      mapInstance.fitBounds(mapRoute.getBounds(), { padding: [80, 80] });
    }
  } catch (_) {
    mapRoute = L.polyline([from, to], { color: '#007aff', weight: 8, opacity: 0.7, dashArray: '10,8' }).addTo(mapInstance);
    mapInstance.fitBounds([from, to], { padding: [80, 80] });
  }
}

function mapZoom(delta) {
  if (mapInstance) mapInstance.setZoom(mapInstance.getZoom() + delta);
}

// ─── Find My (Leaflet) ────────────────────────────────────────────────────────
let findmyMap = null;

function initFindMyMap() {
  const container = document.getElementById('findmyMap');
  if (!container) return;
  if (findmyMap) { setTimeout(() => findmyMap.invalidateSize(), 100); return; }

  const eliyaPos = [43.5750, 27.8310];

  findmyMap = L.map('findmyMap', {
    center: eliyaPos,
    zoom: 15,
    zoomControl: false,
    attributionControl: false
  });
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(findmyMap);

  // Pulsing dot for Eliya
  const pulseIcon = L.divIcon({
    className: '',
    html: `
      <div style="position:relative;width:24px;height:24px;">
        <div style="position:absolute;inset:0;background:rgba(255,107,107,0.3);border-radius:50%;animation:pulse 2s infinite;"></div>
        <div style="position:absolute;top:4px;left:4px;width:16px;height:16px;background:#ff6b6b;border:3px solid #fff;border-radius:50%;box-shadow:0 2px 8px rgba(0,0,0,0.4);"></div>
      </div>`,
    iconSize: [24, 24], iconAnchor: [12, 12]
  });

  L.marker(eliyaPos, { icon: pulseIcon }).addTo(findmyMap);

  // Add pulse animation
  const style = document.createElement('style');
  style.textContent = `@keyframes pulse { 0%,100%{transform:scale(1);opacity:0.6} 50%{transform:scale(1.8);opacity:0} }`;
  document.head.appendChild(style);

  setTimeout(() => findmyMap.invalidateSize(), 300);
}
