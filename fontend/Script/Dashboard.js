// Dashboard.js

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
// ==================== THỐNG KÊ TỔNG QUAN ====================

async function loadOverviewStats() {
    try {
        const response = await fetch('http://localhost:8080/api/statistics/overview', {
            method: 'GET',
            credentials: 'include'   // nếu dùng session
        });

        const result = await response.json();

        if (response.ok && result.data) {
            const stats = result.data;

            // Format số tiền có dấu chấm (VNĐ)
            document.getElementById("doanhthu").innerText =
                stats.totalRevenue.toLocaleString('vi-VN') + " ₫";

            document.getElementById("donhang").innerText =
                stats.totalOrders.toLocaleString('vi-VN');

            document.getElementById("sanpham").innerText =
                stats.totalProducts.toLocaleString('vi-VN');

            document.getElementById("tonkho").innerText =
                stats.stockQuantity.toLocaleString('vi-VN');
        }
    } catch (error) {
        console.error("Lỗi tải thống kê:", error);
        // Có thể set giá trị mặc định hoặc thông báo lỗi
    }
}

// Gọi hàm này khi trang đã load xong
document.addEventListener("DOMContentLoaded", function () {
    const currentUser = checkLogin();
    if (currentUser) {
        document.getElementById("welcome").innerText =
            `Xin chào, ${currentUser.username || currentUser.name || 'User'}`;
    }

    // Load thống kê overview
    loadOverviewStats();

    // Load biểu đồ 7 ngày mặc định
    loadRevenueChart(7);

    // Lắng nghe dropdown nếu có
    const rangeSelect = document.getElementById("rangeSelect");
    if (rangeSelect) {
        rangeSelect.addEventListener("change", function () {
            loadRevenueChart(Number(this.value));
        });
    }
});
let revenueChartInstance = null;

async function loadRevenueChart(days = 7) {
    try {
        const response = await fetch(`http://localhost:8080/api/statistics/revenue-chart?days=${days}`, {
            method: 'GET',
            credentials: 'include'
        });

        const result = await response.json();
        console.log("Revenue chart response:", result);

        if (!response.ok || !result.data) {
            throw new Error(result.message || "Không tải được dữ liệu biểu đồ");
        }

        const chartData = result.data;

        const labels = chartData.map(item => {
            const date = new Date(item.date);
            return date.toLocaleDateString('vi-VN', {
                day: '2-digit',
                month: '2-digit'
            });
        });

        const revenues = chartData.map(item => Number(item.revenue));

        renderRevenueChart(labels, revenues);
    } catch (error) {
        console.error("Lỗi tải biểu đồ doanh thu:", error);
    }
}

function renderRevenueChart(labels, data) {
    const canvas = document.getElementById("revenueChart");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    if (revenueChartInstance) {
        revenueChartInstance.destroy();
    }

    const gradient = ctx.createLinearGradient(0, 0, 0, 300);
    gradient.addColorStop(0, "rgba(99, 102, 241, 0.25)");
    gradient.addColorStop(1, "rgba(99, 102, 241, 0.02)");

    revenueChartInstance = new Chart(ctx, {
        type: "line",
        data: {
            labels: labels,
            datasets: [{
                label: "Doanh thu",
                data: data,
                borderColor: "#6366f1",
                backgroundColor: gradient,
                fill: true,
                tension: 0.35,
                pointRadius: 4,
                pointHoverRadius: 6,
                pointBackgroundColor: "#6366f1",
                pointBorderColor: "#6366f1",
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            return context.raw.toLocaleString('vi-VN') + " ₫";
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        color: "#6b7280"
                    }
                },
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: "#6b7280",
                        callback: function (value) {
                            if (value >= 1000000) {
                                return (value / 1000000) + "M";
                            }
                            return value;
                        }
                    },
                    grid: {
                        color: "rgba(0,0,0,0.06)"
                    }
                }
            }
        }
    });
}