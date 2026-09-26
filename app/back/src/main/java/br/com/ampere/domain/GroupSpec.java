package br.com.ampere.domain;

import java.math.BigDecimal;
import java.util.List;

/**
 * What the designer declared for a group. Each kind reads only its own fields; the rest are null.
 *
 * <p>Missing normative data is allowed here on purpose: a group is saved incomplete and reported as
 * {@link GroupStatus#MISSING_DATA}, which is what the validation panel shows.
 */
public record GroupSpec(
    String name,
    Integer quantity,
    BigDecimal usefulArea,
    Integer bedrooms,
    BigDecimal unitLoadKw,
    Boolean compactUnit,
    LoadUsage usage,
    List<LoadItem> items,
    BigDecimal powerPerPointKw,
    Boolean incorporatedInVehicle,
    Boolean loadManagement,
    EvStationType stationType) {

  public GroupSpec {
    items = items == null ? List.of() : List.copyOf(items);
  }
}
