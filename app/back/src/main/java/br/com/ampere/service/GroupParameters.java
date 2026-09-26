package br.com.ampere.service;

import br.com.ampere.domain.GroupKind;
import br.com.ampere.domain.GroupSpec;

public record GroupParameters(GroupKind kind, GroupSpec spec) {}
