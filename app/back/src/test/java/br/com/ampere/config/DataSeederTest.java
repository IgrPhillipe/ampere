package br.com.ampere.config;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.tuple;

import br.com.ampere.domain.BuildingType;
import br.com.ampere.domain.ConnectionType;
import br.com.ampere.domain.EntranceStandard;
import br.com.ampere.domain.NormativeTable;
import br.com.ampere.domain.NormativeTableCode;
import br.com.ampere.domain.NormativeTableStatus;
import br.com.ampere.domain.Project;
import br.com.ampere.domain.ProjectStatus;
import br.com.ampere.domain.ResidentialMultifamily;
import br.com.ampere.domain.Standard;
import br.com.ampere.domain.SupplyVoltage;
import br.com.ampere.domain.User;
import br.com.ampere.domain.UserRole;
import java.time.OffsetDateTime;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
class DataSeederTest extends SeedIntegrationTestBase {

  @BeforeEach
  void startEmpty() {
    wipe();
  }

  @Test
  void seedsTheDevelopmentUsersWithHashedPasswords() {
    bootstrap();

    List<User> users = userRepository.findAll();
    assertThat(users)
        .extracting(User::getEmail, User::getRole, User::isActive)
        .containsExactlyInAnyOrder(
            tuple("user@ampere.com", UserRole.USER, true),
            tuple("admin@ampere.com", UserRole.ADMIN, true),
            tuple("conferente@ampere.com", UserRole.ADMIN, true),
            tuple("revisor@ampere.com", UserRole.REVIEWER, true),
            tuple("projetista@ampere.com", UserRole.USER, true),
            tuple("analista@ampere.com", UserRole.REVIEWER, true),
            tuple("inativo@ampere.com", UserRole.USER, false),
            tuple("joao@ampere.com", UserRole.USER, true),
            tuple("novo@ampere.com", UserRole.USER, true));
    assertThat(users)
        .allSatisfy(
            user -> {
              assertThat(user.getPasswordHash()).isNotEqualTo(DataSeeder.DEVELOPMENT_PASSWORD);
              assertThat(
                      passwordEncoder.matches(
                          DataSeeder.DEVELOPMENT_PASSWORD, user.getPasswordHash()))
                  .isTrue();
              assertThat(user.getCreatedAt()).isBefore(OffsetDateTime.now().minusDays(1));
            });
  }

  @Test
  void createsADesignerFromParaibaAndOneWhoMustChangeThePassword() {
    bootstrap();

    User joao = userRepository.findByEmail("joao@ampere.com").orElseThrow();
    assertThat(joao.getName()).isEqualTo("João Batista");
    assertThat(joao.getCreaState()).isEqualTo("PB");
    assertThat(joao.isMustChangePassword()).isFalse();
    User diego = userRepository.findByEmail("novo@ampere.com").orElseThrow();
    assertThat(diego.getName()).isEqualTo("Diego Novato");
    assertThat(diego.isMustChangePassword()).isTrue();
    assertThat(userRepository.findByEmail("projetista@ampere.com").orElseThrow().getName())
        .isEqualTo("Carla Projetista");
    assertThat(userRepository.findByEmail("analista@ampere.com").orElseThrow().getName())
        .isEqualTo("Ana Analista");
    assertThat(userRepository.findByEmail("user@ampere.com").orElseThrow().getCrea())
        .isEqualTo("123456");
  }

  @Test
  void doesNotDuplicateUsersOnRestart() {
    bootstrap();
    bootstrap();

    assertThat(userRepository.count()).isEqualTo(9);
  }

  @Test
  void addsTheUsersMissingFromADatabaseSeededBefore() {
    bootstrap();
    userRepository.delete(userRepository.findByEmail("joao@ampere.com").orElseThrow());
    userRepository.delete(userRepository.findByEmail("novo@ampere.com").orElseThrow());

    bootstrap();

    assertThat(userRepository.count()).isEqualTo(9);
  }

