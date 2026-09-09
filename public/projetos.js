// ========================================
// PROJETOS - ROTARY RAIO DE LUZ
// ========================================

console.log("PROJETOS.JS FOI CARREGADO!");

const formProjeto =
    document.getElementById("formProjeto");

const listaProjetos =
    document.getElementById("listaProjetos");

const selectInstituicao =
    document.getElementById("instituicao_id");

let idProjetoEditando = null;


// ========================================
// ESTILOS DA PÁGINA
// ========================================

const estiloProjetos =
    document.createElement("style");

estiloProjetos.textContent = `

    /* ========================================
       MENSAGENS
    ======================================== */

    .mensagem-projeto {
        position: fixed;

        top: 25px;
        right: 25px;

        z-index: 9999;

        min-width: 300px;
        max-width: 430px;

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

        animation: aparecerMensagemProjeto 0.25s ease;
    }


    .mensagem-projeto.sucesso {
        border-left-color: #2e7d32;
    }


    .mensagem-projeto.erro {
        border-left-color: #c62828;
    }


    .mensagem-projeto .icone {
        font-size: 21px;
        min-width: 24px;
    }


    .mensagem-projeto .texto {
        flex: 1;
    }


    @keyframes aparecerMensagemProjeto {

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
       CARDS DE PROJETO
    ======================================== */

    .projeto-card {

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


    .projeto-card:hover {

        transform: translateY(-2px);

        box-shadow:
            0 8px 25px rgba(15, 35, 70, 0.10);
    }


    .projeto-card h3 {

        color: #17458f;

        font-size: 19px;

        margin-bottom: 16px;

        padding-right: 10px;
    }


    .projeto-card p {

        color: #59636f;

        font-size: 14px;

        line-height: 1.5;

        margin-bottom: 9px;
    }


    .projeto-card p strong {

        color: #263238;
    }


    /* ========================================
       STATUS
    ======================================== */

    .status-projeto {

        display: inline-block;

        padding: 5px 10px;

        border-radius: 20px;

        background: #eaf1fb;

        color: #17458f;

        font-size: 12px;

        font-weight: 700;
    }


    /* ========================================
       AÇÕES
    ======================================== */

    .acoes-projeto {

        display: flex;

        gap: 10px;

        margin-top: 20px;

        padding-top: 15px;

        border-top: 1px solid #edf0f3;
    }


    .acoes-projeto button {

        border: none;

        border-radius: 8px;

        padding: 10px 16px;

        cursor: pointer;

        font-family:
            Arial,
            Helvetica,
            sans-serif;

        font-size: 14px;

        font-weight: 600;

        transition:
            transform 0.2s ease,
            box-shadow 0.2s ease,
            background-color 0.2s ease;
    }


    .botao-editar-projeto {

        background: #eaf1fb;

        color: #17458f;
    }


    .botao-editar-projeto:hover {

        background: #dce8f8;

        transform: translateY(-1px);

        box-shadow:
            0 3px 8px rgba(23, 69, 143, 0.12);
    }


    .botao-excluir-projeto {

        background: #fdecec;

        color: #c62828;
    }


    .botao-excluir-projeto:hover {

        background: #f9dada;

        transform: translateY(-1px);

        box-shadow:
            0 3px 8px rgba(198, 40, 40, 0.12);
    }


    /* ========================================
       BOTÃO CANCELAR EDIÇÃO
    ======================================== */

    .botao-cancelar-projeto {

        background: #f1f3f5 !important;

        color: #59636f !important;

        border: 1px solid #dfe3e8 !important;

        margin-top: 8px !important;
    }


    .botao-cancelar-projeto:hover {

        background: #e5e8eb !important;
    }


    /* ========================================
       MODAL
    ======================================== */

    .modal-projeto-fundo {

        position: fixed;

        inset: 0;

        z-index: 10000;

        display: flex;

        align-items: center;

        justify-content: center;

        padding: 20px;

        background:
            rgba(15, 35, 70, 0.45);

        animation:
            aparecerFundoProjeto 0.2s ease;
    }


    .modal-projeto {

        width: 100%;

        max-width: 450px;

        background: #ffffff;

        border-radius: 16px;

        padding: 28px;

        box-shadow:
            0 20px 50px
            rgba(15, 35, 70, 0.20);

        animation:
            aparecerModalProjeto 0.2s ease;
    }


    .modal-projeto-icone {

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


    .modal-projeto h3 {

        color: #263238;

        font-size: 21px;

        margin-bottom: 10px;
    }


    .modal-projeto p {

        color: #6b7280;

        font-size: 14px;

        line-height: 1.6;

        margin-bottom: 22px;
    }


    .modal-projeto-acoes {

        display: flex;

        justify-content: flex-end;

        gap: 10px;
    }


    .modal-projeto-acoes button {

        border: none;

        border-radius: 8px;

        padding: 11px 18px;

        cursor: pointer;

        font-family:
            Arial,
            Helvetica,
            sans-serif;

        font-size: 14px;

        font-weight: 600;
    }


    .modal-projeto-cancelar {

        background: #f1f3f5;

        color: #4b5563;
    }


    .modal-projeto-cancelar:hover {

        background: #e5e8eb;
    }


    .modal-projeto-confirmar {

        background: #c62828;

        color: #ffffff;
    }


    .modal-projeto-confirmar:hover {

        background: #a91f1f;
    }


    @keyframes aparecerFundoProjeto {

        from {
            opacity: 0;
        }

        to {
            opacity: 1;
        }

    }


    @keyframes aparecerModalProjeto {

        from {
            opacity: 0;
            transform:
                translateY(-10px)
                scale(0.98);
        }

        to {
            opacity: 1;
            transform:
                translateY(0)
                scale(1);
        }

    }


    /* ========================================
       CELULAR
    ======================================== */

    @media (max-width: 700px) {

        .mensagem-projeto {

            top: 15px;

            left: 15px;
            right: 15px;

            min-width: auto;

            max-width: none;
        }


        .acoes-projeto {

            flex-direction: column;
        }


        .acoes-projeto button {

            width: 100%;
        }


        .modal-projeto {

            padding: 22px;
        }


        .modal-projeto-acoes {

            flex-direction: column-reverse;
        }


        .modal-projeto-acoes button {

            width: 100%;
        }

    }

`;

