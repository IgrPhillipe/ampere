package br.com.ampere.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.function.LongSupplier;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.web.filter.OncePerRequestFilter;

/** Runs before the multipart parsing, so a refused request costs no memory. */
final class VerificationRateLimitFilter extends OncePerRequestFilter {

  private static final long WINDOW_MILLIS = Duration.ofMinutes(1).toMillis();

  private record Window(long startedAt, int requests) {}

  private final Map<String, Window> windows = new ConcurrentHashMap<>();
  private final String path;
  private final int requestsPerMinute;
  private final ProblemDetailAuthenticationHandler handler;
  private final LongSupplier clock;

  VerificationRateLimitFilter(
      String path,
      int requestsPerMinute,
      ProblemDetailAuthenticationHandler handler,
      LongSupplier clock) {
    this.path = path;
    this.requestsPerMinute = requestsPerMinute;
    this.handler = handler;
    this.clock = clock;
  }

  @Override
  protected boolean shouldNotFilter(HttpServletRequest request) {
    String requested = request.getRequestURI().substring(request.getContextPath().length());

    return !HttpMethod.POST.matches(request.getMethod()) || !path.equals(requested);
  }

  @Override
  protected void doFilterInternal(
      HttpServletRequest request, HttpServletResponse response, FilterChain chain)
      throws ServletException, IOException {
    long now = clock.getAsLong();
    windows.values().removeIf(window -> now - window.startedAt() >= WINDOW_MILLIS);
    Window window =
        windows.merge(
            clientOf(request),
            new Window(now, 1),
            (current, first) -> new Window(current.startedAt(), current.requests() + 1));
    if (window.requests() <= requestsPerMinute) {
      chain.doFilter(request, response);
      return;
    }

    long wait = (window.startedAt() + WINDOW_MILLIS - now) / 1000 + 1;
    response.setHeader(HttpHeaders.RETRY_AFTER, String.valueOf(wait));
    handler.refuseTooManyRequests(request, response);
  }

  // The proxy appends the address it saw, so the last entry is the one a client cannot forge.
  private static String clientOf(HttpServletRequest request) {
    String forwarded = request.getHeader("X-Forwarded-For");
    if (forwarded == null || forwarded.isBlank()) {
      return request.getRemoteAddr();
    }

    return forwarded.substring(forwarded.lastIndexOf(',') + 1).trim();
  }
}
