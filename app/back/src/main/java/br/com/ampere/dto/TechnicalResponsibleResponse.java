package br.com.ampere.dto;

import br.com.ampere.domain.User;

/** Who answers technically for a project: the owner's name and CREA, as the stamp prints them. */
public record TechnicalResponsibleResponse(String name, String crea) {

  /** Null when the project has no owner or the owner has no CREA on file. */
  public static TechnicalResponsibleResponse of(User owner) {
    if (owner == null || owner.getCrea() == null) {
      return null;
    }

    return new TechnicalResponsibleResponse(owner.getName(), owner.creaWithState());
  }
}
