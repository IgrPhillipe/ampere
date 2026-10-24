package br.com.ampere.service;

import br.com.ampere.domain.UserRole;

public record UserParameters(String name, UserRole role) {}
