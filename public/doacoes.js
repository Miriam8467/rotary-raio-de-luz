// ========================================
// DOAÇÕES - ROTARY RAIO DE LUZ
// ========================================

console.log("DOACOES.JS FOI CARREGADO!");

const formulario =
    document.getElementById("formDoacao");

const listaDoacoes =
    document.getElementById("listaDoacoes");


// ========================================
// ESTILOS DA PÁGINA
// ========================================

const estiloDoacoes =
    document.createElement("style");

estiloDoacoes.textContent = `

    /* ========================================
       LISTA DE DOAÇÕES
    ======================================== */

    #listaDoacoes {

        display: grid;

        grid-template-columns:
            repeat(
                auto-fit,
                minmax(320px, 1fr)
            );

        gap: 20px;

        margin-top: 20px;

        width: 100%;
    }


    /* ========================================
       CARD DE DOAÇÃO
    ======================================== */

    .doacao-card {

        display: block;

        width: 100%;

        box-sizing: border-box;

        background: #ffffff;

        border: 1px solid #e1e6ed;

        border-radius: 14px;

        padding: 22px;

        margin: 0;

        box-shadow:
            0 4px 15px
            rgba(15, 35, 70, 0.07);

        transition:
            transform 0.2s ease,
            box-shadow 0.2s ease;
    }


    .doacao-card:hover {

        transform:
            translateY(-3px);

        box-shadow:
            0 8px 25px
            rgba(15, 35, 70, 0.12);
    }


    .doacao-card h3 {

        margin: 0 0 18px 0;

        padding-bottom: 12px;

        border-bottom:
            1px solid #e8ecf1;

        color: #17458f;

        font-size: 19px;

        font-weight: 700;
    }


    .doacao-card p {

        margin: 0 0 11px 0;

        color: #59636f;

        font-size: 14px;

        line-height: 1.55;
    }


    .doacao-card p:last-child {

        margin-bottom: 0;
    }


    .doacao-card p strong {

        color: #263238;

        font-weight: 700;
    }


    /* ========================================
       INSTITUIÇÃO
    ======================================== */

    .instituicao-doacao {

        display: inline-block;

        margin-top: 5px;

        padding: 6px 11px;

        border-radius: 20px;

        background: #eaf1fb;

        color: #17458f;

        font-size: 12px;

        font-weight: 700;
    }


    .instituicao-nao-definida {

        display: inline-block;

        margin-top: 5px;

        padding: 6px 11px;

        border-radius: 20px;

        background: #f1f3f5;

        color: #59636f;

        font-size: 12px;

        font-weight: 600;
    }


    /* ========================================
       VALOR
    ======================================== */

    .valor-doacao {

        color: #2e7d32;

        font-weight: 700;

        font-size: 15px;
    }


    /* ========================================
       MENSAGEM DE SUCESSO
       MESMO PADRÃO VISUAL DOS DOADORES
    ======================================== */

    #mensagemDoacao {

        position: fixed;

        top: 20px;

        right: 32px;

        z-index: 99999;

        width: 430px;

        min-height: 82px;

        box-sizing: border-box;

        padding:
            20px
            25px
            20px
            65px;

        background: #ffffff;

        border-radius: 12px;

        border-left:
            5px solid #2e7d32;

        box-shadow:
            0 8px 25px
            rgba(0, 0, 0, 0.10);

        color: #263238;

        font-size: 16px;

        font-weight: 600;

        line-height: 1.4;

        display: none;

        align-items: center;
    }


    #mensagemDoacao::before {

        content: "✓";

        position: absolute;

        left: 25px;

        top: 50%;

        transform:
            translateY(-50%);

        color: #263238;

        font-size: 27px;

        font-weight: 400;
    }


    #mensagemDoacao.erro {

        border-left-color: #c62828;
    }


    #mensagemDoacao.erro::before {

        content: "⚠";
    }


    /* ========================================
       CELULAR
    ======================================== */

    @media (max-width: 700px) {

        #listaDoacoes {

            grid-template-columns: 1fr;

        }


        #mensagemDoacao {

            top: 15px;

            left: 15px;

            right: 15px;

            width: auto;

        }


        .doacao-card {

            padding: 18px;

        }

    }

`;

document.head.appendChild(
    estiloDoacoes
);


// ========================================
// CRIAR MENSAGEM
// ========================================

const mensagemDoacao =
    document.createElement("div");

mensagemDoacao.id =
    "mensagemDoacao";

document.body.appendChild(
    mensagemDoacao
);


// ========================================
// MOSTRAR MENSAGEM
// ========================================

function mostrarMensagem(
    texto,
    tipo = "sucesso"
) {

    mensagemDoacao.textContent =
        texto;


    mensagemDoacao.classList.remove(
        "erro"
    );


    if (tipo === "erro") {

        mensagemDoacao.classList.add(
            "erro"
        );

    }


    mensagemDoacao.style.display =
        "flex";


    clearTimeout(
        mensagemDoacao.timer
    );


    mensagemDoacao.timer =
        setTimeout(
            function () {

                mensagemDoacao.style.display =
                    "none";

            },
            4000
        );

}


