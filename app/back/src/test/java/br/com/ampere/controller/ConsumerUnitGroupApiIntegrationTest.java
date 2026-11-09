package br.com.ampere.controller;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.containsString;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import br.com.ampere.domain.ConnectionType;
import br.com.ampere.domain.EntranceStandard;
import br.com.ampere.domain.Project;
import br.com.ampere.domain.ResidentialGroup;
import br.com.ampere.domain.ResidentialMultifamily;
import br.com.ampere.domain.SupplyVoltage;
import br.com.ampere.domain.User;
import br.com.ampere.domain.UserRole;
import br.com.ampere.repository.ConsumerUnitGroupRepository;
import br.com.ampere.repository.ProjectRepository;
import br.com.ampere.repository.UserRepository;
import jakarta.persistence.EntityManager;
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
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;
import org.springframework.transaction.annotation.Transactional;
import tools.jackson.databind.ObjectMapper;

/** The connection of an apartment through HTTP, as the front sends it. */
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class ConsumerUnitGroupApiIntegrationTest {

  private static final String PASSWORD = "senha@123";

  private static final String SINGLE_PHASE =
      """
      { "kind": "RESIDENTIAL", "name": "Apartamento tipo", "quantity": 8, "usefulArea": 70,
        "unitLoadKw": 7.8, "connectionType": "SINGLE_PHASE" }
      """;

  private static final String THREE_PHASE =
      """
      { "kind": "RESIDENTIAL", "name": "Cobertura", "quantity": 2, "usefulArea": 180,
        "connectionType": "THREE_PHASE",
        "loads": [
          { "category": "INSTANT_HEATING", "description": "Chuveiro", "quantity": 4,
            "power": 4, "powerUnit": "KW" }
        ] }
      """;

  @Autowired private MockMvc mockMvc;

  @Autowired private ObjectMapper objectMapper;

  @Autowired private PasswordEncoder passwordEncoder;

  @Autowired private UserRepository userRepository;

  @Autowired private ProjectRepository projectRepository;

  @Autowired private ConsumerUnitGroupRepository groupRepository;

  @Autowired private EntityManager entityManager;

  private String token;

  private Project project;

  @BeforeEach
  void seed() throws Exception {
    User owner =
        userRepository.save(
            new User(
                "Projetista",
                "ligacao@ampere.com",
                passwordEncoder.encode(PASSWORD),
                UserRole.USER));
    project =
        projectRepository.save(
            Project.draft(
                "Residencial Torres do Pina",
                "Avenida Herculano Bandeira, 750",
                "Recife",
                "2026-9209",
                new ResidentialMultifamily(
                    14,
                    SupplyVoltage.V380_220,
                    ConnectionType.THREE_PHASE,
                    EntranceStandard.COLLECTIVE),
                List.of(),
                owner));
    token = token("ligacao@ampere.com");
  }

  @Test
  void refusesATwoPhaseApartment() throws Exception {
    perform(post(groups()), SINGLE_PHASE.replace("SINGLE_PHASE", "TWO_PHASE"))
        .andExpect(status().isBadRequest())
        .andExpect(jsonPath("$.detail").value(containsString("SINGLE_PHASE, THREE_PHASE")));
  }

  @Test
  void refusesAThreePhaseApartmentWithoutLoads() throws Exception {
    perform(
            post(groups()),
            """
            { "kind": "RESIDENTIAL", "name": "Cobertura", "quantity": 2, "usefulArea": 180,
              "connectionType": "THREE_PHASE" }
            """)
        .andExpect(status().isBadRequest())
        .andExpect(jsonPath("$.detail").value("Detalhe as cargas do apartamento trifásico."));
  }

  @Test
  void anOldPayloadWithoutConnectionLeavesTheGroupPending() throws Exception {
    String id = create(SINGLE_PHASE);

    perform(
            put(groups() + "/" + id),
            """
            { "kind": "RESIDENTIAL", "name": "Apartamento tipo", "quantity": 8, "usefulArea": 70,
              "unitLoadKw": 7.8 }
            """)
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.data.status").value("MISSING_DATA"))
        .andExpect(jsonPath("$.data.issues[0].field").value("connectionType"))
        .andExpect(jsonPath("$.data.unitLoadKw").value(7.8));
  }

  @Test
  void turningAThreePhaseApartmentSinglePhaseDropsItsLoads() throws Exception {
    String id = create(THREE_PHASE);

    perform(
            put(groups() + "/" + id),
            """
            { "kind": "RESIDENTIAL", "name": "Cobertura", "quantity": 2, "usefulArea": 180,
              "unitLoadKw": 12, "connectionType": "SINGLE_PHASE",
              "loads": [
                { "category": "INSTANT_HEATING", "description": "Chuveiro", "quantity": 4,
                  "power": 4, "powerUnit": "KW" }
              ] }
            """)
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.data.connectionType").value("SINGLE_PHASE"))
        .andExpect(jsonPath("$.data.loads").doesNotExist())
        .andExpect(jsonPath("$.data.unitLoadKw").value(12));
    entityManager.flush();
    entityManager.clear();

    ResidentialGroup group = (ResidentialGroup) groupRepository.findById(Long.valueOf(id)).get();
    assertThat(group.getLoads()).isEmpty();
    assertThat(group.getUnitLoadKw()).isEqualByComparingTo("12");
  }

  private String create(String body) throws Exception {
    String response =
        perform(post(groups()), body)
            .andExpect(status().isCreated())
            .andReturn()
            .getResponse()
            .getContentAsString();
    return objectMapper.readTree(response).path("data").path("id").asString();
  }

  private ResultActions perform(MockHttpServletRequestBuilder request, String body)
      throws Exception {
    return mockMvc.perform(
        request
            .header("Authorization", "Bearer " + token)
            .contentType(MediaType.APPLICATION_JSON)
            .content(body));
  }

  private String groups() {
    return "/projects/" + project.getId() + "/consumer-unit-groups";
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
}
