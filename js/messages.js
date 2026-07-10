const avatarColors = {
    red: 'linear-gradient(135deg,#ff6b6b,#ee5a24)',
    blue: 'linear-gradient(135deg,#4da6ff,#007aff)',
    pink: 'linear-gradient(135deg,#f093fb,#f5576c)',
    green: 'linear-gradient(135deg,#43e97b,#38f9d7)',
    purple: 'linear-gradient(135deg,#a18cd1,#fbc2eb)',
    orange: 'linear-gradient(135deg,#f6d365,#fda085)',
    gray: 'linear-gradient(180deg,#a4b2c6,#7a8ba3)',
    teal: 'linear-gradient(135deg,#0abde3,#48dbfb)',
    dark: '#3a3a3c',
};
const aaContacts = [
    {
        name: 'Елия', avatar: 'red', time: 'Сега', preview: 'Ок, довиждане! ❤️', msgs: [
            { out: false, text: 'Здравей! Как си?', time: '10:00' },
            { out: true, text: 'Добре, ти?', time: '10:02' },
            { out: false, text: 'Страхотно! Идваш ли вечерта?', time: '10:04' },
            { out: true, text: 'Да, ще дойда около 19:00', time: '10:06' },
            { out: false, text: 'Ок, довиждане! ❤️', time: 'Сега' },
        ]
    },
    {
        name: 'Митко', avatar: 'blue', time: '12:30', preview: 'Бе, тия задачи ли ти ги даде проф.а?', msgs: [
            { out: false, text: 'Бе, тия задачи ли ти ги даде проф.а?', time: '12:30' },
            { out: true, text: 'Да, вчера ни ги даде', time: '12:35' },
            { out: false, text: 'Как ги реши ти?', time: '12:36' },
        ]
    },
    {
        name: 'Росина', avatar: 'pink', time: '11:05', preview: 'Идваш ли на рожденика в събота?', msgs: [
            { out: false, text: 'Идваш ли на рожденика в събота?', time: '11:05' },
            { out: true, text: 'Разбира се! Подарък куплено ✓', time: '11:10' },
        ]
    },
    {
        name: 'Енислав', avatar: 'green', time: 'Вчера', preview: 'Виж тази снимка 😂', msgs: [
            { out: false, text: 'Виж тази снимка 😂', time: 'Вчера' },
            { out: true, text: 'HAHAHA 💀', time: 'Вчера' },
        ]
    },
    {
        name: 'Бела', avatar: 'purple', time: 'Вчера', preview: 'Утре следобед?', msgs: [
            { out: false, text: 'Ела да се видим!', time: 'Вчера' },
            { out: true, text: 'Кога ти е удобно?', time: 'Вчера' },
            { out: false, text: 'Утре следобед?', time: 'Вчера' },
        ]
    },
    {
        name: 'Мама', avatar: 'orange', time: '08:00', preview: 'Добре. Пази се!', msgs: [
            { out: false, text: 'Яла ли си?', time: '08:00' },
            { out: true, text: 'Да мамо, ядох', time: '08:05' },
            { out: false, text: 'Добре. Пази се!', time: '08:06' },
        ]
    },
    {
        name: 'Баща', avatar: 'gray', time: 'Пет.', preview: 'В неделя', msgs: [
            { out: false, text: 'Кога идваш вкъщи?', time: 'Пет.' },
            { out: true, text: 'В неделя', time: 'Пет.' },
        ]
    },
    {
        name: 'Кари', avatar: 'teal', time: 'Чет.', preview: 'Ok да тогава!', msgs: [
            { out: true, text: 'Можеш ли да ми помогнеш с нещо?', time: 'Чет.' },
            { out: false, text: 'Ok да тогава!', time: 'Чет.' },
        ]
    },
    { name: 'Даниел', avatar: 'dark', time: 'Ср.', preview: '🔒 Заключено', msgs: [], locked: true },
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