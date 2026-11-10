package br.com.ampere.repository;

import br.com.ampere.domain.BrazilianState;
import br.com.ampere.domain.ReviewerMunicipality;
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

  @org.springframework.data.jpa.repository.Query(
      """
      SELECT COUNT(DISTINCT CONCAT(rm.state, ':', rm.municipality))
      FROM ReviewerMunicipality rm
      WHERE rm.reviewer.active = true
      """)
  long countDistinctServedMunicipalities();

  void deleteAllByReviewerId(Long reviewerId);
}
