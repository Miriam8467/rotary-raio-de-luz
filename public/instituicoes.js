// ========================================
// INSTITUIÇÕES - ROTARY RAIO DE LUZ
// ========================================

console.log("INSTITUICOES.JS FOI CARREGADO!");


const formInstituicao =
    document.getElementById("formInstituicao");

const listaInstituicoes =
    document.getElementById("listaInstituicoes");


let idInstituicaoEditando = null;


// ========================================
// ESTILOS DOS COMPONENTES
// ========================================

const estiloInstituicoes = document.createElement("style");

estiloInstituicoes.textContent = `

    /* ========================================
       MENSAGEM DO SISTEMA
    ======================================== */

    .mensagem-sistema {
        position: fixed;

        top: 25px;
        right: 25px;

        z-index: 9999;

        min-width: 300px;
        max-width: 420px;

        padding: 16px 20px;

        border-radius: 10px;

        background: #ffffff;

        box-shadow:
            0 8px 30px rgba(15, 35, 70, 0.15);

        border-left: 5px solid #17458f;

        color: #263238;

        font-size: 14px;
        font-weight: 600;

        display: flex;
        align-items: center;
        gap: 12px;

        animation: aparecerMensagem 0.25s ease;
    }


    .mensagem-sistema.sucesso {
        border-left-color: #2e7d32;
    }


    .mensagem-sistema.erro {
        border-left-color: #c62828;
    }


    .mensagem-icone {
        font-size: 21px;
        min-width: 24px;
    }


    .mensagem-texto {
        flex: 1;
    }


    @keyframes aparecerMensagem {

        from {
            opacity: 0;
            transform: translateY(-10px);
        }

        to {
            opacity: 1;
            transform: translateY(0);
        }

    }


    /* ========================================
       CARDS DAS INSTITUIÇÕES
    ======================================== */

    .instituicao-card {
        position: relative;

        background: #ffffff;

        border: 1px solid #e4e8ee;

        border-radius: 14px;

        padding: 22px;

        margin-top: 15px;

        box-shadow:
            0 4px 15px rgba(15, 35, 70, 0.06);

        transition:
            transform 0.2s ease,
            box-shadow 0.2s ease;
    }


    .instituicao-card:hover {
        transform: translateY(-2px);

        box-shadow:
            0 8px 25px rgba(15, 35, 70, 0.10);
    }


    .instituicao-card h3 {
        color: #17458f;

        font-size: 19px;

        margin-bottom: 15px;

        padding-right: 10px;
    }


    .instituicao-card p {
        color: #59636f;

        font-size: 14px;

        margin-bottom: 8px;
    }


    .instituicao-card p strong {
        color: #263238;
    }


    /* ========================================
       BOTÕES DE AÇÃO
    ======================================== */

    .acoes-instituicao {
        display: flex;

        gap: 10px;

        margin-top: 20px;

        padding-top: 15px;

        border-top: 1px solid #edf0f3;
    }


    .acoes-instituicao button {
        border: none;

        border-radius: 8px;

        padding: 10px 16px;

        cursor: pointer;

        font-family: Arial, Helvetica, sans-serif;

        font-size: 14px;

        font-weight: 600;

        transition:
            transform 0.2s ease,
            box-shadow 0.2s ease,
            background-color 0.2s ease;
    }


    .botao-editar {
        background: #eaf1fb;

        color: #17458f;
    }


    .botao-editar:hover {
        background: #dce8f8;

        transform: translateY(-1px);

        box-shadow:
            0 3px 8px rgba(23, 69, 143, 0.12);
    }


    .botao-excluir {
        background: #fdecec;

        color: #c62828;
    }


    .botao-excluir:hover {
        background: #f9dada;

        transform: translateY(-1px);

        box-shadow:
            0 3px 8px rgba(198, 40, 40, 0.12);
    }


    /* ========================================
       BOTÃO CANCELAR EDIÇÃO
    ======================================== */

    #botaoCancelarEdicao {
        background: #f1f3f5 !important;

        color: #59636f !important;

        border: 1px solid #dfe3e8 !important;

        margin-top: 8px !important;
    }


    #botaoCancelarEdicao:hover {
        background: #e5e8eb !important;
    }


    /* ========================================
       MODAL DE EXCLUSÃO
    ======================================== */

    .modal-fundo {
        position: fixed;

        inset: 0;

        z-index: 10000;

        display: flex;

        align-items: center;
        justify-content: center;

        padding: 20px;

        background: rgba(15, 35, 70, 0.45);

        animation: aparecerFundo 0.2s ease;
    }


    .modal-exclusao {
        width: 100%;
        max-width: 450px;

        background: #ffffff;

        border-radius: 16px;

        padding: 28px;

        box-shadow:
            0 20px 50px rgba(15, 35, 70, 0.20);

        animation: aparecerModal 0.2s ease;
    }


    .modal-icone {
        width: 52px;
        height: 52px;

        display: flex;
        align-items: center;
        justify-content: center;

        background: #fdecec;

        border-radius: 12px;

        font-size: 25px;

        margin-bottom: 18px;
    }


    .modal-exclusao h3 {
        color: #263238;

        font-size: 21px;

        margin-bottom: 10px;
    }


    .modal-exclusao p {
        color: #6b7280;

        font-size: 14px;

        line-height: 1.6;

        margin-bottom: 22px;
    }


    .modal-acoes {
        display: flex;

        justify-content: flex-end;

        gap: 10px;
    }


    .modal-acoes button {
        border: none;

        border-radius: 8px;

        padding: 11px 18px;

        cursor: pointer;

        font-family: Arial, Helvetica, sans-serif;

        font-size: 14px;

        font-weight: 600;
    }


    .modal-cancelar {
        background: #f1f3f5;

        color: #4b5563;
    }


    .modal-cancelar:hover {
        background: #e5e8eb;
    }


    .modal-confirmar {
        background: #c62828;

        color: #ffffff;
    }


    .modal-confirmar:hover {
        background: #a91f1f;
    }


    @keyframes aparecerFundo {

        from {
            opacity: 0;
        }

        to {
            opacity: 1;
        }

    }


    @keyframes aparecerModal {

        from {
            opacity: 0;
            transform: translateY(-10px) scale(0.98);
        }

        to {
            opacity: 1;
            transform: translateY(0) scale(1);
        }

    }


    /* ========================================
       CELULAR
    ======================================== */

    @media (max-width: 600px) {

        .mensagem-sistema {
            top: 15px;

            left: 15px;
            right: 15px;

            min-width: auto;

            max-width: none;
        }


        .acoes-instituicao {
            flex-direction: column;
        }


        .acoes-instituicao button {
            width: 100%;
        }


        .modal-exclusao {
            padding: 22px;
        }


        .modal-acoes {
            flex-direction: column-reverse;
        }


        .modal-acoes button {
            width: 100%;
        }

    }

`;

