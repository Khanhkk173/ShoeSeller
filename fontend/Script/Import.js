// ================== SIDEBAR ==================
const sidebar = document.querySelector(".sidebar");
const sidebarToggleBtn = document.querySelector(".sidebar-toggle");

sidebarToggleBtn.addEventListener("click", () => {
    sidebar.classList.toggle("collapsed");
});

// ================== LOGIN CHECK ==================
function checkLogin() {
    const userStr = localStorage.getItem("user");
    if (!userStr) {
        alert("Bạn chưa đăng nhập!");
        window.location.href = "../html/Login.html";
        return null;
    }
    return JSON.parse(userStr);
}

// Hiển thị user
const currentUser = checkLogin();
if (currentUser) {
    document.getElementById("welcome").innerText =
        `Xin chào, ${currentUser.username || currentUser.name || 'User'}`;
}

// ================== LOGOUT ==================
async function logout() {
    if (!confirm("Bạn có chắc muốn đăng xuất không?")) return;

    try {
        await fetch("http://localhost:8080/api/auth/logout", {
            method: "POST",
            credentials: "include"
        });

        localStorage.removeItem("user");
        window.location.href = "../html/Login.html";
    } catch (err) {
        console.error("Lỗi logout:", err);
        localStorage.removeItem("user");
        window.location.href = "../html/Login.html";
    }
}

// ================== TÍNH TỔNG TIỀN ==================
const quantityInput = document.getElementById("quantity");
const priceInput = document.getElementById("price");
const totalInput = document.getElementById("total");

function updateTotal() {
    const qty = Number(quantityInput.value) || 0;
    const price = Number(priceInput.value) || 0;
    totalInput.value = qty * price;
}

quantityInput.addEventListener("input", updateTotal);
priceInput.addEventListener("input", updateTotal);

// ================== LOAD VARIANTS ==================
async function loadVariants() {
    try {
        const res = await fetch("http://localhost:8080/api/products/import");
        const result = await res.json();

        const select = document.getElementById("variantSelect");
        select.innerHTML = "";

        if (!result.data) return;

        result.data.forEach(p => {
            if (!p.variants) return;

            p.variants.forEach(v => {
                const opt = document.createElement("option");
                opt.value = v.variantId;
                opt.textContent =
                    `${p.name} - Size ${v.size} - ${v.color} (Tồn: ${v.stock})`;
                select.appendChild(opt);
            });
        });
    } catch (err) {
        console.error("Lỗi loadVariants:", err);
    }
}

// ================== SUBMIT NHẬP HÀNG ==================
async function submitImport() {
    const variantId = document.getElementById("variantSelect").value;
    const quantity = Number(document.getElementById("quantity").value);

    if (!variantId || quantity <= 0) {
        alert("Vui lòng nhập đầy đủ thông tin");
        return;
    }

    try {
        const res = await fetch("http://localhost:8080/api/imports", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                variantId: Number(variantId),
                quantity: quantity
            })
        });

        const result = await res.json();

        if (res.ok) {
            alert("Nhập hàng thành công!");
            loadVariants();
            loadImportHistory(); // ✅ reload lịch sử
        } else {
            alert(result.message || "Nhập hàng thất bại");
        }
    } catch (err) {
        console.error("Lỗi submitImport:", err);
    }
}

// ================== SUBMIT SẢN PHẨM MỚI ==================
async function submitNewProduct() {
    const data = {
        name: document.getElementById("newName").value,
        brand: document.getElementById("newBrand").value,
        variant: {
            size: Number(document.getElementById("newSize").value),
            color: document.getElementById("newColor").value,
            price: Number(document.getElementById("newPrice").value),
            stock: Number(document.getElementById("newStock").value)
        }
    };

    try {
        const res = await fetch("http://localhost:8080/api/imports/new-product", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });

        const result = await res.json();

        if (res.ok) {
            alert("Nhập sản phẩm mới thành công!");
            loadVariants();
        } else {
            alert(result.message || "Thao tác thất bại");
        }
    } catch (err) {
        console.error("Lỗi submitNewProduct:", err);
    }
}

