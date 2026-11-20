package br.com.ampere.dto;

import br.com.ampere.domain.User;
import br.com.ampere.domain.UserRole;

/** An analyst or admin; {@code active} is false for one who can no longer receive projects. */
public record ReviewerOptionResponse(String id, String name, UserRole role, boolean active) {

  public static ReviewerOptionResponse from(User user) {
    return new ReviewerOptionResponse(
        String.valueOf(user.getId()), user.getName(), user.getRole(), user.isActiveReviewer());
  }
}
