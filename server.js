const express = require("express");
const path = require("path");
const { Pool } = require("pg");
const bcrypt = require("bcryptjs");
const session = require("express-session");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
require("dotenv").config();
const pino = require("pino");

const logger = pino({
    level: "info"
});

const app = express();

app.set("trust proxy", 1);

app.use(helmet({
    contentSecurityPolicy: false
}));

const PORT = Number(process.env.PORT || 3000);


// ========================================
// CONEXÃO COM O POSTGRESQL
// ========================================

const pool = new Pool({

    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD

});


// ========================================
// CONFIGURAÇÕES
// ========================================

app.use(express.json());

app.use(express.urlencoded({
    extended: true
}));

// ========================================
// SESSÃO
// ========================================

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production"
    }
}));

// ========================================
// FUNÇÕES DE VALIDAÇÃO
// ========================================

function textoValido(valor, minimo = 1, maximo = 255) {
    if (typeof valor !== "string") {
        return false;
    }

    const texto = valor.trim();

    return (
        texto.length >= minimo &&
        texto.length <= maximo
    );
}


function emailValido(email) {
    if (!email) {
        return false;
    }

    if (typeof email !== "string") {
        return false;
    }

    const emailLimpo = email.trim();

    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        emailLimpo
    );
}


function idValido(id) {
    if (
        id === undefined ||
        id === null ||
        id === ""
    ) {
        return false;
    }

    const numero = Number(id);

    return (
        Number.isInteger(numero) &&
        numero > 0
    );
}


function numeroValido(
    valor,
    permitirZero = true
) {
    if (
        valor === undefined ||
        valor === null ||
        valor === ""
    ) {
        return false;
    }

    const numero = Number(valor);

    if (!Number.isFinite(numero)) {
        return false;
    }

    if (!permitirZero && numero <= 0) {
        return false;
    }

    if (permitirZero && numero < 0) {
        return false;
    }

    return true;
}


function dataValida(data) {
    if (!data) {
        return false;
    }

    if (typeof data !== "string") {
        return false;
    }

    const dataISO =
        /^\d{4}-\d{2}-\d{2}$/;

    if (!dataISO.test(data)) {
        return false;
    }

    const dataObjeto =
        new Date(`${data}T00:00:00`);

    return !Number.isNaN(
        dataObjeto.getTime()
    );
}

// ========================================
// PROTEÇÃO DE AUTENTICAÇÃO
// ========================================

function exigirAutenticacao(req, res, next) {

    if (req.session && req.session.usuario) {
        return next();
    }

    if (req.originalUrl.startsWith("/api/")) {
        return res.status(401).json({
            sucesso: false,
            mensagem: "É necessário fazer login para acessar o sistema."
        });
    }

    return res.redirect("/login.html");
}

// ========================================
// PROTEÇÃO DOS ARQUIVOS HTML
// ========================================

app.use((req, res, next) => {

    const paginasProtegidas = [
        "/",
        "/index.html",
        "/doacoes.html",
        "/doadores.html",
        "/instituicoes.html",
        "/projetos.html",
        "/relatorios.html"
    ];

    if (paginasProtegidas.includes(req.path)) {
        return exigirAutenticacao(req, res, next);
    }

    next();
});

// ========================================
// ARQUIVOS PÚBLICOS
// ========================================

app.use(express.static(
    path.join(__dirname, "public"),
    {
        index: false
    }
));

// ========================================
// PÁGINAS PROTEGIDAS
// ========================================

app.get("/", exigirAutenticacao, (req, res) => {
    res.sendFile(
        path.join(__dirname, "public", "index.html")
    );
});

app.get("/index.html", exigirAutenticacao, (req, res) => {
    res.sendFile(
        path.join(__dirname, "public", "index.html")
    );
});

app.get("/doacoes.html", exigirAutenticacao, (req, res) => {
    res.sendFile(
        path.join(__dirname, "public", "doacoes.html")
    );
});

app.get("/doadores.html", exigirAutenticacao, (req, res) => {
    res.sendFile(
        path.join(__dirname, "public", "doadores.html")
    );
});

app.get("/instituicoes.html", exigirAutenticacao, (req, res) => {
    res.sendFile(
        path.join(__dirname, "public", "instituicoes.html")
    );
});

app.get("/projetos.html", exigirAutenticacao, (req, res) => {
    res.sendFile(
        path.join(__dirname, "public", "projetos.html")
    );
});

app.get("/relatorios.html", exigirAutenticacao, (req, res) => {
    res.sendFile(
        path.join(__dirname, "public", "relatorios.html")
    );
});

// ========================================
// TESTE DO BANCO
// ========================================

// ========================================
// LOGIN
// ========================================

app.post(
    "/api/login",
    rateLimit({
        windowMs: 15 * 60 * 1000,
        limit: 10,
        standardHeaders: true,
        legacyHeaders: false,
        message: {
            sucesso: false,
            mensagem:
                "Muitas tentativas de login. Tente novamente em alguns minutos."
        }
    }),
    async (req, res) => {

        try {

            const { email, senha } = req.body;


            // ====================================
            // VALIDAR DADOS
            // ====================================

            if (!email || !senha) {

                logger.warn({
                    evento: "login_dados_incompletos"
                });

                return res.status(400).json({
                    sucesso: false,
                    mensagem:
                        "E-mail e senha são obrigatórios."
                });

            }


            // ====================================
            // BUSCAR USUÁRIO
            // ====================================

            const resultado = await pool.query(
                `
                SELECT id, nome, email, senha, ativo
                FROM usuarios
                WHERE email = $1
                `,
                [email.trim()]
            );


            // ====================================
            // USUÁRIO NÃO ENCONTRADO
            // ====================================

            if (resultado.rows.length === 0) {

                logger.warn({
                    evento: "login_falhou",
                    motivo: "usuario_nao_encontrado"
                });

                return res.status(401).json({
                    sucesso: false,
                    mensagem:
                        "E-mail ou senha inválidos."
                });

            }


            const usuario =
                resultado.rows[0];


            // ====================================
            // USUÁRIO DESATIVADO
            // ====================================

            if (!usuario.ativo) {

                logger.warn({
                    evento: "login_bloqueado",
                    usuario_id: usuario.id,
                    motivo: "usuario_desativado"
                });

                return res.status(403).json({
                    sucesso: false,
                    mensagem:
                        "Este usuário está desativado."
                });

            }


            // ====================================
            // VERIFICAR SENHA
            // ====================================

            const senhaCorreta =
                await bcrypt.compare(
                    senha,
                    usuario.senha
                );


            if (!senhaCorreta) {

                logger.warn({
                    evento: "login_falhou",
                    motivo: "senha_incorreta"
                });

                return res.status(401).json({
                    sucesso: false,
                    mensagem:
                        "E-mail ou senha inválidos."
                });

            }


            // ====================================
            // CRIAR SESSÃO
            // ====================================

            req.session.usuario = {
                id: usuario.id,
                nome: usuario.nome,
                email: usuario.email
            };


            // ====================================
            // REGISTRAR LOGIN
            // ====================================

            logger.info({
                evento: "login_sucesso",
                usuario_id: usuario.id
            });


            // ====================================
            // RESPOSTA
            // ====================================

            return res.json({
                sucesso: true,
                mensagem:
                    "Login realizado com sucesso.",
                usuario:
                    req.session.usuario
            });


        } catch (erro) {

            logger.error({
                evento: "erro_login",
                mensagem: erro.message
            });

            console.error(
                "Erro no login:",
                erro
            );

            return res.status(500).json({
                sucesso: false,
                mensagem:
                    "Erro interno ao realizar login."
            });

        }

    }
);


// ========================================
// PROTEÇÃO DAS APIs
// ========================================

app.use(
    "/api",
    exigirAutenticacao
);


// ========================================
// LOGOUT
// ========================================

