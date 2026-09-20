package br.com.ampere.domain;

import static org.assertj.core.api.Assertions.assertThat;

import jakarta.persistence.Column;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
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
            ProjectStatus.REJECTED);

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
}
