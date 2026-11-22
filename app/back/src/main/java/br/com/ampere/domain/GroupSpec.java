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
    ConnectionType connectionType,
    LoadUsage usage,
    List<LoadItem> items,
    BigDecimal powerPerPointKw,
    Boolean incorporatedInVehicle,
    Boolean loadManagement,
    EvStationType stationType,
    Integer rooms) {

  public GroupSpec {
    items = items == null ? null : List.copyOf(items);
  }

  /** Without rooms, which only a three-phase apartment declares. */
  public GroupSpec(
      String name,
      Integer quantity,
      BigDecimal usefulArea,
      Integer bedrooms,
      BigDecimal unitLoadKw,
      Boolean compactUnit,
      ConnectionType connectionType,
      LoadUsage usage,
      List<LoadItem> items,
      BigDecimal powerPerPointKw,
      Boolean incorporatedInVehicle,
      Boolean loadManagement,
      EvStationType stationType) {
    this(
        name,
        quantity,
        usefulArea,
        bedrooms,
        unitLoadKw,
        compactUnit,
        connectionType,
        usage,
        items,
        powerPerPointKw,
        incorporatedInVehicle,
        loadManagement,
        stationType,
        null);
  }
}
