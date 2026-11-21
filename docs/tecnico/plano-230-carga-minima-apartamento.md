# Plano da #230: Carga Mínima de Iluminação e Tomadas do Apartamento

AT08-US03. O item 6.27.1.1 da DIS-NOR-030 manda considerar, no apartamento trifásico, a carga mínima de iluminação e tomadas do item 6.26.1.1: tomadas pela área construída (Tabela 5) e 100 W por ponto de luz em cada cômodo. Hoje `ResidentialGroup` aceita a parcela `a` declarada sem conferir esse mínimo, não tem o número de cômodos, e a Tabela 5 não está semeada.

## Visão Geral

- **Onde entra.** Na validação do grupo, não no cálculo. A demanda da parcela `a` do apartamento continua a mesma (Tabela 6 sobre o total, fator de potência 1,00). Carga abaixo do mínimo vira pendência Revisar e bloqueia o cálculo, como o limite de 75 kW.
- **Só o trifásico.** O monofásico declara a carga total (item 6.28.1) e não tem cargas por parcela para conferir.
- **Iluminação.** `cômodos × 100 W`, um ponto de luz por cômodo ou corredor. O valor vem do texto do item, não de tabela, e fica como constante do domínio, no mesmo padrão de `LOW_VOLTAGE_LIMIT_KW` (item 6.2.1).
- **Tomadas.** Mínimo da Tabela 5 pela área. Valor de tabela, então persistido e versionado como as demais.
- **Separação entre iluminação e tomadas.** Já existe no item de carga: `LampTechnology` diz se o item da parcela `a` é iluminação (com a lâmpada) ou tomadas de uso geral. O front já mostra o campo "Iluminação ou tomadas" nas cargas do apartamento, mas o back só o exige fora do residencial.

### Modelo de Domínio

A validação com as tabelas normativas é da #229, que entra primeiro e define o contrato comum. A #230 só acrescenta a regra do mínimo sobre ele.

**Da #229, pré-requisito mesclado:**

| Peça | Papel |
| :--- | :--- |
| `ConsumerUnitGroup.validate(DemandContext)` e `status(DemandContext)` | Substituem `validate()` e `status()` em `ConsumerUnitGroup` e nas subclasses. Cada subclasse continua dona da própria validação (polimorfismo). `DemandContext` é o record que já existe: `(NormativeTables tables, SupplyVoltage voltage, ConnectionType connectionType)` |
| `NormativeTables.contains(NormativeTableCode)` | Diz se a tabela está no conjunto sem lançar `MissingNormativeValueException`. A validação roda em todo `GET` da lista e não pode falhar com 500 |
| `ProjectDemandContexts` (`@Service`) | `contextFor(Project)`, com `tablesFor` e `fixedRevisions` saídos de `DemandCalculationService`. Projeto sem envio lê as tabelas publicadas; projeto enviado, as revisões fixadas |
| `ValidatedGroup(ConsumerUnitGroup group, DemandContext context, List<ValidationIssue> issues)` | O service valida uma vez e entrega grupo, contexto e pendências ao controller; `ConsumerUnitGroupResponse.from(ValidatedGroup)` deixa de chamar `validate()` |
| `GroupValidation.of(groups, context)` | Total de pendências com o contexto do projeto |

**Da #230:**

| Peça | Papel |
| :--- | :--- |
| `ApartmentMinimumLoad` (carga mínima do apartamento) | Classe nova, final e imutável, no `domain`. Recebe cômodos e área; `lightingKw()` devolve `rooms × 0,1`; `outletsKw(NormativeTables)` lê a Tabela 5; `check(List<LoadItem>, NormativeTables)` soma os itens da parcela `a` por `LampTechnology.lighting()` e devolve as pendências. Encapsula a regra do item 6.26.1.1 num lugar só |
| `ResidentialGroup` | Campo `Integer rooms`, guardado só no trifásico, como `loads`. `validate(DemandContext)` passa `context.tables()` a `ApartmentMinimumLoad` |
| `LoadCategory.LIGHTING_AND_OUTLETS.issues` | Passa a exigir `lampTechnology` também no apartamento, com mensagem própria |
| `NormativeTableCode.T5_...` | Constante nova da Tabela 5 da DIS-NOR-030 |

O `domain` continua sem importar `repository`: as tabelas chegam pela interface `NormativeTables`, dentro do `DemandContext`, como no cálculo.

## 1. Campo Novo: Número de Cômodos

