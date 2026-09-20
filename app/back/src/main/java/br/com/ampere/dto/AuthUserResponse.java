package br.com.ampere.dto;

import br.com.ampere.domain.User;
import br.com.ampere.domain.UserRole;

/**
 * The signed-in person, as the front's {@code authUserSchema} declares them.
 *
 * <p>Never carries the password hash: this record is what the field list guards.
 */
public record AuthUserResponse(String id, String name, String email, UserRole role) {

  public static AuthUserResponse from(User user) {
    return new AuthUserResponse(
        String.valueOf(user.getId()), user.getName(), user.getEmail(), user.getRole());
  }
}
