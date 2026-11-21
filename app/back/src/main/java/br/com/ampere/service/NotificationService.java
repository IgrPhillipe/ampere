package br.com.ampere.service;

import br.com.ampere.domain.Finding;
import br.com.ampere.domain.Notification;
import br.com.ampere.domain.NotificationType;
import br.com.ampere.domain.Project;
import br.com.ampere.domain.ProjectStatus;
import br.com.ampere.domain.User;
import br.com.ampere.domain.UserRole;
import br.com.ampere.error.NotFoundException;
import br.com.ampere.repository.NotificationRepository;
import br.com.ampere.repository.ProjectRepository;
import br.com.ampere.repository.UserRepository;
import br.com.ampere.utils.Timestamps;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class NotificationService {

  static final int PAGE_SIZE = 50;

  static final int DEADLINE_WARNING_DAYS = 3;

  static final int EXPIRY_WARNING_DAYS = 30;

  private static final String NOT_FOUND = "Notificação não encontrada.";

  static final String QUEUE_LINK = "/projetos";

  static final String UNASSIGNED_QUEUE_LINK = "/projetos?status=UNDER_REVIEW&reviewer=none";

  private final NotificationRepository notificationRepository;
  private final ProjectRepository projectRepository;
  private final UserRepository userRepository;

  public NotificationService(
      NotificationRepository notificationRepository,
      ProjectRepository projectRepository,
      UserRepository userRepository) {
    this.notificationRepository = notificationRepository;
    this.projectRepository = projectRepository;
    this.userRepository = userRepository;
  }

  @Transactional(readOnly = true)
  public NotificationListing list(AuthenticatedUser user) {
    return new NotificationListing(
        notificationRepository.findAllByRecipientIdOrderByCreatedAtDescIdDesc(
            user.id(), PageRequest.of(0, PAGE_SIZE)),
        notificationRepository.countByRecipientIdAndReadAtIsNull(user.id()));
  }

  @Transactional
  public Notification markRead(Long id, AuthenticatedUser user) {
    Notification notification =
        notificationRepository
            .findById(id)
            .filter(found -> found.isOwnedBy(user.id()))
            .orElseThrow(() -> new NotFoundException(NOT_FOUND));
    notification.markRead(Timestamps.now());

    return notification;
  }

  @Transactional
  public void markAllRead(AuthenticatedUser user) {
    notificationRepository.markAllRead(user.id(), Timestamps.now());
  }

  /** The rejection, preceded by a notice of the findings reopened in this cycle. */
  public void rejected(Project project, List<Finding> findings, OffsetDateTime at) {
    long reopened =
        findings.stream()
            .filter(finding -> finding.wasReopenedIn(project.getReviewCycle()))
            .count();
    if (reopened > 0) {
      findingsReopened(project, reopened, at);
    }
    rejected(project, ProjectService.countOpen(findings), at);
  }

  public void approved(Project project, long reservations, OffsetDateTime at) {
    String suffix =
        reservations == 0 ? "" : " com " + ProjectService.reservationsLabel(reservations);
    notify(
        project.getOwner(),
        project,
        NotificationType.PROJECT_APPROVED,
        "Projeto " + project.getProtocol() + " aprovado" + suffix,
        designerLink(project),
        at);
  }

  void rejected(Project project, long findings, OffsetDateTime at) {
    String noun = findings == 1 ? " apontamento" : " apontamentos";
    notify(
        project.getOwner(),
        project,
        NotificationType.PROJECT_REJECTED,
        "Projeto " + project.getProtocol() + " reprovado com " + findings + noun,
        findingsLink(project),
        at);
  }

  void findingsReopened(Project project, long findings, OffsetDateTime at) {
    String noun = findings == 1 ? " apontamento reaberto" : " apontamentos reabertos";
    notify(
        project.getOwner(),
        project,
        NotificationType.FINDING_REOPENED,
        findings + noun + " na reanálise do projeto " + project.getProtocol(),
        findingsLink(project),
        at);
  }

  /** The analyst who lost the project keeps the notices, now leading to their own queue. */
  public void handedOver(Project project, User previousReviewer) {
    notificationRepository.relink(previousReviewer.getId(), project.getId(), QUEUE_LINK);
  }

  /** Every active manager, since only a manager assigns the project that arrived without one. */
  public void unassigned(Project project, OffsetDateTime at) {
    userRepository
        .findAllByRoleInAndActiveTrueOrderByNameAsc(List.of(UserRole.ADMIN))
        .forEach(
            manager ->
                notify(
                    manager,
                    project,
                    NotificationType.PROJECT_UNASSIGNED,
                    "Projeto " + project.getProtocol() + " aguardando analista",
                    UNASSIGNED_QUEUE_LINK,
                    at));
  }

  /** Read once assigned: the notice stays in the history, but nothing is left to do. */
  public void assigned(List<Long> projectIds, OffsetDateTime at) {
    if (!projectIds.isEmpty()) {
      notificationRepository.markReadByProjects(
          projectIds, NotificationType.PROJECT_UNASSIGNED, at);
    }
  }

  public void resubmitted(Project project, OffsetDateTime at) {
    notify(
        project.getReviewer(),
        project,
        NotificationType.PROJECT_RESUBMITTED,
        "Projeto " + project.getProtocol() + " reenviado para reanálise",
        reviewerLink(project),
        at);
  }

  @Transactional
  public int issueTimeBasedNotifications(OffsetDateTime now) {
    LocalDate today = Timestamps.localDate(now);

    return warnOfReviewDeadlines(today, now) + warnOfExpiringApprovals(today, now);
  }

  private int warnOfReviewDeadlines(LocalDate today, OffsetDateTime now) {
    int issued = 0;
    for (Project project :
        projectRepository.findAllByStatusOrderByIdAsc(ProjectStatus.UNDER_REVIEW)) {
      if (!project.wasSubmitted()) {
        continue;
      }
      long daysLeft = ChronoUnit.DAYS.between(today, project.reviewDeadline(Timestamps.ZONE));
      if (daysLeft < 0) {
        issued +=
            notify(
                project.getReviewer(),
                project,
                NotificationType.REVIEW_OVERDUE,
                "Prazo de análise do projeto " + project.getProtocol() + " vencido",
                reviewerLink(project),
                now);
      } else if (daysLeft <= DEADLINE_WARNING_DAYS) {
        issued +=
            notify(
                project.getReviewer(),
                project,
                NotificationType.REVIEW_DEADLINE_NEAR,
                "Prazo de análise do projeto "
                    + project.getProtocol()
                    + " vence "
                    + inDays(daysLeft),
                reviewerLink(project),
                now);
      }
    }

    return issued;
  }

  private int warnOfExpiringApprovals(LocalDate today, OffsetDateTime now) {
    int issued = 0;
    OffsetDateTime expiringToday = now.minusMonths(Project.APPROVAL_VALIDITY_MONTHS);
    for (Project project :
        projectRepository.findAllByStatusAndReviewedAtBetweenOrderByIdAsc(
            ProjectStatus.APPROVED,
            expiringToday.minusDays(1),
            expiringToday.plusDays(EXPIRY_WARNING_DAYS + 1))) {
      long daysLeft = ChronoUnit.DAYS.between(today, project.approvalExpiresOn(Timestamps.ZONE));
      if (daysLeft >= 0 && daysLeft <= EXPIRY_WARNING_DAYS) {
        issued +=
            notify(
                project.getOwner(),
                project,
                NotificationType.APPROVAL_EXPIRING,
                "A aprovação do projeto " + project.getProtocol() + " expira " + inDays(daysLeft),
                designerLink(project),
                now);
      }
    }

    return issued;
  }

  private static String inDays(long daysLeft) {
    if (daysLeft == 0) {
      return "hoje";
    }

    return "em " + daysLeft + (daysLeft == 1 ? " dia" : " dias");
  }

  private static String designerLink(Project project) {
    return "/projetos/" + project.getId();
  }

  private static String findingsLink(Project project) {
    return "/projetos/" + project.getId() + "/apontamentos";
  }

  private static String reviewerLink(Project project) {
    return "/projetos/" + project.getId();
  }

  private int notify(
      User recipient,
      Project project,
      NotificationType type,
      String text,
      String link,
      OffsetDateTime at) {
    if (recipient == null) {
      return 0;
    }
    if (isOncePerCycle(type)
        && notificationRepository.existsByRecipientIdAndProjectIdAndTypeAndReviewCycle(
            recipient.getId(), project.getId(), type, project.getReviewCycle())) {
      return 0;
    }
    notificationRepository.save(new Notification(recipient, project, type, text, link, at));

    return 1;
  }

  private static boolean isOncePerCycle(NotificationType type) {
    return type == NotificationType.REVIEW_DEADLINE_NEAR
        || type == NotificationType.REVIEW_OVERDUE
        || type == NotificationType.APPROVAL_EXPIRING
        || type == NotificationType.PROJECT_UNASSIGNED;
  }
}
