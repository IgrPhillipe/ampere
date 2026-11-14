package br.com.ampere.service;

import br.com.ampere.domain.Project;
import br.com.ampere.domain.ReviewTimeline;
import br.com.ampere.utils.Timestamps;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

/**
 * One page of projects, with the counts and the latest demand of each already resolved, read on
 * {@code today}.
 */
public record ProjectListing(
    List<Project> projects,
    long totalElements,
    LocalDate today,
    Map<Long, Long> pendingCounts,
    Map<Long, Long> unitCounts,
    Map<Long, BigDecimal> demands) {

  public long pendingCountFor(Project project) {
    return pendingCounts.getOrDefault(project.getId(), 0L);
  }

  public long unitCountFor(Project project) {
    return unitCounts.getOrDefault(project.getId(), 0L);
  }

  public ReviewTimeline timelineFor(Project project) {
    return project.reviewTimeline(today, Timestamps.ZONE);
  }

  /** Null while the project has no calculation. */
  public BigDecimal demandFor(Project project) {
    return demands.get(project.getId());
  }
}
