package br.com.ampere.service;

import static br.com.ampere.utils.Timestamps.ZONE;

import br.com.ampere.domain.ConcessionArea;
import br.com.ampere.domain.DeadlineStatus;
import br.com.ampere.domain.Project;
import br.com.ampere.domain.ProjectStatus;
import br.com.ampere.domain.User;
import br.com.ampere.domain.UserRole;
import br.com.ampere.dto.AdminDashboardResponse;
import br.com.ampere.dto.AdminDashboardResponse.ProjectsSummary;
import br.com.ampere.dto.AdminDashboardResponse.QueueSummary;
import br.com.ampere.dto.AdminDashboardResponse.ReviewerLoad;
import br.com.ampere.dto.AdminDashboardResponse.UsersSummary;
import br.com.ampere.repository.ProjectRepository;
import br.com.ampere.repository.ReviewerMunicipalityRepository;
import br.com.ampere.repository.UserRepository;
import br.com.ampere.utils.Timestamps;
import java.time.LocalDate;
import java.util.Arrays;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AdminDashboardService {

  /** An account without a login for longer than this asks for the admin's attention. */
  private static final int INACTIVE_ACCESS_DAYS = 30;

  private static final int DUE_SOON_DAYS = 3;

  private final UserRepository userRepository;
  private final ProjectRepository projectRepository;
  private final ReviewerMunicipalityRepository municipalityRepository;
  private final ReviewQueueService reviewQueueService;

  public AdminDashboardService(
      UserRepository userRepository,
      ProjectRepository projectRepository,
      ReviewerMunicipalityRepository municipalityRepository,
      ReviewQueueService reviewQueueService) {
    this.userRepository = userRepository;
    this.projectRepository = projectRepository;
    this.municipalityRepository = municipalityRepository;
    this.reviewQueueService = reviewQueueService;
  }

  @Transactional(readOnly = true)
  public AdminDashboardResponse dashboard(AuthenticatedUser caller) {
    caller.requireAdmin();
    List<Project> queue =
        projectRepository.findAllByStatusOrderByIdAsc(ProjectStatus.UNDER_REVIEW).stream()
            .filter(project -> project.getSubmittedAt() != null)
            .toList();

    return new AdminDashboardResponse(
        usersSummary(), projectsSummary(queue), queueSummary(queue, caller));
  }

  private UsersSummary usersSummary() {
    Map<String, Long> activeByRole = new LinkedHashMap<>();
    Arrays.stream(UserRole.values()).forEach(role -> activeByRole.put(role.getValue(), 0L));
    userRepository
        .countActiveByRole()
        .forEach(count -> activeByRole.put(count.getRole().getValue(), count.getTotal()));

    return new UsersSummary(
        activeByRole,
        userRepository.countByActiveFalse(),
        userRepository.countByMustChangePasswordTrue(),
        userRepository.countActiveWithoutAccessSince(
            Timestamps.now().minusDays(INACTIVE_ACCESS_DAYS)));
  }

  private ProjectsSummary projectsSummary(List<Project> queue) {
    return new ProjectsSummary(
        projectRepository.countByStatus(ProjectStatus.DRAFT),
        projectRepository.countByStatus(ProjectStatus.AWAITING_SUBMISSION),
        queue.size(),
        projectRepository.countByStatus(ProjectStatus.REJECTED));
  }

  private QueueSummary queueSummary(List<Project> queue, AuthenticatedUser caller) {
    LocalDate today = LocalDate.now(ZONE);
    long overdue = 0;
    long dueSoon = 0;
    for (Project project : queue) {
      if (project.deadlineStatus(today, ZONE) == DeadlineStatus.OVERDUE) {
        overdue++;
      } else if (!project.reviewDeadline(ZONE).isAfter(today.plusDays(DUE_SOON_DAYS))) {
        dueSoon++;
      }
    }

    return new QueueSummary(
        queue.stream().filter(project -> project.getReviewer() == null).count(),
        dueSoon,
        overdue,
        reviewerLoads(queue, caller),
        municipalitiesWithoutReviewer());
  }

  private List<ReviewerLoad> reviewerLoads(List<Project> queue, AuthenticatedUser caller) {
    List<User> assigned =
        queue.stream().map(Project::getReviewer).filter(Objects::nonNull).toList();
    Map<Long, Long> loadById =
        assigned.stream().collect(Collectors.groupingBy(User::getId, Collectors.counting()));
    Map<Long, User> reviewers = new LinkedHashMap<>();
    reviewQueueService.reviewers(caller).forEach(user -> reviewers.put(user.getId(), user));
    // A deactivated reviewer keeps the projects already assigned, so the load must still show.
    assigned.forEach(user -> reviewers.putIfAbsent(user.getId(), user));

    return reviewers.values().stream()
        .sorted(Comparator.comparing(User::getName).thenComparing(User::getId))
        .map(
            user ->
                new ReviewerLoad(
                    String.valueOf(user.getId()),
                    user.getName(),
                    user.isActiveReviewer(),
                    loadById.getOrDefault(user.getId(), 0L)))
        .toList();
  }

  private long municipalitiesWithoutReviewer() {
    long covered =
        municipalityRepository.countByReviewerActiveTrueAndReviewerRoleIn(
            Arrays.stream(UserRole.values()).filter(UserRole::canReview).toList());

    return Math.max(0, ConcessionArea.totalMunicipalities() - covered);
  }
}
