package br.com.ampere.domain;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum UserRole {
  USER("user"),
  ADMIN("admin");

  private final String value;

  UserRole(String value) {
    this.value = value;
  }

  @JsonValue
  public String getValue() {
    return value;
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