Nome no código: `rooms`. "Quartos" (`bedrooms`) já existe e não serve: cômodo inclui sala, cozinha, banheiro e área de serviço.

| Camada | Arquivo | Mudança |
| :--- | :--- | :--- |
| Domínio | `domain/GroupSpec.java` | Componente `Integer rooms` depois de `bedrooms`. Todo `new GroupSpec(...)` ganha o argumento (`LoadGroup.spec`, `EvChargingGroup.spec`, `ScenarioGroups`, testes) |
| Entidade | `domain/ResidentialGroup.java` | `private Integer rooms`, coluna `rooms` anulável (tabela única do `SINGLE_TABLE`). `applySpec` guarda no trifásico e zera no monofásico; `spec()` devolve; `getRooms()`; `summary()` inclui "8 cômodos" quando informado |
| Entrada | `dto/ConsumerUnitGroupRequest.java` | `@Min(value = 1, message = "O número de cômodos deve ser no mínimo {value}.") @Max(value = 50, message = "O número de cômodos deve ser no máximo {value}.") Integer rooms` |
| Saída | `dto/ConsumerUnitGroupResponse.java` | `Integer rooms`, omitido quando nulo (`NON_NULL`) |
| Controller | `controller/ConsumerUnitGroupController.java` | `parametersOf` repassa `request.rooms()`. O mapeamento por `ValidatedGroup` já vem da #229 |
| OpenAPI | request e response | `@Schema(description = "Cômodos do apartamento trifásico; define a carga mínima de iluminação (DIS-NOR-030, item 6.26.1.1)")`. Conferir em `/api/docs` que `POST` e `PUT /api/projects/{projectId}/consumer-unit-groups` mostram o campo e os limites |
| Histórico | `service/VersionFieldLabels.java` | `Map.entry("rooms", "Cômodos")` |
| Schema da API (front) | `app/front/src/services/consumer-units/schemas/consumer-unit-group.schema.ts` | `rooms: z.number().int().positive().nullish()` em `residentialGroupSchema` |
| Tipo do payload | `app/front/src/services/consumer-units/types.ts` | `rooms?: number \| null` |
| Schema do formulário | `app/front/src/features/projects/schemas/consumer-unit-group.schema.ts` | `rooms: optionalNumber(...)`, inteiro, de 1 a 50, mensagens iguais às do back |
| Formulário | `app/front/src/features/projects/components/GroupSheet/ResidentialGroupForm.tsx` | Campo "Cômodos e corredores" só no trifásico, com a descrição "Define a carga mínima de iluminação, 100 W por cômodo ou corredor (DIS-NOR-030, item 6.26.1.1)."; `submit` envia `rooms` só no trifásico; troca para monofásico limpa o valor, como `items`. Rever o `sm:col-span-2` de `compactUnit`, que hoje fecha a linha no trifásico |
| Cargas | `GroupSheet/LoadItemsSection.tsx` | "Iluminação ou tomadas" marcado como obrigatório nas cargas do apartamento |

## 2. Pendências e Mensagens

Todas do apartamento trifásico. `field` é o caminho que o front usa para focar o campo (`toFormField` troca `loads` por `items`).

| Situação | Severidade | `field` | Mensagem |
| :--- | :--- | :--- | :--- |
| Sem cômodos | Falta Dado | `rooms` | Informe o número de cômodos e corredores. Ele define a carga mínima de iluminação do apartamento (DIS-NOR-030, item 6.26.1.1). |
| Item da parcela `a` sem classificação | Falta Dado | `loads[i].lampTechnology` | Informe se "Tomadas" é iluminação, e com que lâmpadas, ou tomadas de uso geral. A carga mínima de cada uma é conferida em separado (DIS-NOR-030, item 6.26.1.1). |
| Iluminação abaixo do mínimo | Revisar | `loads[i].power` do primeiro item de iluminação, ou `rooms` sem nenhum | Iluminação de 0,6 kW abaixo do mínimo de 0,8 kW para 8 cômodos e corredores, 100 W por ponto de luz em cada um (DIS-NOR-030, item 6.26.1.1). |
| Tomadas abaixo do mínimo | Revisar | `loads[i].power` do primeiro item de tomadas, ou `loads` sem nenhum | Tomadas de 2,0 kW abaixo do mínimo de X kW para 180 m² de área útil (DIS-NOR-030, item 6.26.1.1, Tabela 5). |

