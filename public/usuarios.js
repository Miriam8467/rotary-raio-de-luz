console.log("USUARIOS.JS FOI CARREGADO!");

const formUsuario = document.getElementById("formUsuario");
const listaUsuarios = document.getElementById("listaUsuarios");
const mensagemUsuario = document.getElementById("mensagemUsuario");

const usuarioId = document.getElementById("usuarioId");
const tituloFormulario = document.getElementById("tituloFormulario");
const btnSalvarUsuario = document.getElementById("btnSalvarUsuario");
const btnCancelarEdicao = document.getElementById("btnCancelarEdicao");
const ajudaSenha = document.getElementById("ajudaSenha");


// ======================================================
// CARREGAR USUÁRIOS
// ======================================================

async function carregarUsuarios() {
    try {
        listaUsuarios.innerHTML = `
            <p class="info">
                Carregando usuários...
            </p>
        `;

        const resposta = await fetch("/api/usuarios");

        if (!resposta.ok) {
            if (resposta.status === 401) {
                window.location.href = "/login.html";
                return;
            }

            throw new Error("Não foi possível carregar os usuários.");
        }

        const dados = await resposta.json();

        console.log("Usuários carregados:", dados);

        if (!dados.dados || dados.dados.length === 0) {
            listaUsuarios.innerHTML = `
                <p class="info">
                    Nenhum usuário cadastrado.
                </p>
            `;
            return;
        }

        let html = "";

        html += `
            <div class="tabela-container">
                <table class="tabela-usuarios">
                    <thead>
                        <tr>
                            <th>Nome</th>
                            <th>E-mail</th>
                            <th>Status</th>
                            <th>Cadastro</th>
                            <th>Ações</th>
                        </tr>
                    </thead>

                    <tbody>
        `;

        dados.dados.forEach(function (usuario) {

            const nome = escaparHTML(usuario.nome);
            const email = escaparHTML(usuario.email);
            const dataCadastro = formatarData(usuario.criado_em);

            if (usuario.ativo) {

                html += `
                    <tr>

                        <td>
                            <span class="nome-usuario">
                                ${nome}
                            </span>
                        </td>

                        <td>
                            ${email}
                        </td>

                        <td>
                            <span class="status-usuario-ativo">
                                Ativo
                            </span>
                        </td>

                        <td>
                            ${dataCadastro}
                        </td>

                        <td>
                            <div class="acoes-usuario">

                                <button
                                    type="button"
                                    class="btn-editar-usuario"
                                    onclick="editarUsuario(${usuario.id})"
                                >
                                    ✏️ Editar
                                </button>

                                <button
                                    type="button"
                                    class="btn-desativar"
                                    onclick="alterarStatusUsuario(${usuario.id}, true)"
                                >
                                    Desativar
                                </button>

                            </div>
                        </td>

                    </tr>
                `;

            } else {

                html += `
                    <tr>

                        <td>
                            <span class="nome-usuario">
                                ${nome}
                            </span>
                        </td>

                        <td>
                            ${email}
                        </td>

                        <td>
                            <span class="status-usuario-inativo">
                                Inativo
                            </span>
                        </td>

                        <td>
                            ${dataCadastro}
                        </td>

                        <td>
                            <div class="acoes-usuario">

                                <button
                                    type="button"
                                    class="btn-editar-usuario"
                                    onclick="editarUsuario(${usuario.id})"
                                >
                                    ✏️ Editar
                                </button>

                                <button
                                    type="button"
                                    class="btn-ativar"
                                    onclick="alterarStatusUsuario(${usuario.id}, false)"
                                >
                                    Ativar
                                </button>

                            </div>
                        </td>

                    </tr>
                `;
            }
        });

        html += `
                    </tbody>
                </table>
            </div>
        `;

        listaUsuarios.innerHTML = html;

    } catch (erro) {

        console.error("Erro ao carregar usuários:", erro);

        listaUsuarios.innerHTML = `
            <p class="info">
                ${escaparHTML(erro.message)}
            </p>
        `;
    }
}