document.head.appendChild(
    estiloProjetos
);


// ========================================
// MENSAGEM PROFISSIONAL
// ========================================

function mostrarMensagemProjeto(
    texto,
    tipoMensagem = "sucesso"
) {

    const antiga =
        document.querySelector(
            ".mensagem-projeto"
        );


    if (antiga) {
        antiga.remove();
    }


    const elemento =
        document.createElement("div");


    elemento.className =
        `mensagem-projeto ${tipoMensagem}`;


    elemento.innerHTML = `

        <span class="icone">

            ${
                tipoMensagem === "sucesso"
                    ? "✓"
                    : "⚠"
            }

        </span>


        <span class="texto">

            ${texto}

        </span>

    `;


    document.body.appendChild(
        elemento
    );


    setTimeout(
        function () {

            if (elemento) {
                elemento.remove();
            }

        },
        4000
    );

}


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
            "Instituições para projetos:",
            dados
        );


        if (!resposta.ok) {

            throw new Error(
                dados.mensagem ||
                "Erro ao carregar instituições."
            );

        }


        const instituicoes =
            Array.isArray(dados)
                ? dados
                : dados.dados || [];


        selectInstituicao.innerHTML = `

            <option value="">

                Selecione uma instituição

            </option>

        `;


        instituicoes.forEach(
            function (instituicao) {

                const option =
                    document.createElement(
                        "option"
                    );


                option.value =
                    instituicao.id;


                option.textContent =
                    instituicao.nome;


                selectInstituicao.appendChild(
                    option
                );

            }
        );


    }

    catch (erro) {

        console.error(
            "Erro ao carregar instituições:",
            erro
        );


        selectInstituicao.innerHTML = `

            <option value="">

                Erro ao carregar instituições

            </option>

        `;

    }

}


// ========================================
// CADASTRAR / EDITAR PROJETO
// ========================================

