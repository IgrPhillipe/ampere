package br.com.ampere.domain;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;

@Entity
@DiscriminatorValue("RESIDENTIAL_MULTIFAMILY")
public class ResidentialMultifamily extends BuildingType {

  protected ResidentialMultifamily() {}

  public ResidentialMultifamily(Double voltage, String entranceStandard) {
    super(voltage, entranceStandard);
  }

  @Override
  public String applicableStandard() {
    // Decisão baseada no tipo (ResidentialMultifamily) cruzado com tensão e padrão
    if (getVoltage() != null && getVoltage() <= 380) {
      // Padrões de baixa tensão podem cair em exceções dependendo do padrão de entrada
      if ("INDIVIDUAL".equalsIgnoreCase(getEntranceStandard())) {
        return "DIS-NOR-030";
      }
    }
    return "DIS-NOR-053";
  }
}
