package br.com.ampere.dto;

import java.util.List;

/**
 * Checklist de submissao retornado por GET /projects/{id}/submission.
 *
 * <p>Cada item representa um requisito que precisa ser atendido antes do envio. O campo canSubmit
 * so e true quando TODOS os itens estao completos.
 *
 * <p>O front usa isso para mostrar ao usuario o que falta antes de habilitar o botao de enviar.
 */
public record SubmissionChecklistResponse(List<ChecklistItem> items, boolean canSubmit) {

  /**
   * Um item do checklist.
   *
   * @param key identificador do item (ex: "calculation", "art")
   * @param label texto legivel para exibir no front
   * @param completed true se o requisito ja foi atendido
   */
  public record ChecklistItem(String key, String label, boolean completed) {}
}
