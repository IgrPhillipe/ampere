package br.com.ampere.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import br.com.ampere.domain.ConnectionType;
import br.com.ampere.domain.DocumentType;
import br.com.ampere.domain.EntranceStandard;
import br.com.ampere.domain.FindingSeverity;
import br.com.ampere.domain.FindingStatus;
import br.com.ampere.domain.Project;
import br.com.ampere.domain.ProjectDocument;
import br.com.ampere.domain.ProjectStatus;
import br.com.ampere.domain.ResidentialMultifamily;
import br.com.ampere.domain.SupplyVoltage;
import br.com.ampere.domain.User;
import br.com.ampere.domain.UserRole;
import br.com.ampere.error.BusinessException;
import br.com.ampere.repository.CalculationRepository;
import br.com.ampere.repository.FindingRepository;
import br.com.ampere.repository.ProjectDocumentRepository;
import java.nio.charset.StandardCharsets;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;

class SubmissionServiceTest {

  private static final AuthenticatedUser DESIGNER = new AuthenticatedUser(7L, UserRole.USER);
  private static final byte[] PDF = "%PDF-1.7\n%test".getBytes(StandardCharsets.US_ASCII);

  @Test
  void blocksResubmissionWhenBlockingFindingsRemainUnanswered() {
    Project project = rejectedProject();
    ProjectService projectService = mock(ProjectService.class);
    DemandCalculationService demandCalculationService = mock(DemandCalculationService.class);
    CalculationRepository calculationRepository = mock(CalculationRepository.class);
    ProjectDocumentRepository documentRepository = mock(ProjectDocumentRepository.class);
    FindingRepository findingRepository = mock(FindingRepository.class);

    when(projectService.findWritableById(1L, DESIGNER)).thenReturn(project);
    when(projectService.findById(1L, DESIGNER)).thenReturn(project);
    when(calculationRepository.findFirstByProjectIdOrderByIdDesc(1L))
        .thenReturn(Optional.of(mock()));
    when(documentRepository.findAllByProjectIdOrderByType(1L)).thenReturn(allDocuments(project));
    when(findingRepository.countByProjectIdAndSeverityAndStatus(
            1L, FindingSeverity.BLOCKING, FindingStatus.OPEN))
        .thenReturn(2L);

    SubmissionService service =
        new SubmissionService(
            projectService,
            demandCalculationService,
            calculationRepository,
            documentRepository,
            findingRepository);

    SubmissionChecklist checklist = service.checklist(1L, DESIGNER);
    assertThat(checklist.canSubmit()).isFalse();
    assertThat(checklist.unansweredBlocking()).isEqualTo(2);
    assertThat(checklist.requiresChangeSummary()).isTrue();

    assertThatThrownBy(() -> service.submit(1L, "Corrigi os itens.", DESIGNER))
        .isInstanceOfSatisfying(
            BusinessException.class,
            error -> {
              assertThat(error.getStatus()).isEqualTo(HttpStatus.UNPROCESSABLE_CONTENT);
              assertThat(error.getMessage())
                  .isEqualTo(
                      "Responda os apontamentos bloqueantes antes de reenviar. Pendentes: 2.");
            });
    verify(demandCalculationService, never()).calculate(1L, DESIGNER);
  }

