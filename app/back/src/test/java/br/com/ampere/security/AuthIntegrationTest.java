package br.com.ampere.security;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import br.com.ampere.domain.User;
import br.com.ampere.domain.UserRole;
import br.com.ampere.repository.UserRepository;
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

/** Exercises the real filter chain. */
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class AuthIntegrationTest {

  private static final String PASSWORD = "senha@123";

  @Autowired private MockMvc mockMvc;

  @Autowired private UserRepository userRepository;

  @Autowired private PasswordEncoder passwordEncoder;

  @Autowired private ObjectMapper objectMapper;

  @BeforeEach
  void createUser() {
    userRepository.deleteAll();
    userRepository.save(
        new User(
            "Usuário Teste", "user@ampere.local", passwordEncoder.encode(PASSWORD), UserRole.USER));
  }

  @Test
  void exchangesCredentialsForATokenAndTheUser() throws Exception {
    mockMvc
        .perform(login("user@ampere.local", PASSWORD))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.data.token").isNotEmpty())
        .andExpect(jsonPath("$.data.user.email").value("user@ampere.local"))
        .andExpect(jsonPath("$.data.user.name").value("Usuário Teste"))
        // Lowercase: it is the contract the front's `userRoleSchema` validates.
        .andExpect(jsonPath("$.data.user.role").value("user"))
        .andExpect(jsonPath("$.data.user.id").isString());
  }

  @Test
  void neverPutsThePasswordHashInTheResponse() throws Exception {
    String body =
        mockMvc
            .perform(login("user@ampere.local", PASSWORD))
            .andReturn()
            .getResponse()
            .getContentAsString();

    org.assertj.core.api.Assertions.assertThat(body)
        .doesNotContain("passwordHash")
        .doesNotContain("$2a$")
        .doesNotContain(PASSWORD);
  }

  @Test
  void signsInRegardlessOfHowTheEmailWasTyped() throws Exception {
    mockMvc.perform(login("  USER@Ampere.Local  ", PASSWORD)).andExpect(status().isOk());
  }

  /** Unknown e-mail and wrong password answer alike: the difference would reveal who exists. */
  @Test
  void refusesWrongPasswordAndUnknownEmailWithTheSameAnswer() throws Exception {
    String wrongPassword =
        mockMvc
            .perform(login("user@ampere.local", "errada"))
            .andExpect(status().isUnauthorized())
            .andReturn()
            .getResponse()
            .getContentAsString();
    String unknownEmail =
        mockMvc
            .perform(login("ninguem@ampere.local", PASSWORD))
            .andExpect(status().isUnauthorized())
            .andReturn()
            .getResponse()
            .getContentAsString();

    org.assertj.core.api.Assertions.assertThat(wrongPassword).isEqualTo(unknownEmail);
  }

  @Test
  void rejectsAMalformedEmailBeforeTouchingTheDatabase() throws Exception {
    mockMvc.perform(login("nao-e-email", PASSWORD)).andExpect(status().isBadRequest());
  }

  @Test
  void answersTheCurrentUserForAValidToken() throws Exception {
    mockMvc
        .perform(get("/auth/me").header("Authorization", "Bearer " + token()))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.data.email").value("user@ampere.local"))
        .andExpect(jsonPath("$.data.role").value("user"));
  }

  @Test
  void refusesProjectsWithoutAToken() throws Exception {
    mockMvc
        .perform(get("/projects"))
        .andExpect(status().isUnauthorized())
        // Without `detail` the front shows the generic message, not "session expired".
        .andExpect(
            jsonPath("$.detail").value(ProblemDetailAuthenticationHandler.UNAUTHENTICATED_MESSAGE));
  }

  @Test
  void refusesProjectsWithAGarbageToken() throws Exception {
    mockMvc
        .perform(get("/projects").header("Authorization", "Bearer nao-e-um-jwt"))
        .andExpect(status().isUnauthorized())
        .andExpect(jsonPath("$.detail").isNotEmpty());
  }

  @Test
  void allowsProjectsWithAToken() throws Exception {
    mockMvc
        .perform(get("/projects").header("Authorization", "Bearer " + token()))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.data").isArray());
  }

  @Test
  void keepsTheLoginAndTheDocumentationOpen() throws Exception {
    mockMvc.perform(login("user@ampere.local", PASSWORD)).andExpect(status().isOk());
    mockMvc.perform(get("/v3/api-docs")).andExpect(status().isOk());
  }

  private org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder login(
      String email, String password) {
    return post("/auth/login")
        .contentType(MediaType.APPLICATION_JSON)
        .content("{\"email\":\"" + email + "\",\"password\":\"" + password + "\"}");
  }

  private String token() throws Exception {
    String body =
        mockMvc
            .perform(login("user@ampere.local", PASSWORD))
            .andReturn()
            .getResponse()
            .getContentAsString();

    return objectMapper.readTree(body).get("data").get("token").asString();
  }
}
