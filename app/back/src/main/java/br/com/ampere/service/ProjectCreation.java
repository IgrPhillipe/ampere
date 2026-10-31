package br.com.ampere.service;

import br.com.ampere.domain.BuildingType;
import br.com.ampere.domain.Project;
import br.com.ampere.domain.User;
import br.com.ampere.domain.UserRole;
import br.com.ampere.error.BusinessException;
import br.com.ampere.error.NotFoundException;
import br.com.ampere.repository.ProjectRepository;
import br.com.ampere.repository.UserRepository;
import br.com.ampere.utils.Protocols;
import java.time.LocalDate;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** One attempt at creating a project, in its own transaction. */
@Service
public class ProjectCreation {

  private final ProjectRepository projectRepository;
  private final ApplicableStandards applicableStandards;
  private final UserRepository userRepository;
  private final ProjectEventService eventService;

  public ProjectCreation(
      ProjectRepository projectRepository,
      ApplicableStandards applicableStandards,
      UserRepository userRepository,
      ProjectEventService eventService) {
    this.projectRepository = projectRepository;
    this.applicableStandards = applicableStandards;
    this.userRepository = userRepository;
    this.eventService = eventService;
  }

  /** The administrator creates in the name of an active designer; the designer, for themselves. */
  @Transactional(readOnly = true)
  public User ownerOf(Long requestedOwnerId, AuthenticatedUser user) {
    if (!user.isAdmin()) {
      return userRepository
          .findById(user.id())
          .orElseThrow(() -> new NotFoundException("Usuário autenticado não encontrado."));
    }
    if (requestedOwnerId == null) {
      throw new BusinessException("O projetista é obrigatório.", HttpStatus.BAD_REQUEST);
    }

    return userRepository
        .findById(requestedOwnerId)
        .filter(account -> account.isActive() && account.getRole() == UserRole.USER)
        .orElseThrow(
            () ->
                new BusinessException(
                    "O projetista informado não existe, está inativo ou não é projetista.",
                    HttpStatus.UNPROCESSABLE_CONTENT));
  }

  @Transactional
  public Project createWithGeneratedProtocol(ProjectParameters parameters, User owner) {
    String municipality = ProjectPlaces.municipalityOf(parameters);
    BuildingType buildingType = parameters.toBuildingType();
    int year = LocalDate.now().getYear();
    String protocol =
        Protocols.next(
            year,
            projectRepository.findHighestProtocolOfYear(Protocols.yearPrefix(year)).orElse(null));

    Project project =
        Project.draft(
            parameters.name(),
            parameters.address(),
            municipality,
            protocol,
            buildingType,
            applicableStandards.of(buildingType),
            owner);
    project.locate(parameters.postalCode(), parameters.state());

    Project created = projectRepository.saveAndFlush(project);
    eventService.created(created, owner);

    return created;
  }
}
