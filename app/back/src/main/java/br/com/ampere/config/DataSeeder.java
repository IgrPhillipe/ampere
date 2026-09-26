package br.com.ampere.config;

import br.com.ampere.domain.BuildingType;
import br.com.ampere.domain.ConnectionType;
import br.com.ampere.domain.ConsumerUnitGroup;
import br.com.ampere.domain.EntranceStandard;
import br.com.ampere.domain.EvStationType;
import br.com.ampere.domain.Finding;
import br.com.ampere.domain.GroupKind;
import br.com.ampere.domain.GroupSpec;
import br.com.ampere.domain.LoadCategory;
import br.com.ampere.domain.LoadItem;
import br.com.ampere.domain.LoadUsage;
import br.com.ampere.domain.Mixed;
import br.com.ampere.domain.NonResidential;
import br.com.ampere.domain.PowerUnit;
import br.com.ampere.domain.Project;
import br.com.ampere.domain.ProjectStatus;
import br.com.ampere.domain.ResidentialMultifamily;
import br.com.ampere.domain.Standard;
import br.com.ampere.domain.StandardName;
import br.com.ampere.domain.SupplyVoltage;
import br.com.ampere.domain.User;
import br.com.ampere.domain.UserRole;
import br.com.ampere.repository.ConsumerUnitGroupRepository;
import br.com.ampere.repository.FindingRepository;
import br.com.ampere.repository.ProjectRepository;
import br.com.ampere.repository.StandardRepository;
import br.com.ampere.repository.UserRepository;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/** Populates development tables on the first application startup. */
@Component
@Profile("!prod & !test")
public class DataSeeder implements CommandLineRunner {

  private static final Logger log = LoggerFactory.getLogger(DataSeeder.class);

  private final ProjectRepository projectRepository;
  private final FindingRepository findingRepository;
  private final ConsumerUnitGroupRepository groupRepository;
  private final StandardRepository standardRepository;
  private final UserRepository userRepository;
  private final PasswordEncoder passwordEncoder;

  public static final String DEVELOPMENT_PASSWORD = "senha@123";

  /** The draft project, the one that receives the consumer unit groups of prototype H3. */
  public static final String DRAFT_PROTOCOL = "2026-1001";

  public DataSeeder(
      ProjectRepository projectRepository,
      FindingRepository findingRepository,
      ConsumerUnitGroupRepository groupRepository,
      StandardRepository standardRepository,
      UserRepository userRepository,
      PasswordEncoder passwordEncoder) {
    this.projectRepository = projectRepository;
    this.findingRepository = findingRepository;
    this.groupRepository = groupRepository;
    this.standardRepository = standardRepository;
    this.userRepository = userRepository;
    this.passwordEncoder = passwordEncoder;
  }

  @Override
  @Transactional
  public void run(String... args) {
    seedUsers();
    seedDevelopmentData(seedStandards());
    seedGroups();
  }

