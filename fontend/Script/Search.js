// ============================================================
// SIDEBAR TOGGLE
// ============================================================
const sidebar = document.querySelector(".sidebar");
const sidebarToggleBtn = document.querySelector(".sidebar-toggle");

sidebarToggleBtn.addEventListener("click", () => {
    sidebar.classList.toggle("collapsed");
});

// ============================================================
// AUTH — kiểm tra đăng nhập
// ============================================================
function checkLogin() {
    const userStr = localStorage.getItem("user");
    if (!userStr) {
        alert("Bạn chưa đăng nhập!");
        window.location.href = "../html/Login.html";
        return null;
    }
    return JSON.parse(userStr);
}

const currentUser = checkLogin();
if (currentUser) {
    document.getElementById("welcome").innerText =
        `Xin chào, ${currentUser.username || currentUser.name || 'User'}`;
}

// ============================================================
// LOGOUT
// ============================================================
async function logout() {
    if (!confirm("Bạn có chắc muốn đăng xuất không?")) return;

    try {
        await fetch('http://localhost:8080/api/auth/logout', {
            method: 'POST',
            credentials: 'include'
        });
        localStorage.removeItem("user");
        alert("Đã đăng xuất thành công!");
        window.location.href = "../html/Login.html";
    } catch (error) {
        console.error("Lỗi logout:", error);
        localStorage.removeItem("user");
        window.location.href = "../html/Login.html";
    }
}

// ============================================================
// DỮ LIỆU MẪU
// Xóa phần này khi đã có backend — dùng fetchProducts() thay thế
// ============================================================
const MOCK_PRODUCTS = [
    {
        id: 1,
        name: "Paracetamol 500mg",
        price: 25000,
        stock: 320,
        image: "https://placehold.co/400x400/e8e5ff/695cfe?text=Paracetamol",
        category: "Thuốc giảm đau"
    },
    {
        id: 2,
        name: "Vitamin C 1000mg",
        price: 85000,
        stock: 5,
        image: "https://placehold.co/400x400/dcfce7/166534?text=Vitamin+C",
        category: "Vitamin"
    },
    {
        id: 3,
        name: "Amoxicillin 250mg",
        price: 45000,
        stock: 0,
        image: "https://placehold.co/400x400/fee2e2/991b1b?text=Amoxicillin",
        category: "Kháng sinh"
    },
    {
        id: 4,
        name: "Ibuprofen 400mg",
        price: 32000,
        stock: 150,
        image: "https://placehold.co/400x400/e0f2fe/0369a1?text=Ibuprofen",
        category: "Thuốc giảm đau"
    },
    {
        id: 5,
        name: "Vitamin B Complex",
        price: 120000,
        stock: 88,
        image: "https://placehold.co/400x400/fef9c3/854d0e?text=Vitamin+B",
        category: "Vitamin"
    },
    {
        id: 6,
        name: "Cetirizine 10mg",
        price: 18000,
        stock: 3,
        image: "https://placehold.co/400x400/fdf4ff/7e22ce?text=Cetirizine",
        category: "Dị ứng"
    },
    {
        id: 7,
        name: "Omeprazole 20mg",
        price: 55000,
        stock: 200,
        image: "https://placehold.co/400x400/ecfdf5/065f46?text=Omeprazole",
        category: "Dạ dày"
    },
    {
        id: 8,
        name: "Metformin 500mg",
        price: 28000,
        stock: 0,
        image: "https://placehold.co/400x400/fff7ed/c2410c?text=Metformin",
        category: "Tiểu đường"
    },
];

// ============================================================
// TÌM KIẾM — event listeners
// ============================================================
const searchInput = document.getElementById("searchInput");
const resultArea  = document.getElementById("resultArea");

// Nhấn Enter để tìm
searchInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") handleSearch();
});

// Tìm real-time (debounce 350ms)
let debounceTimer;
searchInput.addEventListener("input", () => {
    clearTimeout(debounceTimer);
    const q = searchInput.value.trim();
    if (q.length === 0) {
        showHint();
        return;
    }
    debounceTimer = setTimeout(() => handleSearch(), 350);
});

// ============================================================
// XỬ LÝ TÌM KIẾM
// ============================================================
function handleSearch() {
    const query = searchInput.value.trim();
    if (!query) { showHint(); return; }

    showLoading();

    // ----- DÙNG API THẬT: bỏ comment đoạn dưới, xóa setTimeout + MOCK -----
    // fetchProducts(query);
    // -----------------------------------------------------------------------

    // Giả lập delay API với dữ liệu mẫu
    setTimeout(() => {
        const results = MOCK_PRODUCTS.filter(p =>
            p.name.toLowerCase().includes(query.toLowerCase())
        );
        renderResults(results, query);
    }, 400);
}

