package br.com.ampere.service;

import br.com.ampere.domain.Project;
import java.util.List;
import java.util.Map;

/**
 * One page of projects, with the finding count of each one already resolved.
 *
 * <p>Carries entities and a plain map instead of the page abstraction, so the HTTP layer never
 * touches persistence types.
 */
public record ProjectListing(
    List<Project> projects, long totalElements, Map<Long, Long> pendingCounts) {

  public long pendingCountFor(Project project) {
    return pendingCounts.getOrDefault(project.getId(), 0L);
  }
}
