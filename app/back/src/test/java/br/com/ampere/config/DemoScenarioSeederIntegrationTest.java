package br.com.ampere.config;

import static org.assertj.core.api.Assertions.assertThat;

import br.com.ampere.domain.Calculation;
import br.com.ampere.domain.CheckStatus;
import br.com.ampere.domain.ConcessionArea;
import br.com.ampere.domain.ConsumerUnitGroup;
import br.com.ampere.domain.DeadlineStatus;
import br.com.ampere.domain.DocumentType;
import br.com.ampere.domain.EvChargingGroup;
import br.com.ampere.domain.EvStationType;
import br.com.ampere.domain.Finding;
import br.com.ampere.domain.FindingSeverity;
import br.com.ampere.domain.FindingStage;
import br.com.ampere.domain.FindingStatus;
import br.com.ampere.domain.GroupStatus;
import br.com.ampere.domain.LampTechnology;
import br.com.ampere.domain.LoadCategory;
import br.com.ampere.domain.LoadGroup;
import br.com.ampere.domain.LoadItem;
import br.com.ampere.domain.PowerUnit;
import br.com.ampere.domain.Project;
import br.com.ampere.domain.ProjectDocument;
import br.com.ampere.domain.ProjectEvent;
import br.com.ampere.domain.ProjectEventType;
import br.com.ampere.domain.ProjectStatus;
import br.com.ampere.domain.ResidentialGroup;
import br.com.ampere.domain.User;
import br.com.ampere.domain.UserRole;
import br.com.ampere.service.GroupValidation;
import br.com.ampere.service.ReviewQueueService;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.temporal.ChronoUnit;
import java.util.EnumSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestInstance;
import org.springframework.boot.test.context.SpringBootTest;

/** Reads the database as the demonstration leaves it after one seeding of an empty database. */
@SpringBootTest
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
class DemoScenarioSeederIntegrationTest extends SeedIntegrationTestBase {

  private static final Set<String> SCENARIO_PROTOCOLS = scenarioProtocols();

  @BeforeAll
  void seedOnce() {
    wipe();
    bootstrap();
    scenarioSeeder(false).seed();
  }

  @Test
  void createsEveryScenarioWithItsOwnProtocol() {
    assertThat(projectRepository.findAll())
        .extracting(Project::getProtocol)
        .containsExactlyInAnyOrderElementsOf(SCENARIO_PROTOCOLS);
    assertThat(SCENARIO_PROTOCOLS).hasSize(51).contains("2026-1001", "2026-1008", "2026-2019");
  }

  @Test
  void recordsTheTimelineOfReanalysisScenarios() {
    Project cycleThree = project("2026-2017");

    assertThat(eventRepository.findAllByProjectIdOrderByOccurredAtAscIdAsc(cycleThree.getId()))
        .extracting(ProjectEvent::getType)
        .containsSubsequence(
            ProjectEventType.CREATED,
            ProjectEventType.SUBMITTED,
            ProjectEventType.PRE_VALIDATED,
            ProjectEventType.ASSIGNED,
            ProjectEventType.REJECTED,
            ProjectEventType.FINDING_ANSWERED,
            ProjectEventType.RESUBMITTED,
            ProjectEventType.PRE_VALIDATED,
            ProjectEventType.REJECTED,
            ProjectEventType.FINDING_ANSWERED,
            ProjectEventType.RESUBMITTED,
            ProjectEventType.PRE_VALIDATED);
  }

  @Test
  void onlyTheDraftsWithPendingGroupsFailTheGroupValidation() {
    Set<String> pending = Set.of("2026-1001", "2026-2001", "2026-2002", "2026-2025");

    assertThat(SCENARIO_PROTOCOLS)
        .filteredOn(protocol -> !GroupValidation.of(groups(protocol)).canCalculate())
        .containsExactlyInAnyOrderElementsOf(pending);
  }

  @Test
  void keepsTheProtocolsEarlierSeedsFiled() {
    for (int sequence = 1; sequence <= 8; sequence++) {
      assertThat(SCENARIO_PROTOCOLS).contains("2026-100" + sequence);
    }
    for (int sequence = 2001; sequence <= 2043; sequence++) {
      assertThat(SCENARIO_PROTOCOLS).contains("2026-" + sequence);
    }
  }

