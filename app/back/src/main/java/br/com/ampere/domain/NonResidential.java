package br.com.ampere.domain;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;

@Entity
@DiscriminatorValue("NON_RESIDENTIAL")
public class NonResidential extends BuildingType {

  protected NonResidential() {}

  public NonResidential(Double voltage, String entranceStandard) {
    super(voltage, entranceStandard);
  }

  @Override
  public String applicableStandard() {
    // Decisão baseada no tipo (NonResidential) cruzado com tensão e padrão
    if (getVoltage() != null && getVoltage() > 34.5) {
      return "DIS-NOR-053";
    }

    if ("COLETIVO".equalsIgnoreCase(getEntranceStandard())) {
      return "DIS-NOR-053";
    }

    return "DIS-NOR-030";
  }
}
