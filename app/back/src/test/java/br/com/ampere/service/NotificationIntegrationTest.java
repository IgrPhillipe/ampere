package br.com.ampere.service;

import static org.hamcrest.Matchers.contains;
import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import br.com.ampere.domain.ConnectionType;
import br.com.ampere.domain.EntranceStandard;
import br.com.ampere.domain.Project;
import br.com.ampere.domain.ResidentialMultifamily;
import br.com.ampere.domain.Standard;
import br.com.ampere.domain.SupplyVoltage;
import br.com.ampere.domain.User;
import br.com.ampere.domain.UserRole;
import br.com.ampere.repository.CalculationRepository;
import br.com.ampere.repository.ConsumerUnitGroupRepository;
import br.com.ampere.repository.FindingRepository;
import br.com.ampere.repository.NotificationRepository;
import br.com.ampere.repository.ProjectDocumentRepository;
import br.com.ampere.repository.ProjectRepository;
import br.com.ampere.repository.UserRepository;
import br.com.ampere.utils.Timestamps;
import java.time.OffsetDateTime;
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
class NotificationIntegrationTest {

  private static final String PASSWORD = "senha@123";

  private static final String FINDING_BODY =
      """
      {
        "severity": "BLOCKING",
        "stage": "DOCUMENTS",
        "documentType": "SITE_PLAN",
        "description": "Anexar a comprovação do sistema de recarga."
      }
      """;

  @Autowired private MockMvc mockMvc;
  @Autowired private ObjectMapper objectMapper;
  @Autowired private PasswordEncoder passwordEncoder;
  @Autowired private NotificationService notificationService;
  @Autowired private NotificationRepository notificationRepository;
  @Autowired private CalculationRepository calculationRepository;
  @Autowired private ConsumerUnitGroupRepository groupRepository;
  @Autowired private FindingRepository findingRepository;
  @Autowired private ProjectDocumentRepository documentRepository;
  @Autowired private ProjectRepository projectRepository;
  @Autowired private UserRepository userRepository;

  private User designer;
  private User otherDesigner;
  private User analyst;
  private Project project;

  @BeforeEach
  void setUp() {
    notificationRepository.deleteAll();
    calculationRepository.deleteAll();
    groupRepository.deleteAll();
    findingRepository.deleteAll();
    documentRepository.deleteAll();
    projectRepository.deleteAll();
    userRepository.deleteAll();

    String hash = passwordEncoder.encode(PASSWORD);
    designer =
        userRepository.save(new User("Ana Projetista", "ana@ampere.com", hash, UserRole.USER));
    otherDesigner =
        userRepository.save(new User("Beto Projetista", "beto@ampere.com", hash, UserRole.USER));
    analyst =
        userRepository.save(
            new User("Alice Analista", "alice@ampere.com", hash, UserRole.REVIEWER));
    project = submittedProject("2026-1004", designer, OffsetDateTime.now());
    project.assignReviewer(analyst);
    projectRepository.save(project);
  }

  @Test
  void rejectionReachesOnlyTheDesignerWithTheNumberOfFindings() throws Exception {
    createFinding().andExpect(status().isCreated());
    createFinding().andExpect(status().isCreated());
    decide("REJECT", "Revisar os documentos.").andExpect(status().isOk());

    list(designer)
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.data.unreadCount").value(1))
        .andExpect(jsonPath("$.data.items", hasSize(1)))
        .andExpect(jsonPath("$.data.items[0].type").value("PROJECT_REJECTED"))
        .andExpect(jsonPath("$.data.items[0].protocol").value("2026-1004"))
        .andExpect(
            jsonPath("$.data.items[0].text")
                .value("Projeto 2026-1004 reprovado com 2 apontamentos"))
        .andExpect(
            jsonPath("$.data.items[0].link")
                .value("/projetos/" + project.getId() + "/apontamentos"))
        .andExpect(jsonPath("$.data.items[0].read").value(false))
        .andExpect(jsonPath("$.data.items[0].readAt").doesNotExist());
    list(analyst).andExpect(jsonPath("$.data.unreadCount").value(0));
    list(otherDesigner).andExpect(jsonPath("$.data.items", hasSize(0)));
  }

