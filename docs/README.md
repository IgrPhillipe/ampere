# Índice da Pasta `docs/`

Documentação do projeto organizada por tema. Visão geral do produto e da equipe: [README da raiz](../README.md).

## Estrutura

```
docs/
├── ciclo-projeto-eletrico.html   documento visual de apoio à reunião com o cliente
├── negocio/      o desafio, a causa raiz, o mercado e o processo atual do cliente
├── produto/      o que será construído: objetivos, ideação e questões em aberto
├── tecnico/      norma, metodologia de cálculo, motor e design OOP
└── uso-de-ia/    registro de uso de IA, para o relatório da aula 14
```

## Documentos

| Tema       | Arquivo | Conteúdo |
| :--------- | :------ | :------- |
| Reunião    | [ciclo-projeto-eletrico.html](ciclo-projeto-eletrico.html) | Apoio visual à reunião com a Neoenergia: ciclo do projeto etapa a etapa e perguntas em aberto. Abrir no navegador |
| Processo   | [processo.md](processo.md) | Três fases do projeto e rastreabilidade fase → documento |
| Negócio    | [negocio/premissas-desafio.md](negocio/premissas-desafio.md) | Empresa, problema, impacto, stakeholders afetados e proposta de solução |
| Negócio    | [negocio/analise-causa-raiz.md](negocio/analise-causa-raiz.md) | 5 Porquês e Diagrama de Ishikawa |
| Negócio    | [negocio/processo-submissao.md](negocio/processo-submissao.md) | Fluxo atual de submissão, análise e retorno do projeto na Neoenergia |
| Negócio    | [negocio/benchmarking.md](negocio/benchmarking.md) | Concessionárias e ferramentas de mercado, comparadas por 9 critérios |
| Produto    | [produto/objetivos-projeto.md](produto/objetivos-projeto.md) | Objetivos do MVP |
| Negócio    | [negocio/mapa-stakeholders.md](negocio/mapa-stakeholders.md) | Atores por proximidade com o problema e posição dentro ou fora da Neoenergia |
| Produto    | [produto/ideacao.md](produto/ideacao.md) | Registro da Ideação Parte 1: brainstorming, riscos e proposta final |
| Produto    | [produto/questoes-em-aberto.md](produto/questoes-em-aberto.md) | Registro único das questões de produto |
| Produto    | [produto/user-stories.md](produto/user-stories.md) | 7 histórias de usuário em BDD, com critérios de confirmação e cenários. Entrega 01 de POO |
| Técnico    | [tecnico/README.md](tecnico/README.md) | Motor de cálculo e requisitos de POO |
| Técnico    | [tecnico/fontes-normativas.md](tecnico/fontes-normativas.md) | DIS-NOR-053, metodologia de cálculo, revisões e processo de submissão |
| Produto    | [produto/matriz-esforco-impacto.md](produto/matriz-esforco-impacto.md) | Priorização das histórias e ordem de construção do MVP |
| Produto    | [produto/plano-entrega-03.md](produto/plano-entrega-03.md) | Plano da Entrega 03: sprints, histórias e issues |
| Técnico    | [tecnico/engine-calculo.md](tecnico/engine-calculo.md) | Entradas, saídas, validações e rastreabilidade do motor de cálculo |
| Técnico    | [tecnico/design-system-front.md](tecnico/design-system-front.md) | Design system do front-end inspirado na identidade visual da Neoenergia |
| Técnico    | [tecnico/convencoes-back.md](tecnico/convencoes-back.md) | Padrões de código, arquitetura e receitas do back-end (Java e Spring Boot) |
| Técnico    | [tecnico/convencoes-front.md](tecnico/convencoes-front.md) | Padrões de código, arquitetura e receitas do front-end (React e TypeScript) |
| Cronograma | [cronograma-projetos3.md](cronograma-projetos3.md) | Aulas e entregáveis de Projetos 3 |
| Cronograma | [cronograma-poo.md](cronograma-poo.md) | Entregas avaliadas de POO |
| Gestão     | [pendencias.md](pendencias.md) | Backlog operacional: correções em boards, sites e configuração |
| Gestão     | [uso-de-ia/](uso-de-ia/) | Registro de uso de IA, caso a caso |

## Onde Cada Coisa Mora

Cada assunto é mantido em um único lugar:

| Assunto | Único lugar |
| :------ | :---------- |
| Questões de produto e seu estado | [produto/questoes-em-aberto.md](produto/questoes-em-aberto.md) |
| Histórias de usuário | [produto/user-stories.md](produto/user-stories.md) |
| Pendências operacionais | [pendencias.md](pendencias.md) |
| Norma, metodologia e revisões | [tecnico/fontes-normativas.md](tecnico/fontes-normativas.md) |
| Design system do front-end | [tecnico/design-system-front.md](tecnico/design-system-front.md) |
| Processo de submissão do cliente | [negocio/processo-submissao.md](negocio/processo-submissao.md) |
| Aulas, datas e entregáveis | [cronograma-projetos3.md](cronograma-projetos3.md) e [cronograma-poo.md](cronograma-poo.md) |
| Casos de uso de IA | [uso-de-ia/](uso-de-ia/) |

Os arquivos `.md` são a fonte dos fatos. O `.html` é derivado e serve para conduzir a reunião. Em conflito, vale o markdown. Uma alteração em um deles é replicada no outro na mesma leva.
