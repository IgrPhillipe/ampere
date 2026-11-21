# Plano da #137: Back-end dos Indicadores da Análise

AT01-US17. Entrega `GET /api/dashboard/review?period=` no contrato que o front já valida em `app/front/src/services/dashboard/schemas/review-dashboard.schema.ts`. O `GET /api/review-queue/mine` saiu do escopo: os projetos decididos vêm de `GET /api/review-queue` com `filter=APPROVED` ou `REJECTED`.

## Visão Geral

- **Rota.** `DashboardController.review`, com `period` em `DashboardPeriod` (padrão `LAST_30_DAYS`) e o mesmo `AuthenticatedUser.of(jwt...)` do painel do projetista.
- **Segurança.** `/dashboard/review` em `hasAnyRole(REVIEWING_ROLES)` no `SecurityConfig`, junto de `/review-queue`. O service repete a checagem com `user.requireReviewer()`.
- **Escopo.** `Long reviewerId = user.isReviewer() ? user.id() : null`, como `ReviewQueueService.analystScope`. O analista vê os projetos cujo `Project.reviewer` é ele hoje, decididos ou não. O admin vê todos os projetos enviados, inclusive os sem analista.
- **Período.** `since = period.since(today).atStartOfDay(ZONE)`, com `ZONE = America/Recife`, sem limite superior.
- **Fonte.** O histórico (`ProjectEvent`), porque `Project.submit()` sobrescreve `submittedAt` e `reviewClockStartedAt`. `ProjectEvent.version` é o `reviewCycle` do projeto no momento do evento e casa com `ProjectVersion.number`: cada ciclo tem um envio (`SUBMITTED` ou `RESUBMITTED`) e no máximo uma decisão (`APPROVED` ou `REJECTED`) com a mesma `version`.

### Estratégia de Consulta

Uma consulta traz o histórico de análise inteiro dos projetos no escopo que tiveram algum evento de análise desde `since`:

```sql
SELECT event.project.id, event.type, event.version, event.occurredAt
FROM ProjectEvent event
LEFT JOIN event.project.reviewer reviewer
WHERE event.type IN (SUBMITTED, RESUBMITTED, APPROVED, REJECTED)
  AND (:reviewerId IS NULL OR reviewer.id = :reviewerId)
  AND event.project.id IN (
    SELECT recent.project.id FROM ProjectEvent recent
    WHERE recent.type IN (...) AND recent.occurredAt >= :since)
ORDER BY event.project.id, event.occurredAt, event.id
```

Um objeto puro, `ReviewHistory`, agrupa as linhas por projeto e ciclo e calcula totais, semanas, meses, tempos, prazos e reprovações repetidas em Java. Fica testável sem banco, e os campos que olham para antes do período (primeiro envio, prazo acumulado, contagem de reprovações) saem da mesma lista. O volume é pequeno: dezenas de projetos por analista.

As consultas restantes são pontuais: projetos em análise, carga por analista, ranking de apontamentos e alertas das versões enviadas.

## 1. Campos do Schema

