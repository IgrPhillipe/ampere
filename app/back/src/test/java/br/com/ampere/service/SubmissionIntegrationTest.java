package br.com.ampere.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.contains;
import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.greaterThan;
import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import br.com.ampere.config.NormativeTableSeed;
import br.com.ampere.domain.ConnectionType;
import br.com.ampere.domain.ConsumerUnitGroup;
import br.com.ampere.domain.DocumentType;
import br.com.ampere.domain.EntranceStandard;
import br.com.ampere.domain.EvStationType;
import br.com.ampere.domain.Finding;
import br.com.ampere.domain.FindingSeverity;
import br.com.ampere.domain.FindingStage;
import br.com.ampere.domain.GroupKind;
import br.com.ampere.domain.GroupSpec;
import br.com.ampere.domain.Project;
import br.com.ampere.domain.ProjectEvent;
import br.com.ampere.domain.ProjectEventType;
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
import br.com.ampere.repository.ProjectEventRepository;
import br.com.ampere.repository.ProjectRepository;
import br.com.ampere.repository.StandardRepository;
import br.com.ampere.repository.UserRepository;
import com.jayway.jsonpath.JsonPath;
import com.lowagie.text.pdf.PdfReader;
import com.lowagie.text.pdf.parser.PdfTextExtractor;
import jakarta.persistence.EntityManager;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
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

  @Autowired private EntityManager entityManager;

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

  private String token;

  private List<Standard> standards;

  private User owner;

  @BeforeEach
  void seed() throws Exception {
    eventRepository.deleteAll();
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
  void anEmptyChecklistBlocksTheSubmission() throws Exception {
    Project project = draft();

    perform(get(submissionOf(project)))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.data.canSubmit").value(false))
        .andExpect(jsonPath("$.data.unansweredBlocking").value(0))
        .andExpect(jsonPath("$.data.requiresChangeSummary").value(false))
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

    String submitted =
        perform(post(submitOf(project)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.status").value("UNDER_REVIEW"))
            .andExpect(jsonPath("$.data.submittedAt").isNotEmpty())
            .andExpect(jsonPath("$.data.demandKva").isNumber())
            .andReturn()
            .getResponse()
            .getContentAsString();
    assertThat(JsonPath.<String>read(submitted, "$.data.lastActivityAt"))
        .isEqualTo(JsonPath.<String>read(submitted, "$.data.submittedAt"));

    assertThat(eventRepository.findAllByProjectIdOrderByOccurredAtAscIdAsc(project.getId()))
        .extracting(ProjectEvent::getType)
        .containsExactly(ProjectEventType.SUBMITTED, ProjectEventType.PRE_VALIDATED);

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

  @Test
  void theMemorialNamesTheTechnicalResponsible() throws Exception {
    Project project = calculatedDraft();

    byte[] body =
        perform(get(memorialOf(project))).andReturn().getResponse().getContentAsByteArray();

    assertThat(new PdfTextExtractor(new PdfReader(body)).getTextFromPage(1))
        .containsSubsequence("Responsável técnico", "Usuário Teste", "CREA", "123456/PE");
  }

  @Test
  void theMemorialAcceptsTheDataReadBackWithTheDatabaseScale() throws Exception {
    Project project = calculatedDraft();
    entityManager.flush();
    entityManager.clear();

    perform(get(memorialOf(project))).andExpect(status().isOk());
  }

  @Test
  void theLatestCalculationSaysWhenTheDataChangedAfterIt() throws Exception {
    Project project = calculatedDraft();
    String latest = "/projects/" + project.getId() + "/calculations/latest";

    perform(get(latest)).andExpect(jsonPath("$.data.outdated").value(false));

    groupRepository.save(residentialGroup(project, "Apartamento tipo B", 10));
    perform(get(latest)).andExpect(jsonPath("$.data.outdated").value(true));
  }

  @Test
  void theMemorialRefusesACalculationOlderThanTheData() throws Exception {
    Project project = calculatedDraft();
    groupRepository.save(residentialGroup(project, "Apartamento tipo B", 10));

    perform(get(memorialOf(project)))
        .andExpect(status().isConflict())
        .andExpect(
            jsonPath("$.detail")
                .value(
                    "Os dados do projeto mudaram depois do último cálculo. Recalcule a demanda"
                        + " antes de gerar o memorial."));
  }

  @Test
  void theSubmissionCalculatesTheDataAsSubmitted() throws Exception {
    Project project = calculatedDraft();
    groupRepository.save(residentialGroup(project, "Apartamento tipo B", 10));
    for (DocumentType type : DocumentType.values()) {
      upload(project, type, type.name() + ".pdf", PDF).andExpect(status().isCreated());
    }

    perform(post(submitOf(project))).andExpect(status().isOk());

    assertThat(calculationRepository.count()).isEqualTo(2);
    assertThat(
            calculationRepository
                .findFirstByProjectIdOrderByIdDesc(project.getId())
                .orElseThrow()
                .getInputSnapshot())
        .contains("Apartamento tipo B");
    perform(get(memorialOf(project))).andExpect(status().isOk());
  }

  @Test
  void blocksResubmissionWhileBlockingFindingsOrSummaryArePendingAndThenResubmitsAsReanalysis()
      throws Exception {
    User analyst =
        userRepository.save(
            new User(
                "Admin Teste",
                "admin@ampere.com",
                passwordEncoder.encode(PASSWORD),
                UserRole.ADMIN));
    String analystToken = token("admin@ampere.com");

    Project project = calculatedDraft();
    for (DocumentType type : DocumentType.values()) {
      upload(project, type, type.name() + ".pdf", PDF).andExpect(status().isCreated());
    }
    perform(
            post(submitOf(project))
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"changeSummary\":\"Ignorado no primeiro envio.\"}"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.data.reviewCycle").value(1))
        .andExpect(jsonPath("$.data.changeSummary").doesNotExist());

    project.assignReviewer(analyst);
    project.reject(OffsetDateTime.now(ZoneOffset.UTC), "Corrija a ART e a área do apartamento.");
    projectRepository.flush();

    Finding firstBlocking =
        findingRepository.save(
            publishedFinding(
                project,
                FindingSeverity.BLOCKING,
                FindingStage.DOCUMENTS,
                DocumentType.ART,
                "Assinar a ART.",
                analyst));
    Finding secondBlocking =
        findingRepository.save(
            publishedFinding(
                project,
                FindingSeverity.BLOCKING,
                FindingStage.CONSUMER_UNITS,
                null,
                "Revisar a área útil.",
                analyst));
    findingRepository.save(
        publishedFinding(
            project,
            FindingSeverity.ADJUSTMENT,
            FindingStage.PROJECT_DATA,
            null,
            "Detalhar o endereço.",
            analyst));

    perform(get(submissionOf(project)))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.data.canSubmit").value(false))
        .andExpect(jsonPath("$.data.unansweredBlocking").value(2))
        .andExpect(jsonPath("$.data.requiresChangeSummary").value(true));

    perform(
            post(submitOf(project))
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"changeSummary\":\"Corrigido.\"}"))
        .andExpect(status().isUnprocessableContent())
        .andExpect(
            jsonPath("$.detail")
                .value("Responda os apontamentos bloqueantes antes de reenviar. Pendentes: 2."));

    perform(
            put("/projects/" + project.getId() + "/findings/" + firstBlocking.getId() + "/response")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"status\":\"FIXED\"}"))
        .andExpect(status().isOk());
    perform(
            put("/projects/"
                    + project.getId()
                    + "/findings/"
                    + secondBlocking.getId()
                    + "/response")
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    "{\"status\":\"CONTESTED\",\"response\":\"A área confere com a prancha 2.\"}"))
        .andExpect(status().isOk());

    perform(get(submissionOf(project)))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.data.canSubmit").value(true))
        .andExpect(jsonPath("$.data.unansweredBlocking").value(0))
        .andExpect(jsonPath("$.data.requiresChangeSummary").value(true));

    perform(post(submitOf(project)))
        .andExpect(status().isUnprocessableContent())
        .andExpect(
            jsonPath("$.detail").value("Informe o resumo das alterações para reenviar o projeto."));
    perform(
            post(submitOf(project))
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"changeSummary\":\"   \"}"))
        .andExpect(status().isUnprocessableContent())
        .andExpect(
            jsonPath("$.detail").value("Informe o resumo das alterações para reenviar o projeto."));
    perform(
            post(submitOf(project))
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"changeSummary\":\"" + "x".repeat(2001) + "\"}"))
        .andExpect(status().isBadRequest());

    ConsumerUnitGroup pendingGroup =
        groupRepository.save(
            GroupKind.EV_CHARGING.create(
                project,
                new GroupSpec(
                    "Recarga VE",
                    4,
                    null,
                    null,
                    null,
                    null,
                    null,
                    null,
                    new BigDecimal("7.4"),
                    false,
                    null,
                    EvStationType.COLLECTIVE)));
    perform(
            post(submitOf(project))
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"changeSummary\":\"Adicionei recarga VE.\"}"))
        .andExpect(status().isUnprocessableContent())
        .andExpect(
            jsonPath("$.detail")
                .value("Há grupos com pendências. Corrija-os antes de calcular a demanda."));
    groupRepository.delete(pendingGroup);
    groupRepository.flush();

    long calculationsBefore = calculationRepository.count();

    perform(
            post(submitOf(project))
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"changeSummary\":\"Substituí a ART assinada e justifiquei a área.\"}"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.data.status").value("UNDER_REVIEW"))
        .andExpect(jsonPath("$.data.reviewCycle").value(2))
        .andExpect(jsonPath("$.data.reviewOpinion").doesNotExist())
        .andExpect(
            jsonPath("$.data.changeSummary")
                .value("Substituí a ART assinada e justifiquei a área."))
        .andExpect(jsonPath("$.data.reviewerName").value("Admin Teste"));

    assertThat(calculationRepository.count()).isEqualTo(calculationsBefore + 1);

    mockMvc
        .perform(
            get("/review-queue")
                .param("filter", "REANALYSIS")
                .header("Authorization", "Bearer " + analystToken))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.data", hasSize(1)))
        .andExpect(jsonPath("$.data[0].id").value(String.valueOf(project.getId())))
        .andExpect(jsonPath("$.data[0].reanalysis").value(true));
  }

  @Test
  void recordsTheProtocolTimelineThroughAFullReviewCycle() throws Exception {
    userRepository.save(
        new User(
            "Revisor Teste",
            "revisor@ampere.com",
            passwordEncoder.encode(PASSWORD),
            UserRole.REVIEWER));
    String analystToken = "Bearer " + token("revisor@ampere.com");

    String created =
        perform(
                post("/projects")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(
                        """
                        {
                          "name": "Residencial Linha do Tempo",
                          "address": "Rua da Aurora, 100",
                          "postalCode": "50050000",
                          "state": "PE",
                          "municipality": "Recife",
                          "buildingType": "RESIDENTIAL_MULTIFAMILY",
                          "floors": 12,
                          "voltage": "V380_220",
                          "connectionType": "THREE_PHASE",
                          "entranceStandard": "COLLECTIVE"
                        }
                        """))
            .andExpect(status().isCreated())
            .andReturn()
            .getResponse()
            .getContentAsString();
    Project project =
        projectRepository
            .findById(
                Long.valueOf(objectMapper.readTree(created).path("data").path("id").asString()))
            .orElseThrow();
    groupRepository.save(residentialGroup(project, "Apartamento tipo A", 24));
    perform(post("/projects/" + project.getId() + "/calculations")).andExpect(status().isCreated());
    for (DocumentType type : DocumentType.values()) {
      upload(project, type, type.name() + ".pdf", PDF).andExpect(status().isCreated());
    }
    perform(post(submitOf(project))).andExpect(status().isOk());

    String review = "/projects/" + project.getId();
    for (int attempt = 0; attempt < 2; attempt++) {
      mockMvc
          .perform(post(review + "/review").header("Authorization", analystToken))
          .andExpect(status().isOk());
    }
    String finding =
        mockMvc
            .perform(
                post(review + "/findings")
                    .header("Authorization", analystToken)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(
                        "{\"severity\":\"BLOCKING\",\"stage\":\"DOCUMENTS\","
                            + "\"documentType\":\"ART\",\"description\":\"Assinar a ART.\"}"))
            .andExpect(status().isCreated())
            .andReturn()
            .getResponse()
            .getContentAsString();
    String findingId = objectMapper.readTree(finding).path("data").path("id").asString();
    mockMvc
        .perform(
            post(review + "/decision")
                .header("Authorization", analystToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"decision\":\"REJECT\",\"opinion\":\"Assine a ART.\"}"))
        .andExpect(status().isOk());

    answer(review, findingId, "FIXED", "ART assinada.");
    answer(review, findingId, "FIXED", "ART assinada e anexada.");
    answer(review, findingId, "CONTESTED", "A ART já estava assinada.");
    answer(review, findingId, "FIXED", "ART reenviada com a assinatura.");
    groupRepository.save(residentialGroup(project, "Apartamento tipo B", 12));
    perform(
            post(submitOf(project))
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"changeSummary\":\"ART assinada e tipo B incluído.\"}"))
        .andExpect(status().isOk());

    String adjustment =
        mockMvc
            .perform(
                post(review + "/findings")
                    .header("Authorization", analystToken)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(
                        "{\"severity\":\"ADJUSTMENT\",\"stage\":\"PROJECT_DATA\","
                            + "\"description\":\"Informe o bloco no endereço.\"}"))
            .andExpect(status().isCreated())
            .andReturn()
            .getResponse()
            .getContentAsString();
    String adjustmentId = objectMapper.readTree(adjustment).path("data").path("id").asString();
    mockMvc
        .perform(
            post(review + "/decision")
                .header("Authorization", analystToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"decision\":\"REJECT\",\"opinion\":\"Informe o bloco.\"}"))
        .andExpect(status().isOk());

    answer(review, findingId, "FIXED", "ART assinada pelo responsável técnico.");
    answer(review, findingId, "FIXED", "ART assinada pelo responsável técnico, folha 2.");
    answer(review, adjustmentId, "FIXED", "Torre única, sem bloco.");
    perform(
            post(submitOf(project))
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"changeSummary\":\"Bloco informado.\"}"))
        .andExpect(status().isOk());

    for (String id : List.of(findingId, adjustmentId)) {
      mockMvc
          .perform(
              post(review + "/findings/" + id + "/resolution")
                  .header("Authorization", analystToken)
                  .contentType(MediaType.APPLICATION_JSON)
                  .content("{\"resolution\":\"ACCEPT\"}"))
          .andExpect(status().isOk());
    }
    mockMvc
        .perform(
            post(review + "/decision")
                .header("Authorization", analystToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"decision\":\"APPROVE\",\"opinion\":\"Projeto aprovado.\"}"))
        .andExpect(status().isOk());

    perform(get(review + "/events").param("direction", "ASC"))
        .andExpect(status().isOk())
        .andExpect(
            jsonPath("$.data[*].type")
                .value(
                    contains(
                        "CREATED",
                        "SUBMITTED",
                        "PRE_VALIDATED",
                        "ASSIGNED",
                        "REJECTED",
                        "FINDING_ANSWERED",
                        "FINDING_ANSWERED",
                        "FINDING_ANSWERED",
                        "RESUBMITTED",
                        "PRE_VALIDATED",
                        "REJECTED",
                        "FINDING_ANSWERED",
                        "FINDING_ANSWERED",
                        "RESUBMITTED",
                        "PRE_VALIDATED",
                        "APPROVED")))
        .andExpect(
            jsonPath("$.data[*].version")
                .value(contains(0, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 3, 3, 3)))
        .andExpect(jsonPath("$.data[0].authorName").value("Usuário Teste"))
        .andExpect(jsonPath("$.data[3].description").value("Análise assumida por Revisor Teste."))
        .andExpect(jsonPath("$.data[3].authorRole").value("reviewer"))
        .andExpect(jsonPath("$.data[4].description").value("Reprovado com 1 apontamento."))
        .andExpect(jsonPath("$.data[4].detail").value("Assine a ART."))
        .andExpect(jsonPath("$.data[5].description").value("Apontamento de Documentos corrigido."))
        .andExpect(jsonPath("$.data[5].detail").value("ART assinada."))
        .andExpect(jsonPath("$.data[6].description").value("Apontamento de Documentos contestado."))
        .andExpect(jsonPath("$.data[6].detail").value("A ART já estava assinada."))
        .andExpect(jsonPath("$.data[7].detail").value("ART reenviada com a assinatura."))
        .andExpect(jsonPath("$.data[8].description").value("Versão 2 reenviada para análise."))
        .andExpect(jsonPath("$.data[8].detail").value("ART assinada e tipo B incluído."))
        .andExpect(jsonPath("$.data[9].authorRole").doesNotExist())
        .andExpect(jsonPath("$.data[10].description").value("Reprovado com 1 apontamento."))
        .andExpect(jsonPath("$.data[11].description").value("Apontamento de Documentos corrigido."))
        .andExpect(jsonPath("$.data[11].detail").value("ART assinada pelo responsável técnico."))
        .andExpect(
            jsonPath("$.data[12].description")
                .value("Apontamento de Dados da Edificação corrigido."))
        .andExpect(jsonPath("$.data[13].description").value("Versão 3 reenviada para análise."))
        .andExpect(jsonPath("$.data[15].description").value("Aprovado."));

    perform(get(review + "/rework"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.data.cycleDays").value(0))
        .andExpect(jsonPath("$.data.submittedVersions").value(3))
        .andExpect(jsonPath("$.data.reviewCycles").value(3))
        .andExpect(jsonPath("$.data.resolvedFindings").value(2))
        .andExpect(jsonPath("$.data.openFindings").value(0))
        .andExpect(jsonPath("$.data.redoneCalculationSteps").value(greaterThan(0)));
  }

  private void answer(String review, String findingId, String status, String response)
      throws Exception {
    perform(
            put(review + "/findings/" + findingId + "/response")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"status\":\"" + status + "\",\"response\":\"" + response + "\"}"))
        .andExpect(status().isOk());
  }

  private static Finding publishedFinding(
      Project project,
      FindingSeverity severity,
      FindingStage stage,
      DocumentType documentType,
      String description,
      User author) {
    Finding finding =
        new Finding(
            project,
            severity,
            stage,
            null,
            null,
            documentType,
            description,
            null,
            author,
            project.getReviewCycle());
    finding.publish();
    return finding;
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
                standards,
                owner));
    groupRepository.save(residentialGroup(project, "Apartamento tipo A", 24));
    return project;
  }

  private static ConsumerUnitGroup residentialGroup(Project project, String name, int quantity) {
    return GroupKind.RESIDENTIAL.create(
        project,
        new GroupSpec(
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
            null));
  }

  private Project calculatedDraft() throws Exception {
    Project project = draft();
    perform(post("/projects/" + project.getId() + "/calculations")).andExpect(status().isCreated());
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
    return "/projects/" + project.getId() + "/submission";
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
