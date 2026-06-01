// Data default produk bawaan awal
let products = JSON.parse(localStorage.getItem('products')) || [
    {
        id: "prod_1",
        title: "VIP ADDON",
        price: "Rp 50.000",
        waAdmin: "6287755430203", 
        fileUrl: "https://drive.google.com/file/d/contoh-file-VIP-ADDON",
        buyers: [] // Menyimpan list ID Pembeli/ID Transaksi yang sudah lunas
    }
];

let currentUser = localStorage.getItem('currentUser') || null;

window.onload = function() {
    checkSession();
    renderStore();
    renderAdminDashboard();
};

// --- SISTEM LOGIN ---
function login() {
    const idInput = document.getElementById('login-id').value.trim();
    if (!idInput) return alert('ID tidak boleh kosong!');

    currentUser = idInput;
    localStorage.setItem('currentUser', currentUser);
    checkSession();
}

function logout() {
    localStorage.removeItem('currentUser');
    currentUser = null;
    location.reload();
}

function checkSession() {
    if (!currentUser) {
        document.getElementById('login-section').classList.remove('hidden');
        document.getElementById('main-menu').classList.add('hidden');
        document.getElementById('admin-dashboard').classList.add('hidden');
        document.getElementById('btn-logout').classList.add('hidden');
        document.getElementById('user-display').innerText = "Belum Login";
    } else if (currentUser.toLowerCase() === 'admin') {
        document.getElementById('login-section').classList.add('hidden');
        document.getElementById('main-menu').classList.add('hidden');
        document.getElementById('admin-dashboard').classList.remove('hidden');
        document.getElementById('btn-logout').classList.remove('hidden');
        document.getElementById('user-display').innerText = "Mode: Admin";
    } else {
        document.getElementById('login-section').classList.add('hidden');
        document.getElementById('main-menu').classList.remove('hidden');
        document.getElementById('admin-dashboard').classList.add('hidden');
        document.getElementById('btn-logout').classList.remove('hidden');
        document.getElementById('user-display').innerText = "ID User: " + currentUser;
        switchTab('store');
    }
}

// --- NAVIGASI TAB ---
function switchTab(tabName) {
    if (tabName === 'store') {
        document.getElementById('store-tab').classList.remove('hidden');
        document.getElementById('my-products-tab').classList.add('hidden');
        document.querySelectorAll('.tab-btn')[0].classList.add('active');
        document.querySelectorAll('.tab-btn')[1].classList.remove('active');
        renderStore();
    } else {
        document.getElementById('store-tab').classList.add('hidden');
        document.getElementById('my-products-tab').classList.remove('hidden');
        document.querySelectorAll('.tab-btn')[0].classList.remove('active');
        document.querySelectorAll('.tab-btn')[1].classList.add('active');
        renderOwnedProducts();
    }
}

// --- PEMBELIAN DENGAN GENERATE ID ACAK ---
function buyViaWA(productId) {
    const prod = products.find(p => p.id === productId);
    if (!prod) return;

    // Membuat ID Transaksi Acak (Contoh: TRX-7492)
    const randomTxId = "TRX-" + Math.floor(1000 + Math.random() * 9000);

    const pesan = `Halo Admin, saya ingin membeli produk berikut:\n\n` +
                  `Nama Produk: ${prod.title}\n` +
                  `Harga: ${prod.price}\n` +
                  `Nama Akun: ${currentUser}\n` +
                  `ID Pembelian (Acak): ${randomTxId}\n\n` +
                  `Mohon info rekening pembayarannya min. Terima kasih!`;

    const urlWA = `https://api.whatsapp.com/send?phone=${prod.waAdmin}&text=${encodeURIComponent(pesan)}`;
    window.open(urlWA, '_blank');
}

// --- RENDER HALAMAN USER ---
function renderStore() {
    const list = document.getElementById('product-list');
    if (!list) return;
    list.innerHTML = '';

    products.forEach(prod => {
        const isOwned = prod.buyers.includes(currentUser);
        
        list.innerHTML += `
            <div class="product-card card">
                <h3>${prod.title}</h3>
                <p style="color: #007bff; font-weight: bold; margin: 10px 0;">${prod.price}</p>
                ${isOwned ? 
                    `<button style="background-color: #6c757d;" disabled>Sudah Diakses ✓</button>` : 
                    `<button onclick="buyViaWA('${prod.id}')">Pesan Produk</button>`
                }
            </div>
        `;
    });
}