document.head.appendChild(estiloInstituicoes);


// ========================================
// MENSAGEM NA TELA
// ========================================

function mostrarMensagem(mensagem, tipo = "sucesso") {

    const mensagemExistente =
        document.querySelector(".mensagem-sistema");

    if (mensagemExistente) {
        mensagemExistente.remove();
    }


    const elemento =
        document.createElement("div");

    elemento.className =
        `mensagem-sistema ${tipo}`;


    const icone =
        tipo === "sucesso"
            ? "✓"
            : "⚠";


    elemento.innerHTML = `

        <span class="mensagem-icone">
            ${icone}
        </span>

        <span class="mensagem-texto">
            ${mensagem}
        </span>

    `;


    document.body.appendChild(elemento);


    setTimeout(() => {

        if (elemento) {
            elemento.remove();
        }

    }, 4000);

}


// ========================================
// CADASTRAR / EDITAR INSTITUIÇÃO
// ========================================

formInstituicao.addEventListener(
    "submit",
    async function (evento) {

        evento.preventDefault();


        const nome =
            document
                .getElementById("nome")
                .value
                .trim();


        const tipo =
            document
                .getElementById("tipo")
                .value;


        const contato =
            document
                .getElementById("contato")
                .value
                .trim();


        const telefone =
            document
                .getElementById("telefone")
                .value
                .trim();


        const email =
            document
                .getElementById("email")
                .value
                .trim();


        const descricao =
            document
                .getElementById("descricao")
                .value
                .trim();


        const dadosInstituicao = {

            nome,
            tipo,
            contato,
            telefone,
            email,
            descricao

        };


        try {

            let resposta;


            // ========================================
            // EDITAR
            // ========================================

            if (idInstituicaoEditando !== null) {

                resposta =
                    await fetch(
                        `/api/instituicoes/${idInstituicaoEditando}`,
                        {
                            method: "PUT",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body:
                                JSON.stringify(
                                    dadosInstituicao
                                )
                        }
                    );

            }


            // ========================================
            // CADASTRAR
            // ========================================

            else {

                resposta =
                    await fetch(
                        "/api/instituicoes",
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body:
                                JSON.stringify(
                                    dadosInstituicao
                                )
                        }
                    );

            }


            const dados =
                await resposta.json();


            if (!resposta.ok || !dados.sucesso) {

                throw new Error(
                    dados.mensagem ||
                    "Erro ao salvar instituição."
                );

            }


            // ========================================
            // MENSAGEM
            // ========================================

            if (idInstituicaoEditando !== null) {

                mostrarMensagem(
                    "Instituição atualizada com sucesso!",
                    "sucesso"
                );

            }

            else {

                mostrarMensagem(
                    "Instituição cadastrada com sucesso!",
                    "sucesso"
                );

            }


            // ========================================
            // LIMPAR FORMULÁRIO
            // ========================================

            formInstituicao.reset();


            idInstituicaoEditando = null;


            const botaoSalvar =
                document.querySelector(
                    "#formInstituicao button[type='submit']"
                );


            botaoSalvar.textContent =
                "Cadastrar instituição";


            // Remove botão cancelar

            const botaoCancelar =
                document.getElementById(
                    "botaoCancelarEdicao"
                );


            if (botaoCancelar) {
                botaoCancelar.remove();
            }


            // Atualiza lista

            carregarInstituicoes();

        }


        catch (erro) {

            console.error(
                "Erro ao salvar instituição:",
                erro
            );


            mostrarMensagem(
                erro.message ||
                "Erro ao salvar instituição.",
                "erro"
            );

        }

    }
);


