package br.com.ampere.service;

import br.com.ampere.domain.DocumentType;
import br.com.ampere.domain.Project;
import br.com.ampere.domain.ProjectDocument;
import br.com.ampere.error.BusinessException;
import br.com.ampere.error.NotFoundException;
import br.com.ampere.repository.ProjectDocumentRepository;
import java.io.IOException;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

/**
 * Gerencia os documentos PDF anexados a um projeto (ART, diagrama unifilar, planta de situacao).
 *
 * <p>Regras de negocio:
 *
 * <ul>
 *   <li>So aceita arquivos PDF (content type application/pdf)
 *   <li>Cada tipo de documento so pode ter um por projeto (UNIQUE constraint)
 *   <li>Se ja existir um documento do mesmo tipo, ele e substituido
 *   <li>So e possivel gerenciar documentos de projetos em DRAFT ou AWAITING_SUBMISSION
 * </ul>
 */
@Service
public class ProjectDocumentService {

  private static final String PDF_CONTENT_TYPE = "application/pdf";

  private final ProjectService projectService;
  private final ProjectDocumentRepository documentRepository;

  public ProjectDocumentService(
      ProjectService projectService, ProjectDocumentRepository documentRepository) {
    this.projectService = projectService;
    this.documentRepository = documentRepository;
  }

  /** Lista todos os documentos de um projeto. */
  @Transactional(readOnly = true)
  public List<ProjectDocument> listByProject(Long projectId) {
    // Valida que o projeto existe (lanca 404 se nao existir).
    projectService.findById(projectId);
    return documentRepository.findAllByProjectIdOrderByUploadedAtDesc(projectId);
  }

  /**
   * Faz upload de um documento PDF para o projeto.
   *
   * <p>Valida que: o projeto existe, o arquivo e PDF, e o projeto pode receber documentos (esta em
   * DRAFT ou AWAITING_SUBMISSION). Se ja existir um documento do mesmo tipo, ele e substituido.
   *
   * @param projectId ID do projeto
   * @param type tipo do documento (ART, DIAGRAMA_UNIFILAR, PLANTA_DE_SITUACAO)
   * @param file arquivo PDF enviado via multipart
   * @return o documento salvo
   */
  @Transactional
  public ProjectDocument upload(Long projectId, DocumentType type, MultipartFile file) {
    // 1. Busca o projeto e valida que pode receber documentos.
    Project project = projectService.findById(projectId);
    if (!project.canBeSubmitted()) {
      throw new BusinessException(
          "Só é possível anexar documentos a projetos em rascunho ou aguardando submissão.",
          HttpStatus.CONFLICT);
    }

    // 2. Valida que o arquivo e PDF.
    if (file.isEmpty()) {
      throw new BusinessException("O arquivo não pode estar vazio.");
    }
    String contentType = file.getContentType();
    if (contentType == null || !contentType.equalsIgnoreCase(PDF_CONTENT_TYPE)) {
      throw new BusinessException("Apenas arquivos PDF são aceitos.");
    }

    // 3. Se ja existe documento do mesmo tipo, remove para substituir.
    documentRepository
        .findByProjectIdAndType(projectId, type)
        .ifPresent(documentRepository::delete);

    // 4. Le os bytes do arquivo e cria a entidade.
    try {
      byte[] data = file.getBytes();
      String filename =
          file.getOriginalFilename() != null ? file.getOriginalFilename() : type.name() + ".pdf";

      ProjectDocument document = new ProjectDocument(project, type, filename, data);
      return documentRepository.save(document);
    } catch (IOException exception) {
      throw new RuntimeException("Erro ao ler o arquivo enviado.", exception);
    }
  }

  /**
   * Remove um documento pelo ID.
   *
   * <p>Valida que o documento pertence ao projeto informado e que o projeto ainda aceita
   * alteracoes.
   */
  @Transactional
  public void delete(Long projectId, Long documentId) {
    ProjectDocument document =
        documentRepository
            .findById(documentId)
            .orElseThrow(() -> new NotFoundException("Documento não encontrado."));

    // Valida que o documento pertence ao projeto correto.
    if (!document.getProject().getId().equals(projectId)) {
      throw new NotFoundException("Documento não encontrado.");
    }

    // Valida que o projeto permite alteracoes.
    if (!document.getProject().canBeSubmitted()) {
      throw new BusinessException(
          "Não é possível remover documentos de um projeto já submetido.", HttpStatus.CONFLICT);
    }

    documentRepository.delete(document);
  }
}