formProjeto.addEventListener(
    "submit",
    async function (evento) {

        evento.preventDefault();


        const nome =
            document
                .getElementById("nome")
                .value
                .trim();


        const instituicao_id =
            document
                .getElementById("instituicao_id")
                .value;


        const descricao =
            document
                .getElementById("descricao")
                .value
                .trim();


        const data_inicio =
            document
                .getElementById("data_inicio")
                .value;


        const data_conclusao =
            document
                .getElementById("data_conclusao")
                .value;


        const status =
            document
                .getElementById("status")
                .value;


        const valor =
            document
                .getElementById("valor")
                .value;


        const observacao =
            document
                .getElementById("observacao")
                .value
                .trim();


        const dadosProjeto = {

            nome,

            instituicao_id:
                instituicao_id
                    ? Number(instituicao_id)
                    : null,

            descricao,

            data_inicio:
                data_inicio || null,

            data_conclusao:
                data_conclusao || null,

            status,

            valor:
                valor
                    ? Number(valor)
                    : null,

            observacao

        };


        try {

            let resposta;


            // ====================================
            // EDITAR
            // ====================================

            if (
                idProjetoEditando !== null
            ) {

                resposta =
                    await fetch(
                        `/api/projetos/${idProjetoEditando}`,
                        {

                            method: "PUT",

                            headers: {

                                "Content-Type":
                                    "application/json"

                            },

                            body:
                                JSON.stringify(
                                    dadosProjeto
                                )

                        }
                    );

            }


            // ====================================
            // CADASTRAR
            // ====================================

            else {

                resposta =
                    await fetch(
                        "/api/projetos",
                        {

                            method: "POST",

                            headers: {

                                "Content-Type":
                                    "application/json"

                            },

                            body:
                                JSON.stringify(
                                    dadosProjeto
                                )

                        }
                    );

            }


            const dados =
                await resposta.json();


            if (
                !resposta.ok ||
                dados.sucesso === false
            ) {

                throw new Error(
                    dados.mensagem ||
                    "Erro ao salvar projeto."
                );

            }


            // ====================================
            // MENSAGEM
            // ====================================

            mostrarMensagemProjeto(

                idProjetoEditando !== null

                    ? "Projeto atualizado com sucesso!"

                    : "Projeto registrado com sucesso!",

                "sucesso"

            );


            // ====================================
            // LIMPAR
            // ====================================

            formProjeto.reset();


            idProjetoEditando =
                null;


            atualizarFormularioProjeto();


            carregarProjetos();


        }

        catch (erro) {

            console.error(
                "Erro ao salvar projeto:",
                erro
            );


            mostrarMensagemProjeto(

                erro.message ||
                "Erro ao salvar projeto.",

                "erro"

            );

        }

    }
);


// ========================================
// CARREGAR PROJETOS
// ========================================

async function carregarProjetos() {

    try {

        const resposta =
            await fetch(
                "/api/projetos"
            );


        const dados =
            await resposta.json();


        console.log(
            "Projetos recebidos:",
            dados
        );


        if (!resposta.ok) {

            throw new Error(
                dados.mensagem ||
                "Erro ao carregar projetos."
            );

        }


        const projetos =
            Array.isArray(dados)
                ? dados
                : dados.dados || [];


        // ====================================
        // NENHUM PROJETO
        // ====================================

        if (
            projetos.length === 0
        ) {

            listaProjetos.innerHTML = `

                <p class="info">

                    Nenhum projeto registrado.

                </p>

            `;

            return;

        }


        listaProjetos.innerHTML = "";


        // ====================================
        // CRIAR CARDS
        // ====================================

        projetos.forEach(
            function (projeto) {

                const card =
                    document.createElement(
                        "div"
                    );


                card.className =
                    "projeto-card";


                // ====================================
                // VALOR
                // ====================================

                const valorFormatado =

                    projeto.valor !== null &&
                    projeto.valor !== undefined

                        ? Number(
                            projeto.valor
                        ).toLocaleString(
                            "pt-BR",
                            {
                                style: "currency",
                                currency: "BRL"
                            }
                        )

                        : "Não informado";


                // ====================================
                // STATUS
                // ====================================

                const status =
                    projeto.status ||
                    "Não informado";


                // ====================================
                // CARD
                // ====================================

                card.innerHTML = `

                    <h3>

                        ${projeto.nome || "-"}

                    </h3>


                    <p>

                        <strong>
                            Instituição:
                        </strong>

                        ${projeto.instituicao || "-"}

                    </p>


                    <p>

                        <strong>
                            Descrição:
                        </strong>

                        ${projeto.descricao || "-"}

                    </p>


                    <p>

                        <strong>
                            Data de início:
                        </strong>

                        ${formatarData(
                            projeto.data_inicio
                        )}

                    </p>


                    <p>

                        <strong>
                            Data de conclusão:
                        </strong>

                        ${formatarData(
                            projeto.data_conclusao
                        )}

                    </p>


                    <p>

                        <strong>
                            Status:
                        </strong>

                        <span class="status-projeto">

                            ${status}

                        </span>

                    </p>


                    <p>

                        <strong>
                            Valor investido:
                        </strong>

                        ${valorFormatado}

                    </p>


                    <p>

                        <strong>
                            Observação:
                        </strong>

                        ${projeto.observacao || "-"}

                    </p>


                    <div class="acoes-projeto">


                        <button

                            type="button"

                            class="botao-editar-projeto"

                            onclick="
                                editarProjeto(
                                    ${projeto.id}
                                )
                            "
                        >

                            ✏️ Editar

                        </button>


                        <button

                            type="button"

                            class="botao-excluir-projeto"

                            onclick="
                                excluirProjeto(
                                    ${projeto.id},
                                    '${String(
                                        projeto.nome || ""
                                    ).replace(
                                        /'/g,
                                        "\\'"
                                    )}'
                                )
                            "
                        >

                            🗑️ Excluir

                        </button>


                    </div>

                `;


                listaProjetos.appendChild(
                    card
                );

            }
        );


    }

    catch (erro) {

        console.error(
            "Erro ao carregar projetos:",
            erro
        );


        listaProjetos.innerHTML = `

            <p class="info">

                Não foi possível carregar
                os projetos.

            </p>

        `;

    }

}


