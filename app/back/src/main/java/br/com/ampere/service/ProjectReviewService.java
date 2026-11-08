package br.com.ampere.service;

import br.com.ampere.domain.Finding;
import br.com.ampere.domain.Project;
import br.com.ampere.domain.ReviewDecision;
import br.com.ampere.error.BusinessException;
import br.com.ampere.repository.FindingRepository;
import br.com.ampere.utils.Timestamps;
import java.time.OffsetDateTime;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ProjectReviewService {

  private static final String NOT_UNDER_REVIEW = "O projeto não está em análise.";

  private final ProjectService projectService;
  private final FindingRepository findingRepository;
  private final ProjectEventService eventService;
  private final NotificationService notificationService;
  private final ProjectVersionService versionService;

  public ProjectReviewService(
      ProjectService projectService,
      FindingRepository findingRepository,
      ProjectEventService eventService,
      NotificationService notificationService,
      ProjectVersionService versionService) {
    this.projectService = projectService;
    this.findingRepository = findingRepository;
    this.eventService = eventService;
    this.notificationService = notificationService;
    this.versionService = versionService;
  }

  /** Only the analyst assigned by the manager or by the distribution opens the review. */
  @Transactional(readOnly = true)
  public Project open(Long projectId, AuthenticatedUser user) {
    user.requireReviewer();
    Project project = projectService.findById(projectId, user);
    notOwnProjectOrFail(project, user);
    if (!project.isUnderReview()) {
      throw new BusinessException(NOT_UNDER_REVIEW, HttpStatus.CONFLICT);
    }
    if (!project.isAssignedTo(user.id())) {
      throw new BusinessException(
          "Somente o analista responsável pode abrir a análise.", HttpStatus.FORBIDDEN);
    }

    return project;
  }

  @Transactional
  public Project decide(
      Long projectId, ReviewDecision decision, String opinion, AuthenticatedUser user) {
    Project project = assignedProject(projectId, user);
    List<Finding> findings =
        findingRepository.findAllByProjectIdOrderByCreatedAtAscIdAsc(projectId);
    if (findings.stream().anyMatch(Finding::awaitsAnalyst)) {
      throw new BusinessException(
          "Aceite ou reabra os apontamentos respondidos para concluir a análise.",
          HttpStatus.UNPROCESSABLE_CONTENT);
    }
    // Pending adjustments do not hold the approval back: they stay on the project as reservations.
    if (decision == ReviewDecision.APPROVE && findings.stream().anyMatch(Finding::blocksApproval)) {
      throw new BusinessException(
          "Resolva ou exclua os apontamentos bloqueantes para aprovar.",
          HttpStatus.UNPROCESSABLE_CONTENT);
    }
    if (decision == ReviewDecision.REJECT && findings.stream().noneMatch(Finding::isPending)) {
      throw new BusinessException(
          "A reprovação exige ao menos um apontamento.", HttpStatus.UNPROCESSABLE_CONTENT);
    }

    findings.stream().filter(Finding::isDraft).forEach(Finding::publish);
    OffsetDateTime reviewedAt = Timestamps.now();
    if (decision == ReviewDecision.APPROVE) {
      project.approve(reviewedAt, opinion);
      List<Finding> reservations =
          findings.stream().filter(finding -> !finding.isResolved()).toList();
      if (!reservations.isEmpty()) {
        versionService.issueApprovalMemorial(project, reservations, reviewedAt);
      }
    } else {
      project.reject(reviewedAt, opinion);
    }
    eventService.decided(project, decision, project.getReviewer(), findings, opinion, reviewedAt);
    notificationService.decided(project, decision, findings, reviewedAt);

    return project;
  }

  /** The project under review, as long as the caller is its assigned analyst. */
  Project assignedProject(Long projectId, AuthenticatedUser user) {
    user.requireReviewer();
    Project project = projectService.findById(projectId, user);
    notOwnProjectOrFail(project, user);
    if (!project.isAssignedTo(user.id())) {
      throw new BusinessException(
          "Somente o analista responsável pode alterar esta análise.", HttpStatus.FORBIDDEN);
    }
    if (!project.isUnderReview()) {
      throw new BusinessException(NOT_UNDER_REVIEW, HttpStatus.CONFLICT);
    }

    return project;
  }

  private static void notOwnProjectOrFail(Project project, AuthenticatedUser user) {
    if (project.isOwnedBy(user.id())) {
      throw new BusinessException("Você não pode analisar um projeto seu.", HttpStatus.FORBIDDEN);
    }
  }
}
