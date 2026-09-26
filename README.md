# AMPERE: Automação e Modelagem para Projetos de Energia em Redes Edificadas

O AMPERE automatiza o cálculo de demanda elétrica de edificações com múltiplas unidades consumidoras. A ferramenta aplica de forma padronizada as regras normativas vigentes da Neoenergia Pernambuco, elimina erros de interpretação das normas e reduz a reprovação de projetos por falhas de cálculo.

---

## Visão Geral

A Neoenergia Pernambuco recebe cerca de 1.400 projetos elétricos por ano de edificações com múltiplas unidades consumidoras. Cerca de 50 % são reprovados por erros no cálculo de demanda. A complexidade das tabelas, dos parâmetros e das regras normativas induz a erros tanto os clientes quanto as equipes de análise.

O AMPERE calcula a demanda com as regras normativas vigentes, sempre do mesmo modo, e registra a regra usada em cada etapa.

Detalhes em [`docs/negocio/premissas-desafio.md`](docs/negocio/premissas-desafio.md).

---

## Tecnologias

| Camada | Tecnologia | Papel |
| :--- | :--- | :--- |
| Back-end | Java e Spring Boot | API REST e motor de cálculo de demanda com classes de domínio |
| Banco de dados | PostgreSQL | Entidades persistidas e tabelas normativas versionadas por revisão |
| Front-end | React e Vite | Interface do projetista e do analista, consumindo a API |
| Prototipação | Figma | Protótipos Lo-Fi e Hi-Fi das telas dos dois perfis |
| Documentação | Markdown | Decisões, normas e processo, versionados junto com o código |
| Gestão | Trello e GitHub Issues | Backlog, issues e acompanhamento semanal |

Documentação por camada:

- [`app/back/README.md`](app/back/README.md)
- [`app/front/README.md`](app/front/README.md)
- [`docs/tecnico/README.md`](docs/tecnico/README.md)

---

## Descoberta e Análise

O projeto tem três fases: **Imersão**, **Ideação** e **Desenvolvimento do MVP** ([`docs/processo.md`](docs/processo.md)). A Imersão está concluída e produziu os documentos abaixo.

| Documento | Conteúdo |
| :--- | :--- |
| [Premissas do desafio](docs/negocio/premissas-desafio.md) | O desafio apresentado pela Neoenergia PE: problema, impacto e proposta de solução |
| [Análise de causa raiz](docs/negocio/analise-causa-raiz.md) | 5 Porquês e Ishikawa sobre a reprovação de projetos |
| [Benchmarking](docs/negocio/benchmarking.md) | COPEL, CEMIG, Enel, CPFL e AltoQi comparadas em 9 critérios. Nenhuma une cálculo e aprovação |
| [Objetivos do projeto](docs/produto/objetivos-projeto.md) | Metas do MVP e sua relação com a descoberta |
| [Mapa de stakeholders](docs/negocio/mapa-stakeholders.md) | Atores afetados, por proximidade com o problema e posição dentro ou fora da Neoenergia |
| [Processo de submissão](docs/negocio/processo-submissao.md) | Fluxo atual de envio, análise e devolução do projeto |
| [Fontes normativas](docs/tecnico/fontes-normativas.md) | DIS-NOR-053, DIS-NOR-030, metodologia de cálculo e revisões |
| [Questões em aberto](docs/produto/questoes-em-aberto.md) | Decisões pendentes para transformar objetivos em requisitos |

---

## Deploy

| Ambiente | URL |
| :--- | :--- |
| Front-end | https://ampere-virid.vercel.app |
| Back-end (API) | https://ampere-4eyz.onrender.com/api |

---

## Como Rodar

O front consome a API real, e a API persiste as classes de domínio no PostgreSQL.

**Back-end** (Java 21, Spring Boot e PostgreSQL). Requer Docker.

```bash
cd app/back && cp .env.example .env && docker compose up
```

