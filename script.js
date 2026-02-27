const firebaseConfig = {
    apiKey: "AIzaSyA5Z42Zg8TSagPEnpWajEGhDNfWatBaPkQ",
    authDomain: "zermodzteamstr.firebaseapp.com",
    projectId: "zermodzteamstr",
    storageBucket: "zermodzteamstr.firebasestorage.app",
    messagingSenderId: "761644147471",
    appId: "1:761644147471:web:94ce8cf22912bb4e6d947a",
    measurementId: "G-7X1FJ8YG64",
    databaseURL: "https://zermodzteamstr-default-rtdb.firebaseio.com"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();

let curM = 'APK', curS = 'ALL', admM = 'APK';
const subData = { 
    APK: ['ROOT/VIRTUAL', 'NO ROOT', 'ALL'], 
    FILE: ['HOLO', 'HEADSHOT', 'ALL'] 
};

// --- BG ANIMATION ---
const cvs = document.getElementById('star-canvas');
const ctx = cvs.getContext('2d');
function res() { cvs.width = window.innerWidth; cvs.height = window.innerHeight; }
window.onresize = res; res();
let stars = Array(120).fill().map(() => ({ 
    x: Math.random()*cvs.width, 
    y: Math.random()*cvs.height, 
    r: Math.random()*1.4, 
    s: Math.random()*0.4 
}));
function draw() { 
    ctx.clearRect(0,0,cvs.width,cvs.height); 
    ctx.fillStyle="#ffffff55"; 
    stars.forEach(s => { 
        ctx.beginPath(); ctx.arc(s.x,s.y,s.r,0,7); ctx.fill(); 
        s.y+=s.s; if(s.y>cvs.height) s.y=0; 
    }); 
    requestAnimationFrame(draw); 
}
draw();

// --- AUTH SYSTEM (DATABASE BASED) ---
function auth() {
    const userIn = document.getElementById('adm-u').value;
    const passIn = document.getElementById('adm-p').value;
    showStatus('process', 'MENGHUBUNGI SERVER...');

    db.ref('admin_config').once('value').then(snap => {
        const admin = snap.val();
        if(userIn === admin.user && passIn === admin.pass) {
            showStatus('success', 'AKSES DITERIMA', () => {
                document.getElementById('admin-panel').style.display = 'block';
                load();
            });
        } else {
            showStatus('error', 'LOGIN GAGAL!');
        }
    }).catch(() => showStatus('error', 'KONEKSI BERMASALAH'));
}

function showStatus(type, msg, callback) {
    document.getElementById('login-form').style.display = 'none';
    const ui = document.getElementById('status-ui'), 
          scs = document.getElementById('l-success'), 
          err = document.getElementById('l-error'), 
          txt = document.getElementById('l-text'), 
          spin = document.getElementById('l-spin');
          
    ui.style.display = 'block'; 
    spin.style.display = type === 'process' ? 'block' : 'none';
    scs.style.display = type === 'success' ? 'block' : 'none';
    err.style.display = type === 'error' ? 'block' : 'none';
    txt.innerText = msg;

    if(type !== 'process') {
        setTimeout(() => { 
            document.getElementById('overlay-action').style.display = 'none'; 
            if(callback) callback(); 
        }, 1600);
    }
}

// --- PRODUCT LOGIC ---
function changeM(m) { 
    curM = m; 
    curS = 'ALL'; 
    document.getElementById('c-apk').className = curM === 'APK' ? 'cat-card active' : 'cat-card';
    document.getElementById('c-file').className = curM === 'FILE' ? 'cat-card active' : 'cat-card';
    renderSub(); 
    load(); 
}

function renderSub() {
    const container = document.getElementById('sub-container');
    container.innerHTML = '';
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
    document.getElementById('adm-apk').style.background = m === 'APK' ? 'var(--p)' : '#111';
    document.getElementById('adm-apk').style.color = m === 'APK' ? '#000' : '#fff';
    document.getElementById('adm-file').style.background = m === 'FILE' ? 'var(--p)' : '#111';
    document.getElementById('adm-file').style.color = m === 'FILE' ? '#000' : '#fff';
    
    const sel = document.getElementById('p-sub'); 
    sel.innerHTML = '';
    subData[m].forEach(s => sel.innerHTML += `<option value="${s}">${s}</option>`);
}

function save() {
    const n = document.getElementById('p-name').value, 
          d = document.getElementById('p-dur').value, 
          p = document.getElementById('p-price').value, 
          s = document.getElementById('p-sub').value;
          
    if(n && d && p) {
        document.getElementById('overlay-action').style.display = 'flex';
        db.ref('products').push({ name:n, dur:d, price:p, main:admM, sub:s }).then(() => {
            showStatus('success', 'PRODUK DIPUBLISH', () => {
                document.getElementById('p-name').value = '';
                document.getElementById('p-dur').value = '';
                document.getElementById('p-price').value = '';
            });
        });
    } else {
        alert("Lengkapi data!");
    }
}

function load() {
    db.ref('products').on('value', snap => {
        const list = document.getElementById('list'), 
              admList = document.getElementById('adm-list'), 
              q = document.getElementById('search').value.toLowerCase();
        list.innerHTML = ''; admList.innerHTML = '';
        
        snap.forEach(child => {
            const i = child.val(), k = child.key;
            if(i.main === curM && (curS === 'ALL' || i.sub === curS) && i.name.toLowerCase().includes(q)) {
                // FORMAT ORDER CHAT WA
                const chatOrder = encodeURIComponent(`Halo Zermodz,\nSaya ingin order produk ini:\n\n🚀 Nama: ${i.name}\n⏳ Durasi: ${i.dur} Day\n💰 Harga: ${i.price}K\n\nMohon segera diproses.`);
                
                list.innerHTML += `
                <div class="card">
                    <h3>${i.name}</h3>
                    <p>${i.dur} Day | <span style="color:var(--p)">${i.price}K</span></p>
                    <a href="https://wa.me/6289653938936?text=${chatOrder}" class="btn-wa wa1">BUY VIA WA 1</a>
                    <a href="https://wa.me/6285721057014?text=${chatOrder}" class="btn-wa wa2">BUY VIA WA 2</a>
                </div>`;
            }
            admList.innerHTML += `
            <div style="background:#111; padding:12px; border-radius:10px; margin-bottom:8px; display:flex; justify-content:space-between; align-items:center; border: 1px solid #222;">
                <span style="font-size:13px;">${i.name}</span>
                <button onclick="db.ref('products/${k}').remove()" style="color:red; background:none; border:none; font-weight:bold; cursor:pointer;">HAPUS</button>
            </div>`;
        });
    });
}

function toggleSide() { document.getElementById('sidebar').classList.toggle('active'); }
function openLogin() { toggleSide(); document.getElementById('overlay-action').style.display = 'flex'; document.getElementById('login-form').style.display = 'block'; }
function closeOverlay() { document.getElementById('overlay-action').style.display = 'none'; }
function exitAdmin() { document.getElementById('admin-panel').style.display = 'none'; }

window.onload = () => { renderSub(); load(); };