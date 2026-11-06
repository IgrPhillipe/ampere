package br.com.ampere.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.contains;
import static org.hamcrest.Matchers.empty;
import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import br.com.ampere.config.NormativeTableSeed;
import br.com.ampere.domain.BrazilianState;
import br.com.ampere.domain.ConnectionType;
import br.com.ampere.domain.DocumentType;
import br.com.ampere.domain.EntranceStandard;
import br.com.ampere.domain.Finding;
import br.com.ampere.domain.FindingSeverity;
import br.com.ampere.domain.FindingStage;
import br.com.ampere.domain.GroupSpec;
import br.com.ampere.domain.Project;
import br.com.ampere.domain.ProjectDocument;
import br.com.ampere.domain.ProjectEvent;
import br.com.ampere.domain.ProjectEventType;
import br.com.ampere.domain.ResidentialGroup;
import br.com.ampere.domain.ResidentialMultifamily;
import br.com.ampere.domain.ReviewerMunicipality;
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
import br.com.ampere.repository.ReviewerMunicipalityRepository;
import br.com.ampere.repository.StandardRepository;
import br.com.ampere.repository.UserRepository;
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
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;
import tools.jackson.databind.ObjectMapper;

// Not @Transactional: an open session would hide what open-in-view=false breaks in production.
@SpringBootTest
@AutoConfigureMockMvc
class ReviewerDistributionIntegrationTest {

  private static final String PASSWORD = "senha@123";
  private static final byte[] PDF = "%PDF-1.7\ncontent".getBytes(StandardCharsets.US_ASCII);
  private static final String CARUARU =
      "{\"municipalities\":[{\"state\":\"PE\",\"municipality\":\"Caruaru\"}]}";

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
  @Autowired private NormativeTableRepository normativeTableRepository;
  @Autowired private StandardRepository standardRepository;
  @Autowired private DemandCalculationService demandCalculationService;

  private List<Standard> standards;
  private User admin;
  private User ana;
  private User bruno;
  private User designer;

  @BeforeEach
  void setUp() {
    municipalityRepository.deleteAll();
    eventRepository.deleteAll();
    documentRepository.deleteAll();
    calculationRepository.deleteAll();
    findingRepository.deleteAll();
    groupRepository.deleteAll();
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
    admin = userRepository.save(new User("Admin Gestor", "admin@ampere.com", hash, UserRole.ADMIN));
    ana = userRepository.save(new User("Ana Analista", "ana@ampere.com", hash, UserRole.REVIEWER));
    bruno =
        userRepository.save(
            new User("Bruno Analista", "bruno@ampere.com", hash, UserRole.REVIEWER));
    designer =
        userRepository.save(new User("Diego Projetista", "diego@ampere.com", hash, UserRole.USER));
  }

  @Test
  void listsEveryActiveReviewerOnlyToTheAdmin() throws Exception {
    rule(ana, "Gravatá");
    rule(ana, "Caruaru");
    deactivate(bruno);

    mockMvc
        .perform(get("/reviewers/municipalities").header(HttpHeaders.AUTHORIZATION, bearer(ana)))
        .andExpect(status().isForbidden());
    mockMvc
        .perform(get("/reviewers/municipalities").header(HttpHeaders.AUTHORIZATION, bearer(admin)))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.data", hasSize(2)))
        .andExpect(jsonPath("$.data[0].reviewer.name").value("Admin Gestor"))
        .andExpect(jsonPath("$.data[0].municipalities", empty()))
        .andExpect(jsonPath("$.data[1].reviewer.id").value(String.valueOf(ana.getId())))
        .andExpect(jsonPath("$.data[1].municipalities[0].municipality").value("Caruaru"))
        .andExpect(jsonPath("$.data[1].municipalities[1].state").value("PE"))
        .andExpect(jsonPath("$.data[1].municipalities[1].municipality").value("Gravatá"));
  }

