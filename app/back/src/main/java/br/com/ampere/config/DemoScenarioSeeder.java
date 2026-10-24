package br.com.ampere.config;

import br.com.ampere.domain.BrazilianState;
import br.com.ampere.domain.BuildingType;
import br.com.ampere.domain.ConnectionType;
import br.com.ampere.domain.ConsumerUnitGroup;
import br.com.ampere.domain.DocumentType;
import br.com.ampere.domain.EntranceStandard;
import br.com.ampere.domain.EvStationType;
import br.com.ampere.domain.Finding;
import br.com.ampere.domain.FindingAnswer;
import br.com.ampere.domain.FindingResolution;
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
import br.com.ampere.domain.PowerUnit;
import br.com.ampere.domain.Project;
import br.com.ampere.domain.ProjectDocument;
import br.com.ampere.domain.ProjectStatus;
import br.com.ampere.domain.ResidentialMultifamily;
import br.com.ampere.domain.Standard;
import br.com.ampere.domain.StandardName;
import br.com.ampere.domain.SupplyVoltage;
import br.com.ampere.domain.User;
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
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.function.Function;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.annotation.Profile;
import org.springframework.context.event.EventListener;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;

/** Development projects for every step of the review, added by protocol after the DataSeeder. */
@Component
@Profile("!prod & !test")
public class DemoScenarioSeeder {

  private static final Logger log = LoggerFactory.getLogger(DemoScenarioSeeder.class);

  static final String SECOND_DESIGNER_EMAIL = "projetista@ampere.com";

  private static final Map<String, String> POSTAL_CODES =
      Map.of(
          "Recife", "50030230",
          "Olinda", "53020140",
          "Jaboatão dos Guararapes", "54410010",
          "Cabo de Santo Agostinho", "54505010",
          "Petrolina", "56302000",
          "Pedras de Fogo", "58328000");

  private static final String LONG_ANSWER =
      "Refizemos o levantamento da área útil a partir da planta baixa revisada (prancha 03, revisão"
          + " C). O apartamento tipo B tinha a varanda técnica somada por engano; sem ela, a área"
          + " cai de 92 m² para 84 m², o que muda a faixa do Quadro 35. O grupo foi corrigido, a"
          + " demanda recalculada e a nova planta segue anexada, com as cotas da varanda"
          + " destacadas para conferência.";

  private final ProjectRepository projectRepository;
  private final ConsumerUnitGroupRepository groupRepository;
  private final FindingRepository findingRepository;
  private final CalculationRepository calculationRepository;
  private final ProjectDocumentRepository documentRepository;
  private final StandardRepository standardRepository;
  private final NormativeTableRepository normativeTableRepository;
  private final UserRepository userRepository;
  private final DemandCalculationService demandCalculation;
  private final PasswordEncoder passwordEncoder;
  private final PlatformTransactionManager transactionManager;

  private Map<String, Standard> standards;
  private OffsetDateTime now;

  public DemoScenarioSeeder(
      ProjectRepository projectRepository,
      ConsumerUnitGroupRepository groupRepository,
      FindingRepository findingRepository,
      CalculationRepository calculationRepository,
      ProjectDocumentRepository documentRepository,
      StandardRepository standardRepository,
      NormativeTableRepository normativeTableRepository,
      UserRepository userRepository,
      DemandCalculationService demandCalculation,
      PasswordEncoder passwordEncoder,
      PlatformTransactionManager transactionManager) {
    this.projectRepository = projectRepository;
    this.groupRepository = groupRepository;
    this.findingRepository = findingRepository;
    this.calculationRepository = calculationRepository;
    this.documentRepository = documentRepository;
    this.standardRepository = standardRepository;
    this.normativeTableRepository = normativeTableRepository;
    this.userRepository = userRepository;
    this.demandCalculation = demandCalculation;
    this.passwordEncoder = passwordEncoder;
    this.transactionManager = transactionManager;
  }

  /** Development data only: a failure is logged and the application keeps running. */
  @EventListener(ApplicationReadyEvent.class)
  public void onReady() {
    try {
      new TransactionTemplate(transactionManager).executeWithoutResult(status -> seed());
    } catch (RuntimeException failure) {
      log.warn("DemoScenarioSeeder: scenarios not seeded: {}", failure.getMessage());
    }
  }

