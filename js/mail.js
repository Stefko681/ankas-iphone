const mailItems = [
    {
        from: 'Евгени Игнатов',
        subject: 'Курсовата работа',
        date: 'Вчера, 18:20',
        body: 'Здравей,\n\nИсках да те попитам за срока на предаване на курсовата работа по Икономическа социология. Доколкото знам, крайният срок е 8 юли, но не съм сигурен дали е окончателен.\n\nТи предала ли си вече? Имаш ли написано нещо? Аз съм на около 60% готов, но ми трябват още примери.\n\nМоже ли да се срещнем утре в библиотеката и да поработим заедно?\n\nПоздрави,\nЕвгени',
        attachment: null
    },
    {
        from: 'Пловдивски Университет',
        subject: 'Уверение за студентски статус',
        date: 'Днес, 17:42',
        body: 'Уважаеми студент,\n\nПрикачен е Вашият документ „Уверение за студентски статус" за академичната 2025/2026 г.\n\nДокументът е валиден за всички официални цели.\n\nС уважение,\nСтудентска канцелария',
        attachment: 'Уверение.pdf'
    },
    {
        from: 'Нов Подател',
        subject: 'Нова Тема',
        date: 'Днес, 10:00',
        body: 'Текст на съобщението.',
        attachment: null
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