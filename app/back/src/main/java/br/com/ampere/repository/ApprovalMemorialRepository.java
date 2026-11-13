package br.com.ampere.repository;

import br.com.ampere.domain.ApprovalMemorial;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ApprovalMemorialRepository extends JpaRepository<ApprovalMemorial, Long> {

  @Query(
      """
      SELECT approval FROM ApprovalMemorial approval
      JOIN FETCH approval.memorial
      WHERE approval.version.id = :versionId
      """)
  Optional<ApprovalMemorial> findByVersionId(@Param("versionId") Long versionId);

  @Query(
      """
      SELECT approval FROM ApprovalMemorial approval
      JOIN FETCH approval.version version
      JOIN FETCH version.project
      WHERE approval.verificationCode = :code
      """)
  Optional<ApprovalMemorial> findByVerificationCode(@Param("code") String code);

  @Query(
      """
      SELECT approval FROM ApprovalMemorial approval
      JOIN FETCH approval.version version
      JOIN FETCH version.project
      WHERE approval.memorialSha256 = :sha256
      """)
  Optional<ApprovalMemorial> findByMemorialSha256(@Param("sha256") String sha256);

  /** Without the PDF: the version list only names the approval memorial. */
  List<ApprovalMemorial> findAllByVersionIdIn(Collection<Long> versionIds);

  void deleteAllByVersionProjectId(Long projectId);
}
