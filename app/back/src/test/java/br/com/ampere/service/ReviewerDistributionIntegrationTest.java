package br.com.ampere.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import br.com.ampere.domain.ConnectionType;
import br.com.ampere.domain.DocumentType;
import br.com.ampere.domain.EntranceStandard;
import br.com.ampere.domain.Finding;
import br.com.ampere.domain.FindingSeverity;
import br.com.ampere.domain.FindingStage;
import br.com.ampere.domain.Project;
import br.com.ampere.domain.ProjectDocument;
import br.com.ampere.domain.ProjectEvent;
import br.com.ampere.domain.ProjectEventType;
import br.com.ampere.domain.ResidentialGroup;
import br.com.ampere.domain.ResidentialMultifamily;
import br.com.ampere.domain.ReviewDecision;
import br.com.ampere.domain.Standard;
import br.com.ampere.domain.SupplyVoltage;
import br.com.ampere.domain.User;
import br.com.ampere.domain.UserRole;
import br.com.ampere.dto.MunicipalityAssignmentDto;
import br.com.ampere.repository.CalculationRepository;
import br.com.ampere.repository.ConsumerUnitGroupRepository;
import br.com.ampere.repository.FindingRepository;
import br.com.ampere.repository.ProjectDocumentRepository;
import br.com.ampere.repository.ProjectEventRepository;
import br.com.ampere.repository.ProjectRepository;
import br.com.ampere.repository.ReviewerMunicipalityRepository;
import br.com.ampere.repository.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.nio.charset.StandardCharsets;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class ReviewerDistributionIntegrationTest {

  private static final String PASSWORD = "senha@123";
  private static final byte[] PDF = "%PDF-1.7\ncontent".getBytes(StandardCharsets.US_ASCII);

  @Autowired private MockMvc mockMvc;
  @Autowired private ObjectMapper objectMapper;
  @Autowired private PasswordEncoder passwordEncoder;
  @Autowired private UserRepository userRepository;
  @Autowired private ProjectRepository projectRepository;
  @Autowired private ConsumerUnitGroupRepository groupRepository;
  @Autowired private CalculationRepository calculationRepository;
  @Autowired private ProjectDocumentRepository documentRepository;
  @Autowired private FindingRepository findingRepository;
  @Autowired private ProjectEventRepository eventRepository;
  @Autowired private ReviewerMunicipalityRepository municipalityRepository;
  @Autowired private ReviewerMunicipalityService reviewerMunicipalityService;
  @Autowired private DemandCalculationService demandCalculationService;

  private User admin;
  private User analystAna;
  private User analystBruno;
  private User designer;

  @BeforeEach
  void setUp() {
    municipalityRepository.deleteAll();
    eventRepository.deleteAll();
    documentRepository.deleteAll();
    calculationRepository.deleteAll();
    groupRepository.deleteAll();
    findingRepository.deleteAll();
    projectRepository.deleteAll();
    userRepository.deleteAll();

    String hash = passwordEncoder.encode(PASSWORD);
    admin = userRepository.save(new User("Admin Gestor", "admin@ampere.com", hash, UserRole.ADMIN));
    analystAna = userRepository.save(new User("Ana Analista", "ana@ampere.com", hash, UserRole.REVIEWER));
    analystBruno = userRepository.save(new User("Bruno Analista", "bruno@ampere.com", hash, UserRole.REVIEWER));
    designer = userRepository.save(new User("Diego Projetista", "diego@ampere.com", hash, UserRole.USER));
  }

  @Test
  void managesReviewerMunicipalitiesWithValidationAndConflictHandling() throws Exception {
    String adminToken = bearer(admin);
    String anaToken = bearer(analystAna);

    // Only admin can list
    mockMvc.perform(get("/reviewers/municipalities").header(HttpHeaders.AUTHORIZATION, anaToken))
        .andExpect(status().isForbidden());

    mockMvc.perform(get("/reviewers/municipalities").header(HttpHeaders.AUTHORIZATION, adminToken))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.data").isArray())
        .andExpect(jsonPath("$.data[?(@.reviewer.name == 'Ana Analista')].municipalities").isEmpty());

    // 400 - Outside concession area
    mockMvc.perform(
            put("/reviewers/{id}/municipalities", analystAna.getId())
                .header(HttpHeaders.AUTHORIZATION, adminToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"municipalities\": [{\"state\": \"SP\", \"municipality\": \"São Paulo\"}]}"))
        .andExpect(status().isBadRequest());

    // 404 - Unknown or non-reviewer
    mockMvc.perform(
            put("/reviewers/{id}/municipalities", designer.getId())
                .header(HttpHeaders.AUTHORIZATION, adminToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"municipalities\": [{\"state\": \"PE\", \"municipality\": \"Caruaru\"}]}"))
        .andExpect(status().isNotFound());

    // 422 - Inactive analyst
    analystBruno.administer(analystBruno.getName(), UserRole.REVIEWER, false);
    userRepository.save(analystBruno);
    mockMvc.perform(
            put("/reviewers/{id}/municipalities", analystBruno.getId())
                .header(HttpHeaders.AUTHORIZATION, adminToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"municipalities\": [{\"state\": \"PE\", \"municipality\": \"Caruaru\"}]}"))
        .andExpect(status().isUnprocessableEntity())
        .andExpect(jsonPath("$.detail").value("Analista inativo."));

    analystBruno.administer(analystBruno.getName(), UserRole.REVIEWER, true);
    userRepository.save(analystBruno);

    // Assign Caruaru to Ana
    mockMvc.perform(
            put("/reviewers/{id}/municipalities", analystAna.getId())
                .header(HttpHeaders.AUTHORIZATION, adminToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"municipalities\": [{\"state\": \"PE\", \"municipality\": \"Caruaru\"}]}"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.data[0].municipality").value("Caruaru"));

    // 409 - Caruaru already belongs to Ana
    mockMvc.perform(
            put("/reviewers/{id}/municipalities", analystBruno.getId())
                .header(HttpHeaders.AUTHORIZATION, adminToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"municipalities\": [{\"state\": \"PE\", \"municipality\": \"Caruaru\"}]}"))
        .andExpect(status().isConflict())
        .andExpect(jsonPath("$.detail").value("O município Caruaru já pertence ao analista Ana Analista."));
  }

  @Test
  void automaticDistributionOnSubmissionAndReanalysisDevolution() throws Exception {
    reviewerMunicipalityService.updateMunicipalities(
        analystAna.getId(),
        List.of(new MunicipalityAssignmentDto(br.com.ampere.domain.BrazilianState.PE, "Caruaru")),
        new AuthenticatedUser(admin.getId(), UserRole.ADMIN));

    // Project from Caruaru -> auto assigned to Ana with system event (null author)
    Project p1 = readyProject("2026-9001", "Caruaru", designer);
    submitProject(p1, designer);

    Project reloadedP1 = projectRepository.findDetailById(p1.getId()).orElseThrow();
    assertThat(reloadedP1.getReviewer()).isNotNull();
    assertThat(reloadedP1.getReviewer().getId()).isEqualTo(analystAna.getId());

    List<ProjectEvent> p1Events = eventRepository.findAllByProjectIdOrderByOccurredAtAscIdAsc(p1.getId());
    ProjectEvent p1Assigned =
        p1Events.stream().filter(e -> e.getType() == ProjectEventType.ASSIGNED).findFirst().orElseThrow();
    assertThat(p1Assigned.getAuthor()).isNull();
    assertThat(p1Assigned.getDescription()).isEqualTo("Análise atribuída pelo sistema.");

    // Project from Gravata (no rule) -> unassigned
    Project p2 = readyProject("2026-9002", "Gravatá", designer);
    submitProject(p2, designer);

    Project reloadedP2 = projectRepository.findDetailById(p2.getId()).orElseThrow();
    assertThat(reloadedP2.getReviewer()).isNull();
    assertThat(eventRepository.findAllByProjectIdOrderByOccurredAtAscIdAsc(p2.getId()))
        .noneMatch(e -> e.getType() == ProjectEventType.ASSIGNED);

    // Reanalysis devolution to whoever rejected:
    // Reject p1 with Ana
    reloadedP1.reject(OffsetDateTime.now(ZoneOffset.UTC), "Favor corrigir.");
    projectRepository.save(reloadedP1);

    // Designer resubmits p1
    mockMvc.perform(
            post("/projects/{id}/submission", p1.getId())
                .header(HttpHeaders.AUTHORIZATION, bearer(designer))
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"changeSummary\": \"Corrigido o documento.\"}"))
        .andExpect(status().isOk());

    Project resubmittedP1 = projectRepository.findDetailById(p1.getId()).orElseThrow();
    assertThat(resubmittedP1.getReviewer()).isNotNull();
    assertThat(resubmittedP1.getReviewer().getId()).isEqualTo(analystAna.getId());

    // If reviewer was deactivated, devolution leaves it unassigned
    resubmittedP1.reject(OffsetDateTime.now(ZoneOffset.UTC), "Nova reprovação.");
    projectRepository.save(resubmittedP1);

    analystAna.administer(analystAna.getName(), UserRole.REVIEWER, false);
    userRepository.save(analystAna);

    mockMvc.perform(
            post("/projects/{id}/submission", p1.getId())
                .header(HttpHeaders.AUTHORIZATION, bearer(designer))
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"changeSummary\": \"Segunda correção.\"}"))
        .andExpect(status().isOk());

    Project resubmittedP1Again = projectRepository.findDetailById(p1.getId()).orElseThrow();
    assertThat(resubmittedP1Again.getReviewer()).isNull();
  }

  @Test
  void batchAssignmentAllOrNothingAndDraftFindingsMigration() throws Exception {
    String adminToken = bearer(admin);
    Project p1 = readyProject("2026-9011", "Recife", designer);
    submitProject(p1, designer);
    Project p2 = readyProject("2026-9012", "Olinda", designer);
    submitProject(p2, designer);

    // p1 already has draft finding from Bruno
    p1.assignReviewer(analystBruno);
    projectRepository.save(p1);
    Finding draftFinding =
        findingRepository.save(
            new Finding(
                p1,
                FindingSeverity.BLOCKING,
                FindingStage.DOCUMENTS,
                null,
                null,
                DocumentType.ART,
                "Assinar a ART.",
                null,
                analystBruno,
                1));

    // Reject when reviewer is inactive -> 422 "Analista inativo."
    analystAna.administer(analystAna.getName(), UserRole.REVIEWER, false);
    userRepository.save(analystAna);

    mockMvc.perform(
            put("/review-queue/assignment")
                .header(HttpHeaders.AUTHORIZATION, adminToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    "{\"projectIds\": [\""
                        + p1.getId()
                        + "\", \""
                        + p2.getId()
                        + "\"], \"reviewerId\": \""
                        + analystAna.getId()
                        + "\"}"))
        .andExpect(status().isUnprocessableEntity())
        .andExpect(jsonPath("$.detail").value("Analista inativo."));

    // Nothing changed for either project
    assertThat(projectRepository.findDetailById(p1.getId()).orElseThrow().getReviewer().getId())
        .isEqualTo(analystBruno.getId());
    assertThat(projectRepository.findDetailById(p2.getId()).orElseThrow().getReviewer()).isNull();

    // Reactivate Ana and assign batch
    analystAna.administer(analystAna.getName(), UserRole.REVIEWER, true);
    userRepository.save(analystAna);

    mockMvc.perform(
            put("/review-queue/assignment")
                .header(HttpHeaders.AUTHORIZATION, adminToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    "{\"projectIds\": [\""
                        + p1.getId()
                        + "\", \""
                        + p2.getId()
                        + "\"], \"reviewerId\": \""
                        + analystAna.getId()
                        + "\"}"))
        .andExpect(status().isOk());

    assertThat(projectRepository.findDetailById(p1.getId()).orElseThrow().getReviewer().getId())
        .isEqualTo(analystAna.getId());
    assertThat(projectRepository.findDetailById(p2.getId()).orElseThrow().getReviewer().getId())
        .isEqualTo(analystAna.getId());

    // Draft finding author migrated to Ana
    Finding reloadedFinding = findingRepository.findById(draftFinding.getId()).orElseThrow();
    assertThat(reloadedFinding.getAuthor().getId()).isEqualTo(analystAna.getId());

    // Project ASSIGNED event recorded with admin as author
    List<ProjectEvent> events = eventRepository.findAllByProjectIdOrderByOccurredAtAscIdAsc(p1.getId());
    ProjectEvent assignmentEvent =
        events.stream().filter(e -> e.getType() == ProjectEventType.ASSIGNED).reduce((first, second) -> second).orElseThrow();
    assertThat(assignmentEvent.getAuthor()).isNotNull();
    assertThat(assignmentEvent.getAuthor().getId()).isEqualTo(admin.getId());
    assertThat(assignmentEvent.getDescription()).isEqualTo("Análise atribuída por Admin Gestor.");

    // Conflict when a project is not UNDER_REVIEW
    p2.approve(OffsetDateTime.now(ZoneOffset.UTC));
    projectRepository.save(p2);

    mockMvc.perform(
            put("/review-queue/assignment")
                .header(HttpHeaders.AUTHORIZATION, adminToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    "{\"projectIds\": [\""
                        + p1.getId()
                        + "\", \""
                        + p2.getId()
                        + "\"], \"reviewerId\": \""
                        + analystBruno.getId()
                        + "\"}"))
        .andExpect(status().isConflict())
        .andExpect(jsonPath("$.detail").value("O projeto não está em análise."));
  }

  @Test
  void reviewQueueItemResponseIncludesReviewerIdAndName() throws Exception {
    Project p = readyProject("2026-9021", "Recife", designer);
    submitProject(p, designer);
    p.assignReviewer(analystAna);
    projectRepository.save(p);

    mockMvc.perform(get("/review-queue").header(HttpHeaders.AUTHORIZATION, bearer(analystAna)))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.data[?(@.protocol == '2026-9021')].reviewerId").value(String.valueOf(analystAna.getId())))
        .andExpect(jsonPath("$.data[?(@.protocol == '2026-9021')].reviewerName").value("Ana Analista"));
  }

  @Test
  void postReviewRefusesAnyoneOtherThanAssignedAnalyst() throws Exception {
    Project p = readyProject("2026-9031", "Recife", designer);
    submitProject(p, designer);
    p.assignReviewer(analystAna);
    projectRepository.save(p);

    // Bruno attempts to open review on Ana's project -> 403
    mockMvc.perform(post("/projects/{id}/review", p.getId()).header(HttpHeaders.AUTHORIZATION, bearer(analystBruno)))
        .andExpect(status().isForbidden());

    // Ana opens her own review -> 200
    mockMvc.perform(post("/projects/{id}/review", p.getId()).header(HttpHeaders.AUTHORIZATION, bearer(analystAna)))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.data.reviewerId").value(String.valueOf(analystAna.getId())));
  }

  private Project readyProject(String protocol, String municipality, User owner) {
    Project p =
        Project.draft(
            "Residencial " + protocol,
            "Rua Central, 100",
            municipality,
            protocol,
            new ResidentialMultifamily(4, SupplyVoltage.V380_220, ConnectionType.THREE_PHASE, EntranceStandard.COLLECTIVE),
            List.<Standard>of(),
            owner);
    Project saved = projectRepository.save(p);
    groupRepository.save(ResidentialGroup.apartments(saved, "Apt Padrão", 8, new java.math.BigDecimal("60"), 2, new java.math.BigDecimal("6.0")));
    for (DocumentType type : DocumentType.values()) {
      documentRepository.save(new ProjectDocument(saved, type, type.name() + ".pdf", PDF));
    }
    demandCalculationService.calculate(saved.getId(), new AuthenticatedUser(owner.getId(), UserRole.USER));
    return saved;
  }

  private void submitProject(Project project, User owner) throws Exception {
    mockMvc.perform(
            post("/projects/{id}/submission", project.getId())
                .header(HttpHeaders.AUTHORIZATION, bearer(owner)))
        .andExpect(status().isOk());
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
