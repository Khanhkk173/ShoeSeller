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
    } catch (err) {}
    localStorage.removeItem("user");
    window.location.href = "../html/Login.html";
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

// ================== PREVIEW ẢNH ==================
document.getElementById("imageInput")?.addEventListener("change", function () {
    const preview = document.getElementById("imagePreview");
    preview.innerHTML = "";
    [...this.files].forEach(file => {
        const img = document.createElement("img");
        img.src = URL.createObjectURL(file);
        img.style.cssText = "width:80px;height:80px;object-fit:cover;border-radius:8px;border:1px solid #ddd;";
        preview.appendChild(img);
    });
});

// ================== UPLOAD ẢNH ==================
// Gọi đúng endpoint /api/uploads/product-image (field name = "file")
// Upload từng file một vì backend chỉ nhận 1 file mỗi request
// Backend trả về plain string: "/uploads/products/xxx.jpg"
async function uploadImages(files) {
    if (!files || files.length === 0) return [];
    const urls = [];

    for (const file of files) {
        try {
            const formData = new FormData();
            formData.append("file", file); // phải đúng tên "file"

            const res = await fetch("http://localhost:8080/api/uploads/product-image", {
                method: "POST",
                body: formData,
                credentials: "include"
            });

            if (!res.ok) {
                console.error("Upload thất bại:", res.status);
                continue;
            }

            // Backend trả plain string, không phải JSON
            const urlPath = await res.text();
            // Ghép full URL để lưu vào DB
            urls.push("http://localhost:8080" + urlPath.trim());
        } catch (err) {
            console.error("Lỗi upload file:", file.name, err);
        }
    }

    return urls;
}

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
                opt.textContent = `${p.name} - Size ${v.size} - ${v.color} (Tồn: ${v.stock})`;
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
            body: JSON.stringify({ variantId: Number(variantId), quantity })
        });

        const result = await res.json();
        if (res.ok) {
            alert("Nhập hàng thành công!");
            loadVariants();
            loadImportHistory();
        } else {
            alert(result.message || "Nhập hàng thất bại");
        }
    } catch (err) {
        console.error("Lỗi submitImport:", err);
    }
}

// ================== SUBMIT SẢN PHẨM MỚI ==================
async function submitNewProduct() {
    const name  = document.getElementById("newName").value.trim();
    const brand = document.getElementById("newBrand").value.trim();
    const size  = Number(document.getElementById("newSize").value);
    const color = document.getElementById("newColor").value.trim();
    const price = Number(document.getElementById("newPrice").value);
    const stock = Number(document.getElementById("newStock").value);

    if (!name || !size || !color || !price) {
        alert("Vui lòng nhập đầy đủ: Tên, Size, Màu sắc, Giá bán");
        return;
    }

    const btn = document.querySelector("button[onclick='submitNewProduct()']");

    // Bước 1: Upload ảnh trước (nếu có)
    const imageFiles = document.getElementById("imageInput").files;
    let imageUrls = [];

    if (imageFiles && imageFiles.length > 0) {
        if (btn) { btn.disabled = true; btn.textContent = "Đang upload ảnh..."; }
        imageUrls = await uploadImages(imageFiles);
        console.log("URLs ảnh đã upload:", imageUrls);
    }

    if (btn) { btn.disabled = true; btn.textContent = "Đang lưu..."; }

    // Bước 2: Gửi data sản phẩm kèm imageUrls
    try {
        const res = await fetch("http://localhost:8080/api/imports/new-product", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                name,
                brand,
                imageUrls,  // mảng URL ảnh đã upload
                variant: { size, color, price, stock }
            })
        });

        const result = await res.json();

        if (res.ok) {
            alert("Nhập sản phẩm mới thành công!");
            ["newName", "newBrand", "newColor", "newSize", "newPrice", "newStock"]
                .forEach(id => document.getElementById(id).value = "");
            document.getElementById("imageInput").value = "";
            document.getElementById("imagePreview").innerHTML = "";
            loadVariants();
            loadProducts();
        } else {
            alert(result.message || "Thao tác thất bại");
        }
    } catch (err) {
        console.error("Lỗi submitNewProduct:", err);
        alert("Lỗi kết nối server");
    } finally {
        if (btn) { btn.disabled = false; btn.textContent = "Nhập sản phẩm mới"; }
    }
}

// ================== LOAD LỊCH SỬ NHẬP HÀNG ==================
async function loadImportHistory() {
    try {
        const res = await fetch("http://localhost:8080/api/imports/history");
        const result = await res.json();
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
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>${p.name}</td>
                <td>${p.brand || "-"}</td>
                <td colspan="3" style="color:#aaa">Chưa có biến thể</td>
                <td></td>
                <td><button class="btn-delete" onclick="deleteProduct(${p.productId}, '${p.name}')">🗑 Xóa</button></td>
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
                    <td><span class="${v.stock <= 5 ? "badge-low" : "badge-ok"}">${v.stock}</span></td>
                    <td>${idx === 0 ? `<button class="btn-delete" onclick="deleteProduct(${p.productId}, '${p.name}')">🗑 Xóa</button>` : ""}</td>
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
    if (!confirm(`Bạn có chắc muốn xóa "${productName}"?\nThao tác này không thể hoàn tác!`)) return;

    try {
        const res = await fetch(`http://localhost:8080/api/products/${productId}`, { method: "DELETE" });
        const result = await res.json();
        if (res.ok) {
            alert(`Đã xóa "${productName}" thành công!`);
            loadProducts();
            loadVariants();
            loadImportHistory();
            loadDeletedProducts();
        } else {
            alert(result.message || "Xóa thất bại");
        }
    } catch (err) {
        console.error("Lỗi deleteProduct:", err);
        alert("Lỗi kết nối server");
    }
}

// ================== LỊCH SỬ XÓA ==================
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

// ================== INIT ==================
document.addEventListener("DOMContentLoaded", () => {
    loadVariants();
    loadProducts();
    loadImportHistory();
    loadDeletedProducts();
});