// ========================================
// DASHBOARD - ROTARY RAIO DE LUZ
// ========================================

console.log("DASHBOARD.JS FOI CARREGADO!");


// ========================================
// ELEMENTOS DO DASHBOARD
// ========================================

const totalDoacoes =
    document.getElementById("totalDoacoes");

const totalInstituicoes =
    document.getElementById("totalInstituicoes");

const totalItens =
    document.getElementById("totalItens");

const valorDoacoes =
    document.getElementById("valorDoacoes");

const totalProjetos =
    document.getElementById("totalProjetos");

const resumoTipos =
    document.getElementById("resumoTipos");

const statusDashboard =
    document.getElementById("statusDashboard");

const mensagemBoasVindas =
    document.getElementById("mensagemBoasVindas");


// ========================================
// FORMATAR MOEDA
// ========================================

function formatarMoeda(valor) {

    return Number(valor || 0).toLocaleString(
        "pt-BR",
        {
            style: "currency",
            currency: "BRL"
        }
    );

}


// ========================================
// CARREGAR USUÁRIO LOGADO
// ========================================

async function carregarUsuario() {

    try {

        console.log(
            "Consultando /api/me..."
        );


        const resposta =
            await fetch(
                "/api/me"
            );


        if (!resposta.ok) {

            throw new Error(
                "Não foi possível identificar o usuário."
            );

        }


        const dados =
            await resposta.json();


        console.log(
            "Usuário da sessão:",
            dados
        );


        if (
            dados.sucesso &&
            dados.usuario
        ) {

            const nomeCompleto =
                dados.usuario.nome ||
                "Usuário";


            // Pegar somente o primeiro nome

            const primeiroNome =
                nomeCompleto
                    .trim()
                    .split(" ")[0];


            if (mensagemBoasVindas) {

                mensagemBoasVindas.innerHTML = `

                    <strong>
                        Olá, ${primeiroNome}! 👋
                    </strong>

                    <br>

                    Seja bem-vinda ao sistema
                    <strong>
                        Rotary Raio de Luz
                    </strong>.

                `;

            }

        }

    }

    catch (erro) {

        console.error(
            "Erro ao carregar usuário:",
            erro
        );


        if (mensagemBoasVindas) {

            mensagemBoasVindas.innerHTML = `

                Visão geral do sistema do
                Rotary Club de Campo Mourão -
                Raio de Luz.

            `;

        }

    }

}


// ========================================
// CARREGAR DASHBOARD
// ========================================

async function carregarDashboard() {

    try {

        console.log(
            "Consultando /api/dashboard..."
        );


        const resposta =
            await fetch(
                "/api/dashboard"
            );


        // ====================================
        // VERIFICAR RESPOSTA HTTP
        // ====================================

        if (!resposta.ok) {

            throw new Error(
                "Erro ao consultar o dashboard."
            );

        }


        // ====================================
        // CONVERTER JSON
        // ====================================

        const dados =
            await resposta.json();


        console.log(
            "Dados recebidos do dashboard:",
            dados
        );


        // ====================================
        // VERIFICAR ERRO DA API
        // ====================================

        if (
            dados.sucesso === false
        ) {

            throw new Error(
                dados.mensagem ||
                "Erro ao carregar dados do dashboard."
            );

        }


        // ====================================
        // TOTAL DE DOAÇÕES
        // ====================================

        if (totalDoacoes) {

            totalDoacoes.textContent =
                Number(
                    dados.doacoes || 0
                );

        }


        // ====================================
        // TOTAL DE INSTITUIÇÕES
        // ====================================

        if (totalInstituicoes) {

            totalInstituicoes.textContent =
                Number(
                    dados.instituicoes || 0
                );

        }


        // ====================================
        // TOTAL DE ITENS
        // ====================================

        if (totalItens) {

            totalItens.textContent =
                Number(
                    dados.itens || 0
                );

        }


        // ====================================
        // VALOR DAS DOAÇÕES
        // ====================================

        if (valorDoacoes) {

            valorDoacoes.textContent =
                formatarMoeda(
                    dados.valor || 0
                );

        }


        // ====================================
        // TOTAL DE PROJETOS
        // ====================================

        if (totalProjetos) {

            totalProjetos.textContent =
                Number(
                    dados.projetos || 0
                );

        }


        // ====================================
        // RESUMO POR TIPO
        // ====================================

        carregarResumoTipos(
            dados.tipos || []
        );


        // ====================================
        // STATUS
        // ====================================

        if (statusDashboard) {

            statusDashboard.innerHTML = `

                <div class="status-item">

                    <strong>
                        Sistema funcionando
                    </strong>

                    <span>
                        Os dados do Dashboard foram
                        carregados com sucesso.
                    </span>

                </div>

            `;

        }


        console.log(
            "Dashboard carregado com sucesso!"
        );

    }

    catch (erro) {

        console.error(
            "Erro ao carregar dashboard:",
            erro
        );


        // ====================================
        // ZERAR CARDS
        // ====================================

        if (totalDoacoes) {

            totalDoacoes.textContent =
                "0";

        }


        if (totalInstituicoes) {

            totalInstituicoes.textContent =
                "0";

        }


        if (totalItens) {

            totalItens.textContent =
                "0";

        }


        if (valorDoacoes) {

            valorDoacoes.textContent =
                "R$ 0,00";

        }


        if (totalProjetos) {

            totalProjetos.textContent =
                "0";

        }


        // ====================================
        // MOSTRAR ERRO
        // ====================================

        if (resumoTipos) {

            resumoTipos.innerHTML = `

                <p class="info">

                    Não foi possível carregar
                    o resumo das doações.

                </p>

            `;

        }


        if (statusDashboard) {

            statusDashboard.innerHTML = `

                <p class="info">

                    Não foi possível carregar
                    os dados do sistema.

                </p>

            `;

        }

    }

}


// ========================================
// RESUMO POR TIPO DE DOAÇÃO
// ========================================

function carregarResumoTipos(tipos) {

    if (!resumoTipos) {

        return;

    }


    // ====================================
    // NENHUM TIPO
    // ====================================

    if (
        !Array.isArray(tipos) ||
        tipos.length === 0
    ) {

        resumoTipos.innerHTML = `

            <p class="info">

                Nenhuma doação cadastrada.

            </p>

        `;

        return;

    }


    // ====================================
    // LIMPAR
    // ====================================

    resumoTipos.innerHTML = "";


    // ====================================
    // CRIAR CARDS
    // ====================================

    tipos.forEach(
        function (item) {

            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "tipo-doacao-card";


            const tipo =
                item.tipo ||
                "Não informado";


            const quantidade =
                Number(
                    item.quantidade || 0
                );


            const totalItens =
                Number(
                    item.total_itens || 0
                );


            card.innerHTML = `

                <div class="tipo-doacao-nome">

                    ${tipo}

                </div>


                <div class="tipo-doacao-quantidade">

                    ${quantidade}

                </div>


                <div class="tipo-doacao-label">

                    doação(ões)

                </div>


                <div class="tipo-doacao-itens">

                    ${totalItens}
                    item(ns)

                </div>

            `;


            resumoTipos.appendChild(
                card
            );

        }
    );

}


// ========================================
// INICIALIZAÇÃO
// ========================================

carregarUsuario();

carregarDashboard();