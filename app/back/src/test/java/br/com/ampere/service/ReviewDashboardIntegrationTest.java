package br.com.ampere.service;

import static org.hamcrest.Matchers.contains;
import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import br.com.ampere.domain.BrazilianState;
import br.com.ampere.domain.BuildingType;
import br.com.ampere.domain.Calculation;
import br.com.ampere.domain.CalculationCheck;
import br.com.ampere.domain.CheckStatus;
import br.com.ampere.domain.ConnectionType;
import br.com.ampere.domain.DashboardPeriod;
import br.com.ampere.domain.DemandComponent;
import br.com.ampere.domain.DemandResult;
import br.com.ampere.domain.DemandStep;
import br.com.ampere.domain.EntranceStandard;
import br.com.ampere.domain.Finding;
import br.com.ampere.domain.FindingSeverity;
import br.com.ampere.domain.FindingStage;
import br.com.ampere.domain.NonResidential;
import br.com.ampere.domain.Project;
import br.com.ampere.domain.ProjectEvent;
import br.com.ampere.domain.ProjectEventType;
import br.com.ampere.domain.ProjectStatus;
import br.com.ampere.domain.ProjectVersion;
import br.com.ampere.domain.ProjectVersionMemorial;
import br.com.ampere.domain.ResidentialMultifamily;
import br.com.ampere.domain.Standard;
import br.com.ampere.domain.SupplyVoltage;
import br.com.ampere.domain.User;
import br.com.ampere.domain.UserRole;
import br.com.ampere.repository.ApprovalMemorialRepository;
import br.com.ampere.repository.CalculationRepository;
import br.com.ampere.repository.FindingRepository;
import br.com.ampere.repository.ProjectEventRepository;
import br.com.ampere.repository.ProjectRepository;
import br.com.ampere.repository.ProjectVersionRepository;
import br.com.ampere.repository.StandardRepository;
import br.com.ampere.repository.UserRepository;
import br.com.ampere.utils.Timestamps;
import jakarta.persistence.EntityManager;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.YearMonth;
import java.time.ZoneOffset;
import java.time.temporal.ChronoUnit;
import java.time.temporal.TemporalAdjusters;
import java.util.Arrays;
import java.util.List;
import java.util.stream.IntStream;
import java.util.stream.Stream;
import org.hamcrest.Description;
import org.hamcrest.Matcher;
import org.hamcrest.TypeSafeMatcher;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.test.web.servlet.request.AbstractMockHttpServletRequestBuilder;
import org.springframework.transaction.annotation.Transactional;
import tools.jackson.databind.ObjectMapper;

