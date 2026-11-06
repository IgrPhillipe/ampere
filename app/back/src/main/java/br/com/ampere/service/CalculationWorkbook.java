package br.com.ampere.service;

import br.com.ampere.domain.AppliedTable;
import br.com.ampere.domain.Calculation;
import br.com.ampere.domain.CalculationCheck;
import br.com.ampere.domain.CalculationStep;
import br.com.ampere.domain.ConsumerUnitGroup;
import br.com.ampere.domain.Project;
import br.com.ampere.domain.User;
import br.com.ampere.utils.BrazilianDateFormat;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.UncheckedIOException;
import java.math.BigDecimal;
import java.util.List;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellStyle;
import org.apache.poi.ss.usermodel.Font;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.VerticalAlignment;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;

final class CalculationWorkbook {

  private static final String NOT_INFORMED = "Não informado";
  private static final String NOT_APPLICABLE = "Não se aplica";
  private static final String NO_DETAILS = "Sem detalhes";
  private static final String NUMBER_FORMAT = "#,##0.00";
  private static final int MAX_COLUMN_WIDTH = 60 * 256;

  private final Workbook workbook;
  private final CellStyle headerStyle;
  private final CellStyle textStyle;
  private final CellStyle numberStyle;

  private CalculationWorkbook(Workbook workbook) {
    this.workbook = workbook;
    Font bold = workbook.createFont();
    bold.setBold(true);
    headerStyle = workbook.createCellStyle();
    headerStyle.setFont(bold);
    textStyle = workbook.createCellStyle();
    textStyle.setWrapText(true);
    textStyle.setVerticalAlignment(VerticalAlignment.TOP);
    numberStyle = workbook.createCellStyle();
    numberStyle.setVerticalAlignment(VerticalAlignment.TOP);
    numberStyle.setDataFormat(workbook.createDataFormat().getFormat(NUMBER_FORMAT));
  }

  static byte[] of(Calculation calculation, Project project, List<ConsumerUnitGroup> groups) {
    try (Workbook workbook = new XSSFWorkbook();
        ByteArrayOutputStream output = new ByteArrayOutputStream()) {
      CalculationWorkbook sheets = new CalculationWorkbook(workbook);
      sheets.addIdentification(calculation, project);
      sheets.addGroups(groups);
      sheets.addSteps(calculation.getSteps());
      sheets.addResult(calculation);
      sheets.addChecks(calculation.getChecks());
      sheets.addAppliedTables(calculation.getAppliedTables());
      sheets.fitColumns();
      workbook.write(output);

      return output.toByteArray();
    } catch (IOException exception) {
      throw new UncheckedIOException("Não foi possível gerar a planilha.", exception);
    }
  }

  private void addIdentification(Calculation calculation, Project project) {
    Sheet sheet = sheet("Identificação", "Campo", "Valor");
    addRow(sheet, "Projeto", project.getName());
    addRow(sheet, "Protocolo", project.getProtocol());
    addRow(sheet, "Responsável técnico", responsible(project.getOwner()));
    addRow(sheet, "Endereço", project.getAddress());
    addRow(sheet, "Município", project.getMunicipality());
    addRow(sheet, "UF", project.getState());
    addRow(
        sheet,
        "Norma principal",
        standard(calculation.getMainStandard(), calculation.getMainStandardRevision()));
    addRow(
        sheet,
        "Norma secundária",
        standard(calculation.getSecondaryStandard(), calculation.getSecondaryStandardRevision()));
    addRow(sheet, "Calculado em", BrazilianDateFormat.dateTime(calculation.getCalculatedAt()));
  }

  private void addGroups(List<ConsumerUnitGroup> groups) {
    Sheet sheet =
        sheet(
            "Grupos",
            "Grupo",
            "Tipo",
            "Quantidade",
            "Resumo",
            "Carga por unidade (kW)",
            "Situação");
    for (ConsumerUnitGroup group : groups) {
      addRow(
          sheet,
          group.getName(),
          group.kind().label(),
          group.getQuantity(),
          group.summary(),
          group.loadPerUnitKw(),
          group.status().label());
    }
  }

  private void addSteps(List<CalculationStep> steps) {
    Sheet sheet =
        sheet(
            "Etapas",
            "Código",
            "Etapa",
            "Fórmula",
            "Detalhes",
            "Norma",
            "Item",
            "Página",
            "Valor (kVA)");
    for (CalculationStep step : steps) {
      addRow(
          sheet,
          step.getCode(),
          step.getTitle(),
          step.getFormula(),
          details(step),
          reference(step, standard(step.getReferenceStandard(), step.getReferenceRevision())),
          reference(step, step.getReferenceItem()),
          reference(step, step.getReferencePage()),
          step.getValueKva());
    }
  }

