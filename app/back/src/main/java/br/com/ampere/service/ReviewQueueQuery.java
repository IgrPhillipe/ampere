package br.com.ampere.service;

import br.com.ampere.domain.BrazilianState;
import br.com.ampere.domain.ReviewQueueFilter;
import br.com.ampere.domain.ReviewQueueSort;
import br.com.ampere.domain.SortDirection;

/** The filters and the sort of the review queue, already converted. */
public record ReviewQueueQuery(
    String search,
    ReviewQueueFilter filter,
    ReviewQueueSort sort,
    SortDirection direction,
    String reviewer,
    BrazilianState state,
    String municipality) {}