app.post(
    "/api/logout",
    (req, res) => {

        const usuarioId =
            req.session?.usuario?.id;


        req.session.destroy(
            (erro) => {

                if (erro) {

                    logger.error({
                        evento: "erro_logout",
                        usuario_id:
                            usuarioId || null,
                        mensagem:
                            erro.message
                    });

                    console.error(
                        "Erro ao realizar logout:",
                        erro
                    );

                    return res.status(500).json({
                        sucesso: false,
                        mensagem:
                            "Erro ao sair do sistema."
                    });

                }


                // ====================================
                // REGISTRAR LOGOUT
                // ====================================

                logger.info({
                    evento: "logout_sucesso",
                    usuario_id:
                        usuarioId || null
                });


                // ====================================
                // LIMPAR COOKIE
                // ====================================

                res.clearCookie(
                    "connect.sid"
                );


                // ====================================
                // RESPOSTA
                // ====================================

                return res.json({
                    sucesso: true,
                    mensagem:
                        "Logout realizado com sucesso."
                });

            }
        );

    }
);

// ========================================
// INSTITUIÇÕES
// ========================================

// ========================================
// CADASTRAR INSTITUIÇÃO
// ========================================

app.post("/api/instituicoes", async (req, res) => {

    try {

        const {
            nome,
            tipo,
            contato,
            telefone,
            email,
            descricao
        } = req.body;


        // ====================================
        // VALIDAR NOME
        // ====================================

        if (!textoValido(nome, 2, 150)) {

            return res.status(400).json({
                sucesso: false,
                mensagem:
                    "O nome da instituição é obrigatório e deve possuir entre 2 e 150 caracteres."
            });

        }


        // ====================================
        // VALIDAR TIPO
        // ====================================

        if (
            tipo !== undefined &&
            tipo !== null &&
            tipo !== "" &&
            !textoValido(tipo, 2, 100)
        ) {

            return res.status(400).json({
                sucesso: false,
                mensagem:
                    "O tipo da instituição é inválido."
            });

        }


        // ====================================
        // VALIDAR CONTATO
        // ====================================

        if (
            contato !== undefined &&
            contato !== null &&
            contato !== "" &&
            !textoValido(contato, 2, 150)
        ) {

            return res.status(400).json({
                sucesso: false,
                mensagem:
                    "O contato informado é inválido."
            });

        }


        // ====================================
        // VALIDAR TELEFONE
        // ====================================

        if (
            telefone !== undefined &&
            telefone !== null &&
            telefone !== "" &&
            !textoValido(telefone, 8, 30)
        ) {

            return res.status(400).json({
                sucesso: false,
                mensagem:
                    "O telefone informado é inválido."
            });

        }


        // ====================================
        // VALIDAR E-MAIL
        // ====================================

        if (
            email !== undefined &&
            email !== null &&
            email !== "" &&
            !emailValido(email)
        ) {

            return res.status(400).json({
                sucesso: false,
                mensagem:
                    "Informe um e-mail válido."
            });

        }


        // ====================================
        // VALIDAR DESCRIÇÃO
        // ====================================

        if (
            descricao !== undefined &&
            descricao !== null &&
            descricao !== "" &&
            !textoValido(descricao, 2, 1000)
        ) {

            return res.status(400).json({
                sucesso: false,
                mensagem:
                    "A descrição deve possuir no máximo 1000 caracteres."
            });

        }


        // ====================================
        // INSERIR INSTITUIÇÃO
        // ====================================

        const resultado = await pool.query(

            `INSERT INTO instituicoes
            (
                nome,
                tipo,
                contato,
                telefone,
                email,
                descricao
            )

            VALUES
            (
                $1,
                $2,
                $3,
                $4,
                $5,
                $6
            )

            RETURNING *`,

            [
                nome.trim(),
                tipo ? tipo.trim() : null,
                contato ? contato.trim() : null,
                telefone ? telefone.trim() : null,
                email ? email.trim().toLowerCase() : null,
                descricao ? descricao.trim() : null
            ]

        );


        // ====================================
        // REGISTRAR LOG
        // ====================================

        logger.info({
            evento: "instituicao_cadastrada",
            instituicao_id: resultado.rows[0].id
        });


        // ====================================
        // RESPOSTA
        // ====================================

        return res.status(201).json({

            sucesso: true,

            mensagem:
                "Instituição cadastrada com sucesso!",

            instituicao:
                resultado.rows[0]

        });


    } catch (erro) {

        logger.error({
            evento: "erro_cadastro_instituicao",
            mensagem: erro.message
        });

        console.error(
            "Erro ao cadastrar instituição:",
            erro
        );

        return res.status(500).json({

            sucesso: false,

            mensagem:
                "Erro ao cadastrar instituição."

        });

    }

});

// ========================================
// LISTAR INSTITUIÇÕES
// ========================================

app.get("/api/instituicoes", async (req, res) => {

    try {

        const resultado = await pool.query(

            `SELECT *
             FROM instituicoes
             ORDER BY id DESC`

        );


        // ====================================
        // REGISTRAR LOG
        // ====================================

        logger.info({
            evento: "instituicoes_listadas",
            total_instituicoes: resultado.rows.length
        });


        return res.json({

            sucesso: true,

            total:
                resultado.rows.length,

            dados:
                resultado.rows

        });


    } catch (erro) {

        logger.error({
            evento: "erro_listagem_instituicoes",
            mensagem: erro.message
        });

        console.error(
            "Erro ao buscar instituições:",
            erro
        );

        return res.status(500).json({

            sucesso: false,

            mensagem:
                "Erro ao buscar instituições."

        });

    }

});

// ========================================
// BUSCAR UMA INSTITUIÇÃO
// ========================================

app.get("/api/instituicoes/:id", async (req, res) => {

    try {

        const { id } =
            req.params;


        const resultado =
            await pool.query(

                `SELECT *
                 FROM instituicoes
                 WHERE id = $1`,

                [id]

            );


        if (resultado.rows.length === 0) {

            return res.status(404).json({

                sucesso: false,

                mensagem:
                    "Instituição não encontrada."

            });

        }


        // ====================================
        // REGISTRAR LOG
        // ====================================

        logger.info({
            evento: "instituicao_consultada",
            instituicao_id: Number(id)
        });


        return res.json({

            sucesso: true,

            dados:
                resultado.rows[0]

        });


    } catch (erro) {

        logger.error({
            evento: "erro_consulta_instituicao",
            mensagem: erro.message
        });

        console.error(
            "Erro ao buscar instituição:",
            erro
        );

        return res.status(500).json({

            sucesso: false,

            mensagem:
                "Erro ao buscar instituição."

        });

    }

});

// ========================================
// EDITAR INSTITUIÇÃO
// ========================================

