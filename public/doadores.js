// ========================================
// DOADORES - ROTARY RAIO DE LUZ
// ========================================


// ========================================
// ELEMENTOS DA PÁGINA
// ========================================

const formDoador =
    document.getElementById("formDoador");

const mensagem =
    document.getElementById("mensagem");

const listaDoadores =
    document.getElementById("listaDoadores");

const totalDoadores =
    document.getElementById("totalDoadores");

const tipo =
    document.getElementById("tipo");

const documento =
    document.getElementById("documento");


// ========================================
// ID DO DOADOR SENDO EDITADO
// ========================================

let doadorEditando = null;


// ========================================
// ESTILOS DA PÁGINA
// ========================================

const estiloDoadores =
    document.createElement("style");

estiloDoadores.textContent = `

    /* ========================================
       MENSAGEM
    ======================================== */

    .mensagem-doador {
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

        animation: aparecerMensagemDoador 0.25s ease;
    }


    .mensagem-doador.sucesso {
        border-left-color: #2e7d32;
    }


    .mensagem-doador.erro {
        border-left-color: #c62828;
    }


    .mensagem-doador .icone {
        font-size: 21px;
        min-width: 24px;
    }


    .mensagem-doador .texto {
        flex: 1;
    }


    @keyframes aparecerMensagemDoador {

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
       MENSAGEM ORIGINAL DO HTML
    ======================================== */

    #mensagem {
        margin-top: 15px;

        padding: 0;

        font-weight: 600;

        min-height: 20px;
    }


    /* ========================================
       BOTÕES DA TABELA
    ======================================== */

    .acoes-doador {
        display: flex;

        gap: 8px;

        align-items: center;

        white-space: nowrap;
    }


    .botao-editar-doador,
    .botao-excluir-doador {
        border: none;

        border-radius: 8px;

        padding: 9px 13px;

        cursor: pointer;

        font-family: Arial, Helvetica, sans-serif;

        font-size: 13px;

        font-weight: 600;

        transition:
            transform 0.2s ease,
            background-color 0.2s ease,
            box-shadow 0.2s ease;
    }


    .botao-editar-doador {
        background: #eaf1fb;

        color: #17458f;
    }


    .botao-editar-doador:hover {
        background: #dce8f8;

        transform: translateY(-1px);

        box-shadow:
            0 3px 8px rgba(23, 69, 143, 0.12);
    }


    .botao-excluir-doador {
        background: #fdecec;

        color: #c62828;
    }


    .botao-excluir-doador:hover {
        background: #f9dada;

        transform: translateY(-1px);

        box-shadow:
            0 3px 8px rgba(198, 40, 40, 0.12);
    }


    /* ========================================
       BOTÃO CANCELAR
    ======================================== */

    .botao-cancelar-doador {
        background: #f1f3f5 !important;

        color: #59636f !important;

        border: 1px solid #dfe3e8 !important;

        margin-top: 8px !important;
    }


    .botao-cancelar-doador:hover {
        background: #e5e8eb !important;
    }


    /* ========================================
       MODAL DE EXCLUSÃO
    ======================================== */

    .modal-doador-fundo {
        position: fixed;

        inset: 0;

        z-index: 10000;

        display: flex;

        align-items: center;
        justify-content: center;

        padding: 20px;

        background: rgba(15, 35, 70, 0.45);

        animation: aparecerFundoDoador 0.2s ease;
    }


    .modal-doador {
        width: 100%;

        max-width: 450px;

        background: #ffffff;

        border-radius: 16px;

        padding: 28px;

        box-shadow:
            0 20px 50px rgba(15, 35, 70, 0.20);

        animation: aparecerModalDoador 0.2s ease;
    }


    .modal-doador-icone {
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


    .modal-doador h3 {
        color: #263238;

        font-size: 21px;

        margin-bottom: 10px;
    }


    .modal-doador p {
        color: #6b7280;

        font-size: 14px;

        line-height: 1.6;

        margin-bottom: 22px;
    }


    .modal-doador-acoes {
        display: flex;

        justify-content: flex-end;

        gap: 10px;
    }


    .modal-doador-acoes button {
        border: none;

        border-radius: 8px;

        padding: 11px 18px;

        cursor: pointer;

        font-family: Arial, Helvetica, sans-serif;

        font-size: 14px;

        font-weight: 600;
    }


    .modal-doador-cancelar {
        background: #f1f3f5;

        color: #4b5563;
    }


    .modal-doador-cancelar:hover {
        background: #e5e8eb;
    }


    .modal-doador-confirmar {
        background: #c62828;

        color: #ffffff;
    }


    .modal-doador-confirmar:hover {
        background: #a91f1f;
    }


    @keyframes aparecerFundoDoador {

        from {
            opacity: 0;
        }

        to {
            opacity: 1;
        }

    }


    @keyframes aparecerModalDoador {

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

    @media (max-width: 700px) {

        .mensagem-doador {
            top: 15px;

            left: 15px;
            right: 15px;

            min-width: auto;

            max-width: none;
        }


        .acoes-doador {
            flex-direction: column;

            align-items: stretch;
        }


        .botao-editar-doador,
        .botao-excluir-doador {
            width: 100%;
        }


        .modal-doador {
            padding: 22px;
        }


        .modal-doador-acoes {
            flex-direction: column-reverse;
        }


        .modal-doador-acoes button {
            width: 100%;
        }

    }

`;

