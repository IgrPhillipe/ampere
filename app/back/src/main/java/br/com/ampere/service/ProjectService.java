package br.com.ampere.service;

import br.com.ampere.domain.BuildingType;
import br.com.ampere.domain.FindingStatus;
import br.com.ampere.domain.Project;
import br.com.ampere.domain.ProjectStatus;
import br.com.ampere.domain.SortDirection;
import br.com.ampere.error.BusinessException;
import br.com.ampere.error.NotFoundException;
import br.com.ampere.repository.CalculationRepository;
import br.com.ampere.repository.ConsumerUnitGroupRepository;
import br.com.ampere.repository.FindingRepository;
import br.com.ampere.repository.ProjectDocumentRepository;
import br.com.ampere.repository.ProjectRepository;
import br.com.ampere.utils.SearchTerms;
import java.math.BigDecimal;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ProjectService {

  private static final Logger log = LoggerFactory.getLogger(ProjectService.class);

  private static final int PROTOCOL_ATTEMPTS = 3;
  private static final String NOT_FOUND = "Projeto não encontrado.";
  private static final String ANALYST_READ_ONLY =
      "O perfil analista só consulta os projetos enviados para análise.";

  /** What the designer still has to answer: drafts are hidden, an approval closes the rest. */
  private static final List<FindingStatus> OPEN_FINDINGS =
      List.of(FindingStatus.OPEN, FindingStatus.CONTESTED);

  private final ProjectRepository projectRepository;
  private final FindingRepository findingRepository;
  private final ConsumerUnitGroupRepository groupRepository;
  private final CalculationRepository calculationRepository;
  private final ProjectDocumentRepository documentRepository;
  private final ProjectCreation projectCreation;
  private final ApplicableStandards applicableStandards;

  public ProjectService(
      ProjectRepository projectRepository,
      FindingRepository findingRepository,
      ConsumerUnitGroupRepository groupRepository,
      CalculationRepository calculationRepository,
      ProjectDocumentRepository documentRepository,
      ProjectCreation projectCreation,
      ApplicableStandards applicableStandards) {
    this.projectRepository = projectRepository;
    this.findingRepository = findingRepository;
    this.groupRepository = groupRepository;
    this.calculationRepository = calculationRepository;
    this.documentRepository = documentRepository;
    this.projectCreation = projectCreation;
    this.applicableStandards = applicableStandards;
  }

  @Transactional(readOnly = true)
  public ProjectListing list(
      int page,
      int pageSize,
      ProjectStatus status,
      String search,
      SortDirection sort,
      AuthenticatedUser user) {
    Sort.Direction direction = Sort.Direction.valueOf(sort.name());
    PageRequest pageRequest =
        PageRequest.of(
            page - 1, pageSize, Sort.by(direction, "updatedAt").and(Sort.by(direction, "id")));
    Page<Project> projects =
        projectRepository.searchAccessibleProjects(
            status, SearchTerms.normalize(search), user.id(), user.isAdmin(), pageRequest);

    List<Long> projectIds = projects.getContent().stream().map(Project::getId).toList();

    return new ProjectListing(
        projects.getContent(),
        projects.getTotalElements(),
        countPendingFindings(projectIds),
        countUnits(projectIds),
        latestDemands(projectIds));
  }

  @Transactional(readOnly = true)
  public Map<ProjectStatus, Long> countPerStatus(AuthenticatedUser user) {
    Map<ProjectStatus, Long> counts = new EnumMap<>(ProjectStatus.class);
    projectRepository
        .countAccessiblePerStatus(user.id(), user.isAdmin())
        .forEach(count -> counts.put(count.getStatus(), count.getTotal()));

    return Map.copyOf(counts);
  }

  @Transactional(readOnly = true)
  public Project findById(Long id, AuthenticatedUser user) {
    Project project =
        projectRepository.findDetailById(id).orElseThrow(() -> new NotFoundException(NOT_FOUND));
    boolean visible = user.isAdmin() ? project.wasSubmitted() : project.isOwnedBy(user.id());
    if (!visible) {
      // Same answer as a missing id, so another owner's project is not revealed.
      throw new NotFoundException(NOT_FOUND);
    }

    return project;
  }

  public Project create(ProjectParameters parameters, AuthenticatedUser user) {
    designerOrFail(user);
    for (int attempt = 1; attempt <= PROTOCOL_ATTEMPTS; attempt++) {
      try {
        return projectCreation.createWithGeneratedProtocol(parameters, user.id());
      } catch (DataIntegrityViolationException collision) {
        log.warn("Protocol collision on attempt {} of {}", attempt, PROTOCOL_ATTEMPTS);
      }
    }

    throw new BusinessException(
        "Não foi possível gerar o protocolo do projeto. Tente novamente.", HttpStatus.CONFLICT);
  }

  @Transactional
  public Project update(Long id, ProjectParameters parameters, AuthenticatedUser user) {
    Project project = editableOrFail(id, "Só é possível alterar um projeto em rascunho.", user);
    BuildingType buildingType = parameters.toBuildingType();

    project.rename(parameters.name(), parameters.address(), parameters.municipality());
    project.changeBuildingType(buildingType);
    project.applyStandards(applicableStandards.of(buildingType));

    return project;
  }

  @Transactional
  public void delete(Long id, AuthenticatedUser user) {
    Project project = draftOrFail(id, "Só é possível excluir um projeto em rascunho.", user);

    calculationRepository.deleteAllByProjectId(id);
    findingRepository.deleteAllByProjectId(id);
    groupRepository.deleteAllByProjectId(id);
    documentRepository.deleteAllByProjectId(id);
    projectRepository.delete(project);
  }

  Project editableOrFail(Long id, String message, AuthenticatedUser user) {
    Project project = findWritableById(id, user);
    if (!project.isEditable()) {
      throw new BusinessException(message, HttpStatus.CONFLICT);
    }

    return project;
  }

  Project draftOrFail(Long id, String message, AuthenticatedUser user) {
    Project project = findWritableById(id, user);
    if (!project.isDraft()) {
      throw new BusinessException(message, HttpStatus.CONFLICT);
    }

    return project;
  }

  Project findWritableById(Long id, AuthenticatedUser user) {
    designerOrFail(user);

    return findById(id, user);
  }

  private static void designerOrFail(AuthenticatedUser user) {
    if (user.isAdmin()) {
      throw new BusinessException(ANALYST_READ_ONLY, HttpStatus.FORBIDDEN);
    }
  }

  private Map<Long, Long> countPendingFindings(List<Long> projectIds) {
    if (projectIds.isEmpty()) {
      return Map.of();
    }

    return findingRepository
        .countPerProject(projectIds, OPEN_FINDINGS, ProjectStatus.APPROVED)
        .stream()
        .collect(
            Collectors.toUnmodifiableMap(
                FindingRepository.FindingCount::getProjectId,
                FindingRepository.FindingCount::getTotal));
  }

  private Map<Long, Long> countUnits(List<Long> projectIds) {
    if (projectIds.isEmpty()) {
      return Map.of();
    }

    return groupRepository.countUnitsPerProject(projectIds).stream()
        .collect(
            Collectors.toUnmodifiableMap(
                ConsumerUnitGroupRepository.UnitCount::getProjectId,
                ConsumerUnitGroupRepository.UnitCount::getTotal));
  }

  private Map<Long, BigDecimal> latestDemands(List<Long> projectIds) {
    if (projectIds.isEmpty()) {
      return Map.of();
    }

    return calculationRepository.findLatestDemandPerProject(projectIds).stream()
        .collect(
            Collectors.toUnmodifiableMap(
                CalculationRepository.LatestDemand::getProjectId,
                CalculationRepository.LatestDemand::getDemand));
  }
}
