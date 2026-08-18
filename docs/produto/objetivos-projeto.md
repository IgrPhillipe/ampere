# Objetivos do Projeto

Desenvolver um MVP capaz de automatizar e padronizar o cálculo de demanda elétrica, tornando esse processo mais simples, confiável e eficiente.

Fase: **Imersão** ([`../processo.md`](../processo.md)) · Responsável: Jean Augusto · Fonte: [Google Sites — Desafio](https://sites.google.com/cesar.school/site-grupo-4/desafio)

---

## Objetivo

Desenvolver um **MVP capaz de automatizar e padronizar o cálculo de demanda elétrica**. A solução pretende:

- **Centralizar** regras, critérios técnicos, fórmulas e tabelas
- **Orientar o usuário** no preenchimento das informações
- **Reduzir diferenças de interpretação** entre quem elabora e quem analisa o projeto

---

## Resultados esperados

- Diminuir **erros, reprovações e retrabalho**
- Tornar a análise dos projetos **mais ágil e consistente**
- Melhorar a experiência tanto dos **clientes e projetistas** quanto das **equipes técnicas da Neoenergia Pernambuco**
- Contribuir para um processo mais moderno, seguro e eficiente

---

## O que podemos analisar a partir do problema

- As principais **causas dos erros** nos cálculos de demanda
- Os **pontos de maior dificuldade** no processo
- A **falta de padronização** e os impactos das reprovações
- Quais **etapas podem ser simplificadas ou automatizadas** para reduzir retrabalho, agilizar as análises e tornar o processo mais confiável

---

## Encadeamento com a descoberta

O objetivo acima não é uma escolha arbitrária — ele responde diretamente ao que as outras análises da Imersão apontaram:

| Origem | Achado | Como o objetivo responde |
| :------------------------------------------------------------ | :--------------------------------------------------------------------------------------------------- | :------------------------------------------------------ |
| [`analise-causa-raiz.md`](../negocio/analise-causa-raiz.md) | Causa raiz: ausência de sistema automatizado de cálculo conforme as normas da Neoenergia PE | "Automatizar e padronizar o cálculo"                     |
| [`analise-causa-raiz.md`](../negocio/analise-causa-raiz.md) (Ishikawa)    | *Methods*: cálculo inteiramente manual; *Materials*: documentação normativa dispersa                  | "Centralizar regras, critérios técnicos, fórmulas e tabelas" |
| [`benchmarking.md`](../negocio/benchmarking.md)                           | Nenhuma concessionária valida o cálculo antes do envio nem aponta onde está o erro                     | "Orientar o usuário no preenchimento"                    |
| [`analise-causa-raiz.md`](../negocio/analise-causa-raiz.md) (Ishikawa)    | *Materials*: normas sujeitas a interpretações divergentes sem mecanismo de desambiguação               | "Reduzir diferenças de interpretação"                    |
| [`premissas-desafio.md`](../negocio/premissas-desafio.md)                 | ~50 % dos ~1.400 projetos anuais são reprovados                                                        | "Diminuir erros, reprovações e retrabalho"               |

---

## Limites deste documento

Os objetivos estão definidos como **direção**, não como **especificação de construção**. As decisões que ainda faltam para transformar isso em requisitos — quem é o usuário final, qual documento normativo rege o cálculo, qual a faixa de escopo, quais são as entradas e saídas concretas e como medir o sucesso — estão registradas em [`../produto/questoes-em-aberto.md`](questoes-em-aberto.md).
