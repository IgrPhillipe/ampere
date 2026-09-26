# Análise de Causa Raiz

Investigação estruturada das origens do alto índice de rejeição de projetos elétricos na Neoenergia PE, usando duas técnicas complementares: **5 Porquês** (profundidade) e **Diagrama de Ishikawa** (amplitude).

Fase: **Imersão** ([`../processo.md`](../processo.md)). Responsável: Lucas Gabriel.
Fontes: [Figma: 5 Por quês](https://www.figma.com/board/XyJzy2WicMqwNtRJcB35Mk/5-Por-qu%C3%AAs) e [Figma: Diagrama Ishikawa](https://www.figma.com/board/hOulvegTeIps2B5X7xdKZw/Diagrama-Ishikawa).

---

## Problema Observado

**50 % dos projetos elétricos para edificações com múltiplas unidades consumidoras submetidos à Neoenergia PE são rejeitados.**

---

## 5 Porquês

| # | Pergunta                                | Resposta                                                                                                                                              |
| :- | :-------------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1 | Por que os projetos são rejeitados?     | Os cálculos de demanda elétrica entregues pelos projetistas estão incorretos.                                                                          |
| 2 | Por que os cálculos estão incorretos?   | Os projetistas aplicam as regras normativas manualmente e ficam sujeitos a erros humanos de interpretação e ao uso de versões desatualizadas da DIS-NOR.  |
| 3 | Por que o cálculo ainda depende desse processo manual e suscetível a erros?      | Não existe ferramenta oficial e padronizada pela Neoenergia que valide esses parâmetros automaticamente antes da submissão.                      |
| 4 | Por que as ferramentas e planilhas usadas no mercado não resolvem esse problema?    | As iniciativas existentes são fragmentadas e cobrem apenas casos simples (< 50 kVA). Ignoram a complexidade de projetos agrupados e de maior porte.   |
| 5 | Por que até hoje não se consolidou uma solução abrangente para esses projetos mais complexos? | As regras de validação eram tratadas como estáticas, sem motor de cálculo centralizado e oficial e sem versionamento auditável das normas.    |

### Causa Raiz Identificada

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

## Convergência das Duas Técnicas

As duas análises chegam à mesma conclusão por caminhos diferentes:

| 5 Porquês                                       | Ishikawa                                                                 |
| :---------------------------------------------- | :----------------------------------------------------------------------- |
| Aplicação manual das regras (porquê 2)          | *Methods*: cálculo inteiramente manual                                   |
| Ausência de ferramenta padronizada (porquê 3)   | *Machine*: nenhum sistema de rastreabilidade                             |
| Interpretações divergentes (porquê 2)           | *Materials*: normas sem mecanismo de desambiguação                       |
| Nenhum                                          | *Personal*: treinamento e comunicação (não aparece na cadeia dos porquês) |

O eixo **Personal** é o único que a cadeia dos 5 Porquês não alcança. Ele se resolve por processo e capacitação, não por automação, e fica fora do escopo do MVP.

---

## Desdobramentos

A solução proposta ataca a causa raiz e as categorias *Machine*, *Methods* e *Materials*:

- [`objetivos-projeto.md`](../produto/objetivos-projeto.md): objetivo do MVP derivado desta análise
- [`premissas-desafio.md`](premissas-desafio.md#proposta-de-solução): proposta de solução do desafio original
- [`benchmarking.md`](benchmarking.md): confirmação de que nenhuma ferramenta de mercado cobre essa lacuna
