package br.com.ampere.domain;

import java.math.BigDecimal;

/** Supply voltage of a building, as DIS-NOR-053 Anexo I item 8 states it. */
public enum SupplyVoltage {
  V220_127("220/127 V", "220", "127", NormativeTableCode.T1_SERVICE_ENTRANCE_220_127),
  V380_220("380/220 V", "380", "220", NormativeTableCode.T2_SERVICE_ENTRANCE_380_220);

  private final String label;
  private final BigDecimal lineVolts;
  private final BigDecimal phaseVolts;
  private final NormativeTableCode serviceEntranceTable;

  SupplyVoltage(
      String label, String lineVolts, String phaseVolts, NormativeTableCode serviceEntranceTable) {
    this.label = label;
    this.lineVolts = new BigDecimal(lineVolts);
    this.phaseVolts = new BigDecimal(phaseVolts);
    this.serviceEntranceTable = serviceEntranceTable;
  }

  public String label() {
    return label;
  }

  public BigDecimal lineVolts() {
    return lineVolts;
  }

  public BigDecimal phaseVolts() {
    return phaseVolts;
  }

  /** Tabela 1 or Tabela 2 of Anexo II (items 8.1 and 8.2 of Anexo I). */
  public NormativeTableCode serviceEntranceTable() {
    return serviceEntranceTable;
  }
}