  private void seed() {
    Optional<User> designer = userRepository.findByEmail("user@ampere.com");
    Optional<User> analyst = userRepository.findByEmail(DataSeeder.REVIEWER_EMAIL);
    Optional<User> admin = userRepository.findByEmail("admin@ampere.com");
    if (designer.isEmpty() || analyst.isEmpty() || admin.isEmpty()) {
      return;
    }

    if (normativeTableRepository.count() == 0) {
      return;
    }
    repairDevelopmentData(designer.get());

    standards =
        standardRepository.findAll().stream()
            .collect(Collectors.toMap(Standard::getName, Function.identity()));
    now = OffsetDateTime.now(ZoneOffset.UTC);
    User other = secondDesigner();

    int before = (int) projectRepository.count();
    seedDrafts(designer.get());
    seedUnderReview(designer.get(), analyst.get(), admin.get(), other);
    seedRejected(designer.get(), analyst.get(), other);
    seedReanalysis(designer.get(), analyst.get());
    seedApproved(designer.get(), analyst.get());
    int added = (int) projectRepository.count() - before;
    if (added > 0) {
      log.info("DemoScenarioSeeder: {} scenario projects inserted.", added);
    }
  }

  /** Databases seeded before the address and the CREA existed get them now. */
  private void repairDevelopmentData(User designer) {
    if (designer.getCrea() == null) {
      designer.updateProfile(
          designer.getName(), "123456", "PE", designer.getCompany(), designer.getPhone());
    }
    projectRepository.findAll().stream()
        .filter(project -> project.getPostalCode() == null)
        .forEach(
            project ->
                Optional.ofNullable(POSTAL_CODES.get(project.getMunicipality()))
                    .ifPresent(code -> project.locate(code, project.getState())));
    // Submitted before the groups existed: without them the queue shows no demand.
    projectRepository.findAll().stream()
        .filter(project -> !project.isDraft())
        .filter(project -> groupRepository.findAllByProjectIdOrderById(project.getId()).isEmpty())
        .forEach(
            project -> {
              calculate(
                  project,
                  groups(project, apartments(project, "Apartamento padrão", 12, "60", 2, "5.60")));
              if (documentRepository.findAllByProjectIdOrderByType(project.getId()).isEmpty()) {
                attachDocuments(project);
              }
            });
    groupRepository.findAll().stream()
        .filter(group -> group.kind() == GroupKind.EV_CHARGING)
        .filter(group -> !group.getProject().isEditable())
        .filter(group -> group.spec().loadManagement() == null)
        .forEach(group -> group.update(withLoadManagement(group.spec())));
  }

  private User secondDesigner() {
    return userRepository
        .findByEmail(SECOND_DESIGNER_EMAIL)
        .orElseGet(
            () ->
                userRepository.save(
                    User.designer(
                        "Carla Projetista",
                        SECOND_DESIGNER_EMAIL,
                        passwordEncoder.encode(DataSeeder.DEVELOPMENT_PASSWORD),
                        "654321",
                        "PE",
                        "Carla Engenharia Elétrica",
                        "81999990000")));
  }

  private void seedDrafts(User designer) {
    absent("2026-2001")
        .ifPresent(
            protocol ->
                project(
                    protocol,
                    "Residencial Mar Azul",
                    "Avenida Boa Viagem, 3400",
                    "Recife",
                    "51020010",
                    residential(10, SupplyVoltage.V380_220),
                    designer));

    absent("2026-2002")
        .ifPresent(
            protocol -> {
              Project project =
                  project(
                      protocol,
                      "Edifício Capibaribe",
                      "Rua da Aurora, 520",
                      "Recife",
                      "50050000",
                      residential(14, SupplyVoltage.V380_220),
                      designer);
              // The penthouse lacks its useful area: the step shows a pending group.
              groups(
                  project,
                  apartments(project, "Apartamento tipo", 16, "70", 2, "6.20"),
                  apartments(project, "Cobertura", 2, null, 4, "12.00"));
            });

    absent("2026-2003")
        .ifPresent(
            protocol -> {
              Project project =
                  project(
                      protocol,
                      "Condomínio Parque das Águas",
                      "Avenida Barreto de Menezes, 1200",
                      "Jaboatão dos Guararapes",
                      "54410010",
                      residential(12, SupplyVoltage.V380_220),
                      designer);
              calculate(
                  project,
                  groups(
                      project,
                      apartments(project, "Apartamento tipo", 30, "65", 2, "6.00"),
                      commonArea(project)));
              attachDocuments(project);
            });

    absent("2026-2016")
        .ifPresent(
            protocol -> {
              Project project =
                  project(
                      protocol,
                      "Residencial Petrolina Sol",
                      "Avenida Cardoso de Sá, 900",
                      "Petrolina",
                      "56302000",
                      residential(5, SupplyVoltage.V220_127),
                      designer);
              calculate(
                  project,
                  groups(project, apartments(project, "Apartamento padrão", 10, "58", 2, "5.40")));
            });
  }

