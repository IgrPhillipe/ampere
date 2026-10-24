package br.com.ampere.config;

import static org.assertj.core.api.Assertions.assertThat;

import br.com.ampere.domain.FindingStatus;
import br.com.ampere.domain.ProjectStatus;
import br.com.ampere.domain.Standard;
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
import java.util.List;
import java.util.function.Function;
import java.util.stream.Collectors;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.PlatformTransactionManager;

@SpringBootTest
class DemoScenarioSeederIntegrationTest {

  @Autowired private ProjectRepository projectRepository;
  @Autowired private ConsumerUnitGroupRepository groupRepository;
  @Autowired private FindingRepository findingRepository;
  @Autowired private CalculationRepository calculationRepository;
  @Autowired private ProjectDocumentRepository documentRepository;
  @Autowired private StandardRepository standardRepository;
  @Autowired private NormativeTableRepository normativeTableRepository;
  @Autowired private UserRepository userRepository;
  @Autowired private DemandCalculationService demandCalculation;
  @Autowired private PasswordEncoder passwordEncoder;
  @Autowired private PlatformTransactionManager transactionManager;

  private DemoScenarioSeeder seeder;

  @BeforeEach
  void seedPrerequisites() {
    documentRepository.deleteAll();
    calculationRepository.deleteAll();
    findingRepository.deleteAll();
    groupRepository.deleteAll();
    projectRepository.deleteAll();
    normativeTableRepository.deleteAll();
    standardRepository.deleteAll();
    userRepository.deleteAll();

    List<Standard> standards =
        standardRepository.saveAll(
            List.of(new Standard("DIS-NOR-053", "REV 06"), new Standard("DIS-NOR-030", "REV 07")));
    normativeTableRepository.saveAll(
        NormativeTableSeed.all(
            standards.stream().collect(Collectors.toMap(Standard::getName, Function.identity()))));
    String hash = passwordEncoder.encode("senha@123");
    userRepository.saveAll(
        List.of(
            new User("Usuário Teste", "user@ampere.com", hash, UserRole.USER),
            new User("Admin Teste", "admin@ampere.com", hash, UserRole.ADMIN),
            new User("Revisor Teste", DataSeeder.REVIEWER_EMAIL, hash, UserRole.REVIEWER)));

    seeder =
        new DemoScenarioSeeder(
            projectRepository,
            groupRepository,
            findingRepository,
            calculationRepository,
            documentRepository,
            standardRepository,
            normativeTableRepository,
            userRepository,
            demandCalculation,
            passwordEncoder,
            transactionManager);
  }

  @Test
  void seedsEveryStepOfTheReviewOnce() {
    seeder.onReady();
    long projects = projectRepository.count();
    seeder.onReady();

    assertThat(projectRepository.count()).isEqualTo(projects).isEqualTo(16);
    assertThat(projectRepository.findAll())
        .extracting(project -> project.getStatus())
        .contains(
            ProjectStatus.DRAFT,
            ProjectStatus.UNDER_REVIEW,
            ProjectStatus.REJECTED,
            ProjectStatus.APPROVED);
    assertThat(findingRepository.findAll())
        .extracting(finding -> finding.getStatus())
        .contains(
            FindingStatus.DRAFT,
            FindingStatus.OPEN,
            FindingStatus.FIXED,
            FindingStatus.CONTESTED,
            FindingStatus.RESOLVED);
    assertThat(projectRepository.findByProtocol("2026-2009").orElseThrow().getReviewCycle())
        .isEqualTo(2);
    assertThat(userRepository.findByEmail(DemoScenarioSeeder.SECOND_DESIGNER_EMAIL)).isPresent();
    assertThat(userRepository.findByEmail("user@ampere.com").orElseThrow().getCrea())
        .isEqualTo("123456");
  }
}
