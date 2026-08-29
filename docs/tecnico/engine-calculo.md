# Motor de Cálculo — Entradas e Saídas

Especificação dos parâmetros que o sistema recebe e do que ele produz, derivada exclusivamente das normas técnicas vigentes da Neoenergia Pernambuco e do processo oficial de submissão de projetos.

**Fontes primárias:**
- **DIS-NOR-053 REV 06** — Fornecimento de Energia Elétrica a Edificações com Múltiplas Unidades Consumidoras até 34,5 kV. Neoenergia, 09/09/2025. Metodologia de cálculo no Anexo I, p. 106. [PDF](https://www.neoenergia.com/documents/d/rn/dis-nor-053-rev06)
- **DIS-NOR-030 REV 07** — Fornecimento de Energia Elétrica em Tensão Secundária de Distribuição a Edificações Individuais. Neoenergia, 17/04/2026. Cálculo de demanda no item 6.27, p. 47. [PDF](https://www.neoenergia.com/documents/d/pernambuco/dis-nor-030-rev07?download=true)
- **Processo de submissão atual** — [`../negocio/processo-submissao.md`](../negocio/processo-submissao.md). Fonte: [Projetistas e Prestadores de Serviço — Neoenergia PE](https://www.neoenergia.com/web/pernambuco/seu-negocio/projetistas-prestadores-de-servico)

---

## Contexto — o que a Neoenergia exige hoje

### O que o projetista envia

O site da Neoenergia PE indica que projetos particulares devem ser submetidos por canal específico, com os seguintes documentos:

| Documento | Descrição | Por que é exigido |
| :--- | :--- | :--- |
| **Carta de solicitação** | Identificação do projeto e do solicitante | Protocolo de entrada formal |
| **ART do engenheiro responsável** | Anotação de Responsabilidade Técnica (CREA) | Obrigação legal — vincula o profissional ao projeto |
| **Desenhos assinados** | Diagrama unifilar + planta de situação | Representação técnica da instalação proposta |
| **Memorial descritivo** | Cálculo de demanda, cálculo de proteção e cálculo de queda de tensão | Documento central — é aqui que os erros ocorrem e geram reprovação |

> **Ressalva:** o canal exato de submissão (portal, e-mail ou presencial) e quais projetos se enquadram em cada canal precisam ser confirmados diretamente com a Neoenergia PE. O site indica canais distintos por tipo de projeto; esta informação ainda está pendente de confirmação com o cliente (questão 9 do registro de questões em aberto). Fonte: [Projeto Particular — Neoenergia PE](https://www.neoenergia.com/web/pernambuco/seu-negocio/projeto-particular)

### O que a Neoenergia devolve

| Resultado | O que volta |
| :--- | :--- |
| **Aprovação** | Comunicado por e-mail. Válido por **36 meses** |
| **Reprovação** | E-mail com os **motivos da reprovação e as providências corretivas** necessárias |

Prazo de análise: **30 dias**, suspensos se faltar informação. Projetos chegam a passar por 3 a 4 análises até aprovação final.

---

## Estrutura do cálculo

A DIS-NOR-053 REV 06, Anexo I, p. 106, define a fórmula geral. **Todas as demandas são expressas em kVA.**

```
Ded = Drf + Ds + Dc + Dve   [kVA]
```

| Componente | O que é | Método |
| :--- | :--- | :--- |
| **Drf** | Demanda dos apartamentos residenciais | Área útil — DIS-NOR-053, Anexo I |
| **Ds** | Demanda do condomínio (áreas comuns e serviços) | Carga instalada — DIS-NOR-030, item 6.27 |
| **Dc** | Demanda das cargas comerciais | Carga instalada — DIS-NOR-030, item 6.27 |
| **Dve** | Demanda dos carregadores de veículos elétricos | Carga especial — DIS-NOR-053, item 6.26.4 |

> A DIS-NOR-030 REV 07 foi aprovada em 17/04/2026, portanto é **posterior** à DIS-NOR-053 REV 06 (09/09/2025). Em caso de conflito entre as duas normas no método da carga instalada, prevalece a DIS-NOR-030 REV 07 por ser mais recente.

> **Fonte:** DIS-NOR-053 REV 06, Anexo I, p. 106; DIS-NOR-030 REV 07, item 6.27, p. 47

---

## Entradas do sistema

### 1. Identificação e classificação da edificação

| Parâmetro | Por que entra | Fonte |
| :--- | :--- | :--- |
| **Tipo de edificação** | Define o método de cálculo aplicável | DIS-NOR-053 REV 06, Anexo I, p. 106 |
| **Tensão de fornecimento pretendida** | Determina o valor mínimo de demanda normativo que pode sobrepor o resultado calculado | DIS-NOR-053 REV 06, Anexo I — quadro de valores mínimos por tensão |

**Tipos de edificação e métodos correspondentes:**

| Tipo | Método aplicado |
| :--- | :--- |
| Residencial coletivo | Área útil para unidades; carga instalada para serviços do condomínio |
| Não residencial (comercial, industrial) | Carga instalada — DIS-NOR-030 para o total e por unidade |
| Misto (residencial + comercial) | Cada parte calculada pelo método próprio e somada |
| Smart / Studio / Home Studio (acima de 15 unidades) | Área útil com fator de coincidência **fixo de 90%**, independente do número de unidades |
| Com carregador de veículo elétrico | Demanda residencial somada à demanda dos carregadores (Dve) |

> **Fonte:** DIS-NOR-053 REV 06, Anexo I, p. 106; item 6.22.1

---

### 2. Área residencial — método da área útil (para calcular Drf)

```
Dr  = D_apto(área útil) × f_coinc(nº de apartamentos) × nº de apartamentos   [kVA]
Drf = Dr × Fr   [kVA]
```

| Parâmetro | Por que entra | Fonte |
| :--- | :--- | :--- |
| **Área útil do apartamento (m²)** | Determina D_apto via Quadro 35 — cada faixa de área corresponde a uma demanda em kVA | DIS-NOR-053 REV 06, Anexo I — Quadro 35, p. 108 |
| **Quantidade de apartamentos por grupo** | Determina f_coinc: quanto mais unidades, menor o fator de coincidência | DIS-NOR-053 REV 06, Anexo I — tabela de fator de coincidência |
| **Tipo de unidade** (Smart/Studio?) | Smart, Studio e Home Studio com mais de 15 unidades usam f_coinc fixo de 90% | DIS-NOR-053 REV 06, item 6.22.1 |

> O fator de segurança (Fr) **não é entrada** — é derivado do valor de Dr calculado. A norma o define por faixa de demanda.

> **Fonte:** DIS-NOR-053 REV 06, Anexo I, p. 106–112

---

### 3. Áreas de serviço e condomínio — método da carga instalada (para calcular Ds e Dc)

A DIS-NOR-053 remete à DIS-NOR-030 para este cálculo. A fórmula da DIS-NOR-030 REV 07, item 6.27, p. 47:

```
D = a + b + c + d + e + f + g + h + i   [kVA]
```

Cada letra é uma categoria de carga instalada com fator de demanda próprio:

| Parcela | Categoria de carga | Observação |
| :--- | :--- | :--- |
| **a** | Iluminação e tomadas (TUG) | Fator de demanda conforme tipo de ocupação |
| **b** | Chuveiros, torneiras elétricas, aquecedores de água de passagem e ferros elétricos | — |
| **c** | Aquecedor central ou de acumulação | — |
| **d** | Secadora, máquina de lavar, lava-louças e micro-ondas | — |
| **e** | Fornos e fogões elétricos | — |
| **f** | Condicionadores de ar | — |
| **g** | Motores e máquinas de solda a motor | Regras específicas — ver abaixo |
| **h** | Equipamentos especiais | Raios-X, fornos de indução, solda a transformador, eletrólise — carga conforme placa do fabricante |
| **i** | Bombas e hidromassagem | — |
| **j** | Estação de recarga de veículos elétricos | Tratado separadamente como Dve na DIS-NOR-053 |

> **Fonte:** DIS-NOR-030 REV 07, item 6.27, p. 47; DIS-NOR-053 REV 06, item 6.26.3.2

O sistema precisa aceitar entradas para **todas as parcelas acima** que existam na edificação — não apenas iluminação, TUG, motores e equipamentos especiais.

#### Regras específicas para motores (parcela g) — Tabela 14, DIS-NOR-030 REV 07

| Regra | Descrição |
| :--- | :--- |
| **Motor maior → fator 1,00** | O motor de maior potência entra com fator de demanda 1,00 |
| **Demais motores → fator 0,50** | Os outros entram com fator 0,50 |
| **Motores de potência igual** | Quando dois ou mais motores têm a mesma potência, considera-se apenas **um** como o maior |
| **Partida simultânea obrigatória** | Se motores precisam partir simultaneamente por determinação do processo, suas potências são **somadas** e tratadas como um único motor |

> **Fonte:** DIS-NOR-030 REV 07, item 6.27, Tabela 14

---

### 4. Veículos elétricos — carga especial (para calcular Dve)

| Parâmetro | Por que entra | Fonte |
| :--- | :--- | :--- |
| **Tipo de posto** | Posto individualizado por unidade residencial usa Tabela 13 da DIS-NOR-030; posto coletivo usa fator de demanda 1 | DIS-NOR-030 REV 07, item 6.27, Tabela 13; DIS-NOR-053 REV 06, item 6.26.4 |
| **Quantidade de pontos de recarga** | Determina o fator de simultaneidade conforme quantidade de carregadores no condomínio | DIS-NOR-053 REV 06, item 6.26.4.2 |
| **Potência por ponto (kW)** | Deve ser a potência informada na placa do fabricante da estação | DIS-NOR-053 REV 06, item 6.26.4.1 |

> **Regra do valor padrão de 3,3 kW:** aplica-se **exclusivamente** quando a estação de recarga é **incorporada ao veículo** e sua potência não é informada. Não se aplica a estações fixas sem informação de potência.
> **Fonte:** DIS-NOR-053 REV 06, item 6.26.4.1

**Tipos de posto (parâmetro normativo para seleção do fator):**

| Tipo | Fator aplicado |
| :--- | :--- |
| Individualizado por unidade residencial | Tabela 13 da DIS-NOR-030 REV 07 |
| Posto coletivo | Fator de demanda 1 |

> **Fonte:** DIS-NOR-030 REV 07, item 6.27, Tabela 13; DIS-NOR-053 REV 06, item 6.26.4.3

---

## Saídas do sistema

### Resultados do cálculo

**Todas as demandas são em kVA.** A DIS-NOR-030 define explicitamente: "D – Demanda total da instalação em kVA". Os componentes Drf, Ds, Dc e Dve são calculados diretamente em kVA — não há conversão final.

| Saída | Unidade | O que é | Fonte |
| :--- | :--- | :--- | :--- |
| **Drf** | kVA | Demanda dos apartamentos residenciais após fator de coincidência e fator de segurança (Fr) | DIS-NOR-053 REV 06, Anexo I, p. 106 |
| **Ds** | kVA | Demanda das áreas comuns e serviços do condomínio | DIS-NOR-030 REV 07, item 6.27, p. 47 |
| **Dc** | kVA | Demanda das cargas comerciais (quando aplicável) | DIS-NOR-030 REV 07, item 6.27, p. 47 |
| **Dve** | kVA | Demanda dos carregadores de veículos elétricos (quando aplicável) | DIS-NOR-053 REV 06, item 6.26.4 |
| **Ded calculada** | kVA | Soma direta: Drf + Ds + Dc + Dve | DIS-NOR-053 REV 06, Anexo I, p. 106 |
| **Ded mínima** | kVA | Valor mínimo normativo por tensão de fornecimento | DIS-NOR-053 REV 06, Anexo I — quadro de mínimos |
| **Ded final** | kVA | O maior entre Ded calculada e Ded mínima — valor que prevalece | DIS-NOR-053 REV 06, Anexo I |

### Rastreabilidade — registro por cálculo

A DIS-NOR-053 foi revisada 7 vezes em menos de 4 anos. Dois cálculos idênticos feitos sob revisões diferentes podem produzir resultados diferentes. Cada execução do motor deve gerar um registro persistido com os seguintes campos:

| Campo | Descrição |
| :--- | :--- |
| `calculo_id` | Identificador único do cálculo |
| `norma_principal` | Ex.: DIS-NOR-053 |
| `revisao_norma` | Ex.: REV 06 |
| `norma_complementar` | Ex.: DIS-NOR-030 |
| `revisao_norma_complementar` | Ex.: REV 07 |
| `data_calculo` | Timestamp da execução |
| `tipo_edificacao` | Tipo declarado pelo projetista |
| `tensao` | Tensão de fornecimento informada |
| `entradas` | Snapshot dos valores inseridos |
| `regras_aplicadas` | Lista de itens e tabelas da norma usados em cada etapa |
| `tabelas_utilizadas` | Ex.: Quadro 35, Tabela 14 |
| `Dr` | Demanda residencial antes do fator de segurança |
| `Fc` | Fator de coincidência aplicado e nº de UCs que o determinou |
| `Fr` | Fator de segurança aplicado e faixa de demanda que o determinou |
| `Drf` | Demanda residencial final (kVA) |
| `Ds` | Demanda de serviços/condomínio (kVA) |
| `Dc` | Demanda comercial (kVA) |
| `Dve` | Demanda de veículos elétricos (kVA) |
| `Ded_calculada` | Soma dos componentes (kVA) |
| `Ded_minima` | Mínimo normativo por tensão (kVA) |
| `Ded_final` | Valor que prevalece (kVA) |
| `minimo_aplicado` | Booleano — se o mínimo normativo sobrepôs o cálculo |

---

## Tabela bibliográfica

| # | Documento | Emissor | Revisão / Data | Trecho relevante | Acesso |
| :- | :--- | :--- | :--- | :--- | :--- |
| 1 | DIS-NOR-053 — Fornecimento de Energia Elétrica a Edificações com Múltiplas Unidades Consumidoras até 34,5 kV | Neoenergia (Coelba, Pernambuco, Cosern, Elektro) | REV 06 · 09/09/2025 | Metodologia completa: Anexo I, p. 106. Veículos elétricos: item 6.26.4. Equipamentos especiais: item 6.26.3.2. Tipos e métodos: item 6.22.1 | [PDF público](https://www.neoenergia.com/documents/d/rn/dis-nor-053-rev06) |
| 2 | DIS-NOR-030 — Fornecimento de Energia Elétrica em Tensão Secundária de Distribuição a Edificações Individuais | Neoenergia Pernambuco | REV 07 · 17/04/2026 | Cálculo pelo método da carga instalada: item 6.27, p. 47. Fórmula D = a+b+c+d+e+f+g+h+i. Tabela 14 (motores). Tabela 13 (VE individualizados). Referenciada pela DIS-NOR-053 para Ds e Dc | [PDF público](https://www.neoenergia.com/documents/d/pernambuco/dis-nor-030-rev07?download=true) |
| 3 | Processo de submissão de projetos — Projetistas e Prestadores de Serviço | Neoenergia Pernambuco | Vigente | Documentos exigidos (ART, desenhos, memorial), prazo de análise (30 dias), validade da aprovação (36 meses), devolutiva de reprovação | [Site Neoenergia PE](https://www.neoenergia.com/web/pernambuco/seu-negocio/projetistas-prestadores-de-servico) |
| 4 | Projeto Particular — canais e documentação | Neoenergia Pernambuco | Vigente | Carta de solicitação, ART, desenhos assinados, memorial descritivo com cálculo de demanda. Canal exato de submissão a confirmar com o cliente | [Site Neoenergia PE](https://www.neoenergia.com/web/pernambuco/seu-negocio/projeto-particular) |
| 5 | REN nº 1.000/2021, art. 554 e 555 | ANEEL | 2021 | Regras para recarga de veículos em UC de terceiros; vedação de injeção de energia por VE na rede | Referenciada na DIS-NOR-053 REV 06, itens 6.26.4.3 e 6.26.4.4 |
