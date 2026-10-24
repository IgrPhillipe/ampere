package br.com.ampere.service;

import br.com.ampere.domain.Project;
import br.com.ampere.domain.ProjectStatus;
import br.com.ampere.domain.ReviewQueueFilter;
import br.com.ampere.domain.ReviewQueueSort;
import br.com.ampere.domain.SortDirection;
import br.com.ampere.domain.User;
import br.com.ampere.domain.UserRole;
import br.com.ampere.error.BusinessException;
import br.com.ampere.repository.CalculationRepository;
import br.com.ampere.repository.ConsumerUnitGroupRepository;
import br.com.ampere.repository.ProjectRepository;
import br.com.ampere.repository.ProjectRepositoryCustom.ReviewQueueSearch;
import br.com.ampere.repository.UserRepository;
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

  /** {@code reviewer} value for the projects no analyst picked up yet. */
  public static final String UNASSIGNED = "none";

  private final ProjectRepository projectRepository;
  private final CalculationRepository calculationRepository;
  private final ConsumerUnitGroupRepository groupRepository;
  private final UserRepository userRepository;

  public ReviewQueueService(
      ProjectRepository projectRepository,
      CalculationRepository calculationRepository,
      ConsumerUnitGroupRepository groupRepository,
      UserRepository userRepository) {
    this.projectRepository = projectRepository;
    this.calculationRepository = calculationRepository;
    this.groupRepository = groupRepository;
    this.userRepository = userRepository;
  }

  @Transactional(readOnly = true)
  public ReviewQueueListing list(int page, int pageSize, ReviewQueueQuery query) {
    String reviewer = query.reviewer() == null ? "" : query.reviewer().trim();
    boolean unassigned = UNASSIGNED.equalsIgnoreCase(reviewer);
    LocalDate today = LocalDate.now(ZONE);

    Page<Project> projects =
        projectRepository.searchReviewQueue(
            new ReviewQueueSearch(
                SearchTerms.normalize(query.search()),
                query.filter() == ReviewQueueFilter.DUE_SOON ? dueSoonCutoff(today) : null,
                query.filter() == ReviewQueueFilter.HIGH_DEMAND ? HIGH_DEMAND_THRESHOLD : null,
                query.filter() == ReviewQueueFilter.REANALYSIS,
                query.state(),
                query.municipality(),
                reviewer.isEmpty() || unassigned ? null : analystId(reviewer),
                unassigned,
                query.sort(),
                query.direction()),
            PageRequest.of(page - 1, pageSize));

    List<Long> projectIds = projects.getContent().stream().map(Project::getId).toList();
    Map<Long, List<String>> warnings = latestWarnings(projectIds);
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
                      warnings.getOrDefault(project.getId(), List.of()),
                      consumerUnits.getOrDefault(project.getId(), 0L),
                      demands.get(project.getId()));
                })
            .toList();

    return new ReviewQueueListing(entries, projects.getTotalElements());
  }

  @Transactional(readOnly = true)
  public List<User> reviewers() {
    return userRepository.findAllByRoleOrderByNameAsc(UserRole.ADMIN);
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
            new ReviewQueueSearch(
                "",
                dueSoon ? submittedBefore : null,
                highDemand ? HIGH_DEMAND_THRESHOLD : null,
                reanalysis,
                null,
                null,
                null,
                false,
                ReviewQueueSort.DEADLINE,
                SortDirection.ASC),
            PageRequest.of(0, 1))
        .getTotalElements();
  }

  private Long analystId(String reviewer) {
    long id;
    try {
      id = Long.parseLong(reviewer);
    } catch (NumberFormatException exception) {
      throw new BusinessException("Identificador de analista inválido.");
    }

    User user =
        userRepository
            .findById(id)
            .orElseThrow(() -> new BusinessException("Analista informado não encontrado."));
    if (user.getRole() != UserRole.ADMIN) {
      throw new BusinessException("O usuário informado não é um analista.");
    }

    return id;
  }

  private Map<Long, List<String>> latestWarnings(List<Long> projectIds) {
    if (projectIds.isEmpty()) {
      return Map.of();
    }

    return calculationRepository.findLatestWarningsPerProject(projectIds).stream()
        .collect(
            Collectors.groupingBy(
                CalculationRepository.LatestWarning::getProjectId,
                Collectors.mapping(
                    CalculationRepository.LatestWarning::getMessage, Collectors.toList())));
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
