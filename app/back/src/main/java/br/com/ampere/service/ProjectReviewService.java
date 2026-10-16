package br.com.ampere.service;

import br.com.ampere.domain.Finding;
import br.com.ampere.domain.Project;
import br.com.ampere.domain.ReviewDecision;
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

  public ProjectReviewService(
      ProjectService projectService,
      UserRepository userRepository,
      FindingRepository findingRepository) {
    this.projectService = projectService;
    this.userRepository = userRepository;
    this.findingRepository = findingRepository;
  }

  /** Assigning again to the same analyst changes nothing. */
  @Transactional
  public Project assign(Long projectId, AuthenticatedUser user) {
    Project project = projectService.findById(projectId, user);
    if (!project.isUnderReview()) {
      throw new BusinessException(NOT_UNDER_REVIEW, HttpStatus.CONFLICT);
    }
    if (project.getReviewer() != null && !project.isAssignedTo(user.id())) {
      throw new BusinessException(
          "Este projeto já foi assumido por outro analista.", HttpStatus.CONFLICT);
    }

    project.assignReviewer(
        userRepository
            .findById(user.id())
            .orElseThrow(() -> new NotFoundException("Usuário autenticado não encontrado.")));

    return project;
  }

  @Transactional
  public Project decide(
      Long projectId, ReviewDecision decision, String opinion, AuthenticatedUser user) {
    Project project = assignedProject(projectId, user);
    List<Finding> findings =
        findingRepository.findAllByProjectIdOrderByCreatedAtAscIdAsc(projectId);
    if (decision == ReviewDecision.APPROVE && findings.stream().anyMatch(Finding::isOpenBlocking)) {
      throw new BusinessException(
          "O projeto possui apontamento bloqueante em aberto.", HttpStatus.UNPROCESSABLE_CONTENT);
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

    return project;
  }

  /** The project under review, as long as the caller is the analyst who took it. */
  Project assignedProject(Long projectId, AuthenticatedUser user) {
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
