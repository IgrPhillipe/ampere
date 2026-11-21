# Plano da #229: Carga dos Motores pela Tabela 19

AT07-US03. A carga instalada dos motores passa a sair da potência absorvida (kW) da Tabela 19 da DIS-NOR-030 (Tabela 18 no monofásico), e não da conversão física de `PowerUnit` (1 CV = 0,7355 kW). A validação dos grupos, o limite de 75 kW, `loadPerUnitKw`, o total da etapa e o cálculo passam a usar o mesmo número.

## Visão Geral

- **Onde está hoje.** `LoadItem.declaredLoadKw()` converte a placa por `PowerUnit.toKilowatts`. Ela alimenta `LoadGroup.loadPerUnitKw`, `ResidentialGroup.getUnitLoadKw` (soma das cargas do trifásico), o limite de 75 kW em `ResidentialGroup.validate`, `ConsumerUnitGroup.declaredLoadKw`, `GroupValidation.totalDeclaredLoadKw`, `IndividualDemand.installedKw` e a verificação `LOW_VOLTAGE_LIMIT`. A demanda (kVA) da parcela `g` já lê a Tabela 18/19 em `LoadCategory.motorKva`.
- **Tabela 19 já semeada.** `NormativeTableCode.T19_THREE_PHASE_MOTORS` e `T18_SINGLE_PHASE_MOTORS` existem, e `NormativeTableSeed.tabela18/19` gravam as duas colunas: potência absorvida em kW (`value()`) e em kVA (`secondValue()`). Esta issue não muda o seed.
- **Mesma linha para kW e kVA.** A carga instalada lê a mesma linha que `motorKva` já escolhe: placa em CV ou HP direto, placa em kW convertida para CV, e potência fora da tabela pela linha seguinte (critério 6 de `engine-calculo.md`). O kW vem de `value()` e o kVA continua em `secondValue()`.
- **Ligação.** Grupo `LOAD`: a ligação da edificação, como na demanda (`DemandContext.connectionType().motorTable()`). Apartamento trifásico: sempre a Tabela 19, pelo contexto da unidade que `ResidentialGroup.individualDemand` já monta.

### Como as Tabelas Chegam à Carga Instalada

A regra fica no domínio, por polimorfismo de `LoadCategory`, e as tabelas entram pelo `DemandContext` que o cálculo já usa (tabelas, tensão e ligação da edificação). Nenhum service calcula carga.

| Classe | Mudança |
| :--- | :--- |
| `LoadCategory` | Novo `installedKw(LoadItem, DemandContext)`: o padrão é a conversão da placa; `MOTORS` lê a coluna kW da tabela de motores; `PUMPS_AND_HOT_TUBS` lê a tabela quando a placa vem em CV ou HP e mantém o kW declarado (decisão 3). `motorKva` vira `motorRating`, que devolve a linha inteira e serve aos dois usos |
| `LoadItem` | `declaredLoadKw()` sai. Entram `installedKw(DemandContext)`, que delega à categoria, e `plateKw()`, a conversão física, de pacote. `validate(path, usage, context)` repassa o contexto a `LoadCategory.issues` |
| `ConsumerUnitGroup` | `validate`, `status`, `loadPerUnitKw` e `declaredLoadKw` recebem `DemandContext`. `EvChargingGroup` e o apartamento monofásico ignoram o contexto |
| `ResidentialGroup` | `getUnitLoadKw(DemandContext)` soma as cargas pelo contexto da unidade (trifásico). O limite de 75 kW e `individualDemand` usam esse valor. `spec()` deixa de chamar a soma: o trifásico não grava `unitLoadKw` |
| `NormativeTables` | Novo `isPublished(NormativeTableCode)`, para a validação não lançar exceção quando a tabela de motores não está publicada |
| `DemandCalculationService` | Novo `contextFor(Project)` público, com o que `compute` já faz: `tablesFor(project)` (revisões fixadas depois do primeiro envio), tensão e ligação da edificação. `compute` passa a usá-lo |
| `GroupValidation` | `of(groups, context)` |
| `ConsumerUnitGroupService` | `list`, `create`, `update` e `validation` devolvem os grupos com o contexto do projeto (record `ProjectGroups(groups, context)`), para o controller montar a resposta fora da transação. As linhas das tabelas vêm por `@EntityGraph` com `rows` `EAGER`, então o mapeamento depois da transação funciona |
| `ConsumerUnitGroupResponse` | `from(group, context)` |

