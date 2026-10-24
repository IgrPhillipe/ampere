package br.com.ampere.service;

import br.com.ampere.domain.BuildingType;
import br.com.ampere.domain.FindingStatus;
import br.com.ampere.domain.Project;
import br.com.ampere.domain.ProjectStatus;
import br.com.ampere.error.BusinessException;
import br.com.ampere.error.NotFoundException;
import br.com.ampere.repository.CalculationRepository;
import br.com.ampere.repository.ConsumerUnitGroupRepository;
import br.com.ampere.repository.FindingRepository;
import br.com.ampere.repository.ProjectDocumentRepository;
import br.com.ampere.repository.ProjectRepository;
import br.com.ampere.repository.ProjectRepositoryCustom.ProjectSearch;
import br.com.ampere.utils.SearchTerms;
import java.math.BigDecimal;
import java.text.Collator;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.EnumMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.TreeMap;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
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
      int page, int pageSize, ProjectListQuery query, AuthenticatedUser user) {
    if (query.createdFrom() != null
        && query.createdTo() != null
        && query.createdFrom().isAfter(query.createdTo())) {
      throw new BusinessException("A data inicial deve ser anterior ou igual à data final.");
    }

    Page<Project> projects =
        projectRepository.searchAccessibleProjects(
            new ProjectSearch(
                user.id(),
                user.projectVisibility(),
                query.status(),
                SearchTerms.normalize(query.search()),
                query.municipality(),
                startOf(query.createdFrom()),
                query.createdTo() == null ? null : startOf(query.createdTo().plusDays(1)),
                query.findings(),
                query.sort(),
                query.direction()),
            PageRequest.of(page - 1, pageSize));

    List<Long> projectIds = projects.getContent().stream().map(Project::getId).toList();

    return new ProjectListing(
        projects.getContent(),
        projects.getTotalElements(),
        countPendingFindings(projectIds),
        countUnits(projectIds),
        latestDemands(projectIds));
  }

  @Transactional(readOnly = true)
  public List<String> listMunicipalities(AuthenticatedUser user) {
    // Spellings differing only in case collapse into the first in code point order.
    Collator collator = Collator.getInstance(Locale.of("pt", "BR"));
    collator.setStrength(Collator.SECONDARY);
    Map<String, String> unique = new TreeMap<>(collator);
    projectRepository.findAccessibleMunicipalities(user.id(), user.projectVisibility()).stream()
        .map(String::trim)
        .forEach(municipality -> unique.merge(municipality, municipality, ProjectService::first));

    return List.copyOf(unique.values());
  }

  @Transactional(readOnly = true)
  public Map<ProjectStatus, Long> countPerStatus(AuthenticatedUser user) {
    Map<ProjectStatus, Long> counts = new EnumMap<>(ProjectStatus.class);
    projectRepository
        .countAccessiblePerStatus(user.id(), user.projectVisibility())
        .forEach(count -> counts.put(count.getStatus(), count.getTotal()));

    return Map.copyOf(counts);
  }

  @Transactional(readOnly = true)
  public Project findById(Long id, AuthenticatedUser user) {
    Project project =
        projectRepository.findDetailById(id).orElseThrow(() -> new NotFoundException(NOT_FOUND));
    if (!isVisibleTo(project, user)) {
      // Same answer as a missing id, so another owner's project is not revealed.
      throw new NotFoundException(NOT_FOUND);
    }

    return project;
  }

  public Project create(ProjectParameters parameters, AuthenticatedUser user) {
    writerOrFail(user);
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
    Project project =
        editableOrFail(id, "Só é possível alterar um projeto em rascunho ou reprovado.", user);
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

  /** The admin edits a project in any status; the designer only a draft or a rejection. */
  Project editableOrFail(Long id, String message, AuthenticatedUser user) {
    Project project = findWritableById(id, user);
    if (!project.isEditable() && !user.isAdmin()) {
      throw new BusinessException(message, HttpStatus.CONFLICT);
    }

    return project;
  }

  /** The admin deletes a project in any status; the designer only a draft. */
  Project draftOrFail(Long id, String message, AuthenticatedUser user) {
    Project project = findWritableById(id, user);
    if (!project.isDraft() && !user.isAdmin()) {
      throw new BusinessException(message, HttpStatus.CONFLICT);
    }

    return project;
  }

  Project findWritableById(Long id, AuthenticatedUser user) {
    writerOrFail(user);

    return findById(id, user);
  }

  private static boolean isVisibleTo(Project project, AuthenticatedUser user) {
    return switch (user.projectVisibility()) {
      case OWN -> project.isOwnedBy(user.id());
      case SUBMITTED -> project.wasSubmitted();
      case ALL -> true;
    };
  }

  private static void writerOrFail(AuthenticatedUser user) {
    if (user.isReviewer()) {
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

  private static OffsetDateTime startOf(LocalDate day) {
    return day == null ? null : day.atStartOfDay(ReviewQueueService.ZONE).toOffsetDateTime();
  }

  private static String first(String kept, String other) {
    return kept.compareTo(other) <= 0 ? kept : other;
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
