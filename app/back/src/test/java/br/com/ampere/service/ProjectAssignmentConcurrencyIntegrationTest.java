package br.com.ampere.service;

import static org.assertj.core.api.Assertions.assertThat;

import br.com.ampere.domain.ConnectionType;
import br.com.ampere.domain.EntranceStandard;
import br.com.ampere.domain.Project;
import br.com.ampere.domain.ProjectEvent;
import br.com.ampere.domain.ProjectEventType;
import br.com.ampere.domain.ProjectStatus;
import br.com.ampere.domain.ResidentialMultifamily;
import br.com.ampere.domain.SupplyVoltage;
import br.com.ampere.domain.User;
import br.com.ampere.domain.UserRole;
import br.com.ampere.error.BusinessException;
import br.com.ampere.repository.CalculationRepository;
import br.com.ampere.repository.ConsumerUnitGroupRepository;
import br.com.ampere.repository.FindingRepository;
import br.com.ampere.repository.NormativeTableRepository;
import br.com.ampere.repository.ProjectDocumentRepository;
import br.com.ampere.repository.ProjectEventRepository;
import br.com.ampere.repository.ProjectRepository;
import br.com.ampere.repository.StandardRepository;
import br.com.ampere.repository.UserRepository;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.List;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.TimeUnit;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;

/** Two analysts taking the same project at once, each in a transaction that really commits. */
@SpringBootTest
class ProjectAssignmentConcurrencyIntegrationTest {

  @Autowired private ProjectReviewService reviewService;
  @Autowired private PlatformTransactionManager transactionManager;
  @Autowired private ProjectEventRepository eventRepository;
  @Autowired private ProjectDocumentRepository documentRepository;
  @Autowired private CalculationRepository calculationRepository;
  @Autowired private ConsumerUnitGroupRepository groupRepository;
  @Autowired private FindingRepository findingRepository;
  @Autowired private ProjectRepository projectRepository;
  @Autowired private NormativeTableRepository normativeTableRepository;
  @Autowired private StandardRepository standardRepository;
  @Autowired private UserRepository userRepository;

  @BeforeEach
  @AfterEach
  void wipe() {
    eventRepository.deleteAll();
    documentRepository.deleteAll();
    calculationRepository.deleteAll();
    groupRepository.deleteAll();
    findingRepository.deleteAll();
    projectRepository.deleteAll();
    normativeTableRepository.deleteAll();
    standardRepository.deleteAll();
    userRepository.deleteAll();
  }

  @Test
  void theSecondAnalystWaitsForTheFirstAndFindsTheProjectTaken() throws Exception {
    User owner =
        userRepository.save(new User("Ana Projetista", "ana@ampere.com", "x", UserRole.USER));
    User first =
        userRepository.save(new User("Alice Analista", "alice@ampere.com", "x", UserRole.REVIEWER));
    User second =
        userRepository.save(new User("Bruno Analista", "bruno@ampere.com", "x", UserRole.REVIEWER));
    Project project =
        new Project(
            "Residencial Concorrência",
            "Rua da Aurora, 100",
            "Recife",
            "2026-8201",
            ProjectStatus.DRAFT,
            new ResidentialMultifamily(
                4, SupplyVoltage.V380_220, ConnectionType.THREE_PHASE, EntranceStandard.COLLECTIVE),
            List.of(),
            owner);
    project.submit(OffsetDateTime.now(ZoneOffset.UTC));
    Long projectId = projectRepository.save(project).getId();

    CountDownLatch taken = new CountDownLatch(1);
    CountDownLatch release = new CountDownLatch(1);
    TransactionTemplate transaction = new TransactionTemplate(transactionManager);
    CompletableFuture<Void> firstAssignment =
        CompletableFuture.runAsync(
            () ->
                transaction.executeWithoutResult(
                    status -> {
                      reviewService.assign(projectId, reviewer(first));
                      taken.countDown();
                      await(release);
                    }));
    assertThat(taken.await(10, TimeUnit.SECONDS)).isTrue();

    CompletableFuture<Void> secondAssignment =
        CompletableFuture.runAsync(() -> reviewService.assign(projectId, reviewer(second)));
    Thread.sleep(500);
    assertThat(secondAssignment).isNotDone();

    release.countDown();
    firstAssignment.get(10, TimeUnit.SECONDS);

    assertThat(secondAssignment)
        .failsWithin(10, TimeUnit.SECONDS)
        .withThrowableThat()
        .havingRootCause()
        .isInstanceOf(BusinessException.class)
        .withMessage("Este projeto já foi assumido por outro analista.");
    assertThat(projectRepository.findDetailById(projectId).orElseThrow().getReviewer().getId())
        .isEqualTo(first.getId());
    assertThat(eventRepository.findAllByProjectIdOrderByOccurredAtAscIdAsc(projectId))
        .extracting(ProjectEvent::getType)
        .containsExactly(ProjectEventType.ASSIGNED);
  }

  private static AuthenticatedUser reviewer(User user) {
    return new AuthenticatedUser(user.getId(), UserRole.REVIEWER);
  }

  private static void await(CountDownLatch latch) {
    try {
      latch.await(10, TimeUnit.SECONDS);
    } catch (InterruptedException interrupted) {
      Thread.currentThread().interrupt();
    }
  }
}
