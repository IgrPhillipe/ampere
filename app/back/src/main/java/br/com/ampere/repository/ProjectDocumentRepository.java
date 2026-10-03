package br.com.ampere.repository;

import br.com.ampere.domain.DocumentType;
import br.com.ampere.domain.ProjectDocument;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProjectDocumentRepository extends JpaRepository<ProjectDocument, Long> {

  List<ProjectDocument> findAllByProjectIdOrderByType(Long projectId);

  Optional<ProjectDocument> findByProjectIdAndType(Long projectId, DocumentType type);

  void deleteAllByProjectId(Long projectId);
}
