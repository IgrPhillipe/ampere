package br.com.ampere.service;

import br.com.ampere.domain.Project;
import br.com.ampere.domain.ProjectStatus;
import br.com.ampere.domain.ReviewQueueFilter;
import br.com.ampere.repository.CalculationRepository;
import br.com.ampere.repository.ConsumerUnitGroupRepository;
import br.com.ampere.repository.ProjectRepository;
import br.com.ampere.utils.SearchTerms;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ReviewQueueService {

  /** The day a deadline falls on depends on the time zone, so it is fixed in one place. */
  public static final ZoneId ZONE = ZoneId.of("America/Recife");

  public static final BigDecimal HIGH_DEMAND_THRESHOLD = new BigDecimal("50");

  private final ProjectRepository projectRepository;
  private final CalculationRepository calculationRepository;
  private final ConsumerUnitGroupRepository groupRepository;

  public ReviewQueueService(
      ProjectRepository projectRepository,
      CalculationRepository calculationRepository,
      ConsumerUnitGroupRepository groupRepository) {
    this.projectRepository = projectRepository;
    this.calculationRepository = calculationRepository;
    this.groupRepository = groupRepository;
  }

  @Transactional(readOnly = true)
  public ReviewQueueListing list(int page, int pageSize, String search, ReviewQueueFilter filter) {
    PageRequest pageRequest = PageRequest.of(page - 1, pageSize);
    LocalDate today = LocalDate.now(ZONE);

    Page<Project> projects =
        projectRepository.searchReviewQueue(
            ProjectStatus.UNDER_REVIEW,
            SearchTerms.normalize(search),
            filter == ReviewQueueFilter.DUE_SOON,
            dueSoonCutoff(today),
            filter == ReviewQueueFilter.HIGH_DEMAND,
            HIGH_DEMAND_THRESHOLD,
            filter == ReviewQueueFilter.REANALYSIS,
            2,
            pageRequest);

    List<Long> projectIds = projects.getContent().stream().map(Project::getId).toList();
    Map<Long, Long> warnings = countWarnings(projectIds);
    Map<Long, Long> consumerUnits = countUnits(projectIds);
    Map<Long, BigDecimal> demands = latestDemands(projectIds);

    List<ReviewQueueEntry> entries =
        projects.getContent().stream()
            .map(
                project -> {
                  LocalDate deadline = project.reviewDeadline(ZONE);
                  return new ReviewQueueEntry(
                      project,
                      deadline,
                      project.deadlineStatus(today, ZONE),
                      ChronoUnit.DAYS.between(today, deadline),
                      warnings.getOrDefault(project.getId(), 0L),
                      consumerUnits.getOrDefault(project.getId(), 0L),
                      demands.get(project.getId()));
                })
            .toList();

    return new ReviewQueueListing(entries, projects.getTotalElements());
  }

  @Transactional(readOnly = true)
  public ReviewQueueIndicators indicators() {
    LocalDate today = LocalDate.now(ZONE);
    OffsetDateTime startOfToday = today.atStartOfDay(ZONE).toOffsetDateTime();
    OffsetDateTime startOfMonth = today.withDayOfMonth(1).atStartOfDay(ZONE).toOffsetDateTime();

    return new ReviewQueueIndicators(
        projectRepository.countByStatusAndSubmittedAtIsNotNull(ProjectStatus.UNDER_REVIEW),
        filteredCount(true, false, false, dueSoonCutoff(today)),
        filteredCount(false, true, false, dueSoonCutoff(today)),
        filteredCount(false, false, true, dueSoonCutoff(today)),
        projectRepository.countByReviewedAtGreaterThanEqual(startOfToday),
        projectRepository.countByReviewedAtGreaterThanEqual(startOfMonth),
        projectRepository.countByStatusAndReviewedAtGreaterThanEqual(
            ProjectStatus.REJECTED, startOfMonth));
  }

  /** Submitted before this instant means the deadline is today or already past. */
  private static OffsetDateTime dueSoonCutoff(LocalDate today) {
    return today
        .plusDays(1)
        .atStartOfDay(ZONE)
        .toOffsetDateTime()
        .minusDays(Project.REVIEW_PERIOD_DAYS);
  }

  private long filteredCount(
      boolean dueSoon, boolean highDemand, boolean reanalysis, OffsetDateTime submittedBefore) {
    return projectRepository
        .searchReviewQueue(
            ProjectStatus.UNDER_REVIEW,
            "",
            dueSoon,
            submittedBefore,
            highDemand,
            HIGH_DEMAND_THRESHOLD,
            reanalysis,
            2,
            PageRequest.of(0, 1))
        .getTotalElements();
  }

  private Map<Long, Long> countWarnings(List<Long> projectIds) {
    if (projectIds.isEmpty()) {
      return Map.of();
    }

    return calculationRepository.countLatestWarningsPerProject(projectIds).stream()
        .collect(
            Collectors.toUnmodifiableMap(
                CalculationRepository.LatestWarnings::getProjectId,
                CalculationRepository.LatestWarnings::getWarnings));
  }

  private Map<Long, Long> countUnits(List<Long> projectIds) {
    if (projectIds.isEmpty()) {
      return Map.of();
    }

    return groupRepository.countUnitsPerProject(projectIds).stream()
        .collect(
            Collectors.toUnmodifiableMap(
                ConsumerUnitGroupRepository.UnitCount::getProjectId,
                ConsumerUnitGroupRepository.UnitCount::getTotal));
  }

  private Map<Long, BigDecimal> latestDemands(List<Long> projectIds) {
    if (projectIds.isEmpty()) {
      return Map.of();
    }

    return calculationRepository.findLatestDemandPerProject(projectIds).stream()
        .collect(
            Collectors.toUnmodifiableMap(
                CalculationRepository.LatestDemand::getProjectId,
                CalculationRepository.LatestDemand::getDemand));
  }
}