  @Test
  void placesEveryProjectInTheConcessionArea() {
    assertThat(projectRepository.findAll())
        .allSatisfy(
            project -> {
              assertThat(
                      ConcessionArea.municipalityOf(project.getState(), project.getMunicipality()))
                  .contains(project.getMunicipality());
              assertThat(
                      ConcessionArea.coversPostalCode(project.getState(), project.getPostalCode()))
                  .isTrue();
            });
    assertThat(projectRepository.findAll())
        .filteredOn(project -> project.getState().name().equals("PB"))
        .extracting(Project::getMunicipality)
        .containsOnly("Pedras de Fogo");
  }

  @Test
  void spreadsTheProjectsAmongTheDesignersAndAdmin() {
    assertThat(owner("2026-2028")).isEqualTo("joao@ampere.com");
    assertThat(owner("2026-2013")).isEqualTo("projetista@ampere.com");
    assertThat(owner("2026-2029")).isEqualTo("admin@ampere.com");
    assertThat(owner("2026-2042")).isEqualTo("inativo@ampere.com");
    assertThat(
            projectRepository.findAll().stream()
                .map(project -> owner(project.getProtocol()))
                .collect(Collectors.toSet()))
        .containsExactlyInAnyOrder(
            "user@ampere.com",
            "projetista@ampere.com",
            "joao@ampere.com",
            "admin@ampere.com",
            "inativo@ampere.com");
    assertThat(userRepository.findByEmail("novo@ampere.com")).isPresent();
    assertThat(projectRepository.existsByOwnerIdAndStatusNot(id("novo@ampere.com"), null))
        .isFalse();
  }

  @Test
  void coversEveryStatusAndTheLegacyOne() {
    assertThat(projectRepository.findAll())
        .extracting(Project::getStatus)
        .containsAll(EnumSet.allOf(ProjectStatus.class));
    assertThat(project("2026-1002").getStatus()).isEqualTo(ProjectStatus.AWAITING_SUBMISSION);
  }

  @Test
  void leavesTheDraftsInEveryStageOfTheCalculation() {
    assertThat(groups("2026-2001")).isEmpty();
    assertThat(groups("2026-2002"))
        .extracting(ConsumerUnitGroup::status)
        .contains(GroupStatus.MISSING_DATA);
    assertThat(groups("2026-2025"))
        .extracting(ConsumerUnitGroup::status)
        .contains(GroupStatus.REVIEW);
    assertThat(groups("2026-1001"))
        .extracting(ConsumerUnitGroup::status)
        .contains(GroupStatus.VALIDATED, GroupStatus.REVIEW, GroupStatus.MISSING_DATA);

    assertThat(calculation("2026-2003")).isPresent();
    assertThat(documents("2026-2003")).hasSize(DocumentType.values().length);
    assertThat(calculation("2026-2016")).isPresent();
    assertThat(documents("2026-2016")).isEmpty();
    assertThat(documents("2026-2031"))
        .extracting(ProjectDocument::getType)
        .containsExactly(DocumentType.ART);
    assertThat(calculation("2026-2031")).isPresent();
  }

  @Test
  void flagsTheCalculationsTheDataLeftBehind() {
    for (String protocol : List.of("2026-2026", "2026-2027", "2026-2024")) {
      assertThat(isCurrent(protocol)).as(protocol).isFalse();
    }
    for (String protocol :
        List.of("2026-2003", "2026-2016", "2026-2030", "2026-2032", "2026-2012", "2026-2017")) {
      assertThat(isCurrent(protocol)).as(protocol).isTrue();
    }
    assertThat(project("2026-2026").isEditable()).isTrue();
    assertThat(project("2026-2024").isRejected()).isTrue();
  }

