# Plano da #230: Carga Mínima de Iluminação e Tomadas do Apartamento

AT08-US03. O item 6.27.1.1 da DIS-NOR-030 manda considerar, no apartamento trifásico, a carga mínima de iluminação e tomadas do item 6.26.1.1: tomadas pela área construída (Tabela 5) e 100 W por ponto de luz em cada cômodo. Hoje `ResidentialGroup` aceita a parcela `a` declarada sem conferir esse mínimo, não tem o número de cômodos, e a Tabela 5 não está semeada.

## Visão Geral

- **Onde entra.** Na validação do grupo, não no cálculo. A demanda da parcela `a` do apartamento continua a mesma (Tabela 6 sobre o total, fator de potência 1,00). Carga abaixo do mínimo vira pendência Revisar e bloqueia o cálculo, como o limite de 75 kW.
- **Só o trifásico.** O monofásico declara a carga total (item 6.28.1) e não tem cargas por parcela para conferir.
- **Iluminação.** `cômodos × 100 W`, um ponto de luz por cômodo. O valor vem do texto do item, não de tabela, e fica como constante do domínio, no mesmo padrão de `LOW_VOLTAGE_LIMIT_KW` (item 6.2.1).
- **Tomadas.** Mínimo da Tabela 5 pela área. Valor de tabela, então persistido e versionado como as demais.
- **Separação entre iluminação e tomadas.** Já existe no item de carga: `LampTechnology` diz se o item da parcela `a` é iluminação (com a lâmpada) ou tomadas de uso geral. O front já mostra o campo "Iluminação ou tomadas" nas cargas do apartamento, mas o back só o exige fora do residencial.

### Modelo de Domínio

| Peça | Papel |
| :--- | :--- |
| `ApartmentMinimumLoad` (carga mínima do apartamento) | Classe nova, final e imutável, no `domain`. Recebe cômodos e área; `lightingKw()` devolve `rooms × 0,1`; `outletsKw(NormativeTables)` lê a Tabela 5; `check(List<LoadItem>, NormativeTables)` soma os itens da parcela `a` por `LampTechnology.lighting()` e devolve as pendências. Encapsula a regra do item 6.26.1.1 num lugar só |
| `ConsumerUnitGroup.validate(NormativeTables)` | Substitui `validate()`. Cada subclasse continua dona da própria validação (polimorfismo); `LoadGroup` e `EvChargingGroup` ignoram o argumento. `status()` passa a `status(NormativeTables)` |
| `ResidentialGroup` | Campo `Integer rooms`, guardado só no trifásico, como `loads`. `validate` delega o mínimo a `ApartmentMinimumLoad` |
| `LoadCategory.LIGHTING_AND_OUTLETS.issues` | Passa a exigir `lampTechnology` também no apartamento, com mensagem própria |
| `NormativeTables.contains(code)` | Método novo: diz se a tabela está no conjunto sem lançar `MissingNormativeValueException`. A validação roda em todo `GET` da lista e não pode falhar com 500 |
| `NormativeTableCode.T5_...` | Constante nova da Tabela 5 da DIS-NOR-030 |

O `domain` continua sem importar `repository`: as tabelas chegam pela interface `NormativeTables`, como no cálculo.

No `service`:

- `ProjectTables` (novo): `tablesFor(Project)` e `fixedRevisions(Project)`, extraídos de `DemandCalculationService`, que passa a usá-lo. Projeto sem envio lê as publicadas; projeto enviado, as revisões fixadas.
- `ValidatedGroup(ConsumerUnitGroup group, List<ValidationIssue> issues)` (record novo): o service valida uma vez e entrega grupo e pendências ao controller. `ConsumerUnitGroupResponse.from(ValidatedGroup)` deixa de chamar `validate()`, e o controller continua sem tocar no domínio.
- `GroupValidation.of(groups, tables)`.

## 1. Campo Novo: Número de Cômodos

Nome no código: `rooms`. "Quartos" (`bedrooms`) já existe e não serve: cômodo inclui sala, cozinha, banheiro e área de serviço.

