package br.com.ampere.service;

import br.com.ampere.domain.Project;
import br.com.ampere.domain.ProjectStatus;
import br.com.ampere.repository.ProjectRepository;
import br.com.ampere.utils.Timestamps;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Moves the approvals past their 36 months of validity (DIS-NOR-053, item 6.27.6) to EXPIRED. */
@Service
public class ApprovalExpiryService {

  private final ProjectRepository projectRepository;
  private final ProjectEventService eventService;

  public ApprovalExpiryService(
      ProjectRepository projectRepository, ProjectEventService eventService) {
    this.projectRepository = projectRepository;
    this.eventService = eventService;
  }

  /** Approved before the start of this day, 36 months ago, means the last valid day has passed. */
  @Transactional
  public int expireApprovals(OffsetDateTime now) {
    LocalDate today = Timestamps.localDate(now);
    OffsetDateTime approvedBefore =
        today
            .minusMonths(Project.APPROVAL_VALIDITY_MONTHS)
            .atStartOfDay(Timestamps.ZONE)
            .toOffsetDateTime();
    int expired = 0;
    for (Project project :
        projectRepository.findAllByStatusAndReviewedAtBeforeOrderByIdAsc(
            ProjectStatus.APPROVED, approvedBefore)) {
      if (!project.isApprovalExpired(today, Timestamps.ZONE)) {
        continue;
      }
      project.expire();
      eventService.expired(project, now);
      expired++;
    }

    return expired;
  }
}
