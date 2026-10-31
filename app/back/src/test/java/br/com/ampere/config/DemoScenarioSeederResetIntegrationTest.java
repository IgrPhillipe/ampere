package br.com.ampere.config;

import static org.assertj.core.api.Assertions.assertThat;

import br.com.ampere.domain.BuildingType;
import br.com.ampere.domain.ConnectionType;
import br.com.ampere.domain.EntranceStandard;
import br.com.ampere.domain.NormativeTable;
import br.com.ampere.domain.NormativeTableCode;
import br.com.ampere.domain.NormativeTableRow;
import br.com.ampere.domain.NormativeTableStatus;
import br.com.ampere.domain.Project;
import br.com.ampere.domain.ProjectStatus;
import br.com.ampere.domain.ResidentialMultifamily;
import br.com.ampere.domain.Standard;
import br.com.ampere.domain.SupplyVoltage;
import br.com.ampere.domain.User;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

/** Seeds the database more than once, over databases that already hold something. */
@SpringBootTest
class DemoScenarioSeederResetIntegrationTest extends SeedIntegrationTestBase {

  private static final int SCENARIOS = 51;

  @BeforeEach
  void startEmpty() {
    wipe();
    bootstrap();
  }

  @Test
  void createsEveryScenarioOnAnEmptyDatabaseAndNothingTheSecondTime() {
    assertThat(scenarioSeeder(false).seed()).isEqualTo(SCENARIOS);
    long groups = groupRepository.count();
    long findings = findingRepository.count();
    long documents = documentRepository.count();
    long calculations = calculationRepository.count();

    assertThat(scenarioSeeder(false).seed()).isZero();

    assertThat(projectRepository.count()).isEqualTo(SCENARIOS);
    assertThat(groupRepository.count()).isEqualTo(groups);
    assertThat(findingRepository.count()).isEqualTo(findings);
    assertThat(documentRepository.count()).isEqualTo(documents);
    assertThat(calculationRepository.count()).isEqualTo(calculations);
  }

  @Test
  void givesEveryScenarioToADatabaseThatAlreadyHasOtherProjects() {
    User owner = userRepository.findByEmail(DataSeeder.USER_EMAIL).orElseThrow();
    projectRepository.save(project("2026-9001", "Projeto de verdade", owner, ProjectStatus.DRAFT));
    Project submitted =
        projectRepository.save(
            project("2026-9002", "Projeto enviado sem grupos", owner, ProjectStatus.DRAFT));
    submitted.submit(OffsetDateTime.now().minusDays(3));
    projectRepository.save(submitted);
    // One of the seed's protocols is taken by somebody else's project.
    projectRepository.save(
        project("2026-2020", "Projeto de outra pessoa", owner, ProjectStatus.DRAFT));

    assertThat(scenarioSeeder(false).seed()).isEqualTo(SCENARIOS - 1);

    assertThat(projectRepository.count()).isEqualTo(SCENARIOS + 2);
    assertThat(projectRepository.findByProtocol("2026-2020").orElseThrow().getName())
        .isEqualTo("Projeto de outra pessoa");
    Project untouched = projectRepository.findByProtocol("2026-9002").orElseThrow();
    assertThat(groupRepository.findAllByProjectIdOrderById(untouched.getId())).isEmpty();
    assertThat(calculationRepository.findFirstByProjectIdOrderByIdDesc(untouched.getId()))
        .isEmpty();
    assertThat(documentRepository.findAllByProjectIdOrderByType(untouched.getId())).isEmpty();
    assertThat(untouched.getPostalCode()).isNull();
  }

