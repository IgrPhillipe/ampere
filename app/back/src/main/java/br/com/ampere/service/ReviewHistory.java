package br.com.ampere.service;

import br.com.ampere.domain.Project;
import br.com.ampere.domain.ProjectEventType;
import br.com.ampere.utils.Timestamps;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.YearMonth;
import java.time.temporal.TemporalAdjusters;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.TreeMap;

/**
 * The submissions and decisions of the projects in scope, whole history included, read for the
 * period that starts on {@code firstDay} and ends today.
 */
final class ReviewHistory {

  static final Set<ProjectEventType> TYPES =
      Set.of(
          ProjectEventType.SUBMITTED,
          ProjectEventType.RESUBMITTED,
          ProjectEventType.APPROVED,
          ProjectEventType.REJECTED);

  record Event(Long projectId, ProjectEventType type, int version, OffsetDateTime occurredAt) {

    LocalDate date() {
      return Timestamps.localDate(occurredAt);
    }

    boolean isSubmission() {
      return type == ProjectEventType.SUBMITTED || type == ProjectEventType.RESUBMITTED;
    }

    boolean isDecision() {
      return type == ProjectEventType.APPROVED || type == ProjectEventType.REJECTED;
    }
  }

  record Week(LocalDate weekStart, long received, long decided) {}

  /** {@code rejectionPercent} is null in a month without decisions. */
  record Month(YearMonth month, BigDecimal rejectionPercent) {}

  record Deadlines(long met, long overdue) {}

  record RepeatedRejection(Long projectId, int rejections) {}

  /** One submission and, once decided, its decision; either may be missing from an old history. */
  private static final class Cycle {
    private Event submission;
    private Event decision;
  }

  private final List<Event> events;
  private final LocalDate firstDay;
  private final LocalDate today;
  private final Map<Long, TreeMap<Integer, Cycle>> cycles = new LinkedHashMap<>();

  ReviewHistory(List<Event> events, LocalDate firstDay, LocalDate today) {
    this.events =
        events.stream()
            .filter(event -> TYPES.contains(event.type()))
            .sorted(Comparator.comparing(Event::occurredAt))
            .toList();
    this.firstDay = firstDay;
    this.today = today;
    for (Event event : this.events) {
      Cycle cycle =
          cycles
              .computeIfAbsent(event.projectId(), id -> new TreeMap<>())
              .computeIfAbsent(event.version(), version -> new Cycle());
      if (event.isSubmission()) {
        cycle.submission = event;
      } else {
        cycle.decision = event;
      }
    }
  }

  private boolean inPeriod(Event event) {
    return !event.date().isBefore(firstDay);
  }

  private List<Event> inPeriod() {
    return events.stream().filter(this::inPeriod).toList();
  }

  /** Projects submitted or resubmitted in the period, in the order of their first submission. */
  Set<Long> received() {
    Set<Long> received = new LinkedHashSet<>();
    inPeriod().stream()
        .filter(Event::isSubmission)
        .forEach(event -> received.add(event.projectId()));
    return received;
  }

  long decidedProjects(ProjectEventType decision) {
    return inPeriod().stream()
        .filter(event -> event.type() == decision)
        .map(Event::projectId)
        .distinct()
        .count();
  }

  /** The version of each received project's last submission in the period. */
  Map<Long, Integer> lastSubmittedVersions() {
    Map<Long, Integer> versions = new LinkedHashMap<>();
    inPeriod().stream()
        .filter(Event::isSubmission)
        .forEach(event -> versions.put(event.projectId(), event.version()));
    return versions;
  }

  /** From the submission to the decision of the same cycle, for each decision in the period. */
  BigDecimal averageReviewDays() {
    List<Long> days = new ArrayList<>();
    cycles.values().stream()
        .flatMap(projectCycles -> projectCycles.values().stream())
        .filter(cycle -> cycle.decision != null && inPeriod(cycle.decision))
        .filter(cycle -> cycle.submission != null)
        .forEach(
            cycle ->
                days.add(
                    Timestamps.daysBetween(
                        cycle.submission.occurredAt(), cycle.decision.occurredAt())));
    return average(days);
  }

