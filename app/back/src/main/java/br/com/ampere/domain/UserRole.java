package br.com.ampere.domain;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum UserRole {
  USER("user"),
  REVIEWER("reviewer"),
  ADMIN("admin");

  private final String value;

  UserRole(String value) {
    this.value = value;
  }

  @JsonValue
  public String getValue() {
    return value;
  }

  /** The review queue, the findings and the decision belong to the analyst and the admin. */
  public boolean canReview() {
    return this == REVIEWER || this == ADMIN;
  }

  @JsonCreator
  public static UserRole of(String value) {
    for (UserRole role : values()) {
      if (role.value.equalsIgnoreCase(value) || role.name().equalsIgnoreCase(value)) {
        return role;
      }
    }

    throw new IllegalArgumentException("Papel de usuário inválido: " + value);
  }
}
