package br.com.ampere.service;

import br.com.ampere.domain.User;

/** A new session: the token issued and the person it belongs to. */
public record SignIn(String token, User user) {}
