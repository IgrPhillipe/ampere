# Premissas do Desafio

Desafio conforme apresentado pela Neoenergia Pernambuco: empresa, problema, impacto, stakeholders afetados e proposta de solução esperada.

Fase: **Imersão** ([`../processo.md`](../processo.md)).

## Empresa

**Neoenergia Pernambuco** é a concessionária responsável pela distribuição de energia elétrica em todo o estado de Pernambuco e no município de Pedras de Fogo (PB). Atende cerca de **4,1 milhões de clientes** em **184 municípios**, além do arquipélago de Fernando de Noronha. A área de concessão tem mais de **98 mil km²**. Integra o grupo **Neoenergia**, controlado pela espanhola **Iberdrola**, um dos maiores grupos de energia do mundo.

O grupo está no Brasil desde 1997 e atua em **geração, transmissão, distribuição e comercialização de energia**, com operações em 18 estados e no Distrito Federal. Por meio de suas distribuidoras, atende cerca de **17 milhões de clientes**, alcançando uma população de aproximadamente 40 milhões de pessoas. Também investe em energia renovável, desenvolvimento sustentável e iniciativas socioambientais.

---

## Problema

Os cálculos de demanda apresentados em projetos elétricos de edificações com **múltiplas unidades consumidoras** têm elevado número de erros. A complexidade dos critérios técnicos, somada à quantidade de parâmetros, tabelas e regras normativas, aumenta a probabilidade de equívocos. Os erros ocorrem tanto nos clientes quanto na análise interna dos projetos.

O problema é **recorrente** e está presente há muitos anos no processo de análise e aprovação.

---

## Impacto

- **~50 %** dos aproximadamente **1.400 projetos** desse tipo recebidos anualmente são reprovados.
- Alto índice de retrabalho para clientes e equipes de análise.
- Falta de padronização: interpretações distintas geram soluções diferentes para um mesmo caso.
- Aumento dos prazos de aprovação e redução da eficiência operacional.

---

## Stakeholders Afetados

| Stakeholder      | Impacto                                                      |
| :--------------- | :----------------------------------------------------------- |
| Clientes         | Atrasos e retrabalho na aprovação dos projetos elétricos     |
| Equipes técnicas | Maior tempo dedicado à análise e correção de inconsistências |

---

## Tentativas Anteriores

Os critérios de cálculo foram simplificados para projetos com **demanda inferior a 50 kVA**. O número de reprovações nessa faixa caiu significativamente. O problema persiste para projetos acima desse limite.

---

## Proposta de Solução

Ferramenta ou sistema que realiza os cálculos de forma **automática**, aplicando as regras normativas vigentes, tabelas e critérios técnicos de maneira **padronizada**.

A solução deve:

- Receber os parâmetros do projeto elétrico como entrada (tipo de edificação, número e tipo de unidades consumidoras, cargas instaladas etc.)
- Aplicar automaticamente as tabelas e fórmulas normativas da Neoenergia PE
- Retornar o cálculo de demanda resultante com rastreabilidade das regras aplicadas
- Reduzir a taxa de reprovação ao eliminar erros de interpretação e cálculo manual

---

## Contexto Acadêmico

O projeto é desenvolvido nas disciplinas:

- **Projetos 3** (desafio real proposto pela Neoenergia Pernambuco via CESAR School)
- **Programação Orientada a Objetos (POO)** (2026.2, CESAR School)

### Requisito POO

O motor de cálculo deve ser modelado com design **orientado a objetos**, evidenciando:

- **Encapsulamento**: regras normativas encapsuladas em classes de domínio
- **Herança e polimorfismo**: tipos de edificação e unidades consumidoras como hierarquia de classes
- **Separação de responsabilidades**: cálculo, validação e persistência em camadas distintas
