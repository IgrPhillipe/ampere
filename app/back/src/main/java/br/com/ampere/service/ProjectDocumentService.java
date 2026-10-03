package br.com.ampere.service;

import br.com.ampere.domain.DocumentType;
import br.com.ampere.domain.Project;
import br.com.ampere.domain.ProjectDocument;
import br.com.ampere.error.BusinessException;
import br.com.ampere.error.NotFoundException;
import br.com.ampere.repository.ProjectDocumentRepository;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ProjectDocumentService {

  private static final String NOT_FOUND = "Documento não encontrado.";
  private static final String SUBMITTED =
      "Os documentos de um projeto enviado para análise não podem ser alterados.";

  private final ProjectService projectService;
  private final ProjectDocumentRepository documentRepository;

  public ProjectDocumentService(
      ProjectService projectService, ProjectDocumentRepository documentRepository) {
    this.projectService = projectService;
    this.documentRepository = documentRepository;
  }

  @Transactional(readOnly = true)
  public List<ProjectDocument> listByProject(Long projectId) {
    projectService.findById(projectId);

    return documentRepository.findAllByProjectIdOrderByType(projectId);
  }

  @Transactional
  public ProjectDocument upload(
      Long projectId, DocumentType type, String originalFilename, byte[] content) {
    Project project = editableOrFail(projectId);
    if (!ProjectDocument.isPdf(content)) {
      throw new BusinessException("Envie o documento em PDF.");
    }

    String filename =
        originalFilename == null || originalFilename.isBlank()
            ? type.name().toLowerCase() + ".pdf"
            : originalFilename;

    // Replaced in place: Hibernate flushes inserts before deletes and would break the unique key.
    return documentRepository
        .findByProjectIdAndType(projectId, type)
        .map(
            document -> {
              document.replace(filename, content);
              return document;
            })
        .orElseGet(
            () -> documentRepository.save(new ProjectDocument(project, type, filename, content)));
  }

  @Transactional
  public void delete(Long projectId, Long documentId) {
    editableOrFail(projectId);
    ProjectDocument document =
        documentRepository
            .findById(documentId)
            .filter(found -> found.belongsTo(projectId))
            .orElseThrow(() -> new NotFoundException(NOT_FOUND));

    documentRepository.delete(document);
  }

  private Project editableOrFail(Long projectId) {
    Project project = projectService.findById(projectId);
    if (!project.canBeSubmitted()) {
      throw new BusinessException(SUBMITTED, HttpStatus.CONFLICT);
    }

    return project;
  }
}