  @Test
  void replacesTheListWithTheOfficialSpellingAndWithoutRepetition() throws Exception {
    rule(ana, "Recife");

    replaceMunicipalities(
            ana,
            "{\"municipalities\":[{\"state\":\"PE\",\"municipality\":\"caruaru\"},"
                + "{\"state\":\"PE\",\"municipality\":\"CARUARU\"},"
                + "{\"state\":\"PE\",\"municipality\":\"gravata\"}]}")
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.data[*].municipality", contains("Caruaru", "Gravatá")));

    assertThat(municipalityRepository.findAllByOrderByStateAscMunicipalityAsc())
        .extracting(ReviewerMunicipality::getMunicipality)
        .containsExactly("Caruaru", "Gravatá");
  }

  @Test
  void refusesInvalidMunicipalityLists() throws Exception {
    replaceMunicipalities(ana, "{\"municipalities\":[{\"state\":\"PE\",\"municipality\":\"Lua\"}]}")
        .andExpect(status().isBadRequest())
        .andExpect(jsonPath("$.detail").value("Município fora da área de concessão: Lua (PE)."));
    replaceMunicipalities(ana, "{\"municipalities\":[null]}").andExpect(status().isBadRequest());
    replaceMunicipalities(designer, CARUARU).andExpect(status().isNotFound());

    deactivate(bruno);
    replaceMunicipalities(bruno, CARUARU)
        .andExpect(status().isUnprocessableContent())
        .andExpect(jsonPath("$.detail").value("Analista inativo."));
  }

  @Test
  void aMunicipalityBelongsToOneActiveReviewerAtATime() throws Exception {
    rule(ana, "Caruaru");

    replaceMunicipalities(bruno, CARUARU)
        .andExpect(status().isConflict())
        .andExpect(
            jsonPath("$.detail")
                .value("O município Caruaru já pertence ao analista Ana Analista."));
  }

  @Test
  void anotherReviewerTakesTheMunicipalityOfAnInactiveOrDemotedOne() throws Exception {
    rule(ana, "Caruaru");
    rule(bruno, "Gravatá");
    deactivate(ana);
    demote(bruno);

    replaceMunicipalities(
            admin,
            "{\"municipalities\":[{\"state\":\"PE\",\"municipality\":\"Caruaru\"},"
                + "{\"state\":\"PE\",\"municipality\":\"Gravatá\"}]}")
        .andExpect(status().isOk());

    assertThat(municipalityRepository.findAll())
        .extracting(found -> found.getReviewer().getId())
        .containsOnly(admin.getId());
  }

  @Test
  void submissionGoesToTheReviewerOfTheMunicipality() throws Exception {
    rule(ana, "Caruaru");
    Project project = readyProject("2026-9001", "Caruaru", designer);

    submit(project).andExpect(status().isOk());

    assertThat(reviewerOf(project).getId()).isEqualTo(ana.getId());
    ProjectEvent assignment = lastAssignmentOf(project);
    assertThat(assignment.getAuthor()).isNull();
    assertThat(assignment.getDescription())
        .isEqualTo("Análise atribuída a Ana Analista pelo sistema.");
  }

  @Test
  void submissionStaysUnassignedWithoutAnEligibleReviewer() throws Exception {
    rule(ana, "Caruaru");
    rule(bruno, "Gravatá");
    deactivate(ana);
    demote(bruno);
    Project inactive = readyProject("2026-9002", "Caruaru", designer);
    Project demoted = readyProject("2026-9003", "Gravatá", designer);
    Project noRule = readyProject("2026-9004", "Recife", designer);

    for (Project project : List.of(inactive, demoted, noRule)) {
      submit(project).andExpect(status().isOk());

      assertThat(reviewerOf(project)).isNull();
      assertThat(assignmentsOf(project)).isEmpty();
    }
  }

  @Test
  void resubmissionGoesBackToWhoRejected() throws Exception {
    Project project = readyProject("2026-9005", "Recife", designer);
    submit(project).andExpect(status().isOk());
    assign(List.of(project), bruno).andExpect(status().isNoContent());
    reject(project);

    resubmit(project).andExpect(status().isOk());

    assertThat(reviewerOf(project).getId()).isEqualTo(bruno.getId());
    assertThat(lastAssignmentOf(project).getAuthor()).isNull();
  }

