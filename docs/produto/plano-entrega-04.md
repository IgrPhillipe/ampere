# Plano da Entrega 04 e do Status Report 2: Sprints 4 a 10

> **Prazos:** Entrega 04 de POO na segunda-feira, 09/11/2026, com a apresentação final de 09 a 13/11. Status Report 2 de Projetos 3 no sábado, 05/12/2026.
> **Regra:** o código de cada ciclo fecha uma semana antes da entrega. A última semana é só de preparação: README, POST-IT, print das issues, screencasts, validação com o monitor e com o cliente e ensaio. A correção de POO usa o conteúdo do GitHub logo após o prazo.
> **Histórias:** US07, US08, US09, US12, US18 e US20 na Entrega 04. US10, US11, US13 a US17, US19, US23 e US24 no SR2.
> Histórias completas em [`user-stories.md`](user-stories.md). Critérios em [`../cronograma-poo.md`](../cronograma-poo.md) e [`../cronograma-projetos3.md`](../cronograma-projetos3.md).
> Issues no [milestone Entrega 03](https://github.com/IgrPhillipe/ampere/milestone/2), no [milestone Entrega 04](https://github.com/IgrPhillipe/ampere/milestone/3) e no [milestone Status Report 2](https://github.com/IgrPhillipe/ampere/milestone/4), #88 a #154.

## Ciclos

| Sprint | Período | Tipo | Escopo | Milestone |
| :--- | :--- | :--- | :--- | :--- |
| Sprint 4 | 04/10 a 18/10 | Preparação da Entrega 03 e início do desenvolvimento | README, screencasts, monitor e retro da Entrega 03. US07, US20, restrição por dono e telas no Figma | Entrega 03 e Entrega 04 |
| Sprint 5 | 19/10 a 25/10 | Desenvolvimento | US09 e US18 | Entrega 04 |
| Sprint 6 | 26/10 a 01/11 | Desenvolvimento. **Code freeze em 01/11** | US08 e US12. Front da US10 e da US11, `AT04-US11` e telas do SR2 no Figma | Entrega 04 e Status Report 2 |
| Sprint 7 | 02/11 a 08/11 | Preparação da Entrega 04 e início do SR2 | Monitor, cliente, POST-IT, print, screencasts, avaliação individual e ensaio da apresentação. US16 e back da US13, US14, US19 e US23 | Entrega 04 e Status Report 2 |
| Sprint 8 | 09/11 a 15/11 | Desenvolvimento | Front da US13, US14 e US23. Back da US15, US17 e US24 | Status Report 2 |
| Sprint 9 | 16/11 a 22/11 | Desenvolvimento. **Code freeze em 22/11** | Front da US15, US17, US19 e US24. Ajustes da validação com o cliente | Status Report 2 |
| Sprint 10 | 23/11 a 04/12 | Preparação do SR2 | Material e ensaio do SR2 e relatório de IA | Status Report 2 |

**Ritmo:** sem aula em 31/10, as Sprints 6 e 7 recebem parte do SR2: 8 tarefas na Sprint 6, 6 na 7, 6 na 8 e 4 na 9, que guarda folga para os ajustes da validação com o cliente.

**Sprint 7:** quem não está na preparação desenvolve o SR2 em PR. O merge na main vai até quarta, 04/11, antes da revisão com o monitor e dos screencasts. PR pronto depois disso espera até 10/11, depois da correção da Entrega 04.

## Calendário

| Data | Marco | Disciplina |
| :--- | :--- | :--- |
| Sex 16/10 | Entrega 03 revisada com o monitor | POO |
| Sáb 17/10 | Retro do primeiro ciclo no board e print no Google Sites | Projetos 3 |
| Seg 19/10 | **Entrega 03** | POO |
| Sáb 24/10 | GitHub e Google Sites atualizados com os ajustes pós-retro | Projetos 3 |
| Dom 01/11 | Code freeze da Entrega 04 | |
| Qui 05/11 | Entrega 04 revisada com o monitor | POO |
| Sáb 07/11 | Validação com o cliente e registro do feedback no Google Sites | Projetos 3 |
| Seg 09/11 | **Entrega 04** | POO |
| 09 a 13/11 | **Apresentação final**, 8 minutos, time inteiro presente | POO |
| Sáb 14/11 | Rec'n Play, atividade assíncrona | Projetos 3 |
| Sáb 21/11 | Retrospectiva do projeto e material parcial do SR2 | Projetos 3 |
| Dom 22/11 | Code freeze do SR2 | |
| Sáb 28/11 | Relatório de uso de IA e ajustes do SR2 | Projetos 3 |
| Sáb 05/12 | **Status Report 2** | Projetos 3 |
| Sáb 12/12 | Mostra TechDesign | Projetos 3 |

Feriados sem aula: 09, 10 e 12/10, 31/10, 02/11, 15/11 e 20/11.

---

## Organização das Issues

O padrão é o mesmo das Entregas 02 e 03: uma issue por história, que funciona como épico, e duas tarefas por história, uma de **Backend** e uma de **Frontend**. A US20 tem só a tarefa de front, porque o `DELETE /api/projects/{id}` já existe e apaga em cascata.

**Milestones:** Gestão da Entrega 03 no **Entrega 03**. Histórias e Gestão das Sprints 4 a 7 no **Entrega 04**, com vencimento em 09/11. Sprints 8 a 10 no **Status Report 2**, com vencimento em 05/12.

**Labels:** `Sprint 4` a `Sprint 10`, `US07` a `US20`, `US23` e `US24`.

**Tarefas de código abertas sem responsável.** Cada pessoa se atribui ao assumir a tarefa.

**Sem MSW.** Os services novos falam direto com a API. O contrato de cada endpoint fica escrito na issue de back, que entra primeiro em cada sprint. O front começa pela interface sobre o contrato e integra assim que o endpoint chega à main.

**Dependências:**

- O `AT17-INFRA` abre a Sprint 4. Ele define quem lê e quem escreve cada projeto.
- O `AT19-INFRA` precisa estar pronto antes do front da US09, na Sprint 5.
- A US07 abre o ciclo: a US08, a US09 e os painéis (US16 e US17) leem os apontamentos e as decisões que ela grava.
- Na Sprint 6, o back da US08 entra antes do back da US12, que lê os mesmos eventos.
- O `AT26-INFRA` entrega o painel do projetista (US16) até 01/11 e as demais telas até 08/11.
- A US23 entra antes da US24, que mostra a carga por analista e os municípios sem analista.

**Total:** 61 issues abertas entre #88 e #154: 6 na Entrega 03, 27 na Entrega 04 e 28 no Status Report 2. As #142 a #147, da duplicação de projeto e dos documentos complementares, foram fechadas fora do escopo. A US23 (#191) e a US24 (#192), com as tarefas #193 a #196, entraram em 24/10 no Status Report 2. Também em 24/10: `AT32-INFRA` a `AT34-INFRA`, `AT03-US18`, `AT04-US18`, `AT03-US03`, `AT04-US05` e `AT05-US05` na Entrega 04, e `AT03-US11` e `AT04-US11` no Status Report 2.

---

# Gestão

## Entrega 03

### `AT12-INFRA: Seção "Entrega 03" no README com os POST-IT [Gestão]` (#88)
`Sprint 4`, `Gestão`

- [ ] POST-IT da US05 e da US06 na seção "Entrega 03". Os da US03 e da US04 já estão lá
- [ ] Trocar a frase "US05 e US06 estão em desenvolvimento na Sprint 3"
- [ ] Print das GitHub Issues

### `AT13-INFRA: Screencast do sistema rodando [Gestão]` (#89)
`Sprint 4`, `Gestão`

Vídeo no YouTube, com áudio ou legenda, seguindo o roteiro do [`plano-entrega-03.md`](plano-entrega-03.md). Prazo: domingo, 18/10.

### `AT14-INFRA: Screencast da explicação do código [Gestão]` (#90)
`Sprint 4`, `Gestão`

Vídeo no YouTube, seguindo o roteiro do [`plano-entrega-03.md`](plano-entrega-03.md). Prazo: domingo, 18/10.

### `AT15-INFRA: Retrospectiva do primeiro ciclo [Gestão]` (#91)
`Sprint 4`, `Gestão`

Entregável de Projetos 3 do sábado, 17/10: feedback do Status Report 1, retro no board do Trello e print da retro no Google Sites.

### `AT16-INFRA: Abrir as GitHub Issues da Entrega 04 e do Status Report 2 [Gestão]` (#92)
`Sprint 4`, `Gestão`

Concluída: milestones, labels e as issues deste plano.

### `AT29-INFRA: Validar a Entrega 03 com o monitor [Gestão]` (#152)
`Sprint 4`, `Gestão`

Revisar com o monitor, até sexta, 16/10, o README, a seção "Entrega 03", o print das issues e os dois screencasts.

## Entrega 04

### `AT17-INFRA: Restringir cada projeto ao seu dono [Backend]` (#93)
`Sprint 4`, `Backend`, `Infra`

O `Project` guarda o `owner` desde o #86, mas nenhum service o confere. Qualquer usuário autenticado lê, altera, envia e exclui o projeto de outro pelo id.

- [ ] Para o papel `user`: listagem, contadores e busca filtram pelo dono. Leitura e escrita de projeto de outro dono devolvem 404
- [ ] Para o papel `reviewer`: leitura de todos os projetos enviados e nenhuma escrita nos endpoints do projetista; o `admin` lê e escreve todos
- [ ] A regra vale para projeto, grupos, cálculo, documentos, memorial e envio
- [ ] Projetos do seed recebem um dono
- [ ] Testes de acesso entre dois projetistas e entre projetista e analista

### `AT32-INFRA: Tabelas normativas em modo leitura para o analista [Backend/Frontend]` (#179)
`Sprint 5`, `Backend`, `Frontend`, `Infra`

- [x] `GET /normative-tables`, `GET /normative-tables/{id}` e `GET /normative-tables/codes` liberados para `reviewer`; escrita só do `admin`
- [x] Tela "Tabelas Normativas" em modo leitura para o analista, com o item no menu
- [x] Testes de acesso por papel e da tela em modo leitura

### `AT33-INFRA: Data de envio dos projetos antigos do seed [Backend]` (#180)
`Sprint 5`, `Backend`, `Infra`

- [x] `submittedAt` preenchido nos projetos enviados do seed que não tinham a data
- [x] Seed novo grava `submittedAt` em todo projeto enviado

### `AT34-INFRA: CORS do ambiente local para POST, PUT e DELETE [Backend/Frontend]` (#185)
`Sprint 5`, `Backend`, `Frontend`, `Infra`, `bug`

- [x] O proxy do Vite remove o `Origin`, e o ambiente local deixa de recusar as escritas com 403

### `AT19-INFRA: Desenhar no Figma as telas da análise e da correção [Gestão]` (#112)
`Sprint 5`, `Gestão`

- [ ] Tela de correção e reenvio do projetista (US09), que não tem protótipo
- [ ] Selo de apontamento dentro das etapas H3 e H4

### `AT18-INFRA: Atualizar o Google Sites com os ajustes pós-retro [Gestão]` (#111)
`Sprint 5`, `Gestão`

Entregável de Projetos 3 do sábado, 24/10.

### `AT21-INFRA: Seção "Entrega 04" no README com os POST-IT [Gestão]` (#114)
`Sprint 7`, `Gestão`

- [ ] POST-IT da US07, US08, US09, US12, US18 e US20 na seção "Entrega 04"
- [ ] Print das GitHub Issues
- [ ] Tabela de Entregas: marcar a Entrega 03 como "Finalizada"

### `AT22-INFRA: Screencast final do sistema [Gestão]` (#115)
`Sprint 7`, `Gestão`

Vídeo no YouTube, com áudio ou legenda. Roteiro:
1. Como analista, abrir a fila, clicar em "Analisar", abrir um anexo e transformar um alerta em apontamento bloqueante (US07).
2. Reprovar com apontamentos.
3. Como projetista, abrir o projeto pela listagem com "Corrigir", ver o detalhe e o histórico (US12), responder os apontamentos, corrigir a etapa indicada e reenviar a versão 2 pelo próprio detalhe (US09).
4. Como analista, filtrar a fila por "Reanálise" (US18), aceitar a correção, aprovar e mostrar o histórico do protocolo (US08).
5. Excluir um rascunho (US20).

### `AT23-INFRA: Screencast da explicação do código [Gestão]` (#116)
`Sprint 7`, `Gestão`

O eixo é o ciclo de vida do projeto: as transições de status encapsuladas em `Project`, o `Finding` com gravidade e etapa, e a regra que só libera a aprovação sem bloqueante aberto. Também entra a restrição por dono do `AT17-INFRA`.

### `AT30-INFRA: Validar a Entrega 04 com o monitor [Gestão]` (#153)
`Sprint 7`, `Gestão`

Revisar com o monitor, até quinta, 05/11, o README, a seção "Entrega 04", o print das issues e os dois screencasts.

### `AT20-INFRA: Validação com o cliente [Gestão]` (#113)
`Sprint 7`, `Gestão`

Entregável de Projetos 3 do sábado, 07/11. Demonstrar à Neoenergia o ciclo completo: cálculo, envio, análise com apontamento, correção e reenvio. Registrar o feedback no Google Sites e abrir issues para os ajustes.

### `AT31-INFRA: Preparar a avaliação individual de POO [Gestão]` (#154)
`Sprint 7`, `Gestão`

A avaliação individual acontece junto com a avaliação da unidade, com perguntas sobre Spring Boot, Java e o código do AMPERE: camadas do back-end, herança e polimorfismo em `ConsumerUnitGroup`, encapsulamento em `Project` e `NormativeTable`, JPA sem Lombok, JWT e o fluxo de uma requisição do front ao banco.

### `AT24-INFRA: Apresentação final de POO [Gestão]` (#117)
`Sprint 7`, `Gestão`

Resumo de até 8 minutos, de 09 a 13/11, com o time inteiro presente: problema, solução, fluxo de trabalho, ferramentas com links, lições aprendidas e demonstração. O ensaio acontece na Sprint 7.

### `AT26-INFRA: Desenhar no Figma as telas do SR2 [Gestão]` (#149)
`Sprint 6`, `Gestão`, milestone Status Report 2

Painel do projetista (US16) até 01/11. Distribuição da fila (US23), comparativo de versões (US13), painel do administrador (US24) e indicadores do analista (US17) até 08/11. Cadastro e perfil (US10) e usuários (US11) seguem os padrões do login e da listagem, sem protótipo. As notificações já têm protótipo.

## Status Report 2

### `AT25-INFRA: Retrospectiva do projeto [Gestão]` (#148)
`Sprint 9`, `Gestão`

Entregável de Projetos 3 do sábado, 21/11: retro no board e material parcial do SR2.

### `AT27-INFRA: Relatório de uso de IA [Gestão]` (#150)
`Sprint 10`, `Gestão`

Entregável de Projetos 3 do sábado, 28/11, a partir dos casos em [`../uso-de-ia/`](../uso-de-ia/).

### `AT28-INFRA: Status Report 2 (roteiro e slides) [Gestão]` (#151)
`Sprint 10`, `Gestão`

Apresentação de sábado, 05/12. Vale uma das duas notas de Projetos 3.

---

# Histórias da Entrega 04

## US07: Auditoria de Memória e Registro Pontual de Apontamentos (#94)
`Sprint 4`, `US07`. Protótipo: [H7 · Análise do projeto](https://www.figma.com/design/tbMeH3sx9YwDVb6oz7bCBG/Prot%C3%B3tipo-HI-FI?node-id=2083-2).

### Recorte

- **Notificação fica na US14.** A reprovação só muda o status e grava os apontamentos.
- **A verificação automática usa os `checks` e `warnings` do cálculo existente.** Não há regra nova de pré-validação.
- **Um analista por projeto.** Não há redistribuição da fila.

### `AT01-US07: Back-end da análise e dos apontamentos [Backend]` (#95)

- [ ] `Finding` ganha gravidade (`BLOCKING`, `ADJUSTMENT`), etapa (`PROJECT_DATA`, `CONSUMER_UNITS`, `CALCULATION`, `DOCUMENTS`), referência opcional ao grupo, à parcela ou ao tipo de documento, descrição, item da norma, autor, data, versão e status (`DRAFT`, `OPEN`, `FIXED`, `CONTESTED`, `RESOLVED`)
- [ ] `POST /api/projects/{id}/review` atribui o projeto ao analista. Devolve 409 se outro analista já assumiu
- [ ] `GET`, `POST`, `PUT` e `DELETE` em `/api/projects/{id}/findings`. Só o analista atribuído escreve, e só enquanto o apontamento está em rascunho
- [ ] `POST /api/projects/{id}/decision` com `APPROVE` ou `REJECT` e o parecer. Na aprovação, devolve 422 se houver bloqueante aberto. Na reprovação, devolve 422 sem apontamento. Grava o `reviewedAt` e passa os rascunhos para `OPEN`
- [ ] `POST /api/projects/{id}/findings/{findingId}/resolution` com `ACCEPT` ou `REOPEN`, para a reanálise
- [ ] `GET /api/projects/{id}/documents/{documentId}/file` devolve o PDF para o dono e para o analista
- [ ] Transições de status encapsuladas em `Project`, sem setter
- [ ] Testes da decisão, da atribuição e do acesso ao arquivo

### `AT02-US07: Tela "Análise do projeto" [Frontend]` (#96)

- [ ] Rota `/fila-de-analise/$id`, protegida para o papel `admin`. O botão "Analisar" da fila deixa de ser tooltip (hoje redireciona para `/projetos/$id`, #184)
- [ ] Cabeçalho com projetista, unidades, demanda, normas e data de recebimento
- [ ] Abas "Memória de Cálculo", "Unidades Consumidoras", "Documentos" e "Histórico". O histórico chega na US08
- [ ] Verificação automática com o atalho "Virar Apontamento"
- [ ] Lateral de apontamentos com o formulário de gravidade, etapa, descrição e item da norma
- [ ] Visualizador de PDF dos anexos
- [ ] Rodapé com "Reprovar com Apontamentos" e "Aprovar Projeto", com modal de confirmação e parecer
- [ ] Na reanálise, cada apontamento mostra a resposta do projetista com "Aceitar Correção" e "Reabrir"

## US09: Correção de Apontamentos e Reenvio com Versionamento (#97)
`Sprint 5`, `US09`. Protótipo: a tela de correção sai do `AT19-INFRA`.

### Recorte

- **A versão é um número e um resumo.** O memorial congelado por versão fica na US13.
- **O reenvio recalcula a demanda** com o mesmo motor da US04.

### `AT01-US09: Back-end da correção e do reenvio [Backend]` (#98)

- [ ] Projeto `REJECTED` volta a aceitar alteração de dados, grupos e documentos
- [ ] `PUT /api/projects/{id}/findings/{findingId}/response` com `FIXED` ou `CONTESTED` e o texto. Contestação exige justificativa
- [ ] `POST /api/projects/{id}/submission` aceita `REJECTED`: exige o resumo das alterações, devolve 422 com bloqueante sem resposta, recalcula a demanda, incrementa a versão e o `reviewCycle` e volta a `UNDER_REVIEW`
- [ ] O projeto reenviado aparece na fila com o filtro "Reanálise" do #86
- [ ] Testes do bloqueio do reenvio e do incremento de versão

### `AT02-US09: Tela "Apontamentos e reenvio" [Frontend]` (#99)

- [ ] "Corrigir" da listagem abre o detalhe do projeto em `/projetos/$id` (US12). `/projetos/$id/apontamentos` redireciona para ele
- [ ] Coluna de apontamentos do detalhe, por gravidade, com o atalho para a etapa e o item
- [ ] Selo de apontamento no grupo, na parcela ou no documento indicado dentro das etapas
- [ ] Ações "Corrigido" e "Contestar", com o campo de resposta
- [ ] Resumo das alterações e "Reenviar Projeto" na mesma coluna, desabilitado com bloqueante sem resposta
- [ ] Versão do projeto no cabeçalho do detalhe

## US20: Exclusão de Projeto em Rascunho (#100)
`Sprint 4`, `US20`.

### `AT01-US20: Exclusão de rascunho na listagem [Frontend]` (#101)

- [ ] "Excluir Projeto" no menu de ações da linha, só para rascunho, com diálogo de confirmação com nome e protocolo
- [ ] A listagem e os contadores atualizam depois da exclusão
- [ ] "Excluir Grupo" passa a pedir confirmação (pendência 30)

## US08: Linha do Tempo e Histórico do Protocolo (#102)
`Sprint 6`, `US08`. Protótipo: [H8 · Histórico do protocolo](https://www.figma.com/design/tbMeH3sx9YwDVb6oz7bCBG/Prot%C3%B3tipo-HI-FI?node-id=2085-2).

### Recorte

- **Eventos a partir da AT01-US08.** Sem carga retroativa: projetos anteriores mostram o estado vazio, e o seed recria os de demonstração.
- **Comparação entre versões fica na US13.**

### `AT01-US08: Back-end do histórico do protocolo [Backend]` (#103)

- [ ] Entidade `ProjectEvent` com tipo, versão, autor, papel, descrição e data, gravada na criação, no envio, na decisão, no reenvio e nas respostas aos apontamentos
- [ ] `GET /api/projects/{id}/events?direction=desc`, para o dono e para o analista
- [ ] `GET /api/projects/{id}/rework`: dias de ciclo, versões enviadas, ciclos de análise, apontamentos resolvidos e em aberto, e etapas refeitas
- [ ] Seed dos eventos pela linha do tempo de cada `ScenarioCase` (#190)
- [ ] Testes da ordem dos eventos e das métricas

### `AT02-US08: Aba "Histórico" da análise [Frontend]` (#104)

Com a página única do #184, o histórico é a seção "Histórico" do projeto, igual para os dois perfis, e a decisão fica na coluna lateral.

- [ ] Linha do tempo com a alternância "Mais Recente Primeiro"
- [ ] Card de ciclo em dias e tabela de métricas de retrabalho
- [ ] Estado vazio para projeto sem eventos

## US12: Detalhe do Projeto e Histórico de Tratamento (#105)
`Sprint 6`, `US12`. Protótipo: [H1b · Detalhes do projeto](https://www.figma.com/design/tbMeH3sx9YwDVb6oz7bCBG/Prot%C3%B3tipo-HI-FI?node-id=2155-2).

### `AT01-US12: Back-end do resumo do projeto [Backend]` (#106)

- [ ] `GET /api/projects/{id}` passa a trazer responsável técnico, apontamentos em aberto, versão e última movimentação
- [ ] O projetista lê os eventos do próprio projeto pelo endpoint da `AT01-US08`. Depende dela

### `AT02-US12: Página única do projeto [Frontend]` (#107)

- [x] "Ver Projeto", "Continuar" e "Corrigir" da listagem abrem `/projetos/$id`. `/projetos/$id/envio` redireciona para ele
- [x] Cabeçalho com protocolo, situação, endereço, projetista, unidades, demanda, normas, criado em e enviado em, e a ação principal do perfil ("Enviar para Análise" ou "Reenviar Projeto")
- [x] Seções na mesma página: Visão Geral, Dados da Edificação, Unidades Consumidoras, Cálculo de Demanda, Memorial, Documentos e Histórico, editáveis só para quem pode editar (#184)
- [x] Visão Geral com parecer, resumo por seção, apontamentos para responder e reenvio (US09)
- [x] Cálculo sob demanda, com aviso de cálculo desatualizado (#184)
- [x] Apontamentos respondidos no topo da seção indicada (#184)
- [x] Analista na mesma página, com a coluna de apontamentos e a decisão; `/fila-de-analise/$id` redireciona para `/projetos/$id` (#184)
- [ ] "Excluir Projeto" no detalhe, para rascunho (US20)

A seção "Histórico" lendo os eventos da US08 passou para a `AT02-US08` (#104).

## US18: Filtros e Ordenação das Listagens (#108)
`Sprint 5`, `US18`.

### `AT01-US18: Back-end dos filtros e da ordenação [Backend]` (#109)

- [ ] `GET /api/projects` com `sort` (`name`, `demand`, `createdAt`, `updatedAt`), `direction`, `createdFrom`, `createdTo` e os filtros de vários valores `state`, `municipality` e `findings` (parâmetro repetido)
- [ ] `GET /api/review-queue` com `sort` (`deadline`, `submittedAt`, `demand`, `warnings`), `reviewer`, `state` e `municipality`
- [ ] Projeto com CEP e UF; só entra endereço da área atendida: Pernambuco ou Pedras de Fogo (PB)
- [ ] Ordenação estável pelo id no empate, como no #86

### `AT02-US18: Filtros e ordenação nas listagens [Frontend]` (#110)

- [ ] Ordenação pelo cabeçalho das colunas em "Meus Projetos" e na fila
- [ ] Filtros novos guardados na URL com `nuqs`; UF, município e apontamentos com seleção múltipla
- [ ] Opções de município vindas do IBGE, com busca; CEP preenchido pelo ViaCEP no cadastro
- [ ] Etiquetas removíveis dos filtros ativos e o botão "Limpar Filtros"

### `AT03-US18: Busca, filtros e ordenação nas tabelas normativas [Backend/Frontend]` (#177)

- [x] `GET /api/normative-tables` com `search`, `status`, `sort` e `direction`
- [x] Busca, filtro "Situação" e "Ordenar por" na tela, guardados na URL, e ordenação pelos cabeçalhos
- [x] Estado vazio com "Limpar Filtros"

### `AT04-US18: Endereço pelo CEP na área de concessão [Backend/Frontend]` (#181)

- [x] CEP consultado no ViaCEP, preenchendo UF, município e logradouro
- [x] Lista estática dos municípios de Pernambuco e de Pedras de Fogo (PB), no front e no back
- [x] Só aceita endereço da área atendida; sem CEP encontrado, UF e município escolhidos na mão
- [x] Endereços antigos no formato "Recife/PE" separados ao subir a aplicação

## Correções das Histórias da Entrega 03
`Sprint 5`, `bug`. Tarefas abertas em 24/10 nas histórias já entregues.

### `AT03-US03: Tecnologia de lâmpada "Tomadas" em banco antigo [Backend]` (#187)

- [x] `EnumCheckConstraints` reescreve em todo boot as restrições de `app_user.role` e `load_group_item.lamp_technology` com os valores atuais do enum

### `AT04-US05: Envio recusa cálculo anterior à última alteração do projeto [Backend/Frontend]` (#186)

- [x] Todo envio de projeto em rascunho ou reprovado recalcula a demanda, e o memorial não junta grupos atuais com cálculo antigo

### `AT05-US05: Comparação do memorial pelo valor, sem depender da escala [Backend]` (#188)

- [x] O snapshot do cálculo é comparado por valor numérico (`60` igual a `60.00`), com teste de regressão no `SubmissionIntegrationTest`

---

# Histórias do Status Report 2

Cada história tem a issue épica, a tarefa de back e a tarefa de front, nessa ordem de numeração. As tarefas detalham o checklist da história em [`user-stories.md`](user-stories.md).

| História | Back-end | Front-end |
| :--- | :--- | :--- |
| US10: Cadastro e Perfil do Projetista (#118) | Entregue. `AT01-US10`: `POST /api/auth/register`, CREA e empresa em `User`, `GET` e `PUT /api/users/me`, troca de senha, responsável técnico no memorial | **Sprint 6.** `AT02-US10`: telas "Criar Conta" e "Meu Perfil", responsável técnico no carimbo |
| US11: Gestão de Usuários (#121) | Entregue. `AT01-US11`: CRUD em `/api/users`, situação ativa, senha temporária com troca obrigatória, bloqueio de conta inativa no filtro do JWT. `AT03-US11` (#182): papéis de projetista, analista e administrador | **Sprint 6.** `AT02-US11`: tela "Usuários" e troca obrigatória de senha no login. `AT04-US11` (#178): projetista do projeto criado pelo administrador |
| US16: Painel do Projetista (#133) | **Sprint 7.** `AT01-US16`: `GET /api/dashboard/designer?period=` | **Sprint 7.** `AT02-US16`: tela "Painel" como inicial do projetista |
| US13: Versão Congelada do Envio (#124) | **Sprint 7.** `AT01-US13`: entidade `ProjectVersion` com memorial, cálculo e documentos, `GET /api/projects/{id}/versions` e `GET .../versions/{n}/memorial`, comparativo | **Sprint 8.** `AT02-US13`: versões e "Comparar Versões" na seção "Histórico" |
| US14: Notificações no Sistema (#127) | **Sprint 7.** `AT01-US14`: entidade `Notification`, geração nos eventos da US07, US09 e US15, `GET /api/notifications` e marcação de leitura | **Sprint 8.** `AT02-US14`: contador no sino e painel de notificações dos dois perfis |
| US19: Exportação em Planilha (#139) | **Sprint 7.** `AT01-US19`: `GET /api/projects/{id}/calculation.xlsx` e exportação `.csv` das listagens com os filtros | **Sprint 9.** `AT02-US19`: botões "Exportar Planilha" e "Exportar CSV" |
| US23: Distribuição da Fila de Análise (#191) | **Sprint 7.** `AT01-US23`: atribuição em lote, municípios por analista e distribuição no envio | **Sprint 8.** `AT02-US23`: seleção em lote na fila e tela "Distribuição" |
| US15: Prazos de Análise e Validade da Aprovação (#130) | **Sprint 8.** `AT01-US15`: suspensão e retomada do prazo, status `EXPIRED` após 36 meses, job diário | **Sprint 9.** `AT02-US15`: prazo, dias suspensos e validade na fila e no painel do projeto |
| US17: Painel do Analista (#136) | **Sprint 8.** `AT01-US17`: `GET /api/dashboard/review?period=` e `GET /api/review-queue/mine` | **Sprint 9.** `AT02-US17`: telas "Indicadores" e "Meus Pareceres" |
| US24: Painel do Administrador (#192) | **Sprint 8.** `AT01-US24`: `GET /api/dashboard/admin` e filtros de situação em `GET /api/users` | **Sprint 9.** `AT02-US24`: tela "Painel" como inicial do administrador |

---

# Resumo das Issues

| Milestone | Gestão | Histórias | Back-end | Front-end | Total |
| :--- | :-: | :-: | :-: | :-: | :-: |
| Entrega 03 | 6 (AT12 a AT16 e AT29) | | | | 6 |
| Entrega 04 | 9 (AT18 a AT24, AT30 e AT31) | 6 | 6 (com o AT17) | 6 | 27 |
| Status Report 2 | 4 (AT25 a AT28) | 10 | 10 | 10 | 34 |
| **Total** | **19** | **16** | **16** | **16** | **67** |

A contagem não inclui as tarefas abertas em 24/10 fora do plano original: 8 na Entrega 04 e 2 no Status Report 2.
