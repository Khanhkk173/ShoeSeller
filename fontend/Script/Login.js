function togglePass() {
    let p = document.getElementById("pass");
    p.type = (p.type == "password") ? "text" : "password";
}
function login() {
    const username = document.getElementById("username").value;
    const password = document.getElementById("pass").value;

    fetch("http://localhost:8080/api/auth/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            username: username,
            password: password
        })
    })
    .then(res => res.text())
    .then(data => {
        if (data === "Login success") {

            // ✅ lưu trạng thái login
            localStorage.setItem("isLogin", "true");
            localStorage.setItem("username", username);

            // 👉 chuyển trang
            window.location.href = "Dashboard.html";

        } else {
            alert("Sai tài khoản hoặc mật khẩu!");
        }
    });
}