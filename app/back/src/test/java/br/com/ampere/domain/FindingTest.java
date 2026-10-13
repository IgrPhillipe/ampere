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
    assertThat(finding.getStatus()).isEqualTo(FindingStatus.OPEN);
  }

  @Test
  void createsAndUpdatesADraftWithItsAuditData() {
    Project project =
        new Project(
            "Condomínio Vila Nova",
            "Avenida Barreto de Menezes, 88",
            "Jaboatão dos Guararapes",
            "2026-8476",
            ProjectStatus.UNDER_REVIEW,
            buildingType(),
            List.of());
    User author = new User("Analista", "admin@ampere.com", "hash", UserRole.ADMIN);
    Finding finding =
        new Finding(
            project,
            FindingSeverity.BLOCKING,
            FindingStage.CALCULATION,
            null,
            "Drf",
            null,
            "Rever o fator de demanda.",
            "item 6.4",
            author,
            2);

    assertThat(finding.getAuthor()).isSameAs(author);
    assertThat(finding.getVersion()).isEqualTo(2);
    assertThat(finding.getCreatedAt()).isNotNull();
    assertThat(finding.getStatus()).isEqualTo(FindingStatus.DRAFT);
    assertThat(finding.isOpenBlocking()).isTrue();

    finding.updateDraft(
        FindingSeverity.ADJUSTMENT,
        FindingStage.DOCUMENTS,
        null,
        null,
        DocumentType.ART,
        "Atualizar a ART.",
        null);
    finding.publish();

    assertThat(finding.getStatus()).isEqualTo(FindingStatus.OPEN);
    assertThat(finding.getDocumentType()).isEqualTo(DocumentType.ART);
    assertThat(finding.isOpenBlocking()).isFalse();
  }

  private static BuildingType buildingType() {
    return new ResidentialMultifamily(
        6, SupplyVoltage.V220_127, ConnectionType.TWO_PHASE, EntranceStandard.INDIVIDUAL);
  }
}
