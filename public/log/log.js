document.addEventListener("DOMContentLoaded", () => {
    const userId = localStorage.getItem("userId");

    if (userId) {
        window.location.href = "/game";
        return;
    }
    
    const form = document.getElementById("auth-form");
    const nameInput = document.getElementById("name");
    const passwordInput = document.getElementById("password");
    const submitBtn = document.getElementById("submit-btn");
    const toggleText = document.getElementById("toggle-text");
    const responseMessage = document.getElementById("response-message");
    const formTitle = document.getElementById("form-title");

    let isLogin = true; 


    function updateForm() {
        if (isLogin) {
            formTitle.textContent = "Login";
            submitBtn.textContent = "Log in";
            toggleText.innerHTML = `Don't have an account? <a href="#" id="toggle-link">Log up</a>`;
        } else {
            formTitle.textContent = "Registration";
            submitBtn.textContent = "Log up";
            toggleText.innerHTML = `Have an account? <a href="#" id="toggle-link">Log in</a>`;
        }

        document.getElementById("toggle-link").addEventListener("click", (e) => {
            e.preventDefault();
            isLogin = !isLogin;
            updateForm();
        });
    }

    updateForm(); 
    
    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const name = nameInput.value.trim();
        const password = passwordInput.value.trim();

        if (!name || !password) {
            responseMessage.textContent = "All inputs require!";
            responseMessage.style.color = "red";
            return;
        }

        const endpoint = isLogin ? "/login" : "/register";
        const response = await fetch(endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, password }),
        });

        const data = await response.json();

        if (response.ok) {
            responseMessage.textContent = data.message;
            responseMessage.style.color = "green";
            localStorage.setItem("userId", data.id);
            window.location.href = "/game";
        }
    });
});