// ========================================
// CARREGAR INSTITUIÇÕES
// ========================================

async function carregarInstituicoes() {

    const select =
        document.getElementById(
            "instituicao_id"
        );


    try {

        const resposta =
            await fetch(
                "/api/instituicoes"
            );


        if (!resposta.ok) {

            throw new Error(
                "Erro ao carregar instituições."
            );

        }


        const resultado =
            await resposta.json();


        if (
            !resultado.sucesso ||
            !Array.isArray(
                resultado.dados
            )
        ) {

            throw new Error(
                "Formato inválido de instituições."
            );

        }


        select.innerHTML = `

            <option value="">

                Nenhuma instituição definida

            </option>

        `;


        resultado.dados.forEach(
            function (instituicao) {

                const option =
                    document.createElement(
                        "option"
                    );


                option.value =
                    instituicao.id;


                option.textContent =
                    instituicao.nome;


                select.appendChild(
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


        select.innerHTML = `

            <option value="">

                Nenhuma instituição definida

            </option>

        `;

    }

}


// ========================================
// CADASTRAR DOAÇÃO
// ========================================

formulario.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();


        const instituicaoSelecionada =
            document
                .getElementById(
                    "instituicao_id"
                )
                .value;


        const dados = {

            doador:
                document
                    .getElementById(
                        "doador"
                    )
                    .value
                    .trim(),


            data_doacao:
                document
                    .getElementById(
                        "data_doacao"
                    )
                    .value,


            tipo:
                document
                    .getElementById(
                        "tipo"
                    )
                    .value,


            descricao:
                document
                    .getElementById(
                        "descricao"
                    )
                    .value
                    .trim(),


            quantidade:
                document
                    .getElementById(
                        "quantidade"
                    )
                    .value,


            valor:
                document
                    .getElementById(
                        "valor"
                    )
                    .value,


            instituicao_id:
                instituicaoSelecionada ||
                null,


            observacao:
                document
                    .getElementById(
                        "observacao"
                    )
                    .value
                    .trim()

        };


        try {

            const resposta =
                await fetch(
                    "/api/doacoes",
                    {

                        method: "POST",

                        headers: {

                            "Content-Type":
                                "application/json"

                        },

                        body:
                            JSON.stringify(
                                dados
                            )

                    }
                );


            const resultado =
                await resposta.json();


            if (
                !resposta.ok ||
                !resultado.sucesso
            ) {

                throw new Error(

                    resultado.mensagem ||

                    "Não foi possível registrar a doação."

                );

            }


            // ====================================
            // MENSAGEM DE SUCESSO
            // ====================================

            mostrarMensagem(
                "Doação registrada com sucesso!",
                "sucesso"
            );


            // ====================================
            // LIMPAR FORMULÁRIO
            // ====================================

            formulario.reset();


            // ====================================
            // ATUALIZAR DADOS
            // ====================================

            await carregarInstituicoes();

            await carregarDoacoes();

        }

        catch (erro) {

            console.error(
                "Erro ao registrar doação:",
                erro
            );


            mostrarMensagem(

                erro.message ||

                "Erro ao registrar doação.",

                "erro"

            );

        }

    }
);


// ========================================
// CARREGAR DOAÇÕES
// ========================================

async function carregarDoacoes() {

    try {

        const resposta =
            await fetch(
                "/api/doacoes"
            );


        if (!resposta.ok) {

            throw new Error(
                "Erro ao carregar doações."
            );

        }


        const doacoes =
            await resposta.json();


        if (
            !Array.isArray(doacoes)
        ) {

            throw new Error(
                "Formato inválido de doações."
            );

        }


        // ====================================
        // NENHUMA DOAÇÃO
        // ====================================

        if (
            doacoes.length === 0
        ) {

            listaDoacoes.innerHTML = `

                <p class="info">

                    Nenhuma doação cadastrada.

                </p>

            `;

            return;

        }


        // ====================================
        // CRIAR CARDS
        // ====================================

        listaDoacoes.innerHTML = "";


        doacoes.forEach(
            function (doacao) {

                const card =
                    document.createElement(
                        "div"
                    );


                card.className =
                    "doacao-card";


                // ====================================
                // TÍTULO
                // ====================================

                const titulo =
                    document.createElement(
                        "h3"
                    );


                titulo.textContent =
                    doacao.tipo ||
                    "Doação";


                card.appendChild(
                    titulo
                );


                // ====================================
                // DOADOR
                // ====================================

                const paragrafoDoador =
                    document.createElement(
                        "p"
                    );


                paragrafoDoador.innerHTML = `
                    <strong>Doador:</strong>
                `;


                paragrafoDoador.appendChild(
                    document.createTextNode(
                        " " +
                        (
                            doacao.doador ||
                            "Não informado"
                        )
                    )
                );


                card.appendChild(
                    paragrafoDoador
                );


                // ====================================
                // DATA
                // ====================================

                const paragrafoData =
                    document.createElement(
                        "p"
                    );


                paragrafoData.innerHTML = `
                    <strong>Data:</strong>
                `;


                paragrafoData.appendChild(
                    document.createTextNode(
                        " " +
                        formatarData(
                            doacao.data_doacao
                        )
                    )
                );


                card.appendChild(
                    paragrafoData
                );


                // ====================================
                // INSTITUIÇÃO
                // ====================================

                const paragrafoInstituicao =
                    document.createElement(
                        "p"
                    );


                const textoInstituicao =
                    document.createElement(
                        "strong"
                    );


                textoInstituicao.textContent =
                    "Instituição beneficiada:";


                paragrafoInstituicao.appendChild(
                    textoInstituicao
                );


                paragrafoInstituicao.appendChild(
                    document.createElement(
                        "br"
                    )
                );


                const etiquetaInstituicao =
                    document.createElement(
                        "span"
                    );


                if (
                    doacao.instituicao
                ) {

                    etiquetaInstituicao.className =
                        "instituicao-doacao";


                    etiquetaInstituicao.textContent =
                        doacao.instituicao;

                }

                else {

                    etiquetaInstituicao.className =
                        "instituicao-nao-definida";


                    etiquetaInstituicao.textContent =
                        "Destinada ao Rotary Raio de Luz";

                }


                paragrafoInstituicao.appendChild(
                    etiquetaInstituicao
                );


                card.appendChild(
                    paragrafoInstituicao
                );


                // ====================================
                // DESCRIÇÃO
                // ====================================

                const paragrafoDescricao =
                    document.createElement(
                        "p"
                    );


                paragrafoDescricao.innerHTML = `
                    <strong>Descrição:</strong>
                `;


                paragrafoDescricao.appendChild(
                    document.createTextNode(
                        " " +
                        (
                            doacao.descricao ||
                            "-"
                        )
                    )
                );


                card.appendChild(
                    paragrafoDescricao
                );


                // ====================================
                // QUANTIDADE
                // ====================================

                const paragrafoQuantidade =
                    document.createElement(
                        "p"
                    );


                paragrafoQuantidade.innerHTML = `
                    <strong>Quantidade:</strong>
                `;


                paragrafoQuantidade.appendChild(
                    document.createTextNode(
                        " " +
                        (
                            doacao.quantidade !== null &&
                            doacao.quantidade !== undefined &&
                            doacao.quantidade !== ""
                                ? doacao.quantidade
                                : "Não informada"
                        )
                    )
                );


                card.appendChild(
                    paragrafoQuantidade
                );


                // ====================================
                // VALOR
                // ====================================

                if (
                    doacao.valor !== null &&
                    doacao.valor !== undefined &&
                    doacao.valor !== ""
                ) {

                    const paragrafoValor =
                        document.createElement(
                            "p"
                        );


                    paragrafoValor.innerHTML = `
                        <strong>Valor:</strong>
                    `;


                    const valor =
                        document.createElement(
                            "span"
                        );


                    valor.className =
                        "valor-doacao";


                    valor.textContent =
                        Number(
                            doacao.valor
                        ).toLocaleString(
                            "pt-BR",
                            {
                                style:
                                    "currency",

                                currency:
                                    "BRL"
                            }
                        );


                    paragrafoValor.appendChild(
                        document.createTextNode(
                            " "
                        )
                    );


                    paragrafoValor.appendChild(
                        valor
                    );


                    card.appendChild(
                        paragrafoValor
                    );

                }


                // ====================================
                // OBSERVAÇÃO
                // ====================================

                if (
                    doacao.observacao
                ) {

                    const paragrafoObservacao =
                        document.createElement(
                            "p"
                        );


                    paragrafoObservacao.innerHTML = `
                        <strong>Observação:</strong>
                    `;


                    paragrafoObservacao.appendChild(
                        document.createTextNode(
                            " " +
                            doacao.observacao
                        )
                    );


                    card.appendChild(
                        paragrafoObservacao
                    );

                }


                // ====================================
                // ADICIONAR CARD À LISTA
                // ====================================

                listaDoacoes.appendChild(
                    card
                );

            }
        );

    }

    catch (erro) {

        console.error(
            "Erro ao carregar doações:",
            erro
        );


        listaDoacoes.innerHTML = `

            <p class="info">

                Não foi possível carregar
                as doações.

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


    const texto =
        String(data);


    const dataParte =
        texto.substring(
            0,
            10
        );


    const partes =
        dataParte.split("-");


    if (
        partes.length !== 3
    ) {

        return texto;

    }


    return `${partes[2]}/${partes[1]}/${partes[0]}`;

}


// ========================================
// INICIALIZAÇÃO
// ========================================

async function iniciarPagina() {

    await carregarInstituicoes();

    await carregarDoacoes();

}


iniciarPagina();