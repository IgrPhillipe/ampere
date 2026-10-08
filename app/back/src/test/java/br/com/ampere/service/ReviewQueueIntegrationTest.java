package br.com.ampere.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.notNullValue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import br.com.ampere.config.NormativeTableSeed;
import br.com.ampere.domain.ConnectionType;
import br.com.ampere.domain.EntranceStandard;
import br.com.ampere.domain.EvStationType;
import br.com.ampere.domain.GroupKind;
import br.com.ampere.domain.GroupSpec;
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
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
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

/** US06: the analyst's queue, ordered by deadline, with the warnings of the latest calculation. */
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class ReviewQueueIntegrationTest {

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

  private List<Standard> standards;

  private OffsetDateTime now;

  private User applicant;

  @BeforeEach
  void seed() {
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
    normativeTableRepository.saveAll(
        NormativeTableSeed.all(
            standards.stream().collect(Collectors.toMap(Standard::getName, Function.identity()))));
    String hash = passwordEncoder.encode(PASSWORD);
    applicant =
        userRepository.save(new User("João Projetista", "user@ampere.com", hash, UserRole.USER));
    userRepository.save(new User("Admin", "admin@ampere.com", hash, UserRole.ADMIN));
    now = OffsetDateTime.now(ZoneOffset.UTC);
  }

  @Test
  void onlyTheAnalystSeesTheQueue() throws Exception {
    mockMvc
        .perform(get("/review-queue").header("Authorization", "Bearer " + token("user@ampere.com")))
        .andExpect(status().isForbidden());
    mockMvc
        .perform(
            get("/review-queue/indicators")
                .header("Authorization", "Bearer " + token("user@ampere.com")))
        .andExpect(status().isForbidden());
    mockMvc.perform(get("/review-queue")).andExpect(status().isUnauthorized());
  }

  @Test
  void ordersTheProjectsUnderReviewByDeadline() throws Exception {
    submitted("2026-4001", now.minusDays(10));
    submitted("2026-4002", now.minusDays(40));
    submitted("2026-4003", now.minusDays(30));
    projectRepository.save(project("2026-4004", ProjectStatus.UNDER_REVIEW));
    projectRepository.save(project("2026-4005", ProjectStatus.DRAFT));

    asAnalyst(get("/review-queue"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.data", hasSize(3)))
        .andExpect(jsonPath("$.pagination.total").value(3))
        .andExpect(jsonPath("$.data[0].protocol").value("2026-4002"))
        .andExpect(jsonPath("$.data[0].deadlineStatus").value("OVERDUE"))
        .andExpect(jsonPath("$.data[0].daysRemaining").value(-10))
        .andExpect(jsonPath("$.data[1].protocol").value("2026-4003"))
        .andExpect(jsonPath("$.data[1].deadlineStatus").value("DUE_TODAY"))
        .andExpect(jsonPath("$.data[1].daysRemaining").value(0))
        .andExpect(jsonPath("$.data[2].protocol").value("2026-4001"))
        .andExpect(jsonPath("$.data[2].deadlineStatus").value("ON_TIME"))
        .andExpect(jsonPath("$.data[2].daysRemaining").value(20))
        .andExpect(jsonPath("$.data[2].warnings").value(0));
  }

  @Test
  void ordersByDeadlineDescendingWhenRequested() throws Exception {
    submitted("2026-4001", now.minusDays(10));
    submitted("2026-4002", now.minusDays(40));
    submitted("2026-4003", now.minusDays(30));

    asAnalyst(get("/review-queue").param("sort", "deadline_desc"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.data", hasSize(3)))
        .andExpect(jsonPath("$.data[0].protocol").value("2026-4001"))
        .andExpect(jsonPath("$.data[1].protocol").value("2026-4003"))
        .andExpect(jsonPath("$.data[2].protocol").value("2026-4002"));
  }

  @Test
  void usesTheProjectIdAsAStableDeadlineTieBreaker() throws Exception {
    OffsetDateTime sharedSubmission = now.minusDays(5);
    submitted("2026-4302", sharedSubmission);
    submitted("2026-4301", sharedSubmission);

    asAnalyst(get("/review-queue").param("sort", "DEADLINE_ASC"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.data[0].protocol").value("2026-4302"))
        .andExpect(jsonPath("$.data[1].protocol").value("2026-4301"));
    asAnalyst(get("/review-queue").param("sort", "DEADLINE_DESC"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.data[0].protocol").value("2026-4302"))
        .andExpect(jsonPath("$.data[1].protocol").value("2026-4301"));
  }

  @Test
  void appliesPaginationAfterSearchFilterAndDeadlineSorting() throws Exception {
    submitted("2026-4401", now.minusDays(10));
    submitted("2026-4402", now.minusDays(40));
    submitted("2026-4403", now.minusDays(30));

    asAnalyst(
            get("/review-queue")
                .param("search", "joao")
                .param("filter", "DUE_SOON")
                .param("sort", "DEADLINE_DESC")
                .param("pageSize", "1")
                .param("page", "2"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.pagination.total").value(2))
        .andExpect(jsonPath("$.pagination.page").value(2))
        .andExpect(jsonPath("$.data", hasSize(1)))
        .andExpect(jsonPath("$.data[0].protocol").value("2026-4402"))
        .andExpect(jsonPath("$.data[0].deadlineStatus").value("OVERDUE"));
  }

  @Test
  void theDueSoonFilterKeepsOnlyOverdueAndDueToday() throws Exception {
    submitted("2026-4001", now.minusDays(10));
    submitted("2026-4002", now.minusDays(40));
    submitted("2026-4003", now.minusDays(30));

    asAnalyst(get("/review-queue").param("filter", "DUE_SOON"))
        .andExpect(jsonPath("$.data", hasSize(2)))
        .andExpect(jsonPath("$.pagination.total").value(2))
        .andExpect(jsonPath("$.data[0].deadlineStatus").value("OVERDUE"))
        .andExpect(jsonPath("$.data[1].deadlineStatus").value("DUE_TODAY"));

    asAnalyst(get("/review-queue").param("pageSize", "1").param("page", "2"))
        .andExpect(jsonPath("$.data", hasSize(1)))
        .andExpect(jsonPath("$.data[0].protocol").value("2026-4003"))
        .andExpect(jsonPath("$.pagination.total").value(3));
  }

  @Test
  void returnsApplicantUnitsDemandWarningsAndReviewCycle() throws Exception {
    Project project = projectRepository.save(project("2026-4001", ProjectStatus.DRAFT));
    addPrototypeGroups(project);
    mockMvc
        .perform(
            post("/projects/" + project.getId() + "/calculation")
                .header("Authorization", "Bearer " + token("user@ampere.com")))
        .andExpect(status().isCreated())
        .andExpect(jsonPath("$.data.warningsCount").value(1));
    project.submit(now.minusDays(5));

    asAnalyst(get("/review-queue"))
        .andExpect(jsonPath("$.data[0].protocol").value("2026-4001"))
        .andExpect(jsonPath("$.data[0].warnings").value(1))
        .andExpect(jsonPath("$.data[0].applicantName").value("João Projetista"))
        .andExpect(jsonPath("$.data[0].consumerUnitsCount").value(51))
        .andExpect(jsonPath("$.data[0].demandKva", notNullValue()))
        .andExpect(jsonPath("$.data[0].reanalysis").value(false));
  }

  @Test
  void searchesByProtocolApplicantAndMunicipalityWithoutAccents() throws Exception {
    Project jaboatao = project("2026-4101", ProjectStatus.DRAFT);
    jaboatao.rename("Condomínio Atlântico", "Rua A, 1", "Jaboatão dos Guararapes");
    jaboatao.submit(now.minusDays(5));
    projectRepository.save(jaboatao);
    submitted("2026-4102", now.minusDays(4));

    assertSingleSearchResult("4101", "2026-4101");
    asAnalyst(get("/review-queue").param("search", "joao"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.data", hasSize(2)))
        .andExpect(jsonPath("$.data[0].applicantName").value("João Projetista"));
    assertSingleSearchResult("jaboatao", "2026-4101");
  }

  @Test
  void filtersHighDemandAndReanalysisProjects() throws Exception {
    Project highDemand = projectRepository.save(project("2026-4201", ProjectStatus.DRAFT));
    addPrototypeGroups(highDemand);
    calculate(highDemand);
    highDemand.submit(now.minusDays(5));

    Project reanalysis = project("2026-4202", ProjectStatus.DRAFT);
    reanalysis.submit(now.minusDays(40));
    reanalysis.reject(now.minusDays(10));
    reanalysis.submit(now.minusDays(4));
    projectRepository.save(reanalysis);
    submitted("2026-4203", now.minusDays(3));

    asAnalyst(get("/review-queue").param("filter", "HIGH_DEMAND"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.data", hasSize(1)))
        .andExpect(jsonPath("$.data[0].protocol").value("2026-4201"));
    asAnalyst(get("/review-queue").param("filter", "REANALYSIS"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.data", hasSize(1)))
        .andExpect(jsonPath("$.data[0].protocol").value("2026-4202"))
        .andExpect(jsonPath("$.data[0].reanalysis").value(true));

    asAnalyst(get("/review-queue/indicators"))
        .andExpect(jsonPath("$.data.highDemand").value(1))
        .andExpect(jsonPath("$.data.reanalysis").value(1));
  }

  @Test
  void rejectsAnUnknownQueueFilter() throws Exception {
    asAnalyst(get("/review-queue").param("filter", "urgente"))
        .andExpect(status().isBadRequest())
        .andExpect(jsonPath("$.detail").value(org.hamcrest.Matchers.containsString("DUE_SOON")))
        .andExpect(jsonPath("$.detail").value(org.hamcrest.Matchers.containsString("REANALYSIS")));
  }

  @Test
  void rejectsAnUnknownQueueSort() throws Exception {
    asAnalyst(get("/review-queue").param("sort", "oldest_first"))
        .andExpect(status().isBadRequest())
        .andExpect(jsonPath("$.detail").value(org.hamcrest.Matchers.containsString("DEADLINE_ASC")))
        .andExpect(
            jsonPath("$.detail").value(org.hamcrest.Matchers.containsString("DEADLINE_DESC")));
  }

  @Test
  void projectCreationAssociatesTheAuthenticatedApplicant() throws Exception {
    mockMvc
        .perform(
            post("/projects")
                .header("Authorization", "Bearer " + token("user@ampere.com"))
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    """
                    {
                      "name": "Projeto autenticado",
                      "address": "Rua A, 1",
                      "municipality": "Recife",
                      "buildingType": "RESIDENTIAL_MULTIFAMILY",
                      "floors": 4,
                      "voltage": "V380_220",
                      "connectionType": "THREE_PHASE",
                      "entranceStandard": "COLLECTIVE"
                    }
                    """))
        .andExpect(status().isCreated());

    Project created =
        projectRepository.findAll().stream()
            .filter(project -> project.getName().equals("Projeto autenticado"))
            .findFirst()
            .orElseThrow();
    assertThat(created.getOwner().getEmail()).isEqualTo("user@ampere.com");
  }

  @Test
  void indicatorsCountTheQueueAndTheReviewsOfTheDayAndMonth() throws Exception {
    submitted("2026-4001", now.minusDays(10));
    submitted("2026-4002", now.minusDays(40));
    submitted("2026-4003", now.minusDays(30));
    reviewed("2026-4004", true, now);
    reviewed("2026-4005", false, now);
    reviewed("2026-4006", false, now);
    reviewed("2026-4007", false, now.minusDays(45));

    asAnalyst(get("/review-queue/indicators"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.data.total").value(3))
        .andExpect(jsonPath("$.data.dueSoon").value(2))
        .andExpect(jsonPath("$.data.highDemand").value(0))
        .andExpect(jsonPath("$.data.reanalysis").value(0))
        .andExpect(jsonPath("$.data.reviewedToday").value(3))
        .andExpect(jsonPath("$.data.monthlyRejectionPercent").value(33.3));
  }

  @Test
  void anEmptyMonthHasNoRejectionRate() throws Exception {
    asAnalyst(get("/review-queue/indicators"))
        .andExpect(jsonPath("$.data.total").value(0))
        .andExpect(jsonPath("$.data.reviewedToday").value(0))
        .andExpect(jsonPath("$.data.monthlyRejectionPercent").value(0));
  }

  private void submitted(String protocol, OffsetDateTime submittedAt) {
    Project project = project(protocol, ProjectStatus.DRAFT);
    project.submit(submittedAt);
    projectRepository.save(project);
  }

  private void reviewed(String protocol, boolean rejected, OffsetDateTime reviewedAt) {
    Project project = project(protocol, ProjectStatus.DRAFT);
    project.submit(reviewedAt.minusDays(5));
    if (rejected) {
      project.reject(reviewedAt);
    } else {
      project.approve(reviewedAt);
    }
    projectRepository.save(project);
  }

  private Project project(String protocol, ProjectStatus status) {
    return new Project(
        "Residencial " + protocol,
        "Rua A, 1",
        "Recife",
        protocol,
        status,
        new ResidentialMultifamily(
            12, SupplyVoltage.V380_220, ConnectionType.THREE_PHASE, EntranceStandard.COLLECTIVE),
        standards,
        applicant);
  }

  private void addPrototypeGroups(Project project) {
    groupRepository.saveAll(
        List.of(
            apartments(project, "Apartamento tipo A", 24, "68"),
            apartments(project, "Apartamento tipo B", 20, "92"),
            GroupKind.LOAD.create(
                project,
                new GroupSpec(
                    "Área comum",
                    1,
                    null,
                    null,
                    null,
                    null,
                    LoadUsage.COMMON_AREA,
                    List.of(
                        new LoadItem(
                            LoadCategory.MOTORS,
                            "Elevador",
                            1,
                            new BigDecimal("12"),
                            PowerUnit.CV,
                            null,
                            false)),
                    null,
                    null,
                    null,
                    null)),
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
                    true,
                    EvStationType.COLLECTIVE))));
  }

  private void calculate(Project project) throws Exception {
    mockMvc
        .perform(
            post("/projects/" + project.getId() + "/calculation")
                .header("Authorization", "Bearer " + token("user@ampere.com")))
        .andExpect(status().isCreated());
  }

  private void assertSingleSearchResult(String search, String protocol) throws Exception {
    asAnalyst(get("/review-queue").param("search", search))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.data", hasSize(1)))
        .andExpect(jsonPath("$.data[0].protocol").value(protocol));
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

  private org.springframework.test.web.servlet.ResultActions asAnalyst(
      org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder request)
      throws Exception {
    return mockMvc.perform(request.header("Authorization", "Bearer " + token("admin@ampere.com")));
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