| Camada | Arquivo | Mudança |
| :--- | :--- | :--- |
| Domínio | `domain/GroupSpec.java` | Componente `Integer rooms` depois de `bedrooms`. Todo `new GroupSpec(...)` ganha o argumento (`LoadGroup.spec`, `EvChargingGroup.spec`, `ScenarioGroups`, testes) |
| Entidade | `domain/ResidentialGroup.java` | `private Integer rooms`, coluna `rooms` anulável (tabela única do `SINGLE_TABLE`). `applySpec` guarda no trifásico e zera no monofásico; `spec()` devolve; `getRooms()`; `summary()` inclui "8 cômodos" quando informado |
| Entrada | `dto/ConsumerUnitGroupRequest.java` | `@Min(value = 1, message = "O número de cômodos deve ser no mínimo {value}.") @Max(value = 50, message = "O número de cômodos deve ser no máximo {value}.") Integer rooms` |
| Saída | `dto/ConsumerUnitGroupResponse.java` | `Integer rooms`, omitido quando nulo (`NON_NULL`) |
| Controller | `controller/ConsumerUnitGroupController.java` | `parametersOf` repassa `request.rooms()`; `list`, `create` e `update` mapeiam `ValidatedGroup` |
| OpenAPI | request e response | `@Schema(description = "Cômodos do apartamento trifásico; define a carga mínima de iluminação (DIS-NOR-030, item 6.26.1.1)")`. Conferir em `/api/docs` que `POST` e `PUT /api/projects/{projectId}/consumer-unit-groups` mostram o campo e os limites |
| Histórico | `service/VersionFieldLabels.java` | `Map.entry("rooms", "Cômodos")` |
| Schema da API (front) | `app/front/src/services/consumer-units/schemas/consumer-unit-group.schema.ts` | `rooms: z.number().int().positive().nullish()` em `residentialGroupSchema` |
| Tipo do payload | `app/front/src/services/consumer-units/types.ts` | `rooms?: number \| null` |
| Schema do formulário | `app/front/src/features/projects/schemas/consumer-unit-group.schema.ts` | `rooms: optionalNumber(...)`, inteiro, de 1 a 50, mensagens iguais às do back |
| Formulário | `app/front/src/features/projects/components/GroupSheet/ResidentialGroupForm.tsx` | Campo "Cômodos" só no trifásico, com a descrição "Define a carga mínima de iluminação, 100 W por cômodo (DIS-NOR-030, item 6.26.1.1)."; `submit` envia `rooms` só no trifásico; troca para monofásico limpa o valor, como `items`. Rever o `sm:col-span-2` de `compactUnit`, que hoje fecha a linha no trifásico |
| Cargas | `GroupSheet/LoadItemsSection.tsx` | "Iluminação ou tomadas" marcado como obrigatório nas cargas do apartamento |

## 2. Pendências e Mensagens

Todas do apartamento trifásico. `field` é o caminho que o front usa para focar o campo (`toFormField` troca `loads` por `items`).

| Situação | Severidade | `field` | Mensagem |
| :--- | :--- | :--- | :--- |
| Sem cômodos | Falta Dado | `rooms` | Informe o número de cômodos. Ele define a carga mínima de iluminação do apartamento (DIS-NOR-030, item 6.26.1.1). |
| Item da parcela `a` sem classificação | Falta Dado | `loads[i].lampTechnology` | Informe se "Tomadas" é iluminação, e com que lâmpadas, ou tomadas de uso geral. A carga mínima de cada uma é conferida em separado (DIS-NOR-030, item 6.26.1.1). |
| Iluminação abaixo do mínimo | Revisar | `loads[i].power` do primeiro item de iluminação, ou `rooms` sem nenhum | Iluminação de 0,6 kW abaixo do mínimo de 0,8 kW para 8 cômodos, 100 W por ponto de luz em cada cômodo (DIS-NOR-030, item 6.26.1.1). |
| Tomadas abaixo do mínimo | Revisar | `loads[i].power` do primeiro item de tomadas, ou `loads` sem nenhum | Tomadas de 2,0 kW abaixo do mínimo de X kW para 180 m² de área útil (DIS-NOR-030, item 6.26.1.1, Tabela 5). |

Os números saem de `DeclaredValues.decimal`. As conferências só rodam com o dado de que dependem: sem cômodos não há a de iluminação; sem área útil, só a pendência de área que já existe; com item sem classificação, nenhuma das duas, para não acusar mínimo sobre soma incompleta.

