# Índice da pasta `docs/`

Documentação do projeto organizada por tema. Para visão geral do produto e equipe, ver o [README da raiz](../README.md).

## Estrutura

```
docs/
├── ciclo-projeto-eletrico.html   documento visual de apoio à reunião com o cliente
├── negocio/      por que o desafio existe, causa raiz, benchmarking e objetivos
├── produto/      stakeholders, questões em aberto, user stories e backlog
├── tecnico/      motor de cálculo, OOP design e convenções
└── diagramas/    diagramas de US e fluxos (a preencher)
```

## Documentos

| Tema       | Arquivo                                                            | Conteúdo                                                                                    |
| :--------- | :------------------------------------------------------------------ | :-------------------------------------------------------------------------------------------- |
| Reunião    | [ciclo-projeto-eletrico.html](ciclo-projeto-eletrico.html) | Documento visual de apoio à reunião com a Neoenergia: o ciclo do projeto etapa a etapa, o que já sabemos e as 15 perguntas em aberto. Abrir no navegador. |
| Processo   | [processo.md](processo.md)                                          | As três fases do projeto (Imersão, Ideação, Desenvolvimento) e a rastreabilidade fase → documento. |
| Negócio    | [negocio/premissas-desafio.md](negocio/premissas-desafio.md)        | Racional do desafio: empresa, problema, consequências, stakeholders e proposta de solução.  |
| Negócio    | [negocio/analise-causa-raiz.md](negocio/analise-causa-raiz.md)      | 5 Porquês e Diagrama de Ishikawa — investigação da origem do índice de reprovação.          |
| Negócio    | [negocio/benchmarking.md](negocio/benchmarking.md)                  | Concessionárias e ferramentas de mercado, comparativo por 9 critérios e a lacuna encontrada. |
| Negócio    | [negocio/objetivos-projeto.md](negocio/objetivos-projeto.md)        | O que o MVP precisa alcançar e como isso responde à descoberta.                              |
| Produto    | [produto/mapa-stakeholders.md](produto/mapa-stakeholders.md)        | Atores por grau de proximidade com o problema e posição dentro/fora da Neoenergia.           |
| Produto    | [produto/ideacao.md](produto/ideacao.md)                            | Ideação Parte 1: to-do da semana, brainstorming, riscos e proposta de solução final.         |
| Produto    | [produto/questoes-em-aberto.md](produto/questoes-em-aberto.md)      | Decisões que faltam para transformar os objetivos em requisitos construíveis.                |
| Técnico    | [tecnico/README.md](tecnico/README.md)                              | Ponto de entrada da documentação técnica: motor de cálculo e requisitos POO.                 |
| Técnico    | [tecnico/fontes-normativas.md](tecnico/fontes-normativas.md)        | A norma que rege o cálculo (DIS-NOR-053), a metodologia do Anexo I, o processo de submissão atual e o que segue inacessível. |
| Cronograma | [cronograma-projetos3.md](cronograma-projetos3.md)                  | Atividades do time em Projetos 3, com responsável, prioridade e status.                      |
| Cronograma | [cronograma-poo.md](cronograma-poo.md)                              | Marcos, checklists por entrega e distribuição de notas da disciplina de POO.                 |

---

## Fonte de verdade

Os arquivos **`.md` são o registro** e mandam nos fatos. O **`.html` é derivado**, feito para conduzir a reunião com o cliente.

Quando os dois falarem da mesma coisa — perguntas em aberto, estado das etapas, dados da norma — o markdown vence. Ao alterar um, refletir no outro na mesma leva: já divergiram uma vez, quando a lista de perguntas do HTML ficou pedindo a base normativa que os `.md` já registravam como encontrada.

| Assunto | Fonte de verdade |
| :------------------------------ | :------------------------------------------------------------------ |
| Questões em aberto e numeração  | [`produto/questoes-em-aberto.md`](produto/questoes-em-aberto.md)     |
| Norma, metodologia e revisões   | [`tecnico/fontes-normativas.md`](tecnico/fontes-normativas.md)       |
| Registro da Ideação             | [`produto/ideacao.md`](produto/ideacao.md)                           |
| Datas e entregas                | [`cronograma-projetos3.md`](cronograma-projetos3.md) · [`cronograma-poo.md`](cronograma-poo.md) |
