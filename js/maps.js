let mapInstance = null;
let mapRoute = null;
let mapPins = [];
function initMapsApp() {
    const container = document.getElementById('mapLeaflet');
    if (!container) return;
    if (mapInstance) { setTimeout(() => mapInstance.invalidateSize(), 100); return; }
    mapInstance = L.map('mapLeaflet', { center: [43.5731, 27.8269], zoom: 14, zoomControl: false, attributionControl: false });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(mapInstance);
    setTimeout(() => { mapInstance.invalidateSize(); drawEliyaRoute(); }, 400);
}
async function drawEliyaRoute() {
    if (!mapInstance) return;
    if (mapRoute) { mapInstance.removeLayer(mapRoute); mapRoute = null; }
    mapPins.forEach(p => mapInstance.removeLayer(p));
    mapPins = [];
    const from = [43.5731, 27.8269];
    const to = [43.5621, 27.8430];
    const mkIcon = (color) => L.divIcon({
        className: '', html: `<div style="width:14px;height:14px;background:${color};border:3px solid #fff;border-radius:50%;box-shadow:0 2px 8px rgba(0,0,0,0.4);"></div>`,
        iconSize: [14, 14], iconAnchor: [7, 7]
    });
    mapPins.push(L.marker(from, { icon: mkIcon('#34c759') }).addTo(mapInstance).bindPopup('Вие сте тук'), L.marker(to, { icon: mkIcon('#ff3b30') }).addTo(mapInstance).bindPopup('Апартамент на Елия'));
    try {
        const url = `https://router.project-osrm.org/route/v1/driving/${from[1]},${from[0]};${to[1]},${to[0]}?overview=full&geometries=geojson`;
        const res = await fetch(url);
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
function mapZoom(delta) { if (mapInstance) mapInstance.setZoom(mapInstance.getZoom() + delta); }
let findmyMap = null;
function initFindMyMap() {
    const container = document.getElementById('findmyMap');
    if (!container) return;
    if (findmyMap) { setTimeout(() => findmyMap.invalidateSize(), 100); return; }
    const eliyaPos = [43.5750, 27.8310];
    findmyMap = L.map('findmyMap', { center: eliyaPos, zoom: 15, zoomControl: false, attributionControl: false });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(findmyMap);
    const pulseIcon = L.divIcon({
        className: '',
        html: `<div style="position:relative;width:24px;height:24px;"><div style="position:absolute;inset:0;background:rgba(255,107,107,0.3);border-radius:50%;animation:pulse 2s infinite;"></div><div style="position:absolute;top:4px;left:4px;width:16px;height:16px;background:#ff6b6b;border:3px solid #fff;border-radius:50%;box-shadow:0 2px 8px rgba(0,0,0,0.4);"></div></div>`,
        iconSize: [24, 24], iconAnchor: [12, 12]
    });
    L.marker(eliyaPos, { icon: pulseIcon }).addTo(findmyMap);
    const style = document.createElement('style');
    style.textContent = `@keyframes pulse { 0%,100%{transform:scale(1);opacity:0.6} 50%{transform:scale(1.8);opacity:0} }`;
    document.head.appendChild(style);
    setTimeout(() => findmyMap.invalidateSize(), 300);
}