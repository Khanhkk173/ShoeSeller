const API_BASE = "http://localhost:8080";
// Toggle sidebar
const sidebar = document.querySelector(".sidebar");
const sidebarToggleBtn = document.querySelector(".sidebar-toggle");

sidebarToggleBtn.addEventListener("click", () => {
    sidebar.classList.toggle("collapsed");
});

// Kiểm tra đã đăng nhập chưa
function checkLogin() {
    const userStr = localStorage.getItem("user");
    if (!userStr) {
        alert("Bạn chưa đăng nhập!");
        window.location.href = "../html/Login.html";   // sửa đường dẫn nếu cần
        return null;
    }
    return JSON.parse(userStr);
}

// Khởi tạo trang
const currentUser = checkLogin();
if (currentUser) {
    // Hiển thị tên người dùng
    document.getElementById("welcome").innerText =
        `Xin chào, ${currentUser.username || currentUser.name || 'User'}`;
}

// Hàm Logout - Gọi API logout từ backend
async function logout() {
    if (!confirm("Bạn có chắc muốn đăng xuất không?")) {
        return;
    }

    try {
        // Gọi API logout từ backend (tốt hơn là xóa session)
        await fetch('http://localhost:8080/api/auth/logout', {
            method: 'POST',
            credentials: 'include'   // quan trọng nếu backend dùng HttpSession
        });

        // Xóa dữ liệu localStorage
        localStorage.removeItem("user");

        alert("Đã đăng xuất thành công!");
        window.location.href = "../html/Login.html";

    } catch (error) {
        console.error("Lỗi logout:", error);
        // Vẫn logout ngay cả khi gọi API thất bại
        localStorage.removeItem("user");
        window.location.href = "../html/Login.html";
    }
}

let variants = [];

async function loadVariants() {
    const res = await fetch("http://localhost:8080/api/products/import");
    const result = await res.json();

    variants = [];
    result.data.forEach(p => {
        p.variants.forEach(v => {
            variants.push({
                id: v.variantId,
                name: `${p.name} - Size ${v.size} - ${v.color}`,
                price: v.price
            });
        });
    });

    addRow();
}

document.addEventListener("DOMContentLoaded", loadVariants);
function addRow() {
    const tbody = document.getElementById("orderItemsBody");

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>
        <select onchange="updateRow(this)"></select>
      </td>
      <td>
        <input type="number" value="1" min="1" onchange="updateRow(this)">
      </td>
      <td class="price">0</td>
      <td class="subtotal">0</td>
      <td>
        <button onclick="this.closest('tr').remove(); calculateTotal()">❌</button>
      </td>
    `;

    const select = tr.querySelector("select");
    variants.forEach(v => {
        const opt = document.createElement("option");
        opt.value = v.id;
        opt.textContent = v.name;
        select.appendChild(opt);
    });

    tbody.appendChild(tr);
    updateRow(select);
}

function updateRow(el) {
    const tr = el.closest("tr");
    const variantId = tr.querySelector("select").value;
    const quantity = Number(tr.querySelector("input").value);

    const variant = variants.find(v => v.id == variantId);

    if (!variant) {
        tr.querySelector(".price").innerText = "0";
        tr.querySelector(".subtotal").innerText = "0";
        calculateTotal();
        return;
    }

    const price = variant.price;

    tr.querySelector(".price").innerText = price.toLocaleString();
    tr.querySelector(".subtotal").innerText =
        (price * quantity).toLocaleString();

    calculateTotal();
}

function calculateTotal() {
    let total = 0;
    document.querySelectorAll(".subtotal").forEach(td => {
        total += Number(td.innerText.replaceAll(",", ""));
    });
    document.getElementById("totalAmount").innerText = total.toLocaleString() + " ₫";
}

async function createOrder() {

    const items = [];
    document.querySelectorAll("#orderItemsBody tr").forEach(tr => {
        items.push({
            variantId: tr.querySelector("select").value,
            quantity: Number(tr.querySelector("input").value)
        });
    });

    const res = await fetch("http://localhost:8080/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items })
    });

    if (res.ok) {
        alert("Tạo đơn hàng thành công!");
        document.getElementById("orderItemsBody").innerHTML = "";
        addRow();
        calculateTotal();
    } else {
        const err = await res.text();
        alert(err);
    }
}
async function loadOrders() {
    const res = await fetch("http://localhost:8080/api/orders");

    if (!res.ok) {
        console.error("Lỗi lấy danh sách đơn hàng");
        return;
    }

    const orders = await res.json();

    if (!Array.isArray(orders)) {
        console.error("Dữ liệu đơn hàng không phải mảng:", orders);
        return;
    }

    const tbody = document.getElementById("ordersBody");
    tbody.innerHTML = "";

    orders.forEach(o => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>#${o.orderId}</td>
            <td>${new Date(o.orderDate).toLocaleString()}</td>
            <td>${o.totalAmount.toLocaleString()} ₫</td>
            <td>${o.status}</td>
            <td>
                
                <td>
                    <button onclick="viewOrderDetail(${o.orderId})">Xem</button>
                    ${renderActions(o)}
                </td>

                
            </td>
        `;
        tbody.appendChild(tr);
    });
}

