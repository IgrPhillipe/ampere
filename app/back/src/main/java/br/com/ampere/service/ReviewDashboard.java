package br.com.ampere.service;

import br.com.ampere.domain.BrazilianState;
import br.com.ampere.domain.BuildingCategory;
import br.com.ampere.domain.FindingStage;
import br.com.ampere.domain.Project;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;

/** US17: the review indicators of a period, for the analyst's projects or the whole team. */
public record ReviewDashboard(
    Totals totals,
    BigDecimal averageReviewDays,
    BigDecimal averageCycleDays,
    List<Week> weekly,
    List<Month> monthlyRejection,
    Deadlines deadlines,
    List<FindingRank> findingsRanking,
    List<MunicipalityTotal> municipalities,
    List<RepeatedRejection> repeatedRejections,
    List<CategoryAlerts> alertsByCategory) {

  public record Totals(long received, long approved, long rejected, long underReview) {}

  public record Week(LocalDate weekStart, long received, long decided) {}

  /** {@code rejectionPercent} is null in a month without decisions. */
  public record Month(YearMonth month, BigDecimal rejectionPercent) {}

  public record Deadlines(long met, long overdue) {}

  public record ProjectReference(Long id, String name, String protocol) {}

  public record FindingRank(
      FindingStage stage, String standardItem, long total, List<ProjectReference> projects) {}

  public record MunicipalityTotal(String municipality, BrazilianState state, long total) {}

  public record RepeatedRejection(Project project, int rejections) {}

  public record CategoryAlerts(BuildingCategory category, long alerts, long projects) {}
}