  @Test
  void resubmissionFallsBackToTheMunicipalityWhenWhoRejectedIsGone() throws Exception {
    rule(ana, "Caruaru");
    Project project = readyProject("2026-9006", "Caruaru", designer);
    submit(project).andExpect(status().isOk());
    assign(List.of(project), bruno).andExpect(status().isNoContent());
    reject(project);
    deactivate(bruno);

    resubmit(project).andExpect(status().isOk());

    assertThat(reviewerOf(project).getId()).isEqualTo(ana.getId());
  }

  @Test
  void resubmissionStaysUnassignedWhenNobodyCanTakeIt() throws Exception {
    Project project = readyProject("2026-9007", "Recife", designer);
    submit(project).andExpect(status().isOk());
    assign(List.of(project), bruno).andExpect(status().isNoContent());
    reject(project);
    demote(bruno);

    resubmit(project).andExpect(status().isOk());

    assertThat(reviewerOf(project)).isNull();
  }

  @Test
  void theDistributionNeverHandsAProjectToItsOwner() throws Exception {
    rule(admin, "Caruaru");
    Project project = readyProject("2026-9008", "Caruaru", admin);

    submit(project).andExpect(status().isOk());

    assertThat(reviewerOf(project)).isNull();
  }

  @Test
  void batchReassignsAndMovesOnlyTheDrafts() throws Exception {
    Project first = readyProject("2026-9011", "Recife", designer);
    Project second = readyProject("2026-9012", "Olinda", designer);
    submit(first).andExpect(status().isOk());
    submit(second).andExpect(status().isOk());
    assign(List.of(first), bruno).andExpect(status().isNoContent());
    Finding draft = finding(first, bruno);
    Finding published = finding(first, bruno);
    published.publish();
    findingRepository.save(published);

    assign(List.of(first, second), ana).andExpect(status().isNoContent());

    assertThat(reviewerOf(first).getId()).isEqualTo(ana.getId());
    assertThat(reviewerOf(second).getId()).isEqualTo(ana.getId());
    assertThat(authorOf(draft)).isEqualTo(ana.getId());
    assertThat(authorOf(published)).isEqualTo(bruno.getId());
    ProjectEvent assignment = lastAssignmentOf(first);
    assertThat(assignment.getAuthor().getId()).isEqualTo(admin.getId());
    assertThat(assignment.getDescription())
        .isEqualTo("Análise atribuída a Ana Analista por Admin Gestor.");
  }

  @Test
  void batchIgnoresRepeatedIdsAndWhoAlreadyHoldsTheProject() throws Exception {
    Project project = readyProject("2026-9013", "Recife", designer);
    submit(project).andExpect(status().isOk());

    assign(List.of(project, project), ana).andExpect(status().isNoContent());
    assign(List.of(project), ana).andExpect(status().isNoContent());

    assertThat(assignmentsOf(project)).hasSize(1);
  }

  @Test
  void batchChangesNothingWhenOneProjectFails() throws Exception {
    Project first = readyProject("2026-9014", "Recife", designer);
    Project second = readyProject("2026-9015", "Olinda", designer);
    submit(first).andExpect(status().isOk());
    submit(second).andExpect(status().isOk());
    assign(List.of(first), bruno).andExpect(status().isNoContent());
    second = projectRepository.findDetailById(second.getId()).orElseThrow();
    second.approve(OffsetDateTime.now(ZoneOffset.UTC));
    projectRepository.save(second);

    assign(List.of(first, second), ana)
        .andExpect(status().isConflict())
        .andExpect(jsonPath("$.detail").value("O projeto não está em análise."));

    assertThat(reviewerOf(first).getId()).isEqualTo(bruno.getId());
    assertThat(assignmentsOf(first)).hasSize(1);
  }

  @Test
  void batchRefusesAnInactiveReviewerAndKeepsTheProjects() throws Exception {
    Project first = readyProject("2026-9016", "Recife", designer);
    Project second = readyProject("2026-9017", "Olinda", designer);
    submit(first).andExpect(status().isOk());
    submit(second).andExpect(status().isOk());
    assign(List.of(first), bruno).andExpect(status().isNoContent());
    deactivate(ana);

    assign(List.of(first, second), ana)
        .andExpect(status().isUnprocessableContent())
        .andExpect(jsonPath("$.detail").value("Analista inativo."));

    assertThat(reviewerOf(first).getId()).isEqualTo(bruno.getId());
    assertThat(reviewerOf(second)).isNull();
  }

