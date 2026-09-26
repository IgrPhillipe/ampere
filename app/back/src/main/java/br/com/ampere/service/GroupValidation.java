package br.com.ampere.service;

import br.com.ampere.domain.ConsumerUnitGroup;
import java.math.BigDecimal;
import java.util.List;

/**
 * Whether the groups of a project are ready for the demand calculation.
 *
 * @param pendingIssues validation issues across all groups; every one of them blocks the
 *     calculation
 */
public record GroupValidation(
    boolean canCalculate,
    int pendingIssues,
    int totalGroups,
    int totalUnits,
    BigDecimal totalDeclaredLoadKw) {

  /** The calculation needs at least one group, and no issue left in any of them. */
  public static GroupValidation of(List<ConsumerUnitGroup> groups) {
    int pending = groups.stream().mapToInt(group -> group.validate().size()).sum();

    return new GroupValidation(
        !groups.isEmpty() && pending == 0,
        pending,
        groups.size(),
        groups.stream().mapToInt(ConsumerUnitGroup::getQuantity).sum(),
        groups.stream()
            .map(ConsumerUnitGroup::declaredLoadKw)
            .reduce(BigDecimal.ZERO, BigDecimal::add));
  }
}
