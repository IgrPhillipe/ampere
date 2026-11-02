package br.com.ampere.service;

import static br.com.ampere.service.ReviewQueueService.ZONE;

import br.com.ampere.domain.DashboardPeriod;
import br.com.ampere.domain.FindingSeverity;
import br.com.ampere.domain.FindingStatus;
import br.com.ampere.domain.Project;
import br.com.ampere.domain.ProjectEventType;
import br.com.ampere.domain.ProjectStatus;
import br.com.ampere.repository.CalculationRepository;
import br.com.ampere.repository.FindingRepository;
import br.com.ampere.repository.ProjectEventRepository;
import br.com.ampere.repository.ProjectEventRepository.Approval;
import br.com.ampere.repository.ProjectEventRepository.DecisionCount;
import br.com.ampere.repository.ProjectRepository;
import br.com.ampere.service.DesignerDashboard.ActionItem;
import br.com.ampere.service.DesignerDashboard.FindingRank;
import br.com.ampere.service.DesignerDashboard.ReviewItem;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class DesignerDashboardService {

  /** A draft untouched for more than this many days asks for the designer's attention. */
  private static final int IDLE_DRAFT_DAYS = 15;

  private static final int RANKING_SIZE = 10;

  private static final List<ProjectEventType> DECISIONS =
      List.of(ProjectEventType.APPROVED, ProjectEventType.REJECTED);

  private final ProjectRepository projectRepository;
  private final ProjectEventRepository eventRepository;
  private final FindingRepository findingRepository;
  private final CalculationRepository calculationRepository;

  public DesignerDashboardService(
      ProjectRepository projectRepository,
      ProjectEventRepository eventRepository,
      FindingRepository findingRepository,
      CalculationRepository calculationRepository) {
    this.projectRepository = projectRepository;
    this.eventRepository = eventRepository;
    this.findingRepository = findingRepository;
    this.calculationRepository = calculationRepository;
  }

  @Transactional(readOnly = true)
  public DesignerDashboard dashboard(DashboardPeriod period, AuthenticatedUser user) {
    user.requireDesigner();
    LocalDate today = LocalDate.now(ZONE);
    OffsetDateTime since = period.since(today).atStartOfDay(ZONE).toOffsetDateTime();

    return new DesignerDashboard(
        eventRepository.existsByProjectOwnerIdAndType(user.id(), ProjectEventType.SUBMITTED),
        actionRequired(user.id(), today),
        underReview(user.id(), today),
        indicators(user.id(), since),
        findingRepository.rankByOwner(user.id(), since, PageRequest.of(0, RANKING_SIZE)).stream()
            .map(rank -> new FindingRank(rank.getStage(), rank.getStandardItem(), rank.getTotal()))
            .toList());
  }

  /** Rejected projects come first, then the drafts idle the longest. */
  private List<ActionItem> actionRequired(Long ownerId, LocalDate today) {
    List<Project> rejected =
        projectRepository.findAllByOwnerIdAndStatusOrderByReviewedAtAscIdAsc(
            ownerId, ProjectStatus.REJECTED);
    Map<Long, Long> blocking = openBlockingFindings(rejected);

    List<ActionItem> items = new ArrayList<>();
    for (Project project : rejected) {
      items.add(new ActionItem(project, blocking.getOrDefault(project.getId(), 0L), null));
    }

    OffsetDateTime idleBefore =
        today.minusDays(IDLE_DRAFT_DAYS).atStartOfDay(ZONE).toOffsetDateTime();
    for (Project draft :
        projectRepository.findAllByOwnerIdAndStatusAndUpdatedAtBeforeOrderByUpdatedAtAscIdAsc(
            ownerId, ProjectStatus.DRAFT, idleBefore)) {
      LocalDate lastChange = draft.getUpdatedAt().atZoneSameInstant(ZONE).toLocalDate();
      items.add(new ActionItem(draft, 0, ChronoUnit.DAYS.between(lastChange, today)));
    }

    return items;
  }

  private Map<Long, Long> openBlockingFindings(List<Project> projects) {
    if (projects.isEmpty()) {
      return Map.of();
    }

    return findingRepository
        .countPerProjectBySeverityAndStatus(
            projects.stream().map(Project::getId).toList(),
            FindingSeverity.BLOCKING,
            FindingStatus.OPEN)
        .stream()
        .collect(
            Collectors.toUnmodifiableMap(
                FindingRepository.FindingCount::getProjectId,
                FindingRepository.FindingCount::getTotal));
  }

  /** Ordered by submission, which is the same as the shortest deadline first. */
  private List<ReviewItem> underReview(Long ownerId, LocalDate today) {
    return projectRepository
        .findAllByOwnerIdAndStatusAndSubmittedAtIsNotNullOrderBySubmittedAtAscIdAsc(
            ownerId, ProjectStatus.UNDER_REVIEW)
        .stream()
        .map(
            project -> {
              LocalDate deadline = project.reviewDeadline(ZONE);
              return new ReviewItem(project, deadline, ChronoUnit.DAYS.between(today, deadline));
            })
        .toList();
  }

  // Project.submit() overwrites submittedAt on every resubmission, so the history is the source.
  private DesignerIndicators indicators(Long ownerId, OffsetDateTime since) {
    Map<ProjectEventType, Long> firstDecisions =
        eventRepository.countFirstDecisions(ownerId, since, DECISIONS).stream()
            .collect(Collectors.toUnmodifiableMap(DecisionCount::getType, DecisionCount::getTotal));
    List<Approval> approvals = eventRepository.findApprovals(ownerId, since);

    return new DesignerIndicators(
        eventRepository.countSubmittedProjects(ownerId, since),
        firstDecisions.values().stream().mapToLong(Long::longValue).sum(),
        firstDecisions.getOrDefault(ProjectEventType.APPROVED, 0L),
        averageDaysToApproval(approvals),
        approvedDemand(approvals));
  }

  private static BigDecimal averageDaysToApproval(List<Approval> approvals) {
    List<Long> days =
        approvals.stream()
            .filter(approval -> approval.getFirstSubmittedAt() != null)
            .map(
                approval ->
                    ChronoUnit.DAYS.between(
                        approval.getFirstSubmittedAt().atZoneSameInstant(ZONE).toLocalDate(),
                        approval.getApprovedAt().atZoneSameInstant(ZONE).toLocalDate()))
            .toList();
    if (days.isEmpty()) {
      return null;
    }

    return BigDecimal.valueOf(days.stream().mapToLong(Long::longValue).sum())
        .divide(BigDecimal.valueOf(days.size()), 1, RoundingMode.HALF_UP);
  }

  private BigDecimal approvedDemand(List<Approval> approvals) {
    if (approvals.isEmpty()) {
      return BigDecimal.ZERO;
    }

    return calculationRepository
        .findLatestDemandPerProject(approvals.stream().map(Approval::getProjectId).toList())
        .stream()
        .map(CalculationRepository.LatestDemand::getDemand)
        .filter(Objects::nonNull)
        .reduce(BigDecimal.ZERO, BigDecimal::add);
  }
}
