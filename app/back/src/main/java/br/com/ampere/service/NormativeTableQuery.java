package br.com.ampere.service;

import br.com.ampere.domain.NormativeTableSort;
import br.com.ampere.domain.NormativeTableStatus;
import br.com.ampere.domain.SortDirection;
import br.com.ampere.domain.StandardName;
import java.util.Set;

/** The filters and the sort of the normative table listing, already converted. */
public record NormativeTableQuery(
    String search,
    Set<NormativeTableStatus> statuses,
    Set<StandardName> standards,
    NormativeTableSort sort,
    SortDirection direction) {

  /** A missing list filters nothing, like an empty one. */
  public NormativeTableQuery {
    statuses = statuses == null ? Set.of() : Set.copyOf(statuses);
    standards = standards == null ? Set.of() : Set.copyOf(standards);
    sort = sort == null ? NormativeTableSort.CODE : sort;
    direction = direction == null ? SortDirection.ASC : direction;
  }

  /** Every table in catalogue order. */
  public static NormativeTableQuery all() {
    return new NormativeTableQuery(null, null, null, null, null);
  }
}