  @Test
  void batchRefusesWhoCannotReviewTheProject() throws Exception {
    Project project = readyProject("2026-9018", "Recife", designer);
    Project adminProject = readyProject("2026-9019", "Olinda", admin);
    submit(project).andExpect(status().isOk());
    submit(adminProject).andExpect(status().isOk());

    assign(List.of(project), designer).andExpect(status().isUnprocessableContent());
    assign(List.of(adminProject), admin)
        .andExpect(status().isUnprocessableContent())
        .andExpect(jsonPath("$.detail").value("O analista não pode analisar um projeto próprio."));
  }

  @Test
  void batchAnswersNotFoundAndKeepsItToTheAdmin() throws Exception {
    Project project = readyProject("2026-9020", "Recife", designer);
    submit(project).andExpect(status().isOk());

    assignment(bearer(admin), "[\"999999\"]", ana.getId()).andExpect(status().isNotFound());
    assignment(bearer(admin), "[\"" + project.getId() + "\"]", 999999L)
        .andExpect(status().isNotFound());
    assignment(bearer(ana), "[\"" + project.getId() + "\"]", ana.getId())
        .andExpect(status().isForbidden());
  }

  @Test
  void theQueueNamesTheReviewerOfEachProject() throws Exception {
    Project assigned = readyProject("2026-9021", "Recife", designer);
    Project unassigned = readyProject("2026-9022", "Olinda", designer);
    submit(assigned).andExpect(status().isOk());
    submit(unassigned).andExpect(status().isOk());
    assign(List.of(assigned), ana).andExpect(status().isNoContent());

    mockMvc
        .perform(get("/review-queue").header(HttpHeaders.AUTHORIZATION, bearer(ana)))
        .andExpect(status().isOk())
        .andExpect(
            jsonPath("$.data[?(@.protocol == '2026-9021')].reviewerId")
                .value(String.valueOf(ana.getId())))
        .andExpect(
            jsonPath("$.data[?(@.protocol == '2026-9021')].reviewerName").value(ana.getName()))
        .andExpect(jsonPath("$.data[?(@.protocol == '2026-9022')].reviewerId").value((Object) null))
        .andExpect(
            jsonPath("$.data[?(@.protocol == '2026-9022')].reviewerName").value((Object) null));
  }

  @Test
  void onlyTheAssignedReviewerOpensTheReview() throws Exception {
    Project project = readyProject("2026-9031", "Recife", designer);
    submit(project).andExpect(status().isOk());

    open(project, ana)
        .andExpect(status().isForbidden())
        .andExpect(
            jsonPath("$.detail").value("Somente o analista responsável pode abrir a análise."));

    assign(List.of(project), ana).andExpect(status().isNoContent());

    open(project, bruno).andExpect(status().isForbidden());
    open(project, ana)
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.data.reviewerId").value(String.valueOf(ana.getId())))
        .andExpect(jsonPath("$.data.reviewerName").value(ana.getName()));
  }

  private ResultActions open(Project project, User user) throws Exception {
    return mockMvc.perform(
        post("/projects/{id}/review", project.getId())
            .header(HttpHeaders.AUTHORIZATION, bearer(user)));
  }

  private ResultActions replaceMunicipalities(User reviewer, String body) throws Exception {
    return mockMvc.perform(
        put("/reviewers/{id}/municipalities", reviewer.getId())
            .header(HttpHeaders.AUTHORIZATION, bearer(admin))
            .contentType(MediaType.APPLICATION_JSON)
            .content(body));
  }

  private ResultActions assign(List<Project> projects, User reviewer) throws Exception {
    String ids =
        projects.stream()
            .map(project -> "\"" + project.getId() + "\"")
            .collect(Collectors.joining(",", "[", "]"));

    return assignment(bearer(admin), ids, reviewer.getId());
  }

