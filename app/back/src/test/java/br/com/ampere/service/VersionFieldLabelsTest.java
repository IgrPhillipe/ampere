package br.com.ampere.service;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

class VersionFieldLabelsTest {

  @Test
  void labelsTheConnectionOfVersionsSubmittedAsTwoPhase() {
    assertThat(VersionFieldLabels.ofValue("connectionType", "TWO_PHASE")).isEqualTo("Bifásico");
    assertThat(VersionFieldLabels.ofValue("connectionType", "THREE_PHASE")).isEqualTo("Trifásico");
  }

  @Test
  void labelsTheMotorRuleOfVersionsCalculatedByTabela19() {
    assertThat(VersionFieldLabels.of("motorInstalledLoad"))
        .isEqualTo("Carga instalada dos motores");
    assertThat(VersionFieldLabels.ofValue("motorInstalledLoad", "NORMATIVE_TABLE"))
        .isEqualTo("Tabela 18 ou 19");
  }
}
