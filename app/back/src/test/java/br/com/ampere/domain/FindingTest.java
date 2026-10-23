package br.com.ampere.domain;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.List;
import org.junit.jupiter.api.Test;

class FindingTest {

  @Test
  void staysPendingUntilTheAnalystAcceptsTheCorrection() {
    Finding finding =
        new Finding(
            project("2026-8475"),
            FindingSeverity.BLOCKING,
            FindingStage.DOCUMENTS,
            null,
            null,
            DocumentType.ART,
            "Assinar a ART.",
            null,
            new User("Analista", "admin@ampere.com", "hash", UserRole.ADMIN),
            1);

    assertThat(finding.isPending()).isTrue();
    finding.publish();
    assertThat(finding.isPending()).isTrue();

    finding.resolve(FindingResolution.ACCEPT);
    assertThat(finding.getStatus()).isEqualTo(FindingStatus.RESOLVED);
    assertThat(finding.isPending()).isFalse();
    assertThat(finding.isOpenBlocking()).isFalse();

    finding.resolve(FindingResolution.REOPEN);
    assertThat(finding.getStatus()).isEqualTo(FindingStatus.OPEN);
  }

  @Test
  void createsAndUpdatesADraftWithItsAuditData() {
    Project project = project("2026-8476");
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

  @Test
  void recordsTheDesignerResponseAndPreservesItOnReopenUntilAnsweredAgain() {
    Finding finding =
        new Finding(
            project("2026-8477"),
            FindingSeverity.BLOCKING,
            FindingStage.DOCUMENTS,
            null,
            null,
            DocumentType.ART,
            "Assinar a ART.",
            null,
            new User("Analista", "admin@ampere.com", "hash", UserRole.ADMIN),
            1);
    assertThat(finding.awaitsResponseIn(1)).isFalse();
    finding.publish();
    assertThat(finding.awaitsResponseIn(1)).isTrue();
    assertThat(finding.awaitsResponseIn(2)).isFalse();

    OffsetDateTime firstTime = OffsetDateTime.of(2026, 10, 16, 14, 20, 0, 0, ZoneOffset.UTC);
    assertThatThrownBy(() -> finding.respond(FindingStatus.CONTESTED, "   ", firstTime))
        .isInstanceOf(IllegalArgumentException.class);

    finding.respond(
        FindingStatus.CONTESTED, "  A ART já traz a assinatura na página 2.  ", firstTime);
    assertThat(finding.getStatus()).isEqualTo(FindingStatus.CONTESTED);
    assertThat(finding.getResponse()).isEqualTo("A ART já traz a assinatura na página 2.");
    assertThat(finding.getRespondedAt()).isEqualTo(firstTime);
    assertThat(finding.awaitsResponseIn(1)).isTrue();

    finding.resolve(FindingResolution.REOPEN);
    assertThat(finding.getStatus()).isEqualTo(FindingStatus.OPEN);
    assertThat(finding.getResponse()).isEqualTo("A ART já traz a assinatura na página 2.");
    assertThat(finding.getRespondedAt()).isEqualTo(firstTime);

    OffsetDateTime secondTime = firstTime.plusHours(1);
    finding.respond(FindingStatus.FIXED, null, secondTime);
    assertThat(finding.getStatus()).isEqualTo(FindingStatus.FIXED);
    assertThat(finding.getResponse()).isNull();
    assertThat(finding.getRespondedAt()).isEqualTo(secondTime);
  }

  private static Project project(String protocol) {
    return new Project(
        "Condomínio Vila Nova",
        "Avenida Barreto de Menezes, 88",
        "Jaboatão dos Guararapes",
        protocol,
        ProjectStatus.UNDER_REVIEW,
        buildingType(),
        List.of());
  }

  private static BuildingType buildingType() {
    return new ResidentialMultifamily(
        6, SupplyVoltage.V220_127, ConnectionType.TWO_PHASE, EntranceStandard.INDIVIDUAL);
  }
}
