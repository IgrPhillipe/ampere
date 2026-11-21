package br.com.ampere.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.startsWith;
import static org.springframework.test.util.ReflectionTestUtils.setField;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import br.com.ampere.config.NormativeTableSeed;
import br.com.ampere.config.NormativeTableValidityMigration;
import br.com.ampere.domain.ConnectionType;
import br.com.ampere.domain.EntranceStandard;
import br.com.ampere.domain.GroupKind;
import br.com.ampere.domain.GroupSpec;
import br.com.ampere.domain.LampTechnology;
import br.com.ampere.domain.LoadCategory;
import br.com.ampere.domain.LoadItem;
import br.com.ampere.domain.LoadUsage;
import br.com.ampere.domain.NormativeTable;
import br.com.ampere.domain.NormativeTableCode;
import br.com.ampere.domain.PowerUnit;
import br.com.ampere.domain.Project;
import br.com.ampere.domain.ProjectEvent;
import br.com.ampere.domain.ProjectEventType;
import br.com.ampere.domain.ProjectStatus;
import br.com.ampere.domain.ResidentialMultifamily;
import br.com.ampere.domain.Standard;
import br.com.ampere.domain.SupplyVoltage;
import br.com.ampere.domain.User;
import br.com.ampere.domain.UserRole;
import br.com.ampere.repository.CalculationRepository;
import br.com.ampere.repository.ConsumerUnitGroupRepository;
import br.com.ampere.repository.FindingRepository;
import br.com.ampere.repository.NormativeTableRepository;
import br.com.ampere.repository.ProjectEventRepository;
import br.com.ampere.repository.ProjectRepository;
import br.com.ampere.repository.StandardRepository;
import br.com.ampere.repository.UserRepository;
import br.com.ampere.utils.Timestamps;
import jakarta.persistence.EntityManager;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.function.Function;
import java.util.stream.Collectors;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;
import tools.jackson.databind.ObjectMapper;
import tools.jackson.databind.node.ObjectNode;

