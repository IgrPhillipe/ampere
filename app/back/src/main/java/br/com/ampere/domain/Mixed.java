package br.com.ampere.domain;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;

@Entity
@DiscriminatorValue("MIXED")
public class Mixed extends BuildingType {

  protected Mixed() {}

  public Mixed(Double voltage, String entranceStandard) {
    super(voltage, entranceStandard);
  }

  @Override
  public String applicableStandard() {
    // Decisão para uso misto também avalia a tensão e padrão
    if (getVoltage() != null
        && getVoltage() <= 380
        && "INDIVIDUAL".equalsIgnoreCase(getEntranceStandard())) {
      return "DIS-NOR-030";
    }
    return "DIS-NOR-053";
  }
}