  @Test
  void resetRecreatesOnlyTheSeededProtocols() {
    scenarioSeeder(false).seed();
    User owner = userRepository.findByEmail(DataSeeder.USER_EMAIL).orElseThrow();
    Project unrelated =
        projectRepository.save(
            project("2026-9001", "Projeto de verdade", owner, ProjectStatus.DRAFT));
    Project foreign = projectRepository.findByProtocol("2026-2020").orElseThrow();
    foreign.rename("Projeto de outra pessoa", foreign.getAddress(), foreign.getMunicipality());
    projectRepository.save(foreign);
    Project before = projectRepository.findByProtocol("2026-2001").orElseThrow();

    assertThat(scenarioSeeder(true).seed()).isEqualTo(SCENARIOS - 1);

    assertThat(projectRepository.count()).isEqualTo(SCENARIOS + 1);
    Project after = projectRepository.findByProtocol("2026-2001").orElseThrow();
    assertThat(after.getId()).isNotEqualTo(before.getId());
    assertThat(after.getCreatedAt()).isAfter(before.getCreatedAt());
    assertThat(projectRepository.findByProtocol("2026-9001").orElseThrow().getId())
        .isEqualTo(unrelated.getId());
    assertThat(projectRepository.findByProtocol("2026-2020").orElseThrow().getId())
        .isEqualTo(foreign.getId());
    assertThat(projectRepository.findByProtocol("2026-2020").orElseThrow().getName())
        .isEqualTo("Projeto de outra pessoa");
    assertThat(scenarioSeeder(false).seed()).isZero();
  }

  @Test
  void resetLeavesNoOrphanRowBehind() {
    scenarioSeeder(false).seed();
    long groups = groupRepository.count();
    long findings = findingRepository.count();
    long documents = documentRepository.count();
    long calculations = calculationRepository.count();

    scenarioSeeder(true).seed();

    assertThat(projectRepository.count()).isEqualTo(SCENARIOS);
    assertThat(groupRepository.count()).isEqualTo(groups);
    assertThat(findingRepository.count()).isEqualTo(findings);
    assertThat(documentRepository.count()).isEqualTo(documents);
    assertThat(calculationRepository.count()).isEqualTo(calculations);
  }

  @Test
  void completesOnceTheHistoryOfTheScenariosSeededBeforeIt() {
    scenarioSeeder(false).seed();
    Project seeded = projectRepository.findByProtocol("2026-2017").orElseThrow();
    List<String> told = timeline(seeded);
    Project foreign = projectRepository.findByProtocol("2026-2020").orElseThrow();
    foreign.rename("Projeto de outra pessoa", foreign.getAddress(), foreign.getMunicipality());
    projectRepository.save(foreign);
    eventRepository.deleteAll();

    assertThat(scenarioSeeder(false).seed()).isZero();

    assertThat(timeline(seeded)).isEqualTo(told);
    assertThat(timeline(foreign)).isEmpty();
    assertThat(projectRepository.count()).isEqualTo(SCENARIOS);
    assertThat(projectRepository.findByProtocol("2026-2017-historico")).isEmpty();
    long events = eventRepository.count();

    scenarioSeeder(false).seed();

    assertThat(eventRepository.count()).isEqualTo(events);
  }

  @Test
  void leavesTheScenariosAloneUntilTheResetIsAsked() {
    scenarioSeeder(false).seed();
    Project first = projectRepository.findByProtocol("2026-2001").orElseThrow();

    scenarioSeeder(false).seed();

    assertThat(projectRepository.findByProtocol("2026-2001").orElseThrow().getId())
        .isEqualTo(first.getId());
  }