Motor sem linha na tabela (acima de 200 cv na Tabela 19 ou de 15 cv na 18) ou tabela de motores não publicada vira pendência **Revisar** no item, em `MOTORS.issues`, e bloqueia o cálculo. Nesse caso a carga do item cai na conversão da placa só para exibição. Validação e cálculo nunca divergem: o cálculo não roda com a pendência aberta. Hoje esse caso só aparece como 422 ao calcular.

### Valores que Mudam

| Caso | Hoje (placa) | Com a tabela |
| :--- | ---: | ---: |
| 1 cv trifásico | 0,7355 kW | 1,05 kW |
| 10 cv trifásico | 7,355 kW | 8,89 kW |
| 15 cv trifásico | 11,03 kW | 12,82 kW |
| 1 cv monofásico | 0,7355 kW | 1,14 kW |
| Cobertura do `exemplo3()` (2 motores de 1 cv) | 35,871 kW | 36,50 kW |

A demanda em kVA não muda em nenhum caso: a parcela `g` e as bombas em CV já usam a Tabela 18/19.

## 1. Exemplo 3: 36,10 ou 36,50 kW

A issue espera 36,10 kW para a cobertura de `DemandFixtures.exemplo3()`. As cargas da fixture somam 34,40 kW fora dos motores; com 2 × 1,05 kW da Tabela 19, o total é **36,50 kW**, e não 36,10. A diferença de 0,40 kW está fora dos motores.

A hipótese mais provável é o condicionador de ar: a fixture informa 2 × 2,1 "kW" para a parcela `f` fechar em 4,20 kVA, valor em VA da norma (comentário da fixture: "air conditioners in VA"). Se a norma lista a carga instalada do aparelho em W (2 × 1,9 kW, pela Tabela 11), a soma fecha em 34,00 + 2,10 = 36,10 kW. O motor não tem campo para W e VA separados no condicionador, e a Tabela 11 não está semeada.

A conferência é a Fatia 0, no PDF, antes do código. A fixture e o teste citam a DIS-NOR-030, Exemplo 3, p. 52 a 55; a issue cita o Anexo I da DIS-NOR-053, item 1.4. A Fatia 0 confirma qual exemplo dá os 36,10 kW.

## 2. Fatias

Cada fatia entra com os testes. Os unitários ficam em `src/test/java/br/com/ampere/domain/` com `DemandFixtures` (tabelas de `NormativeTableSeed.all`); os de integração seguem `DemandCalculationIntegrationTest` e `ConsumerUnitGroupControllerTest`.

### Fatia 0: Conferência do Exemplo 3

- Ler as páginas do exemplo no PDF (procedimento de `fontes-normativas.md`, sem `pdftotext` para valor) e transcrever a lista de cargas com a carga instalada de cada uma.
- Registrar em `fontes-normativas.md`, junto dos Exemplos 1 e 2, a tabela do exemplo e de onde sai a diferença entre 36,50 e 36,10 kW.
- **Pronto quando:** o valor esperado do teste estiver decidido (decisão 1) e a origem dos 0,40 kW estiver escrita.

### Fatia 1: Carga Instalada pela Tabela no Domínio