// ============================================================
// GỌI API BACKEND (dùng khi backend sẵn sàng)
// ============================================================
async function fetchProducts(query) {
    try {
        const res = await fetch(
            `http://localhost:8080/api/products/search?name=${encodeURIComponent(query)}`,
            { credentials: 'include' }
        );
        if (!res.ok) throw new Error("Lỗi server");
        const data = await res.json();
        renderResults(data, query);
    } catch (err) {
        console.error("Lỗi tìm kiếm:", err);
        renderError();
    }
}

// ============================================================
// RENDER KẾT QUẢ
// ============================================================
function renderResults(products, query) {
    if (products.length === 0) {
        resultArea.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">
                    <i class="bx bx-search-alt"></i>
                </div>
                <h3>Không tìm thấy sản phẩm</h3>
                <p>Không có sản phẩm nào khớp với "<strong>${escHtml(query)}</strong>"<br>
                Thử kiểm tra lại chính tả hoặc tìm với từ khóa khác.</p>
            </div>`;
        return;
    }

    const cards = products.map((p, i) => {
        const { badge, cls } = stockInfo(p.stock);
        return `
        <div class="product-card" style="animation-delay:${0.04 + i * 0.05}s">
            <div class="product-img-wrap">
                <img src="${p.image}" alt="${escHtml(p.name)}"
                     onerror="this.src='https://placehold.co/400x400/f5f4ff/c4beff?text=No+Image'">
                <span class="stock-badge ${cls}">${badge}</span>
            </div>
            <div class="product-info">
                <div class="product-name" title="${escHtml(p.name)}">${highlightMatch(p.name, query)}</div>
                <div class="product-price">${formatPrice(p.price)}</div>
                <div class="product-stock-row">
                    <i class="bx bx-package"></i>
                    <span class="product-stock-text">
                        Tồn kho: <strong>${p.stock.toLocaleString('vi-VN')} sản phẩm</strong>
                    </span>
                </div>
            </div>
        </div>`;
    }).join('');

    resultArea.innerHTML = `
        <p class="result-label">
            Tìm thấy <span>${products.length}</span> sản phẩm cho "<em>${escHtml(query)}</em>"
        </p>
        <div class="product-grid">${cards}</div>`;
}

function renderError() {
    resultArea.innerHTML = `
        <div class="empty-state">
            <div class="empty-icon">
                <i class="bx bx-error-circle"></i>
            </div>
            <h3>Đã xảy ra lỗi</h3>
            <p>Không thể kết nối đến máy chủ. Vui lòng thử lại sau.</p>
        </div>`;
}

// ============================================================
// TRẠNG THÁI GIAO DIỆN
// ============================================================
function showHint() {
    resultArea.innerHTML = `
        <div class="hint-state">
            <i class="bx bx-search-alt-2"></i>
            <p>Nhập tên sản phẩm để bắt đầu tìm kiếm</p>
        </div>`;
}

function showLoading() {
    const skeletons = Array(4).fill(`
        <div class="skeleton-card">
            <div class="skeleton-img"></div>
            <div class="skeleton-body">
                <div class="skeleton-line medium"></div>
                <div class="skeleton-line short"></div>
                <div class="skeleton-line short"></div>
            </div>
        </div>`).join('');
    resultArea.innerHTML = `<div class="skeleton-grid">${skeletons}</div>`;
}

// ============================================================
// HELPER FUNCTIONS
// ============================================================
function stockInfo(qty) {
    if (qty === 0)  return { badge: "Hết hàng", cls: "out-stock" };
    if (qty <= 10)  return { badge: "Sắp hết",  cls: "low-stock" };
    return              { badge: "Còn hàng", cls: "in-stock"  };
}

function formatPrice(n) {
    return n.toLocaleString('vi-VN') + ' đ';
}

function escHtml(str) {
    return str.replace(/[&<>"']/g, c =>
        ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])
    );
}

function highlightMatch(name, query) {
    const regex = new RegExp(`(${escHtml(query)})`, 'gi');
    return escHtml(name).replace(
        regex,
        '<mark style="background:#e8e5ff;color:#695cfe;border-radius:3px;padding:0 2px;">$1</mark>'
    );
}