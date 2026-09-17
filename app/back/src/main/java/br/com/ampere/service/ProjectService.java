package br.com.ampere.service;

import br.com.ampere.domain.Project;
import br.com.ampere.domain.ProjectStatus;
import br.com.ampere.error.BusinessException;
import br.com.ampere.repository.FindingRepository;
import br.com.ampere.repository.ProjectRepository;
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

  private static final int MAX_PAGE_SIZE = 100;
  private static final String INVALID_PAGE_MESSAGE = "A página deve ser maior ou igual a 1.";
  private static final String INVALID_PAGE_SIZE_MESSAGE =
      "O tamanho da página deve estar entre 1 e 100.";
  private static final String INVALID_STATUS_MESSAGE = "Status de projeto inválido.";

  private final ProjectRepository projectRepository;
  private final FindingRepository findingRepository;

  public ProjectService(ProjectRepository projectRepository, FindingRepository findingRepository) {
    this.projectRepository = projectRepository;
    this.findingRepository = findingRepository;
  }

  @Transactional(readOnly = true)
  public ProjectListing list(int page, int pageSize, String status, String search) {
    validatePagination(page, pageSize);

    ProjectStatus parsedStatus = parseStatus(status);
    String normalizedSearch = search == null ? "" : search.trim();
    PageRequest pageRequest =
        PageRequest.of(page - 1, pageSize, Sort.by(Sort.Direction.DESC, "updatedAt"));
    Page<Project> projects =
        projectRepository.findAllByFilters(parsedStatus, normalizedSearch, pageRequest);

    Map<Long, Long> pendingCounts = countPendingFindings(projects.getContent());
    return new ProjectListing(projects, pendingCounts);
  }

  private void validatePagination(int page, int pageSize) {
    if (page < 1) {
      throw new BusinessException(INVALID_PAGE_MESSAGE);
    }
    if (pageSize < 1 || pageSize > MAX_PAGE_SIZE) {
      throw new BusinessException(INVALID_PAGE_SIZE_MESSAGE);
    }
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

    return findingRepository.countByProjectIds(projectIds).stream()
        .collect(
            Collectors.toUnmodifiableMap(
                FindingRepository.FindingCount::getProjectId,
                FindingRepository.FindingCount::getTotal));
  }

  public record ProjectListing(Page<Project> projects, Map<Long, Long> pendingCounts) {

    public long pendingCountFor(Project project) {
      return pendingCounts.getOrDefault(project.getId(), 0L);
    }
  }
}