- `LoadCategory.installedKw` e `motorRating`; `LoadItem.installedKw(context)` e `plateKw()`; `NormativeTables.isPublished` e a implementação em `NormativeTableSet`.
- `ConsumerUnitGroup`, `LoadGroup`, `ResidentialGroup` e `EvChargingGroup` com `DemandContext` em `validate`, `status`, `loadPerUnitKw` e `declaredLoadKw`.
- `MOTORS.issues`: pendência Revisar para motor sem linha na tabela ou tabela não publicada, com o campo `items[i].power` ou `loads[i].power`.
- `DemandEngine`: `LOW_VOLTAGE_LIMIT` e `Dind` leem `installedKw` já calculado pelo contexto.
- **Testes:**
  - `IndividualDemandTest`: a cobertura passa de 35,871 kW ao valor da Fatia 0, na linha do `Dind` e na mensagem de `LOW_VOLTAGE_LIMIT`. A demanda continua em 26,58 kVA.
  - `ConsumerUnitGroupTest`: o elevador de 10 cv soma 8,89 kW (9,355 vira 10,89 com a iluminação); motor em grupo `LOAD` de edificação monofásica lê a Tabela 18 (1 cv = 1,14 kW); motor de 250 cv fica em Revisar; tabela de motores não publicada fica em Revisar sem lançar exceção; motor declarado em kW lê a linha da potência convertida em CV.
  - Novo caso no limite: apartamento trifásico com 74 kW pela placa e acima de 75 kW pela tabela fica em Revisar.
  - `LoadCategoryDemandTest`: bomba em CV entra na carga pela tabela; bomba em kW, pelo valor declarado.
  - `DemandEngineAnexoITest`: os Exemplos 1 e 2 passam sem mudança nos kVA; acrescentar a carga instalada da área comum do Exemplo 2 (2 × 12,82 + 2 × 2,95 kW de motores).
- **Pronto quando:** `./mvnw test -Dtest='*Demand*,ConsumerUnitGroupTest'` passa e não sobra chamada a `declaredLoadKw()` de `LoadItem`.

### Fatia 2: Contexto nos Services e na API

- `DemandCalculationService.contextFor(project)`, usado por `compute`.
- `GroupValidation.of(groups, context)` em `DemandCalculationService.calculate`, `ConsumerUnitGroupService.validation` e `DesignerDashboardService.pendingStage`. No painel, rascunho sem `submittedAt` usa `new NormativeTableSet(published)`, já carregado uma vez; o reprovado usa `contextFor`.
- `ConsumerUnitGroupService` com `ProjectGroups`; `ConsumerUnitGroupController` monta `ConsumerUnitGroupResponse.from(group, context)`.
- `CalculationWorkbook.addGroups` e `MemorialPdfService.addConsumerUnits` recebem o contexto para `loadPerUnitKw` e `status`.
- **Testes:** `ConsumerUnitGroupControllerTest`: `loadPerUnitKw`, `declaredLoadKw` e `unitLoadKw` de um grupo com motor saem pela tabela no `GET`, no `POST` e no `PUT`; `GET .../validation` soma o mesmo total. `DemandCalculationIntegrationTest`: o grupo em Revisar pela tabela recebe 422 ao calcular, com a mesma mensagem da listagem. Integração sem `publishTables()` com motor: listagem responde 200 com a pendência da tabela não publicada.
- **Pronto quando:** `./mvnw clean verify` passa e nenhum service soma carga por conta própria.

### Fatia 3: Memorial Cita a Tabela 19

- `ResidentialGroup.individualDemand`: a linha do trifásico com motores diz a origem, por exemplo "Cobertura (trifásico, carga instalada de 36,50 kW, motores pela Tabela 19)".
- `LoadCategory.MOTORS.demand`: nota por item com a potência absorvida, "Motor trifásico: 2 × 1,05 kW de carga instalada (Tabela 19)", ao lado da nota da linha seguinte que `motorKva` já escreve.
- `MemorialPdfService.addConsumerUnits`: nota abaixo da tabela "Unidades Consumidoras" quando algum grupo tem motor, citando a Tabela 19 ou 18 da DIS-NOR-030, item 6.27.7, como origem da carga dos motores.
- **Testes:** `IndividualDemandTest` com a nova linha do `Dind`; `SubmissionIntegrationTest`, que já gera o memorial, com o texto da nota lido do PDF; projeto sem motor não ganha a nota.
- **Pronto quando:** o PDF de um projeto com motor cita a tabela nas duas seções e o de um sem motor fica igual ao de hoje.

