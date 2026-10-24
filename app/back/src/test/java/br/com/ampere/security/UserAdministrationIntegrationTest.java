package br.com.ampere.security;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import br.com.ampere.domain.User;
import br.com.ampere.domain.UserRole;
import br.com.ampere.repository.UserRepository;
import br.com.ampere.service.AuthService;
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
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

/** US11: the administrator's user management, the inactive account and the mandatory change. */
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class UserAdministrationIntegrationTest {

  private static final String PASSWORD = "senha1234";

  @Autowired private MockMvc mockMvc;
  @Autowired private UserRepository userRepository;
  @Autowired private PasswordEncoder passwordEncoder;
  @Autowired private ObjectMapper objectMapper;

  private User admin;
  private User designer;

  @BeforeEach
  void createUsers() {
    userRepository.deleteAll();
    admin =
        userRepository.save(
            new User(
                "Admin Teste",
                "admin@ampere.com",
                passwordEncoder.encode(PASSWORD),
                UserRole.ADMIN));
    designer =
        userRepository.save(
            new User(
                "João Projetista",
                "joao@ampere.com",
                passwordEncoder.encode(PASSWORD),
                UserRole.USER));
  }

  @Test
  void createsAnAnalystWhoMustChangeTheTemporaryPasswordOnTheFirstSignIn() throws Exception {
    JsonNode created =
        body(
            mockMvc
                .perform(
                    authorized(post("/users"), token("admin@ampere.com", PASSWORD))
                        .content(
                            "{\"name\":\"Ana Analista\",\"email\":\" ANA@ampere.com \","
                                + "\"role\":\"admin\"}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.user.email").value("ana@ampere.com"))
                .andExpect(jsonPath("$.data.user.role").value("admin"))
                .andExpect(jsonPath("$.data.user.active").value(true))
                .andExpect(jsonPath("$.data.user.mustChangePassword").value(true))
                .andExpect(jsonPath("$.data.temporaryPassword").isNotEmpty()));
    String temporaryPassword = created.get("data").get("temporaryPassword").asString();

    JsonNode signIn =
        body(
            mockMvc
                .perform(login("ana@ampere.com", temporaryPassword))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.user.mustChangePassword").value(true)));
    String token = signIn.get("data").get("token").asString();

    mockMvc
        .perform(
            authorized(put("/users/me/password"), token)
                .content(
                    "{\"currentPassword\":\""
                        + temporaryPassword
                        + "\",\"newPassword\":\"nova12345\"}"))
        .andExpect(status().isNoContent());

    mockMvc
        .perform(login("ana@ampere.com", "nova12345"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.data.user.mustChangePassword").value(false));
  }

  @Test
  void neverListsTheTemporaryPasswordAgain() throws Exception {
    String adminToken = token("admin@ampere.com", PASSWORD);
    mockMvc
        .perform(
            authorized(post("/users"), adminToken)
                .content("{\"name\":\"Ana\",\"email\":\"ana@ampere.com\",\"role\":\"admin\"}"))
        .andExpect(status().isCreated());

    String listing =
        mockMvc
            .perform(authorized(get("/users"), adminToken))
            .andExpect(status().isOk())
            .andReturn()
            .getResponse()
            .getContentAsString();

    assertThat(listing).doesNotContain("temporaryPassword").doesNotContain("passwordHash");
  }

  @Test
  void refusesADuplicateEmail() throws Exception {
    mockMvc
        .perform(
            authorized(post("/users"), token("admin@ampere.com", PASSWORD))
                .content("{\"name\":\"Outro\",\"email\":\"JOAO@ampere.com\",\"role\":\"user\"}"))
        .andExpect(status().isConflict())
        .andExpect(jsonPath("$.detail").value("Já existe uma conta com este e-mail."));
  }

  @Test
  void listsInNameOrderWithSearchAndRoleFilter() throws Exception {
    String adminToken = token("admin@ampere.com", PASSWORD);

    mockMvc
        .perform(authorized(get("/users"), adminToken))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.data", hasSize(2)))
        .andExpect(jsonPath("$.data[0].name").value("Admin Teste"))
        .andExpect(jsonPath("$.data[0].lastLoginAt").isNotEmpty())
        .andExpect(jsonPath("$.data[1].lastLoginAt").doesNotExist())
        .andExpect(jsonPath("$.pagination.total").value(2));

    mockMvc
        .perform(authorized(get("/users").param("role", "user"), adminToken))
        .andExpect(jsonPath("$.data", hasSize(1)))
        .andExpect(jsonPath("$.data[0].email").value("joao@ampere.com"));

    // Without the accent, as the administrator would type it.
    mockMvc
        .perform(authorized(get("/users").param("search", "joao proj"), adminToken))
        .andExpect(jsonPath("$.data", hasSize(1)))
        .andExpect(jsonPath("$.data[0].name").value("João Projetista"));
  }

  @Test
  void pagesTheListing() throws Exception {
    mockMvc
        .perform(
            authorized(
                get("/users").param("page", "2").param("pageSize", "1"),
                token("admin@ampere.com", PASSWORD)))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.data", hasSize(1)))
        .andExpect(jsonPath("$.data[0].email").value("joao@ampere.com"))
        .andExpect(jsonPath("$.pagination.total").value(2))
        .andExpect(jsonPath("$.pagination.page").value(2));
  }

  @Test
  void searchesLikeWildcardsLiterally() throws Exception {
    mockMvc
        .perform(
            authorized(get("/users").param("search", "%"), token("admin@ampere.com", PASSWORD)))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.data", hasSize(0)));
  }

  @Test
  void refusesAnUnknownRoleFilter() throws Exception {
    mockMvc
        .perform(
            authorized(get("/users").param("role", "gerente"), token("admin@ampere.com", PASSWORD)))
        .andExpect(status().isBadRequest());
  }

  @Test
  void createsAnAccountWithALongNameAndEmail() throws Exception {
    String name = "N".repeat(120);
    String email = "a".repeat(64) + "@" + "b".repeat(63) + "." + "c".repeat(63) + ".com";

    mockMvc
        .perform(
            authorized(post("/users"), token("admin@ampere.com", PASSWORD))
                .content(
                    "{\"name\":\"" + name + "\",\"email\":\"" + email + "\",\"role\":\"user\"}"))
        .andExpect(status().isCreated())
        .andExpect(jsonPath("$.data.user.email").value(email));
  }

  @Test
  void keepsTheManagementFromTheDesigner() throws Exception {
    String designerToken = token("joao@ampere.com", PASSWORD);

    mockMvc.perform(authorized(get("/users"), designerToken)).andExpect(status().isForbidden());
    mockMvc
        .perform(
            authorized(post("/users"), designerToken)
                .content("{\"name\":\"Ana\",\"email\":\"ana@ampere.com\",\"role\":\"admin\"}"))
        .andExpect(status().isForbidden());
    mockMvc
        .perform(
            authorized(put("/users/" + designer.getId()), designerToken)
                .content("{\"name\":\"João\",\"role\":\"admin\",\"active\":true}"))
        .andExpect(status().isForbidden());
    mockMvc
        .perform(authorized(post("/users/" + admin.getId() + "/password-reset"), designerToken))
        .andExpect(status().isForbidden());
  }

  /** The management lives under "/users", but the own profile stays open to every role. */
  @Test
  void keepsTheOwnProfileOpenToTheDesigner() throws Exception {
    mockMvc
        .perform(authorized(get("/users/me"), token("joao@ampere.com", PASSWORD)))
        .andExpect(status().isOk());
  }

  @Test
  void refusesTheSignInOfADeactivatedAccount() throws Exception {
    deactivate(designer);

    mockMvc
        .perform(login("joao@ampere.com", PASSWORD))
        .andExpect(status().isForbidden())
        .andExpect(jsonPath("$.detail").value(AuthService.ACCOUNT_DISABLED));
  }

  /** The deactivation is told only to whoever knows the password. */
  @Test
  void answersAWrongPasswordForADeactivatedAccountAsUsual() throws Exception {
    deactivate(designer);

    mockMvc
        .perform(login("joao@ampere.com", "errada123"))
        .andExpect(status().isUnauthorized())
        .andExpect(jsonPath("$.detail").value("E-mail ou senha inválidos."));
  }

  @Test
  void endsTheOpenSessionOfADeactivatedAccount() throws Exception {
    String designerToken = token("joao@ampere.com", PASSWORD);
    mockMvc.perform(authorized(get("/projects"), designerToken)).andExpect(status().isOk());

    deactivate(designer);

    mockMvc
        .perform(authorized(get("/projects"), designerToken))
        .andExpect(status().isUnauthorized())
        .andExpect(jsonPath("$.detail").value(AuthService.ACCOUNT_DISABLED));
    mockMvc
        .perform(authorized(get("/auth/me"), designerToken))
        .andExpect(status().isUnauthorized());
  }

  @Test
  void takesTheRoleAwayFromTheOpenSessionOfADemotedAdministrator() throws Exception {
    User reviewer =
        userRepository.save(
            new User(
                "Revisor", "revisor@ampere.com", passwordEncoder.encode(PASSWORD), UserRole.ADMIN));
    String reviewerToken = token("revisor@ampere.com", PASSWORD);
    mockMvc.perform(authorized(get("/review-queue"), reviewerToken)).andExpect(status().isOk());

    mockMvc
        .perform(
            authorized(put("/users/" + reviewer.getId()), token("admin@ampere.com", PASSWORD))
                .content("{\"name\":\"Revisor\",\"role\":\"user\",\"active\":true}"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.data.role").value("user"));

    mockMvc
        .perform(authorized(get("/review-queue"), reviewerToken))
        .andExpect(status().isUnauthorized());
  }

  @Test
  void endsTheOpenSessionOfAPromotedDesigner() throws Exception {
    String designerToken = token("joao@ampere.com", PASSWORD);

    mockMvc
        .perform(
            authorized(put("/users/" + designer.getId()), token("admin@ampere.com", PASSWORD))
                .content("{\"name\":\"João Projetista\",\"role\":\"admin\",\"active\":true}"))
        .andExpect(status().isOk());

    mockMvc
        .perform(authorized(get("/projects"), designerToken))
        .andExpect(status().isUnauthorized());
  }

  @Test
  void refusesTheTokenOfAnAccountThatNoLongerExists() throws Exception {
    User removed =
        userRepository.save(
            new User(
                "Removido",
                "removido@ampere.com",
                passwordEncoder.encode(PASSWORD),
                UserRole.USER));
    String removedToken = token("removido@ampere.com", PASSWORD);

    userRepository.delete(removed);
    userRepository.flush();

    mockMvc
        .perform(authorized(get("/projects"), removedToken))
        .andExpect(status().isUnauthorized());
  }

  @Test
  void letsAReactivatedAccountSignInAgain() throws Exception {
    deactivate(designer);

    mockMvc
        .perform(
            authorized(put("/users/" + designer.getId()), token("admin@ampere.com", PASSWORD))
                .content("{\"name\":\"João Projetista\",\"role\":\"user\",\"active\":true}"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.data.active").value(true));

    mockMvc.perform(login("joao@ampere.com", PASSWORD)).andExpect(status().isOk());
  }

  @Test
  void keepsTheAdministratorFromDeactivatingTheirOwnAccount() throws Exception {
    mockMvc
        .perform(
            authorized(put("/users/" + admin.getId()), token("admin@ampere.com", PASSWORD))
                .content("{\"name\":\"Admin Teste\",\"role\":\"admin\",\"active\":false}"))
        .andExpect(status().isBadRequest())
        .andExpect(jsonPath("$.detail").value("Você não pode desativar a própria conta."));

    assertThat(userRepository.findById(admin.getId()).orElseThrow().isActive()).isTrue();
  }

  @Test
  void keepsTheAdministratorFromDroppingTheirOwnRole() throws Exception {
    mockMvc
        .perform(
            authorized(put("/users/" + admin.getId()), token("admin@ampere.com", PASSWORD))
                .content("{\"name\":\"Admin Teste\",\"role\":\"user\",\"active\":true}"))
        .andExpect(status().isBadRequest());
  }

  @Test
  void resetsThePasswordWithAMandatoryChange() throws Exception {
    JsonNode reset =
        body(
            mockMvc
                .perform(
                    authorized(
                        post("/users/" + designer.getId() + "/password-reset"),
                        token("admin@ampere.com", PASSWORD)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.user.mustChangePassword").value(true)));
    String temporaryPassword = reset.get("data").get("temporaryPassword").asString();

    mockMvc.perform(login("joao@ampere.com", PASSWORD)).andExpect(status().isUnauthorized());
    mockMvc
        .perform(login("joao@ampere.com", temporaryPassword))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.data.user.mustChangePassword").value(true));
  }

  @Test
  void answersNotFoundForAnUnknownUser() throws Exception {
    String adminToken = token("admin@ampere.com", PASSWORD);

    mockMvc
        .perform(authorized(post("/users/999999/password-reset"), adminToken))
        .andExpect(status().isNotFound());
    mockMvc
        .perform(
            authorized(put("/users/999999"), adminToken)
                .content("{\"name\":\"Ninguém\",\"role\":\"user\",\"active\":true}"))
        .andExpect(status().isNotFound());
  }

  private void deactivate(User user) throws Exception {
    mockMvc
        .perform(
            authorized(put("/users/" + user.getId()), token("admin@ampere.com", PASSWORD))
                .content(
                    "{\"name\":\""
                        + user.getName()
                        + "\",\"role\":\""
                        + user.getRole().getValue()
                        + "\",\"active\":false}"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.data.active").value(false));
  }

  private static MockHttpServletRequestBuilder authorized(
      MockHttpServletRequestBuilder request, String token) {
    return request
        .header("Authorization", "Bearer " + token)
        .contentType(MediaType.APPLICATION_JSON);
  }

  private static MockHttpServletRequestBuilder login(String email, String password) {
    return post("/auth/login")
        .contentType(MediaType.APPLICATION_JSON)
        .content("{\"email\":\"" + email + "\",\"password\":\"" + password + "\"}");
  }

  private String token(String email, String password) throws Exception {
    return body(mockMvc.perform(login(email, password)).andExpect(status().isOk()))
        .get("data")
        .get("token")
        .asString();
  }

  private JsonNode body(org.springframework.test.web.servlet.ResultActions result)
      throws Exception {
    return objectMapper.readTree(result.andReturn().getResponse().getContentAsString());
  }
}
