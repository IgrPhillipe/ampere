package br.com.ampere.domain;

import static br.com.ampere.utils.Timestamps.now;
import static org.assertj.core.api.Assertions.assertThat;

import jakarta.persistence.Column;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.time.ZoneOffset;
import java.util.List;
import org.junit.jupiter.api.Test;

class ProjectTest {

  private static final ZoneId RECIFE = ZoneId.of("America/Recife");

  @Test
  void createsProjectWithListingFields() {
    OffsetDateTime beforeCreation = now();

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
            ProjectStatus.APPROVED,
            ProjectStatus.EXPIRED);
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
  void associatesTheProjectWithItsOwner() {
    User owner = new User("Projetista", "projetista@ampere.com", "hash", UserRole.USER);

    Project project =
        Project.draft(
            "Residencial Monte Verde",
            "Rodovia BR-101, km 8",
            "Cabo de Santo Agostinho",
            "2026-0001",
            buildingType(),
            List.of(),
            owner);

    assertThat(project.getOwner()).isSameAs(owner);
  }

  @Test
  void treatsASecondSubmissionAsReanalysis() {
    Project project = project(ProjectStatus.DRAFT);

    project.submit(OffsetDateTime.now(ZoneOffset.UTC).minusDays(10));
    project.reject(OffsetDateTime.now(ZoneOffset.UTC).minusDays(2), "Corrigir a ART.");
    project.recordChangeSummary("  Substituí a ART assinada.  ");
    project.submit(OffsetDateTime.now(ZoneOffset.UTC));

    assertThat(project.getReviewCycle()).isEqualTo(2);
    assertThat(project.isReanalysis()).isTrue();
    assertThat(project.getStatus()).isEqualTo(ProjectStatus.UNDER_REVIEW);
    assertThat(project.getReviewedAt()).isNull();
    assertThat(project.getReviewOpinion()).isNull();
    assertThat(project.getChangeSummary()).isEqualTo("Substituí a ART assinada.");
  }

  @Test
  void reportsWhetherItIsStillADraft() {
    assertThat(project(ProjectStatus.DRAFT).isDraft()).isTrue();
    assertThat(project(ProjectStatus.AWAITING_SUBMISSION).isDraft()).isFalse();
    assertThat(project(ProjectStatus.UNDER_REVIEW).isDraft()).isFalse();
    assertThat(project(ProjectStatus.REJECTED).isDraft()).isFalse();
    assertThat(project(ProjectStatus.APPROVED).isDraft()).isFalse();

    assertThat(project(ProjectStatus.DRAFT).isEditable()).isTrue();
    assertThat(project(ProjectStatus.REJECTED).isEditable()).isTrue();
    assertThat(project(ProjectStatus.AWAITING_SUBMISSION).isEditable()).isFalse();
    assertThat(project(ProjectStatus.UNDER_REVIEW).isEditable()).isFalse();
    assertThat(project(ProjectStatus.APPROVED).isEditable()).isFalse();
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

  @Test
  void readsTheReviewTimelineOnTheLocalDayOfTheSubmission() {
    Project project = project(ProjectStatus.DRAFT);
    // 23:30 in Recife is already the next day in UTC.
    project.submit(OffsetDateTime.parse("2026-10-05T02:30:00Z"));

    assertThat(project.reviewTimeline(LocalDate.parse("2026-10-20"), RECIFE))
        .isEqualTo(
            new ReviewTimeline(
                LocalDate.parse("2026-11-03"), DeadlineStatus.ON_TIME, 14L, 16L, 0L, false, null));
  }

  @Test
  void flagsTheReviewDeadlineDueTodayAndOverdue() {
    Project project = project(ProjectStatus.DRAFT);
    project.submit(OffsetDateTime.parse("2026-10-04T13:00:00Z"));

    ReviewTimeline dueToday = project.reviewTimeline(LocalDate.parse("2026-11-03"), RECIFE);
    ReviewTimeline overdue = project.reviewTimeline(LocalDate.parse("2026-11-13"), RECIFE);

    assertThat(dueToday.deadline()).isEqualTo(LocalDate.parse("2026-11-03"));
    assertThat(dueToday.deadlineStatus()).isEqualTo(DeadlineStatus.DUE_TODAY);
    assertThat(dueToday.daysRemaining()).isZero();
    assertThat(overdue.deadlineStatus()).isEqualTo(DeadlineStatus.OVERDUE);
    assertThat(overdue.daysRemaining()).isEqualTo(-10);
  }

  @Test
  void hasNoReviewDeadlineOutsideTheReview() {
    LocalDate today = LocalDate.parse("2026-11-13");
    Project draft = project(ProjectStatus.DRAFT);
    Project rejected = project(ProjectStatus.DRAFT);
    rejected.submit(OffsetDateTime.parse("2026-10-04T13:00:00Z"));
    rejected.reject(OffsetDateTime.parse("2026-10-10T13:00:00Z"));
    Project approved = project(ProjectStatus.DRAFT);
    approved.submit(OffsetDateTime.parse("2026-10-04T13:00:00Z"));
    approved.approve(OffsetDateTime.parse("2026-10-10T13:00:00Z"));

    assertThat(draft.reviewTimeline(today, RECIFE))
        .isEqualTo(new ReviewTimeline(null, null, null, null, null, false, null));
    assertThat(rejected.reviewTimeline(today, RECIFE))
        .isEqualTo(new ReviewTimeline(null, null, 24L, 6L, 34L, true, null));
    assertThat(approved.reviewTimeline(today, RECIFE))
        .isEqualTo(
            new ReviewTimeline(null, null, null, 6L, 0L, false, LocalDate.parse("2029-10-10")));
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
        6, SupplyVoltage.V220_127, ConnectionType.THREE_PHASE, EntranceStandard.INDIVIDUAL);
  }
}