  private void seedUnderReview(User designer, User analyst, User admin, User other) {
    absent("2026-2004")
        .ifPresent(
            protocol -> {
              Project project =
                  submitted(
                      protocol,
                      "Residencial Boa Viagem Prime",
                      "Rua Ernesto de Paula Santos, 1000",
                      "Recife",
                      "51021000",
                      residential(20, SupplyVoltage.V380_220),
                      designer,
                      project1 ->
                          List.of(
                              apartments(project1, "Apartamento tipo", 40, "85", 3, "7.80"),
                              commonArea(project1),
                              charging(project1, 8)));
              project.submit(now.minusDays(3));
            });

    absent("2026-2005")
        .ifPresent(
            protocol -> {
              Project project =
                  submitted(
                      protocol,
                      "Empresarial Pina Office",
                      "Avenida Herculano Bandeira, 513",
                      "Recife",
                      "51011000",
                      new NonResidential(
                          12,
                          SupplyVoltage.V380_220,
                          ConnectionType.THREE_PHASE,
                          EntranceStandard.COLLECTIVE),
                      designer,
                      project1 -> List.of(commercial(project1, "Salas comerciais", 48)));
              project.submit(now.minusDays(30));
              project.assignReviewer(analyst);
              findingRepository.saveAll(
                  List.of(
                      finding(
                          project,
                          FindingSeverity.BLOCKING,
                          FindingStage.CALCULATION,
                          null,
                          "Dc",
                          null,
                          "A carga de iluminação das salas está abaixo do mínimo por área.",
                          "DIS-NOR-030, item 6.23.1",
                          analyst),
                      finding(
                          project,
                          FindingSeverity.ADJUSTMENT,
                          FindingStage.DOCUMENTS,
                          null,
                          null,
                          DocumentType.SITE_PLAN,
                          "Indique o norte na planta de situação.",
                          null,
                          analyst)));
            });

    absent("2026-2006")
        .ifPresent(
            protocol -> {
              Project project =
                  submitted(
                      protocol,
                      "Mix Casa Forte",
                      "Praça de Casa Forte, 120",
                      "Recife",
                      "52061000",
                      new Mixed(
                          10,
                          SupplyVoltage.V380_220,
                          ConnectionType.THREE_PHASE,
                          EntranceStandard.COLLECTIVE),
                      designer,
                      project1 ->
                          List.of(
                              apartments(project1, "Apartamento tipo", 18, "75", 2, "6.80"),
                              commercial(project1, "Lojas do térreo", 4)));
              project.submit(now.minusDays(36));
              project.assignReviewer(analyst);
            });

    absent("2026-2013")
        .ifPresent(
            protocol ->
                submitted(
                        protocol,
                        "Residencial Olinda Alta",
                        "Rua do Amparo, 45",
                        "Olinda",
                        "53020140",
                        residential(6, SupplyVoltage.V220_127),
                        other,
                        project1 ->
                            List.of(
                                apartments(project1, "Apartamento padrão", 12, "62", 2, "5.60")))
                    .submit(now.minusDays(10)));

    absent("2026-2015")
        .ifPresent(
            protocol -> {
              Project project =
                  submitted(
                      protocol,
                      "Sede Regional Administrativa",
                      "Avenida Agamenon Magalhães, 2400",
                      "Recife",
                      "52010000",
                      new NonResidential(
                          6,
                          SupplyVoltage.V380_220,
                          ConnectionType.THREE_PHASE,
                          EntranceStandard.COLLECTIVE),
                      admin,
                      project1 -> List.of(commercial(project1, "Escritórios", 20)));
              project.submit(now.minusDays(7));
              project.assignReviewer(analyst);
            });
  }

