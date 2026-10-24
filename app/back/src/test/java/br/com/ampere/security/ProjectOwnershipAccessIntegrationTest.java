package br.com.ampere.security;

import static org.hamcrest.Matchers.containsInAnyOrder;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
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
import br.com.ampere.repository.FindingRepository;
import br.com.ampere.repository.NormativeTableRepository;
import br.com.ampere.repository.ProjectRepository;
import br.com.ampere.repository.StandardRepository;
import br.com.ampere.repository.UserRepository;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;
import tools.jackson.databind.ObjectMapper;

/**
 * A designer reaches only their own projects; the analyst reads the submitted ones, never writes;
 * the admin reads and writes every project in any status.
 */
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class ProjectOwnershipAccessIntegrationTest {

  private static final String PASSWORD = "senha@123";

  private static final String PROJECT_BODY =
      """
      {
        "name": "Residencial Monte Verde",
        "address": "Rodovia BR-101, km 8",
        "municipality": "Cabo de Santo Agostinho",
        "buildingType": "RESIDENTIAL_MULTIFAMILY",
        "floors": 12,
        "voltage": "V380_220",
        "connectionType": "THREE_PHASE",
        "entranceStandard": "COLLECTIVE"
      }
      """;

  @Autowired private MockMvc mockMvc;
  @Autowired private ObjectMapper objectMapper;
  @Autowired private PasswordEncoder passwordEncoder;
  @Autowired private ProjectRepository projectRepository;
  @Autowired private FindingRepository findingRepository;
  @Autowired private CalculationRepository calculationRepository;
  @Autowired private NormativeTableRepository normativeTableRepository;
  @Autowired private StandardRepository standardRepository;
  @Autowired private UserRepository userRepository;

  private Project firstDraft;
  private Project firstSubmitted;
  private Project secondDraft;
  private Project secondSubmitted;

  @BeforeEach
  void setUp() {
    calculationRepository.deleteAll();
    findingRepository.deleteAll();
    projectRepository.deleteAll();
    normativeTableRepository.deleteAll();
    standardRepository.deleteAll();
    userRepository.deleteAll();
    standardRepository.saveAll(
        List.of(new Standard("DIS-NOR-053", "REV 06"), new Standard("DIS-NOR-030", "REV 07")));

    String hash = passwordEncoder.encode(PASSWORD);
    User firstDesigner =
        userRepository.save(new User("Ana Projetista", "ana@ampere.com", hash, UserRole.USER));
    User secondDesigner =
        userRepository.save(new User("Beto Projetista", "beto@ampere.com", hash, UserRole.USER));
    userRepository.save(new User("Alice Analista", "revisor@ampere.com", hash, UserRole.REVIEWER));
    userRepository.save(new User("Carla Admin", "admin@ampere.com", hash, UserRole.ADMIN));

    firstDraft = projectRepository.save(project("Projeto Ana", "2026-2001", firstDesigner));
    firstSubmitted = submitted("Projeto Ana Enviado", "2026-2002", firstDesigner);
    secondDraft = projectRepository.save(project("Projeto Beto", "2026-3001", secondDesigner));
    secondSubmitted = submitted("Projeto Beto Enviado", "2026-3002", secondDesigner);
  }

  @Test
  void designerListsCountsAndSearchesOnlyOwnedProjects() throws Exception {
    String ana = bearer("ana@ampere.com");
    mockMvc
        .perform(get("/projects").header("Authorization", ana))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.pagination.total").value(2))
        .andExpect(
            jsonPath("$.data[*].protocol").value(containsInAnyOrder("2026-2001", "2026-2002")));

    mockMvc
        .perform(get("/projects/status-counts").header("Authorization", ana))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.data.total").value(2))
        .andExpect(jsonPath("$.data.draft").value(1))
        .andExpect(jsonPath("$.data.underReview").value(1));

    mockMvc
        .perform(get("/projects").param("search", "Projeto Beto").header("Authorization", ana))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.pagination.total").value(0));
  }

  @Test
  void designerReceivesNotFoundWhenReadingOrWritingAnotherOwnersProject() throws Exception {
    String ana = bearer("ana@ampere.com");
    mockMvc
        .perform(get("/projects/{id}", secondSubmitted.getId()).header("Authorization", ana))
        .andExpect(status().isNotFound());
    mockMvc
        .perform(get("/projects/{id}", secondDraft.getId()).header("Authorization", ana))
        .andExpect(status().isNotFound());
    mockMvc
        .perform(
            put("/projects/{id}", secondDraft.getId())
                .header("Authorization", ana)
                .contentType(MediaType.APPLICATION_JSON)
                .content(PROJECT_BODY))
        .andExpect(status().isNotFound());
    mockMvc
        .perform(delete("/projects/{id}", secondDraft.getId()).header("Authorization", ana))
        .andExpect(status().isNotFound());
  }

  @Test
  void ownershipAlsoProtectsGroupsCalculationsDocumentsMemorialAndSubmission() throws Exception {
    String ana = bearer("ana@ampere.com");
    String base = "/projects/" + secondDraft.getId();

    mockMvc
        .perform(get(base + "/consumer-unit-groups").header("Authorization", ana))
        .andExpect(status().isNotFound());
    mockMvc
        .perform(delete(base + "/consumer-unit-groups/1").header("Authorization", ana))
        .andExpect(status().isNotFound());
    mockMvc
        .perform(post(base + "/calculations").header("Authorization", ana))
        .andExpect(status().isNotFound());
    mockMvc
        .perform(get(base + "/calculations/latest").header("Authorization", ana))
        .andExpect(status().isNotFound());
    mockMvc
        .perform(get(base + "/documents").header("Authorization", ana))
        .andExpect(status().isNotFound());
    mockMvc
        .perform(delete(base + "/documents/1").header("Authorization", ana))
        .andExpect(status().isNotFound());
    mockMvc
        .perform(get(base + "/memorial").header("Authorization", ana))
        .andExpect(status().isNotFound());
    mockMvc
        .perform(get(base + "/submission").header("Authorization", ana))
        .andExpect(status().isNotFound());
    mockMvc
        .perform(post(base + "/submission").header("Authorization", ana))
        .andExpect(status().isNotFound());
  }

  @Test
  void analystReadsAllSubmittedProjectsButCannotSeeDrafts() throws Exception {
    String analyst = bearer("revisor@ampere.com");
    mockMvc
        .perform(get("/projects").header("Authorization", analyst))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.pagination.total").value(2))
        .andExpect(
            jsonPath("$.data[*].protocol").value(containsInAnyOrder("2026-2002", "2026-3002")));

    mockMvc
        .perform(get("/projects/{id}", firstSubmitted.getId()).header("Authorization", analyst))
        .andExpect(status().isOk());
    mockMvc
        .perform(get("/projects/{id}", firstDraft.getId()).header("Authorization", analyst))
        .andExpect(status().isNotFound());
    mockMvc
        .perform(get("/projects/{id}", secondSubmitted.getId()).header("Authorization", analyst))
        .andExpect(status().isOk());
  }

  @Test
  void analystCountsOnlyTheSubmittedProjects() throws Exception {
    String analyst = bearer("revisor@ampere.com");

    mockMvc
        .perform(get("/projects/status-counts").header("Authorization", analyst))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.data.total").value(2))
        .andExpect(jsonPath("$.data.draft").value(0))
        .andExpect(jsonPath("$.data.underReview").value(2));
  }

  @Test
  void analystCannotWriteThroughDesignerEndpoints() throws Exception {
    String analyst = bearer("revisor@ampere.com");
    String base = "/projects/" + firstSubmitted.getId();

    mockMvc
        .perform(
            post("/projects")
                .header("Authorization", analyst)
                .contentType(MediaType.APPLICATION_JSON)
                .content(PROJECT_BODY))
        .andExpect(status().isForbidden());
    mockMvc
        .perform(
            put("/projects/{id}", firstSubmitted.getId())
                .header("Authorization", analyst)
                .contentType(MediaType.APPLICATION_JSON)
                .content(PROJECT_BODY))
        .andExpect(status().isForbidden());
    mockMvc
        .perform(delete("/projects/{id}", firstSubmitted.getId()).header("Authorization", analyst))
        .andExpect(status().isForbidden());
    mockMvc
        .perform(delete(base + "/consumer-unit-groups/1").header("Authorization", analyst))
        .andExpect(status().isForbidden());
    mockMvc
        .perform(post(base + "/calculations").header("Authorization", analyst))
        .andExpect(status().isForbidden());
    mockMvc
        .perform(delete(base + "/documents/1").header("Authorization", analyst))
        .andExpect(status().isForbidden());
    mockMvc
        .perform(post(base + "/submission").header("Authorization", analyst))
        .andExpect(status().isForbidden());
  }

  @Test
  void adminListsAndCountsEveryProjectIncludingDrafts() throws Exception {
    String admin = bearer("admin@ampere.com");

    mockMvc
        .perform(get("/projects").header("Authorization", admin))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.pagination.total").value(4))
        .andExpect(
            jsonPath("$.data[?(@.protocol == '2026-3001')].ownerName").value("Beto Projetista"));
    mockMvc
        .perform(get("/projects/status-counts").header("Authorization", admin))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.data.total").value(4))
        .andExpect(jsonPath("$.data.draft").value(2))
        .andExpect(jsonPath("$.data.underReview").value(2));
    mockMvc
        .perform(get("/projects/{id}", secondDraft.getId()).header("Authorization", admin))
        .andExpect(status().isOk());
  }

  @Test
  void adminEditsAndDeletesAnotherOwnersProjectAfterTheSubmission() throws Exception {
    String admin = bearer("admin@ampere.com");

    mockMvc
        .perform(
            put("/projects/{id}", firstSubmitted.getId())
                .header("Authorization", admin)
                .contentType(MediaType.APPLICATION_JSON)
                .content(PROJECT_BODY))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.data.name").value("Residencial Monte Verde"));
    mockMvc
        .perform(delete("/projects/{id}", secondSubmitted.getId()).header("Authorization", admin))
        .andExpect(status().isNoContent());
    mockMvc
        .perform(get("/projects/{id}", secondSubmitted.getId()).header("Authorization", admin))
        .andExpect(status().isNotFound());
  }

  /** Past the role and status guards, a submitted project without groups is just incomplete. */
  @Test
  void adminWritesTheContentOfASubmittedProject() throws Exception {
    String admin = bearer("admin@ampere.com");
    String base = "/projects/" + firstSubmitted.getId();

    mockMvc
        .perform(post(base + "/calculations").header("Authorization", admin))
        .andExpect(status().isUnprocessableContent());
    mockMvc
        .perform(delete(base + "/consumer-unit-groups/1").header("Authorization", admin))
        .andExpect(status().isNotFound());
    mockMvc
        .perform(delete(base + "/documents/1").header("Authorization", admin))
        .andExpect(status().isNotFound());
    mockMvc
        .perform(post(base + "/submission").header("Authorization", admin))
        .andExpect(status().isConflict());
  }

  @Test
  void adminCreatesAProject() throws Exception {
    mockMvc
        .perform(
            post("/projects")
                .header("Authorization", bearer("admin@ampere.com"))
                .contentType(MediaType.APPLICATION_JSON)
                .content(PROJECT_BODY))
        .andExpect(status().isCreated());
  }

  @Test
  void designerStillCannotEditASubmittedProject() throws Exception {
    mockMvc
        .perform(
            put("/projects/{id}", firstSubmitted.getId())
                .header("Authorization", bearer("ana@ampere.com"))
                .contentType(MediaType.APPLICATION_JSON)
                .content(PROJECT_BODY))
        .andExpect(status().isConflict());
  }

  private Project submitted(String name, String protocol, User owner) {
    Project project = project(name, protocol, owner);
    project.submit(OffsetDateTime.now(ZoneOffset.UTC));
    return projectRepository.save(project);
  }

  private static Project project(String name, String protocol, User owner) {
    return Project.draft(
        name,
        "Rua do Projeto, 10",
        "Recife",
        protocol,
        new ResidentialMultifamily(
            6, SupplyVoltage.V220_127, ConnectionType.THREE_PHASE, EntranceStandard.COLLECTIVE),
        List.<Standard>of(),
        owner);
  }

  private String bearer(String email) throws Exception {
    String body =
        mockMvc
            .perform(
                post("/auth/login")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("{\"email\":\"" + email + "\",\"password\":\"" + PASSWORD + "\"}"))
            .andReturn()
            .getResponse()
            .getContentAsString();
    return "Bearer " + objectMapper.readTree(body).path("data").path("token").asString();
  }
}