app.put("/api/instituicoes/:id", async (req, res) => {

    try {

        const { id } = req.params;

        const {
            nome,
            tipo,
            contato,
            telefone,
            email,
            descricao
        } = req.body;


        // ====================================
        // VALIDAR ID
        // ====================================

        if (!idValido(id)) {

            return res.status(400).json({

                sucesso: false,

                mensagem:
                    "O ID da instituição é inválido."

            });

        }


        // ====================================
        // VALIDAR NOME
        // ====================================

        if (!textoValido(nome, 2, 150)) {

            return res.status(400).json({

                sucesso: false,

                mensagem:
                    "O nome da instituição é obrigatório e deve possuir entre 2 e 150 caracteres."

            });

        }


        // ====================================
        // VALIDAR TIPO
        // ====================================

        if (
            tipo !== undefined &&
            tipo !== null &&
            tipo !== "" &&
            !textoValido(tipo, 2, 100)
        ) {

            return res.status(400).json({

                sucesso: false,

                mensagem:
                    "O tipo da instituição é inválido."

            });

        }


        // ====================================
        // VALIDAR CONTATO
        // ====================================

        if (
            contato !== undefined &&
            contato !== null &&
            contato !== "" &&
            !textoValido(contato, 2, 150)
        ) {

            return res.status(400).json({

                sucesso: false,

                mensagem:
                    "O contato informado é inválido."

            });

        }


        // ====================================
        // VALIDAR TELEFONE
        // ====================================

        if (
            telefone !== undefined &&
            telefone !== null &&
            telefone !== "" &&
            !textoValido(telefone, 8, 30)
        ) {

            return res.status(400).json({

                sucesso: false,

                mensagem:
                    "O telefone informado é inválido."

            });

        }


        // ====================================
        // VALIDAR E-MAIL
        // ====================================

        if (
            email !== undefined &&
            email !== null &&
            email !== "" &&
            !emailValido(email)
        ) {

            return res.status(400).json({

                sucesso: false,

                mensagem:
                    "Informe um e-mail válido."

            });

        }


        // ====================================
        // VALIDAR DESCRIÇÃO
        // ====================================

        if (
            descricao !== undefined &&
            descricao !== null &&
            descricao !== "" &&
            !textoValido(descricao, 2, 1000)
        ) {

            return res.status(400).json({

                sucesso: false,

                mensagem:
                    "A descrição deve possuir no máximo 1000 caracteres."

            });

        }


        // ====================================
        // VERIFICAR SE INSTITUIÇÃO EXISTE
        // ====================================

        const existente = await pool.query(

            `SELECT id
             FROM instituicoes
             WHERE id = $1`,

            [Number(id)]

        );


        if (existente.rows.length === 0) {

            return res.status(404).json({

                sucesso: false,

                mensagem:
                    "Instituição não encontrada."

            });

        }


        // ====================================
        // ATUALIZAR INSTITUIÇÃO
        // ====================================

        const resultado = await pool.query(

            `UPDATE instituicoes

             SET
                nome = $1,
                tipo = $2,
                contato = $3,
                telefone = $4,
                email = $5,
                descricao = $6

             WHERE id = $7

             RETURNING *`,

            [
                nome.trim(),

                tipo
                    ? tipo.trim()
                    : null,

                contato
                    ? contato.trim()
                    : null,

                telefone
                    ? telefone.trim()
                    : null,

                email
                    ? email.trim().toLowerCase()
                    : null,

                descricao
                    ? descricao.trim()
                    : null,

                Number(id)
            ]

        );


        // ====================================
        // REGISTRAR LOG
        // ====================================

        logger.info({
            evento: "instituicao_atualizada",
            instituicao_id: resultado.rows[0].id
        });


        // ====================================
        // RESPOSTA
        // ====================================

        return res.json({

            sucesso: true,

            mensagem:
                "Instituição atualizada com sucesso!",

            instituicao:
                resultado.rows[0]

        });


    } catch (erro) {

        logger.error({
            evento: "erro_edicao_instituicao",
            mensagem: erro.message
        });

        console.error(
            "Erro ao editar instituição:",
            erro
        );

        return res.status(500).json({

            sucesso: false,

            mensagem:
                "Erro ao editar instituição."

        });

    }

});

// ========================================
// EXCLUIR INSTITUIÇÃO
// ========================================

app.delete("/api/instituicoes/:id", async (req, res) => {

    try {

        const { id } =
            req.params;


        // ====================================
        // VALIDAR ID
        // ====================================

        if (!idValido(id)) {

            return res.status(400).json({

                sucesso: false,

                mensagem:
                    "O ID da instituição é inválido."

            });

        }


        // ====================================
        // VERIFICAR SE EXISTE
        // ====================================

        const existente =
            await pool.query(

                `SELECT
                    id,
                    nome

                 FROM instituicoes

                 WHERE id = $1`,

                [Number(id)]

            );


        if (existente.rows.length === 0) {

            return res.status(404).json({

                sucesso: false,

                mensagem:
                    "Instituição não encontrada."

            });

        }


        const instituicao =
            existente.rows[0];


        // ====================================
        // EXCLUIR
        // ====================================

        await pool.query(

            `DELETE FROM instituicoes

             WHERE id = $1`,

            [Number(id)]

        );


        // ====================================
        // REGISTRAR LOG
        // ====================================

        logger.info({
            evento: "instituicao_excluida",
            instituicao_id: instituicao.id
        });


        return res.json({

            sucesso: true,

            mensagem:
                "Instituição excluída com sucesso!"

        });


    } catch (erro) {

        // ====================================
        // LOG DE ERRO
        // ====================================

        logger.error({
            evento: "erro_exclusao_instituicao",
            instituicao_id:
                req.params?.id
                    ? Number(req.params.id)
                    : null,
            mensagem: erro.message
        });


        console.error(
            "Erro ao excluir instituição:",
            erro
        );


        // ====================================
        // INSTITUIÇÃO POSSUI DOAÇÃO VINCULADA
        // ====================================

        if (erro.code === "23503") {

            logger.warn({
                evento: "exclusao_instituicao_bloqueada",
                instituicao_id:
                    req.params?.id
                        ? Number(req.params.id)
                        : null,
                motivo:
                    "possui_doacoes_vinculadas"
            });

            return res.status(409).json({

                sucesso: false,

                mensagem:
                    "Esta instituição possui doações vinculadas e não pode ser excluída."

            });

        }


        return res.status(500).json({

            sucesso: false,

            mensagem:
                "Erro ao excluir instituição."

        });

    }

});

// ========================================
// LISTAR TODOS OS DOADORES
// ========================================

app.get("/api/doadores", async (req, res) => {

    try {

        const resultado = await pool.query(`
            
            SELECT
                id,
                nome,
                tipo,
                documento,
                telefone,
                email,

                TO_CHAR(
                    criado_em AT TIME ZONE 'America/Sao_Paulo',
                    'DD/MM/YYYY HH24:MI:SS'
                ) AS criado_em

            FROM doadores

            ORDER BY id DESC

        `);


        res.json({

            sucesso: true,

            total: resultado.rows.length,

            dados: resultado.rows

        });


    } catch (erro) {

        console.error(
            "Erro ao buscar doadores:",
            erro
        );


        res.status(500).json({

            sucesso: false,

            mensagem:
                "Erro ao carregar os doadores."

        });

    }

});

// ========================================
// CADASTRAR DOADOR
// ========================================

app.post("/api/doadores", async (req, res) => {

    try {

        const {
            nome,
            tipo,
            documento,
            email,
            telefone
        } = req.body;


        // ====================================
        // VALIDAR NOME
        // ====================================

        if (!textoValido(nome, 2, 150)) {

            return res.status(400).json({
                sucesso: false,
                mensagem:
                    "O nome do doador é obrigatório e deve possuir entre 2 e 150 caracteres."
            });

        }


        // ====================================
        // VALIDAR TIPO
        // ====================================

        if (
            tipo !== "Pessoa Física" &&
            tipo !== "Pessoa Jurídica"
        ) {

            return res.status(400).json({
                sucesso: false,
                mensagem:
                    "O tipo de doador deve ser Pessoa Física ou Pessoa Jurídica."
            });

        }


        // ====================================
        // VALIDAR DOCUMENTO
        // ====================================

        if (!textoValido(documento, 1, 30)) {

            return res.status(400).json({
                sucesso: false,
                mensagem:
                    "O CPF ou CNPJ é obrigatório."
            });

        }


        // ====================================
        // LIMPAR DOCUMENTO
        // ====================================

        const documentoLimpo =
            documento.replace(/\D/g, "");


        // ====================================
        // VALIDAR CPF
        // ====================================

        if (
            tipo === "Pessoa Física" &&
            documentoLimpo.length !== 11
        ) {

            return res.status(400).json({
                sucesso: false,
                mensagem:
                    "O CPF deve possuir 11 números."
            });

        }


        // ====================================
        // VALIDAR CNPJ
        // ====================================

        if (
            tipo === "Pessoa Jurídica" &&
            documentoLimpo.length !== 14
        ) {

            return res.status(400).json({
                sucesso: false,
                mensagem:
                    "O CNPJ deve possuir 14 números."
            });

        }


        // ====================================
        // VALIDAR E-MAIL
        // ====================================

        if (
            email !== undefined &&
            email !== null &&
            email !== "" &&
            !emailValido(email)
        ) {

            return res.status(400).json({
                sucesso: false,
                mensagem:
                    "Informe um e-mail válido."
            });

        }


        // ====================================
        // VALIDAR TELEFONE
        // ====================================

        if (
            telefone !== undefined &&
            telefone !== null &&
            telefone !== "" &&
            !textoValido(telefone, 8, 30)
        ) {

            return res.status(400).json({
                sucesso: false,
                mensagem:
                    "O telefone informado é inválido."
            });

        }


        // ====================================
        // VERIFICAR DOCUMENTO DUPLICADO
        // ====================================

        const documentoExistente =
            await pool.query(
                `SELECT id
                 FROM doadores
                 WHERE documento = $1`,
                [documentoLimpo]
            );


        if (documentoExistente.rows.length > 0) {

            return res.status(409).json({
                sucesso: false,
                mensagem:
                    "Já existe um doador cadastrado com este CPF ou CNPJ."
            });

        }


        // ====================================
        // CADASTRAR DOADOR
        // ====================================

        const resultado =
            await pool.query(
                `INSERT INTO doadores
                (
                    nome,
                    tipo,
                    documento,
                    email,
                    telefone
                )

                VALUES
                (
                    $1,
                    $2,
                    $3,
                    $4,
                    $5
                )

                RETURNING *`,
                [
                    nome.trim(),

                    tipo,

                    documentoLimpo,

                    email
                        ? email.trim().toLowerCase()
                        : null,

                    telefone
                        ? telefone.trim()
                        : null
                ]
            );


        // ====================================
        // REGISTRAR LOG
        // ====================================

        logger.info({
            evento: "doador_cadastrado",
            doador_id:
                resultado.rows[0].id,
            tipo: tipo
        });


        // ====================================
        // RESPOSTA
        // ====================================

        return res.status(201).json({

            sucesso: true,

            mensagem:
                "Doador cadastrado com sucesso!",

            doador:
                resultado.rows[0]

        });


    } catch (erro) {

        logger.error({
            evento: "erro_cadastro_doador",
            mensagem: erro.message
        });


        console.error(
            "Erro ao cadastrar doador:",
            erro
        );


        return res.status(500).json({

            sucesso: false,

            mensagem:
                "Erro ao cadastrar doador."

        });

    }

});

