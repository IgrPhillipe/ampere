package br.com.ampere.service;

import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.startsWith;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import br.com.ampere.config.NormativeTableSeed;
import br.com.ampere.domain.ConnectionType;
import br.com.ampere.domain.EntranceStandard;
import br.com.ampere.domain.GroupKind;
import br.com.ampere.domain.GroupSpec;
import br.com.ampere.domain.LampTechnology;
import br.com.ampere.domain.LoadCategory;
import br.com.ampere.domain.LoadItem;
import br.com.ampere.domain.LoadUsage;
import br.com.ampere.domain.PowerUnit;
import br.com.ampere.domain.Project;
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
import br.com.ampere.repository.ProjectRepository;
import br.com.ampere.repository.StandardRepository;
import br.com.ampere.repository.UserRepository;
import java.math.BigDecimal;
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

  private String token;

  private List<Standard> standards;

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
    userRepository.save(
        new User(
            "Usuário Teste", "user@ampere.local", passwordEncoder.encode(PASSWORD), UserRole.USER));
    token = token("user@ampere.local");
  }

  @Test
  void calculatesThePrototypeProjectAndKeepsTheRecord() throws Exception {
    publishTables();
    Project project = draftWithPrototypeGroups(true);

    mockMvc
        .perform(post(calculationOf(project)).header("Authorization", "Bearer " + token))
        .andExpect(status().isCreated())
        .andExpect(jsonPath("$.data.projectId").value(String.valueOf(project.getId())))
        .andExpect(jsonPath("$.data.steps", hasSize(5)))
        .andExpect(jsonPath("$.data.steps[0].code").value("Drf"))
        .andExpect(
            jsonPath("$.data.steps[0].formula")
                .value("(24 × 1,57 + 20 × 2,06 + 4 × 2,91) × 0,7129 × 1,2"))
        .andExpect(jsonPath("$.data.steps[0].valueKva").value(77.44))
        .andExpect(jsonPath("$.data.steps[0].reference.label").value("Quadro 35 (053)"))
        .andExpect(jsonPath("$.data.steps[2].applies").value(false))
        .andExpect(jsonPath("$.data.steps[2].reference").doesNotExist())
        .andExpect(jsonPath("$.data.steps[4].code").value("Ded"))
        .andExpect(jsonPath("$.data.totals.calculatedKva").value(163.07))
        .andExpect(jsonPath("$.data.totals.finalKva").value(165.00))
        .andExpect(jsonPath("$.data.totals.minimumApplied").value(true))
        .andExpect(jsonPath("$.data.traceability.voltage").value("380/220 V"))
        .andExpect(jsonPath("$.data.traceability.breakerAmps").value(250))
        .andExpect(jsonPath("$.data.traceability.breakerPoles").value("tripolar"))
        .andExpect(jsonPath("$.data.traceability.cableSectionMm2").value(150))
        .andExpect(jsonPath("$.data.composition", hasSize(4)))
        .andExpect(jsonPath("$.data.composition[0].percent").value(47.5))
        .andExpect(jsonPath("$.data.checksCount").value(5))
        .andExpect(jsonPath("$.data.warningsCount").value(1))
        .andExpect(jsonPath("$.data.standards.main.revision").value("REV 06"))
        .andExpect(jsonPath("$.data.standards.secondary.revision").value("REV 07"));

    mockMvc
        .perform(get(calculationOf(project)).header("Authorization", "Bearer " + token))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.data.totals.finalKva").value(165.00))
        .andExpect(jsonPath("$.data.appliedTables[0].identification").value("Quadro 35"));

    mockMvc
        .perform(get("/projects").header("Authorization", "Bearer " + token))
        .andExpect(jsonPath("$.data[0].consumerUnitsCount").value(55))
        .andExpect(jsonPath("$.data[0].demandKva").value(165.00));
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
  void namesTheTableThatIsNotPublished() throws Exception {
    Project project = draftWithPrototypeGroups(true);

    mockMvc
        .perform(post(calculationOf(project)).header("Authorization", "Bearer " + token))
        .andExpect(status().isUnprocessableContent())
        .andExpect(
            jsonPath("$.detail", startsWith("O Quadro 35 da DIS-NOR-053 não está publicado")));
  }

  @Test
  void answersNotFoundBeforeTheFirstCalculation() throws Exception {
    Project project = draftWithPrototypeGroups(true);

    mockMvc
        .perform(get(calculationOf(project)).header("Authorization", "Bearer " + token))
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
                standards));

    mockMvc
        .perform(post(calculationOf(project)).header("Authorization", "Bearer " + token))
        .andExpect(status().isConflict());
  }

  private void publishTables() {
    normativeTableRepository.saveAll(
        NormativeTableSeed.all(
            standards.stream().collect(Collectors.toMap(Standard::getName, Function.identity()))));
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
                standards));
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
                    new BigDecimal("7.40"),
                    false,
                    fixed ? true : null,
                    br.com.ampere.domain.EvStationType.COLLECTIVE))));
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
            null,
            null,
            null,
            null,
            null,
            null));
  }

  private static GroupSpec spec(String name, int quantity, LoadUsage usage, List<LoadItem> items) {
    return new GroupSpec(
        name, quantity, null, null, null, null, usage, items, null, null, null, null);
  }

  private static String calculationOf(Project project) {
    return "/projects/" + project.getId() + "/calculation";
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
