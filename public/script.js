const formulario = document.getElementById("formInstituicao");


// ========================================
// CADASTRAR INSTITUIÇÃO
// ========================================

formulario.addEventListener("submit", async (event) => {

    event.preventDefault();

    const dados = {

        nome: document.getElementById("nome").value,

        tipo: document.getElementById("tipo").value,

        contato: document.getElementById("contato").value,

        telefone: document.getElementById("telefone").value,

        email: document.getElementById("email").value,

        descricao: document.getElementById("descricao").value

    };


    try {

        const resposta = await fetch("/api/instituicoes", {

            method: "POST",

            headers: {

                "Content-Type": "application/json"

            },

            body: JSON.stringify(dados)

        });


        const resultado = await resposta.json();


        if (resultado.sucesso) {

            alert("Instituição cadastrada com sucesso!");

            formulario.reset();

            carregarInstituicoes();

        } else {

            alert(
                resultado.mensagem ||
                "Não foi possível cadastrar a instituição."
            );

        }

    } catch (erro) {

        console.error(erro);

        alert("Erro ao conectar com o servidor.");

    }

});


// ========================================
// LISTAR INSTITUIÇÕES
// ========================================

async function carregarInstituicoes() {

    const lista = document.getElementById("listaInstituicoes");


    try {

        const resposta = await fetch("/api/instituicoes");

        const instituicoes = await resposta.json();


        if (instituicoes.length === 0) {

            lista.innerHTML = `
                <p class="info">
                    Nenhuma instituição cadastrada.
                </p>
            `;

            return;

        }


        lista.innerHTML = instituicoes.map(instituicao => `

            <div class="instituicao-item">

                <h3>
                    ${instituicao.nome}
                </h3>

                <p>
                    <strong>Tipo:</strong>
                    ${instituicao.tipo || "Não informado"}
                </p>

                <p>
                    <strong>Contato:</strong>
                    ${instituicao.contato || "Não informado"}
                </p>

                <p>
                    <strong>Telefone:</strong>
                    ${instituicao.telefone || "Não informado"}
                </p>

                <p>
                    <strong>E-mail:</strong>
                    ${instituicao.email || "Não informado"}
                </p>

                <p>
                    <strong>Descrição:</strong>
                    ${instituicao.descricao || "Não informada"}
                </p>

            </div>

        `).join("");


    } catch (erro) {

        console.error(erro);

        lista.innerHTML = `
            <p class="info">
                Não foi possível carregar as instituições.
            </p>
        `;

    }

}


// Carregar instituições quando a página abrir
carregarInstituicoes();