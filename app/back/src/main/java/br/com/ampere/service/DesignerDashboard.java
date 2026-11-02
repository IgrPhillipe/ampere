package br.com.ampere.service;

import br.com.ampere.domain.FindingStage;
import br.com.ampere.domain.Project;
import java.time.LocalDate;
import java.util.List;

/** What the designer sees first: pending work, projects in review and the period results. */
public record DesignerDashboard(
    boolean hasSubmissions,
    List<ActionItem> actionRequired,
    List<ReviewItem> underReview,
    DesignerIndicators indicators,
    List<FindingRank> findingsRanking) {

  /** A rejected project with open blocking findings, or a draft idle for too long. */
  public record ActionItem(Project project, long blockingFindings, Long idleDays) {}

  public record ReviewItem(Project project, LocalDate deadline, long daysRemaining) {}

  public record FindingRank(FindingStage stage, String standardItem, long total) {}
}
