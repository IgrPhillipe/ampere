package br.com.ampere.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import br.com.ampere.domain.Calculation;
import br.com.ampere.domain.CalculationStep;
import br.com.ampere.domain.FindingStatus;
import br.com.ampere.domain.Project;
import br.com.ampere.domain.ProjectEvent;
import br.com.ampere.domain.ProjectEventType;
import br.com.ampere.domain.UserRole;
import br.com.ampere.repository.CalculationRepository;
import br.com.ampere.repository.FindingRepository;
import br.com.ampere.repository.ProjectEventRepository;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.Test;

class ProjectHistoryServiceTest {

  private static final AuthenticatedUser DESIGNER = new AuthenticatedUser(7L, UserRole.USER);

  @Test
  void calculatesCalendarDaysDecisionsFindingsAndChangedCalculationSteps() {
    ProjectService projectService = mock(ProjectService.class);
    ProjectEventRepository eventRepository = mock(ProjectEventRepository.class);
    FindingRepository findingRepository = mock(FindingRepository.class);
    CalculationRepository calculationRepository = mock(CalculationRepository.class);
    ProjectHistoryService service =
        new ProjectHistoryService(
            projectService, eventRepository, findingRepository, calculationRepository);
    Project project = mock(Project.class);
    when(project.getId()).thenReturn(4L);
    when(project.getReviewCycle()).thenReturn(2);
    when(projectService.findById(4L, DESIGNER)).thenReturn(project);
    OffsetDateTime submitted = OffsetDateTime.parse("2026-10-04T03:30:00Z");
    OffsetDateTime approved = OffsetDateTime.parse("2026-10-20T22:00:00Z");
    when(eventRepository.findAllByProjectIdOrderByOccurredAtAscIdAsc(4L))
        .thenReturn(
            List.of(
                event(project, ProjectEventType.SUBMITTED, 1, submitted),
                event(project, ProjectEventType.REJECTED, 1, submitted.plusDays(5)),
                event(project, ProjectEventType.RESUBMITTED, 2, submitted.plusDays(10)),
                event(project, ProjectEventType.APPROVED, 2, approved)));
    when(findingRepository.countByProjectIdAndStatusIn(4L, List.of(FindingStatus.RESOLVED)))
        .thenReturn(3L);
    when(findingRepository.countByProjectIdAndStatusIn(
            4L, List.of(FindingStatus.OPEN, FindingStatus.CONTESTED)))
        .thenReturn(1L);
    Calculation first = calculation(step("A", "10.0"), step("B", "5.00"));
    Calculation latest = calculation(step("A", "12.0"), step("B", "5.0"), step("C", "1"));
    when(calculationRepository
            .findFirstByProjectIdAndCalculatedAtLessThanEqualOrderByCalculatedAtDescIdDesc(
                4L, submitted))
        .thenReturn(Optional.of(first));
    when(calculationRepository.findFirstByProjectIdOrderByCalculatedAtDescIdDesc(4L))
        .thenReturn(Optional.of(latest));

    ProjectRework result = service.rework(4L, DESIGNER);

    assertThat(result.cycleDays()).isEqualTo(16);
    assertThat(result.submittedVersions()).isEqualTo(2);
    assertThat(result.reviewCycles()).isEqualTo(2);
    assertThat(result.resolvedFindings()).isEqualTo(3);
    assertThat(result.openFindings()).isEqualTo(1);
    assertThat(result.redoneCalculationSteps()).isEqualTo(2);
  }

  private static ProjectEvent event(
      Project project, ProjectEventType type, int version, OffsetDateTime occurredAt) {
    return new ProjectEvent(project, type, version, null, null, type.name(), null, occurredAt);
  }

  private static Calculation calculation(CalculationStep... steps) {
    Calculation calculation = mock(Calculation.class);
    when(calculation.getSteps()).thenReturn(List.of(steps));
    return calculation;
  }

  private static CalculationStep step(String code, String value) {
    CalculationStep step = mock(CalculationStep.class);
    when(step.getCode()).thenReturn(code);
    when(step.getValueKva()).thenReturn(new BigDecimal(value));
    return step;
  }
}
