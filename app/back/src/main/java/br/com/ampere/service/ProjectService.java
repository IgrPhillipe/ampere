package br.com.ampere.service;

import br.com.ampere.domain.Project;
import br.com.ampere.domain.ProjectStatus;
import br.com.ampere.error.BusinessException;
import br.com.ampere.repository.FindingRepository;
import br.com.ampere.repository.ProjectRepository;
import br.com.ampere.utils.SearchTerms;
import java.util.EnumMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.stream.Collectors;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Project listing rules and orchestration. */
@Service
public class ProjectService {

  private static final String INVALID_STATUS_MESSAGE = "Status de projeto inválido.";

  private final ProjectRepository projectRepository;
  private final FindingRepository findingRepository;

  public ProjectService(ProjectRepository projectRepository, FindingRepository findingRepository) {
    this.projectRepository = projectRepository;
    this.findingRepository = findingRepository;
  }

  @Transactional(readOnly = true)
  public ProjectListing list(int page, int pageSize, String status, String search) {
    ProjectStatus parsedStatus = parseStatus(status);
    String normalizedSearch = SearchTerms.normalize(search);
    PageRequest pageRequest =
        PageRequest.of(
            page - 1,
            pageSize,
            Sort.by(Sort.Direction.DESC, "updatedAt").and(Sort.by(Sort.Direction.DESC, "id")));
    Page<Project> projects =
        projectRepository.searchProjects(parsedStatus, normalizedSearch, pageRequest);

    Map<Long, Long> pendingCounts = countPendingFindings(projects.getContent());
    Map<ProjectStatus, Long> statusCounts = countProjectsByStatus();
    return new ProjectListing(
        projects.getContent(), projects.getTotalElements(), pendingCounts, statusCounts);
  }

  private ProjectStatus parseStatus(String status) {
    if (status == null || status.isBlank()) {
      return null;
    }

    try {
      return ProjectStatus.valueOf(status.trim().toUpperCase(Locale.ROOT));
    } catch (IllegalArgumentException exception) {
      throw new BusinessException(INVALID_STATUS_MESSAGE);
    }
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

  private Map<ProjectStatus, Long> countProjectsByStatus() {
    Map<ProjectStatus, Long> counts = new EnumMap<>(ProjectStatus.class);
    projectRepository
        .countPerStatus()
        .forEach(count -> counts.put(count.getStatus(), count.getTotal()));
    return Map.copyOf(counts);
  }

  public record ProjectListing(
      List<Project> projects,
      long totalElements,
      Map<Long, Long> pendingCounts,
      Map<ProjectStatus, Long> statusCounts) {

    public long pendingCountFor(Project project) {
      return pendingCounts.getOrDefault(project.getId(), 0L);
    }
  }
}
