package br.com.ampere.dto;

import br.com.ampere.domain.Project;

public class ProjectResponse {

  private Long id;
  private String name;
  private String buildingType;
  private String standardName;

  public ProjectResponse(Project project) {
    this.id = project.getId();
    this.name = project.getName();
    this.buildingType = project.getBuildingType().getClass().getSimpleName();
    if (project.getStandard() != null) {
      this.standardName = project.getStandard().getName();
    }
  }

  public Long getId() {
    return id;
  }

  public String getName() {
    return name;
  }

  public String getBuildingType() {
    return buildingType;
  }

  public String getStandardName() {
    return standardName;
  }
}
