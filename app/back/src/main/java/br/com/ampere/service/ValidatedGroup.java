package br.com.ampere.service;

import br.com.ampere.domain.ConsumerUnitGroup;
import br.com.ampere.domain.DemandContext;
import br.com.ampere.domain.GroupStatus;
import br.com.ampere.domain.ValidationIssue;
import java.util.List;

/** A group validated once, with the context its load is read under. */
public record ValidatedGroup(
    ConsumerUnitGroup group, DemandContext context, List<ValidationIssue> issues) {

  public static ValidatedGroup of(ConsumerUnitGroup group, DemandContext context) {
    return new ValidatedGroup(group, context, group.validate(context));
  }

  public GroupStatus status() {
    return ConsumerUnitGroup.statusOf(issues);
  }
}
