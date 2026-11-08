package br.com.ampere.service;

import br.com.ampere.domain.AppliedTable;
import br.com.ampere.domain.Calculation;
import br.com.ampere.domain.CalculationStep;
import br.com.ampere.domain.ConnectionType;
import br.com.ampere.domain.ConsumerUnitGroup;
import br.com.ampere.domain.DemandStep;
import br.com.ampere.domain.Finding;
import br.com.ampere.domain.Project;
import br.com.ampere.domain.ProjectVersion;
import br.com.ampere.domain.ProjectVersionMemorial;
import br.com.ampere.domain.User;
import br.com.ampere.error.BusinessException;
import br.com.ampere.error.NotFoundException;
import br.com.ampere.repository.ApprovalMemorialRepository;
import br.com.ampere.repository.CalculationRepository;
import br.com.ampere.repository.ConsumerUnitGroupRepository;
import br.com.ampere.repository.ProjectVersionRepository;
import br.com.ampere.utils.BrazilianDateFormat;
import br.com.ampere.utils.BrazilianNumberFormat;
import br.com.ampere.utils.MemorialFingerprint;
import br.com.ampere.utils.Timestamps;
import com.lowagie.text.Chunk;
import com.lowagie.text.Document;
import com.lowagie.text.Element;
import com.lowagie.text.Font;
import com.lowagie.text.PageSize;
import com.lowagie.text.Paragraph;
import com.lowagie.text.Phrase;
import com.lowagie.text.Rectangle;
import com.lowagie.text.pdf.BaseFont;
import com.lowagie.text.pdf.ColumnText;
import com.lowagie.text.pdf.PdfContentByte;
import com.lowagie.text.pdf.PdfGState;
import com.lowagie.text.pdf.PdfName;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfPageEventHelper;
import com.lowagie.text.pdf.PdfString;
import com.lowagie.text.pdf.PdfWriter;
import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.UncheckedIOException;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Locale;
import java.util.stream.Collectors;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Builds the calculation memorial with the fonts, colors and rules of the front-end design system
 * (docs/tecnico/design-system-front.md).
 */
@Service
public class MemorialPdfService {

  private static final Locale PT_BR = Locale.of("pt", "BR");
  private static final String EMPTY = "Não informado";
  private static final String NOT_APPLICABLE = "Não se aplica";

  private static final float MARGIN = 48;

  // Same values as the --neo-* tokens of app/front/src/styles/tokens.css.
  private static final Color GREEN = new Color(0x00A443);
  private static final Color PRIMARY = new Color(0x007F33);
  private static final Color ACCENT = new Color(0xDCEBE1);
  private static final Color INK = new Color(0x002015);
  private static final Color MUTED = new Color(0x615D5A);
  private static final Color BORDER = new Color(0xD8CFC7);
  private static final Color ON_PRIMARY_MUTED = new Color(0xBFDFCC);

  private static final BaseFont SANS = font("IBMPlexSans-Regular.ttf");
  private static final BaseFont SANS_MEDIUM = font("IBMPlexSans-Medium.ttf");
  private static final BaseFont SANS_SEMIBOLD = font("IBMPlexSans-SemiBold.ttf");
  private static final BaseFont MONO = font("IBMPlexMono-Regular.ttf");
  private static final BaseFont MONO_MEDIUM = font("IBMPlexMono-Medium.ttf");

