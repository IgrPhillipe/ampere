# Questões em Aberto

> A Imersão definiu bem **o problema**. Ela ainda não define **o produto**. Este documento registra as decisões que faltam para transformar os objetivos em requisitos construíveis.

Regra: nenhuma dessas questões deve ser respondida por suposição dentro dos outros documentos. Enquanto estiverem abertas, aparecem como `TBD` com ponteiro para cá.

---

## Bloqueiam a construção

| #     | Questão                                                                                          | Por que bloqueia                                                                                                                                                                                                       | Onde resolver         |
| :---- | :----------------------------------------------------------------------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :-------------------- |
| **1** | **Quem é o usuário do MVP** — projetista externo ou analista interno da Neoenergia?              | Os documentos dizem "os dois". São produtos diferentes: entrada, saída, autenticação e fluxo mudam conforme a resposta. Ver [`mapa-stakeholders.md`](mapa-stakeholders.md#quem-o-produto-atinge-diretamente).            | Cliente / orientador  |
| **2** | **Qual documento normativo da Neoenergia PE** rege o cálculo de demanda?                        | Todos os documentos dizem "regras normativas vigentes" sem citar fonte. O [`benchmarking`](../negocio/benchmarking.md) cita as normas das outras concessionárias (NBR 5410/14039, LIG BT 2014, GED 4621) — o equivalente da Neoenergia PE não aparece em lugar nenhum. **Sem esse documento não existe motor de cálculo.** | Cliente               |
| **3** | **Faixa de escopo do MVP** — cobre só acima de 50 kVA?                                          | [`premissas-desafio.md`](../negocio/premissas-desafio.md#tentativas-anteriores) registra que abaixo de 50 kVA o problema já foi mitigado por simplificação de critérios. Ninguém escreveu se o MVP cobre a faixa inteira. | Time + cliente        |

---

## Precisam ser definidas na Ideação

| #     | Questão                                                                                                    | Impacto                                                                                                                                                                     | Prazo                 |
| :---- | :--------------------------------------------------------------------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :-------------------- |
| **4** | **Entrada e saída concretas** — quais parâmetros entram; a saída é um número, uma memória de cálculo, um PDF submetível? | O [`benchmarking`](../negocio/benchmarking.md#02--comparativo-por-critério) posiciona a solução com ✅ em "mostra memória de cálculo" e "aponta onde está o erro"; nenhum documento define o formato. | Ideação (15–22/08)    |
| **5** | **Métrica de sucesso**                                                                                     | "Reduzir reprovação" não tem meta numérica nem forma de medir dentro de um MVP acadêmico.                                                                                    | Ideação               |
| **6** | **Stack de front-end** — Thymeleaf (servidor) ou front separado + API REST                                 | [`app/front/README.md`](../../app/front/README.md) segue "a definir"; a escolha afeta a arquitetura de camadas do back-end.                                                  | Time (Tech Lead)      |

> As questões **5** e **6** não dependem de ninguém de fora — podem ser fechadas pelo time a qualquer momento, independentemente das respostas do cliente.

---

## Decisões internas da Ideação — Parte 1

Não dependem do cliente. Precisam ser fechadas **antes** da sessão de brainstorming ([`ideacao.md`](ideacao.md)).

| #      | Questão                                                                       | Por que importa                                                                                                                                       | Quando            |
| :----- | :---------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------ | :---------------- |
| **7**  | **Critério de decisão** para eleger a solução final                            | Sem ele a justificativa da atividade 3 vira opinião. Candidatos: cobertura dos 4 critérios em branco do benchmarking, menor risco, viabilidade nas 4 entregas de POO. | Antes da sessão   |
| **8**  | **Escala de risco** a ser usada                                                | A atividade 2 pede riscos de cada solução; nenhuma escala foi definida. O usual é probabilidade × impacto.                                             | Antes da sessão   |
| **9**  | **Formato, facilitador e duração** do brainstorming                            | O entregável exige o registro da atividade no Miro, não só do resultado.                                                                               | Antes da sessão   |
| **10** | **A restrição POO entra como filtro antes ou depois** da rodada divergente?    | Enunciada antes, evita gastar a sessão em ideias sem persistência que não poderiam ser escolhidas. Aplicada depois, preserva a divergência.            | Antes da sessão   |

---

## Perguntas para enviar ao cliente

As questões 1, 2 e 3 não se resolvem internamente. Texto pronto para envio:

1. **Usuário do sistema** — a ferramenta deve ser usada pelo projetista externo, antes de submeter o projeto, ou pela equipe interna de análise da Neoenergia, durante a avaliação? Ou pelos dois, com perfis distintos?
2. **Base normativa** — qual documento define hoje as regras, tabelas e fórmulas de cálculo de demanda para edificações com múltiplas unidades consumidoras na Neoenergia PE? Há como disponibilizar uma cópia, ainda que parcial?
3. **Faixa de atendimento** — a simplificação de critérios abaixo de 50 kVA reduziu as reprovações nessa faixa. A ferramenta deve cobrir apenas a faixa acima de 50 kVA, onde o problema persiste, ou todas as faixas?

> Se não houver resposta até o fim da janela de 22/08, a atividade 3 deve ser fechada com decisão **condicionada** e premissa explícita ("solução X, assumindo usuário = projetista externo"), registrada em [`ideacao.md`](ideacao.md#3--proposta-de-solução-final). Travar a etapa custa mais que assumir e revisar.

---

## Descompasso entre os dois cronogramas

A **Entrega 01 de POO é 31/08/2026** e exige 7 histórias de usuário em BDD mais protótipo de baixa fidelidade ([`../cronograma-poo.md`](../cronograma-poo.md#entrega-01--31082026)).

O **cronograma de Projetos 3** só prevê histórias de usuário e protótipos terminando em **12/09/2026** ([`../cronograma-projetos3.md`](../cronograma-projetos3.md)).

São quase duas semanas de diferença entre o prazo da disciplina e o planejamento do time. Decisão do time e do orientador.
