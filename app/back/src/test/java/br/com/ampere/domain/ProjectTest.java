package br.com.ampere.domain;

import static org.assertj.core.api.Assertions.assertThat;

import jakarta.persistence.Column;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.List;
import org.junit.jupiter.api.Test;

class ProjectTest {

  @Test
  void createsProjectWithListingFields() {
    OffsetDateTime beforeCreation = OffsetDateTime.now(ZoneOffset.UTC);

    Project project =
        new Project(
            "Condomínio Vila Nova",
            "Avenida Barreto de Menezes, 88",
            "Jaboatão dos Guararapes",
            "2026-8475",
            ProjectStatus.REJECTED,
            buildingType(),
            List.of());

    assertThat(project.getName()).isEqualTo("Condomínio Vila Nova");
    assertThat(project.getAddress()).isEqualTo("Avenida Barreto de Menezes, 88");
    assertThat(project.getMunicipality()).isEqualTo("Jaboatão dos Guararapes");
    assertThat(project.getProtocol()).isEqualTo("2026-8475");
    assertThat(project.getStatus()).isEqualTo(ProjectStatus.REJECTED);
    assertThat(project.getCreatedAt()).isAfterOrEqualTo(beforeCreation);
    assertThat(project.getUpdatedAt()).isAfterOrEqualTo(beforeCreation);
    assertThat(project.getCreatedAt().getOffset()).isEqualTo(ZoneOffset.UTC);
  }

  @Test
  void definesEveryProjectListingStatus() {
    assertThat(ProjectStatus.values())
        .containsExactly(
            ProjectStatus.DRAFT,
            ProjectStatus.AWAITING_SUBMISSION,
            ProjectStatus.UNDER_REVIEW,
            ProjectStatus.REJECTED,
            ProjectStatus.APPROVED);
  }

  @Test
  void requiresUniqueProtocols() throws NoSuchFieldException {
    Column protocolColumn = Project.class.getDeclaredField("protocol").getAnnotation(Column.class);

    assertThat(protocolColumn.unique()).isTrue();
  }

  @Test
  void startsAsADraftWithTheGeneratedProtocol() {
    Standard standard = new Standard("DIS-NOR-053", "REV 06");

    Project project =
        Project.draft(
            "Residencial Monte Verde",
            "Rodovia BR-101, km 8",
            "Cabo de Santo Agostinho",
            "2026-0001",
            buildingType(),
            List.of(standard));

    assertThat(project.getStatus()).isEqualTo(ProjectStatus.DRAFT);
    assertThat(project.getProtocol()).isEqualTo("2026-0001");
    assertThat(project.getStandards()).containsExactly(standard);
    assertThat(project.isDraft()).isTrue();
  }

  @Test
  void reportsWhetherItIsStillADraft() {
    assertThat(project(ProjectStatus.DRAFT).isDraft()).isTrue();
    assertThat(project(ProjectStatus.AWAITING_SUBMISSION).isDraft()).isFalse();
    assertThat(project(ProjectStatus.UNDER_REVIEW).isDraft()).isFalse();
    assertThat(project(ProjectStatus.REJECTED).isDraft()).isFalse();
    assertThat(project(ProjectStatus.APPROVED).isDraft()).isFalse();
  }

  @Test
  void replacesTheBuildingTypeInsteadOfMutatingIt() {
    Project project = project(ProjectStatus.DRAFT);
    BuildingType previous = project.getBuildingType();
    BuildingType replacement =
        new Mixed(
            20, SupplyVoltage.V380_220, ConnectionType.THREE_PHASE, EntranceStandard.COLLECTIVE);

    project.changeBuildingType(replacement);

    assertThat(project.getBuildingType()).isSameAs(replacement).isNotSameAs(previous);
  }

  @Test
  void repopulatesTheStandardListInPlace() {
    Project project = project(ProjectStatus.DRAFT);
    List<Standard> before = project.getStandards();
    Standard replacement = new Standard("DIS-NOR-030", "REV 07");

    project.applyStandards(List.of(replacement));

    assertThat(before).isEmpty();
    assertThat(project.getStandards()).containsExactly(replacement);
  }

  @Test
  void renamesTheIdentificationFields() {
    Project project = project(ProjectStatus.DRAFT);

    project.rename("Comercial Praça Sul", "Rua do Sol, 302", "Olinda");

    assertThat(project.getName()).isEqualTo("Comercial Praça Sul");
    assertThat(project.getAddress()).isEqualTo("Rua do Sol, 302");
    assertThat(project.getMunicipality()).isEqualTo("Olinda");
  }

  private static Project project(ProjectStatus status) {
    return new Project(
        "Condomínio Vila Nova",
        "Avenida Barreto de Menezes, 88",
        "Jaboatão dos Guararapes",
        "2026-8475",
        status,
        buildingType(),
        List.of());
  }

  private static BuildingType buildingType() {
    return new ResidentialMultifamily(
        6, SupplyVoltage.V220_127, ConnectionType.TWO_PHASE, EntranceStandard.INDIVIDUAL);
  }
}