  private static final Font BRAND_FONT = new Font(SANS_SEMIBOLD, 11, Font.NORMAL, PRIMARY);
  private static final Font TITLE_FONT = new Font(SANS_SEMIBOLD, 19, Font.NORMAL, INK);
  private static final Font SUBTITLE_FONT = new Font(SANS, 9.5f, Font.NORMAL, MUTED);
  private static final Font SECTION_FONT = new Font(SANS_SEMIBOLD, 12, Font.NORMAL, INK);
  private static final Font SECTION_NUMBER_FONT = new Font(MONO, 9, Font.NORMAL, MUTED);
  private static final Font EYEBROW_FONT = new Font(MONO, 6.5f, Font.NORMAL, MUTED);
  private static final Font LABEL_FONT = new Font(SANS, 9, Font.NORMAL, MUTED);
  private static final Font VALUE_FONT = new Font(SANS, 9, Font.NORMAL, INK);
  private static final Font STAMP_VALUE_FONT = new Font(MONO, 8.5f, Font.NORMAL, INK);
  private static final Font CELL_FONT = new Font(SANS, 8.5f, Font.NORMAL, INK);
  private static final Font NUMBER_FONT = new Font(MONO, 8.5f, Font.NORMAL, INK);
  private static final Font PROTOCOL_LABEL_FONT =
      new Font(MONO, 6.5f, Font.NORMAL, ON_PRIMARY_MUTED);
  private static final Font PROTOCOL_FONT = new Font(MONO_MEDIUM, 17, Font.NORMAL, Color.WHITE);
  private static final Font TOTAL_FONT = new Font(MONO_MEDIUM, 18, Font.NORMAL, INK);
  private static final Font CAPTION_FONT = new Font(SANS_MEDIUM, 9.5f, Font.NORMAL, INK);
  private static final Font FOOTER_FONT = new Font(MONO, 7, Font.NORMAL, MUTED);
  private static final Font PREVIEW_TAG_FONT = new Font(MONO_MEDIUM, 8, Font.NORMAL, INK);

  private final ProjectService projectService;
  private final CalculationRepository calculationRepository;
  private final ConsumerUnitGroupRepository groupRepository;
  private final DemandCalculationService demandCalculationService;
  private final ProjectVersionRepository versionRepository;
  private final ApprovalMemorialRepository approvalMemorialRepository;

  public MemorialPdfService(
      ProjectService projectService,
      CalculationRepository calculationRepository,
      ConsumerUnitGroupRepository groupRepository,
      DemandCalculationService demandCalculationService,
      ProjectVersionRepository versionRepository,
      ApprovalMemorialRepository approvalMemorialRepository) {
    this.projectService = projectService;
    this.calculationRepository = calculationRepository;
    this.groupRepository = groupRepository;
    this.demandCalculationService = demandCalculationService;
    this.versionRepository = versionRepository;
    this.approvalMemorialRepository = approvalMemorialRepository;
  }

  public record Memorial(String filename, byte[] content) {}

  public record Issued(String filename, byte[] content, String sha256, String verificationCode) {}

  private record Stamp(int version, OffsetDateTime issuedAt, String code) {}

  private record Column(String header, float width, boolean numeric) {}

  @Transactional(readOnly = true)
  public Memorial generate(Long projectId, AuthenticatedUser user) {
    Project project = projectService.findById(projectId, user);
    // Rendering again changes the bytes (the PDF carries its creation date) and fails the check.
    if (!project.isEditable()) {
      Memorial stored = storedMemorial(projectId);
      if (stored != null) {
        return stored;
      }
    }
    Calculation calculation =
        calculationRepository
            .findFirstByProjectIdOrderByIdDesc(projectId)
            .orElseThrow(
                () ->
                    new NotFoundException(
                        "Calcule a demanda do projeto antes de gerar o memorial."));
    if (project.isEditable() && !demandCalculationService.isCurrent(calculation)) {
      throw new BusinessException(
          "Os dados do projeto mudaram depois do último cálculo. Recalcule a demanda antes de"
              + " gerar o memorial.",
          HttpStatus.CONFLICT);
    }
    List<ConsumerUnitGroup> groups = groupRepository.findAllByProjectIdOrderById(projectId);

    return new Memorial(
        "memorial-" + project.getProtocol() + ".pdf",
        build(project, calculation, groups, null, List.of()));
  }

