package br.com.ampere.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasLength;
import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.nullValue;
import static org.springframework.test.util.ReflectionTestUtils.setField;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import br.com.ampere.config.NormativeTableSeed;
import br.com.ampere.domain.ConnectionType;
import br.com.ampere.domain.ConsumerUnitGroup;
import br.com.ampere.domain.DocumentType;
import br.com.ampere.domain.EntranceStandard;
import br.com.ampere.domain.GroupKind;
import br.com.ampere.domain.GroupSpec;
import br.com.ampere.domain.LoadCategory;
import br.com.ampere.domain.LoadItem;
import br.com.ampere.domain.LoadUsage;
import br.com.ampere.domain.PowerUnit;
import br.com.ampere.domain.Project;
import br.com.ampere.domain.ProjectStatus;
import br.com.ampere.domain.ProjectVersion;
import br.com.ampere.domain.ResidentialMultifamily;
import br.com.ampere.domain.Standard;
import br.com.ampere.domain.SupplyVoltage;
import br.com.ampere.domain.User;
import br.com.ampere.repository.CalculationRepository;
import br.com.ampere.repository.ConsumerUnitGroupRepository;
import br.com.ampere.repository.FindingRepository;
import br.com.ampere.repository.NormativeTableRepository;
import br.com.ampere.repository.ProjectDocumentRepository;
import br.com.ampere.repository.ProjectEventRepository;
import br.com.ampere.repository.ProjectRepository;
import br.com.ampere.repository.ProjectVersionDocumentRepository;
import br.com.ampere.repository.ProjectVersionRepository;
import br.com.ampere.repository.StandardRepository;
import br.com.ampere.repository.UserRepository;
import br.com.ampere.utils.MemorialFingerprint;
import br.com.ampere.utils.Timestamps;
import com.lowagie.text.pdf.PdfReader;
import com.lowagie.text.pdf.parser.PdfTextExtractor;
import jakarta.persistence.EntityManager;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.util.Arrays;
import java.util.List;
import java.util.function.Function;
import java.util.stream.Collectors;
import org.hibernate.Hibernate;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.test.web.servlet.request.AbstractMockHttpServletRequestBuilder;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

@SpringBootTest
@AutoConfigureMockMvc
class ProjectVersionIntegrationTest {

  private static final String PASSWORD = "senha@123";
  private static final byte[] PDF = "%PDF-1.7\n%conteúdo".getBytes(StandardCharsets.UTF_8);

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

  @Autowired private ProjectDocumentRepository documentRepository;

  @Autowired private ProjectEventRepository eventRepository;

  @Autowired private ProjectVersionRepository versionRepository;

  @Autowired private ProjectVersionDocumentRepository versionDocumentRepository;

  @Autowired private ProjectVersionService versionService;

  @Autowired private EntityManager entityManager;

  @Autowired private PlatformTransactionManager transactionManager;

  private String token;

  private List<Standard> standards;

  private User owner;

  @AfterEach
  void wipe() {
    versionDocumentRepository.deleteAll();
    versionRepository.deleteAll();
    eventRepository.deleteAll();
    documentRepository.deleteAll();
    calculationRepository.deleteAll();
    findingRepository.deleteAll();
    groupRepository.deleteAll();
    projectRepository.deleteAll();
    normativeTableRepository.deleteAll();
    standardRepository.deleteAll();
    userRepository.deleteAll();
  }

  @BeforeEach
  void seed() throws Exception {
    wipe();

    standards =
        standardRepository.saveAll(
            List.of(new Standard("DIS-NOR-053", "REV 06"), new Standard("DIS-NOR-030", "REV 07")));
    normativeTableRepository.saveAll(
        NormativeTableSeed.all(
            standards.stream().collect(Collectors.toMap(Standard::getName, Function.identity()))));
    owner =
        userRepository.save(
            User.designer(
                "Usuário Teste",
                "user@ampere.com",
                passwordEncoder.encode(PASSWORD),
                "123456",
                "PE",
                null,
                null));
    token = token("user@ampere.com");
  }

