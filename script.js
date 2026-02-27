const firebaseConfig = {
  apiKey: "AIzaSyA5Z42Zg8TSagPEnpWajEGhDNfWatBaPkQ",
  authDomain: "zermodzteamstr.firebaseapp.com",
  projectId: "zermodzteamstr",
  storageBucket: "zermodzteamstr.firebasestorage.app",
  messagingSenderId: "761644147471",
  appId: "1:761644147471:web:94ce8cf22912bb4e6d947a",
  measurementId: "G-7X1FJ8YG64",
  databaseURL: "https://zermodzteamstr-default-rtdb.asia-southeast1.firebasedatabase.app"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();

let curM = 'APK', curS = 'ALL', admM = 'APK';
const subData = { APK: ['ROOT/VIRTUAL', 'NO ROOT', 'ALL'], FILE: ['HOLO', 'HEADSHOT', 'ALL'] };

function auth() {
    const u = document.getElementById('adm-u').value, p = document.getElementById('adm-p').value;
    showStatus('process', 'WAIT...');
    db.ref('admin_config').once('value').then(snap => {
        const d = snap.val();
        if(d && u === d.user && p === d.pass) {
            showStatus('success', 'GRANTED', () => {
                document.getElementById('admin-panel').style.display = 'block';
                load();
            });
        } else { alert("Salah!"); document.getElementById('overlay-action').style.display='none'; }
    });
}

function showStatus(type, msg, callback) {
    document.getElementById('login-form').style.display = 'none';
    const ui = document.getElementById('status-ui'), scs = document.getElementById('l-success'), spin = document.getElementById('l-spin'), txt = document.getElementById('l-text');
    ui.style.display = 'block';
    spin.style.display = type === 'process' ? 'block' : 'none';
    scs.style.display = type === 'success' ? 'block' : 'none';
    txt.innerText = msg;
    if(type !== 'process') {
        setTimeout(() => { document.getElementById('overlay-action').style.display = 'none'; if(callback) callback(); }, 1200);
    }
}

function save() {
    const id = document.getElementById('p-id').value;
    const n = document.getElementById('p-name').value, d = document.getElementById('p-dur').value, p = document.getElementById('p-price').value, s = document.getElementById('p-sub').value;
    if(n && d && p) {
        const data = { name:n, dur:d, price:p, main:admM, sub:s };
        document.getElementById('overlay-action').style.display = 'flex';
        if(id) {
            db.ref('products/'+id).update(data).then(() => { showStatus('success', 'UPDATED', () => cancelEdit()); });
        } else {
            db.ref('products').push(data).then(() => { showStatus('success', 'SAVED', () => cancelEdit()); });
        }
    }
}

function load() {
    db.ref('products').on('value', snap => {
        const list = document.getElementById('list'), admList = document.getElementById('adm-list'), q = document.getElementById('search').value.toLowerCase();
        list.innerHTML = ''; admList.innerHTML = '';
        snap.forEach(c => {
            const i = c.val(), k = c.key;
            if(i.main === curM && (curS === 'ALL' || i.sub === curS) && i.name.toLowerCase().includes(q)) {
                const msg = encodeURIComponent(`Order: ${i.name}\nDay: ${i.dur}\nHarga: ${i.price}K`);
                list.innerHTML += `<div class="card"><h3>${i.name}</h3><p>${i.dur} Day | ${i.price}K</p>
                <a href="https://wa.me/6289653938936?text=${msg}" target="_blank" class="btn-wa" style="background:#25d366">WA 1</a>
                <a href="https://wa.me/6285721057014?text=${msg}" target="_blank" class="btn-wa" style="background:#128c7e">WA 2</a></div>`;
            }
            admList.innerHTML += `<div class="adm-item"><span onclick="editMode('${k}')" style="color:var(--p);cursor:pointer">${i.name}</span>
            <button onclick="db.ref('products/${k}').remove()" style="color:red;background:none;border:none;">HAPUS</button></div>`;
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
        document.getElementById('adm-title').innerText = "EDIT MODE";
        document.getElementById('btn-cancel').style.display = "block";
    });
}

function cancelEdit() {
    document.getElementById('p-id').value = '';
    document.getElementById('p-name').value = '';
    document.getElementById('p-dur').value = '';
    document.getElementById('p-price').value = '';
    document.getElementById('btn-cancel').style.display = "none";
    document.getElementById('adm-title').innerText = "ADD PRODUCT";
}

function changeM(m) { curM = m; curS = 'ALL'; renderSub(); load(); }
function renderSub() {
    document.getElementById('c-apk').className = curM === 'APK' ? 'cat-card active' : 'cat-card';
    document.getElementById('c-file').className = curM === 'FILE' ? 'cat-card active' : 'cat-card';
    const container = document.getElementById('sub-container'); container.innerHTML = '';
    subData[curM].forEach(s => {
        const btn = document.createElement('div');
        btn.className = `sub-btn ${curS === s ? 'active' : ''}`; btn.innerText = s;
        btn.onclick = () => { curS = s; renderSub(); load(); };
        container.appendChild(btn);
    });
    setADM(curM);
}
function setADM(m) {
    admM = m;
    const sel = document.getElementById('p-sub'); sel.innerHTML = '';
    subData[m].forEach(s => sel.innerHTML += `<option value="${s}">${s}</option>`);
}

function toggleSide() { document.getElementById('sidebar').classList.toggle('active'); }
function openLogin() { toggleSide(); document.getElementById('overlay-action').style.display = 'flex'; document.getElementById('login-form').style.display = 'block'; }
function closeOverlay() { document.getElementById('overlay-action').style.display = 'none'; }
function exitAdmin() { document.getElementById('admin-panel').style.display = 'none'; }
window.onload = () => { renderSub(); load(); };

// STARS
const cvs = document.getElementById('star-canvas'), ctx = cvs.getContext('2d');
function res() { cvs.width = window.innerWidth; cvs.height = window.innerHeight; }
res(); window.onresize = res;
let stars = Array(100).fill().map(() => ({ x: Math.random()*cvs.width, y: Math.random()*cvs.height, s: Math.random()*0.5 }));
function draw() { ctx.clearRect(0,0,cvs.width,cvs.height); ctx.fillStyle="#fff"; stars.forEach(s => { ctx.beginPath(); ctx.arc(s.x,s.y,1,0,7); ctx.fill(); s.y+=s.s; if(s.y>cvs.height) s.y=0; }); requestAnimationFrame(draw); }
draw();