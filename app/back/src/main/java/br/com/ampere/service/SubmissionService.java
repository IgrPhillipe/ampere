package br.com.ampere.service;

import br.com.ampere.domain.DocumentType;
import br.com.ampere.domain.Project;
import br.com.ampere.dto.SubmissionChecklistResponse;
import br.com.ampere.dto.SubmissionChecklistResponse.ChecklistItem;
import br.com.ampere.error.BusinessException;
import br.com.ampere.repository.CalculationRepository;
import br.com.ampere.repository.ProjectDocumentRepository;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Logica de submissao do projeto para revisao.
 *
 * <p>Responsavel por:
 *
 * <ul>
 *   <li>Montar o checklist de pre-submissao (GET /projects/{id}/submission)
 *   <li>Executar a submissao (POST /projects/{id}/submit)
 * </ul>
 *
 * <p>O checklist verifica se o projeto tem: um calculo de demanda realizado, e os tres documentos
 * obrigatorios (ART, diagrama unifilar, planta de situacao). O envio so e permitido quando todos os
 * itens estao completos.
 */
@Service
public class SubmissionService {

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

  /**
   * Monta o checklist de submissao para o projeto.
   *
   * <p>Cada item e verificado independentemente. O campo canSubmit so e true quando TODOS os itens
   * estao completos.
   *
   * @param projectId ID do projeto
   * @return checklist com os itens e o flag canSubmit
   */
  @Transactional(readOnly = true)
  public SubmissionChecklistResponse checklist(Long projectId) {
    // Valida que o projeto existe.
    projectService.findById(projectId);

    // Verifica cada requisito individualmente.
    boolean hasCalculation =
        calculationRepository.findFirstByProjectIdOrderByIdDesc(projectId).isPresent();

    boolean hasArt =
        documentRepository.findByProjectIdAndType(projectId, DocumentType.ART).isPresent();

    boolean hasDiagramaUnifilar =
        documentRepository
            .findByProjectIdAndType(projectId, DocumentType.DIAGRAMA_UNIFILAR)
            .isPresent();

    boolean hasPlantaDeSituacao =
        documentRepository
            .findByProjectIdAndType(projectId, DocumentType.PLANTA_DE_SITUACAO)
            .isPresent();

    // Monta a lista de itens do checklist.
    List<ChecklistItem> items =
        List.of(
            new ChecklistItem("calculation", "Cálculo de demanda realizado", hasCalculation),
            new ChecklistItem("art", "ART anexada", hasArt),
            new ChecklistItem(
                "diagrama_unifilar", "Diagrama unifilar anexado", hasDiagramaUnifilar),
            new ChecklistItem(
                "planta_de_situacao", "Planta de situação anexada", hasPlantaDeSituacao));

    // canSubmit so e true se todos os itens estao completos.
    boolean canSubmit = items.stream().allMatch(ChecklistItem::completed);

    return new SubmissionChecklistResponse(items, canSubmit);
  }

  /**
   * Submete o projeto para revisao.
   *
   * <p>Validacoes:
   *
   * <ol>
   *   <li>Projeto existe
   *   <li>Projeto esta em estado que permite submissao (DRAFT ou AWAITING_SUBMISSION)
   *   <li>Todos os itens do checklist estao completos (calculo + 3 documentos)
   * </ol>
   *
   * <p>Se tudo estiver OK, muda o status para UNDER_REVIEW e grava a data de envio (submittedAt).
   * Se faltar algo, retorna 422 com a lista do que falta.
   *
   * @param projectId ID do projeto
   * @return o projeto atualizado
   */
  @Transactional
  public Project submit(Long projectId) {
    // 1. Busca o projeto.
    Project project = projectService.findById(projectId);

    // 2. Valida que o projeto esta em estado valido para submissao.
    if (!project.canBeSubmitted()) {
      throw new BusinessException(
          "Este projeto não pode ser submetido. Situação atual: " + project.getStatus() + ".",
          HttpStatus.CONFLICT);
    }

    // 3. Verifica o checklist — se faltar algo, retorna 422.
    SubmissionChecklistResponse checklist = checklist(projectId);
    if (!checklist.canSubmit()) {
      // Monta mensagem com os itens que faltam.
      List<String> missing =
          checklist.items().stream()
              .filter(item -> !item.completed())
              .map(ChecklistItem::label)
              .toList();

      throw new BusinessException(
          "Não é possível submeter o projeto. Pendências: " + String.join(", ", missing) + ".",
          HttpStatus.UNPROCESSABLE_ENTITY);
    }

    // 4. Tudo OK — muda status para UNDER_REVIEW e registra a data de envio.
    project.submit();

    return project;
  }
}
