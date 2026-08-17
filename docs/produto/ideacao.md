# Ideação — Parte 1

> Registro do brainstorming de soluções, da análise de riscos e da escolha da proposta final.

Fase: **Ideação** ([`../processo.md`](../processo.md)) · Janela: **15/08 a 22/08/2026** · Responsável: Todos
Entregável: ideação no board + registro das atividades 1 a 3 no **Google Sites**

**Board da sessão:** [FigJam — Ideação Parte 1](https://www.figma.com/board/H7ZlU9nAbR72LiXVLUBmqo)

> ⚠️ O enunciado da entrega diz literalmente "ideação feita no **Miro**". O time optou por FigJam, já que toda a Imersão está no Figma. **Confirmar com o orientador antes da entrega.** Se ele exigir Miro, o board foi montado em seções lineares, sem recursos exclusivos do FigJam, e é replicável manualmente.

---

## To-do — Semana 2 (15/08 a 22/08)

**Preparação**

- [x] Criar o board da sessão e adicionar o link em [`../../README.md`](../../README.md)
- [ ] Confirmar com o orientador se FigJam é aceito no lugar do Miro
- [ ] Criar a subpágina *Ideação* no Google Sites (só *Imersão* está publicada)
- [ ] Definir facilitador, formato e duração da sessão
- [x] Colar no board os insumos da Imersão (zona 0 do FigJam, ver [Insumos](#insumos-da-imersão) abaixo)
- [ ] Definir a escala de risco (questão 8)
- [ ] Definir o critério de decisão da solução final (questão 7)
- [ ] Enviar ao cliente as perguntas bloqueantes ([`questoes-em-aberto.md`](questoes-em-aberto.md#perguntas-para-enviar-ao-cliente))

**Atividade 1 — Brainstorming de possíveis soluções**

- [ ] Rodada divergente, sem filtro
- [ ] Agrupamento das ideias por tema
- [ ] Registrar **todas** as ideias no Miro, inclusive as descartadas
- [ ] Transcrever o resultado na seção [1](#1--brainstorming-de-possíveis-soluções) deste documento

**Atividade 2 — Riscos de cada solução**

- [ ] Avaliar cada proposta na escala definida
- [ ] Registrar mitigação por risco
- [ ] Transcrever na seção [2](#2--riscos-por-solução)

**Atividade 3 — Proposta de solução final**

- [ ] Aplicar o critério de decisão
- [ ] Escrever a justificativa
- [ ] Registrar as premissas assumidas, se alguma questão bloqueante ficar sem resposta
- [ ] Transcrever na seção [3](#3--proposta-de-solução-final)

**Fechamento**

- [ ] Registrar as três atividades no Google Sites
- [ ] Atualizar o status no [`../cronograma-projetos3.md`](../cronograma-projetos3.md)

---

## Estrutura do board

O FigJam segue as três atividades, da esquerda para a direita:

| Zona | Conteúdo |
| :--------------------- | :------------------------------------------------------------------------------------------- |
| **0. Contexto**        | Causa raiz, categorias alvo do Ishikawa, lacunas do benchmarking, filtro de POO, usuários candidatos e a pergunta norteadora. Já preenchida. |
| **1. Brainstorming**   | Regras da sessão, sete faixas de divergência (uma por integrante), três clusters de agrupamento e a área de descartadas. |
| **2. Riscos**          | Escala de risco, matriz probabilidade por impacto e a tabela de riscos por solução.            |
| **3. Decisão**         | Critério de decisão, matriz de decisão, solução escolhida, justificativa e premissas.          |
| **4. Saídas**          | As quatro questões que a etapa precisa fechar, mais o checklist de fechamento.                 |

---

## Insumos da Imersão

O que a Imersão já entregou e que deve estar visível durante a sessão:

| Insumo | Origem | Como usar |
| :------------------------------------ | :------------------------------------------------------------------ | :----------------------------------------------------------------- |
| Causa raiz e as 4 categorias do Ishikawa | [`../negocio/analise-causa-raiz.md`](../negocio/analise-causa-raiz.md) | Cada ideia deve atacar *Machine*, *Methods* ou *Materials*. *Personal* está fora de escopo. |
| Os 4 critérios sem cobertura no mercado | [`../negocio/benchmarking.md`](../negocio/benchmarking.md)           | Validar antes do envio · apontar o erro · memória de cálculo · padronizar o resultado. É o espaço onde a solução precisa existir. |
| As 3 capacidades do objetivo           | [`../negocio/objetivos-projeto.md`](../negocio/objetivos-projeto.md) | Centralizar regras · orientar o preenchimento · reduzir interpretação. Filtro de relevância. |
| Os 2 usuários candidatos               | [`mapa-stakeholders.md`](mapa-stakeholders.md)                       | Projetista externo (fora) e Área de análise de projetos (dentro).   |

### Restrição obrigatória — requisitos de POO

Qualquer solução escolhida precisa caber nos requisitos da disciplina ([`../../app/back/README.md`](../../app/back/README.md)):

- Sistema em **Java + Spring Boot** com **banco de dados**
- Mínimo **3 classes de domínio persistidas**
- **Toda história de usuário lê e/ou escreve no banco**
- Sem geração automática de boilerplate (Lombok não é permitido)

Na prática isso elimina, antes da avaliação, propostas sem persistência — planilha inteligente, plugin de ferramenta existente, checklist em PDF, calculadora client-side. Vale enunciar isso na abertura da sessão, e não depois da rodada divergente, para não gastar a discussão em ideias que não poderiam ser escolhidas.

---

## 1 — Brainstorming de possíveis soluções

*A preencher — atividade 1.*

| # | Ideia | Categoria Ishikawa atacada | Autor |
| :- | :---- | :------------------------- | :---- |

**Ideias descartadas na convergência e o porquê:** a preencher.

---

## 2 — Riscos por solução

*A preencher — atividade 2.* Escala de avaliação: **TBD** (questão 8).

| Solução | Risco | Probabilidade | Impacto | Mitigação |
| :------ | :---- | :------------ | :------ | :-------- |

### Risco comum a todas as propostas

**Não temos o documento normativo da Neoenergia PE.** Nenhum documento do projeto cita a fonte das regras que o motor precisa aplicar — ver questão 2 em [`questoes-em-aberto.md`](questoes-em-aberto.md). Enquanto isso não for resolvido, esse risco pesa igualmente sobre todas as propostas e não serve para diferenciá-las.

---

## 3 — Proposta de solução final

*A preencher — atividade 3.*

**Solução escolhida:** TBD
**Critério de decisão aplicado:** TBD (questão 7)
**Justificativa:** TBD

**Premissas assumidas:** registrar aqui toda questão bloqueante que não tiver sido respondida a tempo, no formato "assumindo que X". Ver [`questoes-em-aberto.md`](questoes-em-aberto.md).

---

## Saídas esperadas desta etapa

Ao fim da Ideação Parte 1, estas questões devem sair resolvidas:

- Questão 4 — entrada e saída concretas do sistema
- Questão 5 — métrica de sucesso
- Questão 7 — critério de decisão
- Questão 8 — escala de risco