  private void seedRejected(User designer, User analyst, User other) {
    absent("2026-2007")
        .ifPresent(
            protocol -> {
              List<ConsumerUnitGroup> groups = new ArrayList<>();
              Project project =
                  submitted(
                      protocol,
                      "Residencial Torre das Graças",
                      "Rua das Graças, 310",
                      "Recife",
                      "52011000",
                      residential(16, SupplyVoltage.V380_220),
                      designer,
                      project1 -> {
                        groups.add(apartments(project1, "Apartamento tipo B", 28, "92", 3, "8.20"));
                        return List.copyOf(groups);
                      });
              project.submit(now.minusDays(15));
              project.assignReviewer(analyst);
              publish(
                  finding(
                      project,
                      FindingSeverity.BLOCKING,
                      FindingStage.CONSUMER_UNITS,
                      firstGroup(project),
                      null,
                      null,
                      "A área útil do apartamento tipo B diverge da planta baixa.",
                      "DIS-NOR-053, Quadro 35",
                      analyst),
                  finding(
                      project,
                      FindingSeverity.ADJUSTMENT,
                      FindingStage.PROJECT_DATA,
                      null,
                      null,
                      null,
                      "Informe o número do lote no endereço.",
                      null,
                      analyst));
              project.reject(
                  now.minusDays(8), "Corrija a área útil do apartamento tipo B e reenvie.");
            });

    absent("2026-2008")
        .ifPresent(
            protocol -> {
              Project project =
                  submitted(
                      protocol,
                      "Edifício Madalena",
                      "Rua Real da Torre, 700",
                      "Recife",
                      "50610000",
                      residential(8, SupplyVoltage.V380_220),
                      designer,
                      project1 ->
                          List.of(apartments(project1, "Apartamento padrão", 16, "60", 2, "5.80")));
              project.submit(now.minusDays(20));
              project.assignReviewer(analyst);
              List<Finding> findings =
                  publish(
                      finding(
                          project,
                          FindingSeverity.BLOCKING,
                          FindingStage.DOCUMENTS,
                          null,
                          null,
                          DocumentType.ART,
                          "A ART não traz a assinatura do responsável técnico.",
                          null,
                          analyst),
                      finding(
                          project,
                          FindingSeverity.ADJUSTMENT,
                          FindingStage.DOCUMENTS,
                          null,
                          null,
                          DocumentType.SINGLE_LINE_DIAGRAM,
                          "Inclua a legenda dos condutores no diagrama unifilar.",
                          null,
                          analyst));
              project.reject(now.minusDays(12), "Assine a ART e complete o diagrama unifilar.");
              // Halfway through the correction: one answer given, the blocking one still open.
              findings
                  .get(1)
                  .respond(
                      FindingAnswer.FIXED,
                      "Legenda incluída na revisão B do diagrama.",
                      now.minusDays(2));
            });

    absent("2026-2014")
        .ifPresent(
            protocol -> {
              Project project =
                  submitted(
                      protocol,
                      "Condomínio Pedras de Fogo",
                      "Rua Coronel Antônio Pessoa, 80",
                      "Pedras de Fogo",
                      "58328000",
                      residential(4, SupplyVoltage.V220_127),
                      other,
                      project1 ->
                          List.of(apartments(project1, "Apartamento padrão", 8, "55", 2, "5.20")));
              project.submit(now.minusDays(18));
              project.assignReviewer(analyst);
              publish(
                  finding(
                      project,
                      FindingSeverity.BLOCKING,
                      FindingStage.DOCUMENTS,
                      null,
                      null,
                      DocumentType.SITE_PLAN,
                      "A planta de situação está sem escala.",
                      null,
                      analyst));
              project.reject(now.minusDays(11), "Envie a planta de situação com escala.");
            });
  }

