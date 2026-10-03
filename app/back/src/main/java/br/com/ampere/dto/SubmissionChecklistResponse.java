package br.com.ampere.dto;

import br.com.ampere.domain.DocumentType;
import br.com.ampere.service.SubmissionChecklist;
import java.util.ArrayList;
import java.util.List;

public record SubmissionChecklistResponse(
    List<ChecklistItem> items, List<DocumentResponse> documents, boolean canSubmit) {

  public static final String CALCULATION_KEY = "CALCULATION";

  /** {@code key} is {@value #CALCULATION_KEY} or the name of a {@link DocumentType}. */
  public record ChecklistItem(String key, String label, boolean completed) {}

  public static SubmissionChecklistResponse from(SubmissionChecklist checklist) {
    List<ChecklistItem> items = new ArrayList<>();
    items.add(
        new ChecklistItem(CALCULATION_KEY, "Cálculo de demanda realizado", checklist.calculated()));
    for (DocumentType type : DocumentType.values()) {
      items.add(new ChecklistItem(type.name(), type.label(), checklist.hasDocument(type)));
    }

    return new SubmissionChecklistResponse(
        List.copyOf(items),
        checklist.documents().stream().map(DocumentResponse::from).toList(),
        checklist.canSubmit());
  }
}