  /**
   * The PDF of the latest version as it was issued, or as approved with reservations. Null for a
   * project with no version.
   */
  private Memorial storedMemorial(Long projectId) {
    return versionRepository
        .findLatestByProjectId(projectId)
        .map(
            version ->
                approvalMemorialRepository
                    .findByVersionId(version.getId())
                    .map(approval -> stored(approval.getMemorial()))
                    .orElseGet(() -> storedMemorial(version)))
        .orElse(null);
  }

  public static Memorial storedMemorial(ProjectVersion version) {
    return stored(version.getMemorial());
  }

  private static Memorial stored(ProjectVersionMemorial memorial) {
    return new Memorial(memorial.getFilename(), memorial.getData());
  }

  /** The code comes from a first rendering: a printed code cannot be part of its own hash. */
  public Issued issue(
      Project project,
      Calculation calculation,
      List<ConsumerUnitGroup> groups,
      int version,
      OffsetDateTime issuedAt,
      List<Finding> reservations) {
    byte[] unstamped =
        build(project, calculation, groups, new Stamp(version, issuedAt, ""), reservations);
    String code = MemorialFingerprint.verificationCode(MemorialFingerprint.sha256(unstamped));
    byte[] content =
        build(project, calculation, groups, new Stamp(version, issuedAt, code), reservations);

    String approval = reservations.isEmpty() ? "" : "-aprovado";
    return new Issued(
        "memorial-" + project.getProtocol() + "-v" + version + approval + ".pdf",
        content,
        MemorialFingerprint.sha256(content),
        code);
  }

  private byte[] build(
      Project project,
      Calculation calculation,
      List<ConsumerUnitGroup> groups,
      Stamp stamp,
      List<Finding> reservations) {
    ByteArrayOutputStream output = new ByteArrayOutputStream();
    Document document = new Document(PageSize.A4, MARGIN, MARGIN, 56, 64);
    PdfWriter writer = PdfWriter.getInstance(document, output);
    writer.setPageEvent(new PageFrame(project.getProtocol(), stamp));
    describe(document, writer, project, stamp);
    document.open();

    addHeader(document, project, stamp);
    addStamp(document, project, calculation, groups);
    addIdentification(document, project, calculation);
    addConsumerUnits(document, groups);
    addCalculationSteps(document, calculation);
    addDemandTotals(document, calculation);
    addAppliedStandards(document, calculation);
    addReservations(document, project, reservations);

    document.close();
    return output.toByteArray();
  }

  private static void describe(Document document, PdfWriter writer, Project project, Stamp stamp) {
    String protocol = project.getProtocol();
    String version = stamp == null ? "Prévia" : String.valueOf(stamp.version());
    User owner = project.getOwner();
    String designer = owner == null ? EMPTY : owner.getName();
    String standards = standards(project);

    document.addTitle("Memorial de Cálculo de Demanda " + protocol);
    document.addAuthor(designer);
    document.addSubject("Protocolo " + protocol + ", versão " + version);
    document.addKeywords(standards);
    document.addCreator("AMPERE");
    writer.getInfo().put(new PdfName("Protocol"), new PdfString(protocol, PdfString.TEXT_UNICODE));
    writer.getInfo().put(new PdfName("Version"), new PdfString(version, PdfString.TEXT_UNICODE));
    writer.getInfo().put(new PdfName("Designer"), new PdfString(designer, PdfString.TEXT_UNICODE));
    writer
        .getInfo()
        .put(new PdfName("Standards"), new PdfString(standards, PdfString.TEXT_UNICODE));
  }

