# Motor de Cálculo — Entradas e Saídas

Especificação dos parâmetros que o sistema recebe e do que ele produz, derivada da DIS-NOR-053 REV 06, da DIS-NOR-030 REV 07 e do protótipo LO-FI.

A metodologia completa, as tabelas paramétricas, as divergências entre as normas e o procedimento de verificação estão em [`fontes-normativas.md`](fontes-normativas.md).

**Fontes primárias:**

- **DIS-NOR-053 REV 06** — Edificações com Múltiplas Unidades Consumidoras até 34,5 kV. Neoenergia, 09/09/2025. Estrutura do cálculo e método da área útil no Anexo I, p. 106.
- **DIS-NOR-030 REV 07** — Tensão Secundária a Edificações Individuais. Neoenergia, 17/04/2026. Método da carga instalada no item 6.27, p. 47.

Ambas indicadas pela Neoenergia.

---

## Estrutura do cálculo

**Todas as demandas são expressas em kVA.** Não existe conversão final de kW para kVA: cada parcela já sai em kVA, usando os fatores de potência que a DIS-NOR-030 define parcela a parcela.

```
Ded = Drf + Ds + Dc + Dve   [kVA]
```

| Componente | O que é | Método |
| :--- | :--- | :--- |
| **Drf** | Demanda dos apartamentos residenciais | Área útil — DIS-NOR-053, Anexo I |
| **Ds** | Demanda do condomínio (áreas comuns e serviços) | Carga instalada — DIS-NOR-030, item 6.27 |
| **Dc** | Demanda das cargas comerciais | Carga instalada — DIS-NOR-030, item 6.27 |
| **Dve** | Demanda dos carregadores de veículos elétricos | Fator de demanda do item 6.26 da DIS-NOR-053 |

A norma usa três notações para a mesma grandeza, e o motor precisa reconhecer as três ao conferir contra os exemplos: `Ded` na metodologia (Anexo I, p. 106), `Dte` no agrupamento de torres ou blocos (Anexo I, item 9) e `Df = (Dr × Fr) + Ds` nos exemplos resolvidos, que tratam do caso sem cargas comerciais nem recarga. O nome canônico no sistema é `Ded`.

> **Fonte:** DIS-NOR-053 REV 06, Anexo I, p. 106; DIS-NOR-030 REV 07, item 6.27, p. 47

---

## Entradas

### 1. Parâmetros normativos — área administrativa

**Os valores das tabelas normativas não são extraídos de PDF nem embutidos no código: são cadastrados manualmente numa área administrativa do sistema.**

A extração automática de texto de PDF não é confiável para transcrever valor: perde índices de fórmula, embaralha colunas de tabela e falha em silêncio, devolvendo número plausível e errado. Nenhuma revisão de norma entra no sistema por esse caminho.

Cada tabela é cadastrada com:

| Campo | Descrição |
| :--- | :--- |
| Norma e revisão | Ex.: DIS-NOR-053, REV 06 |
| Data de aprovação da revisão | Do cabeçalho da própria norma |
| Identificação da tabela | Ex.: Quadro 35, Tabela 14 |
| Item e página de origem | Página **impressa no rodapé da norma**, não a do leitor de PDF |
| Linhas da tabela | Faixa ou chave, e o valor correspondente |
| Responsável e data do cadastro | Quem digitou e quando |
| Responsável e data da conferência | Segunda leitura independente, obrigatória |
| Situação | Rascunho · Publicada · Substituída |

Regras da área administrativa:

- **Dupla leitura obrigatória.** Uma revisão só sai de rascunho depois de conferida por pessoa diferente de quem cadastrou.
- **Os cinco exemplos do Anexo I são o portão de publicação.** Antes de publicar uma revisão, o sistema roda os cinco exemplos resolvidos da norma com os parâmetros recém-cadastrados. Se algum deixar de fechar, a revisão não é publicada — é assim que erro de digitação aparece.
- **Revisão publicada não é editada.** Norma nova gera revisão nova, e a anterior fica como substituída. Cálculo antigo continua apontando para a revisão sob a qual foi feito.