## 3. Tabela 5

Não está transcrita em `docs/tecnico/fontes-normativas.md` nem no `NormativeTableSeed`, e o repositório não guarda o PDF da norma. Ficam abertos (decisão 1): título, item, página impressa no rodapé, faixas de área, unidade do mínimo (W, VA ou kW) e se a tabela cobre só tomadas ou iluminação e tomadas.

A estrutura segue a Tabela 6 e o Quadro 35: tabela por faixa (`ranged`), argumento "Área construída (m²)" ou "Área útil (m²)" conforme a decisão 2, um valor "Carga mínima de tomadas". Se a unidade for W, `ApartmentMinimumLoad` converte para kW, como `PowerUnit` faz com CV. A transcrição segue a regra 4 de `fontes-normativas.md`: duas leituras antes de entrar no seed.

## 4. Arquivos a Mudar

| Arquivo | Mudança |
| :--- | :--- |
| `domain/NormativeTableCode.java` | Constante da Tabela 5 |
| `domain/NormativeTables.java`, `domain/NormativeTableSet.java` | `contains(code)` |
| `domain/ApartmentMinimumLoad.java` | Novo |
| `domain/ConsumerUnitGroup.java` | `validate(NormativeTables)`, `status(NormativeTables)` |
| `domain/ResidentialGroup.java` | `rooms`, mínimo na validação |
| `domain/LoadGroup.java`, `domain/EvChargingGroup.java` | Assinatura de `validate`; `rooms` nulo no `spec()` |
| `domain/LoadCategory.java` | Classificação exigida no apartamento |
| `domain/GroupSpec.java` | `rooms` |
| `config/NormativeTableSeed.java` | Linhas da Tabela 5 |
| `config/DataSeeder.java` | Semeia as tabelas cujo código falta, não só o banco vazio (seção 6) |
| `config/EnumCheckConstraints.java` | `normative_table.code`, para o código novo passar no `CHECK` |
| `config/ScenarioGroups.java`, `config/DemoScenarios.java` | Cômodos e classificação da cobertura do 2026-2047 |
| `service/ProjectTables.java`, `service/ValidatedGroup.java` | Novos |
| `service/GroupValidation.java` | Recebe as tabelas |
| `service/ConsumerUnitGroupService.java` | Valida com as tabelas do projeto; devolve `ValidatedGroup` |
| `service/DemandCalculationService.java` | Usa `ProjectTables`; `sameInput` ignora campos nulos (risco 3) |
| `service/DesignerDashboardService.java` | `pendingStage` valida com as tabelas do rascunho |
| `service/SpreadsheetExportService.java`, `service/CalculationWorkbook.java` | Situação do grupo com as tabelas do projeto |
| `service/VersionFieldLabels.java` | Rótulo de `rooms` |
| `dto/ConsumerUnitGroupRequest.java`, `dto/ConsumerUnitGroupResponse.java`, `controller/ConsumerUnitGroupController.java` | Campo novo e `ValidatedGroup` |
| Front: os arquivos da seção 1 e `ResidentialGroupForm.test.tsx` | Campo, schemas e testes |
| `docs/tecnico/engine-calculo.md` | Parâmetro "Número de cômodos" na seção 3 e linha nova em "Validações Normativas" |
| `docs/tecnico/fontes-normativas.md` | Tabela 5 transcrita e listada em "Tabelas Paramétricas a Persistir" |
| `docs/produto/dados-de-demonstracao.md` | Linha do 2026-2047 |

Os caminhos do back são relativos a `app/back/src/main/java/br/com/ampere/`.

## 5. Fatias

Cada fatia entra com o teste junto e termina com `./mvnw spotless:apply` e `./mvnw clean verify` verdes (ou `pnpm validate && pnpm test && pnpm build` na do front).

### Fatia 1: Tabela 5 Semeada

- Constante em `NormativeTableCode`, linhas no `NormativeTableSeed`, `normative_table.code` em `EnumCheckConstraints`, `DataSeeder` semeando o código que falta.
- **Pronto quando:** num banco novo e num banco já semeado, "Normas e Tabelas" mostra a Tabela 5 publicada, com item e página; os cinco exemplos do Anexo I continuam passando; teste de integração do seed cobre o banco que já tinha as outras tabelas e não duplica nenhuma.
- **Depende de:** decisão 1. Sem os valores, a fatia não começa.

