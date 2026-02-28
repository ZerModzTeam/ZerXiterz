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
        } else { alert("ACCESS DENIED"); closeOverlay(); }
    });
}

function updateSubAdmin() {
    const m = document.getElementById('p-main-cat').value;
    const s = document.getElementById('p-sub-cat'); s.innerHTML = '';
    subDataAdmin[m].forEach(x => s.innerHTML += `<option value="${x}">${x}</option>`);
}

function save() {
    const id = document.getElementById('p-id').value;
    const n = document.getElementById('p-name').value;
    const m = document.getElementById('p-main-cat').value;
    const s = document.getElementById('p-sub-cat').value;
    const v = document.getElementById('p-variants').value;
    if(n && v) {
        const ref = id ? db.ref('products/'+id) : db.ref('products');
        ref.set({ name:n, main:m, sub:s, variants:v }).then(() => { cancelEdit(); load(); });
    }
}

function editMode(id) {
    db.ref('products/'+id).once('value').then(snap => {
        const i = snap.val();
        document.getElementById('p-id').value = id;
        document.getElementById('p-name').value = i.name;
        document.getElementById('p-main-cat').value = i.main;
        updateSubAdmin();
        document.getElementById('p-sub-cat').value = i.sub;
        document.getElementById('p-variants').value = i.variants;
        document.getElementById('btn-save').innerText = "UPDATE DATA";
        document.getElementById('btn-cancel').style.display = "block";
    });
}

function cancelEdit() {
    document.getElementById('p-id').value = '';
    document.getElementById('p-name').value = '';
    document.getElementById('p-variants').value = '';
    document.getElementById('btn-save').innerText = "PUBLISH DATA";
    document.getElementById('btn-cancel').style.display = "none";
}

function load() {
    db.ref('products').on('value', snap => {
        const list = document.getElementById('list'), adm = document.getElementById('adm-list'), q = document.getElementById('search').value.toLowerCase();
        list.innerHTML = ''; adm.innerHTML = '';
        snap.forEach(c => {
            const i = c.val(), k = c.key;
            adm.innerHTML += `<div class="adm-card">
                <div><b>${i.name}</b><p style="font-size:10px;color:#444">${i.sub}</p></div>
                <div style="display:flex;gap:15px">
                    <i class="fas fa-edit" style="color:orange" onclick="editMode('${k}')"></i>
                    <i class="fas fa-trash" style="color:red" onclick="if(confirm('Hapus?')) db.ref('products/${k}').remove()"></i>
                </div>
            </div>`;
            if(i.main === curM && (curS === 'ALL' || i.sub === curS) && i.name.toLowerCase().includes(q)) {
                let vH = '';
                i.variants.split(',').forEach(x => {
                    const [d, p] = x.trim().split('-');
                    vH += `<div class="v-item"><span>${d} Hari</span><span>Rp ${p}.000</span></div>`;
                });
                const msg = encodeURIComponent(`Halo Admin, order:\n${i.name}\nDetail:\n${i.variants}`);
                list.innerHTML += `<div class="card">
                    <h3 style="color:var(--p)">${i.name}</h3>
                    <div class="variant-list">${vH}</div>
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
                        <a href="https://wa.me/${WA_1}?text=${msg}" target="_blank" style="background:#25d366;padding:12px;border-radius:10px;text-align:center;color:white;text-decoration:none;font-weight:bold;">WA 1</a>
                        <a href="https://wa.me/${WA_2}?text=${msg}" target="_blank" style="background:#128c7e;padding:12px;border-radius:10px;text-align:center;color:white;text-decoration:none;font-weight:bold;">WA 2</a>
                    </div>
                </div>`;
            }
        });
    });
}

function changeM(m) { curM = m; curS = 'ALL'; renderSub(); load(); }
function renderSub() {
    document.getElementById('c-apk').classList.toggle('active', curM === 'APK');
    document.getElementById('c-file').classList.toggle('active', curM === 'FILE');
    const c = document.getElementById('sub-container'); c.innerHTML = '';
    subDataDisplay[curM].forEach(s => {
        const b = document.createElement('div'); b.className = `sub-btn ${curS === s ? 'active' : ''}`;
        b.innerText = s; b.onclick = () => { curS = s; renderSub(); load(); }; c.appendChild(b);
    });
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
window.onload = () => { updateSubAdmin(); renderSub(); load(); };
