package br.com.ampere.dto;

import br.com.ampere.domain.User;
import br.com.ampere.domain.UserRole;
import java.time.OffsetDateTime;

/** A row of the administrator's "Usuários" screen. {@code lastLoginAt} is null before any. */
public record ManagedUserResponse(
    String id,
    String name,
    String email,
    UserRole role,
    boolean active,
    boolean mustChangePassword,
    OffsetDateTime lastLoginAt,
    OffsetDateTime createdAt) {

  public static ManagedUserResponse from(User user) {
    return new ManagedUserResponse(
        String.valueOf(user.getId()),
        user.getName(),
        user.getEmail(),
        user.getRole(),
        user.isActive(),
        user.isMustChangePassword(),
        user.getLastLoginAt(),
        user.getCreatedAt());
  }
}