  @Test
  void showsTheRareInputsOfTheCalculation() {
    List<ConsumerUnitGroup> groups = groups("2026-2030");
    assertThat(groups)
        .filteredOn(EvChargingGroup.class::isInstance)
        .map(EvChargingGroup.class::cast)
        .anySatisfy(
            ev -> {
              assertThat(ev.getStationType()).isEqualTo(EvStationType.INDIVIDUAL);
              assertThat(ev.getLoadManagement()).isTrue();
            })
        .anySatisfy(ev -> assertThat(ev.getIncorporatedInVehicle()).isTrue());
    assertThat(groups)
        .filteredOn(ResidentialGroup.class::isInstance)
        .map(ResidentialGroup.class::cast)
        .anySatisfy(group -> assertThat(group.isCompactUnit()).isTrue());
    List<LoadItem> items =
        groups.stream()
            .filter(LoadGroup.class::isInstance)
            .map(LoadGroup.class::cast)
            .flatMap(group -> group.getItems().stream())
            .toList();
    assertThat(items)
        .extracting(LoadItem::getCategory)
        .containsAll(
            List.of(
                LoadCategory.AIR_CONDITIONING,
                LoadCategory.INSTANT_HEATING,
                LoadCategory.STORAGE_HEATING,
                LoadCategory.COOKING,
                LoadCategory.APPLIANCES,
                LoadCategory.SPECIAL_EQUIPMENT));
    assertThat(items).extracting(LoadItem::getPowerUnit).contains(PowerUnit.HP);
    assertThat(items)
        .extracting(LoadItem::getLampTechnology)
        .contains(LampTechnology.FLUORESCENT_NEON_SODIUM);
    assertThat(groups).allSatisfy(group -> assertThat(group.validate()).isEmpty());
  }

  @Test
  void sizesTheExtremesOfTheDemand() {
    Calculation large = calculation("2026-2032").orElseThrow();
    assertThat(large.getFinalTotalDemand()).isGreaterThan(new BigDecimal("300"));
    assertThat(large.getChecks())
        .anyMatch(
            check ->
                check.getCode().equals("MINIMUM_BY_VOLTAGE")
                    && check.getStatus() == CheckStatus.WARNING);
    assertThat(calculation("2026-2033").orElseThrow().isMinimumApplied()).isTrue();
    assertThat(calculation("2026-1003").orElseThrow().getFinalTotalDemand())
        .isGreaterThan(new BigDecimal("50"));
    assertThat(calculation("2026-2004").orElseThrow().getFinalTotalDemand())
        .isGreaterThan(new BigDecimal("50"));
  }

  @Test
  void coversEveryConnectionAndEntranceStandard() {
    assertThat(detail("2026-1004").getBuildingType().getConnectionType().name())
        .isEqualTo("TWO_PHASE");
    assertThat(detail("2026-2034").getBuildingType().getConnectionType().name())
        .isEqualTo("TWO_PHASE");
    assertThat(detail("2026-1006").getBuildingType().getConnectionType().name())
        .isEqualTo("SINGLE_PHASE");
    assertThat(detail("2026-2035").getBuildingType().getConnectionType().name())
        .isEqualTo("SINGLE_PHASE");
    assertThat(detail("2026-1005").getBuildingType().getEntranceStandard().name())
        .isEqualTo("INDIVIDUAL");
    assertThat(detail("2026-2029").getBuildingType().getVoltage().name()).isEqualTo("V220_127");
    assertThat(detail("2026-2029").getBuildingType().category().name()).isEqualTo("MIXED");
  }

