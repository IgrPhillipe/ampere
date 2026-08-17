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

---

## Descompasso entre os dois cronogramas

A **Entrega 01 de POO é 31/08/2026** e exige 7 histórias de usuário em BDD mais protótipo de baixa fidelidade ([`../cronograma-poo.md`](../cronograma-poo.md#entrega-01--31082026)).

O **cronograma de Projetos 3** só prevê histórias de usuário e protótipos terminando em **12/09/2026** ([`../cronograma-projetos3.md`](../cronograma-projetos3.md)).

São quase duas semanas de diferença entre o prazo da disciplina e o planejamento do time. Decisão do time e do orientador.
