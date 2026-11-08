package br.com.ampere.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.containsString;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import br.com.ampere.config.NormativeTableSeed;
import br.com.ampere.domain.ConnectionType;
import br.com.ampere.domain.EntranceStandard;
import br.com.ampere.domain.EvStationType;
import br.com.ampere.domain.GroupKind;
import br.com.ampere.domain.GroupSpec;
import br.com.ampere.domain.LoadCategory;
import br.com.ampere.domain.LoadItem;
import br.com.ampere.domain.LoadUsage;
import br.com.ampere.domain.PowerUnit;
import br.com.ampere.domain.Project;
import br.com.ampere.domain.ProjectStatus;
import br.com.ampere.domain.ResidentialMultifamily;
import br.com.ampere.domain.Standard;
import br.com.ampere.domain.SupplyVoltage;
import br.com.ampere.domain.User;
import br.com.ampere.domain.UserRole;
import br.com.ampere.repository.CalculationRepository;
import br.com.ampere.repository.ConsumerUnitGroupRepository;
import br.com.ampere.repository.FindingRepository;
import br.com.ampere.repository.NormativeTableRepository;
import br.com.ampere.repository.ProjectRepository;
import br.com.ampere.repository.StandardRepository;
import br.com.ampere.repository.UserRepository;
import java.io.ByteArrayInputStream;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.function.Function;
import java.util.regex.Pattern;
import java.util.stream.Collectors;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellType;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.ss.usermodel.WorkbookFactory;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.transaction.annotation.Transactional;
import tools.jackson.databind.ObjectMapper;

