package br.com.ampere.service;

import br.com.ampere.domain.Finding;
import br.com.ampere.domain.FindingStatus;
import br.com.ampere.domain.Project;
import br.com.ampere.domain.ReviewDecision;
import br.com.ampere.domain.User;
import br.com.ampere.dto.ReviewDecisionRequest;
import br.com.ampere.error.BusinessException;
import br.com.ampere.error.NotFoundException;
import br.com.ampere.repository.FindingRepository;
import br.com.ampere.repository.UserRepository;
import br.com.ampere.security.AuthenticatedUser;
import br.com.ampere.security.CurrentUser;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ProjectReviewService {

  private static final String ANALYST_ONLY = "Somente analistas podem assumir uma análise.";
  private static final String USER_NOT_FOUND = "Usuário autenticado não encontrado.";

  private final ProjectService projectService;
  private final UserRepository userRepository;
  private final FindingRepository findingRepository;
  private final CurrentUser currentUser;

  public ProjectReviewService(
      ProjectService projectService,
      UserRepository userRepository,
      FindingRepository findingRepository,
      CurrentUser currentUser) {
    this.projectService = projectService;
    this.userRepository = userRepository;
    this.findingRepository = findingRepository;
    this.currentUser = currentUser;
  }

  @Transactional
  public Project assign(Long projectId) {
    AuthenticatedUser actor = requireAnalyst();
    Project project = projectService.findById(projectId);
    User reviewer =
        userRepository
            .findById(actor.id())
            .orElseThrow(() -> new NotFoundException(USER_NOT_FOUND));

    try {
      project.assignReviewer(reviewer);
    } catch (IllegalStateException invalidAssignment) {
      throw new BusinessException(assignmentMessage(project), HttpStatus.CONFLICT);
    }

    return project;
  }

  @Transactional
  public Project decide(Long projectId, ReviewDecisionRequest request) {
    Project project = assignedProject(projectId);
    List<Finding> findings =
        findingRepository.findAllByProjectIdOrderByCreatedAtAscIdAsc(projectId);

    if (request.decision() == ReviewDecision.APPROVE
        && findings.stream().anyMatch(Finding::isOpenBlocking)) {
      throw new BusinessException(
          "O projeto possui apontamento bloqueante em aberto.", HttpStatus.UNPROCESSABLE_ENTITY);
    }

    boolean hasFindingInCurrentVersion =
        findings.stream()
            .anyMatch(
                finding ->
                    finding.getVersion() == project.getReviewCycle()
                        && finding.getStatus() != FindingStatus.RESOLVED);
    if (request.decision() == ReviewDecision.REJECT && !hasFindingInCurrentVersion) {
      throw new BusinessException(
          "A reprovação exige ao menos um apontamento.", HttpStatus.UNPROCESSABLE_ENTITY);
    }

    findings.stream().filter(Finding::isDraft).forEach(Finding::publish);
    OffsetDateTime reviewedAt = OffsetDateTime.now(ZoneOffset.UTC);
    if (request.decision() == ReviewDecision.APPROVE) {
      project.approve(reviewedAt, request.opinion());
    } else {
      project.reject(reviewedAt, request.opinion());
    }

    return project;
  }

  AuthenticatedUser requireAnalyst() {
    AuthenticatedUser actor = currentUser.get();
    if (!actor.isAdmin()) {
      throw new BusinessException(ANALYST_ONLY, HttpStatus.FORBIDDEN);
    }
    return actor;
  }

  Project assignedProject(Long projectId) {
    AuthenticatedUser actor = requireAnalyst();
    Project project = projectService.findById(projectId);
    if (!project.isAssignedTo(actor.id())) {
      throw new BusinessException(
          "Somente o analista responsável pode alterar esta análise.", HttpStatus.FORBIDDEN);
    }
    if (!project.isUnderReview()) {
      throw new BusinessException("O projeto não está em análise.", HttpStatus.CONFLICT);
    }
    return project;
  }

  private static String assignmentMessage(Project project) {
    return project.getReviewer() == null
        ? "Somente projetos em análise podem ser atribuídos."
        : "Este projeto já foi assumido por outro analista.";
  }
}
