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

O contrato já está definido e documentado: envelope `{ data, pagination? }`, `id` como string, erro em `ProblemDetail`. Ver [`../tecnico/convencoes-back.md`](../tecnico/convencoes-back.md).

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

# Cards

## Bloco 0 — Desbloqueio (terça 15/09)

### `AT01-INFRA: Integrar os scaffolds de front e back na main [Infra]`
`Sprint 1`

**Descrição:**
Revisar e mergear os PRs #9 (scaffold do front) e #10 (scaffold do back) na `main`. Sem isso o repositório não tem código e o critério de commits semanais no `main` não é atendido. Resolver o conflito esperado em `docs/pendencias.md`, mantendo as duas metades da tabela.

### `AT02-INFRA: Abrir as GitHub Issues da Sprint 1 [Gestão]`
`Sprint 1`

**Descrição:**
Criar uma issue por card de atividade desta sprint. É artefato avaliado: o cronograma exige Issues em uso todas as semanas, com print no README.

### `AT03-INFRA: Seção "Entrega 02" no README com os POST-IT [Gestão]`
`Sprint 1`

**Descrição:**
Descrever US01 e US02 no formato POST-IT visto em sala, dentro da seção "Entrega 02" do README.

### `AT04-INFRA: Atualizar as user stories com a norma vigente [Produto]`
`Sprint 1`

**Descrição:**
A US02 manda exibir "NDU 001 — rev. 5.6", mas os documentos técnicos verificados contra os PDFs estabelecem DIS-NOR-053 REV 06 e DIS-NOR-030 REV 07. A história foi escrita antes da pesquisa normativa. Atualizar o texto antes de implementar, para não codificar uma norma que o projeto não reconhece.

---

## US01 – Acompanhamento de Projetos e Status

### `AT01-US01: Modelar Project e o enum ProjectStatus [Backend]`
`Sprint 1` · `US01`

**Descrição:**
Entidade `Project` com nome, endereço, município, protocolo, status e data de atualização. Enum `ProjectStatus` com os cinco estados: Rascunho, Aguardando envio, Em análise, Reprovado e Aprovado. Sem Lombok — construtor e getters à mão, construtor sem argumentos `protected` para o JPA. É a fundação das duas histórias, por isso vem primeiro.

### `AT02-US01: Entidade Finding e contagem de pendências [Backend]`
`Sprint 1` · `US01`

**Descrição:**
Entidade `Finding` (apontamento) com relação N-1 para `Project`, o suficiente para alimentar o contador que a listagem exibe nos projetos reprovados. O registro e a classificação de apontamentos são a US07.

### `AT03-US01: GET /api/projects com filtro, busca e contadores [Backend]`
`Sprint 1` · `US01`

**Descrição:**
Listagem paginada com filtro por status e busca por nome ou protocolo. A resposta traz também a contagem de projetos por status, para a barra de filtros, e a contagem de pendências de cada projeto. Atenção: o front conta página a partir de 1 e o Spring Data a partir de 0.

### `AT04-US01: Seed de projetos cobrindo os cinco status [Backend]`
`Sprint 1` · `US01`

**Descrição:**
Popular o banco com projetos em todos os cinco status, alguns reprovados com apontamentos. É o que permite a US01 existir sem a US02 estar pronta — e sem dado semeado a listagem e os contadores não mostram nada no screencast.

### `AT05-US01: Feature projects e service de listagem [Frontend]`
`Sprint 1` · `US01`

**Descrição:**
Criar `features/projects` e `services/projects` seguindo `docs/tecnico/convencoes-front.md`: endpoints, requests, query-keys, schema Zod, hook de query e handlers MSW para a tela avançar antes do back estar pronto.

### `AT06-US01: Tela "Meus Projetos" [Frontend]`
`Sprint 1` · `US01`

**Descrição:**
Listagem com o `DataTable` do scaffold, exibindo nome, endereço, quantidade de UCs, demanda, status e última atualização. Status como `Badge` colorido.

### `AT07-US01: Filtros, busca e empty state [Frontend]`
`Sprint 1` · `US01`

**Descrição:**
Filtros Todos, Rascunho, Aguardando envio, Em análise, Reprovado e Aprovado, cada um com a contagem numérica, e o filtro ativo na URL via nuqs para sobreviver a recarga. Busca por nome ou protocolo com debounce. Sem resultado, o `EmptyState` exibe "Nenhum projeto encontrado para os critérios informados". Projetos reprovados mostram a quantidade de pendências e o link "Ver apontamentos".