Tabelas a cadastrar:

| Tabela | Norma | O que dá |
| :--- | :--- | :--- |
| Quadro 35 | 053 | Demanda do apartamento por faixa de área útil |
| Quadro 36 | 053 | Fator de coincidência por número de apartamentos |
| Quadro 37 | 053 | Fator de segurança por faixa de demanda residencial |
| Quadro 33 | 053 | Fator de demanda do agrupamento de estações de recarga |
| Tabelas 1 e 2 | 053 | Mínimo por tensão, ramal de entrada e proteção |
| Tabelas 6 e 22 | 030 | Fator de demanda de iluminação e tomadas |
| Tabelas 7, 8 e 9 | 030 | Fator de demanda de aquecimento, lavagem e cocção |
| Tabelas 11 e 12 | 030 | Potência e fator de demanda de condicionadores de ar |
| Tabela 13 | 030 | Fator de demanda de estações de recarga individuais |
| Tabela 14 | 030 | Fator de demanda de motores |
| Tabela 15 | 030 | Fator de demanda de equipamentos especiais |
| Tabela 16 | 030 | Fator de demanda de bombas e hidromassagem |
| Tabela 18 | 030 | Conversão de potência de motor em CV/HP para kW e kVA |

> A DIS-NOR-053 foi revisada sete vezes em menos de quatro anos e a DIS-NOR-030 passou da REV 06 para a REV 07 em cinco meses. As duas revisam de forma independente, então **cada cálculo registra as duas revisões aplicadas**, não uma.

---

### 2. Identificação e classificação da edificação

**Dados administrativos**

| Parâmetro | Observação |
| :--- | :--- |
| Nome do projeto | Livre |
| Endereço e município | Define a jurisdição da distribuidora |
| Nº do protocolo | Gerado pelo sistema |

**Parâmetros técnicos** — determinam qual método e quais tabelas se aplicam. O sistema deriva a regra; o projetista não escolhe a tabela.

| Parâmetro | Por que entra | Fonte |
| :--- | :--- | :--- |
| **Tipo de edificação** | Define o método de cálculo aplicável | DIS-NOR-053, itens 6.22 a 6.25 |
| **Tensão de fornecimento** | Determina o valor mínimo normativo que pode sobrepor o resultado | DIS-NOR-053, Anexo I, item 8 |
| **Tipo de ligação** | Monofásico, bifásico ou trifásico | DIS-NOR-030, item 6.27 |
| **Padrão de entrada** | Medição coletiva agrupada ou individual por unidade | DIS-NOR-053, item 6.17 |
| **Nº de pavimentos** | Caracterização do porte, usada nas validações | — |

**Tipos de edificação e métodos correspondentes:**

| Tipo | Método aplicado | Item da 053 |
| :--- | :--- | :--- |
| Residencial coletivo | Área útil para as unidades; carga instalada para os serviços do condomínio | 6.22.1 e 6.22.4 |
| Não residencial (comercial, industrial) | Carga instalada, no total e por unidade | 6.23.1 |
| Misto (residencial + comercial) | Cada parte pelo método próprio, somadas | 6.24.1 |
| Smart / Studio / Home Studio acima de 15 unidades | Área útil com fator de coincidência fixo de **90%**, independente do número de unidades. Carga instalada é opcional | **6.25.1** |
| Com carregador veicular | Demanda da área útil somada à da estação de recarga, com o fator de coincidência do item 6.26 | 6.22.2 |

> Além da demanda da edificação, o **item 6.22.3** exige um segundo cálculo: a demanda individual de cada apartamento pelo método da carga instalada, usada para escolher a categoria de fornecimento da unidade. São dois cálculos distintos sobre o mesmo prédio.

