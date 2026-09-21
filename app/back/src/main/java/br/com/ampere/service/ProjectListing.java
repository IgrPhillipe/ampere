package br.com.ampere.service;

import br.com.ampere.domain.Project;
import java.util.List;
import java.util.Map;

/** One page of projects, with the finding count of each one already resolved. */
public record ProjectListing(
    List<Project> projects, long totalElements, Map<Long, Long> pendingCounts) {

  public long pendingCountFor(Project project) {
    return pendingCounts.getOrDefault(project.getId(), 0L);
  }
}
