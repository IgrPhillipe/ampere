package br.com.ampere.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import br.com.ampere.domain.ConnectionType;
import br.com.ampere.domain.DocumentType;
import br.com.ampere.domain.EntranceStandard;
import br.com.ampere.domain.Finding;
import br.com.ampere.domain.FindingAnswer;
import br.com.ampere.domain.FindingResolution;
import br.com.ampere.domain.FindingSeverity;
import br.com.ampere.domain.FindingStage;
import br.com.ampere.domain.Notification;
import br.com.ampere.domain.NotificationType;
import br.com.ampere.domain.Project;
import br.com.ampere.domain.ProjectStatus;
import br.com.ampere.domain.ResidentialMultifamily;
import br.com.ampere.domain.Standard;
import br.com.ampere.domain.SupplyVoltage;
import br.com.ampere.domain.User;
import br.com.ampere.domain.UserRole;
import br.com.ampere.repository.NotificationRepository;
import br.com.ampere.repository.ProjectRepository;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

/** Who each event notifies, and the text and link each one carries. */
class NotificationServiceTest {

  private static final OffsetDateTime NOW = OffsetDateTime.parse("2026-11-06T12:00:00Z");

  private NotificationRepository notificationRepository;
  private ProjectRepository projectRepository;
  private NotificationService service;
  private List<Notification> saved;
  private User designer;
  private User analyst;

  @BeforeEach
  void setUp() {
    notificationRepository = mock(NotificationRepository.class);
    projectRepository = mock(ProjectRepository.class);
    saved = new ArrayList<>();
    when(notificationRepository.save(any(Notification.class)))
        .thenAnswer(
            invocation -> {
              Notification notification = invocation.getArgument(0);
              saved.add(notification);
              return notification;
            });
    service = new NotificationService(notificationRepository, projectRepository);
    designer = user(1L, "Ana Projetista", UserRole.USER);
    analyst = user(2L, "Alice Analista", UserRole.REVIEWER);
  }

  @Test
  void approvalNotifiesOnlyTheDesigner() {
    Project project = project(10L, designer, analyst);

    service.approved(project, 0, NOW);

    assertThat(saved)
        .singleElement()
        .satisfies(
            notification -> {
              assertThat(notification.getRecipient()).isSameAs(designer);
              assertThat(notification.getType()).isEqualTo(NotificationType.PROJECT_APPROVED);
              assertThat(notification.getProtocol()).isEqualTo("2026-1004");
              assertThat(notification.getText()).isEqualTo("Projeto 2026-1004 aprovado");
              assertThat(notification.getLink()).isEqualTo("/projetos/10");
              assertThat(notification.isRead()).isFalse();
              assertThat(notification.getCreatedAt()).isEqualTo(NOW);
            });
  }

  @Test
  void approvalTellsTheDesignerHowManyReservationsRemain() {
    Project project = project(10L, designer, analyst);

    service.approved(project, 2, NOW);
    service.approved(project, 1, NOW);

    assertThat(saved)
        .extracting(Notification::getText)
        .containsExactly(
            "Projeto 2026-1004 aprovado com 2 ressalvas",
            "Projeto 2026-1004 aprovado com 1 ressalva");
  }

  @Test
  void rejectionNotifiesOnlyTheDesignerWithTheNumberOfFindings() {
    Project project = project(10L, designer, analyst);

    service.rejected(project, 3, NOW);
    service.rejected(project, 1, NOW);

    assertThat(saved).extracting(Notification::getRecipient).containsOnly(designer);
    assertThat(saved)
        .extracting(Notification::getText)
        .containsExactly(
            "Projeto 2026-1004 reprovado com 3 apontamentos",
            "Projeto 2026-1004 reprovado com 1 apontamento");
    assertThat(saved.getFirst().getType()).isEqualTo(NotificationType.PROJECT_REJECTED);
    assertThat(saved.getFirst().getLink()).isEqualTo("/projetos/10/apontamentos");
  }

  @Test
  void rejectionTellsTheDesignerHowManyFindingsWereReopenedInTheCycle() {
    Project project = underReview(10L, designer, analyst, "2026-11-01T12:00:00Z");
    project.reject(OffsetDateTime.parse("2026-11-02T12:00:00Z"));
    project.submit(OffsetDateTime.parse("2026-11-03T12:00:00Z"));

    service.rejected(
        project,
        List.of(answered(project), answered(project), reopened(project), reopened(project)),
        NOW);

    assertThat(saved).extracting(Notification::getRecipient).containsOnly(designer);
    assertThat(saved)
        .extracting(Notification::getType)
        .containsExactly(NotificationType.FINDING_REOPENED, NotificationType.PROJECT_REJECTED);
    assertThat(saved.getFirst().getText())
        .isEqualTo("2 apontamentos reabertos na reanálise do projeto 2026-1004");
    assertThat(saved.getFirst().getLink()).isEqualTo("/projetos/10/apontamentos");
  }

