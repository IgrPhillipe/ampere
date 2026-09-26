package br.com.ampere.domain;

/** What every group needs to know about the building to compute its own demand. */
public record DemandContext(
    NormativeTables tables, SupplyVoltage voltage, ConnectionType connectionType) {}