  private static void addHeader(Document document, Project project, Stamp stamp) {
    Paragraph brand = new Paragraph("", BRAND_FONT);
    brand.add(spaced("AMPERE", BRAND_FONT, 1.5f));
    brand.add(new Chunk("   ", EYEBROW_FONT));
    brand.add(eyebrow("Memorial descritivo de cálculo de demanda", EYEBROW_FONT));
    if (stamp == null) {
      brand.add(new Chunk("   ", EYEBROW_FONT));
      brand.add(spaced("PRÉVIA", PREVIEW_TAG_FONT, 1.5f));
    }
    brand.setSpacingAfter(14);
    document.add(brand);

    PdfPTable header = table(new float[] {70, 30});

    PdfPCell title = cell();
    Paragraph heading = new Paragraph("Memorial de Cálculo de Demanda", TITLE_FONT);
    heading.setLeading(0, 1.2f);
    title.addElement(heading);
    Paragraph subtitle =
        new Paragraph(standards(project) + ", " + project.getName(), SUBTITLE_FONT);
    subtitle.setSpacingBefore(4);
    title.addElement(subtitle);
    title.setPaddingRight(16);
    title.setVerticalAlignment(Element.ALIGN_BOTTOM);
    header.addCell(title);

    PdfPCell protocol = cell();
    protocol.setBackgroundColor(PRIMARY);
    protocol.setPadding(14);
    Paragraph label = new Paragraph(eyebrow("Protocolo", PROTOCOL_LABEL_FONT));
    label.setSpacingAfter(10);
    protocol.addElement(label);
    protocol.addElement(new Paragraph(orEmpty(project.getProtocol()), PROTOCOL_FONT));
    header.addCell(protocol);

    header.setSpacingAfter(18);
    document.add(header);
  }

  private static void addStamp(
      Document document, Project project, Calculation calculation, List<ConsumerUnitGroup> groups) {
    PdfPTable stamp = table(new float[] {28, 24, 24, 24});
    addStampCell(stamp, "Norma aplicada", standards(project), true);
    addStampCell(stamp, "Unidades", units(groups), false);
    addStampCell(
        stamp, "Demanda prevista", decimal(calculation.getFinalTotalDemand()) + " kVA", false);
    addStampCell(
        stamp,
        "Data do cálculo",
        BrazilianDateFormat.dateTime(calculation.getCalculatedAt()),
        false);
    document.add(stamp);
  }

  private static void addStampCell(PdfPTable stamp, String label, String value, boolean first) {
    PdfPCell cell = cell();
    cell.setBorder(Rectangle.TOP | Rectangle.BOTTOM | (first ? 0 : Rectangle.LEFT));
    cell.setBorderColor(BORDER);
    cell.setBorderWidth(0.75f);
    cell.setPaddingTop(8);
    cell.setPaddingBottom(10);
    cell.setPaddingLeft(first ? 0 : 10);
    Paragraph caption = new Paragraph(eyebrow(label, EYEBROW_FONT));
    caption.setSpacingAfter(4);
    cell.addElement(caption);
    cell.addElement(new Paragraph(orEmpty(value), STAMP_VALUE_FONT));
    stamp.addCell(cell);
  }

  private static void addSection(Document document, int number, String text) {
    PdfPTable section = table(new float[] {100});
    PdfPCell cell = cell();
    Phrase phrase = new Phrase("", SECTION_FONT);
    phrase.add(new Chunk(String.format("%02d", number) + "   ", SECTION_NUMBER_FONT));
    phrase.add(new Chunk(text, SECTION_FONT));
    cell.setPhrase(phrase);
    cell.setBorder(Rectangle.BOTTOM);
    cell.setBorderColor(INK);
    cell.setBorderWidth(1.5f);
    cell.setPaddingBottom(7);
    section.addCell(cell);
    section.setSpacingBefore(24);
    section.setKeepTogether(true);
    document.add(section);
  }

  private static PdfPTable fields() {
    return table(new float[] {42, 58});
  }

  private static void addField(PdfPTable fields, String label, String value) {
    fields.addCell(ruled(new Phrase(label, LABEL_FONT), Element.ALIGN_LEFT));
    fields.addCell(ruled(new Phrase(orEmpty(value), VALUE_FONT), Element.ALIGN_LEFT));
  }