  @Test
  void aReopenedFindingAcceptedBeforeTheDecisionIsNotNotified() {
    Project project = underReview(10L, designer, analyst, "2026-11-01T12:00:00Z");
    project.reject(OffsetDateTime.parse("2026-11-02T12:00:00Z"));
    project.submit(OffsetDateTime.parse("2026-11-03T12:00:00Z"));
    Finding accepted = reopened(project);
    accepted.resolve(FindingResolution.ACCEPT, project.getReviewCycle());

    service.rejected(project, List.of(accepted), NOW);

    assertThat(saved)
        .extracting(Notification::getType)
        .containsExactly(NotificationType.PROJECT_REJECTED);
  }

  @Test
  void resubmissionNotifiesOnlyTheAssignedAnalyst() {
    Project project = project(10L, designer, analyst);

    service.resubmitted(project, NOW);

    assertThat(saved)
        .singleElement()
        .satisfies(
            notification -> {
              assertThat(notification.getRecipient()).isSameAs(analyst);
              assertThat(notification.getType()).isEqualTo(NotificationType.PROJECT_RESUBMITTED);
              assertThat(notification.getLink()).isEqualTo("/fila-de-analise/10");
            });
  }

  @Test
  void nobodyIsNotifiedWhenTheProjectHasNoRecipient() {
    Project withoutAnalyst = project(10L, designer, null);
    Project withoutOwner = project(11L, null, analyst);

    service.resubmitted(withoutAnalyst, NOW);
    service.approved(withoutOwner, 0, NOW);
    service.rejected(withoutOwner, 2, NOW);
    service.findingsReopened(withoutOwner, 1, NOW);

    assertThat(saved).isEmpty();
    verify(notificationRepository, never()).save(any());
  }

  @Test
  void deadlineWithinThreeDaysNotifiesTheAssignedAnalystOnly() {
    // Submitted on 2026-10-10: the deadline is 2026-11-09, three days after "today".
    Project project = underReview(10L, designer, analyst, "2026-10-10T15:00:00Z");
    when(projectRepository.findAllByStatusOrderByIdAsc(ProjectStatus.UNDER_REVIEW))
        .thenReturn(List.of(project));
    when(projectRepository.findAllByStatusAndReviewedAtBetweenOrderByIdAsc(
            eq(ProjectStatus.APPROVED), any(), any()))
        .thenReturn(List.of());

    int issued = service.issueTimeBasedNotifications(NOW);

    assertThat(issued).isEqualTo(1);
    assertThat(saved)
        .singleElement()
        .satisfies(
            notification -> {
              assertThat(notification.getRecipient()).isSameAs(analyst);
              assertThat(notification.getType()).isEqualTo(NotificationType.REVIEW_DEADLINE_NEAR);
              assertThat(notification.getText())
                  .isEqualTo("Prazo de análise do projeto 2026-1004 vence em 3 dias");
              assertThat(notification.getLink()).isEqualTo("/fila-de-analise/10");
            });
  }

  @Test
  void deadlineFourDaysAwayDoesNotNotify() {
    Project project = underReview(10L, designer, analyst, "2026-10-11T15:00:00Z");
    when(projectRepository.findAllByStatusOrderByIdAsc(ProjectStatus.UNDER_REVIEW))
        .thenReturn(List.of(project));

    assertThat(service.issueTimeBasedNotifications(NOW)).isZero();
    assertThat(saved).isEmpty();
  }

  @Test
  void deadlineDueTodayStillCountsAsComingUp() {
    Project project = underReview(10L, designer, analyst, "2026-10-07T15:00:00Z");
    when(projectRepository.findAllByStatusOrderByIdAsc(ProjectStatus.UNDER_REVIEW))
        .thenReturn(List.of(project));

    service.issueTimeBasedNotifications(NOW);

    assertThat(saved)
        .singleElement()
        .extracting(Notification::getText)
        .isEqualTo("Prazo de análise do projeto 2026-1004 vence hoje");
  }

  @Test
  void overdueDeadlineNotifiesTheAssignedAnalystOnly() {
    Project project = underReview(10L, designer, analyst, "2026-10-01T15:00:00Z");
    Project unassigned = underReview(11L, designer, null, "2026-10-01T15:00:00Z");
    when(projectRepository.findAllByStatusOrderByIdAsc(ProjectStatus.UNDER_REVIEW))
        .thenReturn(List.of(project, unassigned));

    int issued = service.issueTimeBasedNotifications(NOW);

    assertThat(issued).isEqualTo(1);
    assertThat(saved)
        .singleElement()
        .satisfies(
            notification -> {
              assertThat(notification.getRecipient()).isSameAs(analyst);
              assertThat(notification.getType()).isEqualTo(NotificationType.REVIEW_OVERDUE);
              assertThat(notification.getText())
                  .isEqualTo("Prazo de análise do projeto 2026-1004 vencido");
            });
  }

