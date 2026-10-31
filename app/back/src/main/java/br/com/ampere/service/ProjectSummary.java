package br.com.ampere.service;

import br.com.ampere.domain.Project;
import java.math.BigDecimal;
import java.time.OffsetDateTime;

/** A project and the aggregated values displayed in its summary. */
public record ProjectSummary(
    Project project,
    long openFindingsCount,
    long consumerUnitsCount,
    BigDecimal demandKva,
    OffsetDateTime lastEventAt) {

  /** Read after the commit, so the fallback sees the update the request just made. */
  public OffsetDateTime lastActivityAt() {
    return lastEventAt == null ? project.getUpdatedAt() : lastEventAt;
  }
}
