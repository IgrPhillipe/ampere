# Plano da Entrega 04 e do Status Report 2: Sprints 4 a 10

> **Prazos:** Entrega 04 de POO na segunda-feira, 09/11/2026, com a apresentação final de 09 a 13/11. Status Report 2 de Projetos 3 no sábado, 05/12/2026.
> **Regra:** o código de cada ciclo fecha uma semana antes da entrega. A última semana é só de preparação: README, POST-IT, print das issues, screencasts, validação com o monitor e com o cliente e ensaio. A correção de POO usa o conteúdo do GitHub logo após o prazo.
> **Histórias:** US07, US08, US09, US12, US18 e US20 na Entrega 04. US10, US11, US13 a US17, US19, US21 e US22 no SR2. A US21 e a US22 são opcionais.
> Histórias completas em [`user-stories.md`](user-stories.md). Critérios em [`../cronograma-poo.md`](../cronograma-poo.md) e [`../cronograma-projetos3.md`](../cronograma-projetos3.md).
> Issues no [milestone Entrega 03](https://github.com/IgrPhillipe/ampere/milestone/2), no [milestone Entrega 04](https://github.com/IgrPhillipe/ampere/milestone/3) e no [milestone Status Report 2](https://github.com/IgrPhillipe/ampere/milestone/4), #88 a #154.

## Ciclos

| Sprint | Período | Tipo | Escopo | Milestone |
| :--- | :--- | :--- | :--- | :--- |
| Sprint 4 | 04/10 a 18/10 | Preparação da Entrega 03 e início do desenvolvimento | README, screencasts, monitor e retro da Entrega 03. US07, US20, restrição por dono e telas no Figma | Entrega 03 e Entrega 04 |
| Sprint 5 | 19/10 a 25/10 | Desenvolvimento | US09 e US18 | Entrega 04 |
| Sprint 6 | 26/10 a 01/11 | Desenvolvimento. **Code freeze em 01/11** | US08 e US12 | Entrega 04 |
| Sprint 7 | 02/11 a 08/11 | Preparação da Entrega 04 | Monitor, cliente, POST-IT, print, screencasts, avaliação individual e ensaio da apresentação. Telas do SR2 no Figma | Entrega 04 |
| Sprint 8 | 09/11 a 15/11 | Desenvolvimento | US10, US13, US14 e US16 | Status Report 2 |
| Sprint 9 | 16/11 a 22/11 | Desenvolvimento. **Code freeze em 22/11** | US11, US15, US17 e US19, mais as opcionais US21 e US22 | Status Report 2 |
| Sprint 10 | 23/11 a 04/12 | Preparação do SR2 | Material e ensaio do SR2 e relatório de IA | Status Report 2 |

**Ritmo:** duas histórias por semana nas Sprints 4 a 6. As Sprints 8 e 9 têm quatro por semana, porque o ciclo do SR2 tem só duas semanas de desenvolvimento antes do freeze. Na semana de preparação, entram só correções e os ajustes da validação com o cliente.

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

**Labels:** `Sprint 4` a `Sprint 10` e `US07` a `US22`.

**Tarefas de código abertas sem responsável.** Cada pessoa se atribui ao assumir a tarefa.

**Sem MSW.** Os services novos falam direto com a API. O contrato de cada endpoint fica escrito na issue de back, que entra primeiro em cada sprint. O front começa pela interface sobre o contrato e integra assim que o endpoint chega à main.

**Dependências:**

- O `AT17-INFRA` abre a Sprint 4. Ele define quem lê e quem escreve cada projeto.
- O `AT19-INFRA` precisa estar pronto antes do front da US07, na Sprint 4, e da US09, na Sprint 5.
- A US07 abre o ciclo: a US08, a US09 e os painéis (US16 e US17) leem os apontamentos e as decisões que ela grava.
- Na Sprint 6, o back da US08 entra antes do back da US12, que lê os mesmos eventos.
- O `AT26-INFRA` precisa estar pronto antes da Sprint 8.

**Total:** 67 issues, #88 a #154: 6 na Entrega 03, 27 na Entrega 04 e 34 no Status Report 2.

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
- [ ] Para o papel `admin`: leitura de todos os projetos enviados e nenhuma escrita nos endpoints do projetista
- [ ] A regra vale para projeto, grupos, cálculo, documentos, memorial e envio
- [ ] Projetos do seed recebem um dono
- [ ] Testes de acesso entre dois projetistas e entre projetista e analista

### `AT19-INFRA: Desenhar no Figma as telas da análise e da correção [Gestão]` (#112)
`Sprint 4`, `Gestão`

- [ ] H7: formulário de novo apontamento, modal de decisão e visualizador de documentos
- [ ] Tela de correção e reenvio do projetista (US09), que não tem protótipo
- [ ] Selo de apontamento dentro das etapas H3 e H4
- [ ] H6, H7 e H8: trocar "NDU 001" e "Tabela 3, 5 e 6" pela DIS-NOR-053 e pela DIS-NOR-030, como o `AT11-INFRA` fez com o texto da US03 e da US04
- [ ] H3: decidir a coluna "Fator" (pendência 27) e desenhar o `Sheet` de grupo (pendência 29)

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
3. Como projetista, abrir o projeto pela listagem e ver o histórico (US12), abrir "Ver Apontamentos", corrigir a etapa indicada e reenviar a versão 2 (US09).
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
`Sprint 7`, `Gestão`, milestone Status Report 2

Cadastro e perfil (US10), usuários (US11), comparativo de versões (US13), painel do projetista (US16) e indicadores do analista (US17). As notificações já têm protótipo.

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

- [ ] Rota `/fila-de-analise/$id`, protegida para o papel `admin`. O botão "Analisar" da fila deixa de ser tooltip
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

- [ ] Rota `/projetos/$id/apontamentos`. "Ver Apontamentos" da listagem deixa de mostrar o toast
- [ ] Lista dos apontamentos por gravidade, com o atalho para a etapa e o item
- [ ] Selo de apontamento no grupo, na parcela ou no documento indicado dentro das etapas
- [ ] Ações "Corrigido" e "Contestar", com o campo de resposta
- [ ] Resumo das alterações e "Reenviar Projeto", desabilitado com bloqueante sem resposta
- [ ] Versão do projeto no carimbo

## US20: Exclusão de Projeto em Rascunho (#100)
`Sprint 4`, `US20`.

### `AT01-US20: Exclusão de rascunho na listagem [Frontend]` (#101)

- [ ] "Excluir Projeto" no menu de ações da linha, só para rascunho, com diálogo de confirmação com nome e protocolo
- [ ] A listagem e os contadores atualizam depois da exclusão
- [ ] "Excluir Grupo" passa a pedir confirmação (pendência 30)

## US08: Linha do Tempo e Histórico do Protocolo (#102)
`Sprint 6`, `US08`. Protótipo: [H8 · Histórico do protocolo](https://www.figma.com/design/tbMeH3sx9YwDVb6oz7bCBG/Prot%C3%B3tipo-HI-FI?node-id=2085-2).

### Recorte

- **Eventos a partir da US07.** Projetos anteriores mostram só criação e envio, reconstruídos das datas do projeto.
- **Comparação entre versões fica na US13.**

### `AT01-US08: Back-end do histórico do protocolo [Backend]` (#103)

- [ ] Entidade `ProjectEvent` com tipo, versão, autor, papel, descrição e data, gravada na criação, no envio, na decisão, no reenvio e nas respostas aos apontamentos
- [ ] `GET /api/projects/{id}/events?direction=desc`, para o dono e para o analista
- [ ] `GET /api/projects/{id}/rework`: dias de ciclo, versões enviadas, ciclos de análise, apontamentos resolvidos e em aberto, e etapas refeitas
- [ ] Testes da ordem dos eventos e das métricas

### `AT02-US08: Aba "Histórico" da análise [Frontend]` (#104)

- [ ] Linha do tempo com a alternância "Mais Recente Primeiro"
- [ ] Card de ciclo em dias e tabela de métricas de retrabalho
- [ ] Ações de aprovação e reprovação preservadas no rodapé

## US12: Detalhe do Projeto e Histórico de Tratamento (#105)
`Sprint 6`, `US12`. Protótipo: [H1b · Detalhes do projeto](https://www.figma.com/design/tbMeH3sx9YwDVb6oz7bCBG/Prot%C3%B3tipo-HI-FI?node-id=2155-2).

### `AT01-US12: Back-end do resumo do projeto [Backend]` (#106)

- [ ] `GET /api/projects/{id}` passa a trazer responsável técnico, apontamentos em aberto, versão e última movimentação
- [ ] O projetista lê os eventos do próprio projeto pelo endpoint da `AT01-US08`. Depende dela

### `AT02-US12: Painel lateral do projeto e modo somente leitura [Frontend]` (#107)

- [ ] Clique na linha de "Meus Projetos" abre o painel lateral com resumo e histórico
- [ ] Rodapé por situação: "Continuar Preenchimento", "Abrir Projeto" e "Ver Apontamentos"
- [ ] Etapas de projeto enviado em modo somente leitura, com a faixa "Projeto enviado em"
- [ ] A etapa "Envio" deixa de exibir a linha do tempo fixa e passa a ler os eventos

## US18: Filtros e Ordenação das Listagens (#108)
`Sprint 5`, `US18`.

### `AT01-US18: Back-end dos filtros e da ordenação [Backend]` (#109)

- [ ] `GET /api/projects` com `sort` (`name`, `demand`, `createdAt`, `updatedAt`), `direction`, `municipality`, `createdFrom`, `createdTo` e `hasBlocking`
- [ ] `GET /api/review-queue` com `sort` (`deadline`, `submittedAt`, `demand`, `warnings`), `reviewer` e `municipality`
- [ ] `GET /api/projects/municipalities` para as opções do filtro
- [ ] Ordenação estável pelo id no empate, como no #86

### `AT02-US18: Filtros e ordenação nas listagens [Frontend]` (#110)

- [ ] Ordenação pelo cabeçalho das colunas em "Meus Projetos" e na fila
- [ ] Filtros novos guardados na URL com `nuqs`
- [ ] Etiquetas removíveis dos filtros ativos e o botão "Limpar Filtros"

---

# Histórias do Status Report 2

Cada história tem a issue épica, a tarefa de back e a tarefa de front, nessa ordem de numeração. As tarefas detalham o checklist da história em [`user-stories.md`](user-stories.md).

| História | Sprint | Back-end | Front-end |
| :--- | :--- | :--- | :--- |
| US10: Cadastro e Perfil do Projetista (#118) | Sprint 8 | `AT01-US10`: `POST /api/auth/register`, CREA e empresa em `User`, `GET` e `PUT /api/users/me`, troca de senha, responsável técnico no memorial | `AT02-US10`: telas "Criar Conta" e "Meu Perfil", responsável técnico no carimbo |
| US13: Versão Congelada do Envio (#124) | Sprint 8 | `AT01-US13`: entidade `ProjectVersion` com memorial, cálculo e documentos, `GET /api/projects/{id}/versions` e `GET .../versions/{n}/memorial`, comparativo | `AT02-US13`: versões e "Comparar Versões" na aba "Histórico" |
| US14: Notificações no Sistema (#127) | Sprint 8 | `AT01-US14`: entidade `Notification`, geração nos eventos da US07, US09 e US15, `GET /api/notifications` e marcação de leitura | `AT02-US14`: contador no sino e painel de notificações dos dois perfis |
| US16: Painel do Projetista (#133) | Sprint 8 | `AT01-US16`: `GET /api/dashboard/designer?period=` | `AT02-US16`: tela "Painel" como inicial do projetista |
| US11: Gestão de Usuários (#121) | Sprint 9 | `AT01-US11`: CRUD em `/api/admin/users`, situação ativa, senha temporária com troca obrigatória, bloqueio de conta inativa no filtro do JWT | `AT02-US11`: tela "Usuários" e troca obrigatória de senha no login |
| US15: Prazos de Análise e Validade da Aprovação (#130) | Sprint 9 | `AT01-US15`: suspensão e retomada do prazo, status `EXPIRED` após 36 meses, job diário | `AT02-US15`: prazo, dias suspensos e validade na fila e no painel do projeto |
| US17: Painel do Analista (#136) | Sprint 9 | `AT01-US17`: `GET /api/dashboard/review?period=` e `GET /api/review-queue/mine` | `AT02-US17`: telas "Indicadores" e "Meus Pareceres" |
| US19: Exportação em Planilha (#139) | Sprint 9 | `AT01-US19`: `GET /api/projects/{id}/calculation.xlsx` e exportação `.csv` das listagens com os filtros | `AT02-US19`: botões "Exportar Planilha" e "Exportar CSV" |
| US21: Duplicação de Projeto (opcional) (#142) | Sprint 9 | `AT01-US21`: `POST /api/projects/{id}/copies` | `AT02-US21`: ação "Duplicar Projeto" |
| US22: Documentos Complementares (opcional) (#145) | Sprint 9 | `AT01-US22`: tipos novos em `DocumentType`, regra do termo acima de 1 MVA, `.dwg` e `.dxf` | `AT02-US22`: itens novos e "Recomendado" no checklist |

---

# Resumo das Issues

| Milestone | Gestão | Histórias | Back-end | Front-end | Total |
| :--- | :-: | :-: | :-: | :-: | :-: |
| Entrega 03 | 6 (AT12 a AT16 e AT29) | | | | 6 |
| Entrega 04 | 9 (AT18 a AT24, AT30 e AT31) | 6 | 6 (com o AT17) | 6 | 27 |
| Status Report 2 | 4 (AT25 a AT28) | 10 | 10 | 10 | 34 |
| **Total** | **19** | **16** | **16** | **16** | **67** |
