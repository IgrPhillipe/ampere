package br.com.ampere.service;

import br.com.ampere.domain.DocumentType;
import br.com.ampere.domain.Project;
import br.com.ampere.error.BusinessException;
import br.com.ampere.repository.CalculationRepository;
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
  private final CalculationRepository calculationRepository;
  private final ProjectDocumentRepository documentRepository;

  public SubmissionService(
      ProjectService projectService,
      CalculationRepository calculationRepository,
      ProjectDocumentRepository documentRepository) {
    this.projectService = projectService;
    this.calculationRepository = calculationRepository;
    this.documentRepository = documentRepository;
  }

  @Transactional(readOnly = true)
  public SubmissionChecklist checklist(Long projectId) {
    projectService.findById(projectId);

    return checklistOf(projectId);
  }

  @Transactional
  public Project submit(Long projectId) {
    Project project = projectService.findById(projectId);
    if (!project.canBeSubmitted()) {
      throw new BusinessException("Este projeto já foi enviado para análise.", HttpStatus.CONFLICT);
    }

    SubmissionChecklist checklist = checklistOf(projectId);
    if (!checklist.canSubmit()) {
      throw new BusinessException(
          "Não é possível enviar o projeto. Pendências: "
              + String.join(", ", pendingItems(checklist))
              + ".",
          HttpStatus.UNPROCESSABLE_CONTENT);
    }

    project.submit(OffsetDateTime.now(ZoneOffset.UTC));

    return project;
  }

  private SubmissionChecklist checklistOf(Long projectId) {
    return new SubmissionChecklist(
        calculationRepository.findFirstByProjectIdOrderByIdDesc(projectId).isPresent(),
        documentRepository.findAllByProjectIdOrderByType(projectId));
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