### Fatia 2: Validação com as Tabelas do Projeto

Refatoração sem mudança de comportamento.

- `validate(NormativeTables)` e `status(NormativeTables)` no domínio; `contains` em `NormativeTables`.
- `ProjectTables`, `ValidatedGroup`, `GroupValidation.of(groups, tables)` e os chamadores: `ConsumerUnitGroupService`, `DemandCalculationService`, `DesignerDashboardService`, `SpreadsheetExportService`.
- **Pronto quando:** nenhum teste muda de resultado; nenhum chamador de `validate()` sobrou; a lista de grupos faz uma consulta às tabelas por requisição, não uma por grupo.

### Fatia 3: Número de Cômodos no Contrato

- `rooms` do `GroupSpec` à resposta, OpenAPI, `VersionFieldLabels`, `summary()`.
- Pendência Falta Dado sem cômodos no trifásico.
- `sameInput` ignora campos nulos.
- **Pronto quando:** `POST` e `PUT` aceitam e devolvem `rooms`; `rooms: 0` e `rooms: 51` voltam 400 com a mensagem; trifásico sem cômodos volta `MISSING_DATA` com `field: "rooms"`; monofásico com `rooms` volta sem o campo; um cálculo gravado antes do campo continua atual.

### Fatia 4: Classificação da Parcela `a` no Apartamento

- `LoadCategory.LIGHTING_AND_OUTLETS.issues` exige `lampTechnology` no apartamento.
- Cobertura do 2026-2047 com "Tomadas" em `GENERAL_OUTLETS` e "Iluminação" na lâmpada do Exemplo 3, se ele disser qual, ou `COMPACT_FLUORESCENT_LED`.
- **Pronto quando:** item sem classificação gera a pendência da seção 2; a demanda individual do 2026-2047 continua 26,58 kVA, porque a parcela `a` residencial não lê a lâmpada.

### Fatia 5: Mínimo de Iluminação e de Tomadas

- `ApartmentMinimumLoad` e a chamada em `ResidentialGroup.validate`.
- Pendências Revisar da seção 2.
- Cômodos da cobertura do 2026-2047 (decisão 5).
- **Pronto quando:** os testes da seção 7 passam; `GET /validation` devolve `canCalculate: false` com carga abaixo do mínimo e `POST /calculations` volta 422; o 2026-2047 continua sem pendência e com o cálculo atual.

### Fatia 6: Front

- Schemas, tipo, campo "Cômodos" e "Iluminação ou tomadas" obrigatório nas cargas do apartamento.
- **Testes** em `ResidentialGroupForm.test.tsx`: o campo aparece só no trifásico; some e é limpo ao trocar para monofásico; o payload envia `rooms` no trifásico e `null` no monofásico; 0 e 51 mostram o erro; a pendência com `field: "rooms"` foca o campo.
- **Pronto quando:** `pnpm validate`, `pnpm test` e `pnpm build` passam; no navegador, a pendência aparece no grupo e some depois de corrigida.
- Pode correr em paralelo às fatias 4 e 5 depois da 3, que fixa o contrato. A #230 é marcada Backend: se o front precisar de issue própria, abrir antes de começar.

### Fatia 7: Documentação e Conferência

- `engine-calculo.md`, `fontes-normativas.md` e `dados-de-demonstracao.md` (seção 4).
- Conferência no app (seção 9).

## 6. Cenários de Demonstração e Bancos Já Semeados

**Cenários.** Só o 2026-2047 (Residencial Torres do Pina) tem apartamento trifásico: "Cobertura", 2 unidades, 180 m², 3 quartos, com as cargas do Exemplo 3 da DIS-NOR-030 (tomadas 3,0 kW, iluminação 1,2 kW). Ganha cômodos e a classificação dos dois itens. Para a iluminação de 1,2 kW passar, cômodos até 12. As tomadas de 3,0 kW precisam cobrir o mínimo da Tabela 5 para 180 m²; se não cobrirem, a cobertura deixa de reproduzir o Exemplo 3, muda o `Dind` e a nota de 26,58 kVA em `engine-calculo.md` (risco 5). `DemoScenarioSeederIntegrationTest` já exige que todo grupo semeado valide sem pendência e que o cálculo do 2026-2047 esteja atual; essas asserções seguram a fatia.

