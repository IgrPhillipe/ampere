package br.com.ampere.service;

import static br.com.ampere.utils.Timestamps.ZONE;

import br.com.ampere.domain.BrazilianState;
import br.com.ampere.domain.BuildingCategory;
import br.com.ampere.domain.DashboardPeriod;
import br.com.ampere.domain.FindingStage;
import br.com.ampere.domain.Project;
import br.com.ampere.domain.ProjectEventType;
import br.com.ampere.domain.ProjectStatus;
import br.com.ampere.dto.ReviewDashboardResponse;
import br.com.ampere.dto.ReviewDashboardResponse.CategoryAlertsResponse;
import br.com.ampere.dto.ReviewDashboardResponse.DeadlinesResponse;
import br.com.ampere.dto.ReviewDashboardResponse.FindingRankResponse;
import br.com.ampere.dto.ReviewDashboardResponse.MonthResponse;
import br.com.ampere.dto.ReviewDashboardResponse.MunicipalityResponse;
import br.com.ampere.dto.ReviewDashboardResponse.ProjectReference;
import br.com.ampere.dto.ReviewDashboardResponse.RepeatedRejectionResponse;
import br.com.ampere.dto.ReviewDashboardResponse.TotalsResponse;
import br.com.ampere.dto.ReviewDashboardResponse.WeekResponse;
import br.com.ampere.dto.ReviewDashboardResponse.WorkloadResponse;
import br.com.ampere.repository.FindingRepository;
import br.com.ampere.repository.FindingRepository.RankedProject;
import br.com.ampere.repository.ProjectEventRepository;
import br.com.ampere.repository.ProjectRepository;
import br.com.ampere.repository.ProjectVersionRepository;
import br.com.ampere.repository.ProjectVersionRepository.VersionWarnings;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.Arrays;
import java.util.Collection;
import java.util.Comparator;
import java.util.EnumMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** US17: the analyst's own projects, or the whole team for the admin. */
@Service
public class ReviewDashboardService {

  private static final int RANKING_SIZE = 10;

  private static final int MUNICIPALITIES_SIZE = 5;

  private final ProjectRepository projectRepository;
  private final ProjectEventRepository eventRepository;
  private final FindingRepository findingRepository;
  private final ProjectVersionRepository versionRepository;

  public ReviewDashboardService(
      ProjectRepository projectRepository,
      ProjectEventRepository eventRepository,
      FindingRepository findingRepository,
      ProjectVersionRepository versionRepository) {
    this.projectRepository = projectRepository;
    this.eventRepository = eventRepository;
    this.findingRepository = findingRepository;
    this.versionRepository = versionRepository;
  }

  @Transactional(readOnly = true)
  public ReviewDashboardResponse dashboard(DashboardPeriod period, AuthenticatedUser user) {
    user.requireReviewer();
    LocalDate today = LocalDate.now(ZONE);
    LocalDate firstDay = period.since(today);
    OffsetDateTime since = firstDay.atStartOfDay(ZONE).toOffsetDateTime();
    // The analyst sees only the projects assigned to them, as in the queue.
    Long reviewerId = user.isReviewer() ? user.id() : null;
    ReviewHistory history =
        new ReviewHistory(
            eventRepository.findReviewHistory(reviewerId, since, ReviewHistory.TYPES).stream()
                .map(
                    event ->
                        new ReviewHistory.Event(
                            event.getProjectId(),
                            event.getType(),
                            event.getVersion(),
                            event.getOccurredAt()))
                .toList(),
            firstDay,
            today);
    Set<Long> received = history.received();
    List<ReviewHistory.RepeatedRejection> repeated = history.repeatedRejections();
    Set<Long> cited = new LinkedHashSet<>(received);
    repeated.forEach(rejection -> cited.add(rejection.projectId()));
    Map<Long, Project> projects = projects(cited);
    ReviewHistory.Deadlines deadlines = history.deadlines();

    return new ReviewDashboardResponse(
        new TotalsResponse(
            received.size(),
            history.decidedProjects(ProjectEventType.APPROVED),
            history.decidedProjects(ProjectEventType.REJECTED),
            underReview(reviewerId)),
        history.averageReviewDays(),
        history.averageCycleDays(),
        history.weekly().stream()
            .map(week -> new WeekResponse(week.weekStart(), week.received(), week.decided()))
            .toList(),
        history.monthlyRejection().stream()
            .map(month -> new MonthResponse(month.month().toString(), month.rejectionPercent()))
            .toList(),
        new DeadlinesResponse(deadlines.met(), deadlines.overdue()),
        reviewerId == null ? workload() : List.of(),
        findingsRanking(reviewerId, since),
        municipalities(received, projects),
        repeatedRejections(repeated, projects),
        alertsByCategory(history.lastSubmittedVersions(), projects));
  }

  private Map<Long, Project> projects(Collection<Long> ids) {
    if (ids.isEmpty()) {
      return Map.of();
    }

    return projectRepository.findAllByIdIn(ids).stream()
        .collect(Collectors.toUnmodifiableMap(Project::getId, Function.identity()));
  }

