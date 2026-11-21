package br.com.ampere.domain;

import java.util.Set;

/**
 * Mutually exclusive views of the analyst's projects: the first four are under review, the last two
 * already decided.
 */
public enum ReviewQueueFilter {
  ALL,
  DUE_SOON,
  HIGH_DEMAND,
  REANALYSIS,
  APPROVED,
  REJECTED;

  /** The statuses each view lists; an expired approval is still an approval. */
  public Set<ProjectStatus> statuses() {
    return switch (this) {
      case APPROVED -> Set.of(ProjectStatus.APPROVED, ProjectStatus.EXPIRED);
      case REJECTED -> Set.of(ProjectStatus.REJECTED);
      default -> Set.of(ProjectStatus.UNDER_REVIEW);
    };
  }
}
