package br.com.ampere.config;

import br.com.ampere.domain.NormativeTable;
import br.com.ampere.domain.Project;
import br.com.ampere.domain.Standard;
import br.com.ampere.domain.User;
import br.com.ampere.domain.UserRole;
import br.com.ampere.repository.NormativeTableRepository;
import br.com.ampere.repository.ProjectRepository;
import br.com.ampere.repository.StandardRepository;
import br.com.ampere.repository.UserRepository;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.List;
import java.util.function.Function;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.core.env.Environment;
import org.springframework.core.env.Profiles;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * Bootstraps the development database: the users, the two standards and their tables. The projects
 * come from the {@link DemoScenarioSeeder}, scenario by scenario.
 */
@Component
@Profile("(!prod & !test) | demo")
public class DataSeeder implements CommandLineRunner {

  private static final Logger log = LoggerFactory.getLogger(DataSeeder.class);

  public static final String DEVELOPMENT_PASSWORD = "senha@123";

  public static final String USER_EMAIL = "user@ampere.com";
  public static final String ADMIN_EMAIL = "admin@ampere.com";
  public static final String REVIEWER_EMAIL = "revisor@ampere.com";
  public static final String SECOND_DESIGNER_EMAIL = "projetista@ampere.com";
  public static final String SECOND_ANALYST_EMAIL = "analista@ampere.com";
  public static final String INACTIVE_DESIGNER_EMAIL = "inativo@ampere.com";
  public static final String PARAIBA_DESIGNER_EMAIL = "joao@ampere.com";
  public static final String NEW_DESIGNER_EMAIL = "novo@ampere.com";

  private record Account(User user, int createdDaysAgo) {}

  private final ProjectRepository projectRepository;
  private final StandardRepository standardRepository;
  private final NormativeTableRepository normativeTableRepository;
  private final UserRepository userRepository;
  private final PasswordEncoder passwordEncoder;
  private final SeedTimestamps timestamps;
  private final Environment environment;

  public DataSeeder(
      ProjectRepository projectRepository,
      StandardRepository standardRepository,
      NormativeTableRepository normativeTableRepository,
      UserRepository userRepository,
      PasswordEncoder passwordEncoder,
      SeedTimestamps timestamps,
      Environment environment) {
    this.projectRepository = projectRepository;
    this.standardRepository = standardRepository;
    this.normativeTableRepository = normativeTableRepository;
    this.userRepository = userRepository;
    this.passwordEncoder = passwordEncoder;
    this.timestamps = timestamps;
    this.environment = environment;
  }

  @Override
  @Transactional
  public void run(String... args) {
    seedUsers();
    demoteLegacyReviewer();
    indexLegacyUsers();
    completeDevelopmentProfile();
    // These fix databases of the development era; the demo profile in production must not touch
    // projects it did not create.
    if (!environment.acceptsProfiles(Profiles.of("prod"))) {
      assignOwnerToLegacyProjects();
      startReviewCycleOfLegacySubmissions();
      dateLegacySubmissions();
    }
    seedNormativeTables(seedStandards());
  }

  /** Users created before the administrator's search existed get their search index. */
  private void indexLegacyUsers() {
    List<User> unindexed = userRepository.findAllBySearchIndex("");
    if (!unindexed.isEmpty()) {
      unindexed.forEach(User::indexForSearch);
      log.info("DataSeeder: search index filled for {} legacy users.", unindexed.size());
    }
  }

  /** The development designer predates the CREA; only this account is completed. */
  private void completeDevelopmentProfile() {
    userRepository
        .findByEmail(USER_EMAIL)
        .filter(designer -> designer.getCrea() == null)
        .ifPresent(
            designer ->
                designer.updateProfile(
                    designer.getName(),
                    "123456",
                    "PE",
                    designer.getCompany(),
                    designer.getPhone()));
  }

  /** Projects seeded before ownership existed go to the development designer. */
  private void assignOwnerToLegacyProjects() {
    List<Project> orphans = projectRepository.findAllByOwnerIsNull();
    if (!orphans.isEmpty()) {
      User owner = userRepository.findByEmail(USER_EMAIL).orElseThrow();
      orphans.forEach(project -> project.assignOwner(owner));
      projectRepository.saveAll(orphans);
      log.info("DataSeeder: owner assigned to {} legacy projects.", orphans.size());
    }
  }

