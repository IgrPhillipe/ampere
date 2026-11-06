package br.com.ampere.service;

import br.com.ampere.domain.Project;
import br.com.ampere.domain.User;
import br.com.ampere.error.BusinessException;
import br.com.ampere.utils.BrazilianDateFormat;
import br.com.ampere.utils.BrazilianNumberFormat;
import br.com.ampere.utils.CsvFile;
import br.com.ampere.utils.Timestamps;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class SpreadsheetExportService {

  public static final String XLSX_CONTENT_TYPE =
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

  private static final String CSV_CONTENT_TYPE = "text/csv;charset=UTF-8";
  private static final String NOT_INFORMED = "Não informado";
  private static final String NO_CALCULATION = "Sem cálculo";
  private static final String NO_REVIEWER = "Sem analista";
  private static final String NO_ALERTS = "Sem alertas";
  private static final String ALERT_SEPARATOR = " | ";
  private static final List<String> PROJECT_HEADER =
      List.of(
          "Protocolo",
          "Projeto",
          "Endereço",
          "Município",
          "UF",
          "Projetista",
          "Situação",
          "Pendências",
          "UCs",
          "Demanda (kVA)",
          "Criado em",
          "Atualizado em");
  private static final List<String> REVIEW_QUEUE_HEADER =
      List.of(
          "Protocolo",
          "Projeto",
          "Município",
          "UF",
          "Projetista",
          "Analista",
          "Prazo",
          "Vencimento",
          "Dias restantes",
          "Recebido em",
          "Envio",
          "Reanálise",
          "UCs",
          "Demanda (kVA)",
          "Alertas",
          "Mensagens dos alertas");

  private final ProjectService projectService;
  private final DemandCalculationService calculationService;
  private final ConsumerUnitGroupService groupService;
  private final ReviewQueueService reviewQueueService;

  public SpreadsheetExportService(
      ProjectService projectService,
      DemandCalculationService calculationService,
      ConsumerUnitGroupService groupService,
      ReviewQueueService reviewQueueService) {
    this.projectService = projectService;
    this.calculationService = calculationService;
    this.groupService = groupService;
    this.reviewQueueService = reviewQueueService;
  }

  @Transactional(readOnly = true)
  public Download calculation(Long projectId, AuthenticatedUser user) {
    DemandCalculationService.Latest latest = calculationService.latest(projectId, user);
    if (latest.outdated()) {
      throw new BusinessException(
          "Os dados do projeto mudaram depois do último cálculo. Recalcule a demanda antes de"
              + " exportar a planilha.",
          HttpStatus.CONFLICT);
    }
    Project project = latest.calculation().getProject();

    return new Download(
        project.getProtocol() + "-calculo.xlsx",
        XLSX_CONTENT_TYPE,
        CalculationWorkbook.of(latest.calculation(), project, groupService.list(projectId, user)));
  }

  @Transactional(readOnly = true)
  public Download projects(ProjectListQuery query, AuthenticatedUser user) {
    ProjectListing listing = projectService.listAll(query, user);
    List<List<String>> rows = new ArrayList<>(List.of(PROJECT_HEADER));
    for (Project project : listing.projects()) {
      rows.add(
          List.of(
              text(project.getProtocol()),
              text(project.getName()),
              text(project.getAddress()),
              text(project.getMunicipality()),
              text(project.getState()),
              text(ownerName(project)),
              project.getStatus().label(),
              BrazilianNumberFormat.format(listing.pendingCountFor(project)),
              BrazilianNumberFormat.format(listing.unitCountFor(project)),
              demand(listing.demandFor(project)),
              dateTime(project.getCreatedAt()),
              dateTime(project.getUpdatedAt())));
    }

    return csv("projetos-" + today() + ".csv", rows);
  }

  @Transactional(readOnly = true)
  public Download reviewQueue(ReviewQueueQuery query, AuthenticatedUser user) {
    ReviewQueueListing listing = reviewQueueService.listAll(query, user);
    List<List<String>> rows = new ArrayList<>(List.of(REVIEW_QUEUE_HEADER));
    for (ReviewQueueEntry entry : listing.entries()) {
      Project project = entry.project();
      List<String> alerts = entry.warnings();
      rows.add(
          List.of(
              text(project.getProtocol()),
              text(project.getName()),
              text(project.getMunicipality()),
              text(project.getState()),
              text(ownerName(project)),
              project.getReviewer() == null ? NO_REVIEWER : text(project.getReviewer().getName()),
              entry.deadlineStatus().label(),
              BrazilianDateFormat.date(entry.deadline()),
              BrazilianNumberFormat.format(entry.daysRemaining()),
              dateTime(project.getSubmittedAt()),
              BrazilianNumberFormat.format(project.getReviewCycle()),
              project.isReanalysis() ? "Sim" : "Não",
              BrazilianNumberFormat.format(entry.consumerUnitsCount()),
              demand(entry.demandKva()),
              BrazilianNumberFormat.format(alerts.size()),
              alerts.isEmpty() ? NO_ALERTS : text(String.join(ALERT_SEPARATOR, alerts))));
    }

    return csv("fila-analise-" + today() + ".csv", rows);
  }

  private static Download csv(String filename, List<List<String>> rows) {
    return new Download(filename, CSV_CONTENT_TYPE, CsvFile.encode(rows));
  }

  private static LocalDate today() {
    return LocalDate.now(Timestamps.ZONE);
  }

  private static String ownerName(Project project) {
    User owner = project.getOwner();

    return owner == null ? null : owner.getName();
  }

  private static String text(Object value) {
    return value == null || value.toString().isBlank()
        ? NOT_INFORMED
        : CsvFile.text(value.toString());
  }

  private static String demand(BigDecimal value) {
    return value == null ? NO_CALCULATION : BrazilianNumberFormat.format(value);
  }

  private static String dateTime(OffsetDateTime value) {
    return value == null ? NOT_INFORMED : BrazilianDateFormat.dateTime(value);
  }

  public record Download(String filename, String contentType, byte[] content) {}
}