  private static void addIdentification(
      Document document, Project project, Calculation calculation) {
    addSection(document, 1, "Identificação do Projeto");
    PdfPTable fields = fields();
    addField(fields, "Nome", project.getName());
    addField(fields, "Protocolo", project.getProtocol());
    User owner = project.getOwner();
    if (owner != null && owner.getCrea() != null) {
      addField(fields, "Responsável técnico", owner.getName());
      addField(fields, "CREA", owner.creaWithState());
    }
    addField(fields, "Endereço", project.getAddress());
    addField(fields, "Município", project.getMunicipality() + "/" + project.getState());
    if (project.getPostalCode() != null) {
      addField(fields, "CEP", project.formattedPostalCode());
    }
    addField(fields, "Tipo de edificação", calculation.getBuildingType().label());
    addField(fields, "Tensão de fornecimento", calculation.getSupplyVoltage().label());
    addField(fields, "Tipo de ligação", calculation.getConnectionType().label());
    addField(fields, "Padrão de entrada", calculation.getEntranceStandard().label());
    addField(
        fields, "Data do cálculo", BrazilianDateFormat.dateTime(calculation.getCalculatedAt()));
    document.add(fields);
  }

  private static void addConsumerUnits(Document document, List<ConsumerUnitGroup> groups) {
    addSection(document, 2, "Unidades Consumidoras");
    if (groups.isEmpty()) {
      document.add(note("Nenhuma unidade consumidora cadastrada."));
      return;
    }

    Column[] columns = {
      new Column("Grupo", 40, false),
      new Column("Ligação", 20, false),
      new Column("Quantidade", 15, true),
      new Column("Carga por unidade (kW)", 25, true)
    };
    PdfPTable table = dataTable(columns);
    for (ConsumerUnitGroup group : groups) {
      ConnectionType connection = group.spec().connectionType();
      addRow(
          table,
          columns,
          group.getName(),
          connection == null ? NOT_APPLICABLE : connection.label(),
          String.valueOf(group.getQuantity()),
          decimal(group.loadPerUnitKw()));
    }
    document.add(table);
  }

  private static void addCalculationSteps(Document document, Calculation calculation) {
    addSection(document, 3, "Memória de Cálculo");
    List<CalculationStep> applying =
        calculation.getSteps().stream().filter(CalculationStep::applies).toList();
    List<CalculationStep> steps =
        applying.stream().filter(step -> !DemandStep.INDIVIDUAL.equals(step.getCode())).toList();
    if (steps.isEmpty()) {
      document.add(note("Nenhuma parcela de demanda se aplica."));
      return;
    }

    Column[] columns = {
      new Column("Parcela", 10, false),
      new Column("Descrição", 32, false),
      new Column("Fórmula", 38, false),
      new Column("Valor (kVA)", 20, true)
    };
    PdfPTable table = dataTable(columns);
    for (CalculationStep step : steps) {
      addRow(
          table,
          columns,
          step.getCode(),
          step.getTitle(),
          step.getFormula(),
          decimal(step.getValueKva()));
    }
    document.add(table);
    addIndividualDemand(document, applying);
  }

  /** DIS-NOR-053 item 6.22.3: each apartment on its own, apart from the building's demand. */
  private static void addIndividualDemand(Document document, List<CalculationStep> steps) {
    steps.stream()
        .filter(step -> DemandStep.INDIVIDUAL.equals(step.getCode()))
        .findFirst()
        .ifPresent(
            step -> {
              Paragraph caption =
                  new Paragraph(
                      "Demanda Individual dos Apartamentos (DIS-NOR-053, item 6.22.3)",
                      CAPTION_FONT);
              caption.setSpacingBefore(16);
              caption.setSpacingAfter(4);
              document.add(caption);
              step.getDetails().forEach(line -> document.add(note(line)));
            });
  }

