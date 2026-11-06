package br.com.ampere.service;

import br.com.ampere.domain.FindingStatus;
import br.com.ampere.domain.Project;
import br.com.ampere.domain.ReviewerMunicipality;
import br.com.ampere.domain.User;
import br.com.ampere.error.BusinessException;
import br.com.ampere.error.NotFoundException;
import br.com.ampere.repository.FindingRepository;
import br.com.ampere.repository.ProjectRepository;
import br.com.ampere.repository.ReviewerMunicipalityRepository;
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

  private final ReviewerMunicipalityRepository municipalityRepository;
  private final UserRepository userRepository;
  private final ProjectRepository projectRepository;
  private final FindingRepository findingRepository;
  private final ProjectEventService eventService;

  public ReviewAssignmentService(
      ReviewerMunicipalityRepository municipalityRepository,
      UserRepository userRepository,
      ProjectRepository projectRepository,
      FindingRepository findingRepository,
      ProjectEventService eventService) {
    this.municipalityRepository = municipalityRepository;
    this.userRepository = userRepository;
    this.projectRepository = projectRepository;
    this.findingRepository = findingRepository;
    this.eventService = eventService;
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
          project.assignReviewer(reviewer);
          eventService.assigned(project, manager, assignedAt);
        });
    findingRepository
        .findAllByProjectIdInAndStatus(
            projects.stream().map(Project::getId).toList(), FindingStatus.DRAFT)
        .forEach(finding -> finding.reassignTo(reviewer));
  }

  /** The analyst who rejected gets the project back; otherwise the municipality's analyst. */
  @Transactional
  public void distribute(Project project, OffsetDateTime submittedAt) {
    Optional.ofNullable(project.getReviewer())
        .filter(project::canBeReviewedBy)
        .or(() -> municipalityReviewerOf(project))
        .ifPresentOrElse(
            reviewer -> {
              project.assignReviewer(reviewer);
              eventService.assigned(project, null, submittedAt);
            },
            project::clearReviewer);
  }

  private Optional<User> municipalityReviewerOf(Project project) {
    return municipalityRepository
        .findByStateAndMunicipality(project.getState(), project.getMunicipality())
        .map(ReviewerMunicipality::getReviewer)
        .filter(project::canBeReviewedBy);
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