// ========================================
// BUSCAR UM DOADOR PELO ID
// ========================================

app.get("/api/doadores/:id", async (req, res) => {

    try {

        const { id } = req.params;


        const resultado =
            await pool.query(
                `
                SELECT
                    id,
                    nome,
                    tipo,
                    documento,
                    telefone,
                    email,
                    criado_em
                FROM doadores
                WHERE id = $1
                `,
                [id]
            );


        if (resultado.rows.length === 0) {

            return res.status(404).json({

                sucesso: false,

                mensagem:
                    "Doador não encontrado."

            });

        }


        res.json({

            sucesso: true,

            dados:
                resultado.rows[0]

        });


    } catch (erro) {

        console.error(erro);


        res.status(500).json({

            sucesso: false,

            mensagem:
                "Erro ao buscar doador."

        });

    }

});



// ========================================
// EDITAR DOADOR
// ========================================

app.put("/api/doadores/:id", async (req, res) => {

    try {

        const { id } = req.params;

        const {
            nome,
            tipo,
            documento,
            email,
            telefone
        } = req.body;


        // ====================================
        // VALIDAR ID
        // ====================================

        if (!idValido(id)) {

            return res.status(400).json({
                sucesso: false,
                mensagem:
                    "O ID do doador é inválido."
            });

        }


        // ====================================
        // VALIDAR NOME
        // ====================================

        if (!textoValido(nome, 2, 150)) {

            return res.status(400).json({
                sucesso: false,
                mensagem:
                    "O nome do doador é obrigatório e deve possuir entre 2 e 150 caracteres."
            });

        }


        // ====================================
        // VALIDAR TIPO
        // ====================================

        if (
            tipo !== "Pessoa Física" &&
            tipo !== "Pessoa Jurídica"
        ) {

            return res.status(400).json({
                sucesso: false,
                mensagem:
                    "O tipo de doador deve ser Pessoa Física ou Pessoa Jurídica."
            });

        }


        // ====================================
        // VALIDAR DOCUMENTO
        // ====================================

        if (!textoValido(documento, 1, 30)) {

            return res.status(400).json({
                sucesso: false,
                mensagem:
                    "O CPF ou CNPJ é obrigatório."
            });

        }


        // ====================================
        // LIMPAR DOCUMENTO
        // ====================================

        const documentoLimpo =
            documento.replace(/\D/g, "");


        // ====================================
        // VALIDAR CPF
        // ====================================

        if (
            tipo === "Pessoa Física" &&
            documentoLimpo.length !== 11
        ) {

            return res.status(400).json({
                sucesso: false,
                mensagem:
                    "O CPF deve possuir 11 números."
            });

        }


        // ====================================
        // VALIDAR CNPJ
        // ====================================

        if (
            tipo === "Pessoa Jurídica" &&
            documentoLimpo.length !== 14
        ) {

            return res.status(400).json({
                sucesso: false,
                mensagem:
                    "O CNPJ deve possuir 14 números."
            });

        }


        // ====================================
        // VALIDAR E-MAIL
        // ====================================

        if (
            email !== undefined &&
            email !== null &&
            email !== "" &&
            !emailValido(email)
        ) {

            return res.status(400).json({
                sucesso: false,
                mensagem:
                    "Informe um e-mail válido."
            });

        }


        // ====================================
        // VALIDAR TELEFONE
        // ====================================

        if (
            telefone !== undefined &&
            telefone !== null &&
            telefone !== "" &&
            !textoValido(telefone, 8, 30)
        ) {

            return res.status(400).json({
                sucesso: false,
                mensagem:
                    "O telefone informado é inválido."
            });

        }


        // ====================================
        // VERIFICAR SE O DOADOR EXISTE
        // ====================================

        const doadorExistente =
            await pool.query(
                `SELECT id
                 FROM doadores
                 WHERE id = $1`,
                [Number(id)]
            );


        if (
            doadorExistente.rows.length === 0
        ) {

            return res.status(404).json({
                sucesso: false,
                mensagem:
                    "Doador não encontrado."
            });

        }


        // ====================================
        // VERIFICAR DOCUMENTO DUPLICADO
        // ====================================

        const documentoExistente =
            await pool.query(
                `SELECT id
                 FROM doadores
                 WHERE documento = $1
                 AND id <> $2`,
                [
                    documentoLimpo,
                    Number(id)
                ]
            );


        if (
            documentoExistente.rows.length > 0
        ) {

            return res.status(409).json({
                sucesso: false,
                mensagem:
                    "Já existe outro doador cadastrado com este CPF ou CNPJ."
            });

        }


        // ====================================
        // ATUALIZAR DOADOR
        // ====================================

        const resultado =
            await pool.query(
                `UPDATE doadores
                 SET
                    nome = $1,
                    tipo = $2,
                    documento = $3,
                    email = $4,
                    telefone = $5
                 WHERE id = $6
                 RETURNING *`,
                [
                    nome.trim(),
                    tipo,
                    documentoLimpo,
                    email
                        ? email.trim().toLowerCase()
                        : null,
                    telefone
                        ? telefone.trim()
                        : null,
                    Number(id)
                ]
            );


        // ====================================
        // LOG DE EDIÇÃO
        // ====================================

        logger.info({
            evento: "doador_atualizado",
            doador_id: resultado.rows[0].id,
            tipo: tipo
        });


        // ====================================
        // RESPOSTA
        // ====================================

        return res.json({
            sucesso: true,
            mensagem:
                "Doador atualizado com sucesso!",
            doador:
                resultado.rows[0]
        });


    } catch (erro) {

        logger.error({
            evento: "erro_edicao_doador",
            mensagem: erro.message
        });

        console.error(
            "Erro ao editar doador:",
            erro
        );


        return res.status(500).json({
            sucesso: false,
            mensagem:
                "Erro ao editar doador."
        });

    }

});

// ========================================
// EXCLUIR DOADOR
// ========================================

