package br.com.ampere.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.contains;
import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import br.com.ampere.domain.ConnectionType;
import br.com.ampere.domain.EntranceStandard;
import br.com.ampere.domain.Project;
import br.com.ampere.domain.ProjectEvent;
import br.com.ampere.domain.ProjectEventType;
import br.com.ampere.domain.ProjectStatus;
import br.com.ampere.domain.ResidentialMultifamily;
import br.com.ampere.domain.Standard;
import br.com.ampere.domain.SupplyVoltage;
import br.com.ampere.domain.User;
import br.com.ampere.domain.UserRole;
import br.com.ampere.repository.NotificationRepository;
import br.com.ampere.repository.ProjectEventRepository;
import br.com.ampere.repository.ProjectRepository;
import br.com.ampere.repository.UserRepository;
import br.com.ampere.utils.BrazilianDateFormat;
import br.com.ampere.utils.Timestamps;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;
import org.springframework.transaction.annotation.Transactional;
import tools.jackson.databind.ObjectMapper;

/** US15: the review period suspended by a rejection and the 36-month validity of an approval. */
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class ReviewDeadlineIntegrationTest {

  private static final String PASSWORD = "senha@123";

  @Autowired private MockMvc mockMvc;
  @Autowired private ObjectMapper objectMapper;
  @Autowired private PasswordEncoder passwordEncoder;
  @Autowired private ApprovalExpiryService expiryService;
  @Autowired private NotificationService notificationService;
  @Autowired private NotificationRepository notificationRepository;
  @Autowired private ProjectEventRepository eventRepository;
  @Autowired private ProjectRepository projectRepository;
  @Autowired private UserRepository userRepository;

  private User designer;
  private User analyst;
  private OffsetDateTime now;
  private LocalDate today;

  @BeforeEach
  void setUp() {
    notificationRepository.deleteAll();
    projectRepository.deleteAll();
    userRepository.deleteAll();
    String hash = passwordEncoder.encode(PASSWORD);
    designer =
        userRepository.save(new User("Ana Projetista", "ana@ampere.com", hash, UserRole.USER));
    analyst =
        userRepository.save(
            new User("Alice Analista", "alice@ampere.com", hash, UserRole.REVIEWER));
    now = Timestamps.now();
    today = Timestamps.localDate(now);
  }

  @Test
  void aResubmittedProjectReturnsToTheQueueWithTheDaysThatWereLeft() throws Exception {
    // Rejected on the 12th day of review, resubmitted 10 days later.
    Project project = submitted("2026-5001", now.minusDays(22));
    project.reject(now.minusDays(10));
    project.submit(now);
    projectRepository.saveAndFlush(project);

    as(analyst, get("/review-queue"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.data", hasSize(1)))
        .andExpect(jsonPath("$.data[0].daysRemaining").value(18))
        .andExpect(jsonPath("$.data[0].elapsedDays").value(12))
        .andExpect(jsonPath("$.data[0].suspendedDays").value(10))
        .andExpect(jsonPath("$.data[0].deadline").value(today.plusDays(18).toString()))
        .andExpect(jsonPath("$.data[0].deadlineStatus").value("ON_TIME"));
    as(designer, get("/projects/{id}", project.getId()))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.data.reviewDeadline").value(today.plusDays(18).toString()))
        .andExpect(jsonPath("$.data.daysRemaining").value(18))
        .andExpect(jsonPath("$.data.elapsedDays").value(12))
        .andExpect(jsonPath("$.data.suspendedDays").value(10))
        .andExpect(jsonPath("$.data.reviewSuspended").value(false))
        .andExpect(jsonPath("$.data.approvalValidUntil").doesNotExist());
  }

  @Test
  void aRejectedProjectShowsTheDeadlineSuspended() throws Exception {
    Project project = submitted("2026-5002", now.minusDays(22));
    project.reject(now.minusDays(10));
    projectRepository.saveAndFlush(project);

    as(designer, get("/projects/{id}", project.getId()))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.data.reviewSuspended").value(true))
        .andExpect(jsonPath("$.data.reviewDeadline").doesNotExist())
        .andExpect(jsonPath("$.data.deadlineStatus").doesNotExist())
        .andExpect(jsonPath("$.data.daysRemaining").value(18))
        .andExpect(jsonPath("$.data.elapsedDays").value(12))
        .andExpect(jsonPath("$.data.suspendedDays").value(10))
        .andExpect(jsonPath("$.data.remainingReviewDays").doesNotExist());
    as(analyst, get("/review-queue")).andExpect(jsonPath("$.data", hasSize(0)));
  }

  @Test
  void theQueueSortsAndFiltersByTheDeadlineThatCountsTheSuspension() throws Exception {
    // Submitted 25 days ago: 5 days left.
    submitted("2026-5003", now.minusDays(25));
    // Resubmitted after the first, but with 28 days used before its rejection: 1 day left.
    Project resumed = submitted("2026-5004", now.minusDays(40));
    resumed.reject(now.minusDays(12));
    resumed.submit(now.minusDays(1));
    // Resumed with 30 days used: due today.
    Project dueToday = submitted("2026-5005", now.minusDays(45));
    dueToday.reject(now.minusDays(15));
    dueToday.submit(now);
    projectRepository.saveAllAndFlush(List.of(resumed, dueToday));

    as(analyst, get("/review-queue").param("sort", "deadline").param("direction", "ASC"))
        .andExpect(
            jsonPath("$.data[*].protocol").value(contains("2026-5005", "2026-5004", "2026-5003")))
        .andExpect(jsonPath("$.data[0].daysRemaining").value(0))
        .andExpect(jsonPath("$.data[1].daysRemaining").value(1))
        .andExpect(jsonPath("$.data[2].daysRemaining").value(5));
    as(analyst, get("/review-queue").param("filter", "DUE_SOON"))
        .andExpect(jsonPath("$.data[*].protocol").value(contains("2026-5005")));
    as(analyst, get("/review-queue").param("sort", "submittedAt").param("direction", "ASC"))
        .andExpect(
            jsonPath("$.data[*].protocol").value(contains("2026-5003", "2026-5004", "2026-5005")));
  }

  @Test
  void theDailySweepExpiresTheApprovalsPastThirtySixMonths() throws Exception {
    Project expired = submitted("2026-5006", now.minusMonths(37));
    expired.approve(now.minusMonths(36).minusDays(1));
    Project lastValidDay = submitted("2026-5007", now.minusMonths(37));
    lastValidDay.approve(now.minusMonths(36));
    Project recent = submitted("2026-5008", now.minusDays(40));
    recent.approve(now.minusDays(30));
    Project rejected = submitted("2026-5009", now.minusMonths(40));
    rejected.reject(now.minusMonths(39));
    projectRepository.saveAllAndFlush(List.of(expired, lastValidDay, recent, rejected));

    assertThat(expiryService.expireApprovals(now)).isEqualTo(1);
    assertThat(expiryService.expireApprovals(now)).isZero();
    projectRepository.flush();

    assertThat(projectRepository.findByProtocol("2026-5006").orElseThrow().getStatus())
        .isEqualTo(ProjectStatus.EXPIRED);
    assertThat(projectRepository.findByProtocol("2026-5007").orElseThrow().getStatus())
        .isEqualTo(ProjectStatus.APPROVED);
    assertThat(projectRepository.findByProtocol("2026-5008").orElseThrow().getStatus())
        .isEqualTo(ProjectStatus.APPROVED);
    assertThat(projectRepository.findByProtocol("2026-5009").orElseThrow().getStatus())
        .isEqualTo(ProjectStatus.REJECTED);
    List<ProjectEvent> events =
        eventRepository.findAllByProjectIdOrderByOccurredAtAscIdAsc(expired.getId());
    assertThat(events).extracting(ProjectEvent::getType).containsExactly(ProjectEventType.EXPIRED);
    assertThat(events.getFirst().getDescription())
        .isEqualTo(
            "Validade da aprovação encerrada em "
                + BrazilianDateFormat.date(expired.approvalExpiresOn(Timestamps.ZONE))
                + ".");
  }

  @Test
  void anExpiredProjectShowsTheDayItsValidityEnded() throws Exception {
    Project project = submitted("2026-5010", now.minusMonths(37));
    project.approve(now.minusMonths(36).minusDays(5));
    projectRepository.saveAndFlush(project);
    expiryService.expireApprovals(now);
    projectRepository.flush();
    LocalDate endedOn = project.approvalExpiresOn(Timestamps.ZONE);

    as(designer, get("/projects/{id}", project.getId()))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.data.status").value("EXPIRED"))
        .andExpect(jsonPath("$.data.approvalValidUntil").value(endedOn.toString()))
        .andExpect(jsonPath("$.data.reviewDeadline").doesNotExist());
    as(designer, get("/projects"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.data[0].status").value("EXPIRED"))
        .andExpect(jsonPath("$.data[0].approvalValidUntil").value(endedOn.toString()));
    as(designer, get("/projects/status-counts"))
        .andExpect(jsonPath("$.data.expired").value(1))
        .andExpect(jsonPath("$.data.approved").value(0))
        .andExpect(jsonPath("$.data.total").value(1));
  }

  @Test
  void anExpiredProjectNoLongerGetsTheExpiryWarning() throws Exception {
    Project expiring = submitted("2026-5011", now.minusMonths(37));
    expiring.approve(now.minusMonths(36).plusDays(10));
    Project expired = submitted("2026-5012", now.minusMonths(37));
    expired.approve(now.minusMonths(36).minusDays(2));
    projectRepository.saveAllAndFlush(List.of(expiring, expired));

    expiryService.expireApprovals(now);
    notificationService.issueTimeBasedNotifications(now);

    assertThat(notificationRepository.findAll())
        .singleElement()
        .satisfies(notice -> assertThat(notice.getProject().getProtocol()).isEqualTo("2026-5011"));
  }

  private Project submitted(String protocol, OffsetDateTime submittedAt) {
    Project project =
        Project.draft(
            "Residencial " + protocol,
            "Rua do Projeto, 10",
            "Recife",
            protocol,
            new ResidentialMultifamily(
                6, SupplyVoltage.V220_127, ConnectionType.THREE_PHASE, EntranceStandard.COLLECTIVE),
            List.<Standard>of(),
            designer);
    project.submit(submittedAt);
    project.assignReviewer(analyst);
    return projectRepository.save(project);
  }

  private ResultActions as(User user, MockHttpServletRequestBuilder request) throws Exception {
    return mockMvc.perform(request.header(HttpHeaders.AUTHORIZATION, bearer(user)));
  }

  private String bearer(User user) throws Exception {
    String body =
        mockMvc
            .perform(
                post("/auth/login")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(
                        "{\"email\":\""
                            + user.getEmail()
                            + "\",\"password\":\""
                            + PASSWORD
                            + "\"}"))
            .andReturn()
            .getResponse()
            .getContentAsString();
    return "Bearer " + objectMapper.readTree(body).path("data").path("token").asString();
  }
}