### Fatia 4: Rascunhos com Motores Ficam Desatualizados

- `DemandCalculationService.input`: chave `motorInstalledLoad` com o valor `NORMATIVE_TABLE`, gravada só quando algum grupo tem item de `MOTORS` ou bomba em CV ou HP (detalhe na seção 4).
- **Testes:** integração com um cálculo gravado antes da regra (snapshot sem a chave, inserido direto pelo repositório): com motor, `GET .../calculation/latest` responde `outdated: true` e `changedTables` vazio; sem motor, `outdated: false`. Recalcular limpa o aviso. Projeto em análise com motor continua com `outdated: false`. Envio de projeto aguardando envio com motor recalcula, como `SubmissionService` já faz.
- **Pronto quando:** só os cálculos de rascunho, reprovado ou aguardando envio com motores aparecem desatualizados.

### Fatia 5: Documentação e Conferência

- `docs/tecnico/engine-calculo.md`: na parcela `g` e em "Demanda Individual", a carga instalada dos motores pela coluna kW da Tabela 18/19; critério novo na tabela "Critérios Adotados" para motor em kW e bomba em CV; trocar "35,87" se citado.
- `docs/tecnico/fontes-normativas.md`: o Exemplo 3 transcrito na Fatia 0.
- `PowerUnit`: o javadoc passa a dizer que a conversão física vale para tudo menos motores.
- `./mvnw spotless:apply` e `./mvnw clean verify`.
- Conferência no app (seção 6).
- **Pronto quando:** a documentação não cita mais a conversão de 0,7355 para motor e o checklist de back-end do `CONTRIBUTING.md` passa.

## 3. Arquivos

**Back, código:** `domain/LoadCategory.java`, `domain/LoadItem.java`, `domain/ConsumerUnitGroup.java`, `domain/LoadGroup.java`, `domain/ResidentialGroup.java`, `domain/EvChargingGroup.java`, `domain/DemandEngine.java`, `domain/NormativeTables.java`, `domain/NormativeTableSet.java`, `domain/PowerUnit.java` (javadoc), `service/DemandCalculationService.java`, `service/GroupValidation.java`, `service/ConsumerUnitGroupService.java`, `service/ProjectGroups.java` (novo), `service/DesignerDashboardService.java`, `service/CalculationWorkbook.java`, `service/SpreadsheetExportService.java`, `service/MemorialPdfService.java`, `controller/ConsumerUnitGroupController.java`, `dto/ConsumerUnitGroupResponse.java`.

**Back, testes:** `IndividualDemandTest`, `ConsumerUnitGroupTest`, `LoadCategoryDemandTest`, `DemandEngineAnexoITest`, `DemandFixtures`, `ConsumerUnitGroupControllerTest`, `ConsumerUnitGroupServiceIntegrationTest`, `DemandCalculationIntegrationTest`, `SubmissionIntegrationTest`, `ResidentialConnectionMigrationIntegrationTest` e os testes do seed de cenários (chamadas a `validate` e `status`).

**Docs:** `docs/tecnico/engine-calculo.md`, `docs/tecnico/fontes-normativas.md`.

**Sem mudança:** `NormativeTableSeed` e `NormativeTableCode` (a Tabela 19 já está semeada), o contrato da API e o banco.

## 4. Rascunhos com Cálculo Desatualizado

