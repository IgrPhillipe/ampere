package br.com.ampere.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import br.com.ampere.domain.ConnectionType;
import br.com.ampere.domain.EntranceStandard;
import br.com.ampere.domain.Project;
import br.com.ampere.domain.ProjectEvent;
import br.com.ampere.domain.ProjectEventType;
import br.com.ampere.domain.ProjectStatus;
import br.com.ampere.domain.ResidentialMultifamily;
import br.com.ampere.domain.SupplyVoltage;
import br.com.ampere.domain.User;
import br.com.ampere.domain.UserRole;
import br.com.ampere.repository.ProjectEventRepository;
import br.com.ampere.repository.ProjectRepository;
import br.com.ampere.repository.UserRepository;
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
import org.springframework.transaction.annotation.Transactional;
import tools.jackson.databind.ObjectMapper;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class ProjectHistoryIntegrationTest {

  private static final String PASSWORD = "senha@123";

  @Autowired private MockMvc mockMvc;
  @Autowired private ObjectMapper objectMapper;
  @Autowired private PasswordEncoder passwordEncoder;
  @Autowired private ProjectEventRepository eventRepository;
  @Autowired private ProjectRepository projectRepository;
  @Autowired private UserRepository userRepository;

  private User owner;
  private User otherOwner;
  private User analyst;
  private Project submitted;
  private String ownerToken;
  private String otherToken;
  private String analystToken;

  @BeforeEach
  void setUp() throws Exception {
    eventRepository.deleteAll();
    projectRepository.deleteAll();
    userRepository.deleteAll();
    String hash = passwordEncoder.encode(PASSWORD);
    owner = userRepository.save(new User("Ana Projetista", "ana@ampere.com", hash, UserRole.USER));
    otherOwner =
        userRepository.save(new User("Beto Projetista", "beto@ampere.com", hash, UserRole.USER));
    analyst =
        userRepository.save(
            new User("Alice Analista", "alice@ampere.com", hash, UserRole.REVIEWER));
    submitted = project(owner, "2026-8101");
    OffsetDateTime submittedAt = OffsetDateTime.parse("2026-10-04T13:00:00Z");
    submitted.submit(submittedAt);
    projectRepository.saveAndFlush(submitted);
    eventRepository.saveAll(
        List.of(
            event(submitted, ProjectEventType.CREATED, 0, owner, submittedAt.minusDays(2)),
            event(submitted, ProjectEventType.SUBMITTED, 1, owner, submittedAt),
            event(submitted, ProjectEventType.PRE_VALIDATED, 1, null, submittedAt)));
    ownerToken = token(owner.getEmail());
    otherToken = token(otherOwner.getEmail());
    analystToken = token(analyst.getEmail());
  }

  @Test
  void listsEventsInBothDirectionsAndAppliesProjectVisibility() throws Exception {
    mockMvc
        .perform(get(eventsOf(submitted)).header(HttpHeaders.AUTHORIZATION, bearer(ownerToken)))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.data[0].id").isString())
        .andExpect(jsonPath("$.data[0].type").value("PRE_VALIDATED"))
        .andExpect(jsonPath("$.data[1].type").value("SUBMITTED"))
        .andExpect(jsonPath("$.data[2].type").value("CREATED"))
        .andExpect(jsonPath("$.data[2].authorName").value("Ana Projetista"))
        .andExpect(jsonPath("$.data[2].authorRole").value("user"));
    mockMvc
        .perform(
            get(eventsOf(submitted))
                .param("direction", "ASC")
                .header(HttpHeaders.AUTHORIZATION, bearer(analystToken)))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.data[0].type").value("CREATED"))
        .andExpect(jsonPath("$.data[2].type").value("PRE_VALIDATED"));
    mockMvc
        .perform(get(eventsOf(submitted)).header(HttpHeaders.AUTHORIZATION, bearer(otherToken)))
        .andExpect(status().isNotFound());
    mockMvc
        .perform(
            get(eventsOf(submitted))
                .param("direction", "SIDEWAYS")
                .header(HttpHeaders.AUTHORIZATION, bearer(ownerToken)))
        .andExpect(status().isBadRequest());
  }

  @Test
  void exposesReworkContractAndHidesDraftsFromTheAnalyst() throws Exception {
    mockMvc
        .perform(
            get("/projects/{id}/rework", submitted.getId())
                .header(HttpHeaders.AUTHORIZATION, bearer(ownerToken)))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.data.cycleDays").isNumber())
        .andExpect(jsonPath("$.data.submittedVersions").value(1))
        .andExpect(jsonPath("$.data.reviewCycles").value(0))
        .andExpect(jsonPath("$.data.resolvedFindings").value(0))
        .andExpect(jsonPath("$.data.openFindings").value(0))
        .andExpect(jsonPath("$.data.redoneCalculationSteps").value(0));

    Project draft = project(owner, "2026-8102");
    projectRepository.saveAndFlush(draft);
    eventRepository.save(event(draft, ProjectEventType.CREATED, 0, owner, draft.getCreatedAt()));
    mockMvc
        .perform(get(eventsOf(draft)).header(HttpHeaders.AUTHORIZATION, bearer(analystToken)))
        .andExpect(status().isNotFound());
  }

  @Test
  void deletingADraftRemovesItsEvents() throws Exception {
    Project draft = project(owner, "2026-8103");
    projectRepository.saveAndFlush(draft);
    eventRepository.saveAndFlush(
        event(draft, ProjectEventType.CREATED, 0, owner, draft.getCreatedAt()));

    mockMvc
        .perform(
            delete("/projects/{id}", draft.getId())
                .header(HttpHeaders.AUTHORIZATION, bearer(ownerToken)))
        .andExpect(status().isNoContent());
    projectRepository.flush();

    assertThat(eventRepository.findAllByProjectIdOrderByOccurredAtAscIdAsc(draft.getId()))
        .isEmpty();
  }

  private Project project(User projectOwner, String protocol) {
    return projectRepository.save(
        new Project(
            "Residencial Histórico",
            "Rua da Aurora, 100",
            "Recife",
            protocol,
            ProjectStatus.DRAFT,
            new ResidentialMultifamily(
                4, SupplyVoltage.V380_220, ConnectionType.THREE_PHASE, EntranceStandard.COLLECTIVE),
            List.of(),
            projectOwner));
  }

  private static ProjectEvent event(
      Project project, ProjectEventType type, int version, User author, OffsetDateTime occurredAt) {
    return new ProjectEvent(
        project,
        type,
        version,
        author,
        author == null ? null : author.getRole(),
        type.name(),
        null,
        occurredAt);
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

  private static String eventsOf(Project project) {
    return "/projects/" + project.getId() + "/events";
  }

  private static String bearer(String token) {
    return "Bearer " + token;
  }
}