/** US19: the calculation spreadsheet and the CSV of each listing. */
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class SpreadsheetExportIntegrationTest {

  private static final String PASSWORD = "senha@123";
  private static final String DESIGNER = "user@ampere.com";
  private static final String ANALYST = "revisor@ampere.com";
  private static final String ADMIN = "admin@ampere.com";
  private static final Pattern BR_DATE_TIME = Pattern.compile("\\d{2}/\\d{2}/\\d{4} \\d{2}:\\d{2}");

  @Autowired private MockMvc mockMvc;

  @Autowired private ObjectMapper objectMapper;

  @Autowired private PasswordEncoder passwordEncoder;

  @Autowired private UserRepository userRepository;

  @Autowired private StandardRepository standardRepository;

  @Autowired private NormativeTableRepository normativeTableRepository;

  @Autowired private ProjectRepository projectRepository;

  @Autowired private FindingRepository findingRepository;

  @Autowired private ConsumerUnitGroupRepository groupRepository;

  @Autowired private CalculationRepository calculationRepository;

  private List<Standard> standards;

  private OffsetDateTime now;

  private User owner;

  private User reviewer;

  @BeforeEach
  void seed() {
    calculationRepository.deleteAll();
    groupRepository.deleteAll();
    findingRepository.deleteAll();
    projectRepository.deleteAll();
    normativeTableRepository.deleteAll();
    standardRepository.deleteAll();
    userRepository.deleteAll();

    standards =
        standardRepository.saveAll(
            List.of(new Standard("DIS-NOR-053", "REV 06"), new Standard("DIS-NOR-030", "REV 07")));
    normativeTableRepository.saveAll(
        NormativeTableSeed.all(
            standards.stream().collect(Collectors.toMap(Standard::getName, Function.identity()))));
    String hash = passwordEncoder.encode(PASSWORD);
    owner = userRepository.save(new User("Usuário Teste", DESIGNER, hash, UserRole.USER));
    owner.updateProfile("Usuário Teste", "123456", "PE", null, null);
    userRepository.save(new User("Admin Teste", ADMIN, hash, UserRole.ADMIN));
    reviewer = userRepository.save(new User("Revisor Teste", ANALYST, hash, UserRole.REVIEWER));
    now = OffsetDateTime.now(ZoneOffset.UTC);
  }

  @Test
  void identifiesTheProjectAndNamesTheFileAfterItsProtocol() throws Exception {
    Project project = calculated("2026-2001");

    try (Workbook workbook = workbookOf(project, "2026-2001-calculo.xlsx")) {
      assertThat(sheetNames(workbook))
          .containsExactly(
              "Identificação",
              "Grupos",
              "Etapas",
              "Resultado",
              "Verificações",
              "Tabelas Aplicadas");
      Sheet identification = workbook.getSheet("Identificação");
      assertThat(text(identification, 1, 1)).isEqualTo("Residencial 2026-2001");
      assertThat(text(identification, 2, 1)).isEqualTo("2026-2001");
      assertThat(text(identification, 3, 1)).isEqualTo("Usuário Teste (CREA 123456/PE)");
      assertThat(text(identification, 7, 1)).isEqualTo("DIS-NOR-053 REV 06");
      assertThat(text(identification, 9, 1)).matches(BR_DATE_TIME);
    }
  }

  @Test
  void describesTheGroupsWithTheirLabels() throws Exception {
    try (Workbook workbook = workbookOf(calculated("2026-2001"), "2026-2001-calculo.xlsx")) {
      Sheet groups = workbook.getSheet("Grupos");
      assertThat(text(groups, 1, 0)).isEqualTo("Apartamento tipo A");
      assertThat(text(groups, 1, 1)).isEqualTo("Apartamento");
      assertThat(groups.getRow(1).getCell(2).getNumericCellValue()).isEqualTo(24);
      assertThat(text(groups, 3, 1)).isEqualTo("Carga instalada");
      assertThat(text(groups, 4, 1)).isEqualTo("Recarga de veículo elétrico");
      assertThat(text(groups, 4, 5)).isEqualTo("Validado");
    }
  }

  @Test
  void bringsTheStepsOfTheCalculationScreen() throws Exception {
    try (Workbook workbook = workbookOf(calculated("2026-2001"), "2026-2001-calculo.xlsx")) {
      Sheet steps = workbook.getSheet("Etapas");
      assertThat(text(steps, 1, 0)).isEqualTo("Drf");
      assertThat(text(steps, 1, 1)).isEqualTo("Demanda das Unidades Residenciais");
      assertThat(text(steps, 1, 4)).isEqualTo("DIS-NOR-053 REV 06");
      assertThat(text(steps, 1, 5)).isEqualTo("Anexo I, item 1");

      Cell value = steps.getRow(5).getCell(7);
      assertThat(value.getCellType()).isEqualTo(CellType.NUMERIC);
      assertThat(value.getCellStyle().getDataFormatString()).isEqualTo("#,##0.00");
      assertThat(text(steps, 5, 0)).isEqualTo("Ded");
      assertThat(text(steps, 5, 3)).contains("considera-se 135,00 kVA");

      assertThat(text(steps, 3, 0)).isEqualTo("Dc");
      assertThat(text(steps, 3, 3)).isEqualTo("Não se aplica");
      assertThat(text(steps, 3, 4)).isEqualTo("Não se aplica");
    }
  }

  @Test
  void bringsTheResultTheChecksAndTheAppliedTables() throws Exception {
    try (Workbook workbook = workbookOf(calculated("2026-2001"), "2026-2001-calculo.xlsx")) {
      Sheet result = workbook.getSheet("Resultado");
      assertThat(cellsOf(result, 0)).contains("Demanda total prevista (kVA)", "Corrente (A)");

      assertThat(cellsOf(workbook.getSheet("Verificações"), 0))
          .contains("Situação")
          .doesNotContain("PASSED", "INFO", "WARNING", "SKIPPED");

      Sheet tables = workbook.getSheet("Tabelas Aplicadas");
      assertThat(cellsOf(tables, 0)).contains("Quadro 35");
      assertThat(cellsOf(tables, 2)).contains("Anexo I, item 1");
    }
  }

  @Test
  void leavesNoBlankCellNorDashInTheWorkbook() throws Exception {
    try (Workbook workbook = workbookOf(calculated("2026-2001"), "2026-2001-calculo.xlsx")) {
      for (Sheet sheet : workbook) {
        for (Row row : sheet) {
          for (Cell cell : row) {
            if (cell.getCellType() != CellType.NUMERIC) {
              assertThat(cell.getStringCellValue()).isNotBlank().doesNotContain("—", "·");
            }
          }
        }
      }
    }
  }

  @Test
  void refusesAnOutdatedCalculationLikeTheMemorial() throws Exception {
    Project project = calculated("2026-2001");
    groupRepository.save(apartments(project, "Apartamento tipo C", 2, "68"));

    as(DESIGNER, get(xlsxOf(project)))
        .andExpect(status().isConflict())
        .andExpect(jsonPath("$.detail").value(containsString("exportar a planilha")));
  }

  @Test
  void answersNotFoundWithoutACalculation() throws Exception {
    Project project = projectRepository.save(project("2026-2001"));

    as(DESIGNER, get(xlsxOf(project))).andExpect(status().isNotFound());
  }

  @Test
  void keepsTheVisibilityRulesOfTheProject() throws Exception {
    Project draft = calculated("2026-2001");
    Project submitted = calculated("2026-2002");
    submitted.submit(now);
    projectRepository.save(submitted);
    userRepository.save(
        new User("Outro", "outro@ampere.com", passwordEncoder.encode(PASSWORD), UserRole.USER));

    as("outro@ampere.com", get(xlsxOf(draft))).andExpect(status().isNotFound());
    as(ANALYST, get(xlsxOf(draft))).andExpect(status().isNotFound());
    as(ANALYST, get(xlsxOf(submitted))).andExpect(status().isOk());
    as(ADMIN, get(xlsxOf(draft))).andExpect(status().isOk());
    mockMvc.perform(get(xlsxOf(draft))).andExpect(status().isUnauthorized());
    mockMvc.perform(get("/projects/export.csv")).andExpect(status().isUnauthorized());
  }

  @Test
  void exportsTheProjectsInPortugueseAndNeutralizesFormulas() throws Exception {
    Project calculated = calculated("2026-2001");
    calculated.rename("=Edifício; Aurora \"A\"", "Rua; 1", "Recife");
    projectRepository.save(calculated);
    projectRepository.save(project("2026-2002"));

    byte[] content =
        as(DESIGNER, get("/projects/export.csv").param("sort", "createdAt"))
            .andExpect(status().isOk())
            .andExpect(header().string("Content-Disposition", containsString("projetos-")))
            .andReturn()
            .getResponse()
            .getContentAsByteArray();
    List<String> rows = rows(content);

    assertThat(content).startsWith((byte) 0xef, (byte) 0xbb, (byte) 0xbf);
    assertThat(rows.get(0))
        .endsWith(
            "Protocolo;Projeto;Endereço;Município;UF;Projetista;Situação;Pendências;UCs;"
                + "Demanda (kVA);Criado em;Atualizado em");
    assertThat(rows).hasSize(3);
    assertThat(rows.get(2))
        .startsWith("2026-2001;\"'=Edifício; Aurora \"\"A\"\"\";\"Rua; 1\";Recife;PE;Usuário Teste")
        .contains(";Rascunho;0;51;")
        .contains(";135,00;");
    assertThat(rows.get(1)).contains(";Sem cálculo;");
    assertThat(rows.get(1).split(";")[10]).matches(BR_DATE_TIME);
  }

  @Test
  void appliesTheFiltersAndTheOrderOfTheListing() throws Exception {
    projectRepository.save(project("2026-2001"));
    Project submitted = project("2026-2002");
    submitted.submit(now);
    projectRepository.save(submitted);
    projectRepository.save(project("2026-2003"));

    List<String> drafts =
        csv(DESIGNER, "/projects/export.csv?status=DRAFT&sort=name&direction=DESC");

    assertThat(drafts).hasSize(3);
    assertThat(drafts.get(1)).startsWith("2026-2003;");
    assertThat(drafts.get(2)).startsWith("2026-2001;");
    assertThat(csv(DESIGNER, "/projects/export.csv?state=SP")).hasSize(1);
  }

  @Test
  void exportsEveryProjectInsteadOfOnePage() throws Exception {
    for (int index = 0; index < 25; index++) {
      projectRepository.save(project("2026-3" + String.format("%03d", index)));
    }

    assertThat(csv(DESIGNER, "/projects/export.csv")).hasSize(26);
  }

  @Test
  void refusesAnInvertedDateRange() throws Exception {
    as(DESIGNER, get("/projects/export.csv?createdFrom=2026-12-01&createdTo=2026-01-01"))
        .andExpect(status().isBadRequest());
  }

  @Test
  void exportsTheQueueInPortugueseOnlyForReviewers() throws Exception {
    Project assigned = calculated("2026-4501");
    assigned.rename("+Projeto; \"CSV\"", "Rua A; 1", "Recife");
    assigned.submit(now.minusDays(2));
    assigned.assignReviewer(reviewer);
    projectRepository.save(assigned);
    Project waiting = project("2026-4502");
    waiting.submit(now.minusDays(40));
    projectRepository.save(waiting);

    for (String email : List.of(ANALYST, ADMIN)) {
      List<String> rows = csv(email, "/review-queue/export.csv?sort=submittedAt");

      assertThat(rows.get(0))
          .endsWith(
              "Protocolo;Projeto;Município;UF;Projetista;Analista;Prazo;Vencimento;"
                  + "Dias restantes;Recebido em;Envio;Reanálise;UCs;Demanda (kVA);Alertas;"
                  + "Mensagens dos alertas");
      assertThat(rows).hasSize(3);
      assertThat(rows.get(1))
          .startsWith("2026-4502;Residencial 2026-4502;Recife;PE;Usuário Teste;Sem analista;")
          .contains(";Atrasado;")
          .contains(";1;Não;0;Sem cálculo;0;Sem alertas");
      assertThat(rows.get(2))
          .startsWith("2026-4501;\"'+Projeto; \"\"CSV\"\"\";Recife;PE;Usuário Teste;Revisor Teste;")
          .contains(";No Prazo;")
          .contains(";135,00;");
    }
    as(DESIGNER, get("/review-queue/export.csv")).andExpect(status().isForbidden());
  }

  @Test
  void appliesTheFiltersOfTheQueue() throws Exception {
    Project highDemand = calculated("2026-4501");
    highDemand.submit(now);
    projectRepository.save(highDemand);
    Project lowDemand = project("2026-4502");
    lowDemand.submit(now);
    projectRepository.save(lowDemand);

    List<String> rows = csv(ANALYST, "/review-queue/export.csv?filter=HIGH_DEMAND");

    assertThat(rows).hasSize(2);
    assertThat(rows.get(1)).startsWith("2026-4501;");
  }

  private Workbook workbookOf(Project project, String filename) throws Exception {
    byte[] content =
        as(DESIGNER, get(xlsxOf(project)))
            .andExpect(status().isOk())
            .andExpect(header().string("Content-Disposition", containsString(filename)))
            .andReturn()
            .getResponse()
            .getContentAsByteArray();

    return WorkbookFactory.create(new ByteArrayInputStream(content));
  }

  private List<String> csv(String email, String url) throws Exception {
    return rows(
        as(email, get(url))
            .andExpect(status().isOk())
            .andReturn()
            .getResponse()
            .getContentAsByteArray());
  }

  private static List<String> rows(byte[] content) {
    return Arrays.asList(new String(content, StandardCharsets.UTF_8).split("\r\n"));
  }

  private static List<String> sheetNames(Workbook workbook) {
    List<String> names = new ArrayList<>();
    workbook.forEach(sheet -> names.add(sheet.getSheetName()));

    return names;
  }

  private static List<String> cellsOf(Sheet sheet, int column) {
    List<String> cells = new ArrayList<>();
    sheet.forEach(row -> cells.add(row.getCell(column).getStringCellValue()));

    return cells;
  }

  private static String text(Sheet sheet, int row, int column) {
    return sheet.getRow(row).getCell(column).getStringCellValue();
  }

  private static String xlsxOf(Project project) {
    return "/projects/" + project.getId() + "/calculation.xlsx";
  }

  private Project calculated(String protocol) throws Exception {
    Project project = projectRepository.save(project(protocol));
    addGroups(project);
    as(DESIGNER, post("/projects/" + project.getId() + "/calculations"))
        .andExpect(status().isCreated());

    return project;
  }

  private Project project(String protocol) {
    return new Project(
        "Residencial " + protocol,
        "Rua A, 1",
        "Recife",
        protocol,
        ProjectStatus.DRAFT,
        new ResidentialMultifamily(
            12, SupplyVoltage.V380_220, ConnectionType.THREE_PHASE, EntranceStandard.COLLECTIVE),
        standards,
        owner);
  }

  private void addGroups(Project project) {
    groupRepository.saveAll(
        List.of(
            apartments(project, "Apartamento tipo A", 24, "68"),
            apartments(project, "Apartamento tipo B", 20, "92"),
            GroupKind.LOAD.create(
                project,
                new GroupSpec(
                    "Área comum",
                    1,
                    null,
                    null,
                    null,
                    null,
                    null,
                    LoadUsage.COMMON_AREA,
                    List.of(
                        new LoadItem(
                            LoadCategory.MOTORS,
                            "Elevador",
                            1,
                            new BigDecimal("12"),
                            PowerUnit.CV,
                            null,
                            false)),
                    null,
                    null,
                    null,
                    null)),
            GroupKind.EV_CHARGING.create(
                project,
                new GroupSpec(
                    "Recarga de veículo elétrico",
                    6,
                    null,
                    null,
                    null,
                    null,
                    null,
                    null,
                    null,
                    new BigDecimal("7.40"),
                    false,
                    true,
                    EvStationType.COLLECTIVE))));
  }

  private static br.com.ampere.domain.ConsumerUnitGroup apartments(
      Project project, String name, int quantity, String area) {
    return GroupKind.RESIDENTIAL.create(
        project,
        new GroupSpec(
            name,
            quantity,
            new BigDecimal(area),
            2,
            new BigDecimal("6.5"),
            false,
            ConnectionType.SINGLE_PHASE,
            null,
            null,
            null,
            null,
            null,
            null));
  }

  private ResultActions as(
      String email,
      org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder request)
      throws Exception {
    return mockMvc.perform(request.header("Authorization", "Bearer " + token(email)));
  }

  private String token(String email) throws Exception {
    String body =
        mockMvc
            .perform(
                post("/auth/login")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("{\"email\":\"" + email + "\",\"password\":\"" + PASSWORD + "\"}"))
            .andReturn()
            .getResponse()
            .getContentAsString();

    return objectMapper.readTree(body).path("data").path("token").asString();
  }
}