app.delete("/api/doadores/:id", async (req, res) => {

    try {

        const { id } = req.params;

        // VALIDAR ID
        if (!idValido(id)) {

            return res.status(400).json({
                sucesso: false,
                mensagem:
                    "O ID do doador é inválido."
            });

        }

        // VERIFICAR SE O DOADOR EXISTE
        const doadorExistente =
            await pool.query(
                `
                SELECT id, nome
                FROM doadores
                WHERE id = $1
                `,
                [Number(id)]
            );

        if (doadorExistente.rows.length === 0) {

            return res.status(404).json({
                sucesso: false,
                mensagem:
                    "Doador não encontrado."
            });

        }

        const doador =
            doadorExistente.rows[0];

        // VERIFICAR SE EXISTEM DOAÇÕES VINCULADAS
        const doacoesVinculadas =
            await pool.query(
                `
                SELECT COUNT(*) AS total
                FROM doacoes
                WHERE doador_id = $1
                `,
                [Number(id)]
            );

        const totalDoacoes =
            Number(
                doacoesVinculadas.rows[0].total
            );

        if (totalDoacoes > 0) {

            logger.warn({
                evento: "exclusao_doador_bloqueada",
                doador_id: doador.id,
                motivo: "possui_doacoes_vinculadas",
                total_doacoes: totalDoacoes
            });

            return res.status(409).json({
                sucesso: false,
                mensagem:
                    `Não é possível excluir o doador "${doador.nome}" porque existem ${totalDoacoes} doação(ões) vinculada(s) a ele.`
            });

        }

        // EXCLUIR DOADOR
        await pool.query(
            `
            DELETE FROM doadores
            WHERE id = $1
            `,
            [Number(id)]
        );

        // LOG DE EXCLUSÃO
        logger.info({
            evento: "doador_excluido",
            doador_id: doador.id
        });

        return res.json({
            sucesso: true,
            mensagem:
                "Doador excluído com sucesso!"
        });

    } catch (erro) {

        logger.error({
            evento: "erro_exclusao_doador",
            mensagem: erro.message
        });

        console.error(
            "Erro ao excluir doador:",
            erro
        );

        return res.status(500).json({
            sucesso: false,
            mensagem:
                "Erro ao excluir doador."
        });

    }

});

// ========================================
// DOAÇÕES
// ========================================


// ========================================
// CADASTRAR DOAÇÃO
// ========================================

app.post("/api/doacoes", async (req, res) => {

    try {

        const {
            doador,
            data_doacao,
            tipo,
            descricao,
            quantidade,
            valor,
            instituicao_id
        } = req.body;


        // ====================================
        // VALIDAR DOADOR
        // ====================================

        if (!textoValido(doador, 2, 150)) {

            return res.status(400).json({
                sucesso: false,
                mensagem:
                    "O nome do doador é obrigatório e deve possuir entre 2 e 150 caracteres."
            });

        }


        // ====================================
        // VALIDAR DATA
        // ====================================

        if (!dataValida(data_doacao)) {

            return res.status(400).json({
                sucesso: false,
                mensagem:
                    "Informe uma data de doação válida."
            });

        }


        // ====================================
        // VALIDAR TIPO
        // ====================================

        if (!textoValido(tipo, 2, 100)) {

            return res.status(400).json({
                sucesso: false,
                mensagem:
                    "O tipo da doação é obrigatório."
            });

        }


        // ====================================
        // VALIDAR DESCRIÇÃO
        // ====================================

        if (!textoValido(descricao, 2, 1000)) {

            return res.status(400).json({
                sucesso: false,
                mensagem:
                    "A descrição da doação é obrigatória e deve possuir no máximo 1000 caracteres."
            });

        }


        // ====================================
        // VALIDAR QUANTIDADE
        // ====================================

        if (
            quantidade !== undefined &&
            quantidade !== null &&
            quantidade !== ""
        ) {

            if (!numeroValido(quantidade, false)) {

                return res.status(400).json({
                    sucesso: false,
                    mensagem:
                        "A quantidade deve ser um número maior que zero."
                });

            }

        }


        // ====================================
        // VALIDAR VALOR
        // ====================================

        if (
            valor !== undefined &&
            valor !== null &&
            valor !== ""
        ) {

            if (!numeroValido(valor, true)) {

                return res.status(400).json({
                    sucesso: false,
                    mensagem:
                        "O valor da doação não pode ser negativo."
                });

            }

        }


        // ====================================
        // VALIDAR INSTITUIÇÃO
        // ====================================

        if (
            instituicao_id !== undefined &&
            instituicao_id !== null &&
            instituicao_id !== ""
        ) {

            if (!idValido(instituicao_id)) {

                return res.status(400).json({
                    sucesso: false,
                    mensagem:
                        "O ID da instituição é inválido."
                });

            }


            const instituicao =
                await pool.query(
                    `SELECT id
                     FROM instituicoes
                     WHERE id = $1`,
                    [Number(instituicao_id)]
                );


            if (instituicao.rows.length === 0) {

                return res.status(404).json({
                    sucesso: false,
                    mensagem:
                        "Instituição não encontrada."
                });

            }

        }


        // ====================================
        // LOCALIZAR DOADOR
        // ====================================

        let resultadoDoador =
            await pool.query(
                `SELECT id
                 FROM doadores
                 WHERE LOWER(nome) = LOWER($1)
                 LIMIT 1`,
                [doador.trim()]
            );


        // ====================================
        // CRIAR DOADOR SE NÃO EXISTIR
        // ====================================

        let doadorId;


        if (resultadoDoador.rows.length === 0) {

            const novoDoador =
                await pool.query(
                    `INSERT INTO doadores
                    (
                        nome
                    )
                    VALUES
                    (
                        $1
                    )
                    RETURNING id`,
                    [doador.trim()]
                );


            doadorId =
                novoDoador.rows[0].id;

        } else {

            doadorId =
                resultadoDoador.rows[0].id;

        }


        // ====================================
        // CADASTRAR DOAÇÃO
        // ====================================

        const resultado =
            await pool.query(
                `INSERT INTO doacoes
                (
                    doador_id,
                    data_doacao,
                    tipo,
                    descricao,
                    quantidade,
                    valor,
                    instituicao_id
                )
                VALUES
                (
                    $1,
                    $2,
                    $3,
                    $4,
                    $5,
                    $6,
                    $7
                )
                RETURNING *`,
                [
                    doadorId,

                    data_doacao,

                    tipo.trim(),

                    descricao.trim(),

                    quantidade !== undefined &&
                    quantidade !== null &&
                    quantidade !== ""
                        ? Number(quantidade)
                        : null,

                    valor !== undefined &&
                    valor !== null &&
                    valor !== ""
                        ? Number(valor)
                        : null,

                    instituicao_id !== undefined &&
                    instituicao_id !== null &&
                    instituicao_id !== ""
                        ? Number(instituicao_id)
                        : null
                ]
            );


        // ====================================
        // REGISTRAR LOG
        // ====================================

        logger.info({
            evento: "doacao_cadastrada",
            doacao_id: resultado.rows[0].id,
            doador_id: doadorId,
            instituicao_id:
                instituicao_id
                    ? Number(instituicao_id)
                    : null
        });


        // ====================================
        // RESPOSTA
        // ====================================

        return res.status(201).json({

            sucesso: true,

            mensagem:
                "Doação cadastrada com sucesso!",

            doacao:
                resultado.rows[0]

        });


    } catch (erro) {

        logger.error({
            evento: "erro_cadastro_doacao",
            mensagem: erro.message
        });


        console.error(
            "Erro ao cadastrar doação:",
            erro
        );


        return res.status(500).json({

            sucesso: false,

            mensagem:
                "Erro ao cadastrar doação."

        });

    }

});


// ========================================
// LISTAR DOAÇÕES
// ========================================

app.get("/api/doacoes", async (req, res) => {

    try {

        const resultado = await pool.query(

            `SELECT
                doacoes.id,
                doacoes.data_doacao,
                doacoes.tipo,
                doacoes.descricao,
                doacoes.quantidade,
                doacoes.valor,
                doacoes.observacao,
                doadores.nome AS doador,
                instituicoes.nome AS instituicao

            FROM doacoes

            LEFT JOIN doadores
                ON doacoes.doador_id = doadores.id

            LEFT JOIN instituicoes
                ON doacoes.instituicao_id = instituicoes.id

            ORDER BY doacoes.id DESC`

        );


        // ====================================
        // REGISTRAR LOG
        // ====================================

        logger.info({
            evento: "doacoes_listadas",
            total_doacoes: resultado.rows.length
        });


        return res.json(resultado.rows);


    } catch (erro) {

        logger.error({
            evento: "erro_listagem_doacoes",
            mensagem: erro.message
        });


        console.error(
            "Erro ao buscar doações:",
            erro
        );


        return res.status(500).json({

            sucesso: false,

            mensagem:
                "Erro ao buscar doações."

        });

    }

});


