# Plano da Entrega 02 — Sprint 1

> **Prazo:** segunda-feira, 21/09/2026. **Histórias:** US01 e US02.
> Critérios completos em [`../cronograma-poo.md`](../cronograma-poo.md).

Este documento é o plano de execução da Sprint 1 e, ao mesmo tempo, a especificação dos cards do Trello — cada card abaixo está no formato usado no board do semestre passado e pode ser criado como está.

---

## O que a Entrega 02 exige

| Artefato | Estado |
| :--- | :--- |
| Mínimo 2 histórias implementadas | US01 e US02 |
| Descrição em formato POST-IT na seção "Entrega 02" do README | Pendente |
| Commits semanais de código no `main` | **Em atraso — `main` está sem código** |
| GitHub Issues em uso, com print no README | **Pendente — zero issues abertas** |
| Screencast do sistema rodando | Pendente |
| Screencast da explicação do código Spring Boot | Pendente |

---

## Caminho crítico

Os scaffolds do front e do back estão em pull request aberto e **`main` não tem nenhum arquivo de código**. Enquanto os PRs não entrarem, nenhuma tarefa de história começa e o critério de commits semanais no `main` continua não atendido.

Isso é a primeira coisa da semana, não a última.

## O que permite trabalhar em paralelo desde o primeiro dia

O front tem **MSW** montado. As telas são construídas contra handlers de mock enquanto o back constrói os endpoints reais — os dois lados avançam no mesmo dia contra o mesmo contrato, e a integração no fim é apagar um handler.

O contrato já está definido e documentado: envelope `{ data, pagination? }`, `id` como string, erro em `ProblemDetail`. Ver [`../tecnico/arquitetura-back.md`](../tecnico/arquitetura-back.md).

---

## Como as duas histórias atendem o requisito de POO

| Requisito da disciplina | Onde é atendido |
| :--- | :--- |
| Mínimo 3 classes de domínio persistidas | `Project`, `BuildingType`, `Standard`, `Finding` — são 4 |
| Histórias leem e/ou escrevem no banco | US02 escreve, US01 lê |
| **Herança** | `BuildingType` abstrata → `ResidentialMultifamily`, `NonResidential`, `Mixed` |
| **Polimorfismo** | `applicableStandard()` sobrescrito por subclasse |
| **Encapsulamento** | campos privados, invariantes no construtor, sem setter onde não faz sentido |
| Sem geração automática de boilerplate | Lombok proibido; `record` para DTO, getters à mão na entidade |

O ponto central para o screencast de código: **a atribuição automática da norma não é uma cadeia de `if`** — é despacho polimórfico sobre o tipo de edificação. O critério de aceite da US02 e o requisito de herança da disciplina são satisfeitos pela mesma decisão de design, e é isso que vale a pena explicar em vídeo.

---

## Estrutura no Trello

Labels a existir no board, seguindo o padrão do semestre passado:

- **Sprint:** `Sprint 1` … `Sprint 4`
- **Épico:** `Épico 1 - Fundação` · `Épico 2 - Submissão de Projeto` · `Épico 3 - Motor de Cálculo` · `Épico 4 - Análise Técnica`
- **Prioridade:** `Prioridade - Alta` · `Média` · `Baixa`
- **Dificuldade:** `Nível de dificuldade: Fácil` · `Médio` · `Difícil`
- **Rastreio:** `US01` … `US07`

Convenção de nome: histórias como `US02 – Título`, tarefas como `AT01-US02: Título [Camada]`.

---

# Cards

## Bloco 0 — Desbloqueio (terça 15/09)

### `AT01-INFRA: Integrar os scaffolds de front e back na main [Infra]`
`Sprint 1` · `Épico 1 - Fundação`

**Descrição:**
Revisar e mergear os PRs #9 (scaffold do front) e #10 (scaffold do back) na `main`. Sem isso o repositório não tem código e o critério de commits semanais no `main` não é atendido. Resolver o conflito esperado em `docs/pendencias.md`, mantendo as duas metades da tabela.

### `AT02-INFRA: Abrir as GitHub Issues da Sprint 1 [Gestão]`
`Sprint 1` · `Épico 1 - Fundação`

**Descrição:**
Criar uma issue por card de atividade desta sprint. É artefato avaliado: o cronograma exige Issues em uso todas as semanas, com print no README.

### `AT03-INFRA: Seção "Entrega 02" no README com os POST-IT [Gestão]`
`Sprint 1` · `Épico 1 - Fundação`

**Descrição:**
Descrever US01 e US02 no formato POST-IT visto em sala, dentro da seção "Entrega 02" do README.

### `AT04-INFRA: Atualizar as user stories com a norma vigente [Produto]`
`Sprint 1` · `Épico 1 - Fundação`

**Descrição:**
A US02 manda exibir "NDU 001 — rev. 5.6", mas os documentos técnicos verificados contra os PDFs estabelecem DIS-NOR-053 REV 06 e DIS-NOR-030 REV 07. A história foi escrita antes da pesquisa normativa. Atualizar o texto antes de implementar, para não codificar uma norma que o projeto não reconhece.

---

