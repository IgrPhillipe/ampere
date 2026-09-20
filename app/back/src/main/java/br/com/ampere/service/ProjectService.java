package br.com.ampere.service;

import br.com.ampere.domain.Project;
import br.com.ampere.domain.ProjectStatus;
import br.com.ampere.repository.FindingRepository;
import br.com.ampere.repository.ProjectRepository;
import br.com.ampere.utils.SearchTerms;
import java.util.EnumMap;
import java.util.List;
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

  private static final Sort NEWEST_FIRST =
      Sort.by(Sort.Direction.DESC, "updatedAt").and(Sort.by(Sort.Direction.DESC, "id"));

  private final ProjectRepository projectRepository;
  private final FindingRepository findingRepository;

  public ProjectService(ProjectRepository projectRepository, FindingRepository findingRepository) {
    this.projectRepository = projectRepository;
    this.findingRepository = findingRepository;
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

  /**
   * Total of projects in each status, across the whole base.
   *
   * <p>Deliberately ignores the listing filters: the counters exist so the user can leave the
   * filter that is currently applied, which requires knowing what is outside of it.
   */
  @Transactional(readOnly = true)
  public Map<ProjectStatus, Long> countPerStatus() {
    Map<ProjectStatus, Long> counts = new EnumMap<>(ProjectStatus.class);
    projectRepository
        .countPerStatus()
        .forEach(count -> counts.put(count.getStatus(), count.getTotal()));

    return Map.copyOf(counts);
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
