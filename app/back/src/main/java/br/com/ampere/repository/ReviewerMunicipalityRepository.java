package br.com.ampere.repository;

import br.com.ampere.domain.BrazilianState;
import br.com.ampere.domain.ReviewerMunicipality;
import br.com.ampere.domain.UserRole;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ReviewerMunicipalityRepository extends JpaRepository<ReviewerMunicipality, Long> {

  @EntityGraph(attributePaths = {"reviewer"})
  List<ReviewerMunicipality> findAllByOrderByStateAscMunicipalityAsc();

  @EntityGraph(attributePaths = {"reviewer"})
  Optional<ReviewerMunicipality> findByStateAndMunicipality(
      BrazilianState state, String municipality);

  long countByReviewerActiveTrueAndReviewerRoleIn(Collection<UserRole> roles);

  void deleteAllByReviewerId(Long reviewerId);
}
