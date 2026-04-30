function togglePass() {
    const pass = document.getElementById("pass");
    if (pass) {
        pass.type = pass.type === "password" ? "text" : "password";
    }
}

async function login() {
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("pass").value.trim();

    if (!username || !password) {
        alert("Vui lòng nhập đầy đủ username và password!");
        return;
    }

    const loginData = {
        username: username,
        password: password
    };

    try {
        const response = await fetch("http://localhost:8080/api/auth/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify(loginData)
        });

        const result = await response.json();
        console.log("Login response:", result);

        if (response.ok && result.success) {
            if (result.data) {
                localStorage.setItem("user", JSON.stringify(result.data));
            }

            alert(result.message || "Đăng nhập thành công!");
            window.location.href = "../html/Dashboard.html";
        } else {
            alert(result.message || "Đăng nhập thất bại!");
        }
    } catch (error) {
        console.error("Lỗi kết nối:", error);
        alert("Không thể kết nối đến server. Vui lòng kiểm tra backend có đang chạy không!");
    }
}