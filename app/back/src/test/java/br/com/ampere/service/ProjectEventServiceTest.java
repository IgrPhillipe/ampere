package br.com.ampere.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import br.com.ampere.domain.Calculation;
import br.com.ampere.domain.CalculationCheck;
import br.com.ampere.domain.CheckStatus;
import br.com.ampere.domain.ConnectionType;
import br.com.ampere.domain.EntranceStandard;
import br.com.ampere.domain.Finding;
import br.com.ampere.domain.FindingStage;
import br.com.ampere.domain.FindingStatus;
import br.com.ampere.domain.Project;
import br.com.ampere.domain.ProjectEvent;
import br.com.ampere.domain.ProjectEventType;
import br.com.ampere.domain.ResidentialMultifamily;
import br.com.ampere.domain.SupplyVoltage;
import br.com.ampere.domain.User;
import br.com.ampere.domain.UserRole;
import br.com.ampere.repository.ProjectEventRepository;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import org.junit.jupiter.api.Test;

class ProjectEventServiceTest {

  @Test
  void recordsEveryLifecycleDescriptionWithTheCurrentVersionAndAuthor() {
    ProjectEventRepository repository = mock(ProjectEventRepository.class);
    List<ProjectEvent> recorded = new ArrayList<>();
    when(repository.save(any(ProjectEvent.class)))
        .thenAnswer(
            invocation -> {
              ProjectEvent event = invocation.getArgument(0);
              recorded.add(event);
              return event;
            });
    ProjectEventService service = new ProjectEventService(repository);
    Project project = mock(Project.class);
    User designer = user("Usuário Teste", UserRole.USER);
    User analyst = user("Admin Teste", UserRole.ADMIN);
    OffsetDateTime at = OffsetDateTime.parse("2026-10-16T14:20:00Z");
    when(project.getCreatedAt()).thenReturn(at.minusDays(12));
    when(project.getChangeSummary()).thenReturn("ART e área corrigidas.");
    Calculation calculation = mock(Calculation.class);
    when(calculation.getChecks())
        .thenReturn(
            List.of(
                new CalculationCheck("A", CheckStatus.WARNING, "Primeiro alerta."),
                new CalculationCheck("B", CheckStatus.WARNING, "Segundo alerta.")));
    Finding open = finding(FindingStatus.OPEN);
    Finding contested = finding(FindingStatus.CONTESTED);
    Finding fixed = finding(FindingStatus.FIXED);
    when(fixed.getStage()).thenReturn(FindingStage.DOCUMENTS);
    when(fixed.getResponse()).thenReturn("ART substituída.");

    when(project.getReviewCycle()).thenReturn(0);
    service.created(project, designer);
    when(project.getReviewCycle()).thenReturn(1);
    service.submitted(project, designer, calculation, 0, at.minusDays(12));
    when(project.getReviewer()).thenReturn(analyst);
    service.assigned(project, analyst, at.minusDays(11));
    service.rejected(project, analyst, List.of(open, contested, fixed), "Corrija a ART.", at);
    service.findingAnswered(project, designer, fixed, at.plusDays(2));
    when(project.getReviewCycle()).thenReturn(2);
    when(project.remainingReviewDays(any(), any())).thenReturn(19L);
    service.submitted(project, designer, calculation, 3, at.plusDays(3));
    service.approved(project, analyst, 0, "Tudo certo.", at.plusDays(5));
    service.approved(project, analyst, 1, "Aprovado com ajuste.", at.plusDays(6));
    service.approved(project, analyst, 2, "Aprovado com ajustes.", at.plusDays(7));

    assertThat(recorded)
        .extracting(ProjectEvent::getType)
        .containsExactly(
            ProjectEventType.CREATED,
            ProjectEventType.SUBMITTED,
            ProjectEventType.PRE_VALIDATED,
            ProjectEventType.ASSIGNED,
            ProjectEventType.REJECTED,
            ProjectEventType.FINDING_ANSWERED,
            ProjectEventType.RESUBMITTED,
            ProjectEventType.PRE_VALIDATED,
            ProjectEventType.APPROVED,
            ProjectEventType.APPROVED,
            ProjectEventType.APPROVED);
    assertThat(recorded)
        .extracting(ProjectEvent::getVersion)
        .containsExactly(0, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2);
    assertThat(recorded.get(2).getDescription()).isEqualTo("Pré-validação com 2 alertas.");
    assertThat(recorded.get(2).getDetail()).isEqualTo("Primeiro alerta.\nSegundo alerta.");
    assertThat(recorded.get(3).getDescription())
        .isEqualTo("Análise atribuída a Admin Teste por Admin Teste.");
    assertThat(recorded.get(4).getDescription()).isEqualTo("Reprovado com 2 apontamentos.");
    assertThat(recorded.get(5).getDescription()).isEqualTo("Apontamento de Documentos corrigido.");
    assertThat(recorded.get(5).getDetail()).isEqualTo("ART substituída.");
    assertThat(recorded.get(6).getDescription())
        .isEqualTo("Versão 2 reenviada para análise. Prazo suspenso por 3 dias; restam 19 dias.");
    assertThat(recorded.get(6).getDetail()).isEqualTo("ART e área corrigidas.");
    assertThat(recorded.subList(8, 11))
        .extracting(ProjectEvent::getDescription)
        .containsExactly("Aprovado.", "Aprovado com 1 ressalva.", "Aprovado com 2 ressalvas.");
    assertThat(recorded.get(2).getAuthor()).isNull();
    assertThat(recorded.get(4).getAuthorRole()).isEqualTo(UserRole.ADMIN);
  }

