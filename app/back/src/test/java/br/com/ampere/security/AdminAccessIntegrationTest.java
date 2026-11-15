package br.com.ampere.security;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
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
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;
import org.springframework.transaction.annotation.Transactional;
import tools.jackson.databind.ObjectMapper;

/** Reviewer and admin register and approve the normative tables; whoever registers does not. */
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class AdminAccessIntegrationTest {

  private static final String PASSWORD = "senha@123";

  private static final String SELF_APPROVAL =
      "Quem cadastrou a tabela não pode aprová-la. A publicação é feita por outra pessoa.";

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
            new User("Usuário", "user@ampere.com", hash, UserRole.USER),
            new User("Admin", "admin@ampere.com", hash, UserRole.ADMIN),
            new User("Conferente", "conferente@ampere.com", hash, UserRole.ADMIN),
            new User("Revisor", "revisor@ampere.com", hash, UserRole.REVIEWER),
            new User("Analista", "analista@ampere.com", hash, UserRole.REVIEWER)));
  }

  @Test
  void aDesignerCannotSeeTheNormativeTables() throws Exception {
    mockMvc
        .perform(get("/normative-tables").header("Authorization", bearer("user@ampere.com")))
        .andExpect(status().isForbidden())
        .andExpect(
            jsonPath("$.detail").value(ProblemDetailAuthenticationHandler.FORBIDDEN_MESSAGE));
  }

  @Test
  void aDesignerCannotWriteTheNormativeTables() throws Exception {
    String id = create(bearer("admin@ampere.com"));
    String designer = bearer("user@ampere.com");

    mockMvc
        .perform(
            post("/normative-tables")
                .header("Authorization", designer)
                .contentType(MediaType.APPLICATION_JSON)
                .content(QUADRO_37))
        .andExpect(status().isForbidden());
    mockMvc
        .perform(
            put("/normative-tables/" + id)
                .header("Authorization", designer)
                .contentType(MediaType.APPLICATION_JSON)
                .content(QUADRO_37))
        .andExpect(status().isForbidden());
    mockMvc
        .perform(publication(id).header("Authorization", designer))
        .andExpect(status().isForbidden());
    mockMvc
        .perform(delete("/normative-tables/" + id).header("Authorization", designer))
        .andExpect(status().isForbidden());
  }

  @Test
  void aReviewerRegistersARevisionThatAnAdminApproves() throws Exception {
    String reviewer = bearer("revisor@ampere.com");
    String id = create(reviewer);

    mockMvc
        .perform(publication(id).header("Authorization", reviewer))
        .andExpect(status().isConflict())
        .andExpect(jsonPath("$.detail").value(SELF_APPROVAL));
    mockMvc
        .perform(publication(id).header("Authorization", bearer("admin@ampere.com")))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.data.registeredBy").value("revisor@ampere.com"))
        .andExpect(jsonPath("$.data.verifiedBy").value("admin@ampere.com"));
  }

  @Test
  void aReviewerApprovesARevisionAnAdminRegistered() throws Exception {
    String id = create(bearer("admin@ampere.com"));

    mockMvc
        .perform(publication(id).header("Authorization", bearer("revisor@ampere.com")))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.data.status").value("PUBLISHED"))
        .andExpect(jsonPath("$.data.verifiedBy").value("revisor@ampere.com"));
  }

  @Test
  void aReviewerEditsAndDeletesADraft() throws Exception {
    String reviewer = bearer("revisor@ampere.com");
    String id = create(reviewer);

    mockMvc
        .perform(
            put("/normative-tables/" + id)
                .header("Authorization", reviewer)
                .contentType(MediaType.APPLICATION_JSON)
                .content(QUADRO_37))
        .andExpect(status().isOk());
    mockMvc
        .perform(delete("/normative-tables/" + id).header("Authorization", reviewer))
        .andExpect(status().isNoContent());
  }

  @Test
  void aReviewerApprovesARevisionAnotherReviewerRegistered() throws Exception {
    String id = create(bearer("revisor@ampere.com"));

    mockMvc
        .perform(publication(id).header("Authorization", bearer("analista@ampere.com")))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.data.registeredBy").value("revisor@ampere.com"))
        .andExpect(jsonPath("$.data.verifiedBy").value("analista@ampere.com"));
  }

  @Test
  void onlyWhoRegisteredADraftEditsOrDeletesIt() throws Exception {
    String id = create(bearer("admin@ampere.com"));
    String reviewer = bearer("revisor@ampere.com");

    mockMvc
        .perform(
            put("/normative-tables/" + id)
                .header("Authorization", reviewer)
                .contentType(MediaType.APPLICATION_JSON)
                .content(QUADRO_37))
        .andExpect(status().isForbidden())
        .andExpect(jsonPath("$.detail").value("Só quem cadastrou a revisão pode alterá-la."));
    mockMvc
        .perform(delete("/normative-tables/" + id).header("Authorization", reviewer))
        .andExpect(status().isForbidden())
        .andExpect(
            jsonPath("$.detail").value("Só quem cadastrou a revisão ou um gestor pode excluí-la."));
  }

  @Test
  void whoApprovesADraftCannotRewriteItFirst() throws Exception {
    String id = create(bearer("revisor@ampere.com"));
    String verifier = bearer("analista@ampere.com");

    mockMvc
        .perform(
            put("/normative-tables/" + id)
                .header("Authorization", verifier)
                .contentType(MediaType.APPLICATION_JSON)
                .content(QUADRO_37.replace("\"value\": 1.5", "\"value\": 9.9")))
        .andExpect(status().isForbidden());
    mockMvc
        .perform(publication(id).header("Authorization", verifier))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.data.registeredBy").value("revisor@ampere.com"))
        .andExpect(jsonPath("$.data.rows[0].value").value(1.5));
  }

  @Test
  void refusesApprovingARevisionChangedAfterItWasRead() throws Exception {
    String author = bearer("revisor@ampere.com");
    String verifier = bearer("analista@ampere.com");
    String id = create(author);
    mockMvc
        .perform(
            put("/normative-tables/" + id)
                .header("Authorization", author)
                .contentType(MediaType.APPLICATION_JSON)
                .content(QUADRO_37.replace("\"value\": 1.5", "\"value\": 9.9")))
        .andExpect(status().isOk());

    mockMvc
        .perform(publication(id, 0).header("Authorization", verifier))
        .andExpect(status().isConflict())
        .andExpect(
            jsonPath("$.detail")
                .value(
                    "A revisão mudou depois que você a abriu. Confira os valores de novo antes de"
                        + " aprovar."));
    mockMvc
        .perform(post("/normative-tables/" + id + "/publication").header("Authorization", verifier))
        .andExpect(status().isBadRequest());
    mockMvc
        .perform(publication(id, 1).header("Authorization", verifier))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.data.rows[0].value").value(9.9));
  }

  @Test
  void anAdminDeletesButDoesNotEditADraftSomeoneElseRegistered() throws Exception {
    String id = create(bearer("revisor@ampere.com"));
    String admin = bearer("admin@ampere.com");

    mockMvc
        .perform(
            put("/normative-tables/" + id)
                .header("Authorization", admin)
                .contentType(MediaType.APPLICATION_JSON)
                .content(QUADRO_37))
        .andExpect(status().isForbidden());
    mockMvc
        .perform(delete("/normative-tables/" + id).header("Authorization", admin))
        .andExpect(status().isNoContent());
  }

  @Test
  void anAdminDeletesADraftButNotAPublishedTable() throws Exception {
    String admin = bearer("admin@ampere.com");
    String published = create(admin);
    mockMvc.perform(
        publication(published).header("Authorization", bearer("conferente@ampere.com")));
    String draft = create(admin);

    mockMvc
        .perform(delete("/normative-tables/" + draft).header("Authorization", admin))
        .andExpect(status().isNoContent());
    mockMvc
        .perform(delete("/normative-tables/" + published).header("Authorization", admin))
        .andExpect(status().isConflict())
        .andExpect(
            jsonPath("$.detail").value("Só é possível excluir uma revisão aguardando aprovação."));
  }

  @Test
  void aTableHasOnePendingRevisionAtATime() throws Exception {
    String id = create(bearer("admin@ampere.com"));
    String reviewer = bearer("revisor@ampere.com");

    mockMvc
        .perform(
            post("/normative-tables")
                .header("Authorization", reviewer)
                .contentType(MediaType.APPLICATION_JSON)
                .content(QUADRO_37))
        .andExpect(status().isConflict())
        .andExpect(
            jsonPath("$.detail")
                .value(
                    "Quadro 37 já tem uma revisão aguardando aprovação. Aprove ou exclua essa"
                        + " revisão antes de cadastrar outra."));

    mockMvc.perform(publication(id).header("Authorization", reviewer));
    create(reviewer);
  }

  @Test
  void anAdminListsTheTablesAndTheirColumns() throws Exception {
    String admin = bearer("admin@ampere.com");

    mockMvc
        .perform(get("/normative-tables").header("Authorization", admin))
        .andExpect(status().isOk());
    mockMvc
        .perform(get("/normative-tables/codes").header("Authorization", admin))
        .andExpect(status().isOk())
        .andExpect(
            jsonPath("$.data[?(@.code == 'T2_SERVICE_ENTRANCE_380_220')].valueLabels[2]")
                .value("Disjuntor geral (A)"));
  }

  @Test
  void whoTypesATableIsNotWhoPublishesIt() throws Exception {
    String admin = bearer("admin@ampere.com");
    String id = create(admin);

    mockMvc
        .perform(publication(id).header("Authorization", admin))
        .andExpect(status().isConflict())
        .andExpect(jsonPath("$.detail").value(SELF_APPROVAL));

    mockMvc
        .perform(publication(id).header("Authorization", bearer("conferente@ampere.com")))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.data.status").value("PUBLISHED"))
        .andExpect(jsonPath("$.data.verifiedBy").value("conferente@ampere.com"));

    mockMvc
        .perform(
            put("/normative-tables/" + id)
                .header("Authorization", admin)
                .contentType(MediaType.APPLICATION_JSON)
                .content(QUADRO_37))
        .andExpect(status().isConflict())
        .andExpect(
            jsonPath("$.detail")
                .value("Uma revisão aprovada não é editada. Cadastre uma nova revisão."));
    mockMvc
        .perform(publication(id).header("Authorization", bearer("revisor@ampere.com")))
        .andExpect(status().isConflict())
        .andExpect(jsonPath("$.detail").value("Esta revisão já foi aprovada."));
  }

  @Test
  void publishingANewRevisionSupersedesThePreviousOne() throws Exception {
    String admin = bearer("admin@ampere.com");
    String reviewer = bearer("conferente@ampere.com");
    String first = create(admin);
    mockMvc.perform(publication(first).header("Authorization", reviewer));
    String second = create(admin);

    mockMvc
        .perform(publication(second).header("Authorization", reviewer))
        .andExpect(status().isOk());

    mockMvc
        .perform(get("/normative-tables/" + first).header("Authorization", admin))
        .andExpect(jsonPath("$.data.status").value("SUPERSEDED"));
  }

  @Test
  void refusesBandsOutOfOrder() throws Exception {
    mockMvc
        .perform(
            post("/normative-tables")
                .header("Authorization", bearer("admin@ampere.com"))
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

  /** A draft nobody changed since it was created is at version 0. */
  private static MockHttpServletRequestBuilder publication(String id) {
    return publication(id, 0);
  }

  private static MockHttpServletRequestBuilder publication(String id, long version) {
    return post("/normative-tables/" + id + "/publication")
        .contentType(MediaType.APPLICATION_JSON)
        .content("{\"version\":" + version + "}");
  }

  private String create(String bearer) throws Exception {
    String body =
        mockMvc
            .perform(
                post("/normative-tables")
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
