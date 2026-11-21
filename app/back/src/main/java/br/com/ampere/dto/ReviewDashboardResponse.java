package br.com.ampere.dto;

import br.com.ampere.domain.BrazilianState;
import br.com.ampere.domain.BuildingCategory;
import br.com.ampere.domain.FindingStage;
import io.swagger.v3.oas.annotations.media.Schema;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public record ReviewDashboardResponse(
    TotalsResponse totals,
    @Schema(description = "Dias do envio ou reenvio até a decisão; nulo sem decisões no período")
        BigDecimal averageReviewDays,
    @Schema(description = "Dias do primeiro envio até a aprovação; nulo sem aprovações no período")
        BigDecimal averageCycleDays,
    @Schema(description = "Cada semana que toca o período, da mais antiga à mais recente")
        List<WeekResponse> weekly,
    @Schema(description = "Cada mês que toca o período, do mais antigo ao mais recente")
        List<MonthResponse> monthlyRejection,
    DeadlinesResponse deadlines,
    @Schema(
            description =
                "Os 10 apontamentos mais frequentes no período, por etapa e item da norma")
        List<FindingRankResponse> findingsRanking,
    @Schema(description = "Os 5 municípios com mais projetos recebidos no período")
        List<MunicipalityResponse> municipalities,
    @Schema(description = "Projetos com mais de uma reprovação, a última no período")
        List<RepeatedRejectionResponse> repeatedRejections,
    @Schema(description = "Projetos recebidos no período por categoria, só as que têm projeto")
        List<CategoryAlertsResponse> alertsByCategory) {

  public record TotalsResponse(
      @Schema(description = "Projetos enviados ou reenviados no período") long received,
      @Schema(description = "Projetos aprovados no período") long approved,
      @Schema(description = "Projetos reprovados no período") long rejected,
      @Schema(description = "Projetos em análise hoje, sem período") long underReview) {}

  public record WeekResponse(
      @Schema(description = "Segunda-feira da semana") LocalDate weekStart,
      @Schema(description = "Envios e reenvios da semana") long received,
      @Schema(description = "Aprovações e reprovações da semana") long decided) {}

  public record MonthResponse(
      @Schema(description = "Mês em YYYY-MM") String month,
      @Schema(description = "Reprovações sobre decisões, de 0 a 100; nulo sem decisões no mês")
          BigDecimal rejectionPercent) {}

  public record DeadlinesResponse(
      @Schema(description = "Decisões no período tomadas dentro do prazo") long met,
      @Schema(description = "Decisões no período tomadas depois do prazo") long overdue) {}

  public record ProjectReference(String id, String name, String protocol) {}

  public record FindingRankResponse(
      FindingStage stage,
      String standardItem,
      long total,
      @Schema(description = "Projetos que receberam o apontamento, em ordem de protocolo")
          List<ProjectReference> projects) {}

  public record MunicipalityResponse(String municipality, BrazilianState state, long total) {}

  public record RepeatedRejectionResponse(
      String id,
      String name,
      String protocol,
      @Schema(description = "Reprovações no histórico do projeto, sempre 2 ou mais")
          int rejections) {}

  public record CategoryAlertsResponse(
      BuildingCategory category,
      @Schema(description = "Alertas da pré-validação do cálculo enviado") long alerts,
      long projects) {}
}
