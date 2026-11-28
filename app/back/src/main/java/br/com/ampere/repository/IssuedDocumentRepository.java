package br.com.ampere.repository;

import br.com.ampere.domain.IssuedDocument;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface IssuedDocumentRepository extends JpaRepository<IssuedDocument, Long> {

  /** Lifts ProjectVersionGuard for the rest of the transaction, as the version cleanup does. */
  @Query(value = "SELECT set_config('ampere.version_cleanup', 'on', true)", nativeQuery = true)
  String allowCleanup();

  @Query(
      """
      SELECT document FROM IssuedDocument document
      JOIN FETCH document.project
      LEFT JOIN FETCH document.version
      WHERE document.sha256 = :sha256
      """)
  Optional<IssuedDocument> findBySha256(@Param("sha256") String sha256);

  @Query(
      """
      SELECT document FROM IssuedDocument document
      JOIN FETCH document.project
      LEFT JOIN FETCH document.version
      WHERE document.verificationCode = :code
      """)
  Optional<IssuedDocument> findByVerificationCode(@Param("code") String code);

  boolean existsByVerificationCode(String code);

  boolean existsBySignerCertificateSha256(String signerCertificateSha256);
}