  private void seedReanalysis(User designer, User analyst) {
    absent("2026-2009")
        .ifPresent(
            protocol -> {
              Project project =
                  submitted(
                      protocol,
                      "Condomínio Graças Garden",
                      "Rua Amélia, 150",
                      "Recife",
                      "52050000",
                      residential(18, SupplyVoltage.V380_220),
                      designer,
                      project1 ->
                          List.of(
                              apartments(project1, "Apartamento tipo B", 32, "84", 3, "7.60"),
                              commonArea(project1)));
              project.submit(now.minusDays(25));
              project.assignReviewer(analyst);
              List<Finding> findings =
                  publish(
                      finding(
                          project,
                          FindingSeverity.BLOCKING,
                          FindingStage.CONSUMER_UNITS,
                          firstGroup(project),
                          null,
                          null,
                          "A área útil do apartamento tipo B diverge da planta baixa.",
                          "DIS-NOR-053, Quadro 35",
                          analyst),
                      finding(
                          project,
                          FindingSeverity.ADJUSTMENT,
                          FindingStage.DOCUMENTS,
                          null,
                          null,
                          DocumentType.ART,
                          "A ART está sem o número de registro no CREA.",
                          null,
                          analyst));
              project.reject(now.minusDays(18), "Revise a área do tipo B e a ART.");
              findings.get(0).respond(FindingAnswer.FIXED, LONG_ANSWER, now.minusDays(8));
              findings
                  .get(1)
                  .respond(
                      FindingAnswer.CONTESTED,
                      "O número do registro está no campo 4 da ART, na segunda página.",
                      now.minusDays(8));
              project.recordChangeSummary(
                  "Área útil do apartamento tipo B corrigida para 84 m² e nova planta anexada.");
              project.submit(now.minusDays(6));
            });

    absent("2026-2010")
        .ifPresent(
            protocol -> {
              Project project =
                  submitted(
                      protocol,
                      "Residencial Espinheiro",
                      "Rua do Espinheiro, 640",
                      "Recife",
                      "52020000",
                      residential(12, SupplyVoltage.V380_220),
                      designer,
                      project1 ->
                          List.of(apartments(project1, "Apartamento padrão", 24, "68", 2, "6.40")));
              project.submit(now.minusDays(22));
              project.assignReviewer(analyst);
              List<Finding> findings =
                  publish(
                      finding(
                          project,
                          FindingSeverity.BLOCKING,
                          FindingStage.DOCUMENTS,
                          null,
                          null,
                          DocumentType.SINGLE_LINE_DIAGRAM,
                          "O diagrama unifilar não mostra a proteção geral.",
                          null,
                          analyst),
                      finding(
                          project,
                          FindingSeverity.ADJUSTMENT,
                          FindingStage.PROJECT_DATA,
                          null,
                          null,
                          null,
                          "O número de pavimentos difere do memorial.",
                          null,
                          analyst));
              project.reject(now.minusDays(16), "Complete o diagrama e revise os pavimentos.");
              findings
                  .get(0)
                  .respond(
                      FindingAnswer.FIXED,
                      "Proteção geral incluída no diagrama.",
                      now.minusDays(9));
              findings
                  .get(1)
                  .respond(
                      FindingAnswer.FIXED, "Pavimentos ajustados no memorial.", now.minusDays(9));
              project.recordChangeSummary("Diagrama unifilar completo e pavimentos revisados.");
              project.submit(now.minusDays(7));
              // The analyst accepted one answer and reopened the other: rejection is the way out.
              findings.get(0).resolve(FindingResolution.ACCEPT);
              findings.get(1).resolve(FindingResolution.REOPEN);
            });
  }

  private void seedApproved(User designer, User analyst) {
    absent("2026-2011")
        .ifPresent(
            protocol -> {
              Project project =
                  submitted(
                      protocol,
                      "Edifício Derby Center",
                      "Praça do Derby, 50",
                      "Recife",
                      "52010000",
                      new NonResidential(
                          8,
                          SupplyVoltage.V380_220,
                          ConnectionType.THREE_PHASE,
                          EntranceStandard.COLLECTIVE),
                      designer,
                      project1 -> List.of(commercial(project1, "Salas comerciais", 30)));
              project.submit(now.minusDays(20));
              project.assignReviewer(analyst);
              project.approve(now.minusDays(12), "Projeto em conformidade com a DIS-NOR-030.");
            });

    absent("2026-2012")
        .ifPresent(
            protocol -> {
              Project project =
                  submitted(
                      protocol,
                      "Residencial Jaqueira",
                      "Rua do Futuro, 1100",
                      "Recife",
                      "52050020",
                      residential(15, SupplyVoltage.V380_220),
                      designer,
                      project1 ->
                          List.of(
                              apartments(project1, "Apartamento tipo", 30, "78", 3, "7.20"),
                              commonArea(project1),
                              charging(project1, 4)));
              project.submit(now.minusDays(40));
              project.assignReviewer(analyst);
              List<Finding> findings =
                  publish(
                      finding(
                          project,
                          FindingSeverity.BLOCKING,
                          FindingStage.CALCULATION,
                          null,
                          "Dve",
                          null,
                          "Comprove o sistema de gerenciamento da recarga.",
                          "DIS-NOR-030, item 6.26.4.2",
                          analyst));
              project.reject(now.minusDays(33), "Comprove o gerenciamento da recarga.");
              findings
                  .getFirst()
                  .respond(
                      FindingAnswer.FIXED,
                      "Memorial do fabricante do gerenciador anexado à ART.",
                      now.minusDays(28));
              project.recordChangeSummary("Comprovação do gerenciamento de recarga anexada.");
              project.submit(now.minusDays(26));
              findings.getFirst().resolve(FindingResolution.ACCEPT);
              project.approve(now.minusDays(20), "Correção aceita. Projeto aprovado.");
            });
  }