  @Test
  void aSubmissionRecordsTheVersionWithTheMemorialAndTheDocumentsSent() throws Exception {
    Project project = submittedProject("2026-4001");

    perform(get(versionsOf(project)))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.data", hasSize(1)))
        .andExpect(jsonPath("$.data[0].number").value(1))
        .andExpect(jsonPath("$.data[0].authorName").value("Usuário Teste"))
        .andExpect(jsonPath("$.data[0].submittedAt").isNotEmpty())
        .andExpect(jsonPath("$.data[0].changeSummary").value(nullValue()))
        .andExpect(jsonPath("$.data[0].demandKva").isNumber())
        .andExpect(jsonPath("$.data[0].documents", hasSize(3)))
        .andExpect(jsonPath("$.data[0].memorialSha256").value(hasLength(64)))
        .andExpect(jsonPath("$.data[0].verificationCode").isNotEmpty());
  }

  @Test
  void theMemorialOfASubmittedProjectIsTheStoredPdfAndIsNeverRegenerated() throws Exception {
    Project project = submittedProject("2026-4002");

    byte[] first = bytes(perform(get(memorialOf(project))));
    byte[] second = bytes(perform(get(memorialOf(project))));
    byte[] ofVersion = bytes(perform(get(versionsOf(project) + "/1/memorial")));

    assertThat(second).isEqualTo(first);
    assertThat(ofVersion).isEqualTo(first);
    assertThat(sha256Of(project, 1)).isEqualTo(MemorialFingerprint.sha256(first));
  }

  @Test
  void aVersionKeepsItsMemorialAndDocumentsWhenTheProjectIsCorrectedAndResubmitted()
      throws Exception {
    Project project = submittedProject("2026-4003");
    byte[] versionOne = bytes(perform(get(memorialOf(project))));

    resubmit(project, "Quantidade de apartamentos corrigida.");

    assertThat(bytes(perform(get(versionsOf(project) + "/1/memorial")))).isEqualTo(versionOne);
    byte[] versionTwo = bytes(perform(get(versionsOf(project) + "/2/memorial")));
    assertThat(versionTwo).isNotEqualTo(versionOne);
    assertThat(bytes(perform(get(memorialOf(project))))).isEqualTo(versionTwo);
    perform(get(versionsOf(project)))
        .andExpect(jsonPath("$.data", hasSize(2)))
        .andExpect(jsonPath("$.data[1].number").value(2))
        .andExpect(
            jsonPath("$.data[1].changeSummary").value("Quantidade de apartamentos corrigida."))
        .andExpect(
            jsonPath("$.data[0].memorialSha256").value(MemorialFingerprint.sha256(versionOne)));
  }

  @Test
  void theMemorialOfAVersionShowsTheGroupsAsSentAfterACorrection() throws Exception {
    Project project = submittedProject("2026-4017");

    reject(project);
    ConsumerUnitGroup group = groupRepository.findAllByProjectIdOrderById(project.getId()).get(0);
    group.update(residentialSpec("Apartamento tipo Z", 40));
    groupRepository.save(group);
    resubmitAfterEditing(project, "Grupo renomeado.");

    String versionOne = textOf(bytes(perform(get(versionsOf(project) + "/1/memorial"))));
    assertThat(versionOne)
        .contains("Apartamento tipo A")
        .doesNotContain("Apartamento tipo Z")
        .containsIgnoringCase("protocolo 2026-4017")
        .containsIgnoringCase("versão 1");
    assertThat(textOf(bytes(perform(get(versionsOf(project) + "/2/memorial")))))
        .contains("Apartamento tipo Z")
        .containsIgnoringCase("versão 2");
  }

  @Test
  void aRecordedVersionIgnoresAnyAttemptToChangeIt() throws Exception {
    Project project = submittedProject("2026-4018");
    byte[] memorial = bytes(perform(get(memorialOf(project))));
    String sha256 = sha256Of(project, 1);
    Long id = versionRepository.findByProjectIdAndNumber(project.getId(), 1).orElseThrow().getId();

    new TransactionTemplate(transactionManager)
        .executeWithoutResult(
            status -> {
              ProjectVersion version = entityManager.find(ProjectVersion.class, id);
              setField(version, "memorialSha256", "0".repeat(64));
              setField(version, "changeSummary", "Alterado depois do envio.");
              setField(Hibernate.unproxy(version.getMemorial()), "data", PDF);
            });

    assertThat(sha256Of(project, 1)).isEqualTo(sha256);
    assertThat(bytes(perform(get(memorialOf(project))))).isEqualTo(memorial);
    perform(get(versionsOf(project)))
        .andExpect(jsonPath("$.data[0].changeSummary").value(nullValue()));
  }

