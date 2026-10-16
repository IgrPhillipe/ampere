package br.com.ampere.dto;

import br.com.ampere.domain.User;
import br.com.ampere.domain.UserRole;

/** The signed-in person with the professional data of "Meu Perfil". */
public record ProfileResponse(
    String id,
    String name,
    String email,
    UserRole role,
    String crea,
    String creaState,
    String company,
    String phone) {

  public static ProfileResponse from(User user) {
    return new ProfileResponse(
        String.valueOf(user.getId()),
        user.getName(),
        user.getEmail(),
        user.getRole(),
        user.getCrea(),
        user.getCreaState(),
        user.getCompany(),
        user.getPhone());
  }
}
