package br.com.ampere.service;

import br.com.ampere.domain.BuildingType;
import br.com.ampere.domain.Project;
import br.com.ampere.domain.User;
import br.com.ampere.error.NotFoundException;
import br.com.ampere.repository.ProjectRepository;
import br.com.ampere.repository.UserRepository;
import br.com.ampere.utils.Protocols;
import java.time.LocalDate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** One attempt at creating a project, in its own transaction. */
@Service
public class ProjectCreation {

  private final ProjectRepository projectRepository;
  private final ApplicableStandards applicableStandards;
  private final UserRepository userRepository;

  public ProjectCreation(
      ProjectRepository projectRepository,
      ApplicableStandards applicableStandards,
      UserRepository userRepository) {
    this.projectRepository = projectRepository;
    this.applicableStandards = applicableStandards;
    this.userRepository = userRepository;
  }

  @Transactional
  public Project createWithGeneratedProtocol(ProjectParameters parameters, String ownerEmail) {
    User owner =
        ownerEmail == null
            ? null
            : userRepository
                .findByEmail(User.normalizeEmail(ownerEmail))
                .orElseThrow(() -> new NotFoundException("Usuário autenticado não encontrado."));
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
            parameters.municipality(),
            protocol,
            buildingType,
            applicableStandards.of(buildingType),
            owner);

    return projectRepository.saveAndFlush(project);
  }
}