  @Test
  void fillsTheReviewQueueWithEveryDeadlineAndAssignment() {
    LocalDate today = LocalDate.now(ReviewQueueService.ZONE);
    List<Project> queue =
        projectRepository.findAll().stream()
            .filter(project -> project.getStatus() == ProjectStatus.UNDER_REVIEW)
            .toList();

    assertThat(queue)
        .extracting(project -> project.deadlineStatus(today, ReviewQueueService.ZONE))
        .contains(DeadlineStatus.OVERDUE, DeadlineStatus.DUE_TODAY, DeadlineStatus.ON_TIME);
    assertThat(daysLeft("2026-2036", today)).isEqualTo(2);
    assertThat(daysLeft("2026-2037", today)).isEqualTo(3);
    assertThat(daysLeft("2026-2038", today)).isEqualTo(1);
    assertThat(daysLeft("2026-1007", today)).isZero();
    assertThat(daysLeft("2026-2005", today)).isZero();
    assertThat(daysLeft("2026-1003", today)).isNegative();

    assertThat(reviewer("2026-1003")).isNull();
    assertThat(reviewer("2026-2013")).isNull();
    assertThat(reviewer("2026-2005")).isEqualTo("revisor@ampere.com");
    assertThat(reviewer("2026-2037")).isEqualTo("analista@ampere.com");
    assertThat(reviewer("2026-2038")).isEqualTo("admin@ampere.com");
    assertThat(owner("2026-2038")).isNotEqualTo("admin@ampere.com");
    assertThat(owner("2026-2015")).isEqualTo("admin@ampere.com");
    assertThat(reviewer("2026-2015")).isEqualTo("revisor@ampere.com");

    assertThat(project("2026-2009").getReviewCycle()).isEqualTo(2);
    assertThat(project("2026-2017").getReviewCycle()).isEqualTo(3);
    assertThat(project("2026-2039").getReviewCycle()).isEqualTo(2);
    assertThat(reviewer("2026-2039")).isNull();
    assertThat(project("2026-2040").getState().name()).isEqualTo("PB");
    assertThat(findings("2026-2005").stream().filter(Finding::isDraft).count()).isEqualTo(2);
  }

  @Test
  void coversTheRejectionsAndTheAnswersTheDesignerGives() {
    assertThat(statuses("2026-1004")).containsOnly(FindingStatus.OPEN);
    assertThat(statuses("2026-2020"))
        .containsExactlyInAnyOrder(
            FindingStatus.FIXED, FindingStatus.CONTESTED, FindingStatus.FIXED);
    assertThat(unansweredBlocking("2026-2020")).isZero();
    assertThat(statuses("2026-2021")).containsOnly(FindingStatus.CONTESTED);
    assertThat(findings("2026-2019"))
        .anySatisfy(
            finding -> {
              assertThat(finding.getStatus()).isEqualTo(FindingStatus.OPEN);
              assertThat(finding.getResponse()).isNotBlank();
              assertThat(finding.getVersion()).isEqualTo(1);
            });
    assertThat(findings("2026-2022"))
        .extracting(Finding::getSeverity)
        .containsOnly(FindingSeverity.ADJUSTMENT);
    assertThat(unansweredBlocking("2026-2022")).isZero();
    assertThat(unansweredBlocking("2026-2008")).isEqualTo(1);

    List<Finding> everyStage = findings("2026-2023");
    assertThat(everyStage)
        .extracting(Finding::getStage)
        .containsExactlyInAnyOrder(FindingStage.values());
    assertThat(everyStage)
        .filteredOn(finding -> finding.getStage() == FindingStage.CONSUMER_UNITS)
        .allMatch(finding -> finding.getConsumerUnitGroup() != null);
    assertThat(everyStage)
        .filteredOn(finding -> finding.getStage() == FindingStage.CALCULATION)
        .allMatch(finding -> finding.getCalculationStepCode() != null);
    assertThat(everyStage)
        .filteredOn(finding -> finding.getStage() == FindingStage.DOCUMENTS)
        .allMatch(finding -> finding.getDocumentType() != null);
  }

  @Test
  void coversTheApprovals() {
    assertThat(project("2026-2011").getReviewCycle()).isEqualTo(1);
    assertThat(findings("2026-2011")).isEmpty();
    assertThat(project("2026-2012").getReviewCycle()).isEqualTo(2);
    assertThat(reviewer("2026-2018")).isEqualTo("analista@ampere.com");
    assertThat(project("2026-2041").getStatus()).isEqualTo(ProjectStatus.APPROVED);
    assertThat(detail("2026-2041").getBuildingType().category().name())
        .isEqualTo("NON_RESIDENTIAL");
    assertThat(reviewer("2026-2041")).isEqualTo("analista@ampere.com");
    assertThat(owner("2026-2042")).isEqualTo("inativo@ampere.com");
    assertThat(project("2026-2042").getStatus()).isEqualTo(ProjectStatus.APPROVED);
  }