  private void seedUsers() {
    if (userRepository.count() > 0) {
      return;
    }

    String hash = passwordEncoder.encode(DEVELOPMENT_PASSWORD);

    userRepository.saveAll(
        List.of(
            new User("Usuário Teste", "user@ampere.local", hash, UserRole.USER),
            new User("Admin Teste", "admin@ampere.local", hash, UserRole.ADMIN)));

    log.info("DataSeeder: two development users inserted.");
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

  private void seedDevelopmentData(List<Standard> standards) {
    if (projectRepository.count() > 0) {
      return;
    }

    Map<String, Standard> byName =
        standards.stream().collect(Collectors.toMap(Standard::getName, Function.identity()));

    Project draft =
        seed(
            "Residencial Monte Verde",
            "Rodovia BR-101, km 8",
            "Cabo de Santo Agostinho",
            DRAFT_PROTOCOL,
            ProjectStatus.DRAFT,
            new ResidentialMultifamily(
                12,
                SupplyVoltage.V380_220,
                ConnectionType.THREE_PHASE,
                EntranceStandard.COLLECTIVE),
            byName);
    Project awaitingSubmission =
        seed(
            "Edifício Torre Norte",
            "Avenida Norte, 4501",
            "Recife",
            "2026-1002",
            ProjectStatus.AWAITING_SUBMISSION,
            new Mixed(
                18,
                SupplyVoltage.V380_220,
                ConnectionType.THREE_PHASE,
                EntranceStandard.COLLECTIVE),
            byName);
    Project underReview =
        seed(
            "Edifício Residencial Aurora",
            "Rua da Aurora, 1240",
            "Recife",
            "2026-1003",
            ProjectStatus.UNDER_REVIEW,
            new ResidentialMultifamily(
                9, SupplyVoltage.V220_127, ConnectionType.THREE_PHASE, EntranceStandard.COLLECTIVE),
            byName);
    Project rejected =
        seed(
            "Condomínio Vila Nova",
            "Avenida Barreto de Menezes, 88",
            "Jaboatão dos Guararapes",
            "2026-1004",
            ProjectStatus.REJECTED,
            new ResidentialMultifamily(
                6, SupplyVoltage.V220_127, ConnectionType.TWO_PHASE, EntranceStandard.INDIVIDUAL),
            byName);
    Project anotherRejected =
        seed(
            "Centro Empresarial Recife",
            "Avenida Guararapes, 250",
            "Recife",
            "2026-1005",
            ProjectStatus.REJECTED,
            new NonResidential(
                14,
                SupplyVoltage.V380_220,
                ConnectionType.THREE_PHASE,
                EntranceStandard.INDIVIDUAL),
            byName);
    Project approved =
        seed(
            "Comercial Praça Sul",
            "Rua do Sol, 302",
            "Olinda",
            "2026-1006",
            ProjectStatus.APPROVED,
            new NonResidential(
                3,
                SupplyVoltage.V220_127,
                ConnectionType.SINGLE_PHASE,
                EntranceStandard.INDIVIDUAL),
            byName);

    projectRepository.saveAll(
        List.of(draft, awaitingSubmission, underReview, rejected, anotherRejected, approved));
    findingRepository.saveAll(
        List.of(
            new Finding(rejected),
            new Finding(rejected),
            new Finding(rejected),
            new Finding(anotherRejected)));

    log.info("DataSeeder: six projects and four findings inserted.");
  }

  /**
   * The five groups of prototype H3: three apartment types already validated, a common area with a
   * motor to review and a charging group missing data. Separate from the projects, so a database
   * seeded before the consumer units existed gets them too.
   */
  private void seedGroups() {
    if (groupRepository.count() > 0) {
      return;
    }

    projectRepository
        .findByProtocol(DRAFT_PROTOCOL)
        .filter(Project::isDraft)
        .ifPresent(
            draft -> {
              groupRepository.saveAll(
                  List.of(
                      apartments(draft, "Apartamento tipo A", 24, "68", 2, "6.50"),
                      apartments(draft, "Apartamento tipo B", 20, "92", 3, "8.20"),
                      apartments(draft, "Cobertura duplex", 4, "140", 4, "11.40"),
                      GroupKind.LOAD.create(
                          draft,
                          new GroupSpec(
                              "Área comum",
                              1,
                              null,
                              null,
                              null,
                              null,
                              LoadUsage.COMMON_AREA,
                              List.of(
                                  new LoadItem(
                                      LoadCategory.MOTORS,
                                      "Elevador",
                                      1,
                                      new BigDecimal("12"),
                                      PowerUnit.CV,
                                      null,
                                      null),
                                  new LoadItem(
                                      LoadCategory.PUMPS_AND_HOT_TUBS,
                                      "Bombas de recalque",
                                      2,
                                      new BigDecimal("5"),
                                      PowerUnit.CV,
                                      null,
                                      null),
                                  new LoadItem(
                                      LoadCategory.LIGHTING_AND_OUTLETS,
                                      "Iluminação e tomadas",
                                      1,
                                      new BigDecimal("25.80"),
                                      PowerUnit.KW,
                                      null,
                                      null)),
                              null,
                              null,
                              null,
                              null)),
                      GroupKind.EV_CHARGING.create(
                          draft,
                          new GroupSpec(
                              "Recarga de veículo elétrico",
                              6,
                              null,
                              null,
                              null,
                              null,
                              null,
                              null,
                              new BigDecimal("7.40"),
                              false,
                              null,
                              EvStationType.COLLECTIVE))));

              log.info("DataSeeder: five consumer unit groups inserted in the draft project.");
            });
  }

  private static ConsumerUnitGroup apartments(
      Project project,
      String name,
      int quantity,
      String usefulArea,
      int bedrooms,
      String unitLoadKw) {
    return GroupKind.RESIDENTIAL.create(
        project,
        new GroupSpec(
            name,
            quantity,
            new BigDecimal(usefulArea),
            bedrooms,
            new BigDecimal(unitLoadKw),
            false,
            null,
            null,
            null,
            null,
            null,
            null));
  }

  private static Project seed(
      String name,
      String address,
      String municipality,
      String protocol,
      ProjectStatus status,
      BuildingType buildingType,
      Map<String, Standard> standardsByName) {
    List<Standard> standards =
        buildingType.applicableStandards().stream()
            .map(StandardName::code)
            .map(standardsByName::get)
            .toList();

    return new Project(name, address, municipality, protocol, status, buildingType, standards);
  }
}