---

### 3. Grupos residenciais — método da área útil (para calcular Drf)

Dados inseridos por **grupo de unidades** — unidades de mesma área agrupadas. Importação por planilha `.xlsx` é alternativa ao preenchimento manual.

| Parâmetro | Por que entra | Fonte |
| :--- | :--- | :--- |
| **Nome do grupo** | Ex.: "Apartamento tipo A" | — |
| **Área útil (m²)** | Determina a demanda unitária pelo Quadro 35 | DIS-NOR-053, Anexo I, Quadro 35, p. 107 |
| **Quantidade de unidades do grupo** | Multiplica a demanda unitária | DIS-NOR-053, Anexo I, itens 1.3 e 2 |
| **Tipo de unidade** (Smart/Studio?) | Acima de 15 unidades, força o fator de coincidência de 90% | DIS-NOR-053, item 6.25.1 |

Sequência aplicada, na ordem do Anexo I:

```
D   = Demanda(1) × NºAptos(1) + … + Demanda(n) × NºAptos(n)
Dtr = D × Fc
Drf = Dr × Fr
```

Dois pontos que mudam a implementação:

- **`Fc` é da edificação inteira, não do grupo** (Anexo I, item 3). O agrupamento por área útil serve só para achar a demanda unitária de cada tipo; o fator de coincidência vem do total de apartamentos residenciais do prédio.
- **`Fr` é recomendado, não fixo** (Anexo I, item 5). O Quadro 37 traz o valor recomendado por faixa de `Dr`, e a norma admite fator maior "desde que apresentada uma justificativa". É saída derivada por padrão e **entrada opcional acompanhada de justificativa**, que precisa constar do memorial.

Para empreendimentos com **mais de uma torre ou bloco**, vale o Anexo I item 9: as cargas são agrupadas antes dos fatores, e o fator de coincidência sai do somatório dos apartamentos alimentados pelo mesmo transformador ou quadro geral, não bloco a bloco.

---

### 4. Áreas de serviço e cargas comerciais — método da carga instalada (Ds e Dc)

A DIS-NOR-053 remete à DIS-NOR-030 para este cálculo. A fórmula da DIS-NOR-030 REV 07, item 6.27, p. 47, tem **nove parcelas**:

```
D = a + b + c + d + e + f + g + h + i   [kVA]
```

| Parcela | Categoria de carga | Fator de demanda | Fator de potência |
| :-- | :--- | :--- | :--- |
| **a** | Iluminação e tomadas | Tabela 6 (residencial) · Tabela 22 (demais ocupações) | Tomadas 1,00 · fluorescente, néon ou vapor de sódio 0,95 · fluorescente compacta e LED 0,80 |
| **b** | Chuveiros, torneiras, aquecedores de passagem, ferros | Tabela 7 — 1,00 em vestiários | 1,00 |
| **c** | Aquecedor central ou de acumulação | Tabela 8 | 1,00 |
| **d** | Secadora, lava-roupas, lava-louças, micro-ondas | Tabela 9 | **0,92** ou conforme fabricante |
| **e** | Fornos e fogões elétricos | Tabela 9 | 1,00 |
| **f** | Condicionadores de ar | Tabela 12 — potência por aparelho na Tabela 11 | unidade central: fator de demanda 1,00 |
| **g** | Motores e máquinas de solda a motor | Tabela 14 | potência de placa em CV/HP convertida pela **Tabela 18** |
| **h** | Equipamentos especiais | Tabela 15 — maior 1,00, demais **0,60** | conforme placa |
| **i** | Bombas e hidromassagem | Tabela 16 — 1 → 1,00 · 2 → 0,56 · 3 → 0,47 · acima de 3 → 0,39 | 1,00 |

> **Fonte:** DIS-NOR-030 REV 07, itens 6.27.1 a 6.27.9, p. 47–50

