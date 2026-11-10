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
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AdminDashboardService {

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

    UsersSummary users = usersSummary();
    ProjectsSummary projects = projectsSummary();
    QueueSummary queue = queueSummary(caller);

    return new AdminDashboardResponse(users, projects, queue);
  }

  private UsersSummary usersSummary() {
    Map<String, Long> activeByRole = new LinkedHashMap<>();
    for (UserRole role : UserRole.values()) {
      activeByRole.put(role.getValue(), 0L);
    }
    for (Object[] row : userRepository.countActiveByRole()) {
      UserRole role = (UserRole) row[0];
      Long count = (Long) row[1];
      activeByRole.put(role.getValue(), count);
    }

    long inactive = userRepository.countByActiveFalse();
    long mustChangePassword = userRepository.countByMustChangePasswordTrue();
    OffsetDateTime thirtyDaysAgo = OffsetDateTime.now(ZoneOffset.UTC).minusDays(30);
    long withoutAccess30Days = userRepository.countActiveWithoutAccessSince(thirtyDaysAgo);

    return new UsersSummary(activeByRole, inactive, mustChangePassword, withoutAccess30Days);
  }

  private ProjectsSummary projectsSummary() {
    long draft = projectRepository.countByStatus(ProjectStatus.DRAFT);
    long underReview =
        projectRepository.countByStatusAndSubmittedAtIsNotNull(ProjectStatus.UNDER_REVIEW);
    long rejected = projectRepository.countByStatus(ProjectStatus.REJECTED);

    return new ProjectsSummary(draft, underReview, rejected);
  }

  private QueueSummary queueSummary(AuthenticatedUser caller) {
    long unassigned =
        projectRepository.countByStatusAndSubmittedAtIsNotNullAndReviewerIsNull(
            ProjectStatus.UNDER_REVIEW);

    LocalDate today = LocalDate.now(ZONE);
    List<Project> queueProjects =
        projectRepository.findAllByStatusOrderByIdAsc(ProjectStatus.UNDER_REVIEW).stream()
            .filter(p -> p.getSubmittedAt() != null)
            .toList();

    long dueIn3Days = 0;
    long overdue = 0;
    for (Project p : queueProjects) {
      DeadlineStatus status = p.deadlineStatus(today, ZONE);
      if (status == DeadlineStatus.OVERDUE) {
        overdue++;
      } else {
        LocalDate deadline = p.reviewDeadline(ZONE);
        if (!deadline.isBefore(today) && !deadline.isAfter(today.plusDays(3))) {
          dueIn3Days++;
        }
      }
    }

    Map<Long, Long> countsByReviewerId = new LinkedHashMap<>();
    for (Project p : queueProjects) {
      if (p.getReviewer() != null) {
        countsByReviewerId.merge(p.getReviewer().getId(), 1L, Long::sum);
      }
    }

    List<User> reviewers = reviewQueueService.reviewers(caller);
    List<ReviewerLoad> byReviewer =
        reviewers.stream()
            .map(
                reviewer ->
                    new ReviewerLoad(
                        String.valueOf(reviewer.getId()),
                        reviewer.getName(),
                        countsByReviewerId.getOrDefault(reviewer.getId(), 0L)))
            .toList();

    long covered = municipalityRepository.countDistinctServedMunicipalities();
    long municipalitiesWithoutReviewer = Math.max(0, ConcessionArea.totalMunicipalities() - covered);

    return new QueueSummary(
        unassigned, dueIn3Days, overdue, byReviewer, municipalitiesWithoutReviewer);
  }
}
