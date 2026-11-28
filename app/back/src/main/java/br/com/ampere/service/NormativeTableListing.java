package br.com.ampere.service;

import br.com.ampere.domain.NormativeTable;
import java.util.Objects;

/** A listing line: the revision shown, the draft waiting behind a published one, the count. */
public record NormativeTableListing(
    NormativeTable table, NormativeTable pendingRevision, int revisionCount) {

  public NormativeTableListing {
    Objects.requireNonNull(table, "table");
  }
}
