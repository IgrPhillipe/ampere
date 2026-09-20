package br.com.ampere.dto;

import br.com.ampere.domain.Standard;

/** A standard revision applied to a project. */
public record StandardResponse(String name, String revision) {

  public static StandardResponse from(Standard standard) {
    return new StandardResponse(standard.getName(), standard.getRevision());
  }

  public String label() {
    return name + " " + revision;
  }
}