  private static void addDemandTotals(Document document, Calculation calculation) {
    addSection(document, 4, "Demanda Prevista");
    PdfPTable fields = fields();
    addField(fields, "Demanda residencial (kVA)", decimal(calculation.getResidentialDemandFinal()));
    addField(fields, "Demanda de serviços (kVA)", decimal(calculation.getServiceDemand()));
    addField(fields, "Demanda comercial (kVA)", decimal(calculation.getCommercialDemand()));
    addField(
        fields,
        "Demanda de recarga de veículos elétricos (kVA)",
        decimal(calculation.getEvChargingDemand()));
    addField(
        fields, "Demanda total calculada (kVA)", decimal(calculation.getCalculatedTotalDemand()));
    if (calculation.getMinimumTotalDemand() != null) {
      addField(fields, "Demanda mínima (kVA)", decimal(calculation.getMinimumTotalDemand()));
    }
    addField(fields, "Demanda total prevista (kVA)", decimal(calculation.getFinalTotalDemand()));
    addField(fields, "Demanda mínima aplicada", calculation.isMinimumApplied() ? "Sim" : "Não");
    addField(fields, "Corrente (A)", decimal(calculation.getCurrentAmps()));
    if (calculation.getServiceEntranceBand() != null) {
      addField(fields, "Faixa do ramal de entrada", calculation.getServiceEntranceBand());
    }
    if (calculation.getServiceEntranceCircuits() != null) {
      addField(
          fields,
          "Circuitos do ramal de entrada",
          String.valueOf(calculation.getServiceEntranceCircuits()));
    }
    if (calculation.getCableSectionMm2() != null) {
      addField(fields, "Seção do cabo (mm²)", decimal(calculation.getCableSectionMm2()));
    }
    if (calculation.getBreakerAmps() != null) {
      addField(fields, "Disjuntor (A)", decimal(calculation.getBreakerAmps()));
    }
    document.add(fields);

    PdfPTable total = table(new float[] {55, 45});
    PdfPCell label = cell();
    label.setPhrase(new Phrase(eyebrow("Demanda total prevista", EYEBROW_FONT)));
    PdfPCell value = cell();
    value.setPhrase(new Phrase(decimal(calculation.getFinalTotalDemand()) + " kVA", TOTAL_FONT));
    value.setHorizontalAlignment(Element.ALIGN_RIGHT);
    for (PdfPCell cell : List.of(label, value)) {
      cell.setBackgroundColor(ACCENT);
      cell.setVerticalAlignment(Element.ALIGN_MIDDLE);
      cell.setPaddingTop(10);
      cell.setPaddingBottom(14);
      cell.setPaddingLeft(12);
      cell.setPaddingRight(12);
      total.addCell(cell);
    }
    total.setSpacingBefore(12);
    total.setKeepTogether(true);
    document.add(total);
  }

  private static void addAppliedStandards(Document document, Calculation calculation) {
    addSection(document, 5, "Normas Aplicadas");
    PdfPTable fields = fields();
    if (calculation.getMainStandard() != null) {
      addField(
          fields,
          "Norma principal",
          standard(calculation.getMainStandard(), calculation.getMainStandardRevision()));
    }
    if (calculation.getSecondaryStandard() != null) {
      addField(
          fields,
          "Norma complementar",
          standard(calculation.getSecondaryStandard(), calculation.getSecondaryStandardRevision()));
    }
    document.add(fields);

    List<AppliedTable> tables = calculation.getAppliedTables();
    if (tables.isEmpty()) {
      return;
    }

    Paragraph caption = new Paragraph("Tabelas normativas consultadas", CAPTION_FONT);
    caption.setSpacingBefore(16);
    caption.setSpacingAfter(4);
    document.add(caption);

    Column[] columns = {
      new Column("Identificação", 30, false),
      new Column("Norma", 30, false),
      new Column("Item", 25, false),
      new Column("Página", 15, true)
    };
    PdfPTable table = dataTable(columns);
    for (AppliedTable applied : tables) {
      addRow(
          table,
          columns,
          applied.getIdentification(),
          standard(applied.getStandard(), applied.getRevision()),
          applied.getItem(),
          applied.getPage());
    }
    document.add(table);
  }

