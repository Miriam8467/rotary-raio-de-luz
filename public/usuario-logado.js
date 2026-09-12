// ========================================
// USUÁRIO LOGADO
// ROTARY RAIO DE LUZ
// ========================================

console.log("USUARIO-LOGADO.JS FOI CARREGADO!");


// ========================================
// CARREGAR USUÁRIO DA SESSÃO
// ========================================

async function carregarUsuarioLogado() {

    try {

        const resposta = await fetch("/api/me");


        // ====================================
        // VERIFICAR SESSÃO
        // ====================================

        if (!resposta.ok) {

            if (resposta.status === 401) {

                window.location.href = "/login.html";

                return;

            }

            throw new Error(
                "Não foi possível identificar o usuário."
            );

        }


        // ====================================
        // CONVERTER RESPOSTA
        // ====================================

        const dados = await resposta.json();


        console.log(
            "Usuário logado:",
            dados
        );


        // ====================================
        // VERIFICAR USUÁRIO
        // ====================================

        if (
            !dados.sucesso ||
            !dados.usuario
        ) {

            return;

        }


        const nomeCompleto =
            dados.usuario.nome ||
            "Usuário";


        // ====================================
        // PEGAR PRIMEIRO NOME
        // ====================================

        const primeiroNome =
            nomeCompleto
                .trim()
                .split(" ")[0];


        // ====================================
        // LOCALIZAR CABEÇALHO
        // ====================================

        const header =
            document.querySelector(".header");


        if (!header) {

            return;

        }


        // ====================================
        // NÃO DUPLICAR SAUDAÇÃO
        // ====================================

        if (
            document.getElementById(
                "saudacaoUsuario"
            )
        ) {

            return;

        }


        // ====================================
        // CRIAR SAUDAÇÃO
        // ====================================

        const saudacao =
            document.createElement("p");


        saudacao.id =
            "saudacaoUsuario";


        saudacao.innerHTML = `

            <strong>
                Olá, ${escaparHTMLUsuario(primeiroNome)}! 👋
            </strong>

            <br>

            Seja bem-vindo(a) ao sistema
            <strong>
                Rotary Raio de Luz
            </strong>.

        `;


        // ====================================
        // INSERIR NO CABEÇALHO
        // ====================================

        header.appendChild(
            saudacao
        );


        // ====================================
        // ESTILO DA SAUDAÇÃO
        // ====================================

        saudacao.style.marginTop =
            "8px";

        saudacao.style.color =
            "#53657a";

        saudacao.style.lineHeight =
            "1.6";


        console.log(
            "Saudação do usuário adicionada com sucesso."
        );

    }

    catch (erro) {

        console.error(
            "Erro ao carregar usuário logado:",
            erro
        );

    }

}


// ========================================
// PROTEGER TEXTO
// ========================================

function escaparHTMLUsuario(valor) {

    if (
        valor === null ||
        valor === undefined
    ) {

        return "";

    }


    return String(valor)

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );

}


// ========================================
// INICIALIZAÇÃO
// ========================================

carregarUsuarioLogado();