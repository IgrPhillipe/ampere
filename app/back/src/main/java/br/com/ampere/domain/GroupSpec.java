package br.com.ampere.domain;

import java.math.BigDecimal;
import java.util.List;

/**
 * Each kind reads only its own fields. Missing normative data is allowed and reported as an issue.
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
    items = items == null ? null : List.copyOf(items);
  }
}
