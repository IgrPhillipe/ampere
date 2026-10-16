package br.com.ampere.service;

import br.com.ampere.domain.ConsumerUnitGroup;
import br.com.ampere.domain.Project;
import br.com.ampere.error.BusinessException;
import br.com.ampere.error.NotFoundException;
import br.com.ampere.repository.ConsumerUnitGroupRepository;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ConsumerUnitGroupService {

  private static final String NOT_FOUND = "Grupo de unidades não encontrado.";
  private static final String NOT_DRAFT =
      "Só é possível alterar as unidades de um projeto em rascunho.";

  private final ConsumerUnitGroupRepository groupRepository;
  private final ProjectService projectService;

  public ConsumerUnitGroupService(
      ConsumerUnitGroupRepository groupRepository, ProjectService projectService) {
    this.groupRepository = groupRepository;
    this.projectService = projectService;
  }

  @Transactional(readOnly = true)
  public List<ConsumerUnitGroup> list(Long projectId, AuthenticatedUser user) {
    projectService.findById(projectId, user);

    return groupRepository.findAllByProjectIdOrderById(projectId);
  }

  @Transactional(readOnly = true)
  public GroupValidation validation(Long projectId, AuthenticatedUser user) {
    return GroupValidation.of(list(projectId, user));
  }

  @Transactional
  public ConsumerUnitGroup create(
      Long projectId, GroupParameters parameters, AuthenticatedUser user) {
    Project project = projectService.draftOrFail(projectId, NOT_DRAFT, user);

    return groupRepository.save(parameters.kind().create(project, parameters.spec()));
  }

  @Transactional
  public ConsumerUnitGroup update(
      Long projectId, Long groupId, GroupParameters parameters, AuthenticatedUser user) {
    projectService.draftOrFail(projectId, NOT_DRAFT, user);
    ConsumerUnitGroup group = findOrFail(projectId, groupId);
    if (group.kind() != parameters.kind()) {
      throw new BusinessException(
          "O tipo de um grupo não muda. Exclua o grupo e cadastre outro.", HttpStatus.CONFLICT);
    }

    group.update(parameters.spec());

    return group;
  }

  @Transactional
  public void delete(Long projectId, Long groupId, AuthenticatedUser user) {
    projectService.draftOrFail(projectId, NOT_DRAFT, user);

    groupRepository.delete(findOrFail(projectId, groupId));
  }

  private ConsumerUnitGroup findOrFail(Long projectId, Long groupId) {
    return groupRepository
        .findByIdAndProjectId(groupId, projectId)
        .orElseThrow(() -> new NotFoundException(NOT_FOUND));
  }
}
