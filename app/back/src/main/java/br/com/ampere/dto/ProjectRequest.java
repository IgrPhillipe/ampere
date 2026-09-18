package br.com.ampere.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public class ProjectRequest {

  @NotBlank(message = "O nome do projeto é obrigatório")
  private String name;

  @NotBlank(message = "O tipo de edificação é obrigatório")
  private String type;

  @NotNull(message = "A tensão é obrigatória")
  @Positive(message = "A tensão deve ser maior que zero")
  private Double voltage;

  @NotBlank(message = "O padrão de entrada é obrigatório")
  private String entranceStandard;

  public String getName() {
    return name;
  }

  public void setName(String name) {
    this.name = name;
  }

  public String getType() {
    return type;
  }

  public void setType(String type) {
    this.type = type;
  }

  public Double getVoltage() {
    return voltage;
  }

  public void setVoltage(Double voltage) {
    this.voltage = voltage;
  }

  public String getEntranceStandard() {
    return entranceStandard;
  }

  public void setEntranceStandard(String entranceStandard) {
    this.entranceStandard = entranceStandard;
  }
}
