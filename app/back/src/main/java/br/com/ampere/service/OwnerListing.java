package br.com.ampere.service;

import br.com.ampere.domain.User;
import java.util.List;

/** One page of designers for a filter, with the total that matched the search. */
public record OwnerListing(List<User> owners, long totalElements) {}