  @Test
  void aVersionKeepsTheDocumentReplacedDuringTheCorrection() throws Exception {
    Project project = submittedProject("2026-4016");
    String art = versionsOf(project) + "/1/documents/ART/file";
    byte[] sent = bytes(perform(get(art)));

    reject(project);
    byte[] replacement = "%PDF-1.7\n%nova ART".getBytes(StandardCharsets.UTF_8);
    perform(
            multipart("/projects/" + project.getId() + "/documents")
                .file(
                    new MockMultipartFile(
                        "file", "nova-art.pdf", MediaType.APPLICATION_PDF_VALUE, replacement))
                .param("type", DocumentType.ART.name()))
        .andExpect(status().isCreated());
    resubmitAfterEditing(project, "Nova ART.");

    assertThat(bytes(perform(get(art)))).isEqualTo(sent).isEqualTo(PDF);
    assertThat(bytes(perform(get(versionsOf(project) + "/2/documents/ART/file"))))
        .isEqualTo(replacement);
    perform(get(versionsOf(project) + "/9/documents/ART/file")).andExpect(status().isNotFound());
    perform(get(versionsOf(project) + "/1/documents/XPTO/file")).andExpect(status().isBadRequest());
  }

  @Test
  void aDraftGetsAPreviewMarkedAsSuchAndWithoutVerificationCode() throws Exception {
    Project project = draft("2026-4004");
    perform(post("/projects/" + project.getId() + "/calculations")).andExpect(status().isCreated());

    String text = textOf(bytes(perform(get(memorialOf(project)))));

    assertThat(text).containsIgnoringCase("prévia").containsIgnoringCase("sem código");
    assertThat(text).doesNotContainPattern("(?i)código de verificação [0-9A-F]{4}-");
    assertThat(versionRepository.count()).isZero();
  }

  @Test
  void aProjectInCorrectionGetsAPreviewNotTheLastVersion() throws Exception {
    Project project = submittedProject("2026-4005");
    byte[] versionOne = bytes(perform(get(memorialOf(project))));
    reject(project);
    perform(post("/projects/" + project.getId() + "/calculations")).andExpect(status().isCreated());

    byte[] preview = bytes(perform(get(memorialOf(project))));

    assertThat(preview).isNotEqualTo(versionOne);
    assertThat(textOf(preview)).containsIgnoringCase("prévia");
  }

  @Test
  void theFooterCarriesProtocolVersionDateAndTheVerificationCode() throws Exception {
    Project project = submittedProject("2026-4006");
    byte[] memorial = bytes(perform(get(memorialOf(project))));
    String code = codeOf(project, 1);

    String text = textOf(memorial);

    assertThat(text)
        .containsIgnoringCase("protocolo 2026-4006")
        .containsIgnoringCase("versão 1")
        .contains(code);
    assertThat(text).doesNotContainIgnoringCase("prévia");
  }

  @Test
  void theMemorialMetadataNamesTitleDesignerProtocolVersionAndStandards() throws Exception {
    Project project = submittedProject("2026-4007");

    var info = new PdfReader(bytes(perform(get(memorialOf(project))))).getInfo();

    assertThat(info.get("Title")).isEqualTo("Memorial de Cálculo de Demanda 2026-4007");
    assertThat(info.get("Author")).isEqualTo("Usuário Teste");
    assertThat(info.get("Protocol")).isEqualTo("2026-4007");
    assertThat(info.get("Version")).isEqualTo("1");
    assertThat(info.get("Standards")).contains("DIS-NOR-053 REV 06").contains("DIS-NOR-030 REV 07");
  }

  @Test
  void theVerificationConfirmsTheCodeOfTheFooterWithoutSignIn() throws Exception {
    Project project = submittedProject("2026-4008");
    String code = codeOf(project, 1);

    mockMvc
        .perform(get("/memorial-verifications/" + code))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.data.verified").value(true))
        .andExpect(jsonPath("$.data.protocol").value("2026-4008"))
        .andExpect(jsonPath("$.data.version").value(1))
        .andExpect(jsonPath("$.data.submittedAt").isNotEmpty());
    mockMvc
        .perform(
            get("/memorial-verifications/" + code.toLowerCase().replace("-", ""))
                .header("Authorization", "Bearer token-vencido"))
        .andExpect(jsonPath("$.data.verified").value(true));
  }

