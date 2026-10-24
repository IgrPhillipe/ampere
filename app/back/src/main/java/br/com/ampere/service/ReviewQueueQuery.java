package br.com.ampere.service;

import br.com.ampere.domain.BrazilianState;
import br.com.ampere.domain.ReviewQueueFilter;
import br.com.ampere.domain.ReviewQueueSort;
import br.com.ampere.domain.SortDirection;
import java.util.Set;

/** The filters and the sort of the review queue, already converted. */
public record ReviewQueueQuery(
    String search,
    ReviewQueueFilter filter,
    ReviewQueueSort sort,
    SortDirection direction,
    String reviewer,
    Set<BrazilianState> states,
    Set<String> municipalities) {

  /** A missing list filters nothing, like an empty one. */
  public ReviewQueueQuery {
    states = states == null ? Set.of() : Set.copyOf(states);
    municipalities = municipalities == null ? Set.of() : Set.copyOf(municipalities);
  }
}
