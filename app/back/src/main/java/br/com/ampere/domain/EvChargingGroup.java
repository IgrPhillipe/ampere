package br.com.ampere.domain;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

/**
 * Electric vehicle charging points. Their demand (Dve) uses the factor of DIS-NOR-053 item 6.26,
 * Quadro 33, whatever the power of each station (Anexo I, item 13).
 */
@Entity
@DiscriminatorValue("EV_CHARGING")
public class EvChargingGroup extends ConsumerUnitGroup {

  /**
   * DIS-NOR-030 item 6.26.4.1: only for a station built into the vehicle whose power is not
   * informed. It is not a default for a fixed station.
   */
  static final BigDecimal INCORPORATED_STATION_KW = new BigDecimal("3.3");

  private BigDecimal powerPerPointKw;

  private Boolean incorporatedInVehicle;

  private Boolean loadManagement;

  @Enumerated(EnumType.STRING)
  private EvStationType stationType;

  protected EvChargingGroup() {}

  public EvChargingGroup(Project project, GroupSpec spec) {
    super(project);
    update(spec);
  }

  @Override
  protected void applySpec(GroupSpec spec) {
    this.powerPerPointKw = spec.powerPerPointKw();
    this.incorporatedInVehicle = spec.incorporatedInVehicle();
    this.loadManagement = spec.loadManagement();
    this.stationType = spec.stationType();
  }

  public BigDecimal getPowerPerPointKw() {
    return powerPerPointKw;
  }

  public Boolean getIncorporatedInVehicle() {
    return incorporatedInVehicle;
  }

  public Boolean getLoadManagement() {
    return loadManagement;
  }

  public EvStationType getStationType() {
    return stationType;
  }

  @Override
  public GroupKind kind() {
    return GroupKind.EV_CHARGING;
  }

  @Override
  public List<ValidationIssue> validate() {
    List<ValidationIssue> issues = new ArrayList<>();
    if (loadManagement == null) {
      issues.add(
          ValidationIssue.missing(
              "loadManagement",
              "Informe se há sistema de gerenciamento de carga. Sem isso o fator de"
                  + " simultaneidade não pode ser aplicado."));
    }
    if (!DeclaredValues.isPositive(powerPerPointKw)
        && !Boolean.TRUE.equals(incorporatedInVehicle)) {
      issues.add(
          ValidationIssue.missing(
              "powerPerPointKw",
              "Informe a potência de placa de cada ponto. O valor padrão de 3,3 kW vale só para"
                  + " estação incorporada ao veículo."));
    }
    if (stationType == null) {
      issues.add(
          ValidationIssue.missing(
              "stationType",
              "Informe se os pontos são individualizados por unidade ou coletivos."));
    }
    return issues;
  }

  @Override
  public BigDecimal loadPerUnitKw() {
    if (DeclaredValues.isPositive(powerPerPointKw)) {
      return powerPerPointKw;
    }
    return Boolean.TRUE.equals(incorporatedInVehicle) ? INCORPORATED_STATION_KW : null;
  }

  @Override
  public String summary() {
    String points = getQuantity() + (getQuantity() == 1 ? " ponto" : " pontos");
    BigDecimal power = loadPerUnitKw();
    String described =
        power == null
            ? points + ", potência não informada"
            : points + " de " + DeclaredValues.decimal(power) + " kW";
    return described + " · DIS-NOR-053 Quadro 33";
  }
}
