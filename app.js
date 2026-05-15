// Clock
function updateClock() {
  const now = new Date();
  const h = String(now.getHours()).padStart(2, '0');
  const m = String(now.getMinutes()).padStart(2, '0');
  document.getElementById('clock').textContent = h + ':' + m;
  const days = ['Неделя', 'Понеделник', 'Вторник', 'Сряда', 'Четвъртък', 'Петък', 'Събота'];
  const months = ['Януари', 'Февруари', 'Март', 'Април', 'Май', 'Юни', 'Юли', 'Август', 'Септември', 'Октомври', 'Ноември', 'Декември'];
  document.getElementById('date').textContent = days[now.getDay()] + ', ' + now.getDate() + ' ' + months[now.getMonth()];
}
updateClock();
setInterval(updateClock, 30000);

function openApp(name) {
  document.querySelectorAll('.app-overlay').forEach(el => el.classList.remove('active'));
  const el = document.getElementById('app-' + name);
  if (el) {
    el.classList.add('active');
    if (name === 'phone') { renderAACalls(); switchAAPhoneTab('calls'); }
    if (name === 'messages') { renderAAMessages(); }
    if (name === 'camera') { startCamera(); }
    if (name === 'photos') { renderPhotos(); }
    if (name === 'mail') { renderMailList(); }
  }
}

function closeApp() {
  document.querySelectorAll('.app-overlay').forEach(el => el.classList.remove('active'));
  stopCamera();
}

let cameraStream = null;
async function startCamera() {
  const video = document.getElementById('cameraVideo');
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    alert("Твоят браузър не поддържа достъп до камера в този режим.");
    return;
  }
  try {
    cameraStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false });
    video.srcObject = cameraStream;
  } catch (e) { alert("Грешка при достъп до камерата: " + e); }
}

function stopCamera() {
  if (cameraStream) {
    cameraStream.getTracks().forEach(track => track.stop());
    cameraStream = null;
  }
  const video = document.getElementById('cameraVideo');
  if (video) video.srcObject = null;
}

