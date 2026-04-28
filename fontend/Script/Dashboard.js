const sidebar = document.querySelector(".sidebar");
const sidebarToggleBtn = document.querySelector(".sidebar-toggle");

sidebarToggleBtn.addEventListener("click", () =>{
    sidebar.classList.toggle("collapsed");
});
if (localStorage.getItem("isLogin") !== "true") {
        window.location.href = "Login.html";
}
function logout() {
    localStorage.removeItem("isLogin");
    localStorage.removeItem("username");

    window.location.href = "Login.html";
}


const user = localStorage.getItem("username");
document.getElementById("welcome").innerText = "Xin chào, " + user;
