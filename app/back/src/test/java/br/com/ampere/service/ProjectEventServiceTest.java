package br.com.ampere.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import br.com.ampere.domain.Calculation;
import br.com.ampere.domain.CalculationCheck;
import br.com.ampere.domain.CheckStatus;
import br.com.ampere.domain.Finding;
import br.com.ampere.domain.FindingAnswer;
import br.com.ampere.domain.Project;
import br.com.ampere.domain.ProjectEvent;
import br.com.ampere.domain.ProjectEventType;
import br.com.ampere.domain.ReviewDecision;
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
    when(project.getReviewCycle()).thenReturn(0, 1, 1, 1, 1, 1, 1, 2, 2);
    when(project.getChangeSummary()).thenReturn("ART e área corrigidas.");
    Calculation calculation = mock(Calculation.class);
    when(calculation.getChecks())
        .thenReturn(
            List.of(
                new CalculationCheck("A", CheckStatus.WARNING, "Primeiro alerta."),
                new CalculationCheck("B", CheckStatus.WARNING, "Segundo alerta.")));
    Finding finding = mock(Finding.class);
    when(finding.isResolved()).thenReturn(false);

    service.created(project, designer);
    service.submitted(project, designer, calculation, at.minusDays(12));
    service.assigned(project, analyst, at.minusDays(11));
    service.decided(
        project, ReviewDecision.REJECT, analyst, List.of(finding), "Corrija a ART.", at);
    service.findingAnswered(
        project, designer, FindingAnswer.FIXED, "ART substituída.", at.plusDays(2));
    service.decided(
        project, ReviewDecision.APPROVE, analyst, List.of(), "Tudo certo.", at.plusDays(5));
    service.submitted(project, designer, calculation, at.plusDays(3));

    assertThat(recorded)
        .extracting(ProjectEvent::getType)
        .containsExactly(
            ProjectEventType.CREATED,
            ProjectEventType.SUBMITTED,
            ProjectEventType.PRE_VALIDATED,
            ProjectEventType.ASSIGNED,
            ProjectEventType.REJECTED,
            ProjectEventType.FINDING_ANSWERED,
            ProjectEventType.APPROVED,
            ProjectEventType.RESUBMITTED,
            ProjectEventType.PRE_VALIDATED);
    assertThat(recorded.get(2).getDescription()).isEqualTo("Pré-validação com 2 alertas.");
    assertThat(recorded.get(2).getDetail()).isEqualTo("Primeiro alerta.\nSegundo alerta.");
    assertThat(recorded.get(3).getDescription()).isEqualTo("Análise assumida por Admin Teste.");
    assertThat(recorded.get(4).getDescription()).isEqualTo("Reprovado com 1 apontamento.");
    assertThat(recorded.get(5).getDescription()).isEqualTo("Apontamento corrigido.");
    assertThat(recorded.get(7).getDescription()).isEqualTo("Versão 2 reenviada para análise.");
    assertThat(recorded.get(7).getDetail()).isEqualTo("ART e área corrigidas.");
    assertThat(recorded.get(2).getAuthor()).isNull();
    assertThat(recorded.get(4).getAuthorRole()).isEqualTo(UserRole.ADMIN);
  }

  private static User user(String name, UserRole role) {
    User user = mock(User.class);
    when(user.getName()).thenReturn(name);
    when(user.getRole()).thenReturn(role);
    return user;
  }
}
