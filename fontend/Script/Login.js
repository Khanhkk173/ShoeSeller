// Login.js

function togglePass() {
    const pass = document.getElementById("pass");
    if (pass) {
        pass.type = pass.type === "password" ? "text" : "password";
    }
}

// Hàm login chính
async function login() {
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("pass").value.trim();

    // Kiểm tra dữ liệu đầu vào
    if (!username || !password) {
        alert("Vui lòng nhập đầy đủ username và password!");
        return;
    }

    const loginData = {
        username: username,
        password: password
    };

    try {
        const response = await fetch('http://localhost:8080/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(loginData)
        });

        const result = await response.json();

        if (response.ok) {
            console.log("Đăng nhập thành công:", result);
            alert("Đăng nhập thành công!");

            // Lưu thông tin user vào localStorage
            if (result.data) {
                localStorage.setItem('user', JSON.stringify(result.data));
            }

            // Chuyển hướng về trang chủ (sửa đường dẫn cho đúng với dự án của bạn)
            window.location.href = "../html/Dashboard.html";  
            // Hoặc: window.location.href = "index.html";

        } else {
            alert(result.message || "Đăng nhập thất bại!");
        }
    } catch (error) {
        console.error("Lỗi kết nối:", error);
        alert("Không thể kết nối đến server. Vui lòng kiểm tra backend có đang chạy không!");
    }
}