// ================== LOAD LỊCH SỬ NHẬP HÀNG ==================
async function loadImportHistory() {
    try {
        const res = await fetch("http://localhost:8080/api/imports/history");
        const result = await res.json();

        console.log("IMPORT HISTORY:", result);

        const tbody = document.getElementById("importHistoryBody");
        tbody.innerHTML = "";

        if (!result.data) return;

        result.data.forEach(h => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>${h.productName}</td>
                <td>${h.size}</td>
                <td>${h.color}</td>
                <td>${h.quantity}</td>
                <td>${new Date(h.importedAt).toLocaleString()}</td>
            `;
            tbody.appendChild(tr);
        });
    } catch (err) {
        console.error("Lỗi loadImportHistory:", err);
    }
}

// ================== DANH SÁCH SẢN PHẨM ==================
let allProducts = [];

async function loadProducts() {
    try {
        const res = await fetch("http://localhost:8080/api/products/import");
        const result = await res.json();

        if (!result.data) return;
        allProducts = result.data;
        renderProducts(allProducts);
    } catch (err) {
        console.error("Lỗi loadProducts:", err);
    }
}

function renderProducts(products) {
    const tbody = document.getElementById("productListBody");
    tbody.innerHTML = "";

    products.forEach(p => {
        if (!p.variants || p.variants.length === 0) {
            // Sản phẩm không có variant - chỉ hiển thị tên
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>${p.name}</td>
                <td>${p.brand || "-"}</td>
                <td colspan="3" style="color:#aaa">Chưa có biến thể</td>
                <td></td>
                <td>
                    <button class="btn-delete" onclick="deleteProduct(${p.productId}, '${p.name}')">🗑 Xóa</button>
                </td>
            `;
            tbody.appendChild(tr);
        } else {
            p.variants.forEach((v, idx) => {
                const tr = document.createElement("tr");
                tr.innerHTML = `
                    <td>${idx === 0 ? p.name : ""}</td>
                    <td>${idx === 0 ? (p.brand || "-") : ""}</td>
                    <td>${v.size}</td>
                    <td>${v.color}</td>
                    <td>${Number(v.price).toLocaleString("vi-VN")} ₫</td>
                    <td>
                        <span class="${v.stock <= 5 ? "badge-low" : "badge-ok"}">${v.stock}</span>
                    </td>
                    <td>
                        ${idx === 0 ? `<button class="btn-delete" onclick="deleteProduct(${p.productId}, '${p.name}')">🗑 Xóa</button>` : ""}
                    </td>
                `;
                tbody.appendChild(tr);
            });
        }
    });
}

function filterProducts() {
    const keyword = document.getElementById("searchProduct").value.toLowerCase();
    const filtered = allProducts.filter(p =>
        p.name.toLowerCase().includes(keyword) ||
        (p.brand && p.brand.toLowerCase().includes(keyword))
    );
    renderProducts(filtered);
}

async function deleteProduct(productId, productName) {
    if (!confirm(`Bạn có chắc muốn xóa sản phẩm "${productName}" khỏi kho không?\nThao tác này không thể hoàn tác!`)) return;

    try {
        const res = await fetch(`http://localhost:8080/api/products/${productId}`, {
            method: "DELETE"
        });

        const result = await res.json();

        if (res.ok) {
            alert(`Đã xóa sản phẩm "${productName}" thành công!`);
            loadProducts();
            loadVariants();
            loadImportHistory();
            loadDeletedProducts(); // ✅ Thêm dòng này
        } else {
            alert(result.message || "Xóa thất bại");
        }
    } catch (err) {
        console.error("Lỗi deleteProduct:", err);
        alert("Lỗi kết nối server");
    }
}

// ================== INIT ==================
document.addEventListener("DOMContentLoaded", () => {
    loadVariants();
    loadProducts();
    loadImportHistory();
    loadDeletedProducts();
});


document.getElementById("imageInput")?.addEventListener("change", function () {
    const preview = document.getElementById("imagePreview");
    preview.innerHTML = "";

    [...this.files].forEach(file => {
        const img = document.createElement("img");
        img.src = URL.createObjectURL(file);
        img.style.width = "80px";
        img.style.height = "80px";
        img.style.objectFit = "cover";
        img.style.borderRadius = "8px";
        img.style.border = "1px solid #ddd";
        preview.appendChild(img);
    });
});
// ================== LỊCH SỬ XÓA SẢN PHẨM ==================
async function loadDeletedProducts() {
    try {
        const res = await fetch("http://localhost:8080/api/deleted-products");
        const result = await res.json();

        const tbody = document.getElementById("deletedProductBody");
        tbody.innerHTML = "";

        if (!result.data || result.data.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;color:#aaa">Chưa có sản phẩm nào bị xóa</td></tr>`;
            return;
        }

        result.data.forEach(log => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>${log.productName}</td>
                <td>${log.brand || "-"}</td>
                <td>${log.size || "-"}</td>
                <td>${log.color || "-"}</td>
                <td>${log.price ? Number(log.price).toLocaleString("vi-VN") + " ₫" : "-"}</td>
                <td>${new Date(log.deletedAt).toLocaleString("vi-VN")}</td>
            `;
            tbody.appendChild(tr);
        });
    } catch (err) {
        console.error("Lỗi loadDeletedProducts:", err);
    }
}