O sistema precisa aceitar entradas para **todas as nove parcelas** que existam na edificação — não apenas iluminação, TUG, motores e equipamentos especiais.

**A tecnologia da lâmpada é entrada obrigatória** quando a ocupação não é residencial: é ela que define o fator de potência da parcela `a`, e a diferença entre 0,95 e 0,80 é material no resultado.

**Motores acima de 5 CV e equipamentos especiais** (raios-X, solda a transformador, fornos de indução, eletrólise) geram alerta de validação em tempo real: o sistema pede o dado adicional necessário em vez de expor um campo para cada caso no formulário principal.

#### Regras específicas para motores (parcela g) — Tabela 14

| Regra | Descrição |
| :--- | :--- |
| **Motor maior → fator 1,00** | O motor de maior potência entra com fator de demanda 1,00 |
| **Demais motores → fator 0,50** | Todos os outros entram com 0,50 |
| **Motores de potência igual** | Havendo dois ou mais de mesma potência, apenas **um** conta como o maior; os demais vão para o grupo de 0,50 |
| **Partida simultânea obrigatória** | Motores que precisam partir simultaneamente por determinação do processo têm as potências **somadas** e contam como um único motor |
| **Conversão de potência** | CV ou HP de placa convertidos para kVA pela **Tabela 18**, não por cálculo próprio |

---

### 5. Recarga de veículos elétricos (para calcular Dve)

| Parâmetro | Por que entra | Fonte |
| :--- | :--- | :--- |
| **Quantidade de pontos de recarga** | Determina o fator de demanda do agrupamento | DIS-NOR-053, item 6.26.1, Quadro 33 |
| **Potência por ponto (kW)** | Deve ser a potência da placa do fabricante da estação | DIS-NOR-030, item 6.26.4.1 |
| **Tipo de posto** | Individualizado por unidade ou coletivo | DIS-NOR-030, item 6.27.10 |
| **Estação incorporada ao veículo?** | Única hipótese em que vale o valor padrão | DIS-NOR-030, item 6.26.4.1, nota |
| **Sistema de gerenciamento de carga?** | Altera a demanda de corte usada no dimensionamento da proteção | DIS-NOR-053, itens 6.26.3 e 6.26.3.1 |

> **Valor padrão de 3,3 kW:** **DIS-NOR-030, item 6.26.4.1.** Aplica-se **exclusivamente** à estação de recarga incorporada ao veículo cuja potência não seja informada. Não é valor padrão para estação fixa sem potência declarada.

**Qual tabela de fator de demanda usar** — as duas normas trazem tabelas diferentes, e a 053 resolve a escolha no Anexo I, item 13: independente da potência da estação e de ela estar ou não inclusa na medição individual, o `Dve` do quadro geral e do transformador usa o fator do item 6.26 da 053.

| Objeto do cálculo | Tabela |
| :--- | :--- |
| `Dve` do agrupamento — quadro geral, transformador, demanda da edificação | **Quadro 33, DIS-NOR-053** |
| Demanda individual de uma UC pelo método da carga instalada (parcela `j`) | **Tabela 13, DIS-NOR-030** |

> **Parcela `j`.** A DIS-NOR-030 define a fórmula com nove parcelas (`a` a `i`) e, no item 6.27.10, uma décima parcela `j` para estação de recarga, que não entra no somatório. Na 053 a recarga é termo próprio (`Dve`), então o motor trata `j` fora da soma das nove. Somar as duas conta a recarga duas vezes.

---

### 6. Documentos para envio

Checklist obrigatório que bloqueia o envio enquanto incompleto, conforme o item 6.27.7.1 da DIS-NOR-053.

| Documento | Formato |
| :--- | :--- |
| Documento de responsabilidade técnica (ART/TRT/RRT) | Upload — PDF |
| Diagrama unifilar | Upload — PDF |
| Planta de situação | Upload |
| Planta da entrada de serviço | Upload |
| Termo de responsabilidade pelo aterramento (demanda acima de 1 MVA) | Upload — condicional |

