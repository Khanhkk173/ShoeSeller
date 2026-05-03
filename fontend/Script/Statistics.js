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
// MOCK DATA - sau này thay bằng API
document.getElementById("totalRevenue").innerText = "25,500,000 ₫";
document.getElementById("totalOrders").innerText = "12";
document.getElementById("totalSold").innerText = "38";
document.getElementById("currentStock").innerText = "120";

// Mock top sản phẩm
const topProducts = [
    { name: "Nike Air 270", qty: 10, revenue: 25000000 },
    { name: "Jordan Low", qty: 5, revenue: 12000000 }
];

const tbody = document.getElementById("topProductBody");
topProducts.forEach(p => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
    <td>${p.name}</td>
    <td>${p.qty}</td>
    <td>${p.revenue.toLocaleString()} ₫</td>
  `;
    tbody.appendChild(tr);
});
// Chart sẽ được vẽ bởi API thực - không tạo mock chart ở đây

const API = "http://localhost:8080/api/statistics";

// Tổng quan
fetch(`${API}/overview`)
    .then(r => r.json())
    .then(d => {
        document.getElementById("totalRevenue").innerText =
            Number(d.totalRevenue).toLocaleString("vi-VN") + " ₫";
        document.getElementById("totalOrders").innerText =
            Number(d.totalOrders).toLocaleString("vi-VN");
        document.getElementById("totalSold").innerText =
            Number(d.totalSold).toLocaleString("vi-VN");
        document.getElementById("currentStock").innerText =
            Number(d.currentStock).toLocaleString("vi-VN");
    })
    .catch(err => console.error("Lỗi overview:", err));

// Biểu đồ

fetch(`${API}/revenue`)
  .then(res => {
      if (!res.ok) {
          throw new Error("API revenue lỗi");
      }
      return res.json();
  })
  .then(data => {
      if (!Array.isArray(data)) {
          console.error("Dữ liệu revenue KHÔNG PHẢI mảng:", data);
          return;
      }

      const labels = data.map(i =>
          new Date(i.date).toLocaleDateString("vi-VN")
      );
      const values = data.map(i => i.revenue);

      const ctx = document.getElementById("revenueChart").getContext("2d");

      // ✅ XÓA chart cũ nếu có
      if (window.revenueChartInstance) {
          window.revenueChartInstance.destroy();
      }

      window.revenueChartInstance = new Chart(ctx, {
          type: "line",
          data: {
              labels: labels,
              datasets: [{
                  label: "Doanh thu",
                  data: values,
                  borderColor: "#6a5af9",
                  backgroundColor: "rgba(106, 90, 249, 0.15)",
                  tension: 0.4,
                  fill: true
              }]
          },
          options: {
              responsive: true,
              plugins: {
                  legend: { display: true }
              }
          }
      });
  })
  .catch(err => console.error("Lỗi vẽ biểu đồ:", err));
// Top sản phẩm
fetch(`${API}/top-products`)
  .then(res => {
      if (!res.ok) {
          throw new Error("API top-products lỗi");
      }
      return res.json();
  })
  .then(items => {
      if (!Array.isArray(items)) {
          console.error("Top products KHÔNG PHẢI mảng:", items);
          return;
      }

      const tbody = document.getElementById("topProductBody");
      tbody.innerHTML = "";

      items.forEach(p => {
          const tr = document.createElement("tr");
          tr.innerHTML = `
              <td>${p.productName}</td>
              <td>${p.quantitySold}</td>
              <td>${p.revenue.toLocaleString()} ₫</td>
          `;
          tbody.appendChild(tr);
      });
  })
  .catch(err => console.error("Lỗi top-products:", err));