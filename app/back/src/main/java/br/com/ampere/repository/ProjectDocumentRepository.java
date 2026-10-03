package br.com.ampere.repository;

import br.com.ampere.domain.DocumentType;
import br.com.ampere.domain.ProjectDocument;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 * Repositorio dos documentos PDF anexados a um projeto.
 *
 * <p>Principais consultas: listar por projeto, buscar por projeto+tipo, e verificar quais tipos ja
 * foram enviados (usado pelo checklist de submissao).
 */
public interface ProjectDocumentRepository extends JpaRepository<ProjectDocument, Long> {

  // Lista todos os documentos de um projeto, ordenados por data de upload.
  List<ProjectDocument> findAllByProjectIdOrderByUploadedAtDesc(Long projectId);

  // Busca documento especifico por projeto e tipo (ex: ART do projeto 5).
  Optional<ProjectDocument> findByProjectIdAndType(Long projectId, DocumentType type);

  // Conta quantos documentos de cada tipo existem para um projeto.
  // Usado pelo checklist para verificar se todos os tipos obrigatorios foram enviados.
  long countByProjectId(Long projectId);

  // Remove todos os documentos de um projeto (usado ao excluir o projeto).
  void deleteAllByProjectId(Long projectId);
}
