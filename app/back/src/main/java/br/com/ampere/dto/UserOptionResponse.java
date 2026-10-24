package br.com.ampere.dto;

import br.com.ampere.domain.User;

public record UserOptionResponse(String id, String name) {

  public static UserOptionResponse from(User user) {
    return new UserOptionResponse(String.valueOf(user.getId()), user.getName());
  }
}
