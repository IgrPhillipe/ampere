# Ideação — Parte 1

> Registro do brainstorming de soluções, da análise de riscos e da escolha da proposta final.

Fase: **Ideação** ([`../processo.md`](../processo.md)) · Janela: **15/08 a 22/08/2026** · Responsável: Todos
Entregável: ideação no board + registro das atividades 1 a 3 no **Google Sites**

**Board da sessão:** [FigJam — Ideação Parte 1](https://www.figma.com/board/H7ZlU9nAbR72LiXVLUBmqo)

> ⚠️ O enunciado da entrega diz literalmente "ideação feita no **Miro**". O time optou por FigJam, já que toda a Imersão está no Figma. **Confirmar com o orientador antes da entrega.** Se ele exigir Miro, o board foi montado em seções lineares, sem recursos exclusivos do FigJam, e é replicável manualmente.

---

## O que é uma "solução" nesta etapa

Não é funcionalidade. Funcionalidade vem depois, nas histórias de usuário (22/08 a 12/09). Aqui é **conceito de produto**.

E esse espaço já nasce estreito, o que é bom:

- O requisito de POO obriga **Java com Spring Boot e banco de dados** ([`../../app/back/README.md`](../../app/back/README.md)). App nativo, planilha e plugin de ferramenta existente já estão fora.
- [`objetivos-projeto.md`](../negocio/objetivos-projeto.md) já fixou o objetivo: MVP que automatiza e padroniza o cálculo.
- O [`benchmarking`](../negocio/benchmarking.md) já apontou as quatro lacunas do mercado.

Ou seja, "site ou aplicativo" não é a pergunta em aberto. O que varia de verdade entre propostas é **quem usa e até onde a ferramenta vai**. Por exemplo:

- Calculadora e validador para o **projetista externo**, self-service antes de submeter
- Ferramenta de conferência para o **analista interno**, durante a análise
- Plataforma que cobre **os dois lados** do fluxo
- **Consulta normativa** centralizada com calculadora acoplada
- **Módulo dentro do sistema que a Neoenergia já usa**, se é que existe um

A última só entra na mesa se a questão 9 for respondida. Vale perguntar antes da sessão: se já houver sistema de submissão e análise, construir um produto separado pode ser a decisão errada.

---

## To-do — Semana 2 (15/08 a 22/08)

**Preparação**

- [x] Criar o board da sessão e adicionar o link em [`../../README.md`](../../README.md)
- [x] Carregar o board com os insumos da Imersão (zona 0)
- [ ] Confirmar com o orientador se FigJam é aceito no lugar do Miro
- [ ] Criar a subpágina *Ideação* no Google Sites (só *Imersão* está publicada)
- [ ] Definir facilitador, formato e duração da sessão (questão 7)
- [ ] Decidir se a restrição de POO entra antes ou depois da divergência (questão 8)
- [ ] Enviar ao cliente as perguntas bloqueantes ([`questoes-em-aberto.md`](questoes-em-aberto.md#perguntas-para-enviar-ao-cliente))

**Atividade 1 — Brainstorming de possíveis soluções**

- [ ] Rodada divergente, sem filtro, uma faixa por integrante
- [ ] Agrupar cada ideia pelo **usuário que ela atende**
- [ ] Registrar todas as ideias, inclusive as descartadas, com o motivo do descarte
- [ ] Transcrever na seção [1](#1--brainstorming-de-possíveis-soluções)

**Atividade 2 — Riscos de cada solução**

- [ ] Levantar no máximo **dois riscos por proposta**
- [ ] Preencher a coluna "do que depende que não controlamos" do comparativo
- [ ] Transcrever na seção [2](#2--riscos-por-proposta)

**Atividade 3 — Proposta de solução final**

- [ ] Fechar o comparativo e escolher
- [ ] Escrever a justificativa referenciando as colunas
- [ ] Registrar as premissas assumidas, se alguma questão bloqueante ficar sem resposta
- [ ] Transcrever na seção [3](#3--proposta-de-solução-final)

**Fechamento**

- [ ] Registrar as três atividades no Google Sites
- [ ] Atualizar o status no [`../cronograma-projetos3.md`](../cronograma-projetos3.md)

---

## Estrutura do board

Três zonas, da esquerda para a direita:

| Zona                  | Conteúdo                                                                                                                                          |
| :-------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------- |
| **0. Contexto**       | Causa raiz, causas mapeadas no Ishikawa, lacunas do benchmarking, filtro de POO, usuários candidatos e a pergunta norteadora. Já preenchida.        |
| **1. Brainstorming**  | Regras da sessão, sete faixas de divergência (uma por integrante), três clusters de agrupamento por usuário atendido e a área de descartadas.       |
| **2. Riscos e decisão** | Como comparar, riscos comuns, o comparativo único das propostas, solução escolhida, justificativa, premissas e as questões 4 e 5.                 |

### Por que o agrupamento não usa as categorias do Ishikawa

Ishikawa serve para classificar **causas**, não soluções. Reusar o mesmo eixo faria quase toda ideia cair em *Methods*, e o agrupamento não informaria nada.

Os clusters são, em vez disso, **projetista externo · analista interno · os dois**. Assim a convergência produz evidência direta para a questão 1, que é o maior bloqueio do projeto.

### Como comparar as propostas

Um comparativo só, sem matriz de decisão ponderada e sem mapa de calor de risco. Com quatro propostas, essas ferramentas custam mais do que informam.

| Coluna | O que registra |
| :-- | :-- |
| Proposta | O conceito em uma frase |
| Usuário atendido | Projetista, analista ou os dois |
| Cobre as 4 lacunas? | Contra a tabela do [`benchmarking`](../negocio/benchmarking.md#02--comparativo-por-critério) |
| Cabe nas 4 entregas de POO? | Viabilidade no semestre |
| Do que depende que não controlamos | **É esta a coluna de risco** |
| Nota | Espaço livre |

Risco técnico aqui é quase zero: a stack está definida, são sete pessoas e um semestre. O que separa as propostas é **dependência externa**. Exemplos do tipo de resposta que vai nessa coluna:

| Proposta | Do que depende que não controlamos |
| :-- | :-- |
| Calculadora para o projetista | Norma completa e correta, mais um gabarito de casos já aprovados para provar que o cálculo está certo. Some-se o acesso externo (questão 1c). |
| Conferência para o analista | Entender o fluxo de análise atual, que ninguém do time viu. Tolera cobertura parcial da norma. |
| Plataforma dos dois lados | Integração com o sistema oficial de submissão, ou seja, o TI da Neoenergia. **Mas esse risco depende da questão 9:** se já existir sistema extensível, cai muito. |
| Consulta normativa | Tolera imprecisão porque informa em vez de dar veredito, mas entrega menos e cobre menos lacunas. |
| Módulo no sistema existente | Depende inteiramente de acesso, documentação e disponibilidade do time de TI da Neoenergia. Só existe se a questão 9 confirmar o sistema. |

---

## Insumos da Imersão

O que a Imersão já entregou e que fica visível na zona 0 durante toda a sessão:

| Insumo | Origem | Como usar |
| :------------------------------------ | :------------------------------------------------------------------ | :----------------------------------------------------------------- |
| Causa raiz e causas mapeadas no Ishikawa | [`../negocio/analise-causa-raiz.md`](../negocio/analise-causa-raiz.md) | Contexto do diagnóstico. Não é eixo de agrupamento das soluções.  |
| Os 4 critérios sem cobertura no mercado | [`../negocio/benchmarking.md`](../negocio/benchmarking.md)           | Validar antes do envio · apontar o erro · memória de cálculo · padronizar o resultado. É o espaço onde a solução precisa existir. |
| As 3 capacidades do objetivo           | [`../negocio/objetivos-projeto.md`](../negocio/objetivos-projeto.md) | Centralizar regras · orientar o preenchimento · reduzir interpretação. Filtro de relevância. |
| Os 2 usuários candidatos               | [`mapa-stakeholders.md`](mapa-stakeholders.md)                       | Viram os clusters de agrupamento.                                   |

### Restrição obrigatória — requisitos de POO

Qualquer solução escolhida precisa caber nos requisitos da disciplina ([`../../app/back/README.md`](../../app/back/README.md)):

- Sistema em **Java + Spring Boot** com **banco de dados**
- Mínimo **3 classes de domínio persistidas**
- **Toda história de usuário lê e/ou escreve no banco**
- Sem geração automática de boilerplate (Lombok não é permitido)

Na prática isso elimina, antes da avaliação, propostas sem persistência. Vale enunciar na abertura da sessão, e não depois da rodada divergente, para não gastar a discussão em ideias que não poderiam ser escolhidas.

---

## 1 — Brainstorming de possíveis soluções

*A preencher — atividade 1.*

| # | Ideia | Usuário atendido | Autor |
| :- | :---- | :--------------- | :---- |

**Ideias descartadas e o motivo:** a preencher.

---

## 2 — Riscos por proposta

*A preencher — atividade 2.* No máximo dois riscos por proposta.

| Proposta | Do que depende que não controlamos | O que faríamos a respeito |
| :------- | :--------------------------------- | :------------------------ |

### Riscos comuns a todas as propostas

Não diferenciam as propostas, mas precisam estar registrados:

- **Não temos o documento normativo da Neoenergia PE.** Ver questão 2 em [`questoes-em-aberto.md`](questoes-em-aberto.md).
- **A Entrega 01 de POO é 31/08**, quase duas semanas antes do que este cronograma prevê para histórias e protótipos.

---

## 3 — Proposta de solução final

*A preencher — atividade 3.*

**Solução escolhida:** TBD
**Justificativa:** TBD

**Premissas assumidas:** registrar aqui toda questão bloqueante que não tiver sido respondida a tempo, no formato "assumindo que X". Ver [`questoes-em-aberto.md`](questoes-em-aberto.md).

---

## Saídas esperadas desta etapa

Ao fim da Ideação Parte 1, estas questões devem sair resolvidas:

- Questão 4 — entrada e saída concretas do sistema
- Questão 5 — métrica de sucesso

E a atividade 1 deve ter produzido evidência suficiente para o cliente fechar a **questão 1** (quem é o usuário).
