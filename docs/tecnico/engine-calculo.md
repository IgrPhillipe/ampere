# Motor de Cálculo — Entradas e Saídas

Especificação dos parâmetros que o sistema recebe e do que ele produz, derivada da DIS-NOR-053 REV 06, da DIS-NOR-030 REV 07 e do protótipo LO-FI (aula 4, 29/08/2026).

Fecha a questão 4 do registro de [`questões em aberto`](../produto/questoes-em-aberto.md).

---

## Entradas

O sistema coleta dados em duas etapas do fluxo de cadastro, mais uma etapa de documentos obrigatórios para envio.

### Etapa 1 — Dados da edificação

#### Identificação (dados administrativos)

| Parâmetro | Observação |
| :--- | :--- |
| Nome do projeto | Livre |
| Endereço | Logradouro e número |
| Município | Dropdown — define jurisdição da distribuidora |
| Nº do protocolo | Gerado automaticamente pelo sistema |

#### Parâmetros técnicos

Esses cinco campos determinam qual norma e quais tabelas de fatores serão aplicadas. O sistema deriva a norma automaticamente — o projetista não escolhe a tabela.

| Parâmetro | Exemplos / opções |
| :--- | :--- |
| Tipo de edificação | Residencial multifamiliar · Comercial · Misto · Smart/Studio · Industrial |
| Nº de pavimentos | Numérico |
| Tensão de fornecimento | 127/220 V · 220/380 V · 13,8 kV |
| Tipo de ligação | Monofásico · Bifásico · Trifásico |
| Padrão de entrada | Coletivo — medição agrupada em caixa seccionadora · Individual por unidade |

A norma aplicável (ex.: NDU 001 — rev. 5.6) aparece derivada ao final da etapa, visível ao projetista antes de avançar. Esse mecanismo é o ponto central de ataque à causa raiz de interpretações divergentes.

---

### Etapa 2 — Unidades consumidoras

Dados inseridos por **grupo de UCs** — unidades de mesmo tipo e mesma área agrupadas. Importação por planilha `.xlsx` é aceita como alternativa ao preenchimento manual.

#### Grupos residenciais — método da área útil

| Parâmetro | Descrição |
| :--- | :--- |
| Nome do grupo | Ex.: "Apartamento tipo A" |
| Área útil (m²) | Determina a demanda unitária via tabela normativa (Quadro 35 / Tabela 3) |
| Nº de quartos | Complementa a classificação do tipo de unidade |
| Quantidade de unidades | Número de apartamentos desse tipo no grupo |
| Carga instalada (kW) | Declarada pelo projetista para o grupo |

O fator de coincidência e o critério normativo correspondente (ex.: NDU 001 · Tabela 3 — residencial) são selecionados e aplicados automaticamente pelo sistema.

#### Grupos de área comum / serviço — método da carga instalada

| Parâmetro | Descrição |
| :--- | :--- |
| Nome do grupo | Ex.: "Área comum — elevadores, bombas, iluminação" |
| Carga instalada (kW) | Total declarado para o grupo |

Motores acima de 5 CV e equipamentos especiais (raios-X, solda, fornos de indução) geram **alertas de validação em tempo real** — o sistema solicita o dado adicional necessário (ex.: potência exata do motor para aplicar o fator de partida) em vez de expor campos separados para cada caso no formulário principal.

#### Grupo de recarga de veículos elétricos

| Parâmetro | Descrição |
| :--- | :--- |
| Quantidade de pontos de recarga | Define o fator de simultaneidade aplicável |
| Potência por ponto (kW) | Se não informada, o sistema assume 3,3 kW conforme DIS-NOR-053 item 6.26.4.1 |
| Sistema de gerenciamento de carga? | Sim/Não — altera o fator de simultaneidade |

---

### Etapa 4 — Documentos para envio

Checklist obrigatório que bloqueia o envio enquanto incompleto.

| Documento | Formato |
| :--- | :--- |
| ART do responsável técnico | Upload — PDF |
| Diagrama unifilar | Upload — PDF |
| Planta de situação | Upload |

---

## Saídas

### Resultados do cálculo (Etapa 3)

O cálculo é exibido passo a passo, com a fórmula aplicada e a referência normativa de cada linha. Fórmula geral (DIS-NOR-053, Anexo I):

```
Ded = Drf + Ds + Dc + Dve
```

| # | Componente | Referência normativa |
| :- | :--- | :--- |
| 1 | Demanda das unidades residenciais — Drf (kW) | NDU 001 · Tabela 3 |
| 2 | Demanda das áreas comuns — Ds (kW) | NDU 001 · Tabela 5 |
| 3 | Cargas especiais — recarga de veículo elétrico — Dve (kW) | NDU 001 · Tabela 6 |
| 4 | Fator de diversidade entre grupos (kW) | NDU 001 · Item 6.4 |
| 5 | Conversão para potência aparente — Ded (kVA) | NDU 001 · Item 6.7 |

#### Painel de resultados consolidados

| Saída | Exemplo |
| :--- | :--- |
| **Demanda total da edificação (kVA)** | 236,0 kVA |
| Demanda ativa (kW) | 217,1 kW |
| Fator de potência | 0,92 — derivado pelo sistema, não inserido pelo projetista |
| Corrente projetada (A) | 358 A |
| Tensão de fornecimento | 380/220 V trifásico |
| Indicador de faixa | "Acima de 50 kVA — critério completo aplicado" |

#### Rastreabilidade técnica

| Saída | Exemplo |
| :--- | :--- |
| Padrão de entrada sugerido | 400 A, barramento coletivo |
| Proteção geral | Disjuntor tripolar 400 A |
| Seção do ramal de entrada | 240 mm² |
| Norma aplicada | NDU 001 — rev. 5.6 |

---

### Documentos gerados (Etapa 4)

| Documento | Descrição |
| :--- | :--- |
| **Memorial descritivo (PDF)** | Gerado automaticamente no formato padrão Neoenergia — inclui identificação do projeto, unidades consumidoras, memória de cálculo e responsável técnico |
| **Planilha de UCs (.xlsx)** | Exportação da tabela de grupos com os fatores aplicados pelo sistema |

---

### Saídas do fluxo de acompanhamento

Visíveis nos painéis de listagem dos dois perfis de usuário (projetista externo e analista Neoenergia).

| Saída | Quem vê | Descrição |
| :--- | :--- | :--- |
| Status do projeto | Projetista | Rascunho · Aguardando envio · Em análise · Reprovado · Aprovado |
| Nº de UCs | Projetista e analista | Exibido na listagem como referência de porte do projeto |
| Demanda na listagem (kVA) | Projetista e analista | Resultado final visível sem abrir o projeto |
| Alertas de pré-validação automática | Analista | Quantidade de inconsistências detectadas antes da análise manual |
| **Apontamentos de reprovação** | Projetista | Vinculados à etapa exata do cálculo — o projetista corrige apenas o ponto apontado, sem refazer o projeto inteiro |

---

## Nota sobre o fator de potência

O fator de potência **não é uma entrada** — é um valor derivado pelo sistema a partir do tipo de edificação e das cargas declaradas. Ele aparece como resultado do cálculo (etapa 3), não como campo a preencher.