  /** Projects submitted before review cycles existed count as the first submission. */
  private void startReviewCycleOfLegacySubmissions() {
    int updated = projectRepository.startReviewCycleOfLegacySubmissions();
    if (updated > 0) {
      log.info("DataSeeder: review cycle started for {} legacy projects.", updated);
    }
  }

  /** Submitted before the date was recorded: the creation date stands in, so the queue has one. */
  private void dateLegacySubmissions() {
    int updated = projectRepository.dateLegacySubmissions();
    if (updated > 0) {
      log.info("DataSeeder: submission date filled for {} legacy projects.", updated);
    }
  }

  /** Per e-mail, so an older database also gets the users added later. */
  private void seedUsers() {
    String hash = passwordEncoder.encode(DEVELOPMENT_PASSWORD);
    List<Account> missing =
        accounts(hash).stream()
            .filter(account -> userRepository.findByEmail(account.user().getEmail()).isEmpty())
            .toList();
    if (missing.isEmpty()) {
      return;
    }

    userRepository.saveAll(missing.stream().map(Account::user).toList());
    OffsetDateTime now = OffsetDateTime.now(ZoneOffset.UTC);
    missing.forEach(
        account ->
            timestamps.user(account.user().getId(), now.minusDays(account.createdDaysAgo())));
    log.info("DataSeeder: {} development users inserted.", missing.size());
  }

  private static List<Account> accounts(String hash) {
    User inactive =
        User.designer("Bruno Inativo", INACTIVE_DESIGNER_EMAIL, hash, "777888", "PE", null, null);
    inactive.administer(inactive.getName(), UserRole.USER, false);
    User newcomer =
        User.withTemporaryPassword("Diego Novato", NEW_DESIGNER_EMAIL, hash, UserRole.USER);
    newcomer.updateProfile("Diego Novato", "998877", "PE", null, null);

    return List.of(
        new Account(
            User.designer("Usuário Teste", USER_EMAIL, hash, "123456", "PE", null, null), 200),
        new Account(new User("Admin Teste", ADMIN_EMAIL, hash, UserRole.ADMIN), 200),
        new Account(
            new User("Conferente Teste", NormativeTableSeed.VERIFIED_BY, hash, UserRole.ADMIN),
            200),
        new Account(new User("Revisor Teste", REVIEWER_EMAIL, hash, UserRole.REVIEWER), 200),
        new Account(
            User.designer(
                "Carla Projetista",
                SECOND_DESIGNER_EMAIL,
                hash,
                "654321",
                "PE",
                "Carla Engenharia Elétrica",
                "81999990000"),
            150),
        new Account(new User("Ana Analista", SECOND_ANALYST_EMAIL, hash, UserRole.REVIEWER), 120),
        new Account(inactive, 190),
        new Account(
            User.designer(
                "João Batista",
                PARAIBA_DESIGNER_EMAIL,
                hash,
                "223344",
                "PB",
                "Batista Instalações Elétricas",
                "83999990001"),
            60),
        new Account(newcomer, 2));
  }

  /** The reviewer was seeded as an admin before the analyst had a role of their own. */
  private void demoteLegacyReviewer() {
    userRepository
        .findByEmail(REVIEWER_EMAIL)
        .filter(reviewer -> reviewer.getRole() == UserRole.ADMIN)
        .ifPresent(
            reviewer -> {
              reviewer.administer(reviewer.getName(), UserRole.REVIEWER, reviewer.isActive());
              log.info("DataSeeder: {} is now an analyst.", REVIEWER_EMAIL);
            });
  }

  private void seedNormativeTables(List<Standard> standards) {
    if (normativeTableRepository.count() > 0) {
      return;
    }

    List<NormativeTable> tables =
        normativeTableRepository.saveAll(
            NormativeTableSeed.all(
                standards.stream()
                    .collect(Collectors.toMap(Standard::getName, Function.identity()))));
    OffsetDateTime now = OffsetDateTime.now(ZoneOffset.UTC);
    tables.forEach(table -> timestamps.table(table.getId(), now.minusDays(90), now.minusDays(89)));
    log.info("DataSeeder: {} published normative tables inserted.", tables.size());
  }

  private List<Standard> seedStandards() {
    if (standardRepository.count() > 0) {
      return standardRepository.findAll();
    }

    List<Standard> standards =
        standardRepository.saveAll(
            List.of(new Standard("DIS-NOR-053", "REV 06"), new Standard("DIS-NOR-030", "REV 07")));
    log.info("DataSeeder: two standards inserted.");

    return standards;
  }
}
