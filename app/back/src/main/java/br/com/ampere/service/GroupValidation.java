package br.com.ampere.service;

import br.com.ampere.domain.ConsumerUnitGroup;
import br.com.ampere.domain.DemandContext;
import java.math.BigDecimal;
import java.util.List;

public record GroupValidation(
    boolean canCalculate,
    int pendingIssues,
    int totalGroups,
    int totalUnits,
    BigDecimal totalDeclaredLoadKw) {

  public static GroupValidation of(List<ConsumerUnitGroup> groups, DemandContext context) {
    int pending = groups.stream().mapToInt(group -> group.validate(context).size()).sum();

    return new GroupValidation(
        !groups.isEmpty() && pending == 0,
        pending,
        groups.size(),
        groups.stream().mapToInt(ConsumerUnitGroup::getQuantity).sum(),
        groups.stream()
            .map(group -> group.declaredLoadKw(context))
            .reduce(BigDecimal.ZERO, BigDecimal::add));
  }
}
