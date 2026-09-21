package br.com.ampere.domain;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

/**
 * Papel do usuario.
 *
 * <p>Placeholder deliberado, igual ao do front: os papeis reais do AMPERE (projetista externo e
 * analista da Neoenergia) dependem da Q1c de {@code docs/produto/questoes-em-aberto.md}. Por isso
 * nenhuma rota e gateada por papel ainda — gatear por um placeholder seria inventar regra de
 * negocio.
 *
 * <p>Sai em minusculas no JSON porque e o contrato que o front ja declara e valida com Zod ({@code
 * userRoleSchema}). Os outros enums da API saem em maiusculas; quando a Q1c fechar, a pendencia 13
 * resolve os dois lados de uma vez.
 */
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
