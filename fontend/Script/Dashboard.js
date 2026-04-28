const sidebar = document.querySelector(".sidebar");
const sidebarToggleBtn = document.querySelector(".sidebar-toggle");

sidebarToggleBtn.addEventListener("click", () => {
    sidebar.classList.toggle("collapsed");
});

// Kiểm tra đăng nhập
if (localStorage.getItem("isLogin") !== "true") {
    window.location.href = "Login.html";
}

// Hiển thị tên người dùng
const user = localStorage.getItem("username");
document.getElementById("welcome").innerText = "Xin chào, " + user;

// Đăng xuất
function logout() {
    if (confirm("Bạn có chắc muốn đăng xuất không?")) {
        localStorage.removeItem("isLogin");
        localStorage.removeItem("username");
        window.location.href = "Login.html";
    }
}