  /** From the project's first submission to each approval in the period. */
  BigDecimal averageCycleDays() {
    List<Long> days = new ArrayList<>();
    for (TreeMap<Integer, Cycle> projectCycles : cycles.values()) {
      OffsetDateTime firstSubmission =
          projectCycles.values().stream()
              .map(cycle -> cycle.submission)
              .filter(Objects::nonNull)
              .filter(submission -> submission.type() == ProjectEventType.SUBMITTED)
              .map(Event::occurredAt)
              .min(Comparator.naturalOrder())
              .orElse(null);
      if (firstSubmission == null) {
        continue;
      }
      projectCycles.values().stream()
          .map(cycle -> cycle.decision)
          .filter(decision -> decision != null && inPeriod(decision))
          .filter(decision -> decision.type() == ProjectEventType.APPROVED)
          .forEach(
              approval -> days.add(Timestamps.daysBetween(firstSubmission, approval.occurredAt())));
    }
    return average(days);
  }

  /**
   * A decision meets the deadline when the review days used up to it, the earlier cycles included,
   * fit in {@link Project#REVIEW_PERIOD_DAYS}: a resubmission resumes the period where it stopped.
   */
  Deadlines deadlines() {
    long met = 0;
    long overdue = 0;
    for (TreeMap<Integer, Cycle> projectCycles : cycles.values()) {
      long used = 0;
      boolean known = true;
      for (Cycle cycle : projectCycles.values()) {
        if (cycle.decision == null) {
          continue;
        }
        if (cycle.submission == null) {
          known = false;
          continue;
        }
        used += Timestamps.daysBetween(cycle.submission.occurredAt(), cycle.decision.occurredAt());
        if (known && inPeriod(cycle.decision)) {
          if (used <= Project.REVIEW_PERIOD_DAYS) {
            met++;
          } else {
            overdue++;
          }
        }
      }
    }
    return new Deadlines(met, overdue);
  }

  /** Every week the period touches, empty ones included, from the oldest. */
  List<Week> weekly() {
    Map<LocalDate, long[]> weeks = new LinkedHashMap<>();
    for (LocalDate week = monday(firstDay); !week.isAfter(today); week = week.plusWeeks(1)) {
      weeks.put(week, new long[2]);
    }
    for (Event event : inPeriod()) {
      long[] counts = weeks.get(monday(event.date()));
      if (counts != null) {
        counts[event.isSubmission() ? 0 : 1]++;
      }
    }
    return weeks.entrySet().stream()
        .map(week -> new Week(week.getKey(), week.getValue()[0], week.getValue()[1]))
        .toList();
  }

  /**
   * Every month the period touches, from the oldest; only the decisions inside the period count.
   */
  List<Month> monthlyRejection() {
    Map<YearMonth, long[]> months = new LinkedHashMap<>();
    for (YearMonth month = YearMonth.from(firstDay);
        !month.isAfter(YearMonth.from(today));
        month = month.plusMonths(1)) {
      months.put(month, new long[2]);
    }
    for (Event event : inPeriod()) {
      long[] counts = months.get(YearMonth.from(event.date()));
      if (counts != null && event.isDecision()) {
        counts[0]++;
        if (event.type() == ProjectEventType.REJECTED) {
          counts[1]++;
        }
      }
    }
    return months.entrySet().stream()
        .map(month -> new Month(month.getKey(), percent(month.getValue()[1], month.getValue()[0])))
        .toList();
  }

  /** Projects rejected more than once, the last time in the period. */
  List<RepeatedRejection> repeatedRejections() {
    List<RepeatedRejection> repeated = new ArrayList<>();
    for (Map.Entry<Long, TreeMap<Integer, Cycle>> project : cycles.entrySet()) {
      List<Event> rejections =
          project.getValue().values().stream()
              .map(cycle -> cycle.decision)
              .filter(Objects::nonNull)
              .filter(decision -> decision.type() == ProjectEventType.REJECTED)
              .toList();
      if (rejections.size() > 1
          && inPeriod(Collections.max(rejections, Comparator.comparing(Event::occurredAt)))) {
        repeated.add(new RepeatedRejection(project.getKey(), rejections.size()));
      }
    }
    return repeated;
  }

  private static LocalDate monday(LocalDate date) {
    return date.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
  }

  private static BigDecimal average(List<Long> days) {
    if (days.isEmpty()) {
      return null;
    }
    return BigDecimal.valueOf(days.stream().mapToLong(Long::longValue).sum())
        .divide(BigDecimal.valueOf(days.size()), 1, RoundingMode.HALF_UP);
  }

  private static BigDecimal percent(long part, long whole) {
    if (whole == 0) {
      return null;
    }
    return BigDecimal.valueOf(part * 100)
        .divide(BigDecimal.valueOf(whole), 1, RoundingMode.HALF_UP);
  }
}