---

## Saídas

### Resultados do cálculo

O cálculo é exibido passo a passo, com a fórmula aplicada e a referência normativa de cada linha. **Todas as demandas em kVA.**

| Saída | O que é | Fonte |
| :--- | :--- | :--- |
| **Drf** | Demanda residencial após fator de coincidência e fator de segurança | DIS-NOR-053, Anexo I |
| **Ds** | Demanda das áreas comuns e serviços do condomínio | DIS-NOR-030, item 6.27 |
| **Dc** | Demanda das cargas comerciais, quando aplicável | DIS-NOR-030, item 6.27 |
| **Dve** | Demanda dos carregadores de veículos elétricos, quando aplicável | DIS-NOR-053, item 6.26.1 |
| **Ded calculada** | Soma direta dos componentes | DIS-NOR-053, Anexo I, p. 106 |
| **Ded mínima** | Valor mínimo normativo por tensão de fornecimento | DIS-NOR-053, Anexo I, item 8 |
| **Ded final** | O maior entre calculada e mínima — o valor que prevalece | DIS-NOR-053, Anexo I, item 8 |
| **Categoria de agrupamento** | Padrão de entrada, proteção geral e seção do ramal | Tabela 1 (220/127 V) ou Tabela 2 (380/220 V) |

### Validações normativas

Verificações que o motor executa e reporta junto com o resultado:

| Validação | Regra | Fonte |
| :--- | :--- | :--- |
| Mínimo por tensão | `Ded final` nunca abaixo do mínimo da tensão declarada | 053, Anexo I, item 8 |
| Limite do transformador | Com recarga na medição de serviço ou em medição adicional exclusiva, `Ds + Dve` não pode passar de **50% da potência do transformador** | 053, item 6.26.2 |
| Estudo de rede | Potência da estação somada às demais cargas da unidade acima de **20 kW** exige estudo da rede de distribuição | 030, item 6.26.4.2 |
| Justificativa do fator de segurança | `Fr` acima do recomendado no Quadro 37 exige justificativa anexada | 053, Anexo I, item 5 |
| Faixa de porte | Até 50 kVA admite projeto simplificado; acima disso, projeto completo | 053, itens 6.27.1 e 6.27.3 |

### Documentos gerados

| Documento | Descrição |
| :--- | :--- |
| **Memorial descritivo (PDF)** | Gerado no formato exigido pelo item 6.27.7.1 — identificação do projeto, unidades consumidoras, memória de cálculo, demanda prevista, potência total instalada e responsável técnico |
| **Planilha de UCs (.xlsx)** | Exportação dos grupos com os fatores aplicados pelo sistema |

### Rastreabilidade — registro por cálculo

A DIS-NOR-053 foi revisada sete vezes em menos de quatro anos, e a DIS-NOR-030 revisa em ritmo próprio. Dois cálculos idênticos feitos sob revisões diferentes podem produzir resultados diferentes. Cada execução do motor gera um registro persistido.

Nomes em inglês, conforme a convenção de código do projeto ([`../../app/back/README.md`](../../app/back/README.md)); o texto de tela permanece em português.

