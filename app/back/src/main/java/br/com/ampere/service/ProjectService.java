package br.com.ampere.service;

import br.com.ampere.domain.BuildingType;
import br.com.ampere.domain.Project;
import br.com.ampere.domain.ProjectStatus;
import br.com.ampere.error.BusinessException;
import br.com.ampere.error.NotFoundException;
import br.com.ampere.repository.FindingRepository;
import br.com.ampere.repository.ProjectRepository;
import br.com.ampere.utils.SearchTerms;
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

  private static final Sort NEWEST_FIRST =
      Sort.by(Sort.Direction.DESC, "updatedAt").and(Sort.by(Sort.Direction.DESC, "id"));

  private static final int PROTOCOL_ATTEMPTS = 3;
  private static final String NOT_FOUND = "Projeto não encontrado.";

  private final ProjectRepository projectRepository;
  private final FindingRepository findingRepository;
  private final ProjectCreation projectCreation;
  private final ApplicableStandards applicableStandards;

  public ProjectService(
      ProjectRepository projectRepository,
      FindingRepository findingRepository,
      ProjectCreation projectCreation,
      ApplicableStandards applicableStandards) {
    this.projectRepository = projectRepository;
    this.findingRepository = findingRepository;
    this.projectCreation = projectCreation;
    this.applicableStandards = applicableStandards;
  }

  @Transactional(readOnly = true)
  public ProjectListing list(int page, int pageSize, ProjectStatus status, String search) {
    PageRequest pageRequest = PageRequest.of(page - 1, pageSize, NEWEST_FIRST);
    Page<Project> projects =
        projectRepository.searchProjects(status, SearchTerms.normalize(search), pageRequest);

    return new ProjectListing(
        projects.getContent(),
        projects.getTotalElements(),
        countPendingFindings(projects.getContent()));
  }

  @Transactional(readOnly = true)
  public Map<ProjectStatus, Long> countPerStatus() {
    Map<ProjectStatus, Long> counts = new EnumMap<>(ProjectStatus.class);
    projectRepository
        .countPerStatus()
        .forEach(count -> counts.put(count.getStatus(), count.getTotal()));

    return Map.copyOf(counts);
  }

  @Transactional(readOnly = true)
  public Project findById(Long id) {
    return projectRepository.findDetailById(id).orElseThrow(() -> new NotFoundException(NOT_FOUND));
  }

  public Project create(ProjectParameters parameters) {
    for (int attempt = 1; attempt <= PROTOCOL_ATTEMPTS; attempt++) {
      try {
        return projectCreation.createWithGeneratedProtocol(parameters);
      } catch (DataIntegrityViolationException collision) {
        log.warn("Protocol collision on attempt {} of {}", attempt, PROTOCOL_ATTEMPTS);
      }
    }

    throw new BusinessException(
        "Não foi possível gerar o protocolo do projeto. Tente novamente.", HttpStatus.CONFLICT);
  }

  @Transactional
  public Project update(Long id, ProjectParameters parameters) {
    Project project = draftOrFail(id, "Só é possível alterar um projeto em rascunho.");
    BuildingType buildingType = parameters.toBuildingType();

    project.rename(parameters.name(), parameters.address(), parameters.municipality());
    project.changeBuildingType(buildingType);
    project.applyStandards(applicableStandards.of(buildingType));

    return project;
  }

  @Transactional
  public void delete(Long id) {
    Project project = draftOrFail(id, "Só é possível excluir um projeto em rascunho.");

    findingRepository.deleteAllByProjectId(id);
    projectRepository.delete(project);
  }

  private Project draftOrFail(Long id, String message) {
    Project project = findById(id);
    if (!project.isDraft()) {
      throw new BusinessException(message, HttpStatus.CONFLICT);
    }

    return project;
  }

  private Map<Long, Long> countPendingFindings(List<Project> projects) {
    List<Long> projectIds = projects.stream().map(Project::getId).toList();
    if (projectIds.isEmpty()) {
      return Map.of();
    }

    return findingRepository.countPerProject(projectIds).stream()
        .collect(
            Collectors.toUnmodifiableMap(
                FindingRepository.FindingCount::getProjectId,
                FindingRepository.FindingCount::getTotal));
  }
}
