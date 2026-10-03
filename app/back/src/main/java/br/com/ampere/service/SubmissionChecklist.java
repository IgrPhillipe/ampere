package br.com.ampere.service;

import br.com.ampere.domain.DocumentType;
import br.com.ampere.domain.ProjectDocument;
import java.util.Arrays;
import java.util.List;

/** What a project still needs before it can be submitted: a calculation and every document. */
public record SubmissionChecklist(boolean calculated, List<ProjectDocument> documents) {

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
    return calculated && missingDocuments().isEmpty();
  }
}
