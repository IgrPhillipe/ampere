package br.com.ampere.security;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import br.com.ampere.domain.Standard;
import br.com.ampere.domain.User;
import br.com.ampere.domain.UserRole;
import br.com.ampere.repository.CalculationRepository;
import br.com.ampere.repository.FindingRepository;
import br.com.ampere.repository.NormativeTableRepository;
import br.com.ampere.repository.ProjectRepository;
import br.com.ampere.repository.StandardRepository;
import br.com.ampere.repository.UserRepository;
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

/** /admin is the normative tables area: ADMIN only, typed by one person and verified by another. */
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class AdminAccessIntegrationTest {

  private static final String PASSWORD = "senha@123";

  private static final String QUADRO_37 =
      """
      {
        "code": "Q37_SAFETY_FACTOR",
        "identification": "Quadro 37",
        "item": "Anexo I, item 5",
        "page": "108",
        "rows": [
          { "upperBound": 25, "value": 1.5, "label": "Dr ≤ 25 kVA" },
          { "lowerBound": 25, "upperBound": 50, "value": 1.3 },
          { "lowerBound": 50, "upperBound": 100, "value": 1.2 },
          { "lowerBound": 100, "value": 1.1 }
        ]
      }
      """;

  @Autowired private MockMvc mockMvc;

  @Autowired private ObjectMapper objectMapper;

  @Autowired private PasswordEncoder passwordEncoder;

  @Autowired private UserRepository userRepository;

  @Autowired private StandardRepository standardRepository;

  @Autowired private NormativeTableRepository normativeTableRepository;

  @Autowired private CalculationRepository calculationRepository;

  @Autowired private FindingRepository findingRepository;

  @Autowired private ProjectRepository projectRepository;

  @BeforeEach
  void seed() {
    calculationRepository.deleteAll();
    findingRepository.deleteAll();
    projectRepository.deleteAll();
    normativeTableRepository.deleteAll();
    standardRepository.deleteAll();
    userRepository.deleteAll();
    standardRepository.saveAll(
        List.of(new Standard("DIS-NOR-053", "REV 06"), new Standard("DIS-NOR-030", "REV 07")));
    String hash = passwordEncoder.encode(PASSWORD);
    userRepository.saveAll(
        List.of(
            new User("Usuário", "user@ampere.local", hash, UserRole.USER),
            new User("Admin", "admin@ampere.local", hash, UserRole.ADMIN),
            new User("Revisor", "revisor@ampere.local", hash, UserRole.ADMIN)));
  }

  @Test
  void aDesignerCannotSeeTheNormativeTables() throws Exception {
    mockMvc
        .perform(
            get("/admin/normative-tables").header("Authorization", bearer("user@ampere.local")))
        .andExpect(status().isForbidden())
        .andExpect(
            jsonPath("$.detail").value(ProblemDetailAuthenticationHandler.FORBIDDEN_MESSAGE));
  }

  @Test
  void anAdminListsTheTablesAndTheirColumns() throws Exception {
    String admin = bearer("admin@ampere.local");

    mockMvc
        .perform(get("/admin/normative-tables").header("Authorization", admin))
        .andExpect(status().isOk());
    mockMvc
        .perform(get("/admin/normative-tables/codes").header("Authorization", admin))
        .andExpect(status().isOk())
        .andExpect(
            jsonPath("$.data[?(@.code == 'T2_SERVICE_ENTRANCE_380_220')].valueLabels[2]")
                .value("Disjuntor geral (A)"));
  }

  @Test
  void whoTypesATableIsNotWhoPublishesIt() throws Exception {
    String admin = bearer("admin@ampere.local");
    String id = create(admin);

    mockMvc
        .perform(post("/admin/normative-tables/" + id + "/publish").header("Authorization", admin))
        .andExpect(status().isConflict())
        .andExpect(jsonPath("$.detail").value("A conferência precisa ser feita por outra pessoa."));

    mockMvc
        .perform(
            post("/admin/normative-tables/" + id + "/publish")
                .header("Authorization", bearer("revisor@ampere.local")))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.data.status").value("PUBLISHED"))
        .andExpect(jsonPath("$.data.verifiedBy").value("revisor@ampere.local"));

    mockMvc
        .perform(
            put("/admin/normative-tables/" + id)
                .header("Authorization", admin)
                .contentType(MediaType.APPLICATION_JSON)
                .content(QUADRO_37))
        .andExpect(status().isConflict());
  }

  @Test
  void publishingANewRevisionSupersedesThePreviousOne() throws Exception {
    String admin = bearer("admin@ampere.local");
    String reviewer = bearer("revisor@ampere.local");
    String first = create(admin);
    mockMvc.perform(
        post("/admin/normative-tables/" + first + "/publish").header("Authorization", reviewer));
    String second = create(admin);

    mockMvc
        .perform(
            post("/admin/normative-tables/" + second + "/publish")
                .header("Authorization", reviewer))
        .andExpect(status().isOk());

    mockMvc
        .perform(get("/admin/normative-tables/" + first).header("Authorization", admin))
        .andExpect(jsonPath("$.data.status").value("SUPERSEDED"));
  }

  @Test
  void refusesBandsOutOfOrder() throws Exception {
    mockMvc
        .perform(
            post("/admin/normative-tables")
                .header("Authorization", bearer("admin@ampere.local"))
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    """
                    {
                      "code": "Q37_SAFETY_FACTOR",
                      "identification": "Quadro 37",
                      "item": "Anexo I, item 5",
                      "page": "108",
                      "rows": [
                        { "upperBound": 50, "value": 1.3 },
                        { "upperBound": 25, "value": 1.5 }
                      ]
                    }
                    """))
        .andExpect(status().isBadRequest())
        .andExpect(
            jsonPath("$.detail").value("Linha 2: as faixas precisam estar em ordem crescente."));
  }

  private String create(String bearer) throws Exception {
    String body =
        mockMvc
            .perform(
                post("/admin/normative-tables")
                    .header("Authorization", bearer)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(QUADRO_37))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.data.status").value("DRAFT"))
            .andExpect(jsonPath("$.data.rows[0].label").value("Dr ≤ 25 kVA"))
            .andReturn()
            .getResponse()
            .getContentAsString();
    return objectMapper.readTree(body).path("data").path("id").asString();
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