  @Test
  void revisesSeveralTablesWithRowsThatReallyDiffer() {
    scenarioSeeder(false).seed();

    List<NormativeTable> tables = normativeTableRepository.findListingBy();
    List<NormativeTable> drafts = withStatus(tables, NormativeTableStatus.DRAFT);
    List<NormativeTable> superseded = withStatus(tables, NormativeTableStatus.SUPERSEDED);
    assertThat(drafts)
        .extracting(NormativeTable::getCode)
        .doesNotHaveDuplicates()
        .hasSizeGreaterThan(1);
    assertThat(superseded)
        .extracting(NormativeTable::getCode)
        .doesNotHaveDuplicates()
        .hasSizeGreaterThan(1);
    for (NormativeTable revision : concat(drafts, superseded)) {
      NormativeTable current =
          tables.stream()
              .filter(table -> table.getCode() == revision.getCode())
              .filter(table -> table.getStatus() == NormativeTableStatus.PUBLISHED)
              .findFirst()
              .orElseThrow();
      assertThat(revision.problems()).isEmpty();
      assertThat(values(revision)).as(revision.getCode().name()).isNotEqualTo(values(current));
      assertThat(revision.getRows()).hasSameSizeAs(current.getRows());
    }
    for (NormativeTable old : superseded) {
      NormativeTable current =
          tables.stream()
              .filter(table -> table.getCode() == old.getCode())
              .filter(table -> table.getStatus() == NormativeTableStatus.PUBLISHED)
              .findFirst()
              .orElseThrow();
      assertThat(old.getRegisteredAt()).isBefore(current.getRegisteredAt());
      assertThat(old.getVerifiedAt()).isBefore(current.getVerifiedAt());
    }
    assertThat(drafts).allSatisfy(draft -> assertThat(draft.getVerifiedAt()).isNull());

    scenarioSeeder(false).seed();
    assertThat(normativeTableRepository.count()).isEqualTo(tables.size());
  }

  @Test
  void neverRevisesATableTheSeedDidNotPublish() {
    Map<String, Standard> standards =
        standardRepository.findAll().stream()
            .collect(Collectors.toMap(Standard::getName, Function.identity()));
    normativeTableRepository.deleteAll();
    NormativeTable template =
        NormativeTableSeed.all(standards).stream()
            .filter(table -> table.getCode() == NormativeTableCode.Q35_APARTMENT_DEMAND)
            .findFirst()
            .orElseThrow();
    NormativeTable typedByThirdParties =
        new NormativeTable(
            standards.get(NormativeTableCode.Q35_APARTMENT_DEMAND.standard().code()),
            template.getCode(),
            template.getIdentification(),
            template.getItem(),
            template.getPage(),
            template.getRows(),
            "digitador@cliente.com");
    typedByThirdParties.publish("conferente@cliente.com");
    normativeTableRepository.save(typedByThirdParties);

    int created =
        transaction()
            .execute(
                status ->
                    new NormativeTableRevisions(
                            normativeTableRepository, new SeedTimestamps(entityManager))
                        .seed());

    assertThat(created).isZero();
    assertThat(normativeTableRepository.count()).isEqualTo(1);
  }

  private static List<NormativeTable> withStatus(
      List<NormativeTable> tables, NormativeTableStatus status) {
    return tables.stream().filter(table -> table.getStatus() == status).toList();
  }

  private static List<NormativeTable> concat(
      List<NormativeTable> first, List<NormativeTable> second) {
    return java.util.stream.Stream.concat(first.stream(), second.stream()).toList();
  }

  private static List<String> values(NormativeTable table) {
    return table.getRows().stream()
        .map(
            (NormativeTableRow row) ->
                row.getPrimaryValue().stripTrailingZeros().toPlainString()
                    + "/"
                    + row.getSecondaryValue()
                    + "/"
                    + row.getTertiaryValue())
        .toList();
  }

  private static Project project(String protocol, String name, User owner, ProjectStatus status) {
    BuildingType building =
        new ResidentialMultifamily(
            4, SupplyVoltage.V380_220, ConnectionType.THREE_PHASE, EntranceStandard.COLLECTIVE);
    return new Project(
        name, "Rua Qualquer, 1", "Recife", protocol, status, building, List.of(), owner);
  }

  private List<String> timeline(Project project) {
    return eventRepository.findAllByProjectIdOrderByOccurredAtAscIdAsc(project.getId()).stream()
        .map(
            event ->
                event.getType()
                    + " "
                    + event.getVersion()
                    + " "
                    + event.getOccurredAt().toInstant()
                    + " "
                    + event.getDescription())
        .toList();
  }
}
