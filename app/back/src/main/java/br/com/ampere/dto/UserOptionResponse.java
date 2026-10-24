package br.com.ampere.dto;

import br.com.ampere.domain.User;

/** A user offered in a filter: the analyst in the queue, the designer in the projects. */
public record UserOptionResponse(String id, String name) {

  public static UserOptionResponse from(User user) {
    return new UserOptionResponse(String.valueOf(user.getId()), user.getName());
  }
}
