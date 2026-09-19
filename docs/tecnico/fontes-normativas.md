# Fontes Normativas

As fontes que definem o cálculo de demanda para edificações com múltiplas unidades consumidoras na Neoenergia PE. A norma é pública e traz a metodologia completa, com exemplos numéricos resolvidos.

---

## Duas famílias de norma

| Família | De quem é | Acesso | O que trata |
| :------------- | :--------------------- | :------------------------------------------ | :------------------------------------------------------------ |
| **DIS-NOR-xxx** | Da própria Neoenergia | **Pública e gratuita**, no site da distribuidora | Como se conecta à rede dela. **É aqui que está o cálculo de demanda.** |
| **ABNT NBR**    | Da ABNT, entidade nacional | **Vendida**, sem API pública               | Instalação elétrica em geral: condutor, eletroduto, aterramento, subestação |

A Neoenergia publica integralmente o que é dela. O que é pago pertence a outra entidade, e por isso ela não pode redistribuir. **Não há norma escondida nem exigência de comprar algo para conhecer a regra de cálculo.**

As 12 NBR citadas pela DIS-NOR-053 são referências de instalação e não entram no cálculo de demanda. A verificação está em [As NBR não entram no cálculo de demanda](#as-nbr-não-entram-no-cálculo-de-demanda).

---

## A norma principal

**DIS-NOR-053 — Fornecimento de Energia Elétrica à Edificações com Múltiplas Unidades Consumidoras até 34,5 kV**

| Campo | Valor |
| :---------------- | :------------------------------------------------------------------------ |
| Revisão vigente   | **REV 06** |
| Data de aprovação | **09/09/2025** |
| Aprovador         | Ricardo Prado Pina |
| Extensão          | 353 páginas |
| Abrangência       | Documento **unificado** entre as distribuidoras do grupo Neoenergia: Coelba, **Pernambuco**, Cosern e Elektro |
| Download          | [PDF direto](https://www.neoenergia.com/documents/d/rn/dis-nor-053-rev06) · [índice de normas da Neoenergia PE](https://www.neoenergia.com/web/pernambuco/normas-tecnicas) |

Norma complementar, referenciada o tempo todo pela 053 para o método da carga instalada:

**DIS-NOR-030 — Fornecimento de Energia Elétrica em Tensão Secundária de Distribuição à Edificações Individuais**

| Campo | Valor |
| :---------------- | :------------------------------------------------------------------------ |
| Revisão vigente   | **REV 07** |
| Data de aprovação | **17/04/2026** |
| Aprovador         | Ricardo Prado Pina — o mesmo da 053 |
| Extensão          | 142 páginas |
| Download          | [PDF direto](https://www.neoenergia.com/documents/d/pernambuco/dis-nor-030-rev07?download=true) |

O cálculo está no item 6.27, página 47.

O PDF da 053 está hospedado sob o caminho `/d/rn/` porque é o mesmo documento das quatro distribuidoras. O próprio histórico de revisões declara a unificação.

### Procedência

As duas normas são indicadas pela **Neoenergia**, com os ponteiros de onde está o cálculo: Anexo I, página 106 na 053, e item 6.27, página 47 na 030. A indicação partiu da equipe técnica da distribuidora, em 18/08/2026, e chegou ao time pela professora da disciplina em 20/08/2026.

Qual documento rege o cálculo de demanda não é, portanto, interpretação do time.

---

## A metodologia de cálculo

Está no **Anexo I** da DIS-NOR-053, páginas 106 a 111, com cinco exemplos numéricos resolvidos de ponta a ponta. É a especificação do motor.

### Estrutura geral

O item 6.21.1 diz apenas que a demanda da edificação é a soma das demandas das áreas residencial, comercial e de serviço, **calculadas conforme a metodologia do Anexo I**. A fórmula em si está no Anexo I, p. 106:

```
Ded = Drf + Ds + Dc + Dve   [kVA]
```

| Termo | O que é | Método |
| :--- | :--- | :--- |
| `Ded` | Demanda total da edificação | — |
| `Drf` | Demanda dos apartamentos residenciais | Área útil — Anexo I da 053 |
| `Ds` | Demanda de serviço do condomínio | Carga instalada — DIS-NOR-030 |
| `Dc` | Demanda das cargas comerciais | Carga instalada — DIS-NOR-030 |
| `Dve` | Demanda dos carregadores de veículos elétricos | Fator de demanda do item 6.26 da 053 |

Para empreendimentos com **mais de uma torre ou bloco**, o Anexo I item 9 define uma segunda fórmula, com as cargas agrupadas antes dos fatores:

```
Dte = ADrf + ADs + ADc
```

O fator de coincidência sai do **somatório dos apartamentos alimentados pelo mesmo transformador ou quadro geral** (item 9.3), não bloco a bloco.

Os cinco exemplos resolvidos do Anexo I usam uma terceira notação, mais curta, para o caso sem cargas comerciais nem recarga veicular:

```
Df = (Dr × Fr) + Ds
```

É a mesma conta: `Dr × Fr` é o `Drf`, e `Dc` e `Dve` são zero. As três notações — `Ded`, `Dte` e `Df` — convivem na norma e descrevem a mesma grandeza em recortes diferentes. O motor usa `Ded` como nome canônico e registra qual recorte foi aplicado.

### Área residencial — método da área útil

Sete passos, na ordem do Anexo I:

1. Agrupar apartamentos de mesma área útil
2. Demanda de cada tipo pelo **Quadro 35**, faixa de área útil → kVA (até 40 m² = 1,00 kVA … 901–1000 m² = 16,93 kVA)
3. Multiplicar pela quantidade de cada tipo e somar:
   `D = Demanda(1) × NºAptos(1) + … + Demanda(n) × NºAptos(n)`
4. Fator de coincidência `Fc` pelo **Quadro 36**, em função do **número total de apartamentos residenciais da edificação** (1 apto = 100% · 15 = 90,27% · 30 = 78,27% · 60 ou mais = 68,23%)
5. `Dtr = D × Fc`
6. Fator de segurança `Fr` pelo **Quadro 37**, por faixa de `Dr`: ≤ 25 kVA → 1,5 · 25–50 kVA → 1,3 · 50–100 kVA → 1,2 · > 100 kVA → 1,1
7. `Drf = Dr × Fr`

Dois detalhes que mudam a implementação:

- **`Fc` é da edificação inteira, não do grupo.** O agrupamento por área útil serve só para achar a demanda unitária de cada tipo; o fator vem do total de unidades do prédio.
- **`Fr` é recomendado, não fixo.** O Quadro 37 traz o valor recomendado e a norma admite fator maior "desde que apresentada uma justificativa". É saída derivada por padrão e entrada opcional acompanhada de justificativa.

Condomínios tipo smart, studio e home studio **acima de 15 unidades** usam `Fc` fixo de 90%, independentemente da quantidade — Anexo I, observação do item 4, e **item 6.25.1**. O item 6.22.1 é outra coisa: declara que o método da área útil é preferível ao da carga instalada, porque evita superdimensionamento do ramal e do transformador.

Além da demanda da edificação, o **item 6.22.3** exige um segundo cálculo: a demanda individual de cada apartamento, pelo método da carga instalada da DIS-NOR-030, usada para escolher a categoria de fornecimento da unidade. São dois cálculos distintos sobre o mesmo prédio.

### Área de serviço e cargas comerciais — método da carga instalada

DIS-NOR-030, item 6.27, p. 47. São **nove parcelas**:

```
D = a + b + c + d + e + f + g + h + i   [kVA]
```

| Parcela | Carga | Fator de demanda | Fator de potência |
| :-- | :--- | :--- | :--- |
| `a` | Iluminação e tomadas | Tabela 6 (residencial) · Tabela 22 (demais ocupações) | Tomadas 1,00 · fluorescente, néon ou vapor de sódio 0,95 · fluorescente compacta e LED 0,80 |
| `b` | Chuveiros, torneiras, aquecedores de passagem, ferros | Tabela 7 — 1,00 em vestiários | 1,00 |
| `c` | Aquecedor central ou de acumulação | Tabela 8 | 1,00 |
| `d` | Secadora, lava-roupas, lava-louças, micro-ondas | Tabela 9 | **0,92** ou conforme fabricante |
| `e` | Fornos e fogões elétricos | Tabela 9 | 1,00 |
| `f` | Condicionadores de ar | Tabela 12 — potência por aparelho na Tabela 11 | unidade central: fator de demanda 1,00 |
| `g` | Motores e máquinas de solda a motor | Tabela 14 | potência de placa em CV/HP convertida pela **Tabela 18** |
| `h` | Equipamentos especiais | Tabela 15 — maior 1,00, demais **0,60** | conforme placa do equipamento |
| `i` | Bombas e hidromassagem | Tabela 16 — 1 → 1,00 · 2 → 0,56 · 3 → 0,47 · acima de 3 → 0,39 | 1,00 |

**O fator de potência não é global nem entrada do projetista.** A norma o define parcela a parcela, e na iluminação ele depende da tecnologia da lâmpada. Cada parcela já sai em kVA — não existe conversão final de kW para kVA. O Anexo I da 053 diz isso no item 7.2: a potência em kVA deve ser calculada com base nos fatores de potência específicos dos eletrodomésticos conforme DIS-NOR-030.

> **Divergência não resolvida: fator de potência das tomadas.** A DIS-NOR-030, item 6.27.1.2, fixa fator de potência **1,00 para tomadas**. O Exemplo 1 do Anexo I da 053 calcula a parcela `a` de um condomínio usando **0,80 para iluminação e para tomadas**: `a = 3/0,8 × 1 + 1,5/0,8 × 0,5 = 4,69 kVA`. Com o 1,00 da 030, a mesma conta dá 4,50 kVA.
>
> **Vale a 030**, porque o Anexo I da 053 manda usar os fatores de potência dela (item 7.2) e é a 030 que detém o método da carga instalada. Consequência: o motor não reproduz a parcela `a` do Exemplo 1 na casa dos centavos. O resultado final daquele exemplo não muda, porque o mínimo por tensão domina.

**Motores (parcela `g`), Tabela 14:** maior motor com fator 1,00, demais com 0,50. Se os maiores tiverem potências iguais, considera-se apenas um como o maior. Motores que obrigatoriamente partem simultaneamente têm as potências somadas e contam como um só motor.

> **Divergência dentro da própria norma.** O item 6.27 apresenta a fórmula com nove parcelas, de `a` a `i`, mas o item 6.27.10 define uma décima parcela `j`, estação de recarga de veículos elétricos, que não aparece no somatório. Na 053 a recarga é termo próprio (`Dve`). **A parcela `j` fica fora da soma das nove** — somar as duas conta a recarga duas vezes.

### Conflito entre as duas normas: qual tabela de recarga veicular vale

As duas normas trazem fator de demanda por quantidade de estações de recarga, **com valores diferentes**:

| Nº de estações | 053 · Quadro 33 (item 6.26.1) | 030 · Tabela 13 (item 6.27.10) |
| :--- | :--- | :--- |
| 1 a 10 | 1,00 | 1,00 |
| 11 a 20 | 0,86 | 0,90 |
| 21 a 30 | 0,80 | 0,82 |
| 31 a 40 | 0,78 | 0,80 |
| 41 a 50 | 0,75 | 0,77 |
| 51 a 75 | 0,70 | 0,75 (acima de 50) |
| 76 a 100 | 0,65 | — |
| Acima de 100 | 0,60 | — |

A 053 resolve a escolha. O **Anexo I, item 13** determina que, independente da potência da estação de recarga e de ela estar ou não inclusa na medição individual, o cálculo de `Dve` para o quadro geral e o transformador usa o fator de demanda do **item 6.26** — o Quadro 33 da 053. O item 6.22.2 dá a mesma direção para a unidade com carregador próprio.

A regra que o motor aplica:

| Objeto do cálculo | Tabela |
| :--- | :--- |
| `Dve` do agrupamento — quadro geral, transformador, demanda da edificação | **Quadro 33, DIS-NOR-053** |
| Demanda individual de uma UC pelo método da carga instalada (parcela `j`) | **Tabela 13, DIS-NOR-030** |

Não são a mesma grandeza: uma é o agrupamento do condomínio, a outra é a carga de uma unidade.

**Duas restrições associadas, que o motor deve validar:**

- Estações em medição de serviço da edificação ou em medição adicional exclusiva: `Ds + Dve` não pode ultrapassar **50% da potência do transformador** — 053, item 6.26.2
- Potência da estação somada às demais cargas da unidade acima de **20 kW**: exige estudo da rede de distribuição — 030, item 6.26.4.2

Onde ficam as regras de recarga em cada norma, já que os itens têm numeração parecida nas duas:

| Regra | Norma e item |
| :--- | :--- |
| Fator de demanda do agrupamento (Quadro 33) | 053 · 6.26.1 |
| Limite de 50% do transformador | 053 · 6.26.2 |
| Sistemas de limitação de carga | 053 · 6.26.3 |
| QDM adicional na garagem e segunda UC | 053 · 6.26.4 |
| Carga instalada pela placa e nota dos 3,3 kW | **030** · 6.26.4.1 |
| Limite de 20 kW com estudo de rede | **030** · 6.26.4.2 |
| REN nº 1.000/2021, arts. 554 e 555 | **030** · 6.26.4.3 e 6.26.4.4 |
| Equipamentos especiais | **030** · 6.26.3.2 |

> **Valor padrão de 3,3 kW.** O item 6.26.4.1 da **DIS-NOR-030** manda usar a potência da placa do fabricante da estação. A nota dos 3,3 kW vale **apenas para estação de recarga incorporada ao veículo cuja potência não seja informada** — não é valor padrão para estação fixa sem potência declarada.

### Regras por tipo de edificação

O escopo abrange edifícios residenciais, comerciais, shoppings e indústrias. O que determina a aplicação da norma é a **medição individual por unidade consumidora**, não o tipo de uso.

| Tipo | Método | Item da 053 |
| :--- | :--- | :--- |
| Uso coletivo residencial | Área útil para a parte residencial; carga instalada para os serviços do condomínio | 6.22.1 e 6.22.4 |
| Uso coletivo não residencial | Carga instalada (DIS-NOR-030), tanto no total quanto por unidade — salas ou lojas | 6.23.1 |
| Misto residencial e comercial | Partes tratadas em separado e somadas: comercial por carga instalada, residencial por área útil | 6.24.1 |
| Smart, Studio, Home Studio, acima de 15 unidades | Área útil com fator de coincidência fixo de **90%**, independentemente do número de unidades. Carga instalada é opcional | 6.25.1 |
| Unidade com carregador veicular | Demanda da área útil somada à da estação de recarga, multiplicada pelo fator de coincidência conforme a quantidade de carregadores no condomínio | 6.22.2 |

### Demanda mínima por tensão de fornecimento

Há um mínimo normativo que sobrepõe o cálculo (Anexo I, item 8):

| Tensão | Tabela | Ramal de entrada | Disjuntor |
| :--- | :--- | :--- | :--- |
| 220/127 V | Tabela 1 | 35 mm² | 100 A |
| 380/220 V | Tabela 2 | 16 mm² | 70 A |

No exemplo 1 da norma, uma edificação com demanda calculada de 32,37 kVA em 380/220 V tem o mínimo de 46 kVA aplicado.

O item **6.27.1 da 053** define ainda o corte de porte que aparece no desafio: edificações com demanda total **até 50 kVA**, ramal aéreo e um único centro de medição podem apresentar projeto simplificado. Acima de 50 kVA, projeto completo analisado pela distribuidora (item 6.27.3).

### Tabelas paramétricas a persistir

Todas versionadas por revisão de norma, nunca como constante no código:

| Tabela | Norma | O que dá |
| :--- | :--- | :--- |
| Quadro 35 | 053 | Demanda do apartamento por faixa de área útil |
| Quadro 36 | 053 | Fator de coincidência por número de apartamentos |
| Quadro 37 | 053 | Fator de segurança por faixa de demanda residencial |
| Quadro 33 | 053 | Fator de demanda do agrupamento de estações de recarga |
| Tabelas 1 e 2 | 053 | Mínimo por tensão e dimensionamento de ramal e proteção |
| Tabelas 6 e 22 | 030 | Fator de demanda de iluminação e tomadas |
| Tabelas 7, 8, 9 | 030 | Fator de demanda de aquecimento, lavagem e cocção |
| Tabelas 11 e 12 | 030 | Potência e fator de demanda de condicionadores de ar |
| Tabela 13 | 030 | Fator de demanda de estações de recarga individuais |
| Tabela 14 | 030 | Fator de demanda de motores |
| Tabela 15 | 030 | Fator de demanda de equipamentos especiais |
| Tabela 16 | 030 | Fator de demanda de bombas e hidromassagem |
| Tabela 18 | 030 | Conversão de potência de motor em CV/HP para kW e kVA |

---

## Exemplos da norma como suíte de regressão

O Anexo I traz **cinco exemplos resolvidos de ponta a ponta**, com os valores intermediários de cada passo. Eles são a única forma verdadeiramente confiável de validar o motor: se um número da tabela de fatores foi transcrito errado, o exemplo correspondente deixa de fechar. Nenhum parâmetro normativo deveria entrar no banco sem que os cinco exemplos ainda passem.

| # | Página | Caso | Cobre |
| :-- | :--- | :--- | :--- |
| 1 | 113–115 | Residencial, 4 andares, 20 aptos de 40 m², 380/220 V | Quadro 35, Quadro 36, Quadro 37, parcelas `a` e `g`, mínimo por tensão |
| 2 | 116–118 | Residencial, 19 andares, 76 aptos de 128 m², 2 elevadores de 15 cv e 2 bombas de 3 cv, 220/127 V | `Fc` no piso de 68,23%, `Fr` de 1,1, regra de motores de potência igual, Tabela 18 |
| 3 | 119–125 | Conjunto de três blocos, apartamento tipo e cobertura | Agrupamento entre blocos (`Dte`), áreas úteis distintas no mesmo empreendimento |
| 4 | 126–130 | Comercial, 4 andares com 8 salas cada | `Dc`, parcela `f` de ar-condicionado, fator de demanda de tomadas comerciais |
| 5 | 131–133 | Residencial pequeno, 19 aptos de 30 m², 380/220 V | Faixa de menor porte e o piso normativo |

**Exemplo 1, valores esperados** — o caso mais simples, bom como primeiro teste do motor:

| Passo | Valor da norma |
| :--- | :--- |
| Demanda unitária, até 40 m² (Quadro 35) | 1,00 kVA |
| `Fc` para 20 apartamentos (Quadro 36) | 87,20% |
| `Dr = 1,00 × 0,8720 × 20` | 17,44 kVA |
| `Fr` para `Dr ≤ 25 kVA` (Quadro 37) | 1,5 |
| `Dr × Fr` | 26,16 kVA |
| Parcela `a`, iluminação 3000 W e tomadas 1500 W | 4,69 kVA — 4,50 pela 030, ver a divergência de fator de potência acima |
| Parcela `g`, 1 motor de 1 cv = 1,52 kVA, fator 1,00 | 1,52 kVA |
| `Ds = a + g` | 6,21 kVA |
| `Df = (Dr × Fr) + Ds` | 32,37 kVA |
| Mínimo para 380/220 V | **46 kVA aplicado** |

**Exemplo 2, valores esperados** — cobre a regra dos motores de mesma potência:

| Passo | Valor da norma |
| :--- | :--- |
| Demanda unitária, 121–130 m² | 2,73 kVA |
| `Fc` para 76 apartamentos | 68,23% |
| `Dr = 2,73 × 0,6823 × 76` | 141,56 kVA |
| Parcela `g`, 4 motores: 2 de 15 cv e 2 de 3 cv | `16,65 × 1 + (16,65 + 4,04 + 4,04) × 0,5 = 29,01 kVA` |
| `Ds = a + g` | 41,01 kVA |
| `Df` com `Fr = 1,1` | 196,73 kVA |
| Mínimo para 220/127 V | **229 kVA aplicado** |

O segundo elevador de 15 cv entra no grupo dos "demais", com 0,50: é o que a nota da Tabela 14 determina quando as maiores potências são iguais.

Os valores dos exemplos 3 a 5 devem ser transcritos das páginas do PDF, não da extração de texto.

---

## Consulta e verificação das normas

As duas normas são PDFs públicos em URL direta: não dependem de cadastro, e-mail nem resposta do cliente.

### Limites da extração de texto

`pdftotext` localiza item e página. **Não serve para transcrever valor.** Nestes dois PDFs a extração perde informação em três pontos conhecidos:

- **Índices de fórmula.** `Ded = Drf + Ds + Dc + Dve` sai como `𝐷 =𝐷 +𝐷 +𝐷 + 𝐷`; os nomes dos termos só existem na legenda "Onde:" abaixo da fórmula. O mesmo vale para `Drf = Dr × Fr` e para as condições do fator de segurança.
- **Tabelas com sub-cálculos.** No exemplo 3, as colunas se misturam e os valores intermediários saem fora de ordem.
- **Diagramação nova.** Cada revisão pode mudar esse comportamento sem aviso.

A falha é silenciosa: a extração não quebra, devolve um número plausível e errado.

### Procedimento

**1. Baixar pela URL direta e registrar o hash.** O hash é o que prova que dois membros do time leram o mesmo arquivo, e o que denuncia uma republicação silenciosa na mesma URL.

```bash
curl -sL -o dis-nor-053.pdf "https://www.neoenergia.com/documents/d/rn/dis-nor-053-rev06"
curl -sL -o dis-nor-030.pdf "https://www.neoenergia.com/documents/d/pernambuco/dis-nor-030-rev07?download=true"
shasum -a 256 dis-nor-053.pdf dis-nor-030.pdf
```

| Arquivo | SHA-256 |
| :--- | :--- |
| DIS-NOR-053 REV 06 | `8b2158a4761927a5029d27c0fcbeadc44151c4660c2f9edcea6fe28bc416819f` |
| DIS-NOR-030 REV 07 | `45eaeea05addc18024c53088fc41c7a6b1f3580f96af9ae7f671d753c5e0cc3e` |

**2. Conferir revisão e data no cabeçalho da própria página.** Toda página traz código, revisão, número de página e data de aprovação. Se não bater com o que está escrito aqui, a norma mudou e este documento está desatualizado.

**3. Usar a extração só para localizar.** `pdftotext -layout` para achar em que página está o item; a leitura do valor é feita na página do PDF.

**4. Dupla leitura para todo valor que entra no banco.** Cada número de tabela paramétrica é conferido por duas leituras independentes — a página do PDF e uma segunda conferência por outra pessoa ou noutro momento. Valor divergente não entra até a divergência ser resolvida.

**5. Citar sempre item, tabela e página.** A paginação a usar é a **impressa no rodapé da norma** (`107/353`), não a do leitor de PDF — as duas não coincidem. Citação sem número de item não é verificável e não entra na documentação.

**6. Conferir a qual norma o item pertence.** As duas normas têm itens 6.26.3.2, 6.26.4.1 e 6.27 tratando de coisas diferentes. Trocar a norma na citação é o erro mais fácil de cometer aqui e o mais difícil de perceber depois.

**7. Os valores entram no sistema pela área administrativa, digitados.** Não há extração automática de PDF alimentando o motor, nem tabela normativa como constante no código. Cada tabela é cadastrada com norma, revisão, item, página e responsável, e passa por dupla leitura antes de sair de rascunho. A especificação da área está em [`engine-calculo.md`](engine-calculo.md).

**8. O portão final são os exemplos da norma.** Uma transcrição é considerada correta quando os cinco exemplos do Anexo I continuam fechando, não por ter sido lida com cuidado. Publicar uma revisão sem que os cinco fechem não é permitido pelo sistema.

**9. Detectar revisão nova.** Comparar o histórico de alterações na abertura de cada PDF com a tabela de revisões abaixo, pelo [índice de normas técnicas da Neoenergia PE](https://www.neoenergia.com/web/pernambuco/normas-tecnicas). Revisão nova é registrada no cálculo, não é atualização silenciosa de constante: ver a questão 18 em [`../produto/questoes-em-aberto.md`](../produto/questoes-em-aberto.md).

---

## Frequência de revisão

O histórico de alterações da DIS-NOR-053:

| Revisão | Data |
| :------ | :--------- |
| 00 | 29/10/2021 |
| 01 | 21/12/2021 |
| 02 | 22/02/2022 |
| 03 | 16/05/2022 |
| 04 | 22/07/2025 |
| 05 | 26/08/2025 |
| 06 | 09/09/2025 |

Sete revisões em menos de quatro anos, e **três delas em menos de dois meses** entre julho e setembro de 2025.

A DIS-NOR-030 acompanha o mesmo ritmo: REV 06 em 05/11/2025 e REV 07 em 17/04/2026 — cinco meses. As duas normas revisam de forma independente, então cada cálculo precisa registrar as duas revisões aplicadas, não uma.

**Consequência de arquitetura:** os parâmetros normativos não podem ser constantes no código. Precisam ser dados versionados e persistidos, com o resultado do cálculo registrando qual revisão aplicou. Isso atende de uma vez três coisas já escritas no projeto: a rastreabilidade prometida em [`../produto/objetivos-projeto.md`](../produto/objetivos-projeto.md), o requisito de classes de domínio persistidas em [`../../app/back/README.md`](../../app/back/README.md), e a herança e polimorfismo por tipo de edificação que a tabela de [Regras por tipo de edificação](#regras-por-tipo-de-edificação) praticamente desenha sozinha.

---

## O processo de submissão

Canais, documentos exigidos, prazo de análise e validade da aprovação estão em [`../negocio/processo-submissao.md`](../negocio/processo-submissao.md). Este documento cobre apenas a norma e o método de cálculo.

---

## Fontes regulatórias da ANEEL

A norma da distribuidora rege sozinha o cálculo de demanda. A ANEEL define apenas os prazos regulatórios do processo.

- **PRODIST Módulo 3 — Conexão ao Sistema de Distribuição**, aprovado como Anexo III da REN nº 956/2021. Piso regulatório que toda norma de distribuidora respeita. Baixar pela [página oficial do PRODIST](https://www.gov.br/aneel/pt-br/centrais-de-conteudos/procedimentos-regulatorios/prodist), que lista a versão vigente e o histórico. O PDF direto em `www2.aneel.gov.br/cedoc/` responde 403 fora do navegador, então não vale linkar.
- **Portal de Dados Abertos da ANEEL**, em CKAN, com download em CSV e JSON e **API para consulta automatizada**. Não tem regra de cálculo, mas serve para contexto e possivelmente para a métrica de sucesso. [dadosabertos.aneel.gov.br](https://dadosabertos.aneel.gov.br/)

---

## O que continua fora de alcance

| Item | Situação |
| :---------------------------- | :--------------------------------------------------------------------------------------------- |
| **Erros mais comuns**         | Nenhuma fonte pública os enumera. Continua dependendo do cliente.                                |
| **Método interno de análise** | Como a equipe da Neoenergia confere o cálculo não é público. Continua dependendo do cliente.     |

### As NBR não entram no cálculo de demanda

A DIS-NOR-053 referencia 12 normas ABNT, vendidas e sem API pública. Verificando cada citação no PDF, todas aparecem em contexto de instalação: condições de eletroduto, método de instalação para dimensionamento de condutor, aterramento e conformidade de subestação. O Anexo I, que contém a metodologia e as tabelas paramétricas, tem uma única menção a NBR em cerca de 20 páginas.

O método de demanda é autocontido entre DIS-NOR-053 e DIS-NOR-030, ambas gratuitas. Não é necessário adquirir norma da ABNT para construir o motor de cálculo.