  @Test
  void approvalReachesOnlyTheDesigner() throws Exception {
    decide("APPROVE", "Projeto em conformidade.").andExpect(status().isOk());

    list(designer)
        .andExpect(jsonPath("$.data.unreadCount").value(1))
        .andExpect(jsonPath("$.data.items[0].type").value("PROJECT_APPROVED"))
        .andExpect(jsonPath("$.data.items[0].text").value("Projeto 2026-1004 aprovado"));
    list(analyst).andExpect(jsonPath("$.data.items", hasSize(0)));
  }

  @Test
  void aRejectionTellsTheDesignerOfTheFindingsReopenedInTheCycle() throws Exception {
    createFinding().andExpect(status().isCreated());
    decide("REJECT", "Corrigir.").andExpect(status().isOk());
    Long findingId = findingRepository.findAll().getFirst().getId();
    project.submit(OffsetDateTime.now());
    projectRepository.flush();
    notificationRepository.deleteAll();

    // Still open and unanswered: reopening it again says nothing new.
    resolve(findingId, "REOPEN").andExpect(status().isOk());
    decide("REJECT", "Corrigir.").andExpect(status().isOk());
    list(designer).andExpect(jsonPath("$.data.items[*].type").value(contains("PROJECT_REJECTED")));

    project.submit(OffsetDateTime.now());
    projectRepository.flush();
    notificationRepository.deleteAll();
    findingRepository
        .findAll()
        .getFirst()
        .respond(br.com.ampere.domain.FindingAnswer.FIXED, null, OffsetDateTime.now());
    findingRepository.flush();
    resolve(findingId, "REOPEN").andExpect(status().isOk());
    resolve(findingId, "ACCEPT").andExpect(status().isOk());
    resolve(findingId, "REOPEN").andExpect(status().isOk());
    list(designer).andExpect(jsonPath("$.data.items", hasSize(0)));

    decide("REJECT", "Corrigir.").andExpect(status().isOk());

    list(designer)
        .andExpect(jsonPath("$.data.unreadCount").value(2))
        .andExpect(
            jsonPath("$.data.items[*].type")
                .value(contains("PROJECT_REJECTED", "FINDING_REOPENED")))
        .andExpect(
            jsonPath("$.data.items[1].text")
                .value("1 apontamento reaberto na reanálise do projeto 2026-1004"));
    list(analyst).andExpect(jsonPath("$.data.items", hasSize(0)));
  }

  @Test
  void deadlineAndOverdueWarningsReachTheAssignedAnalystOnceAndNobodyElse() throws Exception {
    OffsetDateTime now = Timestamps.now();
    Project near = submittedProject("2026-2001", designer, now.minusDays(28));
    near.assignReviewer(analyst);
    Project overdue = submittedProject("2026-2002", designer, now.minusDays(40));
    overdue.assignReviewer(analyst);
    Project comfortable = submittedProject("2026-2003", designer, now.minusDays(5));
    comfortable.assignReviewer(analyst);
    Project unassigned = submittedProject("2026-2004", designer, now.minusDays(40));
    projectRepository.saveAll(List.of(near, overdue, comfortable, unassigned));

    notificationService.issueTimeBasedNotifications(now);
    notificationService.issueTimeBasedNotifications(now);

    list(analyst)
        .andExpect(jsonPath("$.data.unreadCount").value(2))
        .andExpect(
            jsonPath("$.data.items[*].type")
                .value(
                    org.hamcrest.Matchers.containsInAnyOrder(
                        "REVIEW_DEADLINE_NEAR", "REVIEW_OVERDUE")));
    list(designer).andExpect(jsonPath("$.data.items", hasSize(0)));
  }

  @Test
  void approvalNearItsEndReachesTheDesignerOnce() throws Exception {
    OffsetDateTime now = Timestamps.now();
    project.approve(now.minusMonths(36).plusDays(10));
    projectRepository.save(project);

    notificationService.issueTimeBasedNotifications(now);
    notificationService.issueTimeBasedNotifications(now);

    list(designer)
        .andExpect(jsonPath("$.data.unreadCount").value(1))
        .andExpect(jsonPath("$.data.items[0].type").value("APPROVAL_EXPIRING"));
    list(analyst).andExpect(jsonPath("$.data.items", hasSize(0)));
  }