  /** Only an approval with reservations reissues the memorial with this section. */
  private static void addReservations(
      Document document, Project project, List<Finding> reservations) {
    if (reservations.isEmpty()) {
      return;
    }

    addSection(document, 6, "Ressalvas");
    String approvedAt =
        project.getReviewedAt() == null
            ? EMPTY
            : BrazilianDateFormat.date(
                project.getReviewedAt().atZoneSameInstant(Timestamps.ZONE).toLocalDate());
    String reviewer = project.getReviewer() == null ? EMPTY : project.getReviewer().getName();
    document.add(
        note(
            "Aprovado em "
                + approvedAt
                + " por "
                + reviewer
                + ". Os ajustes abaixo não foram resolvidos e o projeto segue aprovado com eles."));

    Column[] columns = {
      new Column("Etapa", 22, false),
      new Column("Apontamento", 53, false),
      new Column("Item da Norma", 25, false)
    };
    PdfPTable table = dataTable(columns);
    table.setSpacingBefore(8);
    for (Finding reservation : reservations) {
      addRow(
          table,
          columns,
          reservation.getStage().label(),
          reservation.getDescription(),
          reservation.getStandardItem());
    }
    document.add(table);
  }

  private static PdfPTable table(float[] widths) {
    PdfPTable table = new PdfPTable(widths.length);
    table.setWidthPercentage(100);
    table.setWidths(widths);
    return table;
  }

  private static PdfPCell cell() {
    PdfPCell cell = new PdfPCell();
    cell.setBorder(Rectangle.NO_BORDER);
    cell.setPadding(0);
    return cell;
  }

  /** Row with the hairline divider the screens use between list items. */
  private static PdfPCell ruled(Phrase phrase, int alignment) {
    PdfPCell cell = cell();
    cell.setPhrase(phrase);
    cell.setHorizontalAlignment(alignment);
    cell.setBorder(Rectangle.BOTTOM);
    cell.setBorderColor(BORDER);
    cell.setBorderWidth(0.75f);
    cell.setPaddingTop(6);
    cell.setPaddingBottom(7);
    cell.setPaddingRight(8);
    return cell;
  }

  private static PdfPTable dataTable(Column[] columns) {
    float[] widths = new float[columns.length];
    for (int i = 0; i < columns.length; i++) {
      widths[i] = columns[i].width();
    }

    PdfPTable table = table(widths);
    table.setHeaderRows(1);
    for (Column column : columns) {
      PdfPCell cell = cell();
      cell.setPhrase(new Phrase(eyebrow(column.header(), EYEBROW_FONT)));
      cell.setHorizontalAlignment(column.numeric() ? Element.ALIGN_RIGHT : Element.ALIGN_LEFT);
      cell.setBorder(Rectangle.BOTTOM);
      cell.setBorderColor(INK);
      cell.setBorderWidth(1);
      cell.setPaddingTop(8);
      cell.setPaddingBottom(6);
      cell.setPaddingRight(8);
      table.addCell(cell);
    }
    return table;
  }

  private static void addRow(PdfPTable table, Column[] columns, String... values) {
    for (int i = 0; i < values.length; i++) {
      boolean numeric = columns[i].numeric();
      table.addCell(
          ruled(
              new Phrase(orEmpty(values[i]), numeric ? NUMBER_FONT : CELL_FONT),
              numeric ? Element.ALIGN_RIGHT : Element.ALIGN_LEFT));
    }
  }

  private static Paragraph note(String text) {
    Paragraph note = new Paragraph(text, LABEL_FONT);
    note.setSpacingBefore(8);
    return note;
  }

  /** Mono, uppercase and tracked, like the labels of the screens. */
  private static Chunk eyebrow(String text, Font font) {
    return spaced(text.toUpperCase(PT_BR), font, 0.6f);
  }

  private static Chunk spaced(String text, Font font, float spacing) {
    Chunk chunk = new Chunk(text, font);
    chunk.setCharacterSpacing(spacing);
    return chunk;
  }

