package br.com.ampere.domain;

import java.math.BigDecimal;
import java.math.MathContext;
import java.math.RoundingMode;

/** Tipo de ligação: how many phases feed the building. DIS-NOR-030, item 6.27. */
public enum ConnectionType {
  SINGLE_PHASE("Monofásico", "monopolar", NormativeTableCode.T18_SINGLE_PHASE_MOTORS) {
    @Override
    BigDecimal volts(SupplyVoltage voltage) {
      return voltage.phaseVolts();
    }
  },
  TWO_PHASE("Bifásico", "bipolar", NormativeTableCode.T18_SINGLE_PHASE_MOTORS) {
    @Override
    BigDecimal volts(SupplyVoltage voltage) {
      return voltage.phaseVolts().multiply(BigDecimal.TWO);
    }
  },
  THREE_PHASE("Trifásico", "tripolar", NormativeTableCode.T19_THREE_PHASE_MOTORS) {
    @Override
    BigDecimal volts(SupplyVoltage voltage) {
      return voltage.lineVolts().multiply(BigDecimal.valueOf(3).sqrt(MathContext.DECIMAL64));
    }
  };

  private static final BigDecimal VA_PER_KVA = new BigDecimal("1000");

  private final String label;
  private final String breakerPoles;
  private final NormativeTableCode motorTable;

  ConnectionType(String label, String breakerPoles, NormativeTableCode motorTable) {
    this.label = label;
    this.breakerPoles = breakerPoles;
    this.motorTable = motorTable;
  }

  public String label() {
    return label;
  }

  /** "tripolar", as the general breaker is described next to its rating. */
  public String breakerPoles() {
    return breakerPoles;
  }

  /** Tabela 19 converts three-phase motors; Tabela 18 the single-phase ones. */
  public NormativeTableCode motorTable() {
    return motorTable;
  }

  /** Projected current of the demand: kVA × 1000 over the voltage the connection sees. */
  public BigDecimal currentAmps(BigDecimal kva, SupplyVoltage voltage) {
    return kva.multiply(VA_PER_KVA).divide(volts(voltage), 1, RoundingMode.HALF_UP);
  }

  abstract BigDecimal volts(SupplyVoltage voltage);
}
