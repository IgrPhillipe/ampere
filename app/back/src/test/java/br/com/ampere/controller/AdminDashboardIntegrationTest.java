package br.com.ampere.controller;

import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import br.com.ampere.domain.ConnectionType;
import br.com.ampere.domain.EntranceStandard;
import br.com.ampere.domain.Project;
import br.com.ampere.domain.ProjectStatus;
import br.com.ampere.domain.ResidentialMultifamily;
import br.com.ampere.domain.Standard;
import br.com.ampere.domain.SupplyVoltage;
import br.com.ampere.domain.User;
import br.com.ampere.domain.UserRole;
import br.com.ampere.repository.ProjectRepository;
import br.com.ampere.repository.ReviewerMunicipalityRepository;
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
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;
import org.springframework.transaction.annotation.Transactional;
import tools.jackson.databind.ObjectMapper;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class AdminDashboardIntegrationTest {

  private static final String PASSWORD = "senha@123";

  @Autowired private MockMvc mockMvc;
  @Autowired private UserRepository userRepository;
  @Autowired private ProjectRepository projectRepository;
  @Autowired private ReviewerMunicipalityRepository municipalityRepository;
  @Autowired private PasswordEncoder passwordEncoder;
  @Autowired private ObjectMapper objectMapper;

  private User admin;
  private User designer;
  private User reviewer;

  @BeforeEach
  void setup() {
    projectRepository.deleteAll();
    municipalityRepository.deleteAll();
    userRepository.deleteAll();

    admin =
        userRepository.save(
            new User("Admin Gestor", "admin@ampere.com", passwordEncoder.encode(PASSWORD), UserRole.ADMIN));
    designer =
        userRepository.save(
            new User("João Projetista", "joao@ampere.com", passwordEncoder.encode(PASSWORD), UserRole.USER));
    reviewer =
        userRepository.save(
            new User("Ana Analista", "ana@ampere.com", passwordEncoder.encode(PASSWORD), UserRole.REVIEWER));
  }

  @Test
  void returns403ForNonAdminRoles() throws Exception {
    String designerToken = token("joao@ampere.com", PASSWORD);
    String reviewerToken = token("ana@ampere.com", PASSWORD);

    mockMvc
        .perform(authorized(get("/dashboard/admin"), designerToken))
        .andExpect(status().isForbidden());

    mockMvc
        .perform(authorized(get("/dashboard/admin"), reviewerToken))
        .andExpect(status().isForbidden());
  }

  @Test
  void returnsDashboardIndicatorsForAdmin() throws Exception {
    String adminToken = token("admin@ampere.com", PASSWORD);

    // Inactive user
    User inactive =
        new User("Inativo", "inativo@ampere.com", passwordEncoder.encode(PASSWORD), UserRole.USER);
    inactive.administer("Inativo", UserRole.USER, false);
    userRepository.save(inactive);

    // User with pending password change
    User pendingPwd =
        User.withTemporaryPassword(
            "Temp Pwd", "temp@ampere.com", passwordEncoder.encode(PASSWORD), UserRole.USER);
    userRepository.save(pendingPwd);

    // Projects: 1 draft, 1 rejected, 2 underReview (1 assigned to ana, 1 unassigned)
    Project draft =
        Project.draft(
            "Projeto Rascunho",
            "Rua 1",
            "Recife",
            "2026-0001",
            new ResidentialMultifamily(
                6, SupplyVoltage.V220_127, ConnectionType.THREE_PHASE, EntranceStandard.COLLECTIVE),
            List.<Standard>of(),
            designer);
    projectRepository.save(draft);

    Project rejected =
        Project.draft(
            "Projeto Reprovado",
            "Rua 2",
            "Recife",
            "2026-0002",
            new ResidentialMultifamily(
                6, SupplyVoltage.V220_127, ConnectionType.THREE_PHASE, EntranceStandard.COLLECTIVE),
            List.<Standard>of(),
            designer);
    rejected.submit(OffsetDateTime.now(ZoneOffset.UTC).minusDays(10));
    rejected.reject(OffsetDateTime.now(ZoneOffset.UTC).minusDays(5));
    projectRepository.save(rejected);

    // Project under review assigned to Ana, submitted 28 days ago -> due in 2 days (dueIn3Days)
    Project underReviewAssigned =
        Project.draft(
            "Projeto Em Analise 1",
            "Rua 3",
            "Recife",
            "2026-0003",
            new ResidentialMultifamily(
                6, SupplyVoltage.V220_127, ConnectionType.THREE_PHASE, EntranceStandard.COLLECTIVE),
            List.<Standard>of(),
            designer);
    underReviewAssigned.submit(OffsetDateTime.now(ZoneOffset.UTC).minusDays(28));
    underReviewAssigned.assignReviewer(reviewer);
    projectRepository.save(underReviewAssigned);

    // Project under review unassigned, submitted 35 days ago -> overdue
    Project underReviewOverdue =
        Project.draft(
            "Projeto Em Analise 2",
            "Rua 4",
            "Recife",
            "2026-0004",
            new ResidentialMultifamily(
                6, SupplyVoltage.V220_127, ConnectionType.THREE_PHASE, EntranceStandard.COLLECTIVE),
            List.<Standard>of(),
            designer);
    underReviewOverdue.submit(OffsetDateTime.now(ZoneOffset.UTC).minusDays(35));
    projectRepository.save(underReviewOverdue);

    mockMvc
        .perform(authorized(get("/dashboard/admin"), adminToken))
        .andExpect(status().isOk())
        // users
        .andExpect(jsonPath("$.data.users.activeByRole.user").value(2))
        .andExpect(jsonPath("$.data.users.activeByRole.reviewer").value(1))
        .andExpect(jsonPath("$.data.users.activeByRole.admin").value(1))
        .andExpect(jsonPath("$.data.users.inactive").value(1))
        .andExpect(jsonPath("$.data.users.mustChangePassword").value(1))
        .andExpect(jsonPath("$.data.users.withoutAccess30Days").value(4))
        // projects
        .andExpect(jsonPath("$.data.projects.draft").value(1))
        .andExpect(jsonPath("$.data.projects.underReview").value(2))
        .andExpect(jsonPath("$.data.projects.rejected").value(1))
        // queue
        .andExpect(jsonPath("$.data.queue.unassigned").value(1))
        .andExpect(jsonPath("$.data.queue.dueIn3Days").value(1))
        .andExpect(jsonPath("$.data.queue.overdue").value(1))
        .andExpect(jsonPath("$.data.queue.byReviewer", hasSize(2))) // reviewer & admin canReview
        .andExpect(jsonPath("$.data.queue.byReviewer[0].name").value("Admin Gestor"))
        .andExpect(jsonPath("$.data.queue.byReviewer[0].underReview").value(0))
        .andExpect(jsonPath("$.data.queue.byReviewer[1].name").value("Ana Analista"))
        .andExpect(jsonPath("$.data.queue.byReviewer[1].underReview").value(1))
        .andExpect(jsonPath("$.data.queue.municipalitiesWithoutReviewer").value(186));
  }

  private static MockHttpServletRequestBuilder authorized(
      MockHttpServletRequestBuilder request, String token) {
    return request
        .header("Authorization", "Bearer " + token)
        .contentType(MediaType.APPLICATION_JSON);
  }

  private String token(String email, String password) throws Exception {
    String response =
        mockMvc
            .perform(
                post("/auth/login")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("{\"email\":\"" + email + "\",\"password\":\"" + password + "\"}"))
            .andExpect(status().isOk())
            .andReturn()
            .getResponse()
            .getContentAsString();
    return objectMapper.readTree(response).get("data").get("token").asString();
  }
}