  @Test
  void keepsTheTextsOfTheStoriesCoherentWithTheData() {
    EvChargingGroup charging =
        groups("2026-2012").stream()
            .filter(EvChargingGroup.class::isInstance)
            .map(EvChargingGroup.class::cast)
            .findFirst()
            .orElseThrow();
    assertThat(charging.getLoadManagement()).isTrue();
    assertThat(groups("2026-1001").stream().filter(EvChargingGroup.class::isInstance))
        .allMatch(group -> ((EvChargingGroup) group).getLoadManagement() == null);
    LoadGroup stores =
        groups("2026-2017").stream()
            .filter(LoadGroup.class::isInstance)
            .map(LoadGroup.class::cast)
            .findFirst()
            .orElseThrow();
    assertThat(stores.getItems())
        .extracting(LoadItem::getCategory)
        .contains(LoadCategory.AIR_CONDITIONING);
    assertThat(findings("2026-1004"))
        .noneMatch(finding -> finding.getDescription().contains("tipo B"));
    assertThat(findings("2026-1004"))
        .filteredOn(finding -> finding.getStage() == FindingStage.CONSUMER_UNITS)
        .allMatch(finding -> finding.getConsumerUnitGroup() != null);
  }

  @Test
  void followsTheReviewRulesOfTheServices() {
    for (Project project : projectRepository.findAll()) {
      String protocol = project.getProtocol();
      List<Finding> findings = findings(protocol);
      if (project.getStatus() == ProjectStatus.REJECTED) {
        assertThat(findings)
            .as("%s rejected with a published finding of its cycle", protocol)
            .anyMatch(
                finding -> finding.getVersion() == project.getReviewCycle() && !finding.isDraft());
        assertThat(project.getReviewOpinion()).as(protocol).isNotBlank();
      }
      if (project.getStatus() == ProjectStatus.APPROVED) {
        assertThat(findings).as(protocol).allMatch(Finding::isResolved);
        assertThat(project.getReviewOpinion()).as(protocol).isNotBlank();
      }
      if (project.getReviewCycle() > 1) {
        assertThat(project.getChangeSummary()).as("%s resubmitted", protocol).isNotBlank();
      }
      if (project.getStatus() == ProjectStatus.UNDER_REVIEW) {
        assertThat(findings)
            .as("%s: the designer sees no draft", protocol)
            .filteredOn(finding -> finding.getVersion() < project.getReviewCycle())
            .noneMatch(Finding::isDraft);
      }
    }
  }

  @Test
  void ordersEveryDateOfTheHistory() {
    OffsetDateTime now = OffsetDateTime.now();
    for (Project project : projectRepository.findAll()) {
      String protocol = project.getProtocol();
      OffsetDateTime created = project.getCreatedAt();
      assertThat(project.getUpdatedAt()).as(protocol).isAfterOrEqualTo(created);
      assertThat(project.getUpdatedAt()).as(protocol).isBeforeOrEqualTo(now);
      if (project.getSubmittedAt() != null) {
        assertThat(project.getSubmittedAt()).as(protocol).isAfter(created);
        assertThat(project.getUpdatedAt()).as(protocol).isAfterOrEqualTo(project.getSubmittedAt());
      }
      if (project.getReviewedAt() != null) {
        assertThat(project.getReviewedAt()).as(protocol).isAfter(project.getSubmittedAt());
        assertThat(project.getReviewedAt()).as(protocol).isBeforeOrEqualTo(now);
        assertThat(project.getUpdatedAt()).as(protocol).isAfterOrEqualTo(project.getReviewedAt());
      }
      boolean underReviewOrApproved =
          project.getStatus() == ProjectStatus.UNDER_REVIEW
              || project.getStatus() == ProjectStatus.APPROVED;
      documents(protocol)
          .forEach(
              document -> {
                assertThat(document.getUploadedAt()).as(protocol).isAfter(created);
                if (underReviewOrApproved) {
                  assertThat(document.getUploadedAt())
                      .as(protocol)
                      .isBefore(project.getSubmittedAt());
                }
              });
      calculation(protocol)
          .ifPresent(
              calculation -> {
                assertThat(calculation.getCalculatedAt()).as(protocol).isAfter(created);
                if (underReviewOrApproved) {
                  assertThat(calculation.getCalculatedAt())
                      .as(protocol)
                      .isBefore(project.getSubmittedAt());
                }
              });
      for (Finding finding : findings(protocol)) {
        assertThat(finding.getCreatedAt()).as(protocol).isAfter(created);
        if (finding.getVersion() == project.getReviewCycle()) {
          assertThat(finding.getCreatedAt()).as(protocol).isAfter(project.getSubmittedAt());
          if (project.getReviewedAt() != null) {
            assertThat(finding.getCreatedAt()).as(protocol).isBefore(project.getReviewedAt());
          }
        } else {
          assertThat(finding.getCreatedAt()).as(protocol).isBefore(project.getSubmittedAt());
        }
        if (finding.getRespondedAt() != null) {
          assertThat(finding.getRespondedAt()).as(protocol).isAfter(finding.getCreatedAt());
          assertThat(finding.getRespondedAt()).as(protocol).isBeforeOrEqualTo(now);
          if (finding.getVersion() == project.getReviewCycle()) {
            assertThat(finding.getRespondedAt()).as(protocol).isAfter(project.getReviewedAt());
          } else {
            assertThat(finding.getRespondedAt()).as(protocol).isBefore(project.getSubmittedAt());
          }
        }
      }
    }
  }

