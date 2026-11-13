package br.com.ampere.dto;

import br.com.ampere.domain.BrazilianState;
import br.com.ampere.domain.BuildingCategory;
import br.com.ampere.domain.BuildingType;
import br.com.ampere.domain.ConnectionType;
import br.com.ampere.domain.DeadlineStatus;
import br.com.ampere.domain.EntranceStandard;
import br.com.ampere.domain.Project;
import br.com.ampere.domain.ProjectStatus;
import br.com.ampere.domain.ReviewDeadline;
import br.com.ampere.domain.StandardName;
import br.com.ampere.domain.SupplyVoltage;
import br.com.ampere.domain.User;
import br.com.ampere.service.ProjectSummary;
import io.swagger.v3.oas.annotations.media.Schema;
import java.math.BigDecimal;
import java.time.LocalDate;
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
    String ownerId,
    String ownerName,
    @Schema(description = "Analista responsável; nulo quando o projeto não tem analista")
        String reviewerId,
    String reviewerName,
    @Schema(description = "Último dia do prazo de análise; nulo fora da análise")
        LocalDate reviewDeadline,
    @Schema(description = "Situação do prazo de análise; nula fora da análise")
        DeadlineStatus deadlineStatus,
    @Schema(description = "Dias até o prazo de análise, negativo se vencido; nulo fora da análise")
        Long daysRemaining,
    OffsetDateTime reviewedAt,
    int reviewCycle,
    @Schema(description = "Apontamentos OPEN ou CONTESTED; zero em projeto aprovado")
        long openFindingsCount,
    long consumerUnitsCount,
    @Schema(description = "Demanda do último cálculo; nula sem cálculo") BigDecimal demandKva,
    @Schema(description = "Data do último evento do histórico; sem eventos, updatedAt")
        OffsetDateTime lastActivityAt,
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

  public static ProjectDetailResponse from(ProjectSummary summary) {
    Project project = summary.project();
    BuildingType buildingType = project.getBuildingType();
    List<StandardResponse> standards =
        project.getStandards().stream()
            .map(StandardResponse::from)
            .sorted(Comparator.comparing(standard -> StandardName.of(standard.name())))
            .toList();
    ReviewDeadline reviewDeadline = summary.reviewDeadline();

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
        project.getOwner() == null ? null : String.valueOf(project.getOwner().getId()),
        nameOf(project.getOwner()),
        idOf(project.getReviewer()),
        nameOf(project.getReviewer()),
        reviewDeadline == null ? null : reviewDeadline.date(),
        reviewDeadline == null ? null : reviewDeadline.status(),
        reviewDeadline == null ? null : reviewDeadline.daysRemaining(),
        project.getReviewedAt(),
        project.getReviewCycle(),
        summary.openFindingsCount(),
        summary.consumerUnitsCount(),
        summary.demandKva(),
        summary.lastActivityAt(),
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

  private static String idOf(User user) {
    return user == null ? null : String.valueOf(user.getId());
  }

  private static String nameOf(User user) {
    return user == null ? null : user.getName();
  }
}
