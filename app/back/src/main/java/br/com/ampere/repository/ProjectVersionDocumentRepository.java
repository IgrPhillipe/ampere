package br.com.ampere.repository;

import br.com.ampere.domain.DocumentType;
import br.com.ampere.domain.ProjectVersionDocument;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ProjectVersionDocumentRepository
    extends JpaRepository<ProjectVersionDocument, Long> {

  void deleteAllByVersionProjectId(Long projectId);

  Optional<ProjectVersionDocument> findByVersionProjectIdAndVersionNumberAndType(
      Long projectId, int number, DocumentType type);

  /** Without the file bytes, which a listing never needs. */
  @Query(
      """
      SELECT document.version.id AS versionId, document.type AS type,
             document.filename AS filename, document.fileSize AS fileSize
      FROM ProjectVersionDocument document
      WHERE document.version.id IN :versionIds
      ORDER BY document.type
      """)
  List<Summary> findSummaries(@Param("versionIds") Collection<Long> versionIds);

  interface Summary {

    Long getVersionId();

    DocumentType getType();

    String getFilename();

    Long getFileSize();
  }
}
