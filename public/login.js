// ========================================
// LOGIN - ROTARY RAIO DE LUZ
// ========================================

console.log("LOGIN.JS FOI CARREGADO!");

const loginForm = document.getElementById("loginForm");
const mensagemLogin = document.getElementById("mensagemLogin");
const btnLogin = document.getElementById("btnLogin");

loginForm.addEventListener("submit", async function (event) {

    event.preventDefault();

    const email = document.getElementById("email").value.trim();
    const senha = document.getElementById("senha").value;

    mensagemLogin.textContent = "";
    mensagemLogin.className = "mensagem-login";

    btnLogin.disabled = true;
    btnLogin.textContent = "Entrando...";

    try {

        const resposta = await fetch("/api/login", {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                email: email,
                senha: senha
            })
        });

        const dados = await resposta.json();

        console.log("Resposta do login:", dados);

        if (!resposta.ok || dados.sucesso === false) {

            throw new Error(
                dados.mensagem ||
                "Não foi possível realizar o login."
            );
        }

        mensagemLogin.textContent =
            "Login realizado com sucesso!";

        mensagemLogin.classList.add("sucesso");

        setTimeout(function () {

            window.location.href = "/index.html";

        }, 500);

    } catch (erro) {

        console.error("Erro no login:", erro);

        mensagemLogin.textContent =
            erro.message ||
            "Erro ao realizar login.";

        mensagemLogin.classList.add("erro");

    } finally {

        btnLogin.disabled = false;
        btnLogin.textContent = "Entrar";
    }
});