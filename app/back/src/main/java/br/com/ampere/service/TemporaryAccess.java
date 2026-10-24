package br.com.ampere.service;

import br.com.ampere.domain.User;

/** The account and its temporary password, in plain text only for this one response. */
public record TemporaryAccess(User user, String temporaryPassword) {}
