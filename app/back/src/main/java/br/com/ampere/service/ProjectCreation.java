package br.com.ampere.service;

import br.com.ampere.domain.BuildingType;
import br.com.ampere.domain.Project;
import br.com.ampere.repository.ProjectRepository;
import br.com.ampere.utils.Protocols;
import java.time.LocalDate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * One attempt at creating a project, in its own transaction.
 *
 * <p>Separate bean because Spring only applies {@code @Transactional} across beans: called from
 * inside {@link ProjectService}, every retry would land in the transaction the collision already
 * invalidated.
 */
@Service
public class ProjectCreation {

  private final ProjectRepository projectRepository;
  private final ApplicableStandards applicableStandards;

  public ProjectCreation(
      ProjectRepository projectRepository, ApplicableStandards applicableStandards) {
    this.projectRepository = projectRepository;
    this.applicableStandards = applicableStandards;
  }

  @Transactional
  public Project createWithGeneratedProtocol(ProjectParameters parameters) {
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
            applicableStandards.of(buildingType));

    return projectRepository.saveAndFlush(project);
  }
}