document.head.appendChild(
    estiloDoadores
);


// ========================================
// ALTERAR TEXTO CPF / CNPJ
// ========================================

tipo.addEventListener(
    "change",
    function () {

        if (tipo.value === "Pessoa Física") {

            documento.placeholder =
                "Digite o CPF";

        }

        else if (
            tipo.value === "Pessoa Jurídica"
        ) {

            documento.placeholder =
                "Digite o CNPJ";

        }

        else {

            documento.placeholder =
                "Digite o CPF ou CNPJ";

        }

    }
);


// ========================================
// FORMATAR CPF / CNPJ ENQUANTO DIGITA
// ========================================

documento.addEventListener(
    "input",
    function () {

        let valor =
            documento.value.replace(
                /\D/g,
                ""
            );


        // ====================================
        // CPF
        // ====================================

        if (
            tipo.value === "Pessoa Física"
        ) {

            valor =
                valor.substring(0, 11);


            if (valor.length > 9) {

                valor =
                    valor.replace(
                        /^(\d{3})(\d{3})(\d{3})(\d{0,2}).*/,
                        "$1.$2.$3-$4"
                    );

            }

            else if (valor.length > 6) {

                valor =
                    valor.replace(
                        /^(\d{3})(\d{3})(\d{0,3}).*/,
                        "$1.$2.$3"
                    );

            }

            else if (valor.length > 3) {

                valor =
                    valor.replace(
                        /^(\d{3})(\d{0,3}).*/,
                        "$1.$2"
                    );

            }

        }


        // ====================================
        // CNPJ
        // ====================================

        if (
            tipo.value === "Pessoa Jurídica"
        ) {

            valor =
                valor.substring(0, 14);


            if (valor.length > 12) {

                valor =
                    valor.replace(
                        /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{0,2}).*/,
                        "$1.$2.$3/$4-$5"
                    );

            }

            else if (valor.length > 8) {

                valor =
                    valor.replace(
                        /^(\d{2})(\d{3})(\d{3})(\d{0,4}).*/,
                        "$1.$2.$3/$4"
                    );

            }

            else if (valor.length > 5) {

                valor =
                    valor.replace(
                        /^(\d{2})(\d{3})(\d{0,3}).*/,
                        "$1.$2.$3"
                    );

            }

            else if (valor.length > 2) {

                valor =
                    valor.replace(
                        /^(\d{2})(\d{0,3}).*/,
                        "$1.$2"
                    );

            }

        }


        documento.value =
            valor;

    }
);


// ========================================
// MOSTRAR MENSAGEM PROFISSIONAL
// ========================================

