package br.com.ampere.dto;

import br.com.ampere.domain.FindingStage;
import br.com.ampere.domain.Project;
import br.com.ampere.domain.ProjectStatus;
import br.com.ampere.service.DesignerDashboard;
import br.com.ampere.service.DesignerIndicators;
import io.swagger.v3.oas.annotations.media.Schema;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;

public record DesignerDashboardResponse(
    @Schema(description = "O projetista já enviou algum projeto para análise")
        boolean hasSubmissions,
    @Schema(description = "Todos os reprovados e os rascunhos parados")
        List<ActionItemResponse> actionRequired,
    @Schema(description = "Projetos em análise, do prazo mais curto ao mais longo")
        List<ReviewItemResponse> underReview,
    IndicatorsResponse indicators,
    @Schema(description = "Apontamentos mais recebidos no período, por etapa e item da norma")
        List<FindingRankResponse> findingsRanking) {

  public static DesignerDashboardResponse from(DesignerDashboard dashboard) {
    return new DesignerDashboardResponse(
        dashboard.hasSubmissions(),
        dashboard.actionRequired().stream().map(ActionItemResponse::from).toList(),
        dashboard.underReview().stream().map(ReviewItemResponse::from).toList(),
        IndicatorsResponse.from(dashboard.indicators()),
        dashboard.findingsRanking().stream().map(FindingRankResponse::from).toList());
  }

  public record ActionItemResponse(
      String id,
      String name,
      String protocol,
      ProjectStatus status,
      @Schema(description = "Bloqueantes em aberto; 0 em rascunho ou reprovado sem bloqueante")
          long blockingFindings,
      @Schema(description = "Dias sem movimentação do rascunho; nulo para reprovado") Long idleDays,
      @Schema(description = "Número do envio para análise; 0 em rascunho nunca enviado")
          int version,
      long consumerUnits,
      @Schema(description = "Data da reprovação; nula para rascunho") OffsetDateTime rejectedAt,
      @Schema(
              description =
                  "Primeira etapa incompleta do rascunho; nula para reprovado ou rascunho completo")
          FindingStage pendingStage) {

    static ActionItemResponse from(DesignerDashboard.ActionItem item) {
      Project project = item.project();
      return new ActionItemResponse(
          String.valueOf(project.getId()),
          project.getName(),
          project.getProtocol(),
          project.getStatus(),
          item.blockingFindings(),
          item.idleDays(),
          project.getReviewCycle(),
          item.consumerUnits(),
          project.isRejected() ? project.getReviewedAt() : null,
          item.pendingStage());
    }
  }

  public record ReviewItemResponse(
      String id,
      String name,
      String protocol,
      @Schema(description = "Número do envio para análise; acima de 1 é reanálise") int version,
      LocalDate deadline,
      @Schema(description = "Negativo quando o prazo já passou") long daysRemaining) {

    static ReviewItemResponse from(DesignerDashboard.ReviewItem item) {
      return new ReviewItemResponse(
          String.valueOf(item.project().getId()),
          item.project().getName(),
          item.project().getProtocol(),
          item.project().getReviewCycle(),
          item.deadline(),
          item.daysRemaining());
    }
  }

  public record IndicatorsResponse(
      @Schema(description = "Projetos enviados pela primeira vez no período") long submitted,
      @Schema(
              description =
                  "Aprovados na primeira análise, de 0 a 100; nulo sem decisões no período")
          BigDecimal firstReviewApprovalPercent,
      @Schema(description = "Dias do primeiro envio à aprovação; nulo sem aprovações")
          BigDecimal averageDaysToApproval,
      @Schema(description = "Demanda total dos projetos aprovados no período, em kVA")
          BigDecimal approvedDemand) {

    static IndicatorsResponse from(DesignerIndicators indicators) {
      return new IndicatorsResponse(
          indicators.submitted(),
          indicators.firstReviewApprovalPercent(),
          indicators.averageDaysToApproval(),
          indicators.approvedDemand());
    }
  }

  public record FindingRankResponse(FindingStage stage, String standardItem, long total) {

    static FindingRankResponse from(DesignerDashboard.FindingRank rank) {
      return new FindingRankResponse(rank.stage(), rank.standardItem(), rank.total());
    }
  }
}
