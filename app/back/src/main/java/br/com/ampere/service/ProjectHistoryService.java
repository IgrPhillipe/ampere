package br.com.ampere.service;

import br.com.ampere.domain.Calculation;
import br.com.ampere.domain.FindingStatus;
import br.com.ampere.domain.Project;
import br.com.ampere.domain.ProjectEvent;
import br.com.ampere.domain.ProjectEventType;
import br.com.ampere.domain.SortDirection;
import br.com.ampere.repository.CalculationRepository;
import br.com.ampere.repository.FindingRepository;
import br.com.ampere.repository.ProjectEventRepository;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.temporal.ChronoUnit;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ProjectHistoryService {

  private final ProjectService projectService;
  private final ProjectEventRepository eventRepository;
  private final FindingRepository findingRepository;
  private final CalculationRepository calculationRepository;

  public ProjectHistoryService(
      ProjectService projectService,
      ProjectEventRepository eventRepository,
      FindingRepository findingRepository,
      CalculationRepository calculationRepository) {
    this.projectService = projectService;
    this.eventRepository = eventRepository;
    this.findingRepository = findingRepository;
    this.calculationRepository = calculationRepository;
  }

  @Transactional(readOnly = true)
  public List<ProjectEvent> events(
      Long projectId, SortDirection direction, AuthenticatedUser user) {
    projectService.findById(projectId, user);

    return direction == SortDirection.ASC
        ? eventRepository.findAllByProjectIdOrderByOccurredAtAscIdAsc(projectId)
        : eventRepository.findAllByProjectIdOrderByOccurredAtDescIdDesc(projectId);
  }

  @Transactional(readOnly = true)
  public ProjectRework rework(Long projectId, AuthenticatedUser user) {
    Project project = projectService.findById(projectId, user);
    List<ProjectEvent> events =
        eventRepository.findAllByProjectIdOrderByOccurredAtAscIdAsc(projectId);
    OffsetDateTime firstSubmission = firstOccurredAt(events, ProjectEventType.SUBMITTED);

    return new ProjectRework(
        cycleDays(events, firstSubmission),
        project.getReviewCycle(),
        events.stream()
            .filter(
                event ->
                    event.getType() == ProjectEventType.REJECTED
                        || event.getType() == ProjectEventType.APPROVED)
            .count(),
        findingRepository.countByProjectIdAndStatusIn(projectId, List.of(FindingStatus.RESOLVED)),
        findingRepository.countByProjectIdAndStatusIn(projectId, ProjectService.OPEN_FINDINGS),
        redoneCalculationSteps(project, firstSubmission));
  }

  private static Long cycleDays(List<ProjectEvent> events, OffsetDateTime firstSubmission) {
    if (firstSubmission == null) {
      return null;
    }
    OffsetDateTime approved = firstOccurredAt(events, ProjectEventType.APPROVED);
    LocalDate start = firstSubmission.atZoneSameInstant(ReviewQueueService.ZONE).toLocalDate();
    LocalDate end =
        approved == null
            ? LocalDate.now(ReviewQueueService.ZONE)
            : approved.atZoneSameInstant(ReviewQueueService.ZONE).toLocalDate();

    return ChronoUnit.DAYS.between(start, end);
  }

  private long redoneCalculationSteps(Project project, OffsetDateTime firstSubmission) {
    if (project.getReviewCycle() <= 1 || firstSubmission == null) {
      return 0;
    }
    Calculation first =
        calculationRepository
            .findFirstByProjectIdAndCalculatedAtLessThanEqualOrderByCalculatedAtDescIdDesc(
                project.getId(), firstSubmission)
            .orElse(null);
    Calculation latest =
        calculationRepository.findFirstByProjectIdOrderByIdDesc(project.getId()).orElse(null);
    if (first == null || latest == null) {
      return 0;
    }

    Map<String, BigDecimal> firstValues = stepValues(first);
    Map<String, BigDecimal> latestValues = stepValues(latest);
    Set<String> codes = new HashSet<>(firstValues.keySet());
    codes.addAll(latestValues.keySet());

    return codes.stream()
        .filter(code -> valuesDiffer(firstValues.get(code), latestValues.get(code)))
        .count();
  }

  private static Map<String, BigDecimal> stepValues(Calculation calculation) {
    Map<String, BigDecimal> values = new HashMap<>();
    calculation.getSteps().forEach(step -> values.put(step.getCode(), step.getValueKva()));

    return values;
  }

  private static boolean valuesDiffer(BigDecimal first, BigDecimal latest) {
    return first == null || latest == null || first.compareTo(latest) != 0;
  }

  private static OffsetDateTime firstOccurredAt(List<ProjectEvent> events, ProjectEventType type) {
    return events.stream()
        .filter(event -> event.getType() == type)
        .map(ProjectEvent::getOccurredAt)
        .findFirst()
        .orElse(null);
  }
}
