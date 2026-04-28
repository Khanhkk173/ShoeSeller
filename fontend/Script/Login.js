function togglePass() {
    let p = document.getElementById("pass");
    p.type = (p.type == "password") ? "text" : "password";
}

function login() {
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("pass").value.trim();

    // Kiểm tra đầy đủ thông tin
    if (!username || !password) {
        alert("Vui lòng nhập đầy đủ tài khoản và mật khẩu!");
        return;
    }

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
            localStorage.setItem("isLogin", "true");
            localStorage.setItem("username", username);
            window.location.href = "Dashboard.html";
        } else {
            alert("Sai tài khoản hoặc mật khẩu!");
        }
    })
    .catch(err => {
        alert("Không thể kết nối đến server!");
    });
}