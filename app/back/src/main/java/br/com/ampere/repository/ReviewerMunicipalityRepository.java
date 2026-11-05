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
  List<ReviewerMunicipality> findAllByReviewerIdOrderByStateAscMunicipalityAsc(Long reviewerId);

  @EntityGraph(attributePaths = {"reviewer"})
  Optional<ReviewerMunicipality> findByStateAndMunicipality(
      BrazilianState state, String municipality);

  void deleteAllByReviewerId(Long reviewerId);
}
