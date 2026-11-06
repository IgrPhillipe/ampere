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

  @Autowired private ReviewAssignmentService assignmentService;
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
  void theSecondBatchWaitsForTheFirstAndReassignsTheProjects() throws Exception {
    User owner =
        userRepository.save(new User("Ana Projetista", "ana@ampere.com", "x", UserRole.USER));
    User manager =
        userRepository.save(new User("Gina Gestora", "gina@ampere.com", "x", UserRole.ADMIN));
    User first =
        userRepository.save(new User("Alice Analista", "alice@ampere.com", "x", UserRole.REVIEWER));
    User second =
        userRepository.save(new User("Bruno Analista", "bruno@ampere.com", "x", UserRole.REVIEWER));
    Long projectA = submittedProject("2026-8201", owner).getId();
    Long projectB = submittedProject("2026-8202", owner).getId();
    AuthenticatedUser caller = new AuthenticatedUser(manager.getId(), UserRole.ADMIN);

    CountDownLatch assigned = new CountDownLatch(1);
    CountDownLatch release = new CountDownLatch(1);
    TransactionTemplate transaction = new TransactionTemplate(transactionManager);
    CompletableFuture<Void> firstBatch =
        CompletableFuture.runAsync(
            () ->
                transaction.executeWithoutResult(
                    status -> {
                      assignmentService.assign(List.of(projectA, projectB), first.getId(), caller);
                      assigned.countDown();
                      await(release);
                    }));
    assertThat(assigned.await(10, TimeUnit.SECONDS)).isTrue();

    CompletableFuture<Void> secondBatch =
        CompletableFuture.runAsync(
            () -> assignmentService.assign(List.of(projectB, projectA), second.getId(), caller));
    Thread.sleep(500);
    assertThat(secondBatch).isNotDone();

    release.countDown();
    firstBatch.get(10, TimeUnit.SECONDS);
    secondBatch.get(10, TimeUnit.SECONDS);

    for (Long project : List.of(projectA, projectB)) {
      assertThat(projectRepository.findDetailById(project).orElseThrow().getReviewer().getId())
          .isEqualTo(second.getId());
      assertThat(eventRepository.findAllByProjectIdOrderByOccurredAtAscIdAsc(project))
          .extracting(ProjectEvent::getType)
          .containsExactly(ProjectEventType.ASSIGNED, ProjectEventType.ASSIGNED);
    }
  }

  private Project submittedProject(String protocol, User owner) {
    Project project =
        new Project(
            "Residencial " + protocol,
            "Rua da Aurora, 100",
            "Recife",
            protocol,
            ProjectStatus.DRAFT,
            new ResidentialMultifamily(
                4, SupplyVoltage.V380_220, ConnectionType.THREE_PHASE, EntranceStandard.COLLECTIVE),
            List.of(),
            owner);
    project.submit(OffsetDateTime.now(ZoneOffset.UTC));

    return projectRepository.save(project);
  }

  private static void await(CountDownLatch latch) {
    try {
      latch.await(10, TimeUnit.SECONDS);
    } catch (InterruptedException interrupted) {
      Thread.currentThread().interrupt();
    }
  }
}
