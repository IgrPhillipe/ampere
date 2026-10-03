package br.com.ampere.service;

import br.com.ampere.domain.Project;
import br.com.ampere.domain.ProjectStatus;
import br.com.ampere.repository.CalculationRepository;
import br.com.ampere.repository.ProjectRepository;
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

  private final ProjectRepository projectRepository;
  private final CalculationRepository calculationRepository;

  public ReviewQueueService(
      ProjectRepository projectRepository, CalculationRepository calculationRepository) {
    this.projectRepository = projectRepository;
    this.calculationRepository = calculationRepository;
  }

  @Transactional(readOnly = true)
  public ReviewQueueListing list(int page, int pageSize, boolean dueSoonOnly) {
    PageRequest pageRequest = PageRequest.of(page - 1, pageSize);
    LocalDate today = LocalDate.now(ZONE);

    Page<Project> projects =
        dueSoonOnly
            ? projectRepository.findReviewQueueSubmittedBefore(
                ProjectStatus.UNDER_REVIEW, dueSoonCutoff(today), pageRequest)
            : projectRepository.findReviewQueue(ProjectStatus.UNDER_REVIEW, pageRequest);

    List<Long> projectIds = projects.getContent().stream().map(Project::getId).toList();
    Map<Long, Long> warnings = countWarnings(projectIds);

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
                      warnings.getOrDefault(project.getId(), 0L));
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
        projectRepository.countByStatusAndSubmittedAtBefore(
            ProjectStatus.UNDER_REVIEW, dueSoonCutoff(today)),
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
}
