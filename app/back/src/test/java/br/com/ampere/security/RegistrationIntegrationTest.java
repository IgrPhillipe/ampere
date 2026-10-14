package br.com.ampere.security;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import br.com.ampere.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;
import org.springframework.transaction.annotation.Transactional;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class RegistrationIntegrationTest {

  private static final String PASSWORD = "senha1234";

  @Autowired private MockMvc mockMvc;
  @Autowired private UserRepository userRepository;
  @Autowired private ObjectMapper objectMapper;

  @BeforeEach
  void clean() {
    userRepository.deleteAll();
  }

  @Test
  void createsADesignerAndSignsThemIn() throws Exception {
    mockMvc
        .perform(register("ana@ampere.com", PASSWORD))
        .andExpect(status().isCreated())
        .andExpect(jsonPath("$.data.token").isNotEmpty())
        .andExpect(jsonPath("$.data.user.role").value("user"))
        .andExpect(jsonPath("$.data.user.email").value("ana@ampere.com"));
  }

  @Test
  void refusesADuplicateEmailWithTheSpecMessage() throws Exception {
    mockMvc.perform(register("ana@ampere.com", PASSWORD)).andExpect(status().isCreated());

    mockMvc
        .perform(register("  ANA@ampere.com ", PASSWORD))
        .andExpect(status().isConflict())
        .andExpect(jsonPath("$.detail").value("Já existe uma conta com este e-mail."));
  }

  @Test
  void enforcesThePasswordPolicy() throws Exception {
    mockMvc.perform(register("ana@ampere.com", "curta1")).andExpect(status().isBadRequest());
    mockMvc.perform(register("ana@ampere.com", "somenteletras")).andExpect(status().isBadRequest());
    mockMvc.perform(register("ana@ampere.com", "12345678")).andExpect(status().isBadRequest());
  }

  @Test
  void readsAndUpdatesTheProfile() throws Exception {
    String token = token("ana@ampere.com");

    mockMvc
        .perform(get("/users/me").header("Authorization", "Bearer " + token))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.data.crea").value("123456"))
        .andExpect(jsonPath("$.data.creaState").value("PE"));

    mockMvc
        .perform(
            put("/users/me")
                .header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    """
                    {"name":"Ana Maria","crea":"999","creaState":"pb","company":"","phone":"8199"}
                    """))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.data.name").value("Ana Maria"))
        .andExpect(jsonPath("$.data.creaState").value("PB"))
        .andExpect(jsonPath("$.data.company").doesNotExist());
  }

  @Test
  void changesThePasswordOnlyWithTheCurrentOne() throws Exception {
    String token = token("ana@ampere.com");

    mockMvc
        .perform(passwordChange(token, "errada123", "nova12345"))
        .andExpect(status().isUnprocessableContent());
    mockMvc.perform(passwordChange(token, PASSWORD, "nova12345")).andExpect(status().isNoContent());
    mockMvc
        .perform(
            post("/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"email\":\"ana@ampere.com\",\"password\":\"nova12345\"}"))
        .andExpect(status().isOk());
  }

  @Test
  void keepsTheProfileBehindAuthentication() throws Exception {
    mockMvc.perform(get("/users/me")).andExpect(status().isUnauthorized());
  }

  private String token(String email) throws Exception {
    String body =
        mockMvc
            .perform(register(email, PASSWORD))
            .andReturn()
            .getResponse()
            .getContentAsString();
    JsonNode json = objectMapper.readTree(body);
    return json.get("data").get("token").asString();
  }

  private static MockHttpServletRequestBuilder register(String email, String password) {
    return post("/auth/register")
        .contentType(MediaType.APPLICATION_JSON)
        .content(
            "{\"name\":\"Ana\",\"email\":\""
                + email
                + "\",\"password\":\""
                + password
                + "\",\"crea\":\"123456\",\"creaState\":\"PE\"}");
  }

  private static MockHttpServletRequestBuilder passwordChange(
      String token, String current, String next) {
    return put("/users/me/password")
        .header("Authorization", "Bearer " + token)
        .contentType(MediaType.APPLICATION_JSON)
        .content("{\"currentPassword\":\"" + current + "\",\"newPassword\":\"" + next + "\"}");
  }
}
