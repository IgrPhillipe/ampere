package br.com.ampere.service;

import br.com.ampere.domain.User;
import java.util.List;

public record UserListing(List<User> users, long totalElements) {}
