package br.com.ampere.service;

import br.com.ampere.domain.BuildingType;
import br.com.ampere.domain.Mixed;
import br.com.ampere.domain.NonResidential;
import br.com.ampere.domain.Project;
import br.com.ampere.domain.ResidentialMultifamily;
import br.com.ampere.domain.Standard;
import br.com.ampere.dto.ProjectRequest;
import br.com.ampere.error.BusinessException;
import br.com.ampere.repository.ProjectRepository;
import br.com.ampere.repository.StandardRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

@Service
public class ProjectService {

  private final ProjectRepository projectRepository;
  private final StandardRepository standardRepository;

  public ProjectService(
      ProjectRepository projectRepository, StandardRepository standardRepository) {
    this.projectRepository = projectRepository;
    this.standardRepository = standardRepository;
  }

  public Project createProject(ProjectRequest request) {
    BuildingType buildingType = createBuildingType(request);

    String standardName = buildingType.applicableStandard();

    Standard standard =
        standardRepository
            .findByName(standardName)
            .orElseThrow(
                () ->
                    new BusinessException(
                        "Norma " + standardName + " não encontrada no sistema",
                        HttpStatus.INTERNAL_SERVER_ERROR));

    Project project = new Project(request.getName(), buildingType, standard);

    return projectRepository.save(project);
  }

  private BuildingType createBuildingType(ProjectRequest request) {
    String type = request.getType();
    Double voltage = request.getVoltage();
    String entranceStandard = request.getEntranceStandard();

    if ("RESIDENTIAL_MULTIFAMILY".equalsIgnoreCase(type)) {
      return new ResidentialMultifamily(voltage, entranceStandard);
    }
    if ("NON_RESIDENTIAL".equalsIgnoreCase(type)) {
      return new NonResidential(voltage, entranceStandard);
    }
    if ("MIXED".equalsIgnoreCase(type)) {
      return new Mixed(voltage, entranceStandard);
    }

    throw new BusinessException("Tipo de edificação inválido", HttpStatus.BAD_REQUEST);
  }
}
