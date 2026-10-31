package br.com.ampere.config;

import br.com.ampere.domain.Project;
import br.com.ampere.domain.ProjectEvent;
import br.com.ampere.domain.Standard;
import br.com.ampere.domain.User;
import br.com.ampere.repository.CalculationRepository;
import br.com.ampere.repository.ConsumerUnitGroupRepository;
import br.com.ampere.repository.FindingRepository;
import br.com.ampere.repository.NormativeTableRepository;
import br.com.ampere.repository.ProjectDocumentRepository;
import br.com.ampere.repository.ProjectEventRepository;
import br.com.ampere.repository.ProjectRepository;
import br.com.ampere.repository.StandardRepository;
import br.com.ampere.repository.UserRepository;
import br.com.ampere.service.DemandCalculationService;
import br.com.ampere.service.ProjectEventService;
import java.time.Duration;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.function.Function;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.annotation.Profile;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;

/**
 * Demonstration projects for every case of the system, filed by protocol after the DataSeeder. A
 * scenario is created only when its protocol is absent, so a database that already has some gets
 * the rest and none twice. A project of its own seeded before the protocol history gets the events
 * of its story. With {@code ampere.seed.reset-scenarios=true} the seed's own projects are deleted
 * first and recreated with fresh dates; nothing else is ever deleted.
 */
@Component
@Profile("(!prod & !test) | demo")
public class DemoScenarioSeeder {

  private static final Logger log = LoggerFactory.getLogger(DemoScenarioSeeder.class);

  private final ProjectRepository projectRepository;
  private final ConsumerUnitGroupRepository groupRepository;
  private final FindingRepository findingRepository;
  private final CalculationRepository calculationRepository;
  private final ProjectDocumentRepository documentRepository;
  private final ProjectEventRepository eventRepository;
  private final StandardRepository standardRepository;
  private final NormativeTableRepository normativeTableRepository;
  private final UserRepository userRepository;
  private final DemandCalculationService demandCalculation;
  private final ProjectEventService eventService;
  private final SeedTimestamps timestamps;
  private final PlatformTransactionManager transactionManager;
  private final boolean resetScenarios;

  public DemoScenarioSeeder(
      ProjectRepository projectRepository,
      ConsumerUnitGroupRepository groupRepository,
      FindingRepository findingRepository,
      CalculationRepository calculationRepository,
      ProjectDocumentRepository documentRepository,
      ProjectEventRepository eventRepository,
      StandardRepository standardRepository,
      NormativeTableRepository normativeTableRepository,
      UserRepository userRepository,
      DemandCalculationService demandCalculation,
      ProjectEventService eventService,
      SeedTimestamps timestamps,
      PlatformTransactionManager transactionManager,
      @Value("${ampere.seed.reset-scenarios:false}") boolean resetScenarios) {
    this.projectRepository = projectRepository;
    this.groupRepository = groupRepository;
    this.findingRepository = findingRepository;
    this.calculationRepository = calculationRepository;
    this.documentRepository = documentRepository;
    this.eventRepository = eventRepository;
    this.standardRepository = standardRepository;
    this.normativeTableRepository = normativeTableRepository;
    this.userRepository = userRepository;
    this.demandCalculation = demandCalculation;
    this.eventService = eventService;
    this.timestamps = timestamps;
    this.transactionManager = transactionManager;
    this.resetScenarios = resetScenarios;
  }

  /** Development data only: a failure is logged and the application keeps running. */
  @EventListener(ApplicationReadyEvent.class)
  public void onReady() {
    try {
      seed();
    } catch (RuntimeException failure) {
      log.warn("DemoScenarioSeeder: scenarios not seeded: {}", failure.getMessage());
    }
  }

  /** Runs every scenario in a transaction of its own; returns how many projects were created. */
  public int seed() {
    Optional<DemoUsers> users = demoUsers();
    if (users.isEmpty() || normativeTableRepository.count() == 0) {
      return 0;
    }

    ScenarioKit kit =
        new ScenarioKit(
            projectRepository,
            groupRepository,
            findingRepository,
            calculationRepository,
            documentRepository,
            demandCalculation,
            eventService,
            timestamps,
            standardRepository.findAll().stream()
                .collect(Collectors.toMap(Standard::getName, Function.identity())),
            OffsetDateTime.now(ZoneOffset.UTC));
    TransactionTemplate transaction = new TransactionTemplate(transactionManager);
    int created = 0;
    int histories = 0;
    for (Scenario scenario : DemoScenarios.all(users.get())) {
      try {
        created += transaction.execute(status -> seed(kit, scenario));
        histories += completeHistory(kit, scenario, transaction);
      } catch (RuntimeException failure) {
        log.warn(
            "DemoScenarioSeeder: scenario {} not seeded: {}",
            scenario.protocol(),
            failure.getMessage());
      }
    }
    int revisions =
        transaction.execute(
            status -> new NormativeTableRevisions(normativeTableRepository, timestamps).seed());
    if (created > 0 || histories > 0 || revisions > 0) {
      log.info(
          "DemoScenarioSeeder: {} scenario projects, {} histories and {} table revisions inserted.",
          created,
          histories,
          revisions);
    }

    return created;
  }