A API sobe em `http://localhost:8080/api`, com a documentação em `/api/docs`. Com a JDK 21 instalada, a aplicação também roda localmente contra o banco em container. Detalhes em [`app/back/README.md`](app/back/README.md).

**Front-end** (React 19, Vite e TypeScript). Requer Node 24+ e pnpm.

```bash
cd app/front && cp .env.example .env && pnpm install && pnpm dev
```

O front sobe em `http://localhost:5173` e faz proxy de `/api` para o back-end, que precisa estar rodando. Credenciais de teste e comandos em [`app/front/README.md`](app/front/README.md).

---

## Entregas

| Entrega | Data | Situação |
| :--- | :--- | :--- |
| [Entrega 01](#entrega-01) | 31/08/2026 | Finalizada |
| [Entrega 02](#entrega-02) | 21/09/2026 | Finalizada |
| [Entrega 03](#entrega-03) | 19/10/2026 | Em andamento |
| [Entrega 04](#entrega-04) | 09/11/2026 | Não iniciada |

Critérios de cada entrega: [`docs/cronograma-poo.md`](docs/cronograma-poo.md) (POO) e [`docs/cronograma-projetos3.md`](docs/cronograma-projetos3.md) (Projetos 3).

### Entrega 01

- **Data:** 31/08/2026
- **Escopo:** 7 histórias de usuário em BDD, protótipo Lo-Fi das duas jornadas e screencast do protótipo.

#### Artefatos

| Artefato | Link |
| :--- | :--- |
| Histórias de usuário | [`docs/produto/user-stories.md`](docs/produto/user-stories.md) |
| Protótipo Lo-Fi | [Figma](https://www.figma.com/design/gSwTyjY0iSzmDNAe4s6XeE/Prot%C3%B3tipo-LO-FI?node-id=18-4) |
| Screencast do protótipo | [YouTube](https://youtu.be/OI0QDboGtk4) |

#### Histórias e Telas

| História | Título | Perfil | Telas no protótipo Hi-Fi |
| :---: | :--- | :---: | :--- |
| US01 | [Acompanhamento de projetos e status](docs/produto/user-stories.md#us01-acompanhamento-de-projetos-e-status) | Projetista | [H1: Meus projetos](https://www.figma.com/design/tbMeH3sx9YwDVb6oz7bCBG/Prot%C3%B3tipo-HI-FI?node-id=2037-2)<br>[H1a: Busca sem resultados](https://www.figma.com/design/tbMeH3sx9YwDVb6oz7bCBG/Prot%C3%B3tipo-HI-FI?node-id=2118-2)<br>[H1b: Detalhes](https://www.figma.com/design/tbMeH3sx9YwDVb6oz7bCBG/Prot%C3%B3tipo-HI-FI?node-id=2155-2) |
| US02 | [Configuração inicial dos parâmetros da edificação](docs/produto/user-stories.md#us02-configuração-inicial-dos-parâmetros-da-edificação) | Projetista | [H2: Novo projeto](https://www.figma.com/design/tbMeH3sx9YwDVb6oz7bCBG/Prot%C3%B3tipo-HI-FI?node-id=2042-2) |
| US03 | [Cadastro e validação em tempo real de UCs](docs/produto/user-stories.md#us03-cadastro-e-validação-em-tempo-real-de-unidades-consumidoras) | Projetista | [H3: Unidades consumidoras](https://www.figma.com/design/tbMeH3sx9YwDVb6oz7bCBG/Prot%C3%B3tipo-HI-FI?node-id=2044-2)<br>[H3a: Adicionar grupo](https://www.figma.com/design/tbMeH3sx9YwDVb6oz7bCBG/Prot%C3%B3tipo-HI-FI?node-id=2152-2) |
| US04 | [Conferência do cálculo passo a passo da demanda](docs/produto/user-stories.md#us04-conferência-do-cálculo-passo-a-passo-da-demanda) | Projetista | [H4: Cálculo de demanda](https://www.figma.com/design/tbMeH3sx9YwDVb6oz7bCBG/Prot%C3%B3tipo-HI-FI?node-id=2032-2) |
| US05 | [Geração de memorial e envio do projeto](docs/produto/user-stories.md#us05-geração-de-memorial-e-envio-do-projeto) | Projetista | [H5: Memorial](https://www.figma.com/design/tbMeH3sx9YwDVb6oz7bCBG/Prot%C3%B3tipo-HI-FI?node-id=2045-2)<br>[H5b: Envio concluído](https://www.figma.com/design/tbMeH3sx9YwDVb6oz7bCBG/Prot%C3%B3tipo-HI-FI?node-id=2147-2) |
| US06 | [Fila de análise técnica priorizada](docs/produto/user-stories.md#us06-fila-de-análise-técnica-priorizada) | Analista | [H6: Fila de análise](https://www.figma.com/design/tbMeH3sx9YwDVb6oz7bCBG/Prot%C3%B3tipo-HI-FI?node-id=2082-2) |
| US07 | [Auditoria de memória e registro de apontamentos](docs/produto/user-stories.md#us07-auditoria-de-memória-e-registro-pontual-de-apontamentos) | Analista | [H7: Análise do projeto](https://www.figma.com/design/tbMeH3sx9YwDVb6oz7bCBG/Prot%C3%B3tipo-HI-FI?node-id=2083-2)<br>[H8: Histórico do protocolo](https://www.figma.com/design/tbMeH3sx9YwDVb6oz7bCBG/Prot%C3%B3tipo-HI-FI?node-id=2085-2) |

### Entrega 02

- **Data:** 21/09/2026
- **Escopo:** US01 e US02 implementadas com back-end Spring Boot, front-end React e PostgreSQL.

#### Histórias Implementadas

##### US01: Acompanhamento de Projetos e Status

> **Como** projetista externo,  
> **Quero** acompanhar todos os meus projetos e o status de cada um em um painel centralizado,  
> **Para que** eu saiba exatamente quais exigem ação sem depender de e-mail ou telefone.

| Item | Descrição |
| :--- | :--- |
| **Entregue** | Listagem com nome, endereço, quantidade de UCs, demanda, status e última atualização<br>Filtros por situação com contagem, preservados na URL<br>Busca por nome ou protocolo<br>Estado vazio "Nenhum projeto encontrado para os critérios informados"<br>Atalho "Ver apontamentos" nos projetos reprovados |
| **Back-end** | [`ProjectController`](app/back/src/main/java/br/com/ampere/controller/ProjectController.java), [`ProjectListing`](app/back/src/main/java/br/com/ampere/service/ProjectListing.java) |
| **Front-end** | [`ProjectsPage`](app/front/src/features/projects/pages/ProjectsPage/ProjectsPage.tsx) |
| **Issues** | [#13](https://github.com/IgrPhillipe/ampere/issues/13), [#19](https://github.com/IgrPhillipe/ampere/issues/19), [#23](https://github.com/IgrPhillipe/ampere/issues/23) |

##### US02: Configuração Inicial dos Parâmetros da Edificação

> **Como** projetista externo,  
> **Quero** informar os parâmetros da edificação uma única vez,  
> **Para que** o próprio sistema determine automaticamente a norma e as tabelas aplicadas ao cálculo, eliminando divergências de interpretação.

| Item | Descrição |
| :--- | :--- |
| **Entregue** | Formulário de identificação e parâmetros técnicos<br>Campos obrigatórios bloqueiam o avanço<br>DIS-NOR-053 REV 06 e DIS-NOR-030 REV 07 atribuídas a partir do tipo de edificação, sem seleção manual<br>Norma persistida junto do projeto |
| **Back-end** | [`BuildingType`](app/back/src/main/java/br/com/ampere/domain/BuildingType.java) e subclasses, [`ApplicableStandards`](app/back/src/main/java/br/com/ampere/service/ApplicableStandards.java), [`ProjectCreation`](app/back/src/main/java/br/com/ampere/service/ProjectCreation.java) |
| **Front-end** | [`NewProjectPage`](app/front/src/features/projects/pages/NewProjectPage/NewProjectPage.tsx) |
| **Issues** | [#14](https://github.com/IgrPhillipe/ampere/issues/14), [#26](https://github.com/IgrPhillipe/ampere/issues/26), [#30](https://github.com/IgrPhillipe/ampere/issues/30) |

#### Requisitos de POO

| Requisito | Onde é atendido |
| :--- | :--- |
| Mínimo de 3 classes de domínio persistidas | `Project`, `BuildingType`, `Standard`, `Finding` e `User` |
| Histórias que leem e escrevem no banco | US02 grava o projeto; US01 lê a listagem |
| **Herança** | `BuildingType` abstrata, estendida por `ResidentialMultifamily`, `NonResidential` e `Mixed` |
| **Polimorfismo** | Cada subclasse sobrescreve `demandRules()`. A norma aplicável é derivada dessas regras, sem condicional por tipo |
| **Encapsulamento** | Campos privados, invariantes validadas no construtor e nenhum setter sem uso |
| Sem geração automática de código | Lombok proibido. DTOs são `record` e as entidades têm getters escritos à mão |

#### Artefatos

| Artefato | Link |
| :--- | :--- |
| Histórias implementadas (POST-IT) | [Histórias implementadas](#histórias-implementadas) |
| Print do GitHub Issues | ![Print das GitHub Issues](docs/produto/Issues.png) |
| Screencast do sistema | [YouTube, parte 1](https://youtu.be/YMnBWUuncdQ)<br>[YouTube, parte 2](https://youtu.be/6X58x5Wv9ho) |
| Screencast da explicação do código | [YouTube, parte 1](https://youtu.be/_4FRXZAnfkg)<br>[YouTube, parte 2](https://youtu.be/_nDhOTqJTPY) |

### Entrega 03

- **Data:** 19/10/2026
- **Escopo:** US03 e US04 na Sprint 2 (20/09 a 26/09); US05 e US06 na Sprint 3 (27/09 a 03/10).
- **Planejamento:** [`docs/produto/plano-entrega-03.md`](docs/produto/plano-entrega-03.md) e [milestone Entrega 03](https://github.com/IgrPhillipe/ampere/milestone/2).

#### Histórias Implementadas

##### US03: Cadastro e Validação em Tempo Real de Unidades Consumidoras

> **Como** projetista externo,  
> **Quero** cadastrar as unidades consumidoras agrupadas por tipo e receber validações técnicas instantâneas,  
> **Para que** eu possa corrigir inconsistências antes da submissão formal.

| Item | Descrição |
| :--- | :--- |
| **Entregue** | Grupos de unidades por tipo: residencial, cargas de área comum ou comerciais e recarga de veículo elétrico<br>Situação de cada grupo (validado, revisar, falta dado) conforme DIS-NOR-053 e DIS-NOR-030<br>Painel de validação em tempo real, com as pendências que bloqueiam o cálculo e atalho para corrigir<br>"Calcular demanda" liberado somente sem pendências |
| **Back-end** | [`ConsumerUnitGroup`](app/back/src/main/java/br/com/ampere/domain/ConsumerUnitGroup.java) e subclasses, [`ConsumerUnitGroupController`](app/back/src/main/java/br/com/ampere/controller/ConsumerUnitGroupController.java) |
| **Front-end** | [`ConsumerUnitsPage`](app/front/src/features/projects/pages/ConsumerUnitsPage/ConsumerUnitsPage.tsx) |
| **Issues** | [#53](https://github.com/IgrPhillipe/ampere/issues/53), [#57](https://github.com/IgrPhillipe/ampere/issues/57), [#58](https://github.com/IgrPhillipe/ampere/issues/58), [#68](https://github.com/IgrPhillipe/ampere/issues/68) |

##### US04: Conferência do Cálculo Passo a Passo da Demanda

> **Como** projetista externo,  
> **Quero** visualizar a memória de cálculo de demanda detalhada passo a passo com a regra normativa usada,  
> **Para que** eu possa auditar o dimensionamento e sustentá-lo tecnicamente.

| Item | Descrição |
| :--- | :--- |
| **Entregue** | Motor de cálculo com as parcelas Drf, Ds, Dc e Dve e a demanda total Ded (DIS-NOR-053 Anexo I e DIS-NOR-030)<br>Memória de cálculo por etapa, com fórmula, valores e tabela normativa aplicada<br>Painel de rastreabilidade: demanda calculada, mínimo por tensão, corrente, padrão de entrada, proteção geral e ramal<br>Cada cálculo gravado com as revisões das normas e as tabelas aplicadas no momento<br>Tabelas normativas no banco, cadastradas e aprovadas por pessoas diferentes na área administrativa<br>Exemplos 1 e 2 do Anexo I da DIS-NOR-053 como testes de regressão |
| **Back-end** | [`DemandEngine`](app/back/src/main/java/br/com/ampere/domain/DemandEngine.java), [`Calculation`](app/back/src/main/java/br/com/ampere/domain/Calculation.java), [`NormativeTable`](app/back/src/main/java/br/com/ampere/domain/NormativeTable.java), [`DemandCalculationController`](app/back/src/main/java/br/com/ampere/controller/DemandCalculationController.java), [`AdminNormativeTableController`](app/back/src/main/java/br/com/ampere/controller/AdminNormativeTableController.java) |
| **Front-end** | [`CalculationPage`](app/front/src/features/projects/pages/CalculationPage/CalculationPage.tsx), [`NormativeTablesPage`](app/front/src/features/admin/pages/NormativeTablesPage/NormativeTablesPage.tsx) |
| **Issues** | [#54](https://github.com/IgrPhillipe/ampere/issues/54), [#59](https://github.com/IgrPhillipe/ampere/issues/59), [#60](https://github.com/IgrPhillipe/ampere/issues/60), [#68](https://github.com/IgrPhillipe/ampere/issues/68) |

US05 e US06 estão em desenvolvimento na Sprint 3.

#### Requisitos de POO

| Requisito | Onde é atendido |
| :--- | :--- |
| Classes de domínio persistidas | `ConsumerUnitGroup` e subclasses, `Calculation` e `NormativeTable` |
| Histórias que leem e escrevem no banco | US03 grava e lê os grupos; US04 lê as tabelas publicadas e grava o cálculo |
| **Herança** | `ConsumerUnitGroup` abstrata, estendida por `ResidentialGroup`, `LoadGroup` e `EvChargingGroup` |
| **Polimorfismo** | Cada subclasse sobrescreve `validate()` e `demand()`. O `DemandEngine` percorre os grupos sem condicional por tipo. `DemandComponent` e `LoadCategory` implementam o cálculo em cada constante |
| **Encapsulamento** | `NormativeTable` muda de estado somente por `revise`, `publish` e `supersede`, e quem cadastra não publica. `Calculation` não tem setters |
| Sem geração automática de código | Lombok proibido. DTOs são `record` e as entidades têm getters escritos à mão |

#### Artefatos

| Artefato | Link |
| :--- | :--- |
| Histórias implementadas (POST-IT) | [Histórias implementadas](#histórias-implementadas-1) |
| Print do GitHub Issues | Pendente |
| Screencast do sistema | Pendente |
| Screencast da explicação do código | Pendente |

### Entrega 04

- **Data:** 09/11/2026
- **Escopo:** histórias restantes e fechamento do produto para a apresentação final.

#### Artefatos

| Artefato | Link |
| :--- | :--- |
| Histórias implementadas (POST-IT) | Pendente |
| Print do GitHub Issues | Pendente |
| Screencast final do sistema | Pendente |
| Screencast da explicação do código | Pendente |

---

## Links

| Área | Link |
| :--- | :--- |
| Deploy (front) | [Vercel](https://ampere-virid.vercel.app) |
| Deploy (API) | [Render](https://ampere-4eyz.onrender.com/api) |
| Site do grupo | [Google Sites](https://sites.google.com/cesar.school/site-grupo-4/) |
| Backlog | [GitHub Project](https://github.com/users/IgrPhillipe/projects/4) |
| Issues | [GitHub Issues](https://github.com/IgrPhillipe/ampere/issues) |
| Gestão do projeto | [Trello](https://trello.com/b/yd35ygrF/cesar-projetos-3) |
| Ideação | [FigJam](https://www.figma.com/board/H7ZlU9nAbR72LiXVLUBmqo) |
| Descoberta | [Figma](https://www.figma.com/files/team/1541129127160121770/project/636750169?fuid=1543015890914897932) |
| Protótipo Hi-Fi | [Figma](https://www.figma.com/design/tbMeH3sx9YwDVb6oz7bCBG/Prot%C3%B3tipo-HI-FI) |
| Protótipo Lo-Fi | [Figma](https://www.figma.com/design/gSwTyjY0iSzmDNAe4s6XeE/Prot%C3%B3tipo-LO-FI?node-id=18-4) |
| Drive | [Google Drive](https://drive.google.com/drive/u/1/folders/13xm3xImWBu0tH-wV9_ENizb65mgrkQ3l) |
| Cronograma de Projetos 3 | [`docs/cronograma-projetos3.md`](docs/cronograma-projetos3.md) |
| Cronograma de POO | [`docs/cronograma-poo.md`](docs/cronograma-poo.md) |

---

## Equipe e Papéis

| Nome | Papel | E-mail | Entrada | Saída | LinkedIn | GitHub |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| _Afonso Araujo_ | Engenheiro de Dados | ahma@cesar.school | 08/08/2026 | | [LinkedIn](https://www.linkedin.com/in/afonso-araujo-8ab810369/) | [GitHub](https://github.com/araujo1901mx) |
| _André Montenegro_ | Dev FullStack | agmos@cesar.school | 08/08/2026 | | [LinkedIn](https://www.linkedin.com/in/andr%C3%A9-montenegro-420132391/) | [GitHub](https://github.com/andre4383) |
| _Gabriel Boeckmann_ | Dev FullStack | gabs@cesar.school | 08/09/2026 | | [LinkedIn](https://www.linkedin.com/in/gabriel-araujo-boeckmann-e-silva/) | [GitHub](https://github.com/bielabs) |
| _Igor Aragão_ | Tech Lead e Dev FullStack | ipara@cesar.school | 08/08/2026 | | [LinkedIn](https://www.linkedin.com/in/igrphillipe/) | [GitHub](https://github.com/IgrPhillipe) |
| _Jean Augusto_ | Dev FullStack | jasm2@cesar.school | 08/08/2026 | | [LinkedIn](https://www.linkedin.com/in/jean-augusto-0562953b4/) | [GitHub](https://github.com/jeanaugustox) |
| _Kellwen Costa_ | Dev Back-End | kilc@cesar.school | 08/08/2026 | | [LinkedIn](https://www.linkedin.com/in/kellwencosta/) | [GitHub](https://github.com/kellwencosta) |
| _Lucas Gabriel_ | Dev FullStack | lgcs2@cesar.school | 08/08/2026 | | [LinkedIn](https://www.linkedin.com/in/lucasgabrielcs/) | [GitHub](https://github.com/lucasgabrielcs) |
| _Williams Pontes_ | Product Owner e Dev Back-End | jwlp@cesar.school | 08/08/2026 | | [LinkedIn](https://www.linkedin.com/in/williams-pontes/) | [GitHub](https://github.com/WillPontes) |

---

Projeto das disciplinas **Projetos 3** e **Programação Orientada a Objetos**, CESAR School, 2026.2.
Empresa parceira: **Neoenergia Pernambuco** (grupo Iberdrola).
