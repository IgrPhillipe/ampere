package br.com.ampere.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import br.com.ampere.config.NormativeTableSeed;
import br.com.ampere.domain.ConnectionType;
import br.com.ampere.domain.DocumentType;
import br.com.ampere.domain.EntranceStandard;
import br.com.ampere.domain.Finding;
import br.com.ampere.domain.FindingSeverity;
import br.com.ampere.domain.FindingStage;
import br.com.ampere.domain.GroupSpec;
import br.com.ampere.domain.Notification;
import br.com.ampere.domain.NotificationType;
import br.com.ampere.domain.Project;
import br.com.ampere.domain.ProjectDocument;
import br.com.ampere.domain.ProjectEvent;
import br.com.ampere.domain.ProjectEventType;
import br.com.ampere.domain.ResidentialGroup;
import br.com.ampere.domain.ResidentialMultifamily;
import br.com.ampere.domain.Standard;
import br.com.ampere.domain.SupplyVoltage;
import br.com.ampere.domain.User;
import br.com.ampere.domain.UserRole;
import br.com.ampere.repository.CalculationRepository;
import br.com.ampere.repository.ConsumerUnitGroupRepository;
import br.com.ampere.repository.FindingRepository;
import br.com.ampere.repository.NormativeTableRepository;
import br.com.ampere.repository.NotificationRepository;
import br.com.ampere.repository.ProjectDocumentRepository;
import br.com.ampere.repository.ProjectEventRepository;
import br.com.ampere.repository.ProjectRepository;
import br.com.ampere.repository.ProjectVersionDocumentRepository;
import br.com.ampere.repository.ProjectVersionRepository;
import br.com.ampere.repository.StandardRepository;
import br.com.ampere.repository.UserRepository;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.List;
import java.util.function.Function;
import java.util.stream.Collectors;
import org.junit.jupiter.api.AfterEach;
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

  @Autowired private MockMvc mockMvc;
  @Autowired private ObjectMapper objectMapper;
  @Autowired private PasswordEncoder passwordEncoder;
  @Autowired private UserRepository userRepository;
  @Autowired private ProjectRepository projectRepository;
  @Autowired private ConsumerUnitGroupRepository groupRepository;
  @Autowired private CalculationRepository calculationRepository;
  @Autowired private ProjectVersionRepository versionRepository;
  @Autowired private ProjectVersionDocumentRepository versionDocumentRepository;
  @Autowired private ProjectDocumentRepository documentRepository;
  @Autowired private FindingRepository findingRepository;
  @Autowired private ProjectEventRepository eventRepository;
  @Autowired private NotificationRepository notificationRepository;
  @Autowired private NormativeTableRepository normativeTableRepository;
  @Autowired private StandardRepository standardRepository;
  @Autowired private DemandCalculationService demandCalculationService;

  private List<Standard> standards;
  private User admin;
  private User ana;
  private User bruno;
  private User designer;

  /** The submissions here commit, and the versions they leave would block the next class's wipe. */
  @AfterEach
  void wipe() {
    eventRepository.deleteAll();
    versionDocumentRepository.deleteAll();
    versionRepository.deleteAll();
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
  void setUp() {
    wipe();

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
  void theMunicipalityRoutesAreGone() throws Exception {
    mockMvc
        .perform(get("/reviewers/municipalities").header(HttpHeaders.AUTHORIZATION, bearer(admin)))
        .andExpect(status().isNotFound());
  }

  @Test
  void submissionWaitsForTheManager() throws Exception {
    Project project = readyProject("2026-9001", "Caruaru", designer);

    submit(project).andExpect(status().isOk());

    assertThat(reviewerOf(project)).isNull();
    assertThat(assignmentsOf(project)).isEmpty();
  }

  @Test
  void submissionWithoutAnAnalystNotifiesEveryActiveManager() throws Exception {
    String hash = passwordEncoder.encode(PASSWORD);
    User second =
        userRepository.save(new User("Bia Gestora", "bia@ampere.com", hash, UserRole.ADMIN));
    User former =
        userRepository.save(new User("Caio Gestor", "caio@ampere.com", hash, UserRole.ADMIN));
    deactivate(former);
    Project project = readyProject("2026-9002", "Recife", designer);

    submit(project).andExpect(status().isOk());

    for (User manager : List.of(admin, second)) {
      notifications(manager)
          .andExpect(jsonPath("$.data.unreadCount").value(1))
          .andExpect(jsonPath("$.data.items[0].type").value("PROJECT_UNASSIGNED"))
          .andExpect(
              jsonPath("$.data.items[0].text").value("Projeto 2026-9002 aguardando analista"))
          .andExpect(
              jsonPath("$.data.items[0].link")
                  .value("/projetos?status=UNDER_REVIEW&reviewer=none"));
    }
    assertThat(notificationRepository.findAllByProjectId(project.getId()))
        .extracting(notice -> notice.getRecipient().getId())
        .containsExactlyInAnyOrder(admin.getId(), second.getId());
  }

  @Test
  void assigningReadsTheManagersNotice() throws Exception {
    Project project = readyProject("2026-9003", "Recife", designer);
    submit(project).andExpect(status().isOk());

    assign(List.of(project), ana).andExpect(status().isNoContent());

    notifications(admin)
        .andExpect(jsonPath("$.data.unreadCount").value(0))
        .andExpect(jsonPath("$.data.items", hasSize(1)))
        .andExpect(jsonPath("$.data.items[0].read").value(true));
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
    // Only the notice of the first submission, read when the manager assigned it.
    notifications(admin)
        .andExpect(jsonPath("$.data.unreadCount").value(0))
        .andExpect(jsonPath("$.data.items", hasSize(1)));
  }

  @Test
  void resubmissionWaitsForTheManagerWhenWhoRejectedIsInactive() throws Exception {
    Project project = readyProject("2026-9006", "Caruaru", designer);
    submit(project).andExpect(status().isOk());
    assign(List.of(project), bruno).andExpect(status().isNoContent());
    reject(project);
    deactivate(bruno);

    resubmit(project).andExpect(status().isOk());

    assertThat(reviewerOf(project)).isNull();
    notifications(admin)
        .andExpect(jsonPath("$.data.unreadCount").value(1))
        .andExpect(jsonPath("$.data.items", hasSize(2)))
        .andExpect(jsonPath("$.data.items[0].type").value("PROJECT_UNASSIGNED"))
        .andExpect(jsonPath("$.data.items[0].read").value(false));
    assertThat(notificationRepository.findAllByProjectId(project.getId()))
        .filteredOn(notice -> notice.getType() == NotificationType.PROJECT_UNASSIGNED)
        .extracting(notice -> notice.getRecipient().getId())
        .containsOnly(admin.getId());
  }

  @Test
  void notificationsAreListedAndReadOutsideAnOpenSession() throws Exception {
    Project project = readyProject("2026-9012", "Recife", designer);
    submit(project).andExpect(status().isOk());
    assign(List.of(project), bruno).andExpect(status().isNoContent());
    reject(project);
    resubmit(project).andExpect(status().isOk());

    String body = notifications(bruno).andReturn().getResponse().getContentAsString();
    String id =
        objectMapper.readTree(body).path("data").path("items").path(0).path("id").asString();

    mockMvc
        .perform(
            post("/notifications/{id}/read", id)
                .header(HttpHeaders.AUTHORIZATION, bearer(designer)))
        .andExpect(status().isNotFound());
    mockMvc
        .perform(
            post("/notifications/{id}/read", id).header(HttpHeaders.AUTHORIZATION, bearer(bruno)))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.data.projectId").value(String.valueOf(project.getId())))
        .andExpect(jsonPath("$.data.read").value(true));
    mockMvc
        .perform(post("/notifications/read-all").header(HttpHeaders.AUTHORIZATION, bearer(bruno)))
        .andExpect(status().isNoContent());
    notifications(bruno).andExpect(jsonPath("$.data.unreadCount").value(0));
  }

  @Test
  void reassignmentPointsThePreviousAnalystNoticesToTheQueue() throws Exception {
    Project project = readyProject("2026-9016", "Recife", designer);
    submit(project).andExpect(status().isOk());
    assign(List.of(project), bruno).andExpect(status().isNoContent());
    reject(project);
    resubmit(project).andExpect(status().isOk());
    notifications(bruno)
        .andExpect(jsonPath("$.data.items[0].link").value("/projetos/" + project.getId()));

    assign(List.of(project), ana).andExpect(status().isNoContent());

    notifications(bruno)
        .andExpect(jsonPath("$.data.items", hasSize(1)))
        .andExpect(jsonPath("$.data.items[0].link").value("/projetos"));
  }

  @Test
  void redistributionPointsTheRejectingAnalystNoticesToTheQueue() throws Exception {
    Project project = readyProject("2026-9017", "Caruaru", designer);
    submit(project).andExpect(status().isOk());
    assign(List.of(project), bruno).andExpect(status().isNoContent());
    notificationRepository.save(
        new Notification(
            bruno,
            projectRepository.findDetailById(project.getId()).orElseThrow(),
            NotificationType.REVIEW_OVERDUE,
            "Prazo de análise do projeto 2026-9017 vencido",
            "/projetos/" + project.getId(),
            OffsetDateTime.now(ZoneOffset.UTC)));
    reject(project);
    deactivate(bruno);

    resubmit(project).andExpect(status().isOk());

    assertThat(notificationRepository.findAllByProjectId(project.getId()))
        .filteredOn(notice -> notice.getRecipient().getId().equals(bruno.getId()))
        .extracting(Notification::getLink)
        .containsExactly("/projetos");
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
        .perform(get("/review-queue").header(HttpHeaders.AUTHORIZATION, bearer(admin)))
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

    open(project, ana).andExpect(status().isNotFound());

    assign(List.of(project), ana).andExpect(status().isNoContent());

    open(project, bruno).andExpect(status().isNotFound());
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

  private ResultActions notifications(User user) throws Exception {
    return mockMvc.perform(get("/notifications").header(HttpHeaders.AUTHORIZATION, bearer(user)));
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
                ConnectionType.SINGLE_PHASE,
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
