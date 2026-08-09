# Premissas do Desafio — Neoenergia Pernambuco

## Empresa

**Neoenergia Pernambuco** é a concessionária responsável pela distribuição de energia elétrica em todo o estado de Pernambuco e no município de Pedras de Fogo (PB). Integra o grupo **Neoenergia**, controlado pela espanhola **Iberdrola**, um dos maiores grupos de energia do mundo.

---

## Problema

Há um elevado número de erros nos cálculos de demanda apresentados em projetos elétricos de edificações com **múltiplas unidades consumidoras**. A complexidade dos critérios técnicos — associada à grande quantidade de parâmetros, tabelas e regras normativas — aumenta significativamente a probabilidade de equívocos, tanto por parte dos clientes quanto internamente durante a análise dos projetos.

Trata-se de um problema **recorrente**, presente há muitos anos no processo de análise e aprovação.

---

## Impacto

- **~50 %** dos aproximadamente **1.400 projetos** desse tipo recebidos anualmente são reprovados.
- Alto índice de retrabalho para clientes e equipes de análise.
- Falta de padronização: interpretações distintas geram soluções diferentes para um mesmo caso.
- Aumento dos prazos de aprovação e redução da eficiência operacional.

---

## Stakeholders afetados

| Stakeholder      | Impacto                                                      |
| :--------------- | :----------------------------------------------------------- |
| Clientes         | Atrasos e retrabalho na aprovação dos projetos elétricos     |
| Equipes técnicas | Maior tempo dedicado à análise e correção de inconsistências |

---

## Tentativas anteriores

Foram implementadas simplificações nos critérios de cálculo para projetos com **demanda inferior a 50 kVA**. Como resultado, houve redução significativa no número de reprovações nessa faixa. O problema persiste para projetos acima desse limite.

---

## Proposta de solução

Desenvolver uma ferramenta ou sistema capaz de realizar os cálculos de forma **automática**, aplicando as regras normativas vigentes, tabelas e critérios técnicos de maneira **padronizada**.

A solução deve:

- Receber os parâmetros do projeto elétrico como entrada (tipo de edificação, número e tipo de unidades consumidoras, cargas instaladas etc.)
- Aplicar automaticamente as tabelas e fórmulas normativas da Neoenergia PE
- Retornar o cálculo de demanda resultante com rastreabilidade das regras aplicadas
- Reduzir a taxa de reprovação ao eliminar erros de interpretação e cálculo manual

---

## Contexto acadêmico

Este projeto é desenvolvido no âmbito das disciplinas:

- **Projetos 3** (desafio real proposto pela Neoenergia Pernambuco via CESAR School)
- **Programação Orientada a Objetos — POO** (2026.2, CESAR School)

### Requisito POO

O motor de cálculo deve ser modelado com design **orientado a objetos**, evidenciando:

- **Encapsulamento**: regras normativas encapsuladas em classes de domínio
- **Herança / Polimorfismo**: tipos de edificação e unidades consumidoras como hierarquia de classes
- **Separação de responsabilidades**: cálculo, validação e persistência em camadas distintas
