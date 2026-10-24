package br.com.ampere.security;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.options;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;

/** Front and API on different domains — Vercel calling Render — depend on this. */
@SpringBootTest
@AutoConfigureMockMvc
@TestPropertySource(
    properties = {
      "ampere.cors.allowed-origins=https://exemplo.vercel.app",
      "ampere.cors.preview-origins=https://ampere-*-igrph.vercel.app"
    })
class CorsIntegrationTest {

  private static final String ORIGIN = "https://exemplo.vercel.app";

  @Autowired private MockMvc mockMvc;

  @Test
  void answersThePreflightOfAnAllowedOrigin() throws Exception {
    mockMvc
        .perform(
            options("/projects")
                .header("Origin", ORIGIN)
                .header("Access-Control-Request-Method", "GET")
                .header("Access-Control-Request-Headers", "Authorization"))
        .andExpect(status().isOk())
        .andExpect(header().string("Access-Control-Allow-Origin", ORIGIN));
  }

  @Test
  void exposesTheFileNameOfADownload() throws Exception {
    mockMvc
        .perform(get("/projects").header("Origin", ORIGIN))
        .andExpect(header().string("Access-Control-Expose-Headers", "Content-Disposition"));
  }

  @ParameterizedTest
  @ValueSource(
      strings = {
        "https://ampere-d33nkxy0q-igrph.vercel.app",
        "https://ampere-git-feat-memorial-pdf-identidade-igrph.vercel.app"
      })
  void answersThePreflightOfADeployPreview(String preview) throws Exception {
    mockMvc
        .perform(
            options("/projects")
                .header("Origin", preview)
                .header("Access-Control-Request-Method", "GET")
                .header("Access-Control-Request-Headers", "Authorization"))
        .andExpect(status().isOk())
        .andExpect(header().string("Access-Control-Allow-Origin", preview));
  }

  @Test
  void refusesThePreflightOfAPreviewFromAnotherVercelAccount() throws Exception {
    mockMvc
        .perform(
            options("/projects")
                .header("Origin", "https://ampere-d33nkxy0q-outra-conta.vercel.app")
                .header("Access-Control-Request-Method", "GET"))
        .andExpect(status().isForbidden());
  }

  @Test
  void refusesThePreflightOfAnOriginThatIsNotListed() throws Exception {
    mockMvc
        .perform(
            options("/projects")
                .header("Origin", "https://outro-site.example")
                .header("Access-Control-Request-Method", "GET"))
        .andExpect(status().isForbidden());
  }
}
