package br.com.ampere.service;

import br.com.ampere.domain.AppliedTable;
import br.com.ampere.domain.Calculation;
import br.com.ampere.domain.CalculationStep;
import br.com.ampere.domain.ConsumerUnitGroup;
import br.com.ampere.domain.Project;
import br.com.ampere.dto.ProjectResponse;
import br.com.ampere.dto.ReviewQueueItemResponse;
import br.com.ampere.utils.BrazilianNumberFormat;
import br.com.ampere.utils.Timestamps;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.UncheckedIOException;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellStyle;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class SpreadsheetExportService {

  private static final String CSV_CONTENT_TYPE = "text/csv;charset=UTF-8";
  private static final String XLSX_CONTENT_TYPE =
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
  private static final byte[] UTF8_BOM = {(byte) 0xef, (byte) 0xbb, (byte) 0xbf};

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
    Calculation calculation = calculationService.latest(projectId, user).calculation();
    Project project = calculation.getProject();
    List<ConsumerUnitGroup> groups = groupService.list(projectId, user);

    return new Download(
        project.getProtocol() + "-calculo.xlsx",
        XLSX_CONTENT_TYPE,
        workbook(calculation, project, groups));
  }

  @Transactional(readOnly = true)
  public Download projects(ProjectListQuery query, AuthenticatedUser user) {
    ProjectListing listing = projectService.listAll(query, user);
    List<List<String>> rows = new ArrayList<>();
    rows.add(
        List.of(
            "id",
            "name",
            "address",
            "municipality",
            "state",
            "protocol",
            "ownerId",
            "ownerName",
            "status",
            "createdAt",
            "updatedAt",
            "pendingCount",
            "consumerUnitsCount",
            "demandKva"));
    for (Project project : listing.projects()) {
      ProjectResponse response =
          ProjectResponse.from(
              project,
              listing.pendingCountFor(project),
              listing.unitCountFor(project),
              listing.demandFor(project));
      rows.add(
          List.of(
              safe(response.id()),
              safe(response.name()),
              safe(response.address()),
              safe(response.municipality()),
              safe(value(response.state())),
              safe(response.protocol()),
              safe(response.ownerId()),
              safe(response.ownerName()),
              safe(value(response.status())),
              safe(value(response.createdAt())),
              safe(value(response.updatedAt())),
              BrazilianNumberFormat.format(response.pendingCount()),
              BrazilianNumberFormat.format(response.consumerUnitsCount()),
              BrazilianNumberFormat.format(response.demandKva())));
    }

    return csv("projetos-" + LocalDate.now(Timestamps.ZONE) + ".csv", rows);
  }

  @Transactional(readOnly = true)
  public Download reviewQueue(ReviewQueueQuery query, AuthenticatedUser user) {
    ReviewQueueListing listing = reviewQueueService.listAll(query, user);
    List<List<String>> rows = new ArrayList<>();
    rows.add(
        List.of(
            "id",
            "name",
            "protocol",
            "municipality",
            "state",
            "submittedAt",
            "deadline",
            "deadlineStatus",
            "daysRemaining",
            "warnings",
            "alerts",
            "ownerName",
            "consumerUnitsCount",
            "demandKva",
            "reanalysis",
            "reviewCycle"));
    for (ReviewQueueEntry entry : listing.entries()) {
      ReviewQueueItemResponse response = ReviewQueueItemResponse.from(entry);
      rows.add(
          List.of(
              safe(response.id()),
              safe(response.name()),
              safe(response.protocol()),
              safe(response.municipality()),
              safe(value(response.state())),
              safe(value(response.submittedAt())),
              safe(value(response.deadline())),
              safe(value(response.deadlineStatus())),
              BrazilianNumberFormat.format(response.daysRemaining()),
              BrazilianNumberFormat.format(response.warnings()),
              safe(String.join(" | ", response.alerts())),
              safe(response.ownerName()),
              BrazilianNumberFormat.format(response.consumerUnitsCount()),
              BrazilianNumberFormat.format(response.demandKva()),
              Boolean.toString(response.reanalysis()),
              BrazilianNumberFormat.format(response.reviewCycle())));
    }

    return csv("fila-analise-" + LocalDate.now(Timestamps.ZONE) + ".csv", rows);
  }

  private static Download csv(String filename, List<List<String>> rows) {
    StringBuilder content = new StringBuilder();
    for (List<String> row : rows) {
      content.append(String.join(";", row.stream().map(SpreadsheetExportService::quote).toList()));
      content.append("\r\n");
    }
    byte[] body = content.toString().getBytes(StandardCharsets.UTF_8);
    byte[] withBom = new byte[UTF8_BOM.length + body.length];
    System.arraycopy(UTF8_BOM, 0, withBom, 0, UTF8_BOM.length);
    System.arraycopy(body, 0, withBom, UTF8_BOM.length, body.length);

    return new Download(filename, CSV_CONTENT_TYPE, withBom);
  }

  private static String quote(String value) {
    String escaped = value.replace("\"", "\"\"");
    return escaped.indexOf(';') >= 0
            || escaped.indexOf('"') >= 0
            || escaped.indexOf('\r') >= 0
            || escaped.indexOf('\n') >= 0
        ? "\"" + escaped + "\""
        : escaped;
  }

  private static String safe(String value) {
    if (value == null || value.isEmpty()) {
      return "";
    }
    int first = 0;
    while (first < value.length()
        && (Character.isWhitespace(value.charAt(first))
            || Character.isISOControl(value.charAt(first)))) {
      first++;
    }
    if (first < value.length() && "=+-@".indexOf(value.charAt(first)) >= 0) {
      return "'" + value;
    }

    return value;
  }

  private static String value(Object value) {
    return value == null ? "" : value.toString();
  }

  private static byte[] workbook(
      Calculation calculation, Project project, List<ConsumerUnitGroup> groups) {
    try (Workbook workbook = new XSSFWorkbook();
        ByteArrayOutputStream output = new ByteArrayOutputStream()) {
      CellStyle numberStyle = workbook.createCellStyle();
      numberStyle.setDataFormat(workbook.createDataFormat().getFormat("#,##0.00"));
      CellStyle headerStyle = workbook.createCellStyle();
      org.apache.poi.ss.usermodel.Font headerFont = workbook.createFont();
      headerFont.setBold(true);
      headerStyle.setFont(headerFont);

      Sheet identification = workbook.createSheet("Identificação");
      writeTextRow(identification, 0, headerStyle, "Campo", "Valor");
      int row = 1;
      row = writeTextRow(identification, row, null, "Projeto", project.getName());
      row = writeTextRow(identification, row, null, "Protocolo", project.getProtocol());
      row =
          writeTextRow(
              identification,
              row,
              null,
              "Responsável técnico",
              project.getOwner() == null
                  ? ""
                  : project.getOwner().getName()
                      + (project.getOwner().creaWithState() == null
                          ? ""
                          : " — CREA " + project.getOwner().creaWithState()));
      row = writeTextRow(identification, row, null, "Endereço", project.getAddress());
      row = writeTextRow(identification, row, null, "Município", project.getMunicipality());
      row = writeTextRow(identification, row, null, "UF", value(project.getState()));
      row =
          writeTextRow(
              identification,
              row,
              null,
              "Norma principal",
              standard(calculation.getMainStandard(), calculation.getMainStandardRevision()));
      row =
          writeTextRow(
              identification,
              row,
              null,
              "Norma secundária",
              standard(
                  calculation.getSecondaryStandard(), calculation.getSecondaryStandardRevision()));
      row =
          writeTextRow(
              identification, row, null, "Calculado em", value(calculation.getCalculatedAt()));
      for (AppliedTable table : calculation.getAppliedTables()) {
        row =
            writeTextRow(
                identification,
                row,
                null,
                "Tabela aplicada",
                table.getIdentification()
                    + " — "
                    + table.getStandard()
                    + " "
                    + table.getRevision()
                    + ", item "
                    + table.getItem()
                    + ", página "
                    + table.getPage());
      }

      Sheet groupSheet = workbook.createSheet("Grupos");
      writeTextRow(groupSheet, 0, headerStyle, "Grupo", "Tipo", "Quantidade", "Situação");
      for (int index = 0; index < groups.size(); index++) {
        ConsumerUnitGroup group = groups.get(index);
        Row groupRow = groupSheet.createRow(index + 1);
        writeText(groupRow.createCell(0), group.getName());
        writeText(groupRow.createCell(1), group.kind().name());
        groupRow.createCell(2).setCellValue(group.getQuantity());
        writeText(groupRow.createCell(3), group.status().label());
      }

      Sheet stepsSheet = workbook.createSheet("Etapas");
      writeTextRow(stepsSheet, 0, headerStyle, "Etapa", "Fórmula", "Item da norma", "Valor (kVA)");
      List<CalculationStep> steps = calculation.getSteps();
      for (int index = 0; index < steps.size(); index++) {
        CalculationStep step = steps.get(index);
        Row stepRow = stepsSheet.createRow(index + 1);
        writeText(stepRow.createCell(0), step.getCode() + " - " + step.getTitle());
        writeText(stepRow.createCell(1), step.getFormula());
        writeText(stepRow.createCell(2), reference(step));
        Cell value = stepRow.createCell(3);
        value.setCellValue(step.getValueKva().doubleValue());
        value.setCellStyle(numberStyle);
      }

      for (Sheet sheet : workbook) {
        for (int column = 0; column < sheet.getRow(0).getLastCellNum(); column++) {
          sheet.autoSizeColumn(column);
        }
      }
      workbook.write(output);

      return output.toByteArray();
    } catch (IOException exception) {
      throw new UncheckedIOException("Não foi possível gerar a planilha.", exception);
    }
  }

  private static int writeTextRow(Sheet sheet, int rowIndex, CellStyle style, String... values) {
    Row row = sheet.createRow(rowIndex);
    for (int column = 0; column < values.length; column++) {
      Cell cell = row.createCell(column);
      writeText(cell, values[column]);
      if (style != null) {
        cell.setCellStyle(style);
      }
    }

    return rowIndex + 1;
  }

  private static void writeText(Cell cell, String value) {
    cell.setCellValue(safe(value));
  }

  private static String standard(String name, String revision) {
    return name == null ? "" : name + " " + revision;
  }

  private static String reference(CalculationStep step) {
    if (!step.hasReference()) {
      return "";
    }

    return step.getReferenceStandard()
        + " "
        + step.getReferenceRevision()
        + ", item "
        + step.getReferenceItem()
        + " ("
        + step.getReferenceLabel()
        + ")";
  }

  public record Download(String filename, String contentType, byte[] content) {}
}