| Campo | Fonte | Cálculo |
| :--- | :--- | :--- |
| `totals.received` | `ReviewHistory` | Projetos distintos com `SUBMITTED` ou `RESUBMITTED` em `occurredAt >= since` |
| `totals.approved` | `ReviewHistory` | Projetos distintos com `APPROVED` no período |
| `totals.rejected` | `ReviewHistory` | Projetos distintos com `REJECTED` no período. Um projeto reprovado e aprovado no mesmo período conta nos dois |
| `totals.underReview` | `ProjectRepository` | `status = UNDER_REVIEW` e `submittedAt` preenchido, hoje, sem período. Analista: `countByReviewerIdAndStatusIn(id, {UNDER_REVIEW})`. Admin: `countByStatusAndSubmittedAtIsNotNull(UNDER_REVIEW)`, que já existe |
| `averageReviewDays` | `ReviewHistory` | Para cada decisão no período, `Timestamps.daysBetween(envio do mesmo ciclo, decisão)`. Média com 1 casa (`HALF_UP`), como `averageDaysToApproval` do projetista; `null` sem decisões. Decisão sem envio no ciclo fica de fora |
| `averageCycleDays` | `ReviewHistory` | Para cada `APPROVED` no período, `daysBetween(primeiro SUBMITTED do projeto, aprovação)`. Média com 1 casa; `null` sem aprovação com envio registrado |
| `weekly[]` | `ReviewHistory` | Da segunda-feira da semana de `since` à segunda da semana de hoje, inclusive as vazias. `received` conta eventos de envio e `decided` eventos de decisão com `localDate(occurredAt)` na semana e `>= since` |
| `monthlyRejection[]` | `ReviewHistory` | Do mês de `since` ao mês de hoje. `REJECTED / (APPROVED + REJECTED)` dos eventos do mês no período, × 100, com 1 casa; `null` no mês sem decisão |
| `deadlines.met`, `deadlines.overdue` | `ReviewHistory` | Para cada decisão no período, os dias de análise usados até ela: a soma de `daysBetween(envio, decisão)` dos ciclos até o dela. `<= Project.REVIEW_PERIOD_DAYS` (30) cumpre o prazo; acima, vencido. É o mesmo número que `Project.elapsedReviewDays` dá no ciclo corrente, já que o reenvio recua o início do prazo pelos dias usados |
| `workload[]` | `ProjectRepository` | Só para o admin; o analista recebe `[]`. `SELECT reviewer.id, reviewer.name, COUNT(p)` de `UNDER_REVIEW` com analista, agrupado, do maior ao menor e depois por nome. Sem período. Analista sem projeto em análise não entra, diferente de `AdminDashboardService.reviewerLoads` |
| `findingsRanking[]` | `FindingRepository` | `rankByOwner` com o escopo do analista no lugar do dono: `status <> DRAFT`, `createdAt >= since`, agrupado por `stage` e `standardItem`, `COUNT` decrescente, depois `stage` e `standardItem`, os 10 primeiros |
| `findingsRanking[].projects[]` | `FindingRepository` | Segunda consulta: `DISTINCT stage, standardItem, project.id, name, protocol` dos mesmos apontamentos. Em Java, só as chaves do top 10 (com `standardItem` nulo como chave própria), em ordem de protocolo |
| `municipalities[]` | `ReviewHistory` + `ProjectRepository` | Projetos de `totals.received`, carregados por id, agrupados por `municipality` e `state`. Os 5 maiores; empate por município e depois UF |
| `repeatedRejections[]` | `ReviewHistory` + `ProjectRepository` | Projetos com 2 ou mais `REJECTED` no histórico e o último deles no período. `rejections` é a contagem; do maior ao menor, empate por protocolo. Sem limite |
| `alertsByCategory[]` | `ReviewHistory` + `ProjectVersionRepository` | Projetos de `totals.received` por `buildingType.category()`. `alerts` soma os `CalculationCheck` com `WARNING` do cálculo da versão enviada, a do último envio do projeto no período (`ProjectVersion.number = event.version`). Só categorias com projeto, na ordem do enum |

Os `id` saem como string. O analista e o admin usam as mesmas regras; muda só `reviewerId`.

## 2. Fatias

Cada fatia entra com o teste junto. O arquivo de integração é `src/test/java/br/com/ampere/service/ReviewDashboardIntegrationTest.java`, no estilo de `ReviewQueueIntegrationTest` e `DesignerDashboardIntegrationTest`: `@SpringBootTest`, `@AutoConfigureMockMvc`, `@Transactional`, usuários criados no `@BeforeEach` com `senha@123`, projetos e eventos gravados direto pelos repositórios (helper `event(project, type, version, occurredAt)`) e asserções por `jsonPath` sobre a resposta da API. O banco é o `ampere_test` do Postgres local.

### Fatia 1: Rota, Segurança e Totais