Os números saem de `DeclaredValues.decimal`. As conferências só rodam com o dado de que dependem: sem cômodos não há a de iluminação; sem área útil, só a pendência de área que já existe; com item sem classificação, nenhuma das duas, para não acusar mínimo sobre soma incompleta.

## 3. Tabela 5

"Número Mínimo de Tomadas em Função da Área Construída", Anexo II, p. 65/142, transcrita em `fontes-normativas.md` com as duas leituras. Só tomadas: 100 W por tomada geral e 600 W por tomada da cozinha, em 13 faixas de área fechadas em cima, até 250 m².

No seed, `T5_MINIMUM_OUTLETS` é tabela por faixa (`ranged`) sobre "Área total (m²)", com o Total I + II em W como valor e as quantidades de tomadas de 100 W e de 600 W como segundo e terceiro valores. `ApartmentMinimumLoad` converte o total para kW. Acima de 250 m² a tabela não tem linha: o mínimo de tomadas não é conferido e não gera pendência.

## 4. Arquivos a Mudar

| Arquivo | Mudança |
| :--- | :--- |
| `domain/NormativeTableCode.java` | Constante da Tabela 5 |
| `domain/ApartmentMinimumLoad.java` | Novo |
| `domain/ResidentialGroup.java` | `rooms`, mínimo em `validate(DemandContext)` |
| `domain/LoadGroup.java`, `domain/EvChargingGroup.java` | `rooms` nulo no `spec()` |
| `domain/LoadCategory.java` | Classificação exigida no apartamento |
| `domain/GroupSpec.java` | `rooms` |
| `config/NormativeTableSeed.java` | Linhas da Tabela 5 |
| `config/DataSeeder.java` | Semeia as tabelas cujo código falta, não só o banco vazio (seção 6) |
| `config/EnumCheckConstraints.java` | `normative_table.code`, para o código novo passar no `CHECK` |
| `config/ScenarioGroups.java`, `config/DemoScenarios.java` | Cômodos e classificação da cobertura do 2026-2047 |
| `service/DemandCalculationService.java` | `sameInput` ignora campos nulos (risco 3) |
| `service/VersionFieldLabels.java` | Rótulo de `rooms` |
| `dto/ConsumerUnitGroupRequest.java`, `dto/ConsumerUnitGroupResponse.java`, `controller/ConsumerUnitGroupController.java` | Campo novo |
| Front: os arquivos da seção 1 e `ResidentialGroupForm.test.tsx` | Campo, schemas e testes |
| `docs/tecnico/engine-calculo.md` | Parâmetro "Número de cômodos" na seção 3 e linha nova em "Validações Normativas" |
| `docs/tecnico/fontes-normativas.md` | Tabela 5 transcrita e listada em "Tabelas Paramétricas a Persistir" |
| `docs/produto/dados-de-demonstracao.md` | Linha do 2026-2047 |

Os caminhos do back são relativos a `app/back/src/main/java/br/com/ampere/`. Não estão na lista porque vêm da #229: `ConsumerUnitGroup`, `NormativeTables`, `NormativeTableSet`, `ProjectDemandContexts`, `ValidatedGroup`, `GroupValidation` e os chamadores (`ConsumerUnitGroupService`, `DesignerDashboardService`, `SpreadsheetExportService`, `CalculationWorkbook`).

## 5. Fatias

Cada fatia entra com o teste junto e termina com `./mvnw spotless:apply` e `./mvnw clean verify` verdes (ou `pnpm validate && pnpm test && pnpm build` na do front).

**Pré-requisito: fatia 2 da #229 mesclada.** Traz `validate(DemandContext)`, `status(DemandContext)`, `NormativeTables.contains`, `ProjectDemandContexts`, `ValidatedGroup` e `GroupValidation.of(groups, context)`. A fatia 1 abaixo não depende dela; as fatias 2 a 4 sim.

### Fatia 1: Tabela 5 Semeada (Feita)

- Constante em `NormativeTableCode`, linhas no `NormativeTableSeed`, `normative_table.code` em `EnumCheckConstraints`, `DataSeeder` semeando o código que falta.
- **Pronto quando:** num banco novo e num banco já semeado, "Normas e Tabelas" mostra a Tabela 5 publicada, com item e página; os cinco exemplos do Anexo I continuam passando; teste de integração do seed cobre o banco que já tinha as outras tabelas e não duplica nenhuma.
- A semeadura em banco existente e o `CHECK` são da #230; a #229 não toca neles.

### Fatia 2: Número de Cômodos no Contrato

