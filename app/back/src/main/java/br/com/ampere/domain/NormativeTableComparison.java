package br.com.ampere.domain;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

/** Rows paired by key and band: a band that moved is one removed and one included. */
public record NormativeTableComparison(
    NormativeTable from,
    NormativeTable to,
    List<NormativeTableRow> included,
    List<NormativeTableRow> removed,
    List<RowChange> changed) {

  public record RowChange(NormativeTableRow before, NormativeTableRow after) {}

  public NormativeTableComparison {
    included = List.copyOf(included);
    removed = List.copyOf(removed);
    changed = List.copyOf(changed);
  }

  public static NormativeTableComparison between(NormativeTable from, NormativeTable to) {
    Objects.requireNonNull(from, "from");
    Objects.requireNonNull(to, "to");
    if (from.getCode() != to.getCode()) {
      throw new IllegalArgumentException("Only revisions of the same table are compared.");
    }

    List<NormativeTableRow> unmatched = new ArrayList<>(from.getRows());
    List<NormativeTableRow> included = new ArrayList<>();
    List<RowChange> changed = new ArrayList<>();
    for (NormativeTableRow after : to.getRows()) {
      NormativeTableRow before =
          unmatched.stream().filter(row -> row.sameEntryAs(after)).findFirst().orElse(null);
      if (before == null) {
        included.add(after);
        continue;
      }
      unmatched.remove(before);
      if (!before.sameValuesAs(after)) {
        changed.add(new RowChange(before, after));
      }
    }

    return new NormativeTableComparison(from, to, included, unmatched, changed);
  }

  public boolean isEmpty() {
    return included.isEmpty() && removed.isEmpty() && changed.isEmpty();
  }
}
