package br.com.ampere.service;

import br.com.ampere.domain.ConcessionArea;
import br.com.ampere.domain.ReviewerMunicipality;
import br.com.ampere.domain.User;
import br.com.ampere.error.BusinessException;
import br.com.ampere.error.NotFoundException;
import br.com.ampere.repository.ReviewerMunicipalityRepository;
import br.com.ampere.repository.UserRepository;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ReviewerMunicipalityService {

  private final ReviewerMunicipalityRepository municipalityRepository;
  private final UserRepository userRepository;
  private final ReviewQueueService reviewQueueService;

  public ReviewerMunicipalityService(
      ReviewerMunicipalityRepository municipalityRepository,
      UserRepository userRepository,
      ReviewQueueService reviewQueueService) {
    this.municipalityRepository = municipalityRepository;
    this.userRepository = userRepository;
    this.reviewQueueService = reviewQueueService;
  }

  @Transactional(readOnly = true)
  public List<ReviewerMunicipalities> list(AuthenticatedUser caller) {
    caller.requireAdmin();
    Map<Long, List<MunicipalityPlace>> placesByReviewer =
        municipalityRepository.findAllByOrderByStateAscMunicipalityAsc().stream()
            .collect(
                Collectors.groupingBy(
                    rule -> rule.getReviewer().getId(),
                    Collectors.mapping(ReviewerMunicipalityService::placeOf, Collectors.toList())));

    return reviewQueueService.reviewers(caller).stream()
        .map(
            reviewer ->
                new ReviewerMunicipalities(
                    reviewer, placesByReviewer.getOrDefault(reviewer.getId(), List.of())))
        .toList();
  }

  @Transactional
  public List<MunicipalityPlace> replace(
      Long reviewerId, List<MunicipalityPlace> requested, AuthenticatedUser caller) {
    caller.requireAdmin();
    User reviewer =
        userRepository
            .findById(reviewerId)
            .filter(user -> user.getRole().canReview())
            .orElseThrow(() -> new NotFoundException("Analista não encontrado."));
    if (!reviewer.isActive()) {
      throw new BusinessException(
          ReviewAssignmentService.INACTIVE_REVIEWER, HttpStatus.UNPROCESSABLE_CONTENT);
    }

    List<MunicipalityPlace> places =
        requested.stream()
            .map(ReviewerMunicipalityService::withinConcessionArea)
            .distinct()
            .toList();
    places.forEach(place -> takeFromFormerReviewer(place, reviewerId));
    municipalityRepository.deleteAllByReviewerId(reviewerId);
    municipalityRepository.flush();

    try {
      municipalityRepository.saveAllAndFlush(
          places.stream()
              .map(place -> new ReviewerMunicipality(reviewer, place.state(), place.municipality()))
              .toList());
    } catch (DataIntegrityViolationException race) {
      throw new BusinessException(
          "Um dos municípios acabou de ser atribuído a outro analista.", HttpStatus.CONFLICT);
    }

    return places;
  }

  /** A rule of someone who can no longer review would hold the municipality forever. */
  private void takeFromFormerReviewer(MunicipalityPlace place, Long reviewerId) {
    municipalityRepository
        .findByStateAndMunicipality(place.state(), place.municipality())
        .filter(rule -> !rule.getReviewer().getId().equals(reviewerId))
        .ifPresent(
            rule -> {
              if (rule.getReviewer().isActiveReviewer()) {
                throw new BusinessException(
                    "O município "
                        + place.municipality()
                        + " já pertence ao analista "
                        + rule.getReviewer().getName()
                        + ".",
                    HttpStatus.CONFLICT);
              }
              municipalityRepository.delete(rule);
            });
  }

  private static MunicipalityPlace withinConcessionArea(MunicipalityPlace place) {
    return ConcessionArea.municipalityOf(place.state(), place.municipality())
        .map(municipality -> new MunicipalityPlace(place.state(), municipality))
        .orElseThrow(
            () ->
                new BusinessException(
                    "Município fora da área de concessão: "
                        + place.municipality()
                        + " ("
                        + place.state()
                        + ").",
                    HttpStatus.BAD_REQUEST));
  }

  private static MunicipalityPlace placeOf(ReviewerMunicipality rule) {
    return new MunicipalityPlace(rule.getState(), rule.getMunicipality());
  }
}
