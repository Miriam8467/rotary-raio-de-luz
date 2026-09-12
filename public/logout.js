document.addEventListener("DOMContentLoaded", function () {

    const btnLogout = document.getElementById("btnLogout");

    if (!btnLogout) {
        return;
    }

    btnLogout.addEventListener("click", function () {

        const modal = document.createElement("div");

        modal.className = "logout-modal";

        modal.innerHTML = `

            <div class="logout-modal-content">

                <h2>
                    Sair do sistema
                </h2>

                <p>
                    Deseja realmente sair do sistema?
                </p>

                <div class="logout-modal-buttons">

                    <button
                        type="button"
                        class="logout-cancel"
                        id="cancelarLogout"
                    >
                        Cancelar
                    </button>

                    <button
                        type="button"
                        class="logout-confirm"
                        id="confirmarLogout"
                    >
                        Sair
                    </button>

                </div>

            </div>

        `;

        document.body.appendChild(modal);


        const cancelar =
            document.getElementById("cancelarLogout");

        const confirmar =
            document.getElementById("confirmarLogout");


        cancelar.addEventListener("click", function () {

            modal.remove();

        });


        modal.addEventListener("click", function (event) {

            if (event.target === modal) {

                modal.remove();

            }

        });


        confirmar.addEventListener(
            "click",
            async function () {

                confirmar.disabled = true;

                confirmar.textContent = "Saindo...";


                try {

                    const resposta = await fetch(
                        "/api/logout",
                        {
                            method: "POST"
                        }
                    );


                    const dados = await resposta.json();


                    if (
                        !resposta.ok ||
                        dados.sucesso === false
                    ) {

                        throw new Error(
                            dados.mensagem ||
                            "Erro ao sair do sistema."
                        );

                    }


                    window.location.href =
                        "/login.html";


                }
                catch (erro) {

                    console.error(
                        "Erro ao sair:",
                        erro
                    );


                    confirmar.disabled = false;

                    confirmar.textContent = "Sair";

                }

            }
        );

    });

});