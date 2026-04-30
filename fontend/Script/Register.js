// Register.js

function togglePass() {
    const passwords = document.querySelectorAll(".password");
    passwords.forEach(input => {
        input.type = input.type === "password" ? "text" : "password";
    });
}

// Hàm đăng ký
async function register() {
    const email = document.getElementById("email").value.trim();
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("pass").value.trim();
    const confirmPassword = document.getElementById("cfpass").value.trim();

    // Kiểm tra dữ liệu
    if (!email || !username || !password || !confirmPassword) {
        alert("Vui lòng nhập đầy đủ thông tin!");
        return;
    }

    if (password !== confirmPassword) {
        alert("Mật khẩu xác nhận không khớp!");
        return;
    }

    if (password.length < 6) {
        alert("Mật khẩu phải có ít nhất 6 ký tự!");
        return;
    }

    const registerData = {
        email: email,
        username: username,
        password: password
    };

    try {
        const response = await fetch('http://localhost:8080/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(registerData)
        });

        const result = await response.json();

        if (response.ok) {
            alert("Đăng ký thành công! Vui lòng đăng nhập.");
            // Chuyển sang trang login
            window.location.href = "../html/Login.html";
        } else {
            alert(result.message || "Đăng ký thất bại!");
        }
    } catch (error) {
        console.error("Lỗi:", error);
        alert("Không thể kết nối đến server. Backend có đang chạy không?");
    }
}