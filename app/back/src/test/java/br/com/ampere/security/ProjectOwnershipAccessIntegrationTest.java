package br.com.ampere.security;

import static org.hamcrest.Matchers.containsInAnyOrder;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
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
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.JwtRequestPostProcessor;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class ProjectOwnershipAccessIntegrationTest {

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
  @Autowired private ProjectRepository projectRepository;
  @Autowired private FindingRepository findingRepository;
  @Autowired private CalculationRepository calculationRepository;
  @Autowired private NormativeTableRepository normativeTableRepository;
  @Autowired private StandardRepository standardRepository;
  @Autowired private UserRepository userRepository;

  private User firstDesigner;
  private User secondDesigner;
  private User analyst;
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

    firstDesigner =
        userRepository.save(new User("Ana Projetista", "ana@ampere.com", "hash", UserRole.USER));
    secondDesigner =
        userRepository.save(new User("Beto Projetista", "beto@ampere.com", "hash", UserRole.USER));
    analyst =
        userRepository.save(new User("Alice Analista", "admin@ampere.com", "hash", UserRole.ADMIN));

    firstDraft = projectRepository.save(project("Projeto Ana", "2026-2001", firstDesigner));
    firstSubmitted = submitted("Projeto Ana Enviado", "2026-2002", firstDesigner);
    secondDraft = projectRepository.save(project("Projeto Beto", "2026-3001", secondDesigner));
    secondSubmitted = submitted("Projeto Beto Enviado", "2026-3002", secondDesigner);
  }

  @Test
  void designerListsCountsAndSearchesOnlyOwnedProjects() throws Exception {
    mockMvc
        .perform(get("/projects").with(actor(firstDesigner)))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.pagination.total").value(2))
        .andExpect(
            jsonPath("$.data[*].protocol").value(containsInAnyOrder("2026-2001", "2026-2002")));

    mockMvc
        .perform(get("/projects/status-counts").with(actor(firstDesigner)))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.data.total").value(2))
        .andExpect(jsonPath("$.data.draft").value(1))
        .andExpect(jsonPath("$.data.underReview").value(1));

    mockMvc
        .perform(get("/projects").param("search", "Projeto Beto").with(actor(firstDesigner)))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.pagination.total").value(0));
  }

  @Test
  void designerReceivesNotFoundWhenReadingOrWritingAnotherOwnersProject() throws Exception {
    mockMvc
        .perform(get("/projects/{id}", secondDraft.getId()).with(actor(firstDesigner)))
        .andExpect(status().isNotFound());
    mockMvc
        .perform(
            put("/projects/{id}", secondDraft.getId())
                .with(actor(firstDesigner))
                .contentType(MediaType.APPLICATION_JSON)
                .content(PROJECT_BODY))
        .andExpect(status().isNotFound());
    mockMvc
        .perform(delete("/projects/{id}", secondDraft.getId()).with(actor(firstDesigner)))
        .andExpect(status().isNotFound());
  }

  @Test
  void ownershipAlsoProtectsGroupsCalculationsDocumentsMemorialAndSubmission() throws Exception {
    String base = "/projects/" + secondDraft.getId();

    mockMvc
        .perform(get(base + "/consumer-unit-groups").with(actor(firstDesigner)))
        .andExpect(status().isNotFound());
    mockMvc
        .perform(delete(base + "/consumer-unit-groups/1").with(actor(firstDesigner)))
        .andExpect(status().isNotFound());
    mockMvc
        .perform(post(base + "/calculations").with(actor(firstDesigner)))
        .andExpect(status().isNotFound());
    mockMvc
        .perform(get(base + "/calculations/latest").with(actor(firstDesigner)))
        .andExpect(status().isNotFound());
    mockMvc
        .perform(get(base + "/documents").with(actor(firstDesigner)))
        .andExpect(status().isNotFound());
    mockMvc
        .perform(delete(base + "/documents/1").with(actor(firstDesigner)))
        .andExpect(status().isNotFound());
    mockMvc
        .perform(get(base + "/memorial").with(actor(firstDesigner)))
        .andExpect(status().isNotFound());
    mockMvc
        .perform(get(base + "/submission").with(actor(firstDesigner)))
        .andExpect(status().isNotFound());
    mockMvc
        .perform(post(base + "/submission").with(actor(firstDesigner)))
        .andExpect(status().isNotFound());
  }

  @Test
  void analystReadsAllSubmittedProjectsButCannotSeeDrafts() throws Exception {
    mockMvc
        .perform(get("/projects").with(actor(analyst)))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.pagination.total").value(2))
        .andExpect(
            jsonPath("$.data[*].protocol").value(containsInAnyOrder("2026-2002", "2026-3002")));

    mockMvc
        .perform(get("/projects/{id}", firstSubmitted.getId()).with(actor(analyst)))
        .andExpect(status().isOk());
    mockMvc
        .perform(get("/projects/{id}", firstDraft.getId()).with(actor(analyst)))
        .andExpect(status().isNotFound());
    mockMvc
        .perform(get("/projects/{id}", secondSubmitted.getId()).with(actor(analyst)))
        .andExpect(status().isOk());
  }

  @Test
  void analystCannotWriteThroughDesignerEndpoints() throws Exception {
    String base = "/projects/" + firstSubmitted.getId();

    mockMvc
        .perform(
            post("/projects")
                .with(actor(analyst))
                .contentType(MediaType.APPLICATION_JSON)
                .content(PROJECT_BODY))
        .andExpect(status().isForbidden());
    mockMvc
        .perform(
            put("/projects/{id}", firstSubmitted.getId())
                .with(actor(analyst))
                .contentType(MediaType.APPLICATION_JSON)
                .content(PROJECT_BODY))
        .andExpect(status().isForbidden());
    mockMvc
        .perform(delete("/projects/{id}", firstSubmitted.getId()).with(actor(analyst)))
        .andExpect(status().isForbidden());
    mockMvc
        .perform(delete(base + "/consumer-unit-groups/1").with(actor(analyst)))
        .andExpect(status().isForbidden());
    mockMvc
        .perform(post(base + "/calculations").with(actor(analyst)))
        .andExpect(status().isForbidden());
    mockMvc
        .perform(delete(base + "/documents/1").with(actor(analyst)))
        .andExpect(status().isForbidden());
    mockMvc
        .perform(post(base + "/submission").with(actor(analyst)))
        .andExpect(status().isForbidden());
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

  private static JwtRequestPostProcessor actor(User user) {
    return jwt()
        .jwt(
            token ->
                token
                    .subject(String.valueOf(user.getId()))
                    .claim("email", user.getEmail())
                    .claim("role", user.getRole().getValue()));
  }
}
