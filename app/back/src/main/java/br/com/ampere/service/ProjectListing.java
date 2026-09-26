package br.com.ampere.service;

import br.com.ampere.domain.Project;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

/** One page of projects, with the counts and the latest demand of each already resolved. */
public record ProjectListing(
    List<Project> projects,
    long totalElements,
    Map<Long, Long> pendingCounts,
    Map<Long, Long> unitCounts,
    Map<Long, BigDecimal> demands) {

  public long pendingCountFor(Project project) {
    return pendingCounts.getOrDefault(project.getId(), 0L);
  }

  public long unitCountFor(Project project) {
    return unitCounts.getOrDefault(project.getId(), 0L);
  }

  /** Null while the project has no calculation. */
  public BigDecimal demandFor(Project project) {
    return demands.get(project.getId());
  }
}