- `rooms` do `GroupSpec` à resposta, OpenAPI, `VersionFieldLabels`, `summary()`.
- Pendência Falta Dado sem cômodos no trifásico.
- `sameInput` ignora campos nulos.
- **Pronto quando:** `POST` e `PUT` aceitam e devolvem `rooms`; `rooms: 0` e `rooms: 51` voltam 400 com a mensagem; trifásico sem cômodos volta `MISSING_DATA` com `field: "rooms"`; monofásico com `rooms` volta sem o campo; um cálculo gravado antes do campo continua atual.

### Fatia 3: Classificação da Parcela `a` no Apartamento

- `LoadCategory.LIGHTING_AND_OUTLETS.issues` exige `lampTechnology` no apartamento.
- Cobertura do 2026-2047 com "Tomadas" em `GENERAL_OUTLETS` e "Iluminação" na lâmpada do Exemplo 3, se ele disser qual, ou `COMPACT_FLUORESCENT_LED`. Parte da cobertura como a #229 a deixou.
- **Pronto quando:** item sem classificação gera a pendência da seção 2; a demanda individual do 2026-2047 não muda em relação ao valor da #229, porque a parcela `a` residencial não lê a lâmpada.

### Fatia 4: Mínimo de Iluminação e de Tomadas

- `ApartmentMinimumLoad` e a chamada em `ResidentialGroup.validate(DemandContext)`, com `context.tables()`.
- Pendências Revisar da seção 2.
- Cômodos da cobertura do 2026-2047 (decisão 5) e números esperados de `DemoScenarioSeederIntegrationTest` e `IndividualDemandTest` atualizados sobre os da #229, se a cobertura mudar.
- **Pronto quando:** os testes da seção 7 passam; `GET /validation` devolve `canCalculate: false` com carga abaixo do mínimo e `POST /calculations` volta 422; o 2026-2047 continua sem pendência e com o cálculo atual.

### Fatia 5: Front

- Schemas, tipo, campo "Cômodos" e "Iluminação ou tomadas" obrigatório nas cargas do apartamento.
- **Testes** em `ResidentialGroupForm.test.tsx`: o campo aparece só no trifásico; some e é limpo ao trocar para monofásico; o payload envia `rooms` no trifásico e `null` no monofásico; 0 e 51 mostram o erro; a pendência com `field: "rooms"` foca o campo.
- **Pronto quando:** `pnpm validate`, `pnpm test` e `pnpm build` passam; no navegador, a pendência aparece no grupo e some depois de corrigida.
- Pode correr em paralelo às fatias 3 e 4 depois da 2, que fixa o contrato. A #230 é marcada Backend: se o front precisar de issue própria, abrir antes de começar.

### Fatia 6: Documentação e Conferência

- `engine-calculo.md`, `fontes-normativas.md` e `dados-de-demonstracao.md` (seção 4).
- Conferência no app (seção 9).

## 6. Cenários de Demonstração e Bancos Já Semeados

**Cenários.** Só o 2026-2047 (Residencial Torres do Pina) tem apartamento trifásico: "Cobertura", 2 unidades, 180 m², 3 quartos, com as cargas do Exemplo 3 da DIS-NOR-030 (tomadas 3,0 kW, iluminação 1,2 kW). A #229 muda primeiro a carga instalada da cobertura; a #230 acrescenta depois os cômodos e a classificação dos dois itens e atualiza os números esperados. O Exemplo 3 tem 180 m² e 12 cômodos, e a cobertura usa os mesmos 12: fica exatamente no mínimo, 1,2 kW de iluminação (12 × 100 W) e 3,0 kW de tomadas (Tabela 5, 170 < S ≤ 200), sem pendência. `DemoScenarioSeederIntegrationTest` já exige que todo grupo semeado valide sem pendência e que o cálculo do 2026-2047 esteja atual; essas asserções seguram a fatia.

**Coluna nova.** `rooms` é anulável, porque a `consumer_unit_group` é a tabela única das três subclasses. O `ddl-auto=update` acrescenta a coluna sem o `docker compose down -v`, como aconteceu com `bedrooms` e `connection_type`.

**Grupos que já existem.** Ficam com `rooms` nulo e passam a Falta Dado quando trifásicos; os itens da parcela `a` sem classificação também. É o comportamento correto: o mínimo nunca foi conferido. Não há backfill de dado do usuário, porque o número de cômodos não pode ser inferido.

