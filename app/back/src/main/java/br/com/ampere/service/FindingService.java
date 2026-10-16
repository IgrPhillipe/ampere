package br.com.ampere.service;

import br.com.ampere.domain.ConsumerUnitGroup;
import br.com.ampere.domain.Finding;
import br.com.ampere.domain.FindingResolution;
import br.com.ampere.domain.Project;
import br.com.ampere.error.BusinessException;
import br.com.ampere.error.NotFoundException;
import br.com.ampere.repository.ConsumerUnitGroupRepository;
import br.com.ampere.repository.FindingRepository;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class FindingService {

  private static final String NOT_FOUND = "Apontamento não encontrado.";
  private static final String NOT_DRAFT =
      "Somente apontamentos em rascunho podem ser alterados ou excluídos.";

  private final FindingRepository findingRepository;
  private final ConsumerUnitGroupRepository groupRepository;
  private final ProjectService projectService;
  private final ProjectReviewService reviewService;

  public FindingService(
      FindingRepository findingRepository,
      ConsumerUnitGroupRepository groupRepository,
      ProjectService projectService,
      ProjectReviewService reviewService) {
    this.findingRepository = findingRepository;
    this.groupRepository = groupRepository;
    this.projectService = projectService;
    this.reviewService = reviewService;
  }

  /** The designer sees a finding only after the decision publishes it. */
  @Transactional(readOnly = true)
  public List<Finding> list(Long projectId, AuthenticatedUser user) {
    projectService.findById(projectId, user);

    return findingRepository.findAllByProjectIdOrderByCreatedAtAscIdAsc(projectId).stream()
        .filter(finding -> user.isAdmin() || !finding.isDraft())
        .toList();
  }

  @Transactional
  public Finding create(Long projectId, FindingParameters parameters, AuthenticatedUser user) {
    Project project = reviewService.assignedProject(projectId, user);

    return findingRepository.save(
        new Finding(
            project,
            parameters.severity(),
            parameters.stage(),
            referencedGroup(projectId, parameters),
            parameters.calculationStepCode(),
            parameters.documentType(),
            parameters.description(),
            parameters.standardItem(),
            project.getReviewer(),
            project.getReviewCycle()));
  }

  @Transactional
  public Finding update(
      Long projectId, Long findingId, FindingParameters parameters, AuthenticatedUser user) {
    reviewService.assignedProject(projectId, user);
    Finding finding = draftOrFail(projectId, findingId);
    finding.updateDraft(
        parameters.severity(),
        parameters.stage(),
        referencedGroup(projectId, parameters),
        parameters.calculationStepCode(),
        parameters.documentType(),
        parameters.description(),
        parameters.standardItem());

    return finding;
  }

  @Transactional
  public void delete(Long projectId, Long findingId, AuthenticatedUser user) {
    reviewService.assignedProject(projectId, user);
    findingRepository.delete(draftOrFail(projectId, findingId));
  }

  @Transactional
  public Finding resolve(
      Long projectId, Long findingId, FindingResolution resolution, AuthenticatedUser user) {
    Project project = reviewService.assignedProject(projectId, user);
    Finding finding = findOrFail(projectId, findingId);
    if (finding.getVersion() >= project.getReviewCycle()) {
      throw new BusinessException(
          "Somente apontamentos de ciclos anteriores podem ser resolvidos na reanálise.",
          HttpStatus.CONFLICT);
    }

    finding.resolve(resolution);

    return finding;
  }

  private Finding findOrFail(Long projectId, Long findingId) {
    return findingRepository
        .findByIdAndProjectId(findingId, projectId)
        .orElseThrow(() -> new NotFoundException(NOT_FOUND));
  }

  private Finding draftOrFail(Long projectId, Long findingId) {
    Finding finding = findOrFail(projectId, findingId);
    if (!finding.isDraft()) {
      throw new BusinessException(NOT_DRAFT, HttpStatus.CONFLICT);
    }

    return finding;
  }

  private ConsumerUnitGroup referencedGroup(Long projectId, FindingParameters parameters) {
    if (!parameters.referencesFitStage()) {
      throw new BusinessException("A referência não corresponde à etapa do apontamento.");
    }
    if (parameters.consumerUnitGroupId() == null) {
      return null;
    }

    return groupRepository
        .findByIdAndProjectId(parameters.consumerUnitGroupId(), projectId)
        .orElseThrow(() -> new NotFoundException("Grupo de unidades não encontrado."));
  }
}
