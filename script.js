const firebaseConfig = {
  apiKey: "AIzaSyA5Z42Zg8TSagPEnpWajEGhDNfWatBaPkQ",
  authDomain: "zermodzteamstr.firebaseapp.com",
  projectId: "zermodzteamstr",
  databaseURL: "https://zermodzteamstr-default-rtdb.asia-southeast1.firebasedatabase.app"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

let curM = 'APK', curS = 'ALL', admM = 'APK';
const subData = { APK: ['ROOT/VIRTUAL', 'NO ROOT', 'ALL'], FILE: ['HOLO', 'HEADSHOT', 'ALL'] };
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
    showStatus('process', 'VALIDATING...');
    db.ref('admin_config').once('value').then(snap => {
        const d = snap.val();
        if(d && u === d.user && p === d.pass) {
            showStatus('success', 'AUTHORIZED', () => { 
                document.getElementById('admin-panel').style.display = 'block'; 
                load(); 
            });
        } else { alert("WRONG CREDENTIALS!"); closeOverlay(); }
    }).catch(e => { alert(e.message); closeOverlay(); });
}

function showStatus(type, msg, callback) {
    document.getElementById('login-form').style.display = 'none';
    const ui = document.getElementById('status-ui'), scs = document.getElementById('l-success'), spin = document.querySelector('.loader-circle'), txt = document.getElementById('l-text');
    ui.style.display = 'block'; document.getElementById('overlay-action').style.display = 'flex';
    spin.style.display = type === 'process' ? 'block' : 'none';
    scs.style.display = type === 'success' ? 'block' : 'none';
    txt.innerText = msg;
    if(type !== 'process') { setTimeout(() => { closeOverlay(); if(callback) callback(); }, 1200); }
}

function save() {
    const id = document.getElementById('p-id').value, n = document.getElementById('p-name').value, d = document.getElementById('p-dur').value, p = document.getElementById('p-price').value, s = document.getElementById('p-sub').value;
    if(n && d && p) {
        showStatus('process', 'PUBLISHING...');
        const data = { name:n, dur:d, price:p, main:admM, sub:s };
        const ref = id ? db.ref('products/'+id) : db.ref('products');
        (id ? ref.update(data) : ref.push(data)).then(() => showStatus('success', 'PUBLISHED', () => { cancelEdit(); load(); }));
    }
}

function load() {
    db.ref('products').on('value', snap => {
        const list = document.getElementById('list'), adm = document.getElementById('adm-list'), q = document.getElementById('search').value.toLowerCase();
        list.innerHTML = ''; adm.innerHTML = '';
        snap.forEach(c => {
            const i = c.val(), k = c.key;
            if(i.main === curM && (curS === 'ALL' || i.sub === curS) && i.name.toLowerCase().includes(q)) {
                const msg = encodeURIComponent(`Order: ${i.name}\nDurasi: ${i.dur} Day\nHarga: ${i.price}K`);
                list.innerHTML += `<div class="card">
                    <h3 style="color:var(--p); margin-bottom:5px;">${i.name}</h3>
                    <p style="color:#777; font-size:13px;">${i.dur} Day | Rp ${i.price}.000</p>
                    <div class="wa-grid">
                        <a href="https://wa.me/${WA_1}?text=${msg}" target="_blank" class="btn-wa" style="background:#25d366">WA 1</a>
                        <a href="https://wa.me/${WA_2}?text=${msg}" target="_blank" class="btn-wa" style="background:#128c7e">WA 2</a>
                    </div>
                </div>`;
            }
            adm.innerHTML += `<div style="background:#111; padding:12px; border-radius:10px; margin-bottom:10px; display:flex; justify-content:space-between; align-items:center; border:1px solid #222;">
                <div><b style="color:var(--p)">${i.name}</b><br><small style="color:#555">${i.main} - ${i.sub}</small></div>
                <div style="display:flex; gap:15px;">
                    <i class="fas fa-edit" onclick="editMode('${k}')" style="color:orange; cursor:pointer"></i>
                    <i class="fas fa-trash" onclick="if(confirm('Hapus?')) db.ref('products/${k}').remove()" style="color:red; cursor:pointer"></i>
                </div>
            </div>`;
        });
    });
}

function editMode(id) {
    db.ref('products/'+id).once('value').then(snap => {
        const i = snap.val();
        document.getElementById('p-id').value = id;
        document.getElementById('p-name').value = i.name;
        document.getElementById('p-dur').value = i.dur;
        document.getElementById('p-price').value = i.price;
        document.getElementById('btn-cancel').style.display = "block";
        document.getElementById('adm-title').innerText = "EDIT MODE";
        setADM(i.main);
        document.getElementById('p-sub').value = i.sub;
    });
}

function cancelEdit() {
    document.getElementById('p-id').value = '';
    document.getElementById('p-name').value = '';
    document.getElementById('p-dur').value = '';
    document.getElementById('p-price').value = '';
    document.getElementById('btn-cancel').style.display = "none";
    document.getElementById('adm-title').innerText = "DASHBOARD";
}

function changeM(m) { curM = m; curS = 'ALL'; renderSub(); load(); }
function renderSub() {
    document.getElementById('c-apk').classList.toggle('active', curM === 'APK');
    document.getElementById('c-file').classList.toggle('active', curM === 'FILE');
    const container = document.getElementById('sub-container'); container.innerHTML = '';
    subData[curM].forEach(s => {
        const btn = document.createElement('div');
        btn.className = `sub-btn ${curS === s ? 'active' : ''}`;
        btn.innerText = s;
        btn.onclick = () => { curS = s; renderSub(); load(); };
        container.appendChild(btn);
    });
    setADM(curM);
}

function setADM(m) {
    admM = m;
    document.getElementById('adm-apk').classList.toggle('active', m === 'APK');
    document.getElementById('adm-file').classList.toggle('active', m === 'FILE');
    const sel = document.getElementById('p-sub'); sel.innerHTML = '';
    subData[m].forEach(s => sel.innerHTML += `<option value="${s}">${s}</option>`);
}

const cvs = document.getElementById('star-canvas'), ctx = cvs.getContext('2d');
function res() { cvs.width = window.innerWidth; cvs.height = window.innerHeight; }
res(); window.onresize = res;
let stars = Array(120).fill().map(() => ({ x: Math.random()*cvs.width, y: Math.random()*cvs.height, s: Math.random()*0.35 }));
function draw() {
    ctx.clearRect(0,0,cvs.width,cvs.height); ctx.fillStyle="#fff";
    stars.forEach(s => { ctx.beginPath(); ctx.arc(s.x, s.y, 0.7, 0, 7); ctx.fill(); s.y += s.s; if(s.y > cvs.height) s.y = 0; });
    requestAnimationFrame(draw);
}
draw();
window.onload = () => { renderSub(); load(); };