package br.com.ampere.service;

import br.com.ampere.domain.UserRole;
import br.com.ampere.error.BusinessException;
import org.springframework.http.HttpStatus;

/** The token's user, already converted. The service does not know about the JWT. */
public record AuthenticatedUser(Long id, UserRole role) {

  public static AuthenticatedUser of(String subject, String role) {
    try {
      return new AuthenticatedUser(Long.valueOf(subject), UserRole.of(role));
    } catch (IllegalArgumentException exception) {
      throw new BusinessException("Sessão inválida. Entre novamente.", HttpStatus.UNAUTHORIZED);
    }
  }

  public boolean isAdmin() {
    return role == UserRole.ADMIN;
  }

  public boolean isReviewer() {
    return role == UserRole.REVIEWER;
  }

  public boolean canReview() {
    return role.canReview();
  }
}