- `SecurityConfig`: `/dashboard/review` em `hasAnyRole(REVIEWING_ROLES)`.
- `DashboardController.review` e `ReviewDashboardService.dashboard(period, user)`.
- `dto/ReviewDashboardResponse.java`: o record completo, com os campos ainda não calculados vazios ou nulos.
- `service/ReviewHistory.java`: agrupamento por projeto e ciclo e `totals`.
- `ProjectEventRepository.findReviewHistory(reviewerId, since, types)`, com projeção `ReviewEventRow`.
- `DashboardPeriod`: javadoc deixa de citar só o projetista.
- **Testes:** projetista recebe 403; período inválido, 400; o analista não conta projeto sem analista nem de outro analista; o admin conta os dois; um projeto reenviado no período conta uma vez em `received`; `underReview` ignora o período; cada período conta só os próprios eventos.

### Fatia 2: Semanas e Taxa de Reprovação

- `ReviewHistory`: `weekly` e `monthlyRejection`.
- **Testes:** `service/ReviewHistoryTest.java` (unitário, com `today` fixo): semanas vazias no meio, semana que começa antes de `since`, virada de ano no `CURRENT_YEAR`, mês sem decisão com `null`, 1 reprovação em 3 decisões = 33,3. Na integração, um caso com o número de entradas de `LAST_30_DAYS` (5 ou 6 semanas, 2 meses).

### Fatia 3: Tempos e Prazos

- `ReviewHistory`: `averageReviewDays`, `averageCycleDays` e `deadlines`.
- **Testes:** no unitário, reprovação no dia 10, reenvio, aprovação 25 dias depois do reenvio: 35 dias usados, prazo vencido; decisão no 30º dia cumpre; decisão sem envio no ciclo fica de fora; aprovação sem `SUBMITTED` não entra no ciclo. Na integração, um projeto decidido com prazo cumprido e outro vencido, e médias `null` sem decisão.

### Fatia 4: Carga por Analista

- `ProjectRepository.countUnderReviewPerReviewer()`, com projeção `ReviewerWorkload`.
- **Testes:** o admin vê os analistas com projeto em análise, do maior ao menor; analista sem projeto não aparece; o analista recebe `workload: []`.

### Fatia 5: Ranking de Apontamentos

- `FindingRepository.rankInScope(reviewerId, since, pageable)` e `findRankedProjects(reviewerId, since)`, com `LEFT JOIN finding.project.reviewer`.
- **Testes:** rascunho não conta; apontamento antes do período não conta; o analista não vê apontamento de projeto de outro analista; `standardItem` nulo forma linha própria; `projects[]` traz cada projeto uma vez, em ordem de protocolo; limite de 10.

### Fatia 6: Municípios, Reprovações Repetidas e Alertas

- `ReviewHistory`: ids recebidos e reprovações por projeto.
- `ProjectRepository`: busca por ids com `buildingType` (`@EntityGraph`).
- `ProjectVersionRepository.countWarnings(projectIds)`: `project.id`, `number` e `COUNT` dos checks `WARNING` do `calculation`.
- **Testes:** top 5 com empate pelo nome; projeto com 2 reprovações, a última fora do período, não aparece; com 1 reprovação, não aparece; alertas somam só a versão do último envio no período; categoria sem projeto não aparece.

### Fatia 7: Documentação e Conferência

- `app/back/README.md`, seção "Painel do Analista": troca `Project.deadline` pela regra dos dias usados, registra os desempates e o recorte do primeiro mês e da primeira semana, e tira o aviso de que o front mostra erro até o back entrar.
- `docs/produto/user-stories.md`: marca "Calcular os indicadores da equipe" e "Exibir o ranking".
- `./mvnw spotless:apply` e `./mvnw clean verify`.
- Conferência no app (seção 4).

## 3. Riscos e Decisões em Aberto