document.addEventListener("DOMContentLoaded", loadOrders);

async function viewOrderDetail(orderId) {

    const res = await fetch(`http://localhost:8080/api/orders/${orderId}/details`);
    const items = await res.json();

    const tbody = document.getElementById("orderDetailBody");
    tbody.innerHTML = "";

    items.forEach(i => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
      <td>${i.productName}</td>
      <td>${i.size}</td>
      <td>${i.color}</td>
      <td>${i.quantity}</td>
      <td>${i.price.toLocaleString()} ₫</td>
    `;
        tbody.appendChild(tr);
    });

    document.getElementById("orderDetailModal").style.display = "block";
}

function closeModal() {
    document.getElementById("orderDetailModal").style.display = "none";
}

async function cancelOrder(orderId) {
    if (!confirm("Bạn có chắc muốn huỷ đơn hàng này?")) return;

    const res = await fetch(
        `http://localhost:8080/api/orders/${orderId}/cancel`,
        { method: "PUT" }
    );

    if (res.ok) {
        alert("Huỷ đơn hàng thành công!");
        loadOrders(); // reload lại danh sách
    } else {
        const msg = await res.text();
        alert(msg);
    }
}

function addRow() {
    const tbody = document.getElementById("orderItemsBody");

    const tr = document.createElement("tr");
    tr.innerHTML = `
        <td>
            <select onchange="updateRow(this)"></select>
        </td>
        <td>
            <input type="number" value="1" min="1" onchange="updateRow(this)">
        </td>
        <td class="price">0</td>
        <td class="subtotal">0</td>
        <td>
            <button onclick="this.closest('tr').remove(); calculateTotal()">❌</button>
        </td>
    `;

    const select = tr.querySelector("select");
    variants.forEach(v => {
        const opt = document.createElement("option");
        opt.value = v.id;
        opt.textContent = v.name;
        select.appendChild(opt);
    });

    tbody.appendChild(tr);
    updateRow(select);
}
function renderActions(o) {
    if (o.status === "PENDING") {
        return `
            <button class="btn-complete" onclick="completeOrder(${o.orderId})">
                Hoàn thành
            </button>
            <button class="btn-cancel" onclick="cancelOrder(${o.orderId})">
                Hủy
            </button>
        `;
    }
    return "";
}

async function completeOrder(orderId) {
    if (!confirm("Xác nhận hoàn thành đơn hàng này?")) return;

    const res = await fetch(
        `${API_BASE}/api/orders/${orderId}/complete`,
        { method: "PUT" }
    );

    if (res.ok) {
        alert("Đơn hàng đã hoàn thành!");
        loadOrders();
    } else {
        const msg = await res.text();
        alert(msg);
    }
}

