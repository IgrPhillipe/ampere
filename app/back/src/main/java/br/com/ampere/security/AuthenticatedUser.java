package br.com.ampere.security;

import br.com.ampere.domain.UserRole;

/** Identity and role carried by the authenticated JWT. */
public record AuthenticatedUser(Long id, String email, UserRole role) {

  public boolean isAdmin() {
    return role == UserRole.ADMIN;
  }
}
