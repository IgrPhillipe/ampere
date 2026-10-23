package br.com.ampere.service;

import br.com.ampere.domain.DocumentType;
import br.com.ampere.domain.FindingSeverity;
import br.com.ampere.domain.FindingStatus;
import br.com.ampere.domain.Project;
import br.com.ampere.error.BusinessException;
import br.com.ampere.repository.CalculationRepository;
import br.com.ampere.repository.FindingRepository;
import br.com.ampere.repository.ProjectDocumentRepository;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class SubmissionService {

  static final String CALCULATION_PENDING = "Cálculo de demanda";

  private final ProjectService projectService;
  private final DemandCalculationService demandCalculationService;
  private final CalculationRepository calculationRepository;
  private final ProjectDocumentRepository documentRepository;
  private final FindingRepository findingRepository;

  public SubmissionService(
      ProjectService projectService,
      DemandCalculationService demandCalculationService,
      CalculationRepository calculationRepository,
      ProjectDocumentRepository documentRepository,
      FindingRepository findingRepository) {
    this.projectService = projectService;
    this.demandCalculationService = demandCalculationService;
    this.calculationRepository = calculationRepository;
    this.documentRepository = documentRepository;
    this.findingRepository = findingRepository;
  }

  @Transactional(readOnly = true)
  public SubmissionChecklist checklist(Long projectId, AuthenticatedUser user) {
    Project project = projectService.findById(projectId, user);

    return checklistOf(project);
  }

  @Transactional
  public Project submit(Long projectId, AuthenticatedUser user) {
    return submit(projectId, null, user);
  }

  @Transactional
  public Project submit(Long projectId, String changeSummary, AuthenticatedUser user) {
    Project project = projectService.findWritableById(projectId, user);
    if (!project.canBeSubmitted()) {
      throw new BusinessException("Este projeto já foi enviado para análise.", HttpStatus.CONFLICT);
    }

    SubmissionChecklist checklist = checklistOf(project);
    List<String> pending = pendingItems(checklist);
    if (!pending.isEmpty()) {
      throw new BusinessException(
          "Não é possível enviar o projeto. Pendências: " + String.join(", ", pending) + ".",
          HttpStatus.UNPROCESSABLE_CONTENT);
    }
    if (checklist.unansweredBlocking() > 0) {
      throw new BusinessException(
          "Responda os apontamentos bloqueantes antes de reenviar. Pendentes: "
              + checklist.unansweredBlocking()
              + ".",
          HttpStatus.UNPROCESSABLE_CONTENT);
    }
    if (project.isRejected()) {
      if (changeSummary == null || changeSummary.isBlank()) {
        throw new BusinessException(
            "Informe o resumo das alterações para reenviar o projeto.",
            HttpStatus.UNPROCESSABLE_CONTENT);
      }
      demandCalculationService.calculate(projectId, user);
      project.recordChangeSummary(changeSummary);
    }

    project.submit(OffsetDateTime.now(ZoneOffset.UTC));

    return project;
  }

  private SubmissionChecklist checklistOf(Project project) {
    Long projectId = project.getId();
    return new SubmissionChecklist(
        calculationRepository.findFirstByProjectIdOrderByIdDesc(projectId).isPresent(),
        documentRepository.findAllByProjectIdOrderByType(projectId),
        findingRepository.countByProjectIdAndSeverityAndStatus(
            projectId, FindingSeverity.BLOCKING, FindingStatus.OPEN),
        project.isRejected());
  }

  private static List<String> pendingItems(SubmissionChecklist checklist) {
    List<String> pending = new ArrayList<>();
    if (!checklist.calculated()) {
      pending.add(CALCULATION_PENDING);
    }
    checklist.missingDocuments().stream().map(DocumentType::label).forEach(pending::add);

    return pending;
  }
}