// ========================================
// FORMATAR DATA
// ========================================

function formatarData(data) {

    if (!data) {

        return "Não informada";

    }


    const partes =
        String(data)
            .substring(0, 10)
            .split("-");


    if (
        partes.length !== 3
    ) {

        return data;

    }


    return `
        ${partes[2]}/${partes[1]}/${partes[0]}
    `;

}


// ========================================
// EDITAR PROJETO
// ========================================

async function editarProjeto(id) {

    try {

        const resposta =
            await fetch(
                `/api/projetos/${id}`
            );


        const dados =
            await resposta.json();


        if (
            !resposta.ok ||
            dados.sucesso === false
        ) {

            throw new Error(
                dados.mensagem ||
                "Erro ao buscar projeto."
            );

        }


        const projeto =
            dados.dados || dados;


        // ====================================
        // PREENCHER FORMULÁRIO
        // ====================================

        document.getElementById(
            "nome"
        ).value =
            projeto.nome || "";


        document.getElementById(
            "instituicao_id"
        ).value =
            projeto.instituicao_id || "";


        document.getElementById(
            "descricao"
        ).value =
            projeto.descricao || "";


        document.getElementById(
            "data_inicio"
        ).value =
            projeto.data_inicio
                ? String(
                    projeto.data_inicio
                ).substring(0, 10)
                : "";


        document.getElementById(
            "data_conclusao"
        ).value =
            projeto.data_conclusao
                ? String(
                    projeto.data_conclusao
                ).substring(0, 10)
                : "";


        document.getElementById(
            "status"
        ).value =
            projeto.status ||
            "Planejado";


        document.getElementById(
            "valor"
        ).value =
            projeto.valor || "";


        document.getElementById(
            "observacao"
        ).value =
            projeto.observacao || "";


        idProjetoEditando =
            id;


        // ====================================
        // ALTERAR FORMULÁRIO
        // ====================================

        atualizarFormularioProjeto();


        // ====================================
        // MENSAGEM
        // ====================================

        mostrarMensagemProjeto(

            "Modo de edição ativado. Altere os dados e salve as alterações.",

            "sucesso"

        );


        // ====================================
        // VOLTAR PARA O FORMULÁRIO
        // ====================================

        document
            .getElementById("nome")
            .scrollIntoView({
                behavior: "smooth",
                block: "center"
            });


        setTimeout(
            function () {

                document
                    .getElementById("nome")
                    .focus();

            },
            400
        );


    }

    catch (erro) {

        console.error(
            "Erro ao editar projeto:",
            erro
        );


        mostrarMensagemProjeto(

            erro.message ||
            "Erro ao carregar projeto.",

            "erro"

        );

    }

}


// ========================================
// ATUALIZAR FORMULÁRIO
// ========================================

function atualizarFormularioProjeto() {

    const botaoSalvar =
        document.querySelector(
            "#formProjeto button[type='submit']"
        );


    if (!botaoSalvar) {
        return;
    }


    if (
        idProjetoEditando !== null
    ) {

        botaoSalvar.textContent =
            "Salvar alterações";


        criarBotaoCancelarProjeto();

    }

    else {

        botaoSalvar.textContent =
            "Registrar projeto";


        const botaoCancelar =
            document.getElementById(
                "botaoCancelarProjeto"
            );


        if (botaoCancelar) {
            botaoCancelar.remove();
        }

    }

}


// ========================================
// CRIAR BOTÃO CANCELAR
// ========================================

