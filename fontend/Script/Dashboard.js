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