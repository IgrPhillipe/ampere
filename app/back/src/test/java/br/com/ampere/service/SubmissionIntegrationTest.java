package br.com.ampere.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import br.com.ampere.config.NormativeTableSeed;
import br.com.ampere.domain.ConnectionType;
import br.com.ampere.domain.DocumentType;
import br.com.ampere.domain.EntranceStandard;
import br.com.ampere.domain.GroupKind;
import br.com.ampere.domain.GroupSpec;
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
import br.com.ampere.repository.ProjectDocumentRepository;
import br.com.ampere.repository.ProjectRepository;
import br.com.ampere.repository.StandardRepository;
import br.com.ampere.repository.UserRepository;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.function.Function;
import java.util.stream.Collectors;
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
import org.springframework.transaction.annotation.Transactional;
import tools.jackson.databind.ObjectMapper;

/** US05: the memorial, the attachments and the submission, through HTTP. */
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class SubmissionIntegrationTest {

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

  private String token;

  private List<Standard> standards;

  @BeforeEach
  void seed() throws Exception {
    documentRepository.deleteAll();
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
    userRepository.save(
        new User(
            "Usuário Teste", "user@ampere.com", passwordEncoder.encode(PASSWORD), UserRole.USER));
    token = token("user@ampere.com");
  }

  @Test
  void anEmptyChecklistBlocksTheSubmission() throws Exception {
    Project project = draft();

    perform(get(submissionOf(project)))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.data.canSubmit").value(false))
        .andExpect(jsonPath("$.data.items", hasSize(4)))
        .andExpect(jsonPath("$.data.items[0].key").value("CALCULATION"))
        .andExpect(jsonPath("$.data.items[0].completed").value(false))
        .andExpect(jsonPath("$.data.items[2].key").value("SINGLE_LINE_DIAGRAM"))
        .andExpect(jsonPath("$.data.items[2].label").value("Diagrama unifilar"))
        .andExpect(jsonPath("$.data.documents", hasSize(0)));

    perform(post(submitOf(project)))
        .andExpect(status().isUnprocessableContent())
        .andExpect(
            jsonPath("$.detail")
                .value(
                    "Não é possível enviar o projeto. Pendências: Cálculo de demanda, ART,"
                        + " Diagrama unifilar, Planta de situação."));
  }

  @Test
  void aMissingSingleLineDiagramKeepsTheSubmissionBlocked() throws Exception {
    Project project = calculatedDraft();
    upload(project, DocumentType.ART, "art.pdf", PDF).andExpect(status().isCreated());
    upload(project, DocumentType.SITE_PLAN, "planta.pdf", PDF).andExpect(status().isCreated());

    perform(get(submissionOf(project)))
        .andExpect(jsonPath("$.data.canSubmit").value(false))
        .andExpect(jsonPath("$.data.items[0].completed").value(true))
        .andExpect(jsonPath("$.data.items[1].completed").value(true))
        .andExpect(jsonPath("$.data.items[2].completed").value(false))
        .andExpect(jsonPath("$.data.items[3].completed").value(true))
        .andExpect(jsonPath("$.data.documents", hasSize(2)));

    perform(post(submitOf(project)))
        .andExpect(status().isUnprocessableContent())
        .andExpect(
            jsonPath("$.detail")
                .value("Não é possível enviar o projeto. Pendências: Diagrama unifilar."));
    assertThat(projectRepository.findById(project.getId()).orElseThrow().getStatus())
        .isEqualTo(ProjectStatus.DRAFT);
  }

  @Test
  void aCompleteChecklistSendsTheProjectToReview() throws Exception {
    Project project = calculatedDraft();
    for (DocumentType type : DocumentType.values()) {
      upload(project, type, type.name() + ".pdf", PDF).andExpect(status().isCreated());
    }

    perform(get(submissionOf(project))).andExpect(jsonPath("$.data.canSubmit").value(true));

    perform(post(submitOf(project)))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.data.status").value("UNDER_REVIEW"))
        .andExpect(jsonPath("$.data.submittedAt").isNotEmpty());

    perform(get("/projects").param("status", "UNDER_REVIEW"))
        .andExpect(jsonPath("$.data[0].id").value(String.valueOf(project.getId())));

    perform(post(submitOf(project)))
        .andExpect(status().isConflict())
        .andExpect(jsonPath("$.detail").value("Este projeto já foi enviado para análise."));
    upload(project, DocumentType.ART, "art-nova.pdf", PDF).andExpect(status().isConflict());
  }

  @Test
  void acceptsOnlyPdf() throws Exception {
    Project project = draft();

    upload(project, DocumentType.ART, "art.pdf", "não é um PDF".getBytes(StandardCharsets.UTF_8))
        .andExpect(status().isBadRequest())
        .andExpect(jsonPath("$.detail").value("Envie o documento em PDF."));

    perform(multipart(documentsOf(project)).file(file("art.pdf", PDF)))
        .andExpect(status().isBadRequest())
        .andExpect(jsonPath("$.detail").value("O parâmetro 'type' é obrigatório."));

    perform(multipart(documentsOf(project)).param("type", "PLANTA"))
        .andExpect(status().isBadRequest());
  }

  @Test
  void aNewUploadReplacesTheDocumentOfTheSameType() throws Exception {
    Project project = draft();
    upload(project, DocumentType.ART, "art.pdf", PDF).andExpect(status().isCreated());

    upload(project, DocumentType.ART, "art-revisada.pdf", PDF)
        .andExpect(status().isCreated())
        .andExpect(jsonPath("$.data.filename").value("art-revisada.pdf"));

    perform(get(documentsOf(project)))
        .andExpect(jsonPath("$.data", hasSize(1)))
        .andExpect(jsonPath("$.data[0].filename").value("art-revisada.pdf"))
        .andExpect(jsonPath("$.data[0].typeLabel").value("ART"));
  }

  @Test
  void removesADocumentOnlyFromItsOwnProject() throws Exception {
    Project project = draft();
    Project other = draft("2026-3002");
    String id =
        objectMapper
            .readTree(
                upload(project, DocumentType.ART, "art.pdf", PDF)
                    .andReturn()
                    .getResponse()
                    .getContentAsString())
            .path("data")
            .path("id")
            .asString();

    perform(delete(documentsOf(other) + "/" + id)).andExpect(status().isNotFound());
    perform(delete(documentsOf(project) + "/" + id)).andExpect(status().isNoContent());

    perform(get(submissionOf(project)))
        .andExpect(jsonPath("$.data.items[1].completed").value(false));
  }

  @Test
  void theMemorialNeedsACalculation() throws Exception {
    Project project = draft();

    perform(get(memorialOf(project)))
        .andExpect(status().isNotFound())
        .andExpect(
            jsonPath("$.detail").value("Calcule a demanda do projeto antes de gerar o memorial."));
  }

  @Test
  void theMemorialIsAPdfNamedAfterTheProtocol() throws Exception {
    Project project = calculatedDraft();

    byte[] body =
        perform(get(memorialOf(project)))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_PDF))
            .andExpect(header().string("Content-Disposition", containsString("memorial-2026-3001")))
            .andReturn()
            .getResponse()
            .getContentAsByteArray();

    assertThat(new String(body, 0, 5, StandardCharsets.US_ASCII)).isEqualTo("%PDF-");
  }

  private Project draft() {
    return draft("2026-3001");
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
                standards));
    groupRepository.save(
        GroupKind.RESIDENTIAL.create(
            project,
            new GroupSpec(
                "Apartamento tipo A",
                24,
                new BigDecimal("68"),
                2,
                new BigDecimal("6.5"),
                false,
                null,
                null,
                null,
                null,
                null,
                null)));
    return project;
  }

  private Project calculatedDraft() throws Exception {
    Project project = draft();
    perform(post("/projects/" + project.getId() + "/calculation")).andExpect(status().isCreated());
    return project;
  }

  private ResultActions upload(Project project, DocumentType type, String filename, byte[] content)
      throws Exception {
    return perform(
        multipart(documentsOf(project)).file(file(filename, content)).param("type", type.name()));
  }

  private static MockMultipartFile file(String filename, byte[] content) {
    return new MockMultipartFile("file", filename, MediaType.APPLICATION_PDF_VALUE, content);
  }

  private ResultActions perform(AbstractMockHttpServletRequestBuilder<?> request) throws Exception {
    return mockMvc.perform(request.header("Authorization", "Bearer " + token));
  }

  private static String documentsOf(Project project) {
    return "/projects/" + project.getId() + "/documents";
  }

  private static String submissionOf(Project project) {
    return "/projects/" + project.getId() + "/submission";
  }

  private static String submitOf(Project project) {
    return "/projects/" + project.getId() + "/submit";
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
    return objectMapper.readTree(body).path("data").path("token").asString();
  }
}