  @Test
  void requiresChangeSummaryRecalculatesAndIncrementsVersionOnResubmission() {
    Project project = rejectedProject();
    User analyst = new User("Admin Teste", "admin@ampere.com", "hash", UserRole.ADMIN);
    project.assignReviewer(analyst);

    ProjectService projectService = mock(ProjectService.class);
    DemandCalculationService demandCalculationService = mock(DemandCalculationService.class);
    CalculationRepository calculationRepository = mock(CalculationRepository.class);
    ProjectDocumentRepository documentRepository = mock(ProjectDocumentRepository.class);
    FindingRepository findingRepository = mock(FindingRepository.class);

    when(projectService.findWritableById(1L, DESIGNER)).thenReturn(project);
    when(calculationRepository.findFirstByProjectIdOrderByIdDesc(1L))
        .thenReturn(Optional.of(mock()));
    when(documentRepository.findAllByProjectIdOrderByType(1L)).thenReturn(allDocuments(project));
    when(findingRepository.countByProjectIdAndSeverityAndStatus(
            1L, FindingSeverity.BLOCKING, FindingStatus.OPEN))
        .thenReturn(0L);

    SubmissionService service =
        new SubmissionService(
            projectService,
            demandCalculationService,
            calculationRepository,
            documentRepository,
            findingRepository);

    assertThatThrownBy(() -> service.submit(1L, "   ", DESIGNER))
        .isInstanceOfSatisfying(
            BusinessException.class,
            error -> {
              assertThat(error.getStatus()).isEqualTo(HttpStatus.UNPROCESSABLE_CONTENT);
              assertThat(error.getMessage())
                  .isEqualTo("Informe o resumo das alterações para reenviar o projeto.");
            });

    Project resubmitted =
        service.submit(
            1L, "Substituí a ART assinada e corrigi a área do apartamento tipo B.", DESIGNER);

    verify(demandCalculationService).calculate(1L, DESIGNER);
    assertThat(resubmitted.getStatus()).isEqualTo(ProjectStatus.UNDER_REVIEW);
    assertThat(resubmitted.getReviewCycle()).isEqualTo(2);
    assertThat(resubmitted.isReanalysis()).isTrue();
    assertThat(resubmitted.getReviewOpinion()).isNull();
    assertThat(resubmitted.getChangeSummary())
        .isEqualTo("Substituí a ART assinada e corrigi a área do apartamento tipo B.");
    assertThat(resubmitted.getReviewer()).isSameAs(analyst);
  }

  @Test
  void refusesToResubmitAnApprovedProject() {
    Project project = rejectedProject();
    project.submit(OffsetDateTime.now(ZoneOffset.UTC).minusDays(1));
    project.approve(OffsetDateTime.now(ZoneOffset.UTC));
    ProjectService projectService = mock(ProjectService.class);
    DemandCalculationService demandCalculationService = mock(DemandCalculationService.class);
    when(projectService.findWritableById(1L, DESIGNER)).thenReturn(project);

    SubmissionService service =
        new SubmissionService(
            projectService,
            demandCalculationService,
            mock(CalculationRepository.class),
            mock(ProjectDocumentRepository.class),
            mock(FindingRepository.class));

    assertThatThrownBy(() -> service.submit(1L, "Nova versão.", DESIGNER))
        .isInstanceOfSatisfying(
            BusinessException.class,
            error -> assertThat(error.getStatus()).isEqualTo(HttpStatus.CONFLICT));
    verify(demandCalculationService, never()).calculate(1L, DESIGNER);
    assertThat(project.getStatus()).isEqualTo(ProjectStatus.APPROVED);
  }

  private static Project rejectedProject() {
    Project project =
        new Project(
            "Condomínio Vila Nova",
            "Avenida Barreto de Menezes, 88",
            "Jaboatão dos Guararapes",
            "2026-1004",
            ProjectStatus.DRAFT,
            new ResidentialMultifamily(
                6, SupplyVoltage.V220_127, ConnectionType.TWO_PHASE, EntranceStandard.INDIVIDUAL),
            List.of()) {
          @Override
          public Long getId() {
            return 1L;
          }
        };
    project.submit(OffsetDateTime.now(ZoneOffset.UTC).minusDays(10));
    project.reject(OffsetDateTime.now(ZoneOffset.UTC).minusDays(2), "Corrija a ART.");
    return project;
  }

  private static List<ProjectDocument> allDocuments(Project project) {
    return Arrays.stream(DocumentType.values())
        .map(type -> new ProjectDocument(project, type, type.name() + ".pdf", PDF))
        .toList();
  }
}
