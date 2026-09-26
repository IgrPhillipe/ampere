package br.com.ampere.service;

import br.com.ampere.domain.GroupKind;
import br.com.ampere.domain.GroupSpec;

/** A group as the designer declared it, already converted. The service does not know DTOs. */
public record GroupParameters(GroupKind kind, GroupSpec spec) {}