Hoje um cálculo fica desatualizado quando a entrada gravada (`inputSnapshot`) difere da atual ou quando uma tabela usada foi substituída (`changedTables`). A mudança de regra não altera nenhum dos dois: os itens são os mesmos, e a Tabela 19 já constava em `normativeTableIds` de quem tem motor.

A Fatia 4 grava a regra na entrada: `motorInstalledLoad: NORMATIVE_TABLE`, só quando o projeto tem motor ou bomba em CV ou HP. `sameInput` compara a entrada atual com a gravada:

- cálculo antigo de projeto com motor não tem a chave: `outdated: true`, e o projetista recalcula;
- projeto sem motor não ganha a chave dos dois lados: nada muda;
- cálculo novo grava a chave: fica atual.

O resto já existe: `latest` só marca desatualizado o projeto que ainda pode ser enviado (rascunho, reprovado, aguardando envio); o envio recalcula o aguardando envio desatualizado; o memorial e a planilha recusam com 409 até recalcular; o "Exige Ação" do Painel aponta a etapa Cálculo. Projeto em análise ou aprovado mantém o cálculo e o memorial emitido na versão (`ProjectVersion`).

A alternativa é gravar na entrada a carga instalada de cada grupo. Todo rascunho antigo ficaria desatualizado, com ou sem motor, e a entrada deixaria de ser só o que o projetista informou.

## 5. Efeito na API e no Front

- **API.** Nenhum campo novo ou removido. Mudam os valores de `loadPerUnitKw`, `declaredLoadKw` e `unitLoadKw` (trifásico) em `GET`, `POST` e `PUT /api/projects/{projectId}/consumer-unit-groups`, de `totalDeclaredLoadKw` em `GET .../consumer-unit-groups/validation`, a linha do `Dind` e a mensagem de `LOW_VOLTAGE_LIMIT` no cálculo, e `outdated` dos rascunhos com motor. Pode aparecer pendência nova em `issues` (motor fora da tabela). O OpenAPI não muda.
- **Front, sem código.** A tabela e os cartões de grupos, o resumo do projeto e a etapa de unidades leem os números da API e mostram os novos valores sozinhos. O aviso de cálculo desatualizado já existe.
- **Front, prévia do formulário.** `GroupSheet/unit-load.ts` (`sumLoadsKw`) soma a placa com `powerUnitKw` (0,7355) para a prévia e o aviso de 75 kW do apartamento trifásico. Com motores, a prévia fica abaixo do valor do back até salvar; depois de salvo, a pendência do back aparece no grupo. O comentário "as the back adds" deixa de ser verdade. Decisão 5.

## 6. Verificação no App

Subir o Postgres, o back (`./mvnw spring-boot:run` em `app/back`) e o front (`pnpm dev` em `app/front`), com `user@ampere.com` e a senha `senha@123`.

- Um rascunho com a área comum dos cenários (elevador de 12 cv): a carga por unidade sobe pela Tabela 19 na lista de grupos, e o cálculo feito antes da mudança aparece como desatualizado. Recalcular limpa o aviso e mantém a demanda em kVA.
- A cobertura do `ScenarioGroups.penthouseLoads` (cargas do Exemplo 3): carga instalada do valor da Fatia 0 no `Dind` e na verificação dos 75 kW.
- Um motor de 250 cv num grupo `LOAD`: o grupo fica em Revisar com a mensagem da tabela, e o botão de calcular fica bloqueado.
- O memorial de um projeto com motor traz a nota da Tabela 19 em "Unidades Consumidoras" e na memória de cálculo.

## 7. Ponto de Contato com a #230

A #230 (carga mínima de iluminação e tomadas) semeia a Tabela 5 em `NormativeTableSeed` e `NormativeTableCode` e cria uma pendência em `ResidentialGroup.validate`, que precisa ler a Tabela 5. É o mesmo problema desta issue: tabela normativa dentro da validação.