  private long underReview(Long reviewerId) {
    return reviewerId == null
        ? projectRepository.countByStatusAndSubmittedAtIsNotNull(ProjectStatus.UNDER_REVIEW)
        : projectRepository.countByReviewerIdAndStatusIn(
            reviewerId, Set.of(ProjectStatus.UNDER_REVIEW));
  }

  private List<WorkloadResponse> workload() {
    return projectRepository.countUnderReviewPerReviewer().stream()
        .map(
            load ->
                new WorkloadResponse(
                    String.valueOf(load.getId()), load.getName(), load.getUnderReview()))
        .toList();
  }

  private List<FindingRankResponse> findingsRanking(Long reviewerId, OffsetDateTime since) {
    List<FindingRepository.FindingRank> ranks =
        findingRepository.rankByReviewer(reviewerId, since, PageRequest.of(0, RANKING_SIZE));
    if (ranks.isEmpty()) {
      return List.of();
    }
    Map<FindingKey, List<ProjectReference>> projects =
        findingRepository.findRankedProjects(reviewerId, since).stream()
            .collect(
                Collectors.groupingBy(
                    FindingKey::of,
                    Collectors.mapping(
                        ReviewDashboardService::reference,
                        Collectors.collectingAndThen(Collectors.toList(), List::copyOf))));

    return ranks.stream()
        .map(
            rank ->
                new FindingRankResponse(
                    rank.getStage(),
                    rank.getStandardItem(),
                    rank.getTotal(),
                    projects.getOrDefault(
                        new FindingKey(rank.getStage(), rank.getStandardItem()), List.of())))
        .toList();
  }

  private record FindingKey(FindingStage stage, String standardItem) {

    static FindingKey of(RankedProject project) {
      return new FindingKey(project.getStage(), project.getStandardItem());
    }
  }

  private static ProjectReference reference(RankedProject project) {
    return new ProjectReference(
        String.valueOf(project.getProjectId()), project.getName(), project.getProtocol());
  }

  private record Place(String municipality, BrazilianState state) {}

  private static List<MunicipalityResponse> municipalities(
      Set<Long> received, Map<Long, Project> projects) {
    return received.stream()
        .map(projects::get)
        .filter(Objects::nonNull)
        .collect(
            Collectors.groupingBy(
                project -> new Place(project.getMunicipality(), project.getState()),
                Collectors.counting()))
        .entrySet()
        .stream()
        .sorted(
            Comparator.<Map.Entry<Place, Long>>comparingLong(Map.Entry::getValue)
                .reversed()
                .thenComparing(entry -> entry.getKey().municipality())
                .thenComparing(entry -> entry.getKey().state()))
        .limit(MUNICIPALITIES_SIZE)
        .map(
            entry ->
                new MunicipalityResponse(
                    entry.getKey().municipality(), entry.getKey().state(), entry.getValue()))
        .toList();
  }

  private static List<RepeatedRejectionResponse> repeatedRejections(
      List<ReviewHistory.RepeatedRejection> repeated, Map<Long, Project> projects) {
    return repeated.stream()
        .filter(rejection -> projects.containsKey(rejection.projectId()))
        .map(
            rejection -> {
              Project project = projects.get(rejection.projectId());
              return new RepeatedRejectionResponse(
                  String.valueOf(project.getId()),
                  project.getName(),
                  project.getProtocol(),
                  rejection.rejections());
            })
        .sorted(
            Comparator.comparingInt(RepeatedRejectionResponse::rejections)
                .reversed()
                .thenComparing(RepeatedRejectionResponse::protocol))
        .toList();
  }

  /** The alerts come from the calculation frozen with each project's last submission. */
  private List<CategoryAlertsResponse> alertsByCategory(
      Map<Long, Integer> versions, Map<Long, Project> projects) {
    if (versions.isEmpty()) {
      return List.of();
    }
    Map<Long, Map<Integer, Long>> warnings =
        versionRepository.countWarnings(versions.keySet()).stream()
            .collect(
                Collectors.groupingBy(
                    VersionWarnings::getProjectId,
                    Collectors.toMap(VersionWarnings::getNumber, VersionWarnings::getWarnings)));
    Map<BuildingCategory, long[]> totals = new EnumMap<>(BuildingCategory.class);
    versions.forEach(
        (projectId, version) -> {
          Project project = projects.get(projectId);
          if (project == null) {
            return;
          }
          long[] total =
              totals.computeIfAbsent(project.getBuildingType().category(), category -> new long[2]);
          total[0]++;
          total[1] += warnings.getOrDefault(projectId, Map.of()).getOrDefault(version, 0L);
        });

    return Arrays.stream(BuildingCategory.values())
        .filter(totals::containsKey)
        .map(
            category ->
                new CategoryAlertsResponse(
                    category, totals.get(category)[1], totals.get(category)[0]))
        .toList();
  }
}