// ========================================
// CARREGAR INSTITUIÇÕES
// ========================================

async function carregarInstituicoes() {

    try {

        const resposta =
            await fetch(
                "/api/instituicoes"
            );


        const dados =
            await resposta.json();


        console.log(
            "Instituições recebidas:",
            dados
        );


        if (!resposta.ok || !dados.sucesso) {

            throw new Error(
                dados.mensagem ||
                "Erro ao carregar instituições."
            );

        }


        // ========================================
        // NENHUMA INSTITUIÇÃO
        // ========================================

        if (dados.total === 0) {

            listaInstituicoes.innerHTML = `

                <p class="info">
                    Nenhuma instituição cadastrada.
                </p>

            `;

            return;

        }


        // ========================================
        // LIMPAR LISTA
        // ========================================

        listaInstituicoes.innerHTML = "";


        // ========================================
        // CRIAR CARDS
        // ========================================

        dados.dados.forEach(
            function (instituicao) {

                const card =
                    document.createElement("div");


                card.className =
                    "instituicao-card";


                card.innerHTML = `

                    <h3>
                        ${instituicao.nome || "-"}
                    </h3>


                    <p>
                        <strong>Tipo:</strong>
                        ${instituicao.tipo || "-"}
                    </p>


                    <p>
                        <strong>Contato:</strong>
                        ${instituicao.contato || "-"}
                    </p>


                    <p>
                        <strong>Telefone:</strong>
                        ${instituicao.telefone || "-"}
                    </p>


                    <p>
                        <strong>E-mail:</strong>
                        ${instituicao.email || "-"}
                    </p>


                    <p>
                        <strong>Descrição:</strong>
                        ${instituicao.descricao || "-"}
                    </p>


                    <div class="acoes-instituicao">


                        <button
                            type="button"
                            class="botao-editar"
                            onclick="editarInstituicao(${instituicao.id})"
                        >

                            ✏️ Editar

                        </button>


                        <button
                            type="button"
                            class="botao-excluir"
                            onclick="excluirInstituicao(${instituicao.id}, '${String(instituicao.nome || "").replace(/'/g, "\\'")}')"
                        >

                            🗑️ Excluir

                        </button>


                    </div>

                `;


                listaInstituicoes.appendChild(card);

            }
        );


    }

    catch (erro) {

        console.error(
            "Erro ao carregar instituições:",
            erro
        );


        listaInstituicoes.innerHTML = `

            <p class="info">
                Não foi possível carregar as instituições.
            </p>

        `;

    }

}


// ========================================
// EDITAR INSTITUIÇÃO
// ========================================

