# Análise de Causa Raiz

Investigação estruturada das origens do alto índice de rejeição de projetos elétricos na Neoenergia PE, usando duas técnicas complementares: **5 Porquês** (profundidade) e **Diagrama de Ishikawa** (amplitude).

Fase: **Imersão** ([`../processo.md`](../processo.md)) · Responsável: Lucas Gabriel
Fontes: [Figma — 5 Por quês](https://www.figma.com/board/XyJzy2WicMqwNtRJcB35Mk/5-Por-qu%C3%AAs) · [Figma — Diagrama Ishikawa](https://www.figma.com/board/hOulvegTeIps2B5X7xdKZw/Diagrama-Ishikawa)

---

## Problema observado

**50 % dos projetos elétricos para edificações com múltiplas unidades consumidoras submetidos à Neoenergia PE são rejeitados.**

---

## 5 Porquês

| # | Pergunta                                | Resposta                                                                                                                                              |
| :- | :-------------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1 | Por que os projetos são rejeitados?     | Os cálculos de demanda elétrica entregues pelos projetistas estão incorretos.                                                                          |
| 2 | Por que os cálculos estão incorretos?   | As regras normativas são aplicadas manualmente e envolvem múltiplas tabelas e parâmetros sujeitos a interpretações divergentes.                        |
| 3 | Por que são aplicadas manualmente?      | Não existe ferramenta padronizada que automatize e valide o cálculo conforme as normas da Neoenergia PE.                                               |
| 4 | Por que não existe essa ferramenta?     | Intervenções anteriores foram pontuais — simplificaram regras apenas para projetos abaixo de 50 kVA, sem atacar a causa raiz.                          |
| 5 | Por que as intervenções foram pontuais? | Nunca foi desenvolvido um sistema robusto capaz de aplicar toda a complexidade normativa de forma automatizada, rastreável e padronizada.              |

### Causa raiz identificada

**Ausência de um sistema automatizado de cálculo de demanda elétrica conforme as normas da Neoenergia PE.**

---

## Diagrama de Ishikawa (4M)

**Efeito:** alto índice de rejeição de projetos elétricos por erros no cálculo de demanda.

| Categoria     | Causas                                                                                                                                                                                              |
| :------------ | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Machine**   | Nenhum sistema de rastreabilidade das regras normativas aplicadas em cada etapa                                                                                                                      |
| **Methods**   | Cálculo de demanda realizado inteiramente de forma manual<br>Ausência de checklist ou guia de verificação antes da submissão                                                                         |
| **Personal**  | Falta de treinamento padronizado sobre as normas específicas da Neoenergia PE<br>Comunicação insuficiente entre equipes internas e projetistas externos sobre os critérios exigidos                   |
| **Materials** | Documentação normativa dispersa, sem consolidação em formato acessível ao projetista<br>Normas sujeitas a interpretações divergentes sem mecanismo de desambiguação                                   |


---

## Convergência das duas técnicas

As duas análises chegam ao mesmo lugar por caminhos diferentes:

| 5 Porquês                                       | Ishikawa                                                                 |
| :---------------------------------------------- | :----------------------------------------------------------------------- |
| Aplicação manual das regras (porquê 2)          | *Methods* — cálculo inteiramente manual                                  |
| Ausência de ferramenta padronizada (porquê 3)   | *Machine* — nenhum sistema de rastreabilidade                            |
| Interpretações divergentes (porquê 2)           | *Materials* — normas sem mecanismo de desambiguação                      |
| —                                               | *Personal* — treinamento e comunicação (não aparece na cadeia dos porquês) |

O eixo **Personal** é o único que a cadeia dos 5 Porquês não alcança. Ele não é atacado por automação, e sim por processo e capacitação — fica fora do escopo do MVP.

---

## Para onde isso leva

A causa raiz e as categorias *Machine*, *Methods* e *Materials* são exatamente o que a solução proposta ataca:

- [`objetivos-projeto.md`](objetivos-projeto.md) — objetivo do MVP derivado desta análise
- [`premissas-desafio.md`](premissas-desafio.md#proposta-de-solução) — proposta de solução do desafio original
- [`benchmarking.md`](benchmarking.md) — confirmação de que nenhuma ferramenta de mercado cobre essa lacuna
