package br.com.ampere.domain;

import java.util.Collections;
import java.util.EnumSet;
import java.util.Set;

/** Current stage of a project in the submission and review workflow. */
public enum ProjectStatus {
  DRAFT("Rascunho"),
  AWAITING_SUBMISSION("Aguardando Envio"),
  UNDER_REVIEW("Em Análise"),
  REJECTED("Reprovado"),
  APPROVED("Aprovado"),
  // DIS-NOR-053, item 6.27.6: an approval is valid for 36 months.
  EXPIRED("Expirado");

  private final String label;

  ProjectStatus(String label) {
    this.label = label;
  }

  public String label() {
    return label;
  }

  /** Approved at some point: an expired approval keeps everything an approval froze. */
  public boolean wasApproved() {
    return this == APPROVED || this == EXPIRED;
  }

  public static Set<ProjectStatus> approvals() {
    return Collections.unmodifiableSet(EnumSet.of(APPROVED, EXPIRED));
  }
}
