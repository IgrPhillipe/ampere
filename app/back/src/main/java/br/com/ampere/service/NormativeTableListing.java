package br.com.ampere.service;

import br.com.ampere.domain.NormativeTable;
import java.util.Objects;

/**
 * One line of the listing per table code: the revision that represents it, the draft still waiting
 * for review when that revision is not the draft itself, and how many revisions the code has.
 */
public record NormativeTableListing(
    NormativeTable table, NormativeTable pendingRevision, int revisionCount) {

  public NormativeTableListing {
    Objects.requireNonNull(table, "table");
  }
}