  private void addResult(Calculation calculation) {
    Sheet sheet = sheet("Resultado", "Campo", "Valor");
    addRow(sheet, "Demanda residencial (kVA)", calculation.getResidentialDemandFinal());
    addRow(sheet, "Demanda de serviços (kVA)", calculation.getServiceDemand());
    addRow(sheet, "Demanda comercial (kVA)", calculation.getCommercialDemand());
    addRow(
        sheet, "Demanda de recarga de veículos elétricos (kVA)", calculation.getEvChargingDemand());
    addRow(sheet, "Demanda total calculada (kVA)", calculation.getCalculatedTotalDemand());
    addOptionalRow(sheet, "Demanda mínima (kVA)", calculation.getMinimumTotalDemand());
    addRow(sheet, "Demanda total prevista (kVA)", calculation.getFinalTotalDemand());
    addRow(sheet, "Demanda mínima aplicada", calculation.isMinimumApplied() ? "Sim" : "Não");
    addRow(sheet, "Corrente (A)", calculation.getCurrentAmps());
    addOptionalRow(sheet, "Faixa do ramal de entrada", calculation.getServiceEntranceBand());
    addOptionalRow(
        sheet, "Circuitos do ramal de entrada", calculation.getServiceEntranceCircuits());
    addOptionalRow(sheet, "Seção do cabo (mm²)", calculation.getCableSectionMm2());
    addOptionalRow(sheet, "Disjuntor (A)", calculation.getBreakerAmps());
  }

  private void addChecks(List<CalculationCheck> checks) {
    Sheet sheet = sheet("Verificações", "Situação", "Mensagem");
    for (CalculationCheck check : checks) {
      addRow(sheet, check.getStatus().label(), check.getMessage());
    }
  }

  private void addAppliedTables(List<AppliedTable> tables) {
    Sheet sheet = sheet("Tabelas Aplicadas", "Tabela", "Norma", "Item", "Página");
    for (AppliedTable table : tables) {
      addRow(
          sheet,
          table.getIdentification(),
          standard(table.getStandard(), table.getRevision()),
          table.getItem(),
          table.getPage());
    }
  }

  private Sheet sheet(String name, String... headers) {
    Sheet sheet = workbook.createSheet(name);
    Row row = sheet.createRow(0);
    for (int column = 0; column < headers.length; column++) {
      Cell cell = row.createCell(column);
      cell.setCellValue(headers[column]);
      cell.setCellStyle(headerStyle);
    }
    sheet.createFreezePane(0, 1);

    return sheet;
  }

  private void addRow(Sheet sheet, Object... values) {
    Row row = sheet.createRow(sheet.getLastRowNum() + 1);
    for (int column = 0; column < values.length; column++) {
      write(row.createCell(column), values[column]);
    }
  }

  private void addOptionalRow(Sheet sheet, String field, Object value) {
    if (value != null) {
      addRow(sheet, field, value);
    }
  }

  private void write(Cell cell, Object value) {
    switch (value) {
      case BigDecimal decimal -> {
        cell.setCellValue(decimal.doubleValue());
        cell.setCellStyle(numberStyle);
      }
      case Integer count -> {
        cell.setCellValue(count);
        cell.setCellStyle(textStyle);
      }
      case null -> writeText(cell, NOT_INFORMED);
      default -> writeText(cell, value.toString().isBlank() ? NOT_INFORMED : value.toString());
    }
  }

  private void writeText(Cell cell, String value) {
    cell.setCellValue(value);
    cell.setCellStyle(textStyle);
  }

  private void fitColumns() {
    for (Sheet sheet : workbook) {
      for (int column = 0; column < sheet.getRow(0).getLastCellNum(); column++) {
        sheet.autoSizeColumn(column);
        sheet.setColumnWidth(column, Math.min(sheet.getColumnWidth(column), MAX_COLUMN_WIDTH));
      }
    }
  }

  private static String responsible(User owner) {
    if (owner == null) {
      return null;
    }
    String crea = owner.creaWithState();

    return crea == null ? owner.getName() : owner.getName() + " (CREA " + crea + ")";
  }

  private static String standard(String name, String revision) {
    if (name == null) {
      return null;
    }

    return revision == null ? name : name + " " + revision;
  }

  private static String details(CalculationStep step) {
    if (step.getDetails().isEmpty()) {
      return step.applies() ? NO_DETAILS : NOT_APPLICABLE;
    }

    return String.join("\n", step.getDetails());
  }

  private static String reference(CalculationStep step, String value) {
    return step.hasReference() ? value : NOT_APPLICABLE;
  }
}
