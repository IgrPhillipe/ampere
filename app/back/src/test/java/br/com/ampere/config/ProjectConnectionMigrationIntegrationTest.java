package br.com.ampere.config;

import static org.assertj.core.api.Assertions.assertThat;

import br.com.ampere.domain.Calculation;
import br.com.ampere.domain.CalculationCheck;
import br.com.ampere.domain.ConnectionType;
import br.com.ampere.domain.DemandComponent;
import br.com.ampere.domain.DemandResult;
import br.com.ampere.domain.DemandStep;
import br.com.ampere.domain.EntranceStandard;
import br.com.ampere.domain.Project;
import br.com.ampere.domain.ResidentialMultifamily;
import br.com.ampere.domain.SupplyVoltage;
import br.com.ampere.repository.CalculationRepository;
import br.com.ampere.repository.ProjectRepository;
import br.com.ampere.service.DemandCalculationService;
import jakarta.persistence.EntityManager;
import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Stream;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.transaction.annotation.Transactional;

@SpringBootTest
@Transactional
class ProjectConnectionMigrationIntegrationTest {

  private static final String LEGACY_SNAPSHOT =
      """
      {"buildingType":"RESIDENTIAL_MULTIFAMILY","floors":4,"voltage":"V220_127",\
      "connectionType":"TWO_PHASE","entranceStandard":"INDIVIDUAL","groups":[]}
      """;

  @Autowired private ProjectConnectionMigration migration;

  @Autowired private ProjectRepository projectRepository;

  @Autowired private CalculationRepository calculationRepository;

  @Autowired private DemandCalculationService calculationService;

  @Autowired private JdbcTemplate jdbcTemplate;

  @Autowired private EntityManager entityManager;

  @Test
  void migratesLegacyProjectsAndCalculationsBeforeJpaReadsThem() {
    Project project = projectRepository.save(project("2026-9201", ConnectionType.THREE_PHASE));
    Calculation calculation =
        calculationRepository.save(new Calculation(project, demand(), LEGACY_SNAPSHOT));
    entityManager.flush();

    allowLegacyConnection("building_type");
    allowLegacyConnection("calculation");
    jdbcTemplate.update(
        "UPDATE building_type SET connection_type = 'TWO_PHASE' WHERE id = ?",
        project.getBuildingType().getId());
    jdbcTemplate.update(
        "UPDATE calculation SET connection_type = 'TWO_PHASE' WHERE id = ?", calculation.getId());
    entityManager.clear();

    migration.run(null);
    migration.run(null);
    entityManager.clear();

    Project migrated = projectRepository.findById(project.getId()).orElseThrow();
    Calculation migratedCalculation =
        calculationRepository.findById(calculation.getId()).orElseThrow();
    assertThat(migrated.getBuildingType().getConnectionType())
        .isEqualTo(ConnectionType.THREE_PHASE);
    assertThat(migratedCalculation.getConnectionType()).isEqualTo(ConnectionType.THREE_PHASE);
    assertThat(migratedCalculation.getInputSnapshot()).contains("TWO_PHASE");
    assertThat(calculationService.isCurrent(migratedCalculation)).isFalse();
  }

  @Test
  void keepsSupportedConnectionsUnchanged() {
    Project single = projectRepository.save(project("2026-9202", ConnectionType.SINGLE_PHASE));
    Project three = projectRepository.save(project("2026-9203", ConnectionType.THREE_PHASE));
    entityManager.flush();

    migration.run(null);
    entityManager.clear();

    assertThat(projectRepository.findById(single.getId()).orElseThrow().getBuildingType())
        .extracting(type -> type.getConnectionType())
        .isEqualTo(ConnectionType.SINGLE_PHASE);
    assertThat(projectRepository.findById(three.getId()).orElseThrow().getBuildingType())
        .extracting(type -> type.getConnectionType())
        .isEqualTo(ConnectionType.THREE_PHASE);
  }

  private void allowLegacyConnection(String table) {
    jdbcTemplate.execute(
        "ALTER TABLE " + table + " DROP CONSTRAINT IF EXISTS " + table + "_connection_type_check");
  }

  private static Project project(String protocol, ConnectionType connectionType) {
    return Project.draft(
        "Residencial legado",
        "Rua 1",
        "Recife",
        protocol,
        new ResidentialMultifamily(
            4, SupplyVoltage.V220_127, connectionType, EntranceStandard.INDIVIDUAL),
        List.of());
  }

  private static DemandResult demand() {
    List<DemandStep> steps =
        Stream.concat(
                Arrays.stream(DemandComponent.values())
                    .map(
                        component ->
                            new DemandStep(
                                component.symbol(),
                                component.title(),
                                false,
                                "",
                                List.of(),
                                BigDecimal.ZERO,
                                null,
                                List.of(),
                                null)),
                Stream.of(
                    new DemandStep(
                        "Ded",
                        "Demanda Total da Edificação",
                        true,
                        "",
                        List.of(),
                        BigDecimal.TEN,
                        null,
                        List.of(),
                        null)))
            .toList();
    return new DemandResult(
        steps,
        BigDecimal.TEN,
        BigDecimal.TEN,
        BigDecimal.TEN,
        false,
        null,
        BigDecimal.TEN,
        List.<CalculationCheck>of(),
        List.of());
  }
}
