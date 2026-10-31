package br.com.ampere.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import org.springframework.http.HttpMethod;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.servlet.util.matcher.PathPatternRequestMatcher;
import org.springframework.security.web.util.matcher.OrRequestMatcher;
import org.springframework.security.web.util.matcher.RequestMatcher;
import org.springframework.web.filter.OncePerRequestFilter;

/** A temporary password opens only its own change and the reads of the signed-in account. */
class PendingPasswordChangeFilter extends OncePerRequestFilter {

  private static final PathPatternRequestMatcher.Builder PATHS =
      PathPatternRequestMatcher.withDefaults();

  private static final RequestMatcher OPEN_WHILE_PENDING =
      new OrRequestMatcher(
          PATHS.matcher(HttpMethod.PUT, "/users/me/password"),
          PATHS.matcher(HttpMethod.GET, "/users/me"),
          PATHS.matcher(HttpMethod.GET, "/auth/me"));

  private final ProblemDetailAuthenticationHandler handler;

  // Not a bean: Spring Boot would also register it as a servlet filter, outside the chain.
  PendingPasswordChangeFilter(ProblemDetailAuthenticationHandler handler) {
    this.handler = handler;
  }

  @Override
  protected void doFilterInternal(
      HttpServletRequest request, HttpServletResponse response, FilterChain chain)
      throws ServletException, IOException {
    if (isPending(SecurityContextHolder.getContext().getAuthentication())
        && !OPEN_WHILE_PENDING.matches(request)) {
      handler.requirePasswordChange(request, response);
      return;
    }

    chain.doFilter(request, response);
  }

  private static boolean isPending(Authentication authentication) {
    return authentication != null
        && authentication.getAuthorities().stream()
            .anyMatch(
                authority ->
                    ActiveAccountConverter.PASSWORD_CHANGE_PENDING.equals(
                        authority.getAuthority()));
  }
}
