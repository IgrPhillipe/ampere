# Plano da Entrega 03 — Sprints 2, 3 e 4

> **Prazo:** segunda-feira, 19/10/2026. **Histórias:** US03, US04, US05 e US06, duas por sprint.
> A entrega exige no mínimo 2; as quatro deixam a US07 e a US08 para a Entrega 04.
> Critérios completos em [`../cronograma-poo.md`](../cronograma-poo.md). Issues das Sprints 2 e 3 no [milestone Entrega 03](https://github.com/IgrPhillipe/ampere/milestone/2), #53 a #68.

| Sprint | Período | Foco |
| :--- | :--- | :--- |
| Sprint 2 | 20/09 a 26/09 | US03 e US04 |
| Sprint 3 | 27/09 a 03/10 | US05 e US06. A semana de provas cai dentro desta sprint, e ela fecha no Status Report 1 |
| Sprint 4 | 04/10 a 10/10 | README, screencasts e ajustes da Entrega 03 (issues ainda não abertas) |

| Data | Entrega | Responsável |
| :--- | :--- | :--- |
| Sáb 26/09 | Projetos 3, Sprint 2: GitHub e Google Sites atualizados | Sites: André |
| Sáb 03/10 | Projetos 3, Status Report 1: roteiro e slides | Jean e Kellwen |
| Seg 19/10 | POO, Entrega 03 | README e screencasts: Will · código: Afonso, Gabriel, Igor e Lucas |

---

## Como as issues estão organizadas

O padrão é o mesmo da Sprint 1: uma issue por história, que funciona como épico, e duas tarefas por história, uma de **Backend** e uma de **Frontend**. Tudo vai no milestone **Entrega 03**. As labels novas são `Sprint 2`, `Sprint 3`, `US03`, `US04`, `US05` e `US06`.

**São 4 tarefas de código por sprint**, abertas sem responsável: quem pega se atribui.

**Back e front andam em paralelo.** O contrato de cada endpoint está escrito na própria issue. O front constrói contra handlers MSW com esse contrato, e a integração no fim é só apagar o handler, como foi feito na Sprint 1.

As issues de Gestão não dependem de código.

---

# Gestão

## `AT01-INFRA: Abrir as GitHub Issues da Entrega 03 [Gestão]`
`Sprint 2` · `Gestão`

Criar o milestone Entrega 03, as labels `Sprint 2`, `Sprint 3`, `US03`, `US04`, `US05` e `US06` e as issues das Sprints 2 e 3. Precisa sair até sábado, 26/09.

## `AT02-INFRA: Status Report 1 — roteiro e slides [Gestão]`
`Sprint 3` · `Gestão`

Apresentação de sábado, 03/10. A semana anterior é de provas, então o ideal é fechar no fim de semana de 26 e 27/09.

## `AT03-INFRA: Atualizar o Google Sites com a Sprint 2 [Gestão]`
`Sprint 2` · `Gestão`

Entregável de Projetos 3 do sábado, 26/09.

## `AT04-INFRA: Alinhar US03 e US04 às normas [Gestão]`
`Sprint 2` · `Gestão`

O texto das duas histórias foi escrito antes da pesquisa normativa, o mesmo caso do `AT04-INFRA` da Sprint 1. O código segue o [`engine-calculo.md`](../tecnico/engine-calculo.md), então esta correção não bloqueia nenhuma tarefa.

- [ ] US03: trocar "Tabela 3, Tabela 5, Tabela 6" por Quadro 35 (DIS-NOR-053) para residencial, Tabelas 6 a 18 (DIS-NOR-030) para áreas comuns e comercial, e Quadro 33 (DIS-NOR-053) para recarga
- [ ] US04: a etapa "Conversão para kVA" não existe, porque cada parcela já sai em kVA. As etapas passam a ser `Drf`, `Ds`, `Dc`, `Dve` e `Ded` final com o mínimo por tensão

## `AT05-INFRA: Seção "Entrega 03" no README com os POST-IT [Gestão]`
`Sprint 4` · `Gestão`

- [ ] POST-IT da US03, US04, US05 e US06 na seção "Entrega 03"
- [ ] Print das GitHub Issues
- [ ] Tabela de Entregas: marcar a Entrega 02 como "Finalizada" (hoje está "Não iniciada")

## `AT06-INFRA: Screencast do sistema rodando [Gestão]`
`Sprint 4` · `Gestão`

Vídeo no YouTube, com áudio ou legenda. Roteiro:
1. Como projetista, adicionar um grupo, ver a pendência dele bloquear o "Calcular demanda" e resolvê-la pelo painel (US03).
2. Corrigir o grupo e abrir o cálculo passo a passo (US04).
3. Gerar o memorial, anexar os documentos e enviar para análise (US05).
4. Como analista, abrir a fila, filtrar "Vencendo prazo" e clicar em "Analisar" (US06).

## `AT07-INFRA: Screencast da explicação do código [Gestão]`
`Sprint 4` · `Gestão`

Vídeo no YouTube explicando o código. O eixo é a hierarquia `ConsumerUnitGroup`, com `validate()` e `demand()` sobrescritos em cada tipo de grupo, e o motor de cálculo somando os grupos sem nenhum `if` por tipo. Também entra o status do SLA calculado a partir da data de envio, na US06.

---

# US03 – Cadastro e Validação em Tempo Real de Unidades Consumidoras

`Sprint 2` · `US03`

## Descrição

Interface de agrupamento de cargas por tipologia, com validação em tempo real para capturar erros normativos antes da submissão.

## User Story

**Como** projetista externo,
**Quero** cadastrar as unidades consumidoras agrupadas por tipo e receber validações técnicas instantâneas,
**Para que** eu possa corrigir inconsistências antes da submissão formal.

## Conversação

O projetista adiciona grupos de UCs de três tipos: apartamentos, áreas comuns ou cargas comerciais, e recarga de veículo elétrico. Cada grupo recebe um status: Validado, Revisar ou Falta dado. Pendências críticas travam o cálculo, por exemplo motor acima de 5 CV sem dado de partida ou recarga sem indicação de gerenciamento de carga.

## Critérios de aceite (BDD)

**Cenário 1 (Positivo): Grupos cadastrados sem inconsistências**
- **Dado** que o projetista está na etapa "Unidades consumidoras"
- **Quando** cadastra os grupos com todas as cargas e fatores em conformidade
- **Então** a tabela mostra o status "Validado" em cada grupo de UCs
- **E** o botão "Calcular demanda" fica ativo

**Cenário 2 (Negativo): Pendência bloqueia o cálculo**
- **Dado** que o projetista tem grupos com dados pendentes
- **Quando** visualiza o painel de validação
- **Então** os grupos recebem o status "Revisar" ou "Falta dado"
- **E** "Calcular demanda" fica desabilitado até a correção pelos atalhos "Corrigir agora" ou "Informar dado"

## Recorte

- **Sem importação `.xlsx`.** O Cenário 1 passa a ser atendido pelo cadastro manual; o ajuste do texto da história está na #68.
- **Adicionar grupo é a linha do H3a**, dentro da tabela: nome, tipo de uso, quantidade e carga. Os dados específicos de cada tipo (área útil, cargas, potência por ponto, gerenciamento de carga) ficam num `Sheet`, que não existe no protótipo. É para ele que levam o nome do grupo e os atalhos do painel.
- **Carimbo e coluna FATOR como no protótipo, com placeholder:** o responsável técnico mostra "—" até a ART da US05, e o FATOR mostra "AUTO" até o cálculo da US04.
- **As regras de validação ficam só no back.** O front consulta o status e não repete as regras no Zod.
- **Uma torre só.** O agrupamento de torres (Anexo I, item 9) fica fora.

## Por que esta história carrega o requisito de POO

Os grupos formam uma hierarquia nova: `ConsumerUnitGroup` → `ResidentialGroup` / `LoadGroup` / `EvChargingGroup`. Cada tipo sobrescreve `validate()` com as suas regras. Na US04 a mesma hierarquia ganha o `demand()`.

## Tarefas

- [ ] Back-end dos grupos de unidades consumidoras
- [ ] Tela "Unidades consumidoras"

## Protótipo (Hi-Fi)

| Tela | Para quê |
| :--- | :--- |
| [H3 · Unidades consumidoras](https://www.figma.com/design/tbMeH3sx9YwDVb6oz7bCBG/Prot%C3%B3tipo-HI-FI?node-id=2044-2) | tabela de grupos, status e painel de validação |
| [H3a · adicionar grupo](https://www.figma.com/design/tbMeH3sx9YwDVb6oz7bCBG/Prot%C3%B3tipo-HI-FI?node-id=2152-2) | a linha de adição dentro da tabela |

---

## `AT01-US03: Back-end dos grupos de unidades consumidoras [Backend]`
`Sprint 2` · `US03` · `Backend`

O domínio dos grupos e a validação.

### Passos

- [x] Classe abstrata `ConsumerUnitGroup`, relação N-1 com `Project`, mapeada com `@Inheritance`
- [x] Subclasses `ResidentialGroup`, `LoadGroup` (com itens por parcela a–i da 030) e `EvChargingGroup`, com os campos das seções 3 a 5 do [`engine-calculo.md`](../tecnico/engine-calculo.md)
- [x] `validate()` sobrescrito em cada subclasse, devolvendo o status `VALIDATED`, `REVIEW` ou `MISSING_DATA` e as mensagens; as regras de cada parcela ficam no corpo da constante de `LoadCategory`
- [x] CRUD em `/api/projects/{id}/groups`; grupo incompleto é salvo e volta com a pendência
- [x] `GET /api/projects/{id}/groups/validation`, com `canCalculate`, pendências e totais da etapa
- [x] Seed com os cinco grupos do H3 no projeto rascunho
- [x] Testes de domínio, controller e integração

### Por que isto importa além da história

**É aqui que a disciplina vê a segunda hierarquia.** A regra "cada tipo de grupo tem a sua validação" vira despacho por tipo, e não uma cadeia de `if`.

### Notas

- **Os grupos ficam em tabela própria, sem coluna nova em `project`.** Sem Flyway, coluna `NOT NULL` nova em tabela com dados quebra o ambiente (pendências 16 e 23)
- Mensagens de validação em português, porque são texto de tela

Parte da US03

---

## `AT02-US03: Tela "Unidades consumidoras" [Frontend]`
`Sprint 2` · `US03` · `Frontend`

A etapa 2 do projeto, do service à interface.

### Passos

- [x] Service `consumer-units` com endpoints, requests, query-keys, schema Zod, hooks e handlers MSW seguindo o contrato da `AT01-US03`
- [x] Carimbo, índice das etapas (extraído para `ProjectStepper`) e tabela de grupos como no H3, com a situação em caixa alta mono
- [x] Linha "Adicionar grupo" do H3a dentro da tabela, com o rodapé trocando para "Cancelar · Salvar grupo"
- [x] Painel verde de validação, com os atalhos "Corrigir agora" e "Informar dado" abrindo o `Sheet` do grupo no campo da pendência
- [x] "Calcular demanda" desabilitado enquanto `canCalculate` for falso
- [x] O "Avançar" da tela Novo Projeto passa a levar para esta tela

### Notas

- O status de validação vem do back, depois de cada alteração. O front não repete as regras

Parte da US03

---

# US04 – Conferência do Cálculo Passo a Passo da Demanda

`Sprint 2` · `US04`

## Descrição

Memória de cálculo de demanda detalhada, com as fórmulas, os critérios normativos aplicados e o dimensionamento elétrico geral.

## User Story

**Como** projetista externo,
**Quero** visualizar a memória de cálculo de demanda detalhada passo a passo com a regra normativa usada,
**Para que** eu possa auditar o dimensionamento e sustentá-lo tecnicamente.

## Conversação

O cálculo aparece em etapas: `Drf` (residencial), `Ds` (áreas comuns), `Dc` (comercial), `Dve` (recarga) e `Ded` final com o mínimo por tensão. Cada etapa mostra a fórmula e o item da norma. Ao lado fica o painel de rastreabilidade: demanda total, corrente, padrão de entrada, disjuntor e seção do ramal.

## Critérios de aceite (BDD)

**Cenário 1 (Positivo): Visualização completa da memória de cálculo**
- **Dado** que todas as UCs foram validadas na etapa anterior
- **Quando** o projetista acessa a etapa "Cálculo de demanda"
- **Então** o sistema exibe a demanda total em kVA e as etapas abertas com as suas fórmulas
- **E** habilita o botão "Gerar memorial"

**Cenário 2 (Navegação): Retornar para ajuste sem perda de dados**
- **Dado** que o projetista está conferindo o cálculo
- **Quando** clica em "Voltar"
- **Então** o sistema retorna à etapa 2 com os dados preenchidos

## Recorte

- **As tabelas normativas entram por seed**, ligadas ao `Standard` e à sua revisão. A área administrativa fica para depois.
- **`Fr` só no valor recomendado** pelo Quadro 37. Fator acima do recomendado, com justificativa, fica fora.
- **"Gerar memorial" fica habilitado, mas sem ação.** Gerar o memorial é a US05.

## Por que esta história carrega o requisito de POO

O motor percorre os grupos e chama `demand()` sem saber de que tipo cada um é. Cada subclasse de `ConsumerUnitGroup` sabe qual norma e qual tabela usar.

## Tarefas

- [ ] Back-end do motor de cálculo
- [ ] Tela "Cálculo de demanda"

## Protótipo (Hi-Fi)

| Tela | Para quê |
| :--- | :--- |
| [H4 · Cálculo de demanda](https://www.figma.com/design/tbMeH3sx9YwDVb6oz7bCBG/Prot%C3%B3tipo-HI-FI?node-id=2032-2) | as etapas, as fórmulas e o painel de rastreabilidade |

---

## `AT01-US04: Back-end do motor de cálculo [Backend]`
`Sprint 2` · `US04` · `Backend`

As tabelas normativas, o cálculo e o registro de cada execução.

### Passos

- [ ] Entidade de tabela paramétrica com norma, revisão, identificação da tabela, item e página
- [ ] Seed dos Quadros 33, 35, 36 e 37 e das Tabelas 1 e 2 da DIS-NOR-053, e das Tabelas 6 a 18 da DIS-NOR-030
- [ ] `demand()` sobrescrito em cada subclasse de `ConsumerUnitGroup`
- [ ] `Fc` calculado sobre o total de apartamentos da edificação, e não por grupo
- [ ] `Ded` calculada, `Ded` mínima por tensão, `Ded` final e categoria (disjuntor e ramal)
- [ ] `POST /api/projects/{id}/calculation` persiste um `Calculation` com os campos de rastreabilidade do [`engine-calculo.md`](../tecnico/engine-calculo.md). Devolve 422 se algum grupo não estiver validado
- [ ] `GET` do último cálculo, com as etapas, as fórmulas e a referência normativa de cada linha
- [ ] Os cinco exemplos resolvidos do Anexo I como testes de regressão

### Por que isto importa além da história

**Um valor de tabela digitado errado continua parecendo plausível.** Os cinco exemplos do Anexo I pegam esse tipo de erro, então a tarefa só fecha com os cinco passando.

### Notas

- **Único ponto de contato com a US03:** o `demand()` vive nas subclasses de `ConsumerUnitGroup`. Quem pegar a `AT01-US03` sobe primeiro o esqueleto das classes (campos e assinaturas), num PR pequeno no primeiro dia. Até lá, esta tarefa começa pelo seed das tabelas, que não depende de nada
- Cada valor do seed é conferido contra o PDF por uma segunda pessoa, usando a página impressa no rodapé da norma

Parte da US04

---

## `AT02-US04: Tela "Cálculo de demanda" [Frontend]`
`Sprint 2` · `US04` · `Frontend`

A etapa 3 do projeto, do service à interface.

### Passos

- [ ] Service `calculation` com hooks e handlers MSW seguindo o contrato da `AT01-US04`
- [ ] Etapas abertas, cada uma com a fórmula e a referência normativa
- [ ] Painel de rastreabilidade com demanda total, corrente, padrão de entrada, disjuntor e ramal
- [ ] "Voltar" retorna à etapa 2 sem perder dados
- [ ] "Gerar memorial" habilitado, sem ação
- [ ] Colunas "UCs" e "Demanda" de volta na listagem de projetos (pendência 24)

Parte da US04

---

# US05 – Geração de Memorial e Envio do Projeto

`Sprint 3` · `US05`

## Descrição

Geração do memorial descritivo no formato da Neoenergia, com checklist documental antes do envio.

## User Story

**Como** projetista externo,
**Quero** gerar o memorial descritivo padronizado no formato da Neoenergia e validar o checklist documental,
**Para que** a submissão ocorra sem risco de reprovação por documentação incompleta.

## Conversação

A etapa "Memorial e envio" mostra o preview do memorial em PDF, com download. A seção "Checagem antes do envio" exige três anexos: ART, diagrama unifilar e planta de situação. O botão de envio só é liberado com o checklist completo.

## Critérios de aceite (BDD)

**Cenário 1 (Positivo): Submissão concluída com checklist completo**
- **Dado** que o memorial foi gerado e todos os documentos obrigatórios estão anexados
- **Quando** o projetista clica em "Enviar para análise"
- **Então** o projeto é submetido à fila da concessionária
- **E** o status muda para "Em análise" na tela inicial

**Cenário 2 (Negativo): Envio impedido por documento obrigatório pendente**
- **Dado** que o "Diagrama unifilar (PDF)" ainda não foi anexado
- **Quando** o projetista visualiza a checagem antes do envio
- **Então** o item exibe o alerta com o botão "Anexar"
- **E** "Enviar para análise" permanece desabilitado

## Recorte

- **Só a exportação em PDF.** A exportação em planilha fica fora, porque não aparece em nenhum cenário.
- **Só os três anexos da história.** A planta da entrada de serviço e o termo de aterramento (acima de 1 MVA) ficam fora.
- **Arquivos guardados no banco ou em disco local.** Storage externo fica para quando houver deploy.

## Tarefas

- [ ] Back-end do memorial e do envio
- [ ] Tela "Memorial e envio"

## Protótipo (Hi-Fi)

| Tela | Para quê |
| :--- | :--- |
| [H5 · Memorial](https://www.figma.com/design/tbMeH3sx9YwDVb6oz7bCBG/Prot%C3%B3tipo-HI-FI?node-id=2045-2) | preview, download e checklist |
| [H5b · envio concluído](https://www.figma.com/design/tbMeH3sx9YwDVb6oz7bCBG/Prot%C3%B3tipo-HI-FI?node-id=2147-2) | a confirmação do envio |

---

## `AT01-US05: Back-end do memorial e do envio [Backend]`
`Sprint 3` · `US05` · `Backend`

A geração do PDF, os anexos e a submissão.

### Passos

- [ ] `GET /api/projects/{id}/memorial` gera o PDF com identificação, UCs, memória de cálculo, demanda prevista e as revisões das normas aplicadas
- [ ] Entidade `ProjectDocument` com o tipo (ART, diagrama unifilar, planta de situação), relação N-1 com `Project`
- [ ] `POST` e `DELETE` em `/api/projects/{id}/documents`, aceitando só PDF
- [ ] `GET /api/projects/{id}/submission` devolve o checklist e o `canSubmit`
- [ ] `POST /api/projects/{id}/submit` muda o status para `UNDER_REVIEW` e grava o `submittedAt`. Devolve 422 se faltar documento
- [ ] Testes do bloqueio de envio

### Notas

- O memorial lê o último cálculo da US04. Enquanto a US04 não entra, o PDF é montado sobre um cálculo do seed
- O `submittedAt` também é usado pela US06, no SLA. É coluna **nullable** em `project`, porque projeto em rascunho não tem data de envio (e por causa das pendências 16 e 23)

Parte da US05

---

## `AT02-US05: Tela "Memorial e envio" [Frontend]`
`Sprint 3` · `US05` · `Frontend`

A etapa 4 do projeto, do service à interface.

### Passos

- [ ] Service `submission` com hooks e handlers MSW seguindo o contrato da `AT01-US05`
- [ ] Preview do memorial em PDF, com botão de download
- [ ] Checklist "Checagem antes do envio": item pendente mostra o alerta e o botão "Anexar"
- [ ] Upload dos três documentos, aceitando só PDF
- [ ] "Enviar para análise" desabilitado enquanto `canSubmit` for falso
- [ ] Tela de envio concluído, voltando para a listagem com o status "Em análise"
- [ ] O "Gerar memorial" da tela de cálculo passa a levar para esta tela

Parte da US05

---

# US06 – Fila de Análise Técnica Priorizada

`Sprint 3` · `US06`

## Descrição

Painel de triagem do analista, com indicadores, ordenação por prazo e os alertas levantados pela pré-validação.

## User Story

**Como** analista da Neoenergia,
**Quero** visualizar a fila de projetos ordenada por prazo de vencimento e pré-validada pelo sistema,
**Para que** eu possa priorizar os atendimentos críticos e focar a análise no julgamento técnico humano.

## Conversação

No topo ficam os indicadores: total na fila, vencendo o prazo, analisados no dia e taxa de reprovação no mês. A tabela é ordenada pela urgência do prazo (atrasado, vence hoje, dias restantes) e mostra um badge com a quantidade de alertas da pré-validação.

## Critérios de aceite (BDD)

**Cenário 1 (Positivo): Filtrar projetos com prazo crítico**
- **Dado** que o analista está na "Fila de análise"
- **Quando** clica no filtro "Vencendo prazo"
- **Então** a listagem exibe só os projetos que vencem hoje ou estão atrasados
- **E** exibe os alertas automáticos levantados pelo sistema

**Cenário 2 (Acesso): Iniciar análise de um projeto**
- **Dado** que o analista seleciona um projeto da fila
- **Quando** clica em "Analisar"
- **Então** é redirecionado para a tela de análise do projeto (US07)

## Recorte

- **O prazo é de 30 dias corridos a partir do envio**, conforme o [`processo-submissao.md`](../negocio/processo-submissao.md). A suspensão do prazo por falta de informação fica fora.
- **O analista é o papel `ADMIN`** dos usuários de desenvolvimento, até a Q1c definir os papéis reais (pendência 13).
- **"Analisar" leva a uma rota vazia.** A tela de análise é a US07, da Entrega 04.

## Tarefas

- [ ] Back-end da fila de análise
- [ ] Tela "Fila de análise"

## Protótipo (Hi-Fi)

| Tela | Para quê |
| :--- | :--- |
| [H6 · Fila de análise](https://www.figma.com/design/tbMeH3sx9YwDVb6oz7bCBG/Prot%C3%B3tipo-HI-FI?node-id=2082-2) | indicadores, filtros, ordenação e badges |

---

## `AT01-US06: Back-end da fila de análise [Backend]`
`Sprint 3` · `US06` · `Backend`

A listagem do analista, com os indicadores e o prazo.

### Passos

- [ ] `GET /api/review-queue` lista os projetos `UNDER_REVIEW`, ordenados pelo prazo, com filtro "Vencendo prazo" e paginação
- [ ] Prazo e situação (atrasado, vence hoje, dias restantes) calculados a partir do `submittedAt`, não persistidos
- [ ] Quantidade de alertas por projeto, vinda dos `validationWarnings` do cálculo da US04
- [ ] Indicadores: total na fila, vencendo o prazo, analisados no dia e taxa de reprovação no mês
- [ ] Endpoint restrito ao papel `ADMIN`
- [ ] Seed de projetos em análise com datas de envio variadas: atrasado, vencendo hoje e no prazo

### Notas

- Esta tarefa não espera a US05: os projetos da fila vêm do seed. Se a coluna `submittedAt` ainda não existir, quem chegar primeiro a cria (nullable), e a outra tarefa reaproveita
- Sem seed com datas variadas, o filtro "Vencendo prazo" não mostra nada no screencast

Parte da US06

---

## `AT02-US06: Tela "Fila de análise" [Frontend]`
`Sprint 3` · `US06` · `Frontend`

A tela inicial do analista, do service à interface.

### Passos

- [ ] Service `review-queue` com hooks e handlers MSW seguindo o contrato da `AT01-US06`
- [ ] Cards de indicadores no topo
- [ ] Tabela ordenada pelo prazo, com badge da situação e badge de alertas
- [ ] Filtro "Vencendo prazo" na URL via nuqs
- [ ] Botão "Analisar" levando à rota da análise do projeto
- [ ] Depois do login, o analista cai na fila, e o projetista, em "Meus projetos"

Parte da US06
