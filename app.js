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
    if (name === 'maps') { initMapsApp(); }
  }
}

function closeApp() {
  document.querySelectorAll('.app-overlay').forEach(el => el.classList.remove('active'));
  stopCamera();
}

// ============================
// MAPS — Leaflet + OSRM routing
// ============================
let mapInstance = null;
let mapRouteLayer = null;
let mapMarkers = [];

function initMapsApp() {
  const container = document.getElementById('mapLeaflet');
  if (!container) return;

  if (mapInstance) {
    mapInstance.invalidateSize();
    return;
  }

  mapInstance = L.map('mapLeaflet', {
    center: [43.5731, 27.8269],
    zoom: 13,
    zoomControl: false,
    attributionControl: false
  });

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(mapInstance);

  // Small attribution in corner (no external link)
  L.control.attribution({ prefix: '© OpenStreetMap' }).addTo(mapInstance);
}

async function showMapsRoute(fromLat, fromLng, toLat, toLng, fromLabel, toLabel) {
  if (!mapInstance) return;

  // Clear previous route and markers
  if (mapRouteLayer) { mapInstance.removeLayer(mapRouteLayer); mapRouteLayer = null; }
  mapMarkers.forEach(m => mapInstance.removeLayer(m));
  mapMarkers = [];

  // Custom pin icon
  const pinIcon = (color) => L.divIcon({
    className: '',
    html: `<div style="width:14px;height:14px;background:${color};border:3px solid #fff;border-radius:50%;box-shadow:0 2px 6px rgba(0,0,0,0.35);"></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7]
  });

  const fromMarker = L.marker([fromLat, fromLng], { icon: pinIcon('#34c759') })
    .addTo(mapInstance).bindPopup(fromLabel);
  const toMarker = L.marker([toLat, toLng], { icon: pinIcon('#ff3b30') })
    .addTo(mapInstance).bindPopup(toLabel);
  mapMarkers.push(fromMarker, toMarker);

  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${fromLng},${fromLat};${toLng},${toLat}?overview=full&geometries=geojson`;
    const res = await fetch(url);
    const data = await res.json();

    if (data.routes && data.routes.length > 0) {
      const coords = data.routes[0].geometry.coordinates.map(c => [c[1], c[0]]);
      mapRouteLayer = L.polyline(coords, {
        color: '#007aff',
        weight: 8,
        opacity: 0.9,
        lineCap: 'round',
        lineJoin: 'round'
      }).addTo(mapInstance);
      mapInstance.fitBounds(mapRouteLayer.getBounds(), { padding: [60, 60] });
    }
  } catch (e) {
    // Fallback: straight line
    mapRouteLayer = L.polyline([[fromLat, fromLng], [toLat, toLng]], {
      color: '#007aff', weight: 8, dashArray: '10 8', opacity: 0.7
    }).addTo(mapInstance);
    mapInstance.fitBounds([[fromLat, fromLng], [toLat, toLng]], { padding: [60, 60] });
  }

  fromMarker.openPopup();
}

async function showSpecialRoute(lat1, lng1, lat2, lng2, lat3, lng3, label1, label2, label3) {
  if (!mapInstance) return;

  // Clear previous
  if (mapRouteLayer) { mapInstance.removeLayer(mapRouteLayer); mapRouteLayer = null; }
  if (window.mapRouteLayer2) { mapInstance.removeLayer(window.mapRouteLayer2); window.mapRouteLayer2 = null; }
  mapMarkers.forEach(m => mapInstance.removeLayer(m));
  mapMarkers = [];

  const pinIcon = (color) => L.divIcon({
    className: '',
    html: `<div style="width:14px;height:14px;background:${color};border:3px solid #fff;border-radius:50%;box-shadow:0 2px 6px rgba(0,0,0,0.35);"></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7]
  });

  // Markers
  const m1 = L.marker([lat1, lng1], { icon: pinIcon('#34c759') }).addTo(mapInstance).bindPopup('Старт: ' + label1);
  const m2 = L.marker([lat2, lng2], { icon: pinIcon('#007aff') }).addTo(mapInstance).bindPopup('Достигнато до: ' + label2);
  const m3 = L.marker([lat3, lng3], { icon: pinIcon('#8e8e93') }).addTo(mapInstance).bindPopup('Цел: ' + label3);
  mapMarkers.push(m1, m2, m3);

  async function getRoute(l1, g1, l2, g2) {
    const url = `https://router.project-osrm.org/route/v1/driving/${g1},${l1};${g2},${l2}?overview=full&geometries=geojson`;
    const res = await fetch(url);
    const data = await res.json();
    return data.routes && data.routes.length > 0 ? data.routes[0].geometry.coordinates.map(c => [c[1], c[0]]) : [[l1, g1], [l2, g2]];
  }

  try {
    const coords1 = await getRoute(lat1, lng1, lat2, lng2);
    const coords2 = await getRoute(lat2, lng2, lat3, lng3);

    // Segment 1: Completed (Solid)
    mapRouteLayer = L.polyline(coords1, {
      color: '#007aff', weight: 10, opacity: 0.95, lineCap: 'round', lineJoin: 'round'
    }).addTo(mapInstance);

    // Segment 1: Completed (Solid Blue)
    mapRouteLayer = L.polyline(coords1, {
      color: '#007aff', weight: 10, opacity: 0.95, lineCap: 'round', lineJoin: 'round'
    }).addTo(mapInstance);

    // Segment 2: Uncompleted (Black Dashed)
    window.mapRouteLayer2Bg = L.polyline(coords2, {
      color: '#000', weight: 12, opacity: 0.1, lineCap: 'round'
    }).addTo(mapInstance);

    window.mapRouteLayer2 = L.polyline(coords2, {
      color: '#000', weight: 10, opacity: 0.8, dashArray: '10, 15', lineCap: 'round', lineJoin: 'round'
    }).addTo(mapInstance);

    const bounds = L.latLngBounds([...coords1, ...coords2]);
    mapInstance.fitBounds(bounds, { padding: [80, 80] });

  } catch (e) {
    console.error("Routing error", e);
  }

  m2.openPopup();
}

function mapZoom(delta) {
  if (!mapInstance) return;
  mapInstance.setZoom(mapInstance.getZoom() + delta);
}

function mapGoToDefault() {
  if (!mapInstance) return;
  mapInstance.setView([43.5731, 27.8269], 13);
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

// Files App Logic
let isFilesUnzipped = false;
const filesData = [
  { id: 1, name: 'police_evidence.zip', size: '45.2 MB', type: 'zip', color: '#5856d6' }
];

const unzippedFiles = [
  { id: 2, name: 'CCTV_Footage_Dobrich.mp4', size: '128 MB', type: 'video', color: '#ff3b30' },
  { id: 3, name: 'Witness_Statements.pdf', size: '2.4 MB', type: 'pdf', color: '#ff9500' },
  { id: 4, name: 'Phone_Extraction_Anton.txt', size: '850 KB', type: 'text', color: '#007aff' },
  { id: 5, name: 'Financial_Records.xls', size: '1.1 MB', type: 'excel', color: '#34c759' },
  { id: 6, name: 'Forensic_Report.doc', size: '3.2 MB', type: 'word', color: '#5ac8fa' }
];

function getFileIcon(type, color) {
  if (type === 'zip') return `<div style="background:${color}; border-radius:10px; width:40px; height:40px; display:flex; align-items:center; justify-content:center;"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path><line x1="12" y1="11" x2="12" y2="17"></line><polyline points="9 14 12 17 15 14"></polyline></svg></div>`;
  if (type === 'video') return `<div style="background:${color}; border-radius:10px; width:40px; height:40px; display:flex; align-items:center; justify-content:center;"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"></rect><line x1="7" y1="2" x2="7" y2="22"></line><line x1="17" y1="2" x2="17" y2="22"></line><line x1="2" y1="12" x2="22" y2="12"></line><line x1="2" y1="7" x2="7" y2="7"></line><line x1="2" y1="17" x2="7" y2="17"></line><line x1="17" y1="17" x2="22" y2="17"></line><line x1="17" y1="7" x2="22" y2="7"></line></svg></div>`;
  if (type === 'pdf') return `<div style="background:${color}; border-radius:10px; width:40px; height:40px; display:flex; align-items:center; justify-content:center;"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg></div>`;
  if (type === 'text') return `<div style="background:${color}; border-radius:10px; width:40px; height:40px; display:flex; align-items:center; justify-content:center;"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg></div>`;
  if (type === 'excel') return `<div style="background:${color}; border-radius:10px; width:40px; height:40px; display:flex; align-items:center; justify-content:center;"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="3" y1="15" x2="21" y2="15"></line><line x1="9" y1="3" x2="9" y2="21"></line><line x1="15" y1="3" x2="15" y2="21"></line></svg></div>`;
  if (type === 'word') return `<div style="background:${color}; border-radius:10px; width:40px; height:40px; display:flex; align-items:center; justify-content:center;"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg></div>`;
  return `<div style="background:#8e8e93; border-radius:10px; width:40px; height:40px; display:flex; align-items:center; justify-content:center;"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path><polyline points="13 2 13 9 20 9"></polyline></svg></div>`;
}

function renderFilesList() {
  const list = document.getElementById('filesList');
  if (!list) return;

  const currentFiles = isFilesUnzipped ? unzippedFiles : filesData;

  list.innerHTML = currentFiles.map((file, idx) => `
    <div style="background:#fff; display:flex; align-items:center; padding:12px 0; cursor:pointer; margin-left:16px; border-bottom:${idx === currentFiles.length - 1 ? 'none' : '0.5px solid #c6c6c8'};" onclick="handleFileClick(${file.id})">
      <div style="margin-right:16px; flex-shrink:0;">${getFileIcon(file.type, file.color)}</div>
      <div style="flex:1; min-width:0;">
        <div style="font-size:17px; font-weight:400; color:#000; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; padding-right:10px;">${file.name}</div>
        <div style="font-size:13px; color:#8e8e93; margin-top:1px;">${file.type.toUpperCase()} • ${file.size}</div>
      </div>
      <div style="padding-right:16px;">
        <svg width="8" height="14" viewBox="0 0 8 14" fill="none" stroke="#c7c7cc" stroke-width="2"><polyline points="1 1 7 7 1 13"/></svg>
      </div>
    </div>
  `).join('');

  // Wrap the list in a white block with rounded corners for that iOS look
  const container = document.getElementById('filesList');
  if (container.children.length > 0) {
    container.style.background = '#fff';
    container.style.borderRadius = '10px';
    container.style.padding = '0';
    container.style.overflow = 'hidden';
  }
}

let currentAlertAction = null;

function handleFileClick(id) {
  const file = [...filesData, ...unzippedFiles].find(f => f.id === id);
  if (!file) return;

  if (file.type === 'zip') {
    currentAlertAction = 'unzip';
    document.getElementById('alertTitle').textContent = "Разархивиране";
    document.getElementById('alertMsg').textContent = 'Желаете ли да разархивирате "' + file.name + '"?';
    document.getElementById('alertInputWrap').style.display = "none";
    document.getElementById('alertCancelBtn').textContent = "Отмени";
    document.getElementById('alertOkBtn').textContent = "Разархивирай";
    document.getElementById('iosAlert').style.display = "flex";
  } else {
    currentAlertAction = 'password';
    document.getElementById('alertTitle').textContent = "Нужна е парола";
    document.getElementById('alertMsg').textContent = "Файлът е заключен. Моля въведи парола.";
    document.getElementById('alertInputWrap').style.display = "block";
    document.getElementById('alertInput').value = "";
    document.getElementById('alertCancelBtn').textContent = "Отмени";
    document.getElementById('alertOkBtn').textContent = "ОК";
    document.getElementById('iosAlert').style.display = "flex";
  }
}

function closeAlert() {
  document.getElementById('iosAlert').style.display = "none";
}

function submitAlert() {
  if (currentAlertAction === 'unzip') {
    isFilesUnzipped = true;
    renderFilesList();
    closeAlert();
  } else if (currentAlertAction === 'password') {
    const pass = document.getElementById('alertInput').value;
    if (pass.length > 0) {
      document.getElementById('alertTitle').textContent = "Грешна парола";
      document.getElementById('alertMsg').textContent = "Неправилна парола. Опитай пак";
      document.getElementById('alertInput').value = "";
    } else {
      closeAlert();
    }
  }
}

// Ensure Files app renders when opened
const originalOpenApp = openApp;
openApp = function (name) {
  originalOpenApp(name);
  if (name === 'files') {
    renderFilesList();
  }
};

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