  private static String standards(Project project) {
    String names =
        project.getStandards().stream()
            .map(standard -> standard(standard.getName(), standard.getRevision()))
            .collect(Collectors.joining(" e "));
    return names.isEmpty() ? EMPTY : names;
  }

  private static String units(List<ConsumerUnitGroup> groups) {
    int total = groups.stream().mapToInt(ConsumerUnitGroup::getQuantity).sum();
    return total + " em " + groups.size() + (groups.size() == 1 ? " grupo" : " grupos");
  }

  private static String standard(String name, String revision) {
    return revision == null ? name : name + " " + revision;
  }

  private static String decimal(BigDecimal value) {
    if (value == null) {
      return EMPTY;
    }

    return BrazilianNumberFormat.format(value);
  }

  private static String orEmpty(String value) {
    return value == null || value.isBlank() ? EMPTY : value;
  }

  private static BaseFont font(String file) {
    try (InputStream input = MemorialPdfService.class.getResourceAsStream("/fonts/" + file)) {
      if (input == null) {
        throw new IllegalStateException("Fonte ausente: " + file);
      }
      return BaseFont.createFont(
          file, BaseFont.IDENTITY_H, BaseFont.EMBEDDED, true, input.readAllBytes(), null);
    } catch (IOException exception) {
      throw new UncheckedIOException(exception);
    }
  }

  /** Green brand bar on top and the identification of the version at the foot of every page. */
  private static final class PageFrame extends PdfPageEventHelper {

    private final String protocol;
    private final Stamp stamp;

    private PageFrame(String protocol, Stamp stamp) {
      this.protocol = protocol;
      this.stamp = stamp;
    }

    @Override
    public void onEndPage(PdfWriter writer, Document document) {
      Rectangle page = document.getPageSize();
      PdfContentByte canvas = writer.getDirectContent();

      canvas.saveState();
      canvas.setColorFill(GREEN);
      canvas.rectangle(0, page.getHeight() - 6, page.getWidth(), 6);
      canvas.fill();

      float footer = 40;
      canvas.setColorStroke(BORDER);
      canvas.setLineWidth(0.75f);
      canvas.moveTo(MARGIN, footer + 12);
      canvas.lineTo(page.getWidth() - MARGIN, footer + 12);
      canvas.stroke();
      canvas.restoreState();

      String identification = "AMPERE, protocolo " + orEmpty(protocol);
      String second;
      if (stamp == null) {
        identification += ", prévia";
        second = "Prévia sem validade e sem código de verificação";
        watermark(writer, page);
      } else {
        identification +=
            ", versão " + stamp.version() + ", " + BrazilianDateFormat.dateTime(stamp.issuedAt());
        second = "Código de verificação " + stamp.code();
      }

      ColumnText.showTextAligned(
          canvas,
          Element.ALIGN_LEFT,
          new Phrase(eyebrow(identification, FOOTER_FONT)),
          MARGIN,
          footer,
          0);
      ColumnText.showTextAligned(
          canvas,
          Element.ALIGN_LEFT,
          new Phrase(eyebrow(second, FOOTER_FONT)),
          MARGIN,
          footer - 11,
          0);
      ColumnText.showTextAligned(
          canvas,
          Element.ALIGN_RIGHT,
          new Phrase(eyebrow("Página " + writer.getPageNumber(), FOOTER_FONT)),
          page.getWidth() - MARGIN,
          footer,
          0);
    }

    private static void watermark(PdfWriter writer, Rectangle page) {
      PdfContentByte under = writer.getDirectContentUnder();
      PdfGState opacity = new PdfGState();
      opacity.setFillOpacity(0.08f);
      under.saveState();
      under.setGState(opacity);
      under.setColorFill(INK);
      under.beginText();
      under.setFontAndSize(SANS_SEMIBOLD, 110);
      under.showTextAligned(
          Element.ALIGN_CENTER, "PRÉVIA", page.getWidth() / 2, page.getHeight() / 2, 45);
      under.endText();
      under.restoreState();
    }
  }
}
