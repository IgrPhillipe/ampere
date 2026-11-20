package br.com.ampere.domain;

import java.time.OffsetDateTime;
import java.util.Map;
import java.util.Objects;

/**
 * The revisions a protocol keeps from its first submission: the tables that run used, by ID, and
 * for a table it did not use, the one in force on that date.
 */
public record FixedRevisions(OffsetDateTime fixedAt, Map<NormativeTableCode, Long> tableIds) {

  public FixedRevisions {
    Objects.requireNonNull(fixedAt, "fixedAt");
    tableIds = Map.copyOf(tableIds);
  }

  public boolean selects(NormativeTable table) {
    Long used = tableIds.get(table.getCode());

    return used == null ? table.wasEffectiveAt(fixedAt) : used.equals(table.getId());
  }
}