function mostrarMensagemDoador(
    texto,
    tipoMensagem = "sucesso"
) {

    const antiga =
        document.querySelector(
            ".mensagem-doador"
        );


    if (antiga) {
        antiga.remove();
    }


    const elemento =
        document.createElement("div");


    elemento.className =
        `mensagem-doador ${tipoMensagem}`;


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
// CADASTRAR OU EDITAR DOADOR
// ========================================

formDoador.addEventListener(
    "submit",
    async function (evento) {

        evento.preventDefault();


        const nome =
            document
                .getElementById("nome")
                .value
                .trim();


        const tipoSelecionado =
            document
                .getElementById("tipo")
                .value;


        const documentoValor =
            document
                .getElementById("documento")
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


        try {

            mensagem.textContent =
                doadorEditando
                    ? "Atualizando doador..."
                    : "Cadastrando doador...";


            let resposta;


            // ====================================
            // EDITAR
            // ====================================

            if (doadorEditando) {

                resposta =
                    await fetch(
                        `/api/doadores/${doadorEditando}`,
                        {

                            method: "PUT",

                            headers: {

                                "Content-Type":
                                    "application/json"

                            },

                            body: JSON.stringify({

                                nome:
                                    nome,

                                tipo:
                                    tipoSelecionado,

                                documento:
                                    documentoValor,

                                telefone:
                                    telefone,

                                email:
                                    email

                            })

                        }
                    );

            }


            // ====================================
            // CADASTRAR
            // ====================================

            else {

                resposta =
                    await fetch(
                        "/api/doadores",
                        {

                            method: "POST",

                            headers: {

                                "Content-Type":
                                    "application/json"

                            },

                            body: JSON.stringify({

                                nome:
                                    nome,

                                tipo:
                                    tipoSelecionado,

                                documento:
                                    documentoValor,

                                telefone:
                                    telefone,

                                email:
                                    email

                            })

                        }
                    );

            }


            const dados =
                await resposta.json();


            if (
                !resposta.ok ||
                !dados.sucesso
            ) {

                throw new Error(
                    dados.mensagem ||
                    "Erro ao salvar doador."
                );

            }


            // ====================================
            // MENSAGEM DE SUCESSO
            // ====================================

            mostrarMensagemDoador(

                doadorEditando
                    ? "Doador atualizado com sucesso!"
                    : "Doador cadastrado com sucesso!",

                "sucesso"

            );


            mensagem.textContent = "";


            // ====================================
            // LIMPAR FORMULÁRIO
            // ====================================

            formDoador.reset();


            doadorEditando =
                null;


            atualizarBotaoFormulario();


            documento.placeholder =
                "Digite o CPF ou CNPJ";


            carregarDoadores();


        }

        catch (erro) {

            console.error(
                "Erro ao salvar doador:",
                erro
            );


            mensagem.textContent = "";


            mostrarMensagemDoador(
                erro.message ||
                "Erro ao salvar doador.",
                "erro"
            );

        }

    }
);


// ========================================
// CARREGAR DOADORES
// ========================================

async function carregarDoadores() {

    try {

        const resposta =
            await fetch(
                "/api/doadores"
            );


        const dados =
            await resposta.json();


        if (
            !resposta.ok ||
            !dados.sucesso
        ) {

            throw new Error(
                dados.mensagem ||
                "Erro ao carregar doadores."
            );

        }


        totalDoadores.textContent =
            `${dados.total} doador(es)`;


        // ====================================
        // SEM DOADORES
        // ====================================

        if (dados.total === 0) {

            listaDoadores.innerHTML = `

                <p class="info">

                    Nenhum doador cadastrado.

                </p>

            `;

            return;

        }


        // ====================================
        // CRIAR TABELA
        // ====================================

        let tabela = `

            <table>

                <thead>

                    <tr>

                        <th>ID</th>

                        <th>
                            Nome / Razão Social
                        </th>

                        <th>
                            Tipo
                        </th>

                        <th>
                            CPF / CNPJ
                        </th>

                        <th>
                            Telefone
                        </th>

                        <th>
                            E-mail
                        </th>

                        <th>
                            Ações
                        </th>

                    </tr>

                </thead>

                <tbody>

        `;


        dados.dados.forEach(
            function (doador) {

                tabela += `

                    <tr>

                        <td>
                            ${doador.id}
                        </td>


                        <td>
                            ${doador.nome || "-"}
                        </td>


                        <td>
                            ${doador.tipo || "-"}
                        </td>


                        <td>

                            ${
                                formatarDocumento(
                                    doador.documento
                                )
                            }

                        </td>


                        <td>
                            ${doador.telefone || "-"}
                        </td>


                        <td>
                            ${doador.email || "-"}
                        </td>


                        <td>

                            <div
                                class="acoes-doador"
                            >

                                <button
                                    type="button"
                                    class="botao-editar-doador"
                                    onclick="editarDoador(${doador.id})"
                                >

                                    ✏️ Editar

                                </button>


                                <button
                                    type="button"
                                    class="botao-excluir-doador"
                                    onclick="excluirDoador(${doador.id}, '${String(doador.nome || "").replace(/'/g, "\\'")}')"
                                >

                                    🗑️ Excluir

                                </button>

                            </div>

                        </td>

                    </tr>

                `;

            }
        );


        tabela += `

                </tbody>

            </table>

        `;


        listaDoadores.innerHTML =
            tabela;


    }

    catch (erro) {

        console.error(
            "Erro ao carregar doadores:",
            erro
        );


        listaDoadores.innerHTML = `

            <p class="info">

                Não foi possível carregar
                os doadores.

            </p>

        `;

    }

}


// ========================================
// EDITAR DOADOR
// ========================================

async function editarDoador(id) {

    try {

        const resposta =
            await fetch(
                `/api/doadores/${id}`
            );


        const dados =
            await resposta.json();


        if (
            !resposta.ok ||
            !dados.sucesso
        ) {

            throw new Error(
                dados.mensagem ||
                "Não foi possível carregar o doador."
            );

        }


        const doador =
            dados.dados;


        // ====================================
        // PREENCHER FORMULÁRIO
        // ====================================

        document.getElementById("nome").value =
            doador.nome || "";


        document.getElementById("tipo").value =
            doador.tipo || "";


        document.getElementById("documento").value =
            formatarDocumento(
                doador.documento
            );


        document.getElementById("telefone").value =
            doador.telefone || "";


        document.getElementById("email").value =
            doador.email || "";


        // ====================================
        // MODO EDIÇÃO
        // ====================================

        doadorEditando =
            id;


        atualizarBotaoFormulario();


        // ====================================
        // BOTÃO CANCELAR
        // ====================================

        criarBotaoCancelar();


        // ====================================
        // MENSAGEM
        // ====================================

        mostrarMensagemDoador(
            "Modo de edição ativado. Altere os dados e salve as alterações.",
            "sucesso"
        );


        // ====================================
        // VOLTAR AO FORMULÁRIO
        // ====================================

        window.scrollTo({

            top: 0,

            behavior: "smooth"

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
            "Erro ao editar doador:",
            erro
        );


        mostrarMensagemDoador(
            erro.message ||
            "Erro ao carregar doador.",
            "erro"
        );

    }

}


// ========================================
// CRIAR BOTÃO CANCELAR
// ========================================

function criarBotaoCancelar() {

    let botaoCancelar =
        document.getElementById(
            "botaoCancelarDoador"
        );


    if (botaoCancelar) {
        return;
    }


    botaoCancelar =
        document.createElement("button");


    botaoCancelar.type =
        "button";


    botaoCancelar.id =
        "botaoCancelarDoador";


    botaoCancelar.className =
        "botao-cancelar-doador";


    botaoCancelar.textContent =
        "Cancelar edição";


    botaoCancelar.addEventListener(
        "click",
        cancelarEdicaoDoador
    );


    formDoador.appendChild(
        botaoCancelar
    );

}


// ========================================
// CANCELAR EDIÇÃO
// ========================================

function cancelarEdicaoDoador() {

    formDoador.reset();


    doadorEditando =
        null;


    atualizarBotaoFormulario();


    documento.placeholder =
        "Digite o CPF ou CNPJ";


    const botaoCancelar =
        document.getElementById(
            "botaoCancelarDoador"
        );


    if (botaoCancelar) {
        botaoCancelar.remove();
    }


    mensagem.textContent = "";


    mostrarMensagemDoador(
        "Edição cancelada.",
        "sucesso"
    );

}


// ========================================
// ABRIR MODAL DE EXCLUSÃO
// ========================================

function abrirModalExclusaoDoador(
    id,
    nome
) {

    const modalExistente =
        document.querySelector(
            ".modal-doador-fundo"
        );


    if (modalExistente) {
        modalExistente.remove();
    }


    const fundo =
        document.createElement("div");


    fundo.className =
        "modal-doador-fundo";


    fundo.innerHTML = `

        <div
            class="modal-doador"
            role="dialog"
            aria-modal="true"
        >

            <div class="modal-doador-icone">
                🗑️
            </div>


            <h3>
                Excluir doador?
            </h3>


            <p>

                Tem certeza que deseja excluir
                <strong>
                    ${nome || "este doador"}
                </strong>?

                <br><br>

                Essa ação não poderá ser desfeita.

            </p>


            <div class="modal-doador-acoes">

                <button
                    type="button"
                    class="modal-doador-cancelar"
                    id="modalDoadorCancelar"
                >
                    Cancelar
                </button>


                <button
                    type="button"
                    class="modal-doador-confirmar"
                    id="modalDoadorConfirmar"
                >
                    Excluir doador
                </button>

            </div>

        </div>

    `;


    document.body.appendChild(
        fundo
    );


    // ========================================
    // CANCELAR
    // ========================================

    document
        .getElementById(
            "modalDoadorCancelar"
        )
        .addEventListener(
            "click",
            function () {

                fundo.remove();

            }
        );


    // ========================================
    // CLICAR FORA
    // ========================================

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


    // ========================================
    // CONFIRMAR
    // ========================================

    document
        .getElementById(
            "modalDoadorConfirmar"
        )
        .addEventListener(
            "click",
            async function () {

                fundo.remove();

                await realizarExclusaoDoador(
                    id
                );

            }
        );

}


// ========================================
// EXCLUIR DOADOR
// ========================================

function excluirDoador(
    id,
    nome = ""
) {

    abrirModalExclusaoDoador(
        id,
        nome
    );

}


// ========================================
// REALIZAR EXCLUSÃO
// ========================================

async function realizarExclusaoDoador(
    id
) {

    try {

        const resposta =
            await fetch(
                `/api/doadores/${id}`,
                {

                    method: "DELETE"

                }
            );


        const dados =
            await resposta.json();


        if (
            !resposta.ok ||
            !dados.sucesso
        ) {

            throw new Error(
                dados.mensagem ||
                "Erro ao excluir doador."
            );

        }


        // ====================================
        // SUCESSO
        // ====================================

        mostrarMensagemDoador(
            "Doador excluído com sucesso!",
            "sucesso"
        );


        // ====================================
        // CASO ESTEJA EDITANDO
        // ====================================

        if (
            doadorEditando === id
        ) {

            formDoador.reset();


            doadorEditando =
                null;


            atualizarBotaoFormulario();


            const botaoCancelar =
                document.getElementById(
                    "botaoCancelarDoador"
                );


            if (botaoCancelar) {
                botaoCancelar.remove();
            }

        }


        carregarDoadores();


    }

    catch (erro) {

        console.error(
            "Erro ao excluir doador:",
            erro
        );


        mostrarMensagemDoador(
            erro.message ||
            "Erro ao excluir doador.",
            "erro"
        );

    }

}


// ========================================
// ATUALIZAR BOTÃO DO FORMULÁRIO
// ========================================

function atualizarBotaoFormulario() {

    const botao =
        formDoador.querySelector(
            'button[type="submit"]'
        );


    if (!botao) {
        return;
    }


    if (doadorEditando) {

        botao.textContent =
            "Salvar alterações";

    }

    else {

        botao.textContent =
            "Cadastrar doador";

    }

}


// ========================================
// FORMATAR DOCUMENTO
// ========================================

function formatarDocumento(
    documento
) {

    if (!documento) {

        return "-";

    }


    const numero =
        String(documento)
            .replace(/\D/g, "");


    // ====================================
    // CPF
    // ====================================

    if (numero.length === 11) {

        return numero.replace(

            /^(\d{3})(\d{3})(\d{3})(\d{2})$/,

            "$1.$2.$3-$4"

        );

    }


    // ====================================
    // CNPJ
    // ====================================

    if (numero.length === 14) {

        return numero.replace(

            /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,

            "$1.$2.$3/$4-$5"

        );

    }


    return documento;

}


// ========================================
// CARREGAR AO ABRIR
// ========================================

carregarDoadores();