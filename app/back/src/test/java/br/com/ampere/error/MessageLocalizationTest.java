package br.com.ampere.error;

import static org.hamcrest.Matchers.containsString;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import br.com.ampere.domain.ConnectionType;
import br.com.ampere.domain.EntranceStandard;
import br.com.ampere.domain.Project;
import br.com.ampere.domain.ResidentialMultifamily;
import br.com.ampere.domain.Standard;
import br.com.ampere.domain.SupplyVoltage;
import br.com.ampere.service.ProjectService;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

/** Exercita o caminho HTTP, nao o arquivo de mensagens. */
@SpringBootTest
class MessageLocalizationTest {

  @Autowired private WebApplicationContext context;

  @MockitoBean private ProjectService projectService;

  @Test
  void answersNotFoundForAnUnknownPath() throws Exception {
    MockMvc mockMvc = MockMvcBuilders.webAppContextSetup(context).build();

    mockMvc
        .perform(get("/"))
        .andExpect(status().isNotFound())
        .andExpect(jsonPath("$.detail").value("Recurso não encontrado."));
  }

  @Test
  void localizesTypeMismatchOnTheResponse() throws Exception {
    MockMvc mockMvc = MockMvcBuilders.webAppContextSetup(context).build();

    mockMvc
        .perform(get("/projects").param("page", "abc"))
        .andExpect(status().isBadRequest())
        .andExpect(jsonPath("$.errors[0].field").value("page"))
        .andExpect(jsonPath("$.errors[0].defaultMessage").value("Informe um número inteiro."));
  }

  @Test
  void localizesAnInvalidEnumInTheRequestBody() throws Exception {
    MockMvc mockMvc = MockMvcBuilders.webAppContextSetup(context).build();

    mockMvc
        .perform(
            post("/projects")
                .contentType(MediaType.APPLICATION_JSON)
                .content(body("residencial coletivo")))
        .andExpect(status().isBadRequest())
        .andExpect(jsonPath("$.detail", containsString("buildingType")))
        .andExpect(jsonPath("$.detail", containsString("RESIDENTIAL_MULTIFAMILY")));
  }

  @Test
  void acceptsEnumValuesInAnyCaseInTheRequestBody() throws Exception {
    when(projectService.create(any())).thenReturn(draft());
    MockMvc mockMvc = MockMvcBuilders.webAppContextSetup(context).build();

    mockMvc
        .perform(
            post("/projects")
                .contentType(MediaType.APPLICATION_JSON)
                .content(body("residential_multifamily")))
        .andExpect(status().isCreated());
  }

  private static String body(String buildingType) {
    return """
        {
          "name": "Residencial Monte Verde",
          "address": "Rodovia BR-101, km 8",
          "municipality": "Cabo de Santo Agostinho",
          "buildingType": "%s",
          "floors": 12,
          "voltage": "V380_220",
          "connectionType": "THREE_PHASE",
          "entranceStandard": "COLLECTIVE"
        }
        """
        .formatted(buildingType);
  }

  private static Project draft() {
    return Project.draft(
        "Residencial Monte Verde",
        "Rodovia BR-101, km 8",
        "Cabo de Santo Agostinho",
        "2026-1007",
        new ResidentialMultifamily(
            12, SupplyVoltage.V380_220, ConnectionType.THREE_PHASE, EntranceStandard.COLLECTIVE),
        List.of(new Standard("DIS-NOR-053", "REV 06")));
  }
}
