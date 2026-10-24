package br.com.ampere.config;

import br.com.ampere.domain.BuildingType;
import br.com.ampere.domain.ConnectionType;
import br.com.ampere.domain.ConsumerUnitGroup;
import br.com.ampere.domain.DocumentType;
import br.com.ampere.domain.EntranceStandard;
import br.com.ampere.domain.EvStationType;
import br.com.ampere.domain.Finding;
import br.com.ampere.domain.FindingSeverity;
import br.com.ampere.domain.FindingStage;
import br.com.ampere.domain.GroupKind;
import br.com.ampere.domain.GroupSpec;
import br.com.ampere.domain.LampTechnology;
import br.com.ampere.domain.LoadCategory;
import br.com.ampere.domain.LoadItem;
import br.com.ampere.domain.LoadUsage;
import br.com.ampere.domain.Mixed;
import br.com.ampere.domain.NonResidential;
import br.com.ampere.domain.NormativeTable;
import br.com.ampere.domain.PowerUnit;
import br.com.ampere.domain.Project;
import br.com.ampere.domain.ProjectDocument;
import br.com.ampere.domain.ProjectStatus;
import br.com.ampere.domain.ResidentialMultifamily;
import br.com.ampere.domain.Standard;
import br.com.ampere.domain.StandardName;
import br.com.ampere.domain.SupplyVoltage;
import br.com.ampere.domain.User;
import br.com.ampere.domain.UserRole;
import br.com.ampere.repository.CalculationRepository;
import br.com.ampere.repository.ConsumerUnitGroupRepository;
import br.com.ampere.repository.FindingRepository;
import br.com.ampere.repository.NormativeTableRepository;
import br.com.ampere.repository.ProjectDocumentRepository;
import br.com.ampere.repository.ProjectRepository;
import br.com.ampere.repository.StandardRepository;
import br.com.ampere.repository.UserRepository;
import br.com.ampere.service.DemandCalculationService;
import com.lowagie.text.Document;
import com.lowagie.text.PageSize;
import com.lowagie.text.Paragraph;
import com.lowagie.text.pdf.PdfWriter;
import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.Arrays;
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
  private final NormativeTableRepository normativeTableRepository;
  private final UserRepository userRepository;
  private final CalculationRepository calculationRepository;
  private final ProjectDocumentRepository documentRepository;
  private final DemandCalculationService demandCalculation;
  private final PasswordEncoder passwordEncoder;

  public static final String DEVELOPMENT_PASSWORD = "senha@123";

  public static final String DRAFT_PROTOCOL = "2026-1001";

  public static final String REVIEWER_EMAIL = "revisor@ampere.com";

  public DataSeeder(
      ProjectRepository projectRepository,
      FindingRepository findingRepository,
      ConsumerUnitGroupRepository groupRepository,
      StandardRepository standardRepository,
      NormativeTableRepository normativeTableRepository,
      UserRepository userRepository,
      CalculationRepository calculationRepository,
      ProjectDocumentRepository documentRepository,
      DemandCalculationService demandCalculation,
      PasswordEncoder passwordEncoder) {
    this.projectRepository = projectRepository;
    this.findingRepository = findingRepository;
    this.groupRepository = groupRepository;
    this.standardRepository = standardRepository;
    this.normativeTableRepository = normativeTableRepository;
    this.userRepository = userRepository;
    this.calculationRepository = calculationRepository;
    this.documentRepository = documentRepository;
    this.demandCalculation = demandCalculation;
    this.passwordEncoder = passwordEncoder;
  }

  @Override
  @Transactional
  public void run(String... args) {
    List<User> inserted = seedUsers();
    demoteLegacyReviewer();
    indexLegacyUsers();
    User owner = developmentUser(inserted, "user@ampere.com");
    assignOwnerToLegacyProjects(owner);
    startReviewCycleOfLegacySubmissions();
    dateLegacySubmissions();
    List<Standard> standards = seedStandards();
    seedDevelopmentData(standards, owner, developmentUser(inserted, REVIEWER_EMAIL));
    seedGroups();
    seedNormativeTables(standards);
    seedSubmittedCalculations();
    seedSubmittedDocuments();
  }

  /** Users created before the administrator's search existed get their search index. */
  private void indexLegacyUsers() {
    List<User> unindexed = userRepository.findAllBySearchIndex("");
    if (!unindexed.isEmpty()) {
      unindexed.forEach(User::indexForSearch);
      log.info("DataSeeder: search index filled for {} legacy users.", unindexed.size());
    }
  }

  /** Projects seeded before ownership existed go to the development designer. */
  private void assignOwnerToLegacyProjects(User owner) {
    List<Project> orphans = projectRepository.findAllByOwnerIsNull();
    if (!orphans.isEmpty()) {
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
  private List<User> seedUsers() {
    String hash = passwordEncoder.encode(DEVELOPMENT_PASSWORD);
    List<User> missing =
        List.of(
                User.designer("Usuário Teste", "user@ampere.com", hash, "123456", "PE", null, null),
                new User("Admin Teste", "admin@ampere.com", hash, UserRole.ADMIN),
                new User("Conferente Teste", NormativeTableSeed.VERIFIED_BY, hash, UserRole.ADMIN),
                new User("Revisor Teste", REVIEWER_EMAIL, hash, UserRole.REVIEWER))
            .stream()
            .filter(user -> userRepository.findByEmail(user.getEmail()).isEmpty())
            .toList();
    if (!missing.isEmpty()) {
      userRepository.saveAll(missing);
      log.info("DataSeeder: {} development users inserted.", missing.size());
    }

    return missing;
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

  private User developmentUser(List<User> inserted, String email) {
    return inserted.stream()
        .filter(user -> user.getEmail().equals(email))
        .findFirst()
        .or(() -> userRepository.findByEmail(email))
        .orElseThrow();
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

  private void seedDevelopmentData(List<Standard> standards, User owner, User analyst) {
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
            byName,
            owner);
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
            byName,
            owner);
    Project underReview =
        seed(
            "Edifício Residencial Aurora",
            "Rua da Aurora, 1240",
            "Recife",
            "2026-1003",
            ProjectStatus.UNDER_REVIEW,
            new ResidentialMultifamily(
                9, SupplyVoltage.V220_127, ConnectionType.THREE_PHASE, EntranceStandard.COLLECTIVE),
            byName,
            owner);
    Project underReviewDueToday =
        seed(
            "Edifício Comercial Boa Vista",
            "Rua do Futuro, 800",
            "Recife",
            "2026-1007",
            ProjectStatus.UNDER_REVIEW,
            new NonResidential(
                8, SupplyVoltage.V380_220, ConnectionType.THREE_PHASE, EntranceStandard.COLLECTIVE),
            byName,
            owner);
    Project underReviewInTime =
        seed(
            "Condomínio Jardim Recife",
            "Avenida Caxangá, 2500",
            "Recife",
            "2026-1008",
            ProjectStatus.UNDER_REVIEW,
            new ResidentialMultifamily(
                6, SupplyVoltage.V380_220, ConnectionType.THREE_PHASE, EntranceStandard.COLLECTIVE),
            byName,
            owner);
    Project rejected =
        seed(
            "Condomínio Vila Nova",
            "Avenida Barreto de Menezes, 88",
            "Jaboatão dos Guararapes",
            "2026-1004",
            ProjectStatus.REJECTED,
            new ResidentialMultifamily(
                6, SupplyVoltage.V220_127, ConnectionType.TWO_PHASE, EntranceStandard.INDIVIDUAL),
            byName,
            owner);
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
            byName,
            owner);
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
            byName,
            owner);

    OffsetDateTime now = OffsetDateTime.now(ZoneOffset.UTC);
    underReview.submit(now.minusDays(40));
    underReviewDueToday.submit(now.minusDays(30));
    underReviewInTime.submit(now.minusDays(45));
    underReviewInTime.reject(now.minusDays(12));
    underReviewInTime.submit(now.minusDays(10));
    rejected.submit(now.minusDays(12));
    rejected.reject(now, "Corrija a ART e a área do apartamento tipo B antes de reenviar.");
    approved.submit(now.minusDays(20));
    approved.approve(now);
    anotherRejected.submit(now.minusDays(60));
    anotherRejected.reject(now.minusDays(35), "Envie a planta de situação com escala.");
    List.of(underReviewInTime, rejected, anotherRejected, approved)
        .forEach(project -> project.assignReviewer(analyst));

    projectRepository.saveAll(
        List.of(
            draft,
            awaitingSubmission,
            underReview,
            underReviewDueToday,
            underReviewInTime,
            rejected,
            anotherRejected,
            approved));

    List<Finding> findings =
        List.of(
            finding(
                rejected,
                FindingSeverity.BLOCKING,
                FindingStage.DOCUMENTS,
                DocumentType.ART,
                "A ART não traz a assinatura do responsável técnico.",
                analyst),
            finding(
                rejected,
                FindingSeverity.BLOCKING,
                FindingStage.CONSUMER_UNITS,
                null,
                "A área útil do apartamento tipo B diverge da planta baixa.",
                analyst),
            finding(
                rejected,
                FindingSeverity.ADJUSTMENT,
                FindingStage.PROJECT_DATA,
                null,
                "Informe o número do lote no endereço.",
                analyst),
            finding(
                anotherRejected,
                FindingSeverity.BLOCKING,
                FindingStage.DOCUMENTS,
                DocumentType.SITE_PLAN,
                "A planta de situação está sem escala.",
                analyst));
    findings.forEach(Finding::publish);
    findingRepository.saveAll(findings);

    log.info("DataSeeder: eight projects and four findings inserted.");
  }

  /** Own guard, so a database seeded before the groups existed also gets them. */
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
                                      "Iluminação",
                                      1,
                                      new BigDecimal("10.00"),
                                      PowerUnit.KW,
                                      LampTechnology.COMPACT_FLUORESCENT_LED,
                                      null),
                                  new LoadItem(
                                      LoadCategory.LIGHTING_AND_OUTLETS,
                                      "Tomadas",
                                      1,
                                      new BigDecimal("15.80"),
                                      PowerUnit.KW,
                                      LampTechnology.GENERAL_OUTLETS,
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

  /**
   * Submitted projects get groups and a real engine run, so the review queue and the listing show
   * demand and pre-validation alerts. Runs after the tables: the engine reads the published ones.
   */
  private void seedSubmittedCalculations() {
    if (calculationRepository.count() > 0) {
      return;
    }

    Map<String, Function<Project, List<ConsumerUnitGroup>>> groupsByProtocol =
        Map.of(
            // Over 50 kVA, and 44.4 kW of charging asks for a network study: one alert.
            "2026-1003",
            project ->
                List.of(
                    apartments(project, "Apartamento tipo A", 24, "68", 2, "6.50"),
                    apartments(project, "Apartamento tipo B", 20, "92", 3, "8.20"),
                    commonArea(project),
                    charging(project, 6)),
            "2026-1007",
            project -> List.of(commercial(project, "Salas comerciais", 40), charging(project, 4)),
            "2026-1008",
            project -> List.of(apartments(project, "Apartamento padrão", 12, "54", 2, "5.20")),
            "2026-1002",
            project ->
                List.of(
                    apartments(project, "Apartamento tipo A", 16, "72", 2, "6.80"),
                    commercial(project, "Lojas do térreo", 6)),
            // Two-phase connection: the entrance table does not size it, so one alert.
            "2026-1004",
            project -> List.of(apartments(project, "Apartamento padrão", 8, "60", 2, "5.60")),
            "2026-1005",
            project -> List.of(commercial(project, "Salas comerciais", 24), commonArea(project)),
            "2026-1006",
            project -> List.of(commercial(project, "Lojas", 4)));

    groupsByProtocol.forEach(
        (protocol, groupsOf) ->
            projectRepository
                .findByProtocol(protocol)
                .ifPresent(
                    project -> {
                      List<ConsumerUnitGroup> groups =
                          groupRepository.saveAll(groupsOf.apply(project));
                      calculationRepository.save(demandCalculation.compute(project, groups));
                    }));

    log.info("DataSeeder: groups and calculations inserted in the submitted projects.");
  }

  /** Every project past the draft gets the three PDFs, so review and resubmission can open them. */
  private void seedSubmittedDocuments() {
    if (documentRepository.count() > 0) {
      return;
    }

    List<ProjectDocument> documents =
        projectRepository.findAll().stream()
            .filter(project -> !project.isDraft())
            .flatMap(
                project ->
                    Arrays.stream(DocumentType.values())
                        .map(
                            type ->
                                new ProjectDocument(
                                    project,
                                    type,
                                    type.name().toLowerCase() + ".pdf",
                                    samplePdf(type, project))))
            .toList();
    documentRepository.saveAll(documents);

    log.info("DataSeeder: {} documents attached to the submitted projects.", documents.size());
  }

  private static byte[] samplePdf(DocumentType type, Project project) {
    ByteArrayOutputStream output = new ByteArrayOutputStream();
    Document document = new Document(PageSize.A4);
    PdfWriter.getInstance(document, output);
    document.open();
    document.add(new Paragraph(type.label()));
    document.add(new Paragraph(project.getName() + ", protocolo " + project.getProtocol()));
    document.close();

    return output.toByteArray();
  }

  private static ConsumerUnitGroup commonArea(Project project) {
    return GroupKind.LOAD.create(
        project,
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
                    LoadCategory.LIGHTING_AND_OUTLETS,
                    "Iluminação",
                    1,
                    new BigDecimal("8.00"),
                    PowerUnit.KW,
                    LampTechnology.COMPACT_FLUORESCENT_LED,
                    null)),
            null,
            null,
            null,
            null));
  }

  private static ConsumerUnitGroup commercial(Project project, String name, int quantity) {
    return GroupKind.LOAD.create(
        project,
        new GroupSpec(
            name,
            quantity,
            null,
            null,
            null,
            null,
            LoadUsage.COMMERCIAL,
            List.of(
                new LoadItem(
                    LoadCategory.LIGHTING_AND_OUTLETS,
                    "Iluminação",
                    1,
                    new BigDecimal("1.20"),
                    PowerUnit.KW,
                    LampTechnology.COMPACT_FLUORESCENT_LED,
                    null),
                new LoadItem(
                    LoadCategory.LIGHTING_AND_OUTLETS,
                    "Tomadas",
                    1,
                    new BigDecimal("1.80"),
                    PowerUnit.KW,
                    LampTechnology.GENERAL_OUTLETS,
                    null)),
            null,
            null,
            null,
            null));
  }

  private static ConsumerUnitGroup charging(Project project, int points) {
    return GroupKind.EV_CHARGING.create(
        project,
        new GroupSpec(
            "Recarga de veículo elétrico",
            points,
            null,
            null,
            null,
            null,
            null,
            null,
            new BigDecimal("7.40"),
            false,
            false,
            EvStationType.COLLECTIVE));
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

  private static Finding finding(
      Project project,
      FindingSeverity severity,
      FindingStage stage,
      DocumentType documentType,
      String description,
      User author) {
    return new Finding(
        project,
        severity,
        stage,
        null,
        null,
        documentType,
        description,
        null,
        author,
        project.getReviewCycle());
  }

  private static Project seed(
      String name,
      String address,
      String municipality,
      String protocol,
      ProjectStatus status,
      BuildingType buildingType,
      Map<String, Standard> standardsByName,
      User owner) {
    List<Standard> standards =
        buildingType.applicableStandards().stream()
            .map(StandardName::code)
            .map(standardsByName::get)
            .toList();

    return new Project(
        name, address, municipality, protocol, status, buildingType, standards, owner);
  }
}