const photosData = [
  { url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400', video: '0:09' },
  { url: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=400', video: '0:06' },
  { url: 'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=400' },
  { url: 'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=400' },
  { url: 'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=400' },
  { url: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400' },
  { url: 'https://images.unsplash.com/photo-1426604966848-d7adac402bff?w=400' },
  { url: 'https://images.unsplash.com/photo-1497436072909-60f360e1d4b1?w=400' },
  { url: 'https://images.unsplash.com/photo-1518173946687-a4c8892bbd9f?w=400' }
];

function renderPhotos() {
  const grid = document.getElementById('photoGrid');
  if (!grid) return;
  grid.innerHTML = photosData.map(p => `
    <div onclick="openPhoto('${p.url}', ${!!p.video})" style="aspect-ratio: 1/1; background: url('${p.videoThumb || p.url}') center center / cover; position: relative; cursor: pointer;">
      ${p.video ? `
        <div style="position:absolute; inset:0; display:flex; align-items:center; justify-content:center; background:rgba(0,0,0,0.1);">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="white"><path d="M8 5v14l11-7z"/></svg>
        </div>
        <span style="position:absolute; bottom:4px; right:4px; color:#fff; font-size:11px; font-weight:700; background:rgba(0,0,0,0.4); padding: 1px 4px; border-radius:4px;">${p.video}</span>
      ` : ''}
    </div>
  `).join('');
}

function openPhoto(url, isVideo = false) {
  const img = document.getElementById('fullPhotoImg');
  const video = document.getElementById('fullPhotoVideo');
  if (isVideo) {
    img.style.display = 'none';
    video.style.display = 'block';
    video.src = url;
    video.play();
  } else {
    video.style.display = 'none';
    if (video.src) video.pause();
    img.style.display = 'block';
    img.src = url;
  }
  document.getElementById('app-full-photo').classList.add('active');
}

function closePhotoViewer() {
  const video = document.getElementById('fullPhotoVideo');
  if (video) video.pause();
  document.getElementById('app-full-photo').classList.remove('active');
}

const mailsData = [
  {
    id: 0,
    unread: true,
    sender: "НИК - МВР (Сектор „ДНК анализи“)",
    email: "dnk.lab@nik-mvr.bg",
    subject: "Известие за готов експертен анализ по преписка № 2948/2026",
    preview: "Уведомяваме Ви, че назначената биологична експертиза на обект, иззет в качеството на веществено доказателство, е завършена.",
    time: "14:20",
    date: "14 May 2026",
    isOfficial: true,
    attachments: [{ name: "Protocol_NIK_2026_884.pdf", size: "2.4 MB" }],
    body: "ДО:\nЗаявител / Пострадало лице\n\nИЗВЕСТИЕ ЗА ИЗГОТВЕНА ЕКСПЕРТИЗА\n\nУведомяваме Ви, че назначената биологична експертиза на обект, иззет в качеството на веществено доказателство е завършена от дежурния експерт в Лабораторията за ДНК профилиране."
  },
  {
    id: 2,
    unread: true,
    sender: "Редакция - „BG Репортер“",
    email: "investigations@bg-reporter.bg",
    subject: "Чернова за одобрение: Имотна мафия в София (Статия №2)",
    preview: "Прикачвам текста за втората част от разследването ни за измамите с апартаменти.",
    time: "11:15",
    date: "12 May",
    attachments: [{ name: "Draft_Property_Scams_v2.docx", size: "1.1 MB" }],
    body: "Здравей,\n\nПрикачвам финалната чернова на Статия №2 от поредицата ни за имотните измами в София."
  },
  {
    id: 3,
    unread: true,
    sender: "Секюрити Системс ООД",
    email: "archive@security-systems.bg",
    subject: "Заявка за архив: Камера 04 (Вход Нотариус)",
    preview: "Изпращаме Ви изискания запис от външната камера пред кантората на нотариус Петров.",
    time: "09:30",
    date: "13 May",
    attachments: [{ name: "clip_20260510_1415.mp4", size: "42.0 MB" }],
    body: "Уважаеми клиенти,\n\nПрикачваме файл с извлечение от камера CAM_04_EXT."
  },
  {
    id: 4,
    unread: true,
    sender: "инсп. Мартин Стоянов (СДВР)",
    email: "m.stoyanov@sdvr.mvr.bg",
    subject: "Протокол от разпит: Служител на заложна къща",
    preview: "Прикачвам показанията на касиера относно златния часовник.",
    time: "16:05",
    date: "14 May",
    isOfficial: true,
    attachments: [{ name: "Stenograma_Express_Cash.pdf", size: "0.8 MB" }],
    body: 'Колега, изпращам ти стенограма от разпита на свидетеля Кирил Делев.\n\nВажно: Делев си спомня, че заподозреният е имал специфична татуировка на лявата предмишница – символ, наподобяващ вълк или куче.\n\nЗабележка: Провери дали в обекта има работещи камери, тъй като свидетелят твърди, че системата им е била в профилактика точно в този ден.\n\nПротоколът е заведен към преписка № 441/2026.\n\nПоздрави,\nинсп. М. Стоянов\nСектор „Престъпления срещу собствеността“'
  },
  {
    id: 5,
    unread: true,
    sender: 'Система - Заложна къща „Експрес Кеш“',
    email: 'reports@express-cash.bg',
    subject: 'Дневен отчет: Продажби и залози (10.05 - 12.05)',
    preview: 'Генериран отчет за период от 3 работни дни.',
    time: '08:00',
    date: '13 May',
    attachments: [{ name: 'Daily_Report_Lombard_v4.xls', size: '1.4 MB' }],
    body: 'АВТОМАТИЧЕН ОТЧЕТ НА ТЪРГОВСКАТА ДЕЙНОСТ\n\nПериод: 10 май 2026 - 12 май 2026\nОбект: Клон 04 - ж.к. Люлин\n\n--- 10.05.2026 ---\n• ЗАЛОГ: Лаптоп MSI (i5, RTX 3050) - Сума: 650 лв. - Клиент: И. Иванов\n• ПРОДАЖБА: Сребърен пръстен (4.2г) - Сума: 45 лв.\n• ИЗТЕКЪЛ СРОК: Златна верижка (договор #9912) - Преместена за витрина.\n\n--- 11.05.2026 ---\n• ЗАЛОГ: iPhone 14, 128GB - Сума: 800 лв. - Клиент: П. Димов\n• ОТКАЗАН ЗАЛОГ: Златен часовник (гравиран) - Лицето отказа легитимация.\n• ПРОДАЖБА: Таблет iPad 9th Gen - Сума: 400 лв.\n\n--- 12.05.2026 ---\n• ЗАЛОГ: Автокасетофон Sony - Сума: 30 лв. - Клиент: Г. Георгиев\n• ПРОДАЖБА: Обект #882-Г (Върната вещ от експертиза) - СТАТУС: ИЗЗЕТ ОТ МВР\n• РЕАЛИЗАЦИЯ: Велосипед Drag - Сума: 120 лв.\n\n--------------------------------------\nОбщ оборот за периода: 1245.00 лв.\nНаличност в касата: 4320.60 лв.\n\nБележка на управителя: Да се провери защо камера 2 не е записала инцидента с часовника на 11-ти.\n\n*Това съобщение е генерирано автоматично от софтуер „LombardPro v4.2“*'
  }
];

const avatarColors = ["#ff3b30", "#ff9500", "#34c759", "#007aff", "#5856d6", "#af52de"];

function getInitials(name) {
  return name.split(" ").map(w => w[0]).join("").substring(0, 2).toUpperCase();
}

function renderMailList() {
  const list = document.getElementById("mailList");
  if (!list) return;
  const unreadCount = mailsData.filter(m => m.unread).length;
  const countEl = document.getElementById("mailUnreadCount");
  if (countEl) countEl.textContent = unreadCount > 0 ? unreadCount + " Unread" : "All Read";

  let html = "";
  mailsData.forEach((mail, i) => {
    const color = avatarColors[i % avatarColors.length];
    const initials = getInitials(mail.sender);
    html += `<div class="mail-row" onclick="openMailDetail(${mail.id})">
      ${mail.unread ? '<div class="mail-unread-dot"></div>' : '<div style="width:10px;flex-shrink:0;"></div>'}
      <div style="width:44px;height:44px;border-radius:50%;background:${color};display:flex;align-items:center;justify-content:center;font-size:17px;font-weight:700;color:#fff;flex-shrink:0;">${initials}</div>
      <div style="flex:1;min-width:0;">
        <div style="display:flex;justify-content:space-between;align-items:baseline;gap:8px;">
          <div class="mail-sender" style="font-weight:${mail.unread ? '700' : '400'};">${mail.sender}</div>
          <div class="mail-time">${mail.time}</div>
        </div>
        <div class="mail-subject" style="font-weight:${mail.unread ? '600' : '400'};">${mail.subject}</div>
        <div class="mail-preview">${mail.preview}</div>
      </div>
      <svg width="8" height="14" viewBox="0 0 8 14" fill="none" stroke="#c7c7cc" stroke-width="2" stroke-linecap="round" style="flex-shrink:0;margin-top:14px;"><polyline points="1 1 7 7 1 13"/></svg>
    </div>`;
  });
  list.innerHTML = html;
}

function openMailDetail(id) {
  const mail = mailsData.find(m => m.id === id);
  if (!mail) return;
  mail.unread = false;
  renderMailList();
  const color = avatarColors[id % avatarColors.length];
  document.getElementById("mailDetailSubject").textContent = mail.subject;
  document.getElementById("mailDetailSender").textContent = mail.sender + " <" + mail.email + ">";
  document.getElementById("mailDetailTime").textContent = mail.date;
  const avatar = document.getElementById("mailDetailAvatar");
  if (avatar) {
    avatar.style.background = color;
    avatar.textContent = getInitials(mail.sender);
  }
  document.getElementById("mailDetailBody").textContent = mail.body;

  const attachDiv = document.getElementById("mailAttachments");
  if (attachDiv) {
    if (mail.attachments && mail.attachments.length > 0) {
      attachDiv.style.display = "block";
      document.getElementById("attachmentName").textContent = mail.attachments[0].name;
      document.getElementById("attachmentSize").textContent = mail.attachments[0].size;
    } else {
      attachDiv.style.display = "none";
    }
  }
  document.getElementById("app-mail-detail").classList.add("active");
}

function closeMailDetail() {
  document.getElementById("app-mail-detail").classList.remove("active");
}

function openMailCompose() {
  alert('Compose: функцията е само за демонстрация.');
}

// Assistive Access Phone Calls
let aaCallHistory = [
  { name: 'Bela', type: 'mobile', dir: 'in', missed: false, time: 'Yesterday', avatar: 'purple', initial: 'B' },
];

function renderAACalls() {
  const list = document.getElementById('aaCallList');
  if (!list) return;
  list.innerHTML = aaCallHistory.map(c => {
    let arrow = '';
    if (c.dir === 'in') {
      arrow = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8e8e93" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="margin-right:4px;margin-top:2px;"><line x1="17" y1="7" x2="7" y2="17"/><polyline points="17 17 7 17 7 7"/></svg>';
    } else {
      arrow = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8e8e93" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="margin-right:4px;margin-top:2px;"><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></svg>';
    }

    let avatarContent = '';
    if (c.avatar === 'purple') avatarContent = c.initial;
    else avatarContent = '<svg viewBox="0 0 24 24" width="36" height="36" fill="#fff"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>';

    return `
      <div class="aa-call-item">
        <div class="aa-avatar ${c.avatar}">${avatarContent}</div>
        <div class="aa-call-info">
          <div class="aa-call-name ${c.missed ? 'missed' : ''}">${c.name}</div>
          <div class="aa-call-sub">${arrow}${c.type}</div>
        </div>
        <div class="aa-call-time">${c.time}</div>
        <button class="aa-call-btn">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>
        </button>
      </div>
    `;
  }).join('');
}
renderAACalls();

function switchAAPhoneTab(tab) {
  const callsTab = document.getElementById('aaTabCalls');
  const keypadTab = document.getElementById('aaTabKeypad');
  if (callsTab) callsTab.style.display = tab === 'calls' ? 'flex' : 'none';
  if (keypadTab) keypadTab.style.display = tab === 'keypad' ? 'flex' : 'none';

  document.getElementById('aaNavCalls').classList.toggle('active', tab === 'calls');
  document.getElementById('aaNavKeypad').classList.toggle('active', tab === 'keypad');
}

let aaDialNumber = '';
function updateAADialDisplay() {
  document.getElementById('aaDialDisplay').innerText = aaDialNumber;
  document.getElementById('aaDialDelBtn').style.display = aaDialNumber.length > 0 ? 'block' : 'none';
}
function aaDialPress(n) {
  if (aaDialNumber.length < 15) { aaDialNumber += n; updateAADialDisplay(); }
}
function aaDialDel() {
  aaDialNumber = aaDialNumber.slice(0, -1);
  updateAADialDisplay();
}
function aaDialCall() {
  if (!aaDialNumber) return;
  alert('Позвъняване към: ' + aaDialNumber);

  const now = new Date();
  const t = String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0');
  aaCallHistory.unshift({ name: aaDialNumber, type: 'mobile', dir: 'out', missed: false, time: t, avatar: 'default', initial: '' });
  renderAACalls();

  aaDialNumber = '';
  updateAADialDisplay();
  switchAAPhoneTab('calls');
}

// Meds
function toggleMed(el) {
  el.querySelector('.med-check').classList.toggle('done');
}

// Assistive Access Messages Data
let aaMessagesData = [
  { name: 'Vivacom', time: '13:30', preview: 'Здравейте, плащането на сума\n20.45 € | 40.0 лв. по месечна факm...', avatar: 'default' },
];

function renderAAMessages() {
  const list = document.getElementById('aaMsgList');
  if (!list) return;
  list.innerHTML = aaMessagesData.map((m, i) => {
    let avatarContent = '';
    if (m.avatar === 'default') {
      avatarContent = '<svg viewBox="0 0 24 24" width="36" height="36" fill="#fff"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>';
    } else {
      avatarContent = '<div style="width:100%;height:100%;background:#e5e5ea;display:flex;align-items:center;justify-content:center;color:#000;font-size:18px;">👥</div>';
    }

    return `
      <div class="aa-msg-item" onclick="openChat(${i})">
        <div class="aa-msg-avatar ${m.avatar}">${avatarContent}</div>
        <div class="aa-msg-info">
          <div class="aa-msg-top">
            <div class="aa-msg-name">${m.name}</div>
            <div class="aa-msg-time-chevron">
              <span class="aa-msg-time">${m.time}</span>
              <span class="aa-msg-chevron">›</span>
            </div>
          </div>
          <div class="aa-msg-preview">${m.preview.replace(/\n/g, '<br>')}</div>
        </div>
      </div>
    `;
  }).join('');
}
renderAAMessages();

const contacts = [
  {
    name: 'Vivacom', avatar: '💬', msgs: [
      { out: false, text: 'Уважаеми клиенти, бихме искали да ви уведомим за промяна в Общите условия.', time: '09:00' },
      { out: true, text: 'Здравейте, какви са тези промени?', time: '09:05' },
      { out: false, text: 'Здравейте! Промените касаят индексацията на таксите с оглед на инфлацията.', time: '09:12' },
      { out: true, text: 'Това означава ли, че сметката ми ще се увеличи?', time: '09:15' },
      { out: false, text: 'Увеличението ще бъде минимално, средно с около 1-2 лева на месец.', time: '09:18' },
      { out: true, text: 'Мога ли да прекратя договора си без неустойки заради това?', time: '09:20' },
      { out: false, text: 'Да, имате право да прекратите договора без неустойки в срок до един месец след влизане на промените.', time: '09:25' },
      { out: true, text: 'Къде мога да прочета пълните условия?', time: '09:30' },
      { out: false, text: 'Пълните условия са достъпни на нашия сайт www.vivacom.bg, както и във всеки наш магазин.', time: '09:32' },
      { out: true, text: 'Добре, благодаря за информацията.', time: '09:35' },
      { out: false, text: 'Моля! Ако имате други въпроси, ние сме насреща.', time: '09:40' },
      { out: true, text: 'Всъщност имам още един въпрос. Интернетът ми прекъсва.', time: '10:00' },
      { out: false, text: 'Бихте ли ми предоставили ЕГН или клиентски номер за проверка?', time: '10:05' },
      { out: true, text: 'Да, клиентският ми номер е 123456789.', time: '10:06' },
      { out: false, text: 'Благодаря. Проверявам статуса на вашата услуга...', time: '10:10' },
      { out: false, text: 'Виждам, че има временни смущения в района Ви заради ремонтни дейности.', time: '10:12' },
      { out: true, text: 'Кога ще бъде отстранен проблемът?', time: '10:15' },
      { out: false, text: 'Колегите работят по въпроса. Очакваме възстановяване до 12:00 ч.', time: '10:20' },
      { out: true, text: 'Разбрах. Надявам се да е по-скоро.', time: '10:25' },
      { out: false, text: 'Извиняваме се за причиненото неудобство!', time: '10:30' },
      { out: true, text: 'Всичко е наред, случват се такива неща.', time: '10:35' },
      { out: false, text: 'Услугата Ви вече трябва да работи нормално. Бихте ли потвърдили?', time: '12:15' },
      { out: true, text: 'Да, имам интернет. Благодаря!', time: '12:20' },
      { out: false, text: 'Здравейте, плащането на сума 20.45 € | 40.0 лв. по месечна фактура е успешно.', time: '13:30' }
    ]
  }
];
let currentChat = 0;

function openChat(idx) {
  currentChat = idx;
  const c = contacts[idx];
  document.getElementById('chatTitle').textContent = c.name;

  let avatarContent = '';
  if (c.avatar === '💬') {
    avatarContent = '<svg viewBox="0 0 24 24" width="24" height="24" fill="#fff"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>';
    document.getElementById('chatAvatarNode').style.background = 'linear-gradient(180deg, #a4b2c6, #7a8ba3)';
  } else {
    avatarContent = '👥';
    document.getElementById('chatAvatarNode').style.background = '#e5e5ea';
    document.getElementById('chatAvatarNode').style.color = '#000';
  }
  document.getElementById('chatAvatarNode').innerHTML = avatarContent;

  const box = document.getElementById('chatMessages');
  box.innerHTML = c.msgs.map((m, i) => {
    let showTail = i === c.msgs.length - 1 || c.msgs[i + 1].out !== m.out;
    let showTime = showTail;
    return `<div style="display: flex; flex-direction: column; align-items: ${m.out ? 'flex-end' : 'flex-start'}; width: 100%;">
      <div class="bubble ${m.out ? 'out' : 'in'} ${showTail ? 'tail' : ''}" style="white-space: pre-wrap;">${m.text}</div>
      ${showTime ? `<div class="bubble-time">${m.time}</div>` : ''}
    </div>`
  }).join('');
  box.scrollTop = box.scrollHeight;
  document.getElementById('app-chat').classList.add('active');
  document.getElementById('chatInput').value = '';
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
  contacts[currentChat].msgs.push({ out: true, text, time: t });
  inp.value = '';

  // Also update preview in the Messages list
  aaMessagesData[currentChat].preview = text;
  aaMessagesData[currentChat].time = t;
  renderAAMessages();

  openChat(currentChat);
}

const chatInput = document.getElementById('chatInput');
if (chatInput) {
  chatInput.addEventListener('keydown', e => { if (e.key === 'Enter') sendChatMsg(); });
}