## US02 – Configuração Inicial dos Parâmetros da Edificação

`US02` `Sprint 1` `Épico 2 - Submissão de Projeto` `Prioridade - Alta` `Nível de dificuldade: Difícil`

**Descrição:**

Formulário de parametrização técnica e identificação predial para seleção e aplicação automatizada das normas vigentes da concessionária.

**User Story:**

**Como** projetista externo, **Quero** informar os parâmetros da edificação uma única vez, **Para que** o próprio sistema determine automaticamente a norma e as tabelas aplicadas ao cálculo, eliminando divergências de interpretação.

**Conversação:**

O formulário recolhe identificação (nome, endereço, município) e parâmetros técnicos (tipo de edificação, pavimentos, tensão, tipo de ligação e padrão de entrada). O sistema bloqueia a seleção manual da norma e a atribui automaticamente a partir dos parâmetros. Campos obrigatórios vazios bloqueiam o avanço e são destacados com mensagem de validação.

**Fora do escopo da Sprint 1:** upload de planilha `.xlsx` para autopreenchimento — o texto da história diz "permite também", é adicional e não aparece em nenhum critério de aceite.

---

### `AT01-US02: Modelar Project e o enum ProjectStatus [Backend]`
`Sprint 1` · `US02`

**Descrição:**
Entidade `Project` com nome, endereço, município, protocolo, status e data de atualização. Enum `ProjectStatus` com os cinco estados: Rascunho, Aguardando envio, Em análise, Reprovado, Aprovado. Sem Lombok — construtor e getters à mão, construtor sem argumentos `protected` para o JPA.

### `AT02-US02: Hierarquia BuildingType com norma polimórfica [Backend]`
`Sprint 1` · `US02`

**Descrição:**
Classe abstrata `BuildingType` com as subclasses `ResidentialMultifamily`, `NonResidential` e `Mixed`, mapeadas com `@Inheritance`. Cada subclasse sobrescreve `applicableStandard()`, que decide a norma a partir do tipo, da tensão e do padrão de entrada. É esta classe que satisfaz o requisito de herança e polimorfismo da disciplina.

### `AT03-US02: Entidade Standard e seed das normas vigentes [Backend]`
`Sprint 1` · `US02`

**Descrição:**
Entidade `Standard` com nome e revisão, populada por seed com DIS-NOR-053 REV 06 e DIS-NOR-030 REV 07. A norma é dado persistido, nunca constante no código — cada cálculo precisa registrar sob qual revisão foi feito.

### `AT04-US02: POST /api/projects com validação e norma automática [Backend]`
`Sprint 1` · `US02`

**Descrição:**
Endpoint de criação. Valida os campos obrigatórios com Bean Validation, devolvendo 400 com `errors: [{field, defaultMessage}]` quando faltar algum. Resolve a norma pelo `applicableStandard()` do tipo de edificação e a persiste junto do projeto. A norma não é aceita no corpo da requisição.

### `AT05-US02: Feature projects e service de criação [Frontend]`
`Sprint 1` · `US02`

**Descrição:**
Criar `features/projects` e `services/projects` seguindo a receita em `docs/tecnico/receitas-front.md`: endpoints, requests, query-keys, schema Zod, hook de mutation e handlers MSW para desenvolver antes do back estar pronto.

### `AT06-US02: Tela "Novo Projeto" [Frontend]`
`Sprint 1` · `US02`

**Descrição:**
Formulário com `useZodForm` e os wrappers de `@components/form`. Campos obrigatórios bloqueiam o envio e são destacados com a mensagem de validação. A norma aplicável aparece em campo somente leitura, preenchido pela resposta da API — sem seleção manual.

---

## US01 – Acompanhamento de Projetos e Status

`US01` `Sprint 1` `Épico 2 - Submissão de Projeto` `Prioridade - Alta` `Nível de dificuldade: Médio`

**Descrição:**

Painel de gestão centralizada para acompanhamento, filtragem e consulta do status de tramitação dos projetos elétricos submetidos.

**User Story:**

**Como** projetista externo, **Quero** acompanhar todos os meus projetos e o status de cada um em um painel centralizado, **Para que** eu saiba exatamente quais exigem ação sem depender de e-mail ou telefone.

**Conversação:**

A listagem apresenta nome do projeto, endereço, quantidade de UCs, demanda calculada, status e data da última atualização. A barra superior traz filtros por situação com a contagem numérica de cada estado. Projetos reprovados exibem a quantidade de pendências e o atalho "Ver apontamentos". Busca sem resultado mostra "Nenhum projeto encontrado para os critérios informados".

**Combinado para a Sprint 1:** `Quantidade de UCs` e `Demanda calculada` vêm das US03 e US04, que são Sprint 2. Aqui ficam nulos e a tela exibe `—`. O atalho "Ver apontamentos" leva ao detalhe do projeto; a tela de apontamentos é a US07.

---

### `AT01-US01: Entidade Finding e contagem de pendências [Backend]`
`Sprint 1` · `US01`

**Descrição:**
Entidade `Finding` (apontamento) com relação N-1 para `Project`, o suficiente para alimentar o contador de pendências que a listagem exibe nos projetos reprovados. O registro e a classificação de apontamentos são a US07.

