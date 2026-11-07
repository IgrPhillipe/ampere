package br.com.ampere.security;

import static org.assertj.core.api.Assertions.assertThat;

import jakarta.servlet.ServletException;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.concurrent.atomic.AtomicLong;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockFilterChain;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import tools.jackson.databind.json.JsonMapper;

class VerificationRateLimitFilterTest {

  private static final String PATH = "/memorial-verifications";
  private static final int LIMIT = 3;

  private final AtomicLong now = new AtomicLong(1_000_000);
  private final VerificationRateLimitFilter filter =
      new VerificationRateLimitFilter(
          PATH,
          LIMIT,
          new ProblemDetailAuthenticationHandler(JsonMapper.builder().build()),
          now::get);

  @Test
  void refusesTheRequestsAboveTheLimitWithAMessageInPortuguese() throws Exception {
    send("POST", PATH, "10.0.0.1", LIMIT);

    MockHttpServletResponse refused = post("10.0.0.1");

    assertThat(refused.getStatus()).isEqualTo(429);
    assertThat(refused.getContentType()).startsWith(MediaType.APPLICATION_PROBLEM_JSON_VALUE);
    assertThat(refused.getContentAsString(StandardCharsets.UTF_8))
        .contains(ProblemDetailAuthenticationHandler.TOO_MANY_REQUESTS_MESSAGE);
    assertThat(refused.getHeader(HttpHeaders.RETRY_AFTER)).isEqualTo("61");
  }

  @Test
  void countsEachClientApart() throws Exception {
    send("POST", PATH, "10.0.0.1", LIMIT + 1);

    assertThat(post("10.0.0.2").getStatus()).isEqualTo(200);
  }

  @Test
  void opensAgainWhenTheMinutePasses() throws Exception {
    send("POST", PATH, "10.0.0.1", LIMIT + 1);

    now.addAndGet(60_000);

    assertThat(post("10.0.0.1").getStatus()).isEqualTo(200);
  }

  @Test
  void readsTheClientFromTheEntryTheProxyAppended() throws Exception {
    send("POST", PATH, "10.0.0.1", LIMIT);
    MockHttpServletRequest forged = request("POST", PATH, "10.0.0.9");
    forged.addHeader("X-Forwarded-For", "1.2.3.4, 10.0.0.1");
    MockHttpServletResponse response = new MockHttpServletResponse();

    filter.doFilter(forged, response, new MockFilterChain());

    assertThat(response.getStatus()).isEqualTo(429);
  }

  @Test
  void leavesTheOtherRoutesAlone() throws Exception {
    send("GET", PATH + "/0000-0000-0000-0000", "10.0.0.1", LIMIT + 5);
    send("GET", PATH, "10.0.0.1", LIMIT + 5);

    assertThat(post("10.0.0.1").getStatus()).isEqualTo(200);
  }

  private void send(String method, String path, String address, int times)
      throws ServletException, IOException {
    for (int sent = 0; sent < times; sent++) {
      filter.doFilter(
          request(method, path, address), new MockHttpServletResponse(), new MockFilterChain());
    }
  }

  private MockHttpServletResponse post(String address) throws ServletException, IOException {
    MockHttpServletResponse response = new MockHttpServletResponse();
    filter.doFilter(request("POST", PATH, address), response, new MockFilterChain());

    return response;
  }

  private static MockHttpServletRequest request(String method, String path, String address) {
    MockHttpServletRequest request = new MockHttpServletRequest(method, path);
    request.setRemoteAddr(address);

    return request;
  }
}