// ========================================
// PROJETOS
// ========================================

// ========================================
// CADASTRAR PROJETO
// ========================================

app.post("/api/projetos", async (req, res) => {

    try {

        const {
            nome,
            descricao,
            instituicao_id,
            data_inicio,
            data_conclusao,
            status,
            valor,
            observacao
        } = req.body;


        // ====================================
        // VALIDAR NOME
        // ====================================

        if (!textoValido(nome, 2, 150)) {

            return res.status(400).json({
                sucesso: false,
                mensagem:
                    "O nome do projeto é obrigatório e deve possuir entre 2 e 150 caracteres."
            });

        }


        // ====================================
        // VALIDAR INSTITUIÇÃO
        // ====================================

        if (!idValido(instituicao_id)) {

            return res.status(400).json({
                sucesso: false,
                mensagem:
                    "É necessário selecionar uma instituição válida."
            });

        }


        // ====================================
        // VALIDAR DESCRIÇÃO
        // ====================================

        if (
            descricao !== undefined &&
            descricao !== null &&
            descricao !== "" &&
            !textoValido(descricao, 2, 1000)
        ) {

            return res.status(400).json({
                sucesso: false,
                mensagem:
                    "A descrição do projeto é inválida."
            });

        }


        // ====================================
        // VALIDAR DATA INICIAL
        // ====================================

        if (
            data_inicio !== undefined &&
            data_inicio !== null &&
            data_inicio !== "" &&
            !dataValida(data_inicio)
        ) {

            return res.status(400).json({
                sucesso: false,
                mensagem:
                    "A data de início do projeto é inválida."
            });

        }


        // ====================================
        // VALIDAR DATA DE CONCLUSÃO
        // ====================================

        if (
            data_conclusao !== undefined &&
            data_conclusao !== null &&
            data_conclusao !== "" &&
            !dataValida(data_conclusao)
        ) {

            return res.status(400).json({
                sucesso: false,
                mensagem:
                    "A data de conclusão do projeto é inválida."
            });

        }


        // ====================================
        // VALIDAR PERÍODO
        // ====================================

        if (
            data_inicio &&
            data_conclusao &&
            data_conclusao < data_inicio
        ) {

            return res.status(400).json({
                sucesso: false,
                mensagem:
                    "A data de conclusão não pode ser anterior à data de início."
            });

        }


        // ====================================
        // VALIDAR STATUS
        // ====================================

        const statusPermitidos = [
            "Planejado",
            "Em andamento",
            "Concluído",
            "Cancelado"
        ];

        const statusFinal =
            status || "Planejado";


        if (
            !statusPermitidos.includes(statusFinal)
        ) {

            return res.status(400).json({
                sucesso: false,
                mensagem:
                    "O status informado é inválido."
            });

        }


        // ====================================
        // VALIDAR VALOR
        // ====================================

        if (
            valor !== undefined &&
            valor !== null &&
            valor !== ""
        ) {

            if (!numeroValido(valor, true)) {

                return res.status(400).json({
                    sucesso: false,
                    mensagem:
                        "O valor do projeto não pode ser negativo."
                });

            }

        }


        // ====================================
        // VALIDAR OBSERVAÇÃO
        // ====================================

        if (
            observacao !== undefined &&
            observacao !== null &&
            observacao !== "" &&
            !textoValido(observacao, 2, 1000)
        ) {

            return res.status(400).json({
                sucesso: false,
                mensagem:
                    "A observação do projeto é inválida."
            });

        }


        // ====================================
        // VERIFICAR INSTITUIÇÃO
        // ====================================

        const instituicao =
            await pool.query(
                `SELECT id
                 FROM instituicoes
                 WHERE id = $1`,
                [Number(instituicao_id)]
            );


        if (instituicao.rows.length === 0) {

            return res.status(404).json({
                sucesso: false,
                mensagem:
                    "Instituição não encontrada."
            });

        }


        // ====================================
        // CADASTRAR PROJETO
        // ====================================

        const resultado =
            await pool.query(
                `INSERT INTO projetos
                (
                    nome,
                    descricao,
                    instituicao_id,
                    data_inicio,
                    data_conclusao,
                    status,
                    valor,
                    observacao
                )
                VALUES
                (
                    $1,
                    $2,
                    $3,
                    $4,
                    $5,
                    $6,
                    $7,
                    $8
                )
                RETURNING *`,
                [
                    nome.trim(),

                    descricao
                        ? descricao.trim()
                        : null,

                    Number(instituicao_id),

                    data_inicio || null,

                    data_conclusao || null,

                    statusFinal,

                    valor !== undefined &&
                    valor !== null &&
                    valor !== ""
                        ? Number(valor)
                        : null,

                    observacao
                        ? observacao.trim()
                        : null
                ]
            );


        // ====================================
        // REGISTRAR LOG
        // ====================================

        logger.info({
            evento: "projeto_cadastrado",
            projeto_id: resultado.rows[0].id,
            instituicao_id: Number(instituicao_id),
            status: statusFinal
        });


        // ====================================
        // RESPOSTA
        // ====================================

        return res.status(201).json({

            sucesso: true,

            mensagem:
                "Projeto cadastrado com sucesso!",

            projeto:
                resultado.rows[0]

        });


    } catch (erro) {

        logger.error({
            evento: "erro_cadastro_projeto",
            mensagem: erro.message
        });

        console.error(
            "Erro ao cadastrar projeto:",
            erro
        );

        return res.status(500).json({

            sucesso: false,

            mensagem:
                "Erro ao cadastrar projeto."

        });

    }

});


// ========================================
// LISTAR PROJETOS
// ========================================

app.get("/api/projetos", async (req, res) => {

    try {

        const resultado =
            await pool.query(
                `SELECT
                    projetos.id,
                    projetos.nome,
                    projetos.descricao,
                    projetos.data_inicio,
                    projetos.data_conclusao,
                    projetos.status,
                    projetos.valor,
                    projetos.observacao,
                    instituicoes.nome AS instituicao

                 FROM projetos

                 LEFT JOIN instituicoes
                    ON projetos.instituicao_id =
                       instituicoes.id

                 ORDER BY projetos.id DESC`
            );


        // ====================================
        // REGISTRAR LOG
        // ====================================

        logger.info({
            evento: "projetos_listados",
            total_projetos: resultado.rows.length
        });


        return res.json(
            resultado.rows
        );


    } catch (erro) {

        logger.error({
            evento: "erro_listagem_projetos",
            mensagem: erro.message
        });

        console.error(
            "Erro ao buscar projetos:",
            erro
        );

        return res.status(500).json({

            sucesso: false,

            mensagem:
                "Erro ao buscar projetos."

        });

    }

});

// ========================================
// BUSCAR PROJETO POR ID
// ========================================

app.get("/api/projetos/:id", async (req, res) => {

    try {

        const { id } =
            req.params;


        const resultado =
            await pool.query(
                `SELECT
                    projetos.id,
                    projetos.instituicao_id,
                    projetos.nome,
                    projetos.descricao,
                    projetos.data_inicio,
                    projetos.data_conclusao,
                    projetos.status,
                    projetos.valor,
                    projetos.observacao,
                    projetos.criado_em,
                    instituicoes.nome AS instituicao

                 FROM projetos

                 LEFT JOIN instituicoes
                    ON projetos.instituicao_id =
                       instituicoes.id

                 WHERE projetos.id = $1`,
                [id]
            );


        // ====================================
        // PROJETO NÃO ENCONTRADO
        // ====================================

        if (
            resultado.rows.length === 0
        ) {

            return res.status(404).json({

                sucesso: false,

                mensagem:
                    "Projeto não encontrado."

            });

        }


        // ====================================
        // REGISTRAR LOG
        // ====================================

        logger.info({
            evento: "projeto_consultado",
            projeto_id: Number(id)
        });


        // ====================================
        // RESPOSTA
        // ====================================

        return res.json({

            sucesso: true,

            dados:
                resultado.rows[0]

        });


    } catch (erro) {

        logger.error({
            evento: "erro_consulta_projeto",
            projeto_id:
                req.params?.id
                    ? Number(req.params.id)
                    : null,
            mensagem: erro.message
        });

        console.error(
            "Erro ao buscar projeto:",
            erro
        );

        return res.status(500).json({

            sucesso: false,

            mensagem:
                "Erro ao buscar projeto."

        });

    }

});


