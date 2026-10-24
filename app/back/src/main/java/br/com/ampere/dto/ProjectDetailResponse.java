package br.com.ampere.dto;

import br.com.ampere.domain.BrazilianState;
import br.com.ampere.domain.BuildingCategory;
import br.com.ampere.domain.BuildingType;
import br.com.ampere.domain.ConnectionType;
import br.com.ampere.domain.EntranceStandard;
import br.com.ampere.domain.Project;
import br.com.ampere.domain.ProjectStatus;
import br.com.ampere.domain.StandardName;
import br.com.ampere.domain.SupplyVoltage;
import br.com.ampere.domain.User;
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
    BrazilianState state,
    String postalCode,
    String protocol,
    ProjectStatus status,
    OffsetDateTime createdAt,
    OffsetDateTime updatedAt,
    OffsetDateTime submittedAt,
    String ownerName,
    String reviewerName,
    int reviewCycle,
    String reviewOpinion,
    String changeSummary,
    BuildingCategory buildingType,
    Integer floors,
    SupplyVoltage voltage,
    ConnectionType connectionType,
    EntranceStandard entranceStandard,
    List<StandardResponse> standards,
    String applicableStandards,
    List<DemandRuleResponse> demandRules,
    TechnicalResponsibleResponse technicalResponsible) {

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
        project.getState(),
        project.getPostalCode(),
        project.getProtocol(),
        project.getStatus(),
        project.getCreatedAt(),
        project.getUpdatedAt(),
        project.getSubmittedAt(),
        nameOf(project.getOwner()),
        nameOf(project.getReviewer()),
        project.getReviewCycle(),
        project.getReviewOpinion(),
        project.getChangeSummary(),
        buildingType.category(),
        buildingType.getFloors(),
        buildingType.getVoltage(),
        buildingType.getConnectionType(),
        buildingType.getEntranceStandard(),
        standards,
        standards.stream().map(StandardResponse::label).collect(Collectors.joining(" e ")),
        buildingType.demandRules().stream().map(DemandRuleResponse::from).toList(),
        TechnicalResponsibleResponse.of(project.getOwner()));
  }

  private static String nameOf(User user) {
    return user == null ? null : user.getName();
  }
}
