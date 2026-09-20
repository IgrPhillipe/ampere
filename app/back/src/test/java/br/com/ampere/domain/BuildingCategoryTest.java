package br.com.ampere.domain;

import static org.assertj.core.api.Assertions.assertThat;

import jakarta.persistence.DiscriminatorValue;
import org.junit.jupiter.api.Test;

class BuildingCategoryTest {

  @Test
  void createsTheMatchingBuildingTypeSubclass() {
    assertThat(create(BuildingCategory.RESIDENTIAL_MULTIFAMILY))
        .isInstanceOf(ResidentialMultifamily.class);
    assertThat(create(BuildingCategory.NON_RESIDENTIAL)).isInstanceOf(NonResidential.class);
    assertThat(create(BuildingCategory.MIXED)).isInstanceOf(Mixed.class);
  }

  @Test
  void keepsTheTechnicalParametersItWasGiven() {
    BuildingType buildingType = create(BuildingCategory.MIXED);

    assertThat(buildingType.getFloors()).isEqualTo(12);
    assertThat(buildingType.getVoltage()).isEqualTo(SupplyVoltage.V380_220);
    assertThat(buildingType.getConnectionType()).isEqualTo(ConnectionType.THREE_PHASE);
    assertThat(buildingType.getEntranceStandard()).isEqualTo(EntranceStandard.COLLECTIVE);
  }

  @Test
  void namesMatchTheDiscriminatorValues() {
    for (BuildingCategory category : BuildingCategory.values()) {
      DiscriminatorValue discriminator =
          create(category).getClass().getAnnotation(DiscriminatorValue.class);

      assertThat(discriminator).isNotNull();
      assertThat(discriminator.value()).isEqualTo(category.name());
    }
  }

  @Test
  void everySubclassReportsItsOwnCategory() {
    for (BuildingCategory category : BuildingCategory.values()) {
      assertThat(create(category).category()).isEqualTo(category);
    }
  }

  private static BuildingType create(BuildingCategory category) {
    return category.create(
        12, SupplyVoltage.V380_220, ConnectionType.THREE_PHASE, EntranceStandard.COLLECTIVE);
  }
}