### `AT02-US01: GET /api/projects com filtro, busca e contadores [Backend]`
`Sprint 1` · `US01`

**Descrição:**
Listagem paginada com filtro por status e busca por nome ou protocolo. A resposta traz também a contagem de projetos por status, para a barra de filtros, e a contagem de pendências de cada projeto. O front conta página a partir de 1 e o Spring Data a partir de 0.

### `AT03-US01: Seed de projetos cobrindo os cinco status [Backend]`
`Sprint 1` · `US01`

**Descrição:**
Popular o banco com projetos em todos os cinco status, alguns reprovados com apontamentos, para a tela ter conteúdo real na demonstração. Sem dado semeado a listagem e os contadores não mostram nada no screencast.

### `AT04-US01: Tela "Meus Projetos" [Frontend]`
`Sprint 1` · `US01`

**Descrição:**
Listagem com o `DataTable` do scaffold, exibindo nome, endereço, quantidade de UCs, demanda, status e última atualização. Status como `Badge` colorido.

### `AT05-US01: Barra de filtros por status com contadores [Frontend]`
`Sprint 1` · `US01`

**Descrição:**
Filtros Todos, Rascunho, Aguardando envio, Em análise, Reprovado e Aprovado, cada um com a contagem numérica. O filtro ativo vive na URL via nuqs, para o estado sobreviver a recarga e ser compartilhável.

### `AT06-US01: Busca, empty state e atalho de apontamentos [Frontend]`
`Sprint 1` · `US01`

**Descrição:**
Campo de busca por nome ou protocolo com debounce. Sem resultado, o `EmptyState` exibe "Nenhum projeto encontrado para os critérios informados". Projetos reprovados mostram a quantidade de pendências e o link "Ver apontamentos".

---

## Bloco final — Entrega (domingo e segunda)

### `AT05-INFRA: Screencast do sistema rodando [Gestão]`
`Sprint 1` · `Épico 1 - Fundação`

**Descrição:**
Vídeo no YouTube, com áudio ou legenda, percorrendo as duas histórias: criar um projeto com a norma sendo atribuída sozinha, e a listagem com filtros, contadores e busca sem resultado.

### `AT06-INFRA: Screencast da explicação do código Spring Boot [Gestão]`
`Sprint 1` · `Épico 1 - Fundação`

**Descrição:**
Vídeo no YouTube explicando o código. O eixo é a hierarquia `BuildingType` e o `applicableStandard()` polimórfico, mostrando como a regra normativa vira despacho por tipo em vez de condicional, e o caminho de uma requisição pelas quatro camadas.

### `AT07-INFRA: Print das GitHub Issues no README [Gestão]`
`Sprint 1` · `Épico 1 - Fundação`

**Descrição:**
Captura da aba Issues com as tarefas da sprint, inserida na seção "Entrega 02" do README.

---

## Cronograma

| Dia | Foco |
| :--- | :--- |
| **Ter 15** | Bloco 0 inteiro. PRs mergeados, issues abertas, README atualizado |
| **Qua 16** | Back: AT01 e AT02 da US02 (domínio e polimorfismo). Front: AT05 da US02 contra MSW |
| **Qui 17** | Back: AT03 e AT04 da US02, AT01 e AT02 da US01. Front: AT06 da US02, AT04 da US01 |
| **Sex 18** | Back: AT03 da US01 (seed). Front: AT05 e AT06 da US01. Integração front ↔ back |
| **Sáb 19** | Integração e ajustes. O cronograma de Projetos 3 marca o MVP da Sprint 1 nesta data |
| **Dom 20** | Screencasts e print das issues |
| **Seg 21** | Entrega |

## Sugestão de alocação

| Quem | Papel | Frente |
| :--- | :--- | :--- |
| Igor Aragão | Tech Lead | Merge dos scaffolds, revisão de PR, integração |
| Williams Pontes | PO & Back-End | Bloco 0 de gestão, `POST /api/projects` |
| Kellwen Costa | Dev Back-End | Domínio e hierarquia `BuildingType` |
| Afonso Araujo | Eng. de Dados | Modelagem de `Standard` e os seeds |
| André, Gabriel, Jean, Lucas | FullStack | Telas das duas histórias, em dupla por história |

---

## Riscos

**A equipe nunca rodou esta stack.** Spring Boot 4 e TanStack Router/Query são novos, e quase todo tutorial que aparece no Google é de versão anterior. As receitas em [`../tecnico/receitas-front.md`](../tecnico/receitas-front.md) e [`../tecnico/receitas-back.md`](../tecnico/receitas-back.md) existem exatamente para isso, com as diferenças de versão listadas.

**O bloco 0 é bloqueante e depende de uma pessoa.** Se os PRs não entrarem terça, toda a semana desliza.

**Sem autenticação no back.** As histórias falam em "o projetista está autenticado", mas o login ainda responde contra o MSW e o back não tem `/auth/login`. Para a Sprint 1 os projetos não são filtrados por usuário. Depende da Q1c em [`questoes-em-aberto.md`](questoes-em-aberto.md).