// ========================================
// EDITAR PROJETO
// ========================================

app.put("/api/projetos/:id", async (req, res) => {

    try {

        const { id } = req.params;

        const {
            nome,
            descricao,
            instituicao_id,
            data_inicio,
            data_conclusao,
            status,
            valor,
            observacao
        } = req.body;


        // ====================================
        // VALIDAR ID
        // ====================================

        if (!idValido(id)) {

            return res.status(400).json({
                sucesso: false,
                mensagem:
                    "O ID do projeto é inválido."
            });

        }


        // ====================================
        // VALIDAR NOME
        // ====================================

        if (!textoValido(nome, 2, 150)) {

            return res.status(400).json({
                sucesso: false,
                mensagem:
                    "O nome do projeto é obrigatório e deve possuir entre 2 e 150 caracteres."
            });

        }


        // ====================================
        // VALIDAR INSTITUIÇÃO
        // ====================================

        if (!idValido(instituicao_id)) {

            return res.status(400).json({
                sucesso: false,
                mensagem:
                    "É necessário selecionar uma instituição válida."
            });

        }


        // ====================================
        // VALIDAR DESCRIÇÃO
        // ====================================

        if (
            descricao !== undefined &&
            descricao !== null &&
            descricao !== "" &&
            !textoValido(descricao, 2, 1000)
        ) {

            return res.status(400).json({
                sucesso: false,
                mensagem:
                    "A descrição do projeto é inválida."
            });

        }


        // ====================================
        // VALIDAR DATA INICIAL
        // ====================================

        if (
            data_inicio !== undefined &&
            data_inicio !== null &&
            data_inicio !== "" &&
            !dataValida(data_inicio)
        ) {

            return res.status(400).json({
                sucesso: false,
                mensagem:
                    "A data de início do projeto é inválida."
            });

        }


        // ====================================
        // VALIDAR DATA DE CONCLUSÃO
        // ====================================

        if (
            data_conclusao !== undefined &&
            data_conclusao !== null &&
            data_conclusao !== "" &&
            !dataValida(data_conclusao)
        ) {

            return res.status(400).json({
                sucesso: false,
                mensagem:
                    "A data de conclusão do projeto é inválida."
            });

        }


        // ====================================
        // VALIDAR PERÍODO
        // ====================================

        if (
            data_inicio &&
            data_conclusao &&
            data_conclusao < data_inicio
        ) {

            return res.status(400).json({
                sucesso: false,
                mensagem:
                    "A data de conclusão não pode ser anterior à data de início."
            });

        }


        // ====================================
        // VALIDAR STATUS
        // ====================================

        const statusPermitidos = [
            "Planejado",
            "Em andamento",
            "Concluído",
            "Cancelado"
        ];

        const statusFinal =
            status || "Planejado";


        if (
            !statusPermitidos.includes(statusFinal)
        ) {

            return res.status(400).json({
                sucesso: false,
                mensagem:
                    "O status informado é inválido."
            });

        }


        // ====================================
        // VALIDAR VALOR
        // ====================================

        if (
            valor !== undefined &&
            valor !== null &&
            valor !== ""
        ) {

            if (!numeroValido(valor, true)) {

                return res.status(400).json({
                    sucesso: false,
                    mensagem:
                        "O valor do projeto não pode ser negativo."
                });

            }

        }


        // ====================================
        // VALIDAR OBSERVAÇÃO
        // ====================================

        if (
            observacao !== undefined &&
            observacao !== null &&
            observacao !== "" &&
            !textoValido(observacao, 2, 1000)
        ) {

            return res.status(400).json({
                sucesso: false,
                mensagem:
                    "A observação do projeto é inválida."
            });

        }


        // ====================================
        // VERIFICAR SE O PROJETO EXISTE
        // ====================================

        const projetoExistente =
            await pool.query(
                `SELECT id
                 FROM projetos
                 WHERE id = $1`,
                [Number(id)]
            );


        if (
            projetoExistente.rows.length === 0
        ) {

            return res.status(404).json({
                sucesso: false,
                mensagem:
                    "Projeto não encontrado."
            });

        }


        // ====================================
        // VERIFICAR INSTITUIÇÃO
        // ====================================

        const instituicao =
            await pool.query(
                `SELECT id
                 FROM instituicoes
                 WHERE id = $1`,
                [Number(instituicao_id)]
            );


        if (
            instituicao.rows.length === 0
        ) {

            return res.status(404).json({
                sucesso: false,
                mensagem:
                    "Instituição não encontrada."
            });

        }


        // ====================================
        // ATUALIZAR PROJETO
        // ====================================

        const resultado =
            await pool.query(
                `UPDATE projetos

                 SET
                    nome = $1,
                    descricao = $2,
                    instituicao_id = $3,
                    data_inicio = $4,
                    data_conclusao = $5,
                    status = $6,
                    valor = $7,
                    observacao = $8

                 WHERE id = $9

                 RETURNING *`,
                [
                    nome.trim(),

                    descricao
                        ? descricao.trim()
                        : null,

                    Number(instituicao_id),

                    data_inicio || null,

                    data_conclusao || null,

                    statusFinal,

                    valor !== undefined &&
                    valor !== null &&
                    valor !== ""
                        ? Number(valor)
                        : null,

                    observacao
                        ? observacao.trim()
                        : null,

                    Number(id)
                ]
            );


        // ====================================
        // REGISTRAR LOG
        // ====================================

        logger.info({
            evento: "projeto_atualizado",
            projeto_id: resultado.rows[0].id,
            instituicao_id: Number(instituicao_id),
            status: statusFinal
        });


        // ====================================
        // RESPOSTA
        // ====================================

        return res.json({

            sucesso: true,

            mensagem:
                "Projeto atualizado com sucesso!",

            projeto:
                resultado.rows[0]

        });


    } catch (erro) {

        logger.error({
            evento: "erro_edicao_projeto",
            projeto_id:
                req.params?.id
                    ? Number(req.params.id)
                    : null,
            mensagem: erro.message
        });

        console.error(
            "Erro ao editar projeto:",
            erro
        );

        return res.status(500).json({

            sucesso: false,

            mensagem:
                "Erro ao editar projeto."

        });

    }

});

// ========================================
// EXCLUIR PROJETO
// ========================================

app.delete("/api/projetos/:id", async (req, res) => {

    try {

        const { id } =
            req.params;


        // ====================================
        // VALIDAR ID
        // ====================================

        if (!idValido(id)) {

            return res.status(400).json({

                sucesso: false,

                mensagem:
                    "O ID do projeto é inválido."

            });

        }


        // ====================================
        // VERIFICAR SE EXISTE
        // ====================================

        const existente =
            await pool.query(
                `SELECT
                    id,
                    nome
                 FROM projetos
                 WHERE id = $1`,
                [Number(id)]
            );


        if (
            existente.rows.length === 0
        ) {

            return res.status(404).json({

                sucesso: false,

                mensagem:
                    "Projeto não encontrado."

            });

        }


        const projeto =
            existente.rows[0];


        // ====================================
        // EXCLUIR
        // ====================================

        await pool.query(
            `DELETE FROM projetos
             WHERE id = $1`,
            [Number(id)]
        );


        // ====================================
        // REGISTRAR LOG
        // ====================================

        logger.info({
            evento: "projeto_excluido",
            projeto_id: projeto.id
        });


        // ====================================
        // RESPOSTA
        // ====================================

        return res.json({

            sucesso: true,

            mensagem:
                "Projeto excluído com sucesso!"

        });


    } catch (erro) {

        logger.error({
            evento: "erro_exclusao_projeto",
            projeto_id:
                req.params?.id
                    ? Number(req.params.id)
                    : null,
            mensagem: erro.message
        });

        console.error(
            "Erro ao excluir projeto:",
            erro
        );

        return res.status(500).json({

            sucesso: false,

            mensagem:
                "Erro ao excluir projeto."

        });

    }

});

