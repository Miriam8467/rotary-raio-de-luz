// ========================================
// RELATÓRIOS DE DOAÇÕES
// ========================================


// ========================================
// ELEMENTOS DA PÁGINA
// ========================================

const formRelatorio =
    document.getElementById("formRelatorio");

const resultadoRelatorio =
    document.getElementById("resultadoRelatorio");

const totalRegistros =
    document.getElementById("totalRegistros");


// ========================================
// ELEMENTOS DO RESUMO
// ========================================

const resumoDoacoes =
    document.getElementById("resumoDoacoes");

const resumoInstituicoes =
    document.getElementById("resumoInstituicoes");

const resumoQuantidade =
    document.getElementById("resumoQuantidade");

const resumoValor =
    document.getElementById("resumoValor");


// ========================================
// FORMULÁRIO
// ========================================

formRelatorio.addEventListener(
    "submit",
    async function (evento) {

        evento.preventDefault();


        // ====================================
        // PEGAR DATAS
        // ====================================

        const dataInicio =
            document.getElementById("data_inicio").value;

        const dataFim =
            document.getElementById("data_fim").value;


        // ====================================
        // VALIDAR DATAS
        // ====================================

        if (!dataInicio || !dataFim) {

            alert(
                "Informe a data inicial e a data final."
            );

            return;
        }


        if (dataInicio > dataFim) {

            alert(
                "A data inicial não pode ser maior que a data final."
            );

            return;
        }


        // ====================================
        // MOSTRAR CARREGAMENTO
        // ====================================

        resultadoRelatorio.innerHTML = `
            <p class="info">
                Consultando relatório...
            </p>
        `;

        totalRegistros.textContent =
            "Consultando...";


        // ====================================
        // MONTAR PARÂMETROS
        // ====================================

        const parametros =
            `?data_inicio=${encodeURIComponent(dataInicio)}&data_fim=${encodeURIComponent(dataFim)}`;


        try {


            // ====================================
            // BUSCAR DOAÇÕES
            // ====================================

            const respostaDoacoes =
                await fetch(
                    `/api/relatorios/doacoes${parametros}`
                );


            if (!respostaDoacoes.ok) {

                throw new Error(
                    "Erro ao consultar as doações."
                );
            }


            const dadosDoacoes =
                await respostaDoacoes.json();


            // ====================================
            // BUSCAR RESUMO
            // ====================================

            const respostaResumo =
                await fetch(
                    `/api/relatorios/resumo${parametros}`
                );


            if (!respostaResumo.ok) {

                throw new Error(
                    "Erro ao consultar o resumo."
                );
            }


            const dadosResumo =
                await respostaResumo.json();


            // ====================================
            // VERIFICAR RESPOSTAS
            // ====================================

            if (!dadosDoacoes.sucesso) {

                throw new Error(
                    dadosDoacoes.mensagem ||
                    "Erro ao consultar doações."
                );
            }


            if (!dadosResumo.sucesso) {

                throw new Error(
                    dadosResumo.mensagem ||
                    "Erro ao consultar resumo."
                );
            }


            // ====================================
            // ATUALIZAR RESUMO
            // ====================================

            const resumo =
                dadosResumo.resumo || {};


            resumoDoacoes.textContent =
                Number(
                    resumo.total_doacoes || 0
                );


            resumoInstituicoes.textContent =
                Number(
                    resumo.total_instituicoes || 0
                );


            resumoQuantidade.textContent =
                Number(
                    resumo.quantidade_total || 0
                );


            resumoValor.textContent =
                Number(
                    resumo.valor_total || 0
                ).toLocaleString(
                    "pt-BR",
                    {
                        style: "currency",
                        currency: "BRL"
                    }
                );


            // ====================================
            // ATUALIZAR TOTAL DE REGISTROS
            // ====================================

            const total =
                Number(
                    dadosDoacoes.total || 0
                );


            totalRegistros.textContent =
                `${total} registro(s)`;


            // ====================================
            // VERIFICAR SE EXISTEM REGISTROS
            // ====================================

            if (
                total === 0 ||
                !Array.isArray(dadosDoacoes.dados) ||
                dadosDoacoes.dados.length === 0
            ) {

                resultadoRelatorio.innerHTML = `

                    <p class="info">
                        Nenhuma doação encontrada
                        para o período informado.
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

                            <th>Data</th>

                            <th>Doador</th>

                            <th>Instituição</th>

                            <th>Tipo</th>

                            <th>Descrição</th>

                            <th>Quantidade</th>

                            <th>Valor</th>

                        </tr>

                    </thead>

                    <tbody>

            `;


            // ====================================
            // PREENCHER TABELA
            // ====================================

            dadosDoacoes.dados.forEach(
                function (doacao) {


                    // -----------------------------
                    // DATA
                    // -----------------------------

                    let data = "-";


                    if (doacao.data_doacao) {

                        const dataObj =
                            new Date(
                                doacao.data_doacao
                            );


                        if (
                            !isNaN(
                                dataObj.getTime()
                            )
                        ) {

                            data =
                                dataObj.toLocaleDateString(
                                    "pt-BR"
                                );
                        }
                    }


                    // -----------------------------
                    // VALOR
                    // -----------------------------

                    const valor =
                        Number(
                            doacao.valor || 0
                        ).toLocaleString(
                            "pt-BR",
                            {
                                style: "currency",
                                currency: "BRL"
                            }
                        );


                    // -----------------------------
                    // LINHA
                    // -----------------------------

                    tabela += `

                        <tr>

                            <td>
                                ${data}
                            </td>

                            <td>
                                ${doacao.doador || "-"}
                            </td>

                            <td>
                                ${doacao.instituicao || "-"}
                            </td>

                            <td>
                                ${doacao.tipo || "-"}
                            </td>

                            <td>
                                ${doacao.descricao || "-"}
                            </td>

                            <td>
                                ${doacao.quantidade ?? "-"}
                            </td>

                            <td>
                                ${valor}
                            </td>

                        </tr>

                    `;
                }
            );


            // ====================================
            // FINALIZAR TABELA
            // ====================================

            tabela += `

                    </tbody>

                </table>

            `;


            // ====================================
            // MOSTRAR RESULTADO
            // ====================================

            resultadoRelatorio.innerHTML =
                tabela;


        } catch (erro) {

            console.error(
                "Erro no relatório:",
                erro
            );


            totalRegistros.textContent =
                "Erro";


            resultadoRelatorio.innerHTML = `

                <p class="info">
                    Ocorreu um erro ao consultar
                    o relatório.
                </p>

            `;
        }

    }
);