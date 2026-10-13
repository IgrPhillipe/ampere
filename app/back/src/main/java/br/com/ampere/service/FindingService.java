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

  @Transactional(readOnly = true)
  public List<Finding> list(Long projectId) {
    projectService.findById(projectId);
    return findingRepository.findAllByProjectIdOrderByCreatedAtAscIdAsc(projectId);
  }

  @Transactional
  public Finding create(Long projectId, FindingParameters parameters) {
    Project project = reviewService.assignedProject(projectId);
    ConsumerUnitGroup group = referencedGroup(projectId, parameters.consumerUnitGroupId());
    return findingRepository.save(
        new Finding(
            project,
            parameters.severity(),
            parameters.stage(),
            group,
            parameters.calculationStepCode(),
            parameters.documentType(),
            parameters.description(),
            parameters.standardItem(),
            project.getReviewer(),
            project.getReviewCycle()));
  }

  @Transactional
  public Finding update(Long projectId, Long findingId, FindingParameters parameters) {
    reviewService.assignedProject(projectId);
    Finding finding = draftOrFail(projectId, findingId);
    ConsumerUnitGroup group = referencedGroup(projectId, parameters.consumerUnitGroupId());
    finding.updateDraft(
        parameters.severity(),
        parameters.stage(),
        group,
        parameters.calculationStepCode(),
        parameters.documentType(),
        parameters.description(),
        parameters.standardItem());
    return finding;
  }

  @Transactional
  public void delete(Long projectId, Long findingId) {
    reviewService.assignedProject(projectId);
    findingRepository.delete(draftOrFail(projectId, findingId));
  }

  @Transactional
  public Finding resolve(Long projectId, Long findingId, FindingResolution resolution) {
    Project project = reviewService.assignedProject(projectId);
    Finding finding = findOrFail(projectId, findingId);
    if (finding.getVersion() >= project.getReviewCycle()) {
      throw new BusinessException(
          "Somente apontamentos de ciclos anteriores podem ser resolvidos na reanálise.",
          HttpStatus.CONFLICT);
    }

    try {
      finding.resolve(resolution);
    } catch (IllegalStateException invalidState) {
      throw new BusinessException(invalidState.getMessage(), HttpStatus.CONFLICT);
    }
    return finding;
  }

  Finding findOrFail(Long projectId, Long findingId) {
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

  private ConsumerUnitGroup referencedGroup(Long projectId, Long groupId) {
    if (groupId == null) {
      return null;
    }
    return groupRepository
        .findByIdAndProjectId(groupId, projectId)
        .orElseThrow(() -> new NotFoundException("Grupo de unidades não encontrado."));
  }
}