**O 2026-2047 num banco já semeado.** O `DemoScenarioSeeder` só cria protocolo ausente, então o projeto antigo continua sem cômodos e passa a Falta Dado. Em desenvolvimento e no deploy de demonstração, subir uma vez com `ampere.seed.reset-scenarios=true` (`SEED_RESET_SCENARIOS=true`) recria os cenários do seed com o dado novo e não toca nos projetos de usuário.

**Tabela 5 num banco já semeado.** `DataSeeder.seedNormativeTables` hoje sai quando há qualquer tabela. Passa a inserir cada código do `NormativeTableSeed` ausente do banco, com `registeredAt` e `verifiedAt` iguais aos da Tabela 6 publicada pelo seed, para que as revisões fixadas de um protocolo antigo a encontrem (`FixedRevisions.selects` usa a vigência na data do primeiro envio). Sem o `CHECK` reescrito em `EnumCheckConstraints`, o `INSERT` do código novo é recusado.

## 7. Testes do Mínimo

`domain/ApartmentMinimumLoadTest.java` (unitário, com `DemandFixtures.tables()`; os casos de grupo montam o `DemandContext` com essas tabelas), casos em `domain/ConsumerUnitGroupTest.java` e, na integração, `controller/ConsumerUnitGroupApiIntegrationTest.java` e `service/ConsumerUnitGroupServiceIntegrationTest.java`.

**Por cômodo.**

- 8 cômodos e 0,8 kW de iluminação: sem pendência; o mínimo igual passa.
- 8 cômodos e 0,79 kW: Revisar, com 0,8 kW, 8 cômodos e o item 6.26.1.1 na mensagem.
- Iluminação em dois itens, um com quantidade 4: soma `quantidade × potência` antes de comparar.
- Cômodos informados e nenhum item de iluminação: Revisar, com `field: "rooms"`.
- Sem cômodos: Falta Dado em `rooms` e nenhuma pendência de iluminação.
- Monofásico com cômodos no pedido: o campo é descartado e nenhuma pendência nova aparece.

**Por área.**

- Área no limite superior de uma faixa da Tabela 5: usa a faixa de baixo, como no Quadro 35.
- Tomadas iguais ao mínimo: sem pendência. Um centésimo abaixo: Revisar, com a área, o mínimo e a Tabela 5 na mensagem.
- Área acima de 250 m²: a Tabela 5 não tem linha; nenhuma pendência de tomadas, e a de iluminação continua.
- Sem área útil: só a pendência de área que já existe.
- Tabela 5 ausente do conjunto: nenhuma exceção, nenhuma pendência de tomadas, e a de iluminação continua (decisão 4).
- Projeto reprovado com revisões fixadas antes da Tabela 5: mesma regra do caso anterior.

**Classificação.** Item da parcela `a` sem `lampTechnology`: Falta Dado no caminho do item, e nenhuma das duas conferências.

**Pela API.** Trifásico abaixo do mínimo: `POST` volta 200 com `status: "REVIEW"`; `GET /validation`, `canCalculate: false`; `POST /calculations`, 422. Corrigido por `PUT`: `status: "VALIDATED"`.

## 8. Ponto de Contato com a #229

A #229 (motores pela Tabela 19) entra primeiro e é dona do encanamento comum. A #230 parte dele mesclado.

- **Validação com contexto: da #229.** `validate(DemandContext)` e `status(DemandContext)`, `NormativeTables.contains(NormativeTableCode)`, `ProjectDemandContexts.contextFor(Project)`, `ValidatedGroup(group, context, issues)`, `ConsumerUnitGroupResponse.from(ValidatedGroup)` e `GroupValidation.of(groups, context)`. A #230 não cria nenhuma dessas peças: só usa `context.tables()` em `ResidentialGroup.validate`.
- **Seed: da #230.** Tabela 5 no `NormativeTableCode` e no `NormativeTableSeed`, `DataSeeder` semeando o código ausente e `normative_table.code` em `EnumCheckConstraints`. A #229 não toca nisso. O conflito de merge em `NormativeTableSeed` e `NormativeTableCode`, se houver, é mecânico.
- **`sameInput`.** A #229 grava a chave `motorInstalledLoad` no snapshot quando há motor; ignorar campos nulos (risco 3) é compatível com ela.
- **`ScenarioGroups.penthouseLoads` e o 2026-2047.** A #229 muda antes a carga instalada da cobertura e os números esperados do Exemplo 3. A #230 acrescenta cômodos e classificação sobre a versão dela e atualiza `DemoScenarioSeederIntegrationTest`, `IndividualDemandTest` e a nota de `engine-calculo.md` depois.
- **`ResidentialGroup` e `LoadCategory`.** A #229 lê motores na parcela `g`; esta mexe na validação da parcela `a`. Arquivos iguais, trechos diferentes.