  @Test
  void datesTheOwnersBeforeTheirProjects() {
    for (Project project : projectRepository.findAll()) {
      User owner = detail(project.getProtocol()).getOwner();
      assertThat(owner.getCreatedAt()).as(project.getProtocol()).isBefore(project.getCreatedAt());
    }
  }

  @Test
  void dateDistancesFollowTheStories() {
    assertThat(ChronoUnit.DAYS.between(project("2026-2042").getCreatedAt(), OffsetDateTime.now()))
        .isGreaterThan(150);
  }

  private static Set<String> scenarioProtocols() {
    User anyone = new User("Qualquer", "qualquer@ampere.com", "hash", UserRole.USER);

    return DemoScenarios.all(new DemoUsers(anyone, anyone, anyone, anyone, anyone, anyone, anyone))
        .stream()
        .map(Scenario::protocol)
        .collect(Collectors.toSet());
  }

  private Project project(String protocol) {
    return projectRepository.findByProtocol(protocol).orElseThrow();
  }

  private Project detail(String protocol) {
    return projectRepository.findDetailById(project(protocol).getId()).orElseThrow();
  }

  private String owner(String protocol) {
    return detail(protocol).getOwner().getEmail();
  }

  private String reviewer(String protocol) {
    User reviewer = detail(protocol).getReviewer();
    return reviewer == null ? null : reviewer.getEmail();
  }

  private Long id(String email) {
    return userRepository.findByEmail(email).orElseThrow().getId();
  }

  private List<ConsumerUnitGroup> groups(String protocol) {
    return groupRepository.findAllByProjectIdOrderById(project(protocol).getId());
  }

  private List<Finding> findings(String protocol) {
    return findingRepository.findAllByProjectIdOrderByCreatedAtAscIdAsc(project(protocol).getId());
  }

  private List<FindingStatus> statuses(String protocol) {
    return findings(protocol).stream().map(Finding::getStatus).toList();
  }

  private long unansweredBlocking(String protocol) {
    return findingRepository.countByProjectIdAndSeverityAndStatus(
        project(protocol).getId(), FindingSeverity.BLOCKING, FindingStatus.OPEN);
  }

  private List<ProjectDocument> documents(String protocol) {
    return documentRepository.findAllByProjectIdOrderByType(project(protocol).getId());
  }

  private java.util.Optional<Calculation> calculation(String protocol) {
    return calculationRepository.findFirstByProjectIdOrderByIdDesc(project(protocol).getId());
  }

  private boolean isCurrent(String protocol) {
    return transaction()
        .execute(status -> demandCalculation.isCurrent(calculation(protocol).orElseThrow()));
  }

  private long daysLeft(String protocol, LocalDate today) {
    return ChronoUnit.DAYS.between(
        today, project(protocol).reviewDeadline(ReviewQueueService.ZONE));
  }
}
