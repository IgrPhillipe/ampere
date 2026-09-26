package br.com.ampere.dto;

import br.com.ampere.domain.ConsumerUnitGroup;
import br.com.ampere.domain.EvStationType;
import br.com.ampere.domain.GroupKind;
import br.com.ampere.domain.GroupSpec;
import br.com.ampere.domain.GroupStatus;
import br.com.ampere.domain.LoadUsage;
import com.fasterxml.jackson.annotation.JsonInclude;
import java.math.BigDecimal;
import java.util.List;

/**
 * A group with its validation. Fields of the other kinds are left out of the JSON; a field of its
 * own kind that was not informed is left out too, and the screen reads both as "not informed".
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public record ConsumerUnitGroupResponse(
    String id,
    GroupKind kind,
    String name,
    Integer quantity,
    GroupStatus status,
    List<ValidationIssueResponse> issues,
    String summary,
    BigDecimal loadPerUnitKw,
    BigDecimal declaredLoadKw,
    BigDecimal usefulArea,
    Integer bedrooms,
    BigDecimal unitLoadKw,
    Boolean compactUnit,
    LoadUsage usage,
    List<LoadItemResponse> items,
    BigDecimal powerPerPointKw,
    Boolean incorporatedInVehicle,
    Boolean loadManagement,
    EvStationType stationType) {

  public static ConsumerUnitGroupResponse from(ConsumerUnitGroup group) {
    GroupSpec spec = group.spec();

    return new ConsumerUnitGroupResponse(
        String.valueOf(group.getId()),
        group.kind(),
        group.getName(),
        group.getQuantity(),
        group.status(),
        group.validate().stream().map(ValidationIssueResponse::from).toList(),
        group.summary(),
        group.loadPerUnitKw(),
        group.declaredLoadKw(),
        spec.usefulArea(),
        spec.bedrooms(),
        spec.unitLoadKw(),
        spec.compactUnit(),
        spec.usage(),
        spec.items() == null ? null : spec.items().stream().map(LoadItemResponse::from).toList(),
        spec.powerPerPointKw(),
        spec.incorporatedInVehicle(),
        spec.loadManagement(),
        spec.stationType());
  }
}
