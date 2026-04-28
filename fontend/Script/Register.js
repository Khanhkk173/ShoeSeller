function togglePass() {
    let list = document.querySelectorAll(".password");
    list.forEach(input => {
        input.type = (input.type === "password") ? "text" : "password";
    });
}

function register() {
    const email    = document.getElementById("email").value.trim();
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("pass").value.trim();
    const cfpass   = document.getElementById("cfpass").value.trim();

    // 1. Kiểm tra đầy đủ thông tin
    if (!email || !username || !password || !cfpass) {
        alert("Vui lòng nhập đầy đủ thông tin!");
        return;
    }

    // 2. Kiểm tra định dạng email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        alert("Email không hợp lệ!");
        return;
    }

    // 3. Kiểm tra độ dài username
    if (username.length < 3) {
        alert("Username phải có ít nhất 3 ký tự!");
        return;
    }

    // 4. Kiểm tra độ dài password
    if (password.length < 6) {
        alert("Mật khẩu phải có ít nhất 6 ký tự!");
        return;
    }

    // 5. Kiểm tra password khớp
    if (password !== cfpass) {
        alert("Mật khẩu xác nhận không khớp!");
        return;
    }

    fetch("http://localhost:8080/api/auth/register", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            email: email,
            username: username,
            password: password
        })
    })
    .then(res => res.text())
    .then(data => {
        alert(data);
        if (data === "Register success") {
            window.location.href = "Login.html";
        }
    })
    .catch(err => {
        alert("Không thể kết nối đến server!");
    });
}