function criarBotaoCancelarProjeto() {

    let botaoCancelar =
        document.getElementById(
            "botaoCancelarProjeto"
        );


    if (botaoCancelar) {
        return;
    }


    botaoCancelar =
        document.createElement(
            "button"
        );


    botaoCancelar.type =
        "button";


    botaoCancelar.id =
        "botaoCancelarProjeto";


    botaoCancelar.className =
        "botao-cancelar-projeto";


    botaoCancelar.textContent =
        "Cancelar edição";


    botaoCancelar.addEventListener(
        "click",
        cancelarEdicao
    );


    formProjeto.appendChild(
        botaoCancelar
    );

}


// ========================================
// CANCELAR EDIÇÃO
// ========================================

function cancelarEdicao() {

    formProjeto.reset();


    idProjetoEditando =
        null;


    atualizarFormularioProjeto();


    mostrarMensagemProjeto(
        "Edição cancelada.",
        "sucesso"
    );

}


// ========================================
// MODAL DE EXCLUSÃO
// ========================================

function abrirModalExclusaoProjeto(
    id,
    nome
) {

    const modalExistente =
        document.querySelector(
            ".modal-projeto-fundo"
        );


    if (modalExistente) {
        modalExistente.remove();
    }


    const fundo =
        document.createElement(
            "div"
        );


    fundo.className =
        "modal-projeto-fundo";


    fundo.innerHTML = `

        <div
            class="modal-projeto"
            role="dialog"
            aria-modal="true"
        >

            <div
                class="modal-projeto-icone"
            >

                🗑️

            </div>


            <h3>

                Excluir projeto?

            </h3>


            <p>

                Tem certeza que deseja excluir

                <strong>

                    ${nome || "este projeto"}

                </strong>?

                <br><br>

                Essa ação não poderá ser desfeita.

            </p>


            <div
                class="modal-projeto-acoes"
            >

                <button

                    type="button"

                    class="modal-projeto-cancelar"

                    id="modalProjetoCancelar"
                >

                    Cancelar

                </button>


                <button

                    type="button"

                    class="modal-projeto-confirmar"

                    id="modalProjetoConfirmar"
                >

                    Excluir projeto

                </button>

            </div>

        </div>

    `;


    document.body.appendChild(
        fundo
    );


    // ====================================
    // CANCELAR
    // ====================================

    document
        .getElementById(
            "modalProjetoCancelar"
        )
        .addEventListener(
            "click",
            function () {

                fundo.remove();

            }
        );


    // ====================================
    // CLICAR FORA
    // ====================================

    fundo.addEventListener(
        "click",
        function (evento) {

            if (
                evento.target === fundo
            ) {

                fundo.remove();

            }

        }
    );


    // ====================================
    // CONFIRMAR
    // ====================================

    document
        .getElementById(
            "modalProjetoConfirmar"
        )
        .addEventListener(
            "click",
            async function () {

                fundo.remove();

                await realizarExclusaoProjeto(
                    id
                );

            }
        );

}


// ========================================
// EXCLUIR PROJETO
// ========================================

function excluirProjeto(
    id,
    nome = ""
) {

    abrirModalExclusaoProjeto(
        id,
        nome
    );

}


// ========================================
// REALIZAR EXCLUSÃO
// ========================================

async function realizarExclusaoProjeto(
    id
) {

    try {

        const resposta =
            await fetch(
                `/api/projetos/${id}`,
                {
                    method: "DELETE"
                }
            );


        const dados =
            await resposta.json();


        if (
            !resposta.ok ||
            dados.sucesso === false
        ) {

            throw new Error(
                dados.mensagem ||
                "Erro ao excluir projeto."
            );

        }


        mostrarMensagemProjeto(
            "Projeto excluído com sucesso!",
            "sucesso"
        );


        // ====================================
        // SE ESTAVA EDITANDO
        // ====================================

        if (
            idProjetoEditando === id
        ) {

            formProjeto.reset();

            idProjetoEditando =
                null;

            atualizarFormularioProjeto();

        }


        carregarProjetos();


    }

    catch (erro) {

        console.error(
            "Erro ao excluir projeto:",
            erro
        );


        mostrarMensagemProjeto(

            erro.message ||
            "Erro ao excluir projeto.",

            "erro"

        );

    }

}


// ========================================
// INICIAR PÁGINA
// ========================================

async function iniciarPagina() {

    await carregarInstituicoes();

    await carregarProjetos();

}


iniciarPagina();