async function editarInstituicao(id) {

    try {

        const resposta =
            await fetch(
                `/api/instituicoes/${id}`
            );


        const dados =
            await resposta.json();


        if (!resposta.ok || !dados.sucesso) {

            throw new Error(
                dados.mensagem ||
                "Erro ao buscar instituição."
            );

        }


        const instituicao =
            dados.dados;


        // ========================================
        // PREENCHER FORMULÁRIO
        // ========================================

        document.getElementById("nome").value =
            instituicao.nome || "";


        document.getElementById("tipo").value =
            instituicao.tipo || "";


        document.getElementById("contato").value =
            instituicao.contato || "";


        document.getElementById("telefone").value =
            instituicao.telefone || "";


        document.getElementById("email").value =
            instituicao.email || "";


        document.getElementById("descricao").value =
            instituicao.descricao || "";


        // Guarda o ID

        idInstituicaoEditando =
            id;


        // ========================================
        // ALTERAR BOTÃO
        // ========================================

        const botaoSalvar =
            document.querySelector(
                "#formInstituicao button[type='submit']"
            );


        botaoSalvar.textContent =
            "Salvar alterações";


        // ========================================
        // CRIAR BOTÃO CANCELAR
        // ========================================

        let botaoCancelar =
            document.getElementById(
                "botaoCancelarEdicao"
            );


        if (!botaoCancelar) {

            botaoCancelar =
                document.createElement("button");


            botaoCancelar.type =
                "button";


            botaoCancelar.id =
                "botaoCancelarEdicao";


            botaoCancelar.textContent =
                "Cancelar edição";


            botaoCancelar.addEventListener(
                "click",
                cancelarEdicao
            );


            formInstituicao.appendChild(
                botaoCancelar
            );

        }


        // ========================================
        // AVISAR QUE ESTÁ EDITANDO
        // ========================================

        mostrarMensagem(
            "Modo de edição ativado. Altere os dados e salve as alterações.",
            "sucesso"
        );


        // ========================================
        // VOLTAR PARA FORMULÁRIO
        // ========================================

        document.getElementById("nome")
            .scrollIntoView({
                behavior: "smooth",
                block: "center"
            });


        // Coloca foco no nome

        setTimeout(() => {

            document
                .getElementById("nome")
                .focus();

        }, 400);


    }

    catch (erro) {

        console.error(
            "Erro ao editar instituição:",
            erro
        );


        mostrarMensagem(
            erro.message ||
            "Erro ao carregar instituição.",
            "erro"
        );

    }

}


// ========================================
// CANCELAR EDIÇÃO
// ========================================

function cancelarEdicao() {

    formInstituicao.reset();


    idInstituicaoEditando =
        null;


    const botaoSalvar =
        document.querySelector(
            "#formInstituicao button[type='submit']"
        );


    botaoSalvar.textContent =
        "Cadastrar instituição";


    const botaoCancelar =
        document.getElementById(
            "botaoCancelarEdicao"
        );


    if (botaoCancelar) {
        botaoCancelar.remove();
    }


    mostrarMensagem(
        "Edição cancelada.",
        "sucesso"
    );

}


// ========================================
// MODAL DE EXCLUSÃO
// ========================================

function abrirModalExclusao(id, nome) {

    // Impede dois modais

    const modalExistente =
        document.querySelector(".modal-fundo");


    if (modalExistente) {
        modalExistente.remove();
    }


    const fundo =
        document.createElement("div");


    fundo.className =
        "modal-fundo";


    fundo.innerHTML = `

        <div
            class="modal-exclusao"
            role="dialog"
            aria-modal="true"
        >

            <div class="modal-icone">
                🗑️
            </div>


            <h3>
                Excluir instituição?
            </h3>


            <p>

                Tem certeza que deseja excluir
                <strong>${nome || "esta instituição"}</strong>?

                <br><br>

                Essa ação não poderá ser desfeita.

            </p>


            <div class="modal-acoes">


                <button
                    type="button"
                    class="modal-cancelar"
                    id="modalCancelar"
                >
                    Cancelar
                </button>


                <button
                    type="button"
                    class="modal-confirmar"
                    id="modalConfirmar"
                >
                    Excluir instituição
                </button>


            </div>

        </div>

    `;


    document.body.appendChild(fundo);


    // ========================================
    // CANCELAR
    // ========================================

    document
        .getElementById("modalCancelar")
        .addEventListener(
            "click",
            () => fundo.remove()
        );


    // ========================================
    // CLICAR FORA DO MODAL
    // ========================================

    fundo.addEventListener(
        "click",
        function (evento) {

            if (evento.target === fundo) {
                fundo.remove();
            }

        }
    );


    // ========================================
    // CONFIRMAR EXCLUSÃO
    // ========================================

    document
        .getElementById("modalConfirmar")
        .addEventListener(
            "click",
            async function () {

                fundo.remove();

                await realizarExclusao(id);

            }
        );

}


// ========================================
// EXCLUIR INSTITUIÇÃO
// ========================================

function excluirInstituicao(id, nome) {

    abrirModalExclusao(
        id,
        nome
    );

}


// ========================================
// REALIZAR EXCLUSÃO
// ========================================

async function realizarExclusao(id) {

    try {

        const resposta =
            await fetch(
                `/api/instituicoes/${id}`,
                {
                    method: "DELETE"
                }
            );


        const dados =
            await resposta.json();


        if (!resposta.ok || !dados.sucesso) {

            throw new Error(
                dados.mensagem ||
                "Erro ao excluir instituição."
            );

        }


        mostrarMensagem(
            "Instituição excluída com sucesso!",
            "sucesso"
        );


        // Atualiza lista

        carregarInstituicoes();


    }

    catch (erro) {

        console.error(
            "Erro ao excluir instituição:",
            erro
        );


        mostrarMensagem(
            erro.message ||
            "Erro ao excluir instituição.",
            "erro"
        );

    }

}


// ========================================
// INICIAR
// ========================================

carregarInstituicoes();