/** US17: the review indicators, scoped to the analyst's projects or to the whole team. */
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class ReviewDashboardIntegrationTest {

  private static final String PASSWORD = "senha@123";

  private static final String DESIGNER = "user@ampere.com";

  private static final String REVIEWER = "revisor@ampere.com";

  private static final String OTHER_REVIEWER = "analista@ampere.com";

  private static final String ADMIN = "admin@ampere.com";

  @Autowired private MockMvc mockMvc;

  @Autowired private ObjectMapper objectMapper;

  @Autowired private PasswordEncoder passwordEncoder;

  @Autowired private UserRepository userRepository;

  @Autowired private StandardRepository standardRepository;

  @Autowired private ProjectRepository projectRepository;

  @Autowired private ProjectEventRepository eventRepository;

  @Autowired private FindingRepository findingRepository;

  @Autowired private CalculationRepository calculationRepository;

  @Autowired private ProjectVersionRepository versionRepository;

  @Autowired private ApprovalMemorialRepository approvalMemorialRepository;

  @Autowired private EntityManager entityManager;

  private List<Standard> standards;

  private OffsetDateTime now;

  private User owner;

  private User reviewer;

  private User otherReviewer;

  private int sequence;

  @BeforeEach
  void seed() {
    eventRepository.deleteAll();
    approvalMemorialRepository.deleteAll();
    versionRepository.deleteAll();
    calculationRepository.deleteAll();
    findingRepository.deleteAll();
    projectRepository.deleteAll();
    standardRepository.deleteAll();
    userRepository.deleteAll();

    standards = standardRepository.saveAll(List.of(new Standard("DIS-NOR-030", "REV 07")));
    String hash = passwordEncoder.encode(PASSWORD);
    owner = userRepository.save(new User("João Projetista", DESIGNER, hash, UserRole.USER));
    reviewer = userRepository.save(new User("Revisor Teste", REVIEWER, hash, UserRole.REVIEWER));
    otherReviewer =
        userRepository.save(new User("Ana Analista", OTHER_REVIEWER, hash, UserRole.REVIEWER));
    userRepository.save(new User("Admin Teste", ADMIN, hash, UserRole.ADMIN));
    now = OffsetDateTime.now(ZoneOffset.UTC);
  }

  @Test
  void onlyTheAnalystAndTheAdminReachTheIndicators() throws Exception {
    as(DESIGNER, get("/dashboard/review")).andExpect(status().isForbidden());
    as(REVIEWER, get("/dashboard/review")).andExpect(status().isOk());
    as(ADMIN, get("/dashboard/review")).andExpect(status().isOk());
  }

  @Test
  void refusesAnUnknownPeriod() throws Exception {
    as(REVIEWER, get("/dashboard/review").param("period", "LAST_WEEK"))
        .andExpect(status().isBadRequest());
  }

  @Test
  void withoutHistoryEveryIndicatorIsEmptyButTheTimeline() throws Exception {
    LocalDate today = LocalDate.now(Timestamps.ZONE);
    LocalDate firstDay = DashboardPeriod.LAST_30_DAYS.since(today);
    long weeks = ChronoUnit.WEEKS.between(monday(firstDay), monday(today)) + 1;

    as(REVIEWER, get("/dashboard/review"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.data.totals.received").value(0))
        .andExpect(jsonPath("$.data.totals.underReview").value(0))
        .andExpect(jsonPath("$.data.averageReviewDays").isEmpty())
        .andExpect(jsonPath("$.data.averageCycleDays").isEmpty())
        .andExpect(jsonPath("$.data.weekly", hasSize((int) weeks)))
        .andExpect(jsonPath("$.data.weekly[0].weekStart").value(monday(firstDay).toString()))
        .andExpect(jsonPath("$.data.weekly[-1].weekStart").value(monday(today).toString()))
        .andExpect(
            jsonPath("$.data.monthlyRejection[0].month").value(YearMonth.from(firstDay).toString()))
        .andExpect(jsonPath("$.data.monthlyRejection[0].rejectionPercent").isEmpty())
        .andExpect(jsonPath("$.data.deadlines.met").value(0))
        .andExpect(jsonPath("$.data.findingsRanking", hasSize(0)))
        .andExpect(jsonPath("$.data.municipalities", hasSize(0)))
        .andExpect(jsonPath("$.data.repeatedRejections", hasSize(0)))
        .andExpect(jsonPath("$.data.alertsByCategory", hasSize(0)));
  }

  @Test
  void theAnalystCountsOnlyTheProjectsAssignedToThem() throws Exception {
    underReview("2026-7001", reviewer, 5);
    underReview("2026-7002", reviewer, 6);
    underReview("2026-7003", otherReviewer, 7);
    underReview("2026-7004", null, 8);

    as(REVIEWER, get("/dashboard/review"))
        .andExpect(jsonPath("$.data.totals.received").value(2))
        .andExpect(jsonPath("$.data.totals.underReview").value(2));
    as(ADMIN, get("/dashboard/review"))
        .andExpect(jsonPath("$.data.totals.received").value(4))
        .andExpect(jsonPath("$.data.totals.underReview").value(4))
        .andExpect(jsonPath("$.data.workload").doesNotExist());
  }

  @Test
  void eachPeriodCountsItsOwnDecisionsTimesAndDeadlines() throws Exception {
    Project old = decided("2026-7101", reviewer, ProjectStatus.REJECTED, 50, 45);
    decided("2026-7102", reviewer, ProjectStatus.APPROVED, 20, 10);
    // Decided 40 days after the submission: past the deadline.
    decided("2026-7103", reviewer, ProjectStatus.APPROVED, 60, 20);
    event(old, ProjectEventType.RESUBMITTED, 2, now.minusDays(40));

    as(REVIEWER, get("/dashboard/review"))
        .andExpect(jsonPath("$.data.totals.received").value(1))
        .andExpect(jsonPath("$.data.totals.approved").value(2))
        .andExpect(jsonPath("$.data.totals.rejected").value(0))
        .andExpect(jsonPath("$.data.totals.underReview").value(0))
        .andExpect(jsonPath("$.data.averageReviewDays").value(25.0))
        .andExpect(jsonPath("$.data.averageCycleDays").value(25.0))
        .andExpect(jsonPath("$.data.deadlines.met").value(1))
        .andExpect(jsonPath("$.data.deadlines.overdue").value(1));
    as(REVIEWER, get("/dashboard/review").param("period", "LAST_90_DAYS"))
        .andExpect(jsonPath("$.data.totals.received").value(3))
        .andExpect(jsonPath("$.data.totals.approved").value(2))
        .andExpect(jsonPath("$.data.totals.rejected").value(1))
        .andExpect(jsonPath("$.data.averageReviewDays").value(18.3))
        .andExpect(jsonPath("$.data.deadlines.met").value(2))
        .andExpect(jsonPath("$.data.deadlines.overdue").value(1))
        .andExpect(jsonPath("$.data.weekly[*].received").value(sumsTo(4)))
        .andExpect(jsonPath("$.data.weekly[*].decided").value(sumsTo(3)));
  }

  @Test
  void theRankingListsTheProjectsInScopeBehindEachFinding() throws Exception {
    Project second = underReview("2026-7202", reviewer, 5);
    Project first = underReview("2026-7201", reviewer, 5);
    Project others = underReview("2026-7203", otherReviewer, 5);
    finding(second, "6.2", now.minusDays(3), true);
    finding(second, "6.2", now.minusDays(3), true);
    finding(first, "6.2", now.minusDays(3), true);
    finding(second, null, now.minusDays(3), true);
    finding(first, "6.2", now.minusDays(3), false);
    finding(first, "6.2", now.minusDays(100), true);
    finding(others, "6.2", now.minusDays(3), true);

    as(REVIEWER, get("/dashboard/review"))
        .andExpect(jsonPath("$.data.findingsRanking", hasSize(2)))
        .andExpect(jsonPath("$.data.findingsRanking[0].stage").value("CALCULATION"))
        .andExpect(jsonPath("$.data.findingsRanking[0].standardItem").value("6.2"))
        .andExpect(jsonPath("$.data.findingsRanking[0].total").value(3))
        .andExpect(
            jsonPath("$.data.findingsRanking[0].projects[*].protocol")
                .value(contains("2026-7201", "2026-7202")))
        .andExpect(
            jsonPath("$.data.findingsRanking[0].projects[0].id")
                .value(String.valueOf(first.getId())))
        .andExpect(jsonPath("$.data.findingsRanking[1].standardItem").isEmpty())
        .andExpect(
            jsonPath("$.data.findingsRanking[1].projects[*].protocol")
                .value(contains("2026-7202")));
    as(ADMIN, get("/dashboard/review"))
        .andExpect(jsonPath("$.data.findingsRanking[0].total").value(4))
        .andExpect(
            jsonPath("$.data.findingsRanking[0].projects[*].protocol")
                .value(contains("2026-7201", "2026-7202", "2026-7203")));
  }

  @Test
  void theFiveMunicipalitiesWithMoreReceivedProjectsTieByName() throws Exception {
    Stream.of("Recife", "Recife", "Recife", "Olinda", "Paulista", "Caruaru", "Jaboatão")
        .forEach(municipality -> located(municipality, BrazilianState.PE));
    located("João Pessoa", BrazilianState.PB);

    as(ADMIN, get("/dashboard/review"))
        .andExpect(
            jsonPath("$.data.municipalities[*].municipality")
                .value(contains("Recife", "Caruaru", "Jaboatão", "João Pessoa", "Olinda")))
        .andExpect(jsonPath("$.data.municipalities[0].total").value(3))
        .andExpect(jsonPath("$.data.municipalities[3].state").value("PB"));
  }

  @Test
  void repeatedRejectionsNeedTheLastOneInThePeriod() throws Exception {
    Project twice = rejectedTwice("2026-7301", 20, 5);
    rejectedTwice("2026-7302", 80, 60);
    decided("2026-7303", reviewer, ProjectStatus.REJECTED, 10, 5);
    Project thrice = rejectedTwice("2026-7304", 25, 15);
    event(thrice, ProjectEventType.RESUBMITTED, 3, now.minusDays(12));
    event(thrice, ProjectEventType.REJECTED, 3, now.minusDays(4));

    as(REVIEWER, get("/dashboard/review"))
        .andExpect(
            jsonPath("$.data.repeatedRejections[*].protocol")
                .value(contains("2026-7304", "2026-7301")))
        .andExpect(jsonPath("$.data.repeatedRejections[*].rejections").value(contains(3, 2)))
        .andExpect(
            jsonPath("$.data.repeatedRejections[1].id").value(String.valueOf(twice.getId())));
  }

  @Test
  void theAlertsComeFromTheLastVersionSubmittedInThePeriod() throws Exception {
    Project residential = underReview("2026-7401", reviewer, 20);
    version(residential, 1, now.minusDays(20), 1);
    residential.reject(now.minusDays(15));
    event(residential, ProjectEventType.REJECTED, 1, now.minusDays(15));
    residential.submit(now.minusDays(5));
    event(residential, ProjectEventType.RESUBMITTED, 2, now.minusDays(5));
    version(residential, 2, now.minusDays(5), 3);
    Project withoutVersion = underReview("2026-7402", reviewer, 3);
    Project nonResidential =
        underReview(
            "2026-7403",
            reviewer,
            4,
            new NonResidential(
                2,
                SupplyVoltage.V380_220,
                ConnectionType.THREE_PHASE,
                EntranceStandard.INDIVIDUAL));
    version(nonResidential, 1, now.minusDays(4), 2);
    projectRepository.saveAll(List.of(residential, withoutVersion, nonResidential));

    as(REVIEWER, get("/dashboard/review"))
        .andExpect(
            jsonPath("$.data.alertsByCategory[*].category")
                .value(contains("RESIDENTIAL_MULTIFAMILY", "NON_RESIDENTIAL")))
        .andExpect(jsonPath("$.data.alertsByCategory[0].projects").value(2))
        .andExpect(jsonPath("$.data.alertsByCategory[0].alerts").value(3))
        .andExpect(jsonPath("$.data.alertsByCategory[1].projects").value(1))
        .andExpect(jsonPath("$.data.alertsByCategory[1].alerts").value(2));
  }

  private Project underReview(String protocol, User analyst, int daysAgo) {
    return underReview(
        protocol,
        analyst,
        daysAgo,
        new ResidentialMultifamily(
            12, SupplyVoltage.V380_220, ConnectionType.THREE_PHASE, EntranceStandard.COLLECTIVE));
  }

  private Project underReview(
      String protocol, User analyst, int daysAgo, BuildingType buildingType) {
    Project project =
        new Project(
            "Residencial " + protocol,
            "Rua A, 1",
            "Recife",
            protocol,
            ProjectStatus.DRAFT,
            buildingType,
            standards,
            owner);
    project.submit(now.minusDays(daysAgo));
    if (analyst != null) {
      project.assignReviewer(analyst);
    }
    projectRepository.save(project);
    event(project, ProjectEventType.SUBMITTED, 1, now.minusDays(daysAgo));
    return project;
  }

  private Project decided(
      String protocol, User analyst, ProjectStatus outcome, int submittedDaysAgo, int daysAgo) {
    Project project = underReview(protocol, analyst, submittedDaysAgo);
    OffsetDateTime decidedAt = now.minusDays(daysAgo);
    if (outcome == ProjectStatus.APPROVED) {
      project.approve(decidedAt);
      event(project, ProjectEventType.APPROVED, 1, decidedAt);
    } else {
      project.reject(decidedAt);
      event(project, ProjectEventType.REJECTED, 1, decidedAt);
    }
    return projectRepository.save(project);
  }

  private Project rejectedTwice(String protocol, int firstDaysAgo, int lastDaysAgo) {
    Project project =
        decided(protocol, reviewer, ProjectStatus.REJECTED, firstDaysAgo + 2, firstDaysAgo);
    event(project, ProjectEventType.RESUBMITTED, 2, now.minusDays(lastDaysAgo + 2));
    event(project, ProjectEventType.REJECTED, 2, now.minusDays(lastDaysAgo));
    return project;
  }

  private void located(String municipality, BrazilianState state) {
    Project project = underReview(String.format("2026-75%02d", ++sequence), null, 3);
    project.rename(project.getName(), project.getAddress(), municipality);
    project.locate(null, state);
    projectRepository.save(project);
  }

  private void event(Project project, ProjectEventType type, int version, OffsetDateTime at) {
    eventRepository.save(
        new ProjectEvent(project, type, version, null, null, type.name(), null, at));
  }

  private void finding(Project project, String standardItem, OffsetDateTime at, boolean published) {
    Finding finding =
        new Finding(
            project,
            FindingSeverity.BLOCKING,
            FindingStage.CALCULATION,
            null,
            null,
            null,
            "Corrigir",
            standardItem,
            reviewer,
            1);
    if (published) {
      finding.publish();
    }
    findingRepository.saveAndFlush(finding);
    entityManager
        .createNativeQuery("UPDATE finding SET created_at = :at WHERE id = :id")
        .setParameter("at", at)
        .setParameter("id", finding.getId())
        .executeUpdate();
  }

  private void version(Project project, int number, OffsetDateTime submittedAt, int warnings) {
    Calculation calculation =
        calculationRepository.save(new Calculation(project, demand(warnings), "{}"));
    int code = ++sequence;
    versionRepository.save(
        new ProjectVersion(
            project,
            number,
            submittedAt,
            owner,
            null,
            calculation,
            new ProjectVersionMemorial(
                "memorial.pdf", "%PDF-1.4\n%%EOF".getBytes(StandardCharsets.US_ASCII)),
            String.format("%064d", code),
            String.format("TEST-0000-0000-%04d", code)));
  }

  private static DemandResult demand(int warnings) {
    List<DemandStep> steps =
        Stream.concat(
                Arrays.stream(DemandComponent.values())
                    .map(
                        component ->
                            new DemandStep(
                                component.symbol(),
                                component.title(),
                                false,
                                "",
                                List.of(),
                                BigDecimal.ZERO,
                                null,
                                List.of(),
                                null)),
                Stream.of(
                    new DemandStep(
                        "Ded",
                        "Demanda Total da Edificação",
                        true,
                        "",
                        List.of(),
                        BigDecimal.TEN,
                        null,
                        List.of(),
                        null)))
            .toList();
    List<CalculationCheck> checks =
        Stream.concat(
                IntStream.range(0, warnings)
                    .mapToObj(
                        index -> new CalculationCheck("W" + index, CheckStatus.WARNING, "Alerta")),
                Stream.of(new CalculationCheck("OK", CheckStatus.PASSED, "Conferido")))
            .toList();
    return new DemandResult(
        steps,
        BigDecimal.TEN,
        BigDecimal.TEN,
        BigDecimal.TEN,
        false,
        null,
        new BigDecimal("50.00"),
        checks,
        List.of());
  }

  private static LocalDate monday(LocalDate date) {
    return date.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
  }

  private static Matcher<Iterable<? extends Integer>> sumsTo(int total) {
    return new TypeSafeMatcher<>() {
      @Override
      protected boolean matchesSafely(Iterable<? extends Integer> values) {
        int sum = 0;
        for (Integer value : values) {
          sum += value;
        }
        return sum == total;
      }

      @Override
      public void describeTo(Description description) {
        description.appendText("values summing to " + total);
      }
    };
  }

  private ResultActions as(String email, AbstractMockHttpServletRequestBuilder<?> request)
      throws Exception {
    return mockMvc.perform(request.header("Authorization", "Bearer " + token(email)));
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
