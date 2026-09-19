package br.com.ampere.domain;

import static org.assertj.core.api.Assertions.assertThat;

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
            ProjectStatus.REJECTED);

    Finding finding = new Finding(project);

    assertThat(finding.getProject()).isSameAs(project);
  }
}
