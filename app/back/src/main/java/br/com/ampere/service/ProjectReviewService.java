package br.com.ampere.service;

import br.com.ampere.domain.Finding;
import br.com.ampere.domain.Project;
import br.com.ampere.domain.ReviewDecision;
import br.com.ampere.domain.User;
import br.com.ampere.error.BusinessException;
import br.com.ampere.error.NotFoundException;
import br.com.ampere.repository.FindingRepository;
import br.com.ampere.repository.UserRepository;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ProjectReviewService {

  private static final String NOT_UNDER_REVIEW = "O projeto não está em análise.";

  private final ProjectService projectService;
  private final UserRepository userRepository;
  private final FindingRepository findingRepository;
  private final ProjectEventService eventService;

  public ProjectReviewService(
      ProjectService projectService,
      UserRepository userRepository,
      FindingRepository findingRepository,
      ProjectEventService eventService) {
    this.projectService = projectService;
    this.userRepository = userRepository;
    this.findingRepository = findingRepository;
    this.eventService = eventService;
  }

  /** Assigning again to the same analyst changes nothing. */
  @Transactional
  public Project assign(Long projectId, AuthenticatedUser user) {
    user.requireReviewer();
    Project project = projectService.findById(projectId, user);
    if (project.isOwnedBy(user.id())) {
      throw new BusinessException("Você não pode analisar um projeto seu.", HttpStatus.FORBIDDEN);
    }
    if (!project.isUnderReview()) {
      throw new BusinessException(NOT_UNDER_REVIEW, HttpStatus.CONFLICT);
    }
    if (project.getReviewer() != null && !project.isAssignedTo(user.id())) {
      throw new BusinessException(
          "Este projeto já foi assumido por outro analista.", HttpStatus.CONFLICT);
    }

    if (project.getReviewer() == null) {
      User reviewer =
          userRepository
              .findById(user.id())
              .orElseThrow(() -> new NotFoundException("Usuário autenticado não encontrado."));
      project.assignReviewer(reviewer);
      eventService.assigned(project, reviewer, OffsetDateTime.now(ZoneOffset.UTC));
    }

    return project;
  }

  @Transactional
  public Project decide(
      Long projectId, ReviewDecision decision, String opinion, AuthenticatedUser user) {
    Project project = assignedProject(projectId, user);
    List<Finding> findings =
        findingRepository.findAllByProjectIdOrderByCreatedAtAscIdAsc(projectId);
    // One decision at a time: a pending finding asks for a rejection, a resolved set for approval.
    if (decision == ReviewDecision.APPROVE && !findings.stream().allMatch(Finding::isResolved)) {
      throw new BusinessException(
          "Para aprovar, todos os apontamentos precisam estar resolvidos.",
          HttpStatus.UNPROCESSABLE_CONTENT);
    }
    if (decision == ReviewDecision.REJECT && findings.stream().noneMatch(Finding::isPending)) {
      throw new BusinessException(
          "A reprovação exige ao menos um apontamento.", HttpStatus.UNPROCESSABLE_CONTENT);
    }

    findings.stream().filter(Finding::isDraft).forEach(Finding::publish);
    OffsetDateTime reviewedAt = OffsetDateTime.now(ZoneOffset.UTC);
    if (decision == ReviewDecision.APPROVE) {
      project.approve(reviewedAt, opinion);
    } else {
      project.reject(reviewedAt, opinion);
    }
    eventService.decided(project, decision, project.getReviewer(), findings, opinion, reviewedAt);

    return project;
  }

  /** The project under review, as long as the caller is the analyst who took it. */
  Project assignedProject(Long projectId, AuthenticatedUser user) {
    user.requireReviewer();
    Project project = projectService.findById(projectId, user);
    if (!project.isAssignedTo(user.id())) {
      throw new BusinessException(
          "Somente o analista responsável pode alterar esta análise.", HttpStatus.FORBIDDEN);
    }
    if (!project.isUnderReview()) {
      throw new BusinessException(NOT_UNDER_REVIEW, HttpStatus.CONFLICT);
    }

    return project;
  }
}