1. **Não existe `Project.deadline`.** O README cita o campo, mas o prazo é calculado (`reviewClockStartedAt + 30`) e muda no reenvio. O plano reconstrói os dias usados pelo histórico. Decisão sem envio no mesmo ciclo (histórico incompleto) fica fora de tempos e prazos, mas conta nos totais.
2. **Escopo pela atribuição atual, não pelo autor da decisão.** É a regra da fila e da US17, mas o projeto reatribuído leva junto o histórico: as decisões de um analista passam a contar para outro. A alternativa, `event.author`, diverge da listagem de "Projetos" e do ranking. Recomendo manter a atribuição atual e registrar no README.
3. **Join implícito.** `event.project.reviewer.id` em JPQL pode virar `INNER JOIN` e sumir com os projetos sem analista do admin. Todas as consultas usam `LEFT JOIN` explícito, e há teste do admin com projeto sem analista.
4. **Totais e séries não somam igual.** `totals.received` conta projetos distintos e `weekly[].received` conta eventos: um projeto enviado e reenviado no período aparece uma vez no total e duas nas semanas. Idem `approved + rejected` contra `decided`. O front não pode exigir a igualdade.
5. **Primeira semana e primeiro mês.** Contam só os eventos a partir de `since`: em `LAST_30_DAYS`, o primeiro mês sai parcial. A alternativa é contar o mês inteiro, o que mistura eventos fora do período. Recomendo o recorte e o registro no README.
6. **"Dias corridos com decimais".** Cada decisão conta dias de calendário inteiros, no fuso de Recife, e só a média tem decimal, como no painel do projetista.
7. **Alertas do cálculo enviado.** Vêm da `ProjectVersion` do último envio no período. Projeto sem versão (base antiga sem o `ProjectVersionBackfill`) entra com 0 alertas. A categoria é a atual do projeto, que pode ter mudado entre ciclos.
8. **Município como texto.** O agrupamento é pelo texto exato; "Recife" e "RECIFE" viram linhas diferentes. O endereço vem do CEP, então o risco é baixo; não há normalização no plano.
9. **Sem limite em `repeatedRejections`.** O README não define; com o volume atual a lista é curta. Se crescer, limitar a 10 como o ranking.
10. **Ordem do ranking por etapa.** O desempate por `stage` em JPQL segue o nome do enum, não a ordem das abas. Mesmo comportamento do projetista.
11. **Desempenho.** O cálculo em Java carrega o histórico de análise dos projetos ativos no período. No `CURRENT_YEAR` do admin isso é a base inteira do ano, ainda pequena. O índice `idx_project_event_timeline` serve à ordenação; se pesar, um índice em `(type, occurred_at)`.

## 4. Verificação no App

Subir o Postgres, o back (`./mvnw spring-boot:run` em `app/back`) e o front (`pnpm dev` em `app/front`). Os seeds criam os usuários com a senha `senha@123` e os cenários com datas relativas ao momento do seed; `SEED_RESET_SCENARIOS=true` recria as datas.

- **`analista@ampere.com` (Ana Analista).** O Painel mostra só os projetos atribuídos a ela: três em análise (`underReview = 3`), a aprovação após contestação, a reprovação só com ajustes e a aprovação não residencial após retrabalho. Os projetos do ranking abrem. Não há reprovação repetida no escopo dela; `repeatedRejections` vem vazio e `workload` também.
- **`revisor@ampere.com`.** Tem os dois cenários com duas reprovações; `repeatedRejections` lista os dois em `LAST_90_DAYS`.
- **`admin@ampere.com`.** A seção "Indicadores da Análise" do Painel mostra a equipe toda, com `workload` por analista, e inclui o projeto que espera atribuição em `received`.
- **Projetista.** A chamada direta responde 403:

```bash
TOKEN=$(curl -s -X POST http://localhost:8080/api/auth/login -H 'Content-Type: application/json' -d '{"email":"user@ampere.com","password":"senha@123"}' | jq -r '.data.token')
```

```bash
curl -s -o /dev/null -w '%{http_code}\n' -H "Authorization: Bearer $TOKEN" 'http://localhost:8080/api/dashboard/review?period=LAST_90_DAYS'
```

Trocar o período no Painel deve mexer em tudo, menos em `underReview` e `workload`.
