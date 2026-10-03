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
import com.lowagie.text.DocumentException;
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
import java.time.format.DateTimeFormatter;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Gera o PDF do memorial de calculo de demanda.
 *
 * <p>O memorial e o documento tecnico que resume o projeto, as unidades consumidoras, a memoria de
 * calculo e a demanda prevista. Ele e gerado sob demanda (nao e armazenado) a partir do ultimo
 * calculo feito para o projeto.
 *
 * <p>Usa a biblioteca OpenPDF (fork open-source do iText 4) para montar o PDF programaticamente.
 *
 * <p>Enquanto a US04 (motor de calculo) nao estiver pronta, o PDF e gerado a partir dos dados de
 * seed, se houver calculo salvo.
 */
@Service
public class MemorialPdfService {

  private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");

  // Fontes usadas no PDF — definidas como constantes para reutilizar.
  private static final Font TITLE_FONT = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18);
  private static final Font SECTION_FONT = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 14);
  private static final Font LABEL_FONT = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10);
  private static final Font VALUE_FONT = FontFactory.getFont(FontFactory.HELVETICA, 10);
  private static final Font TABLE_HEADER_FONT =
      FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9, Color.WHITE);
  private static final Font TABLE_CELL_FONT = FontFactory.getFont(FontFactory.HELVETICA, 9);

  private static final Color HEADER_BG = new Color(44, 62, 80);
  private static final Color ALT_ROW_BG = new Color(241, 245, 249);

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

  /**
   * Gera o PDF do memorial para o projeto informado.
   *
   * <p>Busca o projeto, o ultimo calculo e os grupos de UCs. Se nao houver calculo, lanca 404.
   *
   * @param projectId ID do projeto
   * @return bytes do PDF gerado
   */
  @Transactional(readOnly = true)
  public byte[] generate(Long projectId) {
    // 1. Busca o projeto (lanca 404 se nao existir).
    Project project = projectService.findById(projectId);

    // 2. Busca o ultimo calculo do projeto (lanca 404 se nao houver calculo).
    Calculation calculation =
        calculationRepository
            .findFirstByProjectIdOrderByIdDesc(projectId)
            .orElseThrow(
                () ->
                    new NotFoundException(
                        "Nenhum cálculo encontrado para este projeto. "
                            + "Execute o cálculo de demanda antes de gerar o memorial."));

    // 3. Busca os grupos de unidades consumidoras do projeto.
    List<ConsumerUnitGroup> groups = groupRepository.findAllByProjectIdOrderById(projectId);

    // 4. Monta o PDF em memoria usando OpenPDF.
    return buildPdf(project, calculation, groups);
  }

  /**
   * Monta o documento PDF completo com todas as secoes do memorial.
   *
   * <p>Secoes: Identificacao, Unidades Consumidoras, Memoria de Calculo, Demanda Total, Normas
   * Aplicadas.
   */
  private byte[] buildPdf(
      Project project, Calculation calculation, List<ConsumerUnitGroup> groups) {
    try (ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {
      // Cria documento A4 com margens de 36pt (meia polegada).
      Document document = new Document(PageSize.A4, 36, 36, 36, 36);
      PdfWriter.getInstance(document, outputStream);
      document.open();

      // Titulo principal do memorial.
      addTitle(document, "Memorial de Cálculo de Demanda");

      // Secao 1: dados de identificacao do projeto.
      addProjectIdentification(document, project, calculation);

      // Secao 2: tabela com os grupos de unidades consumidoras.
      addConsumerUnits(document, groups);

      // Secao 3: passos da memoria de calculo.
      addCalculationSteps(document, calculation);

      // Secao 4: resumo da demanda total.
      addDemandTotals(document, calculation);

      // Secao 5: normas e tabelas normativas aplicadas.
      addAppliedStandards(document, calculation);

      document.close();
      return outputStream.toByteArray();
    } catch (DocumentException exception) {
      throw new RuntimeException("Erro ao gerar o PDF do memorial.", exception);
    } catch (java.io.IOException exception) {
      throw new RuntimeException("Erro de I/O ao gerar o PDF do memorial.", exception);
    }
  }

  // Adiciona o titulo centralizado no topo do PDF.
  private void addTitle(Document document, String text) throws DocumentException {
    Paragraph title = new Paragraph(text, TITLE_FONT);
    title.setAlignment(Element.ALIGN_CENTER);
    title.setSpacingAfter(20);
    document.add(title);
  }

  // Adiciona um cabecalho de secao (ex: "1. Identificação do Projeto").
  private void addSection(Document document, String text) throws DocumentException {
    Paragraph section = new Paragraph(text, SECTION_FONT);
    section.setSpacingBefore(16);
    section.setSpacingAfter(8);
    document.add(section);
  }

  // Adiciona um par "label: valor" (ex: "Protocolo: 2026-1001").
  private void addField(Document document, String label, String value) throws DocumentException {
    Paragraph paragraph = new Paragraph();
    paragraph.add(new Phrase(label + ": ", LABEL_FONT));
    paragraph.add(new Phrase(value != null ? value : "—", VALUE_FONT));
    paragraph.setSpacingAfter(4);
    document.add(paragraph);
  }

  /**
   * Secao 1: Identificacao do Projeto.
   *
   * <p>Mostra nome, protocolo, endereco, municipio, tipo de edificacao, tensao, tipo de ligacao,
   * padrao de entrada e data do calculo.
   */
  private void addProjectIdentification(Document document, Project project, Calculation calculation)
      throws DocumentException {
    addSection(document, "1. Identificação do Projeto");

    addField(document, "Nome", project.getName());
    addField(document, "Protocolo", project.getProtocol());
    addField(document, "Endereço", project.getAddress());
    addField(document, "Município", project.getMunicipality());
    addField(document, "Tipo de edificação", calculation.getBuildingType().name());
    addField(document, "Tensão de fornecimento", calculation.getSupplyVoltage().label());
    addField(document, "Tipo de ligação", calculation.getConnectionType().label());
    addField(document, "Padrão de entrada", calculation.getEntranceStandard().label());
    addField(document, "Data do cálculo", calculation.getCalculatedAt().format(DATE_FMT));
  }

  /**
   * Secao 2: Unidades Consumidoras.
   *
   * <p>Tabela com os grupos de UCs cadastrados: nome, quantidade e carga por unidade (kW).
   */
  private void addConsumerUnits(Document document, List<ConsumerUnitGroup> groups)
      throws DocumentException {
    addSection(document, "2. Unidades Consumidoras");

    if (groups.isEmpty()) {
      document.add(new Paragraph("Nenhuma unidade consumidora cadastrada.", VALUE_FONT));
      return;
    }

    // Tabela com 3 colunas: Nome do grupo, Quantidade, Carga por unidade.
    PdfPTable table = new PdfPTable(3);
    table.setWidthPercentage(100);
    table.setWidths(new float[] {50, 25, 25});

    addHeaderCell(table, "Grupo");
    addHeaderCell(table, "Quantidade");
    addHeaderCell(table, "Carga/unidade (kW)");

    for (int i = 0; i < groups.size(); i++) {
      ConsumerUnitGroup group = groups.get(i);
      Color bg = i % 2 == 1 ? ALT_ROW_BG : Color.WHITE;
      addDataCell(table, group.getName(), bg);
      addDataCell(table, String.valueOf(group.getQuantity()), bg);
      addDataCell(table, formatDecimal(group.loadPerUnitKw()), bg);
    }

    document.add(table);
  }

  /**
   * Secao 3: Memoria de Calculo.
   *
   * <p>Tabela com os passos do calculo: indice, parcela, formula e valor em kVA. Cada passo
   * representa uma parcela da demanda (residencial, servicos, comercial, veiculos eletricos, etc.)
   */
  private void addCalculationSteps(Document document, Calculation calculation)
      throws DocumentException {
    addSection(document, "3. Memória de Cálculo");

    List<CalculationStep> steps = calculation.getSteps();
    if (steps.isEmpty()) {
      document.add(new Paragraph("Nenhum passo de cálculo registrado.", VALUE_FONT));
      return;
    }

    // Tabela com 4 colunas: Passo, Parcela, Formula, Valor (kVA).
    PdfPTable table = new PdfPTable(4);
    table.setWidthPercentage(100);
    table.setWidths(new float[] {10, 30, 35, 25});

    addHeaderCell(table, "#");
    addHeaderCell(table, "Parcela");
    addHeaderCell(table, "Fórmula");
    addHeaderCell(table, "Valor (kVA)");

    for (int i = 0; i < steps.size(); i++) {
      CalculationStep step = steps.get(i);
      Color bg = i % 2 == 1 ? ALT_ROW_BG : Color.WHITE;
      addDataCell(table, String.valueOf(i + 1), bg);
      addDataCell(table, step.getTitle(), bg);
      addDataCell(table, step.getFormula() != null ? step.getFormula() : "—", bg);
      addDataCell(table, formatDecimal(step.getValueKva()), bg);
    }

    document.add(table);
  }

  /**
   * Secao 4: Demanda Total.
   *
   * <p>Mostra as parcelas finais e a demanda total calculada, com informacoes do ramal de entrada
   * (corrente, disjuntor, secao do cabo).
   */
  private void addDemandTotals(Document document, Calculation calculation)
      throws DocumentException {
    addSection(document, "4. Demanda Total");

    addField(
        document,
        "Demanda residencial (kVA)",
        formatDecimal(calculation.getResidentialDemandFinal()));
    addField(document, "Demanda de serviços (kVA)", formatDecimal(calculation.getServiceDemand()));
    addField(document, "Demanda comercial (kVA)", formatDecimal(calculation.getCommercialDemand()));
    addField(
        document,
        "Demanda veículos elétricos (kVA)",
        formatDecimal(calculation.getEvChargingDemand()));
    addField(
        document,
        "Demanda total calculada (kVA)",
        formatDecimal(calculation.getCalculatedTotalDemand()));

    if (calculation.getMinimumTotalDemand() != null) {
      addField(
          document, "Demanda mínima (kVA)", formatDecimal(calculation.getMinimumTotalDemand()));
    }
    addField(
        document, "Demanda total final (kVA)", formatDecimal(calculation.getFinalTotalDemand()));
    addField(document, "Mínima aplicada", calculation.isMinimumApplied() ? "Sim" : "Não");

    document.add(new Paragraph(" ", VALUE_FONT));
    addField(document, "Corrente (A)", formatDecimal(calculation.getCurrentAmps()));

    if (calculation.getServiceEntranceBand() != null) {
      addField(document, "Faixa do ramal", calculation.getServiceEntranceBand());
    }
    if (calculation.getServiceEntranceCircuits() != null) {
      addField(
          document,
          "Circuitos de entrada",
          String.valueOf(calculation.getServiceEntranceCircuits()));
    }
    if (calculation.getCableSectionMm2() != null) {
      addField(document, "Seção do cabo (mm²)", formatDecimal(calculation.getCableSectionMm2()));
    }
    if (calculation.getBreakerAmps() != null) {
      addField(document, "Disjuntor (A)", formatDecimal(calculation.getBreakerAmps()));
    }
  }

  /**
   * Secao 5: Normas Aplicadas.
   *
   * <p>Lista as normas (standard + revisao) e as tabelas normativas consultadas durante o calculo.
   */
  private void addAppliedStandards(Document document, Calculation calculation)
      throws DocumentException {
    addSection(document, "5. Normas Aplicadas");

    // Norma principal (DIS-NOR-053).
    if (calculation.getMainStandard() != null) {
      addField(
          document,
          "Norma principal",
          calculation.getMainStandard() + " " + calculation.getMainStandardRevision());
    }

    // Norma secundaria (DIS-NOR-030).
    if (calculation.getSecondaryStandard() != null) {
      addField(
          document,
          "Norma secundária",
          calculation.getSecondaryStandard() + " " + calculation.getSecondaryStandardRevision());
    }

    // Tabelas normativas consultadas.
    List<AppliedTable> tables = calculation.getAppliedTables();
    if (!tables.isEmpty()) {
      document.add(new Paragraph(" ", VALUE_FONT));
      document.add(new Paragraph("Tabelas normativas consultadas:", LABEL_FONT));

      PdfPTable pdfTable = new PdfPTable(4);
      pdfTable.setWidthPercentage(100);
      pdfTable.setWidths(new float[] {30, 25, 25, 20});
      pdfTable.setSpacingBefore(6);

      addHeaderCell(pdfTable, "Identificação");
      addHeaderCell(pdfTable, "Norma");
      addHeaderCell(pdfTable, "Item");
      addHeaderCell(pdfTable, "Página");

      for (int i = 0; i < tables.size(); i++) {
        AppliedTable table = tables.get(i);
        Color bg = i % 2 == 1 ? ALT_ROW_BG : Color.WHITE;
        addDataCell(pdfTable, table.getIdentification(), bg);
        addDataCell(pdfTable, table.getStandard() + " " + table.getRevision(), bg);
        addDataCell(pdfTable, table.getItem(), bg);
        addDataCell(pdfTable, table.getPage(), bg);
      }

      document.add(pdfTable);
    }
  }

  // Cria uma celula de cabecalho de tabela (fundo escuro, texto branco).
  private void addHeaderCell(PdfPTable table, String text) {
    PdfPCell cell = new PdfPCell(new Phrase(text, TABLE_HEADER_FONT));
    cell.setBackgroundColor(HEADER_BG);
    cell.setPadding(6);
    cell.setHorizontalAlignment(Element.ALIGN_CENTER);
    table.addCell(cell);
  }

  // Cria uma celula de dados de tabela (fundo alternado para facilitar leitura).
  private void addDataCell(PdfPTable table, String text, Color bgColor) {
    PdfPCell cell = new PdfPCell(new Phrase(text != null ? text : "—", TABLE_CELL_FONT));
    cell.setBackgroundColor(bgColor);
    cell.setPadding(5);
    table.addCell(cell);
  }

  // Formata BigDecimal para string legivel, ou retorna "—" se nulo.
  private String formatDecimal(java.math.BigDecimal value) {
    return value != null ? value.toPlainString() : "—";
  }
}