  private Optional<String> absent(String protocol) {
    return projectRepository.findByProtocol(protocol).isPresent()
        ? Optional.empty()
        : Optional.of(protocol);
  }

  private Project project(
      String protocol,
      String name,
      String address,
      String municipality,
      String postalCode,
      BuildingType building,
      User owner) {
    List<Standard> applicable =
        building.applicableStandards().stream()
            .map(StandardName::code)
            .map(standards::get)
            .toList();
    Project project =
        new Project(
            name,
            address,
            municipality,
            protocol,
            ProjectStatus.DRAFT,
            building,
            applicable,
            owner);
    project.locate(
        postalCode, municipality.equals("Pedras de Fogo") ? BrazilianState.PB : BrazilianState.PE);

    return projectRepository.save(project);
  }

  /** Groups, calculation and documents in place; the caller submits it. */
  private Project submitted(
      String protocol,
      String name,
      String address,
      String municipality,
      String postalCode,
      BuildingType building,
      User owner,
      Function<Project, List<ConsumerUnitGroup>> groupsOf) {
    Project project = project(protocol, name, address, municipality, postalCode, building, owner);
    calculate(project, groupRepository.saveAll(groupsOf.apply(project)));
    attachDocuments(project);

    return project;
  }

  private List<ConsumerUnitGroup> groups(Project project, ConsumerUnitGroup... groups) {
    return groupRepository.saveAll(Arrays.asList(groups));
  }

  private ConsumerUnitGroup firstGroup(Project project) {
    return groupRepository.findAllByProjectIdOrderById(project.getId()).getFirst();
  }

  private void calculate(Project project, List<ConsumerUnitGroup> groups) {
    calculationRepository.save(demandCalculation.compute(project, groups));
  }

  private void attachDocuments(Project project) {
    documentRepository.saveAll(
        Arrays.stream(DocumentType.values())
            .map(
                type ->
                    new ProjectDocument(
                        project,
                        type,
                        type.name().toLowerCase() + ".pdf",
                        samplePdf(type, project)))
            .toList());
  }

  private List<Finding> publish(Finding... findings) {
    List<Finding> published = findingRepository.saveAll(Arrays.asList(findings));
    published.forEach(Finding::publish);

    return published;
  }

  private static Finding finding(
      Project project,
      FindingSeverity severity,
      FindingStage stage,
      ConsumerUnitGroup group,
      String calculationStepCode,
      DocumentType documentType,
      String description,
      String standardItem,
      User author) {
    return new Finding(
        project,
        severity,
        stage,
        group,
        calculationStepCode,
        documentType,
        description,
        standardItem,
        author,
        project.getReviewCycle());
  }

  private static ResidentialMultifamily residential(int floors, SupplyVoltage voltage) {
    return new ResidentialMultifamily(
        floors, voltage, ConnectionType.THREE_PHASE, EntranceStandard.COLLECTIVE);
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
            usefulArea == null ? null : new BigDecimal(usefulArea),
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

  private static GroupSpec withLoadManagement(GroupSpec spec) {
    return new GroupSpec(
        spec.name(),
        spec.quantity(),
        spec.usefulArea(),
        spec.bedrooms(),
        spec.unitLoadKw(),
        spec.compactUnit(),
        spec.usage(),
        spec.items(),
        spec.powerPerPointKw(),
        spec.incorporatedInVehicle(),
        false,
        spec.stationType());
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
}