- Esta issue não toca o seed nem o enum. O conflito de arquivo com a #230 fica em `ResidentialGroup.validate`, nas assinaturas de `ConsumerUnitGroup`, em `GroupValidation`, `ConsumerUnitGroupResponse`, `ConsumerUnitGroupService` e nos testes de grupo.
- Recomendo a Fatia 1 e a 2 desta issue entrarem antes da #230, que passa a receber o `DemandContext` em `validate` pronto e só acrescenta a regra da Tabela 5. Se a #230 vier antes, ela precisa levar o mesmo encanamento, e esta issue só troca a conta dos motores.
- `DemandFixtures.exemplo3()` e `ScenarioGroups.penthouseLoads` são apartamentos trifásicos: a #230 pode acrescentar cômodos a eles. Os valores esperados de carga instalada mudam nas duas issues; quem entrar depois atualiza os números.

## 8. Riscos e Decisões em Aberto

1. **Valor do Exemplo 3.** Com a fixture atual, a Tabela 19 dá 36,50 kW, não 36,10 kW (seção 1). Recomendo a Fatia 0 decidir entre corrigir a fixture para a lista da norma, se a diferença for um dado transcrito errado, ou fixar o teste em 36,50 kW e registrar os 0,40 kW como divergência em `engine-calculo.md`, se a diferença for W contra VA do condicionador (Tabela 11, fora do escopo).
2. **Motor declarado em kW.** A linha da tabela é escolhida pela potência convertida em CV, como na demanda, e a carga instalada passa a ser a absorvida da tabela (10 kW de placa entram como cerca de 12 kW). A alternativa é manter o kW declarado. Recomendo seguir a tabela: kW e kVA da mesma linha.
3. **Bombas em CV ou HP.** O critério 7 já manda a bomba em CV para a tabela de motores no kVA. Recomendo a carga instalada seguir a mesma linha; a issue cita só motores.
4. **Motor fora da tabela ou tabela não publicada.** Vira pendência Revisar no grupo, e a carga exibida cai na placa. A alternativa, `loadPerUnitKw` nulo, esconde o total da etapa. Recomendo a pendência com a placa na exibição.
5. **Prévia do front.** Recomendo manter a prévia pela placa, corrigir o comentário de `unit-load.ts` e deixar o número final e o aviso dos 75 kW com o back depois de salvar. Copiar a Tabela 19 para o front fere a regra de não embutir valor normativo no código, e não há rota de leitura das tabelas para o projetista. Se a diferença perto dos 75 kW incomodar, uma issue de front própria.
6. **Assinaturas em cascata.** `validate` e `status` com contexto mudam dezenas de chamadas nos testes. `DemandFixtures` ganha `validate(group)` e `status(group)` com o contexto padrão para conter a mudança.
7. **Consultas a mais.** A listagem, a validação e o painel passam a carregar as tabelas do projeto. São 18 tabelas pequenas por `@EntityGraph`; no painel, as publicadas já são lidas uma vez para todos os rascunhos. O reprovado no painel faz uma consulta a mais por projeto (`fixedRevisions`).
8. **Revisões fixadas.** Reprovado depois do primeiro envio lê a Tabela 19 da versão 1 (`contextFor` usa `tablesFor`), na validação e no cálculo. Sem isso, a listagem e o cálculo poderiam ler revisões diferentes.
9. **Projetos já enviados.** Em análise ou aprovado com motor guardam a carga pela placa no cálculo e no memorial emitido. A listagem de grupos desses projetos mostra o número novo, diferente do memorial da versão. Só some num reenvio. Os cenários do seed com `SEED_RESET_SCENARIOS=true` recalculam com a regra nova.
10. **Nome do exemplo.** A issue cita o Exemplo 3 do Anexo I da DIS-NOR-053; o código cita o Exemplo 3 da DIS-NOR-030. O Exemplo 3 do Anexo I em `DemandEngineAnexoITest` é o agrupamento de blocos, desativado. A Fatia 0 acerta a citação nos comentários e na documentação.
