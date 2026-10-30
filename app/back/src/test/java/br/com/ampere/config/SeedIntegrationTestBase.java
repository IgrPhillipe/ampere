package br.com.ampere.config;

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
import jakarta.persistence.EntityManager;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.env.Environment;
import org.springframework.mock.env.MockEnvironment;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;

/** The seeds are not beans under the test profile: tests build them here, as the profile would. */
abstract class SeedIntegrationTestBase {

  @Autowired protected ProjectRepository projectRepository;
  @Autowired protected ConsumerUnitGroupRepository groupRepository;
  @Autowired protected FindingRepository findingRepository;
  @Autowired protected CalculationRepository calculationRepository;
  @Autowired protected ProjectDocumentRepository documentRepository;
  @Autowired protected ProjectEventRepository eventRepository;
  @Autowired protected StandardRepository standardRepository;
  @Autowired protected NormativeTableRepository normativeTableRepository;
  @Autowired protected UserRepository userRepository;
  @Autowired protected DemandCalculationService demandCalculation;
  @Autowired protected ProjectEventService projectEventService;
  @Autowired protected PasswordEncoder passwordEncoder;
  @Autowired protected PlatformTransactionManager transactionManager;
  @Autowired protected EntityManager entityManager;
  @Autowired protected Environment environment;

  protected TransactionTemplate transaction() {
    return new TransactionTemplate(transactionManager);
  }

  protected void wipe() {
    eventRepository.deleteAll();
    documentRepository.deleteAll();
    calculationRepository.deleteAll();
    findingRepository.deleteAll();
    groupRepository.deleteAll();
    projectRepository.deleteAll();
    normativeTableRepository.deleteAll();
    standardRepository.deleteAll();
    userRepository.deleteAll();
  }

  protected DataSeeder dataSeeder(Environment seedEnvironment) {
    return new DataSeeder(
        projectRepository,
        standardRepository,
        normativeTableRepository,
        userRepository,
        passwordEncoder,
        new SeedTimestamps(entityManager),
        seedEnvironment);
  }

  protected void bootstrap() {
    bootstrap(environment);
  }

  protected void bootstrap(Environment seedEnvironment) {
    transaction().executeWithoutResult(status -> dataSeeder(seedEnvironment).run());
  }

  protected DemoScenarioSeeder scenarioSeeder(boolean resetScenarios) {
    return new DemoScenarioSeeder(
        projectRepository,
        groupRepository,
        findingRepository,
        calculationRepository,
        documentRepository,
        standardRepository,
        normativeTableRepository,
        userRepository,
        demandCalculation,
        projectEventService,
        new SeedTimestamps(entityManager),
        transactionManager,
        resetScenarios);
  }

  protected static Environment production() {
    MockEnvironment production = new MockEnvironment();
    production.setActiveProfiles("prod", "demo");

    return production;
  }
}