  @Test
  void aResubmissionRecordsTheDaysSuspendedAndTheDaysLeft() {
    ProjectEventRepository repository = mock(ProjectEventRepository.class);
    List<ProjectEvent> recorded = recordInto(repository);
    ProjectEventService service = new ProjectEventService(repository);
    OffsetDateTime submittedAt = OffsetDateTime.parse("2026-10-01T15:00:00Z");
    Project project = project(submittedAt.minusDays(22));
    User designer = user("Usuário Teste", UserRole.USER);
    project.reject(submittedAt.minusDays(10));
    long suspendedDays = project.submit(submittedAt);
    Calculation calculation = mock(Calculation.class);

    // No rejection event to look up: the days come from the domain.
    service.submitted(project, designer, calculation, suspendedDays, submittedAt);

    assertThat(recorded.getFirst().getType()).isEqualTo(ProjectEventType.RESUBMITTED);
    assertThat(recorded.getFirst().getDescription())
        .isEqualTo("Versão 2 reenviada para análise. Prazo suspenso por 10 dias; restam 18 dias.");
  }

  @Test
  void anExpiryRecordsTheLastDayOfTheApproval() {
    ProjectEventRepository repository = mock(ProjectEventRepository.class);
    List<ProjectEvent> recorded = recordInto(repository);
    ProjectEventService service = new ProjectEventService(repository);
    OffsetDateTime approvedAt = OffsetDateTime.parse("2023-10-02T15:00:00Z");
    Project project = project(approvedAt.minusDays(10));
    project.approve(approvedAt);
    project.expire();

    service.expired(project, approvedAt.plusMonths(36).plusDays(1));

    assertThat(recorded.getFirst().getType()).isEqualTo(ProjectEventType.EXPIRED);
    assertThat(recorded.getFirst().getAuthor()).isNull();
    assertThat(recorded.getFirst().getDescription())
        .isEqualTo("Validade da aprovação encerrada em 02/10/2026.");
    assertThat(recorded.getFirst().getDetail())
        .isEqualTo("Aprovação válida por 36 meses (DIS-NOR-053, item 6.27.6).");
  }

  private static List<ProjectEvent> recordInto(ProjectEventRepository repository) {
    List<ProjectEvent> recorded = new ArrayList<>();
    when(repository.save(any(ProjectEvent.class)))
        .thenAnswer(
            invocation -> {
              ProjectEvent event = invocation.getArgument(0);
              recorded.add(event);
              return event;
            });
    return recorded;
  }

  private static Project project(OffsetDateTime submittedAt) {
    Project project =
        Project.draft(
            "Residencial Teste",
            "Rua A, 1",
            "Recife",
            "2026-9999",
            new ResidentialMultifamily(
                6, SupplyVoltage.V380_220, ConnectionType.THREE_PHASE, EntranceStandard.COLLECTIVE),
            List.of());
    project.submit(submittedAt);
    return project;
  }

  private static Finding finding(FindingStatus status) {
    Finding finding = mock(Finding.class);
    when(finding.getStatus()).thenReturn(status);
    return finding;
  }

  private static User user(String name, UserRole role) {
    User user = mock(User.class);
    when(user.getName()).thenReturn(name);
    when(user.getRole()).thenReturn(role);
    return user;
  }
}
