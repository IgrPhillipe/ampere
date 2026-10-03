package br.com.ampere.service;

import br.com.ampere.domain.AppliedTable;
import br.com.ampere.domain.Calculation;
import br.com.ampere.domain.CalculationStep;
import br.com.ampere.domain.ConsumerUnitGroup;
import br.com.ampere.domain.Project;
import br.com.ampere.error.NotFoundException;
import br.com.ampere.repository.CalculationRepository;
import br.com.ampere.repository.ConsumerUnitGroupRepository;
import com.lowagie.text.Document;
import com.lowagie.text.Element;
import com.lowagie.text.Font;
import com.lowagie.text.FontFactory;
import com.lowagie.text.PageSize;
import com.lowagie.text.Paragraph;
import com.lowagie.text.Phrase;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.text.DecimalFormat;
import java.text.DecimalFormatSymbols;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Locale;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Builds the calculation memorial on demand, from the latest calculation of the project. */
@Service
public class MemorialPdfService {

  private static final ZoneId ZONE = ZoneId.of("America/Recife");
  private static final DateTimeFormatter DATE_FORMAT =
      DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");
  private static final String EMPTY = "Não informado";

  private static final Font TITLE_FONT = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18);
  private static final Font SECTION_FONT = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 14);
  private static final Font LABEL_FONT = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10);
  private static final Font VALUE_FONT = FontFactory.getFont(FontFactory.HELVETICA, 10);
  private static final Font TABLE_HEADER_FONT =
      FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9, Color.WHITE);
  private static final Font TABLE_CELL_FONT = FontFactory.getFont(FontFactory.HELVETICA, 9);

  private static final Color HEADER_BACKGROUND = new Color(44, 62, 80);
  private static final Color STRIPE_BACKGROUND = new Color(241, 245, 249);

  private final ProjectService projectService;
  private final CalculationRepository calculationRepository;
  private final ConsumerUnitGroupRepository groupRepository;

  public MemorialPdfService(
      ProjectService projectService,
      CalculationRepository calculationRepository,
      ConsumerUnitGroupRepository groupRepository) {
    this.projectService = projectService;
    this.calculationRepository = calculationRepository;
    this.groupRepository = groupRepository;
  }

  public record Memorial(String filename, byte[] content) {}

  @Transactional(readOnly = true)
  public Memorial generate(Long projectId) {
    Project project = projectService.findById(projectId);
    Calculation calculation =
        calculationRepository
            .findFirstByProjectIdOrderByIdDesc(projectId)
            .orElseThrow(
                () ->
                    new NotFoundException(
                        "Calcule a demanda do projeto antes de gerar o memorial."));
    List<ConsumerUnitGroup> groups = groupRepository.findAllByProjectIdOrderById(projectId);

    return new Memorial(
        "memorial-" + project.getProtocol() + ".pdf", build(project, calculation, groups));
  }

  private byte[] build(Project project, Calculation calculation, List<ConsumerUnitGroup> groups) {
    ByteArrayOutputStream output = new ByteArrayOutputStream();
    Document document = new Document(PageSize.A4, 36, 36, 36, 36);
    PdfWriter.getInstance(document, output);
    document.open();

    addTitle(document);
    addIdentification(document, project, calculation);
    addConsumerUnits(document, groups);
    addCalculationSteps(document, calculation);
    addDemandTotals(document, calculation);
    addAppliedStandards(document, calculation);

    document.close();
    return output.toByteArray();
  }

  private static void addTitle(Document document) {
    Paragraph title = new Paragraph("Memorial de Cálculo de Demanda", TITLE_FONT);
    title.setAlignment(Element.ALIGN_CENTER);
    title.setSpacingAfter(20);
    document.add(title);
  }

  private static void addSection(Document document, String text) {
    Paragraph section = new Paragraph(text, SECTION_FONT);
    section.setSpacingBefore(16);
    section.setSpacingAfter(8);
    document.add(section);
  }

  private static void addField(Document document, String label, String value) {
    Paragraph paragraph = new Paragraph();
    paragraph.add(new Phrase(label + ": ", LABEL_FONT));
    paragraph.add(new Phrase(orEmpty(value), VALUE_FONT));
    paragraph.setSpacingAfter(4);
    document.add(paragraph);
  }

  private static void addIdentification(
      Document document, Project project, Calculation calculation) {
    addSection(document, "1. Identificação do Projeto");
    addField(document, "Nome", project.getName());
    addField(document, "Protocolo", project.getProtocol());
    addField(document, "Endereço", project.getAddress());
    addField(document, "Município", project.getMunicipality());
    addField(document, "Tipo de edificação", calculation.getBuildingType().label());
    addField(document, "Tensão de fornecimento", calculation.getSupplyVoltage().label());
    addField(document, "Tipo de ligação", calculation.getConnectionType().label());
    addField(document, "Padrão de entrada", calculation.getEntranceStandard().label());
    addField(
        document,
        "Data do cálculo",
        calculation.getCalculatedAt().atZoneSameInstant(ZONE).format(DATE_FORMAT));
  }

  private static void addConsumerUnits(Document document, List<ConsumerUnitGroup> groups) {
    addSection(document, "2. Unidades Consumidoras");
    if (groups.isEmpty()) {
      document.add(new Paragraph("Nenhuma unidade consumidora cadastrada.", VALUE_FONT));
      return;
    }

    PdfPTable table = table(new float[] {50, 25, 25});
    addHeaderCells(table, "Grupo", "Quantidade", "Carga por unidade (kW)");
    for (int i = 0; i < groups.size(); i++) {
      ConsumerUnitGroup group = groups.get(i);
      addRow(
          table,
          i,
          group.getName(),
          String.valueOf(group.getQuantity()),
          decimal(group.loadPerUnitKw()));
    }
    document.add(table);
  }

  private static void addCalculationSteps(Document document, Calculation calculation) {
    addSection(document, "3. Memória de Cálculo");
    List<CalculationStep> steps =
        calculation.getSteps().stream().filter(CalculationStep::applies).toList();
    if (steps.isEmpty()) {
      document.add(new Paragraph("Nenhuma parcela de demanda se aplica.", VALUE_FONT));
      return;
    }

    PdfPTable table = table(new float[] {10, 30, 35, 25});
    addHeaderCells(table, "Parcela", "Descrição", "Fórmula", "Valor (kVA)");
    for (int i = 0; i < steps.size(); i++) {
      CalculationStep step = steps.get(i);
      addRow(
          table,
          i,
          step.getCode(),
          step.getTitle(),
          step.getFormula(),
          decimal(step.getValueKva()));
    }
    document.add(table);
  }

  private static void addDemandTotals(Document document, Calculation calculation) {
    addSection(document, "4. Demanda Prevista");
    addField(
        document, "Demanda residencial (kVA)", decimal(calculation.getResidentialDemandFinal()));
    addField(document, "Demanda de serviços (kVA)", decimal(calculation.getServiceDemand()));
    addField(document, "Demanda comercial (kVA)", decimal(calculation.getCommercialDemand()));
    addField(
        document,
        "Demanda de recarga de veículos elétricos (kVA)",
        decimal(calculation.getEvChargingDemand()));
    addField(
        document, "Demanda total calculada (kVA)", decimal(calculation.getCalculatedTotalDemand()));
    if (calculation.getMinimumTotalDemand() != null) {
      addField(document, "Demanda mínima (kVA)", decimal(calculation.getMinimumTotalDemand()));
    }
    addField(document, "Demanda total prevista (kVA)", decimal(calculation.getFinalTotalDemand()));
    addField(document, "Demanda mínima aplicada", calculation.isMinimumApplied() ? "Sim" : "Não");
    addField(document, "Corrente (A)", decimal(calculation.getCurrentAmps()));
    if (calculation.getServiceEntranceBand() != null) {
      addField(document, "Faixa do ramal de entrada", calculation.getServiceEntranceBand());
    }
    if (calculation.getServiceEntranceCircuits() != null) {
      addField(
          document,
          "Circuitos do ramal de entrada",
          String.valueOf(calculation.getServiceEntranceCircuits()));
    }
    if (calculation.getCableSectionMm2() != null) {
      addField(document, "Seção do cabo (mm²)", decimal(calculation.getCableSectionMm2()));
    }
    if (calculation.getBreakerAmps() != null) {
      addField(document, "Disjuntor (A)", decimal(calculation.getBreakerAmps()));
    }
  }

  private static void addAppliedStandards(Document document, Calculation calculation) {
    addSection(document, "5. Normas Aplicadas");
    if (calculation.getMainStandard() != null) {
      addField(
          document,
          "Norma principal",
          standard(calculation.getMainStandard(), calculation.getMainStandardRevision()));
    }
    if (calculation.getSecondaryStandard() != null) {
      addField(
          document,
          "Norma complementar",
          standard(calculation.getSecondaryStandard(), calculation.getSecondaryStandardRevision()));
    }

    List<AppliedTable> tables = calculation.getAppliedTables();
    if (tables.isEmpty()) {
      return;
    }

    Paragraph caption = new Paragraph("Tabelas normativas consultadas", LABEL_FONT);
    caption.setSpacingBefore(8);
    caption.setSpacingAfter(6);
    document.add(caption);

    PdfPTable table = table(new float[] {30, 25, 25, 20});
    addHeaderCells(table, "Identificação", "Norma", "Item", "Página");
    for (int i = 0; i < tables.size(); i++) {
      AppliedTable applied = tables.get(i);
      addRow(
          table,
          i,
          applied.getIdentification(),
          standard(applied.getStandard(), applied.getRevision()),
          applied.getItem(),
          applied.getPage());
    }
    document.add(table);
  }

  private static PdfPTable table(float[] widths) {
    PdfPTable table = new PdfPTable(widths.length);
    table.setWidthPercentage(100);
    table.setWidths(widths);
    return table;
  }

  private static void addHeaderCells(PdfPTable table, String... headers) {
    for (String header : headers) {
      PdfPCell cell = new PdfPCell(new Phrase(header, TABLE_HEADER_FONT));
      cell.setBackgroundColor(HEADER_BACKGROUND);
      cell.setPadding(6);
      cell.setHorizontalAlignment(Element.ALIGN_CENTER);
      table.addCell(cell);
    }
  }

  private static void addRow(PdfPTable table, int index, String... values) {
    Color background = index % 2 == 1 ? STRIPE_BACKGROUND : Color.WHITE;
    for (String value : values) {
      PdfPCell cell = new PdfPCell(new Phrase(orEmpty(value), TABLE_CELL_FONT));
      cell.setBackgroundColor(background);
      cell.setPadding(5);
      table.addCell(cell);
    }
  }

  private static String standard(String name, String revision) {
    return revision == null ? name : name + " " + revision;
  }

  private static String decimal(BigDecimal value) {
    if (value == null) {
      return EMPTY;
    }

    return new DecimalFormat("#,##0.00", DecimalFormatSymbols.getInstance(Locale.of("pt", "BR")))
        .format(value);
  }

  // The standard Helvetica of the PDF has no glyph for these signs.
  private static String orEmpty(String value) {
    return value == null || value.isBlank() ? EMPTY : value.replace("≤", "<=").replace("≥", ">=");
  }
}
