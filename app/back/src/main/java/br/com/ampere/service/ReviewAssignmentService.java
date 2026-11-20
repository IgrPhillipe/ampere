package br.com.ampere.service;

import br.com.ampere.domain.FindingStatus;
import br.com.ampere.domain.Project;
import br.com.ampere.domain.User;
import br.com.ampere.domain.UserRole;
import br.com.ampere.error.BusinessException;
import br.com.ampere.error.NotFoundException;
import br.com.ampere.repository.FindingRepository;
import br.com.ampere.repository.ProjectRepository;
import br.com.ampere.repository.UserRepository;
import br.com.ampere.utils.Timestamps;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Decides who holds the review of a project: the manager, or the rules on submission. */
@Service
public class ReviewAssignmentService {

  static final String INACTIVE_REVIEWER = "Analista inativo.";

  private final UserRepository userRepository;
  private final ProjectRepository projectRepository;
  private final FindingRepository findingRepository;
  private final ProjectEventService eventService;
  private final NotificationService notificationService;

  public ReviewAssignmentService(
      UserRepository userRepository,
      ProjectRepository projectRepository,
      FindingRepository findingRepository,
      ProjectEventService eventService,
      NotificationService notificationService) {
    this.userRepository = userRepository;
    this.projectRepository = projectRepository;
    this.findingRepository = findingRepository;
    this.eventService = eventService;
    this.notificationService = notificationService;
  }

  /** All or nothing: every project is checked before any of them changes. */
  @Transactional
  public void assign(List<Long> projectIds, Long reviewerId, AuthenticatedUser caller) {
    caller.requireAdmin();
    User reviewer = assignableReviewer(reviewerId);
    // Locked in id order: overlapping batches in opposite orders would deadlock.
    List<Project> projects =
        projectIds.stream()
            .distinct()
            .sorted()
            .map(id -> assignableProject(id, reviewer))
            .filter(project -> !project.isAssignedTo(reviewer.getId()))
            .toList();
    User manager =
        userRepository
            .findById(caller.id())
            .orElseThrow(() -> new NotFoundException("Usuário autenticado não encontrado."));
    OffsetDateTime assignedAt = Timestamps.now();

    projects.forEach(
        project -> {
          handOver(project, reviewer);
          project.assignReviewer(reviewer);
          eventService.assigned(project, manager, assignedAt);
        });
    findingRepository
        .findAllByProjectIdInAndStatus(
            projects.stream().map(Project::getId).toList(), FindingStatus.DRAFT)
        .forEach(finding -> finding.reassignTo(reviewer));
  }

  /** The analyst who rejected gets the project back; otherwise it waits for the manager. */
  @Transactional
  public void distribute(Project project, OffsetDateTime submittedAt) {
    Optional.ofNullable(project.getReviewer())
        .filter(project::canBeReviewedBy)
        .ifPresentOrElse(
            reviewer -> {
              handOver(project, reviewer);
              project.assignReviewer(reviewer);
              eventService.assigned(project, null, submittedAt);
            },
            () -> {
              handOver(project, null);
              project.clearReviewer();
            });
  }

  /** The analyst losing the project can no longer open it, so their notices stop leading there. */
  private void handOver(Project project, User nextReviewer) {
    User previous = project.getReviewer();
    // The manager reaches every project, so only an analyst's links break.
    if (previous == null || previous.getRole() != UserRole.REVIEWER) {
      return;
    }
    if (nextReviewer == null || !previous.getId().equals(nextReviewer.getId())) {
      notificationService.handedOver(project, previous);
    }
  }

  private User assignableReviewer(Long reviewerId) {
    User reviewer =
        userRepository
            .findById(reviewerId)
            .orElseThrow(() -> new NotFoundException("Analista não encontrado."));
    if (!reviewer.getRole().canReview()) {
      throw new BusinessException(
          "O usuário informado não é um analista.", HttpStatus.UNPROCESSABLE_CONTENT);
    }
    if (!reviewer.isActive()) {
      throw new BusinessException(INACTIVE_REVIEWER, HttpStatus.UNPROCESSABLE_CONTENT);
    }

    return reviewer;
  }

  private Project assignableProject(Long projectId, User reviewer) {
    Project project =
        projectRepository
            .lockById(projectId)
            .orElseThrow(() -> new NotFoundException("Projeto não encontrado."));
    if (!project.isUnderReview()) {
      throw new BusinessException("O projeto não está em análise.", HttpStatus.CONFLICT);
    }
    if (!project.canBeReviewedBy(reviewer)) {
      throw new BusinessException(
          "O analista não pode analisar um projeto próprio.", HttpStatus.UNPROCESSABLE_CONTENT);
    }

    return project;
  }
}
