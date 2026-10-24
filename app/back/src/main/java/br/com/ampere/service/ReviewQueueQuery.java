package br.com.ampere.service;

import br.com.ampere.domain.BrazilianState;
import br.com.ampere.domain.ReviewQueueFilter;
import br.com.ampere.domain.ReviewQueueSort;
import br.com.ampere.domain.SortDirection;
import java.util.Collection;

/** The filters and the sort of the review queue, already converted. */
public record ReviewQueueQuery(
    String search,
    ReviewQueueFilter filter,
    ReviewQueueSort sort,
    SortDirection direction,
    String reviewer,
    Long owner,
    Collection<BrazilianState> states,
    Collection<String> municipalities) {

  public ReviewQueueQuery {
    states = FilterValues.setOf(states, "state");
    municipalities = FilterValues.setOf(municipalities, "municipality");
  }
}