// ========================================
// RELATÓRIO DE DOAÇÕES
// ========================================

app.get("/api/relatorios/doacoes", async (req, res) => {

    try {

        const {
            data_inicio,
            data_fim
        } = req.query;


        let consulta = `

            SELECT

                doacoes.id,

                doacoes.data_doacao,

                doacoes.tipo,

                doacoes.descricao,

                doacoes.quantidade,

                doacoes.valor,

                doacoes.observacao,

                doadores.nome AS doador,

                instituicoes.nome AS instituicao

            FROM doacoes

            LEFT JOIN doadores
                ON doacoes.doador_id = doadores.id

            LEFT JOIN instituicoes
                ON doacoes.instituicao_id = instituicoes.id

            WHERE 1 = 1

        `;


        const valores = [];

        let contador = 1;


        // ====================================
        // FILTRO DATA INICIAL
        // ====================================

        if (data_inicio) {

            consulta += `
                AND doacoes.data_doacao >= $${contador}
            `;

            valores.push(data_inicio);

            contador++;

        }


        // ====================================
        // FILTRO DATA FINAL
        // ====================================

        if (data_fim) {

            consulta += `
                AND doacoes.data_doacao <= $${contador}
            `;

            valores.push(data_fim);

            contador++;

        }


        // ====================================
        // ORDENAR
        // ====================================

        consulta += `

            ORDER BY
                doacoes.data_doacao DESC,
                doacoes.id DESC

        `;


        // ====================================
        // EXECUTAR CONSULTA
        // ====================================

        const resultado =
            await pool.query(
                consulta,
                valores
            );


        // ====================================
        // FORMATAR DATAS
        // ====================================

        const dadosFormatados =
            resultado.rows.map(doacao => {

                let dataFormatada = null;


                if (doacao.data_doacao) {

                    const data =
                        new Date(
                            doacao.data_doacao
                        );


                    const dia =
                        String(
                            data.getUTCDate()
                        ).padStart(2, "0");


                    const mes =
                        String(
                            data.getUTCMonth() + 1
                        ).padStart(2, "0");


                    const ano =
                        data.getUTCFullYear();


                    dataFormatada =
                        `${dia}/${mes}/${ano}`;

                }


                return {

                    ...doacao,

                    data_doacao:
                        dataFormatada

                };

            });


        // ====================================
        // RETORNAR RESULTADO
        // ====================================

        res.json({

            sucesso: true,

            total:
                dadosFormatados.length,

            dados:
                dadosFormatados

        });


    } catch (erro) {

        console.error(erro);

        res.status(500).json({

            sucesso: false,

            mensagem:
                "Erro ao gerar relatório de doações."

        });

    }

});

// ========================================
// RESUMO DO RELATÓRIO DE DOAÇÕES
// ========================================

app.get("/api/relatorios/resumo", async (req, res) => {

    try {

        const {
            data_inicio,
            data_fim
        } = req.query;


        let consulta = `

            SELECT

                COUNT(*) AS total_doacoes,

                COUNT(
                    DISTINCT instituicao_id
                ) AS total_instituicoes,

                COALESCE(
                    SUM(quantidade),
                    0
                ) AS quantidade_total,

                COALESCE(
                    SUM(valor),
                    0
                ) AS valor_total

            FROM doacoes

            WHERE 1 = 1

        `;


        const valores = [];

        let contador = 1;


        // ====================================
        // FILTRO DATA INICIAL
        // ====================================

        if (data_inicio) {

            consulta += `
                AND data_doacao >= $${contador}
            `;

            valores.push(data_inicio);

            contador++;

        }


        // ====================================
        // FILTRO DATA FINAL
        // ====================================

        if (data_fim) {

            consulta += `
                AND data_doacao <= $${contador}
            `;

            valores.push(data_fim);

            contador++;

        }


        // ====================================
        // EXECUTAR CONSULTA
        // ====================================

        const resultado =
            await pool.query(
                consulta,
                valores
            );


        const resumo =
            resultado.rows[0];


        // ====================================
        // RETORNAR RESUMO
        // ====================================

        res.json({

            sucesso: true,

            resumo: {

                total_doacoes:
                    Number(
                        resumo.total_doacoes
                    ),

                total_instituicoes:
                    Number(
                        resumo.total_instituicoes
                    ),

                quantidade_total:
                    Number(
                        resumo.quantidade_total
                    ),

                valor_total:
                    Number(
                        resumo.valor_total
                    )

            }

        });


    } catch (erro) {

        console.error(erro);

        res.status(500).json({

            sucesso: false,

            mensagem:
                "Erro ao gerar resumo do relatório."

        });

    }

});

// ========================================
// DASHBOARD
// ========================================

app.get("/api/dashboard", async (req, res) => {

    try {

        // Total de instituições

        const instituicoes =
            await pool.query(

                `SELECT
                    COUNT(*) AS total
                 FROM instituicoes`

            );


        // Total de doações

        const doacoes =
            await pool.query(

                `SELECT
                    COUNT(*) AS total
                 FROM doacoes`

            );


        // Total de itens recebidos

        const itens =
            await pool.query(

                `SELECT

                    COALESCE(
                        SUM(quantidade),
                        0
                    ) AS total

                 FROM doacoes`

            );


        // Valor total das doações

        const valorDoacoes =
            await pool.query(

                `SELECT

                    COALESCE(
                        SUM(valor),
                        0
                    ) AS total

                 FROM doacoes`

            );


        // Doações por tipo

        const tipos =
            await pool.query(

                `SELECT

                    tipo,

                    COUNT(*) AS quantidade,

                    COALESCE(
                        SUM(quantidade),
                        0
                    ) AS total_itens

                 FROM doacoes

                 GROUP BY tipo

                 ORDER BY quantidade DESC`

            );


        // Total de projetos

        const projetos =
            await pool.query(

                `SELECT
                    COUNT(*) AS total
                 FROM projetos`

            );


        res.json({

            instituicoes:
                Number(
                    instituicoes.rows[0].total
                ),

            doacoes:
                Number(
                    doacoes.rows[0].total
                ),

            itens:
                Number(
                    itens.rows[0].total
                ),

            valor:
                Number(
                    valorDoacoes.rows[0].total
                ),

            projetos:
                Number(
                    projetos.rows[0].total
                ),

            tipos:
                tipos.rows

        });


    } catch (erro) {

        console.error(erro);

        res.status(500).json({

            sucesso: false,

            mensagem:
                "Erro ao carregar dados do dashboard."

        });

    }

});


// ========================================
// INICIAR SERVIDOR
// ========================================

app.listen(PORT, "0.0.0.0", () => {

    console.log(
        `Servidor funcionando na porta ${PORT}`
    );

});

// ========================================
// RESUMO DO DASHBOARD
// ========================================

app.get("/api/dashboard/resumo", async (req, res) => {

    try {

        // ====================================
        // TOTAL DE DOAÇÕES
        // ====================================

        const doacoes =
            await pool.query(`
                SELECT COUNT(*) AS total
                FROM doacoes
            `);


        // ====================================
        // INSTITUIÇÕES ATENDIDAS
        // ====================================

        const instituicoes =
            await pool.query(`
                SELECT COUNT(DISTINCT instituicao_id) AS total
                FROM doacoes
                WHERE instituicao_id IS NOT NULL
            `);


        // ====================================
        // TOTAL DE PROJETOS
        // ====================================

        const projetos =
            await pool.query(`
                SELECT COUNT(*) AS total
                FROM projetos
            `);


        // ====================================
        // RETORNO
        // ====================================

        res.json({

            sucesso: true,

            dados: {

                total_doacoes:
                    Number(
                        doacoes.rows[0].total
                    ),

                total_instituicoes:
                    Number(
                        instituicoes.rows[0].total
                    ),

                total_projetos:
                    Number(
                        projetos.rows[0].total
                    )

            }

        });


    } catch (erro) {

        console.error(erro);

        res.status(500).json({

            sucesso: false,

            mensagem:
                "Erro ao carregar resumo do dashboard."

        });

    }

});