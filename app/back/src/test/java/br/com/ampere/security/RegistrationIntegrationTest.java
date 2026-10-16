package br.com.ampere.security;

import static org.hamcrest.Matchers.containsInAnyOrder;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import br.com.ampere.domain.Standard;
import br.com.ampere.domain.User;
import br.com.ampere.domain.UserRole;
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
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

/** US10: sign-up, profile and password change, through HTTP. */
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class RegistrationIntegrationTest {

  private static final String PASSWORD = "senha1234";

  @Autowired private MockMvc mockMvc;
  @Autowired private UserRepository userRepository;
  @Autowired private ObjectMapper objectMapper;
  @Autowired private PasswordEncoder passwordEncoder;
  @Autowired private StandardRepository standardRepository;

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
                    {"name":"Ana Maria","crea":"9999","creaState":"pb","company":"","phone":"8199"}
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
  void validatesTheSignUpInPortuguese() throws Exception {
    mockMvc
        .perform(post("/auth/register").contentType(MediaType.APPLICATION_JSON).content("{}"))
        .andExpect(status().isBadRequest())
        .andExpect(
            jsonPath("$.errors[*].defaultMessage")
                .value(
                    containsInAnyOrder(
                        "O nome é obrigatório.",
                        "O e-mail é obrigatório.",
                        "A senha é obrigatória.",
                        "O CREA é obrigatório.",
                        "A UF do CREA é obrigatória.")));
  }

  @Test
  void refusesTheStateTypedInsideTheCreaNumber() throws Exception {
    mockMvc
        .perform(
            post("/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    """
                    {"name":"Ana","email":"ana@ampere.com","password":"senha1234",
                     "crea":"PE123456","creaState":"PE"}
                    """))
        .andExpect(status().isBadRequest())
        .andExpect(
            jsonPath("$.errors[0].defaultMessage").value("Informe só o número do CREA, sem a UF."));
  }

  @Test
  void requiresTheCreaOnlyOfDesigners() throws Exception {
    String designer = token("ana@ampere.com");
    mockMvc
        .perform(profileUpdate(designer, "{\"name\":\"Ana\"}"))
        .andExpect(status().isBadRequest())
        .andExpect(jsonPath("$.detail").value("Informe o número do CREA e a UF."));

    userRepository.save(
        new User(
            "Alice Analista",
            "alice@ampere.com",
            passwordEncoder.encode(PASSWORD),
            UserRole.ADMIN));
    mockMvc
        .perform(profileUpdate(login("alice@ampere.com"), "{\"name\":\"Alice Souza\"}"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.data.name").value("Alice Souza"))
        .andExpect(jsonPath("$.data.crea").doesNotExist());
  }

  @Test
  void ignoresAStaleTokenSavedInTheBrowser() throws Exception {
    mockMvc
        .perform(register("ana@ampere.com", PASSWORD).header("Authorization", "Bearer vencido.x.y"))
        .andExpect(status().isCreated());
    mockMvc
        .perform(
            post("/auth/login")
                .header("Authorization", "Bearer vencido.x.y")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"email\":\"ana@ampere.com\",\"password\":\"" + PASSWORD + "\"}"))
        .andExpect(status().isOk());
  }

  @Test
  void showsTheTechnicalResponsibleOnTheProject() throws Exception {
    standardRepository.saveAll(
        List.of(new Standard("DIS-NOR-053", "REV 06"), new Standard("DIS-NOR-030", "REV 07")));
    String token = token("ana@ampere.com");
    String body =
        mockMvc
            .perform(
                post("/projects")
                    .header("Authorization", "Bearer " + token)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(
                        """
                        {"name":"Residencial Ana","address":"Rua A, 1","municipality":"Recife",
                         "buildingType":"RESIDENTIAL_MULTIFAMILY","floors":4,"voltage":"V380_220",
                         "connectionType":"THREE_PHASE","entranceStandard":"COLLECTIVE"}
                        """))
            .andExpect(status().isCreated())
            .andReturn()
            .getResponse()
            .getContentAsString();
    String id = objectMapper.readTree(body).get("data").get("id").asString();

    mockMvc
        .perform(get("/projects/{id}", id).header("Authorization", "Bearer " + token))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.data.technicalResponsible.name").value("Ana"))
        .andExpect(jsonPath("$.data.technicalResponsible.crea").value("123456/PE"));
  }

  @Test
  void answersUnsupportedMediaTypeForAFormBody() throws Exception {
    mockMvc
        .perform(
            post("/auth/register")
                .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                .content("email=ana@ampere.com"))
        .andExpect(status().isUnsupportedMediaType())
        .andExpect(jsonPath("$.detail").value("Envie o corpo da requisição em JSON."));
  }

  @Test
  void keepsTheProfileBehindAuthentication() throws Exception {
    mockMvc.perform(get("/users/me")).andExpect(status().isUnauthorized());
  }

  private String token(String email) throws Exception {
    String body =
        mockMvc.perform(register(email, PASSWORD)).andReturn().getResponse().getContentAsString();
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

  private String login(String email) throws Exception {
    String body =
        mockMvc
            .perform(
                post("/auth/login")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("{\"email\":\"" + email + "\",\"password\":\"" + PASSWORD + "\"}"))
            .andReturn()
            .getResponse()
            .getContentAsString();
    return objectMapper.readTree(body).get("data").get("token").asString();
  }

  private static MockHttpServletRequestBuilder profileUpdate(String token, String json) {
    return put("/users/me")
        .header("Authorization", "Bearer " + token)
        .contentType(MediaType.APPLICATION_JSON)
        .content(json);
  }

  private static MockHttpServletRequestBuilder passwordChange(
      String token, String current, String next) {
    return put("/users/me/password")
        .header("Authorization", "Bearer " + token)
        .contentType(MediaType.APPLICATION_JSON)
        .content("{\"currentPassword\":\"" + current + "\",\"newPassword\":\"" + next + "\"}");
  }
}
