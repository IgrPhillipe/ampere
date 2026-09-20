package br.com.ampere.error;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import br.com.ampere.service.ProjectService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

/**
 * Exercita o caminho HTTP, nao o arquivo de mensagens.
 *
 * <p>O context-path /api nao se aplica ao MockMvc. Verificar que o messages.properties contem a
 * chave nao prova nada: o handler pode nunca consultar o {@code MessageSource} — foi exatamente o
 * que aconteceu antes.
 */
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
}