// ======================================================
// CADASTRAR OU EDITAR USUÁRIO
// ======================================================

if (formUsuario) {

    formUsuario.addEventListener("submit", async function (event) {

        event.preventDefault();

        const nome = document.getElementById("nome").value.trim();
        const email = document.getElementById("email").value.trim();
        const senha = document.getElementById("senha").value;

        mensagemUsuario.textContent = "";
        mensagemUsuario.className = "mensagem";


        // --------------------------------------------------
        // VALIDAÇÕES
        // --------------------------------------------------

        if (!nome) {
            mostrarMensagem(
                "Digite o nome do usuário.",
                "erro"
            );
            return;
        }

        if (!email) {
            mostrarMensagem(
                "Digite o e-mail do usuário.",
                "erro"
            );
            return;
        }


        // --------------------------------------------------
        // DEFINIR SE É CADASTRO OU EDIÇÃO
        // --------------------------------------------------

        const id = usuarioId.value;

        const estaEditando = id !== "";


        // --------------------------------------------------
        // SENHA NO CADASTRO
        // --------------------------------------------------

        if (!estaEditando && senha.length < 6) {

            mostrarMensagem(
                "A senha deve possuir pelo menos 6 caracteres.",
                "erro"
            );

            return;
        }


        // --------------------------------------------------
        // DESABILITAR BOTÃO
        // --------------------------------------------------

        btnSalvarUsuario.disabled = true;


        try {

            let resposta;


            // ==================================================
            // EDIÇÃO
            // ==================================================

            if (estaEditando) {

                resposta = await fetch(
                    "/api/usuarios/" + id,
                    {
                        method: "PUT",

                        headers: {
                            "Content-Type": "application/json"
                        },

                        body: JSON.stringify({
                            nome: nome,
                            email: email,
                            senha: senha
                        })
                    }
                );


            // ==================================================
            // CADASTRO
            // ==================================================

            } else {

                resposta = await fetch(
                    "/api/usuarios",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type": "application/json"
                        },

                        body: JSON.stringify({
                            nome: nome,
                            email: email,
                            senha: senha
                        })
                    }
                );
            }


            const dados = await resposta.json();


            if (!resposta.ok) {

                throw new Error(
                    dados.mensagem ||
                    (
                        estaEditando
                            ? "Não foi possível atualizar o usuário."
                            : "Não foi possível cadastrar o usuário."
                    )
                );
            }


            // --------------------------------------------------
            // MENSAGEM DE SUCESSO
            // --------------------------------------------------

            mostrarMensagem(
                dados.mensagem ||
                (
                    estaEditando
                        ? "Usuário atualizado com sucesso!"
                        : "Usuário cadastrado com sucesso!"
                ),
                "sucesso"
            );


            // --------------------------------------------------
            // LIMPAR FORMULÁRIO
            // --------------------------------------------------

            limparFormulario();


            // --------------------------------------------------
            // ATUALIZAR LISTA
            // --------------------------------------------------

            await carregarUsuarios();


        } catch (erro) {

            console.error(
                "Erro ao salvar usuário:",
                erro
            );

            mostrarMensagem(
                erro.message ||
                "Erro ao salvar usuário.",
                "erro"
            );

        } finally {

            btnSalvarUsuario.disabled = false;
        }
    });
}


// ======================================================
// EDITAR USUÁRIO
// ======================================================

