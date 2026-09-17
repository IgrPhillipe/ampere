package br.com.ampere.repository;

import br.com.ampere.domain.Finding;
import org.springframework.data.jpa.repository.JpaRepository;

/** Database access for project findings. */
public interface FindingRepository extends JpaRepository<Finding, Long> {

  long countByProjectId(Long projectId);
}
