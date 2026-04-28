function togglePass() {
    let list = document.querySelectorAll(".password");

    list.forEach(input => {
        input.type = (input.type === "password") ? "text" : "password";
    });
}
function register() {
    if (document.getElementById("pass").value !== document.getElementById("cfpass").value) {
        alert("Mật khẩu không khớp!");
        return;
    }
    fetch("http://localhost:8080/api/auth/register", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            email: document.getElementById("email").value,
            username: document.getElementById("username").value,
            password: document.getElementById("pass").value
        })
    })
    .then(res => res.text())
    .then(data => {
        alert(data);
    });
}