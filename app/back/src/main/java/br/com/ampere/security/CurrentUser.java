package br.com.ampere.security;

import br.com.ampere.domain.UserRole;
import org.springframework.security.authentication.AuthenticationCredentialsNotFoundException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Component;

/** Resolves the application user from the JWT already validated by Spring Security. */
@Component
public class CurrentUser {

  public AuthenticatedUser get() {
    Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
    if (authentication == null || !(authentication.getPrincipal() instanceof Jwt jwt)) {
      throw new AuthenticationCredentialsNotFoundException("Usuário não autenticado.");
    }

    try {
      return new AuthenticatedUser(
          Long.valueOf(jwt.getSubject()),
          jwt.getClaimAsString("email"),
          UserRole.of(jwt.getClaimAsString("role")));
    } catch (RuntimeException invalidToken) {
      throw new AuthenticationCredentialsNotFoundException(
          "Token sem identificação de usuário válida.", invalidToken);
    }
  }
}