  @Test
  void theVerificationDoesNotConfirmAnUnknownCode() throws Exception {
    mockMvc
        .perform(get("/memorial-verifications/0000-0000-0000-0000"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.data.verified").value(false))
        .andExpect(jsonPath("$.data.protocol").doesNotExist());
    mockMvc
        .perform(get("/memorial-verifications/curto"))
        .andExpect(jsonPath("$.data.verified").value(false));
  }

  @Test
  void anIntactFileIsConfirmedAndAnAlteredFileIsNot() throws Exception {
    Project project = submittedProject("2026-4009");
    byte[] memorial = bytes(perform(get(memorialOf(project))));

    verifyFile(memorial)
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.data.verified").value(true))
        .andExpect(jsonPath("$.data.protocol").value("2026-4009"))
        .andExpect(jsonPath("$.data.version").value(1))
        .andExpect(jsonPath("$.data.submittedAt").isNotEmpty());

    byte[] altered = memorial.clone();
    altered[altered.length / 2] ^= 0x01;
    verifyFile(altered)
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.data.verified").value(false))
        .andExpect(jsonPath("$.data.protocol").doesNotExist());

    byte[] appended = Arrays.copyOf(memorial, memorial.length + 1);
    verifyFile(appended).andExpect(jsonPath("$.data.verified").value(false));
  }

  @Test
  void aRegeneratedMemorialDoesNotVerifyEvenWithTheSameData() throws Exception {
    Project project = draft("2026-4010");
    perform(post("/projects/" + project.getId() + "/calculations")).andExpect(status().isCreated());
    byte[] preview = bytes(perform(get(memorialOf(project))));

    verifyFile(preview).andExpect(jsonPath("$.data.verified").value(false));
  }

  @Test
  void theVerificationRefusesAFileThatIsNotAPdf() throws Exception {
    mockMvc
        .perform(
            multipart("/memorial-verifications")
                .file(
                    new MockMultipartFile(
                        "file", "x.pdf", MediaType.APPLICATION_PDF_VALUE, "texto".getBytes())))
        .andExpect(status().isBadRequest());
  }

  @Test
  void theComparisonListsIncludedRemovedAndChangedGroupsAndTheDemandOfEachVersion()
      throws Exception {
    Project project = draft("2026-4011");
    ConsumerUnitGroup removed =
        groupRepository.save(residentialGroup(project, "Apartamento tipo C", 8));
    ConsumerUnitGroup kept = groupRepository.findAllByProjectIdOrderById(project.getId()).get(0);
    submitCalculated(project);

    reject(project);
    groupRepository.delete(removed);
    kept.update(residentialSpec("Apartamento tipo A", 30));
    groupRepository.save(kept);
    groupRepository.save(residentialGroup(project, "Apartamento tipo B", 6));
    resubmitAfterEditing(project, "Grupos revisados.");

    perform(get(versionsOf(project) + "/compare?from=1&to=2"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.data.from.number").value(1))
        .andExpect(jsonPath("$.data.to.number").value(2))
        .andExpect(jsonPath("$.data.from.demandKva").isNumber())
        .andExpect(jsonPath("$.data.to.demandKva").isNumber())
        .andExpect(jsonPath("$.data.demandDifferenceKva").isNumber())
        .andExpect(jsonPath("$.data.included", hasSize(1)))
        .andExpect(jsonPath("$.data.included[0].id").isString())
        .andExpect(jsonPath("$.data.included[0].name").value("Apartamento tipo B"))
        .andExpect(jsonPath("$.data.removed", hasSize(1)))
        .andExpect(jsonPath("$.data.removed[0].name").value("Apartamento tipo C"))
        .andExpect(jsonPath("$.data.changed", hasSize(1)))
        .andExpect(jsonPath("$.data.changed[0].name").value("Apartamento tipo A"))
        .andExpect(jsonPath("$.data.changed[0].fields[0].field").value("quantity"))
        .andExpect(jsonPath("$.data.changed[0].fields[0].label").value("Quantidade de unidades"))
        .andExpect(jsonPath("$.data.changed[0].fields[0].from").value("24"))
        .andExpect(jsonPath("$.data.changed[0].fields[0].to").value("30"));

    perform(get(versionsOf(project) + "/compare?from=1&to=1"))
        .andExpect(jsonPath("$.data.included", hasSize(0)))
        .andExpect(jsonPath("$.data.removed", hasSize(0)))
        .andExpect(jsonPath("$.data.changed", hasSize(0)));
    perform(get(versionsOf(project) + "/compare?from=2&to=1")).andExpect(status().isBadRequest());
    perform(get(versionsOf(project) + "/compare?from=1&to=9")).andExpect(status().isNotFound());
    perform(get(versionsOf(project) + "/9/memorial")).andExpect(status().isNotFound());
  }

  @Test
  void theComparisonOpensTheLoadItemsFieldByField() throws Exception {
    Project project = draft("2026-4015");
    ConsumerUnitGroup load =
        groupRepository.save(GroupKind.LOAD.create(project, loadSpec(1, new BigDecimal("12.00"))));
    submitCalculated(project);

    reject(project);
    load.update(loadSpec(2, new BigDecimal("12")));
    groupRepository.save(load);
    resubmitAfterEditing(project, "Mais um motor.");

    perform(get(versionsOf(project) + "/compare?from=1&to=2"))
        .andExpect(jsonPath("$.data.changed", hasSize(1)))
        .andExpect(jsonPath("$.data.changed[0].fields", hasSize(1)))
        .andExpect(jsonPath("$.data.changed[0].fields[0].field").value("items[0].quantity"))
        .andExpect(jsonPath("$.data.changed[0].fields[0].label").value("Item 1, quantidade"))
        .andExpect(jsonPath("$.data.changed[0].fields[0].from").value("1"))
        .andExpect(jsonPath("$.data.changed[0].fields[0].to").value("2"));
  }

  @Test
  void aProjectSubmittedBeforeTheVersionsExistedGetsOneFromTheBackfill() throws Exception {
    Project project = draft("2026-4013");
    perform(post("/projects/" + project.getId() + "/calculations")).andExpect(status().isCreated());
    Project stored = projectRepository.findById(project.getId()).orElseThrow();
    stored.submit(Timestamps.now());
    projectRepository.save(stored);
    assertThat(versionService.projectsMissingVersion()).containsExactly(project.getId());

    versionService.backfill(project.getId());

    assertThat(versionService.projectsMissingVersion()).isEmpty();
    String text = textOf(bytes(perform(get(memorialOf(project)))));
    assertThat(text).containsIgnoringCase("versão 1").doesNotContainIgnoringCase("prévia");
  }

  @Test
  void theBackfillSkipsAProjectEditedAfterItsRejection() throws Exception {
    Project project = draft("2026-4014");
    Project stored = projectRepository.findById(project.getId()).orElseThrow();
    stored.submit(Timestamps.now());
    stored.reject(Timestamps.now());
    projectRepository.save(stored);

    assertThat(versionService.projectsMissingVersion()).isEmpty();
  }

  @Test
  void theVersionsAreNotVisibleToAnotherDesigner() throws Exception {
    Project project = submittedProject("2026-4012");
    userRepository.save(
        User.designer(
            "Outra Pessoa",
            "outra@ampere.com",
            passwordEncoder.encode(PASSWORD),
            "654321",
            "PE",
            null,
            null));
    String other = token("outra@ampere.com");

    mockMvc
        .perform(get(versionsOf(project)).header("Authorization", "Bearer " + other))
        .andExpect(status().isNotFound());
    mockMvc
        .perform(
            get(versionsOf(project) + "/1/memorial").header("Authorization", "Bearer " + other))
        .andExpect(status().isNotFound());
    mockMvc
        .perform(
            get(versionsOf(project) + "/1/documents/ART/file")
                .header("Authorization", "Bearer " + other))
        .andExpect(status().isNotFound());
  }

  private Project submittedProject(String protocol) throws Exception {
    Project project = draft(protocol);
    submitCalculated(project);

    return project;
  }

  private void submitCalculated(Project project) throws Exception {
    perform(post("/projects/" + project.getId() + "/calculations")).andExpect(status().isCreated());
    for (DocumentType type : DocumentType.values()) {
      upload(project, type).andExpect(status().isCreated());
    }
    submit(project, null);
  }

  private void submit(Project project, String changeSummary) throws Exception {
    var request = post("/projects/" + project.getId() + "/submission");
    if (changeSummary != null) {
      request
          .contentType(MediaType.APPLICATION_JSON)
          .content("{\"changeSummary\":\"" + changeSummary + "\"}");
    }
    perform(request).andExpect(status().isOk());
  }

  private void reject(Project project) {
    Project stored = projectRepository.findById(project.getId()).orElseThrow();
    stored.reject(Timestamps.now());
    projectRepository.save(stored);
  }

  private void resubmit(Project project, String changeSummary) throws Exception {
    reject(project);
    resubmitAfterEditing(project, changeSummary);
  }

  private void resubmitAfterEditing(Project project, String changeSummary) throws Exception {
    perform(post("/projects/" + project.getId() + "/calculations")).andExpect(status().isCreated());
    submit(project, changeSummary);
  }

  private Project draft(String protocol) {
    Project project =
        projectRepository.save(
            new Project(
                "Residencial Monte Verde",
                "Rodovia BR-101, km 8",
                "Cabo de Santo Agostinho",
                protocol,
                ProjectStatus.DRAFT,
                new ResidentialMultifamily(
                    12,
                    SupplyVoltage.V380_220,
                    ConnectionType.THREE_PHASE,
                    EntranceStandard.COLLECTIVE),
                standards,
                owner));
    groupRepository.save(residentialGroup(project, "Apartamento tipo A", 24));
    return project;
  }

  private static ConsumerUnitGroup residentialGroup(Project project, String name, int quantity) {
    return GroupKind.RESIDENTIAL.create(project, residentialSpec(name, quantity));
  }

  private static GroupSpec residentialSpec(String name, int quantity) {
    return new GroupSpec(
        name,
        quantity,
        new BigDecimal("68"),
        2,
        new BigDecimal("6.5"),
        false,
        null,
        null,
        null,
        null,
        null,
        null);
  }

  private static GroupSpec loadSpec(int motors, BigDecimal power) {
    return new GroupSpec(
        "Área comum",
        1,
        null,
        null,
        null,
        null,
        LoadUsage.COMMON_AREA,
        List.of(
            new LoadItem(
                LoadCategory.MOTORS, "Elevador", motors, power, PowerUnit.CV, null, false)),
        null,
        null,
        null,
        null);
  }

  private ResultActions upload(Project project, DocumentType type) throws Exception {
    return perform(
        multipart("/projects/" + project.getId() + "/documents")
            .file(
                new MockMultipartFile(
                    "file", type.name() + ".pdf", MediaType.APPLICATION_PDF_VALUE, PDF))
            .param("type", type.name()));
  }

  private ResultActions verifyFile(byte[] content) throws Exception {
    return mockMvc.perform(
        multipart("/memorial-verifications")
            .file(new MockMultipartFile("file", "memorial.pdf", "application/pdf", content)));
  }

  private ResultActions perform(AbstractMockHttpServletRequestBuilder<?> request) throws Exception {
    return mockMvc.perform(request.header("Authorization", "Bearer " + token));
  }

  private static byte[] bytes(ResultActions result) throws Exception {
    return result.andExpect(status().isOk()).andReturn().getResponse().getContentAsByteArray();
  }

  private static String textOf(byte[] pdf) throws Exception {
    PdfTextExtractor extractor = new PdfTextExtractor(new PdfReader(pdf));
    StringBuilder text = new StringBuilder();
    for (int page = 1; page <= new PdfReader(pdf).getNumberOfPages(); page++) {
      text.append(extractor.getTextFromPage(page)).append('\n');
    }

    return text.toString();
  }

  private String codeOf(Project project, int number) {
    return versionRepository
        .findByProjectIdAndNumber(project.getId(), number)
        .orElseThrow()
        .getVerificationCode();
  }

  private String sha256Of(Project project, int number) {
    return versionRepository
        .findByProjectIdAndNumber(project.getId(), number)
        .orElseThrow()
        .getMemorialSha256();
  }

  private static String versionsOf(Project project) {
    return "/projects/" + project.getId() + "/versions";
  }

  private static String memorialOf(Project project) {
    return "/projects/" + project.getId() + "/memorial";
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
    JsonNode data = objectMapper.readTree(body).path("data");

    return data.path("token").asString();
  }
}
