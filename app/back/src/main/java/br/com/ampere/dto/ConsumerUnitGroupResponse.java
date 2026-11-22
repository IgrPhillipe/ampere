package br.com.ampere.dto;

import br.com.ampere.domain.ConnectionType;
import br.com.ampere.domain.ConsumerUnitGroup;
import br.com.ampere.domain.DemandContext;
import br.com.ampere.domain.EvStationType;
import br.com.ampere.domain.GroupKind;
import br.com.ampere.domain.GroupSpec;
import br.com.ampere.domain.GroupStatus;
import br.com.ampere.domain.LoadUsage;
import br.com.ampere.service.ValidatedGroup;
import com.fasterxml.jackson.annotation.JsonInclude;
import io.swagger.v3.oas.annotations.media.Schema;
import java.math.BigDecimal;
import java.util.List;

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
    ConnectionType connectionType,
    List<LoadItemResponse> loads,
    LoadUsage usage,
    List<LoadItemResponse> items,
    BigDecimal powerPerPointKw,
    Boolean incorporatedInVehicle,
    Boolean loadManagement,
    EvStationType stationType,
    @Schema(description = "Cômodos e corredores do apartamento trifásico") Integer rooms) {

  public static ConsumerUnitGroupResponse from(ValidatedGroup validated) {
    ConsumerUnitGroup group = validated.group();
    DemandContext context = validated.context();
    GroupSpec spec = group.spec();

    return new ConsumerUnitGroupResponse(
        String.valueOf(group.getId()),
        group.kind(),
        group.getName(),
        group.getQuantity(),
        validated.status(),
        validated.issues().stream().map(ValidationIssueResponse::from).toList(),
        group.summary(),
        group.loadPerUnitKw(context),
        group.declaredLoadKw(context),
        spec.usefulArea(),
        spec.bedrooms(),
        group.getUnitLoadKw(context),
        spec.compactUnit(),
        spec.connectionType(),
        group.kind() == GroupKind.RESIDENTIAL ? items(spec) : null,
        spec.usage(),
        group.kind() == GroupKind.RESIDENTIAL ? null : items(spec),
        spec.powerPerPointKw(),
        spec.incorporatedInVehicle(),
        spec.loadManagement(),
        spec.stationType(),
        spec.rooms());
  }

  /** The residential group answers its items as loads, as the request sends them. */
  private static List<LoadItemResponse> items(GroupSpec spec) {
    return spec.items() == null ? null : spec.items().stream().map(LoadItemResponse::from).toList();
  }
}
