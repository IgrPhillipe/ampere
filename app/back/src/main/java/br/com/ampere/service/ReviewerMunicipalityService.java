package br.com.ampere.service;

import br.com.ampere.domain.ConcessionArea;
import br.com.ampere.domain.Finding;
import br.com.ampere.domain.Project;
import br.com.ampere.domain.ReviewerMunicipality;
import br.com.ampere.domain.User;
import br.com.ampere.dto.MunicipalityAssignmentDto;
import br.com.ampere.dto.ReviewerMunicipalityItemResponse;
import br.com.ampere.dto.UserOptionResponse;
import br.com.ampere.error.BusinessException;
import br.com.ampere.error.NotFoundException;
import br.com.ampere.repository.FindingRepository;
import br.com.ampere.repository.ProjectRepository;
import br.com.ampere.repository.ReviewerMunicipalityRepository;
import br.com.ampere.repository.UserRepository;
import br.com.ampere.utils.Timestamps;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ReviewerMunicipalityService {

  private final ReviewerMunicipalityRepository municipalityRepository;
  private final UserRepository userRepository;
  private final ProjectRepository projectRepository;
  private final FindingRepository findingRepository;
  private final ProjectEventService eventService;

  public ReviewerMunicipalityService(
      ReviewerMunicipalityRepository municipalityRepository,
      UserRepository userRepository,
      ProjectRepository projectRepository,
      FindingRepository findingRepository,
      ProjectEventService eventService) {
    this.municipalityRepository = municipalityRepository;
    this.userRepository = userRepository;
    this.projectRepository = projectRepository;
    this.findingRepository = findingRepository;
    this.eventService = eventService;
  }

  @Transactional(readOnly = true)
  public List<ReviewerMunicipalityItemResponse> listReviewersWithMunicipalities(AuthenticatedUser caller) {
    caller.requireAdmin();
    List<User> activeReviewers = userRepository.findAllByRoleInAndActiveTrueOrderByNameAsc(UserAdministrationService.REVIEWING_ROLES);
    List<ReviewerMunicipality> allMunicipalities = municipalityRepository.findAllByOrderByStateAscMunicipalityAsc();

    Map<Long, List<MunicipalityAssignmentDto>> byReviewer = new LinkedHashMap<>();
    for (User reviewer : activeReviewers) {
      byReviewer.put(reviewer.getId(), new ArrayList<>());
    }

    for (ReviewerMunicipality rm : allMunicipalities) {
      List<MunicipalityAssignmentDto> list = byReviewer.get(rm.getReviewer().getId());
      if (list != null) {
        list.add(new MunicipalityAssignmentDto(rm.getState(), rm.getMunicipality()));
      }
    }

    return activeReviewers.stream()
        .map(
            r ->
                new ReviewerMunicipalityItemResponse(
                    UserOptionResponse.from(r), byReviewer.getOrDefault(r.getId(), List.of())))
        .toList();
  }

  @Transactional
  public List<MunicipalityAssignmentDto> updateMunicipalities(
      Long reviewerId, List<MunicipalityAssignmentDto> requested, AuthenticatedUser caller) {
    caller.requireAdmin();

    User reviewer =
        userRepository
            .findById(reviewerId)
            .orElseThrow(() -> new NotFoundException("Analista não encontrado."));

    if (!reviewer.getRole().canReview()) {
      throw new NotFoundException("Analista não encontrado.");
    }

    if (!reviewer.isActive()) {
      throw new BusinessException("Analista inativo.", HttpStatus.UNPROCESSABLE_CONTENT);
    }

    List<MunicipalityAssignmentDto> normalizedList = new ArrayList<>();
    Set<String> seenInRequest = new HashSet<>();

    for (MunicipalityAssignmentDto item : requested) {
      Optional<String> canonicalName =
          ConcessionArea.municipalityOf(item.state(), item.municipality());
      if (canonicalName.isEmpty()) {
        throw new BusinessException(
            "Município fora da área de concessão: " + item.municipality() + " (" + item.state() + ").",
            HttpStatus.BAD_REQUEST);
      }
      String canonical = canonicalName.get();
      String key = item.state().name() + ":" + canonical.toLowerCase();
      if (!seenInRequest.add(key)) {
        continue;
      }

      Optional<ReviewerMunicipality> existing =
          municipalityRepository.findByStateAndMunicipality(item.state(), canonical);
      if (existing.isPresent() && !existing.get().getReviewer().getId().equals(reviewerId)) {
        throw new BusinessException(
            "O município "
                + canonical
                + " já pertence ao analista "
                + existing.get().getReviewer().getName()
                + ".",
            HttpStatus.CONFLICT);
      }

      normalizedList.add(new MunicipalityAssignmentDto(item.state(), canonical));
    }

    municipalityRepository.deleteAllByReviewerId(reviewerId);
    municipalityRepository.flush();

    for (MunicipalityAssignmentDto item : normalizedList) {
      municipalityRepository.save(new ReviewerMunicipality(reviewer, item.state(), item.municipality()));
    }

    return normalizedList;
  }

  @Transactional
  public void assignBatch(List<String> projectIds, String reviewerIdStr, AuthenticatedUser caller) {
    caller.requireAdmin();

    Long reviewerId;
    try {
      reviewerId = Long.valueOf(reviewerIdStr);
    } catch (NumberFormatException e) {
      throw new NotFoundException("Analista não encontrado.");
    }

    User reviewer =
        userRepository
            .findById(reviewerId)
            .orElseThrow(() -> new NotFoundException("Analista não encontrado."));

    if (!reviewer.getRole().canReview()) {
      throw new BusinessException("Papel de usuário inválido.", HttpStatus.UNPROCESSABLE_CONTENT);
    }

    if (!reviewer.isActive()) {
      throw new BusinessException("Analista inativo.", HttpStatus.UNPROCESSABLE_CONTENT);
    }

    List<Long> ids = new ArrayList<>();
    for (String idStr : projectIds) {
      try {
        ids.add(Long.valueOf(idStr));
      } catch (NumberFormatException e) {
        throw new NotFoundException("Projeto não encontrado.");
      }
    }

    List<Project> projects = new ArrayList<>();
    for (Long id : ids) {
      projectRepository.lockById(id);
      Project project =
          projectRepository
              .findById(id)
              .orElseThrow(() -> new NotFoundException("Projeto não encontrado."));
      if (!project.isUnderReview()) {
        throw new BusinessException("O projeto não está em análise.", HttpStatus.CONFLICT);
      }
      projects.add(project);
    }

    User adminUser =
        userRepository
            .findById(caller.id())
            .orElseThrow(() -> new NotFoundException("Usuário administrador não encontrado."));
    OffsetDateTime now = Timestamps.now();

    for (Project project : projects) {
      project.assignReviewer(reviewer);
      eventService.assigned(project, adminUser, now);

      List<Finding> findings =
          findingRepository.findAllByProjectIdOrderByCreatedAtAscIdAsc(project.getId());
      for (Finding finding : findings) {
        if (finding.isDraft()) {
          finding.changeAuthor(reviewer);
        }
      }
    }
  }

  @Transactional
  public void distributeSubmission(Project project, OffsetDateTime submittedAt) {
    if (project.getReviewCycle() > 1) {
      User previousReviewer = project.getReviewer();
      if (previousReviewer != null && previousReviewer.isActive()) {
        eventService.assigned(project, null, submittedAt);
        return;
      }
      project.clearReviewer();
    }

    Optional<ReviewerMunicipality> match =
        municipalityRepository.findByStateAndMunicipality(project.getState(), project.getMunicipality());
    if (match.isPresent()) {
      User reviewer = match.get().getReviewer();
      if (reviewer.isActive()) {
        project.assignReviewer(reviewer);
        eventService.assigned(project, null, submittedAt);
        return;
      }
    }

    project.clearReviewer();
  }
}