---

## US02 – Configuração Inicial dos Parâmetros da Edificação

### `AT01-US02: Hierarquia BuildingType com norma polimórfica [Backend]`
`Sprint 1` · `US02`

**Descrição:**
Classe abstrata `BuildingType` com as subclasses `ResidentialMultifamily`, `NonResidential` e `Mixed`, mapeadas com `@Inheritance`. Cada subclasse sobrescreve `applicableStandard()`, que decide a norma a partir do tipo, da tensão e do padrão de entrada. É esta classe que satisfaz o requisito de herança e polimorfismo da disciplina, e é o eixo do screencast de código.

### `AT02-US02: Entidade Standard e seed das normas vigentes [Backend]`
`Sprint 1` · `US02`

**Descrição:**
Entidade `Standard` com nome e revisão, populada por seed com DIS-NOR-053 REV 06 e DIS-NOR-030 REV 07. A norma é dado persistido, nunca constante no código — cada cálculo precisa registrar sob qual revisão foi feito.

### `AT03-US02: POST /api/projects com validação e norma automática [Backend]`
`Sprint 1` · `US02`

**Descrição:**
Endpoint de criação. Valida os campos obrigatórios com Bean Validation, devolvendo 400 com `errors: [{field, defaultMessage}]` quando faltar algum. Resolve a norma pelo `applicableStandard()` do tipo de edificação e a persiste junto do projeto. A norma não é aceita no corpo da requisição.

### `AT04-US02: Mutation de criação e schema do formulário [Frontend]`
`Sprint 1` · `US02`

**Descrição:**
Acrescentar ao `services/projects` já criado na US01 o request de criação, o hook de mutation com invalidação da listagem, e o schema Zod do formulário com as mensagens de validação em português.

### `AT05-US02: Tela "Novo Projeto" [Frontend]`
`Sprint 1` · `US02`

**Descrição:**
Formulário com `useZodForm` e os wrappers de `@components/form`. Campos obrigatórios bloqueiam o envio e são destacados com a mensagem de validação. A norma aplicável aparece em campo somente leitura, preenchido pela resposta da API — sem seleção manual. Ao salvar, volta para a listagem.

**Os oito campos da Conversação entram, todos.** Identificação: nome, endereço e município. Parâmetros técnicos: tipo de edificação, pavimentos, tensão, tipo de ligação e padrão de entrada. Os cenários BDD só citam três deles, mas o conjunto é o que a história define como o formulário — não aparar sob pressão de prazo.

---

## Bloco final — Entrega

### `AT05-INFRA: Screencast do sistema rodando [Gestão]`
`Sprint 1`

**Descrição:**
Vídeo no YouTube, com áudio ou legenda, percorrendo as duas histórias: criar um projeto com a norma sendo atribuída sozinha, e a listagem com filtros, contadores e busca sem resultado.

### `AT06-INFRA: Screencast da explicação do código Spring Boot [Gestão]`
`Sprint 1`

**Descrição:**
Vídeo no YouTube explicando o código. O eixo é a hierarquia `BuildingType` e o `applicableStandard()` polimórfico, mostrando como a regra normativa vira despacho por tipo em vez de condicional, e o caminho de uma requisição pelas quatro camadas.

### `AT07-INFRA: Print das GitHub Issues no README [Gestão]`
`Sprint 1`

**Descrição:**
Captura da aba Issues com as tarefas da sprint, inserida na seção "Entrega 02" do README.

---

## Riscos

**A equipe nunca rodou esta stack.** Spring Boot 4 e TanStack Router/Query são novos, e quase todo tutorial que aparece no Google é de versão anterior. As convenções em [`../tecnico/convencoes-front.md`](../tecnico/convencoes-front.md) e [`../tecnico/convencoes-back.md`](../tecnico/convencoes-back.md) existem exatamente para isso, com as diferenças de versão listadas.

**O bloco 0 é bloqueante e depende de uma pessoa.** Se os PRs não entrarem terça, toda a semana desliza.

**Sem autenticação no back.** As histórias falam em "o projetista está autenticado", mas o login ainda responde contra o MSW e o back não tem `/auth/login`. Para a Sprint 1 os projetos não são filtrados por usuário. Depende da Q1c em [`questoes-em-aberto.md`](questoes-em-aberto.md).
