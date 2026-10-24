package br.com.ampere.service;

import br.com.ampere.domain.DocumentType;
import br.com.ampere.domain.ProjectDocument;
import java.util.Arrays;
import java.util.List;

/** What blocks a submission: no calculation, a missing document or an open blocking finding. */
public record SubmissionChecklist(
    boolean calculated,
    List<ProjectDocument> documents,
    long unansweredBlocking,
    boolean requiresChangeSummary) {

  public SubmissionChecklist {
    documents = List.copyOf(documents);
  }

  public boolean hasDocument(DocumentType type) {
    return documents.stream().anyMatch(document -> document.getType() == type);
  }

  public List<DocumentType> missingDocuments() {
    return Arrays.stream(DocumentType.values()).filter(type -> !hasDocument(type)).toList();
  }

  public boolean canSubmit() {
    return calculated && missingDocuments().isEmpty() && unansweredBlocking == 0;
  }
}
