package br.com.ampere.dto;

import br.com.ampere.domain.User;

public record ReviewerOptionResponse(String id, String name) {

  public static ReviewerOptionResponse from(User user) {
    return new ReviewerOptionResponse(String.valueOf(user.getId()), user.getName());
  }
}