async function editarUsuario(id) {

    try {

        mostrarMensagem(
            "Carregando dados do usuário...",
            "info-mensagem"
        );


        const resposta = await fetch(
            "/api/usuarios/" + id
        );


        if (!resposta.ok) {

            const dadosErro = await resposta.json();

            throw new Error(
                dadosErro.mensagem ||
                "Não foi possível buscar o usuário."
            );
        }


        const dados = await resposta.json();

        const usuario = dados.dados;


        if (!usuario) {

            throw new Error(
                "Usuário não encontrado."
            );
        }


        // --------------------------------------------------
        // PREENCHER FORMULÁRIO
        // --------------------------------------------------

        usuarioId.value = usuario.id;

        document.getElementById("nome").value =
            usuario.nome || "";

        document.getElementById("email").value =
            usuario.email || "";

        document.getElementById("senha").value = "";


        // --------------------------------------------------
        // ALTERAR TÍTULO E BOTÃO
        // --------------------------------------------------

        tituloFormulario.textContent =
            "Editar usuário";

        btnSalvarUsuario.textContent =
            "Salvar alterações";

        btnCancelarEdicao.style.display =
            "inline-block";


        ajudaSenha.textContent =
            "Deixe a senha em branco para manter a senha atual.";


        // --------------------------------------------------
        // LEVAR USUÁRIO PARA O FORMULÁRIO
        // --------------------------------------------------

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });


        document.getElementById("nome").focus();


        mensagemUsuario.textContent = "";
        mensagemUsuario.className = "mensagem";


    } catch (erro) {

        console.error(
            "Erro ao editar usuário:",
            erro
        );

        mostrarMensagem(
            erro.message ||
            "Erro ao carregar usuário.",
            "erro"
        );
    }
}


// ======================================================
// ALTERAR STATUS
// ======================================================

async function alterarStatusUsuario(
    id,
    statusAtual
) {

    const novoStatus = !statusAtual;


    try {

        const botoes =
            document.querySelectorAll(
                ".btn-ativar, .btn-desativar"
            );


        botoes.forEach(function (botao) {
            botao.disabled = true;
        });


        const resposta = await fetch(
            "/api/usuarios/" + id + "/status",
            {
                method: "PATCH",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    ativo: novoStatus
                })
            }
        );


        const dados = await resposta.json();


        if (!resposta.ok) {

            throw new Error(
                dados.mensagem ||
                "Não foi possível alterar o status."
            );
        }


        mostrarMensagem(
            dados.mensagem ||
            "Status alterado com sucesso!",
            "sucesso"
        );


        await carregarUsuarios();


    } catch (erro) {

        console.error(
            "Erro ao alterar status:",
            erro
        );

        mostrarMensagem(
            erro.message ||
            "Erro ao alterar status.",
            "erro"
        );
    }
}


// ======================================================
// CANCELAR EDIÇÃO
// ======================================================

if (btnCancelarEdicao) {

    btnCancelarEdicao.addEventListener(
        "click",
        function () {

            limparFormulario();

            mostrarMensagem(
                "",
                ""
            );
        }
    );
}


// ======================================================
// LIMPAR FORMULÁRIO
// ======================================================

function limparFormulario() {

    formUsuario.reset();

    usuarioId.value = "";

    tituloFormulario.textContent =
        "Novo usuário";

    btnSalvarUsuario.textContent =
        "Cadastrar usuário";

    btnCancelarEdicao.style.display =
        "none";

    ajudaSenha.textContent =
        "A senha deve possuir pelo menos 6 caracteres.";
}


// ======================================================
// MOSTRAR MENSAGEM
// ======================================================

function mostrarMensagem(
    mensagem,
    tipo
) {

    mensagemUsuario.textContent =
        mensagem || "";

    mensagemUsuario.className =
        tipo
            ? "mensagem " + tipo
            : "mensagem";
}


// ======================================================
// FORMATAR DATA
// ======================================================

function formatarData(data) {

    if (!data) {
        return "-";
    }


    const dataObjeto = new Date(data);


    if (Number.isNaN(dataObjeto.getTime())) {
        return "-";
    }


    return dataObjeto.toLocaleString(
        "pt-BR",
        {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        }
    );
}


// ======================================================
// PROTEGER HTML
// ======================================================

function escaparHTML(valor) {

    if (
        valor === null ||
        valor === undefined
    ) {
        return "";
    }


    return String(valor)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


// ======================================================
// INICIAR PÁGINA
// ======================================================

carregarUsuarios();