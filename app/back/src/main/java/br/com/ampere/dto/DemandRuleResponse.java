package br.com.ampere.dto;

import br.com.ampere.domain.DemandRule;

/** One share of the demand calculation, and the standard items behind it. */
public record DemandRuleResponse(
    String component, String symbol, String method, String prescribedBy, String methodFrom) {

  public static DemandRuleResponse from(DemandRule rule) {
    return new DemandRuleResponse(
        rule.component().name(),
        rule.component().symbol(),
        rule.method().label(),
        rule.prescribedBy().code() + " " + rule.prescribedItem(),
        rule.methodFrom().code() + " " + rule.methodItem());
  }
}
