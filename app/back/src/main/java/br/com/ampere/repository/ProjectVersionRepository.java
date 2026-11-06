package br.com.ampere.repository;

import br.com.ampere.domain.ProjectVersion;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ProjectVersionRepository extends JpaRepository<ProjectVersion, Long> {

  @Query(
      """
      SELECT version FROM ProjectVersion version
      LEFT JOIN FETCH version.author
      JOIN FETCH version.calculation
      JOIN FETCH version.project
      WHERE version.project.id = :projectId
      ORDER BY version.number
      """)
  List<ProjectVersion> findAllByProjectId(@Param("projectId") Long projectId);

  @Query(
      """
      SELECT version FROM ProjectVersion version
      LEFT JOIN FETCH version.author
      JOIN FETCH version.calculation
      JOIN FETCH version.project
      WHERE version.project.id = :projectId AND version.number = :number
      """)
  Optional<ProjectVersion> findByProjectIdAndNumber(
      @Param("projectId") Long projectId, @Param("number") int number);

  @Query(
      """
      SELECT version FROM ProjectVersion version
      JOIN FETCH version.project
      WHERE version.project.id = :projectId
      ORDER BY version.number DESC
      LIMIT 1
      """)
  Optional<ProjectVersion> findLatestByProjectId(@Param("projectId") Long projectId);

  @Query(
      """
      SELECT version FROM ProjectVersion version
      JOIN FETCH version.project
      WHERE version.verificationCode = :code
      """)
  Optional<ProjectVersion> findByVerificationCode(@Param("code") String code);

  @Query(
      """
      SELECT version FROM ProjectVersion version
      JOIN FETCH version.project
      WHERE version.memorialSha256 = :sha256
      """)
  Optional<ProjectVersion> findByMemorialSha256(@Param("sha256") String sha256);
}
