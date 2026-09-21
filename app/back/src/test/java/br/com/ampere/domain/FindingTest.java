package br.com.ampere.domain;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.List;
import org.junit.jupiter.api.Test;

class FindingTest {

  @Test
  void associatesFindingWithProject() {
    Project project =
        new Project(
            "Condomínio Vila Nova",
            "Avenida Barreto de Menezes, 88",
            "Jaboatão dos Guararapes",
            "2026-8475",
            ProjectStatus.REJECTED,
            buildingType(),
            List.of());

    Finding finding = new Finding(project);

    assertThat(finding.getProject()).isSameAs(project);
  }

  private static BuildingType buildingType() {
    return new ResidentialMultifamily(
        6, SupplyVoltage.V220_127, ConnectionType.TWO_PHASE, EntranceStandard.INDIVIDUAL);
  }
}
