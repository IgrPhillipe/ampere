package br.com.ampere.domain;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.LocalDateTime;
import org.junit.jupiter.api.Test;

class ProjectTest {

  @Test
  void createsProjectWithListingFields() {
    LocalDateTime beforeCreation = LocalDateTime.now();

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
    assertThat(project.getUpdatedAt()).isAfterOrEqualTo(beforeCreation);
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
}
