package br.com.ampere.service;

import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import br.com.ampere.domain.Calculation;
import br.com.ampere.domain.ConnectionType;
import br.com.ampere.domain.DashboardPeriod;
import br.com.ampere.domain.DemandComponent;
import br.com.ampere.domain.DemandResult;
import br.com.ampere.domain.DemandStep;
import br.com.ampere.domain.EntranceStandard;
import br.com.ampere.domain.Finding;
import br.com.ampere.domain.FindingAnswer;
import br.com.ampere.domain.FindingSeverity;
import br.com.ampere.domain.FindingStage;
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
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Stream;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.transaction.annotation.Transactional;
import tools.jackson.databind.ObjectMapper;

/** US16: the designer's dashboard. */
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class DesignerDashboardIntegrationTest {

  private static final String PASSWORD = "senha@123";

  private static final String DESIGNER = "user@ampere.com";

  private static final String OTHER_DESIGNER = "outro@ampere.com";

  @Autowired private MockMvc mockMvc;

  @Autowired private ObjectMapper objectMapper;

  @Autowired private PasswordEncoder passwordEncoder;

  @Autowired private UserRepository userRepository;

  @Autowired private StandardRepository standardRepository;

  @Autowired private NormativeTableRepository normativeTableRepository;

  @Autowired private ProjectRepository projectRepository;

  @Autowired private ProjectEventRepository eventRepository;

  @Autowired private FindingRepository findingRepository;

  @Autowired private ConsumerUnitGroupRepository groupRepository;

  @Autowired private CalculationRepository calculationRepository;

  @Autowired private EntityManager entityManager;

  private List<Standard> standards;

  private OffsetDateTime now;

  private User owner;

  private User otherOwner;

  private User reviewer;

  @BeforeEach
  void seed() {
    eventRepository.deleteAll();
    calculationRepository.deleteAll();
    findingRepository.deleteAll();
    groupRepository.deleteAll();
    projectRepository.deleteAll();
    normativeTableRepository.deleteAll();
    standardRepository.deleteAll();
    userRepository.deleteAll();

    standards = standardRepository.saveAll(List.of(new Standard("DIS-NOR-053", "REV 06")));
    String hash = passwordEncoder.encode(PASSWORD);
    owner = userRepository.save(new User("João Projetista", DESIGNER, hash, UserRole.USER));
    otherOwner =
        userRepository.save(new User("Maria Projetista", OTHER_DESIGNER, hash, UserRole.USER));
    reviewer =
        userRepository.save(
            new User("Revisor Teste", "revisor@ampere.com", hash, UserRole.REVIEWER));
    userRepository.save(new User("Admin Teste", "admin@ampere.com", hash, UserRole.ADMIN));
    now = OffsetDateTime.now(ZoneOffset.UTC);
  }

  @Test
  void onlyTheDesignerSeesTheDashboard() throws Exception {
    as(DESIGNER, get("/dashboard/designer")).andExpect(status().isOk());
    as("revisor@ampere.com", get("/dashboard/designer")).andExpect(status().isForbidden());
    as("admin@ampere.com", get("/dashboard/designer")).andExpect(status().isForbidden());
    mockMvc.perform(get("/dashboard/designer")).andExpect(status().isUnauthorized());
  }

  @Test
  void refusesAnUnknownPeriod() throws Exception {
    as(DESIGNER, get("/dashboard/designer").param("period", "LAST_YEAR"))
        .andExpect(status().isBadRequest());
  }

  @Test
  void everyRejectedProjectRequiresActionWithItsOpenBlockingFindings() throws Exception {
    Project rejected = rejected("2026-5001", owner);
    finding(rejected, FindingSeverity.BLOCKING, FindingStage.CALCULATION, "6.2", now);
    finding(rejected, FindingSeverity.BLOCKING, FindingStage.DOCUMENTS, null, now);
    finding(rejected, FindingSeverity.ADJUSTMENT, FindingStage.DOCUMENTS, null, now);
    answered(finding(rejected, FindingSeverity.BLOCKING, FindingStage.DOCUMENTS, null, now));
    Project onlyAdjustments = rejected("2026-5002", owner);
    finding(onlyAdjustments, FindingSeverity.ADJUSTMENT, FindingStage.CALCULATION, "6.2", now);

    designerDashboard()
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.data.actionRequired", hasSize(2)))
        .andExpect(jsonPath("$.data.actionRequired[0].id").value(rejected.getId().toString()))
        .andExpect(jsonPath("$.data.actionRequired[0].name").value("Residencial 2026-5001"))
        .andExpect(jsonPath("$.data.actionRequired[0].protocol").value("2026-5001"))
        .andExpect(jsonPath("$.data.actionRequired[0].status").value("REJECTED"))
        .andExpect(jsonPath("$.data.actionRequired[0].blockingFindings").value(2))
        .andExpect(jsonPath("$.data.actionRequired[0].idleDays").isEmpty())
        .andExpect(jsonPath("$.data.actionRequired[1].protocol").value("2026-5002"))
        .andExpect(jsonPath("$.data.actionRequired[1].status").value("REJECTED"))
        .andExpect(jsonPath("$.data.actionRequired[1].blockingFindings").value(0))
        .andExpect(jsonPath("$.data.actionRequired[1].idleDays").isEmpty());
  }

  @Test
  void idleDraftsFollowTheRejectedProjectsFromTheLongestIdle() throws Exception {
    Project rejected = rejected("2026-5101", owner);
    finding(rejected, FindingSeverity.BLOCKING, FindingStage.PROJECT_DATA, null, now);
    Project idle = projectRepository.save(project("2026-5102", ProjectStatus.DRAFT, owner));
    Project idlest = projectRepository.save(project("2026-5103", ProjectStatus.DRAFT, owner));
    Project recent = projectRepository.save(project("2026-5104", ProjectStatus.DRAFT, owner));
    Project awaiting =
        projectRepository.save(project("2026-5105", ProjectStatus.AWAITING_SUBMISSION, owner));
    lastChanged(idle, now.minusDays(20));
    lastChanged(idlest, now.minusDays(40));
    lastChanged(recent, now.minusDays(15));
    lastChanged(awaiting, now.minusDays(40));
    entityManager.clear();

    designerDashboard()
        .andExpect(jsonPath("$.data.actionRequired", hasSize(3)))
        .andExpect(jsonPath("$.data.actionRequired[0].protocol").value("2026-5101"))
        .andExpect(jsonPath("$.data.actionRequired[1].protocol").value("2026-5103"))
        .andExpect(jsonPath("$.data.actionRequired[1].status").value("DRAFT"))
        .andExpect(jsonPath("$.data.actionRequired[1].blockingFindings").value(0))
        .andExpect(jsonPath("$.data.actionRequired[1].idleDays").value(40))
        .andExpect(jsonPath("$.data.actionRequired[2].protocol").value("2026-5102"))
        .andExpect(jsonPath("$.data.actionRequired[2].idleDays").value(20));
  }

  @Test
  void listsTheProjectsUnderReviewFromTheShortestDeadline() throws Exception {
    submitted("2026-5201", now.minusDays(10), owner);
    submitted("2026-5202", now.minusDays(40), owner);
    LocalDate today = LocalDate.now(Timestamps.ZONE);

    designerDashboard()
        .andExpect(jsonPath("$.data.hasSubmissions").value(true))
        .andExpect(jsonPath("$.data.underReview", hasSize(2)))
        .andExpect(jsonPath("$.data.underReview[0].protocol").value("2026-5202"))
        .andExpect(jsonPath("$.data.underReview[0].deadline").value(today.minusDays(10).toString()))
        .andExpect(jsonPath("$.data.underReview[0].daysRemaining").value(-10))
        .andExpect(jsonPath("$.data.underReview[1].protocol").value("2026-5201"))
        .andExpect(jsonPath("$.data.underReview[1].daysRemaining").value(20));
  }

  @Test
  void aDesignerWithoutSubmissionsHasEmptyIndicators() throws Exception {
    projectRepository.save(project("2026-5301", ProjectStatus.DRAFT, owner));

    designerDashboard()
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.data.hasSubmissions").value(false))
        .andExpect(jsonPath("$.data.actionRequired", hasSize(0)))
        .andExpect(jsonPath("$.data.underReview", hasSize(0)))
        .andExpect(jsonPath("$.data.indicators.submitted").value(0))
        .andExpect(jsonPath("$.data.indicators.firstReviewApprovalPercent").isEmpty())
        .andExpect(jsonPath("$.data.indicators.averageDaysToApproval").isEmpty())
        .andExpect(jsonPath("$.data.indicators.approvedDemand").value(0))
        .andExpect(jsonPath("$.data.findingsRanking", hasSize(0)));
  }

  @Test
  void aResubmissionIsNotAFirstReviewApproval() throws Exception {
    Project resubmitted = approved("2026-5401", owner, new BigDecimal("100.50"));
    event(resubmitted, ProjectEventType.SUBMITTED, now.minusDays(20));
    event(resubmitted, ProjectEventType.REJECTED, now.minusDays(15));
    event(resubmitted, ProjectEventType.RESUBMITTED, now.minusDays(10));
    event(resubmitted, ProjectEventType.APPROVED, now.minusDays(5));
    Project firstTime = approved("2026-5402", owner, new BigDecimal("50.25"));
    event(firstTime, ProjectEventType.SUBMITTED, now.minusDays(12));
    event(firstTime, ProjectEventType.APPROVED, now.minusDays(2));

    designerDashboard()
        .andExpect(jsonPath("$.data.hasSubmissions").value(true))
        .andExpect(jsonPath("$.data.indicators.submitted").value(2))
        .andExpect(jsonPath("$.data.indicators.firstReviewApprovalPercent").value(50.0))
        .andExpect(jsonPath("$.data.indicators.averageDaysToApproval").value(12.5))
        .andExpect(jsonPath("$.data.indicators.approvedDemand").value(150.75));
  }

  @Test
  void submissionsWithoutDecisionHaveNoApprovalRate() throws Exception {
    Project waiting = submitted("2026-5511", now.minusDays(3), owner);
    event(waiting, ProjectEventType.SUBMITTED, now.minusDays(3));

    designerDashboard()
        .andExpect(jsonPath("$.data.hasSubmissions").value(true))
        .andExpect(jsonPath("$.data.indicators.submitted").value(1))
        .andExpect(jsonPath("$.data.indicators.firstReviewApprovalPercent").isEmpty())
        .andExpect(jsonPath("$.data.indicators.averageDaysToApproval").isEmpty())
        .andExpect(jsonPath("$.data.indicators.approvedDemand").value(0));
  }

  @Test
  void decisionsWithoutApprovalDoNotDivideByZero() throws Exception {
    Project waiting = submitted("2026-5501", now.minusDays(3), owner);
    event(waiting, ProjectEventType.SUBMITTED, now.minusDays(3));
    Project rejected = rejected("2026-5502", owner);
    event(rejected, ProjectEventType.SUBMITTED, now.minusDays(9));
    event(rejected, ProjectEventType.REJECTED, now.minusDays(4));

    designerDashboard()
        .andExpect(jsonPath("$.data.indicators.submitted").value(2))
        .andExpect(jsonPath("$.data.indicators.firstReviewApprovalPercent").value(0.0))
        .andExpect(jsonPath("$.data.indicators.averageDaysToApproval").isEmpty())
        .andExpect(jsonPath("$.data.indicators.approvedDemand").value(0));
  }

  @Test
  void eachPeriodCountsItsOwnSubmissionsDecisionsAndFindings() throws Exception {
    List<OffsetDateTime> submissions =
        List.of(now.minusDays(10), now.minusDays(60), now.minusDays(200), now.minusDays(400));
    for (int index = 0; index < submissions.size(); index++) {
      OffsetDateTime submittedAt = submissions.get(index);
      Project project = approved("2026-560" + index, owner, BigDecimal.TEN);
      event(project, ProjectEventType.SUBMITTED, submittedAt);
      event(project, ProjectEventType.APPROVED, submittedAt.plusDays(4));
      finding(project, FindingSeverity.BLOCKING, FindingStage.CALCULATION, "6.2", submittedAt);
    }
    // A resubmission inside the window does not make an older project a new submission.
    event(
        projectRepository.findByProtocol("2026-5601").orElseThrow(),
        ProjectEventType.RESUBMITTED,
        now.minusDays(1));
    LocalDate startOfYear = DashboardPeriod.CURRENT_YEAR.since(LocalDate.now(Timestamps.ZONE));
    long submittedThisYear = submissions.stream().filter(at -> inYear(at, startOfYear)).count();
    long approvedThisYear =
        submissions.stream().filter(at -> inYear(at.plusDays(4), startOfYear)).count();

    assertPeriod(designerDashboard(), 1, 1);
    assertPeriod(designerDashboard(DashboardPeriod.LAST_30_DAYS), 1, 1);
    assertPeriod(designerDashboard(DashboardPeriod.LAST_90_DAYS), 2, 2);
    assertPeriod(
        designerDashboard(DashboardPeriod.CURRENT_YEAR), submittedThisYear, approvedThisYear);
  }

  @Test
  void anApprovalWithoutSubmissionInTheHistoryCountsOnlyInTheApprovedDemand() throws Exception {
    Project legacy = approved("2026-5651", owner, new BigDecimal("30"));
    event(legacy, ProjectEventType.APPROVED, now.minusDays(3));
    Project recorded = approved("2026-5652", owner, new BigDecimal("20"));
    event(recorded, ProjectEventType.SUBMITTED, now.minusDays(10));
    event(recorded, ProjectEventType.APPROVED, now.minusDays(4));

    designerDashboard()
        .andExpect(jsonPath("$.data.indicators.submitted").value(1))
        .andExpect(jsonPath("$.data.indicators.firstReviewApprovalPercent").value(100.0))
        .andExpect(jsonPath("$.data.indicators.averageDaysToApproval").value(6.0))
        .andExpect(jsonPath("$.data.indicators.approvedDemand").value(50));
  }

  @Test
  void theOneSecondBeforeThePeriodStartsInRecifeIsLeftOut() throws Exception {
    OffsetDateTime start =
        DashboardPeriod.LAST_30_DAYS
            .since(LocalDate.now(Timestamps.ZONE))
            .atStartOfDay(Timestamps.ZONE)
            .toOffsetDateTime();
    Project before = submitted("2026-5661", start.minusSeconds(1), owner);
    event(before, ProjectEventType.SUBMITTED, start.minusSeconds(1));
    finding(
        before, FindingSeverity.BLOCKING, FindingStage.CALCULATION, "6.2", start.minusSeconds(1));
    Project atStart = submitted("2026-5662", start, owner);
    event(atStart, ProjectEventType.SUBMITTED, start);
    finding(atStart, FindingSeverity.BLOCKING, FindingStage.CALCULATION, "6.2", start);

    designerDashboard(DashboardPeriod.LAST_30_DAYS)
        .andExpect(jsonPath("$.data.indicators.submitted").value(1))
        .andExpect(jsonPath("$.data.findingsRanking", hasSize(1)))
        .andExpect(jsonPath("$.data.findingsRanking[0].total").value(1));
  }

  @Test
  void ranksThePublishedFindingsByStageAndStandardItem() throws Exception {
    Project project = rejected("2026-5701", owner);
    for (int index = 0; index < 3; index++) {
      finding(project, FindingSeverity.BLOCKING, FindingStage.CALCULATION, "6.2", now);
    }
    finding(project, FindingSeverity.ADJUSTMENT, FindingStage.DOCUMENTS, null, now);
    finding(project, FindingSeverity.ADJUSTMENT, FindingStage.DOCUMENTS, null, now);
    findingRepository.save(
        new Finding(
            project,
            FindingSeverity.BLOCKING,
            FindingStage.PROJECT_DATA,
            null,
            null,
            null,
            "Rascunho do analista",
            "4.1",
            reviewer,
            1));
    for (int index = 0; index < 10; index++) {
      finding(project, FindingSeverity.ADJUSTMENT, FindingStage.PROJECT_DATA, "9." + index, now);
    }

    designerDashboard()
        .andExpect(jsonPath("$.data.findingsRanking", hasSize(10)))
        .andExpect(jsonPath("$.data.findingsRanking[0].stage").value("CALCULATION"))
        .andExpect(jsonPath("$.data.findingsRanking[0].standardItem").value("6.2"))
        .andExpect(jsonPath("$.data.findingsRanking[0].total").value(3))
        .andExpect(jsonPath("$.data.findingsRanking[1].stage").value("DOCUMENTS"))
        .andExpect(jsonPath("$.data.findingsRanking[1].standardItem").isEmpty())
        .andExpect(jsonPath("$.data.findingsRanking[1].total").value(2))
        .andExpect(jsonPath("$.data.findingsRanking[2].total").value(1))
        .andExpect(jsonPath("$.data.findingsRanking[?(@.standardItem == '4.1')]").isEmpty());
  }

  @Test
  void showsOnlyTheDesignersOwnProjects() throws Exception {
    Project rejected = rejected("2026-5801", otherOwner);
    finding(rejected, FindingSeverity.BLOCKING, FindingStage.CALCULATION, "6.2", now);
    event(rejected, ProjectEventType.SUBMITTED, now.minusDays(9));
    event(rejected, ProjectEventType.REJECTED, now.minusDays(4));
    submitted("2026-5802", now.minusDays(5), otherOwner);
    Project approved = approved("2026-5803", otherOwner, BigDecimal.TEN);
    event(approved, ProjectEventType.SUBMITTED, now.minusDays(9));
    event(approved, ProjectEventType.APPROVED, now.minusDays(4));
    lastChanged(
        projectRepository.save(project("2026-5804", ProjectStatus.DRAFT, otherOwner)),
        now.minusDays(30));
    entityManager.clear();

    designerDashboard()
        .andExpect(jsonPath("$.data.hasSubmissions").value(false))
        .andExpect(jsonPath("$.data.actionRequired", hasSize(0)))
        .andExpect(jsonPath("$.data.underReview", hasSize(0)))
        .andExpect(jsonPath("$.data.indicators.submitted").value(0))
        .andExpect(jsonPath("$.data.indicators.approvedDemand").value(0))
        .andExpect(jsonPath("$.data.findingsRanking", hasSize(0)));
    as(OTHER_DESIGNER, get("/dashboard/designer"))
        .andExpect(jsonPath("$.data.hasSubmissions").value(true))
        .andExpect(jsonPath("$.data.actionRequired", hasSize(2)))
        .andExpect(jsonPath("$.data.underReview", hasSize(1)))
        .andExpect(jsonPath("$.data.indicators.submitted").value(2))
        .andExpect(jsonPath("$.data.indicators.firstReviewApprovalPercent").value(50.0))
        .andExpect(jsonPath("$.data.findingsRanking", hasSize(1)));
  }

  private static void assertPeriod(ResultActions result, long submitted, long approved)
      throws Exception {
    result
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.data.indicators.submitted").value(submitted))
        .andExpect(jsonPath("$.data.indicators.approvedDemand").value(10 * approved))
        .andExpect(jsonPath("$.data.findingsRanking", hasSize(submitted == 0 ? 0 : 1)));
    if (approved == 0) {
      result
          .andExpect(jsonPath("$.data.indicators.firstReviewApprovalPercent").isEmpty())
          .andExpect(jsonPath("$.data.indicators.averageDaysToApproval").isEmpty());
    } else {
      result
          .andExpect(jsonPath("$.data.indicators.firstReviewApprovalPercent").value(100.0))
          .andExpect(jsonPath("$.data.indicators.averageDaysToApproval").value(4.0));
    }
    if (submitted > 0) {
      result.andExpect(jsonPath("$.data.findingsRanking[0].total").value(submitted));
    }
  }

  private static boolean inYear(OffsetDateTime instant, LocalDate startOfYear) {
    return !instant.atZoneSameInstant(Timestamps.ZONE).toLocalDate().isBefore(startOfYear);
  }

  private Project submitted(String protocol, OffsetDateTime submittedAt, User designer) {
    Project project = project(protocol, ProjectStatus.DRAFT, designer);
    project.submit(submittedAt);
    return projectRepository.save(project);
  }

  private Project rejected(String protocol, User designer) {
    Project project = project(protocol, ProjectStatus.DRAFT, designer);
    project.submit(now.minusDays(10));
    project.reject(now.minusDays(5));
    return projectRepository.save(project);
  }

  private Project approved(String protocol, User designer, BigDecimal demandKva) {
    Project project = project(protocol, ProjectStatus.DRAFT, designer);
    project.submit(now.minusDays(10));
    project.approve(now.minusDays(5));
    projectRepository.save(project);
    calculationRepository.save(new Calculation(project, demand(demandKva), "{}"));
    return project;
  }

  private Project project(String protocol, ProjectStatus status, User designer) {
    return new Project(
        "Residencial " + protocol,
        "Rua A, 1",
        "Recife",
        protocol,
        status,
        new ResidentialMultifamily(
            12, SupplyVoltage.V380_220, ConnectionType.THREE_PHASE, EntranceStandard.COLLECTIVE),
        standards,
        designer);
  }

  private void event(Project project, ProjectEventType type, OffsetDateTime occurredAt) {
    eventRepository.save(
        new ProjectEvent(project, type, 1, null, null, type.name(), null, occurredAt));
  }

  private Finding finding(
      Project project,
      FindingSeverity severity,
      FindingStage stage,
      String standardItem,
      OffsetDateTime createdAt) {
    Finding finding =
        new Finding(
            project, severity, stage, null, null, null, "Corrigir", standardItem, reviewer, 1);
    finding.publish();
    findingRepository.saveAndFlush(finding);
    entityManager
        .createNativeQuery("UPDATE finding SET created_at = :at WHERE id = :id")
        .setParameter("at", createdAt)
        .setParameter("id", finding.getId())
        .executeUpdate();
    return finding;
  }

  private void answered(Finding finding) {
    finding.respond(FindingAnswer.FIXED, null, now);
    findingRepository.save(finding);
  }

  private void lastChanged(Project project, OffsetDateTime updatedAt) {
    entityManager
        .createQuery("UPDATE Project project SET project.updatedAt = :at WHERE project = :p")
        .setParameter("at", updatedAt)
        .setParameter("p", project)
        .executeUpdate();
  }

  private static DemandResult demand(BigDecimal demandKva) {
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
                        demandKva,
                        null,
                        List.of(),
                        null)))
            .toList();
    return new DemandResult(
        steps,
        demandKva,
        demandKva,
        demandKva,
        false,
        null,
        new BigDecimal("50.00"),
        List.of(),
        List.of());
  }

  private ResultActions designerDashboard() throws Exception {
    return as(DESIGNER, get("/dashboard/designer"));
  }

  private ResultActions designerDashboard(DashboardPeriod period) throws Exception {
    return as(DESIGNER, get("/dashboard/designer").param("period", period.name()));
  }

  private ResultActions as(
      String email,
      org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder request)
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