| Campo | Descrição |
| :--- | :--- |
| `calculationId` | Identificador único do cálculo |
| `calculatedAt` | Timestamp da execução |
| `mainStandard` / `mainStandardRevision` | Ex.: DIS-NOR-053, REV 06 |
| `secondaryStandard` / `secondaryStandardRevision` | Ex.: DIS-NOR-030, REV 07 |
| `buildingType` | Tipo declarado pelo projetista |
| `supplyVoltage` | Tensão de fornecimento informada |
| `inputSnapshot` | Cópia dos valores inseridos no momento do cálculo |
| `appliedRules` | Itens da norma usados em cada etapa |
| `appliedTables` | Tabelas usadas, com a revisão de cada uma |
| `residentialDemand` | `Dr`, antes do fator de segurança |
| `coincidenceFactor` | `Fc` aplicado e o nº de unidades que o determinou |
| `safetyFactor` | `Fr` aplicado, a faixa que o determinou e a justificativa, quando acima do recomendado |
| `residentialDemandFinal` | `Drf` |
| `serviceDemand` | `Ds` |
| `commercialDemand` | `Dc` |
| `evChargingDemand` | `Dve` |
| `calculatedTotalDemand` | `Ded` calculada |
| `minimumTotalDemand` | Mínimo normativo por tensão |
| `finalTotalDemand` | `Ded` final |
| `minimumApplied` | Booleano — se o mínimo normativo sobrepôs o cálculo |
| `validationWarnings` | Validações normativas disparadas |

### Saídas do fluxo de acompanhamento

| Saída | Quem vê | Descrição |
| :--- | :--- | :--- |
| Status do projeto | Projetista | Rascunho · Aguardando envio · Em análise · Reprovado · Aprovado |
| Nº de UCs | Projetista e analista | Porte do projeto na listagem |
| Demanda na listagem (kVA) | Projetista e analista | Resultado final visível sem abrir o projeto |
| Alertas de pré-validação | Analista | Inconsistências detectadas antes da análise manual |
| **Apontamentos de reprovação** | Projetista | Vinculados à etapa exata do cálculo — o projetista corrige o ponto apontado sem refazer o projeto |

---

## Divergências entre as normas e critério adotado

| Divergência | Regra aplicada | Efeito |
| :--- | :--- | :--- |
| Fator de demanda de recarga: Quadro 33 da 053 contra Tabela 13 da 030 | Quadro 33 para o agrupamento, Tabela 13 para a unidade individual (Anexo I, item 13) | Nenhum: as tabelas medem objetos diferentes |
| Fator de potência de tomadas: 1,00 na 030 contra 0,80 no Exemplo 1 da 053 | Vale a 030, que o Anexo I item 7.2 manda usar | O motor não reproduz a parcela `a` do Exemplo 1 na casa dos centavos: 4,50 contra 4,69 kVA. O resultado final daquele exemplo não muda, porque o mínimo por tensão domina |
| Parcela `j` definida fora do somatório das nove, na 030 | Tratada como `Dve`, fora da soma | Nenhum, desde que não seja somada duas vezes |

Detalhamento e evidência em [`fontes-normativas.md`](fontes-normativas.md).

---

## Tabela bibliográfica

| # | Documento | Emissor | Revisão / Data | Trecho relevante |
| :- | :--- | :--- | :--- | :--- |
| 1 | DIS-NOR-053 — Edificações com Múltiplas Unidades Consumidoras até 34,5 kV | Neoenergia (Coelba, Pernambuco, Cosern, Elektro) | REV 06 · 09/09/2025 | Metodologia e exemplos: Anexo I, p. 106–133. Tipos de edificação: 6.22 a 6.25. Recarga veicular: 6.26. Projeto elétrico e documentação: 6.27 |
| 2 | DIS-NOR-030 — Tensão Secundária a Edificações Individuais | Neoenergia Pernambuco | REV 07 · 17/04/2026 | Carga instalada: item 6.27, p. 47–50. Recarga veicular: 6.26.4. Tabelas de fator de demanda: 6, 7, 8, 9, 11 a 16, 18 e 22 |
| 3 | Processo de submissão de projetos | Neoenergia Pernambuco | Vigente | Documentos exigidos, prazo de análise e validade da aprovação — ver [`../negocio/processo-submissao.md`](../negocio/processo-submissao.md) |
| 4 | REN nº 1.000/2021, arts. 554 e 555 | ANEEL | 2021 | Recarga de veículos de terceiros e vedação de injeção na rede. Referenciada na **DIS-NOR-030**, itens 6.26.4.3 e 6.26.4.4 |