**Coluna nova.** `rooms` é anulável, porque a `consumer_unit_group` é a tabela única das três subclasses. O `ddl-auto=update` acrescenta a coluna sem o `docker compose down -v`, como aconteceu com `bedrooms` e `connection_type`.

**Grupos que já existem.** Ficam com `rooms` nulo e passam a Falta Dado quando trifásicos; os itens da parcela `a` sem classificação também. É o comportamento correto: o mínimo nunca foi conferido. Não há backfill de dado do usuário, porque o número de cômodos não pode ser inferido.

**O 2026-2047 num banco já semeado.** O `DemoScenarioSeeder` só cria protocolo ausente, então o projeto antigo continua sem cômodos e passa a Falta Dado. Em desenvolvimento e no deploy de demonstração, subir uma vez com `ampere.seed.reset-scenarios=true` (`SEED_RESET_SCENARIOS=true`) recria os cenários do seed com o dado novo e não toca nos projetos de usuário.

**Tabela 5 num banco já semeado.** `DataSeeder.seedNormativeTables` hoje sai quando há qualquer tabela. Passa a inserir cada código do `NormativeTableSeed` ausente do banco, com `registeredAt` e `verifiedAt` iguais aos da Tabela 6 publicada pelo seed, para que as revisões fixadas de um protocolo antigo a encontrem (`FixedRevisions.selects` usa a vigência na data do primeiro envio). Sem o `CHECK` reescrito em `EnumCheckConstraints`, o `INSERT` do código novo é recusado.

## 7. Testes do Mínimo

`domain/ApartmentMinimumLoadTest.java` (unitário, com `DemandFixtures.tables()`), casos em `domain/ConsumerUnitGroupTest.java` e, na integração, `controller/ConsumerUnitGroupApiIntegrationTest.java` e `service/ConsumerUnitGroupServiceIntegrationTest.java`.

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
- Área acima da última faixa: usa a linha "acima de", se a tabela tiver; senão, a pendência de área fora da tabela.
- Sem área útil: só a pendência de área que já existe.
- Tabela 5 ausente do conjunto: nenhuma exceção, nenhuma pendência de tomadas, e a de iluminação continua (decisão 4).
- Projeto reprovado com revisões fixadas antes da Tabela 5: mesma regra do caso anterior.

**Classificação.** Item da parcela `a` sem `lampTechnology`: Falta Dado no caminho do item, e nenhuma das duas conferências.

**Pela API.** Trifásico abaixo do mínimo: `POST` volta 200 com `status: "REVIEW"`; `GET /validation`, `canCalculate: false`; `POST /calculations`, 422. Corrigido por `PUT`: `status: "VALIDATED"`.

## 8. Ponto de Contato com a #229

A #229 (motores pela Tabela 19) também mexe nas tabelas normativas e no `NormativeTableSeed`. Pontos em comum:

- **`NormativeTableSeed.all` e `NormativeTableCode`.** As duas acrescentam ou alteram entradas da mesma lista; o conflito de merge é certo e mecânico.
- **Semeadura em banco existente.** Qualquer tabela nova da #229 esbarra no mesmo `count() > 0` do `DataSeeder` e no mesmo `CHECK` de `normative_table.code`. As duas peças entram uma vez só, em commit próprio, na issue que chegar primeiro; a outra rebaseia. Linha alterada numa tabela já publicada não se resolve assim: exige revisão nova da tabela, como faz `NormativeTableRevisions`.
- **`ScenarioGroups.penthouseLoads` e o 2026-2047.** Se a #229 mudar o motor do apartamento trifásico, o `Dind` de 26,58 kVA muda nas duas, e as asserções de `DemoScenarioSeederIntegrationTest` e `IndividualDemandTest` precisam de um valor só.
- **`ResidentialGroup` e `LoadCategory`.** A #229 lê motores na parcela `g`; esta mexe na validação da parcela `a`. Arquivos iguais, trechos diferentes.

## 9. Verificação no App

Subir o Postgres, o back (`./mvnw spring-boot:run` em `app/back`) e o front (`pnpm dev` em `app/front`), com `SEED_RESET_SCENARIOS=true` na primeira subida.