function renderOwnedProducts() {
    const list = document.getElementById('owned-product-list');
    if (!list) return;
    list.innerHTML = '';
    let ownedCount = 0;

    products.forEach(prod => {
        if (prod.buyers.includes(currentUser)) {
            ownedCount++;
            list.innerHTML += `
                <div class="product-card card" style="border-top: 4px solid #28a745;">
                    <h3>${prod.title}</h3>
                    <p style="font-size: 13px; color: green; margin: 10px 0;">Akses Terverifikasi ✓</p>
                    <a href="${prod.fileUrl}" target="_blank">
                        <button style="width:100%; background-color:#007bff;">Buka File / Materi</button>
                    </a>
                </div>
            `;
        }
    });

    document.getElementById('count-owned').innerText = ownedCount;
    if(ownedCount === 0) {
        list.innerHTML = `<p style="grid-column: 1/-1; text-align:center; color:#999; margin-top:20px;">Anda belum memiliki produk aktif.</p>`;
    }
}

// --- FITUR ADMIN CONTROL PANEL ---
function renderAdminDashboard() {
    const adminList = document.getElementById('admin-product-list');
    const selectProd = document.getElementById('select-product');
    
    if (!adminList || !selectProd) return;
    adminList.innerHTML = '';
    selectProd.innerHTML = '';

    products.forEach((prod, index) => {
        selectProd.innerHTML += `<option value="${prod.id}">${prod.title}</option>`;

        adminList.innerHTML += `
            <div class="admin-item">
                <div>
                    <strong>${prod.title}</strong> (${prod.price}) <br>
                    <small>Akses Diberikan ke ID: [ ${prod.buyers.join(', ') || 'Belum ada'} ]</small>
                </div>
                <div>
                    <button style="background-color: #ffc107; color: black; padding: 5px 10px;" onclick="editProduct(${index})">Edit</button>
                    <button style="background-color: #dc3545; padding: 5px 10px;" onclick="deleteProduct(${index})">Hapus</button>
                </div>
            </div>
        `;
    });
}

function saveProduct() {
    const title = document.getElementById('prod-title').value;
    const price = document.getElementById('prod-price').value;
    const wa = document.getElementById('prod-wa').value;
    const file = document.getElementById('prod-file').value;
    const editIndex = document.getElementById('prod-index').value;

    if (!title || !price || !wa || !file) return alert('Mohon isi semua field produk!');

    if (editIndex === "") {
        const newProd = {
            id: "prod_" + Date.now(),
            title, price, waAdmin: wa, fileUrl: file, buyers: []
        };
        products.push(newProd);
    } else {
        products[editIndex].title = title;
        products[editIndex].price = price;
        products[editIndex].waAdmin = wa;
        products[editIndex].fileUrl = file;
    }

    saveAndRefresh();
    clearAdminForm();
}

function editProduct(index) {
    const prod = products[index];
    document.getElementById('prod-index').value = index;
    document.getElementById('prod-title').value = prod.title;
    document.getElementById('prod-price').value = prod.price;
    document.getElementById('prod-wa').value = prod.waAdmin;
    document.getElementById('prod-file').value = prod.fileUrl;

    document.getElementById('btn-save-prod').innerText = "Perbarui Produk";
    document.getElementById('btn-cancel-edit').classList.remove('hidden');
}

function deleteProduct(index) {
    if (confirm("Apakah Anda yakin ingin menghapus produk ini?")) {
        products.splice(index, 1);
        saveAndRefresh();
    }
}

function activateProduct() {
    const prodId = document.getElementById('select-product').value;
    const buyerId = document.getElementById('buyer-id-input').value.trim();

    if (!buyerId) return alert('Masukkan ID terlebih dahulu!');

    const prod = products.find(p => p.id === prodId);
    if (prod) {
        if (prod.buyers.includes(buyerId)) {
            alert('ID ini sudah terdaftar mendapatkan akses.');
        } else {
            prod.buyers.push(buyerId);
            saveAndRefresh();
            document.getElementById('buyer-id-input').value = '';
            alert(`Sukses! ID "${buyerId}" sekarang punya akses ke produk "${prod.title}".`);
        }
    }
}

function clearAdminForm() {
    document.getElementById('prod-index').value = "";
    document.getElementById('prod-title').value = "";
    document.getElementById('prod-price').value = "";
    document.getElementById('prod-wa').value = "";
    document.getElementById('prod-file').value = "";
    document.getElementById('btn-save-prod').innerText = "Simpan Produk";
    document.getElementById('btn-cancel-edit').classList.add('hidden');
}

function saveAndRefresh() {
    localStorage.setItem('products', JSON.stringify(products));
    renderStore();
    renderAdminDashboard();
}