  private ResultActions assignment(String token, String projectIds, Long reviewerId)
      throws Exception {
    return mockMvc.perform(
        put("/review-queue/assignment")
            .header(HttpHeaders.AUTHORIZATION, token)
            .contentType(MediaType.APPLICATION_JSON)
            .content(
                "{\"projectIds\":%s,\"reviewerId\":\"%s\"}".formatted(projectIds, reviewerId)));
  }

  private ResultActions submit(Project project) throws Exception {
    return mockMvc.perform(
        post("/projects/{id}/submission", project.getId())
            .header(HttpHeaders.AUTHORIZATION, bearer(project.getOwner())));
  }

  private ResultActions resubmit(Project project) throws Exception {
    return mockMvc.perform(
        post("/projects/{id}/submission", project.getId())
            .header(HttpHeaders.AUTHORIZATION, bearer(project.getOwner()))
            .contentType(MediaType.APPLICATION_JSON)
            .content("{\"changeSummary\":\"Documentos corrigidos.\"}"));
  }

  private void reject(Project project) {
    Project found = projectRepository.findDetailById(project.getId()).orElseThrow();
    found.reject(OffsetDateTime.now(ZoneOffset.UTC), "Corrigir os documentos.");
    projectRepository.save(found);
  }

  private void rule(User reviewer, String municipality) {
    municipalityRepository.save(
        new ReviewerMunicipality(reviewer, BrazilianState.PE, municipality));
  }

  private void deactivate(User user) {
    user.administer(user.getName(), user.getRole(), false);
    userRepository.save(user);
  }

  private void demote(User user) {
    user.administer(user.getName(), UserRole.USER, true);
    userRepository.save(user);
  }

  private Finding finding(Project project, User author) {
    return findingRepository.save(
        new Finding(
            project,
            FindingSeverity.BLOCKING,
            FindingStage.DOCUMENTS,
            null,
            null,
            DocumentType.ART,
            "Assinar a ART.",
            null,
            author,
            1));
  }

  private Long authorOf(Finding finding) {
    return findingRepository
        .findAllByProjectIdInAndStatus(List.of(finding.getProject().getId()), finding.getStatus())
        .stream()
        .filter(found -> found.getId().equals(finding.getId()))
        .findFirst()
        .orElseThrow()
        .getAuthor()
        .getId();
  }

  private User reviewerOf(Project project) {
    return projectRepository.findDetailById(project.getId()).orElseThrow().getReviewer();
  }

  private List<ProjectEvent> assignmentsOf(Project project) {
    return eventRepository.findAllByProjectIdOrderByOccurredAtAscIdAsc(project.getId()).stream()
        .filter(event -> event.getType() == ProjectEventType.ASSIGNED)
        .toList();
  }

  private ProjectEvent lastAssignmentOf(Project project) {
    return assignmentsOf(project).getLast();
  }

  private Project readyProject(String protocol, String municipality, User owner) {
    Project project =
        projectRepository.save(
            Project.draft(
                "Residencial " + protocol,
                "Rua Central, 100",
                municipality,
                protocol,
                new ResidentialMultifamily(
                    4,
                    SupplyVoltage.V380_220,
                    ConnectionType.THREE_PHASE,
                    EntranceStandard.COLLECTIVE),
                standards,
                owner));
    groupRepository.save(
        new ResidentialGroup(
            project,
            new GroupSpec(
                "Apartamento",
                8,
                new BigDecimal("60"),
                2,
                new BigDecimal("6.0"),
                null,
                null,
                null,
                null,
                null,
                null,
                null)));
    for (DocumentType type : DocumentType.values()) {
      documentRepository.save(new ProjectDocument(project, type, type.name() + ".pdf", PDF));
    }
    demandCalculationService.calculate(
        project.getId(), new AuthenticatedUser(owner.getId(), owner.getRole()));

    return project;
  }

  private String bearer(User user) throws Exception {
    String body =
        mockMvc
            .perform(
                post("/auth/login")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(
                        "{\"email\":\"%s\",\"password\":\"%s\"}"
                            .formatted(user.getEmail(), PASSWORD)))
            .andReturn()
            .getResponse()
            .getContentAsString();

    return "Bearer " + objectMapper.readTree(body).path("data").path("token").asString();
  }
}