  private int seed(ScenarioKit kit, Scenario scenario) {
    Optional<Project> existing = projectRepository.findByProtocol(scenario.protocol());
    if (existing.isPresent()) {
      Project project = existing.get();
      if (!resetScenarios || !isSeeded(project, scenario)) {
        completeAddress(project, scenario);
        if (isSeeded(project, scenario)) {
          groupRepository.answerTheCommonAreaElevator(project.getId());
        }
        return 0;
      }
      delete(project);
    }

    ScenarioCase story = kit.open(scenario);
    scenario.story().accept(story);
    story.finish();

    return 1;
  }

  /**
   * Seeded before the history: the story is told again under another protocol in a transaction that
   * is rolled back, and only its events are kept, moved to the dates of the project.
   */
  private int completeHistory(ScenarioKit kit, Scenario scenario, TransactionTemplate transaction) {
    Long projectId =
        transaction.execute(
            status ->
                projectRepository
                    .findByProtocol(scenario.protocol())
                    .filter(project -> isSeeded(project, scenario))
                    .filter(project -> !eventRepository.existsByProjectId(project.getId()))
                    .map(Project::getId)
                    .orElse(null));
    if (projectId == null) {
      return 0;
    }

    List<ProjectEvent> told =
        transaction.execute(
            status -> {
              status.setRollbackOnly();
              ScenarioCase story = kit.open(scenario, scenario.protocol() + "-historico");
              scenario.story().accept(story);

              return eventRepository.findAllByProjectIdOrderByOccurredAtAscIdAsc(
                  story.project().getId());
            });
    transaction.executeWithoutResult(
        status -> {
          Project project = projectRepository.findById(projectId).orElseThrow();
          Duration shift =
              Duration.between(told.getFirst().getOccurredAt(), project.getCreatedAt());
          eventRepository.saveAll(
              told.stream()
                  .map(
                      event ->
                          new ProjectEvent(
                              project,
                              event.getType(),
                              event.getVersion(),
                              event.getAuthor() == null
                                  ? null
                                  : userRepository.getReferenceById(event.getAuthor().getId()),
                              event.getAuthorRole(),
                              event.getDescription(),
                              event.getDetail(),
                              event.getOccurredAt().plus(shift)))
                  .toList());
        });

    return 1;
  }

  /** The protocol is not enough: somebody else may have filed a project under it. */
  private static boolean isSeeded(Project project, Scenario scenario) {
    return project.getName().equals(scenario.name())
        && project.getOwner() != null
        && project.getOwner().getEmail().equals(scenario.owner().getEmail());
  }

  /** Seeded before the address came from the CEP: only the seed's own projects are completed. */
  private static void completeAddress(Project project, Scenario scenario) {
    if (project.getPostalCode() == null && isSeeded(project, scenario)) {
      project.locate(scenario.postalCode(), scenario.state());
    }
  }

  private void delete(Project project) {
    Long id = project.getId();
    calculationRepository.deleteAllByProjectId(id);
    findingRepository.deleteAllByProjectId(id);
    groupRepository.deleteAllByProjectId(id);
    documentRepository.deleteAllByProjectId(id);
    projectRepository.delete(project);
    projectRepository.flush();
  }

  private Optional<DemoUsers> demoUsers() {
    Optional<User> user = userRepository.findByEmail(DataSeeder.USER_EMAIL);
    Optional<User> carla = userRepository.findByEmail(DataSeeder.SECOND_DESIGNER_EMAIL);
    Optional<User> joao = userRepository.findByEmail(DataSeeder.PARAIBA_DESIGNER_EMAIL);
    Optional<User> admin = userRepository.findByEmail(DataSeeder.ADMIN_EMAIL);
    Optional<User> bruno = userRepository.findByEmail(DataSeeder.INACTIVE_DESIGNER_EMAIL);
    Optional<User> revisor = userRepository.findByEmail(DataSeeder.REVIEWER_EMAIL);
    Optional<User> ana = userRepository.findByEmail(DataSeeder.SECOND_ANALYST_EMAIL);
    if (Map.of(
            "user", user, "carla", carla, "joao", joao, "admin", admin, "bruno", bruno, "revisor",
            revisor, "ana", ana)
        .values()
        .stream()
        .anyMatch(Optional::isEmpty)) {
      return Optional.empty();
    }

    return Optional.of(
        new DemoUsers(
            user.get(),
            carla.get(),
            joao.get(),
            admin.get(),
            bruno.get(),
            revisor.get(),
            ana.get()));
  }
}
