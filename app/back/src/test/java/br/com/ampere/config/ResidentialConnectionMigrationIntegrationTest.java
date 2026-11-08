package br.com.ampere.config;

import static org.assertj.core.api.Assertions.assertThat;

import br.com.ampere.domain.ConnectionType;
import br.com.ampere.domain.ConsumerUnitGroup;
import br.com.ampere.domain.EntranceStandard;
import br.com.ampere.domain.EvStationType;
import br.com.ampere.domain.GroupKind;
import br.com.ampere.domain.GroupSpec;
import br.com.ampere.domain.LoadCategory;
import br.com.ampere.domain.PowerUnit;
import br.com.ampere.domain.Project;
import br.com.ampere.domain.ResidentialGroup;
import br.com.ampere.domain.ResidentialMultifamily;
import br.com.ampere.domain.SupplyVoltage;
import br.com.ampere.domain.User;
import br.com.ampere.domain.UserRole;
import br.com.ampere.repository.ConsumerUnitGroupRepository;
import br.com.ampere.repository.ProjectRepository;
import br.com.ampere.repository.UserRepository;
import jakarta.persistence.EntityManager;
import java.math.BigDecimal;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.transaction.annotation.Transactional;

@SpringBootTest
@Transactional
class ResidentialConnectionMigrationIntegrationTest {

  @Autowired private ResidentialConnectionMigration migration;

  @Autowired private ProjectRepository projectRepository;

  @Autowired private UserRepository userRepository;

  @Autowired private ConsumerUnitGroupRepository groupRepository;

  @Autowired private JdbcTemplate jdbcTemplate;

  @Autowired private EntityManager entityManager;

  @Test
  void anApartmentGroupSavedWithoutConnectionBecomesSinglePhase() {
    Project project = project();
    Long apartments = groupRepository.save(apartments(project)).getId();
    Long charging = groupRepository.save(charging(project)).getId();
    entityManager.flush();
    jdbcTemplate.update("UPDATE consumer_unit_group SET connection_type = NULL");

    migration.run(null);
    entityManager.clear();

    ResidentialGroup migrated = (ResidentialGroup) groupRepository.findById(apartments).get();
    assertThat(migrated.getConnectionType()).isEqualTo(ConnectionType.SINGLE_PHASE);
    assertThat(migrated.getUnitLoadKw()).isEqualByComparingTo("6.5");
    assertThat(migrated.validate()).isEmpty();
    assertThat(groupRepository.findById(charging).get().spec().connectionType()).isNull();
  }

  @Test
  void keepsTheConnectionAlreadyDeclared() {
    Project project = project();
    Long apartments = groupRepository.save(threePhase(project)).getId();
    entityManager.flush();

    migration.run(null);
    entityManager.clear();

    assertThat(((ResidentialGroup) groupRepository.findById(apartments).get()).getConnectionType())
        .isEqualTo(ConnectionType.THREE_PHASE);
  }

  private Project project() {
    User owner =
        userRepository.save(new User("Usuário", "migration@ampere.com", "hash", UserRole.USER));
    return projectRepository.save(
        Project.draft(
            "Residencial",
            "Rua 1",
            "Recife",
            "2026-9001",
            new ResidentialMultifamily(
                4, SupplyVoltage.V380_220, ConnectionType.THREE_PHASE, EntranceStandard.COLLECTIVE),
            List.of(),
            owner));
  }

  private static ConsumerUnitGroup apartments(Project project) {
    return GroupKind.RESIDENTIAL.create(
        project,
        new GroupSpec(
            "Apartamento tipo A",
            8,
            new BigDecimal("68"),
            2,
            new BigDecimal("6.5"),
            false,
            ConnectionType.SINGLE_PHASE,
            null,
            null,
            null,
            null,
            null,
            null));
  }

  private static ConsumerUnitGroup threePhase(Project project) {
    return GroupKind.RESIDENTIAL.create(
        project,
        new GroupSpec(
            "Cobertura",
            2,
            new BigDecimal("180"),
            3,
            null,
            false,
            ConnectionType.THREE_PHASE,
            null,
            List.of(
                ScenarioGroups.item(
                    LoadCategory.INSTANT_HEATING, "Chuveiro", 2, "5.5", PowerUnit.KW, null, null)),
            null,
            null,
            null,
            null));
  }

  private static ConsumerUnitGroup charging(Project project) {
    return GroupKind.EV_CHARGING.create(
        project,
        new GroupSpec(
            "Recarga",
            2,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            new BigDecimal("7.4"),
            false,
            true,
            EvStationType.COLLECTIVE));
  }
}
