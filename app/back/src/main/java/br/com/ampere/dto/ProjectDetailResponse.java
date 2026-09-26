package br.com.ampere.dto;

import br.com.ampere.domain.BuildingCategory;
import br.com.ampere.domain.BuildingType;
import br.com.ampere.domain.ConnectionType;
import br.com.ampere.domain.EntranceStandard;
import br.com.ampere.domain.Project;
import br.com.ampere.domain.ProjectStatus;
import br.com.ampere.domain.StandardName;
import br.com.ampere.domain.SupplyVoltage;
import java.time.OffsetDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

/** A project with the technical parameters and the standards it is calculated under. */
public record ProjectDetailResponse(
    String id,
    String name,
    String address,
    String municipality,
    String protocol,
    ProjectStatus status,
    OffsetDateTime createdAt,
    OffsetDateTime updatedAt,
    BuildingCategory buildingType,
    Integer floors,
    SupplyVoltage voltage,
    ConnectionType connectionType,
    EntranceStandard entranceStandard,
    List<StandardResponse> standards,
    String applicableStandards,
    List<DemandRuleResponse> demandRules) {

  public static ProjectDetailResponse from(Project project) {
    BuildingType buildingType = project.getBuildingType();
    List<StandardResponse> standards =
        project.getStandards().stream()
            .map(StandardResponse::from)
            .sorted(Comparator.comparing(standard -> StandardName.of(standard.name())))
            .toList();

    return new ProjectDetailResponse(
        String.valueOf(project.getId()),
        project.getName(),
        project.getAddress(),
        project.getMunicipality(),
        project.getProtocol(),
        project.getStatus(),
        project.getCreatedAt(),
        project.getUpdatedAt(),
        buildingType.category(),
        buildingType.getFloors(),
        buildingType.getVoltage(),
        buildingType.getConnectionType(),
        buildingType.getEntranceStandard(),
        standards,
        standards.stream().map(StandardResponse::label).collect(Collectors.joining(" e ")),
        buildingType.demandRules().stream().map(DemandRuleResponse::from).toList());
  }
}
