package br.com.ampere.controller;

import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import br.com.ampere.domain.BrazilianState;
import br.com.ampere.domain.ConcessionArea;
import br.com.ampere.domain.ConnectionType;
import br.com.ampere.domain.EntranceStandard;
import br.com.ampere.domain.Project;
import br.com.ampere.domain.ProjectStatus;
import br.com.ampere.domain.ResidentialMultifamily;
import br.com.ampere.domain.ReviewerMunicipality;
import br.com.ampere.domain.Standard;
import br.com.ampere.domain.SupplyVoltage;
import br.com.ampere.domain.User;
import br.com.ampere.domain.UserRole;
import br.com.ampere.repository.ProjectRepository;
import br.com.ampere.repository.ReviewerMunicipalityRepository;
import br.com.ampere.repository.UserRepository;
import br.com.ampere.utils.Timestamps;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;
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

  private User designer;
  private User reviewer;
  private int protocols;

  @BeforeEach
  void setup() {
    projectRepository.deleteAll();
    municipalityRepository.deleteAll();
    userRepository.deleteAll();
    user("Admin Gestor", "admin@ampere.com", UserRole.ADMIN);
    designer = user("João Projetista", "joao@ampere.com", UserRole.USER);
    reviewer = user("Ana Analista", "ana@ampere.com", UserRole.REVIEWER);
  }

  @Test
  void answers403ToTheOtherRoles() throws Exception {
    for (String email : List.of("joao@ampere.com", "ana@ampere.com")) {
      mockMvc
          .perform(get("/dashboard/admin").header("Authorization", "Bearer " + token(email)))
          .andExpect(status().isForbidden());
    }
  }

  @Test
  void answersZeroWithoutProjectsOrMunicipalities() throws Exception {
    dashboard()
        .andExpect(jsonPath("$.data.users.activeByRole.user").value(1))
        .andExpect(jsonPath("$.data.users.inactive").value(0))
        .andExpect(jsonPath("$.data.projects.draft").value(0))
        .andExpect(jsonPath("$.data.projects.underReview").value(0))
        .andExpect(jsonPath("$.data.queue.unassigned").value(0))
        .andExpect(jsonPath("$.data.queue.byReviewer[0].underReview").value(0))
        .andExpect(
            jsonPath("$.data.queue.municipalitiesWithoutReviewer")
                .value(ConcessionArea.totalMunicipalities()));
  }

  @Test
  void countsTheUsersTheProjectsAndTheQueue() throws Exception {
    User inactive = user("Inativo", "inativo@ampere.com", UserRole.USER);
    inactive.administer("Inativo", UserRole.USER, false);
    userRepository.save(
        User.withTemporaryPassword(
            "Temp Pwd", "temp@ampere.com", passwordEncoder.encode(PASSWORD), UserRole.USER));

    projectRepository.save(project());
    projectRepository.save(
        new Project(
            "Aguardando",
            "Rua 1",
            "Recife",
            "2026-9999",
            ProjectStatus.AWAITING_SUBMISSION,
            building(),
            List.of(),
            designer));
    Project rejected = submitted(10);
    rejected.reject(Timestamps.now().minusDays(5));
    projectRepository.save(rejected);
    Project dueSoon = submitted(28);
    dueSoon.assignReviewer(reviewer);
    projectRepository.save(dueSoon);
    projectRepository.save(submitted(35));

    dashboard()
        .andExpect(jsonPath("$.data.users.activeByRole.user").value(2))
        .andExpect(jsonPath("$.data.users.activeByRole.reviewer").value(1))
        .andExpect(jsonPath("$.data.users.activeByRole.admin").value(1))
        .andExpect(jsonPath("$.data.users.inactive").value(1))
        .andExpect(jsonPath("$.data.users.mustChangePassword").value(1))
        .andExpect(jsonPath("$.data.users.withoutAccess30Days").value(3))
        .andExpect(jsonPath("$.data.projects.draft").value(1))
        .andExpect(jsonPath("$.data.projects.awaitingSubmission").value(1))
        .andExpect(jsonPath("$.data.projects.underReview").value(2))
        .andExpect(jsonPath("$.data.projects.rejected").value(1))
        .andExpect(jsonPath("$.data.queue.unassigned").value(1))
        .andExpect(jsonPath("$.data.queue.dueIn3Days").value(1))
        .andExpect(jsonPath("$.data.queue.overdue").value(1))
        .andExpect(jsonPath("$.data.queue.byReviewer", hasSize(2)))
        .andExpect(jsonPath("$.data.queue.byReviewer[0].name").value("Admin Gestor"))
        .andExpect(jsonPath("$.data.queue.byReviewer[0].underReview").value(0))
        .andExpect(jsonPath("$.data.queue.byReviewer[1].name").value("Ana Analista"))
        .andExpect(jsonPath("$.data.queue.byReviewer[1].underReview").value(1));
  }

  @Test
  void keepsTheLoadOfADeactivatedReviewer() throws Exception {
    Project assigned = submitted(10);
    assigned.assignReviewer(reviewer);
    projectRepository.save(assigned);
    reviewer.administer(reviewer.getName(), UserRole.REVIEWER, false);

    dashboard()
        .andExpect(jsonPath("$.data.queue.unassigned").value(0))
        .andExpect(jsonPath("$.data.queue.byReviewer", hasSize(2)))
        .andExpect(jsonPath("$.data.queue.byReviewer[1].name").value("Ana Analista"))
        .andExpect(jsonPath("$.data.queue.byReviewer[1].active").value(false))
        .andExpect(jsonPath("$.data.queue.byReviewer[1].underReview").value(1));
  }

  @Test
  void coversOnlyTheMunicipalitiesOfActiveReviewers() throws Exception {
    User former = user("Ex Analista", "ex@ampere.com", UserRole.REVIEWER);
    municipalityRepository.save(new ReviewerMunicipality(reviewer, BrazilianState.PE, "Recife"));
    municipalityRepository.save(new ReviewerMunicipality(former, BrazilianState.PE, "Olinda"));
    former.administer(former.getName(), UserRole.USER, true);

    dashboard()
        .andExpect(
            jsonPath("$.data.queue.municipalitiesWithoutReviewer")
                .value(ConcessionArea.totalMunicipalities() - 1));
  }

  private ResultActions dashboard() throws Exception {
    return mockMvc
        .perform(
            get("/dashboard/admin").header("Authorization", "Bearer " + token("admin@ampere.com")))
        .andExpect(status().isOk());
  }

  private User user(String name, String email, UserRole role) {
    return userRepository.save(new User(name, email, passwordEncoder.encode(PASSWORD), role));
  }

  private Project project() {
    protocols++;
    return Project.draft(
        "Projeto " + protocols,
        "Rua " + protocols,
        "Recife",
        "2026-%04d".formatted(protocols),
        building(),
        List.<Standard>of(),
        designer);
  }

  private Project submitted(int daysAgo) {
    Project project = project();
    project.submit(Timestamps.now().minusDays(daysAgo));
    return project;
  }

  private static ResidentialMultifamily building() {
    return new ResidentialMultifamily(
        6, SupplyVoltage.V220_127, ConnectionType.THREE_PHASE, EntranceStandard.COLLECTIVE);
  }

  private String token(String email) throws Exception {
    String response =
        mockMvc
            .perform(
                post("/auth/login")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("{\"email\":\"" + email + "\",\"password\":\"" + PASSWORD + "\"}"))
            .andExpect(status().isOk())
            .andReturn()
            .getResponse()
            .getContentAsString();
    return objectMapper.readTree(response).get("data").get("token").asString();
  }
}