- **"Normas e Tabelas"** (`admin@ampere.com`): Tabela 5 publicada, com item e página.
- **2026-2047** (`user@ampere.com`): a "Cobertura" abre com "Cômodos" preenchido, sem pendência, e o cálculo segue atual. Baixar os cômodos não muda nada; subir para 13 deixa a iluminação de 1,2 kW abaixo de 1,3 kW, o grupo vai para Revisar e o botão de calcular trava. Trocar a ligação para monofásica esconde o campo.
- **Projeto novo:** grupo trifásico sem cômodos mostra Falta Dado, e a pendência foca o campo.
- **`/api/docs`:** `rooms` em `POST` e `PUT /api/projects/{projectId}/consumer-unit-groups`, com os limites.

## 10. Riscos e Decisões em Aberto

1. **Valores da Tabela 5.** Não estão no repositório. Transcrever da DIS-NOR-030 REV 07, com página impressa, unidade e faixas, e passar pela dupla leitura antes da fatia 1. É o único bloqueio do plano.
2. **Área construída ou área útil.** A Tabela 5 usa área construída; o grupo só tem área útil, que é menor. Usar a útil afrouxa o mínimo; um campo novo de área construída pesa no formulário. Recomendo a área útil, com a mensagem dizendo "área útil" e a escolha registrada em "Critérios Adotados na Implementação" de `engine-calculo.md`. Se a leitura da tabela mostrar que ela aceita área útil, a decisão some.
3. **Cálculos atuais viram desatualizados.** `sameInput` compara o `GroupSpec` gravado com o atual; o campo novo aparece como `rooms: null` e não existe no JSON antigo, então todo cálculo residencial já gravado passaria a desatualizado. A fatia 3 remove os campos nulos das duas árvores antes de comparar.
4. **Tabela 5 ausente.** Projeto em rascunho num banco sem a Tabela 5, ou reprovado com revisões fixadas antes dela, não teria como resolver uma pendência de tabela: a revisão fixada nunca a inclui. Recomendo não conferir as tomadas nesse caso, sem pendência, e manter a conferência de iluminação, que não depende de tabela. A alternativa, Revisar com "publique a Tabela 5", trava o reenvio desses protocolos para sempre.
5. **Cômodos do 2026-2047.** O Exemplo 3 da DIS-NOR-030 pode informar os cômodos e a área da residência; se informar, usar esses números. Senão, escolher um valor até 12 e registrar em `dados-de-demonstracao.md`. Se as tomadas de 3,0 kW ficarem abaixo da Tabela 5 para 180 m², a cobertura precisa de outra carga ou outra área, e o 26,58 kVA da documentação muda.
6. **Um ponto por cômodo.** O plano lê "100 W por ponto de luz em cada cômodo" como mínimo de um ponto por cômodo. Se o item 6.26.1.1 exigir mais pontos por área do cômodo, o número de cômodos não basta e o modelo muda. Conferir o texto do item junto com a Tabela 5.
7. **Classificação obrigatória.** Exigir "Iluminação ou tomadas" no apartamento acrescenta um campo por item da parcela `a` e põe Falta Dado em todo trifásico já cadastrado. A alternativa, comparar o total da parcela com a soma dos dois mínimos, dispensa o campo, mas não detecta tomadas abaixo do mínimo compensadas por iluminação acima. Recomendo exigir, como a issue pede a conferência em separado.
8. **Grupos de projetos já enviados.** A validação roda também na leitura de projetos em análise e aprovados: um grupo trifásico enviado antes da mudança aparece como Falta Dado para o analista. Não bloqueia nada, porque esses projetos não recalculam. Se incomodar na demonstração, o `SEED_RESET_SCENARIOS` resolve os do seed.
9. **Custo da validação.** A lista de grupos e o painel do projetista passam a carregar as tabelas do projeto. `pendingStage` já recebe as publicadas uma vez para todos os rascunhos; os reprovados leem as revisões fixadas, uma consulta por projeto. O volume é pequeno.
10. **Front numa issue de back.** A #230 é Backend, mas o campo não tem uso sem o formulário. Se o time quiser rastrear o front à parte, abrir a issue antes da fatia 6.
