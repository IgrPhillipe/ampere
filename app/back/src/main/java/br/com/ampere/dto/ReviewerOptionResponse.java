package br.com.ampere.dto;

import br.com.ampere.domain.User;
import br.com.ampere.domain.UserRole;

/** An analyst or admin offered to hold a review. */
public record ReviewerOptionResponse(String id, String name, UserRole role) {

  public static ReviewerOptionResponse from(User user) {
    return new ReviewerOptionResponse(String.valueOf(user.getId()), user.getName(), user.getRole());
  }
}