## 9. Verificação no App

Subir o Postgres, o back (`./mvnw spring-boot:run` em `app/back`) e o front (`pnpm dev` em `app/front`), com `SEED_RESET_SCENARIOS=true` na primeira subida.

- **"Normas e Tabelas"** (`admin@ampere.com`): Tabela 5 publicada, com item e página.
- **2026-2047** (`user@ampere.com`): a "Cobertura" abre com "Cômodos e corredores" em 12, sem pendência, e o cálculo segue atual. Baixar os cômodos não muda nada; subir para 13 deixa a iluminação de 1,2 kW abaixo de 1,3 kW, o grupo vai para Revisar e o botão de calcular trava. Trocar a ligação para monofásica esconde o campo.
- **Projeto novo:** grupo trifásico sem cômodos mostra Falta Dado, e a pendência foca o campo.
- **`/api/docs`:** `rooms` em `POST` e `PUT /api/projects/{projectId}/consumer-unit-groups`, com os limites.

## 10. Riscos e Decisões em Aberto

1. **Valores da Tabela 5. Resolvida.** Transcrita da DIS-NOR-030 REV 07, p. 65/142, com duas leituras, em `fontes-normativas.md`.
2. **Área construída ou área útil. Resolvida: área útil.** A Tabela 5 usa área construída; o grupo só tem área útil, que é menor e afrouxa o mínimo. A mensagem diz "área útil", e o critério entra em "Critérios Adotados na Implementação" de `engine-calculo.md`, junto com o de acima de 250 m²: sem conferência de tomadas e sem pendência, porque a norma manda declarar as tomadas e a tabela não tem linha.
3. **Cálculos atuais viram desatualizados.** `sameInput` compara o `GroupSpec` gravado com o atual; o campo novo aparece como `rooms: null` e não existe no JSON antigo, então todo cálculo residencial já gravado passaria a desatualizado. A fatia 2 remove os campos nulos das duas árvores antes de comparar. É compatível com a chave `motorInstalledLoad`, que a #229 grava só quando há motor.
4. **Tabela 5 ausente.** Projeto em rascunho num banco sem a Tabela 5, ou reprovado com revisões fixadas antes dela, não teria como resolver uma pendência de tabela: a revisão fixada nunca a inclui. Recomendo não conferir as tomadas nesse caso, sem pendência, e manter a conferência de iluminação, que não depende de tabela. A alternativa, Revisar com "publique a Tabela 5", trava o reenvio desses protocolos para sempre.
5. **Cômodos do 2026-2047. Resolvida: 12.** O Exemplo 3 (p. 52 e 53) tem 180 m² e 12 cômodos; tomadas de 3.000 W e iluminação de 1.200 W ficam exatamente no mínimo.
6. **Um ponto por cômodo. Resolvida.** O item 6.26.1.1 pede no mínimo um ponto de luz por cômodo ou corredor, com 100 W por ponto. Corredor também conta: o campo se chama "Cômodos e corredores".
7. **Classificação obrigatória.** Exigir "Iluminação ou tomadas" no apartamento acrescenta um campo por item da parcela `a` e põe Falta Dado em todo trifásico já cadastrado. A alternativa, comparar o total da parcela com a soma dos dois mínimos, dispensa o campo, mas não detecta tomadas abaixo do mínimo compensadas por iluminação acima. Recomendo exigir, como a issue pede a conferência em separado.
8. **Grupos de projetos já enviados.** A validação roda também na leitura de projetos em análise e aprovados: um grupo trifásico enviado antes da mudança aparece como Falta Dado para o analista. Não bloqueia nada, porque esses projetos não recalculam. Se incomodar na demonstração, o `SEED_RESET_SCENARIOS` resolve os do seed.
9. **Custo da validação.** Com o `ProjectDemandContexts` da #229, a lista de grupos e o painel do projetista carregam as tabelas do projeto. `pendingStage` já recebe as publicadas uma vez para todos os rascunhos; os reprovados leem as revisões fixadas, uma consulta por projeto. O volume é pequeno.
10. **Front numa issue de back.** A #230 é Backend, mas o campo não tem uso sem o formulário. Se o time quiser rastrear o front à parte, abrir a issue antes da fatia 5.
