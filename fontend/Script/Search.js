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
// API BASE URL
// ============================================================
const API_BASE = "http://localhost:8080";

// Ảnh placeholder dùng khi không có ảnh thật
const PLACEHOLDER_IMG = "https://placehold.co/400x400/f5f4ff/c4beff?text=No+Image";

// ============================================================
// TÌM KIẾM — event listeners
// ============================================================
const searchInput = document.getElementById("searchInput");
const resultArea  = document.getElementById("resultArea");

searchInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") handleSearch();
});

let debounceTimer;
searchInput.addEventListener("input", () => {
    clearTimeout(debounceTimer);
    const q = searchInput.value.trim();
    if (q.length === 0) { showHint(); return; }
    debounceTimer = setTimeout(() => handleSearch(), 350);
});

// ============================================================
// XỬ LÝ TÌM KIẾM
// ============================================================
function handleSearch() {
    const query = searchInput.value.trim();
    if (!query) { showHint(); return; }
    showLoading();
    fetchProducts(query);
}

// ============================================================
// GỌI API BACKEND
// ============================================================
async function fetchProducts(query) {
    try {
        const res = await fetch(
            `${API_BASE}/api/products/search?name=${encodeURIComponent(query)}`,
            { credentials: 'include' }
        );

        if (!res.ok) {
            const errText = await res.text();
            console.error("Lỗi server: " + res.status, errText);
            throw new Error("Lỗi server: " + res.status);
        }

        const data = await res.json();

        const mapped = data.map(p => ({
            id:       p.productId,
            name:     p.name     || "Không có tên",
            price:    p.price    ?? 0,
            stock:    p.stock    ?? 0,
            // FIX: Nếu image là null/undefined/"null" → dùng placeholder luôn
            // Tránh trình duyệt tạo URL sai kiểu ".../html/null"
            image:    (p.image && p.image !== "null") ? p.image : PLACEHOLDER_IMG,
            category: p.category || ""
        }));

        renderResults(mapped, query);
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
                <div class="empty-icon"><i class="bx bx-search-alt"></i></div>
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
                <img src="${p.image}"
                     alt="${escHtml(p.name)}"
                     onerror="this.onerror=null; this.src='${PLACEHOLDER_IMG}'">
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
            <div class="empty-icon"><i class="bx bx-error-circle"></i></div>
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
    return Number(n).toLocaleString('vi-VN') + ' đ';
}

function escHtml(str) {
    return String(str).replace(/[&<>"']/g, c =>
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