  @Test
  void turnsTheReviewerSeededAsAnAdminIntoAnAnalyst() {
    userRepository.save(
        new User("Revisor Teste", DataSeeder.REVIEWER_EMAIL, "hash", UserRole.ADMIN));

    bootstrap();

    assertThat(userRepository.findByEmail(DataSeeder.REVIEWER_EMAIL).orElseThrow().getRole())
        .isEqualTo(UserRole.REVIEWER);
  }

  @Test
  void seedsBothCurrentStandardsOnce() {
    bootstrap();
    bootstrap();

    assertThat(standardRepository.findAll())
        .extracting(Standard::getName, Standard::getRevision)
        .containsExactlyInAnyOrder(tuple("DIS-NOR-053", "REV 06"), tuple("DIS-NOR-030", "REV 07"));
  }

  @Test
  void seedsEveryTableTheCalculationReadsAlreadyPublishedAndOnlyOnce() {
    bootstrap();
    bootstrap();

    List<NormativeTable> tables = normativeTableRepository.findListingBy();
    assertThat(tables)
        .extracting(NormativeTable::getCode)
        .containsExactlyInAnyOrder(NormativeTableCode.values());
    assertThat(tables)
        .allSatisfy(
            table -> {
              assertThat(table.getStatus()).isEqualTo(NormativeTableStatus.PUBLISHED);
              assertThat(table.problems()).isEmpty();
              assertThat(table.getStandard().getName())
                  .isEqualTo(table.getCode().standard().code());
              assertThat(table.getVerifiedAt()).isAfter(table.getRegisteredAt());
              assertThat(table.getRegisteredAt()).isBefore(OffsetDateTime.now().minusDays(30));
            });
  }

  @Test
  void leavesTheProjectsToTheScenarioSeeder() {
    bootstrap();

    assertThat(projectRepository.count()).isZero();
  }

  @Test
  void repairsTheLegacyProjectsOfADevelopmentDatabase() {
    bootstrap();
    User owner = userRepository.findByEmail(DataSeeder.USER_EMAIL).orElseThrow();
    Project orphan = projectRepository.save(project("2026-9001", null, ProjectStatus.DRAFT));
    Project undated = project("2026-9002", owner, ProjectStatus.UNDER_REVIEW);
    projectRepository.save(undated);

    bootstrap();

    Project fixedOrphan = projectRepository.findDetailById(orphan.getId()).orElseThrow();
    assertThat(fixedOrphan.getOwner().getEmail()).isEqualTo(DataSeeder.USER_EMAIL);
    Project dated = projectRepository.findByProtocol("2026-9002").orElseThrow();
    assertThat(dated.getSubmittedAt()).isNotNull();
    assertThat(dated.getReviewCycle()).isEqualTo(1);
  }

  @Test
  void leavesRealProjectsAloneUnderTheDemoProfileInProduction() {
    bootstrap(production());
    User owner = userRepository.findByEmail(DataSeeder.USER_EMAIL).orElseThrow();
    Project orphan = projectRepository.save(project("2026-9001", null, ProjectStatus.DRAFT));
    projectRepository.save(project("2026-9002", owner, ProjectStatus.UNDER_REVIEW));

    bootstrap(production());

    assertThat(projectRepository.findDetailById(orphan.getId()).orElseThrow().getOwner()).isNull();
    Project untouched = projectRepository.findByProtocol("2026-9002").orElseThrow();
    assertThat(untouched.getSubmittedAt()).isNull();
    assertThat(untouched.getReviewCycle()).isZero();
  }

  private static Project project(String protocol, User owner, ProjectStatus status) {
    BuildingType building =
        new ResidentialMultifamily(
            4, SupplyVoltage.V380_220, ConnectionType.THREE_PHASE, EntranceStandard.COLLECTIVE);
    return new Project(
        "Projeto " + protocol,
        "Rua Qualquer, 1",
        "Recife",
        protocol,
        status,
        building,
        List.of(),
        owner);
  }
}
