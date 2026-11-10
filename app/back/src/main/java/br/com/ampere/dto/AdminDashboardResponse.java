package br.com.ampere.dto;

import java.util.List;
import java.util.Map;

public record AdminDashboardResponse(
    UsersSummary users, ProjectsSummary projects, QueueSummary queue) {

  public record UsersSummary(
      Map<String, Long> activeByRole,
      long inactive,
      long mustChangePassword,
      long withoutAccess30Days) {}

  public record ProjectsSummary(long draft, long underReview, long rejected) {}

  public record QueueSummary(
      long unassigned,
      long dueIn3Days,
      long overdue,
      List<ReviewerLoad> byReviewer,
      long municipalitiesWithoutReviewer) {}

  public record ReviewerLoad(String id, String name, long underReview) {}
}