  @Test
  void aWarningAlreadyIssuedInTheCycleIsNotRepeated() {
    Project project = underReview(10L, designer, analyst, "2026-10-01T15:00:00Z");
    when(projectRepository.findAllByStatusOrderByIdAsc(ProjectStatus.UNDER_REVIEW))
        .thenReturn(List.of(project));
    when(notificationRepository.existsByRecipientIdAndProjectIdAndTypeAndReviewCycle(
            eq(2L), eq(10L), eq(NotificationType.REVIEW_OVERDUE), eq(1)))
        .thenReturn(true);

    assertThat(service.issueTimeBasedNotifications(NOW)).isZero();
    assertThat(saved).isEmpty();
  }

  @Test
  void approvalExpiringWithinThirtyDaysNotifiesTheDesignerOnly() {
    // Approved on 2023-11-26: valid for 36 months, until 2026-11-26, 20 days after "today".
    Project expiring = approved(10L, designer, analyst, "2023-11-26T15:00:00Z");
    Project far = approved(11L, designer, analyst, "2023-12-20T15:00:00Z");
    Project expired = approved(12L, designer, analyst, "2023-10-01T15:00:00Z");
    when(projectRepository.findAllByStatusOrderByIdAsc(ProjectStatus.UNDER_REVIEW))
        .thenReturn(List.of());
    when(projectRepository.findAllByStatusAndReviewedAtBetweenOrderByIdAsc(
            eq(ProjectStatus.APPROVED), any(), any()))
        .thenReturn(List.of(expiring, far, expired));

    int issued = service.issueTimeBasedNotifications(NOW);

    assertThat(issued).isEqualTo(1);
    assertThat(saved)
        .singleElement()
        .satisfies(
            notification -> {
              assertThat(notification.getRecipient()).isSameAs(designer);
              assertThat(notification.getType()).isEqualTo(NotificationType.APPROVAL_EXPIRING);
              assertThat(notification.getText())
                  .isEqualTo("A aprovação do projeto 2026-1004 expira em 20 dias");
              assertThat(notification.getLink()).isEqualTo("/projetos/10");
            });
  }

  @Test
  void eventNotificationsAreNeverDeduplicated() {
    Project project = project(10L, designer, analyst);

    service.rejected(project, 2, NOW);
    service.rejected(project, 2, NOW.plusDays(20));

    assertThat(saved).hasSize(2);
    verify(notificationRepository, never())
        .existsByRecipientIdAndProjectIdAndTypeAndReviewCycle(
            anyLong(), anyLong(), any(), anyInt());
  }

  private static Finding answered(Project project) {
    Finding finding =
        new Finding(
            project,
            FindingSeverity.BLOCKING,
            FindingStage.DOCUMENTS,
            null,
            null,
            DocumentType.SITE_PLAN,
            "Anexar a comprovação.",
            null,
            project.getReviewer(),
            project.getReviewCycle() - 1);
    finding.publish();
    finding.respond(FindingAnswer.FIXED, null, NOW);
    return finding;
  }

  private static Finding reopened(Project project) {
    Finding finding = answered(project);
    finding.resolve(FindingResolution.REOPEN, project.getReviewCycle());
    return finding;
  }

  private static User user(Long id, String name, UserRole role) {
    User user = new User(name, name.split(" ")[0].toLowerCase() + "@ampere.com", "hash", role);
    ReflectionTestUtils.setField(user, "id", id);
    return user;
  }

  private static Project project(Long id, User owner, User reviewer) {
    Project project =
        Project.draft(
            "Residencial Vila Nova",
            "Rua do Projeto, 10",
            "Recife",
            "2026-1004",
            new ResidentialMultifamily(
                6, SupplyVoltage.V220_127, ConnectionType.THREE_PHASE, EntranceStandard.COLLECTIVE),
            List.<Standard>of(),
            owner);
    ReflectionTestUtils.setField(project, "id", id);
    if (reviewer != null) {
      project.assignReviewer(reviewer);
    }
    return project;
  }

  private static Project underReview(Long id, User owner, User reviewer, String submittedAt) {
    Project project = project(id, owner, reviewer);
    project.submit(OffsetDateTime.parse(submittedAt));
    return project;
  }

  private static Project approved(Long id, User owner, User reviewer, String approvedAt) {
    Project project = underReview(id, owner, reviewer, "2023-11-01T12:00:00Z");
    project.approve(OffsetDateTime.parse(approvedAt));
    return project;
  }
}
