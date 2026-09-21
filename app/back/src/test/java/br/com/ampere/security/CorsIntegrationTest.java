package br.com.ampere.security;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.options;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;

/** Front e API em dominios diferentes — Vercel chamando Render — dependem disto. */
@SpringBootTest
@AutoConfigureMockMvc
@TestPropertySource(properties = "ampere.cors.allowed-origins=https://exemplo.vercel.app")
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
  void refusesThePreflightOfAnOriginThatIsNotListed() throws Exception {
    mockMvc
        .perform(
            options("/projects")
                .header("Origin", "https://outro-site.example")
                .header("Access-Control-Request-Method", "GET"))
        .andExpect(status().isForbidden());
  }
}
