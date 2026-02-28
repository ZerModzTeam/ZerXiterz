const firebaseConfig = {
    apiKey: "AIzaSyA5Z42Zg8TSagPEnpWajEGhDNfWatBaPkQ",
    authDomain: "zermodzteamstr.firebaseapp.com",
    projectId: "zermodzteamstr",
    databaseURL: "https://zermodzteamstr-default-rtdb.asia-southeast1.firebasedatabase.app"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

let curM = 'APK', curS = 'ALL';
const subDataAdmin = { APK: ['ROOT/VIRTUAL', 'NO ROOT'], FILE: ['HOLO', 'HEADSHOT'] };
const subDataDisplay = { APK: ['ALL', 'ROOT/VIRTUAL', 'NO ROOT'], FILE: ['ALL', 'HOLO', 'HEADSHOT'] };
const WA_1 = "6289653938936", WA_2 = "6285721057014";

function toggleSide() { document.getElementById('sidebar').classList.toggle('active'); }
function closeOverlay() { document.getElementById('overlay-action').style.display = 'none'; }
function exitAdmin() { document.getElementById('admin-panel').style.display = 'none'; }

function openLogin() { 
    toggleSide(); 
    document.getElementById('overlay-action').style.display = 'flex'; 
    document.getElementById('login-form').style.display = 'block';
    document.getElementById('status-ui').style.display = 'none';
}

function auth() {
    const u = document.getElementById('adm-u').value, p = document.getElementById('adm-p').value;
    document.getElementById('login-form').style.display = 'none';
    document.getElementById('status-ui').style.display = 'block';
    db.ref('admin_config').once('value').then(snap => {
        const d = snap.val();
        if(d && u === d.user && p === d.pass) {
            setTimeout(() => { closeOverlay(); document.getElementById('admin-panel').style.display = 'block'; load(); }, 1000);
        } else { alert("WRONG!"); closeOverlay(); }
    });
}

function save() {
    const n = document.getElementById('p-name').value, d = document.getElementById('p-dur').value, p = document.getElementById('p-price').value, s = document.getElementById('p-sub').value;
    if(n && d && p) {
        db.ref('products').push({ name:n, dur:d, price:p, main:curM, sub:s }).then(() => { alert("Success!"); load(); });
    }
}

function load() {
    db.ref('products').on('value', snap => {
        const list = document.getElementById('list'), adm = document.getElementById('adm-list'), q = document.getElementById('search').value.toLowerCase();
        list.innerHTML = ''; adm.innerHTML = '';
        snap.forEach(c => {
            const i = c.val(), k = c.key;
            if(i.main === curM && (curS === 'ALL' || i.sub === curS) && i.name.toLowerCase().includes(q)) {
                const msg = encodeURIComponent(`Order: ${i.name}\nHarga: ${i.price}K`);
                list.innerHTML += `<div class="card">
                    <h3 style="color:var(--p)">${i.name}</h3>
                    <p style="color:#555; font-size:13px; margin:5px 0 15px;">${i.dur} Day | Rp ${i.price}.000</p>
                    <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
                        <a href="https://wa.me/${WA_1}?text=${msg}" target="_blank" style="background:#25d366; padding:10px; border-radius:8px; text-align:center; color:white; text-decoration:none; font-weight:bold;">WA 1</a>
                        <a href="https://wa.me/${WA_2}?text=${msg}" target="_blank" style="background:#128c7e; padding:10px; border-radius:8px; text-align:center; color:white; text-decoration:none; font-weight:bold;">WA 2</a>
                    </div>
                </div>`;
            }
            adm.innerHTML += `<div style="background:#111; padding:15px; border-radius:12px; margin-bottom:10px; display:flex; justify-content:space-between; border:1px solid #222;">
                <span>${i.name}</span><i class="fas fa-trash" onclick="db.ref('products/${k}').remove()" style="color:red; cursor:pointer"></i>
            </div>`;
        });
    });
}

function changeM(m) { curM = m; curS = 'ALL'; renderSub(); load(); }
function renderSub() {
    document.getElementById('c-apk').classList.toggle('active', curM === 'APK');
    document.getElementById('c-file').classList.toggle('active', curM === 'FILE');
    const container = document.getElementById('sub-container'); container.innerHTML = '';
    subDataDisplay[curM].forEach(s => {
        const btn = document.createElement('div');
        btn.className = `sub-btn ${curS === s ? 'active' : ''}`;
        btn.innerText = s; btn.onclick = () => { curS = s; renderSub(); load(); };
        container.appendChild(btn);
    });
    const sel = document.getElementById('p-sub'); sel.innerHTML = '';
    subDataAdmin[curM].forEach(s => sel.innerHTML += `<option value="${s}">${s}</option>`);
}

const cvs = document.getElementById('star-canvas'), ctx = cvs.getContext('2d');
function res() { cvs.width = window.innerWidth; cvs.height = window.innerHeight; }
res(); window.onresize = res;
let stars = Array(150).fill().map(() => ({ x: Math.random()*cvs.width, y: Math.random()*cvs.height, s: Math.random()*0.5 }));
function draw() {
    ctx.clearRect(0,0,cvs.width,cvs.height); ctx.fillStyle="#fff";
    stars.forEach(s => { ctx.beginPath(); ctx.arc(s.x, s.y, 0.8, 0, 7); ctx.fill(); s.y += s.s; if(s.y > cvs.height) s.y = 0; });
    requestAnimationFrame(draw);
}
draw();
window.onload = () => { renderSub(); load(); };