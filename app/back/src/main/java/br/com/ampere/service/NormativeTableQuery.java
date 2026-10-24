package br.com.ampere.service;

import br.com.ampere.domain.NormativeTableSort;
import br.com.ampere.domain.NormativeTableStatus;
import br.com.ampere.domain.SortDirection;
import java.util.Collection;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

public record NormativeTableQuery(
    String search,
    Collection<NormativeTableStatus> statuses,
    NormativeTableSort sort,
    SortDirection direction) {

  /** A missing list filters nothing, and a blank value in it ({@code status=DRAFT,}) is dropped. */
  public NormativeTableQuery {
    statuses =
        statuses == null
            ? Set.of()
            : statuses.stream().filter(Objects::nonNull).collect(Collectors.toUnmodifiableSet());
    sort = sort == null ? NormativeTableSort.CODE : sort;
    direction = direction == null ? SortDirection.ASC : direction;
  }

  public static NormativeTableQuery all() {
    return new NormativeTableQuery(null, null, null, null);
  }
}
