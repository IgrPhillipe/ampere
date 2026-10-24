package br.com.ampere.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.containsInAnyOrder;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import br.com.ampere.domain.ConnectionType;
import br.com.ampere.domain.DocumentType;
import br.com.ampere.domain.EntranceStandard;
import br.com.ampere.domain.FindingStatus;
import br.com.ampere.domain.Project;
import br.com.ampere.domain.ProjectDocument;
import br.com.ampere.domain.ResidentialMultifamily;
import br.com.ampere.domain.Standard;
import br.com.ampere.domain.SupplyVoltage;
import br.com.ampere.domain.User;
import br.com.ampere.domain.UserRole;
import br.com.ampere.repository.CalculationRepository;
import br.com.ampere.repository.ConsumerUnitGroupRepository;
import br.com.ampere.repository.FindingRepository;
import br.com.ampere.repository.ProjectDocumentRepository;
import br.com.ampere.repository.ProjectRepository;
import br.com.ampere.repository.UserRepository;
import java.nio.charset.StandardCharsets;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.transaction.annotation.Transactional;
import tools.jackson.databind.ObjectMapper;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class ProjectReviewWorkflowIntegrationTest {

  private static final String PASSWORD = "senha@123";

  private static final String FINDING_BODY =
      """
      {
        "severity": "BLOCKING",
        "stage": "DOCUMENTS",
        "documentType": "SITE_PLAN",
        "description": "Anexar a comprovação do sistema de recarga.",
        "standardItem": "DIS-NOR-053, item 6.17"
      }
      """;

  @Autowired private MockMvc mockMvc;
  @Autowired private ObjectMapper objectMapper;
  @Autowired private PasswordEncoder passwordEncoder;
  @Autowired private CalculationRepository calculationRepository;
  @Autowired private ConsumerUnitGroupRepository groupRepository;
  @Autowired private FindingRepository findingRepository;
  @Autowired private ProjectDocumentRepository documentRepository;
  @Autowired private ProjectRepository projectRepository;
  @Autowired private UserRepository userRepository;

  private User owner;
  private User otherOwner;
  private User analyst;
  private User otherAnalyst;
  private Project project;

  @BeforeEach
  void setUp() {
    calculationRepository.deleteAll();
    groupRepository.deleteAll();
    findingRepository.deleteAll();
    documentRepository.deleteAll();
    projectRepository.deleteAll();
    userRepository.deleteAll();

    String hash = passwordEncoder.encode(PASSWORD);
    owner = userRepository.save(new User("Ana Projetista", "ana@ampere.com", hash, UserRole.USER));
    otherOwner =
        userRepository.save(new User("Beto Projetista", "beto@ampere.com", hash, UserRole.USER));
    analyst =
        userRepository.save(
            new User("Alice Analista", "alice@ampere.com", hash, UserRole.REVIEWER));
    otherAnalyst =
        userRepository.save(new User("Carlos Analista", "carlos@ampere.com", hash, UserRole.ADMIN));
    project = submittedProject("2026-7001", owner);
  }

  @Test
  void assignsExactlyOneAnalystAndOnlyThatAnalystCanWriteFindings() throws Exception {
    mockMvc
        .perform(
            post("/projects/{id}/review", project.getId())
                .header(HttpHeaders.AUTHORIZATION, bearer(owner)))
        .andExpect(status().isForbidden());
    assign(project, analyst)
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.data.reviewerId").value(analyst.getId()));
    assign(project, analyst).andExpect(status().isOk());
    assign(project, otherAnalyst).andExpect(status().isConflict());
    mockMvc
        .perform(
            get("/projects/{id}", project.getId())
                .header(HttpHeaders.AUTHORIZATION, bearer(otherAnalyst)))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.data.ownerName").value("Ana Projetista"))
        .andExpect(jsonPath("$.data.reviewerName").value("Alice Analista"));

    mockMvc
        .perform(
            post("/projects/{id}/findings", project.getId())
                .header(HttpHeaders.AUTHORIZATION, bearer(otherAnalyst))
                .contentType(MediaType.APPLICATION_JSON)
                .content(FINDING_BODY))
        .andExpect(status().isForbidden());
    mockMvc
        .perform(
            post("/projects/{id}/findings", project.getId())
                .header(HttpHeaders.AUTHORIZATION, bearer(analyst))
                .contentType(MediaType.APPLICATION_JSON)
                .content(FINDING_BODY))
        .andExpect(status().isCreated())
        .andExpect(jsonPath("$.data.status").value("DRAFT"))
        .andExpect(jsonPath("$.data.version").value(1))
        .andExpect(jsonPath("$.data.authorName").value("Alice Analista"));

    mockMvc
        .perform(
            get("/projects/{id}/findings", project.getId())
                .header(HttpHeaders.AUTHORIZATION, bearer(analyst)))
        .andExpect(status().isOk())
        .andExpect(
            jsonPath("$.data[0].description").value("Anexar a comprovação do sistema de recarga."));
    mockMvc
        .perform(
            get("/projects/{id}/findings", project.getId())
                .header(HttpHeaders.AUTHORIZATION, bearer(owner)))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.data").isEmpty());
    mockMvc
        .perform(
            get("/projects/{id}/findings", project.getId())
                .header(HttpHeaders.AUTHORIZATION, bearer(otherOwner)))
        .andExpect(status().isNotFound());
  }

  @Test
  void enforcesDecisionRulesAndPublishesDraftFindings() throws Exception {
    assign(project, analyst).andExpect(status().isOk());

    decide(project, analyst, "REJECT", "Revisar os documentos.")
        .andExpect(status().isUnprocessableContent());
    createFinding(project, analyst, FINDING_BODY).andExpect(status().isCreated());
    decide(project, analyst, "APPROVE", "Documentação aprovada.")
        .andExpect(status().isUnprocessableContent());
    decide(project, otherAnalyst, "REJECT", "Revisar os documentos.")
        .andExpect(status().isForbidden());
    decide(project, analyst, "REJECT", "Revisar os documentos.")
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.data.projectId").value(String.valueOf(project.getId())))
        .andExpect(jsonPath("$.data.status").value("REJECTED"))
        .andExpect(jsonPath("$.data.opinion").value("Revisar os documentos."))
        .andExpect(jsonPath("$.data.reviewedAt").isNotEmpty());

    assertThat(findingRepository.findAll())
        .singleElement()
        .extracting("status")
        .isEqualTo(FindingStatus.OPEN);
    Long findingId = findingRepository.findAll().getFirst().getId();
    mockMvc
        .perform(
            put("/projects/{projectId}/findings/{findingId}", project.getId(), findingId)
                .header(HttpHeaders.AUTHORIZATION, bearer(analyst))
                .contentType(MediaType.APPLICATION_JSON)
                .content(FINDING_BODY))
        .andExpect(status().isConflict());
    mockMvc
        .perform(
            delete("/projects/{projectId}/findings/{findingId}", project.getId(), findingId)
                .header(HttpHeaders.AUTHORIZATION, bearer(analyst)))
        .andExpect(status().isConflict());
  }

  @Test
  void approvesWhenThereIsNoOpenBlockingFinding() throws Exception {
    Project approvable = submittedProject("2026-7002", owner);
    assign(approvable, analyst).andExpect(status().isOk());
    String adjustment = FINDING_BODY.replace("BLOCKING", "ADJUSTMENT");
    createFinding(approvable, analyst, adjustment).andExpect(status().isCreated());

    decide(approvable, analyst, "APPROVE", "Projeto em conformidade.")
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.data.status").value("APPROVED"));
  }

  /** {@code otherAnalyst} is an admin: the admin reviews like the analyst does. */
  @Test
  void theAdminAssignsWritesFindingsAndDecides() throws Exception {
    Project rejectable = submittedProject("2026-7003", owner);
    assign(rejectable, otherAnalyst).andExpect(status().isOk());
    createFinding(rejectable, otherAnalyst, FINDING_BODY).andExpect(status().isCreated());

    decide(rejectable, otherAnalyst, "REJECT", "Falta a comprovação do sistema de recarga.")
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.data.status").value("REJECTED"));
  }

  @Test
  void acceptsAndReopensAPreviousCycleFindingDuringReanalysis() throws Exception {
    assign(project, analyst).andExpect(status().isOk());
    createFinding(project, analyst, FINDING_BODY).andExpect(status().isCreated());
    decide(project, analyst, "REJECT", "Corrigir item bloqueante.").andExpect(status().isOk());
    Long findingId = findingRepository.findAll().getFirst().getId();

    project.submit(OffsetDateTime.now(ZoneOffset.UTC));
    projectRepository.flush();

    resolve(project, findingId, analyst, "ACCEPT")
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.data.status").value("RESOLVED"));
    resolve(project, findingId, analyst, "REOPEN")
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.data.status").value("OPEN"));
  }

  @Test
  void rejectsTheReanalysisWithAReopenedFinding() throws Exception {
    assign(project, analyst).andExpect(status().isOk());
    createFinding(project, analyst, FINDING_BODY).andExpect(status().isCreated());
    decide(project, analyst, "REJECT", "Corrigir item bloqueante.").andExpect(status().isOk());
    Long findingId = findingRepository.findAll().getFirst().getId();
    project.submit(OffsetDateTime.now(ZoneOffset.UTC));
    projectRepository.flush();

    resolve(project, findingId, analyst, "REOPEN").andExpect(status().isOk());

    decide(project, analyst, "REJECT", "O item continua pendente.")
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.data.status").value("REJECTED"));
  }

  @Test
  void refusesAReferenceOutsideTheStage() throws Exception {
    assign(project, analyst).andExpect(status().isOk());

    createFinding(project, analyst, FINDING_BODY.replace("DOCUMENTS", "PROJECT_DATA"))
        .andExpect(status().isBadRequest())
        .andExpect(
            jsonPath("$.detail").value("A referência não corresponde à etapa do apontamento."));
  }

  @Test
  void validatesTheDecisionInPortuguese() throws Exception {
    assign(project, analyst).andExpect(status().isOk());

    mockMvc
        .perform(
            post("/projects/{id}/decision", project.getId())
                .header(HttpHeaders.AUTHORIZATION, bearer(analyst))
                .contentType(MediaType.APPLICATION_JSON)
                .content("{}"))
        .andExpect(status().isBadRequest())
        .andExpect(
            jsonPath("$.errors[*].defaultMessage")
                .value(containsInAnyOrder("A decisão é obrigatória.", "O parecer é obrigatório.")));
  }

  @Test
  void servesAProjectPdfToWhoeverReadsTheProject() throws Exception {
    byte[] pdf = "%PDF-1.7\nreview document".getBytes(StandardCharsets.US_ASCII);
    ProjectDocument document =
        documentRepository.save(
            new ProjectDocument(project, DocumentType.SITE_PLAN, "planta.pdf", pdf));
    assign(project, analyst).andExpect(status().isOk());

    file(project, document, owner)
        .andExpect(status().isOk())
        .andExpect(content().contentType(MediaType.APPLICATION_PDF))
        .andExpect(
            header().string(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"planta.pdf\""))
        .andExpect(content().bytes(pdf));
    file(project, document, analyst).andExpect(status().isOk()).andExpect(content().bytes(pdf));
    file(project, document, otherOwner).andExpect(status().isNotFound());
    file(project, document, otherAnalyst).andExpect(status().isOk());
  }

  private ResultActions assign(Project target, User actor) throws Exception {
    return mockMvc.perform(
        post("/projects/{id}/review", target.getId())
            .header(HttpHeaders.AUTHORIZATION, bearer(actor)));
  }

  private ResultActions createFinding(Project target, User actor, String body) throws Exception {
    return mockMvc.perform(
        post("/projects/{id}/findings", target.getId())
            .header(HttpHeaders.AUTHORIZATION, bearer(actor))
            .contentType(MediaType.APPLICATION_JSON)
            .content(body));
  }

  private ResultActions decide(Project target, User actor, String decision, String opinion)
      throws Exception {
    return mockMvc.perform(
        post("/projects/{id}/decision", target.getId())
            .header(HttpHeaders.AUTHORIZATION, bearer(actor))
            .contentType(MediaType.APPLICATION_JSON)
            .content("{\"decision\":\"" + decision + "\",\"opinion\":\"" + opinion + "\"}"));
  }

  private ResultActions resolve(Project target, Long findingId, User actor, String resolution)
      throws Exception {
    return mockMvc.perform(
        post("/projects/{projectId}/findings/{findingId}/resolution", target.getId(), findingId)
            .header(HttpHeaders.AUTHORIZATION, bearer(actor))
            .contentType(MediaType.APPLICATION_JSON)
            .content("{\"resolution\":\"" + resolution + "\"}"));
  }

  private ResultActions file(Project target, ProjectDocument document, User actor)
      throws Exception {
    return mockMvc.perform(
        get("/projects/{projectId}/documents/{documentId}/file", target.getId(), document.getId())
            .header(HttpHeaders.AUTHORIZATION, bearer(actor)));
  }

  private Project submittedProject(String protocol, User projectOwner) {
    Project submitted =
        Project.draft(
            "Residencial " + protocol,
            "Rua do Projeto, 10",
            "Recife",
            protocol,
            new ResidentialMultifamily(
                6, SupplyVoltage.V220_127, ConnectionType.THREE_PHASE, EntranceStandard.COLLECTIVE),
            List.<Standard>of(),
            projectOwner);
    submitted.submit(OffsetDateTime.now(ZoneOffset.UTC));
    return projectRepository.save(submitted);
  }

  private String bearer(User user) throws Exception {
    String body =
        mockMvc
            .perform(
                post("/auth/login")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(
                        "{\"email\":\""
                            + user.getEmail()
                            + "\",\"password\":\""
                            + PASSWORD
                            + "\"}"))
            .andReturn()
            .getResponse()
            .getContentAsString();
    return "Bearer " + objectMapper.readTree(body).path("data").path("token").asString();
  }
}
