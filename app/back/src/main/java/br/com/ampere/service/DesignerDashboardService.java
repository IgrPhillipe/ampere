package br.com.ampere.service;

import static br.com.ampere.utils.Timestamps.ZONE;

import br.com.ampere.domain.ConsumerUnitGroup;
import br.com.ampere.domain.DashboardPeriod;
import br.com.ampere.domain.DocumentType;
import br.com.ampere.domain.FindingSeverity;
import br.com.ampere.domain.FindingStage;
import br.com.ampere.domain.FindingStatus;
import br.com.ampere.domain.Project;
import br.com.ampere.domain.ProjectDocument;
import br.com.ampere.domain.ProjectEventType;
import br.com.ampere.domain.ProjectStatus;
import br.com.ampere.repository.CalculationRepository;
import br.com.ampere.repository.ConsumerUnitGroupRepository;
import br.com.ampere.repository.FindingRepository;
import br.com.ampere.repository.ProjectDocumentRepository;
import br.com.ampere.repository.ProjectEventRepository;
import br.com.ampere.repository.ProjectEventRepository.Approval;
import br.com.ampere.repository.ProjectEventRepository.DecisionCount;
import br.com.ampere.repository.ProjectRepository;
import br.com.ampere.service.DesignerDashboard.ActionItem;
import br.com.ampere.service.DesignerDashboard.FindingRank;
import br.com.ampere.service.DesignerDashboard.ReviewItem;
import br.com.ampere.utils.Timestamps;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.stream.Stream;
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
  private final ConsumerUnitGroupRepository groupRepository;
  private final ProjectDocumentRepository documentRepository;
  private final DemandCalculationService calculationService;

  public DesignerDashboardService(
      ProjectRepository projectRepository,
      ProjectEventRepository eventRepository,
      FindingRepository findingRepository,
      CalculationRepository calculationRepository,
      ConsumerUnitGroupRepository groupRepository,
      ProjectDocumentRepository documentRepository,
      DemandCalculationService calculationService) {
    this.projectRepository = projectRepository;
    this.eventRepository = eventRepository;
    this.findingRepository = findingRepository;
    this.calculationRepository = calculationRepository;
    this.groupRepository = groupRepository;
    this.documentRepository = documentRepository;
    this.calculationService = calculationService;
  }

  @Transactional(readOnly = true)
  public DesignerDashboard dashboard(DashboardPeriod period, AuthenticatedUser user) {
    user.requireDesigner();
    LocalDate today = LocalDate.now(ZONE);
    OffsetDateTime since = period.since(today).atStartOfDay(ZONE).toOffsetDateTime();

    return new DesignerDashboard(
        projectRepository.existsByOwnerIdAndSubmittedAtIsNotNull(user.id()),
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
    OffsetDateTime idleBefore =
        today.minusDays(IDLE_DRAFT_DAYS).atStartOfDay(ZONE).toOffsetDateTime();
    List<Project> idleDrafts =
        projectRepository.findAllByOwnerIdAndStatusAndUpdatedAtBeforeOrderByUpdatedAtAscIdAsc(
            ownerId, ProjectStatus.DRAFT, idleBefore);
    Map<Long, Long> blocking = openBlockingFindings(rejected);
    Map<Long, Long> units =
        groupRepository.unitsPerProject(
            Stream.concat(rejected.stream(), idleDrafts.stream()).map(Project::getId).toList());

    List<ActionItem> items = new ArrayList<>();
    for (Project project : rejected) {
      items.add(
          new ActionItem(
              project,
              blocking.getOrDefault(project.getId(), 0L),
              null,
              units.getOrDefault(project.getId(), 0L),
              null));
    }
    for (Project draft : idleDrafts) {
      items.add(
          new ActionItem(
              draft,
              0,
              ChronoUnit.DAYS.between(Timestamps.localDate(draft.getUpdatedAt()), today),
              units.getOrDefault(draft.getId(), 0L),
              pendingStage(draft)));
    }

    return items;
  }

  /** The first step still incomplete, in the order the project tabs follow; null when none. */
  private FindingStage pendingStage(Project draft) {
    Long projectId = draft.getId();
    List<ConsumerUnitGroup> groups = groupRepository.findAllByProjectIdOrderById(projectId);
    if (!GroupValidation.of(groups).canCalculate()) {
      return FindingStage.CONSUMER_UNITS;
    }
    boolean calculated =
        calculationRepository
            .findFirstByProjectIdOrderByIdDesc(projectId)
            .map(calculation -> calculationService.isCurrent(calculation, groups))
            .orElse(false);
    if (!calculated) {
      return FindingStage.CALCULATION;
    }
    Set<DocumentType> attached =
        documentRepository.findAllByProjectIdOrderByType(projectId).stream()
            .map(ProjectDocument::getType)
            .collect(Collectors.toSet());

    return attached.containsAll(List.of(DocumentType.values())) ? null : FindingStage.DOCUMENTS;
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
                    Timestamps.daysBetween(
                        approval.getFirstSubmittedAt(), approval.getApprovedAt()))
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
