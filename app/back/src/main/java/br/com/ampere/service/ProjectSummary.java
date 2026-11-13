package br.com.ampere.service;

import br.com.ampere.domain.Project;
import br.com.ampere.domain.ReviewDeadline;
import java.math.BigDecimal;
import java.time.OffsetDateTime;

/**
 * A project and the aggregated values displayed in its summary. {@code reviewDeadline} is null
 * while the project is not under review.
 */
public record ProjectSummary(
    Project project,
    long openFindingsCount,
    long consumerUnitsCount,
    BigDecimal demandKva,
    OffsetDateTime lastEventAt,
    ReviewDeadline reviewDeadline) {

  /** Read after the commit, so the fallback sees the update the request just made. */
  public OffsetDateTime lastActivityAt() {
    return lastEventAt == null ? project.getUpdatedAt() : lastEventAt;
  }
}
