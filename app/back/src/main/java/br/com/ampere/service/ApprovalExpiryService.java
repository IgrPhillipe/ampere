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

  /**
   * The query takes one day more than 36 months back and the domain decides: on 29/02/2028, 36
   * months back is 28/02/2025, whose approval ended on 28/02/2028 and so expires that day.
   */
  @Transactional
  public int expireApprovals(OffsetDateTime now) {
    LocalDate today = Timestamps.localDate(now);
    OffsetDateTime approvedBefore =
        today
            .minusMonths(Project.APPROVAL_VALIDITY_MONTHS)
            .plusDays(1)
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
