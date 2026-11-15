package br.com.ampere.service;

import static org.hamcrest.Matchers.contains;
import static org.hamcrest.Matchers.everyItem;
import static org.hamcrest.Matchers.is;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
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
import jakarta.persistence.EntityManager;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;
import org.springframework.transaction.annotation.Transactional;
import tools.jackson.databind.ObjectMapper;

/** The history of a table and what changed between two of its revisions. */
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class NormativeTableHistoryIntegrationTest {

  private static final String PASSWORD = "senha@123";

  private static final String FIRST_QUADRO_37 =
      """
      {
        "code": "Q37_SAFETY_FACTOR",
        "identification": "Quadro 37",
        "item": "Anexo I, item 5",
        "page": "108",
        "rows": [
          { "upperBound": 25, "value": 1.5 },
          { "lowerBound": 25, "upperBound": 50, "value": 1.3 },
          { "lowerBound": 50, "value": 1.2 }
        ]
      }
      """;

  private static final String SECOND_QUADRO_37 =
      """
      {
        "code": "Q37_SAFETY_FACTOR",
        "identification": "Quadro 37",
        "item": "Anexo I, item 5",
        "page": "108",
        "rows": [
          { "upperBound": 25, "value": 1.4 },
          { "lowerBound": 25, "upperBound": 50, "value": 1.3 },
          { "lowerBound": 50, "upperBound": 100, "value": 1.2 },
          { "lowerBound": 100, "value": 1.1 }
        ]
      }
      """;

  private static final String TABELA_22 =
      """
      {
        "code": "T22_GENERAL_LIGHTING_OUTLETS",
        "identification": "Tabela 22",
        "item": "6.27.1.2",
        "page": "72",
        "rows": [{ "key": "STORES", "value": 1 }]
      }
      """;

  @Autowired private MockMvc mockMvc;

  @Autowired private JdbcTemplate jdbcTemplate;

  @Autowired private EntityManager entityManager;

  @Autowired private ObjectMapper objectMapper;

  @Autowired private PasswordEncoder passwordEncoder;

  @Autowired private UserRepository userRepository;

  @Autowired private StandardRepository standardRepository;

  @Autowired private NormativeTableRepository normativeTableRepository;

  @Autowired private CalculationRepository calculationRepository;

  @Autowired private FindingRepository findingRepository;

  @Autowired private ProjectRepository projectRepository;

  private String admin;
  private String verifier;
  private String first;
  private String second;

  @BeforeEach
  void seed() throws Exception {
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
            new User("Ana Gestora", "admin@ampere.com", hash, UserRole.ADMIN),
            new User("Bruno Conferente", "conferente@ampere.com", hash, UserRole.ADMIN),
            new User("Carla Analista", "analista@ampere.com", hash, UserRole.REVIEWER),
            new User("Usuário", "user@ampere.com", hash, UserRole.USER)));

    admin = bearer("admin@ampere.com");
    verifier = bearer("conferente@ampere.com");
    first = create(FIRST_QUADRO_37);
    publish(first);
    second = create(SECOND_QUADRO_37);
  }

  @Test
  void listsTheRevisionsOfTheSameTableNewestFirstWithTheNames() throws Exception {
    create(TABELA_22);

    mockMvc
        .perform(get("/normative-tables/" + first + "/revisions").header("Authorization", admin))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.data.length()").value(2))
        .andExpect(jsonPath("$.data[0].id").value(second))
        .andExpect(jsonPath("$.data[0].status").value("DRAFT"))
        .andExpect(jsonPath("$.data[0].rowCount").value(4))
        .andExpect(jsonPath("$.data[0].registeredByName").value("Ana Gestora"))
        .andExpect(jsonPath("$.data[0].verifiedByName").doesNotExist())
        .andExpect(jsonPath("$.data[1].id").value(first))
        .andExpect(jsonPath("$.data[1].status").value("PUBLISHED"))
        .andExpect(jsonPath("$.data[1].registeredBy").value("admin@ampere.com"))
        .andExpect(jsonPath("$.data[1].verifiedBy").value("conferente@ampere.com"))
        .andExpect(jsonPath("$.data[1].verifiedByName").value("Bruno Conferente"))
        .andExpect(jsonPath("$.data[1].verifiedAt").exists())
        .andExpect(jsonPath("$.data[1].rows").doesNotExist());
  }

  @Test
  void ordersTheRevisionsByPublicationWithTheDraftsFirst() throws Exception {
    publish(second);
    String third = create(FIRST_QUADRO_37);
    publish(third);
    // A database from before the one-draft rule may hold a revision registered before the vigente.
    entityManager.flush();
    jdbcTemplate.update(
        "UPDATE normative_table SET registered_at = registered_at - INTERVAL '1 day' WHERE id = ?",
        Long.valueOf(third));
    entityManager.clear();
    String draft = create(SECOND_QUADRO_37);

    mockMvc
        .perform(get("/normative-tables/" + first + "/revisions").header("Authorization", admin))
        .andExpect(jsonPath("$.data[*].id", contains(draft, third, second, first)))
        .andExpect(
            jsonPath(
                "$.data[*].status", contains("DRAFT", "PUBLISHED", "SUPERSEDED", "SUPERSEDED")));
    mockMvc
        .perform(compare(first, second, third))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.data.from.id").value(second));
    mockMvc.perform(compare(first, third, second)).andExpect(status().isBadRequest());
  }

  @Test
  void keepsTheEmailOfWhoHasNoAccount() throws Exception {
    userRepository.delete(userRepository.findByEmail("conferente@ampere.com").orElseThrow());

    mockMvc
        .perform(get("/normative-tables/" + first + "/revisions").header("Authorization", admin))
        .andExpect(jsonPath("$.data[1].verifiedBy").value("conferente@ampere.com"))
        .andExpect(jsonPath("$.data[1].verifiedByName").value("conferente@ampere.com"))
        .andExpect(jsonPath("$.data[1].registeredByName").value("Ana Gestora"));
  }

  @Test
  void theDetailAndTheListingNameWhoRegisteredAndWhoApproved() throws Exception {
    mockMvc
        .perform(get("/normative-tables/" + first).header("Authorization", admin))
        .andExpect(jsonPath("$.data.registeredByName").value("Ana Gestora"))
        .andExpect(jsonPath("$.data.verifiedByName").value("Bruno Conferente"));
    mockMvc
        .perform(get("/normative-tables").header("Authorization", admin))
        .andExpect(jsonPath("$.data.length()").value(2))
        .andExpect(jsonPath("$.data[*].registeredByName", everyItem(is("Ana Gestora"))));
  }

  @Test
  void comparesTheRowsOfTwoRevisions() throws Exception {
    mockMvc
        .perform(
            get("/normative-tables/" + second + "/revisions/compare")
                .param("from", first)
                .param("to", second)
                .header("Authorization", admin))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.data.from.id").value(first))
        .andExpect(jsonPath("$.data.to.id").value(second))
        .andExpect(jsonPath("$.data.removed.length()").value(1))
        .andExpect(jsonPath("$.data.removed[0].lowerBound").value(50))
        .andExpect(jsonPath("$.data.removed[0].upperBound").doesNotExist())
        .andExpect(jsonPath("$.data.included.length()").value(2))
        .andExpect(jsonPath("$.data.included[0].upperBound").value(100))
        .andExpect(jsonPath("$.data.included[1].lowerBound").value(100))
        .andExpect(jsonPath("$.data.changed.length()").value(1))
        .andExpect(jsonPath("$.data.changed[0].before.value").value(1.5))
        .andExpect(jsonPath("$.data.changed[0].after.value").value(1.4));
  }

  @Test
  void refusesAnOriginNewerThanTheDestination() throws Exception {
    mockMvc
        .perform(
            get("/normative-tables/" + first + "/revisions/compare")
                .param("from", second)
                .param("to", first)
                .header("Authorization", admin))
        .andExpect(status().isBadRequest())
        .andExpect(
            jsonPath("$.detail").value("A revisão de origem não pode ser posterior à de destino."));
  }

  @Test
  void refusesARevisionOfAnotherTable() throws Exception {
    String other = create(TABELA_22);

    mockMvc
        .perform(
            get("/normative-tables/" + first + "/revisions/compare")
                .param("from", first)
                .param("to", other)
                .header("Authorization", admin))
        .andExpect(status().isNotFound())
        .andExpect(jsonPath("$.detail").value("Revisão não encontrada no histórico desta tabela."));
  }

  @Test
  void aRevisionComparedWithItselfHasNoChanges() throws Exception {
    mockMvc
        .perform(compare(first, first, first))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.data.included.length()").value(0))
        .andExpect(jsonPath("$.data.removed.length()").value(0))
        .andExpect(jsonPath("$.data.changed.length()").value(0));
  }

  @Test
  void aReviewerReadsTheHistoryAndTheComparison() throws Exception {
    String reviewer = bearer("analista@ampere.com");

    mockMvc
        .perform(get("/normative-tables/" + first + "/revisions").header("Authorization", reviewer))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.data.length()").value(2));
    mockMvc
        .perform(
            get("/normative-tables/" + first + "/revisions/compare")
                .param("from", first)
                .param("to", second)
                .header("Authorization", reviewer))
        .andExpect(status().isOk());
  }

  @Test
  void aDesignerCannotSeeTheHistory() throws Exception {
    mockMvc
        .perform(
            get("/normative-tables/" + first + "/revisions")
                .header("Authorization", bearer("user@ampere.com")))
        .andExpect(status().isForbidden());
  }

  private void publish(String id) throws Exception {
    String body =
        mockMvc
            .perform(get("/normative-tables/" + id).header("Authorization", verifier))
            .andReturn()
            .getResponse()
            .getContentAsString();
    long version = objectMapper.readTree(body).path("data").path("version").asLong();
    mockMvc
        .perform(
            post("/normative-tables/" + id + "/publication")
                .header("Authorization", verifier)
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"version\":" + version + "}"))
        .andExpect(status().isOk());
  }

  private MockHttpServletRequestBuilder compare(String id, String from, String to) {
    return get("/normative-tables/" + id + "/revisions/compare")
        .param("from", from)
        .param("to", to)
        .header("Authorization", admin);
  }

  private String create(String table) throws Exception {
    String body =
        mockMvc
            .perform(
                post("/normative-tables")
                    .header("Authorization", admin)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(table))
            .andExpect(status().isCreated())
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