/** Step 3 end to end: the published tables, the engine and the record, through HTTP. */
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class DemandCalculationIntegrationTest {

  private static final String PASSWORD = "senha@123";

  @Autowired private MockMvc mockMvc;

  @Autowired private ObjectMapper objectMapper;

  @Autowired private PasswordEncoder passwordEncoder;

  @Autowired private UserRepository userRepository;

  @Autowired private StandardRepository standardRepository;

  @Autowired private NormativeTableRepository normativeTableRepository;

  @Autowired private ProjectRepository projectRepository;

  @Autowired private FindingRepository findingRepository;

  @Autowired private ConsumerUnitGroupRepository groupRepository;

  @Autowired private CalculationRepository calculationRepository;

  @Autowired private ProjectEventRepository eventRepository;

  @Autowired private DemandCalculationService calculations;

  @Autowired private ProjectVersionService versionService;

  @Autowired private EntityManager entityManager;

  @Autowired private NormativeTableValidityMigration validityMigration;

  @Test
  void aTableFirstUsedOnResubmissionAlsoUsesTheOriginalDate() {
    publishTables();
    Project project = draftWithPrototypeGroups(true);
    var groups = groupRepository.findAllByProjectIdOrderById(project.getId());
    var withoutEv = groups.stream().filter(group -> group.kind() != GroupKind.EV_CHARGING).toList();
    var initial = calculations.compute(project, withoutEv);
    var expected = calculations.compute(project, groups);
    var replacement = replace(NormativeTableCode.Q33_EV_STATIONS, "0.5");
    assertThat(calculations.isCurrent(initial, withoutEv)).isTrue();
    project.submit(replacement.getVerifiedAt().minusSeconds(1));
    project.reject(OffsetDateTime.now(ZoneOffset.UTC), "Incluir recarga");
    var resubmission = calculations.compute(project, groups);
    assertThat(resubmission.getEvChargingDemand())
        .isEqualByComparingTo(expected.getEvChargingDemand());
  }

  @Test
  void aRunFromBeforeTheMotorTableRuleIsOutdatedOnlyWithMotors() throws Exception {
    publishTables();
    Project withMotors = draftWithPrototypeGroups(true);
    Project withoutMotors = draftWithApartmentsOnly();
    calculateBeforeTheMotorRule(withMotors);
    calculateBeforeTheMotorRule(withoutMotors);

    mockMvc
        .perform(
            get(calculationOf(withMotors) + "/latest").header("Authorization", "Bearer " + token))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.data.outdated").value(true))
        .andExpect(jsonPath("$.data.changedTables").isEmpty());
    mockMvc
        .perform(
            get(calculationOf(withoutMotors) + "/latest")
                .header("Authorization", "Bearer " + token))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.data.outdated").value(false));

    mockMvc
        .perform(post(calculationOf(withMotors)).header("Authorization", "Bearer " + token))
        .andExpect(status().isCreated());
    mockMvc
        .perform(
            get(calculationOf(withMotors) + "/latest").header("Authorization", "Bearer " + token))
        .andExpect(jsonPath("$.data.outdated").value(false));
  }

  @Test
  void aThreePhaseRunFromBeforeTheMotorTableRuleStaysCurrentWithoutMotors() throws Exception {
    publishTables();
    Project project = draftWithThreePhaseApartment("20");
    calculateBeforeTheMotorRule(project);

    // Runs before the rule recorded the plate sum of a three-phase unit.
    assertThat(
            objectMapper
                .readTree(
                    calculationRepository
                        .findFirstByProjectIdOrderByIdDesc(project.getId())
                        .orElseThrow()
                        .getInputSnapshot())
                .at("/groups/0/spec/unitLoadKw")
                .decimalValue())
        .isEqualByComparingTo("20");
    mockMvc
        .perform(get(calculationOf(project) + "/latest").header("Authorization", "Bearer " + token))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.data.outdated").value(false));
  }

  /** A run saved as the engine recorded it before motors took Tabela 18 or 19. */
  private void calculateBeforeTheMotorRule(Project project) {
    var calculation =
        calculationRepository.saveAndFlush(
            calculations.compute(
                project, groupRepository.findAllByProjectIdOrderById(project.getId())));
    ObjectNode input = (ObjectNode) objectMapper.readTree(calculation.getInputSnapshot());
    input.remove("motorInstalledLoad");
    entityManager
        .createQuery("UPDATE Calculation c SET c.inputSnapshot = :input WHERE c.id = :id")
        .setParameter("input", objectMapper.writeValueAsString(input))
        .setParameter("id", calculation.getId())
        .executeUpdate();
    entityManager.clear();
  }

  private Project draftWithApartmentsOnly() {
    Project project =
        projectRepository.save(
            new Project(
                "Residencial Sem Motores",
                "Rua da Aurora, 10",
                "Recife",
                "2026-2002",
                ProjectStatus.DRAFT,
                building(),
                standards,
                owner));
    groupRepository.save(apartments(project, "Apartamento tipo A", 24, "68"));
    return project;
  }

  @Test
  void aRunRecordedBeforeTheRoomsFieldStaysCurrent() {
    publishTables();
    Project project = draftWithPrototypeGroups(true);
    var groups = groupRepository.findAllByProjectIdOrderById(project.getId());
    var run = calculations.compute(project, groups);
    ObjectNode snapshot = (ObjectNode) objectMapper.readTree(run.getInputSnapshot());
    snapshot.path("groups").forEach(group -> ((ObjectNode) group.path("spec")).remove("rooms"));
    setField(run, "inputSnapshot", objectMapper.writeValueAsString(snapshot));

    assertThat(calculations.isCurrent(run, groups)).isTrue();
  }

  @Test
  void replacingAnAppliedTableInvalidatesADraftButNotASubmittedProtocol() throws Exception {
    publishTables();
    Project project = draftWithPrototypeGroups(true);
    var groups = groupRepository.findAllByProjectIdOrderById(project.getId());
    var original = calculations.compute(project, groups);
    calculationRepository.saveAndFlush(original);
    assertThat(calculations.isCurrent(original, groups)).isTrue();
    var old = published(NormativeTableCode.Q35_APARTMENT_DEMAND);
    var replacement = replace(NormativeTableCode.Q35_APARTMENT_DEMAND, "2");
    assertThat(calculations.isCurrent(original, groups)).isFalse();
    assertThat(calculations.changedTables(original)).contains("Quadro 35");
    mockMvc
        .perform(get(calculationOf(project) + "/latest").header("Authorization", "Bearer " + token))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.data.outdated").value(true))
        .andExpect(jsonPath("$.data.changedTables[0]").value("Quadro 35"));
    var updatedDraft = calculations.compute(project, groups);
    assertThat(updatedDraft.getResidentialDemandFinal())
        .isNotEqualByComparingTo(original.getResidentialDemandFinal());
    assertThat(calculations.isCurrent(updatedDraft, groups)).isTrue();

    entityManager
        .createNativeQuery("UPDATE normative_table SET superseded_at = NULL WHERE id = :id")
        .setParameter("id", old.getId())
        .executeUpdate();
    validityMigration.run(null);
    validityMigration.run(null);
    entityManager.refresh(old);
    assertThat(old.getSupersededAt())
        .isEqualTo(replacement.getVerifiedAt().truncatedTo(ChronoUnit.MICROS));

    project.submit(replacement.getVerifiedAt().minusSeconds(1));
    project.reject(OffsetDateTime.now(ZoneOffset.UTC), "Corrigir");
    var resubmission = calculations.compute(project, groups);
    assertThat(resubmission.getResidentialDemandFinal())
        .isEqualByComparingTo(original.getResidentialDemandFinal());
    assertThat(calculations.isCurrent(original, groups)).isTrue();
  }

  @Test
  void aProtocolKeepsTheTablesItsFirstRunUsedEvenIfOneIsReplacedBeforeTheSubmission() {
    publishTables();
    Project project = draftWithPrototypeGroups(true);
    var groups = groupRepository.findAllByProjectIdOrderById(project.getId());
    var sent = calculationRepository.saveAndFlush(calculations.compute(project, groups));
    replace(NormativeTableCode.Q35_APARTMENT_DEMAND, "2");

    OffsetDateTime submittedAt = Timestamps.now();
    project.submit(submittedAt);
    versionService.register(project, sent, submittedAt);
    project.reject(Timestamps.now(), "Corrigir");

    assertThat(calculations.compute(project, groups).getResidentialDemandFinal())
        .isEqualByComparingTo(sent.getResidentialDemandFinal());
  }

  private String token;

  private List<Standard> standards;

  private User owner;

  @BeforeEach
  void seed() throws Exception {
    calculationRepository.deleteAll();
    groupRepository.deleteAll();
    findingRepository.deleteAll();
    projectRepository.deleteAll();
    normativeTableRepository.deleteAll();
    standardRepository.deleteAll();
    userRepository.deleteAll();

    standards =
        standardRepository.saveAll(
            List.of(new Standard("DIS-NOR-053", "REV 06"), new Standard("DIS-NOR-030", "REV 07")));
    owner =
        userRepository.save(
            new User(
                "Usuário Teste",
                "user@ampere.com",
                passwordEncoder.encode(PASSWORD),
                UserRole.USER));
    token = token("user@ampere.com");
  }

  @Test
  void calculatesThePrototypeProjectAndKeepsTheRecord() throws Exception {
    publishTables();
    Project project = draftWithPrototypeGroups(true);

    mockMvc
        .perform(post(calculationOf(project)).header("Authorization", "Bearer " + token))
        .andExpect(status().isCreated())
        .andExpect(jsonPath("$.data.projectId").value(String.valueOf(project.getId())))
        .andExpect(jsonPath("$.data.steps", hasSize(6)))
        .andExpect(jsonPath("$.data.steps[0].code").value("Drf"))
        .andExpect(
            jsonPath("$.data.steps[0].formula")
                .value("(24 × 1,57 + 20 × 2,06 + 4 × 2,91) × 0,7129 × 1,2"))
        .andExpect(jsonPath("$.data.steps[0].valueKva").value(77.44))
        .andExpect(jsonPath("$.data.steps[0].reference.label").value("Quadro 35 (053)"))
        .andExpect(jsonPath("$.data.steps[2].applies").value(false))
        .andExpect(jsonPath("$.data.steps[2].reference").doesNotExist())
        .andExpect(jsonPath("$.data.steps[4].code").value("Ded"))
        .andExpect(jsonPath("$.data.steps[5].code").value("Dind"))
        .andExpect(jsonPath("$.data.totals.calculatedKva").value(163.07))
        .andExpect(jsonPath("$.data.totals.finalKva").value(165.00))
        .andExpect(jsonPath("$.data.totals.minimumApplied").value(true))
        .andExpect(jsonPath("$.data.traceability.voltage").value("380/220 V"))
        .andExpect(jsonPath("$.data.traceability.breakerAmps").value(250))
        .andExpect(jsonPath("$.data.traceability.breakerPoles").value("tripolar"))
        .andExpect(jsonPath("$.data.traceability.cableSectionMm2").value(150))
        .andExpect(jsonPath("$.data.composition", hasSize(4)))
        .andExpect(jsonPath("$.data.composition[0].percent").value(47.5))
        .andExpect(jsonPath("$.data.checksCount").value(7))
        .andExpect(jsonPath("$.data.warningsCount").value(1))
        .andExpect(jsonPath("$.data.standards.main.revision").value("REV 06"))
        .andExpect(jsonPath("$.data.standards.secondary.revision").value("REV 07"));

    mockMvc
        .perform(get(calculationOf(project) + "/latest").header("Authorization", "Bearer " + token))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.data.totals.finalKva").value(165.00))
        .andExpect(jsonPath("$.data.appliedTables[0].identification").value("Quadro 35"));

    mockMvc
        .perform(get("/projects").header("Authorization", "Bearer " + token))
        .andExpect(jsonPath("$.data[0].consumerUnitsCount").value(55))
        .andExpect(jsonPath("$.data[0].demandKva").value(165.00));
  }

  @Test
  void aRunTheDesignerAsksForBecomesTheLatestActivityOfTheProject() throws Exception {
    publishTables();
    Project project = draftWithPrototypeGroups(true);
    mockMvc
        .perform(post(calculationOf(project)).header("Authorization", "Bearer " + token))
        .andExpect(status().isCreated());

    ProjectEvent event =
        eventRepository.findAllByProjectIdOrderByOccurredAtAscIdAsc(project.getId()).getLast();
    assertThat(event.getType()).isEqualTo(ProjectEventType.CALCULATED);
    assertThat(event.getDescription()).isEqualTo("Demanda calculada: 165,00 kVA.");
    String body =
        mockMvc
            .perform(get("/projects/" + project.getId()).header("Authorization", "Bearer " + token))
            .andExpect(status().isOk())
            .andReturn()
            .getResponse()
            .getContentAsString();
    assertThat(
            OffsetDateTime.parse(objectMapper.readTree(body).at("/data/lastActivityAt").asString()))
        .isEqualTo(event.getOccurredAt());
  }

  @Test
  void refusesToCalculateWhileAGroupIsPending() throws Exception {
    publishTables();
    Project project = draftWithPrototypeGroups(false);

    mockMvc
        .perform(post(calculationOf(project)).header("Authorization", "Bearer " + token))
        .andExpect(status().isUnprocessableContent())
        .andExpect(
            jsonPath("$.detail")
                .value("Há grupos com pendências. Corrija-os antes de calcular a demanda."));
  }

  @Test
  void aUnitAboveTheLowVoltageLimitStopsBeforeTheCheck() throws Exception {
    publishTables();
    Project project = draftWithThreePhaseApartment("75.01");

    mockMvc
        .perform(
            get("/projects/" + project.getId() + "/consumer-unit-groups")
                .header("Authorization", "Bearer " + token))
        .andExpect(jsonPath("$.data[0].status").value("REVIEW"))
        .andExpect(jsonPath("$.data[0].issues", hasSize(1)))
        .andExpect(jsonPath("$.data[0].issues[0].severity").value("REVIEW"))
        .andExpect(jsonPath("$.data[0].issues[0].field").value("loads"))
        .andExpect(
            jsonPath("$.data[0].issues[0].message")
                .value(
                    "Carga instalada de 75,01 kW por unidade passa do limite de 75 kW da baixa"
                        + " tensão (DIS-NOR-030, item 6.2.1)."));
    mockMvc
        .perform(post(calculationOf(project)).header("Authorization", "Bearer " + token))
        .andExpect(status().isUnprocessableContent());
    mockMvc
        .perform(get(calculationOf(project) + "/latest").header("Authorization", "Bearer " + token))
        .andExpect(status().isNotFound());
  }

  @Test
  void aUnitAtTheLowVoltageLimitPassesTheCheckOnTheIndividualStep() throws Exception {
    publishTables();
    Project project = draftWithThreePhaseApartment("75");

    mockMvc
        .perform(post(calculationOf(project)).header("Authorization", "Bearer " + token))
        .andExpect(status().isCreated())
        .andExpect(jsonPath("$.data.steps[5].code").value("Dind"))
        .andExpect(jsonPath("$.data.steps[5].applies").value(true))
        .andExpect(
            jsonPath("$.data.checks[?(@.code == 'LOW_VOLTAGE_LIMIT')].status").value("PASSED"))
        .andExpect(
            jsonPath("$.data.checks[?(@.code == 'LOW_VOLTAGE_LIMIT')].message")
                .value(
                    "Maior carga instalada por apartamento de 75,00 kW, dentro do limite de 75 kW"
                        + " da baixa tensão (DIS-NOR-030, item 6.2.1)."));
  }

  @Test
  void namesTheTableThatIsNotPublished() throws Exception {
    publishTables();
    normativeTableRepository.delete(published(NormativeTableCode.Q35_APARTMENT_DEMAND));
    Project project = draftWithPrototypeGroups(true);

    mockMvc
        .perform(post(calculationOf(project)).header("Authorization", "Bearer " + token))
        .andExpect(status().isUnprocessableContent())
        .andExpect(
            jsonPath("$.detail", startsWith("O Quadro 35 da DIS-NOR-053 não está publicado")));
  }

  @Test
  void theGroupsAnswerTheMotorLoadsOfTabela19() throws Exception {
    publishTables();
    Project project = draftWithPrototypeGroups(true);
    String groups = "/projects/" + project.getId() + "/consumer-unit-groups";

    // 12 CV at the 12½ cv row (10,85 kW) and two pumps of 5 CV (4,51 kW each).
    mockMvc
        .perform(get(groups).header("Authorization", "Bearer " + token))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.data[3].loadPerUnitKw").value(45.67))
        .andExpect(jsonPath("$.data[3].declaredLoadKw").value(45.67));
    mockMvc
        .perform(
            post(groups)
                .header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    """
                    { "kind": "RESIDENTIAL", "name": "Cobertura", "quantity": 2, "usefulArea": 180,
                      "connectionType": "THREE_PHASE",
                      "loads": [
                        { "category": "INSTANT_HEATING", "description": "Chuveiro", "quantity": 1,
                          "power": 4, "powerUnit": "KW" },
                        { "category": "MOTORS", "description": "Bomba", "quantity": 1,
                          "power": 1, "powerUnit": "CV", "simultaneousStart": false }
                      ] }
                    """))
        .andExpect(status().isCreated())
        .andExpect(jsonPath("$.data.unitLoadKw").value(5.05))
        .andExpect(jsonPath("$.data.loadPerUnitKw").value(5.05))
        .andExpect(jsonPath("$.data.declaredLoadKw").value(10.1));
  }

  @Test
  void aMotorWithoutItsTableHoldsTheGroupBeforeTheRun() throws Exception {
    Project project = draftWithPrototypeGroups(true);

    mockMvc
        .perform(
            get("/projects/" + project.getId() + "/consumer-unit-groups")
                .header("Authorization", "Bearer " + token))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.data[3].status").value("REVIEW"))
        .andExpect(jsonPath("$.data[3].issues[0].field").value("items[0].power"))
        .andExpect(
            jsonPath("$.data[3].issues[0].message")
                .value(
                    "A Tabela 19 da DIS-NOR-030 não está publicada: sem ela não há carga nem"
                        + " demanda de \"Elevador\". Publique a tabela em Tabelas Normativas."));
    mockMvc
        .perform(post(calculationOf(project)).header("Authorization", "Bearer " + token))
        .andExpect(status().isUnprocessableContent())
        .andExpect(
            jsonPath("$.detail")
                .value("Há grupos com pendências. Corrija-os antes de calcular a demanda."));
  }

  @Test
  void answersNotFoundBeforeTheFirstCalculation() throws Exception {
    Project project = draftWithPrototypeGroups(true);

    mockMvc
        .perform(get(calculationOf(project) + "/latest").header("Authorization", "Bearer " + token))
        .andExpect(status().isNotFound())
        .andExpect(
            jsonPath("$.detail").value("Nenhum cálculo de demanda foi feito para este projeto."));
  }

  @Test
  void aSubmittedProjectIsNotRecalculated() throws Exception {
    publishTables();
    Project project =
        projectRepository.save(
            new Project(
                "Edifício Aurora",
                "Rua da Aurora, 1",
                "Recife",
                "2026-2002",
                ProjectStatus.UNDER_REVIEW,
                building(),
                standards,
                owner));

    mockMvc
        .perform(post(calculationOf(project)).header("Authorization", "Bearer " + token))
        .andExpect(status().isConflict());
  }

  @Test
  void recalculatesDemandForARejectedProjectKeepingItsStatus() throws Exception {
    publishTables();
    Project project = draftWithPrototypeGroups(true);
    project.submit(OffsetDateTime.now(ZoneOffset.UTC).minusDays(5));
    project.reject(OffsetDateTime.now(ZoneOffset.UTC), "Rever fator de demanda.");
    projectRepository.flush();

    mockMvc
        .perform(post(calculationOf(project)).header("Authorization", "Bearer " + token))
        .andExpect(status().isCreated())
        .andExpect(jsonPath("$.data.totals.finalKva").value(165.00));

    assertThat(projectRepository.findById(project.getId()).orElseThrow().getStatus())
        .isEqualTo(ProjectStatus.REJECTED);
  }

  private void publishTables() {
    normativeTableRepository.saveAll(
        NormativeTableSeed.all(
            standards.stream().collect(Collectors.toMap(Standard::getName, Function.identity()))));
    entityManager.flush();
    entityManager
        .createQuery("UPDATE NormativeTable t SET t.verifiedAt = :at")
        .setParameter("at", OffsetDateTime.now(ZoneOffset.UTC).minusDays(30))
        .executeUpdate();
    entityManager.clear();
  }

  private NormativeTable published(NormativeTableCode code) {
    return NormativeTableReplacement.published(normativeTableRepository, code);
  }

  private NormativeTable replace(NormativeTableCode code, String factor) {
    return NormativeTableReplacement.replace(normativeTableRepository, code, factor);
  }

  private Project draftWithPrototypeGroups(boolean fixed) {
    Project project =
        projectRepository.save(
            new Project(
                "Residencial Monte Verde",
                "Rodovia BR-101, km 8",
                "Cabo de Santo Agostinho",
                "2026-2001",
                ProjectStatus.DRAFT,
                building(),
                standards,
                owner));
    groupRepository.saveAll(
        List.of(
            apartments(project, "Apartamento tipo A", 24, "68"),
            apartments(project, "Apartamento tipo B", 20, "92"),
            apartments(project, "Cobertura duplex", 4, "140"),
            GroupKind.LOAD.create(
                project,
                spec(
                    "Área comum",
                    1,
                    LoadUsage.COMMON_AREA,
                    List.of(
                        new LoadItem(
                            LoadCategory.MOTORS,
                            "Elevador",
                            1,
                            new BigDecimal("12"),
                            PowerUnit.CV,
                            null,
                            fixed ? false : null),
                        new LoadItem(
                            LoadCategory.PUMPS_AND_HOT_TUBS,
                            "Bombas de recalque",
                            2,
                            new BigDecimal("5"),
                            PowerUnit.CV,
                            null,
                            null),
                        new LoadItem(
                            LoadCategory.LIGHTING_AND_OUTLETS,
                            "Iluminação",
                            1,
                            new BigDecimal("10"),
                            PowerUnit.KW,
                            LampTechnology.COMPACT_FLUORESCENT_LED,
                            null),
                        new LoadItem(
                            LoadCategory.LIGHTING_AND_OUTLETS,
                            "Tomadas",
                            1,
                            new BigDecimal("15.8"),
                            PowerUnit.KW,
                            LampTechnology.GENERAL_OUTLETS,
                            null)))),
            GroupKind.EV_CHARGING.create(
                project,
                new GroupSpec(
                    "Recarga de veículo elétrico",
                    6,
                    null,
                    null,
                    null,
                    null,
                    null,
                    null,
                    null,
                    new BigDecimal("7.40"),
                    false,
                    fixed ? true : null,
                    br.com.ampere.domain.EvStationType.COLLECTIVE))));
    return project;
  }

  private Project draftWithThreePhaseApartment(String loadKw) {
    Project project =
        projectRepository.save(
            new Project(
                "Residencial Torres do Pina",
                "Rua do Pina, 10",
                "Recife",
                "2026-2002",
                ProjectStatus.DRAFT,
                building(),
                standards,
                owner));
    groupRepository.save(
        GroupKind.RESIDENTIAL.create(
            project,
            new GroupSpec(
                "Cobertura",
                2,
                new BigDecimal("180"),
                3,
                null,
                false,
                ConnectionType.THREE_PHASE,
                null,
                List.of(
                    new LoadItem(
                        LoadCategory.LIGHTING_AND_OUTLETS,
                        "Tomadas",
                        1,
                        new BigDecimal("3.0"),
                        PowerUnit.KW,
                        LampTechnology.GENERAL_OUTLETS,
                        null),
                    new LoadItem(
                        LoadCategory.LIGHTING_AND_OUTLETS,
                        "Iluminação",
                        1,
                        new BigDecimal("1.2"),
                        PowerUnit.KW,
                        LampTechnology.COMPACT_FLUORESCENT_LED,
                        null),
                    new LoadItem(
                        LoadCategory.INSTANT_HEATING,
                        "Aquecedor de passagem",
                        1,
                        new BigDecimal(loadKw).subtract(new BigDecimal("4.2")),
                        PowerUnit.KW,
                        null,
                        null)),
                null,
                null,
                null,
                null,
                12)));
    return project;
  }

  private static ResidentialMultifamily building() {
    return new ResidentialMultifamily(
        12, SupplyVoltage.V380_220, ConnectionType.THREE_PHASE, EntranceStandard.COLLECTIVE);
  }

  private static br.com.ampere.domain.ConsumerUnitGroup apartments(
      Project project, String name, int quantity, String area) {
    return GroupKind.RESIDENTIAL.create(
        project,
        new GroupSpec(
            name,
            quantity,
            new BigDecimal(area),
            2,
            new BigDecimal("6.5"),
            false,
            ConnectionType.SINGLE_PHASE,
            null,
            null,
            null,
            null,
            null,
            null));
  }

  private static GroupSpec spec(String name, int quantity, LoadUsage usage, List<LoadItem> items) {
    return new GroupSpec(
        name, quantity, null, null, null, null, null, usage, items, null, null, null, null);
  }

  private static String calculationOf(Project project) {
    return "/projects/" + project.getId() + "/calculations";
  }

  private String token(String email) throws Exception {
    String body =
        mockMvc
            .perform(
                post("/auth/login")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("{\"email\":\"" + email + "\",\"password\":\"" + PASSWORD + "\"}"))
            .andReturn()
            .getResponse()
            .getContentAsString();
    return objectMapper.readTree(body).path("data").path("token").asString();
  }
}