  @Test
  void readingMarksOneOrAllAndKeepsThemListed() throws Exception {
    OffsetDateTime now = Timestamps.now();
    for (int index = 0; index < 4; index++) {
      notificationService.rejected(project, index + 1, now.plusSeconds(index));
    }
    list(designer)
        .andExpect(jsonPath("$.data.unreadCount").value(4))
        .andExpect(
            jsonPath("$.data.items[0].text")
                .value("Projeto 2026-1004 reprovado com 4 apontamentos"));
    String firstId =
        objectMapper
            .readTree(list(designer).andReturn().getResponse().getContentAsString())
            .path("data")
            .path("items")
            .get(0)
            .path("id")
            .asString();

    mockMvc
        .perform(
            post("/notifications/{id}/read", firstId)
                .header(HttpHeaders.AUTHORIZATION, bearer(designer)))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.data.read").value(true))
        .andExpect(jsonPath("$.data.readAt").isNotEmpty());
    list(designer).andExpect(jsonPath("$.data.unreadCount").value(3));

    mockMvc
        .perform(
            post("/notifications/read-all").header(HttpHeaders.AUTHORIZATION, bearer(designer)))
        .andExpect(status().isNoContent());
    list(designer)
        .andExpect(jsonPath("$.data.unreadCount").value(0))
        .andExpect(jsonPath("$.data.items", hasSize(4)))
        .andExpect(jsonPath("$.data.items[*].read").value(contains(true, true, true, true)));
  }

  @Test
  void aUserNeitherReadsNorSeesSomebodyElsesNotification() throws Exception {
    notificationService.approved(project, 0, Timestamps.now());
    Long id = notificationRepository.findAll().getFirst().getId();

    mockMvc
        .perform(
            post("/notifications/{id}/read", id)
                .header(HttpHeaders.AUTHORIZATION, bearer(otherDesigner)))
        .andExpect(status().isNotFound());
    mockMvc
        .perform(
            post("/notifications/{id}/read", 999999)
                .header(HttpHeaders.AUTHORIZATION, bearer(designer)))
        .andExpect(status().isNotFound());
    mockMvc
        .perform(
            post("/notifications/read-all")
                .header(HttpHeaders.AUTHORIZATION, bearer(otherDesigner)))
        .andExpect(status().isNoContent());

    list(designer).andExpect(jsonPath("$.data.unreadCount").value(1));
  }

  @Test
  void requiresAuthentication() throws Exception {
    mockMvc.perform(get("/notifications")).andExpect(status().isUnauthorized());
    mockMvc.perform(post("/notifications/read-all")).andExpect(status().isUnauthorized());
  }

  private ResultActions list(User user) throws Exception {
    return mockMvc.perform(get("/notifications").header(HttpHeaders.AUTHORIZATION, bearer(user)));
  }

  private ResultActions createFinding() throws Exception {
    return mockMvc.perform(
        post("/projects/{id}/findings", project.getId())
            .header(HttpHeaders.AUTHORIZATION, bearer(analyst))
            .contentType(MediaType.APPLICATION_JSON)
            .content(FINDING_BODY));
  }

  private ResultActions decide(String decision, String opinion) throws Exception {
    return mockMvc.perform(
        post("/projects/{id}/decision", project.getId())
            .header(HttpHeaders.AUTHORIZATION, bearer(analyst))
            .contentType(MediaType.APPLICATION_JSON)
            .content("{\"decision\":\"" + decision + "\",\"opinion\":\"" + opinion + "\"}"));
  }

  private ResultActions resolve(Long findingId, String resolution) throws Exception {
    return mockMvc.perform(
        post("/projects/{projectId}/findings/{findingId}/resolution", project.getId(), findingId)
            .header(HttpHeaders.AUTHORIZATION, bearer(analyst))
            .contentType(MediaType.APPLICATION_JSON)
            .content("{\"resolution\":\"" + resolution + "\"}"));
  }

  private Project submittedProject(String protocol, User owner, OffsetDateTime submittedAt) {
    Project submitted =
        Project.draft(
            "Residencial " + protocol,
            "Rua do Projeto, 10",
            "Recife",
            protocol,
            new ResidentialMultifamily(
                6, SupplyVoltage.V220_127, ConnectionType.THREE_PHASE, EntranceStandard.COLLECTIVE),
            List.<Standard>of(),
            owner);
    submitted.submit(submittedAt);
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
